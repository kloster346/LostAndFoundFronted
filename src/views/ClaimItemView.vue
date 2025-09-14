<template>
  <div class="claim-item-container">
    <!-- 返回按钮 -->
    <div class="back-button-container">
      <button @click="goBack" class="back-button">
        <i class="icon-arrow-left"></i>
        返回
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <h3>加载失败</h3>
      <p>{{ error }}</p>
      <button @click="loadItemDetail" class="retry-button">重试</button>
    </div>

    <!-- 主要内容 -->
    <div v-else-if="item" class="claim-content">
      <!-- 失物信息卡片 -->
      <div class="item-info-card">
        <h2 class="page-title">认领失物</h2>

        <div class="item-summary">
          <div class="item-image" v-if="item.imageUrl">
            <img :src="item.imageUrl" :alt="item.name" />
          </div>
          <div class="item-basic-info">
            <h3>{{ item.name }}</h3>
            <p class="item-type">类型：{{ getItemTypeName(item.type) }}</p>
            <p class="item-location">拾取地点：{{ getBuildingName(item.foundLocation) }}</p>
            <p class="item-date">拾取时间：{{ formatDate(item.foundTime) }}</p>
          </div>
        </div>
      </div>

      <!-- 认领表单 -->
      <div class="claim-form-card">
        <h3>认领信息</h3>
        <form @submit.prevent="submitClaim" class="claim-form">
          <div class="form-group">
            <label for="claimerName">姓名 *</label>
            <input
              id="claimerName"
              v-model="claimForm.claimerName"
              type="text"
              placeholder="请输入您的姓名"
              required
              :disabled="submitting"
            />
          </div>

          <div class="form-group">
            <label for="claimerPhone">联系电话 *</label>
            <input
              id="claimerPhone"
              v-model="claimForm.claimerPhone"
              type="tel"
              placeholder="请输入您的联系电话"
              required
              :disabled="submitting"
            />
          </div>

          <div class="form-group">
            <label for="claimerStudentId">学号</label>
            <input
              id="claimerStudentId"
              v-model="claimForm.claimerStudentId"
              type="text"
              placeholder="请输入您的学号（可选）"
              :disabled="submitting"
            />
          </div>

          <div class="form-group">
            <label for="description">物品描述 *</label>
            <textarea
              id="description"
              v-model="claimForm.description"
              placeholder="请详细描述该物品的特征，以便核实身份"
              rows="4"
              required
              :disabled="submitting"
            ></textarea>
            <small class="form-hint">请描述物品的详细特征、购买时间、使用情况等信息</small>
          </div>

          <div class="form-group">
            <label for="lossTime">丢失时间</label>
            <input
              id="lossTime"
              v-model="claimForm.lossTime"
              type="datetime-local"
              :disabled="submitting"
            />
          </div>

          <div class="form-group">
            <label for="lossLocation">丢失地点</label>
            <input
              id="lossLocation"
              v-model="claimForm.lossLocation"
              type="text"
              placeholder="请输入丢失地点"
              :disabled="submitting"
            />
          </div>

          <div class="form-actions">
            <button type="button" @click="goBack" class="cancel-button" :disabled="submitting">
              取消
            </button>
            <button type="submit" class="submit-button" :disabled="submitting || !isFormValid">
              <span v-if="submitting" class="loading-text">
                <i class="loading-icon"></i>
                提交中...
              </span>
              <span v-else>提交认领申请</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 成功提示模态框 -->
    <div v-if="showSuccessModal" class="modal-overlay" @click="closeSuccessModal">
      <div class="modal-content" @click.stop>
        <div class="success-icon">✅</div>
        <h3>认领申请已提交</h3>
        <p>您的认领申请已成功提交，失物管理员将会尽快处理。</p>
        <p>请保持电话畅通，管理员可能会联系您核实信息。</p>
        <div class="modal-actions">
          <button @click="closeSuccessModal" class="primary-button">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LostItemAPI } from '@/api/lostItem'
import { getItemTypeName, getBuildingName } from '@/constants/enums'

export default {
  name: 'ClaimItemView',
  setup() {
    const route = useRoute()
    const router = useRouter()

    // 响应式数据
    const loading = ref(true)
    const error = ref('')
    const item = ref(null)
    const submitting = ref(false)
    const showSuccessModal = ref(false)

    // 认领表单数据
    const claimForm = ref({
      claimerName: '',
      claimerPhone: '',
      claimerStudentId: '',
      description: '',
      lossTime: '',
      lossLocation: ''
    })

    // 计算属性
    const isFormValid = computed(() => {
      return claimForm.value.claimerName.trim() &&
             claimForm.value.claimerPhone.trim() &&
             claimForm.value.description.trim()
    })

    // 方法
    const loadItemDetail = async () => {
      try {
        loading.value = true
        error.value = ''

        const itemId = route.params.id
        if (!itemId) {
          throw new Error('缺少物品ID')
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

    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const submitClaim = async () => {
      if (!isFormValid.value) return

      try {
        submitting.value = true

        const itemId = route.params.id
        const claimData = {
          lostItemId: parseInt(itemId),
          claimerStudentId: claimForm.value.claimerStudentId,
          claimerName: claimForm.value.claimerName,
          claimerPhone: claimForm.value.claimerPhone
        }

        await LostItemAPI.claimLostItem(claimData)
        showSuccessModal.value = true
      } catch (err) {
        console.error('提交认领申请失败:', err)
        alert(err.message || '提交认领申请失败，请稍后重试')
      } finally {
        submitting.value = false
      }
    }

    const closeSuccessModal = () => {
      showSuccessModal.value = false
      router.push('/')
    }

    const goBack = () => {
      router.back()
    }

    // 生命周期
    onMounted(() => {
      loadItemDetail()
    })

    return {
      loading,
      error,
      item,
      submitting,
      showSuccessModal,
      claimForm,
      isFormValid,
      loadItemDetail,
      formatDate,
      submitClaim,
      closeSuccessModal,
      goBack,
      getItemTypeName,
      getBuildingName
    }
  }
}
</script>

<style scoped>
.claim-item-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.back-button-container {
  margin-bottom: 20px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 8px;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.retry-button {
  padding: 10px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 16px;
  transition: background 0.3s ease;
}

.retry-button:hover {
  background: #5a6fd8;
}

.claim-content {
  max-width: 800px;
  margin: 0 auto;
}

.item-info-card,
.claim-form-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.item-summary {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.item-image {
  flex-shrink: 0;
  width: 120px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  background: #f5f5f5;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-basic-info {
  flex: 1;
}

.item-basic-info h3 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.item-basic-info p {
  margin: 8px 0;
  color: #666;
  font-size: 14px;
}

.claim-form-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-group input:disabled,
.form-group textarea:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.form-hint {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #999;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 32px;
}

.cancel-button,
.submit-button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-button {
  background: #f5f5f5;
  color: #666;
}

.cancel-button:hover:not(:disabled) {
  background: #e9e9e9;
}

.submit-button {
  background: #667eea;
  color: white;
}

.submit-button:hover:not(:disabled) {
  background: #5a6fd8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.submit-button:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

.loading-icon {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.success-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.modal-content h3 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.modal-content p {
  color: #666;
  line-height: 1.5;
  margin-bottom: 12px;
}

.modal-actions {
  margin-top: 24px;
}

.primary-button {
  padding: 12px 32px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.primary-button:hover {
  background: #5a6fd8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .claim-item-container {
    padding: 16px;
  }

  .item-summary {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .item-image {
    width: 100px;
    height: 100px;
  }

  .form-actions {
    flex-direction: column;
  }

  .cancel-button,
  .submit-button {
    width: 100%;
  }

  .modal-content {
    margin: 20px;
    padding: 24px;
  }
}

@media (max-width: 480px) {
  .item-info-card,
  .claim-form-card {
    padding: 16px;
  }

  .page-title {
    font-size: 20px;
  }

  .item-basic-info h3 {
    font-size: 18px;
  }
}
</style>
