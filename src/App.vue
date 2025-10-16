<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import NavBar from '@/components/common/NavBar.vue'
import SideBar from '@/components/common/SideBar.vue'

// 状态管理
const route = useRoute()
const authStore = useAuthStore()

// 响应式状态
const sidebarCollapsed = ref(false)
const mobileSidebarOpen = ref(false)
const isMobile = ref(false)

// 计算属性
const showNavBar = computed(() => {
  // 仅在登录或注册页面隐藏导航栏
  const isAuthPage = route.name === 'Login' || route.name === 'Register'
  // 认证页面或管理员页面不显示导航栏
  return !isAuthPage && !authStore.isAdmin
})

const showSideBar = computed(() => {
  // 管理员登录后始终显示侧边栏，不限制页面路径
  return authStore.isAdmin
})

const mainContentClass = computed(() => {
  const classes = ['main-content']

  if (showSideBar.value) {
    classes.push('with-sidebar')
    if (sidebarCollapsed.value) {
      classes.push('sidebar-collapsed')
    }
  }

  if (showNavBar.value) {
    classes.push('with-navbar')
  }

  return classes.join(' ')
})

// 方法
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const openMobileSidebar = () => {
  mobileSidebarOpen.value = true
}

const closeMobileSidebar = () => {
  mobileSidebarOpen.value = false
}

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) {
    mobileSidebarOpen.value = false
  }
}

// 生命周期
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<template>
  <div class="app-container">
    <!-- 顶部导航栏 -->
    <NavBar
      v-if="showNavBar"
      :show-sidebar-toggle="showSideBar"
      @toggle-sidebar="openMobileSidebar"
    />

    <!-- 侧边栏 -->
    <SideBar
      v-if="showSideBar"
      :collapsed="sidebarCollapsed"
      :mobile-open="mobileSidebarOpen"
      @toggle-collapse="toggleSidebar"
      @close-mobile="closeMobileSidebar"
    />

    <!-- 主内容区域 -->
    <main :class="mainContentClass">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  background-color: #f9fafb;
}

.main-content {
  transition: all 0.3s ease;
  min-height: 100vh;
}

/* 有顶部导航栏时的样式 */
.main-content.with-navbar {
  /* 移除padding-top，让页面内容直接贴合导航栏 */
}

/* 有侧边栏时的样式 */
.main-content.with-sidebar {
  margin-left: 280px;
}

.main-content.with-sidebar.sidebar-collapsed {
  margin-left: 80px;
}

/* 移动端样式 */
@media (max-width: 768px) {
  .main-content.with-sidebar {
    margin-left: 0;
  }

  .main-content.with-sidebar.sidebar-collapsed {
    margin-left: 0;
  }
}

/* 全局样式重置 */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell',
    'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
}
</style>
