<template>
  <div class="lost-item-detail">
    <!-- 返回按钮 -->
    <div class="back-button-container">
      <button @click="goBack" class="back-button">
        <svg class="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        返回
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载失物详情...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <h3>加载失败</h3>
      <p>{{ error }}</p>
      <button @click="loadItemDetail" class="retry-button">重试</button>
    </div>

    <!-- 失物详情内容 -->
    <div v-else-if="item" class="item-detail-content">
      <!-- 失物基本信息 -->
      <div class="item-header">
        <h1 class="item-title">{{ item.name }}</h1>
        <div class="item-status" :class="getStatusClass(item.claimStatus)">
          {{ getStatusText(item.claimStatus) }}
        </div>
      </div>

      <!-- 失物图片 -->
      <div class="item-images" v-if="item.imageUrl">
        <img
          :src="item.imageUrl"
          :alt="item.name"
          class="item-image"
          @click="openImagePreview"
          @error="handleImageError"
        />
      </div>
      <div v-else class="no-image">
        <div class="no-image-placeholder">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21,15 16,10 5,21"/>
          </svg>
          <p>暂无图片</p>
        </div>
      </div>

      <!-- 失物详细信息 -->
      <div class="item-info">
        <div class="info-section">
          <h3>基本信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>物品类型：</label>
              <span>{{ getItemTypeName(item.type) }}</span>
            </div>
            <div class="info-item">
              <label>颜色：</label>
              <span>{{ getColorName(item.color) }}</span>
            </div>
            <div class="info-item">
              <label>发现地点：</label>
              <span>{{ getBuildingName(item.location) }}</span>
            </div>
            <div class="info-item">
              <label>发现时间：</label>
              <span>{{ formatDate(item.foundTime) }}</span>
            </div>
          </div>
        </div>

        <div class="info-section" v-if="item.description">
          <h3>详细描述</h3>
          <p class="description">{{ item.description }}</p>
        </div>

        <div class="info-section">
          <h3>发布信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>发布时间：</label>
              <span>{{ formatDate(item.createdAt) }}</span>
            </div>
            <div class="info-item">
              <label>联系方式：</label>
              <span>{{ item.contactInfo || '请通过系统联系' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button
          v-if="item.claimStatus === 0"
          @click="goToClaim"
          class="claim-button primary"
        >
          我要认领
        </button>
        <button
          v-else
          class="claim-button disabled"
          disabled
        >
          已被认领
        </button>
      </div>
    </div>

    <!-- 图片预览模态框 -->
    <div v-if="showImagePreview" class="image-preview-modal" @click="closeImagePreview">
      <div class="image-preview-content" @click.stop>
        <button @click="closeImagePreview" class="close-button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <img :src="item?.imageUrl" :alt="item?.name" class="preview-image" />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LostItemAPI from '@/api/lostItem.js'
import {
  getItemTypeName,
  getColorName,
  getBuildingName,
  CLAIM_STATUS
} from '@/constants/enums'

export default {
  name: 'LostItemDetailView',
  setup() {
    const route = useRoute()
    const router = useRouter()

    // 响应式数据
    const loading = ref(false)
    const error = ref(null)
    const item = ref(null)
    const showImagePreview = ref(false)

    // 获取失物详情
    const loadItemDetail = async () => {
      try {
        loading.value = true
        error.value = null

        const itemId = route.params.id
        if (!itemId) {
          throw new Error('缺少失物ID参数')
        }

        const response = await LostItemAPI.getLostItemById(parseInt(itemId))
        item.value = response
      } catch (err) {
        console.error('加载失物详情失败:', err)
        error.value = err.message || '加载失物详情失败，请稍后重试'
      } finally {
        loading.value = false
      }
    }

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '未知'
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // 获取状态样式类
    const getStatusClass = (status) => {
      return status === CLAIM_STATUS.CLAIMED ? 'claimed' : 'unclaimed'
    }

    // 获取状态文本
    const getStatusText = (status) => {
      return status === CLAIM_STATUS.CLAIMED ? '已认领' : '待认领'
    }

    // 处理图片错误
    const handleImageError = (event) => {
      event.target.style.display = 'none'
    }

    // 打开图片预览
    const openImagePreview = () => {
      showImagePreview.value = true
    }

    // 关闭图片预览
    const closeImagePreview = () => {
      showImagePreview.value = false
    }

    // 返回上一页
    const goBack = () => {
      router.go(-1)
    }

    // 跳转到认领页面
    const goToClaim = () => {
      router.push(`/lost-items/${route.params.id}/claim`)
    }

    // 组件挂载时加载数据
    onMounted(() => {
      loadItemDetail()
    })

    return {
      loading,
      error,
      item,
      showImagePreview,
      loadItemDetail,
      formatDate,
      getStatusClass,
      getStatusText,
      handleImageError,
      openImagePreview,
      closeImagePreview,
      goBack,
      goToClaim,
      getItemTypeName,
      getColorName,
      getBuildingName
    }
  }
}
</script>

<style scoped>
.lost-item-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: #fff;
  min-height: 100vh;
}

/* 返回按钮 */
.back-button-container {
  margin-bottom: 20px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 6px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.back-button:hover {
  background: #e9e9e9;
  color: #333;
}

.back-icon {
  width: 16px;
  height: 16px;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误状态 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.retry-button {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 16px;
}

.retry-button:hover {
  background: #0056b3;
}

/* 失物详情内容 */
.item-detail-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 失物标题 */
.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.item-title {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin: 0;
  flex: 1;
}

.item-status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

.item-status.unclaimed {
  background: #e8f5e8;
  color: #2d5a2d;
}

.item-status.claimed {
  background: #f5e8e8;
  color: #5a2d2d;
}

/* 失物图片 */
.item-images {
  text-align: center;
}

.item-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.item-image:hover {
  transform: scale(1.02);
}

.no-image {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  background: #f8f9fa;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
}

.no-image-placeholder {
  text-align: center;
  color: #6c757d;
}

.no-image-placeholder svg {
  width: 48px;
  height: 48px;
  margin-bottom: 8px;
}

/* 失物信息 */
.item-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.info-section h3 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-item label {
  font-weight: 500;
  color: #666;
  min-width: 80px;
}

.info-item span {
  color: #333;
}

.description {
  line-height: 1.6;
  color: #333;
  margin: 0;
  white-space: pre-wrap;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.claim-button {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.claim-button.primary {
  background: #007bff;
  color: white;
}

.claim-button.primary:hover {
  background: #0056b3;
}

.claim-button.disabled {
  background: #6c757d;
  color: white;
  cursor: not-allowed;
}

.share-button {
  padding: 12px 24px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s;
}

.share-button:hover {
  background: #e9ecef;
}

/* 图片预览模态框 */
.image-preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.image-preview-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  border-radius: 8px;
}

.close-button {
  position: absolute;
  top: -40px;
  right: 0;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.close-button:hover {
  background: white;
}

.close-button svg {
  width: 16px;
  height: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .lost-item-detail {
    padding: 16px;
  }

  .item-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .item-title {
    font-size: 24px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }

  .image-preview-content {
    max-width: 95vw;
    max-height: 95vh;
  }
}

@media (max-width: 480px) {
  .lost-item-detail {
    padding: 12px;
  }

  .item-title {
    font-size: 20px;
  }

  .info-section {
    padding: 16px;
  }
}
</style>
