<template>
  <div class="lost-item-card" :class="cardClasses">
    <!-- 失物图片 -->
    <div class="lost-item-card__image">
      <img
        v-if="item.imageUrl"
        :src="getImageUrl(item.imageUrl)"
        :alt="item.name"
        class="lost-item-card__img"
        @error="e => handleImageError(e, item.type)"
      />
      <div v-else class="lost-item-card__placeholder">
        <span class="lost-item-card__placeholder-text">{{ getItemTypeIcon(item.type) }}</span>
      </div>

      <!-- 状态标签 -->
      <div class="lost-item-card__status" :class="statusClasses">
        {{ getStatusText(item.claimStatus) }}
      </div>
    </div>

    <!-- 失物信息 -->
    <div class="lost-item-card__content">
      <h3 class="lost-item-card__title">{{ item.name }}</h3>

      <div class="lost-item-card__meta">
        <div class="lost-item-card__meta-item">
          <span class="lost-item-card__meta-label">类型:</span>
          <span class="lost-item-card__meta-value">{{ getItemTypeName(item.type) }}</span>
        </div>

        <div v-if="item.color" class="lost-item-card__meta-item">
          <span class="lost-item-card__meta-label">颜色:</span>
          <span class="lost-item-card__meta-value">
            <span
              class="lost-item-card__color-dot"
              :style="{ backgroundColor: getColorValue(item.color) }"
            ></span>
            {{ getColorName(item.color) }}
          </span>
        </div>

        <div class="lost-item-card__meta-item">
          <span class="lost-item-card__meta-label">发现地点:</span>
          <span class="lost-item-card__meta-value">{{ item.foundLocation }}</span>
        </div>

        <div class="lost-item-card__meta-item">
          <span class="lost-item-card__meta-label">发现时间:</span>
          <span class="lost-item-card__meta-value">{{ formatDate(item.foundTime) }}</span>
        </div>
      </div>

      <p v-if="item.description" class="lost-item-card__description">
        {{ truncateText(item.description, maxDescriptionLength) }}
      </p>
    </div>

    <!-- 操作按钮 -->
    <div class="lost-item-card__actions">
      <BaseButton size="small" type="secondary" @click="handleViewDetail"> 查看详情 </BaseButton>

      <BaseButton
        v-if="showClaimButton"
        size="small"
        type="primary"
        :loading="claimLoading"
        @click="handleClaim"
      >
        申请认领
      </BaseButton>

      <BaseButton v-if="showEditButton" size="small" type="secondary" @click="handleEdit">
        编辑
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import BaseButton from '../common/BaseButton.vue'
import {
  CLAIM_STATUS,
  CLAIM_STATUS_NAMES,
  ITEM_TYPES,
  ITEM_TYPE_NAMES,
  COLORS,
  COLOR_NAMES,
} from '../../constants/enums.js'
import { getImageUrl, handleImageError } from '../../utils/imageUtils.js'

// Props定义
const props = defineProps({
  item: {
    type: Object,
    required: true,
    validator: value => {
      return value && typeof value === 'object' && value.id
    },
  },
  size: {
    type: String,
    default: 'medium',
    validator: value => ['small', 'medium', 'large'].includes(value),
  },
  showClaimButton: {
    type: Boolean,
    default: true,
  },
  showEditButton: {
    type: Boolean,
    default: false,
  },
  maxDescriptionLength: {
    type: Number,
    default: 100,
  },
  claimLoading: {
    type: Boolean,
    default: false,
  },
})

// 事件定义
const emit = defineEmits(['view-detail', 'claim', 'edit'])

// 响应式数据
// imageError已移除，现在使用imageUtils中的handleImageError

// 计算属性
const cardClasses = computed(() => {
  const classes = ['lost-item-card']
  classes.push(`lost-item-card--${props.size}`)

  if (props.item.claimStatus === CLAIM_STATUS.CLAIMED) {
    classes.push('lost-item-card--claimed')
  }

  return classes
})

const statusClasses = computed(() => {
  const classes = ['lost-item-card__status']

  switch (props.item.claimStatus) {
    case CLAIM_STATUS.UNCLAIMED:
      classes.push('lost-item-card__status--unclaimed')
      break
    case CLAIM_STATUS.CLAIMED:
      classes.push('lost-item-card__status--claimed')
      break
    case CLAIM_STATUS.PENDING:
      classes.push('lost-item-card__status--pending')
      break
    default:
      classes.push('lost-item-card__status--unknown')
  }

  return classes
})

// 方法
const getStatusText = status => {
  return CLAIM_STATUS_NAMES[status] || '未知状态'
}

const getItemTypeName = type => {
  return ITEM_TYPE_NAMES[type] || '其他'
}

const getColorName = color => {
  return COLOR_NAMES[color] || color
}

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

const getItemTypeIcon = type => {
  const iconMap = {
    [ITEM_TYPES.ELECTRONICS]: '📱',
    [ITEM_TYPES.CLOTHING]: '👕',
    [ITEM_TYPES.ACCESSORIES]: '👜',
    [ITEM_TYPES.BOOKS]: '📚',
    [ITEM_TYPES.DOCUMENTS]: '📄',
    [ITEM_TYPES.KEYS]: '🔑',
    [ITEM_TYPES.SPORTS]: '⚽',
    [ITEM_TYPES.STATIONERY]: '✏️',
    [ITEM_TYPES.OTHERS]: '📦',
  }
  return iconMap[type] || '📦'
}

const formatDate = dateString => {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateString
  }
}

const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// handleImageError已移除，现在使用imageUtils中的handleImageError

const handleViewDetail = () => {
  emit('view-detail', props.item)
}

const handleClaim = () => {
  emit('claim', props.item)
}

const handleEdit = () => {
  emit('edit', props.item)
}
</script>

<style scoped>
.lost-item-card {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.lost-item-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.lost-item-card--claimed {
  opacity: 0.7;
}

/* 尺寸变体 */
.lost-item-card--small {
  max-width: 280px;
}

.lost-item-card--medium {
  max-width: 320px;
}

.lost-item-card--large {
  max-width: 400px;
}

/* 图片区域 */
.lost-item-card__image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  background-color: #f9fafb;
}

.lost-item-card--small .lost-item-card__image {
  height: 160px;
}

.lost-item-card--large .lost-item-card__image {
  height: 240px;
}

.lost-item-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.lost-item-card__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #f3f4f6;
}

.lost-item-card__placeholder-text {
  font-size: 48px;
  opacity: 0.6;
}

.lost-item-card__status {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  color: white;
}

.lost-item-card__status--unclaimed {
  background-color: #10b981;
}

.lost-item-card__status--claimed {
  background-color: #6b7280;
}

.lost-item-card__status--pending {
  background-color: #f59e0b;
}

.lost-item-card__status--unknown {
  background-color: #ef4444;
}

/* 内容区域 */
.lost-item-card__content {
  padding: 16px;
  flex: 1;
}

.lost-item-card__title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.lost-item-card--small .lost-item-card__title {
  font-size: 16px;
}

.lost-item-card__meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.lost-item-card__meta-item {
  display: flex;
  align-items: center;
  font-size: 13px;
}

.lost-item-card__meta-label {
  color: #6b7280;
  margin-right: 8px;
  min-width: 60px;
}

.lost-item-card__meta-value {
  color: #374151;
  display: flex;
  align-items: center;
  gap: 4px;
}

.lost-item-card__color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid #e5e7eb;
}

.lost-item-card__description {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
  margin: 0;
}

/* 操作区域 */
.lost-item-card__actions {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #f3f4f6;
  background-color: #fafafa;
}

.lost-item-card--small .lost-item-card__actions {
  flex-direction: column;
}

.lost-item-card--small .lost-item-card__actions .base-button {
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .lost-item-card {
    max-width: 100%;
  }

  .lost-item-card__actions {
    flex-direction: column;
  }

  .lost-item-card__actions .base-button {
    width: 100%;
  }
}
</style>
