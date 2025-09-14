import axios from 'axios'
import { handleError, withRetry } from '@/utils/error'

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
      error.response = response
      throw error
    }

    // 直接返回数据（兼容其他格式）
    return data
  },
  (error) => {
    // 使用新的错误处理工具
    const context = {
      url: error.config?.url,
      method: error.config?.method,
      params: error.config?.params,
      data: error.config?.data
    }

    // 处理特殊情况
    if (error.response?.status === 401) {
      // 清除本地存储的认证信息
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      // 可以在这里触发跳转到登录页面
      window.dispatchEvent(new CustomEvent('auth:logout'))
    }

    // 使用统一错误处理
    const appError = handleError(error, context, {
      notify: true, // 显示错误提示
      showMessage: true
    })

    throw appError
  }
)

// 导出请求实例
export default request

// 导出常用的请求方法
export const get = (url, params = {}, options = {}) => {
  const requestFn = () => request({
    method: 'GET',
    url,
    params
  })

  return options.retry ? withRetry(requestFn, options.retry) : requestFn()
}

export const post = (url, data = {}, options = {}) => {
  const requestFn = () => request({
    method: 'POST',
    url,
    data
  })

  return options.retry ? withRetry(requestFn, options.retry) : requestFn()
}

export const put = (url, data = {}, options = {}) => {
  const requestFn = () => request({
    method: 'PUT',
    url,
    data
  })

  return options.retry ? withRetry(requestFn, options.retry) : requestFn()
}

export const del = (url, params = {}, options = {}) => {
  const requestFn = () => request({
    method: 'DELETE',
    url,
    params
  })

  return options.retry ? withRetry(requestFn, options.retry) : requestFn()
}

// 文件上传方法
export const upload = (url, formData, options = {}) => {
  const requestFn = () => request({
    method: 'POST',
    url,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

  return options.retry ? withRetry(requestFn, options.retry) : requestFn()
}

// 带重试的请求方法
export const getWithRetry = (url, params = {}, retryOptions = {}) => {
  return get(url, params, { retry: retryOptions })
}

export const postWithRetry = (url, data = {}, retryOptions = {}) => {
  return post(url, data, { retry: retryOptions })
}

export const putWithRetry = (url, data = {}, retryOptions = {}) => {
  return put(url, data, { retry: retryOptions })
}

export const delWithRetry = (url, params = {}, retryOptions = {}) => {
  return del(url, params, { retry: retryOptions })
}
