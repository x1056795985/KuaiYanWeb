<template>
  <div class="dashboard-page">
    <!-- 关键数据卡片 -->
    <el-row :gutter="16" class="stat-cards-row">
      <el-col :xs="12" :sm="12" :md="6" :lg="6" v-for="(card, index) in statCards" :key="index">
        <div class="stat-card" :style="{ '--accent': card.color }">
          <div class="stat-card-icon" :style="{ backgroundColor: card.bg }">
            <el-icon :size="28" :style="{ color: card.color }">
              <component :is="card.icon" />
            </el-icon>
          </div>
          <div class="stat-card-body">
            <div class="stat-card-label">
              {{ card.label }}
              <span v-if="card.subLabel" class="stat-card-label-sub">{{ card.subLabel }}</span>
            </div>
            <div class="stat-card-value">
              <span v-if="card.loading" class="stat-skeleton">---</span>
              <template v-else>
                {{ card.value }}
                <span v-if="card.sub" class="stat-card-value-sub">{{ card.sub }}</span>
              </template>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 周/月对比卡片 -->
    <el-row :gutter="16" class="stat-cards-row">
      <el-col :xs="24" :sm="12" :md="12" :lg="12" v-for="(card, index) in compareCards" :key="'cmp'+index">
        <div class="compare-card">
          <div class="compare-card-header">
            <span class="compare-card-title">{{ card.title }}</span>
          </div>
          <div class="compare-card-body">
            <div class="compare-metric" v-for="metric in card.metrics" :key="metric.label">
              <div class="compare-metric-info">
                <span class="compare-metric-label">{{ metric.label }}</span>
                <span class="compare-metric-value">
                  <span v-if="metric.loading" class="stat-skeleton">---</span>
                  <span v-else>{{ metric.current }}</span>
                </span>
              </div>
              <div class="compare-metric-extra">
                <span class="compare-metric-prev">上{{ card.unit }}: <span v-if="metric.loading">-</span><span v-else>{{ metric.previous }}</span></span>
                <span v-if="!metric.loading" class="compare-metric-trend" :class="metric.trendClass">
                  <el-icon :size="12">
                    <CaretTop v-if="metric.trend > 0" />
                    <CaretBottom v-else-if="metric.trend < 0" />
                    <Minus v-else />
                  </el-icon>
                  {{ metric.trendText }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 卡号月度汇总卡片 -->
    <el-row :gutter="16" class="stat-cards-row">
      <el-col :span="24">
        <div class="compare-card ka-card">
          <div class="compare-card-header">
            <span class="compare-card-title">卡号月度汇总</span>
            <span class="compare-card-sub">每月1日0点0分作为分隔</span>
          </div>
          <div class="compare-card-body ka-body">
            <div class="compare-metric" v-for="metric in kaSummary" :key="metric.label">
              <div class="compare-metric-info">
                <span class="compare-metric-label">{{ metric.label }}</span>
                <span class="compare-metric-value">
                  <span v-if="metric.loading" class="stat-skeleton">---</span>
                  <span v-else>{{ metric.current }}</span>
                </span>
              </div>
              <div class="compare-metric-extra">
                <span class="compare-metric-prev">上月: <span v-if="metric.loading">-</span><span v-else>{{ metric.previous }}</span></span>
                <span v-if="!metric.loading" class="compare-metric-trend" :class="metric.trendClass">
                  <el-icon :size="12">
                    <CaretTop v-if="metric.trend > 0" />
                    <CaretBottom v-else-if="metric.trend < 0" />
                    <Minus v-else />
                  </el-icon>
                  {{ metric.trendText }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :xs="24" :sm="24" :md="16" :lg="16">
        <el-card shadow="never" class="dashboard-section chart-card">
          <template #header>
            <div class="section-header">
              <span class="section-title">用户统计趋势</span>
            </div>
          </template>
          <Echarts用户统计 />
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="8" :lg="8">
        <el-card shadow="never" class="dashboard-section chart-card">
          <template #header>
            <div class="section-header">
              <span class="section-title">在线用户分布</span>
            </div>
          </template>
          <Echarts在线统计 />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import Echarts用户统计 from './组件/用户账号统计统计折线.vue'
import Echarts在线统计 from './组件/在线用户统计饼图.vue'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { GetLinkUserList } from '@/api/在线用户api.js'
import { GetUserList } from '@/api/用户信息api.js'
import { get图表用户账号统计 } from '@/api/分析页Api.js'
import { get图表卡号月度汇总 } from '@/api/分析页Api.js'
import { get图表仪表台汇总 } from '@/api/分析页Api.js'

const router = useRouter()

const statCards = ref([
  {
    label: '在线用户',
    value: 0,
    subLabel: '',
    sub: '',
    icon: 'Monitor',
    color: '#409eff',
    bg: 'rgba(64, 158, 255, 0.1)',
    loading: true,
    api: () => GetLinkUserList({ Page: 0, Size: 1,Type:2,Status:1,Tourist:1,Keywords:"",AppId:0 }),
  },
  {
    label: '注册用户',
    value: 0,
    subLabel: '',
    sub: '',
    icon: 'User',
    color: '#67c23a',
    bg: 'rgba(103, 194, 58, 0.1)',
    loading: true,
    api: () => GetUserList({ Page: 0, Size: 1 }),
  },
  {
    label: '卡号总数',
    value: 0,
    subLabel: '未使用',
    sub: '',
    icon: 'Tickets',
    color: '#e6a23c',
    bg: 'rgba(230, 162, 60, 0.1)',
    loading: true,
  },
  {
    label: '本月充值总额',
    value: 0,
    subLabel: '上月总额',
    sub: '',
    icon: 'Wallet',
    color: '#f56c6c',
    bg: 'rgba(245, 108, 108, 0.1)',
    loading: true,
  },
])

const toolCards = ref([
  { label: '在线用户', icon: 'Monitor', name: '在线用户', color: '#409eff', bg: 'rgba(64, 158, 255, 0.1)' },
  { label: '应用列表', icon: 'SwitchFilled', name: '应用列表', color: '#67c23a', bg: 'rgba(103, 194, 58, 0.1)' },
  { label: '用户消息', icon: 'ChatLineSquare', name: '用户消息', color: '#b37feb', bg: 'rgba(179, 127, 235, 0.1)' },
  { label: '卡号列表', icon: 'Tickets', name: '卡号列表', color: '#e6a23c', bg: 'rgba(230, 162, 60, 0.1)' },
  { label: '充值订单', icon: 'Wallet', name: '支付充值订单', color: '#f56c6c', bg: 'rgba(245, 108, 108, 0.1)' },
  { label: '个人中心', icon: 'User', name: '个人中心', color: '#5cdbd3', bg: 'rgba(92, 219, 211, 0.1)' },
])

// 周/月对比卡片
const compareCards = ref([
  {
    title: '近一周对比',
    unit: '周',
    metrics: [
      { label: '注册数量', current: 0, previous: 0, trend: 0, trendText: '0%', trendClass: '', loading: true },
      { label: '登录数量', current: 0, previous: 0, trend: 0, trendText: '0%', trendClass: '', loading: true },
    ],
  },
  {
    title: '近一月对比',
    unit: '月',
    metrics: [
      { label: '注册数量', current: 0, previous: 0, trend: 0, trendText: '0%', trendClass: '', loading: true },
      { label: '登录数量', current: 0, previous: 0, trend: 0, trendText: '0%', trendClass: '', loading: true },
    ],
  },
])

// 卡号月度汇总
const kaSummary = ref([
  { label: '本月制卡', current: 0, previous: 0, trend: 0, trendText: '0%', trendClass: '', loading: true },
  { label: '本月卡号使用', current: 0, previous: 0, trend: 0, trendText: '0%', trendClass: '', loading: true },
])

const toTarget = (name) => {
  router.push({ name })
}

const loadStatData = async () => {
  // 在线用户、注册用户 通过分页接口获取 total
  for (let i = 0; i < 2; i++) {
    const card = statCards.value[i]
    try {
      const res = await card.api()
      if (res && res.code === 10000) {
        const total = res.data?.total ?? res.data?.Total ?? res.data?.count ?? 0
        card.value = typeof total === 'number' ? total.toLocaleString() : '0'
      } else {
        card.value = '0'
      }
    } catch {
      card.value = '0'
    } finally {
      card.loading = false
    }
  }

  // 卡号总数 + 本月充值总额 通过汇总接口获取
  const kaCard = statCards.value[2]
  const payCard = statCards.value[3]
  try {
    const res = await get图表仪表台汇总({})
    if (res && res.code === 10000) {
      const d = res.data
      kaCard.value = (d['卡号总数'] ?? 0).toLocaleString()
      kaCard.sub = (d['卡号未使用'] ?? 0).toLocaleString()

      const 本月 = d['本月充值总额'] ?? 0
      const 上月 = d['上月充值总额'] ?? 0
      payCard.value = '¥' + Number(本月).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      payCard.sub = '¥' + Number(上月).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    } else {
      kaCard.value = '0'; kaCard.sub = '0'
      payCard.value = '¥0.00'; payCard.sub = '¥0.00'
    }
  } catch {
    kaCard.value = '0'; kaCard.sub = '0'
    payCard.value = '¥0.00'; payCard.sub = '¥0.00'
  } finally {
    kaCard.loading = false
    payCard.loading = false
  }
}

// 求和辅助
const sumArr = (arr) => {
  if (!Array.isArray(arr)) return 0
  return arr.reduce((s, v) => s + (typeof v === 'number' ? v : 0), 0)
}

// 计算环比趋势
const calcTrend = (current, previous) => {
  if (previous === 0) {
    return { trend: current > 0 ? 1 : 0, trendText: current > 0 ? '新增' : '0%', trendClass: current > 0 ? 'trend-up' : 'trend-flat' }
  }
  const pct = ((current - previous) / previous) * 100
  const rounded = Math.round(pct * 10) / 10
  if (rounded > 0) return { trend: 1, trendText: '+' + rounded + '%', trendClass: 'trend-up' }
  if (rounded < 0) return { trend: -1, trendText: rounded + '%', trendClass: 'trend-down' }
  return { trend: 0, trendText: '0%', trendClass: 'trend-flat' }
}

// 加载周/月对比数据
const loadCompareData = async () => {
  // 同时请求4组数据: 近一周(Type=1,Offset=0)、上一周(Type=1,Offset=-7)、近一月(Type=2,Offset=0)、上一月(Type=2,Offset=-7)
  const [周本, 周上, 月本, 月上] = await Promise.allSettled([
    get图表用户账号统计({ Type: 1, Offset: 0 }),
    get图表用户账号统计({ Type: 1, Offset: -7 }),
    get图表用户账号统计({ Type: 2, Offset: 0 }),
    get图表用户账号统计({ Type: 2, Offset: -7 }),
  ])

  const 周本数据 = 周本.status === 'fulfilled' && 周本.value?.code === 10000 ? 周本.value.data : null
  const 周上数据 = 周上.status === 'fulfilled' && 周上.value?.code === 10000 ? 周上.value.data : null
  const 月本数据 = 月本.status === 'fulfilled' && 月本.value?.code === 10000 ? 月本.value.data : null
  const 月上数据 = 月上.status === 'fulfilled' && 月上.value?.code === 10000 ? 月上.value.data : null

  // 填充近一周对比
  if (周本数据) {
    const 本注册 = sumArr(周本数据[0]?.data)
    const 本登录 = sumArr(周本数据[1]?.data)
    const 上注册 = 周上数据 ? sumArr(周上数据[0]?.data) : 0
    const 上登录 = 周上数据 ? sumArr(周上数据[1]?.data) : 0

    const m0 = compareCards.value[0].metrics[0]
    m0.current = 本注册
    m0.previous = 上注册
    const t0 = calcTrend(本注册, 上注册)
    m0.trend = t0.trend; m0.trendText = t0.trendText; m0.trendClass = t0.trendClass
    m0.loading = false

    const m1 = compareCards.value[0].metrics[1]
    m1.current = 本登录
    m1.previous = 上登录
    const t1 = calcTrend(本登录, 上登录)
    m1.trend = t1.trend; m1.trendText = t1.trendText; m1.trendClass = t1.trendClass
    m1.loading = false
  } else {
    compareCards.value[0].metrics.forEach(m => { m.loading = false; m.current = 0; m.previous = 0 })
  }

  // 填充近一月对比
  if (月本数据) {
    const 本注册 = sumArr(月本数据[0]?.data)
    const 本登录 = sumArr(月本数据[1]?.data)
    const 上注册 = 月上数据 ? sumArr(月上数据[0]?.data) : 0
    const 上登录 = 月上数据 ? sumArr(月上数据[1]?.data) : 0

    const m0 = compareCards.value[1].metrics[0]
    m0.current = 本注册
    m0.previous = 上注册
    const t0 = calcTrend(本注册, 上注册)
    m0.trend = t0.trend; m0.trendText = t0.trendText; m0.trendClass = t0.trendClass
    m0.loading = false

    const m1 = compareCards.value[1].metrics[1]
    m1.current = 本登录
    m1.previous = 上登录
    const t1 = calcTrend(本登录, 上登录)
    m1.trend = t1.trend; m1.trendText = t1.trendText; m1.trendClass = t1.trendClass
    m1.loading = false
  } else {
    compareCards.value[1].metrics.forEach(m => { m.loading = false; m.current = 0; m.previous = 0 })
  }
}

// 加载卡号月度汇总数据
const loadKaSummary = async () => {
  try {
    const res = await get图表卡号月度汇总({})
    if (res && res.code === 10000) {
      const d = res.data
      const 本月制卡 = d['本月制卡'] ?? 0
      const 上月制卡 = d['上月制卡'] ?? 0
      const 本月使用 = d['本月使用'] ?? 0
      const 上月使用 = d['上月使用'] ?? 0

      const m0 = kaSummary.value[0]
      m0.current = 本月制卡
      m0.previous = 上月制卡
      const t0 = calcTrend(本月制卡, 上月制卡)
      m0.trend = t0.trend; m0.trendText = t0.trendText; m0.trendClass = t0.trendClass
      m0.loading = false

      const m1 = kaSummary.value[1]
      m1.current = 本月使用
      m1.previous = 上月使用
      const t1 = calcTrend(本月使用, 上月使用)
      m1.trend = t1.trend; m1.trendText = t1.trendText; m1.trendClass = t1.trendClass
      m1.loading = false
    } else {
      kaSummary.value.forEach(m => { m.loading = false; m.current = 0; m.previous = 0 })
    }
  } catch {
    kaSummary.value.forEach(m => { m.loading = false; m.current = 0; m.previous = 0 })
  }
}

onMounted(() => {
  loadStatData()
  loadCompareData()
  loadKaSummary()
})
</script>

<script>
export default {
  name: 'Dashboard'
}
</script>

<style lang="scss" scoped>
.dashboard-page {
  padding: 16px;
  background: #f0f2f5;
  min-height: 100%;
}

/* 关键数据卡片 */
.stat-cards-row {
  margin-bottom: 4px;
}

/* 周/月对比卡片 */
.compare-card {
  background: #fff;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  overflow: hidden;

  &-header {
    padding: 14px 20px;
    border-bottom: 1px solid #f0f0f0;
    background: #fafbfc;
  }

  &-title {
    font-size: 14px;
    font-weight: 600;
    color: #1d2129;
  }

  &-body {
    display: flex;
    gap: 0;
  }
}

.compare-metric {
  flex: 1;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  & + .compare-metric {
    border-left: 1px solid #f0f0f0;
  }

  &-info {
    display: flex;
    align-items: baseline;
    gap: 10px;
  }

  &-label {
    font-size: 13px;
    color: #86909c;
  }

  &-value {
    font-size: 24px;
    font-weight: 700;
    color: #1d2129;

    .stat-skeleton {
      color: #c0c4cc;
    }
  }

  &-extra {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &-prev {
    font-size: 12px;
    color: #a0a4ab;
  }

  &-trend {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    font-size: 12px;
    font-weight: 600;

    &.trend-up {
      color: #f56c6c;
    }

    &.trend-down {
      color: #67c23a;
    }

    &.trend-flat {
      color: #909399;
    }
  }
}

/* 卡号月度汇总卡片 */
.ka-card {
  .compare-card-sub {
    font-size: 12px;
    color: #a0a4ab;
    margin-left: 10px;
  }

  .ka-body {
    .compare-metric {
      flex: 1;
    }
  }
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #fff;
  border-radius: 8px;
  padding: 20px 24px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.3s, transform 0.3s;
  border-left: 4px solid var(--accent);

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }

  &-icon {
    flex-shrink: 0;
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &-body {
    flex: 1;
    min-width: 0;
  }

  &-value {
    font-size: 28px;
    font-weight: 700;
    color: #1d2129;
    line-height: 1.2;

    .stat-skeleton {
      color: #c0c4cc;
    }
  }

  &-label {
    font-size: 13px;
    color: #86909c;
    margin-top: 4px;
    display: flex;
    align-items: baseline;
    gap: 6px;
  }

  &-label-sub {
    font-size: 12px;
    color: #a0a4ab;
  }

  &-value-sub {
    font-size: 14px;
    font-weight: 600;
    color: #86909c;
    margin-left: 6px;
  }
}

/* 通用 section */
.dashboard-section {
  border-radius: 8px;
  margin-bottom: 16px;
  border: none;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  :deep(.el-card__header) {
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;
  }

  :deep(.el-card__body) {
    padding: 16px 20px;
  }
}

.section-header {
  display: flex;
  align-items: center;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #1d2129;
}

/* 快捷入口 */
.quick-entrance-card {
  :deep(.el-card__body) {
    padding: 20px;
  }
}

.quick-entrance-col {
  margin-bottom: 8px;
}

.quick-entrance-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.25s;

  &:hover {
    background-color: #f7f8fa;
  }

  &-icon {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
  }

  &-text {
    font-size: 13px;
    color: #4e5969;
  }
}

/* 图表区域 */
.chart-row {
  margin-bottom: 0;
}

.chart-card {
  margin-bottom: 16px;

  :deep(.el-card__body) {
    padding: 8px 12px;
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .dashboard-page {
    padding: 12px;
  }

  .stat-card {
    padding: 16px;
    gap: 12px;

    &-icon {
      width: 44px;
      height: 44px;
    }

    &-value {
      font-size: 22px;
    }

    &-label {
      font-size: 12px;
    }

    &-value-sub {
      font-size: 13px;
    }
  }

  .section-title {
    font-size: 14px;
  }

  .compare-card {
    &-body {
      flex-direction: column;
    }
  }

  .compare-metric {
    & + .compare-metric {
      border-left: none;
      border-top: 1px solid #f0f0f0;
    }

    &-value {
      font-size: 20px;
    }
  }
}
</style>
