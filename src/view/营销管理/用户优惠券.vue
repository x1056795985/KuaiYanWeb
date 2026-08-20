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
        <el-form-item label="用户UID">
          <el-input-number v-model="query.uid" :min="0" :precision="0" @change="search" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" clearable @change="search">
            <el-option label="全部" :value="0" />
            <el-option label="未使用" :value="1" />
            <el-option label="已锁定" :value="2" />
            <el-option label="已使用" :value="3" />
            <el-option label="已过期" :value="4" />
            <el-option label="已作废" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="领取时间">
          <el-date-picker
            v-model="query.receiveTime"
            type="datetimerange"
            value-format="X"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            @change="search"
          />
        </el-form-item>
        <el-form-item label="使用时间">
          <el-date-picker
            v-model="query.useTime"
            type="datetimerange"
            value-format="X"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            @change="search"
          />
        </el-form-item>
        <el-form-item>
          <el-input v-model.trim="query.keywords" placeholder="券名称、订单号或 ID">
            <template #prepend>
              <el-select v-model="query.type" style="width: 100px" @change="search">
                <el-option label="券名称" :value="2" />
                <el-option label="订单号" :value="3" />
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
      <div class="toolbar">
        <el-button type="danger" :disabled="!hasSelection" @click="batchVoid">批量删除</el-button>
        <span>仅未使用或已锁定的用户券可删除，已使用券保持历史不变。</span>
      </div>
      <el-table v-loading="loading" :data="data.list" border @selection-change="onSelectionChange">
        <el-table-column type="selection" width="44" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="appId" label="应用 ID" width="95" />
        <el-table-column prop="uid" label="用户 UID" width="100" />
        <el-table-column prop="couponName" label="优惠券" min-width="150" />
        <el-table-column label="规则" min-width="160">
          <template #default="{ row }">{{ rule(row) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="payOrder" label="关联订单" min-width="150" show-overflow-tooltip />
        <el-table-column label="优惠金额" width="100">
          <template #default="{ row }">¥{{ Number(row.discountAmount || 0).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="领取时间" width="165">
          <template #default="{ row }">{{ time(row.receiveTime) }}</template>
        </el-table-column>
        <el-table-column label="使用时间" width="165">
          <template #default="{ row }">{{ time(row.useTime) }}</template>
        </el-table-column>
        <el-table-column label="失效时间" width="165">
          <template #default="{ row }">{{ time(row.useEndTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status !== 3 && row.status !== 5" link type="danger" @click="voidCoupon(row)">
              删除
            </el-button>
            <span v-else>-</span>
          </template>
        </el-table-column>
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
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { couponUserApi } from '@/api/webUserCouponUserapi'
import { GetAppIdNameList } from '@/api/应用列表api.js'

const loading = ref(false)
const apps = ref<any[]>([])
const data = ref({ count: 0, list: [] as any[] })
const selectedRows = ref<any[]>([])
const query = ref({
  appId: 0,
  uid: 0,
  status: 0,
  receiveTime: [] as string[],
  useTime: [] as string[],
  page: 1,
  size: 10,
  type: 2,
  keywords: '',
  count: 0,
})

const hasSelection = computed(() => selectedRows.value.length > 0)
const time = (v: number) => (v ? new Date(v * 1000).toLocaleString() : '-')
const statusText = (v: number) => ['','未使用','已锁定','已使用','已过期','已作废'][v] || '未知'
const statusType = (v: number) => ({ 1: 'success', 2: 'warning', 3: 'info', 4: 'danger', 5: 'info' } as any)[v] || ''
const rule = (row: any) => row.couponType === 1
  ? `满 ${Number(row.minPayAmount).toFixed(2)} 减 ${Number(row.couponValue).toFixed(2)}`
  : `满 ${Number(row.minPayAmount).toFixed(2)} 打 ${Math.round(Number(row.couponValue || 0))} 折，最高减 ${Number(row.maxDiscountAmount).toFixed(2)}`

function onSelectionChange(rows: any[]) {
  selectedRows.value = rows
}

async function loadList() {
  loading.value = true
  const result = await couponUserApi.getList(query.value)
  loading.value = false
  if (result.code === 10000) {
    data.value = result.data
    selectedRows.value = []
  }
  else ElMessage.error(result.msg)
}

async function search() {
  query.value.page = 1
  query.value.count = 0
  await loadList()
}

async function reset() {
  query.value.uid = 0
  query.value.status = 0
  query.value.type = 2
  query.value.keywords = ''
  query.value.receiveTime = []
  query.value.useTime = []
  selectedRows.value = []
  await search()
}

async function voidCoupon(row: any) {
  try {
    const prompt = await ElMessageBox.prompt(
      `删除后不可恢复。用户券：${row.couponName}`,
      '删除用户券',
      {
        inputPlaceholder: '删除说明（可选）',
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )
    const result = await couponUserApi.void({ id: row.id, note: prompt.value || '' })
    if (result.code === 10000) {
      ElMessage.success(result.msg)
      await loadList()
    } else {
      ElMessage.error(result.msg)
    }
  } catch (_) {}
}

async function batchVoid() {
  if (!selectedRows.value.length) return
  if (selectedRows.value.some((row) => [3, 5].includes(Number(row.status)))) {
    ElMessage.warning('仅未使用或已锁定的用户券可删除')
    return
  }
  try {
    const prompt = await ElMessageBox.prompt(
      `将删除选中的 ${selectedRows.value.length} 张用户券，删除后不可恢复。`,
      '批量删除用户券',
      {
        inputPlaceholder: '删除说明（可选）',
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )
    for (const row of selectedRows.value) {
      const result = await couponUserApi.void({ id: row.id, note: prompt.value || '' })
      if (result.code !== 10000) {
        ElMessage.error(result.msg)
        return
      }
    }
    ElMessage.success(`已删除 ${selectedRows.value.length} 张用户券`)
    selectedRows.value = []
    await loadList()
  } catch (_) {}
}

async function loadApps() {
  const result = await GetAppIdNameList()
  if (result.code === 10000) {
    apps.value = result.data.array || []
    if (!query.value.appId && apps.value.length) query.value.appId = apps.value[0].appId
  }
}

onMounted(async () => {
  await loadApps()
  await loadList()
})
</script>

<style scoped lang="scss">
.page { min-height: calc(100vh - 140px); padding: 16px; background: #f0f2f5; }
.panel { padding: 16px; margin-bottom: 14px; background: #fff; border-radius: 4px; }
.toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; color: #909399; font-size: 13px; }
.pager { justify-content: flex-end; margin-top: 16px; }
</style>
