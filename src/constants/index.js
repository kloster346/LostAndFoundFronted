// 统一导出所有常量
export * from './enums.js'
export * from './api.js'

// 应用配置常量
export const APP_CONFIG = {
  NAME: '校园失物招领系统',
  VERSION: '1.0.0',
  DESCRIPTION: '校园失物招领管理平台',
  COPYRIGHT: '© 2024 校园失物招领系统'
}

// 路由路径常量
export const ROUTE_PATHS = {
  // 公共路由
  HOME: '/',
  LOGIN: '/login',
  
  // 普通用户路由
  USER: {
    DASHBOARD: '/user/dashboard',
    BROWSE: '/user/browse',
    SEARCH: '/user/search',
    PROFILE: '/user/profile',
    CLAIM_HISTORY: '/user/claim-history'
  },
  
  // 失物管理员路由
  LOST_ITEM_ADMIN: {
    DASHBOARD: '/admin/lost-item/dashboard',
    PUBLISH: '/admin/lost-item/publish',
    MY_ITEMS: '/admin/lost-item/my-items',
    MANAGE: '/admin/lost-item/manage',
    PROFILE: '/admin/lost-item/profile'
  },
  
  // 总管理员路由
  SUPER_ADMIN: {
    DASHBOARD: '/admin/super/dashboard',
    SYSTEM_MANAGE: '/admin/super/system-manage',
    USER_MANAGE: '/admin/super/user-manage',
    ADMIN_MANAGE: '/admin/super/admin-manage',
    PROFILE: '/admin/super/profile'
  },
  
  // 错误页面
  NOT_FOUND: '/404',
  FORBIDDEN: '/403',
  ERROR: '/error'
}

// 路由名称映射
export const ROUTE_NAMES = {
  [ROUTE_PATHS.HOME]: '首页',
  [ROUTE_PATHS.LOGIN]: '登录',
  
  // 普通用户
  [ROUTE_PATHS.USER.DASHBOARD]: '用户首页',
  [ROUTE_PATHS.USER.BROWSE]: '浏览失物',
  [ROUTE_PATHS.USER.SEARCH]: '搜索失物',
  [ROUTE_PATHS.USER.PROFILE]: '个人信息',
  [ROUTE_PATHS.USER.CLAIM_HISTORY]: '领取记录',
  
  // 失物管理员
  [ROUTE_PATHS.LOST_ITEM_ADMIN.DASHBOARD]: '管理员首页',
  [ROUTE_PATHS.LOST_ITEM_ADMIN.PUBLISH]: '发布失物',
  [ROUTE_PATHS.LOST_ITEM_ADMIN.MY_ITEMS]: '我的发布',
  [ROUTE_PATHS.LOST_ITEM_ADMIN.MANAGE]: '失物管理',
  [ROUTE_PATHS.LOST_ITEM_ADMIN.PROFILE]: '个人信息',
  
  // 总管理员
  [ROUTE_PATHS.SUPER_ADMIN.DASHBOARD]: '系统首页',
  [ROUTE_PATHS.SUPER_ADMIN.SYSTEM_MANAGE]: '系统管理',
  [ROUTE_PATHS.SUPER_ADMIN.USER_MANAGE]: '用户管理',
  [ROUTE_PATHS.SUPER_ADMIN.ADMIN_MANAGE]: '管理员管理',
  [ROUTE_PATHS.SUPER_ADMIN.PROFILE]: '个人信息',
  
  // 错误页面
  [ROUTE_PATHS.NOT_FOUND]: '页面不存在',
  [ROUTE_PATHS.FORBIDDEN]: '权限不足',
  [ROUTE_PATHS.ERROR]: '系统错误'
}

// 表单验证规则
export const VALIDATION_RULES = {
  REQUIRED: '此字段为必填项',
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    PATTERN: /^[a-zA-Z0-9_]+$/,
    MESSAGE: '用户名长度为3-20位，只能包含字母、数字和下划线'
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 20,
    MESSAGE: '密码长度为6-20位'
  },
  PHONE: {
    PATTERN: /^1[3-9]\d{9}$/,
    MESSAGE: '请输入正确的手机号码'
  },
  STUDENT_ID: {
    PATTERN: /^\d{8,12}$/,
    MESSAGE: '学号应为8-12位数字'
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MESSAGE: '请输入正确的邮箱地址'
  }
}

// 消息提示类型
export const MESSAGE_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
}

// 默认消息提示配置
export const MESSAGE_CONFIG = {
  DURATION: 3000,
  SHOW_CLOSE: true,
  CENTER: false
}

// 日期时间格式
export const DATE_FORMATS = {
  DATE: 'YYYY-MM-DD',
  TIME: 'HH:mm:ss',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  DATETIME_SHORT: 'MM-DD HH:mm',
  MONTH_DAY: 'MM-DD'
}

// 获取路由名称
export const getRouteName = (path) => {
  return ROUTE_NAMES[path] || '未知页面'
}

// 检查是否为有效的用户角色
export const isValidUserRole = (role) => {
  return Object.values(USER_ROLES).includes(role)
}

// 根据用户角色获取默认首页路径
export const getDefaultHomePath = (role) => {
  switch (role) {
    case USER_ROLES.NORMAL_USER:
      return ROUTE_PATHS.USER.DASHBOARD
    case USER_ROLES.LOST_ITEM_ADMIN:
      return ROUTE_PATHS.LOST_ITEM_ADMIN.DASHBOARD
    case USER_ROLES.SUPER_ADMIN:
      return ROUTE_PATHS.SUPER_ADMIN.DASHBOARD
    default:
      return ROUTE_PATHS.LOGIN
  }
}