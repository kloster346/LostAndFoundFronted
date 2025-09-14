<template>
  <button :class="buttonClasses" :disabled="disabled || loading" @click="handleClick">
    <span v-if="loading" class="loading-spinner"></span>
    <slot v-if="!loading"></slot>
    <span v-if="loading">{{ loadingText }}</span>
  </button>
</template>

<script setup>
import { computed } from 'vue'

// Props定义
const props = defineProps({
  type: {
    type: String,
    default: 'primary',
    validator: value => ['primary', 'secondary', 'danger'].includes(value),
  },
  size: {
    type: String,
    default: 'medium',
    validator: value => ['small', 'medium', 'large'].includes(value),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  loadingText: {
    type: String,
    default: '加载中...',
  },
  block: {
    type: Boolean,
    default: false,
  },
})

// 事件定义
const emit = defineEmits(['click'])

// 计算属性 - 按钮样式类
const buttonClasses = computed(() => {
  const classes = ['base-button']

  // 类型样式
  classes.push(`base-button--${props.type}`)

  // 尺寸样式
  classes.push(`base-button--${props.size}`)

  // 状态样式
  if (props.disabled) {
    classes.push('base-button--disabled')
  }

  if (props.loading) {
    classes.push('base-button--loading')
  }

  if (props.block) {
    classes.push('base-button--block')
  }

  return classes
})

// 点击处理
const handleClick = event => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  outline: none;
  position: relative;
  gap: 8px;
}

/* 尺寸样式 */
.base-button--small {
  padding: 6px 12px;
  font-size: 12px;
  min-height: 28px;
}

.base-button--medium {
  padding: 8px 16px;
  font-size: 14px;
  min-height: 36px;
}

.base-button--large {
  padding: 12px 24px;
  font-size: 16px;
  min-height: 44px;
}

/* 类型样式 */
.base-button--primary {
  background-color: #3b82f6;
  color: white;
}

.base-button--primary:hover:not(.base-button--disabled):not(.base-button--loading) {
  background-color: #2563eb;
}

.base-button--secondary {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.base-button--secondary:hover:not(.base-button--disabled):not(.base-button--loading) {
  background-color: #e5e7eb;
  border-color: #9ca3af;
}

.base-button--danger {
  background-color: #ef4444;
  color: white;
}

.base-button--danger:hover:not(.base-button--disabled):not(.base-button--loading) {
  background-color: #dc2626;
}

/* 状态样式 */
.base-button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.base-button--loading {
  cursor: not-allowed;
}

.base-button--block {
  width: 100%;
  display: flex;
}

/* 加载动画 */
.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 焦点样式 */
.base-button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .base-button {
    min-height: 44px; /* 移动设备触摸友好 */
  }

  .base-button--small {
    min-height: 36px;
    padding: 6px 12px;
    font-size: 13px;
  }

  .base-button--large {
    min-height: 52px;
    padding: 14px 24px;
    font-size: 17px;
  }
}
</style>
