<template>
  <div v-loading="is加载中">
    <el-card>
      <el-form label-width="120px">
        <div style="align-items: center ">
          <el-form-item label="赞助金额">
            <el-input-number v-model="充值金额" :precision="2" :step="1" :value-on-clear="0.00" :min="0"/>
            <el-button type="primary" style="margin-left: 5px" @click="充值金额=5">5</el-button>
            <el-button type="primary" style="margin-left: 5px" @click="充值金额=50">50</el-button>
            <el-button type="primary" style="margin-left: 5px" @click="充值金额=100">100</el-button>
          </el-form-item>
          <div style="align-items: center ">
            <el-form-item label="赞助方式" style="width: 100%">
              <el-radio-group v-model="支付方式">
                <el-radio v-for="key in Object.keys(支付通道状态)" :key="key" :value="key" v-show="支付通道状态[key]"
                          border>{{ key }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </div>
          <div style="text-align:center">
            <el-button style="width: 15vh; " type="primary" @click="on取余额充值地址">充值</el-button>
          </div>

          <div>
            <el-form-item v-if="订单信息.订单状态>0" label="订单ID">{{ 订单信息.订单ID }}</el-form-item>
            <el-form-item v-if="订单信息.订单状态>0" label="订单状态">
              {{
                订单信息.订单状态 === 1 ? "等待支付" : 订单信息.订单状态 === 2 ? "已支付待充值" : 订单信息.订单状态 === 3 ? "充值成功" : "异常状态" + 订单信息.订单状态.toString()
              }}
            </el-form-item>

            <el-form-item v-if="订单信息.订单状态===1" label="">
              <div style="text-align:center" v-if="订单信息.PayURL!==''">请在打开的网页支付</div>
              <div style="text-align:center"
                   v-if="订单信息.PayQRCodePNG!==''">请使用扫码支付
              </div>
            </el-form-item>

            <el-form-item v-if="订单信息.订单状态===1 && 订单信息.PayQRCodePNG!=='' ">
              <img
                  :src="订单信息.PayQRCodePNG"
              >
            </el-form-item>
            <el-form-item v-if="订单信息.订单状态===1 && 订单信息.PayURL!=='' && !is苹果端()">
              <div id="app">
                <iframe id="iframeContainer" :src="订单信息.PayURL" frameborder="0" />
              </div>
            </el-form-item>
          </div>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import {onMounted, ref} from "vue";
import {取支付通道状态, 取余额充值地址, 余额购买充值卡} from "@/api/快验个人中心api.js";
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

const 充值金额 = ref(5)
const 支付方式 = ref("")

const 订单信息 = ref({订单ID: "", PayQRCode: "", PayURL: "", PayQRCodePNG: "", 订单状态: 0})

const 支付通道状态 = ref({})


const on快验取可购买充值卡 = async () => {

  if (Store.state.搜索_个人中心.订单信息.订单ID !== "") {
    订单信息.value = Store.state.搜索_个人中心.订单信息   //读取历史数据
    if (订单信息.value.订单状态 === 1 || 订单信息.value.订单状态 === 2) {  //如果订单是已创建未支付 或已支付未充值,重新轮询
      await on取支付结果()
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


onMounted(() => {
  on快验取可购买充值卡()
})
</script>

<style scoped>
</style>
