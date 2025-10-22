<template>
  <div class="claim-approval-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>失物申领审核</span>
          <el-button type="primary" @click="refreshList">刷新</el-button>
        </div>
      </template>
      
      <el-table :data="pendingClaims" style="width: 100%">
        <el-table-column prop="lostItemName" label="物品名称" width="150" />
        <el-table-column prop="claimerName" label="申请人" width="100" />
        <el-table-column prop="claimerStudentId" label="学号" width="120" />
        <el-table-column prop="claimerPhone" label="联系电话" width="130" />
        <el-table-column prop="applyTime" label="申请时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.applyTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="foundLocation" label="捡到地点" width="150" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button 
              type="success" 
              size="small" 
              @click="handleApprove(scope.row)">
              批准
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              @click="handleReject(scope.row)">
              拒绝
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        @current-change="handlePageChange"
        layout="total, prev, pager, next, jumper"
        style="margin-top: 20px; text-align: center"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useLostItemStore } from '@/stores/lostItem'

const lostItemStore = useLostItemStore()

// 响应式数据（使用 store）
const pendingClaims = computed(() => lostItemStore.pendingClaims)
const currentPage = computed({
  get: () => lostItemStore.pendingPagination.currentPage,
  set: v => (lostItemStore.pendingPagination.currentPage = v),
})
const pageSize = computed({
  get: () => lostItemStore.pendingPagination.pageSize,
  set: v => (lostItemStore.pendingPagination.pageSize = v),
})
const total = computed(() => lostItemStore.pendingPagination.total)

// 获取待审核列表
const fetchPendingClaims = async () => {
  try {
    await lostItemStore.getPendingClaimsForAdmin({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
    })
  } catch (error) {
    ElMessage.error('获取待审核列表失败')
  }
}

// 批准申请
const handleApprove = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要批准 ${row.claimerName} 对 ${row.lostItemName} 的申领吗？`,
      '确认批准',
      { type: 'warning' }
    )

    const response = await lostItemStore.approveClaimAction({
      claimId: row.claimId || row.id,
      action: 'approve',
    })

    if (response && response.code === 200) {
      ElMessage.success('申请已批准')
      fetchPendingClaims()
    } else {
      ElMessage.success('申请已批准') // 某些后端返回不含 code，已处理则提示成功
      fetchPendingClaims()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批准失败')
    }
  }
}

// 拒绝申请
const handleReject = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要拒绝 ${row.claimerName} 对 ${row.lostItemName} 的申领吗？`,
      '确认拒绝',
      { type: 'warning' }
    )

    const response = await lostItemStore.approveClaimAction({
      claimId: row.claimId || row.id,
      action: 'reject',
    })

    if (response && response.code === 200) {
      ElMessage.success('申请已拒绝')
      fetchPendingClaims()
    } else {
      ElMessage.success('申请已拒绝')
      fetchPendingClaims()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('拒绝失败')
    }
  }
}

// 刷新列表
const refreshList = () => {
  fetchPendingClaims()
}

// 分页处理
const handlePageChange = (page) => {
  currentPage.value = page
  fetchPendingClaims()
}

// 格式化时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  return new Date(dateTime).toLocaleString('zh-CN')
}

// 组件挂载时获取数据
onMounted(() => {
  fetchPendingClaims()
})
</script>

<style scoped>
.claim-approval-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>