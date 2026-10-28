<template>
  <el-dialog v-model="is对话框可见_修改权限2"
             title="修改WebApi令牌权限"
             @open="on对话框被打开"
             :width="is移动端()?'90%':'50%'"
             top="5%"
             @close="on对话框被关闭">
    <div style="overflow:auto;padding:0 12px;">
      <el-form :inline="false" style="min-width: 80px ;top: 10px" label-width="130px"
               :label-position="is移动端()?'top':'right'">
        <el-form-item label="User" prop="User">
          <el-input v-model="令牌信息.User" placeholder="" class="只读编辑框" readonly/>
        </el-form-item>
        <el-form-item label="绑定接口" prop="Key">
          <el-select
              v-model="数组_已选择WebApi接口"
              multiple
              placeholder="选择本Token可以调用的接口"
              style="width: 100%"
          >
            <el-option
                v-for="item in 数组_WebApi"
                :key="item[0]"
                :label="item[1]+'('+item[0]+')'"
                :value="item[0]"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="绑定公共函数" prop="Key" v-show="数组_已选择WebApi接口.indexOf('RunJs/:JsName')>-1">
          <el-select
              v-model="数组_已选择公共函数接口"
              multiple
              placeholder="选择RunJs/:JsName可以调用的公共函数"
              style="width: 100%"
          >
            <el-option
                v-for="item in 数组_公共函数"
                :key="item"
                :label="item"
                :value="item"
            />
          </el-select>
        </el-form-item>
      </el-form>

    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="is对话框可见_修改权限2=false">取 消</el-button>
        <el-button type="primary" :loading="is加载中" @click="on确定按钮被点击">保 存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from 'vue'
import {ElMessage} from "element-plus";
import {is移动端} from "@/utils/utils";
import {SetWebApiTokenKey} from "@/api/在线用户api";
import {Get全部WebAPi} from "@/api/应用列表api";

const Props = defineProps({
  is对话框可见_修改权限: {
    type: Boolean,
    default: false
  },
  令牌信息: {
    type: Object,
    default: () => ({})
  }
})
const emit = defineEmits(['on修改权限对话框关闭'])
const 数组_WebApi = ref([])
const 数组_已选择WebApi接口 = ref([])
const 数组_公共函数 = ref([])
const 数组_已选择公共函数接口 = ref([])
const is加载中 = ref(false)
const is重新读取 = ref(false)

const on读取WebApi数组 = async () => {
  if (数组_WebApi.value.length === 0) {
    const res = await Get全部WebAPi()
    if (res.code == 10000) {
      数组_WebApi.value = res.data.api
      数组_公共函数.value = res.data.publicJs
    }
  }
  return
}
//从Key文本解析出已绑定的接口和公共函数  Key格式 (接口)(接口)[公共函数][公共函数]
const on解析Key = async () => {
  数组_已选择WebApi接口.value = []
  数组_已选择公共函数接口.value = []
  await on读取WebApi数组()
  let 局_匹配
  const 局_接口正则 = /\(([^)]+)\)/g
  while ((局_匹配 = 局_接口正则.exec(Props.令牌信息.Key || "")) !== null) {
    if (数组_WebApi.value.some((item) => item[0] === 局_匹配[1])) {
      数组_已选择WebApi接口.value.push(局_匹配[1])
    }
  }
  const 局_函数正则 = /\[([^\]]+)\]/g
  while ((局_匹配 = 局_函数正则.exec(Props.令牌信息.Key || "")) !== null) {
    数组_已选择公共函数接口.value.push(局_匹配[1])
  }
}

watch(() => Props.is对话框可见_修改权限, (newVal, oldVal) => {
  if (newVal) {
    is对话框可见_修改权限2.value = newVal;
    console.info("is对话框可见_修改权限2被检测到改变了:")
  }
})

const is对话框可见_修改权限2 = ref(false)

const on确定按钮被点击 = async () => {
  let 局_Key = ""
  for (let i = 0; i < 数组_已选择WebApi接口.value.length; i++) {
    局_Key += '(' + 数组_已选择WebApi接口.value[i] + ')'
  }
  for (let i = 0; i < 数组_已选择公共函数接口.value.length; i++) {
    局_Key += '[' + 数组_已选择公共函数接口.value[i] + ']'
  }
  if (局_Key.length > 191) {
    ElMessage.error("权限太多了,数据库字段存不下,减少一些吧")
    return
  }
  is加载中.value = true
  const res = await SetWebApiTokenKey({"Id": Props.令牌信息.Id, "Key": 局_Key})
  is加载中.value = false
  console.log(res)
  if (res.code == 10000) {
    ElMessage.success(res.msg)
    is重新读取.value = true
    is对话框可见_修改权限2.value = false
  }
}

onMounted(() => {
  console.info("修改WebApi令牌权限对话框加载完毕了")
  on读取WebApi数组()
})

const on对话框被打开 = () => {
  is重新读取.value = false
  on解析Key()
}

const on对话框被关闭 = () => {
  console.info("on对话框被关闭")
  is对话框可见_修改权限2.value = false
  emit('on修改权限对话框关闭', is重新读取.value)
}


</script>

<style scoped lang="scss">

</style>
