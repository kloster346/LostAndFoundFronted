<template>
  <div class="my-items-container">
    <div class="content-wrapper">
      <!-- 页面标题和操作 -->
      <el-row class="header-section" justify="space-between" align="middle">
        <el-col :span="16">
          <h1 class="page-title">我发布的失物</h1>
          <p class="page-subtitle">管理您发布的所有失物信息</p>
        </el-col>
        <el-col :span="8" class="header-actions">
          <el-button type="primary" @click="$router.push('/admin/publish')">
            <el-icon><Plus /></el-icon>
            发布新失物
          </el-button>
        </el-col>
      </el-row>

      <!-- 筛选和搜索 -->
      <el-card class="filter-section">
        <el-row :gutter="16">
          <!-- 搜索框 -->
          <el-col :span="12">
            <el-form-item label="搜索失物">
              <el-input
                v-model="filters.search"
                placeholder="搜索物品名称、地点或描述..."
                @input="debouncedSearch"
                clearable
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>

          <!-- 状态筛选 -->
          <el-col :span="6">
            <el-form-item label="状态">
              <el-select
                v-model="filters.status"
                placeholder="全部状态"
                @change="loadItems"
                clearable
              >
                <el-option
                  v-for="option in statusOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <!-- 类型筛选 -->
          <el-col :span="6">
            <el-form-item label="类型">
              <el-select
                v-model="filters.type"
                placeholder="全部类型"
                @change="loadItems"
                clearable
              >
                <el-option
                  v-for="option in itemTypeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- 统计信息 -->
      <el-row :gutter="16" class="stats-section">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <el-icon class="stat-icon"><Document /></el-icon>
              <div class="stat-info">
                <div class="stat-label">总发布数</div>
                <div class="stat-value">{{ statistics.total }}</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <el-icon class="stat-icon pending"><Clock /></el-icon>
              <div class="stat-info">
                <div class="stat-label">待认领</div>
                <div class="stat-value">{{ statistics.unclaimed }}</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <el-icon class="stat-icon claimed"><CircleCheck /></el-icon>
              <div class="stat-info">
                <div class="stat-label">已认领</div>
                <div class="stat-value">{{ statistics.claimed }}</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <el-icon class="stat-icon deleted"><Delete /></el-icon>
              <div class="stat-info">
                <div class="stat-label">已删除</div>
                <div class="stat-value">{{ statistics.deleted }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 失物列表 -->
      <el-card class="items-list">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <el-icon class="is-loading"><Loading /></el-icon>
          <p class="loading-text">加载中...</p>
        </div>

        <!-- 空状态 -->
        <el-empty v-else-if="lostItemStore.items.length === 0" description="您还没有发布任何失物信息">
          <el-button type="primary" @click="$router.push('/admin/publish')">
            <el-icon><Plus /></el-icon>
            发布第一个失物
          </el-button>
        </el-empty>

        <!-- 失物列表 -->
        <div v-else class="items-container">
          <div v-for="item in lostItemStore.items" :key="item.id" class="item-row">
            <el-row align="middle" :gutter="16">
              <el-col :span="2">
                <!-- 物品图片 -->
                <el-image
                  v-if="item.imageUrl"
                  :src="getImageUrl(item.imageUrl)"
                  :alt="item.name"
                  class="item-image"
                  fit="cover"
                  @error="(e) => handleImageError(e, item.type)"
                />
                <div v-else class="item-image-placeholder">
                  <el-icon><Picture /></el-icon>
                </div>
              </el-col>

              <el-col :span="14">
                <!-- 物品信息 -->
                <div class="item-info">
                  <div class="item-header">
                    <h3 class="item-name">{{ item.name }}</h3>
                    <div class="item-meta">
                      <el-tag :type="getStatusTagType(item.isClaimed)" size="small">
                        {{ getStatusName(item.isClaimed) }}
                      </el-tag>
                      <span class="item-date">{{ formatDate(item.publishTime) }}</span>
                    </div>
                  </div>
                  <div class="item-details">
                    <span class="item-type">{{ getItemTypeName(item.type) }}</span>
                    <span class="item-location">{{ getBuildingName(item.building) }} {{ item.specificLocation }}</span>
                  </div>
                  <p class="item-description">{{ item.description }}</p>
                </div>
              </el-col>

              <el-col :span="8" class="item-actions">
                <!-- 操作按钮 -->
                <el-button-group>
                  <el-button @click="viewItem(item)" size="small"> 查看 </el-button>
                  <el-button
                    v-if="item.isClaimed === 0"
                    @click="editItem(item)"
                    type="primary"
                    size="small"
                  >
                    编辑
                  </el-button>
                  <el-button
                    v-if="item.isClaimed === 0"
                    @click="deleteItem(item)"
                    type="danger"
                    size="small"
                  >
                    删除
                  </el-button>
                </el-button-group>
              </el-col>
            </el-row>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="lostItemStore.pagination.total > lostItemStore.pagination.pageSize" class="pagination-container">
          <el-pagination
          v-model:current-page="lostItemStore.pagination.currentPage"
          v-model:page-size="lostItemStore.pagination.pageSize"
          :total="lostItemStore.pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { useLostItemStore } from '@/stores/lostItem'
import { debounce } from 'lodash-es'
import LostItemAPI from '@/api/lostItem'
import { ITEM_TYPES, ITEM_TYPE_NAMES, CLAIM_STATUS, CLAIM_STATUS_NAMES, BUILDINGS, BUILDING_NAMES } from '@/constants/enums'
import { Plus, Search, Picture, Edit, Delete, View, Document, Clock, CircleCheck, Loading } from '@element-plus/icons-vue'
import { getImageUrl, handleImageError } from '@/utils/imageUtils'

export default {
  name: 'MyItemsView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const lostItemStore = useLostItemStore()

    const loading = ref(false)
    const items = ref([])

    // 筛选条件
    const filters = reactive({
      search: '',
      status: '',
      type: '',
    })



    // 统计信息
    const statistics = reactive({
      total: 0,
      unclaimed: 0,
      claimed: 0,
      deleted: 0,
    })

    // 状态选项
    const statusOptions = computed(() => {
      return Object.entries(CLAIM_STATUS).map(([_key, value]) => ({
        value,
        label: CLAIM_STATUS_NAMES[value] || value,
      }))
    })

    // 物品类型选项
    const itemTypeOptions = computed(() => {
      return Object.entries(ITEM_TYPES).map(([_key, value]) => ({
        value,
        label: ITEM_TYPE_NAMES[value] || value,
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

    // 获取状态标签类型
    const getStatusTagType = isClaimed => {
      return isClaimed === 0 ? 'success' : 'info'
    }

    // 获取状态名称
    const getStatusName = isClaimed => {
      return isClaimed === 0 ? '未认领' : '已认领'
    }

    // 获取物品类型名称
    const getItemTypeName = type => {
      return ITEM_TYPE_NAMES[type] || type
    }

    // 获取建筑物名称
    const getBuildingName = buildingCode => {
      return BUILDING_NAMES[buildingCode] || '未知楼栋'
    }

    // 格式化日期
    const formatDate = dateString => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    // 加载失物列表
    const loadItems = async () => {
      try {
        loading.value = true
        
        const adminId = authStore.currentUser?.id
        if (!adminId) {
          ElMessage.error('管理员信息获取失败，请重新登录')
          return
        }

        await lostItemStore.getAdminItems(adminId, {
          pageNum: lostItemStore.pagination.currentPage,
          pageSize: lostItemStore.pagination.pageSize
        })

        // 更新统计信息
        updateStatistics()
      } catch (error) {
        console.error('获取失物列表失败:', error)
        ElMessage.error('获取失物列表失败')
      } finally {
        loading.value = false
      }
    }

    // 更新统计信息
    const updateStatistics = () => {
      const items = lostItemStore.items
      statistics.total = items.length
      statistics.unclaimed = items.filter(item => item.isClaimed === 0).length
      statistics.claimed = items.filter(item => item.isClaimed === 1).length
    }

    // 防抖搜索
    const debouncedSearch = debounce(() => {
      lostItemStore.pagination.currentPage = 1
      loadItems()
    }, 500)

    // 分页处理
    const handleCurrentChange = (page) => {
      loadItems()
    }

    const handleSizeChange = (size) => {
      lostItemStore.pagination.currentPage = 1
      loadItems()
    }

    // 查看失物详情
    const viewItem = item => {
      // 跳转到详情页面
      router.push(`/admin/items/${item.id}`)
    }

    // 编辑失物
    const editItem = item => {
      // 跳转到编辑页面
      router.push(`/admin/items/edit/${item.id}`)
    }

    // 删除失物
    const deleteItem = async item => {
      try {
        await ElMessageBox.confirm(
          `确定要删除失物「${item.name}」吗？此操作不可恢复。`,
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        await lostItemStore.deleteItem(item.id)
        ElMessage.success('删除成功')
        await loadItems() // 重新加载列表
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失物失败:', error)
          ElMessage.error('删除失败，请重试')
        }
      }
    }

    // 监听认证状态变化
    watch(
      () => authStore.isLoggedIn,
      (newValue) => {
        if (newValue && checkAdminPermission()) {
          loadItems()
        }
      },
      { immediate: true }
    )

    // 组件挂载时加载数据
    onMounted(() => {
      // 如果已经登录，立即加载数据
      if (authStore.isLoggedIn && checkAdminPermission()) {
        loadItems()
      }
    })

    return {
      loading,
      items,
      filters,
      statistics,
      statusOptions,
      itemTypeOptions,
      lostItemStore,
      getStatusTagType,
      getStatusName,
      getItemTypeName,
      getBuildingName,
      formatDate,
      loadItems,
      debouncedSearch,
      handleCurrentChange,
      handleSizeChange,
      viewItem,
      editItem,
      deleteItem,
      getImageUrl,
      handleImageError,
    }
  },
}
</script>

<style scoped>
.my-items-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 2rem 0;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.header-section {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #303133;
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  color: #909399;
  margin: 0;
}

.filter-section {
  margin-bottom: 1.5rem;
}

.stats-section {
  margin-bottom: 1.5rem;
}

.stat-card {
  height: 100%;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 2rem;
  color: #909399;
}

.stat-icon.pending {
  color: #e6a23c;
}

.stat-icon.found,
.stat-icon.claimed {
  color: #67c23a;
}

.stat-icon.closed,
.stat-icon.deleted {
  color: #f56c6c;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #909399;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #303133;
}

.items-list {
  min-height: 400px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
}

.loading-text {
  color: #909399;
  margin: 0;
}

.items-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.item-row {
  padding: 1rem;
  border-bottom: 1px solid #ebeef5;
  transition: background-color 0.3s;
}

.item-row:hover {
  background-color: #f5f7fa;
}

.item-row:last-child {
  border-bottom: none;
}

.item-image {
  width: 64px;
  height: 64px;
  border-radius: 8px;
}

.item-image-placeholder {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
  font-size: 1.5rem;
}

.item-info {
  flex: 1;
}

.item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.item-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.item-date {
  font-size: 0.875rem;
  color: #909399;
}

.item-details {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.item-type,
.item-location {
  font-size: 0.875rem;
  color: #606266;
}

.item-type::after {
  content: '·';
  margin-left: 0.5rem;
  color: #c0c4cc;
}

.item-description {
  font-size: 0.875rem;
  color: #909399;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding: 1rem 0;
  border-top: 1px solid #ebeef5;
  margin-top: 1rem;
}

.header-actions {
  text-align: right;
}

.item-actions {
  text-align: right;
}
</style>

<style scoped>
/* 自定义样式 */
.transition-colors {
  transition:
    background-color 0.2s ease-in-out,
    border-color 0.2s ease-in-out,
    color 0.2s ease-in-out;
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
