<template>
  <div class="profile-container">
    <!-- 页面标题 -->
    <div class="profile-header">
      <h2>个人信息</h2>
      <p class="subtitle">管理您的个人资料和账户设置</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="userStore.loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- 主要内容 -->
    <div v-else-if="userStore.hasProfile" class="profile-content">
      <!-- 头像区域 -->
      <el-card class="avatar-card" shadow="hover">
        <div class="avatar-section">
          <div class="avatar-container">
            <el-avatar 
              :size="120" 
              :src="userStore.avatarUrl" 
              class="user-avatar"
            >
              <el-icon><User /></el-icon>
            </el-avatar>
            <div class="avatar-overlay" @click="handleAvatarClick">
              <el-icon><Camera /></el-icon>
              <span>更换头像</span>
            </div>
          </div>
          <div class="user-info">
            <h3>{{ userStore.displayName }}</h3>
            <p class="user-role">{{ authStore.userRoleText }}</p>
            <p class="user-id">ID: {{ userStore.basicInfo?.id }}</p>
          </div>
        </div>
        
        <!-- 隐藏的文件上传 -->
        <input 
          ref="avatarInput" 
          type="file" 
          accept="image/*" 
          style="display: none" 
          @change="handleAvatarUpload"
        />
      </el-card>

      <!-- 信息编辑区域 -->
      <el-card class="info-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>基本信息</span>
            <el-button 
              v-if="!isEditing" 
              type="primary" 
              :icon="Edit" 
              @click="startEdit"
            >
              编辑信息
            </el-button>
            <div v-else class="edit-actions">
              <el-button @click="cancelEdit">取消</el-button>
              <el-button 
                type="primary" 
                :loading="userStore.updating" 
                @click="saveProfile"
              >
                保存
              </el-button>
            </div>
          </div>
        </template>

        <el-form 
          ref="profileForm" 
          :model="profileData" 
          :rules="profileRules" 
          label-width="100px" 
          class="profile-form"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="用户名" prop="username">
                <el-input 
                  v-model="profileData.username" 
                  :disabled="!isEditing"
                  placeholder="请输入用户名"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="学号" prop="studentId">
                <el-input 
                  v-model="profileData.studentId" 
                  :disabled="!isEditing"
                  placeholder="请输入学号"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="学院" prop="college">
                <el-select 
                  v-model="profileData.college" 
                  :disabled="!isEditing"
                  placeholder="请选择学院"
                  style="width: 100%"
                >
                  <el-option 
                    v-for="college in collegeOptions" 
                    :key="college.value" 
                    :label="college.label" 
                    :value="college.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="手机号" prop="phone">
                <el-input 
                  v-model="profileData.phone" 
                  :disabled="!isEditing"
                  placeholder="请输入手机号"
                />
              </el-form-item>
            </el-col>
          </el-row>


        </el-form>
      </el-card>

      <!-- 密码修改区域 -->
      <el-card class="password-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>安全设置</span>
            <el-button 
              v-if="!isChangingPassword" 
              type="warning" 
              :icon="Lock" 
              @click="startPasswordChange"
            >
              修改密码
            </el-button>
            <div v-else class="edit-actions">
              <el-button @click="cancelPasswordChange">取消</el-button>
              <el-button 
                type="primary" 
                :loading="userStore.updating" 
                @click="changePassword"
              >
                确认修改
              </el-button>
            </div>
          </div>
        </template>

        <div v-if="!isChangingPassword" class="password-info">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="当前密码">
              <span>••••••••</span>
              <el-tag type="success" size="small" style="margin-left: 10px">
                已设置
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="最后修改">
              <span>{{ lastPasswordChange || '未知' }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <el-form 
          v-else 
          ref="passwordForm" 
          :model="passwordData" 
          :rules="passwordRules" 
          label-width="100px" 
          class="password-form"
        >
          <el-form-item label="当前密码" prop="oldPassword">
            <el-input 
              v-model="passwordData.oldPassword" 
              type="password" 
              placeholder="请输入当前密码" 
              show-password
            />
          </el-form-item>
          <el-form-item label="新密码" prop="newPassword">
            <el-input 
              v-model="passwordData.newPassword" 
              type="password" 
              placeholder="请输入新密码" 
              show-password
            />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input 
              v-model="passwordData.confirmPassword" 
              type="password" 
              placeholder="请再次输入新密码" 
              show-password
            />
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 错误状态 -->
    <div v-else class="error-container">
      <el-empty description="无法加载用户信息">
        <el-button type="primary" @click="refreshProfile">
          重新加载
        </el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ElMessage, 
  ElMessageBox,
  ElCard,
  ElButton,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElRow,
  ElCol,
  ElAvatar,
  ElIcon,
  ElTag,
  ElDescriptions,
  ElDescriptionsItem,
  ElSkeleton,
  ElEmpty
} from 'element-plus'
import { 
  User, 
  Camera, 
  Edit,
  Lock 
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user.js'
import { useAuthStore } from '@/stores/auth.js'

// ==================== 响应式数据 ====================

// Store实例
const userStore = useUserStore()
const authStore = useAuthStore()
const router = useRouter()

// 表单引用
const profileForm = ref(null)
const passwordForm = ref(null)
const avatarInput = ref(null)

// 编辑状态
const isEditing = ref(false)
const isChangingPassword = ref(false)

// 个人信息表单数据
const profileData = reactive({
  username: '',
  studentId: '',
  college: '',
  phone: ''
})

const passwordData = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 学院选项
const collegeOptions = ref([
  { label: '计算机科学与技术学院', value: 'computer' },
  { label: '电子信息工程学院', value: 'electronic' },
  { label: '机械工程学院', value: 'mechanical' },
  { label: '经济管理学院', value: 'economics' },
  { label: '外国语学院', value: 'foreign' },
  { label: '艺术设计学院', value: 'art' },
  { label: '其他', value: 'other' }
])

const lastPasswordChange = ref('2024-01-15 14:30:00')

// ==================== 表单验证规则 ====================

// 个人信息验证规则
const profileRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  studentId: [
    { required: true, message: '请输入学号', trigger: 'blur' },
    { pattern: /^\d{15}$/, message: '学号应为15位数字', trigger: 'blur' }
  ],
  college: [
    { required: true, message: '请选择学院', trigger: 'change' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],

}

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
    { 
      pattern: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/, 
      message: '密码必须包含字母和数字', 
      trigger: 'blur' 
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordData.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// ==================== 计算属性 ====================

// 原始数据备份（用于取消编辑）
const originalProfileData = computed(() => {
  if (!userStore.basicInfo) return {}
  return {
    username: userStore.basicInfo.username || '',
    studentId: userStore.basicInfo.studentId || '',
    college: userStore.basicInfo.college || '',
    phone: userStore.basicInfo.phone || ''
  }
})

// ==================== 方法定义 ====================

/**
 * 初始化用户信息
 */
const initProfile = () => {
  if (userStore.basicInfo) {
    Object.assign(profileData, originalProfileData.value)
  }
}

/**
 * 开始编辑
 */
const startEdit = () => {
  isEditing.value = true
  initProfile()
}

/**
 * 取消编辑
 */
const cancelEdit = () => {
  isEditing.value = false
  initProfile()
  profileForm.value?.clearValidate()
}

/**
 * 保存个人信息
 */
const saveProfile = async () => {
  try {
    // 表单验证
    const valid = await profileForm.value?.validate()
    if (!valid) return
    
    // 确认操作
    await ElMessageBox.confirm(
      '确定要保存修改的信息吗？',
      '确认保存',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    
    // 更新用户信息
    await userStore.updateUserProfile(profileData)
    
    // 退出编辑模式
    isEditing.value = false
    
    // 显示成功提示
    ElMessage.success('个人信息保存成功')
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error('保存失败:', error)
      ElMessage.error(error.message || '保存失败，请重试')
    }
  }
}

/**
 * 开始修改密码
 */
const startPasswordChange = () => {
  isChangingPassword.value = true
  // 清空密码表单
  Object.assign(passwordData, {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
}

/**
 * 取消修改密码
 */
const cancelPasswordChange = () => {
  isChangingPassword.value = false
  Object.assign(passwordData, {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  passwordForm.value?.clearValidate()
}

/**
 * 修改密码
 */
const changePassword = async () => {
  try {
    // 表单验证
    const valid = await passwordForm.value?.validate()
    if (!valid) return
    
    // 确认操作
    await ElMessageBox.confirm(
      '修改密码后需要重新登录，确定要继续吗？',
      '确认修改',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 修改密码
    await userStore.changePassword(passwordData)
    
    // 退出修改模式
    isChangingPassword.value = false
    
    // 跳转到登录页
    router.push('/login')
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error('修改密码失败:', error)
    }
  }
}

/**
 * 处理头像点击
 */
const handleAvatarClick = () => {
  avatarInput.value?.click()
}

/**
 * 处理头像上传
 */
const handleAvatarUpload = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  
  try {
    await userStore.uploadAvatar(file)
    // 清空input值，允许重复选择同一文件
    event.target.value = ''
  } catch (error) {
    console.error('头像上传失败:', error)
    event.target.value = ''
  }
}

/**
 * 刷新用户信息
 */
const refreshProfile = async () => {
  try {
    await userStore.fetchUserProfile(null, true)
    initProfile()
  } catch (error) {
    console.error('刷新失败:', error)
  }
}

// ==================== 生命周期 ====================

onMounted(async () => {
  try {
    // 检查用户是否已登录
    if (!authStore.isLoggedIn) {
      ElMessage.warning('请先登录')
      router.push('/login')
      return
    }
    
    // 初始化用户信息
    userStore.initUserProfile()
    
    // 如果没有详细信息，则获取
    if (!userStore.hasProfile) {
      await userStore.fetchUserProfile()
    }
    
    // 初始化表单数据
    initProfile()
    
  } catch (error) {
    console.error('初始化失败:', error)
    ElMessage.error('页面初始化失败，请刷新重试')
  }
})
</script>

<style scoped>
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.profile-header {
  margin-bottom: 24px;
  text-align: center;
}

.profile-header h2 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 28px;
  font-weight: 600;
}

.subtitle {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.loading-container {
  padding: 20px;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 头像卡片样式 */
.avatar-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.avatar-card :deep(.el-card__body) {
  padding: 30px;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 30px;
}

.avatar-container {
  position: relative;
  cursor: pointer;
}

.user-avatar {
  border: 4px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: white;
  font-size: 12px;
}

.avatar-container:hover .avatar-overlay {
  opacity: 1;
}

.avatar-container:hover .user-avatar {
  transform: scale(1.05);
}

.user-info h3 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
}

.user-role {
  margin: 0 0 4px 0;
  font-size: 14px;
  opacity: 0.9;
}

.user-id {
  margin: 0;
  font-size: 12px;
  opacity: 0.7;
}

/* 信息卡片样式 */
.info-card,
.password-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
}

.edit-actions {
  display: flex;
  gap: 8px;
}

.profile-form {
  margin-top: 20px;
}

.profile-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

.profile-form :deep(.el-input.is-disabled .el-input__inner) {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #606266;
}

/* 密码区域样式 */
.password-info {
  margin-top: 20px;
}

.password-form {
  margin-top: 20px;
  max-width: 500px;
}

/* 错误状态样式 */
.error-container {
  padding: 60px 20px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-container {
    padding: 16px;
  }
  
  .avatar-section {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
  
  .card-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .edit-actions {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .profile-content {
    gap: 16px;
  }
  
  .avatar-card :deep(.el-card__body) {
    padding: 20px;
  }
  
  .user-avatar {
    width: 80px !important;
    height: 80px !important;
  }
}
</style>