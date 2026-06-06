<template>
  <el-dialog v-model="is对话框可见2"
             :title="Props.id===''?'添加新公共函数:':'修改公共函数'"
             :width="is移动端()?'95%':'90%'"
             top="3%"
             @close="on对话框被关闭">
    <div style="overflow:auto;padding:0 12px;">
      <el-form v-loading="is加载中" :inline="false" style="min-width: 80px ;top: 10px" label-width="130px" :rules="on表单校验" :model="data"
               :label-position="is移动端()?'top':'right'" ref="ruleFormRef">

        <el-form-item label="函数名称" prop="Name" >
          <div style="display: inline-block ;width: 100%">
            <el-input v-model.trim="data.Name" placeholder="请输入函数名称" :class="[Props.id!==''?'只读编辑框':'']"
                      :readonly="Props.id!==''" style="width: 80%;" @blur="on编辑框函数名失去焦点"/>
            <div style="float: right;padding-left: 5px">
              <el-switch v-if="data.AppId!==2&&data.AppId!==3"
                  :active-value="1"
                  :inactive-value="0"
                  v-model="data.IsVip"
                  width="60"
                  style="margin-left: 5px"
                  inline-prompt
                  active-text="限登录"
                  inactive-text="任意"
              />
            </div>
          </div>

        </el-form-item>


        <el-form-item label="归属应用" prop="" style="width:100%">
          <el-select v-model.number="data.AppId" clear placeholder="请选择应用" filterable style="width:100%"  >
            <el-option v-for="(item,index) in 数组AppId_Name" :key="item.appId"
                       :label="item.appName+(item.appId>10000?'('+item.appId.toString()+')':'')" :value="item.appId"/>

          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="Value">
          <el-input v-model="data.Note" placeholder="请输入备注"/>
        </el-form-item>
        <el-form-item  label="JS函数" prop="Value" style="height: 60Vh">
          <div class="button-group">
            <div class="button-container">
              <el-button
                  v-if="data.Id"
                  @click="onJS格式化"
                  type="primary"
                  plain
                  class="action-button"
              >
                格式化
              </el-button>
              <el-button
                  @click="onJS测试执行"
                  type="primary"
                  plain
                  class="action-button"
              >
                测试执行
              </el-button>
              <el-button
                  @click="on打开教程"
                  type="info"
                  plain
                  class="action-button"
              >
                打开教程
              </el-button>
              <el-button
                  @click="isAi面板可见 = !isAi面板可见"
                  :type="isAi面板可见 ? 'success' : 'primary'"
                  plain
                  class="action-button"
              >
                {{ isAi面板可见 ? '关闭AI助手' : 'AI助手' }}
              </el-button>
            </div>
          </div>

          <div :class="['code-area', isAi面板可见 ? 'code-area-with-ai' : '']">
            <codemirror @keyup.ctrl="submit($event)" v-model="data.Value" placeholder="请输入js代码"
                        style="height: 100%;min-width:0;flex:1" :autofocus="true"
                        :tabSize="2" :extensions="extensions"/>
            <Ai助手 v-if="isAi面板可见"
                    :currentCode="data.Value"
                    :functionName="data.Name"
                    :formData="data"
                    :appList="数组AppId_Name"
                    @applyCode="onAi应用代码"
                    @restoreCode="onAi回退代码"
                    @editForm="onAi编辑表单"
            />
          </div>
        </el-form-item>
      </el-form>

    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="is对话框可见2=false">取 消</el-button>
        <el-button type="primary" @click="on确定按钮被点击(ruleFormRef)">确 定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {ElMessage, FormInstance} from "element-plus";
import {is移动端} from "@/utils/utils";
import {GetInfo, New, SaveInfo,TestRunJs} from "@/api/公共函数api";
import {GetAppIdNameList} from "@/api/应用列表api";
import Ai助手 from "./Ai助手.vue";


const Props = defineProps({
  id: {
    type: String,
    default: 0
  },
  AppId: {
    type: Number,
    default: 0
  },
})

const emit = defineEmits(['on对话框详细信息关闭'])


const is对话框可见2 = ref(true)
const 公共变量初始数据 = {
  "AppId": 1,
  "Name": "",
  "Value": "",
  "Type": 1,
  "IsVip": 0,
  "Note": "",
}
const 内置函数初始数据 = "aaa测试"
const Is展示全局云函数 = ref([])

const 内置函数 = ref(内置函数初始数据)

const data = ref(公共变量初始数据)
const ruleFormRef = ref<FormInstance>()
const is重新读取 = ref(false)
const is加载中 = ref(false)


const on确定按钮被点击 = async (formEl: FormInstance | undefined) => {

  console.info("on确定按钮被点击")
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
  if (data.value.Value.indexOf(data.value.Name + "(") === -1) {
    ElMessage.error("缺少函数: " + data.value.Name)
    return
  }

  if (!表单验证结果) return   //如果是假直接返回
  let 返回;

  if (Props.id == "") {
    返回 = await New(data.value);
  } else {
    返回 = await SaveInfo(data.value);
  }
  console.log(返回)

  if (返回.code == 10000) {
    is重新读取.value = true
    if (Props.id == "") {
      is对话框可见2.value = false
    }

ElMessage.success(返回.msg)
  }
}

const on校验表单重置 = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}

onMounted(() => {
  console.info("用户详细信息对话框加载完毕了")
  //按键触发
  document.onkeydown = function () {
    //禁止ctrl+s
    if (event.ctrlKey && window.event.keyCode == 83) {
      return false;
    }
  }

})
const on编辑框函数名失去焦点 = (event) => {
  if (data.value.Value.length < 10) {
    data.value.Value = "function " + data.value.Name + "(JSON形参) {\n" +
        '    //return $用户在线信息; // {"Key":"aaaaaa","Status":1,"Tab":"AMD Ryzen 7 6800H with Radeon Graphics         |178BFBFF00A40F41","Uid":21,"User":"aaaaaa"}\n' +
        '    //return $应用信息 // {"AppId":10001,"AppName":"演示对接账密限时Rsa交换密匙","Status":3,"VipData":"{\\n\\"VipData\\":\\"这里的数据,只有登录成功并且账号会员不过期才会传输出去的数据\\",\\n\\"VipData2\\":\\"这里的数据,只有登录成功并且账号会员不过期才会传输出去的数据\\"\\n}\n' +
        '    //return $用户在线信息.Uid\n' +
        '\n' +
        '    var 局_用户信息 = $api_用户Id取详情($用户在线信息) //{"Id":21,"User":"aaaaaa","PassWord":"af15d5fdacd5fdfea300e88a8e253e82","Phone":"13109812593","Email":"1056795985@qq.com","Qq":"1059795985","SuperPassWord":"af15d5fdacd5fdfea300e88a8e253e82","Status":1,"Rmb":91.39,"Note":"","RealNameAttestation":"","Role":0,"UPAgentId":0,"AgentDiscount":0,"LoginAppid":10000,"LoginIp":"","LoginTime":1519454315,"RegisterIp":"113.235.144.55","RegisterTime":1519454315}\n' +
        '    return 局_用户信息\n' +
        '}'
  }
}

const submit = (event) => {
  console.log("按下了某件")
  console.log(event)
  if (event.key === "s") {
    data.value.Value = js_beautify(data.value.Value)
    on确定按钮被点击(ruleFormRef.value)
  }
}


const on表单校验 = ref({
  Name: [
    {required: true, message: '请输入函数名称', trigger: 'blur'},
    {min: 1, message: '最低1位字符', trigger: ''}
  ],
  Value: [
    {max: 20000, message: '最长20000位字符', trigger: 'blur'}
  ],
})
const on对话框被打开 = () => {
  is重新读取.value = false
  console.info("on对话框被打开")
  console.info(Props.AppId)

  on校验表单重置(ruleFormRef.value)
  读取详细信息(Props.id)
}
const 读取详细信息 = async (id: String) => {
  if (id != "") {
    let 返回 = await GetInfo({"AppId": Props.AppId, "Name": id})

    if (返回.code == 10000) {
      data.value = 返回.data
      // if (data.value.VipTime.toString().length===10){
      //   data.value.VipTime=data.value.VipTime*1000   //日期时间选择器是13位时间戳所以得处理一下
      // }
    } else {
      is重新读取.value = false
      is对话框可见2.value = false
    }
  } else {
    data.value = 公共变量初始数据
  }
}


const on对话框被关闭 = () => {
  console.info("on对话框被关闭")
  is对话框可见2.value = false
  emit('on对话框详细信息关闭', is重新读取.value)

}

const MapAppId_Name = ref({})
const 数组AppId_Name = ref([{
  "appId": 10004,
  "appName": ""
}])
const onGetAppIdNameList = async () => {
  const res = await GetAppIdNameList()
  数组AppId_Name.value = res.data.array
  数组AppId_Name.value.unshift({
    "appId": 1,
    "appName": "全局"
  })
  数组AppId_Name.value.unshift({
    "appId": 2,
    "appName": "任务池Hook函数"
  })
  数组AppId_Name.value.unshift({
    "appId": 3,
    "appName": "ApiHook函数"
  })
  数组AppId_Name.value.unshift({
    "appId": 11,
    "appName": "WebSocket"
  })

  MapAppId_Name.value = res.data.map
}

onMounted(async () => {

  await onGetAppIdNameList()
  on对话框被打开()
})
// 编辑器相关数据==============================
import {Codemirror} from "vue-codemirror";
import {javascript} from "@codemirror/lang-javascript";
import {oneDark} from "@codemirror/theme-one-dark";
import {EditorView} from "@codemirror/view"
import {js_beautify} from 'js-beautify'   // 使用,css、html均是这种策略使用

let myTheme = EditorView.theme({}, {dark: false})
const extensions = [javascript(), myTheme];

// 代码美化
function onJS格式化() {
  data.value.Value = js_beautify(data.value.Value)
}
// 代码美化
async function onJS测试执行() {
  is加载中.value=true
  let postData = {id: data.value.Id}

  let 返回 = await TestRunJs(postData);
  is加载中.value=false
  if (返回.code == 10000) {
    await ElMessageBox.prompt("返回数据" , 返回.msg,{"inputValue":JSON.stringify(返回.data),"showCancelButton":false} )
  }

}
function on打开教程() {
  // 在新标签页中打开教程网页
  window.open('https://www.fnkuaiyan.cn/PublicJs/%E5%85%AC%E5%85%B1%E5%87%BD%E6%95%B0Api.html', '_blank');
}

// AI助手相关==============================
const isAi面板可见 = ref(true)

const onAi应用代码 = (code: string) => {
  data.value.Value = code
}

const onAi回退代码 = (code: string) => {
  data.value.Value = code
}

const onAi编辑表单 = (fields: Record<string, any>) => {
  // AI通过MCP工具编辑表单字段
  if (fields.Name !== undefined) {
    data.value.Name = fields.Name
  }
  if (fields.AppId !== undefined) {
    data.value.AppId = fields.AppId
  }
  if (fields.Note !== undefined) {
    data.value.Note = fields.Note
  }
  if (fields.Value !== undefined) {
    data.value.Value = fields.Value
  }
  if (fields.IsVip !== undefined) {
    data.value.IsVip = fields.IsVip
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

.code-area {
  height: 90%;
  width: 100%;
  display: flex;
  overflow: hidden;
}

.code-area-with-ai {
  overflow: hidden;
  min-width: 0;

  :deep(.v-codemirror) {
    flex: 1;
    min-width: 0;
    width: 0;
    overflow: hidden;
    border-right: 1px solid #e4e7ed;

    .cm-editor {
      width: 100%;
      .cm-scroller {
        overflow-x: auto;
      }
    }
  }

  // AI助手面板固定宽度
  :deep(.ai-assistant) {
    width: 380px;
    flex-shrink: 0;
  }
}

</style>
