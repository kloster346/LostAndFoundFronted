import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/auth/LoginView.vue'),
      meta: {
        title: '登录',
        requiresAuth: false
      }
    },
    {
      path: '/lost-items',
      name: 'LostItemList',
      component: () => import('../views/common/LostItemListView.vue'),
      meta: {
        title: '失物浏览',
        requiresAuth: false
      }
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../views/user/ProfileView.vue'),
      meta: {
        title: '个人信息',
        requiresAuth: true
      }
    },
    {
      path: '/admin/publish',
      name: 'AdminPublish',
      component: () => import('../views/admin/PublishItemView.vue'),
      meta: {
        title: '发布失物',
        requiresAuth: true,
        requiresAdmin: true
      }
    },
    {
      path: '/admin/my-items',
      name: 'AdminMyItems',
      component: () => import('../views/admin/MyItemsView.vue'),
      meta: {
        title: '我的失物',
        requiresAuth: true,
        requiresAdmin: true
      }
    },
    {
      path: '/',
      redirect: '/lost-items'
    }
  ],
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 失物招领系统`
  }
  
  // 检查是否需要登录
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next('/login')
    return
  }
  
  // 检查是否需要管理员权限
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    // 如果已登录但不是管理员，跳转到失物列表页面
    if (authStore.isLoggedIn) {
      alert('您没有访问该页面的权限')
      next('/lost-items')
    } else {
      // 如果未登录，跳转到登录页面
      next('/login')
    }
    return
  }
  
  next()
})

export default router
