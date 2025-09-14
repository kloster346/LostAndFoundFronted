import { ElMessage, ElNotification } from 'element-plus'

/**
 * 错误类型枚举
 */
export const ERROR_TYPES = {
  // 网络错误
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',

  // API错误
  API_ERROR: 'API_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',

  // 业务错误
  BUSINESS_ERROR: 'BUSINESS_ERROR',

  // 系统错误
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  COMPONENT_ERROR: 'COMPONENT_ERROR',

  // 用户错误
  USER_INPUT_ERROR: 'USER_INPUT_ERROR',

  // 未知错误
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
}

/**
 * 错误级别枚举
 */
export const ERROR_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
}

/**
 * 自定义错误类
 */
export class AppError extends Error {
  constructor(
    message,
    type = ERROR_TYPES.UNKNOWN_ERROR,
    level = ERROR_LEVELS.MEDIUM,
    code = null,
    data = null
  ) {
    super(message)
    this.name = 'AppError'
    this.type = type
    this.level = level
    this.code = code
    this.data = data
    this.timestamp = new Date().toISOString()

    // 保持错误堆栈
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }
}

/**
 * 错误分类器
 * @param {Error} error - 原始错误对象
 * @returns {AppError} 分类后的错误对象
 */
export function classifyError(error) {
  if (error instanceof AppError) {
    return error
  }

  let type = ERROR_TYPES.UNKNOWN_ERROR
  let level = ERROR_LEVELS.MEDIUM
  let message = error.message || '未知错误'

  // 网络错误
  if (error.code === 'NETWORK_ERROR' || !error.response) {
    type = ERROR_TYPES.NETWORK_ERROR
    level = ERROR_LEVELS.HIGH
    message = '网络连接失败，请检查网络设置'
  }
  // 超时错误
  else if (error.code === 'ECONNABORTED' || message.includes('timeout')) {
    type = ERROR_TYPES.TIMEOUT_ERROR
    level = ERROR_LEVELS.MEDIUM
    message = '请求超时，请稍后重试'
  }
  // HTTP状态码错误
  else if (error.response) {
    const status = error.response.status

    switch (status) {
      case 400:
        type = ERROR_TYPES.VALIDATION_ERROR
        level = ERROR_LEVELS.LOW
        message = '请求参数错误'
        break
      case 401:
        type = ERROR_TYPES.PERMISSION_ERROR
        level = ERROR_LEVELS.HIGH
        message = '未授权，请重新登录'
        break
      case 403:
        type = ERROR_TYPES.PERMISSION_ERROR
        level = ERROR_LEVELS.HIGH
        message = '权限不足，拒绝访问'
        break
      case 404:
        type = ERROR_TYPES.API_ERROR
        level = ERROR_LEVELS.MEDIUM
        message = '请求的资源不存在'
        break
      case 422:
        type = ERROR_TYPES.VALIDATION_ERROR
        level = ERROR_LEVELS.LOW
        message = '数据验证失败'
        break
      case 500:
        type = ERROR_TYPES.SYSTEM_ERROR
        level = ERROR_LEVELS.CRITICAL
        message = '服务器内部错误'
        break
      case 502:
      case 503:
      case 504:
        type = ERROR_TYPES.SYSTEM_ERROR
        level = ERROR_LEVELS.HIGH
        message = '服务暂时不可用，请稍后重试'
        break
      default:
        type = ERROR_TYPES.API_ERROR
        level = ERROR_LEVELS.MEDIUM
    }
  }
  // Vue组件错误
  else if (error.name === 'ChunkLoadError' || message.includes('Loading chunk')) {
    type = ERROR_TYPES.SYSTEM_ERROR
    level = ERROR_LEVELS.MEDIUM
    message = '资源加载失败，请刷新页面重试'
  }

  return new AppError(message, type, level, error.code, error.response?.data)
}

/**
 * 错误日志记录器
 */
export class ErrorLogger {
  static logs = []
  static maxLogs = 100

  /**
   * 记录错误日志
   * @param {AppError} error - 错误对象
   * @param {Object} context - 上下文信息
   */
  static log(error, context = {}) {
    const logEntry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        type: error.type,
        level: error.level,
        code: error.code,
        stack: error.stack,
      },
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId: localStorage.getItem('userId'),
        ...context,
      },
    }

    // 添加到内存日志
    this.logs.unshift(logEntry)

    // 限制日志数量
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs)
    }

    // 控制台输出（开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 ${error.level.toUpperCase()} Error: ${error.type}`)
      console.error('Message:', error.message)
      console.error('Code:', error.code)
      console.error('Context:', context)
      console.error('Stack:', error.stack)
      console.groupEnd()
    }

    // 发送到服务器（生产环境）
    if (process.env.NODE_ENV === 'production' && error.level === ERROR_LEVELS.CRITICAL) {
      this.sendToServer(logEntry)
    }
  }

  /**
   * 发送错误日志到服务器
   * @param {Object} logEntry - 日志条目
   */
  static async sendToServer(logEntry) {
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logEntry),
      })
    } catch (err) {
      console.error('Failed to send error log to server:', err)
    }
  }

  /**
   * 获取错误日志
   * @param {string} level - 错误级别过滤
   * @returns {Array} 错误日志列表
   */
  static getLogs(level = null) {
    if (level) {
      return this.logs.filter(log => log.error.level === level)
    }
    return [...this.logs]
  }

  /**
   * 清空错误日志
   */
  static clearLogs() {
    this.logs = []
  }
}

/**
 * 用户友好的错误提示
 */
export class ErrorNotifier {
  /**
   * 显示错误提示
   * @param {AppError} error - 错误对象
   * @param {Object} options - 显示选项
   */
  static notify(error, options = {}) {
    const {
      showMessage = true,
      showNotification = false,
      duration = 3000,
      showClose = true,
    } = options

    // 根据错误级别选择提示方式
    if (error.level === ERROR_LEVELS.CRITICAL) {
      // 严重错误使用通知
      ElNotification({
        title: '系统错误',
        message: error.message,
        type: 'error',
        duration: 0, // 不自动关闭
        showClose: true,
      })
    } else if (showNotification) {
      // 使用通知
      ElNotification({
        title: this.getErrorTitle(error.type),
        message: error.message,
        type: this.getNotificationType(error.level),
        duration,
        showClose,
      })
    } else if (showMessage) {
      // 使用消息提示
      ElMessage({
        message: error.message,
        type: this.getMessageType(error.level),
        duration,
        showClose,
      })
    }
  }

  /**
   * 获取错误标题
   * @param {string} type - 错误类型
   * @returns {string} 错误标题
   */
  static getErrorTitle(type) {
    const titles = {
      [ERROR_TYPES.NETWORK_ERROR]: '网络错误',
      [ERROR_TYPES.TIMEOUT_ERROR]: '请求超时',
      [ERROR_TYPES.API_ERROR]: 'API错误',
      [ERROR_TYPES.VALIDATION_ERROR]: '验证错误',
      [ERROR_TYPES.PERMISSION_ERROR]: '权限错误',
      [ERROR_TYPES.BUSINESS_ERROR]: '业务错误',
      [ERROR_TYPES.SYSTEM_ERROR]: '系统错误',
      [ERROR_TYPES.COMPONENT_ERROR]: '组件错误',
      [ERROR_TYPES.USER_INPUT_ERROR]: '输入错误',
      [ERROR_TYPES.UNKNOWN_ERROR]: '未知错误',
    }
    return titles[type] || '错误'
  }

  /**
   * 获取通知类型
   * @param {string} level - 错误级别
   * @returns {string} 通知类型
   */
  static getNotificationType(level) {
    switch (level) {
      case ERROR_LEVELS.LOW:
        return 'warning'
      case ERROR_LEVELS.MEDIUM:
        return 'error'
      case ERROR_LEVELS.HIGH:
      case ERROR_LEVELS.CRITICAL:
        return 'error'
      default:
        return 'error'
    }
  }

  /**
   * 获取消息类型
   * @param {string} level - 错误级别
   * @returns {string} 消息类型
   */
  static getMessageType(level) {
    switch (level) {
      case ERROR_LEVELS.LOW:
        return 'warning'
      case ERROR_LEVELS.MEDIUM:
        return 'error'
      case ERROR_LEVELS.HIGH:
      case ERROR_LEVELS.CRITICAL:
        return 'error'
      default:
        return 'error'
    }
  }
}

/**
 * 统一错误处理函数
 * @param {Error} error - 原始错误
 * @param {Object} context - 上下文信息
 * @param {Object} options - 处理选项
 * @returns {AppError} 处理后的错误对象
 */
export function handleError(error, context = {}, options = {}) {
  // 分类错误
  const appError = classifyError(error)

  // 记录日志
  ErrorLogger.log(appError, context)

  // 显示用户提示
  if (options.notify !== false) {
    ErrorNotifier.notify(appError, options)
  }

  return appError
}

/**
 * 异步函数错误包装器
 * @param {Function} fn - 异步函数
 * @param {Object} context - 上下文信息
 * @param {Object} options - 处理选项
 * @returns {Function} 包装后的函数
 */
export function withErrorHandling(fn, context = {}, options = {}) {
  return async (...args) => {
    try {
      return await fn(...args)
    } catch (error) {
      const appError = handleError(error, context, options)

      // 根据选项决定是否重新抛出错误
      if (options.rethrow !== false) {
        throw appError
      }

      return null
    }
  }
}

/**
 * 重试机制
 * @param {Function} fn - 要重试的函数
 * @param {Object} options - 重试选项
 * @returns {Promise} 执行结果
 */
export async function withRetry(fn, options = {}) {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = 2,
    retryCondition = error => {
      const appError = classifyError(error)
      return (
        appError.type === ERROR_TYPES.NETWORK_ERROR || appError.type === ERROR_TYPES.TIMEOUT_ERROR
      )
    },
  } = options

  let lastError
  let currentDelay = delay

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // 最后一次尝试或不满足重试条件
      if (attempt === maxRetries || !retryCondition(error)) {
        throw error
      }

      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, currentDelay))
      currentDelay *= backoff
    }
  }

  throw lastError
}

// 导出默认处理函数
export default {
  handleError,
  withErrorHandling,
  withRetry,
  classifyError,
  ErrorLogger,
  ErrorNotifier,
  AppError,
  ERROR_TYPES,
  ERROR_LEVELS,
}
