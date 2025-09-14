import request from './index.js'
import { API_ENDPOINTS } from '../constants/api.js'
import { UserAPI } from './user.js'

/**
 * 统计数据相关API接口
 * 基于现有后端接口聚合统计数据
 */
export class StatisticsAPI {
  /**
   * 获取失物统计数据
   * @returns {Promise<Object>} 失物统计信息
   */
  static async getLostItemStats() {
    try {
      // 获取所有失物数据
      const response = await request.get(API_ENDPOINTS.LOST_ITEMS.ALL)
      const lostItems = response.data || []

      // 统计基础数据
      const totalItems = lostItems.length
      const claimedItems = lostItems.filter(item => item.claimerName).length
      const unclaimedItems = totalItems - claimedItems

      // 按类型统计
      const typeStats = {}
      lostItems.forEach(item => {
        const type = item.type || '未分类'
        typeStats[type] = (typeStats[type] || 0) + 1
      })

      // 按颜色统计
      const colorStats = {}
      lostItems.forEach(item => {
        const color = item.color || '未知'
        colorStats[color] = (colorStats[color] || 0) + 1
      })

      // 按楼栋统计
      const buildingStats = {}
      lostItems.forEach(item => {
        const building = item.building || '未知楼栋'
        buildingStats[building] = (buildingStats[building] || 0) + 1
      })

      // 按日期统计（最近7天）
      const now = new Date()
      const dailyStats = {}
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        dailyStats[dateStr] = 0
      }

      lostItems.forEach(item => {
        if (item.publishTime) {
          const publishDate = new Date(item.publishTime).toISOString().split('T')[0]
          if (Object.prototype.hasOwnProperty.call(dailyStats, publishDate)) {
            dailyStats[publishDate]++
          }
        }
      })

      return {
        total: totalItems,
        claimed: claimedItems,
        unclaimed: unclaimedItems,
        claimRate: totalItems > 0 ? ((claimedItems / totalItems) * 100).toFixed(1) : 0,
        typeDistribution: typeStats,
        colorDistribution: colorStats,
        buildingDistribution: buildingStats,
        dailyTrend: dailyStats,
        recentItems: lostItems.slice(0, 10), // 最近10个失物
      }
    } catch (error) {
      console.error('获取失物统计数据失败:', error)
      throw error
    }
  }

  /**
   * 获取管理员统计数据
   * @returns {Promise<Object>} 管理员统计信息
   */
  static async getAdminStats() {
    try {
      // 获取所有失物数据来推导管理员统计
      const response = await request.get(API_ENDPOINTS.LOST_ITEMS.ALL)
      const lostItems = response.data || []

      // 统计各管理员发布的失物数量
      const adminStats = {}
      lostItems.forEach(item => {
        if (item.adminId) {
          if (!adminStats[item.adminId]) {
            adminStats[item.adminId] = {
              adminId: item.adminId,
              publishedCount: 0,
              claimedCount: 0,
              unclaimedCount: 0,
            }
          }
          adminStats[item.adminId].publishedCount++
          if (item.claimerName) {
            adminStats[item.adminId].claimedCount++
          } else {
            adminStats[item.adminId].unclaimedCount++
          }
        }
      })

      const adminList = Object.values(adminStats)
      const totalAdmins = adminList.length
      const activeAdmins = adminList.filter(admin => admin.publishedCount > 0).length

      return {
        totalAdmins,
        activeAdmins,
        adminList: adminList.sort((a, b) => b.publishedCount - a.publishedCount), // 按发布数量排序
        topAdmins: adminList.slice(0, 5), // 前5名活跃管理员
      }
    } catch (error) {
      console.error('获取管理员统计数据失败:', error)
      throw error
    }
  }

  /**
   * 获取系统整体统计数据
   * @returns {Promise<Object>} 系统统计信息
   */
  static async getSystemStats() {
    try {
      // 并行获取各项统计数据
      const [lostItemStats, adminStats, userStats] = await Promise.all([
        this.getLostItemStats(),
        this.getAdminStats(),
        UserAPI.getUserStats(),
      ])

      return {
        lostItems: {
          total: lostItemStats.total,
          claimed: lostItemStats.claimed,
          unclaimed: lostItemStats.unclaimed,
          claimRate: lostItemStats.claimRate,
        },
        admins: {
          total: adminStats.totalAdmins,
          active: adminStats.activeAdmins,
        },
        users: {
          activeUsers: userStats.totalActiveUsers,
          totalClaims: userStats.totalClaims,
        },
        trends: {
          dailyPublish: lostItemStats.dailyTrend,
          typeDistribution: lostItemStats.typeDistribution,
          buildingDistribution: lostItemStats.buildingDistribution,
        },
      }
    } catch (error) {
      console.error('获取系统统计数据失败:', error)
      throw error
    }
  }

  /**
   * 获取实时数据概览
   * @returns {Promise<Object>} 实时数据概览
   */
  static async getRealTimeOverview() {
    try {
      const response = await request.get(API_ENDPOINTS.LOST_ITEMS.ALL)
      const lostItems = response.data || []

      // 今日数据
      const today = new Date().toISOString().split('T')[0]
      const todayItems = lostItems.filter(item => {
        if (!item.publishTime) return false
        const publishDate = new Date(item.publishTime).toISOString().split('T')[0]
        return publishDate === today
      })

      // 本周数据
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const weekItems = lostItems.filter(item => {
        if (!item.publishTime) return false
        return new Date(item.publishTime) >= weekAgo
      })

      return {
        today: {
          published: todayItems.length,
          claimed: todayItems.filter(item => item.claimerName).length,
        },
        thisWeek: {
          published: weekItems.length,
          claimed: weekItems.filter(item => item.claimerName).length,
        },
        total: {
          items: lostItems.length,
          claimed: lostItems.filter(item => item.claimerName).length,
          unclaimed: lostItems.filter(item => !item.claimerName).length,
        },
      }
    } catch (error) {
      console.error('获取实时数据概览失败:', error)
      throw error
    }
  }
}

// 命名导出便于直接使用
export const getLostItemStats = StatisticsAPI.getLostItemStats
export const getAdminStats = StatisticsAPI.getAdminStats
export const getSystemStats = StatisticsAPI.getSystemStats
export const getRealTimeOverview = StatisticsAPI.getRealTimeOverview

export default StatisticsAPI
