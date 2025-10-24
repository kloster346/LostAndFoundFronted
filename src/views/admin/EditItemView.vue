<template>
  <div class="edit-item-container">
    <el-container>
      <el-main>
        <!-- 页面标题 -->
        <div class="header-section">
          <h1 class="page-title">编辑失物</h1>
          <p class="page-subtitle">修改失物信息，保持信息准确</p>
        </div>

        <!-- 编辑表单 -->
        <el-card class="form-card">
          <el-form
            ref="formRef"
            @submit.prevent="handleSubmit"
            :model="form"
            :rules="formRules"
            label-width="120px"
            class="edit-form"
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
                <el-form-item label="领取地点" prop="building" required>
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

            <!-- 发现位置（原具体位置） -->
            <el-row>
              <el-col :span="24">
                <el-form-item label="发现位置" prop="location" required>
                  <el-input
                    v-model="form.location"
                    placeholder="请输入发现位置（如房间号、楼层等）"
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

            <!-- 当前图片预览 -->
            <el-form-item label="当前图片" v-if="form.existingImageUrl">
              <el-image :src="form.existingImageUrl" fit="cover" style="width: 160px; height: 160px" />
            </el-form-item>

            <!-- 更新图片上传（可选） -->
            <el-form-item label="更新图片">
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
                <div class="el-upload__text">将新图片拖到此处，或<em>点击上传</em></div>
                <template #tip>
                  <div class="el-upload__tip">
                    支持 JPG、PNG、GIF 格式，单个文件不超过 10MB，只能上传 1 张图片
                  </div>
                </template>
              </el-upload>
            </el-form-item>

            <!-- 提交按钮 -->
            <el-form-item class="submit-buttons">
              <el-button @click="goBack">返回</el-button>
              <el-button type="primary" @click="handleSubmit" :loading="isSubmitting">
                {{ isSubmitting ? '保存中...' : '保存修改' }}
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
import { useRoute, useRouter } from 'vue-router'
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
  name: 'EditItemView',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()
    const isSubmitting = ref(false)
    const imagePreview = ref([])
    const formRef = ref(null)
    const itemId = Number(route.params.id)

    // 表单验证规则
    const formRules = {
      itemName: [
        { required: true, message: '请输入物品名称', trigger: 'blur' },
        { min: 1, max: 50, message: '物品名称长度在 1 到 50 个字符', trigger: 'blur' },
      ],
      itemType: [{ required: true, message: '请选择物品类型', trigger: 'change' }],
      color: [{ required: true, message: '请选择物品颜色', trigger: 'change' }],
      building: [{ required: true, message: '请选择领取地点', trigger: 'change' }],
      location: [
        { required: true, message: '请输入发现位置', trigger: 'blur' },
        { min: 1, max: 100, message: '发现位置长度在 1 到 100 个字符', trigger: 'blur' },
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
      existingImageUrl: '',
    })

    // 选项
    const itemTypeOptions = computed(() => {
      return Object.entries(ITEM_TYPES).map(([_key, value]) => ({
        value,
        label: ITEM_TYPE_NAMES[value] || value,
      }))
    })

    const colorOptions = computed(() => {
      return Object.entries(COLORS).map(([_key, value]) => ({
        value,
        label: COLOR_NAMES[value] || value,
      }))
    })

    const buildingOptions = computed(() => getBuildingOptions())

    // 管理员权限检查
    const checkAdminPermission = () => {
      if (!authStore.isAdmin || !authStore.currentUser?.id) {
        ElMessage.error('权限不足，请使用管理员账户登录')
        router.push('/login')
        return false
      }
      return true
    }

    // 加载失物详情
    const loadItemDetail = async () => {
      try {
        const data = await LostItemAPI.getLostItemById(itemId)
        form.itemName = data.name || ''
        form.itemType = data.type || ''
        form.color = data.color || ''
        form.building = data.building || ''
        form.location = data.location || ''
        form.description = data.description || ''
        form.existingImageUrl = data.imageUrl || ''
      } catch (error) {
        console.error('加载失物详情失败:', error)
        ElMessage.error(error.message || '加载失败')
      }
    }

    // 上传图片处理（单张）
    const handleImageUpload = (uploadFile, _uploadFiles) => {
      const file = uploadFile.raw || uploadFile
      const isValidImage = file && ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type)
      const isLt10M = file && file.size / 1024 / 1024 < 10
      if (!isValidImage) {
        ElMessage.error('仅支持 JPG/PNG/GIF 图片')
        return false
      }
      if (!isLt10M) {
        ElMessage.error('图片大小不能超过 10MB')
        return false
      }

      const reader = new FileReader()
      const uploadPreview = uploadFile
      reader.onload = e => {
        uploadPreview.url = e.target.result
        form.images = [file]
        imagePreview.value = [uploadPreview]
      }
      reader.readAsDataURL(file)
      return true
    }

    // 移除图片
    const removeImage = () => {
      form.images = []
      imagePreview.value = []
    }

    // 返回上一页
    const goBack = () => {
      router.back()
    }

    // 提交表单
    const handleSubmit = async () => {
      if (!checkAdminPermission()) return
      if (!formRef.value) return
      const valid = await formRef.value.validate().catch(() => false)
      if (!valid) {
        ElMessage.error('请检查表单填写是否正确')
        return
      }

      try {
        isSubmitting.value = true
        const submitData = {
          adminId: authStore.currentUser.id,
          itemName: form.itemName,
          itemType: form.itemType,
          color: form.color || null,
          description: form.description || null,
          building: form.building,
          location: form.location,
          images: form.images,
        }

        const response = await LostItemAPI.updateLostItem(itemId, submitData)
        if (response !== null && response !== undefined) {
          ElMessage.success('更新成功！')
          router.push('/admin/my-items')
        } else {
          throw new Error(`更新失败：响应为空 - ${JSON.stringify(response)}`)
        }
      } catch (error) {
        console.error('更新失物失败:', error)
        ElMessage.error(error.message || '更新失败，请重试')
      } finally {
        isSubmitting.value = false
      }
    }

    onMounted(async () => {
      checkAdminPermission()
      await loadItemDetail()
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
      handleSubmit,
      goBack,
      UploadFilled,
    }
  },
}
</script>

<style scoped>
.edit-item-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px 0;
}

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

.form-card {
  max-width: 800px;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.edit-form {
  padding: 20px;
}

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

.upload-demo {
  width: 100%;
}
</style>