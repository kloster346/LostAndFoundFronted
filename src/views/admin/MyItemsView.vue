<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- 页面标题和操作 -->
      <div class="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">我发布的失物</h1>
          <p class="mt-2 text-gray-600">管理您发布的所有失物信息</p>
        </div>
        <div class="mt-4 sm:mt-0">
          <router-link
            to="/admin/publish"
            class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            发布新失物
          </router-link>
        </div>
      </div>

      <!-- 筛选和搜索 -->
      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- 搜索框 -->
          <div class="md:col-span-2">
            <label for="search" class="block text-sm font-medium text-gray-700 mb-1">
              搜索失物
            </label>
            <input
              id="search"
              v-model="filters.search"
              type="text"
              placeholder="搜索物品名称、地点或描述..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              @input="debouncedSearch"
            />
          </div>

          <!-- 状态筛选 -->
          <div>
            <label for="status" class="block text-sm font-medium text-gray-700 mb-1">
              状态
            </label>
            <select
              id="status"
              v-model="filters.status"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              @change="loadItems"
            >
              <option value="">全部状态</option>
              <option
                v-for="option in statusOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>

          <!-- 类型筛选 -->
          <div>
            <label for="type" class="block text-sm font-medium text-gray-700 mb-1">
              类型
            </label>
            <select
              id="type"
              v-model="filters.type"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              @change="loadItems"
            >
              <option value="">全部类型</option>
              <option
                v-for="option in itemTypeOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">总发布数</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ statistics.total }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">待认领</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ statistics.unclaimed }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">已认领</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ statistics.claimed }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">已删除</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ statistics.deleted }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 失物列表 -->
      <div class="bg-white shadow rounded-lg">
        <!-- 加载状态 -->
        <div v-if="loading" class="p-8 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-gray-600">加载中...</p>
        </div>

        <!-- 空状态 -->
        <div v-else-if="items.length === 0" class="p-8 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">暂无失物</h3>
          <p class="mt-1 text-sm text-gray-500">您还没有发布任何失物信息</p>
          <div class="mt-6">
            <router-link
              to="/admin/publish"
              class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              发布第一个失物
            </router-link>
          </div>
        </div>

        <!-- 失物列表 -->
        <div v-else class="divide-y divide-gray-200">
          <div
            v-for="item in items"
            :key="item.id"
            class="p-6 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-3">
                  <h3 class="text-lg font-medium text-gray-900 truncate">
                    {{ item.itemName }}
                  </h3>
                  <span
                    :class="getStatusClass(item.status)"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  >
                    {{ getStatusName(item.status) }}
                  </span>
                </div>
                
                <div class="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div class="flex items-center">
                    <svg class="mr-1.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {{ getItemTypeName(item.itemType) }}
                  </div>
                  
                  <div class="flex items-center">
                    <svg class="mr-1.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {{ item.location }}
                  </div>
                  
                  <div class="flex items-center">
                    <svg class="mr-1.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ formatDate(item.foundTime) }}
                  </div>
                </div>
                
                <p v-if="item.description" class="mt-2 text-sm text-gray-600 line-clamp-2">
                  {{ item.description }}
                </p>
              </div>
              
              <!-- 操作按钮 -->
              <div class="ml-6 flex items-center space-x-2">
                <button
                  @click="viewItem(item)"
                  class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  查看
                </button>
                
                <button
                  v-if="item.status === 'UNCLAIMED'"
                  @click="editItem(item)"
                  class="inline-flex items-center px-3 py-1.5 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  编辑
                </button>
                
                <button
                  v-if="item.status === 'UNCLAIMED'"
                  @click="deleteItem(item)"
                  class="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="pagination.total > pagination.pageSize" class="px-6 py-4 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700">
              显示第 {{ (pagination.current - 1) * pagination.pageSize + 1 }} - 
              {{ Math.min(pagination.current * pagination.pageSize, pagination.total) }} 条，
              共 {{ pagination.total }} 条记录
            </div>
            
            <div class="flex items-center space-x-2">
              <button
                @click="changePage(pagination.current - 1)"
                :disabled="pagination.current <= 1"
                class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                上一页
              </button>
              
              <span class="text-sm text-gray-700">
                第 {{ pagination.current }} / {{ Math.ceil(pagination.total / pagination.pageSize) }} 页
              </span>
              
              <button
                @click="changePage(pagination.current + 1)"
                :disabled="pagination.current >= Math.ceil(pagination.total / pagination.pageSize)"
                class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                下一页
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LostItemAPI from '@/api/lostItem'
import { 
  ITEM_TYPES, 
  ITEM_TYPE_NAMES, 
  CLAIM_STATUS, 
  CLAIM_STATUS_NAMES 
} from '@/constants/enums'

export default {
  name: 'MyItemsView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const loading = ref(false)
    const items = ref([])
    
    // 筛选条件
    const filters = reactive({
      search: '',
      status: '',
      type: ''
    })
    
    // 分页信息
    const pagination = reactive({
      current: 1,
      pageSize: 10,
      total: 0
    })
    
    // 统计信息
    const statistics = reactive({
      total: 0,
      unclaimed: 0,
      claimed: 0,
      deleted: 0
    })

    // 状态选项
    const statusOptions = computed(() => {
      return Object.entries(CLAIM_STATUS).map(([key, value]) => ({
        value,
        label: CLAIM_STATUS_NAMES[value] || value
      }))
    })

    // 物品类型选项
    const itemTypeOptions = computed(() => {
      return Object.entries(ITEM_TYPES).map(([key, value]) => ({
        value,
        label: ITEM_TYPE_NAMES[value] || value
      }))
    })

    // 检查管理员权限
    const checkAdminPermission = () => {
      if (!authStore.isLoggedIn || !authStore.isAdmin) {
        router.push('/login')
        return false
      }
      return true
    }

    // 获取状态样式类
    const getStatusClass = (status) => {
      const statusClasses = {
        'UNCLAIMED': 'bg-yellow-100 text-yellow-800',
        'CLAIMED': 'bg-green-100 text-green-800',
        'DELETED': 'bg-red-100 text-red-800'
      }
      return statusClasses[status] || 'bg-gray-100 text-gray-800'
    }

    // 获取状态名称
    const getStatusName = (status) => {
      return CLAIM_STATUS_NAMES[status] || status
    }

    // 获取物品类型名称
    const getItemTypeName = (type) => {
      return ITEM_TYPE_NAMES[type] || type
    }

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // 加载失物列表
    const loadItems = async () => {
      if (!checkAdminPermission()) return
      
      try {
        loading.value = true
        
        const params = {
          page: pagination.current,
          pageSize: pagination.pageSize,
          search: filters.search || undefined,
          status: filters.status || undefined,
          itemType: filters.type || undefined,
          publisherId: authStore.user?.id // 只获取当前管理员发布的失物
        }
        
        // 移除空值参数
        Object.keys(params).forEach(key => {
          if (params[key] === undefined || params[key] === '') {
            delete params[key]
          }
        })
        
        const response = await LostItemAPI.getLostItems(params)
        
        if (response.success) {
          items.value = response.data.items || []
          pagination.total = response.data.total || 0
          
          // 更新统计信息
          updateStatistics()
        } else {
          throw new Error(response.message || '获取失物列表失败')
        }
      } catch (error) {
        console.error('获取失物列表失败:', error)
        alert(error.message || '获取失物列表失败')
      } finally {
        loading.value = false
      }
    }

    // 更新统计信息
    const updateStatistics = () => {
      statistics.total = items.value.length
      statistics.unclaimed = items.value.filter(item => item.status === 'UNCLAIMED').length
      statistics.claimed = items.value.filter(item => item.status === 'CLAIMED').length
      statistics.deleted = items.value.filter(item => item.status === 'DELETED').length
    }

    // 防抖搜索
    let searchTimeout = null
    const debouncedSearch = () => {
      clearTimeout(searchTimeout)
      searchTimeout = setTimeout(() => {
        pagination.current = 1
        loadItems()
      }, 500)
    }

    // 切换页码
    const changePage = (page) => {
      if (page < 1 || page > Math.ceil(pagination.total / pagination.pageSize)) return
      pagination.current = page
      loadItems()
    }

    // 查看失物详情
    const viewItem = (item) => {
      // 可以跳转到详情页面或打开模态框
      router.push(`/lost-items/${item.id}`)
    }

    // 编辑失物
    const editItem = (item) => {
      // 可以跳转到编辑页面或打开编辑模态框
      router.push(`/admin/edit/${item.id}`)
    }

    // 删除失物
    const deleteItem = async (item) => {
      if (!confirm(`确定要删除失物「${item.itemName}」吗？此操作不可恢复。`)) {
        return
      }
      
      try {
        const response = await LostItemAPI.deleteLostItem(item.id)
        
        if (response.success) {
          alert('删除成功')
          loadItems() // 重新加载列表
        } else {
          throw new Error(response.message || '删除失败')
        }
      } catch (error) {
        console.error('删除失物失败:', error)
        alert(error.message || '删除失败，请重试')
      }
    }

    // 组件挂载时加载数据
    onMounted(() => {
      if (checkAdminPermission()) {
        loadItems()
      }
    })

    return {
      loading,
      items,
      filters,
      pagination,
      statistics,
      statusOptions,
      itemTypeOptions,
      getStatusClass,
      getStatusName,
      getItemTypeName,
      formatDate,
      loadItems,
      debouncedSearch,
      changePage,
      viewItem,
      editItem,
      deleteItem
    }
  }
}
</script>

<style scoped>
/* 自定义样式 */
.transition-colors {
  transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out, color 0.2s ease-in-out;
}

/* 文本截断 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 加载动画 */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>