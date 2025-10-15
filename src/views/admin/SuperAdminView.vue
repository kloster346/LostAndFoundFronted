<template>
  <div class="super-admin-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">
            <el-icon><Setting /></el-icon>
            总管理员控制台
          </h1>
          <p class="page-description">系统管理和数据统计</p>
        </div>
        <div class="header-right">
          <el-button type="primary" @click="refreshData">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 侧边导航 -->
      <div class="sidebar">
        <el-menu :default-active="activeMenu" class="admin-menu" @select="handleMenuSelect">
          <el-menu-item index="dashboard">
            <el-icon><DataAnalysis /></el-icon>
            <span>数据统计</span>
          </el-menu-item>
          <el-menu-item index="all-items">
            <el-icon><Box /></el-icon>
            <span>所有失物</span>
          </el-menu-item>
          <el-menu-item index="user-management">
            <el-icon><UserFilled /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="admin-management">
            <el-icon><User /></el-icon>
            <span>管理员管理</span>
          </el-menu-item>
        </el-menu>
      </div>

      <!-- 内容区域 -->
      <div class="content-area">
        <!-- 数据统计面板 -->
        <div v-if="activeMenu === 'dashboard'" class="dashboard-panel">
          <div class="stats-cards">
            <!-- 统计卡片 -->
            <el-card class="stat-card" shadow="hover">
              <div class="stat-content">
                <div class="stat-icon lost-items">
                  <el-icon><Box /></el-icon>
                </div>
                <div class="stat-info">
                  <h3>{{ statistics.totalItems }}</h3>
                  <p>失物总数</p>
                </div>
              </div>
            </el-card>

            <el-card class="stat-card" shadow="hover">
              <div class="stat-content">
                <div class="stat-icon claimed-items">
                  <el-icon><Check /></el-icon>
                </div>
                <div class="stat-info">
                  <h3>{{ statistics.claimedItems }}</h3>
                  <p>已领取</p>
                </div>
              </div>
            </el-card>

            <el-card class="stat-card" shadow="hover">
              <div class="stat-content">
                <div class="stat-icon unclaimed-items">
                  <el-icon><Clock /></el-icon>
                </div>
                <div class="stat-info">
                  <h3>{{ statistics.unclaimedItems }}</h3>
                  <p>待领取</p>
                </div>
              </div>
            </el-card>

            <el-card class="stat-card" shadow="hover">
              <div class="stat-content">
                <div class="stat-icon active-admins">
                  <el-icon><UserFilled /></el-icon>
                </div>
                <div class="stat-info">
                  <h3>{{ statistics.activeAdmins }}</h3>
                  <p>活跃管理员</p>
                </div>
              </div>
            </el-card>
          </div>

          <!-- 图表区域 -->
          <div class="charts-section">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-card class="chart-card" shadow="hover">
                  <template #header>
                    <span>失物类型分布</span>
                  </template>
                  <div id="itemTypeChart" class="chart-container"></div>
                </el-card>
              </el-col>
              <el-col :span="12">
                <el-card class="chart-card" shadow="hover">
                  <template #header>
                    <span>每日新增趋势</span>
                  </template>
                  <div id="dailyTrendChart" class="chart-container"></div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </div>

        <!-- 所有失物管理面板 -->
        <div v-else-if="activeMenu === 'all-items'" class="all-items-panel">
          <div class="panel-header">
            <h2>所有失物管理</h2>
            <div class="header-actions">
              <el-input
                v-model="itemSearchKeyword"
                placeholder="搜索失物名称、类型、位置..."
                style="width: 300px; margin-right: 12px"
                clearable
                @input="searchItems"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-button @click="refreshItems">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </div>

          <el-card class="items-list-card" shadow="hover">
            <el-table
              :data="allItemsList"
              style="width: 100%"
              v-loading="itemsLoading"
              @row-click="viewItemDetail"
            >
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="name" label="失物名称" min-width="120" />
              <el-table-column prop="type" label="类型" width="100" />
              <el-table-column prop="color" label="颜色" width="80" />
              <el-table-column prop="location" label="发现位置" min-width="150" />
              <el-table-column prop="adminName" label="发布管理员" width="120" />
              <el-table-column prop="isClaimed" label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.isClaimed ? 'success' : 'warning'">
                    {{ scope.row.isClaimed ? '已领取' : '待领取' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="createdAt" label="发布时间" width="160" />
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="scope">
                  <el-button size="small" @click.stop="viewItemDetail(scope.row)">详情</el-button>
                  <el-button size="small" type="danger" @click.stop="deleteItem(scope.row)"
                    >删除</el-button
                  >
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="itemsPagination.current"
                v-model:page-size="itemsPagination.size"
                :page-sizes="[10, 20, 50, 100]"
                :total="itemsPagination.total"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleItemsPageSizeChange"
                @current-change="handleItemsPageChange"
              />
            </div>
          </el-card>
        </div>

        <!-- 用户管理面板 -->
        <div v-else-if="activeMenu === 'user-management'" class="user-management-panel">
          <div class="panel-header">
            <h2>用户管理</h2>
            <div class="header-actions">
              <el-input
                v-model="userSearchKeyword"
                placeholder="搜索用户名、邮箱..."
                style="width: 300px; margin-right: 12px"
                clearable
                @input="searchUsers"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-button @click="refreshUsers">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </div>

          <el-card class="users-list-card" shadow="hover">
            <el-table :data="usersList" style="width: 100%" v-loading="usersLoading">
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="username" label="用户名" min-width="120" />
              <el-table-column prop="email" label="邮箱" min-width="180" />
              <el-table-column prop="phone" label="手机号" width="130" />
              <el-table-column prop="studentId" label="学号" width="120" />
              <el-table-column prop="claimedCount" label="领取次数" width="100" />
              <el-table-column prop="createdAt" label="注册时间" width="160" />
              <el-table-column label="操作" width="100" fixed="right">
                <template #default="scope">
                  <el-button size="small" @click="viewUserDetail(scope.row)">详情</el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="usersPagination.current"
                v-model:page-size="usersPagination.size"
                :page-sizes="[10, 20, 50, 100]"
                :total="usersPagination.total"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleUsersPageSizeChange"
                @current-change="handleUsersPageChange"
              />
            </div>
          </el-card>
        </div>

        <!-- 管理员管理面板 -->
        <div v-else-if="activeMenu === 'admin-management'" class="admin-management-panel">
          <div class="panel-header">
            <h2>管理员账户管理</h2>
            <div class="panel-actions">
              <el-input
                v-model="adminSearchKeyword"
                placeholder="搜索管理员..."
                style="width: 300px; margin-right: 12px"
                clearable
                @keyup.enter="searchAdmins"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-button type="primary" @click="searchAdmins">
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
              <el-button @click="refreshAdmins">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </div>

          <!-- 管理员列表 -->
          <el-card class="admin-list-card" shadow="hover">
            <el-table
              :data="
                adminsList.slice(
                  (adminsPagination.current - 1) * adminsPagination.size,
                  adminsPagination.current * adminsPagination.size
                )
              "
              style="width: 100%"
              v-loading="adminsLoading"
              @row-click="viewAdminDetail"
            >
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="username" label="用户名" />
              <el-table-column prop="email" label="邮箱" />
              <el-table-column prop="role" label="角色" />
              <el-table-column prop="isActive" label="状态">
                <template #default="scope">
                  <el-tag :type="scope.row.isActive ? 'success' : 'danger'">
                    {{ scope.row.isActive ? '活跃' : '非活跃' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="createdAt" label="创建时间" />
              <el-table-column label="操作" width="120">
                <template #default="scope">
                  <el-button type="primary" size="small" @click.stop="viewAdminDetail(scope.row)">
                    详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="adminsPagination.current"
                v-model:page-size="adminsPagination.size"
                :page-sizes="[10, 20, 50, 100]"
                :total="adminsPagination.total"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleAdminsPageSizeChange"
                @current-change="handleAdminsPageChange"
              />
            </div>
          </el-card>
        </div>
      </div>
    </div>

    <!-- 失物详情弹窗 -->
    <el-dialog
      v-model="itemDetailVisible"
      title="失物详情"
      width="600px"
      :before-close="
        () => {
          itemDetailVisible = false
          selectedItem = null
        }
      "
    >
      <div v-if="selectedItem" class="item-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="失物名称">{{ selectedItem.name }}</el-descriptions-item>
          <el-descriptions-item label="类型">{{ selectedItem.type }}</el-descriptions-item>
          <el-descriptions-item label="颜色">{{ selectedItem.color }}</el-descriptions-item>
          <el-descriptions-item label="发现位置">{{ selectedItem.location }}</el-descriptions-item>
          <el-descriptions-item label="发布管理员">{{
            selectedItem.adminName
          }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="selectedItem.isClaimed ? 'success' : 'warning'">
              {{ selectedItem.isClaimed ? '已领取' : '待领取' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="发布时间" :span="2">{{
            selectedItem.createdAt
          }}</el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">{{
            selectedItem.description || '暂无描述'
          }}</el-descriptions-item>
        </el-descriptions>

        <div v-if="selectedItem.imageUrl" class="item-image" style="margin-top: 20px">
          <el-image
            :src="selectedItem.imageUrl"
            :preview-src-list="[selectedItem.imageUrl]"
            fit="cover"
            style="width: 200px; height: 200px"
          />
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="itemDetailVisible = false">关闭</el-button>
          <el-button
            v-if="selectedItem && !selectedItem.isClaimed"
            type="danger"
            @click="handleDeleteItem"
          >
            删除失物
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 用户详情弹窗 -->
    <el-dialog
      v-model="userDetailVisible"
      title="用户详情"
      width="600px"
      :before-close="
        () => {
          userDetailVisible = false
          selectedUser = null
        }
      "
    >
      <div v-if="selectedUser" class="user-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户名">{{ selectedUser.username }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ selectedUser.email }}</el-descriptions-item>
          <el-descriptions-item label="真实姓名">{{
            selectedUser.realName || '未设置'
          }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{
            selectedUser.phone || '未设置'
          }}</el-descriptions-item>
          <el-descriptions-item label="学号/工号">{{
            selectedUser.studentId || '未设置'
          }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="selectedUser.status === '正常' ? 'success' : 'danger'">
              {{ selectedUser.status || '正常' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="注册时间" :span="2">{{
            selectedUser.createdAt
          }}</el-descriptions-item>
          <el-descriptions-item label="最后登录" :span="2">{{
            selectedUser.lastLoginAt || '从未登录'
          }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="userDetailVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 管理员详情弹窗 -->
    <el-dialog
      v-model="adminDetailVisible"
      title="管理员详情"
      width="600px"
      :before-close="
        () => {
          adminDetailVisible = false
          selectedAdmin = null
        }
      "
    >
      <div v-if="selectedAdmin" class="admin-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户名">{{ selectedAdmin.username }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ selectedAdmin.email }}</el-descriptions-item>
          <el-descriptions-item label="真实姓名">{{
            selectedAdmin.realName || '未设置'
          }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{
            selectedAdmin.phone || '未设置'
          }}</el-descriptions-item>
          <el-descriptions-item label="角色">{{ selectedAdmin.role }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="selectedAdmin.status === 'active' ? 'success' : 'danger'">
              {{ selectedAdmin.status === 'active' ? '活跃' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">{{
            selectedAdmin.createdAt
          }}</el-descriptions-item>
          <el-descriptions-item label="最后登录" :span="2">{{
            selectedAdmin.lastLoginAt || '从未登录'
          }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="adminDetailVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Setting,
  Refresh,
  DataAnalysis,
  User,
  Box,
  Check,
  Clock,
  UserFilled,
  Search,
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { getAllLostItems, deleteLostItem } from '@/api/lostItem'
import { getAllUsers, getUserStats } from '@/api/user'
import { getLostItemStats } from '@/api/statistics'
import { getAllAdmins } from '@/api/admin'

// 组件名称
defineOptions({
  name: 'SuperAdminView',
})

// 路由和状态管理
const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const loading = ref(false)
const activeMenu = ref('dashboard')

// 所有失物管理相关数据
const itemsLoading = ref(false)
const itemSearchKeyword = ref('')
const allItemsList = ref([])
const itemsPagination = reactive({
  current: 1,
  size: 10,
  total: 0,
})
const itemDetailVisible = ref(false)
const selectedItem = ref(null)

// 用户管理相关数据
const usersLoading = ref(false)
const userSearchKeyword = ref('')
const usersList = ref([])
const usersPagination = reactive({
  current: 1,
  size: 10,
  total: 0,
})
const userDetailVisible = ref(false)
const selectedUser = ref(null)

// 统计数据
const statistics = reactive({
  totalItems: 0,
  claimedItems: 0,
  unclaimedItems: 0,
  activeAdmins: 0,
})

// 管理员管理相关数据
const adminsLoading = ref(false)
const adminSearchKeyword = ref('')
const adminsList = ref([])
const adminsPagination = reactive({
  current: 1,
  size: 10,
  total: 0,
})
const adminDetailVisible = ref(false)
const selectedAdmin = ref(null)

// 权限检查
const checkSuperAdminPermission = () => {
  const user = authStore.user
  if (!user || user.role !== 'super_admin') {
    ElMessage.error('您没有访问权限')
    router.push('/login')
    return false
  }
  return true
}

// 菜单选择处理
const handleMenuSelect = index => {
  activeMenu.value = index
  if (index === 'dashboard') {
    nextTick(() => {
      initCharts()
    })
  } else if (index === 'all-items') {
    loadAllItems()
  } else if (index === 'user-management') {
    loadUsers()
  } else if (index === 'admin-management') {
    loadAdmins()
  }
}

// 刷新数据
const refreshData = async () => {
  loading.value = true
  try {
    await loadStatistics()
    ElMessage.success('数据刷新成功')
  } catch (error) {
    console.error('刷新数据失败:', error)
    ElMessage.error('数据刷新失败')
  } finally {
    loading.value = false
  }
}

// 加载统计数据
const loadStatistics = async () => {
  try {
    // 获取失物统计数据
    const lostItemStats = await getLostItemStats()
    statistics.totalItems = lostItemStats.totalItems || 0
    statistics.claimedItems = lostItemStats.claimedItems || 0
    statistics.unclaimedItems = lostItemStats.unclaimedItems || 0

    // 获取用户统计数据
    const userStats = await getUserStats()
    statistics.activeAdmins = userStats.activeUsers || 0
  } catch (error) {
    console.error('加载统计数据失败:', error)
    throw error
  }
}

// 初始化图表（预留ECharts集成位置）
const initCharts = () => {
  // TODO: 集成ECharts图表
  console.log('初始化图表...')
}

// 所有失物管理相关方法
const loadAllItems = async () => {
  itemsLoading.value = true
  try {
    const params = {
      page: itemsPagination.current,
      size: itemsPagination.size,
      keyword: itemSearchKeyword.value || undefined,
    }

    const response = await getAllLostItems(params)
    allItemsList.value = response.data || []
    itemsPagination.total = response.total || 0
  } catch (error) {
    console.error('加载失物数据失败:', error)
    ElMessage.error('加载失物数据失败')
  } finally {
    itemsLoading.value = false
  }
}

const searchItems = () => {
  // 重置到第一页并重新加载数据
  itemsPagination.current = 1
  loadAllItems()
}

const refreshItems = () => {
  loadAllItems()
}

const viewItemDetail = item => {
  selectedItem.value = item
  itemDetailVisible.value = true
}

const deleteItem = item => {
  ElMessageBox.confirm(`确定要删除失物 "${item.name}" 吗？`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await deleteLostItem(item.id)
        ElMessage.success('删除成功')
        loadAllItems()
      } catch (error) {
        console.error('删除失物失败:', error)
        ElMessage.error('删除失败')
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

const handleDeleteItem = () => {
  if (selectedItem.value) {
    deleteItem(selectedItem.value)
    itemDetailVisible.value = false
  }
}

const handleItemsPageSizeChange = size => {
  itemsPagination.size = size
  loadAllItems()
}

const handleItemsPageChange = page => {
  itemsPagination.current = page
  loadAllItems()
}

// 用户管理相关方法
const loadUsers = async () => {
  usersLoading.value = true
  try {
    // TODO: 后端暂未实现用户列表接口，使用模拟数据
    // const params = {
    //   page: usersPagination.current,
    //   size: usersPagination.size,
    //   keyword: userSearchKeyword.value || undefined
    // }
    // const response = await getAllUsers(params)

    // 模拟数据
    const mockUsers = [
      {
        id: 1,
        username: 'user1',
        email: 'user1@example.com',
        phone: '13800138001',
        role: 'USER',
        createdAt: '2024-01-15 10:30:00',
      },
      {
        id: 2,
        username: 'user2',
        email: 'user2@example.com',
        phone: '13800138002',
        role: 'USER',
        createdAt: '2024-01-16 11:30:00',
      },
    ]

    usersList.value = mockUsers
    usersPagination.total = mockUsers.length

    console.log('用户数据加载完成（使用模拟数据）')
  } catch (error) {
    console.error('加载用户数据失败:', error)
    ElMessage.error('加载用户数据失败')
  } finally {
    usersLoading.value = false
  }
}

const searchUsers = () => {
  // 重置到第一页并重新加载数据
  usersPagination.current = 1
  loadUsers()
}

const refreshUsers = () => {
  loadUsers()
}

const viewUserDetail = user => {
  selectedUser.value = user
  userDetailVisible.value = true
}

const handleUsersPageSizeChange = size => {
  usersPagination.size = size
  loadUsers()
}

const handleUsersPageChange = page => {
  usersPagination.current = page
  loadUsers()
}

// 管理员管理相关方法
const loadAdmins = async () => {
  adminsLoading.value = true
  try {
    // TODO: 后端暂未实现管理员列表接口，使用模拟数据
    // const response = await getAllAdmins()

    // 模拟数据
    const mockAdmins = [
      {
        id: 1,
        username: 'admin1',
        email: 'admin1@example.com',
        phone: '13800138001',
        role: 'LOST_ITEM_ADMIN',
        createdAt: '2024-01-15 10:30:00',
      },
      {
        id: 2,
        username: 'admin2',
        email: 'admin2@example.com',
        phone: '13800138002',
        role: 'LOST_ITEM_ADMIN',
        createdAt: '2024-01-16 11:30:00',
      },
    ]

    adminsList.value = mockAdmins
    adminsPagination.total = mockAdmins.length

    console.log('管理员数据加载完成（使用模拟数据）')
  } catch (error) {
    console.error('加载管理员数据失败:', error)
    ElMessage.error('加载管理员数据失败')
  } finally {
    adminsLoading.value = false
  }
}

const searchAdmins = () => {
  // 重置到第一页并重新加载数据
  adminsPagination.current = 1
  loadAdmins()
}

const refreshAdmins = () => {
  loadAdmins()
}

const viewAdminDetail = admin => {
  selectedAdmin.value = admin
  adminDetailVisible.value = true
}

const handleAdminsPageSizeChange = size => {
  adminsPagination.size = size
  loadAdmins()
}

const handleAdminsPageChange = page => {
  adminsPagination.current = page
  loadAdmins()
}

// 组件挂载
onMounted(async () => {
  // 检查权限
  if (!checkSuperAdminPermission()) {
    return
  }

  // 加载初始数据
  await loadStatistics()

  // 初始化图表
  nextTick(() => {
    initCharts()
  })
})

// 导出所有响应式数据和方法供模板使用
defineExpose({
  activeMenu,
  statistics,
  // 所有失物管理
  itemsLoading,
  itemSearchKeyword,
  allItemsList,
  itemsPagination,
  itemDetailVisible,
  selectedItem,
  // 用户管理
  usersLoading,
  userSearchKeyword,
  usersList,
  usersPagination,
  userDetailVisible,
  selectedUser,
  // 方法
  handleMenuSelect,
  refreshData,
  loadAllItems,
  searchItems,
  refreshItems,
  viewItemDetail,
  deleteItem,
  handleDeleteItem,
  handleItemsPageSizeChange,
  handleItemsPageChange,
  loadUsers,
  searchUsers,
  refreshUsers,
  viewUserDetail,
  handleUsersPageSizeChange,
  handleUsersPageChange,
})
</script>

<style scoped>
.super-admin-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.page-header {
  background: white;
  padding: 20px 24px;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.header-left {
  display: flex;
  flex-direction: column;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.page-description {
  margin: 4px 0 0 0;
  color: #909399;
  font-size: 14px;
}

.main-content {
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  gap: 20px;
  padding: 0 24px;
}

.sidebar {
  width: 200px;
  flex-shrink: 0;
}

.admin-menu {
  border-radius: 8px;
  overflow: hidden;
}

.content-area {
  flex: 1;
  min-height: 600px;
}

/* 统计卡片样式 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 12px;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-icon.lost-items {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.claimed-items {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.unclaimed-items {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.active-admins {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info h3 {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.stat-info p {
  margin: 4px 0 0 0;
  color: #909399;
  font-size: 14px;
}

/* 图表区域样式 */
.charts-section {
  margin-top: 24px;
}

.chart-card {
  border-radius: 12px;
}

.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  background-color: #f8f9fa;
  border-radius: 8px;
}

/* 所有面板通用样式 */
.all-items-panel,
.user-management-panel,
.admin-management-panel {
  width: 100%;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.panel-header h2 {
  margin: 0;
  color: #303133;
}

.header-actions {
  display: flex;
  align-items: center;
}

.items-list-card,
.users-list-card,
.admin-list-card {
  border-radius: 12px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 20px 0;
}

.el-table .el-table__row {
  cursor: pointer;
}

.el-table .el-table__row:hover {
  background-color: #f5f7fa;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 0 16px;
  }

  .sidebar {
    width: 100%;
  }

  .stats-cards {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }

  .header-content {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
}
</style>
