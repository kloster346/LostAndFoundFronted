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
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPendingClaims, approveClaim } from '@/api/lostItem'

// 响应式数据
const pendingClaims = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 获取待审核列表
const fetchPendingClaims = async () => {
  try {
    const response = await getPendingClaims({
      pageNum: currentPage.value,
      pageSize: pageSize.value
    })
    if (response.code === 200) {
      pendingClaims.value = response.data.records
      total.value = response.data.total
    }
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
    
    const response = await approveClaim({
      claimId: row.claimId,
      action: 'approve'
    })
    
    if (response.code === 200) {
      ElMessage.success('申请已批准')
      fetchPendingClaims()
    } else {
      ElMessage.error(response.message || '批准失败')
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
    
    const response = await approveClaim({
      claimId: row.claimId,
      action: 'reject'
    })
    
    if (response.code === 200) {
      ElMessage.success('申请已拒绝')
      fetchPendingClaims()
    } else {
      ElMessage.error(response.message || '拒绝失败')
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