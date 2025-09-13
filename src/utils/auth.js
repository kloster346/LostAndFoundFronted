import { USER_ROLES, STORAGE_KEYS } from '@/constants/index.js'

/**
 * 认证工具类
 * 提供用户认证、权限管理相关功能
 */
export class AuthUtil {
  /**
   * 获取存储的token
   * @returns {string|null} token值
   */
  static getToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN) || sessionStorage.getItem(STORAGE_KEYS.TOKEN)
  }

  /**
   * 设置token
   * @param {string} token - token值
   * @param {boolean} remember - 是否记住登录状态
   */
  static setToken(token, remember = false) {
    if (remember) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token)
      sessionStorage.removeItem(STORAGE_KEYS.TOKEN)
    } else {
      sessionStorage.setItem(STORAGE_KEYS.TOKEN, token)
      localStorage.removeItem(STORAGE_KEYS.TOKEN)
    }
  }

  /**
   * 移除token
   */
  static removeToken() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
    sessionStorage.removeItem(STORAGE_KEYS.TOKEN)
  }

  /**
   * 检查是否已登录
   * @returns {boolean} 是否已登录
   */
  static isLoggedIn() {
    const token = this.getToken()
    return !!token && !this.isTokenExpired(token)
  }

  /**
   * 检查token是否过期
   * @param {string} token - token值
   * @returns {boolean} 是否过期
   */
  static isTokenExpired(token) {
    if (!token) return true
    
    try {
      const payload = this.parseTokenPayload(token)
      if (!payload.exp) return false // 如果没有过期时间，认为不过期
      
      const currentTime = Math.floor(Date.now() / 1000)
      return payload.exp < currentTime
    } catch (error) {
      console.error('Token解析失败:', error)
      return true
    }
  }

  /**
   * 解析token载荷
   * @param {string} token - token值
   * @returns {Object} 载荷对象
   */
  static parseTokenPayload(token) {
    if (!token) return {}
    
    try {
      const parts = token.split('.')
      if (parts.length !== 3) throw new Error('Invalid token format')
      
      const payload = parts[1]
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
      return JSON.parse(decoded)
    } catch (error) {
      console.error('Token载荷解析失败:', error)
      return {}
    }
  }

  /**
   * 获取当前用户信息
   * @returns {Object|null} 用户信息
   */
  static getCurrentUser() {
    const userInfo = localStorage.getItem(STORAGE_KEYS.USER_INFO) || 
                    sessionStorage.getItem(STORAGE_KEYS.USER_INFO)
    
    if (!userInfo) return null
    
    try {
      return JSON.parse(userInfo)
    } catch (error) {
      console.error('用户信息解析失败:', error)
      return null
    }
  }

  /**
   * 设置当前用户信息
   * @param {Object} userInfo - 用户信息
   * @param {boolean} remember - 是否持久化存储
   */
  static setCurrentUser(userInfo, remember = false) {
    const userInfoStr = JSON.stringify(userInfo)
    
    if (remember) {
      localStorage.setItem(STORAGE_KEYS.USER_INFO, userInfoStr)
      sessionStorage.removeItem(STORAGE_KEYS.USER_INFO)
    } else {
      sessionStorage.setItem(STORAGE_KEYS.USER_INFO, userInfoStr)
      localStorage.removeItem(STORAGE_KEYS.USER_INFO)
    }
  }

  /**
   * 移除当前用户信息
   */
  static removeCurrentUser() {
    localStorage.removeItem(STORAGE_KEYS.USER_INFO)
    sessionStorage.removeItem(STORAGE_KEYS.USER_INFO)
  }

  /**
   * 获取用户角色
   * @returns {string|null} 用户角色
   */
  static getUserRole() {
    const user = this.getCurrentUser()
    return user?.role || null
  }

  /**
   * 检查用户是否具有指定角色
   * @param {string} role - 角色名称
   * @returns {boolean} 是否具有该角色
   */
  static hasRole(role) {
    const userRole = this.getUserRole()
    return userRole === role
  }

  /**
   * 检查用户是否具有指定角色之一
   * @param {Array<string>} roles - 角色数组
   * @returns {boolean} 是否具有其中一个角色
   */
  static hasAnyRole(roles) {
    const userRole = this.getUserRole()
    return roles.includes(userRole)
  }

  /**
   * 检查是否为普通用户
   * @returns {boolean} 是否为普通用户
   */
  static isNormalUser() {
    return this.hasRole(USER_ROLES.NORMAL_USER)
  }

  /**
   * 检查是否为失物管理员
   * @returns {boolean} 是否为失物管理员
   */
  static isLostItemAdmin() {
    return this.hasRole(USER_ROLES.LOST_ITEM_ADMIN)
  }

  /**
   * 检查是否为总管理员
   * @returns {boolean} 是否为总管理员
   */
  static isSuperAdmin() {
    return this.hasRole(USER_ROLES.SUPER_ADMIN)
  }

  /**
   * 检查是否为管理员（失物管理员或总管理员）
   * @returns {boolean} 是否为管理员
   */
  static isAdmin() {
    return this.hasAnyRole([USER_ROLES.LOST_ITEM_ADMIN, USER_ROLES.SUPER_ADMIN])
  }

  /**
   * 检查用户权限
   * @param {string|Array<string>} permission - 权限或权限数组
   * @returns {boolean} 是否有权限
   */
  static hasPermission(permission) {
    const user = this.getCurrentUser()
    if (!user || !user.permissions) return false
    
    const permissions = Array.isArray(permission) ? permission : [permission]
    return permissions.some(perm => user.permissions.includes(perm))
  }

  /**
   * 获取用户ID
   * @returns {string|number|null} 用户ID
   */
  static getUserId() {
    const user = this.getCurrentUser()
    return user?.id || user?.userId || null
  }

  /**
   * 获取用户名
   * @returns {string|null} 用户名
   */
  static getUsername() {
    const user = this.getCurrentUser()
    return user?.username || user?.name || null
  }

  /**
   * 清除所有认证信息
   */
  static clearAuth() {
    this.removeToken()
    this.removeCurrentUser()
    
    // 清除其他可能的认证相关数据
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_LOGIN)
    sessionStorage.clear()
  }

  /**
   * 检查路由权限
   * @param {Object} route - 路由对象
   * @returns {boolean} 是否有访问权限
   */
  static canAccessRoute(route) {
    if (!route.meta) return true
    
    const { requiresAuth, roles, permissions } = route.meta
    
    // 检查是否需要登录
    if (requiresAuth && !this.isLoggedIn()) {
      return false
    }
    
    // 检查角色权限
    if (roles && roles.length > 0) {
      if (!this.hasAnyRole(roles)) {
        return false
      }
    }
    
    // 检查具体权限
    if (permissions && permissions.length > 0) {
      if (!this.hasPermission(permissions)) {
        return false
      }
    }
    
    return true
  }

  /**
   * 获取登录重定向路径
   * @returns {string} 重定向路径
   */
  static getLoginRedirectPath() {
    const role = this.getUserRole()
    
    switch (role) {
      case USER_ROLES.NORMAL_USER:
        return '/user/dashboard'
      case USER_ROLES.LOST_ITEM_ADMIN:
        return '/admin/dashboard'
      case USER_ROLES.SUPER_ADMIN:
        return '/super-admin/dashboard'
      default:
        return '/'
    }
  }

  /**
   * 刷新token
   * @param {string} refreshToken - 刷新token
   * @returns {Promise<string>} 新的访问token
   */
  static async refreshToken(refreshToken) {
    // 这里应该调用刷新token的API
    // 暂时返回Promise，具体实现需要根据后端API
    return new Promise((resolve, reject) => {
      // TODO: 实现token刷新逻辑
      reject(new Error('Token刷新功能待实现'))
    })
  }

  /**
   * 自动刷新token
   * @returns {Promise<boolean>} 是否刷新成功
   */
  static async autoRefreshToken() {
    const token = this.getToken()
    if (!token) return false
    
    try {
      const payload = this.parseTokenPayload(token)
      if (!payload.exp) return true // 没有过期时间，不需要刷新
      
      const currentTime = Math.floor(Date.now() / 1000)
      const timeUntilExpiry = payload.exp - currentTime
      
      // 如果token在5分钟内过期，尝试刷新
      if (timeUntilExpiry < 300) {
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
        if (refreshToken) {
          const newToken = await this.refreshToken(refreshToken)
          this.setToken(newToken, true)
          return true
        }
      }
      
      return true
    } catch (error) {
      console.error('自动刷新token失败:', error)
      return false
    }
  }
}

// 导出便捷方法
export const auth = {
  getToken: AuthUtil.getToken.bind(AuthUtil),
  setToken: AuthUtil.setToken.bind(AuthUtil),
  removeToken: AuthUtil.removeToken.bind(AuthUtil),
  isLoggedIn: AuthUtil.isLoggedIn.bind(AuthUtil),
  getCurrentUser: AuthUtil.getCurrentUser.bind(AuthUtil),
  setCurrentUser: AuthUtil.setCurrentUser.bind(AuthUtil),
  getUserRole: AuthUtil.getUserRole.bind(AuthUtil),
  hasRole: AuthUtil.hasRole.bind(AuthUtil),
  isAdmin: AuthUtil.isAdmin.bind(AuthUtil),
  clearAuth: AuthUtil.clearAuth.bind(AuthUtil),
  canAccessRoute: AuthUtil.canAccessRoute.bind(AuthUtil),
  getLoginRedirectPath: AuthUtil.getLoginRedirectPath.bind(AuthUtil)
}

export default AuthUtil