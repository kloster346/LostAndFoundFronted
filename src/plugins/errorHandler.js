import { handleError, ErrorLogger, ERROR_TYPES, ERROR_LEVELS, AppError } from '@/utils/error'
import { ElMessage, ElNotification } from 'element-plus'
import { h } from 'vue'

/**
 * 全局错误处理插件
 */
export default {
  install(app, options = {}) {
    const {
      // 是否启用全局错误处理
      enabled = true,
      // 是否捕获 Promise 拒绝
      capturePromiseRejection = true,
      // 是否捕获资源加载错误
      captureResourceError = true,
      // 是否在控制台显示错误
      showConsoleError = process.env.NODE_ENV === 'development',
      // 错误过滤函数
      errorFilter = null,
      // 错误回调函数
      onError = null,
      // 是否自动上报错误
      autoReport = process.env.NODE_ENV === 'production'
    } = options

    if (!enabled) return

    // 全局错误处理器
    const globalErrorHandler = (error, instance, info) => {
      // 过滤错误
      if (errorFilter && !errorFilter(error, instance, info)) {
        return
      }

      // 创建应用错误对象
      let appError
      if (error instanceof AppError) {
        appError = error
      } else {
        appError = new AppError(
          error.message || '应用运行时错误',
          ERROR_TYPES.COMPONENT_ERROR,
          ERROR_LEVELS.HIGH,
          null,
          {
            componentInfo: info,
            instance: instance?.$options?.name || 'Unknown'
          }
        )
      }

      // 记录错误日志
      ErrorLogger.log(appError, {
        type: 'vue-error',
        info,
        instance: instance?.$options?.name,
        url: window.location.href
      })

      // 控制台输出
      if (showConsoleError) {
        console.group('🚨 Vue Global Error Handler')
        console.error('Error:', error)
        console.error('Instance:', instance)
        console.error('Info:', info)
        console.groupEnd()
      }

      // 调用错误回调
      if (onError) {
        try {
          onError(appError, instance, info)
        } catch (callbackError) {
          console.error('Error in error callback:', callbackError)
        }
      }

      // 显示用户友好的错误提示
      if (appError.level === ERROR_LEVELS.CRITICAL) {
        ElNotification({
          title: '严重错误',
          message: '应用遇到严重错误，请刷新页面重试',
          type: 'error',
          duration: 0,
          showClose: true
        })
      } else {
        ElMessage({
          message: appError.message || '应用运行时出现错误',
          type: 'error',
          duration: 3000
        })
      }

      // 自动上报错误
      if (autoReport) {
        reportError(appError, { type: 'vue-error', info, instance })
      }
    }

    // 全局警告处理器
    const globalWarnHandler = (msg, instance, trace) => {
      if (showConsoleError) {
        console.group('⚠️ Vue Global Warning Handler')
        console.warn('Message:', msg)
        console.warn('Instance:', instance)
        console.warn('Trace:', trace)
        console.groupEnd()
      }

      // 记录警告日志
      ErrorLogger.log(
        new AppError(
          msg,
          ERROR_TYPES.COMPONENT_ERROR,
          ERROR_LEVELS.LOW,
          null,
          { trace, instance: instance?.$options?.name }
        ),
        {
          type: 'vue-warning',
          trace,
          instance: instance?.$options?.name
        }
      )
    }

    // 注册 Vue 错误处理器
    app.config.errorHandler = globalErrorHandler
    app.config.warnHandler = globalWarnHandler

    // 捕获未处理的 Promise 拒绝
    if (capturePromiseRejection) {
      window.addEventListener('unhandledrejection', (event) => {
        const error = event.reason

        // 创建应用错误对象
        const appError = new AppError(
          error?.message || '未处理的 Promise 拒绝',
          ERROR_TYPES.SYSTEM_ERROR,
          ERROR_LEVELS.HIGH,
          null,
          { reason: error, promise: event.promise }
        )

        // 记录错误日志
        ErrorLogger.log(appError, {
          type: 'unhandled-promise-rejection',
          url: window.location.href
        })

        // 控制台输出
        if (showConsoleError) {
          console.group('🚨 Unhandled Promise Rejection')
          console.error('Reason:', error)
          console.error('Promise:', event.promise)
          console.groupEnd()
        }

        // 显示错误提示
        ElMessage({
          message: appError.message,
          type: 'error',
          duration: 3000
        })

        // 自动上报错误
        if (autoReport) {
          reportError(appError, { type: 'unhandled-promise-rejection' })
        }

        // 阻止默认的控制台错误输出
        event.preventDefault()
      })
    }

    // 捕获资源加载错误
    if (captureResourceError) {
      window.addEventListener('error', (event) => {
        // 只处理资源加载错误
        if (event.target !== window) {
          const target = event.target
          const tagName = target.tagName?.toLowerCase()
          const src = target.src || target.href

          const appError = new AppError(
            `资源加载失败: ${src}`,
            ERROR_TYPES.SYSTEM_ERROR,
            ERROR_LEVELS.MEDIUM,
            null,
            {
              tagName,
              src,
              type: event.type
            }
          )

          // 记录错误日志
          ErrorLogger.log(appError, {
            type: 'resource-error',
            tagName,
            src,
            url: window.location.href
          })

          // 控制台输出
          if (showConsoleError) {
            console.group('🚨 Resource Load Error')
            console.error('Tag:', tagName)
            console.error('Source:', src)
            console.error('Event:', event)
            console.groupEnd()
          }

          // 自动上报错误
          if (autoReport) {
            reportError(appError, { type: 'resource-error', tagName, src })
          }
        }
      }, true)
    }

    // 监听认证失效事件
    window.addEventListener('auth:logout', () => {
      ElNotification({
        title: '登录已过期',
        message: '您的登录已过期，请重新登录',
        type: 'warning',
        duration: 5000
      })

      // 可以在这里添加跳转到登录页面的逻辑
      // router.push('/login')
    })

    // 提供全局方法
    app.config.globalProperties.$handleError = handleError
    app.config.globalProperties.$errorLogger = ErrorLogger

    // 提供组合式 API
    app.provide('errorHandler', {
      handleError,
      ErrorLogger,
      reportError
    })
  }
}

/**
 * 错误上报函数
 * @param {AppError} error - 错误对象
 * @param {Object} context - 上下文信息
 */
async function reportError(error, context = {}) {
  try {
    // 这里可以集成第三方错误监控服务
    // 比如 Sentry, LogRocket, Bugsnag 等

    const errorReport = {
      message: error.message,
      type: error.type,
      level: error.level,
      code: error.code,
      stack: error.stack,
      timestamp: error.timestamp,
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId: localStorage.getItem('userId'),
        ...context
      }
    }

    // 发送到服务器
    await fetch('/api/errors/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(errorReport)
    })

    console.log('Error reported successfully')
  } catch (reportError) {
    console.error('Failed to report error:', reportError)
  }
}

/**
 * 错误边界高阶组件工厂
 * @param {Object} options - 选项
 * @returns {Function} 高阶组件
 */
export function withErrorBoundary(options = {}) {
  return (WrappedComponent) => {
    return {
      name: `ErrorBoundary(${WrappedComponent.name || 'Component'})`,
      components: {
        WrappedComponent,
        ErrorBoundary: () => import('@/components/common/ErrorBoundary.vue')
      },
      render() {
        return h(this.$options.components.ErrorBoundary, options, {
          default: () => h(WrappedComponent, this.$attrs, this.$slots)
        })
      }
    }
  }
}

/**
 * 错误处理装饰器
 * @param {Object} options - 选项
 * @returns {Function} 装饰器函数
 */
export function errorHandler(options = {}) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function(...args) {
      try {
        return await originalMethod.apply(this, args)
      } catch (error) {
        const appError = handleError(error, {
          component: this.$options?.name,
          method: propertyKey,
          args
        }, options)

        if (options.rethrow !== false) {
          throw appError
        }

        return null
      }
    }

    return descriptor
  }
}
