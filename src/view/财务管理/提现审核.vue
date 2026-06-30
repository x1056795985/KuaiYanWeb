<template>
  <div class="withdraw-page">
    <div class="content-block">
      <el-form :inline="true" :model="search">
        <el-form-item label="订单状态">
          <el-select v-model="search.status" clearable style="width: 120px">
            <el-option label="全部" :value="0" />
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item style="width: 250px">
          <el-config-provider :locale="zhCn">
            <el-date-picker
              v-model="search.registerTime"
              value-format="X"
              type="daterange"
              unlink-panels
              range-separator="到"
              start-placeholder="申请开始日期"
              end-placeholder="申请结束日期"
              :shortcuts="dateShortcuts"
            />
          </el-config-provider>
        </el-form-item>
        <el-form-item>
          <el-input v-model.trim="search.keywords" clearable placeholder="搜索内容" style="width: auto">
            <template #prepend>
              <el-select v-model="search.type" style="width: 105px">
                <el-option label="用户名" :value="1" />
                <el-option label="用户ID" :value="2" />
                <el-option label="订单号" :value="3" />
                <el-option label="金额" :value="4" />
              </el-select>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="loadList(1)">查询</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="content-block">
      <div class="gva-btn-list">
        <el-popconfirm title="确定删除勾选申请记录?" width="220" @confirm="deleteWithdraw(1)" confirm-button-text="确定" cancel-button-text="取消">
          <template #reference>
            <el-button type="danger" :icon="Delete" :disabled="selectedRows.length === 0">删除</el-button>
          </template>
        </el-popconfirm>
        <div class="tool-bar">
          <el-popover placement="right" trigger="click" width="120">
            <template #reference>
              <span class="more-trigger">
                <el-icon><More /></el-icon>
                <span>更多功能</span>
              </span>
            </template>
            <li class="more-item" @click="deleteWithdraw(3)">删除 全部</li>
            <li class="more-item" @click="deleteWithdraw(4)">删除 7天前</li>
            <li class="more-item" @click="deleteWithdraw(5)">删除30天前</li>
            <li class="more-item" @click="deleteWithdraw(6)">删除90天前</li>
            <li class="more-item" @click="deleteWithdrawByUser">删指定用户</li>
            <li class="more-item" @click="deleteWithdraw(8)">删除已取消</li>
          </el-popover>
          <el-tooltip content="刷新" placement="top">
            <el-icon @click="loadList(0)"><RefreshRight /></el-icon>
          </el-tooltip>
        </div>
      </div>
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="data.list"
        border
        style="width: 100%; white-space: pre-wrap;"
        :max-height="tableHeight"
        highlight-current-row
        :header-cell-style="{ background: '#FAFAFAFF', color: '#606266' }"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="45" />
        <el-table-column prop="Id" label="ID" width="80" />
        <el-table-column prop="OrderNo" label="提现单号" width="190" show-overflow-tooltip />
        <el-table-column prop="User" label="用户名" width="140" />
        <el-table-column prop="Uid" label="UID" width="90" />
        <el-table-column prop="Amount" label="金额" width="120">
          <template #default="{ row }">
            <el-tag type="danger">{{ formatMoney(row.Amount) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="Status" label="订单状态" width="110">
          <template #default="{ row }">
            <el-tag :type="statusType(row.Status)">{{ statusText(row.Status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="PayeeType" label="收款方式" width="110">
          <template #default="{ row }">{{ row.PayeeType === 1 ? '收款码' : '账号' }}</template>
        </el-table-column>
        <el-table-column prop="PayeeAccount" label="收款账号" min-width="160" show-overflow-tooltip />
        <el-table-column prop="PayeeName" label="收款人" width="120" show-overflow-tooltip />
        <el-table-column prop="CreateTime" label="申请时间" width="170">
          <template #default="{ row }">{{ formatTime(row.CreateTime) }}</template>
        </el-table-column>
        <el-table-column prop="OperatorUser" label="最后操作" width="130" show-overflow-tooltip />
        <el-table-column :fixed="is移动端() ? false : 'right'" label="操作" width="170">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDetail(row)">详情</el-button>
            <el-button v-if="row.Status === 1" link type="success" @click="auditPass(row)">通过</el-button>
            <el-button v-if="row.Status === 1 || row.Status === 3" link type="danger" @click="reject(row)">驳回</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="demo-pagination-block">
        <el-config-provider :locale="zhCn">
          <el-pagination
            v-model:current-page="search.page"
            v-model:page-size="search.size"
            :page-sizes="[10, 20, 30, 40, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="data.count"
            size="small"
            @size-change="loadList(1)"
            @current-change="loadList(0)"
          />
        </el-config-provider>
      </div>
    </div>

    <el-drawer v-model="detailVisible" title="提现审核处理"  :size="is移动端()?'95%':'88%'" @closed="clearVoucherToken">
      <div v-if="detail.info" class="drawer-body">
        <div class="detail-grid">
          <div class="detail-main">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="提现单号">{{ detail.info.OrderNo }}</el-descriptions-item>
              <el-descriptions-item label="订单状态">
                <el-tag :type="statusType(detail.info.Status)">{{ statusText(detail.info.Status) }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="用户">{{ detail.info.User }} / {{ detail.info.Uid }}</el-descriptions-item>
              <el-descriptions-item label="金额">
                <el-tag type="danger" size="large">{{ formatMoney(detail.info.Amount) }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="申请时间">{{ formatTime(detail.info.CreateTime) }}</el-descriptions-item>
              <el-descriptions-item label="最后操作">{{ detail.info.OperatorUser || '-' }}</el-descriptions-item>
              <el-descriptions-item label="用户备注" :span="2">{{ detail.info.UserNote || '-' }}</el-descriptions-item>
              <el-descriptions-item label="管理回复" :span="2">{{ detail.info.AdminReply || '-' }}</el-descriptions-item>
            </el-descriptions>
            <el-row :gutter="5" >
              <el-col :span="12">
                <div class="section-title">收款信息</div>
                <div class="media-panel">
                  <el-image
                      v-if="detail.info.PayeeType === 1 && detailImageUrls.payeeQr"
                      :src="detailImageUrls.payeeQr"
                      :preview-src-list="[detailImageUrls.payeeQr]"
                      preview-teleported
                      fit="contain"
                      class="large-image"
                  />
                  <div v-else class="account-info">
                    <div>收款人：{{ detail.info.PayeeName || '-' }}</div>
                    <div>收款账号：{{ detail.info.PayeeAccount || '-' }}</div>
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="section-title">付款凭证</div>
                <div v-if="voucherToken.qrcodeBase64" class="qr-box">
                  <button class="qr-close" type="button" @click="clearVoucherToken">x</button>
                  <img
                    :src="'data:image/png;base64,' + voucherToken.qrcodeBase64"
                    alt="上传二维码"
                    class="qr-thumb"
                    @click="openQrPreview"
                  />
                  <el-text type="info">手机扫码上传付款截图，上传成功后会自动刷新凭证。</el-text>
                  <el-text v-if="voucherToken.expireTime" type="warning">有效期至：{{ formatTime(voucherToken.expireTime) }}</el-text>
                </div>
                <el-image
                  v-else-if="detailImageUrls.voucher"
                  :src="detailImageUrls.voucher"
                  :preview-src-list="[detailImageUrls.voucher]"
                  preview-teleported
                  fit="contain"
                  class="voucher-preview"
                />
                <el-empty v-else description="未上传付款凭证" :image-size="80" />
                <el-row :gutter="20" class="voucher-action-row">
                  <el-col :span="12" class="voucher-action-col">
                    <el-upload
                        v-if="detail.info.Status === 3 || detail.info.Status === 4"
                        class="voucher-upload"
                        :show-file-list="false"
                        :http-request="(opt) => uploadVoucher(detail.info, opt)"
                    >
                      <el-button type="primary">本机上传凭证</el-button>
                    </el-upload>
                  </el-col>
                  <el-col :span="12" class="voucher-action-col">
                    <el-button v-if="!is移动端() && detail.info.Status === 3" :loading="voucherToken.loading" @click="createVoucherQr">手机扫码上传</el-button>
                  </el-col>
                </el-row>


              </el-col>
            </el-row>


            <div class="section-title">操作日志</div>
            <el-timeline>
              <el-timeline-item v-for="log in detail.logs" :key="log.Id" :timestamp="formatTime(log.Time)">
                {{ actionText(log.Action) }}：{{ log.Note }}（{{ log.OperatorUser }}）
              </el-timeline-item>
            </el-timeline>

            <div v-if="pastVoucherHistory.length" class="section-title">历史凭证</div>
            <div v-if="pastVoucherHistory.length" class="voucher-history">
              <div v-for="item in pastVoucherHistory" :key="item.path" class="voucher-history-item">
                <el-image
                  v-if="voucherHistoryUrls[item.path]"
                  :src="voucherHistoryUrls[item.path]"
                  :preview-src-list="voucherHistoryPreviewList"
                  preview-teleported
                  fit="cover"
                  class="voucher-history-image"
                />
                <div class="voucher-history-meta">
                  <span>{{ actionText(item.action) }}</span>
                  <span>{{ formatTime(item.time) || '-' }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="pay-panel" v-if="!is移动端()">
            <div class="side-card">
              <div class="section-title side-card-title">风险提示</div>
              <div v-if="detail.riskTags.length" class="risk-panel">
                <el-tag v-for="tag in detail.riskTags" :key="tag" type="danger" effect="light" class="risk-tag">{{ tag }}</el-tag>
              </div>
              <el-empty v-else description="当前无风险提示" :image-size="68" />
            </div>

            <div class="side-card balance-card">
              <div class="section-title side-card-title">近期余额日志</div>
              <div class="balance-log-subtitle">{{ detail.info.User }} 最近 10 条余额变化</div>
              <el-empty v-if="!detail.balanceLogs.length && !balanceLogLoading" description="暂无余额日志" :image-size="68" />
              <div v-else v-loading="balanceLogLoading" class="balance-log-list">
                <div v-for="item in detail.balanceLogs" :key="item.Id" class="balance-log-item">
                  <div class="balance-log-head">
                    <span class="balance-log-time">{{ formatTime(item.Time) || '-' }}</span>
                    <el-tag :type="Number(item.Count) > 0 ? 'warning' : 'primary'" size="small">
                      {{ formatBalanceChange(item.Count) }}
                    </el-tag>
                  </div>
                  <div class="balance-log-note">{{ item.Note || '-' }}</div>
                  <div class="balance-log-ip">IP：{{ item.Ip || '-' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="drawer-footer">
          <el-button @click="detailVisible = false">取消</el-button>
          <el-button v-if="detail.info?.Status === 1" type="success" @click="auditPass(detail.info)">审核通过</el-button>
          <el-button v-if="detail.info?.Status === 1 || detail.info?.Status === 3" type="danger" @click="reject(detail.info)">驳回</el-button>
          <el-button v-if="detail.info?.Status === 3" type="warning" @click="markPaid(detail.info)">已打款</el-button>
        </div>
      </template>
    </el-drawer>

    <el-image-viewer
      v-if="qrPreviewVisible"
      :url-list="[qrPreviewSrc]"
      @close="qrPreviewVisible = false"
    />

    <el-dialog v-model="rejectDialog.visible" :title="rejectDialog.title" width="520px" destroy-on-close>
      <div class="reject-dialog-body">
        <el-alert
          :title="rejectDialog.alertText"
          type="warning"
          :closable="false"
          show-icon
        />
        <div v-if="rejectDialog.shortcuts.length" class="reject-shortcuts">
          <span class="reject-shortcuts-label">快捷选择</span>
          <div class="reject-shortcuts-list">
            <el-button
              v-for="item in rejectDialog.shortcuts"
              :key="item"
              size="small"
              plain
              @click="rejectDialog.reason = item"
            >
              {{ item }}
            </el-button>
          </div>
        </div>
        <el-input
          v-model.trim="rejectDialog.reason"
          type="textarea"
          :rows="4"
          maxlength="200"
          show-word-limit
          :placeholder="rejectDialog.placeholder"
        />
      </div>
      <template #footer>
        <div class="drawer-footer">
          <el-button @click="closeRejectDialog">取消</el-button>
          <el-button type="danger" :loading="rejectDialog.loading" @click="submitReject">确认驳回</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { Delete, More, Refresh, RefreshRight, Search } from '@element-plus/icons-vue'
import { withdrawApi } from '@/api/提现审核api.js'
import { GetLogMoneyList } from '@/api/余额日志api.js'
import { useTableHeight } from '@/composables/useTableHeight'
import {is移动端} from "@/utils/utils.ts";

const statusOptions = [
  { value: 1, label: '待审核' },
  { value: 2, label: '已驳回' },
  { value: 3, label: '待付款' },
  { value: 4, label: '已付款' },
  { value: 5, label: '已取消' }
]

const dateShortcuts = [
  { text: '最近一周', value: () => [new Date(Date.now() - 3600 * 1000 * 24 * 7), new Date()] },
  { text: '最近一个月', value: () => [new Date(Date.now() - 3600 * 1000 * 24 * 30), new Date()] },
  { text: '最近三个月', value: () => [new Date(Date.now() - 3600 * 1000 * 24 * 90), new Date()] }
]

const loading = ref(false)
const detailVisible = ref(false)
const balanceLogLoading = ref(false)
const selectedRows = ref([])
const data = reactive({ list: [], count: 0 })
const detail = reactive({ info: null, logs: [], voucherHistory: [], riskTags: [], balanceLogs: [] })
const detailImageUrls = reactive({ payeeQr: '', voucher: '' })
const voucherHistoryUrls = reactive({})
const voucherHistoryPreviewList = ref([])
const voucherToken = reactive({ token: '', qrcodeBase64: '', expireTime: 0, loading: false })
const qrPreviewVisible = ref(false)
const qrPreviewSrc = ref('')
const rejectDialog = reactive({
  visible: false,
  loading: false,
  row: null,
  reason: '',
  title: '驳回提现',
  alertText: '请输入驳回原因。',
  placeholder: '请输入驳回原因',
  shortcuts: ["请联系管理员","收款码无法付款","账号异常","金额异常","支付平台限制","付款失败"]
})



const search = reactive({ page: 1, size: 10, status: 0, type: 1, keywords: '', registerTime: [], count: 0 })
const { tableRef, tableHeight } = useTableHeight(85)
const imageUrlCache = new Map()
let voucherTimer = 0
const payFailReasonOptions = ['收款码无法付款', '账号异常', '金额异常', '支付平台限制', '付款失败']

const requestParams = () => ({
  page: search.page,
  size: search.size,
  status: search.status || 0,
  type: search.type,
  keywords: search.keywords,
  registerTime: search.registerTime || [],
  count: search.count || 0
})

const statusText = (value) => statusOptions.find(item => item.value === value)?.label || '未知'
const statusType = (value) => ({ 1: 'warning', 2: 'danger', 3: 'primary', 4: 'success', 5: 'info' }[value] || 'info')
const actionText = (value) => ({ 1: '提交', 2: '取消', 3: '审核通过', 4: '驳回', 5: '上传凭证', 6: '重传凭证', 7: '标记付款', 8: '付款失败驳回' }[value] || '操作')
const formatMoney = (value) => Number(value || 0).toFixed(2)
const formatBalanceChange = (value) => {
  const num = Number(value || 0)
  return `${num > 0 ? '+' : ''}${num.toFixed(2)}`
}
const formatTime = (value) => value ? new Date(Number(value) * 1000).toLocaleString() : ''
const pastVoucherHistory = computed(() => detail.voucherHistory.filter(item => !item.current))
const normalizeRiskTags = (source, fallback) => {
  if (Array.isArray(source)) {
    return source.map(item => String(item || '').trim()).filter(Boolean)
  }
  if (typeof source === 'string' && source.trim()) {
    try {
      const parsed = JSON.parse(source)
      if (Array.isArray(parsed)) {
        return parsed.map(item => String(item || '').trim()).filter(Boolean)
      }
    } catch (_) {
      return source.split(/[,\n]/).map(item => item.trim()).filter(Boolean)
    }
  }
  if (Array.isArray(fallback)) {
    return fallback.map(item => String(item || '').trim()).filter(Boolean)
  }
  return []
}

const loadBalanceLogs = async (user) => {
  if (!user) {
    detail.balanceLogs = []
    return
  }
  balanceLogLoading.value = true
  const res = await GetLogMoneyList({
    Page: 1,
    Size: 10,
    Type: 1,
    Keywords: user,
    Order: 0,
    Count: 0
  })
  balanceLogLoading.value = false
  if (res.code === 10000) {
    detail.balanceLogs = res.data?.List || []
    return
  }
  detail.balanceLogs = []
}

const loadList = async (reset) => {
  if (reset) {
    search.page = 1
    search.count = 0
  }
  loading.value = true
  const res = await withdrawApi.list(requestParams())
  loading.value = false
  if (res.code === 10000) {
    data.list = res.data.list || []
    data.count = res.data.count || 0
    search.count = data.count
  }
}

const resetSearch = () => {
  Object.assign(search, { page: 1, size: 10, status: 0, type: 1, keywords: '', registerTime: [], count: 0 })
  loadList(1)
}

const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

const deleteWithdraw = async (type) => {
  const payload = { type, id: [], keywords: '' }
  if (type === 1) {
    payload.id = selectedRows.value.map(item => item.Id)
    if (payload.id.length === 0) {
      ElMessage.info('请选择要删除的申请记录')
      return
    }
  }
  await ElMessageBox.confirm('确定删除提现申请记录?', '删除确认', { type: 'warning' })
  loading.value = true
  const res = await withdrawApi.delete(payload)
  loading.value = false
  if (res.code === 10000) {
    ElMessage.success(res.msg)
    await loadList(1)
  }
}

const deleteWithdrawByUser = async () => {
  const { value } = await ElMessageBox.prompt('请输入要删除的用户名', '删指定用户', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    inputPattern: /.+/,
    inputErrorMessage: '用户名不能为空'
  })
  loading.value = true
  const res = await withdrawApi.delete({ type: 2, id: [], keywords: value })
  loading.value = false
  if (res.code === 10000) {
    ElMessage.success(res.msg)
    await loadList(1)
  }
}

const openDetail = async (row) => {
  clearVoucherToken()
  const res = await withdrawApi.detail({ id: row.Id })
  if (res.code === 10000) {
    detail.info = res.data.info
    detail.logs = res.data.logs || []
    detail.voucherHistory = res.data.voucherHistory || []
    detail.riskTags = normalizeRiskTags(res.data.riskTags, detail.info?.RiskTag)
    detailImageUrls.payeeQr = detail.info.PayeeQrPath ? await loadImageUrl(detail.info.PayeeQrPath) : ''
    detailImageUrls.voucher = detail.info.VoucherPath ? await loadImageUrl(detail.info.VoucherPath) : ''
    await loadVoucherHistoryImages()
    await loadBalanceLogs(detail.info.User)
    detailVisible.value = true
  }
}

const loadImageUrl = async (path, force = false) => {
  if (!path) return ''
  if (force && imageUrlCache.has(path)) {
    URL.revokeObjectURL(imageUrlCache.get(path))
    imageUrlCache.delete(path)
  }
  if (imageUrlCache.has(path)) return imageUrlCache.get(path)
  const res = await withdrawApi.image({ path })
  const url = URL.createObjectURL(res.data)
  imageUrlCache.set(path, url)
  return url
}

const refreshDetail = async () => {
  if (!detail.info?.Id) return
  const res = await withdrawApi.detail({ id: detail.info.Id })
  if (res.code === 10000) {
    detail.info = res.data.info
    detail.logs = res.data.logs || []
    detail.voucherHistory = res.data.voucherHistory || []
    detail.riskTags = normalizeRiskTags(res.data.riskTags, detail.info?.RiskTag)
    // 先获取新 URL 再赋值，避免 el-image 引用已 revoke 的旧 blob URL
    const newPayeeQr = detail.info.PayeeQrPath ? await loadImageUrl(detail.info.PayeeQrPath) : ''
    const newVoucher = detail.info.VoucherPath ? await loadImageUrl(detail.info.VoucherPath, true) : ''
    detailImageUrls.payeeQr = newPayeeQr
    detailImageUrls.voucher = newVoucher
    await loadVoucherHistoryImages(true)
    await loadBalanceLogs(detail.info.User)
  }
}

const loadVoucherHistoryImages = async (force = false) => {
  Object.keys(voucherHistoryUrls).forEach(key => delete voucherHistoryUrls[key])
  const urls = []
  for (const item of pastVoucherHistory.value) {
    const url = await loadImageUrl(item.path, force)
    if (url) {
      voucherHistoryUrls[item.path] = url
      urls.push(url)
    }
  }
  voucherHistoryPreviewList.value = urls
}

const auditPass = async (row) => {
  await ElMessageBox.confirm(`确认通过提现单 ${row.OrderNo}？`, '审核确认')
  const res = await withdrawApi.auditPass({ id: row.Id })
  if (res.code === 10000) {
    ElMessage.success(res.msg)
    await loadList(0)
    await openDetail({ Id: row.Id })
  }
}

const reject = (row) => {
  rejectDialog.row = row
  rejectDialog.reason = ''
  rejectDialog.visible = true
  rejectDialog.loading = false
  if (row.Status === 3) {
    rejectDialog.title = '付款失败驳回'
    rejectDialog.alertText = '待付款驳回时必须填写付款失败原因，可直接点击快捷选项。'
    rejectDialog.placeholder = '请输入付款失败原因'
    rejectDialog.shortcuts = payFailReasonOptions
    return
  }
  rejectDialog.title = '驳回提现'
  rejectDialog.alertText = '请输入驳回原因。'
  rejectDialog.placeholder = '请输入驳回原因'
  rejectDialog.shortcuts = []
}

const closeRejectDialog = () => {
  if (rejectDialog.loading) return
  rejectDialog.visible = false
  rejectDialog.row = null
  rejectDialog.reason = ''
}

const submitReject = async () => {
  const row = rejectDialog.row
  const reason = rejectDialog.reason.trim()
  if (!row) return
  if (!reason) {
    ElMessage.warning('驳回原因不能为空')
    return
  }
  rejectDialog.loading = true
  const res = await withdrawApi.reject({ id: row.Id, reason })
  rejectDialog.loading = false
  if (res.code === 10000) {
    closeRejectDialog()
    ElMessage.success(res.msg)
    await loadList(0)
    if (detailVisible.value && detail.info?.Id === row.Id) {
      await refreshDetail()
    }
  }
}

const markPaid = async (row) => {
  await ElMessageBox.confirm(`确认提现单 ${row.OrderNo} 已付款？`, '付款确认')
  const res = await withdrawApi.markPaid({ id: row.Id })
  if (res.code === 10000) {
    ElMessage.success(res.msg)
    detailVisible.value = false
    await loadList(0)
  }
}

const uploadVoucher = async (row, opt) => {
  const form = new FormData()
  form.append('id', row.Id)
  form.append('file', opt.file)
  const res = await withdrawApi.uploadVoucher(form)
  if (res.code === 10000) {
    ElMessage.success(res.msg)
    await loadList(0)
    if (detailVisible.value && detail.info?.Id === row.Id) {
      await refreshDetail()
    }
  }
}

const createVoucherQr = async () => {
  if (!detail.info?.Id) return
  voucherToken.loading = true
  const res = await withdrawApi.createVoucherToken({ id: detail.info.Id })
  voucherToken.loading = false
  if (res.code === 10000) {
    voucherToken.token = res.data.token
    voucherToken.qrcodeBase64 = res.data.qrcodeBase64
    voucherToken.expireTime = res.data.expireTime
    startVoucherPolling()
  }
}

const startVoucherPolling = () => {
  stopVoucherPolling()
  voucherTimer = window.setInterval(async () => {
    if (!voucherToken.token) return
    const res = await withdrawApi.getUploadVoucherByTokenStatus({ token: voucherToken.token })
    if (res.code === 10000 && res.data?.info?.used) {
      ElMessage.success('手机端已上传付款凭证')
      clearVoucherToken()
      stopVoucherPolling()
      await refreshDetail()
      await loadList(0)
    }
  }, 3000)
}

const stopVoucherPolling = () => {
  if (voucherTimer) {
    window.clearInterval(voucherTimer)
    voucherTimer = 0
  }
}

const clearVoucherToken = () => {
  stopVoucherPolling()
  Object.assign(voucherToken, { token: '', qrcodeBase64: '', expireTime: 0, loading: false })
}

const openQrPreview = () => {
  qrPreviewSrc.value = 'data:image/png;base64,' + voucherToken.qrcodeBase64
  qrPreviewVisible.value = true
}

onMounted(() => loadList(1))

onBeforeUnmount(() => {
  stopVoucherPolling()
  imageUrlCache.forEach(url => URL.revokeObjectURL(url))
  imageUrlCache.clear()
})
</script>

<style scoped>
.withdraw-page {
  min-height: calc(100vh - 200px);
  padding: 12px 16px;
  margin: 0 2px 10px;
  background: #f0f2f5;
}
.content-block {
  background: #fff;
  min-height: 20%;
  margin: 0 2px 10px;
  padding: 12px 16px;
}
.gva-btn-list {
  min-height: 49px;
  margin-bottom: 0;
  border: 1px solid rgb(235, 238, 245);
  background: #fafafa;
}
.gva-btn-list > .el-button,
.gva-btn-list > .el-popconfirm {
  margin: 8px 8px 8px;
}
.tool-bar {
  float: right;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 7px 8px 8px;
  color: #606266;
}
.more-trigger {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  color: #606266;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  background: #fafafa;
}
.tool-bar > .el-icon {
  font-size: 16px;
  padding: 5px;
  border: 1px solid rgb(235, 238, 245);
  color: #0c0d0e;
  cursor: pointer;
}
.more-item {
  list-style-type: none;
  font-size: 12px;
  margin: 0;
  padding: 2px 5px;
}
.more-item:hover {
  background: #889aa4;
  cursor: pointer;
}
.demo-pagination-block {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}
.el-form-item {
  padding: 0;
  margin: 0 10px 8px 0;
}
:deep(.el-table .cell) {
  white-space: pre-line;
}
.drawer-body {
  min-height: calc(100vh - 150px);
}
.detail-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(280px, 1fr);
  gap: 16px;
}
.detail-main,
.pay-panel {
  min-width: 0;
}
.pay-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-left: 1px solid #ebeef5;
  padding-left: 16px;
}
.side-card {
  border: 1px solid #ebeef5;
  border-radius: 6px;
  background: #fff;
  padding: 14px;
}
.side-card-title {
  margin-top: 0;
}
.balance-card {
  flex: 1;
  min-height: 0;
}
.section-title {
  font-weight: 600;
  margin: 16px 0 10px;
}
.risk-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
  border: 1px solid #fde2e2;
  border-radius: 4px;
  background: #fff7f7;
}
.risk-tag {
  margin: 0;
}
.balance-log-subtitle {
  margin-bottom: 10px;
  font-size: 13px;
  color: #909399;
}
.balance-log-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.balance-log-item {
  padding: 10px 12px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background: #fafafa;
}
.balance-log-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.balance-log-time {
  font-size: 13px;
  color: #606266;
}
.balance-log-note {
  margin-top: 8px;
  line-height: 1.5;
  color: #303133;
  word-break: break-all;
}
.balance-log-ip {
  margin-top: 6px;
  font-size: 12px;
  color: #909399;
}
.media-panel {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  min-height: 260px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.large-image {
  max-width: 360px;
  max-height: 360px;
  width: 360px;
  height: 360px;
  border-radius: 4px;
}
.large-image :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.account-info {
  width: 100%;
  line-height: 32px;
  font-size: 15px;
}
.voucher-preview {
  width: 100%;
  height: 260px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}
.voucher-action-row {
  margin-top: 12px;
}
.voucher-action-col {
  display: flex;
  align-items: center;
}
.voucher-upload {
  display: inline-flex;
}
.voucher-history {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.voucher-history-item {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
}
.voucher-history-image {
  width: 100%;
  height: 110px;
  display: block;
}
.voucher-history-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px 8px;
  font-size: 12px;
  color: #606266;
}
.qr-box {
  position: relative;
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
  padding: 16px 12px 12px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background: #fff;
}
.qr-close {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: #f5f7fa;
  color: #606266;
  font-size: 16px;
  line-height: 24px;
  cursor: pointer;
}
.qr-thumb {
  width: 220px;
  height: 220px;
  cursor: pointer;
  object-fit: contain;
}
.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.reject-dialog-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.reject-shortcuts {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.reject-shortcuts-label {
  font-size: 13px;
  color: #606266;
}
.reject-shortcuts-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
@media (max-width: 1100px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
  .pay-panel {
    border-left: 0;
    border-top: 1px solid #ebeef5;
    padding-left: 0;
    padding-top: 16px;
  }
}
</style>
