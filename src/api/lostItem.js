import request from './index.js'
import { API_ENDPOINTS } from '../constants/api.js'

/**
 * 失物相关API服务类
 * 提供失物发布、搜索、领取、删除等功能
 */
class LostItemAPI {
  /**
   * 发布失物
   * @param {Object} lostItemData - 失物信息
   * @param {string} lostItemData.name - 失物名称
   * @param {string} lostItemData.type - 失物类型
   * @param {string} lostItemData.color - 失物颜色
   * @param {string} lostItemData.description - 失物描述
   * @param {string} lostItemData.foundLocation - 发现地点
   * @param {string} lostItemData.building - 所在建筑
   * @param {string} lostItemData.specificLocation - 具体位置
   * @param {string} [lostItemData.imageUrl] - 失物图片URL
   * @param {number} lostItemData.adminId - 管理员ID
   * @returns {Promise<Object>} 发布结果
   */
  static async publishLostItem(lostItemData) {
    try {
      if (!lostItemData || typeof lostItemData !== 'object') {
        throw new Error('失物信息不能为空')
      }

      const requiredFields = ['name', 'type', 'color', 'description', 'foundLocation', 'building', 'specificLocation', 'adminId']
      for (const field of requiredFields) {
        if (!lostItemData[field]) {
          throw new Error(`${field} 字段不能为空`)
        }
      }

      const response = await request.post(API_ENDPOINTS.LOST_ITEMS.PUBLISH, lostItemData)
      return response.data
    } catch (error) {
      console.error('发布失物失败:', error)
      throw error
    }
  }

  /**
   * 领取失物
   * @param {Object} claimData - 领取信息
   * @param {number} claimData.lostItemId - 失物ID
   * @param {number} claimData.studentId - 学生ID
   * @param {string} claimData.claimReason - 领取理由
   * @param {string} claimData.contactInfo - 联系方式
   * @returns {Promise<Object>} 领取结果
   */
  static async claimLostItem(claimData) {
    try {
      if (!claimData || typeof claimData !== 'object') {
        throw new Error('领取信息不能为空')
      }

      const requiredFields = ['lostItemId', 'studentId', 'claimReason', 'contactInfo']
      for (const field of requiredFields) {
        if (!claimData[field]) {
          throw new Error(`${field} 字段不能为空`)
        }
      }

      const response = await request.post(API_ENDPOINTS.LOST_ITEMS.CLAIM, claimData)
      return response.data
    } catch (error) {
      console.error('领取失物失败:', error)
      throw error
    }
  }

  /**
   * 根据ID获取失物详情
   * @param {number} id - 失物ID
   * @returns {Promise<Object>} 失物详情
   */
  static async getLostItemById(id) {
    try {
      if (!id || typeof id !== 'number') {
        throw new Error('失物ID不能为空且必须为数字')
      }

      const response = await request.get(`${API_ENDPOINTS.LOST_ITEMS.DETAIL}/${id}`)
      return response.data
    } catch (error) {
      console.error('获取失物详情失败:', error)
      throw error
    }
  }

  /**
   * 删除失物
   * @param {number} id - 失物ID
   * @returns {Promise<Object>} 删除结果
   */
  static async deleteLostItem(id) {
    try {
      if (!id || typeof id !== 'number') {
        throw new Error('失物ID不能为空且必须为数字')
      }

      const response = await request.delete(`${API_ENDPOINTS.LOST_ITEMS.DELETE}/${id}`)
      return response.data
    } catch (error) {
      console.error('删除失物失败:', error)
      throw error
    }
  }

  /**
   * 搜索失物
   * @param {Object} searchParams - 搜索参数
   * @param {string} [searchParams.keyword] - 关键词
   * @param {string} [searchParams.type] - 失物类型
   * @param {string} [searchParams.color] - 失物颜色
   * @param {string} [searchParams.building] - 所在建筑
   * @param {string} [searchParams.startDate] - 开始日期
   * @param {string} [searchParams.endDate] - 结束日期
   * @param {number} [searchParams.page=1] - 页码
   * @param {number} [searchParams.size=10] - 每页大小
   * @returns {Promise<Object>} 搜索结果
   */
  static async searchLostItems(searchParams = {}) {
    try {
      const response = await request.get(API_ENDPOINTS.LOST_ITEMS.SEARCH, {
        params: {
          page: 1,
          size: 10,
          ...searchParams
        }
      })
      return response.data
    } catch (error) {
      console.error('搜索失物失败:', error)
      throw error
    }
  }

  /**
   * 获取所有未领取的失物
   * @param {Object} pageParams - 分页参数
   * @param {number} [pageParams.page=1] - 页码
   * @param {number} [pageParams.size=10] - 每页大小
   * @returns {Promise<Object>} 未领取失物列表
   */
  static async getAllUnclaimedItems(pageParams = {}) {
    try {
      const response = await request.get(API_ENDPOINTS.LOST_ITEMS.ALL, {
        params: {
          page: 1,
          size: 10,
          ...pageParams
        }
      })
      return response.data
    } catch (error) {
      console.error('获取未领取失物列表失败:', error)
      throw error
    }
  }

  /**
   * 获取指定管理员发布的失物
   * @param {number} adminId - 管理员ID
   * @param {Object} pageParams - 分页参数
   * @param {number} [pageParams.page=1] - 页码
   * @param {number} [pageParams.size=10] - 每页大小
   * @returns {Promise<Object>} 管理员发布的失物列表
   */
  static async getAdminLostItems(adminId, pageParams = {}) {
    try {
      if (!adminId || typeof adminId !== 'number') {
        throw new Error('管理员ID不能为空且必须为数字')
      }

      const response = await request.get(`${API_ENDPOINTS.LOST_ITEMS.BY_ADMIN}/${adminId}`, {
        params: {
          page: 1,
          size: 10,
          ...pageParams
        }
      })
      return response.data
    } catch (error) {
      console.error('获取管理员失物列表失败:', error)
      throw error
    }
  }
}

// 导出类和解构的方法
export default LostItemAPI

export const {
  publishLostItem,
  claimLostItem,
  getLostItemById,
  deleteLostItem,
  searchLostItems,
  getAllUnclaimedItems,
  getAdminLostItems
} = LostItemAPI