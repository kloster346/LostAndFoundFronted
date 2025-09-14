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
          <!-- 姓名 -->
          <div class="form-group">
            <label for="claimerName" class="form-label">
              <span class="required">*</span>
              姓名
            </label>
            <input
              id="claimerName"
              v-model="claimForm.claimerName"
              type="text"
              class="form-input"
              :class="{ 'error': errors.claimerName }"
              placeholder="请输入您的真实姓名"
              maxlength="20"
              :disabled="submitting"
            />
            <div v-if="errors.claimerName" class="error-message">
              {{ errors.claimerName }}
            </div>
          </div>

          <!-- 联系方式 -->
          <div class="form-group">
            <label for="contactInfo" class="form-label">
              <span class="required">*</span>
              联系方式
            </label>
            <input
              id="contactInfo"
              v-model="claimForm.contactInfo"
              type="text"
              class="form-input"
              :class="{ 'error': errors.contactInfo }"
              placeholder="请输入手机号码或微信号"
              maxlength="50"
              :disabled="submitting"
            />
            <div v-if="errors.contactInfo" class="error-message">
              {{ errors.contactInfo }}
            </div>
          </div>

          <!-- 学号 -->
          <div class="form-group">
            <label for="studentId" class="form-label">
              <span class="required">*</span>
              学号
            </label>
            <input
              id="studentId"
              v-model="claimForm.studentId"
              type="text"
              class="form-input"
              :class="{ 'error': errors.studentId }"
              placeholder="请输入您的学号"
              maxlength="20"
              :disabled="submitting"
            />
            <div v-if="errors.studentId" class="error-message">
              {{ errors.studentId }}
            </div>
          </div>

          <!-- 领取说明 -->
          <div class="form-group">
            <label for="claimDescription" class="form-label">
              <span class="required">*</span>
              领取说明
            </label>
            <textarea
              id="claimDescription"
              v-model="claimForm.claimDescription"
              class="form-textarea"
              :class="{ 'error': errors.claimDescription }"
              placeholder="请详细描述失物的特征、丢失时间地点等信息，以便我们核实失物归属"
              rows="4"
              maxlength="500"
              :disabled="submitting"
            ></textarea>
            <div class="char-count">
              {{ claimForm.claimDescription.length }}/500
            </div>
            <div v-if="errors.claimDescription" class="error-message">
              {{ errors.claimDescription }}
            </div>
          </div>

          <div class="form-group" style="display: none;">
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
        <div class="success-icon">✓</div>
        <h3>认领申请提交成功！</h3>
        <div class="success-info">
          <p class="success-message">您的认领申请已成功提交，请耐心等待管理员审核。</p>
          <div class="contact-info">
            <h4>后续流程：</h4>
            <ul>
              <li>管理员将在1-2个工作日内审核您的申请</li>
              <li>审核通过后，我们会通过 <strong>{{ claimForm.contactInfo }}</strong> 联系您</li>
              <li>请保持联系方式畅通，并准备好相关证明材料</li>
            </ul>
          </div>
          <div class="reminder">
            <p><strong>温馨提示：</strong>如有疑问，请联系失物招领处</p>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="goBack" class="btn btn-secondary">返回列表</button>
          <button @click="closeSuccessModal" class="btn btn-primary">继续浏览</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { claimLostItem, getLostItemById } from '@/api/lostItem'
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
      contactInfo: '',
      studentId: '',
      claimDescription: '',
      lossTime: '',
      lossLocation: ''
    })

    // 表单错误
    const errors = ref({
      claimerName: '',
      contactInfo: '',
      studentId: '',
      claimDescription: ''
    })

    // 计算属性
    const isFormValid = computed(() => {
      return claimForm.value.claimerName.trim() &&
             claimForm.value.contactInfo.trim() &&
             claimForm.value.studentId.trim() &&
             claimForm.value.claimDescription.trim()
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

        const response = await getLostItemById(parseInt(itemId))
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

    // 表单验证
    const validateForm = () => {
      // 清空之前的错误
      Object.keys(errors.value).forEach(key => {
        errors.value[key] = ''
      })

      let isValid = true

      // 验证姓名
      if (!claimForm.value.claimerName.trim()) {
        errors.value.claimerName = '请输入姓名'
        isValid = false
      } else if (claimForm.value.claimerName.trim().length < 2) {
        errors.value.claimerName = '姓名至少需要2个字符'
        isValid = false
      }

      // 验证联系方式
      if (!claimForm.value.contactInfo.trim()) {
        errors.value.contactInfo = '请输入联系方式'
        isValid = false
      } else {
        const contactInfo = claimForm.value.contactInfo.trim()
        // 简单的手机号验证
        const phoneRegex = /^1[3-9]\d{9}$/
        // 微信号验证（字母数字下划线，6-20位）
        const wechatRegex = /^[a-zA-Z][a-zA-Z0-9_]{5,19}$/
        
        if (!phoneRegex.test(contactInfo) && !wechatRegex.test(contactInfo)) {
          errors.value.contactInfo = '请输入有效的手机号码或微信号'
          isValid = false
        }
      }

      // 验证学号
      if (!claimForm.value.studentId.trim()) {
        errors.value.studentId = '请输入学号'
        isValid = false
      } else if (!/^\d{15}$/.test(claimForm.value.studentId.trim())) {
        errors.value.studentId = '学号应为15位数字'
        isValid = false
      }

      // 验证领取说明
      if (!claimForm.value.claimDescription.trim()) {
        errors.value.claimDescription = '请输入领取说明'
        isValid = false
      } else if (claimForm.value.claimDescription.trim().length < 10) {
        errors.value.claimDescription = '领取说明至少需要10个字符'
        isValid = false
      }

      return isValid
    }

    const submitClaim = async () => {
      if (!validateForm()) {
        return
      }

      submitting.value = true
      error.value = null

      try {
        const itemId = parseInt(route.params.id)
        const claimData = {
          claimerName: claimForm.value.claimerName,
          contactInfo: claimForm.value.contactInfo,
          studentId: claimForm.value.studentId,
          claimDescription: claimForm.value.claimDescription
        }

        await claimLostItem(itemId, claimData)
        showSuccessModal.value = true
      } catch (err) {
        console.error('提交认领失败:', err)
        error.value = err.message || '提交失败，请稍后重试'
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
      errors,
      isFormValid,
      loadItemDetail,
      formatDate,
      validateForm,
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

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.required {
  color: #e74c3c;
  margin-right: 4px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-input.error,
.form-textarea.error {
  border-color: #e74c3c;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.error-message {
  color: #e74c3c;
  font-size: 12px;
  margin-top: 4px;
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
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-height: 80vh;
  overflow-y: auto;
}

.success-icon {
  font-size: 48px;
  color: #28a745;
  margin-bottom: 20px;
  display: block;
}

.modal-content h3 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
}

.success-info {
  text-align: left;
  margin-bottom: 25px;
}

.success-message {
  color: #666;
  line-height: 1.5;
  margin-bottom: 20px;
  text-align: center;
}

.contact-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
}

.contact-info h4 {
  color: #333;
  margin-bottom: 10px;
  font-size: 16px;
}

.contact-info ul {
  margin: 0;
  padding-left: 20px;
}

.contact-info li {
  color: #666;
  margin-bottom: 8px;
  line-height: 1.4;
}

.reminder {
  background: #e3f2fd;
  padding: 12px;
  border-radius: 6px;
  border-left: 4px solid #2196f3;
}

.reminder p {
  margin: 0;
  color: #1976d2;
  font-size: 14px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 25px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  min-width: 100px;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
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
