<template>
  <div class="publish-item-container">
    <el-container>
      <el-main>
        <!-- 页面标题 -->
        <div class="header-section">
          <h1 class="page-title">发布失物</h1>
          <p class="page-subtitle">填写失物信息，帮助失主找回物品</p>
        </div>

        <!-- 发布表单 -->
        <el-card class="form-card">
          <el-form @submit.prevent="handleSubmit" :model="form" label-width="120px" class="publish-form">
            <!-- 物品基本信息 -->
            <el-row :gutter="20">
              <!-- 物品名称 -->
              <el-col :span="12">
                <el-form-item label="物品名称" required>
                  <el-input
                    v-model="form.itemName"
                    placeholder="请输入物品名称"
                    clearable
                  />
                </el-form-item>
              </el-col>

              <!-- 物品类型 -->
              <el-col :span="12">
                <el-form-item label="物品类型" required>
                  <el-select
                    v-model="form.itemType"
                    placeholder="请选择物品类型"
                    style="width: 100%"
                    clearable
                  >
                    <el-option
                      v-for="option in itemTypeOptions"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 物品颜色和发现地点 -->
            <el-row :gutter="20">
              <!-- 物品颜色 -->
              <el-col :span="12">
                <el-form-item label="物品颜色">
                  <el-select
                    v-model="form.color"
                    placeholder="请选择颜色"
                    style="width: 100%"
                    clearable
                  >
                    <el-option
                      v-for="option in colorOptions"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>

              <!-- 发现地点 -->
              <el-col :span="12">
                <el-form-item label="发现地点" required>
                  <el-input
                    v-model="form.location"
                    placeholder="请输入发现地点"
                    clearable
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 发现时间 -->
            <el-form-item label="发现时间" required>
              <el-date-picker
                v-model="form.foundTime"
                type="datetime"
                placeholder="请选择发现时间"
                style="width: 100%"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DDTHH:mm"
              />
            </el-form-item>

            <!-- 物品描述 -->
            <el-form-item label="物品描述">
              <el-input
                v-model="form.description"
                type="textarea"
                :rows="4"
                placeholder="请详细描述物品特征，有助于失主识别"
                show-word-limit
                maxlength="500"
              />
            </el-form-item>

            <!-- 物品图片上传 -->
            <el-form-item label="物品图片">
              <el-upload
                class="upload-demo"
                drag
                action="#"
                multiple
                :auto-upload="false"
                :on-change="handleImageUpload"
                :file-list="imagePreview"
                accept="image/*"
                :limit="5"
              >
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <div class="el-upload__text">
                  将图片拖到此处，或<em>点击上传</em>
                </div>
                <template #tip>
                  <div class="el-upload__tip">
                    支持 PNG, JPG, GIF 格式，单个文件不超过 10MB，最多上传 5 张
                  </div>
                </template>
              </el-upload>
            </el-form-item>

            <!-- 联系方式 -->
            <el-row :gutter="20">
              <!-- 联系人 -->
              <el-col :span="12">
                <el-form-item label="联系人" required>
                  <el-input
                    v-model="form.contactName"
                    placeholder="请输入联系人姓名"
                    clearable
                  />
                </el-form-item>
              </el-col>

              <!-- 联系电话 -->
              <el-col :span="12">
                <el-form-item label="联系电话" required>
                  <el-input
                    v-model="form.contactPhone"
                    placeholder="请输入联系电话"
                    clearable
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 提交按钮 -->
            <el-form-item class="submit-buttons">
              <el-button @click="resetForm">重置</el-button>
              <el-button 
                type="primary" 
                @click="handleSubmit"
                :loading="isSubmitting"
              >
                {{ isSubmitting ? '发布中...' : '发布失物' }}
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LostItemAPI from '@/api/lostItem'
import { ITEM_TYPES, ITEM_TYPE_NAMES, COLORS, COLOR_NAMES } from '@/constants/enums'
import { UploadFilled } from '@element-plus/icons-vue'

export default {
  name: 'PublishItemView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const isSubmitting = ref(false)
    const imagePreview = ref([])
    
    // 表单数据
    const form = reactive({
      itemName: '',
      itemType: '',
      color: '',
      location: '',
      foundTime: '',
      description: '',
      contactName: '',
      contactPhone: '',
      images: []
    })

    // 物品类型选项
    const itemTypeOptions = computed(() => {
      return Object.entries(ITEM_TYPES).map(([key, value]) => ({
        value,
        label: ITEM_TYPE_NAMES[value] || value
      }))
    })

    // 颜色选项
    const colorOptions = computed(() => {
      return Object.entries(COLORS).map(([key, value]) => ({
        value,
        label: COLOR_NAMES[value] || value
      }))
    })

    // 检查管理员权限
    const checkAdminPermission = () => {
      if (!authStore.isLoggedIn || !authStore.isAdmin) {
        router.push('/login')
        return false
      }
      return true
    }

    // 处理图片上传
    const handleImageUpload = (uploadFile, uploadFiles) => {
      const file = uploadFile.raw
      
      if (file.size > 10 * 1024 * 1024) { // 10MB限制
        ElMessage.error(`文件 ${file.name} 超过10MB限制`)
        return false
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        uploadFile.url = e.target.result
        form.images.push(file)
      }
      reader.readAsDataURL(file)
      
      return true
    }

    // 移除图片（Element Plus 上传组件自带移除功能）
    const removeImage = (uploadFile, uploadFiles) => {
      const index = form.images.findIndex(file => file.name === uploadFile.raw?.name)
      if (index > -1) {
        form.images.splice(index, 1)
      }
    }

    // 重置表单
    const resetForm = () => {
      Object.keys(form).forEach(key => {
        if (Array.isArray(form[key])) {
          form[key] = []
        } else {
          form[key] = ''
        }
      })
      imagePreview.value = []
    }

    // 提交表单
    const handleSubmit = async () => {
      if (!checkAdminPermission()) return
      
      try {
        isSubmitting.value = true
        
        // 构建提交数据
        const submitData = {
          itemName: form.itemName,
          itemType: form.itemType,
          color: form.color || null,
          location: form.location,
          foundTime: form.foundTime,
          description: form.description || null,
          contactName: form.contactName,
          contactPhone: form.contactPhone,
          images: form.images
        }
        
        // 调用API发布失物
        const response = await LostItemAPI.publishLostItem(submitData)
        
        if (response.success) {
          alert('失物发布成功！')
          resetForm()
          // 可以选择跳转到管理页面
          // router.push('/admin/my-items')
        } else {
          throw new Error(response.message || '发布失败')
        }
      } catch (error) {
        console.error('发布失物失败:', error)
        alert(error.message || '发布失败，请重试')
      } finally {
        isSubmitting.value = false
      }
    }

    // 组件挂载时检查权限
    onMounted(() => {
      checkAdminPermission()
      
      // 设置默认联系人信息（如果用户已登录）
      if (authStore.user) {
        form.contactName = authStore.user.name || ''
        form.contactPhone = authStore.user.phone || ''
      }
    })

    return {
      form,
      isSubmitting,
      imagePreview,
      itemTypeOptions,
      colorOptions,
      handleImageUpload,
      removeImage,
      resetForm,
      handleSubmit,
      UploadFilled
    }
  }
}
</script>

<style scoped>
/* 页面容器 */
.publish-item-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px 0;
}

/* 页面标题区域 */
.header-section {
  margin-bottom: 32px;
  text-align: center;
}

.page-title {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin: 0 0 8px 0;
}

.page-subtitle {
  color: #909399;
  font-size: 14px;
  margin: 0;
}

/* 表单卡片 */
.form-card {
  max-width: 800px;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 表单样式 */
.publish-form {
  padding: 20px;
}

/* 提交按钮区域 */
.submit-buttons {
  text-align: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.submit-buttons .el-button {
  margin: 0 10px;
  padding: 12px 30px;
}

/* 上传组件样式 */
.upload-demo {
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .publish-item-container {
    padding: 10px;
  }
  
  .form-card {
    margin: 0 10px;
  }
  
  .page-title {
    font-size: 24px;
  }
}
</style>