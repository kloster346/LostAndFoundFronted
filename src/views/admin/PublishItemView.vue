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
          <el-form
            ref="formRef"
            @submit.prevent="handleSubmit"
            :model="form"
            :rules="formRules"
            label-width="120px"
            class="publish-form"
          >
            <!-- 物品基本信息 -->
            <el-row :gutter="20">
              <!-- 物品名称 -->
              <el-col :span="12">
                <el-form-item label="物品名称" prop="itemName" required>
                  <el-input v-model="form.itemName" placeholder="请输入物品名称" clearable />
                </el-form-item>
              </el-col>

              <!-- 物品类型 -->
              <el-col :span="12">
                <el-form-item label="物品类型" prop="itemType" required>
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

            <!-- 物品颜色和楼栋选择 -->
            <el-row :gutter="20">
              <!-- 物品颜色 -->
              <el-col :span="12">
                <el-form-item label="物品颜色" prop="color" required>
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

              <!-- 楼栋选择 -->
              <el-col :span="12">
                <el-form-item label="发现楼栋" prop="building" required>
                  <el-select
                    v-model="form.building"
                    placeholder="请选择楼栋"
                    style="width: 100%"
                    clearable
                  >
                    <el-option
                      v-for="option in buildingOptions"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 具体位置 -->
            <el-row>
              <el-col :span="24">
                <el-form-item label="具体位置" prop="location" required>
                  <el-input
                    v-model="form.location"
                    placeholder="请输入具体位置（如房间号、楼层等）"
                    clearable
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 物品描述 -->
            <el-form-item label="物品描述" prop="description" required>
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
                :auto-upload="false"
                :on-change="handleImageUpload"
                :on-remove="removeImage"
                :file-list="imagePreview"
                accept="image/jpeg,image/jpg,image/png,image/gif"
                :limit="1"
              >
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <div class="el-upload__text">将图片拖到此处，或<em>点击上传</em></div>
                <template #tip>
                  <div class="el-upload__tip">
                    支持 JPG、PNG、GIF 格式，单个文件不超过 10MB，只能上传 1 张图片
                  </div>
                </template>
              </el-upload>
            </el-form-item>

            <!-- 提交按钮 -->
            <el-form-item class="submit-buttons">
              <el-button @click="resetForm">重置</el-button>
              <el-button type="primary" @click="handleSubmit" :loading="isSubmitting">
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
import {
  ITEM_TYPES,
  ITEM_TYPE_NAMES,
  COLORS,
  COLOR_NAMES,
  getBuildingOptions,
} from '@/constants/enums'
import { UploadFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'PublishItemView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const isSubmitting = ref(false)
    const imagePreview = ref([])
    const formRef = ref(null)

    // 表单验证规则
    const formRules = {
      itemName: [
        { required: true, message: '请输入物品名称', trigger: 'blur' },
        { min: 1, max: 50, message: '物品名称长度在 1 到 50 个字符', trigger: 'blur' },
      ],
      itemType: [{ required: true, message: '请选择物品类型', trigger: 'change' }],
      color: [{ required: true, message: '请选择物品颜色', trigger: 'change' }],
      building: [{ required: true, message: '请选择发现楼栋', trigger: 'change' }],
      location: [
        { required: true, message: '请输入具体位置', trigger: 'blur' },
        { min: 1, max: 100, message: '具体位置长度在 1 到 100 个字符', trigger: 'blur' },
      ],
      description: [
        { required: true, message: '请输入物品描述', trigger: 'blur' },
        { min: 1, max: 500, message: '描述长度在 1 到 500 个字符', trigger: 'blur' },
      ],
    }

    // 表单数据
    const form = reactive({
      itemName: '',
      itemType: '',
      color: '',
      building: '',
      location: '',
      description: '',
      images: [],
    })

    // 物品类型选项
    const itemTypeOptions = computed(() => {
      return Object.entries(ITEM_TYPES).map(([_key, value]) => ({
        value,
        label: ITEM_TYPE_NAMES[value] || value,
      }))
    })

    // 颜色选项
    const colorOptions = computed(() => {
      return Object.entries(COLORS).map(([_key, value]) => ({
        value,
        label: COLOR_NAMES[value] || value,
      }))
    })

    // 楼栋选项
    const buildingOptions = computed(() => {
      return getBuildingOptions()
    })

    // 检查管理员权限
    const checkAdminPermission = () => {
      if (!authStore.isLoggedIn || !authStore.isAdmin) {
        router.push('/login')
        return false
      }
      return true
    }

    // 处理图片上传（后端只支持单张图片）
    const handleImageUpload = (uploadFile, uploadFiles) => {
      const file = uploadFile.raw

      if (file.size > 10 * 1024 * 1024) {
        // 10MB限制
        ElMessage.error(`文件 ${file.name} 超过10MB限制`)
        return false
      }

      // 检查图片格式
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        ElMessage.error('只支持 JPG、PNG、GIF 格式的图片')
        return false
      }

      // 后端只支持单张图片，如果已有图片则替换
      if (uploadFiles.length > 1) {
        ElMessage.warning('只能上传一张图片，已替换之前的图片')
        // 清空之前的图片
        form.images = []
        imagePreview.value = []
      }

      const reader = new FileReader()
      reader.onload = e => {
        uploadFile.url = e.target.result
        // 只保存一张图片
        form.images = [file]
      }
      reader.readAsDataURL(file)

      return true
    }

    // 移除图片（单图片模式）
    const removeImage = (uploadFile, _uploadFiles) => {
      // 清空所有图片（因为只支持单张）
      form.images = []
      imagePreview.value = []
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
      // 重置表单验证状态
      if (formRef.value) {
        formRef.value.resetFields()
      }
    }

    // 提交表单
    const handleSubmit = async () => {
      if (!checkAdminPermission()) return

      // 表单验证
      if (!formRef.value) return
      const valid = await formRef.value.validate().catch(() => false)
      if (!valid) {
        ElMessage.error('请检查表单填写是否正确')
        return
      }

      try {
        isSubmitting.value = true

        // 检查管理员权限和ID
        if (!authStore.isAdmin || !authStore.currentUser?.id) {
          throw new Error('管理员信息无效，请重新登录')
        }

        // 构建提交数据（匹配后端LostItemRequest结构）
        const submitData = {
          adminId: authStore.currentUser.id, // 管理员ID
          itemName: form.itemName,
          itemType: form.itemType,
          color: form.color || null,
          description: form.description || null,
          building: form.building,
          location: form.location,
          images: form.images,
        }

        // 调用API发布失物
        const response = await LostItemAPI.publishLostItem(submitData)

        // 调试：打印实际响应数据
        console.log('API响应数据:', response)
        console.log('响应类型:', typeof response)
        console.log('响应键:', response ? Object.keys(response) : 'null/undefined')

        // 更宽松的成功判断：只要有响应且不是错误就认为成功
        if (response !== null && response !== undefined) {
          ElMessage.success('失物发布成功！')
          resetForm()
          // 可以选择跳转到管理页面
          // router.push('/admin/my-items')
        } else {
          throw new Error(`发布失败：响应为空 - ${JSON.stringify(response)}`)
        }
      } catch (error) {
        console.error('发布失物失败:', error)
        ElMessage.error(error.message || '发布失败，请重试')
      } finally {
        isSubmitting.value = false
      }
    }

    // 组件挂载时检查权限
    onMounted(() => {
      checkAdminPermission()
    })

    return {
      form,
      formRef,
      formRules,
      isSubmitting,
      imagePreview,
      itemTypeOptions,
      colorOptions,
      buildingOptions,
      handleImageUpload,
      removeImage,
      resetForm,
      handleSubmit,
      UploadFilled,
    }
  },
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
