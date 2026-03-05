<template>
  <el-dialog v-model="is对话框可见2"
             :title="id===0?'新制卡号:':'修改卡类信息'"
             @open="on对话框被打开"
             :width="is移动端()?'90%':'50%'"
             top="5%"
             v-loading="is加载中"
             @close="on对话框被关闭">
    <div style="overflow:auto;padding:0 12px;">
      <el-form :inline="false" style="min-width: 80px ;top: 10px" label-width="130px" :rules="on表单校验" :model="data"
               :label-position="is移动端()?'top':'right'" ref="ruleFormRef">
        <el-form-item label="应用名称">
          <el-input class="只读编辑框" v-model="Props.AppName"></el-input>
        </el-form-item>
        <el-form-item label="选择卡类" prop="Name">
          <el-select v-model="data.Id" clear placeholder="选择卡类">
            <el-option v-for="(值,index) in KaClass" :key="index" :label="KaClass[index]" :value="Number(index)"/>
          </el-select>
        </el-form-item>
        <el-form-item label="管理员备注" prop="AdminNote">
          <el-input
              v-model="data.AdminNote"
              placeholder="管理员备注可以备注准备用来做什么"
          >
          </el-input>
        </el-form-item>
        <el-form-item v-if="批量维护导入卡号" label="误删卡号">
          <el-input :autosize="{ minRows: 2, maxRows: 23 }" type="textarea" v-model="待导入卡号"
                    placeholder="待导入卡号一行一个,仅限本系统生成后删除的卡号,因为卡号本身有校验位"/>
        </el-form-item>

        <el-form-item label="制卡数量" prop="Number" v-else>
          <el-input-number v-model="data.Number" :precision="0" :step="1" :value-on-clear="1" :min="1" :max="2600"/>
          <el-button @click="data.Number=1" :style="is移动端()?'width: 5vh':'width: 5vh'">
            归一
          </el-button>
          <el-button @click="data.Number+=10"
                     :style="is移动端()?'width: 9vh':'width: 4vh'">+10
          </el-button>
          <el-button @click="data.Number+=100"
                     :style="is移动端()?'width: 9vh':'width: 4vh'">+100
          </el-button>
        </el-form-item>
        <el-form-item label="开始制卡" prop="Prefix">
          <el-button type="primary" @click="on开始制卡按钮被点击(ruleFormRef)" :disabled="is加载中"
                     style="width: 90px">开始制卡
          </el-button>
          <el-tooltip
              :trigger-keys="[]"
              class="box-item"
              :content="模板支持变量"
              placement="top"
          >
            <el-button plain style="background: #68c23c;color: white" @click="格式化卡号内容(true)">重新格式化
            </el-button>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="格式模板" prop="Prefix">

          <el-input
              v-model="格式模板"
              placeholder="格式模板"
          >
            <template #append>
              <div>
                <el-button plain style="background: #73c0e7;color: white" @click="on保存模板内容">保存模板</el-button>
              </div>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="生成内容" prop="Prefix">
          <el-input :autosize="{ minRows: 2, maxRows: 23 }" type="textarea" v-model="生成内容"
                    placeholder="生成卡号内容"/>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="is对话框可见2=false">关闭</el-button>
        <el-button type="primary" @click="置剪辑版文本(生成内容, '已复制到剪辑版')">复 制</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {onMounted, ref,} from 'vue'
import {NewKa信息, NewKa信息_指定卡号, SetKaTemplate, GetKaTemplate} from "@/api/卡号列表api";
import {ElMessage, FormInstance} from "element-plus";
import {is移动端, 时间_时间戳到时间, 时间_计算天时分秒提示, 置剪辑版文本} from "@/utils/utils";
// 引入中文包
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import {DocumentChecked} from "@element-plus/icons";

const Props = defineProps({
  is对话框可见: {
    type: Boolean,
    default: false
  },
  批量维护导入卡号: {
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
  AppType: {
    type: Number,
    default: 1
  },
  KaClass: {
    type: Object,
    default: {}
  },
})
const emit = defineEmits(['on对话框详细信息关闭'])
const 格式模板 = ref('卡号:{Name} 时间:{VipTime} 软件:{AppName}')

const 生成内容 = ref('')

interface KaItem {
  Name: string
  VipTime: number
  RMb: number
  VipNumber: number
  UserClassName?: string
  Num?: number
  MaxOnline?: number
  RegisterTime: number
}

const 生成卡号Data = ref<KaItem[]>([])

const is对话框可见2 = ref(true)
const 待导入卡号 = ref("")

type req = {
  Id : number
 Number : number
  AdminNote: string
  KaName: string[]
}

const data = ref<req>({
  "Id": Number(Object.keys(Props.KaClass)[0]),
  "Number": 1,
  "AdminNote": "",
  "KaName": []
})
const ruleFormRef = ref<FormInstance>()
const is重新读取 = ref(false)
const is加载中 = ref(false)

const on校验表单重置 = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}


const on表单校验 = ref({})
const 模板支持变量 = ref("支持变量 卡号:{Name} 点数:{VipTime} 软件:{AppName} 余额:{RMb} 积分:{VipNumber} 用户类型:{UserClassName} 可用次数:{Num} 同时最大在线数{MaxOnline} 制卡时间:{RegisterTime} 卡类名称:{KaClassName}")

const on对话框被打开 = () => {
  is重新读取.value = false
  console.info("on对话框被打开")
  on校验表单重置(ruleFormRef.value)
  生成卡号Data.value = []
  生成内容.value = ""
  格式模板.value = isAppType计点() ? '卡号:{Name} 点数:{VipTime} 软件:{AppName}' : '卡号:{Name} 时间:{VipTime} 软件:{AppName}'
  data.value = {
    "Id": Number(Object.keys(Props.KaClass)[0]),
    "Number": 1,
    "AdminNote": "",
    "KaName": []
  }

}

const on对话框被关闭 = () => {
  console.info("on对话框被关闭")
  is对话框可见2.value = false
  emit('on对话框详细信息关闭', is重新读取.value)

}

const on开始制卡按钮被点击 = async (formEl: FormInstance | undefined) => {

  console.info("on开始制卡按钮被点击")
  console.info(data.value)
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
  if (!表单验证结果) return   //如果是假直接返回
  let 返回;

  if (data.value.Id != 0) {

    if (!Props.批量维护导入卡号) {
      is加载中.value = true
      返回 = await NewKa信息(data.value);
      is加载中.value = false
    } else {
      is加载中.value = true
      const pattern = /[a-zA-Z0-9]{10,}/g;
      data.value.KaName = []
      let a = 待导入卡号.value.match(pattern);
      if (a == null) {
        ElMessage.error("正则失败,导入卡号格式不正确,一行一个最短10位")
        is加载中.value = false
        return
      }
      data.value.KaName = a
      返回 = await NewKa信息_指定卡号(data.value);
      is加载中.value = false
    }


  } else {
    ElMessage.error("卡类Id错误,如果没有卡类请先去卡类列表添加")
    返回.code = 7
    return
  }
  console.log(返回)
  if (返回.code == 10000) {
    生成卡号Data.value = 返回.data
    格式化卡号内容(false)
    is重新读取.value = true
    ElMessage.success(返回.msg)
  }
}

const 格式化卡号内容 = async (保存配置 = false) => {
  if (生成卡号Data.value.length === 0) {
    ElMessage.warning('请先点击【开始制卡】生成卡号数据')
    return
  }
  let 最终内容 = ""
  let 临时文本 = ""
  let 局_卡类名称 = ""
  //循环遍历卡类数组,获取卡类名称
  let map_卡类 = Props.KaClass
  // 遍历键值对
  Object.entries(map_卡类).forEach(([key, value]) => {
    if (Number(key) == data.value.Id) {
      局_卡类名称 = value
    }
  })


  console.log(局_卡类名称)
  for (let i = 0; i < 生成卡号Data.value.length; i++) {
    //ref('卡号:{Name} 时间:{VipTime} 软件:{AppName}')
    临时文本 = 格式模板.value.replace('{Name}', 生成卡号Data.value[i].Name)
    临时文本 = 临时文本.replace('{VipTime}', isAppType计点() ? 生成卡号Data.value[i].VipTime.toString() : 时间_计算天时分秒提示(生成卡号Data.value[i].VipTime))
    临时文本 = 临时文本.replace('{AppName}', Props.AppName)
    临时文本 = 临时文本.replace('{RMb}', 生成卡号Data.value[i].RMb.toString())
    临时文本 = 临时文本.replace('{VipNumber}', 生成卡号Data.value[i].VipNumber.toString())
    临时文本 = 临时文本.replace('{UserClassName}', 生成卡号Data.value[i].UserClassName??"")
    临时文本 = 临时文本.replace('{Num}', 生成卡号Data.value[i].Num.toString())
    临时文本 = 临时文本.replace('{MaxOnline}', 生成卡号Data.value[i].MaxOnline.toString())
    临时文本 = 临时文本.replace('{RegisterTime}', 时间_时间戳到时间(生成卡号Data.value[i].RegisterTime))
    临时文本 = 临时文本.replace('{KaClassName}', 局_卡类名称)
    最终内容 += 临时文本 + "\n"
  }
  生成内容.value = 最终内容
}

const on保存模板内容 = async () => {
  let 返回 = await SetKaTemplate({AppId: Props.AppId, KaTemplate: 格式模板.value})
  if (返回.code == 10000) {
    if (生成卡号Data.value.length > 0) {
      格式化卡号内容()
    }
    ElMessage.success(返回.msg)
  }
}
const isAppType计点 = () => {
  return Props.AppType === 2 || Props.AppType === 4
}
onMounted(async () => {
  let 保存结果 = await GetKaTemplate({AppId: Props.AppId, KaTemplate: ""})
  格式模板.value = 保存结果.data
  console.log(保存结果)
})
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

</style>
