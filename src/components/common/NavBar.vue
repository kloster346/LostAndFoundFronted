<template>
  <nav class="navbar">
    <div class="navbar-container">
      <!-- Logo和系统名称 -->
      <div class="navbar-brand">
        <router-link to="/" class="brand-link">
          <div class="logo">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                stroke-width="2"
                stroke-linejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                stroke-width="2"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <span class="brand-text">失物招领系统</span>
        </router-link>
      </div>

      <!-- 主导航菜单 -->
      <div class="navbar-menu" :class="{ 'is-active': isMobileMenuOpen }">
        <div class="navbar-nav">
          <router-link to="/lost-items" class="nav-link" active-class="active">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 16V8A2 2 0 0 0 19 6H5A2 2 0 0 0 3 8V16A2 2 0 0 0 5 18H19A2 2 0 0 0 21 16Z"
                stroke="currentColor"
                stroke-width="2"
              />
              <path d="M7 10H17" stroke="currentColor" stroke-width="2" />
            </svg>
            失物浏览
          </router-link>

          <router-link
            v-if="authStore.isLoggedIn"
            to="/profile"
            class="nav-link"
            active-class="active"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 21V19A4 4 0 0 0 16 15H8A4 4 0 0 0 4 19V21"
                stroke="currentColor"
                stroke-width="2"
              />
              <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" />
            </svg>
            个人信息
          </router-link>

          <router-link
            v-if="authStore.isAdmin"
            to="/admin/publish"
            class="nav-link"
            active-class="active"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 5V19" stroke="currentColor" stroke-width="2" />
              <path d="M5 12H19" stroke="currentColor" stroke-width="2" />
            </svg>
            发布失物
          </router-link>

          <router-link
            v-if="authStore.isAdmin"
            to="/admin/my-items"
            class="nav-link"
            active-class="active"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14 2H6A2 2 0 0 0 4 4V20A2 2 0 0 0 6 22H18A2 2 0 0 0 20 20V8L14 2Z"
                stroke="currentColor"
                stroke-width="2"
              />
              <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" />
            </svg>
            我的失物
          </router-link>
        </div>
      </div>

      <!-- 用户信息区域 -->
      <div class="navbar-user">
        <div v-if="authStore.isLoggedIn" class="user-menu">
          <div class="user-info" @click="toggleUserDropdown">
            <div class="user-avatar">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 21V19A4 4 0 0 0 16 15H8A4 4 0 0 0 4 19V21"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" />
              </svg>
            </div>
            <span class="user-name">{{ authStore.currentUser?.username || '用户' }}</span>
            <svg
              class="dropdown-icon"
              :class="{ rotated: isUserDropdownOpen }"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 9L12 15L18 9"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>

          <div class="user-dropdown" :class="{ 'is-active': isUserDropdownOpen }">
            <div class="user-role">{{ getRoleText(authStore.userRole) }}</div>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item" @click="handleLogout">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H9"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <path d="M16 17L21 12L16 7" stroke="currentColor" stroke-width="2" />
                <path d="M21 12H9" stroke="currentColor" stroke-width="2" />
              </svg>
              退出登录
            </button>
          </div>
        </div>

        <router-link v-else to="/login" class="login-btn">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 3H19A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H15"
              stroke="currentColor"
              stroke-width="2"
            />
            <path d="M10 17L15 12L10 7" stroke="currentColor" stroke-width="2" />
            <path d="M15 12H3" stroke="currentColor" stroke-width="2" />
          </svg>
          登录
        </router-link>
      </div>

      <!-- 移动端菜单按钮 -->
      <button
        v-if="showSidebarToggle"
        class="mobile-menu-btn"
        @click="emit('toggle-sidebar')"
        title="打开菜单"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M3 12H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <path d="M3 6H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <path d="M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>

      <!-- 普通移动端菜单按钮 -->
      <button v-else class="mobile-menu-btn" @click="toggleMobileMenu" title="打开菜单">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M3 12H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <path d="M3 6H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <path d="M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { USER_ROLES } from '@/constants/enums'

// Props
const _props = defineProps({
  showSidebarToggle: {
    type: Boolean,
    default: false,
  },
})

// Emits
const emit = defineEmits(['toggle-sidebar'])

// 状态管理
const router = useRouter()
const authStore = useAuthStore()

// 响应式状态
const isMobileMenuOpen = ref(false)
const isUserDropdownOpen = ref(false)

// 移动端菜单切换
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

// 用户下拉菜单切换
const toggleUserDropdown = () => {
  isUserDropdownOpen.value = !isUserDropdownOpen.value
}

// 获取角色文本
const getRoleText = role => {
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
    isUserDropdownOpen.value = false
    router.push('/login')
  } catch (error) {
    console.error('退出登录失败:', error)
  }
}

// 点击外部关闭下拉菜单
const handleClickOutside = event => {
  if (!event.target.closest('.user-menu')) {
    isUserDropdownOpen.value = false
  }
  if (!event.target.closest('.navbar-menu') && !event.target.closest('.mobile-menu-btn')) {
    isMobileMenuOpen.value = false
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.navbar {
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

/* Logo和品牌 */
.navbar-brand {
  flex-shrink: 0;
}

.brand-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #1f2937;
  font-weight: 600;
  font-size: 1.25rem;
}

.logo {
  margin-right: 0.75rem;
  color: #3b82f6;
}

.brand-text {
  white-space: nowrap;
}

/* 导航菜单 */
.navbar-menu {
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: center;
}

.navbar-nav {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: #6b7280;
  font-weight: 500;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.nav-link:hover {
  color: #3b82f6;
  background-color: #f3f4f6;
}

.nav-link.active {
  color: #3b82f6;
  background-color: #eff6ff;
}

/* 用户区域 */
.navbar-user {
  flex-shrink: 0;
  position: relative;
}

.user-menu {
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: 0.5rem;
  transition: background-color 0.2s ease;
}

.user-info:hover {
  background-color: #f3f4f6;
}

.user-avatar {
  color: #6b7280;
}

.user-name {
  font-weight: 500;
  color: #1f2937;
  white-space: nowrap;
}

.dropdown-icon {
  color: #6b7280;
  transition: transform 0.2s ease;
}

.dropdown-icon.rotated {
  transform: rotate(180deg);
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.2s ease;
  z-index: 1001;
}

.user-dropdown.is-active {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.user-role {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
}

.dropdown-divider {
  height: 1px;
  background-color: #e5e7eb;
  margin: 0.5rem 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  text-align: left;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background-color: #f3f4f6;
  color: #1f2937;
}

.login-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: #ffffff;
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
  white-space: nowrap;
}

.login-btn:hover {
  background-color: #2563eb;
}

/* 移动端菜单按钮 */
.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.25rem;
}

.mobile-menu-btn:hover {
  background-color: #f3f4f6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .navbar-container {
    padding: 0 1rem;
  }

  .brand-text {
    display: none;
  }

  .navbar-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #ffffff;
    border-top: 1px solid #e5e7eb;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: all 0.2s ease;
  }

  .navbar-menu.is-active {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  .navbar-nav {
    flex-direction: column;
    gap: 0;
    padding: 1rem 0;
  }

  .nav-link {
    justify-content: flex-start;
    padding: 1rem 1.5rem;
    border-radius: 0;
  }

  .mobile-menu-btn {
    display: block;
  }

  .user-name {
    display: none;
  }

  .user-dropdown {
    right: -1rem;
  }
}

@media (max-width: 480px) {
  .navbar-container {
    padding: 0 0.75rem;
  }

  .user-info {
    padding: 0.5rem;
  }

  .login-btn {
    padding: 0.5rem;
  }

  .login-btn span {
    display: none;
  }
}
</style>
