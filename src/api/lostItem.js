import request, { upload } from './index.js'
import { API_ENDPOINTS } from '../constants/api.js'

/**
 * 数据转换辅助函数
 * 将后端返回的数据格式转换为前端期望的格式
 */
function transformLostItemData(backendItem) {
  if (!backendItem || typeof backendItem !== 'object') {
    return backendItem
  }

  return {
    // 基本信息字段映射
    id: backendItem.id,
    name: backendItem.name || backendItem.itemName,
    type: backendItem.type || backendItem.itemType,
    color: backendItem.color,
    description: backendItem.description,

    // 地点字段映射
    building: backendItem.building,
    location: backendItem.specificLocation || backendItem.location,

    // 时间字段映射
    foundTime: backendItem.foundTime || backendItem.createdAt,
    createdAt: backendItem.createdAt,
    updatedAt: backendItem.updatedAt,

    // 状态转换：将后端的 isClaimed (boolean) 转换为前端的 claimStatus (string)
    claimStatus: backendItem.isClaimed ? 'claimed' : 'unclaimed',
    isClaimed: backendItem.isClaimed,

    // 管理员信息
    adminId: backendItem.adminId,
    adminName: backendItem.adminName,

    // 领取信息
    claimerName: backendItem.claimerName,
    claimerPhone: backendItem.claimerPhone,
    claimerStudentId: backendItem.claimerStudentId,
    claimTime: backendItem.claimTime,

    // 图片信息
    imageUrl: backendItem.imageUrl,
    images: backendItem.images || (backendItem.imageUrl ? [backendItem.imageUrl] : []),

    // 保留其他可能的字段
    ...Object.keys(backendItem).reduce((acc, key) => {
      if (
        ![
          'id',
          'name',
          'itemName',
          'type',
          'itemType',
          'color',
          'description',
          'building',
          'specificLocation',
          'location',
          'foundTime',
          'createdAt',
          'updatedAt',
          'isClaimed',
          'adminId',
          'adminName',
          'claimerName',
          'claimerPhone',
          'claimerStudentId',
          'claimTime',
          'imageUrl',
          'images',
        ].includes(key)
      ) {
        acc[key] = backendItem[key]
      }
      return acc
    }, {}),
  }
}

/**
 * 转换失物列表数据
 * @param {Array} items - 后端返回的失物列表
 * @returns {Array} 转换后的失物列表
 */
function transformLostItemList(items) {
  if (!Array.isArray(items)) {
    return []
  }
  return items.map(transformLostItemData)
}

/**
 * 失物相关API服务类
 * 提供失物发布、搜索、领取、删除等功能
 */
class LostItemAPI {
  /**
   * 发布失物
   * @param {Object} lostItemData - 失物信息
   * @param {string} lostItemData.itemName - 物品名称
   * @param {string} lostItemData.itemType - 物品类型
   * @param {string} lostItemData.color - 颜色
   * @param {string} lostItemData.description - 物品描述
   * @param {string} lostItemData.building - 楼栋编号
   * @param {string} lostItemData.location - 具体位置
   * @param {Array<File>} [lostItemData.images] - 失物图片文件数组
   * @param {number} lostItemData.adminId - 管理员ID
   * @returns {Promise<Object>} 发布结果
   */
  static async publishLostItem(lostItemData) {
    // 参数校验
    if (!lostItemData || typeof lostItemData !== 'object') {
      throw new Error('失物信息不能为空')
    }

    if (!lostItemData.adminId) {
      throw new Error('管理员ID不能为空')
    }

    // 构建 FormData（直接添加字段，不使用JSON包装）
    const formData = new FormData()

    // 添加必填字段
    formData.append('adminId', lostItemData.adminId)
    formData.append('name', lostItemData.itemName)
    formData.append('type', lostItemData.itemType)
    formData.append('building', lostItemData.building)
    formData.append('specificLocation', lostItemData.location)

    // 添加可选字段
    if (lostItemData.color) {
      formData.append('color', lostItemData.color)
    }
    if (lostItemData.description) {
      formData.append('description', lostItemData.description)
    }

    // 添加图片文件（如果有的话）
    if (lostItemData.images && lostItemData.images.length > 0) {
      // 只取第一张图片，因为接口只支持单张图片
      formData.append('image', lostItemData.images[0])
    }

    return upload(API_ENDPOINTS.LOST_ITEMS.PUBLISH, formData)
  }

  /**
   * 领取失物
   * @param {number} itemId - 失物ID
   * @param {Object} claimData - 领取信息
   * @param {string} claimData.claimerName - 领取人姓名
   * @param {string} claimData.claimerPhone - 联系电话
   * @param {string} claimData.claimerStudentId - 学号
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

      const requiredFields = ['claimerName', 'claimerPhone', 'claimerStudentId']
      for (const field of requiredFields) {
        if (!claimData[field]) {
          throw new Error(`${field} 字段不能为空`)
        }
      }

      // 构建符合后端API的请求体
      const requestBody = {
        lostItemId: itemId,
        claimerName: claimData.claimerName,
        claimerPhone: claimData.claimerPhone,
        claimerStudentId: claimData.claimerStudentId,
      }

      const response = await request.post(API_ENDPOINTS.LOST_ITEMS.CLAIM, requestBody)
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
      return transformLostItemData(response.data)
    } catch (error) {
      console.error('获取失物详情失败:', error)
      throw error
    }
  }

  /**
   * 删除失物
   * @param {number} id - 失物ID
   * @param {number} adminId - 管理员ID
   * @param {boolean} isSuperAdmin - 是否为超级管理员
   * @returns {Promise<Object>} 删除结果
   */
  static async deleteLostItem(id, adminId, isSuperAdmin) {
    try {
      if (!id || typeof id !== 'number') {
        throw new Error('失物ID不能为空且必须为数字')
      }

      if (!adminId || typeof adminId !== 'number') {
        throw new Error('管理员ID不能为空且必须为数字')
      }

      const response = await request.delete(`${API_ENDPOINTS.LOST_ITEMS.DELETE}/${id}`, {
        params: {
          adminId,
          isSuperAdmin: isSuperAdmin || false,
        },
      })
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
          building: searchParams.building,
        },
      })

      // 转换后端分页格式为前端期望格式
      const backendData = response.data
      return {
        items: transformLostItemList(backendData.records || []),
        currentPage: backendData.current || 1,
        pageSize: backendData.size || 10,
        total: backendData.total || 0,
        totalPages: backendData.pages || 0,
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
          pageSize: pageParams.size || 10,
        },
      })

      // 转换后端分页格式为前端期望格式
      const backendData = response.data
      return {
        items: transformLostItemList(backendData.records || []),
        currentPage: backendData.current || 1,
        pageSize: backendData.size || 10,
        total: backendData.total || 0,
        totalPages: backendData.pages || 0,
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
        return transformLostItemList(response.data || [])
      } else {
        // 分页获取
        const response = await request.get(API_ENDPOINTS.LOST_ITEMS.ALL, {
          params: {
            pageNum: params.page || 1,
            pageSize: params.size || 10,
          },
        })

        // 转换后端分页格式为前端期望格式
        const backendData = response.data
        return {
          items: transformLostItemList(backendData.records || []),
          currentPage: backendData.current || 1,
          pageSize: backendData.size || 10,
          total: backendData.total || 0,
          totalPages: backendData.pages || 0,
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
      const params = {
        adminId,
        pageNum: pageParams.pageNum || 1,
        pageSize: pageParams.pageSize || 10,
        ...pageParams
      }

      const response = await request({
        url: API_ENDPOINTS.LOST_ITEMS.ADMIN_ITEMS.replace(':adminId', adminId),
        method: 'get',
        params
      })

      if (response.data && response.data.records) {
        response.data.records = transformLostItemList(response.data.records)
      }

      return response
    } catch (error) {
      console.error('获取管理员失物列表失败:', error)
      throw error
    }
  }

  // 获取待审核申请列表
  static async getPendingClaims(params) {
    try {
      // 自动补充 adminId（若未提供）
      const finalParams = { ...params }
      if (!finalParams.adminId) {
        try {
          const { useAuthStore } = await import('../stores/auth.js')
          const authStore = useAuthStore()
          finalParams.adminId = authStore.currentUser?.id
        } catch {
          void 0
        }
      }

      const response = await request({
        url: '/api/lost-items/pending-claims',
        method: 'get',
        params: finalParams,
      })
      return response
    } catch (error) {
      console.error('获取待审核申请列表失败:', error)
      throw error
    }
  }

  // 审核申请
  static async approveClaim(data) {
    try {
      // 兼容旧动作值并转换为后端要求的枚举
      const actionMap = { approve: 'APPROVED', APPROVE: 'APPROVED', approved: 'APPROVED', reject: 'REJECTED', REJECT: 'REJECTED', rejected: 'REJECTED' }
      const finalData = { ...data, action: actionMap[data.action] || data.action }

      // 自动补充 adminId 到查询参数
      let adminId = data.adminId
      if (!adminId) {
        try {
          const { useAuthStore } = await import('../stores/auth.js')
          const authStore = useAuthStore()
          adminId = authStore.currentUser?.id
        } catch {
          void 0
        }
      }

      const response = await request({
        url: '/api/lost-items/approve-claim',
        method: 'post',
        params: { adminId },
        data: finalData,
      })
      return response
    } catch (error) {
      console.error('审核申请失败:', error)
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
  getAdminLostItems,
  getPendingClaims,
  approveClaim,
} = LostItemAPI

// 为了向后兼容，添加 getLostItems 别名
export const getLostItems = LostItemAPI.getAllLostItems
