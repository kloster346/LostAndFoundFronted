import axios from 'axios'

// 创建 axios 实例
const request = axios.create({
  baseURL: 'http://localhost:8080', // 后端服务地址
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 打印请求信息（开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Request:', {
        url: config.url,
        method: config.method,
        data: config.data,
        params: config.params
      })
    }
    
    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    // 打印响应信息（开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data
      })
    }
    
    // 统一处理响应数据格式
    const { data } = response
    
    // 根据后端返回的统一格式处理
    if (data && typeof data === 'object' && 'code' in data) {
      // 成功响应
      if (data.code === 200) {
        return data
      }
      
      // 业务错误
      const error = new Error(data.message || '请求失败')
      error.code = data.code
      error.data = data
      throw error
    }
    
    // 直接返回数据（兼容其他格式）
    return data
  },
  (error) => {
    console.error('❌ Response Error:', error)
    
    // 网络错误或超时
    if (!error.response) {
      const networkError = new Error('网络连接失败，请检查网络设置')
      networkError.code = 'NETWORK_ERROR'
      throw networkError
    }
    
    // HTTP 状态码错误
    const { status, data } = error.response
    let message = '请求失败'
    
    switch (status) {
      case 400:
        message = '请求参数错误'
        break
      case 401:
        message = '未授权，请重新登录'
        // 清除本地存储的认证信息
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        // 可以在这里触发跳转到登录页面
        break
      case 403:
        message = '拒绝访问'
        break
      case 404:
        message = '请求的资源不存在'
        break
      case 500:
        message = '服务器内部错误'
        break
      default:
        message = data?.message || `请求失败 (${status})`
    }
    
    const apiError = new Error(message)
    apiError.code = status
    apiError.response = error.response
    throw apiError
  }
)

// 导出请求实例
export default request

// 导出常用的请求方法
export const get = (url, params = {}) => {
  return request({
    method: 'GET',
    url,
    params
  })
}

export const post = (url, data = {}) => {
  return request({
    method: 'POST',
    url,
    data
  })
}

export const put = (url, data = {}) => {
  return request({
    method: 'PUT',
    url,
    data
  })
}

export const del = (url, params = {}) => {
  return request({
    method: 'DELETE',
    url,
    params
  })
}

// 文件上传方法
export const upload = (url, formData) => {
  return request({
    method: 'POST',
    url,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}