// API 基础配置
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080',
  TIMEOUT: 10000,
  RETRY_TIMES: 3,
}

// API 路径常量
export const API_PATHS = {
  // 普通用户接口
  USER: {
    LOGIN: '/api/user/login',
    PROFILE: '/api/user/profile',
    PROFILE_BY_ID: id => `/api/user/profile/${id}`,
  },

  // 失物管理员接口
  LOST_ITEM_ADMIN: {
    LOGIN: '/api/admin/lost-item/login',
    PROFILE: id => `/api/admin/lost-item/profile/${id}`,
  },

  // 总管理员接口
  SUPER_ADMIN: {
    LOGIN: '/api/admin/super/login',
  },

  // 失物接口
  LOST_ITEMS: {
    PUBLISH: '/api/lost-items/publish',
    CLAIM: '/api/lost-items/claim',
    DETAIL: id => `/api/lost-items/${id}`,
    DELETE: id => `/api/lost-items/${id}`,
    SEARCH: '/api/lost-items/search',
    ALL: '/api/lost-items/all',
    BY_ADMIN: adminId => `/api/lost-items/admin/${adminId}`,
  },
}

// API 端点常量（为了向后兼容和更好的语义化）
export const API_ENDPOINTS = {
  // 普通用户接口
  USER: {
    LOGIN: '/api/user/login',
    PROFILE: '/api/user/profile',
    REGISTER: '/api/user/register',
    CHECK_USERNAME: '/api/user/check-username',
    CHECK_STUDENT_ID: '/api/user/check-student-id',
  },

  // 用户管理接口（管理员功能）
  USERS: {
    ALL: '/api/users/all',
  },

  // 管理员接口
  ADMIN: {
    LOST_ITEM_LOGIN: '/api/admin/lost-item/login',
    SUPER_LOGIN: '/api/admin/super/login',
    LOST_ITEM_PROFILE: '/api/admin/lost-item/profile',
    ALL: '/api/admin/all',
  },

  // 失物接口
  LOST_ITEMS: {
    PUBLISH: '/api/lost-items/publish',
    CLAIM: '/api/lost-items/claim',
    DETAIL: '/api/lost-items',
    DELETE: '/api/lost-items',
    SEARCH: '/api/lost-items/search',
    ALL: '/api/lost-items/all',
    BY_ADMIN: '/api/lost-items/admin',
  },
}

// 请求方法常量
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
}

// 请求头常量
export const HEADERS = {
  CONTENT_TYPE: {
    JSON: 'application/json',
    FORM_DATA: 'multipart/form-data',
    FORM_URLENCODED: 'application/x-www-form-urlencoded',
  },
  AUTHORIZATION: 'Authorization',
  BEARER: 'Bearer',
}

// 响应状态码映射
export const RESPONSE_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
}

// 错误消息映射
export const ERROR_MESSAGES = {
  [RESPONSE_CODES.BAD_REQUEST]: '请求参数错误',
  [RESPONSE_CODES.UNAUTHORIZED]: '未授权，请重新登录',
  [RESPONSE_CODES.FORBIDDEN]: '权限不足',
  [RESPONSE_CODES.NOT_FOUND]: '请求的资源不存在',
  [RESPONSE_CODES.CONFLICT]: '数据冲突',
  [RESPONSE_CODES.INTERNAL_SERVER_ERROR]: '服务器内部错误',
  [RESPONSE_CODES.BAD_GATEWAY]: '网关错误',
  [RESPONSE_CODES.SERVICE_UNAVAILABLE]: '服务不可用',
  NETWORK_ERROR: '网络连接失败',
  TIMEOUT: '请求超时',
  UNKNOWN: '未知错误',
}

// API 响应数据结构
export const API_RESPONSE_STRUCTURE = {
  CODE: 'code',
  MESSAGE: 'message',
  DATA: 'data',
}

// 文件上传配置
export const UPLOAD_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif'],
}

// 获取完整的API URL
export const getApiUrl = path => {
  return `${API_CONFIG.BASE_URL}${path}`
}

// 构建查询参数字符串
export const buildQueryString = params => {
  if (!params || Object.keys(params).length === 0) {
    return ''
  }

  const queryParams = Object.entries(params)
    .filter(([_key, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&')

  return queryParams ? `?${queryParams}` : ''
}

// 检查响应是否成功
export const isResponseSuccess = response => {
  return response && response.code === RESPONSE_CODES.SUCCESS
}

// 获取错误消息
export const getErrorMessage = error => {
  if (error.response) {
    const status = error.response.status
    return ERROR_MESSAGES[status] || ERROR_MESSAGES.UNKNOWN
  }

  if (error.code === 'ECONNABORTED') {
    return ERROR_MESSAGES.TIMEOUT
  }

  if (error.message === 'Network Error') {
    return ERROR_MESSAGES.NETWORK_ERROR
  }

  return error.message || ERROR_MESSAGES.UNKNOWN
}

// 验证文件类型和大小
export const validateFile = file => {
  const errors = []

  if (!file) {
    errors.push('请选择文件')
    return errors
  }

  if (file.size > UPLOAD_CONFIG.MAX_SIZE) {
    errors.push(`文件大小不能超过 ${UPLOAD_CONFIG.MAX_SIZE / 1024 / 1024}MB`)
  }

  if (!UPLOAD_CONFIG.ALLOWED_TYPES.includes(file.type)) {
    errors.push(`只支持 ${UPLOAD_CONFIG.ALLOWED_EXTENSIONS.join(', ')} 格式的图片`)
  }

  return errors
}
