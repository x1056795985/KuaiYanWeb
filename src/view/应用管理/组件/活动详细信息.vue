<template>
  <el-dialog v-model="is对话框可见2" :title="id===0?'添加活动':'修改活动信息id:'+id"
             top="2%"
             :width="is移动端()?'90%':'860px'"
             @close="on对话框被关闭">
    <div style="overflow:auto;padding:0 12px;">
      <el-form :inline="Props.id>0" style="min-width: 80px" label-width="150px" :model="data"
               :label-position="is移动端()?'top':'right'" ref="ruleFormRef">
        <el-form-item label="应用名称" disabled="disabled">
          <text>{{ Props.AppName }}</text>
        </el-form-item>
        <el-form-item label="名称" prop="Name" style="width: 90%">
          <el-input v-model.trim="data.name"/>
        </el-form-item>
        <el-form-item v-if="Props.id==0" label="活动类型" prop="promotionType" style="width: 90%">
          <el-radio-group
              v-model="data.promotionType"
              text-color="#626aef"
              fill="rgb(239, 240, 253)"
              @change="on活动类型改变"
          >
            <el-radio-button v-for="(值,index) in Props.对象_活动类型" :label="值" :value="Number(index)"/>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="status" label="时间范围">
          <el-config-provider :locale="zhCn">
            <el-date-picker
                v-model="活动时间范围"
                value-format="X"
                type="datetimerange"
                unlink-panels
                range-separator="到"
                start-placeholder="活动开始日期"
                end-placeholder="活动结束日期"
            />
          </el-config-provider>
        </el-form-item>
      </el-form>

      <!-- cps推广详细信息 (仅修改时显示) -->
      <CpsDetail
          v-if="Props.id>0 && data.promotionType===1 && data.typeAssociatedId>0"
          ref="子组件_cps"
          :typeAssociatedId="data.typeAssociatedId"
          :AppId="Props.AppId"
      />

      <!-- 签到推广详细信息 (仅修改时显示) -->
      <CheckInDetail
          v-if="Props.id>0 && data.promotionType===2 && data.typeAssociatedId>0"
          ref="子组件_签到"
          :typeAssociatedId="data.typeAssociatedId"
          :AppId="Props.AppId"
      />

      <!-- 大转盘详细信息 (仅修改时显示) -->
      <LuckyWheelDetail
          v-if="Props.id>0 && data.promotionType===3 && data.typeAssociatedId>0"
          ref="子组件_大转盘"
          :typeAssociatedId="data.typeAssociatedId"
          :AppId="Props.AppId"
      />

    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="on对话框被关闭">取 消</el-button>
        <!-- 添加活动 -->
        <el-button v-if="Props.id===0" type="primary" @click="on确定按钮被点击(ruleFormRef)">添加活动</el-button>
        <!-- 修改cps推广 -->
        <el-button v-if="Props.id>0 && data.promotionType===1" type="primary" @click="on确定按钮被点击(ruleFormRef)">保存cps推广</el-button>
        <!-- 修改签到推广 -->
        <el-button v-if="Props.id>0 && data.promotionType===2" type="primary" @click="on确定按钮被点击(ruleFormRef)">保存签到推广</el-button>
        <!-- 修改大转盘 -->
        <el-button v-if="Props.id>0 && data.promotionType===3" type="primary" @click="on确定按钮被点击(ruleFormRef)">保存大转盘</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {ElMessage, FormInstance} from "element-plus";
import {is移动端} from "@/utils/utils";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import {活动列表api} from "@/api/活动列表api";
import CpsDetail from "@/view/应用管理/组件/cps推广详细信息.vue";
import CheckInDetail from "@/view/应用管理/组件/签到推广详细信息.vue";
import LuckyWheelDetail from "@/view/应用管理/组件/大转盘详细信息.vue";

const Props = defineProps({
  is对话框可见: {
    type: Boolean,
    default: false
  },
  id: {
    type: Number,
    default: 0
  },
  AppId: {
    type: Number,
    default: 0
  },
  AppName: {
    type: String,
    default: ""
  },
  对象_活动类型: {
    type: Object,
    default: {}
  },
})
const emit = defineEmits(['on对话框详细信息关闭'])

const is对话框可见2 = ref(true)

type list_item = {
  id: number,
  name: string,
  appId: number,
  createTime: number,
  updateTime: number,
  startTime: number,
  endTime: number,
  promotionType: number,
  typeAssociatedId: number,
  sort: number
}
const 活动时间范围 = ref(["1735660800", "2082729599"])

const data = ref<list_item>({
  id: 0,
  name: '邀好友赢现金',
  appId: Props.AppId,
  createTime: 0,
  updateTime: 0,
  startTime: 0,
  endTime: 0,
  promotionType: 1,
  typeAssociatedId: 0,
  sort: 0
})

const ruleFormRef = ref<FormInstance>()
const is重新读取 = ref(false)

// 子组件引用
const 子组件_cps = ref()
const 子组件_签到 = ref()
const 子组件_大转盘 = ref()

const on确定按钮被点击 = async (formEl: FormInstance | undefined) => {

  if (!formEl) return

  let 表单验证结果 = await formEl.validate((valid, fields) => {
    if (!valid) {
      console.log('参数验证失败', fields)
    } else {
      console.log('参数验证通过')
    }
  })
  console.info("表单验证结果")
  console.info(表单验证结果)
  if (!表单验证结果) return
  let 返回;

  data.value.startTime = Number(活动时间范围.value[0])
  data.value.endTime = Number(活动时间范围.value[1])

  if (Props.id === 0) {
    // 添加活动: 只创建活动主记录,不涉及子组件
    返回 = await 活动列表api.create(data.value);
  } else {
    // 修改活动: 先更新主记录,再更新对应子组件
    返回 = await 活动列表api.update(data.value);
    if (返回.code == 10000) {
      switch (data.value.promotionType) {
        default:
          return
        case 1:
          返回 = await 子组件_cps.value?.update()
          break
        case 2:
          返回 = await 子组件_签到.value?.update()
          break
        case 3:
          // 大转盘概率校验
          let 校验结果 = 子组件_大转盘.value?.校验概率()
          if (校验结果 && !校验结果.valid) {
            ElMessage.error(校验结果.msg)
            return
          }
          返回 = await 子组件_大转盘.value?.update()
          break
      }
    }
  }
  console.log(返回)
  if (返回.code == 10000) {
    is重新读取.value = true
    is对话框可见2.value = false
    ElMessage.success(返回.msg)
  }
}

const on校验表单重置 = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}
onMounted(() => {
  on校验表单重置(ruleFormRef.value)
  console.info("用户详细信息对话框加载完毕了")
  读取详细信息(Props.id)
})

const on对话框被关闭 = () => {
  console.info("on对话框被关闭")
  is对话框可见2.value = false
  emit('on对话框详细信息关闭', is重新读取.value)
}

const on活动类型改变 = () => {
  if (data.value.name == "" || data.value.name == "邀好友赢现金" || data.value.name == "每日签到有礼" || data.value.name == "幸运大转盘") {
    switch (data.value.promotionType) {
      case 1:
        data.value.name = "邀好友赢现金"
        break;
      case 2:
        data.value.name = "每日签到有礼"
        break;
      case 3:
        data.value.name = "幸运大转盘"
        break;
    }
  }
}

const 读取详细信息 = async (id: number) => {
  if (id == 0) {
    return
  }

  let 返回 = await 活动列表api.info({"id": id})
  if (返回.code == 10000) {
    data.value = 返回.data
    活动时间范围.value[0] = String(data.value.startTime)
    活动时间范围.value[1] = String(data.value.endTime)
    // 子组件会通过 watch typeAssociatedId 自动读取数据
  } else {
    is重新读取.value = false
    is对话框可见2.value = false
  }
}
</script>

<style scoped lang="scss">
.li展示不可修改信息 {
  font-size: 16px;
  margin-left: 10px;
  float: left;
  clear: right;
  width: 100%;
  height: 30px;
  word-wrap: break-word;
  word-break: normal;
}

.demo-form-inline .el-input {
  --el-input-width: 80px;
}
</style>
