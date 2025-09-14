<template>
  <div class="base-input">
    <label v-if="label" :for="inputId" class="base-input__label">
      {{ label }}
      <span v-if="required" class="base-input__required">*</span>
    </label>

    <div class="base-input__wrapper" :class="wrapperClasses">
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :minlength="minlength"
        :min="min"
        :max="max"
        :step="step"
        :autocomplete="autocomplete"
        class="base-input__field"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        @keyup.enter="handleEnter"
      />

      <!-- 清除按钮 -->
      <button
        v-if="clearable && modelValue && !disabled && !readonly"
        type="button"
        class="base-input__clear"
        @click="handleClear"
      >
        ×
      </button>
    </div>

    <!-- 错误信息 -->
    <div v-if="errorMessage" class="base-input__error">
      {{ errorMessage }}
    </div>

    <!-- 帮助文本 -->
    <div v-if="helpText && !errorMessage" class="base-input__help">
      {{ helpText }}
    </div>
  </div>
</template>

<script setup>
import { computed, ref, nextTick } from 'vue'

// Props定义
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  type: {
    type: String,
    default: 'text',
    validator: value =>
      [
        'text',
        'password',
        'email',
        'number',
        'tel',
        'url',
        'search',
        'date',
        'datetime-local',
        'time',
      ].includes(value),
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
  clearable: {
    type: Boolean,
    default: false,
  },
  size: {
    type: String,
    default: 'medium',
    validator: value => ['small', 'medium', 'large'].includes(value),
  },
  errorMessage: {
    type: String,
    default: '',
  },
  helpText: {
    type: String,
    default: '',
  },
  maxlength: {
    type: [String, Number],
    default: undefined,
  },
  minlength: {
    type: [String, Number],
    default: undefined,
  },
  min: {
    type: [String, Number],
    default: undefined,
  },
  max: {
    type: [String, Number],
    default: undefined,
  },
  step: {
    type: [String, Number],
    default: undefined,
  },
  autocomplete: {
    type: String,
    default: 'off',
  },
  validateOnBlur: {
    type: Boolean,
    default: true,
  },
})

// 事件定义
const emit = defineEmits(['update:modelValue', 'blur', 'focus', 'enter', 'clear', 'validate'])

// 响应式数据
const isFocused = ref(false)
const inputId = ref(`base-input-${Math.random().toString(36).substr(2, 9)}`)

// 计算属性
const wrapperClasses = computed(() => {
  const classes = ['base-input__wrapper']

  classes.push(`base-input__wrapper--${props.size}`)

  if (props.disabled) {
    classes.push('base-input__wrapper--disabled')
  }

  if (props.readonly) {
    classes.push('base-input__wrapper--readonly')
  }

  if (props.errorMessage) {
    classes.push('base-input__wrapper--error')
  }

  if (isFocused.value) {
    classes.push('base-input__wrapper--focused')
  }

  return classes
})

// 事件处理
const handleInput = event => {
  const value = event.target.value
  emit('update:modelValue', value)
}

const handleBlur = event => {
  isFocused.value = false
  emit('blur', event)

  if (props.validateOnBlur) {
    emit('validate', props.modelValue)
  }
}

const handleFocus = event => {
  isFocused.value = true
  emit('focus', event)
}

const handleEnter = event => {
  emit('enter', event)
}

const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')

  nextTick(() => {
    const input = document.getElementById(inputId.value)
    if (input) {
      input.focus()
    }
  })
}
</script>

<style scoped>
.base-input {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.base-input__label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
}

.base-input__required {
  color: #ef4444;
  margin-left: 2px;
}

.base-input__wrapper {
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background-color: #ffffff;
  transition: all 0.2s ease;
}

.base-input__wrapper:hover:not(.base-input__wrapper--disabled) {
  border-color: #9ca3af;
}

.base-input__wrapper--focused {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.base-input__wrapper--error {
  border-color: #ef4444;
}

.base-input__wrapper--error.base-input__wrapper--focused {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.base-input__wrapper--disabled {
  background-color: #f9fafb;
  border-color: #e5e7eb;
  cursor: not-allowed;
}

.base-input__wrapper--readonly {
  background-color: #f9fafb;
}

/* 尺寸样式 */
.base-input__wrapper--small {
  min-height: 32px;
}

.base-input__wrapper--medium {
  min-height: 40px;
}

.base-input__wrapper--large {
  min-height: 48px;
}

.base-input__field {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: #111827;
  padding: 0 12px;
}

.base-input__wrapper--small .base-input__field {
  padding: 0 8px;
  font-size: 13px;
}

.base-input__wrapper--large .base-input__field {
  padding: 0 16px;
  font-size: 16px;
}

.base-input__field::placeholder {
  color: #9ca3af;
}

.base-input__field:disabled {
  cursor: not-allowed;
  color: #6b7280;
}

.base-input__clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-right: 8px;
  border: none;
  background: none;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 50%;
  font-size: 16px;
  line-height: 1;
  transition: all 0.2s ease;
}

.base-input__clear:hover {
  background-color: #f3f4f6;
  color: #6b7280;
}

.base-input__error {
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
}

.base-input__help {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

/* 数字输入框样式 */
input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .base-input__field {
    min-height: 44px; /* 移动设备触摸友好 */
    font-size: 16px; /* 防止iOS缩放 */
  }

  .base-input--small .base-input__field {
    min-height: 36px;
    font-size: 14px;
  }

  .base-input--large .base-input__field {
    min-height: 52px;
    font-size: 18px;
  }

  .base-input__label {
    font-size: 15px;
  }

  .base-input__clear {
    width: 24px;
    height: 24px;
    font-size: 18px;
  }
}
</style>
