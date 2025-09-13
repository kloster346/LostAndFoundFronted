<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">发布失物</h1>
        <p class="mt-2 text-gray-600">填写失物信息，帮助失主找回物品</p>
      </div>

      <!-- 发布表单 -->
      <div class="bg-white shadow-lg rounded-lg p-6">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- 物品基本信息 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- 物品名称 -->
            <div>
              <label for="itemName" class="block text-sm font-medium text-gray-700 mb-2">
                物品名称 <span class="text-red-500">*</span>
              </label>
              <input
                id="itemName"
                v-model="form.itemName"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入物品名称"
              />
            </div>

            <!-- 物品类型 -->
            <div>
              <label for="itemType" class="block text-sm font-medium text-gray-700 mb-2">
                物品类型 <span class="text-red-500">*</span>
              </label>
              <select
                id="itemType"
                v-model="form.itemType"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">请选择物品类型</option>
                <option
                  v-for="option in itemTypeOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- 物品颜色和发现地点 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- 物品颜色 -->
            <div>
              <label for="color" class="block text-sm font-medium text-gray-700 mb-2">
                物品颜色
              </label>
              <select
                id="color"
                v-model="form.color"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">请选择颜色</option>
                <option
                  v-for="option in colorOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>

            <!-- 发现地点 -->
            <div>
              <label for="location" class="block text-sm font-medium text-gray-700 mb-2">
                发现地点 <span class="text-red-500">*</span>
              </label>
              <input
                id="location"
                v-model="form.location"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入发现地点"
              />
            </div>
          </div>

          <!-- 发现时间 -->
          <div>
            <label for="foundTime" class="block text-sm font-medium text-gray-700 mb-2">
              发现时间 <span class="text-red-500">*</span>
            </label>
            <input
              id="foundTime"
              v-model="form.foundTime"
              type="datetime-local"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <!-- 物品描述 -->
          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
              物品描述
            </label>
            <textarea
              id="description"
              v-model="form.description"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请详细描述物品特征，有助于失主识别"
            ></textarea>
          </div>

          <!-- 物品图片上传 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              物品图片
            </label>
            <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
              <div class="space-y-1 text-center">
                <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <div class="flex text-sm text-gray-600">
                  <label for="imageUpload" class="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>上传图片</span>
                    <input
                      id="imageUpload"
                      type="file"
                      accept="image/*"
                      multiple
                      class="sr-only"
                      @change="handleImageUpload"
                    />
                  </label>
                  <p class="pl-1">或拖拽到此处</p>
                </div>
                <p class="text-xs text-gray-500">PNG, JPG, GIF 最大 10MB</p>
              </div>
            </div>
            
            <!-- 图片预览 -->
            <div v-if="imagePreview.length > 0" class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div
                v-for="(image, index) in imagePreview"
                :key="index"
                class="relative group"
              >
                <img
                  :src="image.url"
                  :alt="`预览图片 ${index + 1}`"
                  class="w-full h-24 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  @click="removeImage(index)"
                  class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
          </div>

          <!-- 联系方式 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- 联系人 -->
            <div>
              <label for="contactName" class="block text-sm font-medium text-gray-700 mb-2">
                联系人 <span class="text-red-500">*</span>
              </label>
              <input
                id="contactName"
                v-model="form.contactName"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入联系人姓名"
              />
            </div>

            <!-- 联系电话 -->
            <div>
              <label for="contactPhone" class="block text-sm font-medium text-gray-700 mb-2">
                联系电话 <span class="text-red-500">*</span>
              </label>
              <input
                id="contactPhone"
                v-model="form.contactPhone"
                type="tel"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入联系电话"
              />
            </div>
          </div>

          <!-- 提交按钮 -->
          <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              @click="resetForm"
              class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              重置
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ isSubmitting ? '发布中...' : '发布失物' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LostItemAPI from '@/api/lostItem'
import { ITEM_TYPES, ITEM_TYPE_NAMES, COLORS, COLOR_NAMES } from '@/constants/enums'

export default {
  name: 'PublishItemView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const isSubmitting = ref(false)
    const imagePreview = ref([])
    
    // 表单数据
    const form = reactive({
      itemName: '',
      itemType: '',
      color: '',
      location: '',
      foundTime: '',
      description: '',
      contactName: '',
      contactPhone: '',
      images: []
    })

    // 物品类型选项
    const itemTypeOptions = computed(() => {
      return Object.entries(ITEM_TYPES).map(([key, value]) => ({
        value,
        label: ITEM_TYPE_NAMES[value] || value
      }))
    })

    // 颜色选项
    const colorOptions = computed(() => {
      return Object.entries(COLORS).map(([key, value]) => ({
        value,
        label: COLOR_NAMES[value] || value
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

    // 处理图片上传
    const handleImageUpload = (event) => {
      const files = Array.from(event.target.files)
      
      files.forEach(file => {
        if (file.size > 10 * 1024 * 1024) { // 10MB限制
          alert(`文件 ${file.name} 超过10MB限制`)
          return
        }
        
        const reader = new FileReader()
        reader.onload = (e) => {
          imagePreview.value.push({
            file,
            url: e.target.result,
            name: file.name
          })
          form.images.push(file)
        }
        reader.readAsDataURL(file)
      })
      
      // 清空input值，允许重复选择同一文件
      event.target.value = ''
    }

    // 移除图片
    const removeImage = (index) => {
      imagePreview.value.splice(index, 1)
      form.images.splice(index, 1)
    }

    // 重置表单
    const resetForm = () => {
      Object.keys(form).forEach(key => {
        if (Array.isArray(form[key])) {
          form[key] = []
        } else {
          form[key] = ''
        }
      })
      imagePreview.value = []
    }

    // 提交表单
    const handleSubmit = async () => {
      if (!checkAdminPermission()) return
      
      try {
        isSubmitting.value = true
        
        // 构建提交数据
        const submitData = {
          itemName: form.itemName,
          itemType: form.itemType,
          color: form.color || null,
          location: form.location,
          foundTime: form.foundTime,
          description: form.description || null,
          contactName: form.contactName,
          contactPhone: form.contactPhone,
          images: form.images
        }
        
        // 调用API发布失物
        const response = await LostItemAPI.publishLostItem(submitData)
        
        if (response.success) {
          alert('失物发布成功！')
          resetForm()
          // 可以选择跳转到管理页面
          // router.push('/admin/my-items')
        } else {
          throw new Error(response.message || '发布失败')
        }
      } catch (error) {
        console.error('发布失物失败:', error)
        alert(error.message || '发布失败，请重试')
      } finally {
        isSubmitting.value = false
      }
    }

    // 组件挂载时检查权限
    onMounted(() => {
      checkAdminPermission()
      
      // 设置默认联系人信息（如果用户已登录）
      if (authStore.user) {
        form.contactName = authStore.user.name || ''
        form.contactPhone = authStore.user.phone || ''
      }
    })

    return {
      form,
      isSubmitting,
      imagePreview,
      itemTypeOptions,
      colorOptions,
      handleImageUpload,
      removeImage,
      resetForm,
      handleSubmit
    }
  }
}
</script>

<style scoped>
/* 自定义样式 */
.transition-colors {
  transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out, color 0.2s ease-in-out;
}

/* 文件上传区域悬停效果 */
.border-dashed:hover {
  border-color: #9CA3AF;
}

/* 图片预览悬停效果 */
.group:hover .absolute {
  opacity: 1;
}

.group .absolute {
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
}

.group:hover .absolute {
  opacity: 1;
}
</style>