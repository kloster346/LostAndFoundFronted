<template>
  <aside class="sidebar" :class="{ 'collapsed': isCollapsed, 'mobile-open': isMobileOpen }">
    <!-- 侧边栏头部 -->
    <div class="sidebar-header">
      <div class="sidebar-brand" v-show="!isCollapsed">
        <div class="brand-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="brand-text">管理后台</span>
      </div>

      <button class="collapse-btn" @click="toggleCollapse" :title="isCollapsed ? '展开侧边栏' : '收起侧边栏'">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

    <!-- 用户信息 -->
    <div class="sidebar-user" v-if="authStore.isLoggedIn">
      <div class="user-avatar">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 21V19A4 4 0 0 0 16 15H8A4 4 0 0 0 4 19V21" stroke="currentColor" stroke-width="2"/>
          <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
        </svg>
      </div>
      <div class="user-details" v-show="!isCollapsed">
        <div class="user-name">{{ authStore.currentUser?.username || '管理员' }}</div>
        <div class="user-role">{{ getRoleText(authStore.userRole) }}</div>
      </div>
    </div>

    <!-- 导航菜单 -->
    <nav class="sidebar-nav">
      <div class="nav-section">
        <div class="nav-title" v-show="!isCollapsed">主要功能</div>

        <!-- 失物浏览 -->
        <router-link
          to="/lost-items"
          class="nav-item"
          active-class="active"
          :title="isCollapsed ? '失物浏览' : ''"
        >
          <div class="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 16V8A2 2 0 0 0 19 6H5A2 2 0 0 0 3 8V16A2 2 0 0 0 5 18H19A2 2 0 0 0 21 16Z" stroke="currentColor" stroke-width="2"/>
              <path d="M7 10H17" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <span class="nav-text" v-show="!isCollapsed">失物浏览</span>
        </router-link>

        <!-- 个人信息 -->
        <router-link
          v-if="authStore.isLoggedIn"
          to="/profile"
          class="nav-item"
          active-class="active"
          :title="isCollapsed ? '个人信息' : ''"
        >
          <div class="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21V19A4 4 0 0 0 16 15H8A4 4 0 0 0 4 19V21" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <span class="nav-text" v-show="!isCollapsed">个人信息</span>
        </router-link>
      </div>

      <!-- 管理员功能 -->
      <div class="nav-section" v-if="authStore.isAdmin">
        <div class="nav-title" v-show="!isCollapsed">管理功能</div>

        <!-- 发布失物 -->
        <router-link
          to="/admin/publish"
          class="nav-item"
          active-class="active"
          :title="isCollapsed ? '发布失物' : ''"
        >
          <div class="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19" stroke="currentColor" stroke-width="2"/>
              <path d="M5 12H19" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <span class="nav-text" v-show="!isCollapsed">发布失物</span>
        </router-link>

        <!-- 我的失物 -->
        <router-link
          to="/admin/my-items"
          class="nav-item"
          active-class="active"
          :title="isCollapsed ? '我的失物' : ''"
        >
          <div class="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6A2 2 0 0 0 4 4V20A2 2 0 0 0 6 22H18A2 2 0 0 0 20 20V8L14 2Z" stroke="currentColor" stroke-width="2"/>
              <path d="M14 2V8H20" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <span class="nav-text" v-show="!isCollapsed">我的失物</span>
        </router-link>
      </div>

      <!-- 系统功能 -->
      <div class="nav-section">
        <div class="nav-title" v-show="!isCollapsed">系统</div>

        <!-- 退出登录 -->
        <button
          v-if="authStore.isLoggedIn"
          class="nav-item nav-button"
          @click="handleLogout"
          :title="isCollapsed ? '退出登录' : ''"
        >
          <div class="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H9" stroke="currentColor" stroke-width="2"/>
              <path d="M16 17L21 12L16 7" stroke="currentColor" stroke-width="2"/>
              <path d="M21 12H9" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <span class="nav-text" v-show="!isCollapsed">退出登录</span>
        </button>

        <!-- 登录 -->
        <router-link
          v-else
          to="/login"
          class="nav-item"
          active-class="active"
          :title="isCollapsed ? '登录' : ''"
        >
          <div class="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 3H19A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H15" stroke="currentColor" stroke-width="2"/>
              <path d="M10 17L15 12L10 7" stroke="currentColor" stroke-width="2"/>
              <path d="M15 12H3" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <span class="nav-text" v-show="!isCollapsed">登录</span>
        </router-link>
      </div>
    </nav>

    <!-- 移动端遮罩 -->
    <div class="mobile-overlay" @click="closeMobileSidebar" v-show="isMobileOpen"></div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { USER_ROLES } from '@/constants/enums'

// Props
const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false
  },
  mobileOpen: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['toggle-collapse', 'close-mobile'])

// 状态管理
const router = useRouter()
const authStore = useAuthStore()

// 响应式状态
const isCollapsed = computed({
  get: () => props.collapsed,
  set: (value) => emit('toggle-collapse', value)
})

const isMobileOpen = computed({
  get: () => props.mobileOpen,
  set: (value) => emit('close-mobile', !value)
})

// 切换折叠状态
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

// 关闭移动端侧边栏
const closeMobileSidebar = () => {
  isMobileOpen.value = false
}

// 获取角色文本
const getRoleText = (role) => {
  switch (role) {
    case USER_ROLES.NORMAL_USER:
      return '普通用户'
    case USER_ROLES.LOST_ITEM_ADMIN:
      return '失物管理员'
    case USER_ROLES.SUPER_ADMIN:
      return '超级管理员'
    default:
      return '用户'
  }
}

// 退出登录
const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('退出登录失败:', error)
  }
}

// 处理窗口大小变化
const handleResize = () => {
  if (window.innerWidth > 768 && isMobileOpen.value) {
    closeMobileSidebar()
  }
}

// 生命周期
onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.sidebar {
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  height: 100vh;
  width: 280px;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  overflow: hidden;
}

.sidebar.collapsed {
  width: 80px;
}

/* 侧边栏头部 */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  min-height: 64px;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand-icon {
  color: #3b82f6;
  flex-shrink: 0;
}

.brand-text {
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
}

.collapse-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.collapse-btn:hover {
  background-color: #f3f4f6;
  color: #1f2937;
}

.collapsed .collapse-btn svg {
  transform: rotate(180deg);
}

/* 用户信息 */
.sidebar-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.user-avatar {
  color: #6b7280;
  flex-shrink: 0;
}

.user-details {
  min-width: 0;
  flex: 1;
}

.user-name {
  font-weight: 500;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.875rem;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 导航菜单 */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
}

.nav-section {
  margin-bottom: 2rem;
}

.nav-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0 1rem;
  margin-bottom: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: #6b7280;
  text-decoration: none;
  transition: all 0.2s ease;
  border: none;
  background: none;
  width: 100%;
  cursor: pointer;
  font-size: 0.875rem;
}

.nav-item:hover {
  background-color: #f3f4f6;
  color: #1f2937;
}

.nav-item.active {
  background-color: #eff6ff;
  color: #3b82f6;
  border-right: 3px solid #3b82f6;
}

.nav-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-button {
  text-align: left;
}

/* 移动端样式 */
.mobile-overlay {
  display: none;
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    width: 280px;
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }

  .sidebar.collapsed {
    width: 280px;
  }

  .mobile-overlay {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: -1;
  }

  .collapse-btn {
    display: none;
  }
}

/* 滚动条样式 */
.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* 折叠状态下的特殊样式 */
.collapsed .nav-item {
  justify-content: center;
  padding: 0.75rem;
}

.collapsed .sidebar-user {
  justify-content: center;
  padding: 1rem 0.5rem;
}

.collapsed .nav-section {
  margin-bottom: 1rem;
}

/* 动画效果 */
.nav-item, .collapse-btn, .user-avatar {
  transition: all 0.2s ease;
}

.sidebar {
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}
</style>
