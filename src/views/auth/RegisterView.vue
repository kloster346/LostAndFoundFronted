<template>
  <div class="register-container">
    <el-card class="register-card">
      <h2>用户注册</h2>
      <el-form :model="registerForm" :rules="rules" ref="registerFormRef">
        <!-- 学号输入框 -->
        <el-form-item prop="studentId">
          <el-input v-model="registerForm.studentId" placeholder="请输入学号" />
        </el-form-item>

        <!-- 用户名输入框 -->
        <el-form-item prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="请输入用户名"
            @blur="checkUsernameUnique"
          />
          <div
            v-if="usernameCheckResult.message"
            :class="['validation-message', usernameCheckResult.isValid ? 'success' : 'error']"
          >
            {{ usernameCheckResult.message }}
          </div>
        </el-form-item>

        <!-- 密码输入框 -->
        <el-form-item prop="password">
          <el-input type="password" v-model="registerForm.password" placeholder="请输入密码" />
        </el-form-item>

        <!-- 确认密码输入框 -->
        <el-form-item prop="confirmPassword">
          <el-input
            type="password"
            v-model="registerForm.confirmPassword"
            placeholder="请确认密码"
          />
        </el-form-item>

        <!-- 手机号输入框 -->
        <el-form-item prop="phone">
          <el-input v-model="registerForm.phone" placeholder="请输入手机号（可选）" />
        </el-form-item>

        <!-- 学院选择 -->
        <el-form-item prop="college">
          <el-select v-model="registerForm.college" placeholder="请选择学院（可选）">
            <el-option label="人工智能学院" value="人工智能学院" />
            <el-option label="物理与电子信息学院" value="物理与电子信息学院" />
            <el-option label="文学院" value="文学院" />
            <el-option label="法学院" value="法学院" />
          </el-select>
        </el-form-item>

        <!-- 注册按钮 -->
        <el-form-item>
          <el-button type="primary" @click="handleRegister" :loading="loading"> 注册 </el-button>
          <el-button @click="goToLogin">返回登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { UserAPI } from '@/api/user.js'

// 路由
const router = useRouter()

// 表单引用
const registerFormRef = ref()

// 加载状态
const loading = ref(false)

// 用户名验证结果
const usernameCheckResult = reactive({
  message: '',
  isValid: false,
})

// 表单数据
const registerForm = reactive({
  studentId: '',
  username: '',
  password: '',
  confirmPassword: '',
  phone: '',
  college: '',
})

// 表单验证规则
const rules = reactive({
  studentId: [
    { required: true, message: '学号不能为空', trigger: 'blur' },
    { pattern: /^\d{15}$/, message: '学号格式不正确', trigger: 'blur' },
  ],
  username: [
    { required: true, message: '用户名不能为空', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度必须在2-20个字符之间', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    {
      pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/,
      message: '密码必须包含字母和数字，长度8-20位',
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
  phone: [{ pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }],
})

// 确认密码验证
function validateConfirmPassword(rule, value, callback) {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 检查用户名唯一性
const checkUsernameUnique = async () => {
  if (!registerForm.username || registerForm.username.length < 2) {
    usernameCheckResult.message = ''
    usernameCheckResult.isValid = false
    return
  }

  try {
    const response = await UserAPI.checkUsername(registerForm.username)
    if (response.data) {
      usernameCheckResult.message = '用户名可用'
      usernameCheckResult.isValid = true
    } else {
      usernameCheckResult.message = '用户名已存在'
      usernameCheckResult.isValid = false
    }
  } catch (error) {
    usernameCheckResult.message = '检查用户名失败'
    usernameCheckResult.isValid = false
  }
}

// 处理注册
const handleRegister = async () => {
  try {
    // 表单验证
    const valid = await registerFormRef.value.validate()
    if (!valid) return

    loading.value = true

    // 调用注册API
    await UserAPI.register({
      studentId: registerForm.studentId,
      username: registerForm.username,
      password: registerForm.password,
      phone: registerForm.phone || null,
      college: registerForm.college || null,
    })

    ElMessage.success('注册成功！请登录')
    router.push('/login')
  } catch (error) {
    console.error('注册失败:', error)
    ElMessage.error(error.message || '注册失败，请重试')
  } finally {
    loading.value = false
  }
}

// 返回登录页面
const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-card {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.register-card h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 24px;
  font-weight: 600;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-input {
  height: 45px;
}

.el-select {
  width: 100%;
}

.el-button {
  width: 48%;
  height: 45px;
  font-size: 16px;
}

.el-button + .el-button {
  margin-left: 4%;
}

.validation-message {
  font-size: 12px;
  margin-top: 5px;
  padding-left: 5px;
}

.validation-message.success {
  color: #67c23a;
}

.validation-message.error {
  color: #f56c6c;
}
</style>
