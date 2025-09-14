import request from './index.js'
import { API_ENDPOINTS } from '../constants/api.js'
import { USER_ROLES } from '../constants/enums.js'

/**
 * 管理员相关API接口
 */
export class AdminAPI {
  /**
   * 失物管理员登录
   * @param {Object} loginData - 登录数据
   * @param {string} loginData.username - 用户名
   * @param {string} loginData.password - 密码
   * @returns {Promise<Object>} 登录结果，包含管理员信息
   */
  static async lostItemAdminLogin(loginData) {
    try {
      const response = await request.post(API_ENDPOINTS.ADMIN.LOST_ITEM_LOGIN, loginData)
      // 登录成功后保存角色信息
      if (response && response.data) {
        localStorage.setItem('admin_role', USER_ROLES.LOST_ITEM_ADMIN)
        localStorage.setItem('admin_token', response.token || '')
        localStorage.setItem('admin_info', JSON.stringify(response.data))
      }
      return response
    } catch (error) {
      console.error('失物管理员登录失败:', error)
      throw error
    }
  }

  /**
   * 总管理员登录
   * @param {Object} loginData - 登录数据
   * @param {string} loginData.username - 用户名
   * @param {string} loginData.password - 密码
   * @returns {Promise<Object>} 登录结果，包含总管理员信息
   */
  static async superAdminLogin(loginData) {
    try {
      const response = await request.post(API_ENDPOINTS.ADMIN.SUPER_LOGIN, loginData)
      // 登录成功后保存角色信息
      if (response && response.data) {
        localStorage.setItem('admin_role', USER_ROLES.SUPER_ADMIN)
        localStorage.setItem('admin_token', response.token || '')
        localStorage.setItem('admin_info', JSON.stringify(response.data))
      }
      return response
    } catch (error) {
      console.error('总管理员登录失败:', error)
      throw error
    }
  }

  /**
   * 获取失物管理员信息
   * @param {number} adminId - 管理员ID
   * @returns {Promise<Object>} 管理员信息
   */
  static async getLostItemAdminProfile(adminId) {
    try {
      const response = await request.get(`${API_ENDPOINTS.ADMIN.LOST_ITEM_PROFILE}/${adminId}`)
      return response
    } catch (error) {
      console.error('获取失物管理员信息失败:', error)
      throw error
    }
  }

  /**
   * 获取所有管理员列表
   * @returns {Promise<Array>} 管理员列表
   */
  static async getAllAdmins() {
    try {
      const response = await request.get(API_ENDPOINTS.ADMIN.ALL)
      return response
    } catch (error) {
      console.error('获取管理员列表失败:', error)
      throw error
    }
  }

  /**
   * 验证管理员登录状态
   * @returns {boolean} 是否已登录
   */
  static isAdminLoggedIn() {
    const token = localStorage.getItem('admin_token')
    const adminInfo = localStorage.getItem('admin_info')
    const adminRole = localStorage.getItem('admin_role')
    return !!(token && adminInfo && adminRole)
  }

  /**
   * 获取当前登录管理员信息
   * @returns {Object|null} 管理员信息或null
   */
  static getCurrentAdmin() {
    try {
      const adminInfo = localStorage.getItem('admin_info')
      return adminInfo ? JSON.parse(adminInfo) : null
    } catch (error) {
      console.error('获取当前管理员信息失败:', error)
      return null
    }
  }

  /**
   * 获取当前管理员角色
   * @returns {string|null} 管理员角色或null
   */
  static getCurrentAdminRole() {
    return localStorage.getItem('admin_role')
  }

  /**
   * 检查是否为总管理员
   * @returns {boolean} 是否为总管理员
   */
  static isSuperAdmin() {
    return this.getCurrentAdminRole() === USER_ROLES.SUPER_ADMIN
  }

  /**
   * 检查是否为失物管理员
   * @returns {boolean} 是否为失物管理员
   */
  static isLostItemAdmin() {
    return this.getCurrentAdminRole() === USER_ROLES.LOST_ITEM_ADMIN
  }

  /**
   * 管理员登出
   */
  static logout() {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_info')
    localStorage.removeItem('admin_role')
  }

  /**
   * 根据角色类型进行登录
   * @param {Object} loginData - 登录数据
   * @param {string} loginData.username - 用户名
   * @param {string} loginData.password - 密码
   * @param {string} role - 角色类型 (LOST_ITEM_ADMIN | SUPER_ADMIN)
   * @returns {Promise<Object>} 登录结果
   */
  static async loginByRole(loginData, role) {
    switch (role) {
      case USER_ROLES.LOST_ITEM_ADMIN:
        return await this.lostItemAdminLogin(loginData)
      case USER_ROLES.SUPER_ADMIN:
        return await this.superAdminLogin(loginData)
      default:
        throw new Error(`不支持的管理员角色: ${role}`)
    }
  }
}

// 导出便捷方法
export const {
  lostItemAdminLogin,
  superAdminLogin,
  getLostItemAdminProfile,
  getAllAdmins,
  isAdminLoggedIn,
  getCurrentAdmin,
  getCurrentAdminRole,
  isSuperAdmin,
  isLostItemAdmin,
  logout: adminLogout,
  loginByRole: adminLoginByRole,
} = AdminAPI

// 默认导出
export default AdminAPI
