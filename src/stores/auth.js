import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { UserAPI } from '../api/user.js'
import { AdminAPI } from '../api/admin.js'
import { USER_ROLES, STORAGE_KEYS } from '../constants/enums.js'

/**
 * 认证状态管理 Store
 * 统一管理用户登录状态、token、角色权限等
 */
export const useAuthStore = defineStore('auth', () => {
  // ==================== 状态定义 ====================
  
  // 当前用户信息
  const currentUser = ref(null)
  
  // 用户角色
  const userRole = ref(null)
  
  // 认证token
  const token = ref(null)
  
  // 登录状态
  const isLoggedIn = ref(false)
  
  // 登录加载状态
  const loginLoading = ref(false)
  
  // ==================== 计算属性 ====================
  
  // 是否为普通用户
  const isNormalUser = computed(() => {
    return userRole.value === USER_ROLES.NORMAL_USER
  })
  
  // 是否为失物管理员
  const isLostItemAdmin = computed(() => {
    return userRole.value === USER_ROLES.LOST_ITEM_ADMIN
  })
  
  // 是否为总管理员
  const isSuperAdmin = computed(() => {
    return userRole.value === USER_ROLES.SUPER_ADMIN
  })
  
  // 是否为管理员（失物管理员或总管理员）
  const isAdmin = computed(() => {
    return isLostItemAdmin.value || isSuperAdmin.value
  })
  
  // 用户显示名称
  const userDisplayName = computed(() => {
    if (!currentUser.value) return ''
    return currentUser.value.name || currentUser.value.username || '未知用户'
  })
  
  // ==================== 方法定义 ====================
  
  /**
   * 初始化认证状态
   * 从本地存储恢复登录状态
   */
  const initAuth = () => {
    try {
      // 恢复token
      const savedToken = localStorage.getItem(STORAGE_KEYS.TOKEN)
      if (savedToken) {
        token.value = savedToken
      }
      
      // 恢复用户信息
      const savedUserInfo = localStorage.getItem(STORAGE_KEYS.USER_INFO)
      if (savedUserInfo) {
        currentUser.value = JSON.parse(savedUserInfo)
      }
      
      // 恢复用户角色
      const savedUserRole = localStorage.getItem(STORAGE_KEYS.USER_ROLE)
      if (savedUserRole) {
        userRole.value = savedUserRole
      }
      
      // 检查管理员token（兼容旧版本）
      const adminToken = localStorage.getItem('admin_token')
      const adminInfo = localStorage.getItem('admin_info')
      const adminRole = localStorage.getItem('admin_role')
      
      if (adminToken && adminInfo && adminRole) {
        token.value = adminToken
        currentUser.value = JSON.parse(adminInfo)
        userRole.value = adminRole
        
        // 迁移到新的存储键
        localStorage.setItem(STORAGE_KEYS.TOKEN, adminToken)
        localStorage.setItem(STORAGE_KEYS.USER_INFO, adminInfo)
        localStorage.setItem(STORAGE_KEYS.USER_ROLE, adminRole)
        
        // 清理旧的存储键
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_info')
        localStorage.removeItem('admin_role')
      }
      
      // 更新登录状态
      isLoggedIn.value = !!(token.value && currentUser.value && userRole.value)
      
    } catch (error) {
      console.error('初始化认证状态失败:', error)
      clearAuth()
    }
  }
  
  /**
   * 保存认证信息到本地存储
   * @param {string} authToken - 认证token
   * @param {Object} userInfo - 用户信息
   * @param {string} role - 用户角色
   */
  const saveAuth = (authToken, userInfo, role) => {
    try {
      // 保存到状态
      token.value = authToken
      currentUser.value = userInfo
      userRole.value = role
      isLoggedIn.value = true
      
      // 保存到本地存储
      localStorage.setItem(STORAGE_KEYS.TOKEN, authToken)
      localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo))
      localStorage.setItem(STORAGE_KEYS.USER_ROLE, role)
      
    } catch (error) {
      console.error('保存认证信息失败:', error)
      throw error
    }
  }
  
  /**
   * 清除认证信息
   */
  const clearAuth = () => {
    // 清除状态
    token.value = null
    currentUser.value = null
    userRole.value = null
    isLoggedIn.value = false
    loginLoading.value = false
    
    // 清除本地存储
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER_INFO)
    localStorage.removeItem(STORAGE_KEYS.USER_ROLE)
    
    // 清理旧版本的存储键
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_info')
    localStorage.removeItem('admin_role')
  }
  
  /**
   * 普通用户登录
   * @param {Object} loginData - 登录数据
   * @param {string} loginData.username - 用户名
   * @param {string} loginData.password - 密码
   * @returns {Promise<Object>} 登录结果
   */
  const loginAsUser = async (loginData) => {
    try {
      loginLoading.value = true
      
      const response = await UserAPI.login(loginData)
      
      if (response && response.data) {
        const authToken = response.token || ''
        const userInfo = response.data
        const role = USER_ROLES.NORMAL_USER
        
        saveAuth(authToken, userInfo, role)
        
        return response
      } else {
        throw new Error('登录响应数据格式错误')
      }
      
    } catch (error) {
      console.error('普通用户登录失败:', error)
      throw error
    } finally {
      loginLoading.value = false
    }
  }
  
  /**
   * 失物管理员登录
   * @param {Object} loginData - 登录数据
   * @returns {Promise<Object>} 登录结果
   */
  const loginAsLostItemAdmin = async (loginData) => {
    try {
      loginLoading.value = true
      
      const response = await AdminAPI.lostItemAdminLogin(loginData)
      
      if (response && response.data) {
        const authToken = response.token || ''
        const userInfo = response.data
        const role = USER_ROLES.LOST_ITEM_ADMIN
        
        saveAuth(authToken, userInfo, role)
        
        return response
      } else {
        throw new Error('登录响应数据格式错误')
      }
      
    } catch (error) {
      console.error('失物管理员登录失败:', error)
      throw error
    } finally {
      loginLoading.value = false
    }
  }
  
  /**
   * 总管理员登录
   * @param {Object} loginData - 登录数据
   * @returns {Promise<Object>} 登录结果
   */
  const loginAsSuperAdmin = async (loginData) => {
    try {
      loginLoading.value = true
      
      const response = await AdminAPI.superAdminLogin(loginData)
      
      if (response && response.data) {
        const authToken = response.token || ''
        const userInfo = response.data
        const role = USER_ROLES.SUPER_ADMIN
        
        saveAuth(authToken, userInfo, role)
        
        return response
      } else {
        throw new Error('登录响应数据格式错误')
      }
      
    } catch (error) {
      console.error('总管理员登录失败:', error)
      throw error
    } finally {
      loginLoading.value = false
    }
  }
  
  /**
   * 根据角色登录
   * @param {Object} loginData - 登录数据
   * @param {string} role - 用户角色
   * @returns {Promise<Object>} 登录结果
   */
  const loginByRole = async (loginData, role) => {
    switch (role) {
      case USER_ROLES.NORMAL_USER:
        return await loginAsUser(loginData)
      case USER_ROLES.LOST_ITEM_ADMIN:
        return await loginAsLostItemAdmin(loginData)
      case USER_ROLES.SUPER_ADMIN:
        return await loginAsSuperAdmin(loginData)
      default:
        throw new Error(`不支持的用户角色: ${role}`)
    }
  }
  
  /**
   * 登出
   */
  const logout = async () => {
    try {
      // 调用对应的API登出方法
      if (isNormalUser.value) {
        await UserAPI.logout()
      } else if (isAdmin.value) {
        await AdminAPI.logout()
      }
    } catch (error) {
      console.error('登出API调用失败:', error)
      // 即使API调用失败，也要清除本地认证信息
    } finally {
      clearAuth()
    }
  }
  
  /**
   * 刷新用户信息
   * @returns {Promise<Object>} 用户信息
   */
  const refreshUserInfo = async () => {
    try {
      if (!isLoggedIn.value || !currentUser.value) {
        throw new Error('用户未登录')
      }
      
      let response
      
      if (isNormalUser.value) {
        response = await UserAPI.getUserProfile(currentUser.value.id)
      } else if (isAdmin.value) {
        response = await AdminAPI.getLostItemAdminProfile(currentUser.value.id)
      } else {
        throw new Error('未知的用户角色')
      }
      
      if (response && response.data) {
        currentUser.value = response.data
        localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(response.data))
        return response.data
      } else {
        throw new Error('获取用户信息失败')
      }
      
    } catch (error) {
      console.error('刷新用户信息失败:', error)
      throw error
    }
  }
  
  /**
   * 检查权限
   * @param {string|Array} requiredRoles - 需要的角色（单个角色字符串或角色数组）
   * @returns {boolean} 是否有权限
   */
  const hasPermission = (requiredRoles) => {
    if (!isLoggedIn.value || !userRole.value) {
      return false
    }
    
    if (typeof requiredRoles === 'string') {
      return userRole.value === requiredRoles
    }
    
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(userRole.value)
    }
    
    return false
  }
  
  /**
   * 检查是否可以访问管理员功能
   * @returns {boolean} 是否可以访问
   */
  const canAccessAdmin = () => {
    return hasPermission([USER_ROLES.LOST_ITEM_ADMIN, USER_ROLES.SUPER_ADMIN])
  }
  
  /**
   * 检查是否可以访问超级管理员功能
   * @returns {boolean} 是否可以访问
   */
  const canAccessSuperAdmin = () => {
    return hasPermission(USER_ROLES.SUPER_ADMIN)
  }
  
  // ==================== 返回公开接口 ====================
  
  return {
    // 状态
    currentUser,
    userRole,
    token,
    isLoggedIn,
    loginLoading,
    
    // 计算属性
    isNormalUser,
    isLostItemAdmin,
    isSuperAdmin,
    isAdmin,
    userDisplayName,
    
    // 方法
    initAuth,
    saveAuth,
    clearAuth,
    loginAsUser,
    loginAsLostItemAdmin,
    loginAsSuperAdmin,
    loginByRole,
    logout,
    refreshUserInfo,
    hasPermission,
    canAccessAdmin,
    canAccessSuperAdmin
  }
})

// ==================== 便捷方法导出 ====================

/**
 * 获取认证store实例
 * @returns {Object} 认证store实例
 */
export const getAuthStore = () => {
  return useAuthStore()
}

/**
 * 检查用户是否已登录
 * @returns {boolean} 是否已登录
 */
export const checkIsLoggedIn = () => {
  const authStore = useAuthStore()
  return authStore.isLoggedIn
}

/**
 * 获取当前用户角色
 * @returns {string|null} 用户角色
 */
export const getCurrentUserRole = () => {
  const authStore = useAuthStore()
  return authStore.userRole
}

/**
 * 获取当前用户信息
 * @returns {Object|null} 用户信息
 */
export const getCurrentUserInfo = () => {
  const authStore = useAuthStore()
  return authStore.currentUser
}

/**
 * 快速权限检查
 * @param {string|Array} requiredRoles - 需要的角色
 * @returns {boolean} 是否有权限
 */
export const checkPermission = (requiredRoles) => {
  const authStore = useAuthStore()
  return authStore.hasPermission(requiredRoles)
}

export default useAuthStore