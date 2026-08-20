<template>
  <el-dialog
    v-model="is显示对话框"
    title="批量发放优惠券"
    width="680px"
    draggable
    @close="on对话框被关闭"
  >
    <div v-loading="is加载中" class="coupon-grant-dialog">
      <el-alert
        title="每位用户发放 1 张，按优惠券库存和单用户限领规则校验；任意用户不符合时本次不会发放。"
        type="info"
        :closable="false"
        show-icon
      />

      <el-form label-width="110px" class="grant-form">
        <el-form-item label="发放用户">
          <div class="selected-users">
            <div class="selected-summary">
              已选择 <strong>{{ Props.Uids.length }}</strong> 位用户
            </div>
            <el-scrollbar v-if="Props.Users.length" max-height="112px" class="user-preview">
              <el-tag v-for="item in Props.Users" :key="item.Id" class="user-tag">
                {{ 用户显示名称(item) }}（UID: {{ item.Uid }}）
              </el-tag>
            </el-scrollbar>
          </div>
        </el-form-item>

        <el-form-item label="优惠券" required>
          <el-select
            v-model="PostData.couponId"
            class="coupon-select"
            filterable
            placeholder="请选择当前应用的优惠券"
          >
            <el-option v-for="item in 优惠券列表" :key="item.id" :value="item.id" :label="`${item.id}:${item.name}`">
              <div class="coupon-option">
                <div>
                  <strong>{{ item.id }}:{{ item.name }}</strong>
                  <span class="coupon-rule">{{ 优惠券规则(item) }}</span>
                </div>
                <span class="coupon-stock">
                  已发 {{ item.receivedCount }}<template v-if="item.totalCount"> / {{ item.totalCount }}</template>
                </span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item v-if="当前优惠券" label="规则预览">
          <div class="rule-preview">
            <div class="rule-title">{{ 当前优惠券.name }}</div>
            <div class="rule-text">{{ 优惠券规则(当前优惠券) }}</div>
            <div class="rule-note">
              领取时间：{{ 时间文本(当前优惠券.receiveStartTime) }} 至 {{ 时间文本(当前优惠券.receiveEndTime) }}
              <br>
              使用时间：{{ 时间文本(当前优惠券.useStartTime) }} 至 {{ 时间文本(当前优惠券.useEndTime) }}
            </div>
          </div>
        </el-form-item>

        <el-form-item label="发放说明">
          <el-input
            v-model.trim="PostData.note"
            type="textarea"
            :rows="4"
            maxlength="500"
            show-word-limit
            placeholder="请输入发放原因或备注，方便后续在优惠券流水中追溯"
          />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="is显示对话框 = false">取消</el-button>
        <el-button type="primary" :loading="is加载中" @click="on确定按钮被点击()">确认发放</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { couponApi } from '@/api/webUserCouponapi'

const Props = withDefaults(defineProps<{
  AppId: number
  Uids: number[]
  Users: any[]
}>(), {
  AppId: 0,
  Uids: () => [],
  Users: () => [],
})

const emit = defineEmits<{
  (event: 'on批量发放优惠券被关闭', is重新读取: boolean): void
}>()

const is显示对话框 = ref(true)
const is加载中 = ref(false)
const is重新读取 = ref(false)
const 优惠券列表 = ref<any[]>([])
const PostData = ref({
  couponId: 0,
  note: '',
})

const 当前优惠券 = computed(() => 优惠券列表.value.find(item => item.id === PostData.value.couponId))

const formatMoney = (value: number | string | null | undefined) => Number(value || 0).toFixed(2)
const discountDisplay = (value: number | string | null | undefined) => {
  const num = Number(value || 0)
  return Number((num > 10 ? num / 10 : num).toFixed(1))
}
const 优惠券规则 = (item: any) => Number(item.type) === 1
  ? `满 ${formatMoney(item.minPayAmount)} 减 ${formatMoney(item.couponValue)}`
  : `满 ${formatMoney(item.minPayAmount)} 打 ${discountDisplay(item.couponValue).toFixed(1)} 折，最高减 ${formatMoney(item.maxDiscountAmount)}`
const 时间文本 = (value: number) => value ? new Date(value * 1000).toLocaleString() : '长期有效'
const 用户显示名称 = (item: any) => item.name || item.user || `用户 ${item.Uid}`

async function on读取优惠券列表() {
  if (!Props.AppId) {
    ElMessage.error('当前应用不能为空')
    return
  }
  is加载中.value = true
  try {
    const 返回 = await couponApi.getList({
      appId: Props.AppId,
      status: 1,
      couponType: 0,
      page: 1,
      size: 1000,
      type: 2,
      keywords: '',
      count: 0,
    })
    if (返回.code === 10000) {
      优惠券列表.value = 返回.data?.list || []
    } else {
      ElMessage.error(返回.msg)
    }
  } finally {
    is加载中.value = false
  }
}

async function on确定按钮被点击(force = false) {
  if (!PostData.value.couponId) {
    ElMessage.warning('请选择优惠券')
    return
  }
  if (!Props.Uids.length) {
    ElMessage.warning('请先勾选软件用户')
    return
  }

  is加载中.value = true
  const 返回 = await couponApi.batchGrant({
    appId: Props.AppId,
    couponId: PostData.value.couponId,
    uids: Props.Uids,
    note: PostData.value.note,
    force,
  })
  is加载中.value = false
  if (返回.code === 10000) {
    ElMessage.success(返回.msg)
    is重新读取.value = true
    is显示对话框.value = false
    return
  }
  if (!force && String(返回.msg || '').includes('已达到该优惠券的领取上限')) {
    try {
      await ElMessageBox.confirm(
        `${返回.msg}，是否强制发放？`,
        '提示',
        {
          confirmButtonText: '强制发放',
          cancelButtonText: '取消',
          type: 'warning',
        },
      )
      await on确定按钮被点击(true)
    } catch {
      // 用户取消
    }
  } else {
    ElMessage.error(返回.msg)
  }
}

function on对话框被关闭() {
  emit('on批量发放优惠券被关闭', is重新读取.value)
}

onMounted(on读取优惠券列表)
</script>

<style scoped lang="scss">
.coupon-grant-dialog { padding: 0 8px; }
.grant-form { margin-top: 18px; }
.selected-summary { color: #606266; line-height: 32px; }
.selected-summary strong { color: #018d71; font-size: 20px; }
.user-preview { margin-top: 8px; padding: 8px; border: 1px solid #d9eee8; border-radius: 8px; background: #f8fbfa; }
.user-tag { margin: 4px; }
.coupon-select { width: 100%; }
.coupon-option { display: flex; align-items: center; justify-content: space-between; gap: 18px; width: 100%; }
.coupon-option strong { color: #173b33; }
.coupon-rule { display: block; margin-top: 3px; color: #6a847d; font-size: 12px; }
.coupon-stock { flex: 0 0 auto; color: #909399; font-size: 12px; }
.rule-preview { width: 100%; padding: 12px 14px; border: 1px solid #d9eee8; border-radius: 8px; background: linear-gradient(100deg, #effcf7, #fff); }
.rule-title { color: #173b33; font-weight: 700; }
.rule-text { margin-top: 5px; color: #018d71; }
.rule-note { margin-top: 7px; color: #909399; font-size: 12px; line-height: 1.7; }
.dialog-footer { display: flex; justify-content: flex-end; gap: 10px; }
</style>
