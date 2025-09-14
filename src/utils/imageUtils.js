import { API_CONFIG } from '../constants/api.js'

/**
 * 图片URL处理工具
 * 用于处理后端返回的图片路径，确保正确拼接服务器地址
 */

/**
 * 获取完整的图片URL
 * @param {string} imagePath - 后端返回的图片路径
 * @returns {string} 完整的图片URL
 */
export function getImageUrl(imagePath) {
  if (!imagePath) {
    return ''
  }

  // 如果已经是完整的URL（包含http或https），直接返回
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }

  // 如果是相对路径，拼接后端服务器地址
  const baseUrl = API_CONFIG.BASE_URL.replace('/api', '') // 移除/api后缀
  
  // 确保路径以/开头
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
  
  return `${baseUrl}${normalizedPath}`
}

/**
 * 获取图片预览URL（用于缩略图等场景）
 * @param {string} imagePath - 后端返回的图片路径
 * @param {Object} options - 选项
 * @param {number} options.width - 图片宽度
 * @param {number} options.height - 图片高度
 * @param {string} options.quality - 图片质量
 * @returns {string} 图片预览URL
 */
export function getImagePreviewUrl(imagePath, options = {}) {
  const fullUrl = getImageUrl(imagePath)
  
  if (!fullUrl) {
    return ''
  }

  // 如果没有指定选项，直接返回完整URL
  if (!options.width && !options.height && !options.quality) {
    return fullUrl
  }

  // 构建查询参数
  const params = new URLSearchParams()
  if (options.width) params.append('w', options.width)
  if (options.height) params.append('h', options.height)
  if (options.quality) params.append('q', options.quality)

  return `${fullUrl}?${params.toString()}`
}

/**
 * 检查图片是否存在
 * @param {string} imagePath - 图片路径
 * @returns {Promise<boolean>} 图片是否存在
 */
export function checkImageExists(imagePath) {
  return new Promise((resolve) => {
    const img = new Image()
    const fullUrl = getImageUrl(imagePath)
    
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    
    img.src = fullUrl
  })
}

/**
 * 获取默认占位图片URL
 * @param {string} type - 失物类型（可选）
 * @returns {string} 默认图片URL
 */
export function getDefaultImageUrl(type) {
  // 根据失物类型返回不同的默认图片
  const defaultImages = {
    1: '/images/defaults/book.svg',      // 书
    2: '/images/defaults/bag.svg',       // 包
    3: '/images/defaults/card.svg',      // 卡
    4: '/images/defaults/key.svg',       // 钥匙
    5: '/images/defaults/phone.svg',     // 手机
    6: '/images/defaults/watch.svg',     // 手表
    7: '/images/defaults/pen.svg',       // 笔
    8: '/images/defaults/umbrella.svg',  // 伞
    9: '/images/defaults/earphone.svg',  // 耳机
    10: '/images/defaults/other.svg'     // 其他
  }

  return defaultImages[type] || '/images/defaults/item.svg'
}

/**
 * 图片加载错误处理
 * @param {Event} event - 图片加载错误事件
 * @param {string} fallbackType - 失物类型（用于获取默认图片）
 */
export function handleImageError(event, fallbackType) {
  const img = event.target
  const defaultUrl = getDefaultImageUrl(fallbackType)
  
  // 避免无限循环
  if (img.src !== defaultUrl) {
    img.src = defaultUrl
  }
}

export default {
  getImageUrl,
  getImagePreviewUrl,
  checkImageExists,
  getDefaultImageUrl,
  handleImageError
}