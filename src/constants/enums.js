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
  OTHER: 10,
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
  [ITEM_TYPES.OTHER]: '其他',
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
  OTHER: 18,
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
  [COLORS.OTHER]: '其他',
}

// 用户角色枚举
export const USER_ROLES = {
  NORMAL_USER: 'normal_user',
  LOST_ITEM_ADMIN: 'lost_item_admin',
  SUPER_ADMIN: 'super_admin',
}

// 用户角色显示名称映射
export const USER_ROLE_NAMES = {
  [USER_ROLES.NORMAL_USER]: '普通用户',
  [USER_ROLES.LOST_ITEM_ADMIN]: '失物管理员',
  [USER_ROLES.SUPER_ADMIN]: '总管理员',
}

// 失物状态枚举
export const CLAIM_STATUS = {
  UNCLAIMED: 0,
  CLAIMED: 1,
}

// 失物状态显示名称映射
export const CLAIM_STATUS_NAMES = {
  [CLAIM_STATUS.UNCLAIMED]: '未领取',
  [CLAIM_STATUS.CLAIMED]: '已领取',
}

// HTTP 状态码
export const HTTP_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
}

// 分页默认配置
export const PAGINATION = {
  DEFAULT_PAGE_NUM: 1,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
}

// 本地存储键名
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_INFO: 'userInfo',
  USER_ROLE: 'userRole',
}

// 获取物品类型选项列表
export const getItemTypeOptions = () => {
  return Object.entries(ITEM_TYPE_NAMES).map(([value, label]) => ({
    value: parseInt(value),
    label,
  }))
}

// 获取颜色选项列表
export const getColorOptions = () => {
  return Object.entries(COLOR_NAMES).map(([value, label]) => ({
    value: parseInt(value),
    label,
  }))
}

// 获取用户角色选项列表
export const getUserRoleOptions = () => {
  return Object.entries(USER_ROLE_NAMES).map(([value, label]) => ({
    value,
    label,
  }))
}

// 根据值获取物品类型名称
export const getItemTypeName = type => {
  return ITEM_TYPE_NAMES[type] || '未知类型'
}

// 根据值获取颜色名称
export const getColorName = color => {
  return COLOR_NAMES[color] || '未知颜色'
}

// 根据值获取用户角色名称
export const getUserRoleName = role => {
  return USER_ROLE_NAMES[role] || '未知角色'
}

// 根据值获取失物状态名称
export const getClaimStatusName = status => {
  return CLAIM_STATUS_NAMES[status] || '未知状态'
}

// 楼栋编号枚举（与后端BuildingEnum保持一致）
export const BUILDINGS = {
  XUEYOU_LOU: 1,
  XIAOYOU_LOU: 2,
  WENZONG_LOU: 3,
  YIFU_LOU: 4,
  XINGZHENG_LOU: 5,
  AI_COLLEGE: 6,
  WEN_COLLEGE: 7,
  MATH_PHYSICS_COLLEGE: 8,
  LAW_COLLEGE: 9,
  PEOPLE_ARMED_COLLEGE: 10,
  SI_SLOP_CANTEEN: 11,
  WU_SLOP_CANTEEN: 12,
  BA_SLOP_CANTEEN: 13,
  DAFENG_COURT: 14,
  TRACK_FIELD: 15,
  GYM: 16,
  ROADSIDE: 17,
  LAKESIDE_FOUR_SLOP: 18,
  LAKESIDE_FIVE_SLOP: 19,
  SOUTH_GATE: 20,
  NORTH_GATE: 21,
  EAST_GATE: 22,
  SUBWAY_GATE: 23,
  OTHER: 24,
}

// 楼栋名称映射
export const BUILDING_NAMES = {
  [BUILDINGS.XUEYOU_LOU]: '学友楼',
  [BUILDINGS.XIAOYOU_LOU]: '校友楼',
  [BUILDINGS.WENZONG_LOU]: '文综楼',
  [BUILDINGS.YIFU_LOU]: '逸夫楼',
  [BUILDINGS.XINGZHENG_LOU]: '行政楼',
  [BUILDINGS.AI_COLLEGE]: '人工智能学院',
  [BUILDINGS.WEN_COLLEGE]: '文学院',
  [BUILDINGS.MATH_PHYSICS_COLLEGE]: '数学与物理学院',
  [BUILDINGS.LAW_COLLEGE]: '法学院',
  [BUILDINGS.PEOPLE_ARMED_COLLEGE]: '人民武装学院',
  [BUILDINGS.SI_SLOP_CANTEEN]: '四坡食堂',
  [BUILDINGS.WU_SLOP_CANTEEN]: '五坡食堂',
  [BUILDINGS.BA_SLOP_CANTEEN]: '八坡食堂',
  [BUILDINGS.DAFENG_COURT]: '大丰球场',
  [BUILDINGS.TRACK_FIELD]: '田径场',
  [BUILDINGS.GYM]: '体育馆',
  [BUILDINGS.ROADSIDE]: '路边',
  [BUILDINGS.LAKESIDE_FOUR_SLOP]: '湖边（四坡）',
  [BUILDINGS.LAKESIDE_FIVE_SLOP]: '湖边（五坡）',
  [BUILDINGS.SOUTH_GATE]: '南门',
  [BUILDINGS.NORTH_GATE]: '北门',
  [BUILDINGS.EAST_GATE]: '东门',
  [BUILDINGS.SUBWAY_GATE]: '地铁小门',
  [BUILDINGS.OTHER]: '其他',
}

// 获取楼栋选项列表
export const getBuildingOptions = () => {
  return Object.entries(BUILDINGS).map(([_key, value]) => ({
    value,
    label: BUILDING_NAMES[value],
  }))
}

// 根据值获取楼栋名称
export const getBuildingName = building => {
  return BUILDING_NAMES[building] || '未知楼栋'
}
