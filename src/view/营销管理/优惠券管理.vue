<template>
  <main class="coupon-page">
    <section class="filter-card">
      <el-form :inline="true">
        <el-form-item label="应用">
          <el-select v-model="query.appId" filterable clearable @change="loadList">
            <el-option
              v-for="app in apps"
              :key="app.appId"
              :label="`${app.appName} (${app.appId})`"
              :value="app.appId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" clearable>
            <el-option label="全部" :value="0" />
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="query.couponType" clearable>
            <el-option label="全部" :value="0" />
            <el-option label="满减券" :value="1" />
            <el-option label="折扣券" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input v-model.trim="query.keywords" placeholder="请输入关键词或 ID">
            <template #prepend>
              <el-select v-model="query.type" style="width: 92px">
                <el-option label="名称" :value="2" />
                <el-option label="ID" :value="1" />
              </el-select>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">搜索</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </section>

    <section class="table-card">
      <div class="toolbar">
        <el-button type="primary" :disabled="!query.appId" @click="openCreate">新建优惠券</el-button>
        <span>已领取过的优惠券模板不能删除为真实删除，会按规则自动改为停用；同时结算相关字段禁止再修改。</span>
      </div>
      <el-table v-loading="loading" :data="data.list" border>
        <el-table-column prop="id" label="ID" width="72" />
        <el-table-column prop="name" label="名称" min-width="150" />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 1 ? 'success' : 'warning'">
              {{ row.type === 1 ? '满减' : '折扣' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="优惠规则" min-width="220">
          <template #default="{ row }">
            {{ couponRuleText(row) }}
          </template>
        </el-table-column>
        <el-table-column label="领取/使用" width="155">
          <template #default="{ row }">
            {{ row.receivedCount }}/{{ row.totalCount || '不限' }}，已用 {{ row.usedCount }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="领取结束" width="165">
          <template #default="{ row }">{{ formatTime(row.receiveEndTime) }}</template>
        </el-table-column>
        <el-table-column label="使用结束" width="165">
          <template #default="{ row }">{{ formatTime(row.useEndTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row.id)">编辑</el-button>
            <el-button link :type="row.status === 1 ? 'warning' : 'success'" @click="toggleStatus(row)">
              {{ row.status === 1 ? '停用' : '启用' }}
            </el-button>
            <el-popconfirm title="确认删除？已存在领取记录时会按规则改为停用。" @confirm="remove(row.id)">
              <template #reference>
                <el-button link type="danger">删除</el-button>
              </template>
            </el-popconfirm>
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

    <el-dialog
      v-model="dialogVisible"
      :title="form.id ? '编辑优惠券' : '新建优惠券'"
      width="760px"
      destroy-on-close
    >
      <el-alert
        v-if="settlementLocked"
        type="warning"
        :closable="false"
        show-icon
        title="该模板已存在领取记录，结算规则与适用卡类不可再修改。"
        class="mb16"
      />
      <el-form label-width="118px">
        <el-form-item label="优惠券名称" required>
          <el-input v-model.trim="form.name" maxlength="100" />
        </el-form-item>
        <el-form-item label="优惠券类型" required>
          <el-radio-group v-model="form.type" :disabled="settlementLocked" @change="handleCouponTypeChange">
            <el-radio :value="1">满减券</el-radio>
            <el-radio :value="2">折扣券</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="优惠规则" required>
          <template v-if="form.type === 1">
            满
            <span></span>
            <el-input-number
              v-model="form.minPayAmount"
              :min="0"
              :disabled="settlementLocked"
              style="width: 140px"
            />
            减
            <el-input-number
              v-model="form.couponValue"
              :min="0.01"
              :max="999999"
              :precision="2"
              :disabled="settlementLocked"
              style="width: 140px"
            />
          </template>
          <template v-else>
            满
            <el-input-number
              v-model="form.minPayAmount"
              :min="0"
              :disabled="settlementLocked"
              style="width: 140px"
            />
            元打
            <el-input-number
              v-model="form.couponValue"
              :min="0"
              :max="9.9"
              :step="0.1"
              :precision="1"
              :disabled="settlementLocked"
              style="width: 140px"
            />
            折，最高抵扣
            <el-input-number
              v-model="form.maxDiscountAmount"
              :min="0.01"
              :precision="2"
              :disabled="settlementLocked"
              style="width: 140px"
            />元
          </template>
        </el-form-item>
        <el-form-item label="适用卡类" required>
          <el-select
            v-model="form.kaClassIds"
            multiple
            filterable
            collapse-tags
            :disabled="settlementLocked"
            style="width: 100%"
          >
            <el-option
              v-for="item in kaClasses"
              :key="item.id"
              :label="`${item.name} (${money(item.money)})`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="总发放量">
          <el-input-number v-model="form.totalCount" :min="0" />
          <span class="tip">0 表示不限量</span>
        </el-form-item>
        <el-form-item label="单用户上限">
          <el-input-number v-model="form.perUserReceiveLimit" :min="1" />
        </el-form-item>
        <el-form-item label="领取时间" required>
          <el-date-picker
            v-model="receiveRange"
            type="datetimerange"
            value-format="X"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
          />
        </el-form-item>
        <el-form-item label="使用时间" required>
          <el-date-picker
            v-model="useRange"
            type="datetimerange"
            value-format="X"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="2">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="使用说明">
          <el-input v-model.trim="form.note" type="textarea" :rows="3" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { couponApi } from '@/api/webUserCouponapi'
import { GetAppIdNameList } from '@/api/应用列表api.js'
import { GetKaClassListAll } from '@/api/卡类列表api.js'

const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const apps = ref<any[]>([])
const kaClasses = ref<any[]>([])
const data = ref({ count: 0, list: [] as any[] })
const query = ref({ appId: 0, status: 0, couponType: 0, page: 1, size: 10, type: 2, keywords: '', count: 0 })
const form = ref<any>({})
const receiveRange = ref<string[]>([])
const useRange = ref<string[]>([])
const settlementLocked = computed(() => Boolean(form.value.id && form.value.receivedCount > 0))
const discountDisplay = (value: number) => {
  const num = Number(value || 0)
  return Number((num > 10 ? num / 10 : num).toFixed(1))
}
const discountPreviewText = computed(() => {
  if (form.value.type !== 2) return ''
  const value = Number(form.value.couponValue || 0)
  return value ? `100打${discountDisplay(value).toFixed(1)}折=${Math.round(discountDisplay(value) * 10)}` : ''
})

const emptyForm = () => ({
  id: 0,
  appId: query.value.appId,
  name: '',
  type: 1,
  couponValue: 10,
  minPayAmount: 100,
  maxDiscountAmount: 20,
  kaClassIds: [],
  totalCount: 0,
  perUserReceiveLimit: 1,
  status: 1,
  note: '',
  receivedCount: 0,
})

const money = (value: number) => `¥${Number(value || 0).toFixed(2)}`
const formatTime = (value: number) => (value ? new Date(value * 1000).toLocaleString() : '-')
const couponRuleText = (row: any) => Number(row.type) === 1
  ? `满${money(row.minPayAmount)}减${money(row.couponValue)}`
  : `满${money(row.minPayAmount)}打${discountDisplay(row.couponValue).toFixed(1)}折，最高抵扣${money(row.maxDiscountAmount)}`
const normalizeKaClass = (item: any) => ({
  id: Number(item?.id ?? item?.Id ?? 0),
  name: item?.name ?? item?.Name ?? '',
  money: Number(item?.money ?? item?.Money ?? 0),
})
const normalizeForm = (item: any) => ({
  ...item,
  couponValue: Number(item?.type) === 2 ? discountDisplay(item?.couponValue) : Number(item?.couponValue ?? 0),
})
const toBackendCouponValue = (item: any) => Number((discountDisplay(item?.couponValue) * 10).toFixed(2))
const handleCouponTypeChange = (type: number) => {
  if (type === 2 && (Number(form.value.couponValue) <= 0 || Number(form.value.couponValue) > 9.9)) {
    form.value.couponValue = 8.5
  }
}

async function loadApps() {
  const result = await GetAppIdNameList()
  if (result.code === 10000) {
    apps.value = result.data.array || []
    if (!query.value.appId && apps.value.length) query.value.appId = apps.value[0].appId
  }
}

async function loadKaClasses() {
  if (!query.value.appId) return
  const result = await GetKaClassListAll({ appId: query.value.appId })
  if (result.code === 10000) {
    kaClasses.value = (result.data || [])
      .map((item: any) => normalizeKaClass(item))
      .filter((item: any) => item.money > 0)
  }
}

async function loadList() {
  if (!query.value.appId) return
  loading.value = true
  const result = await couponApi.getList(query.value)
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
  query.value.status = 0
  query.value.couponType = 0
  query.value.type = 2
  query.value.keywords = ''
  await search()
}

async function openCreate() {
  await loadKaClasses()
  form.value = emptyForm()
  const now = Math.floor(Date.now() / 1000)
  receiveRange.value = [String(now), String(now + 7 * 86400)]
  useRange.value = [String(now), String(now + 30 * 86400)]
  dialogVisible.value = true
}

async function openEdit(id: number) {
  const result = await couponApi.info({ id })
  if (result.code !== 10000) return ElMessage.error(result.msg)
  await loadKaClasses()
  form.value = normalizeForm({ ...result.data.info, kaClassIds: result.data.kaClassIds || [] })
  receiveRange.value = [String(form.value.receiveStartTime), String(form.value.receiveEndTime)]
  useRange.value = [String(form.value.useStartTime), String(form.value.useEndTime)]
  dialogVisible.value = true
}

async function save() {
  if (!form.value.name || !form.value.kaClassIds.length || receiveRange.value.length !== 2 || useRange.value.length !== 2) {
    return ElMessage.warning('请完整填写必填项')
  }
  if (form.value.type === 2 && Number(form.value.maxDiscountAmount) <= 0) {
    return ElMessage.warning('折扣券必须设置最高优惠金额')
  }
  const payload = {
    ...form.value,
    couponValue: form.value.type === 2 ? toBackendCouponValue(form.value) : Number(form.value.couponValue || 0),
    appId: query.value.appId,
    receiveStartTime: Number(receiveRange.value[0]),
    receiveEndTime: Number(receiveRange.value[1]),
    useStartTime: Number(useRange.value[0]),
    useEndTime: Number(useRange.value[1]),
  }
  saving.value = true
  const result = payload.id ? await couponApi.update(payload) : await couponApi.create(payload)
  saving.value = false
  if (result.code === 10000) {
    ElMessage.success(result.msg)
    dialogVisible.value = false
    await loadList()
  } else {
    ElMessage.error(result.msg)
  }
}

async function toggleStatus(row: any) {
  const result = await couponApi.setStatus({ id: row.id, status: row.status === 1 ? 2 : 1 })
  if (result.code === 10000) {
    ElMessage.success(result.msg)
    await loadList()
  } else {
    ElMessage.error(result.msg)
  }
}

async function remove(id: number) {
  const result = await couponApi.delete({ id })
  if (result.code === 10000) {
    ElMessage.success(result.msg)
    await loadList()
  } else {
    ElMessage.error(result.msg)
  }
}

onMounted(async () => {
  await loadApps()
  await loadList()
})
</script>

<style scoped lang="scss">
.coupon-page { min-height: calc(100vh - 140px); padding: 16px; background: #f0f2f5; }
.filter-card, .table-card { padding: 16px; margin-bottom: 14px; background: #fff; border-radius: 4px; }
.toolbar { display: flex; align-items: center; gap: 14px; margin-bottom: 12px; color: #909399; font-size: 13px; }
.pager { justify-content: flex-end; margin-top: 16px; }
.tip { margin-left: 10px; color: #909399; font-size: 12px; }
.mb16 { margin-bottom: 16px; }
</style>
