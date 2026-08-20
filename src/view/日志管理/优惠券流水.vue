<template>
  <main class="page">
    <section class="panel">
      <el-form :inline="true">
        <el-form-item label="应用">
          <el-select v-model="query.appId" clearable filterable @change="search">
            <el-option label="全部" :value="0" />
            <el-option
              v-for="app in apps"
              :key="app.appId"
              :label="`${app.appName} (${app.appId})`"
              :value="app.appId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="事件">
          <el-select v-model="query.eventType" clearable @change="search">
            <el-option label="全部" :value="0" />
            <el-option v-for="item in events" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="query.timeRange"
            type="datetimerange"
            value-format="X"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            @change="search"
          />
        </el-form-item>
        <el-form-item>
          <el-input v-model.trim="query.keywords" placeholder="订单号、操作人或 ID">
            <template #prepend>
              <el-select v-model="query.type" style="width: 96px" @change="search">
                <el-option label="订单号" :value="2" />
                <el-option label="操作人" :value="3" />
                <el-option label="ID" :value="1" />
              </el-select>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">查询</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </section>

    <section class="panel">
      <el-table v-loading="loading" :data="data.list" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="appId" label="应用 ID" width="90" />
        <el-table-column prop="uid" label="用户 UID" width="100" />
        <el-table-column prop="couponId" label="模板 ID" width="95" />
        <el-table-column prop="couponUserId" label="用户券 ID" width="105" />
        <el-table-column label="事件" width="100">
          <template #default="{ row }">
            <el-tag :type="row.eventType === 4 ? 'success' : row.eventType === 6 ? 'danger' : 'info'">
              {{ eventText(row.eventType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="payOrder" label="关联订单" min-width="160" show-overflow-tooltip />
        <el-table-column label="优惠金额" width="105">
          <template #default="{ row }">¥{{ Number(row.amount || 0).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column label="时间" width="165">
          <template #default="{ row }">{{ time(row.time) }}</template>
        </el-table-column>
        <el-table-column prop="note" label="说明" min-width="170" show-overflow-tooltip />
      </el-table>
      <el-pagination
        v-model:current-page="query.page"
        v-model:page-size="query.size"
        class="pager"
        :total="data.count"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="loadList"
        @size-change="search"
      />
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { couponLogApi } from '@/api/webUserCouponLogapi'
import { GetAppIdNameList } from '@/api/应用列表api.js'

const apps = ref<any[]>([])
const loading = ref(false)
const data = ref({ count: 0, list: [] as any[] })
const events = [
  { value: 1, label: '领取' },
  { value: 2, label: '锁定' },
  { value: 3, label: '释放' },
  { value: 4, label: '使用' },
  { value: 5, label: '过期' },
  { value: 6, label: '作废' },
]
const query = ref({
  appId: 0,
  couponId: 0,
  couponUserId: 0,
  uid: 0,
  eventType: 0,
  timeRange: [] as string[],
  page: 1,
  size: 10,
  type: 2,
  keywords: '',
  count: 0,
})

const time = (v: number) => (v ? new Date(v * 1000).toLocaleString() : '-')
const eventText = (v: number) => events.find((item) => item.value === v)?.label || '未知'

async function loadList() {
  loading.value = true
  const result = await couponLogApi.getList(query.value)
  loading.value = false
  if (result.code === 10000) data.value = result.data
  else ElMessage.error(result.msg)
}

async function search() {
  query.value.page = 1
  query.value.count = 0
  await loadList()
}

async function reset() {
  query.value.eventType = 0
  query.value.type = 2
  query.value.keywords = ''
  query.value.timeRange = []
  await search()
}

onMounted(async () => {
  const result = await GetAppIdNameList()
  if (result.code === 10000) apps.value = result.data.array || []
  await loadList()
})
</script>

<style scoped lang="scss">
.page { min-height: calc(100vh - 140px); padding: 16px; background: #f0f2f5; }
.panel { padding: 16px; margin-bottom: 14px; background: #fff; border-radius: 4px; }
.pager { justify-content: flex-end; margin-top: 16px; }
</style>
