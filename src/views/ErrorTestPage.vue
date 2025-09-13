<template>
  <div class="error-test-page">
    <div class="page-header">
      <h1>错误处理测试页面</h1>
      <p>测试各种错误场景，验证错误处理系统是否正常工作</p>
    </div>

    <div class="test-sections">
      <!-- Vue 组件错误测试 -->
      <div class="test-section">
        <h2>Vue 组件错误测试</h2>
        <div class="test-buttons">
          <el-button @click="triggerRenderError" type="danger">
            触发渲染错误
          </el-button>
          <el-button @click="triggerMethodError" type="danger">
            触发方法错误
          </el-button>
          <el-button @click="triggerComputedError" type="danger">
            触发计算属性错误
          </el-button>
        </div>
        
        <!-- 错误边界测试 -->
        <ErrorBoundary 
          :show-details="true"
          :enable-retry="true"
          @error="onErrorBoundaryError"
          @retry="onErrorBoundaryRetry"
        >
          <ErrorProneComponent 
            v-if="showErrorComponent"
            :should-error="shouldComponentError"
          />
        </ErrorBoundary>
      </div>

      <!-- API 错误测试 -->
      <div class="test-section">
        <h2>API 错误测试</h2>
        <div class="test-buttons">
          <el-button @click="testNetworkError" type="warning">
            测试网络错误
          </el-button>
          <el-button @click="testAuthError" type="warning">
            测试认证错误 (401)
          </el-button>
          <el-button @click="testPermissionError" type="warning">
            测试权限错误 (403)
          </el-button>
          <el-button @click="testNotFoundError" type="warning">
            测试资源不存在 (404)
          </el-button>
          <el-button @click="testServerError" type="warning">
            测试服务器错误 (500)
          </el-button>
          <el-button @click="testRetryMechanism" type="info">
            测试重试机制
          </el-button>
        </div>
      </div>

      <!-- Promise 错误测试 -->
      <div class="test-section">
        <h2>Promise 错误测试</h2>
        <div class="test-buttons">
          <el-button @click="triggerUnhandledPromiseRejection" type="danger">
            触发未处理的 Promise 拒绝
          </el-button>
          <el-button @click="triggerAsyncError" type="danger">
            触发异步函数错误
          </el-button>
        </div>
      </div>

      <!-- 资源加载错误测试 -->
      <div class="test-section">
        <h2>资源加载错误测试</h2>
        <div class="test-buttons">
          <el-button @click="triggerImageLoadError" type="warning">
            触发图片加载错误
          </el-button>
          <el-button @click="triggerScriptLoadError" type="warning">
            触发脚本加载错误
          </el-button>
        </div>
        
        <!-- 动态添加的错误资源 -->
        <div v-if="showErrorImage">
          <img :src="errorImageSrc" alt="测试图片" @error="onImageError">
        </div>
      </div>

      <!-- 自定义错误测试 -->
      <div class="test-section">
        <h2>自定义错误测试</h2>
        <div class="test-buttons">
          <el-button @click="triggerCustomError" type="info">
            触发自定义错误
          </el-button>
          <el-button @click="triggerCriticalError" type="danger">
            触发严重错误
          </el-button>
        </div>
      </div>

      <!-- 错误日志查看 -->
      <div class="test-section">
        <h2>错误日志</h2>
        <div class="test-buttons">
          <el-button @click="showErrorLogs" type="success">
            查看错误日志
          </el-button>
          <el-button @click="clearErrorLogs" type="info">
            清空错误日志
          </el-button>
        </div>
        
        <div v-if="errorLogs.length > 0" class="error-logs">
          <div 
            v-for="(log, index) in errorLogs" 
            :key="index" 
            class="error-log-item"
          >
            <div class="log-header">
              <span class="log-time">{{ formatTime(log.timestamp) }}</span>
              <span :class="`log-level log-level-${log.level}`">{{ log.level }}</span>
              <span class="log-type">{{ log.type }}</span>
            </div>
            <div class="log-message">{{ log.message }}</div>
            <div v-if="log.context" class="log-context">
              <pre>{{ JSON.stringify(log.context, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, inject, h } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import ErrorBoundary from '@/components/common/ErrorBoundary.vue'
import { handleError, ErrorLogger, AppError, ERROR_TYPES, ERROR_LEVELS } from '@/utils/error'
import { get, post, getWithRetry } from '@/api'

// 测试用的错误组件
const ErrorProneComponent = {
  props: {
    shouldError: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const errorMessage = computed(() => {
      if (props.shouldError) {
        throw new Error('这是一个测试错误：组件渲染失败')
      }
      return '组件正常渲染'
    })

    return {
      errorMessage
    }
  },
  render() {
    return h('div', { class: 'error-prone-component' }, [
      h('p', this.errorMessage),
      h('p', '如果你看到这个消息，说明组件没有出错')
    ])
  }
}

export default {
  name: 'ErrorTestPage',
  components: {
    ErrorBoundary,
    ErrorProneComponent
  },
  setup() {
    const errorHandler = inject('errorHandler')
    
    const showErrorComponent = ref(true)
    const shouldComponentError = ref(false)
    const showErrorImage = ref(false)
    const errorImageSrc = ref('')
    const errorLogs = ref([])

    // Vue 组件错误测试
    const triggerRenderError = () => {
      shouldComponentError.value = true
      showErrorComponent.value = false
      setTimeout(() => {
        showErrorComponent.value = true
      }, 100)
    }

    const triggerMethodError = () => {
      throw new Error('这是一个测试错误：方法执行失败')
    }

    const triggerComputedError = () => {
      // 通过修改响应式数据触发计算属性错误
      shouldComponentError.value = true
    }

    // API 错误测试
    const testNetworkError = async () => {
      try {
        await get('/api/non-existent-endpoint')
      } catch (error) {
        console.log('网络错误已被捕获:', error)
      }
    }

    const testAuthError = async () => {
      try {
        // 模拟 401 错误
        await get('/api/protected-resource')
      } catch (error) {
        console.log('认证错误已被捕获:', error)
      }
    }

    const testPermissionError = async () => {
      try {
        // 模拟 403 错误
        await get('/api/admin-only-resource')
      } catch (error) {
        console.log('权限错误已被捕获:', error)
      }
    }

    const testNotFoundError = async () => {
      try {
        await get('/api/non-existent-resource/123')
      } catch (error) {
        console.log('404错误已被捕获:', error)
      }
    }

    const testServerError = async () => {
      try {
        await post('/api/trigger-server-error', { test: true })
      } catch (error) {
        console.log('服务器错误已被捕获:', error)
      }
    }

    const testRetryMechanism = async () => {
      try {
        // 使用带重试的请求方法
        await getWithRetry('/api/unstable-endpoint', {}, { maxRetries: 3 })
      } catch (error) {
        console.log('重试机制测试完成:', error)
      }
    }

    // Promise 错误测试
    const triggerUnhandledPromiseRejection = () => {
      // 创建一个未处理的 Promise 拒绝
      Promise.reject(new Error('这是一个未处理的 Promise 拒绝'))
    }

    const triggerAsyncError = async () => {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('这是一个异步函数错误'))
        }, 1000)
      })
    }

    // 资源加载错误测试
    const triggerImageLoadError = () => {
      errorImageSrc.value = '/non-existent-image-' + Date.now() + '.jpg'
      showErrorImage.value = true
    }

    const triggerScriptLoadError = () => {
      const script = document.createElement('script')
      script.src = '/non-existent-script.js'
      document.head.appendChild(script)
    }

    const onImageError = (event) => {
      console.log('图片加载错误:', event)
    }

    // 自定义错误测试
    const triggerCustomError = () => {
      const customError = new AppError(
        '这是一个自定义错误',
        ERROR_TYPES.BUSINESS_ERROR,
        ERROR_LEVELS.MEDIUM,
        'CUSTOM_ERROR_001',
        { testData: '测试数据' }
      )
      
      handleError(customError, {
        component: 'ErrorTestPage',
        action: 'triggerCustomError'
      })
    }

    const triggerCriticalError = () => {
      const criticalError = new AppError(
        '这是一个严重错误，需要立即处理',
        ERROR_TYPES.SYSTEM_ERROR,
        ERROR_LEVELS.CRITICAL,
        'CRITICAL_ERROR_001',
        { severity: 'high' }
      )
      
      handleError(criticalError, {
        component: 'ErrorTestPage',
        action: 'triggerCriticalError'
      })
    }

    // 错误边界事件处理
    const onErrorBoundaryError = (error) => {
      console.log('错误边界捕获到错误:', error)
      ElMessage({
        message: '错误边界已捕获组件错误',
        type: 'info'
      })
    }

    const onErrorBoundaryRetry = () => {
      console.log('错误边界重试')
      shouldComponentError.value = false
    }

    // 错误日志管理
    const showErrorLogs = () => {
      errorLogs.value = ErrorLogger.getLogs()
      if (errorLogs.value.length === 0) {
        ElMessage({
          message: '暂无错误日志',
          type: 'info'
        })
      }
    }

    const clearErrorLogs = () => {
      ErrorLogger.clear()
      errorLogs.value = []
      ElMessage({
        message: '错误日志已清空',
        type: 'success'
      })
    }

    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleString()
    }

    return {
      showErrorComponent,
      shouldComponentError,
      showErrorImage,
      errorImageSrc,
      errorLogs,
      triggerRenderError,
      triggerMethodError,
      triggerComputedError,
      testNetworkError,
      testAuthError,
      testPermissionError,
      testNotFoundError,
      testServerError,
      testRetryMechanism,
      triggerUnhandledPromiseRejection,
      triggerAsyncError,
      triggerImageLoadError,
      triggerScriptLoadError,
      onImageError,
      triggerCustomError,
      triggerCriticalError,
      onErrorBoundaryError,
      onErrorBoundaryRetry,
      showErrorLogs,
      clearErrorLogs,
      formatTime
    }
  }
}
</script>

<style scoped>
.error-test-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  color: var(--color-primary);
  margin-bottom: 10px;
}

.page-header p {
  color: var(--color-text-secondary);
  font-size: 16px;
}

.test-sections {
  display: grid;
  gap: 30px;
}

.test-section {
  background: var(--color-bg-secondary);
  border-radius: var(--border-radius-lg);
  padding: 24px;
  border: 1px solid var(--color-border);
}

.test-section h2 {
  color: var(--color-text-primary);
  margin-bottom: 16px;
  font-size: 18px;
}

.test-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
}

.error-prone-component {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  padding: 16px;
  margin-top: 16px;
}

.error-logs {
  margin-top: 20px;
  max-height: 400px;
  overflow-y: auto;
}

.error-log-item {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  padding: 12px;
  margin-bottom: 12px;
}

.log-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 12px;
}

.log-time {
  color: var(--color-text-secondary);
}

.log-level {
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
  text-transform: uppercase;
}

.log-level-low {
  background: var(--color-info-light);
  color: var(--color-info);
}

.log-level-medium {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.log-level-high {
  background: var(--color-danger-light);
  color: var(--color-danger);
}

.log-level-critical {
  background: var(--color-danger);
  color: white;
}

.log-type {
  background: var(--color-primary-light);
  color: var(--color-primary);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
}

.log-message {
  color: var(--color-text-primary);
  font-weight: 500;
  margin-bottom: 8px;
}

.log-context {
  background: var(--color-bg-secondary);
  border-radius: 4px;
  padding: 8px;
  font-size: 11px;
}

.log-context pre {
  margin: 0;
  color: var(--color-text-secondary);
  white-space: pre-wrap;
  word-break: break-all;
}

@media (max-width: 768px) {
  .error-test-page {
    padding: 16px;
  }
  
  .test-buttons {
    flex-direction: column;
  }
  
  .test-buttons .el-button {
    width: 100%;
  }
}
</style>