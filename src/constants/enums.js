// 物品类型枚举
export const ITEM_TYPES = {
  BOOK: 1,
  BAG: 2,
  CARD: 3,
  KEY: 4,
  PHONE: 5,
  WATCH: 6,
  PEN: 7,
  UMBRELLA: 8,
  EARPHONE: 9,
  OTHER: 10
}

// 物品类型显示名称映射
export const ITEM_TYPE_NAMES = {
  [ITEM_TYPES.BOOK]: '书',
  [ITEM_TYPES.BAG]: '包',
  [ITEM_TYPES.CARD]: '卡',
  [ITEM_TYPES.KEY]: '钥匙',
  [ITEM_TYPES.PHONE]: '手机',
  [ITEM_TYPES.WATCH]: '手表',
  [ITEM_TYPES.PEN]: '笔',
  [ITEM_TYPES.UMBRELLA]: '伞',
  [ITEM_TYPES.EARPHONE]: '耳机',
  [ITEM_TYPES.OTHER]: '其他'
}

// 颜色枚举
export const COLORS = {
  RED: 1,
  LIGHT_RED: 2,
  DARK_RED: 3,
  GREEN: 4,
  LIGHT_GREEN: 5,
  DARK_GREEN: 6,
  BLUE: 7,
  LIGHT_BLUE: 8,
  DARK_BLUE: 9,
  YELLOW: 10,
  ORANGE: 11,
  PURPLE: 12,
  PINK: 13,
  BROWN: 14,
  GRAY: 15,
  BLACK: 16,
  WHITE: 17,
  OTHER: 18
}

// 颜色显示名称映射
export const COLOR_NAMES = {
  [COLORS.RED]: '红色',
  [COLORS.LIGHT_RED]: '浅红色',
  [COLORS.DARK_RED]: '暗红色',
  [COLORS.GREEN]: '绿色',
  [COLORS.LIGHT_GREEN]: '浅绿色',
  [COLORS.DARK_GREEN]: '暗绿色',
  [COLORS.BLUE]: '蓝色',
  [COLORS.LIGHT_BLUE]: '浅蓝色',
  [COLORS.DARK_BLUE]: '深蓝色',
  [COLORS.YELLOW]: '黄色',
  [COLORS.ORANGE]: '橙色',
  [COLORS.PURPLE]: '紫色',
  [COLORS.PINK]: '粉红色',
  [COLORS.BROWN]: '棕色',
  [COLORS.GRAY]: '灰色',
  [COLORS.BLACK]: '黑色',
  [COLORS.WHITE]: '白色',
  [COLORS.OTHER]: '其他'
}

// 用户角色枚举
export const USER_ROLES = {
  NORMAL_USER: 'normal_user',
  LOST_ITEM_ADMIN: 'lost_item_admin',
  SUPER_ADMIN: 'super_admin'
}

// 用户角色显示名称映射
export const USER_ROLE_NAMES = {
  [USER_ROLES.NORMAL_USER]: '普通用户',
  [USER_ROLES.LOST_ITEM_ADMIN]: '失物管理员',
  [USER_ROLES.SUPER_ADMIN]: '总管理员'
}

// 失物状态枚举
export const CLAIM_STATUS = {
  UNCLAIMED: 0,
  CLAIMED: 1
}

// 失物状态显示名称映射
export const CLAIM_STATUS_NAMES = {
  [CLAIM_STATUS.UNCLAIMED]: '未领取',
  [CLAIM_STATUS.CLAIMED]: '已领取'
}

// HTTP 状态码
export const HTTP_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
}

// 分页默认配置
export const PAGINATION = {
  DEFAULT_PAGE_NUM: 1,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100
}

// 本地存储键名
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_INFO: 'userInfo',
  USER_ROLE: 'userRole'
}

// 获取物品类型选项列表
export const getItemTypeOptions = () => {
  return Object.entries(ITEM_TYPE_NAMES).map(([value, label]) => ({
    value: parseInt(value),
    label
  }))
}

// 获取颜色选项列表
export const getColorOptions = () => {
  return Object.entries(COLOR_NAMES).map(([value, label]) => ({
    value: parseInt(value),
    label
  }))
}

// 获取用户角色选项列表
export const getUserRoleOptions = () => {
  return Object.entries(USER_ROLE_NAMES).map(([value, label]) => ({
    value,
    label
  }))
}

// 根据值获取物品类型名称
export const getItemTypeName = (type) => {
  return ITEM_TYPE_NAMES[type] || '未知类型'
}

// 根据值获取颜色名称
export const getColorName = (color) => {
  return COLOR_NAMES[color] || '未知颜色'
}

// 根据值获取用户角色名称
export const getUserRoleName = (role) => {
  return USER_ROLE_NAMES[role] || '未知角色'
}

// 根据值获取失物状态名称
export const getClaimStatusName = (status) => {
  return CLAIM_STATUS_NAMES[status] || '未知状态'
}
