import { ref, computed, readonly } from 'vue'
import { defineStore } from 'pinia'
import { UserAPI } from '../api/user.js'
import { useAuthStore } from './auth.js'
import { ElMessage } from 'element-plus'

/**
 * 用户信息状态管理 Store
 * 管理用户个人信息的获取、更新、缓存等操作
 */
export const useUserStore = defineStore('user', () => {
  // ==================== 状态定义 ====================
  
  // 用户详细信息
  const userProfile = ref(null)
  
  // 加载状态
  const loading = ref(false)
  
  // 更新状态
  const updating = ref(false)
  
  // 错误信息
  const error = ref(null)
  
  // 头像上传状态

  
  // ==================== 计算属性 ====================
  
  // 用户基本信息
  const basicInfo = computed(() => {
    if (!userProfile.value) return null
    return {
      id: userProfile.value.id,
      username: userProfile.value.username,
      studentId: userProfile.value.studentId,
      college: userProfile.value.college,
      phone: userProfile.value.phone,
      email: userProfile.value.email,
      avatar: userProfile.value.avatar
    }
  })
  
  // 用户显示名称
  const displayName = computed(() => {
    if (!userProfile.value) return ''
    return userProfile.value.name || userProfile.value.username || '未知用户'
  })
  

  
  // 是否有用户信息
  const hasProfile = computed(() => {
    return !!userProfile.value
  })
  
  // ==================== 方法定义 ====================
  
  /**
   * 获取用户详细信息
   * @param {number} userId - 用户ID，不传则获取当前用户信息
   * @param {boolean} forceRefresh - 是否强制刷新
   * @returns {Promise<Object>} 用户信息
   */
  const fetchUserProfile = async (userId = null, forceRefresh = false) => {
    try {
      // 如果已有数据且不强制刷新，直接返回
      if (userProfile.value && !forceRefresh && !userId) {
        return userProfile.value
      }
      
      loading.value = true
      error.value = null
      
      // 获取当前用户ID
      const authStore = useAuthStore()
      const targetUserId = userId || authStore.currentUser?.id
      
      if (!targetUserId) {
        throw new Error('用户ID不存在')
      }
      
      const response = await UserAPI.getUserProfile(targetUserId)
      
      if (response && response.data) {
        userProfile.value = response.data
        return response.data
      } else {
        throw new Error('获取用户信息失败')
      }
      
    } catch (err) {
      console.error('获取用户信息失败:', err)
      error.value = err.message || '获取用户信息失败'
      ElMessage.error(error.value)
      throw err
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 更新用户信息
   * @param {Object} userData - 要更新的用户数据
   * @returns {Promise<Object>} 更新结果
   */
  const updateUserProfile = async (userData) => {
    try {
      updating.value = true
      error.value = null
      
      // 确保有用户ID
      const authStore = useAuthStore()
      const userId = userData.id || authStore.currentUser?.id
      
      if (!userId) {
        throw new Error('用户ID不存在')
      }
      
      // 准备更新数据
      const updateData = {
        ...userData,
        id: userId
      }
      
      const response = await UserAPI.updateUserProfile(updateData)
      
      if (response && response.data) {
        // 更新本地状态
        userProfile.value = response.data
        
        // 同步更新认证store中的用户信息
        authStore.currentUser = {
          ...authStore.currentUser,
          ...response.data
        }
        
        ElMessage.success('用户信息更新成功')
        return response.data
      } else {
        throw new Error('更新用户信息失败')
      }
      
    } catch (err) {
      console.error('更新用户信息失败:', err)
      error.value = err.message || '更新用户信息失败'
      ElMessage.error(error.value)
      throw err
    } finally {
      updating.value = false
    }
  }
  

  
  /**
   * 修改密码
   * @param {Object} passwordData - 密码数据
   * @param {string} passwordData.oldPassword - 旧密码
   * @param {string} passwordData.newPassword - 新密码
   * @param {string} passwordData.confirmPassword - 确认密码
   * @returns {Promise<void>}
   */
  const changePassword = async (passwordData) => {
    try {
      updating.value = true
      error.value = null
      
      // 验证密码
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error('新密码和确认密码不一致')
      }
      
      if (passwordData.newPassword.length < 6) {
        throw new Error('新密码长度不能少于6位')
      }
      
      // 使用updateUserProfile接口修改密码
      // 构造包含新密码的用户数据
      const userData = {
        ...userProfile.value,
        password: passwordData.newPassword
      }
      
      await UserAPI.updateUserProfile(userData)
      
      ElMessage.success('密码修改成功，请重新登录')
      
      // 修改密码后需要重新登录
      const authStore = useAuthStore()
      authStore.logout()
      
    } catch (err) {
      console.error('修改密码失败:', err)
      error.value = err.message || '修改密码失败'
      ElMessage.error(error.value)
      throw err
    } finally {
      updating.value = false
    }
  }
  
  /**
   * 清除用户信息
   */
  const clearUserProfile = () => {
    userProfile.value = null
    error.value = null
    loading.value = false
    updating.value = false
  }
  
  /**
   * 初始化用户信息
   * 从认证store同步基本信息
   */
  const initUserProfile = () => {
    const authStore = useAuthStore()
    if (authStore.currentUser && !userProfile.value) {
      userProfile.value = {
        ...authStore.currentUser
      }
    }
  }
  
  // ==================== 返回状态和方法 ====================
  
  return {
    // 状态
    userProfile: readonly(userProfile),
    loading: readonly(loading),
    updating: readonly(updating),
    error: readonly(error),
    
    // 计算属性
    basicInfo,
    displayName,

    hasProfile,
    
    // 方法
    fetchUserProfile,
    updateUserProfile,

    changePassword,
    clearUserProfile,
    initUserProfile
  }
})

// 导出便捷方法
export const {
  fetchUserProfile,
  updateUserProfile,

  changePassword
} = useUserStore()