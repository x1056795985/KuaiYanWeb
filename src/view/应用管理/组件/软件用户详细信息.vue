<template>
  <el-dialog v-model="is对话框可见2"
             :title="id===0?AppName+'('+Props.AppId+')'+'添加新用户:':AppName+'('+Props.AppId+')'+'修改用户信息'"
             :width="is移动端()?'90%':'50%'"
             @close="on对话框被关闭">
    <div style="overflow:auto;padding:0 12px;">
      <el-tabs class="应用详细信息顶部标签" v-model="详细信息顶部标签现行选项">
        <el-tab-pane label="用户信息" name="用户信息">
          <el-form :inline="false" style="min-width: 80px" label-width="130px" :rules="on表单校验" :model="data"
                   :label-position="is移动端()?'top':'right'" ref="ruleFormRef">
<!--            <el-form-item v-if="data.Id>0" :label="'Id'" prop="Id"-->
<!--                          disabled="disabled">-->
<!--              <el-input class="只读编辑框" v-model.number="data.Id" placeholder=""-->
<!--                        :readonly="true"/>-->
<!--            </el-form-item>-->
            <el-form-item :label="(Props.AppType === 3 || Props.AppType  === 4)?'来源卡号id':'来源用户id'" prop="Uid"
                          disabled="disabled">
              <el-input :class="[id>0?'只读编辑框':'']" v-model.number="data.Uid" placeholder=""
                        :readonly="id===0?false:true"/>
            </el-form-item>
            <el-form-item label="本软件状态" prop="Status">
              <el-switch
                  :active-value="1"
                  :inactive-value="2"
                  v-model="data.Status"
                  inline-prompt
                  style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                  active-text="正常"
                  inactive-text="冻结"
              />
            </el-form-item>
            <el-form-item label="绑定信息" prop="Key">
              <el-input v-model.trim="data.Key" placeholder="请输入绑定信息"/>
            </el-form-item>
            <!--        <el-form-item label="测试显示时间戳" prop="data.VipTime">-->
            <!--          <el-input v-model.number="data.VipTime"/>-->
            <!--        </el-form-item>-->
            <el-form-item :label="isAppType计点()?'剩余点数':'Vip到期时间'" prop="VipTime">

              <el-input-number v-if="isAppType计点()" v-model="data.VipTime" :precision="0" :step="1"
                               :value-on-clear="0" :min="0"/>

              <template v-else>


                <el-tooltip
                    class="box-item"
                    effect="light"
                    :content="'剩余:'+时间_计算天时分秒提示 (data.VipTime-时间_取现行时间戳())"
                    placement="left"
                >
                  <div>
                    <el-config-provider :locale="zhCn">
                      <el-date-picker
                          v-model.number="data.VipTime"
                          type="datetime"
                          format="YYYY/MM/DD HH:mm:ss"
                          value-format="X"
                      />
                    </el-config-provider>
                    <el-button @click="data.VipTime=时间_取现行时间戳()" :style="is移动端()?'width: 5vh':'width: 4vh'">
                      此刻
                    </el-button>
                    <el-button @click="data.VipTime+=86400" :style="is移动端()?'width: 9vh':'width: 4vh'">+1天
                    </el-button>
                    <el-button @click="data.VipTime+=86400*3" :style="is移动端()?'width: 9vh':'width: 4vh'">+3
                    </el-button>
                    <el-button @click="data.VipTime+=86400*30" :style="is移动端()?'width: 9vh':'width: 4vh'">+30
                    </el-button>
                    <el-button @click="data.VipTime+=86400*365" :style="is移动端()?'width: 9vh':'width: 4vh'">+365
                    </el-button>
                  </div>
                </el-tooltip>
              </template>
            </el-form-item>
            <el-form-item label="积分" prop="VipNumber">
              <div>
                <el-input-number v-model="data.VipNumber" :precision="2" :step="0.1" :value-on-clear="0.00" :min="0"/>
                <el-button @click="data.VipNumber=0" :style="is移动端()?'width: 5vh':'width: 4vh'">
                  {{ "清零" }}
                </el-button>
                <el-button @click="data.VipNumber+=10" :style="is移动端()?'width: 5vh':'width: 4vh'">
                  {{ "+10" }}
                </el-button>
                <el-button @click="data.VipNumber+=100" :style="is移动端()?'width: 5vh':'width: 4vh'">
                  {{ "+100" }}
                </el-button>
                <el-button @click="data.VipNumber+=500" :style="is移动端()?'width: 5vh':'width: 4vh'">
                  {{ "+500" }}
                </el-button>
              </div>
            </el-form-item>
            <el-form-item label="备注" prop="Note">
              <el-input type="textarea" v-model="data.Note" placeholder="请输入备注"/>
            </el-form-item>
            <el-form-item label="最大同时在线数量" prop="MaxOnline">
              <el-input-number v-model.number="data.MaxOnline" :step="1" :value-on-clear="0" :min="1"/>
            </el-form-item>
            <el-form-item :label="'用户类型'+data.UserClassId" prop="UserClassId" style="width:280px">
              <el-select v-model="data.UserClassId" clear placeholder="全部">
                <!--            <el-option key="0" label="未分类" :value="0"/>-->
                <el-option v-for="(ver,key) in UserType" :key="key" :label="ver" :value="Number(key)"/>
              </el-select>
            </el-form-item>
            <el-form-item label="首次登录" prop="MaxOnline">
              <el-text>{{ 时间_时间戳到时间(data.RegisterTime) }}</el-text>
            </el-form-item>
            <el-form-item label="归属代理Uid" prop="AgentUid">
              <el-input-number v-model.number="data.AgentUid"  :value-on-clear="0" :min="0"/>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="用户云配置" name="用户云配置">
          <el-form :inline="false" style="min-width: 80px" label-width="130px" :model="data"
                   :label-position="is移动端()?'top':'right'" ref="ruleFormRef">
            <el-form-item v-for="(data,key) in 用户云配置" :label="data.Name" :key="key" style="width: 100%">

              <el-input type="textarea" v-model="data.Value"
                        :autosize="{ minRows: 1, maxRows: 23 }" style="width: calc(100% - 70px - 50px)"/>
              <div style="float: right;padding-left: 5px">

                <el-popconfirm title="确定删除?"
                               placement="right"
                               @confirm="on删除用户云配置(key)" confirm-button-text="确定"
                               cancel-button-text="取消">

                  <template #reference>
                    <el-button type="danger" size="small" :icon="Delete" circle style=" margin-left: 5px"/>
                  </template>
                </el-popconfirm>

              </div>
            </el-form-item>
            <el-divider>
              <el-button type="primary" size="large" :icon="Plus" style="width: 110px" round
                         @click="on添加用户云配置()">
                添加
              </el-button>
            </el-divider>
          </el-form>
        </el-tab-pane>
      </el-tabs>


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
import {NewAppUser信息, SaveAppUser信息, GetAppUser详细信息} from "@/api/软件用户api";
import {ElMessage, FormInstance} from "element-plus";
import {is移动端, 时间_取现行时间戳, 时间_时间戳到时间, 时间_计算天时分秒提示} from "@/utils/utils";
// 引入中文包
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import {GetList, DeleteInfo, New} from "@/api/用户云配置api.js";
import {Delete} from "@element-plus/icons-vue";
import {Plus} from "@element-plus/icons";

const Props = defineProps({
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
const 详细信息顶部标签现行选项 = ref("用户信息")

const is对话框可见2 = ref(true)

const data = ref({
  "AppId": Props.AppId,
  "Id": 0,
  "Uid": 0,
  "Status": 1,
  "Key": "绑定的key",
  "VipTime": 1681213040,
  "VipNumber": 12.13,
  "Msg": "用户备注",
  "MaxOnline": 1,
  "UserClassId": 0,
  "AppType": 1,
  "RegisterTime": 0,
  "AgentUid": 0
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

  if (Props.id === 0) {
    data.value.AppId = Props.AppId
    返回 = await NewAppUser信息(data.value);
  } else {
    /*    type 结构请求_DB_AppUser_UserConfig struct {
          AppId      int                `json:"AppId"` // Appid 必填
          AppUser    DB.DB_AppUser      `json:"AppUser"`
          UserConfig []DB.DB_UserConfig `json:"UserConfig"`
        }*/
    let 局_提交信息 = {
      AppId: Props.AppId,
      AppUser: data.value,
      UserConfig: 用户云配置.value.map(obj => ({Name: obj.Name, Value: obj.Value})),
    }

    返回 = await SaveAppUser信息(局_提交信息);
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
  console.info("用户详细信息对话框加载完毕了")
  is重新读取.value = false
  console.info("on对话框被打开" + Props.id)
  on校验表单重置(ruleFormRef.value)
  读取详细信息(Props.id)
})


const on表单校验 = ref({
  Uid: [
    {type: 'number', message: '用户id(Uid)必须>0', trigger: "blur", min: 1}
  ]
  // Phone: [
  //   {pattern: /^1([38][0-9]|4[014-9]|[59][0-35-9]|6[2567]|7[0-8])\d{8}$/, message: '请输入合法手机号', trigger: 'blur'},
  // ],
  // Email: [
  //   {
  //     pattern: /^([0-9A-Za-z\-_.]+)@([0-9a-z]+\.[a-z]{2,3}(\.[a-z]{2})?)$/g,
  //     message: '请输入正确的邮箱',
  //     trigger: 'blur'
  //   },
  // ],
})


const 用户云配置 = ref([])
const 读取详细信息 = async (id: number) => {
  if (id > 0) {
    let 返回 = await GetAppUser详细信息({"AppId": Props.AppId, "Id": id})
    if (返回.code == 10000) {
      data.value = 返回.data
      // if (data.value.VipTime.toString().length===10){
      //   data.value.VipTime=data.value.VipTime*1000   //日期时间选择器是13位时间戳所以得处理一下
      // }
      用户云配置.value = []
      //直接通过搜索用户Uid方式
      const res = await GetList({
        AppId: Props.AppId,
        Type: 3,
        Size: 50,
        Order: 2,
        Page: 1,
        Keywords: data.value.Uid.toString()
      })
      if (res.code == 10000) {
        用户云配置.value = res.data.list
        用户云配置.value.reverse()
        ElMessage.success(res.msg)
      }
    } else {
      is重新读取.value = false
      is对话框可见2.value = false
    }
  } else {
    data.value = {
      "AppId": Props.AppId,
      "Id": 0,
      "Uid": 0,
      "Status": 1,
      "Key": "",
      "VipTime": isAppType计点() ? 100 : 时间_取现行时间戳(),
      "VipNumber": 0,
      "Msg": "",
      "MaxOnline": 1,
      "UserClassId": 0,
      "AppType": Props.AppType,
      "RegisterTime": 0
    }
  }


}

const on添加用户云配置 = async () => {
  ElMessageBox.prompt('请输入用户云配置名称', 'Tip', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  }).then(async ({value}) => {
        let tempData = {Name: value, Value: ""}
        let tempData2 = tempData
        tempData2.AppId =Props.AppId
        tempData2.Uid = data.value.Uid
        const res = await New(tempData2)
        console.log(res)
        if (res.code == 10000) {
          用户云配置.value.push(tempData)
          ElMessage.success(res.msg)
        }
      })
      .catch(() => {

      })

}
const on删除用户云配置 = async (数组索引: number) => {
  const res = await DeleteInfo({
    "data": [用户云配置.value[数组索引]]
  })


  if (res.code == 10000) {
    用户云配置.value.splice(数组索引, 1)
    ElMessage.success(res.msg)
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

type UserInfo = {
  user: string;
  phone: string;
  passWord: string;
  SuperpassWord: string;
  email: string;
  qq: string;
  rmb: number;
  Msg: string;
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

</style>
