import { ITEM_TYPES, ITEM_COLORS, ITEM_STATUS, USER_ROLES } from '@/constants/enums.js'
import { DATE_FORMATS } from '@/constants/index.js'

/**
 * 格式化工具类
 * 提供各种数据格式化功能
 */
export class FormatUtil {
  /**
   * 格式化日期时间
   * @param {Date|string|number} date - 日期对象、字符串或时间戳
   * @param {string} format - 格式字符串
   * @returns {string} 格式化后的日期字符串
   */
  static formatDate(date, format = DATE_FORMATS.DATETIME) {
    if (!date) return ''

    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) return ''

    const year = dateObj.getFullYear()
    const month = String(dateObj.getMonth() + 1).padStart(2, '0')
    const day = String(dateObj.getDate()).padStart(2, '0')
    const hours = String(dateObj.getHours()).padStart(2, '0')
    const minutes = String(dateObj.getMinutes()).padStart(2, '0')
    const seconds = String(dateObj.getSeconds()).padStart(2, '0')

    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds)
  }

  /**
   * 格式化相对时间
   * @param {Date|string|number} date - 日期
   * @returns {string} 相对时间字符串
   */
  static formatRelativeTime(date) {
    if (!date) return ''

    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) return ''

    const now = new Date()
    const diffMs = now.getTime() - dateObj.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)
    const diffMonths = Math.floor(diffDays / 30)
    const diffYears = Math.floor(diffDays / 365)

    if (diffSeconds < 60) {
      return '刚刚'
    } else if (diffMinutes < 60) {
      return `${diffMinutes}分钟前`
    } else if (diffHours < 24) {
      return `${diffHours}小时前`
    } else if (diffDays < 30) {
      return `${diffDays}天前`
    } else if (diffMonths < 12) {
      return `${diffMonths}个月前`
    } else {
      return `${diffYears}年前`
    }
  }

  /**
   * 格式化文件大小
   * @param {number} bytes - 字节数
   * @param {number} decimals - 小数位数
   * @returns {string} 格式化后的文件大小
   */
  static formatFileSize(bytes, decimals = 2) {
    if (!bytes || bytes === 0) return '0 B'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  }

  /**
   * 格式化数字
   * @param {number} num - 数字
   * @param {number} decimals - 小数位数
   * @param {boolean} useThousandSeparator - 是否使用千分位分隔符
   * @returns {string} 格式化后的数字
   */
  static formatNumber(num, decimals = 0, useThousandSeparator = true) {
    if (num === null || num === undefined || isNaN(num)) return '0'

    const fixed = Number(num).toFixed(decimals)

    if (useThousandSeparator) {
      const parts = fixed.split('.')
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      return parts.join('.')
    }

    return fixed
  }

  /**
   * 格式化百分比
   * @param {number} value - 数值（0-1之间）
   * @param {number} decimals - 小数位数
   * @returns {string} 百分比字符串
   */
  static formatPercentage(value, decimals = 1) {
    if (value === null || value === undefined || isNaN(value)) return '0%'

    return (value * 100).toFixed(decimals) + '%'
  }

  /**
   * 格式化物品类型
   * @param {string} type - 物品类型代码
   * @returns {string} 物品类型名称
   */
  static formatItemType(type) {
    return ITEM_TYPES[type] || type || '未知类型'
  }

  /**
   * 格式化物品颜色
   * @param {string} color - 颜色代码
   * @returns {string} 颜色名称
   */
  static formatItemColor(color) {
    return ITEM_COLORS[color] || color || '未知颜色'
  }

  /**
   * 格式化物品状态
   * @param {string} status - 状态代码
   * @returns {string} 状态名称
   */
  static formatItemStatus(status) {
    return ITEM_STATUS[status] || status || '未知状态'
  }

  /**
   * 格式化用户角色
   * @param {string} role - 角色代码
   * @returns {string} 角色名称
   */
  static formatUserRole(role) {
    const roleNames = {
      [USER_ROLES.NORMAL_USER]: '普通用户',
      [USER_ROLES.LOST_ITEM_ADMIN]: '失物管理员',
      [USER_ROLES.SUPER_ADMIN]: '总管理员',
    }

    return roleNames[role] || role || '未知角色'
  }

  /**
   * 格式化手机号
   * @param {string} phone - 手机号
   * @param {boolean} mask - 是否脱敏
   * @returns {string} 格式化后的手机号
   */
  static formatPhone(phone, mask = false) {
    if (!phone) return ''

    const cleaned = phone.replace(/\D/g, '')

    if (cleaned.length === 11) {
      if (mask) {
        return cleaned.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
      } else {
        return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
      }
    }

    return phone
  }

  /**
   * 格式化身份证号
   * @param {string} idCard - 身份证号
   * @param {boolean} mask - 是否脱敏
   * @returns {string} 格式化后的身份证号
   */
  static formatIdCard(idCard, mask = true) {
    if (!idCard) return ''

    if (mask && idCard.length >= 8) {
      const start = idCard.substring(0, 4)
      const end = idCard.substring(idCard.length - 4)
      const middle = '*'.repeat(idCard.length - 8)
      return start + middle + end
    }

    return idCard
  }

  /**
   * 格式化地址
   * @param {Object} address - 地址对象
   * @returns {string} 完整地址字符串
   */
  static formatAddress(address) {
    if (!address) return ''

    if (typeof address === 'string') return address

    const parts = [
      address.province,
      address.city,
      address.district,
      address.street,
      address.detail,
    ].filter(Boolean)

    return parts.join('')
  }

  /**
   * 格式化货币
   * @param {number} amount - 金额
   * @param {string} currency - 货币符号
   * @param {number} decimals - 小数位数
   * @returns {string} 格式化后的货币字符串
   */
  static formatCurrency(amount, currency = '¥', decimals = 2) {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return currency + '0.00'
    }

    const formatted = this.formatNumber(amount, decimals, true)
    return currency + formatted
  }

  /**
   * 截断文本
   * @param {string} text - 原始文本
   * @param {number} maxLength - 最大长度
   * @param {string} suffix - 后缀
   * @returns {string} 截断后的文本
   */
  static truncateText(text, maxLength = 50, suffix = '...') {
    if (!text) return ''

    if (text.length <= maxLength) return text

    return text.substring(0, maxLength - suffix.length) + suffix
  }

  /**
   * 格式化搜索关键词高亮
   * @param {string} text - 原始文本
   * @param {string} keyword - 搜索关键词
   * @param {string} className - 高亮样式类名
   * @returns {string} 带高亮标记的HTML字符串
   */
  static highlightKeyword(text, keyword, className = 'highlight') {
    if (!text || !keyword) return text

    const regex = new RegExp(`(${keyword})`, 'gi')
    return text.replace(regex, `<span class="${className}">$1</span>`)
  }

  /**
   * 格式化URL参数
   * @param {Object} params - 参数对象
   * @returns {string} URL参数字符串
   */
  static formatUrlParams(params) {
    if (!params || typeof params !== 'object') return ''

    const searchParams = new URLSearchParams()

    Object.keys(params).forEach(key => {
      const value = params[key]
      if (value !== null && value !== undefined && value !== '') {
        searchParams.append(key, String(value))
      }
    })

    return searchParams.toString()
  }

  /**
   * 解析URL参数
   * @param {string} search - URL搜索字符串
   * @returns {Object} 参数对象
   */
  static parseUrlParams(search) {
    if (!search) return {}

    const params = {}
    const searchParams = new URLSearchParams(search)

    for (const [key, value] of searchParams) {
      params[key] = value
    }

    return params
  }

  /**
   * 格式化枚举选项
   * @param {Object} enumObj - 枚举对象
   * @returns {Array} 选项数组
   */
  static formatEnumOptions(enumObj) {
    if (!enumObj || typeof enumObj !== 'object') return []

    return Object.keys(enumObj).map(key => ({
      value: key,
      label: enumObj[key],
      key,
    }))
  }

  /**
   * 安全的JSON解析
   * @param {string} jsonString - JSON字符串
   * @param {*} defaultValue - 默认值
   * @returns {*} 解析结果或默认值
   */
  static safeJsonParse(jsonString, defaultValue = null) {
    try {
      return JSON.parse(jsonString)
    } catch (error) {
      console.warn('JSON解析失败:', error)
      return defaultValue
    }
  }

  /**
   * 安全的JSON字符串化
   * @param {*} obj - 要序列化的对象
   * @param {string} defaultValue - 默认值
   * @returns {string} JSON字符串或默认值
   */
  static safeJsonStringify(obj, defaultValue = '{}') {
    try {
      return JSON.stringify(obj)
    } catch (error) {
      console.warn('JSON序列化失败:', error)
      return defaultValue
    }
  }
}

// 导出便捷方法
export const format = {
  date: FormatUtil.formatDate.bind(FormatUtil),
  relativeTime: FormatUtil.formatRelativeTime.bind(FormatUtil),
  fileSize: FormatUtil.formatFileSize.bind(FormatUtil),
  number: FormatUtil.formatNumber.bind(FormatUtil),
  percentage: FormatUtil.formatPercentage.bind(FormatUtil),
  itemType: FormatUtil.formatItemType.bind(FormatUtil),
  itemColor: FormatUtil.formatItemColor.bind(FormatUtil),
  itemStatus: FormatUtil.formatItemStatus.bind(FormatUtil),
  userRole: FormatUtil.formatUserRole.bind(FormatUtil),
  phone: FormatUtil.formatPhone.bind(FormatUtil),
  currency: FormatUtil.formatCurrency.bind(FormatUtil),
  truncate: FormatUtil.truncateText.bind(FormatUtil),
  highlight: FormatUtil.highlightKeyword.bind(FormatUtil),
}

export default FormatUtil
