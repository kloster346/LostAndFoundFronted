<template>
  <div class="error-boundary">
    <!-- 正常渲染子组件 -->
    <slot v-if="!hasError" />

    <!-- 错误状态显示 -->
    <div v-else class="error-boundary__content">
      <!-- 自定义错误插槽 -->
      <slot name="error" :error="error" :retry="retry" :reset="reset">
        <!-- 默认错误显示 -->
        <div class="error-boundary__default">
          <div class="error-boundary__icon">
            <el-icon :size="48" color="#f56c6c">
              <WarningFilled />
            </el-icon>
          </div>

          <h3 class="error-boundary__title">
            {{ errorTitle }}
          </h3>

          <p class="error-boundary__message">
            {{ errorMessage }}
          </p>

          <!-- 错误详情（开发环境） -->
          <details v-if="showDetails" class="error-boundary__details">
            <summary>错误详情</summary>
            <pre class="error-boundary__stack">{{ errorStack }}</pre>
          </details>

          <!-- 操作按钮 -->
          <div class="error-boundary__actions">
            <el-button
              type="primary"
              @click="retry"
              :loading="retrying"
            >
              重试
            </el-button>

            <el-button
              @click="reset"
            >
              重置
            </el-button>

            <el-button
              v-if="showReportButton"
              type="warning"
              @click="reportError"
            >
              报告问题
            </el-button>
          </div>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onErrorCaptured, nextTick } from 'vue'
import { ElIcon, ElButton, ElMessage } from 'element-plus'
import { WarningFilled } from '@element-plus/icons-vue'
import { handleError, ERROR_TYPES, ERROR_LEVELS, AppError } from '@/utils/error'

// Props
const props = defineProps({
  // 是否显示错误详情（开发环境默认显示）
  showDetails: {
    type: Boolean,
    default: process.env.NODE_ENV === 'development'
  },
  // 是否显示报告按钮
  showReportButton: {
    type: Boolean,
    default: true
  },
  // 自定义错误标题
  customTitle: {
    type: String,
    default: ''
  },
  // 自定义错误消息
  customMessage: {
    type: String,
    default: ''
  },
  // 最大重试次数
  maxRetries: {
    type: Number,
    default: 3
  },
  // 是否自动重试
  autoRetry: {
    type: Boolean,
    default: false
  },
  // 自动重试延迟（毫秒）
  retryDelay: {
    type: Number,
    default: 1000
  },
  // 错误回调函数
  onError: {
    type: Function,
    default: null
  },
  // 重试回调函数
  onRetry: {
    type: Function,
    default: null
  },
  // 重置回调函数
  onReset: {
    type: Function,
    default: null
  }
})

// Emits
const emit = defineEmits(['error', 'retry', 'reset', 'report'])

// 响应式数据
const hasError = ref(false)
const error = ref(null)
const retryCount = ref(0)
const retrying = ref(false)
const errorKey = ref(0)

// 计算属性
const errorTitle = computed(() => {
  if (props.customTitle) return props.customTitle
  if (!error.value) return '出现错误'

  const errorTitles = {
    [ERROR_TYPES.NETWORK_ERROR]: '网络连接错误',
    [ERROR_TYPES.TIMEOUT_ERROR]: '请求超时',
    [ERROR_TYPES.API_ERROR]: 'API错误',
    [ERROR_TYPES.VALIDATION_ERROR]: '数据验证错误',
    [ERROR_TYPES.PERMISSION_ERROR]: '权限错误',
    [ERROR_TYPES.BUSINESS_ERROR]: '业务错误',
    [ERROR_TYPES.SYSTEM_ERROR]: '系统错误',
    [ERROR_TYPES.COMPONENT_ERROR]: '组件错误',
    [ERROR_TYPES.USER_INPUT_ERROR]: '输入错误',
    [ERROR_TYPES.UNKNOWN_ERROR]: '未知错误'
  }

  return errorTitles[error.value.type] || '组件渲染错误'
})

const errorMessage = computed(() => {
  if (props.customMessage) return props.customMessage
  if (!error.value) return '组件渲染时发生了错误'

  return error.value.message || '组件渲染时发生了错误，请稍后重试'
})

const errorStack = computed(() => {
  return error.value?.stack || '无堆栈信息'
})

// 错误捕获
onErrorCaptured((err, instance, info) => {
  console.error('ErrorBoundary caught error:', err, info)

  // 创建应用错误对象
  const appError = new AppError(
    err.message || '组件渲染错误',
    ERROR_TYPES.COMPONENT_ERROR,
    ERROR_LEVELS.HIGH,
    null,
    {
      componentInfo: info,
      instance: instance?.$options?.name || 'Unknown'
    }
  )

  // 设置错误状态
  hasError.value = true
  error.value = appError

  // 处理错误（记录日志等）
  handleError(appError, {
    component: 'ErrorBoundary',
    info,
    instance: instance?.$options?.name
  }, {
    notify: false // 不显示通知，由组件自己处理
  })

  // 调用错误回调
  if (props.onError) {
    props.onError(appError, info)
  }

  // 触发错误事件
  emit('error', appError, info)

  // 自动重试
  if (props.autoRetry && retryCount.value < props.maxRetries) {
    setTimeout(() => {
      retry()
    }, props.retryDelay)
  }

  // 阻止错误继续向上传播
  return false
})

// 方法
const retry = async () => {
  if (retryCount.value >= props.maxRetries) {
    ElMessage.warning(`已达到最大重试次数 (${props.maxRetries})`)
    return
  }

  retrying.value = true
  retryCount.value++

  try {
    // 调用重试回调
    if (props.onRetry) {
      await props.onRetry(error.value)
    }

    // 触发重试事件
    emit('retry', error.value, retryCount.value)

    // 重置错误状态
    await nextTick()
    hasError.value = false
    error.value = null
    errorKey.value++

    ElMessage.success('重试成功')
  } catch (err) {
    console.error('Retry failed:', err)
    ElMessage.error('重试失败，请稍后再试')
  } finally {
    retrying.value = false
  }
}

const reset = () => {
  // 调用重置回调
  if (props.onReset) {
    props.onReset(error.value)
  }

  // 触发重置事件
  emit('reset', error.value)

  // 重置所有状态
  hasError.value = false
  error.value = null
  retryCount.value = 0
  retrying.value = false
  errorKey.value++

  ElMessage.success('已重置组件状态')
}

const reportError = () => {
  if (!error.value) return

  // 触发报告事件
  emit('report', error.value)

  // 这里可以集成错误报告服务
  // 比如发送到 Sentry、LogRocket 等
  console.log('Reporting error:', error.value)

  ElMessage.success('错误报告已提交')
}

// 暴露方法给父组件
defineExpose({
  retry,
  reset,
  reportError,
  hasError: () => hasError.value,
  getError: () => error.value,
  getRetryCount: () => retryCount.value
})
</script>

<style scoped>
.error-boundary {
  width: 100%;
  height: 100%;
}

.error-boundary__content {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 20px;
}

.error-boundary__default {
  text-align: center;
  max-width: 500px;
}

.error-boundary__icon {
  margin-bottom: 16px;
}

.error-boundary__title {
  color: var(--el-color-danger);
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.error-boundary__message {
  color: var(--el-text-color-regular);
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 20px 0;
}

.error-boundary__details {
  text-align: left;
  margin: 20px 0;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
}

.error-boundary__details summary {
  padding: 8px 12px;
  background-color: var(--el-fill-color-light);
  cursor: pointer;
  font-weight: 500;
}

.error-boundary__details summary:hover {
  background-color: var(--el-fill-color);
}

.error-boundary__stack {
  padding: 12px;
  margin: 0;
  background-color: var(--el-fill-color-darker);
  color: var(--el-text-color-primary);
  font-size: 12px;
  line-height: 1.4;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.error-boundary__actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .error-boundary__content {
    padding: 16px;
    min-height: 150px;
  }

  .error-boundary__title {
    font-size: 18px;
  }

  .error-boundary__message {
    font-size: 13px;
  }

  .error-boundary__actions {
    gap: 8px;
  }

  .error-boundary__actions .el-button {
    flex: 1;
    min-width: 80px;
  }
}

/* 深色主题适配 */
.dark .error-boundary__details {
  border-color: var(--el-border-color-darker);
}

.dark .error-boundary__details summary {
  background-color: var(--el-fill-color-darker);
}

.dark .error-boundary__details summary:hover {
  background-color: var(--el-fill-color-dark);
}

.dark .error-boundary__stack {
  background-color: var(--el-fill-color-blank);
}
</style>
