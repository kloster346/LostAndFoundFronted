<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1 class="login-title">校园失物招领系统</h1>
        <p class="login-subtitle">请选择您的身份并登录</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <!-- 角色选择 -->
        <div class="form-group">
          <label for="role" class="form-label">登录身份</label>
          <select
            id="role"
            v-model="loginForm.role"
            class="form-select"
            :disabled="loading"
          >
            <option value="" disabled>请选择登录身份</option>
            <option
              v-for="(name, role) in USER_ROLE_NAMES"
              :key="role"
              :value="role"
            >
              {{ name }}
            </option>
          </select>
        </div>

        <!-- 用户名输入 -->
        <div class="form-group">
          <label for="username" class="form-label">用户名</label>
          <input
            id="username"
            v-model="loginForm.username"
            type="text"
            class="form-input"
            placeholder="请输入用户名"
            :disabled="loading"
            required
          />
        </div>

        <!-- 密码输入 -->
        <div class="form-group">
          <label for="password" class="form-label">密码</label>
          <input
            id="password"
            v-model="loginForm.password"
            type="password"
            class="form-input"
            placeholder="请输入密码"
            :disabled="loading"
            required
          />
        </div>

        <!-- 错误信息显示 -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <!-- 登录按钮 -->
        <button
          type="submit"
          class="login-button"
          :disabled="loading || !isFormValid"
        >
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>

      <div class="login-footer">
        <p class="footer-text">请使用您的账号密码登录系统</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth.js'
import { USER_ROLES, USER_ROLE_NAMES } from '../../constants/enums.js'

// 路由和状态管理
const router = useRouter()
const authStore = useAuthStore()

// 表单数据
const loginForm = ref({
  role: '',
  username: '',
  password: ''
})

// 状态管理
const loading = ref(false)
const errorMessage = ref('')

// 计算属性
const isFormValid = computed(() => {
  return loginForm.value.role &&
         loginForm.value.username.trim() &&
         loginForm.value.password.trim()
})

// 清除错误信息
const clearError = () => {
  errorMessage.value = ''
}

// 处理登录
const handleLogin = async () => {
  if (!isFormValid.value) {
    errorMessage.value = '请填写完整的登录信息'
    return
  }

  loading.value = true
  clearError()

  try {
    const loginData = {
      username: loginForm.value.username.trim(),
      password: loginForm.value.password.trim()
    }

    const role = loginForm.value.role

    // 使用认证store的loginByRole方法进行登录
    const response = await authStore.loginByRole(loginData, role)

    // 登录成功，根据角色跳转到不同页面
    if (response && response.data) {
      const redirectPath = getRedirectPath(role)
      await router.push(redirectPath)
    } else {
      throw new Error('登录响应数据无效')
    }
  } catch (error) {
    console.error('登录失败:', error)

    // 处理不同类型的错误
    if (error.response) {
      const status = error.response.status
      switch (status) {
        case 401:
          errorMessage.value = '用户名或密码错误'
          break
        case 403:
          errorMessage.value = '账号被禁用，请联系管理员'
          break
        case 404:
          errorMessage.value = '用户不存在'
          break
        case 500:
          errorMessage.value = '服务器错误，请稍后重试'
          break
        default:
          errorMessage.value = error.response.data?.message || '登录失败，请重试'
      }
    } else if (error.message) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = '网络错误，请检查网络连接'
    }
  } finally {
    loading.value = false
  }
}

// 根据角色获取重定向路径
const getRedirectPath = (role) => {
  switch (role) {
    case USER_ROLES.NORMAL_USER:
      return '/'
    case USER_ROLES.LOST_ITEM_ADMIN:
      return '/admin/items'
    case USER_ROLES.SUPER_ADMIN:
      return '/admin/dashboard'
    default:
      return '/'
  }
}

// 监听表单变化，清除错误信息
const watchFormChange = () => {
  if (errorMessage.value) {
    clearError()
  }
}

// 为表单字段添加变化监听
const handleInputChange = () => {
  watchFormChange()
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.login-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.login-form {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 6px;
}

.form-input,
.form-select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input:disabled,
.form-select:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.error-message {
  background-color: #fee;
  color: #c53030;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 20px;
  border: 1px solid #fed7d7;
}

.login-button {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.login-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #e1e5e9;
}

.footer-text {
  font-size: 12px;
  color: #999;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-container {
    padding: 10px;
  }

  .login-card {
    padding: 30px 20px;
  }

  .login-title {
    font-size: 20px;
  }
}
</style>
