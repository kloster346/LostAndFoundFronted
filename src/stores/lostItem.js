import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import LostItemAPI from '../api/lostItem.js'
import { CLAIM_STATUS } from '../constants/enums.js'

/**
 * 失物状态管理 Store
 * 管理失物列表、搜索条件、分页信息等全局状态
 */
export const useLostItemStore = defineStore('lostItem', () => {
  // ==================== 状态定义 ====================

  // 失物列表
  const items = ref([])

  // 当前查看的失物详情
  const currentItem = ref(null)

  // 加载状态
  const loading = ref(false)
  const detailLoading = ref(false)
  const operationLoading = ref(false)

  // 错误状态
  const error = ref(null)

  // 搜索条件
  const searchParams = ref({
    name: '', // 物品名称
    type: null, // 物品类型
    color: null, // 物品颜色
    building: '', // 建筑
  })

  // 分页信息
  const pagination = ref({
    currentPage: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  })

  // 筛选器状态（已简化）
  const filters = ref({})

  // ==================== 计算属性 ====================

  // 是否有失物数据
  const hasItems = computed(() => {
    return items.value && items.value.length > 0
  })

  // 是否为空状态
  const isEmpty = computed(() => {
    return !loading.value && !hasItems.value
  })

  // 是否还有更多数据
  const hasMore = computed(() => {
    return pagination.value.currentPage < pagination.value.totalPages
  })

  // 筛选后的失物列表（已简化为直接返回items）
  const filteredItems = computed(() => {
    return [...items.value]
  })

  // 搜索状态
  const isSearching = computed(() => {
    return Object.values(searchParams.value).some(
      value => value !== null && value !== '' && value !== undefined
    )
  })

  // ==================== Actions ====================

  /**
   * 获取所有未领取的失物
   * @param {Object} pageParams - 分页参数
   */
  const getAllItems = async (pageParams = {}) => {
    try {
      loading.value = true
      error.value = null

      const params = {
        page: pageParams.page || pagination.value.currentPage,
        size: pageParams.size || pagination.value.pageSize,
      }

      const response = await LostItemAPI.getAllUnclaimedItems(params)

      if (pageParams.append) {
        // 追加模式（用于无限滚动）
        items.value = [...items.value, ...response.items]
      } else {
        // 替换模式
        items.value = response.items || []
      }

      // 更新分页信息
      pagination.value = {
        currentPage: response.currentPage || 1,
        pageSize: response.pageSize || 10,
        total: response.total || 0,
        totalPages: response.totalPages || 0,
      }
    } catch (err) {
      console.error('获取失物列表失败:', err)
      error.value = err.message || '获取失物列表失败'
      items.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * 搜索失物
   * @param {Object} params - 搜索参数
   */
  const searchItems = async (params = {}) => {
    try {
      loading.value = true
      error.value = null

      // 合并搜索参数
      const searchData = {
        ...searchParams.value,
        ...params,
        page: params.page || 1,
        size: params.size || pagination.value.pageSize,
      }

      const response = await LostItemAPI.searchLostItems(searchData)

      items.value = response.items || []

      // 更新分页信息
      pagination.value = {
        currentPage: response.currentPage || 1,
        pageSize: response.pageSize || 10,
        total: response.total || 0,
        totalPages: response.totalPages || 0,
      }
    } catch (err) {
      console.error('搜索失物失败:', err)
      error.value = err.message || '搜索失物失败'
      items.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取失物详情
   * @param {number} id - 失物ID
   */
  const getItemDetail = async id => {
    try {
      detailLoading.value = true
      error.value = null

      const response = await LostItemAPI.getLostItemById(id)
      currentItem.value = response

      return response
    } catch (err) {
      console.error('获取失物详情失败:', err)
      error.value = err.message || '获取失物详情失败'
      currentItem.value = null
      throw err
    } finally {
      detailLoading.value = false
    }
  }

  /**
   * 发布失物
   * @param {Object} itemData - 失物数据
   */
  const publishItem = async itemData => {
    try {
      operationLoading.value = true
      error.value = null

      const response = await LostItemAPI.publishLostItem(itemData)

      // 发布成功后，将新失物添加到列表开头
      if (response) {
        items.value.unshift(response)
        pagination.value.total += 1
      }

      return response
    } catch (err) {
      console.error('发布失物失败:', err)
      error.value = err.message || '发布失物失败'
      throw err
    } finally {
      operationLoading.value = false
    }
  }

  /**
   * 领取失物
   * @param {Object} claimData - 领取数据
   */
  const claimItem = async claimData => {
    try {
      operationLoading.value = true
      error.value = null

      const response = await LostItemAPI.claimLostItem(claimData)

      // 更新本地状态
      const itemIndex = items.value.findIndex(item => item.id === claimData.lostItemId)
      if (itemIndex !== -1) {
        items.value[itemIndex].claimStatus = CLAIM_STATUS.CLAIMED
        items.value[itemIndex].claimTime = new Date().toISOString()
      }

      // 更新当前详情
      if (currentItem.value && currentItem.value.id === claimData.lostItemId) {
        currentItem.value.claimStatus = CLAIM_STATUS.CLAIMED
        currentItem.value.claimTime = new Date().toISOString()
      }

      return response
    } catch (err) {
      console.error('领取失物失败:', err)
      error.value = err.message || '领取失物失败'
      throw err
    } finally {
      operationLoading.value = false
    }
  }

  /**
   * 删除失物
   * @param {number} id - 失物ID
   */
  const deleteItem = async id => {
    try {
      operationLoading.value = true
      error.value = null

      await LostItemAPI.deleteLostItem(id)

      // 从列表中移除
      const itemIndex = items.value.findIndex(item => item.id === id)
      if (itemIndex !== -1) {
        items.value.splice(itemIndex, 1)
        pagination.value.total -= 1
      }

      // 清除当前详情
      if (currentItem.value && currentItem.value.id === id) {
        currentItem.value = null
      }
    } catch (err) {
      console.error('删除失物失败:', err)
      error.value = err.message || '删除失物失败'
      throw err
    } finally {
      operationLoading.value = false
    }
  }

  /**
   * 获取指定管理员发布的失物
   * @param {number} adminId - 管理员ID
   * @param {Object} pageParams - 分页参数
   */
  const getAdminItems = async (adminId, pageParams = {}) => {
    try {
      loading.value = true
      error.value = null

      const params = {
        page: pageParams.page || pagination.value.currentPage,
        size: pageParams.size || pagination.value.pageSize,
      }

      const response = await LostItemAPI.getAdminLostItems(adminId, params)

      items.value = response.items || []

      // 更新分页信息
      pagination.value = {
        currentPage: response.currentPage || 1,
        pageSize: response.pageSize || 10,
        total: response.total || 0,
        totalPages: response.totalPages || 0,
      }
    } catch (err) {
      console.error('获取管理员失物失败:', err)
      error.value = err.message || '获取管理员失物失败'
      items.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新搜索参数
   * @param {Object} params - 搜索参数
   */
  const updateSearchParams = params => {
    searchParams.value = {
      ...searchParams.value,
      ...params,
    }
  }

  /**
   * 重置搜索条件
   */
  const resetSearchParams = () => {
    searchParams.value = {
      keyword: '',
      type: null,
      color: null,
      building: '',
      foundLocation: '',
      claimStatus: null,
    }
  }

  /**
   * 更新筛选器
   * @param {Object} filterData - 筛选器数据
   */
  const updateFilters = filterData => {
    filters.value = {
      ...filters.value,
      ...filterData,
    }
  }

  /**
   * 重置筛选器
   */
  const resetFilters = () => {
    filters.value = {
      showOnlyUnclaimed: false,
      sortBy: 'publishTime',
      sortOrder: 'desc',
    }
  }

  /**
   * 设置当前页码
   * @param {number} page - 页码
   */
  const setPage = page => {
    pagination.value.currentPage = page
  }

  /**
   * 设置每页大小
   * @param {number} size - 每页大小
   */
  const setPageSize = size => {
    pagination.value.pageSize = size
    pagination.value.currentPage = 1 // 重置到第一页
  }

  /**
   * 清除错误状态
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * 清除当前失物详情
   */
  const clearCurrentItem = () => {
    currentItem.value = null
  }

  /**
   * 刷新列表
   */
  const refreshItems = async () => {
    if (isSearching.value) {
      await searchItems({ page: 1 })
    } else {
      await getAllItems({ page: 1 })
    }
  }

  // ==================== 返回状态和方法 ====================

  return {
    // 状态
    items,
    currentItem,
    loading,
    detailLoading,
    operationLoading,
    error,
    searchParams,
    pagination,
    filters,

    // 计算属性
    hasItems,
    isEmpty,
    hasMore,
    filteredItems,
    isSearching,

    // 方法
    getAllItems,
    searchItems,
    getItemDetail,
    publishItem,
    claimItem,
    deleteItem,
    getAdminItems,
    updateSearchParams,
    resetSearchParams,
    updateFilters,
    resetFilters,
    setPage,
    setPageSize,
    clearError,
    clearCurrentItem,
    refreshItems,
  }
})

// 默认导出
export default useLostItemStore
