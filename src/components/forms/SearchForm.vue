<template>
  <form class="search-form" @submit.prevent="handleSubmit">
    <div class="search-form__header">
      <h3 class="search-form__title">搜索失物</h3>
      <BaseButton v-if="hasActiveFilters" type="secondary" size="small" @click="handleReset">
        重置
      </BaseButton>
    </div>

    <div class="search-form__content">
      <!-- 物品名称 -->
      <div class="search-form__field">
        <BaseInput
          v-model="formData.name"
          label="物品名称"
          placeholder="请输入物品名称"
          clearable
          @enter="handleSubmit"
        />
      </div>

      <!-- 物品类型选择 -->
      <div class="search-form__field">
        <label class="search-form__label">物品类型</label>
        <div class="search-form__select-group">
          <select v-model="formData.type" class="search-form__select">
            <option value="">全部类型</option>
            <option v-for="(name, _key) in ITEM_TYPE_NAMES" :key="_key" :value="_key">
              {{ name }}
            </option>
          </select>
        </div>
      </div>

      <!-- 颜色选择（移动端仅展示前4种，其余通过底部抽屉选择） -->
      <div class="search-form__field">
        <label class="search-form__label">颜色</label>
        <div class="search-form__color-grid">
          <button
            v-for="item in visibleColorList"
            :key="item.key"
            type="button"
            class="search-form__color-option"
            :class="{ 'search-form__color-option--active': formData.color === item.key }"
            @click="toggleColor(item.key)"
          >
            <span
              class="search-form__color-dot"
              :style="{ backgroundColor: getColorValue(item.key) }"
            ></span>
            <span class="search-form__color-name">{{ item.name }}</span>
          </button>
        </div>
        <div class="more-colors-wrapper" v-if="isMobile">
          <BaseButton type="secondary" size="small" @click="openColorDialog">
            更多颜色
          </BaseButton>
        </div>
      </div>

      <!-- 楼栋选择 -->
      <div class="search-form__field">
        <label class="search-form__label">楼栋</label>
        <div class="search-form__select-group">
          <select v-model="formData.building" class="search-form__select">
            <option value="">全部楼栋</option>
            <option v-for="option in buildingOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="search-form__actions">
      <BaseButton type="primary" :loading="loading" @click="handleSubmit"> 搜索 </BaseButton>

      <BaseButton type="secondary" :disabled="loading" @click="handleReset"> 重置 </BaseButton>
    </div>
  </form>
  <el-dialog v-model="showColorDialog" title="选择颜色" :width="isMobile ? '90%' : '520px'" destroy-on-close>
    <div class="dialog-color-grid">
      <button
        v-for="item in colorEntries"
        :key="item.key"
        type="button"
        class="search-form__color-option"
        :class="{ 'search-form__color-option--active': formData.color === item.key }"
        @click="selectColor(item.key)"
      >
        <span class="search-form__color-dot" :style="{ backgroundColor: getColorValue(item.key) }"></span>
        <span class="search-form__color-name">{{ item.name }}</span>
      </button>
    </div>

    <template #footer>
      <BaseButton type="secondary" size="small" @click="closeColorDialog">关闭</BaseButton>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import BaseInput from '../common/BaseInput.vue'
import BaseButton from '../common/BaseButton.vue'
import { ITEM_TYPE_NAMES, COLORS, COLOR_NAMES, getBuildingOptions } from '../../constants/enums.js'

// Props定义
const props = defineProps({
  initialValues: {
    type: Object,
    default: () => ({}),
  },
  loading: {
    type: Boolean,
    default: false,
  },
  autoSubmit: {
    type: Boolean,
    default: false,
  },
  debounceDelay: {
    type: Number,
    default: 300,
  },
})

// 事件定义
const emit = defineEmits(['search', 'reset', 'change'])

// 响应式数据
const formData = ref({
  name: '',
  type: '',
  color: '',
  building: '',
  ...props.initialValues,
})

// 防抖定时器
let debounceTimer = null

// 计算属性
const hasActiveFilters = computed(() => {
  return Object.entries(formData.value).some(([_key, value]) => {
    return value !== '' && value !== null && value !== undefined
  })
})

const buildingOptions = computed(() => {
  return getBuildingOptions()
})

// 设备环境与颜色展示控制
const isMobile = ref(false)
const showColorDialog = ref(false)

const colorEntries = computed(() => {
  return Object.entries(COLOR_NAMES).map(([key, name]) => ({ key, name }))
})

const visibleColorList = computed(() => {
  const list = colorEntries.value
  return isMobile.value ? list.slice(0, 4) : list
})

const openColorDialog = () => {
  showColorDialog.value = true
}

const closeColorDialog = () => {
  showColorDialog.value = false
}

// 监听窗口尺寸适配移动端
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 640
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

// 方法
const getColorValue = color => {
  const colorMap = {
    [COLORS.RED]: '#ef4444',
    [COLORS.LIGHT_RED]: '#fca5a5',
    [COLORS.DARK_RED]: '#b91c1c',
    [COLORS.GREEN]: '#10b981',
    [COLORS.LIGHT_GREEN]: '#6ee7b7',
    [COLORS.DARK_GREEN]: '#047857',
    [COLORS.BLUE]: '#3b82f6',
    [COLORS.LIGHT_BLUE]: '#93c5fd',
    [COLORS.DARK_BLUE]: '#1d4ed8',
    [COLORS.YELLOW]: '#f59e0b',
    [COLORS.ORANGE]: '#f97316',
    [COLORS.PURPLE]: '#8b5cf6',
    [COLORS.PINK]: '#ec4899',
    [COLORS.BROWN]: '#92400e',
    [COLORS.GRAY]: '#6b7280',
    [COLORS.BLACK]: '#1f2937',
    [COLORS.WHITE]: '#f9fafb',
    [COLORS.OTHER]: '#9ca3af',
  }
  return colorMap[color] || '#6b7280'
}

const toggleColor = color => {
  if (formData.value.color === color) {
    formData.value.color = ''
  } else {
    formData.value.color = color
  }

  if (props.autoSubmit) {
    debouncedSubmit()
  }
}

const selectColor = color => {
  toggleColor(color)
  closeColorDialog()
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
    name: '',
    type: '',
    color: '',
    building: '',
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
  newValue => {
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

/* 操作按钮 */
.search-form__actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f3f4f6;
}

.more-colors-wrapper {
  margin-top: 8px;
}

.dialog-color-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .search-form {
    padding: 16px;
  }

  .search-form__color-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .search-form__actions {
    flex-direction: column;
  }
}
</style>
