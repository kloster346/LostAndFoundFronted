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
   * @param {string} lostItemData.name - 物品名称
   * @param {number} lostItemData.type - 物品类型
   * @param {number} lostItemData.color - 颜色
   * @param {string} lostItemData.description - 物品描述
   * @param {number} lostItemData.building - 楼栋编号
   * @param {string} lostItemData.specificLocation - 具体位置
   * @param {Array<File>} [lostItemData.images] - 失物图片文件数组
   * @param {number} adminId - 管理员ID
   * @returns {Promise<Object>} 发布结果
   */
  static async publishLostItem(lostItemData, adminId) {
    // 参数校验
    if (!lostItemData || typeof lostItemData !== 'object') {
      throw new Error('失物信息不能为空')
    }

    if (!adminId) {
      throw new Error('管理员ID不能为空')
    }

    // 构建 FormData
    const formData = new FormData()

    // 构建 request 对象（不包含 images）
    const requestData = {
      name: lostItemData.name,
      type: lostItemData.type,
      color: lostItemData.color,
      description: lostItemData.description,
      building: lostItemData.building,
      specificLocation: lostItemData.specificLocation
    }

    // 添加 request 数据作为 JSON 字符串
    formData.append('request', JSON.stringify(requestData))

    // 添加图片文件（如果有的话）
    if (lostItemData.images && lostItemData.images.length > 0) {
      // 只取第一张图片，因为接口只支持单张图片
      formData.append('image', lostItemData.images[0])
    }

    return request.upload(`${API_ENDPOINTS.LOST_ITEMS.PUBLISH}?adminId=${adminId}`, formData)
  }

  /**
   * 领取失物
   * @param {number} itemId - 失物ID
   * @param {Object} claimData - 领取信息
   * @param {string} claimData.claimerName - 领取人姓名
   * @param {string} claimData.contactInfo - 联系方式
   * @param {string} claimData.studentId - 学号
   * @param {string} claimData.claimDescription - 领取说明
   * @returns {Promise<Object>} 领取结果
   */
  static async claimLostItem(itemId, claimData) {
    try {
      if (!itemId) {
        throw new Error('失物ID不能为空')
      }

      if (!claimData || typeof claimData !== 'object') {
        throw new Error('领取信息不能为空')
      }

      const requiredFields = ['claimerName', 'contactInfo', 'studentId', 'claimDescription']
      for (const field of requiredFields) {
        if (!claimData[field]) {
          throw new Error(`${field} 字段不能为空`)
        }
      }

      const response = await request.post(`${API_ENDPOINTS.LOST_ITEMS.CLAIM}/${itemId}`, claimData)
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
   * @param {string} [searchParams.name] - 物品名称
   * @param {string} [searchParams.type] - 失物类型
   * @param {string} [searchParams.color] - 失物颜色
   * @param {string} [searchParams.building] - 所在建筑
   * @param {number} [searchParams.page=1] - 页码
   * @param {number} [searchParams.size=10] - 每页大小
   * @returns {Promise<Object>} 搜索结果
   */
  static async searchLostItems(searchParams = {}) {
    try {
      const response = await request.get(API_ENDPOINTS.LOST_ITEMS.SEARCH, {
        params: {
          pageNum: searchParams.page || 1,
          pageSize: searchParams.size || 10,
          name: searchParams.name,
          type: searchParams.type,
          color: searchParams.color,
          building: searchParams.building
        }
      })

      // 转换后端分页格式为前端期望格式
      const backendData = response.data
      return {
        items: backendData.records || [],
        currentPage: backendData.current || 1,
        pageSize: backendData.size || 10,
        total: backendData.total || 0,
        totalPages: backendData.pages || 0
      }
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
          pageNum: pageParams.page || 1,
          pageSize: pageParams.size || 10
        }
      })

      // 转换后端分页格式为前端期望格式
      const backendData = response.data
      return {
        items: backendData.records || [],
        currentPage: backendData.current || 1,
        pageSize: backendData.size || 10,
        total: backendData.total || 0,
        totalPages: backendData.pages || 0
      }
    } catch (error) {
      console.error('获取未领取失物列表失败:', error)
      throw error
    }
  }

  /**
   * 获取所有失物（用于统计和管理）
   * @param {Object} params - 查询参数
   * @param {number} [params.page] - 页码
   * @param {number} [params.size] - 每页大小
   * @param {boolean} [params.all=false] - 是否获取全部数据（不分页）
   * @returns {Promise<Object|Array>} 失物列表
   */
  static async getAllLostItems(params = {}) {
    try {
      if (params.all) {
        // 获取全部数据用于统计
        const response = await request.get(API_ENDPOINTS.LOST_ITEMS.ALL)
        return response.data || []
      } else {
        // 分页获取
        const response = await request.get(API_ENDPOINTS.LOST_ITEMS.ALL, {
          params: {
            pageNum: params.page || 1,
            pageSize: params.size || 10
          }
        })
        
        // 转换后端分页格式为前端期望格式
        const backendData = response.data
        return {
          items: backendData.records || [],
          currentPage: backendData.current || 1,
          pageSize: backendData.size || 10,
          total: backendData.total || 0,
          totalPages: backendData.pages || 0
        }
      }
    } catch (error) {
      console.error('获取所有失物失败:', error)
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
          pageNum: pageParams.page || 1,
          pageSize: pageParams.size || 10
        }
      })

      // 转换后端分页格式为前端期望格式
      const backendData = response.data
      return {
        items: backendData.records || [],
        currentPage: backendData.current || 1,
        pageSize: backendData.size || 10,
        total: backendData.total || 0,
        totalPages: backendData.pages || 0
      }
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
  getAllLostItems,
  getAllUnclaimedItems,
  getAdminLostItems
} = LostItemAPI
