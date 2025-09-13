import { request } from './index.js'
import { API_ENDPOINTS } from '../constants/api.js'

/**
 * 用户相关API接口
 */
export class UserAPI {
  /**
   * 普通用户登录
   * @param {Object} loginData - 登录数据
   * @param {string} loginData.username - 用户名
   * @param {string} loginData.password - 密码
   * @returns {Promise<Object>} 登录结果，包含用户信息
   */
  static async login(loginData) {
    try {
      const response = await request.post(API_ENDPOINTS.USER.LOGIN, loginData)
      return response
    } catch (error) {
      console.error('用户登录失败:', error)
      throw error
    }
  }

  /**
   * 获取用户信息
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} 用户信息
   */
  static async getUserProfile(userId) {
    try {
      const response = await request.get(`${API_ENDPOINTS.USER.PROFILE}/${userId}`)
      return response
    } catch (error) {
      console.error('获取用户信息失败:', error)
      throw error
    }
  }

  /**
   * 更新用户信息
   * @param {Object} userData - 用户数据
   * @param {number} userData.id - 用户ID
   * @param {string} userData.studentId - 学号
   * @param {string} userData.username - 账号名
   * @param {string} userData.college - 学院
   * @param {string} userData.phone - 手机号
   * @param {string} [userData.password] - 密码（可选）
   * @returns {Promise<Object>} 更新结果
   */
  static async updateUserProfile(userData) {
    try {
      const response = await request.put(API_ENDPOINTS.USER.PROFILE, userData)
      return response
    } catch (error) {
      console.error('更新用户信息失败:', error)
      throw error
    }
  }

  /**
   * 验证用户登录状态
   * @returns {boolean} 是否已登录
   */
  static isLoggedIn() {
    const token = localStorage.getItem('user_token')
    const userInfo = localStorage.getItem('user_info')
    return !!(token && userInfo)
  }

  /**
   * 获取当前登录用户信息
   * @returns {Object|null} 用户信息或null
   */
  static getCurrentUser() {
    try {
      const userInfo = localStorage.getItem('user_info')
      return userInfo ? JSON.parse(userInfo) : null
    } catch (error) {
      console.error('获取当前用户信息失败:', error)
      return null
    }
  }

  /**
   * 用户登出
   */
  static logout() {
    localStorage.removeItem('user_token')
    localStorage.removeItem('user_info')
    localStorage.removeItem('user_role')
  }
}

// 导出便捷方法
export const {
  login: userLogin,
  getUserProfile,
  updateUserProfile,
  isLoggedIn: isUserLoggedIn,
  getCurrentUser,
  logout: userLogout
} = UserAPI

// 默认导出
export default UserAPI