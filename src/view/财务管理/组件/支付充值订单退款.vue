<template>


  <el-dialog v-model="Is退款订单可见2" :title="Props.退款订单.Type+'订单退款'" :width="is移动端()?'90%':'50%'" @close="on对话框被关闭">
    <el-form style="min-width: 80px" label-width="80" :model="退款订单" v-loading="Is加载中"
             :label-position="is移动端()?'top':'right'">
      <el-form-item label="订单Id:">
        <el-input class="只读编辑框" v-model="退款订单.PayOrder"/>
      </el-form-item>
      <el-form-item label="退款用户:">
        <el-input class="只读编辑框" v-model="退款订单.User"/>
      </el-form-item>
      <el-form-item label="退款金额:">
        <el-input class="只读编辑框" v-model="退款订单.Rmb"/>
      </el-form-item>
      <el-form-item label="退款类型">
        <el-radio-group v-model="Data.IsOutRMB" size="" @change="on退款类型被改变">
          <el-tooltip effect="dark" placement="top" content="余额积分充值,扣除余额积分,购卡直冲扣除时间点数积分,支付购卡追回卡号,并退款">
            <el-radio-button :value="true" border>追回并退款</el-radio-button>
          </el-tooltip>
          <el-radio-button :value="false" border>仅退款</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="备注:">
        <el-input v-model="Data.Note"/>
      </el-form-item>
    </el-form>

    <template #footer>
      <div v-loading="Is加载中"
      >
      <span class="dialog-footer" >
        <el-button @click="Is退款订单可见2=false">取 消</el-button>
        <el-button type="primary" @click="on确定按钮被点击">确 定</el-button>
      </span>
      </div>
    </template>

  </el-dialog>


</template>

<script setup lang='ts'>
import {ref, watch} from "vue";
import {ElMessage, FormInstance} from "element-plus";
import {OutRMBPayOrder} from "@/api/支付充值订单api";
import {is移动端} from "@/utils/utils";

const Props = defineProps({
  Is退款订单可见: {
    type: Boolean,
    default: false
  },
  退款订单: {
    type: Object,
    default: {
      "Id": 0,
      "PayOrder": "",
      "Uid": 0,
      "Status": 1,
      "Type": "",
      "Rmb": 0,
      "Time": 0,
      "Ip": "127.0.0.1",
      "Note": "",
      "User": ""
    }
  },
})


const Is退款订单可见2 = ref(false)
const Is加载中 = ref(false)
const is重新读取 = ref(false)
watch(() => Props.Is退款订单可见, (newVal, oldVal) => {
  if (newVal) {
    Is退款订单可见2.value = newVal;
  }
})

const Data = ref({PayOrder: "", IsOutRMB: true, Note: "减余额退款"})
const on确定按钮被点击 = async () => {
  Is加载中.value = true
  console.info("on确定按钮被点击")
  let 返回;
  Data.value.PayOrder = Props.退款订单.PayOrder
  返回 = await OutRMBPayOrder(Data.value);
  Is加载中.value = false
  console.log(返回)
  if (返回.code == 10000) {
    Is退款订单可见2.value = false
    is重新读取.value=true
ElMessage.success(返回.msg)
  }

}
const emit = defineEmits(['on对话框退款关闭'])
const on对话框被关闭 = () => {
  console.info("on对话框被关闭")
  Is退款订单可见2.value = false
  emit('on对话框退款关闭', is重新读取.value)
   Data.value = {PayOrder: "", IsOutRMB: true, Note: "减余额退款"}
}
const on退款类型被改变 = () => {

  if (Data.value.IsOutRMB) {
    if (Data.value.Note === "" || Data.value.Note === "仅退款") {
      Data.value.Note = "减余额退款"
    }
  } else {
    if (Data.value.Note === "" || Data.value.Note === "减余额退款") {
      Data.value.Note = "仅退款"
    }
  }

}
</script>

<style scoped css="scss">

</style>
