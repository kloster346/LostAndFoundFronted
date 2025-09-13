<template>
  <form class="search-form" @submit.prevent="handleSubmit">
    <div class="search-form__header">
      <h3 class="search-form__title">搜索失物</h3>
      <BaseButton
        v-if="hasActiveFilters"
        type="secondary"
        size="small"
        @click="handleReset"
      >
        重置
      </BaseButton>
    </div>
    
    <div class="search-form__content">
      <!-- 关键词搜索 -->
      <div class="search-form__field">
        <BaseInput
          v-model="formData.keyword"
          label="关键词"
          placeholder="请输入物品名称、描述或发现地点"
          clearable
          @enter="handleSubmit"
        />
      </div>
      
      <!-- 物品类型选择 -->
      <div class="search-form__field">
        <label class="search-form__label">物品类型</label>
        <div class="search-form__select-group">
          <select
            v-model="formData.type"
            class="search-form__select"
          >
            <option value="">全部类型</option>
            <option
              v-for="(name, type) in ITEM_TYPE_NAMES"
              :key="type"
              :value="type"
            >
              {{ name }}
            </option>
          </select>
        </div>
      </div>
      
      <!-- 颜色选择 -->
      <div class="search-form__field">
        <label class="search-form__label">颜色</label>
        <div class="search-form__color-grid">
          <button
            v-for="(name, color) in COLOR_NAMES"
            :key="color"
            type="button"
            class="search-form__color-option"
            :class="{ 'search-form__color-option--active': formData.color === color }"
            @click="toggleColor(color)"
          >
            <span
              class="search-form__color-dot"
              :style="{ backgroundColor: getColorValue(color) }"
            ></span>
            <span class="search-form__color-name">{{ name }}</span>
          </button>
        </div>
      </div>
      
      <!-- 发现地点 -->
      <div class="search-form__field">
        <BaseInput
          v-model="formData.foundLocation"
          label="发现地点"
          placeholder="请输入具体地点"
          clearable
        />
      </div>
      
      <!-- 日期范围 -->
      <div class="search-form__field">
        <label class="search-form__label">发现时间</label>
        <div class="search-form__date-range">
          <BaseInput
            v-model="formData.startDate"
            type="date"
            placeholder="开始日期"
            size="small"
          />
          <span class="search-form__date-separator">至</span>
          <BaseInput
            v-model="formData.endDate"
            type="date"
            placeholder="结束日期"
            size="small"
          />
        </div>
      </div>
      
      <!-- 领取状态 -->
      <div class="search-form__field">
        <label class="search-form__label">领取状态</label>
        <div class="search-form__radio-group">
          <label
            v-for="(name, status) in CLAIM_STATUS_NAMES"
            :key="status"
            class="search-form__radio-option"
          >
            <input
              v-model="formData.claimStatus"
              type="radio"
              :value="status"
              class="search-form__radio"
            />
            <span class="search-form__radio-label">{{ name }}</span>
          </label>
          
          <label class="search-form__radio-option">
            <input
              v-model="formData.claimStatus"
              type="radio"
              value=""
              class="search-form__radio"
            />
            <span class="search-form__radio-label">全部状态</span>
          </label>
        </div>
      </div>
      
      <!-- 高级选项 -->
      <div class="search-form__field">
        <button
          type="button"
          class="search-form__toggle"
          @click="showAdvanced = !showAdvanced"
        >
          <span>高级选项</span>
          <span class="search-form__toggle-icon" :class="{ 'search-form__toggle-icon--open': showAdvanced }">
            ▼
          </span>
        </button>
        
        <div v-if="showAdvanced" class="search-form__advanced">
          <!-- 排序选项 -->
          <div class="search-form__sort">
            <label class="search-form__label">排序方式</label>
            <div class="search-form__sort-options">
              <select v-model="formData.sortBy" class="search-form__select search-form__select--small">
                <option value="publishTime">发布时间</option>
                <option value="foundTime">发现时间</option>
                <option value="name">物品名称</option>
              </select>
              
              <select v-model="formData.sortOrder" class="search-form__select search-form__select--small">
                <option value="desc">降序</option>
                <option value="asc">升序</option>
              </select>
            </div>
          </div>
          
          <!-- 其他筛选 -->
          <div class="search-form__filters">
            <label class="search-form__checkbox">
              <input
                v-model="formData.showOnlyUnclaimed"
                type="checkbox"
                class="search-form__checkbox-input"
              />
              <span class="search-form__checkbox-label">只显示未领取</span>
            </label>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 操作按钮 -->
    <div class="search-form__actions">
      <BaseButton
        type="primary"
        :loading="loading"
        @click="handleSubmit"
      >
        搜索
      </BaseButton>
      
      <BaseButton
        type="secondary"
        :disabled="loading"
        @click="handleReset"
      >
        重置
      </BaseButton>
    </div>
  </form>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BaseInput from '../common/BaseInput.vue'
import BaseButton from '../common/BaseButton.vue'
import { ITEM_TYPES, ITEM_TYPE_NAMES, COLORS, COLOR_NAMES, CLAIM_STATUS, CLAIM_STATUS_NAMES } from '../../constants/enums.js'

// Props定义
const props = defineProps({
  initialValues: {
    type: Object,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  },
  autoSubmit: {
    type: Boolean,
    default: false
  },
  debounceDelay: {
    type: Number,
    default: 300
  }
})

// 事件定义
const emit = defineEmits(['search', 'reset', 'change'])

// 响应式数据
const showAdvanced = ref(false)

const formData = ref({
  keyword: '',
  type: '',
  color: '',
  foundLocation: '',
  startDate: '',
  endDate: '',
  claimStatus: '',
  sortBy: 'publishTime',
  sortOrder: 'desc',
  showOnlyUnclaimed: false,
  ...props.initialValues
})

// 防抖定时器
let debounceTimer = null

// 计算属性
const hasActiveFilters = computed(() => {
  return Object.entries(formData.value).some(([key, value]) => {
    if (key === 'sortBy' && value === 'publishTime') return false
    if (key === 'sortOrder' && value === 'desc') return false
    if (key === 'showOnlyUnclaimed' && value === false) return false
    return value !== '' && value !== null && value !== undefined
  })
})

// 方法
const getColorValue = (color) => {
  const colorMap = {
    [COLORS.RED]: '#ef4444',
    [COLORS.BLUE]: '#3b82f6',
    [COLORS.GREEN]: '#10b981',
    [COLORS.YELLOW]: '#f59e0b',
    [COLORS.BLACK]: '#1f2937',
    [COLORS.WHITE]: '#f9fafb',
    [COLORS.GRAY]: '#6b7280',
    [COLORS.BROWN]: '#92400e',
    [COLORS.PINK]: '#ec4899',
    [COLORS.PURPLE]: '#8b5cf6',
    [COLORS.ORANGE]: '#f97316'
  }
  return colorMap[color] || '#6b7280'
}

const toggleColor = (color) => {
  if (formData.value.color === color) {
    formData.value.color = ''
  } else {
    formData.value.color = color
  }
  
  if (props.autoSubmit) {
    debouncedSubmit()
  }
}

const handleSubmit = () => {
  const searchParams = { ...formData.value }
  
  // 清理空值
  Object.keys(searchParams).forEach(key => {
    if (searchParams[key] === '' || searchParams[key] === null || searchParams[key] === undefined) {
      delete searchParams[key]
    }
  })
  
  emit('search', searchParams)
}

const handleReset = () => {
  formData.value = {
    keyword: '',
    type: '',
    color: '',
    foundLocation: '',
    startDate: '',
    endDate: '',
    claimStatus: '',
    sortBy: 'publishTime',
    sortOrder: 'desc',
    showOnlyUnclaimed: false
  }
  
  emit('reset')
  
  if (props.autoSubmit) {
    handleSubmit()
  }
}

const debouncedSubmit = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  
  debounceTimer = setTimeout(() => {
    handleSubmit()
  }, props.debounceDelay)
}

// 监听表单数据变化
watch(
  formData,
  (newValue) => {
    emit('change', newValue)
    
    if (props.autoSubmit) {
      debouncedSubmit()
    }
  },
  { deep: true }
)
</script>

<style scoped>
.search-form {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.search-form__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-form__title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.search-form__content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.search-form__field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.search-form__label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

/* 选择框样式 */
.search-form__select-group {
  position: relative;
}

.search-form__select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background-color: #ffffff;
  font-size: 14px;
  color: #111827;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-form__select:hover {
  border-color: #9ca3af;
}

.search-form__select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-form__select--small {
  padding: 6px 10px;
  font-size: 13px;
}

/* 颜色选择 */
.search-form__color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
}

.search-form__color-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-form__color-option:hover {
  border-color: #9ca3af;
  background-color: #f9fafb;
}

.search-form__color-option--active {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.search-form__color-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid #e5e7eb;
}

.search-form__color-name {
  font-size: 13px;
  color: #374151;
}

/* 日期范围 */
.search-form__date-range {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-form__date-separator {
  font-size: 14px;
  color: #6b7280;
}

/* 单选按钮 */
.search-form__radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.search-form__radio-option {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.search-form__radio {
  width: 16px;
  height: 16px;
  accent-color: #3b82f6;
}

.search-form__radio-label {
  font-size: 14px;
  color: #374151;
}

/* 高级选项 */
.search-form__toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 0;
  border: none;
  background: none;
  font-size: 14px;
  font-weight: 500;
  color: #3b82f6;
  cursor: pointer;
  border-bottom: 1px solid #e5e7eb;
}

.search-form__toggle-icon {
  transition: transform 0.2s ease;
}

.search-form__toggle-icon--open {
  transform: rotate(180deg);
}

.search-form__advanced {
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-form__sort {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.search-form__sort-options {
  display: flex;
  gap: 12px;
}

.search-form__sort-options .search-form__select {
  flex: 1;
}

.search-form__filters {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.search-form__checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.search-form__checkbox-input {
  width: 16px;
  height: 16px;
  accent-color: #3b82f6;
}

.search-form__checkbox-label {
  font-size: 14px;
  color: #374151;
}

/* 操作按钮 */
.search-form__actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f3f4f6;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .search-form {
    padding: 16px;
  }
  
  .search-form__color-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .search-form__date-range {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-form__radio-group {
    flex-direction: column;
    gap: 12px;
  }
  
  .search-form__sort-options {
    flex-direction: column;
  }
  
  .search-form__actions {
    flex-direction: column;
  }
}
</style>