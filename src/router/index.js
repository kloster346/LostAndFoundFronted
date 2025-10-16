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
        requiresAuth: false,
      },
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../views/auth/RegisterView.vue'),
      meta: { 
        title: '用户注册',
        requiresAuth: false 
      },
    },
    {
      path: '/lost-items',
      name: 'LostItemList',
      component: () => import('../views/common/LostItemListView.vue'),
      meta: {
        title: '失物浏览',
        requiresAuth: false,
      },
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../views/user/ProfileView.vue'),
      meta: {
        title: '个人信息',
        requiresAuth: true,
      },
    },
    {
      path: '/admin/publish',
      name: 'AdminPublish',
      component: () => import('../views/admin/PublishItemView.vue'),
      meta: {
        title: '发布失物',
        requiresAuth: true,
        requiresAdmin: true,
      },
    },
    {
      path: '/admin/my-items',
      name: 'AdminMyItems',
      component: () => import('../views/admin/MyItemsView.vue'),
      meta: {
        title: '我的失物',
        requiresAuth: true,
        requiresAdmin: true,
      },
    },
    {
      path: '/admin/super',
      name: 'SuperAdmin',
      component: () => import('../views/admin/SuperAdminView.vue'),
      meta: {
        title: '总管理员',
        requiresAuth: true,
        requiresSuperAdmin: true,
      },
    },
    {
      path: '/admin/claim-approval',
      name: 'ClaimApproval',
      component: () => import('../views/admin/ClaimApprovalView.vue'),
      meta: {
        title: '申领审核',
        requiresAuth: true,
        requiresAdmin: true,
      },
    },
    {
      path: '/lost-items/:id',
      name: 'LostItemDetail',
      component: () => import('../views/LostItemDetailView.vue'),
      meta: {
        title: '失物详情',
        requiresAuth: false,
      },
    },
    {
      path: '/lost-items/:id/claim',
      name: 'ClaimItem',
      component: () => import('../views/ClaimItemView.vue'),
      meta: {
        title: '认领失物',
        requiresAuth: false,
      },
    },

    {
      path: '/',
      redirect: '/lost-items',
    },
    {
      path: '/404',
      name: 'NotFound',
      component: () => import('../views/common/NotFoundView.vue'),
      meta: {
        title: '页面未找到',
        requiresAuth: false,
      },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/404',
    },
  ],
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 失物招领系统`
  }

  // 如果已登录用户访问登录页面，重定向到适当的页面
  if (to.path === '/login' && authStore.isLoggedIn) {
    if (authStore.isSuperAdmin) {
      next('/admin/super')
    } else if (authStore.isAdmin) {
      next('/admin/my-items')
    } else {
      next('/lost-items')
    }
    return
  }

  // 检查是否需要登录
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    // 保存原本想访问的页面，登录后重定向
    const redirectPath = to.fullPath !== '/login' ? to.fullPath : '/lost-items'
    next({
      path: '/login',
      query: { redirect: redirectPath },
    })
    return
  }

  // 检查是否需要总管理员权限
  if (to.meta.requiresSuperAdmin && !authStore.isSuperAdmin) {
    // 如果已登录但不是总管理员，跳转到适当页面
    if (authStore.isLoggedIn) {
      const redirectPath = authStore.isAdmin ? '/admin/my-items' : '/lost-items'
      next(redirectPath)
      // 延迟显示提示，避免在路由跳转过程中显示
      setTimeout(() => {
        alert('您没有访问该页面的权限，需要总管理员权限')
      }, 100)
    } else {
      // 如果未登录，跳转到登录页面
      next({
        path: '/login',
        query: { redirect: to.fullPath },
      })
    }
    return
  }

  // 检查是否需要管理员权限
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    // 如果已登录但不是管理员，跳转到失物列表页面
    if (authStore.isLoggedIn) {
      // 使用更友好的提示方式
      next('/lost-items')
      // 延迟显示提示，避免在路由跳转过程中显示
      setTimeout(() => {
        alert('您没有访问该页面的权限')
      }, 100)
    } else {
      // 如果未登录，跳转到登录页面
      next({
        path: '/login',
        query: { redirect: to.fullPath },
      })
    }
    return
  }

  next()
})

export default router
