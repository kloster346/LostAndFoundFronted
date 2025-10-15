import request from './index.js'
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
   * 获取用户个人信息
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
   * 用户注册
   * @param {Object} data - 注册数据
   * @param {string} data.studentId - 学号
   * @param {string} data.username - 用户名
   * @param {string} data.password - 密码
   * @param {string} [data.phone] - 手机号（可选）
   * @param {string} [data.college] - 学院（可选）
   * @returns {Promise<Object>} 注册结果
   */
  static async register(data) {
    try {
      const response = await request.post(API_ENDPOINTS.USER.REGISTER, data)
      return response
    } catch (error) {
      console.error('用户注册失败:', error)
      throw error
    }
  }

  /**
   * 检查用户名是否存在
   * @param {string} username - 用户名
   * @returns {Promise<Object>} 检查结果
   */
  static async checkUsername(username) {
    try {
      const response = await request.get(`${API_ENDPOINTS.USER.CHECK_USERNAME}/${username}`)
      return response
    } catch (error) {
      console.error('检查用户名失败:', error)
      throw error
    }
  }

  /**
   * 检查学号是否存在
   * @param {string} studentId - 学号
   * @returns {Promise<Object>} 检查结果
  /**
   * 检查学号是否已存在
   * @param {string} studentId - 学号
   * @returns {Promise} 检查结果
   */
  static async checkStudentId(studentId) {
    try {
      const response = await request.get(`${API_ENDPOINTS.USER.CHECK_STUDENT_ID}/${studentId}`)
      return response
    } catch (error) {
      console.error('检查学号失败:', error)
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

  /**
   * 获取用户统计信息（基于失物数据推导）
   * 注意：由于后端没有专门的用户列表接口，这里通过失物数据来推导用户信息
   * @returns {Promise<Object>} 用户统计信息
   */
  static async getUserStats() {
    try {
      // 通过获取所有失物来推导用户统计
      const lostItemsResponse = await request.get(API_ENDPOINTS.LOST_ITEMS.ALL)
      const lostItems = lostItemsResponse.data || []

      // 统计活跃用户（有领取记录的用户）
      const activeUsers = new Set()
      lostItems.forEach(item => {
        if (item.claimerName) {
          activeUsers.add(item.claimerName)
        }
      })

      return {
        totalActiveUsers: activeUsers.size,
        totalClaims: lostItems.filter(item => item.claimerName).length,
        recentActiveUsers: Array.from(activeUsers).slice(0, 10), // 最近活跃的10个用户
      }
    } catch (error) {
      console.error('获取用户统计信息失败:', error)
      throw error
    }
  }
}

// 获取所有用户（管理员功能）
const getAllUsers = async (params = {}) => {
  try {
    const { page = 1, size = 10, keyword } = params
    const queryParams = {
      page,
      size,
      ...(keyword && { keyword }),
    }

    const response = await request.get(API_ENDPOINTS.USERS.ALL, { params: queryParams })

    // 转换后端分页格式为前端期望格式
    return {
      data: response.data?.content || response.data || [],
      total: response.data?.totalElements || response.total || 0,
      current: response.data?.number ? response.data.number + 1 : page,
      size: response.data?.size || size,
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    throw error
  }
}

// 导出便捷方法
export const {
  login: userLogin,
  getUserProfile,
  updateUserProfile,
  isLoggedIn: isUserLoggedIn,
  getCurrentUser,
  logout: userLogout,
  getUserStats,
} = UserAPI

// 导出新增方法
export { getAllUsers }

// 默认导出
export default UserAPI
