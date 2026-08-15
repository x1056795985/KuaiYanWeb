<template>
  <div v-loading="is加载中">
    <el-card class="支付卡片">
      <el-tabs v-model="当前操作" class="支付切换">
        <el-tab-pane label="余额充值" name="充值">
          <div class="充值面板">
            <div class="面板标题">充值金额</div>
            <div class="充值金额行">
              <el-input-number v-model="充值金额" :precision="2" :step="1" :value-on-clear="0.00" :min="0"/>
              <div class="快捷金额组">
                <el-button type="primary" plain @click="充值金额=5">5</el-button>
                <el-button type="primary" plain @click="充值金额=50">50</el-button>
                <el-button type="primary" plain @click="充值金额=100">100</el-button>
              </div>
            </div>
          </div>

          <div v-if="订单信息.订单状态>0" class="支付订单">
            <div class="支付订单行">
              <span>订单ID</span>
              <strong>{{ 订单信息.订单ID }}</strong>
            </div>
            <div class="支付订单行">
              <span>订单状态</span>
              <el-tag :type="订单信息.订单状态 === 3 ? 'success' : 'warning'">
                {{ 取充值订单状态文本(订单信息.订单状态) }}
              </el-tag>
            </div>
            <div v-if="订单信息.订单状态===1 && (订单信息.PayURL!=='' || 订单信息.PayQRCodePNG!=='')" class="支付提示">
              {{ 订单信息.PayURL!=='' ? "请在打开的网页支付" : "请使用扫码支付" }}
            </div>
            <img
                v-if="订单信息.订单状态===1 && 订单信息.PayQRCodePNG!=='' "
                class="支付二维码"
                :src="订单信息.PayQRCodePNG"
            >
            <div v-if="订单信息.订单状态===1 && 订单信息.PayURL!=='' && !is苹果端()" id="app">
              <iframe id="iframeContainer" :src="订单信息.PayURL" frameborder="0" />
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="赞助" name="赞助">
          <div class="充值面板">
            <div class="面板标题">赞助金额</div>
            <div class="面板说明">购买赞助卡类后自动累加历史赞助</div>
            <div class="快捷金额组">
              <el-button
                  v-for="item in 数组_可选赞助卡类"
                  :key="item.Id"
                  type="primary"
                  plain
                  :class="{ '赞助金额项_选中': 选择赞助卡类Id === item.Id }"
                  @click="选择赞助卡类Id = item.Id"
              >
                <span class="赞助金额数字">¥{{ item.Amount }}</span>
                <span v-if="item.Note" class="赞助金额备注">{{ item.Note }}</span>
              </el-button>
            </div>
          </div>

          <div v-if="赞助订单信息.订单状态>0" class="支付订单">
            <div class="支付订单行">
              <span>订单ID</span>
              <strong>{{ 赞助订单信息.订单ID }}</strong>
            </div>
            <div class="支付订单行">
              <span>订单状态</span>
              <el-tag :type="赞助订单信息.订单状态 === 3 ? 'success' : 'warning'">
                {{ 取赞助订单状态文本(赞助订单信息.订单状态) }}
              </el-tag>
            </div>
            <div v-if="赞助订单信息.订单状态===1 && (赞助订单信息.PayURL!=='' || 赞助订单信息.PayQRCodePNG!=='')" class="支付提示">
              {{ 赞助订单信息.PayURL!=='' ? "请在打开的网页支付" : "请使用扫码支付" }}
            </div>
            <img
                v-if="赞助订单信息.订单状态===1 && 赞助订单信息.PayQRCodePNG!=='' "
                class="支付二维码"
                :src="赞助订单信息.PayQRCodePNG"
            >
            <div v-if="赞助订单信息.订单状态===1 && 赞助订单信息.PayURL!=='' && !is苹果端()" id="sponsorPay">
              <iframe id="sponsorIframeContainer" :src="赞助订单信息.PayURL" frameborder="0" />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>

      <div class="支付底栏">
        <div class="支付方式区">
          <span class="支付字段名">支付方式</span>
          <el-radio-group v-model="支付方式" class="支付方式组">
            <el-radio v-for="key in Object.keys(支付通道状态)" :key="key" :value="key" v-show="支付通道状态[key]"
                      border>{{ key }}
            </el-radio>
          </el-radio-group>
        </div>
        <el-button class="支付提交按钮" type="primary" size="large" @click="on提交支付">{{ 取提交按钮文案() }}</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import {onMounted, ref} from "vue";
import {取支付通道状态, 取余额充值地址, 取购卡直冲地址} from "@/api/快验个人中心api.js";
import {useStore} from "vuex";
import {ElMessage} from "element-plus";
import {is苹果端} from "@/utils/utils";

const Store = useStore()
const Props = defineProps({
  UserInfo: {
    type: Object,
    default: {
      User: "13888888888",
      UserType: "扶持Vip",
      VipNumber: 180.00,
      RMB: 180.01,
      VipTime: 1685678065,
      Email: "13888888888@qq.com",
    }
  }
})

const 当前操作 = ref("充值")
const 充值金额 = ref(5)
const 支付方式 = ref("")

const 订单信息 = ref({订单ID: "", PayQRCode: "", PayURL: "", PayQRCodePNG: "", 订单状态: 0})

const 支付通道状态 = ref({})
const 赞助订单信息 = ref({订单ID: "", PayQRCode: "", PayURL: "", PayQRCodePNG: "", 订单状态: 0})
const 选择赞助卡类Id = ref(97)
const 数组_可选赞助卡类 = ref([
  {Id: 97, Amount: "0.8"},
  {Id: 98, Amount: "3"},
  {Id: 99, Amount: "9"},
  {Id: 100, Amount: "19"},
  {Id: 101, Amount: "49"},
  {Id: 102, Amount: "99"},
  {Id: 103, Amount: "199"},
  {Id: 104, Amount: "99", Note: "人工远程解决问题一次"}
])

const 取赞助订单状态文本 = (状态) => {
  return 状态 === 1 ? "等待支付" : 状态 === 2 ? "已支付待充值" : 状态 === 3 ? "赞助成功" : "异常状态" + 状态.toString()
}

const 取充值订单状态文本 = (状态) => {
  return 状态 === 1 ? "等待支付" : 状态 === 2 ? "已支付待充值" : 状态 === 3 ? "充值成功" : "异常状态" + 状态.toString()
}

const 取提交按钮文案 = () => {
  return 当前操作.value === "充值" ? "充值" : "立即赞助"
}

const on提交支付 = async () => {
  if (支付方式.value === "") {
    ElMessage.error("请选择支付方式")
    return
  }
  if (当前操作.value === "充值") {
    await on取余额充值地址()
    return
  }
  await on取赞助地址()
}


const on快验取可购买充值卡 = async () => {

  if (Store.state.搜索_个人中心.订单信息.订单ID !== "") {
    订单信息.value = Store.state.搜索_个人中心.订单信息   //读取历史数据
    if (订单信息.value.订单状态 === 1 || 订单信息.value.订单状态 === 2) {  //如果订单是已创建未支付 或已支付未充值,重新轮询
      await on取支付结果()
    }
  }

  if (Store.state.搜索_个人中心.赞助订单信息?.订单ID) {
    赞助订单信息.value = Store.state.搜索_个人中心.赞助订单信息
    if (赞助订单信息.value.订单状态 === 1 || 赞助订单信息.value.订单状态 === 2) {
      await on取赞助支付结果()
    }
  }


  let 返回 = await 取支付通道状态({})
  console.info("取支付通道状态")
  console.info(返回)
  if (返回.code === 10000) {
    let 临时 = Store.state.搜索_个人中心
    临时.支付通道状态 = JSON.parse(返回.data)
    console.info(临时.支付通道状态)
    Store.commit("set搜索_个人中心", 临时)
  }


  支付通道状态.value = Store.state.搜索_个人中心.支付通道状态
  for (let key in 支付通道状态.value) {
    if (支付通道状态.value[key]) {
      支付方式.value = key
    }
  }

}

const is加载中 = ref(false)
const on取余额充值地址 = async () => {
  if (充值金额.value > 0) {
    clearInterval(轮询id.value)
    订单信息.value.PayURL = ""
    订单信息.value.PayQRCodePNG = ""
    订单信息.value.订单ID = ""
    订单信息.value.订单状态 = 0
    is加载中.value = true
    let 返回 = await 取余额充值地址({Type: 支付方式.value, RMB: 充值金额.value})
    is加载中.value = false
    console.info("取余额充值地址")
    console.info(返回)
    if (返回.code === 10000) {
      订单信息.value.订单ID = 返回.data.OrderId
      订单信息.value.订单状态 = 返回.data.Status

      订单信息.value.PayURL = 返回.data?.PayURL || ""
      if (返回.data?.PayQRCodePNG) {
        订单信息.value.PayQRCodePNG = 'data:image/png;base64,' + 返回.data.PayQRCodePNG
      }

      if (订单信息.value.PayURL !== "") {
        if (is苹果端()) {
          location.href = 订单信息.value.PayURL
        } else {
          window.open(订单信息.value.PayURL, '网页支付')
        }
      }
      ElMessage.success(返回.msg)

      await on取支付结果()
    }
  } else {
    ElMessage.error("充值金额必须大于0")
  }
}
const emit = defineEmits(['on更新个人信息'])
const 轮询id = ref(0)
const 赞助轮询id = ref(0)

const on取赞助地址 = async () => {
  if (选择赞助卡类Id.value <= 0) {
    ElMessage.error("请选择赞助金额")
    return
  }
  if (支付方式.value === "") {
    ElMessage.error("请选择赞助方式")
    return
  }

  clearInterval(赞助轮询id.value)
  赞助订单信息.value.PayURL = ""
  赞助订单信息.value.PayQRCodePNG = ""
  赞助订单信息.value.订单ID = ""
  赞助订单信息.value.订单状态 = 0
  is加载中.value = true
  let 返回 = await 取购卡直冲地址({type: 支付方式.value, kaClassId: 选择赞助卡类Id.value})
  is加载中.value = false
  console.info("取购卡直冲地址")
  console.info(返回)
  if (返回.code === 10000) {
    赞助订单信息.value.订单ID = 返回.data.OrderId || 返回.data.orderId || ""
    赞助订单信息.value.订单状态 = 返回.data.Status || 返回.data.status || 1

    赞助订单信息.value.PayURL = 返回.data?.PayURL || ""
    if (返回.data?.PayQRCodePNG) {
      赞助订单信息.value.PayQRCodePNG = 'data:image/png;base64,' + 返回.data.PayQRCodePNG
    }

    if (赞助订单信息.value.PayURL !== "") {
      if (is苹果端()) {
        location.href = 赞助订单信息.value.PayURL
      } else {
        window.open(赞助订单信息.value.PayURL, '赞助支付')
      }
    }
    ElMessage.success(返回.msg)

    await on取赞助支付结果()
  }
}

const on取支付结果 = async () => {//轮询当前订单状态s
  if (订单信息.value.订单ID === "") {
    clearInterval(轮询id.value)
    emit('on更新个人信息')
    return
  }


  轮询id.value = setInterval(() => {
    取余额充值地址({OrderId: 订单信息.value.订单ID}).then((返回) => {
      //请求成功后
      //console.log(返回)
      if (返回.code === 10000) {
        订单信息.value.订单状态 = 返回.data.status
      } else {
        clearInterval(轮询id.value)  //订单不存在停止轮询
      }

      if (订单信息.value.订单状态 === 3) {//充值成功停止轮询
        clearInterval(轮询id.value)
        emit('on更新个人信息')
      }

      let 临时 = Store.state.搜索_个人中心
      临时.订单信息 = 订单信息.value
      Store.commit("set搜索_个人中心", 临时)

    })

  }, 3000)
}

const on取赞助支付结果 = async () => {
  if (赞助订单信息.value.订单ID === "") {
    clearInterval(赞助轮询id.value)
    emit('on更新个人信息')
    return
  }

  赞助轮询id.value = setInterval(() => {
    取购卡直冲地址({orderId: 赞助订单信息.value.订单ID}).then((返回) => {
      if (返回.code === 10000) {
        赞助订单信息.value.订单状态 = 返回.data.status || 返回.data.Status
      } else {
        clearInterval(赞助轮询id.value)
      }

      if (赞助订单信息.value.订单状态 === 3) {
        clearInterval(赞助轮询id.value)
        emit('on更新个人信息')
      }

      let 临时 = Store.state.搜索_个人中心
      临时.赞助订单信息 = 赞助订单信息.value
      Store.commit("set搜索_个人中心", 临时)
    })

  }, 3000)
}


onMounted(() => {
  on快验取可购买充值卡()
})
</script>

<style scoped>
.支付卡片 {
  max-width: 880px;
}

.支付切换 :deep(.el-tabs__header) {
  margin-bottom: 16px;
}

.充值面板 {
  min-height: 128px;
}

.面板标题 {
  color: #303133;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
}

.面板说明 {
  margin-top: 3px;
  color: #909399;
  font-size: 13px;
  line-height: 1.5;
}

.充值金额行 {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.快捷金额组 {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.快捷金额组 :deep(.el-button + .el-button) {
  margin-left: 0;
}

.赞助金额网格 {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.赞助金额项 {
  min-width: 82px;
  min-height: 44px;
  margin-left: 0 !important;
  padding: 8px 12px;
}

.赞助金额项 :deep(span) {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 2px;
}

.赞助金额项_选中 {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-8);
  box-shadow: 0 0 0 1px var(--el-color-primary) inset;
}

.赞助金额数字 {
  display: block;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.25;
}

.赞助金额备注 {
  display: block;
  color: var(--el-color-primary);
  font-size: 12px;
  line-height: 1.35;
}

.支付底栏 {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.支付方式区 {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 0;
}

.支付字段名 {
  flex: 0 0 auto;
  padding-top: 8px;
  color: #606266;
  font-size: 14px;
}

.支付方式组 {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.支付提交按钮 {
  flex: 0 0 auto;
  min-width: 128px;
}

.支付订单 {
  margin-top: 16px;
  padding: 12px 14px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  background: #fafafa;
}

.支付订单行 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #606266;
  font-size: 14px;
  line-height: 2;
}

.支付订单行 strong {
  color: #303133;
  font-weight: 500;
  word-break: break-all;
}

.支付提示 {
  margin-top: 8px;
  color: #606266;
  font-size: 13px;
  text-align: center;
}

.支付二维码 {
  display: block;
  max-width: 220px;
  margin: 12px auto 0;
}

#iframeContainer,
#sponsorIframeContainer {
  width: 100%;
  min-height: 360px;
  margin-top: 12px;
}

@media (max-width: 640px) {
  .充值金额行 {
    align-items: stretch;
    flex-direction: column;
  }
  .支付底栏,
  .支付方式区 {
    align-items: flex-start;
    flex-direction: column;
  }

  .支付提交按钮 {
    width: 100%;
  }

  .支付订单行 {
    align-items: flex-start;
    flex-direction: column;
    gap: 0;
  }
}
</style>
