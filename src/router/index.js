import { createRouter, createWebHistory } from 'vue-router'

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
      path: '/',
      redirect: '/lost-items'
    }
  ],
})

export default router
