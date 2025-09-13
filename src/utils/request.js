import { apiClient } from '@/api/index.js'
import { API_ENDPOINTS, HTTP_STATUS } from '@/constants/api.js'
import { MESSAGE_TYPES } from '@/constants/index.js'

/**
 * 请求工具类
 * 提供高级请求方法和错误处理
 */
export class RequestUtil {
  /**
   * 发送GET请求
   * @param {string} url - 请求URL
   * @param {Object} params - 查询参数
   * @param {Object} options - 请求选项
   * @returns {Promise} 请求结果
   */
  static async get(url, params = {}, options = {}) {
    try {
      const response = await apiClient.get(url, {
        params,
        ...options
      })
      return this.handleResponse(response)
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * 发送POST请求
   * @param {string} url - 请求URL
   * @param {Object} data - 请求数据
   * @param {Object} options - 请求选项
   * @returns {Promise} 请求结果
   */
  static async post(url, data = {}, options = {}) {
    try {
      const response = await apiClient.post(url, data, options)
      return this.handleResponse(response)
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * 发送PUT请求
   * @param {string} url - 请求URL
   * @param {Object} data - 请求数据
   * @param {Object} options - 请求选项
   * @returns {Promise} 请求结果
   */
  static async put(url, data = {}, options = {}) {
    try {
      const response = await apiClient.put(url, data, options)
      return this.handleResponse(response)
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * 发送DELETE请求
   * @param {string} url - 请求URL
   * @param {Object} options - 请求选项
   * @returns {Promise} 请求结果
   */
  static async delete(url, options = {}) {
    try {
      const response = await apiClient.delete(url, options)
      return this.handleResponse(response)
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * 上传文件
   * @param {string} url - 上传URL
   * @param {FormData} formData - 文件数据
   * @param {Function} onProgress - 进度回调
   * @returns {Promise} 上传结果
   */
  static async upload(url, formData, onProgress = null) {
    try {
      const options = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }

      if (onProgress) {
        options.onUploadProgress = (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          onProgress(percentCompleted)
        }
      }

      const response = await apiClient.post(url, formData, options)
      return this.handleResponse(response)
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * 处理响应数据
   * @param {Object} response - 响应对象
   * @returns {Object} 处理后的响应
   */
  static handleResponse(response) {
    const { data, status } = response
    
    return {
      success: true,
      data: data.data || data,
      message: data.message || '请求成功',
      status,
      code: data.code || status
    }
  }

  /**
   * 处理请求错误
   * @param {Error} error - 错误对象
   * @returns {Object} 错误响应
   */
  static handleError(error) {
    console.error('Request Error:', error)
    
    const errorResponse = {
      success: false,
      data: null,
      message: '请求失败',
      status: 0,
      code: 0
    }

    if (error.response) {
      // 服务器响应错误
      const { data, status } = error.response
      errorResponse.status = status
      errorResponse.code = data?.code || status
      errorResponse.message = data?.message || this.getStatusMessage(status)
    } else if (error.request) {
      // 网络错误
      errorResponse.message = '网络连接失败，请检查网络设置'
      errorResponse.code = 'NETWORK_ERROR'
    } else {
      // 其他错误
      errorResponse.message = error.message || '未知错误'
      errorResponse.code = 'UNKNOWN_ERROR'
    }

    return errorResponse
  }

  /**
   * 根据状态码获取错误信息
   * @param {number} status - HTTP状态码
   * @returns {string} 错误信息
   */
  static getStatusMessage(status) {
    const statusMessages = {
      [HTTP_STATUS.BAD_REQUEST]: '请求参数错误',
      [HTTP_STATUS.UNAUTHORIZED]: '未授权，请重新登录',
      [HTTP_STATUS.FORBIDDEN]: '权限不足',
      [HTTP_STATUS.NOT_FOUND]: '请求的资源不存在',
      [HTTP_STATUS.METHOD_NOT_ALLOWED]: '请求方法不允许',
      [HTTP_STATUS.INTERNAL_SERVER_ERROR]: '服务器内部错误',
      [HTTP_STATUS.BAD_GATEWAY]: '网关错误',
      [HTTP_STATUS.SERVICE_UNAVAILABLE]: '服务不可用'
    }

    return statusMessages[status] || `请求失败 (${status})`
  }

  /**
   * 批量请求
   * @param {Array} requests - 请求数组
   * @returns {Promise} 批量请求结果
   */
  static async batch(requests) {
    try {
      const promises = requests.map(request => {
        const { method, url, data, params, options } = request
        
        switch (method.toLowerCase()) {
          case 'get':
            return this.get(url, params, options)
          case 'post':
            return this.post(url, data, options)
          case 'put':
            return this.put(url, data, options)
          case 'delete':
            return this.delete(url, options)
          default:
            throw new Error(`不支持的请求方法: ${method}`)
        }
      })

      const results = await Promise.allSettled(promises)
      
      return results.map((result, index) => ({
        index,
        success: result.status === 'fulfilled',
        data: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason : null
      }))
    } catch (error) {
      console.error('Batch Request Error:', error)
      throw error
    }
  }

  /**
   * 重试请求
   * @param {Function} requestFn - 请求函数
   * @param {number} maxRetries - 最大重试次数
   * @param {number} delay - 重试延迟(ms)
   * @returns {Promise} 请求结果
   */
  static async retry(requestFn, maxRetries = 3, delay = 1000) {
    let lastError
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        const result = await requestFn()
        return result
      } catch (error) {
        lastError = error
        
        if (i < maxRetries) {
          console.warn(`请求失败，${delay}ms后进行第${i + 1}次重试...`)
          await new Promise(resolve => setTimeout(resolve, delay))
          delay *= 2 // 指数退避
        }
      }
    }
    
    throw lastError
  }
}

// 导出便捷方法
export const request = {
  get: RequestUtil.get.bind(RequestUtil),
  post: RequestUtil.post.bind(RequestUtil),
  put: RequestUtil.put.bind(RequestUtil),
  delete: RequestUtil.delete.bind(RequestUtil),
  upload: RequestUtil.upload.bind(RequestUtil),
  batch: RequestUtil.batch.bind(RequestUtil),
  retry: RequestUtil.retry.bind(RequestUtil)
}

export default RequestUtil