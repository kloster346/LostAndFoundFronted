import request from './index.js'
import { API_ENDPOINTS } from '../constants/api.js'

const SuperAdminAPI = {
  // 获取用户分页列表
  async getUsers(params = {}) {
    return await request({
      url: API_ENDPOINTS.SUPER_ADMIN.USERS,
      method: 'get',
      params: {
        pageNum: params.page,
        pageSize: params.size,
        keyword: params.keyword,
        sortBy: params.sortBy || 'create_time',
        sortOrder: params.sortOrder || 'desc',
      },
    })
  },

  // 获取管理员分页列表
  async getAdmins(params = {}) {
    return await request({
      url: API_ENDPOINTS.SUPER_ADMIN.ADMINS,
      method: 'get',
      params: {
        pageNum: params.page,
        pageSize: params.size,
        keyword: params.keyword,
        sortBy: params.sortBy || 'create_time',
        sortOrder: params.sortOrder || 'desc',
      },
    })
  },

  // 获取用户详情
  async getUserById(userId) {
    return await request({ url: `${API_ENDPOINTS.SUPER_ADMIN.USERS}/${userId}` , method: 'get' })
  },

  // 获取管理员详情
  async getAdminById(adminId) {
    return await request({ url: `${API_ENDPOINTS.SUPER_ADMIN.ADMINS}/${adminId}` , method: 'get' })
  },
}

export default SuperAdminAPI