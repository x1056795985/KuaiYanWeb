<template>
  <el-dialog v-model="is对话框可见2"
             :title="'卡号编辑Id:'+id"
             @open="on对话框被打开"
             :width="is移动端()?'90%':'50%'"
             top="1%"
             @close="on对话框被关闭">
    <div style="overflow:auto;padding:0 12px;">
      <el-form :inline="false" style="min-width: 80px ;top: 10px" label-width="130px" :rules="on表单校验" :model="data"
               :label-position="is移动端()?'top':'right'" ref="ruleFormRef">

        <el-form-item label="卡号" prop="Name">
          <el-input class="只读编辑框" v-model="data.Name" readonly/>
        </el-form-item>
        <el-form-item label="状态" prop="Status">
          <el-switch
              :active-value="1"
              :inactive-value="2"
              v-model="data.Status"
              inline-prompt
              size="large"
              style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
              active-text="正常"
              inactive-text="冻结"
          />
        </el-form-item>


        <el-form-item label="可用次数" prop="Num">
          <div style="display: flex; align-items: center">
            <el-input-number v-model="data.Num" :step="1" :value-on-clear="1" :min="0" :max="data.NumMax"/>
            <el-button @click="data.Num=0" :style="is移动端()?'width: 5vh':'width: 5vh'">
              重置
            </el-button>
            <el-button @click="data.Num=data.NumMax"
                       :style="is移动端()?'width: 11vh':'width: 6vh'">最大{{ data.NumMax }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item label="管理员备注" prop="AdminNote">
          <el-input v-model.trim="data.AdminNote"/>
        </el-form-item>
        <el-form-item label="代理备注" prop="AgentNote">
          <el-input v-model.trim="data.AgentNote"/>
        </el-form-item>
        <el-form-item :label="isAppType计点()?'加点数':'加秒数'" prop="VipTime">
          <el-tooltip
              :trigger-keys="[]"
              class="box-item"
              effect="light"
              :content="时间_计算天时分秒提示 (data.VipTime)"
              placement="left"
              :disabled="isAppType计点()"
          >
            <div style="display: flex; align-items: center">
              <el-input-number v-model="data.VipTime" :precision="0" :step="1" :value-on-clear="0" :min="0"/>
              <el-button @click="data.VipTime=0" :style="is移动端()?'width: 5vh':'width: 5vh'">
                清零
              </el-button>
              <el-button @click="data.VipTime+=isAppType计点()?10:86400" :style="is移动端()?'width: 9vh':'width: 4vh'">
                {{ isAppType计点() ? '+10' : '+1天' }}
              </el-button>
              <el-button @click="data.VipTime+=isAppType计点()?100:86400*3"
                         :style="is移动端()?'width: 9vh':'width: 4vh'">{{ isAppType计点() ? '+100' : '+3' }}
              </el-button>
              <el-button @click="data.VipTime+=isAppType计点()?1000:86400*30"
                         :style="is移动端()?'width: 9vh':'width: 4vh'">{{ isAppType计点() ? '+1000' : '+30' }}
              </el-button>
              <el-button @click="data.VipTime+=isAppType计点()?10000:86400*365"
                         :style="is移动端()?'width: 9vh':'width: 4vh'">{{ isAppType计点() ? '+10000' : '+365' }}
              </el-button>

              <el-config-provider :locale="zhCn" v-if="!isAppType计点()">
                <el-button
                    @click="is计算日期?(计算日期对象.handleClose ()):(计算日期=时间_取现行时间戳(),计算日期对象.handleOpen())"
                    :style="is移动端()?'width: 15vh':'width: 15vh'">当前到日
                  <el-date-picker
                      style="visibility:hidden;width: 0px"
                      v-model.number="计算日期"
                      ref="计算日期对象"
                      type="datetime"
                      format="YYYY/MM/DD HH:mm:ss"
                      value-format="X"
                      @change="data.VipTime=计算日期-时间_取现行时间戳()"
                      @visible-change="on计算日期关闭"
                  />
                  期秒数
                </el-button>

              </el-config-provider>


            </div>
          </el-tooltip>

        </el-form-item>
        <el-form-item :label="isAppType计点()?'推荐人加点数':'推荐人加秒数'" prop="InviteCount" v-if="AppType<=2">
          <el-tooltip
              :trigger-keys="[]"
              class="box-item"
              effect="light"
              :content="时间_计算天时分秒提示 (data.InviteCount)+'*本用户类型权重/为推广人权重'"
              placement="left"
              :disabled="isAppType计点()"
          >
            <div style="display: flex; align-items: center">
              <el-input-number v-model="data.InviteCount" :precision="0" :step="1" :value-on-clear="0" :min="0"/>
              <el-button @click="data.InviteCount=0" :style="is移动端()?'width: 5vh':'width: 5vh'">
                清零
              </el-button>
              <el-button @click="data.InviteCount+=isAppType计点()?10:86400"
                         :style="is移动端()?'width: 9vh':'width: 4vh'">{{ isAppType计点() ? '+10' : '+1天' }}
              </el-button>
              <el-button @click="data.InviteCount+=isAppType计点()?100:86400*3"
                         :style="is移动端()?'width: 9vh':'width: 4vh'">{{ isAppType计点() ? '+100' : '+3' }}
              </el-button>
              <el-button @click="data.InviteCount+=isAppType计点()?1000:86400*30"
                         :style="is移动端()?'width: 9vh':'width: 4vh'">{{ isAppType计点() ? '+1000' : '+30' }}
              </el-button>
              <el-button @click="data.InviteCount+=isAppType计点()?10000:86400*365"
                         :style="is移动端()?'width: 9vh':'width: 4vh'">{{ isAppType计点() ? '+10000' : '+365' }}
              </el-button>
            </div>
          </el-tooltip>
        </el-form-item>

        <el-form-item label="余额" prop="RMb" v-if="AppType<=2">
          <el-input-number v-model="data.RMb" :precision="2" :step="1" :value-on-clear="0.00" :min="0"/>
        </el-form-item>
        <el-form-item label="积分" prop="VipNumber">
          <el-tooltip
              :trigger-keys="[]"
              class="box-item"
              effect="light"
              content="余额和积分的区别,余额所有这个用户登录的应用都可以使用,积分只有这个用户登录的这个应用可以使用"
              placement="left"
          >
            <div style="display: flex; align-items: center">
              <el-input-number v-model="data.VipNumber" :precision="2" :step="1" :value-on-clear="0.00" :min="0"/>
            </div>
          </el-tooltip>
        </el-form-item>

        <el-form-item label="用户类型" prop="UserClassId" style="width:280px">
          <el-select v-model="data.UserClassId" clear placeholder="全部">
            <el-option v-for="(ver,key) in UserType" :key="key" :label="ver" :value="Number(key)"/>
          </el-select>
        </el-form-item>

        <el-form-item label="类型不同处理方式" prop="NoUserClass">
          <el-radio-group v-model="data.NoUserClass">
            <el-radio-button :value="1">自动根据权重转换分组</el-radio-button>
            <el-radio-button :value="2">禁止充值</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <!--        <el-form-item label="充值方式" prop="KaType">
                  <el-radio-group v-model="data.KaType">
                    <el-radio-button :value="1">有次数即可</el-radio-button>
                    <el-radio-button :value="2">每用户一次</el-radio-button>
                  </el-radio-group>
                </el-form-item>-->
        <el-form-item label="最大在线数" prop="MaxOnline">
          <el-tooltip
              :trigger-keys="[]"
              class="box-item"
              effect="light"
              content="值为0,充值后不修改原在线数"
              placement="left"
          >
            <el-input-number v-model="data.MaxOnline" :step="1" :value-on-clear="1"  />
          </el-tooltip>

        </el-form-item>
        <div v-if="Props.id>0 " class="展示不可修改信息">
          <ul>
            <li class="li展示不可修改信息">充值方式:
              <el-text type="info" size="large">{{ data.KaType === 1 ? "有次数即可" : "每用户一次" }}</el-text>
            </li>
            <li class="li展示不可修改信息" v-if="data.EndTime!==9999999999">有效期:
              <el-text type="info" size="large">{{ 时间_时间戳到时间(data.EndTime) }}</el-text>
            </li>
            <li class="li展示不可修改信息">充值用户User:
              <el-text type="info" size="large">{{ data.User }}</el-text>
            </li>
            <li class="li展示不可修改信息">最后使用时间:
              <el-text type="info" size="large">{{ on最后使用时间(data.UserTime) }}</el-text>
            </li>
            <li class="li展示不可修改信息">邀请人:
              <el-text type="info" size="large">{{ data.InviteUser }}</el-text>
            </li>
            <li class="li展示不可修改信息">
              <el-link type="warning" :href="软件用户跳转地址" size="large">
                提示:卡号使用后会转换成软件用户,如需修改使用后卡号信息,请去软件用户内修改
              </el-link>
            </li>
          </ul>
        </div>
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
import {onMounted, ref, watch} from 'vue'
import {SaveKa信息, GetKa详细信息} from "@/api/卡号列表api";
import {ElMessage, FormInstance} from "element-plus";
import {is移动端, 取url根入口路径, 时间_取现行时间戳, 时间_时间戳到时间, 时间_计算天时分秒提示} from "@/utils/utils";
// 引入中文包
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const 软件用户跳转地址 = 取url根入口路径() + "/#/应用管理/软件用户"
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
  AppType: {
    type: Number,
    default: 1
  },
  UserType: {
    type: Object,
    default: {"0": "未分类"}
  },
})
const emit = defineEmits(['on对话框详细信息关闭'])


watch(() => Props.is对话框可见, (newVal, oldVal) => {
  if (newVal) {
    is对话框可见2.value = newVal;
    console.info("is对话框可见2被检测到改变了:")
  }
})

const is对话框可见2 = ref(false)
const data = ref({
  "Id": 328,
  "AppId": 10001,
  "KaClassId": 16,
  "Name": "ZCje9QCNUo2vMYBi1tRDOvf8j",
  "Status": 1,
  "RegisterUser": "admin",
  "RegisterTime": 1684073278,
  "AdminNote": "",
  "AgentNote": "",
  "VipTime": 0,
  "InviteCount": 0,
  "RMb": 0,
  "VipNumber": 0,
  "Money": -1,
  "AgentMoney": -1,
  "UserClassId": 0,
  "NoUserClass": 1,
  "KaType": 1,
  "MaxOnline": 1,
  "Num": 0,
  "NumMax": 1,
  "User": "",
  "UserTime": "",
  "InviteUser": ""
})
const ruleFormRef = ref<FormInstance>()
const is重新读取 = ref(false)
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
  if (!表单验证结果) return   //如果是假直接返回
  let 返回;
  返回 = await SaveKa信息(data.value);
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
  console.info("用户详细信息对话框加载完毕了")
})


const on表单校验 = ref({
  Name: [
    {required: true, message: '请输入卡类名称', trigger: 'blur'},
    {min: 1, message: '最低1位字符', trigger: ''}
  ],
})

const on对话框被打开 = () => {
  is重新读取.value = false
  console.info("on对话框被打开")
  on校验表单重置(ruleFormRef.value)
  读取详细信息(Props.id)
}
const 读取详细信息 = async (id: number) => {
  if (id > 0) {
    let 返回 = await GetKa详细信息({"AppId": Props.AppId, "Id": id})
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
    is重新读取.value = false
    is对话框可见2.value = false
  }
}


const on对话框被关闭 = () => {
  console.info("on对话框被关闭")
  is对话框可见2.value = false
  emit('on对话框详细信息关闭', is重新读取.value)
}

const isAppType计点 = () => {
  return Props.AppType === 2 || Props.AppType === 4
}
const on最后使用时间 = (str: string) => {
  if (str === "") {
    return "未使用过"
  }

  let myArray = str.split(",");

  return 时间_时间戳到时间(Number(myArray[myArray.length - 2]))
}

const is计算日期 = ref(false)
const 计算日期 = ref(时间_取现行时间戳())
const 计算日期对象 = ref<FormInstance>()
const on计算日期关闭 = (b) => {
  is计算日期.value = b
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

.timnePickCSS {
  position: fixed;
  top: 30%;
  left: 70%;
  z-index: -1;
}

</style>
