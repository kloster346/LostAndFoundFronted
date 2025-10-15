import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import './styles/global.css'
import errorHandler from './plugins/errorHandler'
import { useAuthStore } from './stores/auth.js'

const app = createApp(App)

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(ElementPlus)

// 初始化认证状态
const authStore = useAuthStore()

// 异步初始化认证状态
;(async () => {
  try {
    await authStore.initAuth()
  } catch (error) {
    console.error('认证状态初始化失败:', error)
  }

  app.use(errorHandler, {
    enabled: true,
    capturePromiseRejection: true,
    captureResourceError: true,
    showConsoleError: process.env.NODE_ENV === 'development',
    autoReport: process.env.NODE_ENV === 'production',
  })

  app.mount('#app')
})()
