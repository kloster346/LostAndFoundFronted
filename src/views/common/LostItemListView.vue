<template>
  <div class="lost-item-list-view">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">失物招领</h1>
      <p class="page-subtitle">浏览和搜索校园失物信息</p>
    </div>

    <!-- 搜索区域 -->
    <div class="search-section">
      <SearchForm
        :loading="loading"
        @search="handleSearch"
        @reset="handleReset"
      />
    </div>

    <!-- 搜索结果统计 -->
    <div v-if="isSearching" class="search-stats">
      <span class="stats-text">
        找到 <strong>{{ pagination.total }}</strong> 条相关失物
      </span>
      <BaseButton
        type="secondary"
        size="small"
        @click="handleReset"
      >
        清除搜索
      </BaseButton>
    </div>

    <!-- 失物列表区域 -->
    <div class="list-section">
      <!-- 加载状态 -->
      <div v-if="loading && !hasItems" class="loading-state">
        <div class="skeleton-grid">
          <div
            v-for="i in 6"
            :key="i"
            class="skeleton-card"
          >
            <div class="skeleton-image"></div>
            <div class="skeleton-content">
              <div class="skeleton-title"></div>
              <div class="skeleton-meta"></div>
              <div class="skeleton-meta"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 失物网格 -->
      <div v-else-if="hasItems" class="items-grid">
        <LostItemCard
          v-for="item in filteredItems"
          :key="item.id"
          :item="item"
          @view-detail="handleItemClick"
          @claim="handleClaim"
        />
      </div>

      <!-- 空状态 -->
      <div v-else-if="isEmpty" class="empty-state">
        <div class="empty-icon">📦</div>
        <h3 class="empty-title">
          {{ isSearching ? '未找到相关失物' : '暂无失物信息' }}
        </h3>
        <p class="empty-description">
          {{ isSearching ? '请尝试调整搜索条件' : '目前还没有失物信息，请稍后再来查看' }}
        </p>
        <BaseButton
          v-if="isSearching"
          type="primary"
          @click="handleReset"
        >
          重置搜索
        </BaseButton>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <h3 class="error-title">加载失败</h3>
        <p class="error-description">{{ error }}</p>
        <BaseButton
          type="primary"
          @click="handleRetry"
        >
          重试
        </BaseButton>
      </div>
    </div>

    <!-- 分页区域 -->
    <div v-if="hasItems && pagination.totalPages > 1" class="pagination-section">
      <div class="pagination-info">
        <span class="page-info">
          第 {{ pagination.currentPage }} 页，共 {{ pagination.totalPages }} 页
        </span>
        <span class="total-info">
          共 {{ pagination.total }} 条记录
        </span>
      </div>

      <div class="pagination-controls">
        <BaseButton
          type="secondary"
          size="small"
          :disabled="pagination.currentPage <= 1"
          @click="handlePrevPage"
        >
          上一页
        </BaseButton>

        <div class="page-numbers">
          <BaseButton
            v-for="page in visiblePages"
            :key="page"
            :type="page === pagination.currentPage ? 'primary' : 'secondary'"
            size="small"
            class="page-btn"
            @click="handlePageChange(page)"
          >
            {{ page }}
          </BaseButton>
        </div>

        <BaseButton
          type="secondary"
          size="small"
          :disabled="pagination.currentPage >= pagination.totalPages"
          @click="handleNextPage"
        >
          下一页
        </BaseButton>
      </div>

      <!-- 加载更多按钮（移动端友好） -->
      <div v-if="hasMore" class="load-more-section">
        <BaseButton
          type="primary"
          size="large"
          :loading="loading"
          @click="handleLoadMore"
        >
          加载更多
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLostItemStore } from '../../stores/lostItem.js'
import SearchForm from '../../components/forms/SearchForm.vue'
import LostItemCard from '../../components/cards/LostItemCard.vue'
import BaseButton from '../../components/common/BaseButton.vue'

// 路由
const router = useRouter()

// 状态管理
const lostItemStore = useLostItemStore()

// 解构状态和方法
const {
  loading,
  error,
  pagination,
  hasItems,
  isEmpty,
  hasMore,
  filteredItems,
  isSearching,
  getAllItems,
  searchItems,
  updateSearchParams,
  resetSearchParams
} = lostItemStore

// 本地状态
const searchDebounceTimer = ref(null)

// 计算属性
const visiblePages = computed(() => {
  const current = pagination.value.currentPage
  const total = pagination.value.totalPages
  const pages = []

  // 显示当前页前后各2页
  const start = Math.max(1, current - 2)
  const end = Math.min(total, current + 2)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

// 事件处理
const handleSearch = (searchData) => {
  // 清除之前的防抖定时器
  if (searchDebounceTimer.value) {
    clearTimeout(searchDebounceTimer.value)
  }

  // 设置防抖
  searchDebounceTimer.value = setTimeout(() => {
    updateSearchParams(searchData)
    searchItems({ ...searchData, page: 1 })
  }, 300)
}

const handleReset = () => {
  resetSearchParams()
  getAllItems({ page: 1 })
}

const handleRetry = () => {
  if (isSearching.value) {
    searchItems()
  } else {
    getAllItems()
  }
}

const handleItemClick = (item) => {
  // 跳转到失物详情页
  router.push(`/lost-items/${item.id}`)
}

const handleClaim = (item) => {
  // 跳转到失物领取页面
  router.push(`/lost-items/${item.id}/claim`)
}

const handlePageChange = (page) => {
  if (isSearching.value) {
    searchItems({ page })
  } else {
    getAllItems({ page })
  }
}

const handlePrevPage = () => {
  if (pagination.value.currentPage > 1) {
    handlePageChange(pagination.value.currentPage - 1)
  }
}

const handleNextPage = () => {
  if (pagination.value.currentPage < pagination.value.totalPages) {
    handlePageChange(pagination.value.currentPage + 1)
  }
}

const handleLoadMore = () => {
  const nextPage = pagination.value.currentPage + 1
  if (isSearching.value) {
    searchItems({ page: nextPage, append: true })
  } else {
    getAllItems({ page: nextPage, append: true })
  }
}

// 生命周期
onMounted(async () => {
  try {
    // 页面加载时获取失物列表
    await getAllItems()
  } catch (err) {
    console.error('页面初始化失败:', err)
  }
})

// 监听路由变化，重新加载数据
watch(
  () => router.currentRoute.value.query,
  (newQuery) => {
    // 如果URL中有搜索参数，应用搜索
    if (Object.keys(newQuery).length > 0) {
      updateSearchParams(newQuery)
      searchItems(newQuery)
    }
  },
  { immediate: true }
)

// 组件卸载时清理定时器
onUnmounted(() => {
  if (searchDebounceTimer.value) {
    clearTimeout(searchDebounceTimer.value)
  }
})
</script>

<style scoped>
.lost-item-list-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem 1rem;
}

/* 页面标题 */
.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page-subtitle {
  font-size: 1.1rem;
  color: #718096;
  margin: 0;
}

/* 搜索区域 */
.search-section {
  max-width: 800px;
  margin: 0 auto 2rem auto;
}

/* 搜索统计 */
.search-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto 1.5rem auto;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stats-text {
  color: #4a5568;
  font-size: 0.95rem;
}

/* 列表区域 */
.list-section {
  max-width: 1200px;
  margin: 0 auto;
}

/* 失物网格 */
.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

/* 加载状态 */
.loading-state {
  margin-bottom: 2rem;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.skeleton-card {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-image {
  width: 100%;
  height: 200px;
  background: #e2e8f0;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.skeleton-title {
  height: 1.5rem;
  background: #e2e8f0;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.skeleton-meta {
  height: 1rem;
  background: #f7fafc;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.skeleton-meta:last-child {
  width: 60%;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 0.5rem 0;
}

.empty-description {
  color: #718096;
  margin: 0 0 2rem 0;
  line-height: 1.6;
}

/* 错误状态 */
.error-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #e53e3e;
  margin: 0 0 0.5rem 0;
}

.error-description {
  color: #718096;
  margin: 0 0 2rem 0;
  line-height: 1.6;
}

/* 分页区域 */
.pagination-section {
  margin-top: 3rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.pagination-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  color: #718096;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.page-btn {
  min-width: 2.5rem;
}

.load-more-section {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .lost-item-list-view {
    padding: 1rem 0.5rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .items-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .skeleton-grid {
    grid-template-columns: 1fr;
  }

  .search-stats {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .pagination-info {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }

  .pagination-controls {
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .page-numbers {
    order: 2;
    width: 100%;
    justify-content: center;
    margin: 0.5rem 0;
  }
}

@media (max-width: 480px) {
  .empty-state,
  .error-state {
    padding: 2rem 1rem;
  }

  .empty-icon,
  .error-icon {
    font-size: 3rem;
  }

  .pagination-section {
    padding: 1rem;
  }
}
</style>
