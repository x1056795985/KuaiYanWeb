<template>
  <el-dialog v-model="is对话框可见2" :title="id===0?'添加新代理':'修改代理信息'"
             :width="is移动端()?'90%':'760px'"
             @close="on对话框被关闭">
    <div style="overflow:auto;padding:0 12px;" v-loading="is加载中">
      <el-form :inline="Props.id>0" style="min-width: 80px" label-width="100px" :rules="on表单校验" :model="data"
               :label-position="is移动端()?'top':'right'" ref="ruleFormRef">
        <el-form-item v-if="Props.id>0" label="Id" prop="Id" disabled="disabled">
          <el-input class="只读编辑框" v-if="Props.id>0" v-model="data.Id" placeholder="" readonly="readonly"/>
        </el-form-item>
        <el-form-item v-if="Props.id>0" label="状态" prop="Status">
          <el-switch
              :active-value="1"
              :inactive-value="2"
              v-model="data.Status"
              class="ml-2"
              inline-prompt
              style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
              active-text="正常"
              inactive-text="冻结"
          />
        </el-form-item>

        <el-form-item label="用户名" prop="User" >


          <el-input :class="[id>0?'只读编辑框':'']" v-model="data.User" :readonly="id>0" placeholder="可以输入中文代理用户名,更方便记忆"/>
        </el-form-item>
        <el-form-item label="密码" prop="PassWord">
          <el-input v-model.trim="data.PassWord" :placeholder="Props.id===0?'请输入密码':'不修改留空忽略即可'"/>
        </el-form-item>
        <el-form-item label="手机号" prop="Phone">
          <el-input v-model.trim="data.Phone" placeholder="请输入手机号"/>
        </el-form-item>
        <el-form-item label="超级密码" prop="SuperPassWord">
          <el-input v-model.trim="data.SuperPassWord" :placeholder="Props.id===0?'请输入超级密码':'不修改留空忽略即可'"/>
        </el-form-item>

        <el-form-item label="QQ" prop="Qq">
          <el-input v-model.trim="data.Qq" placeholder="请输入联系QQ"/>
        </el-form-item>
        <el-form-item label="邮箱" prop="Email">
          <el-input v-model.trim="data.Email" placeholder="请输入邮箱地址"/>
        </el-form-item>
        <el-form-item label="实名信息" prop="RealNameAttestation">
          <el-input v-model.trim="data.RealNameAttestation" placeholder="请输入实名认证信息"/>
        </el-form-item>
        <el-form-item label="余额" prop="Rmb">
          <el-input-number v-model="data.Rmb" :precision="2" :step="0.1" :value-on-clear="0" :min="-1"/>
        </el-form-item>
        <el-form-item label="分成百分比" prop="AgentDiscount">
          <el-input-number v-model="data.AgentDiscount" :precision="0"  :step="1" :value-on-clear="0" :min="0" :max="100"/>
          %
        </el-form-item>
      </el-form>
<!--      这段代码并不是没有作用, 上面的一行两个数据,下边的一行一个数据,主要是备注需要占用一整行-->
      <el-form style="min-width: 80px" label-width="100px" :rules="on表单校验" :model="data"
               :label-position="is移动端()?'top':'right'" ref="ruleFormRef" >
        <el-form-item label="备注" prop="Note">
          <el-input v-model="data.Note" type="textarea" placeholder="请输入备注"/>
        </el-form-item>
      </el-form>
          <el-descriptions v-show="data.id!==0" class="margin-top" title="其他信息" :column="is移动端()?1:2" border>
            <template slot="extra">
              <el-button type="primary">操作</el-button>
            </template>
            <el-descriptions-item >
              <template #label>
                <i class="el-icon-message"></i>
                上级用户名:
              </template>
              {{ data.UPAgentUser}}
            </el-descriptions-item>
            <el-descriptions-item >
              <template #label>
                <i class="el-icon-message"></i>
                上级代理Id:
              </template>
              {{ data.UPAgentId >0 ? data.UPAgentId : -data.UPAgentId }}
              <el-tag v-show="data.UPAgentId<0" type="info">
                {{ data.UPAgentId === -1 ? '管理员' : '开发者' }}
              </el-tag>
            </el-descriptions-item>

            <el-descriptions-item>
              <template #label>
                <i class="el-icon-male"></i>
                <i class="el-icon-female"></i>
                用户角色:
              </template>
              <el-tag size="small"> {{ data.Role===0?'普通用户':(data.Role+'级代理') }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <i class="el-icon-s-custom"></i>
                登录平台:
              </template>
              {{ data.LoginAppName || '未登录' }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <i class="el-icon-s-custom"></i>
                登录时间:
              </template>
              {{ data.LoginTime === 0 ? '未登录过' : 时间_时间戳到时间(data.LoginTime)}}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <i class="el-icon-s-custom"></i>
                登录IP:
              </template>
              {{ data.LoginIp }}
            </el-descriptions-item>

            <el-descriptions-item>
              <template #label>
                <i class="el-icon-odometer"></i>
                注册时间:
              </template>
              {{ 时间_时间戳到时间(data.RegisterTime)  }}
            </el-descriptions-item>

            <el-descriptions-item>
              <template #label>
                <i class="el-icon-message"></i>
                注册IP:
              </template>
              {{ data.RegisterIp }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <i class="el-icon-s-custom"></i>
                登录AppId:
              </template>
              {{ data.LoginAppid || '未登录' }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <i class="el-icon-odometer"></i>
                余额:
              </template>
              {{ data.Rmb === -1 ? '未设置' : data.Rmb + ' 元' }}
            </el-descriptions-item>



          </el-descriptions>


    </div>
    <template #footer>
      <div class="dialog-footer" v-loading="is加载中">
        <el-button @click="is对话框可见2=false">取 消</el-button>
        <el-button type="primary" @click="on确定按钮被点击(ruleFormRef)">确 定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from 'vue'
import {New用户信息, Save用户信息, Get用户详细信息} from "@/api/代理信息api";
import {ElMessage, FormInstance} from "element-plus";
import {is移动端, 时间_时间戳到时间} from "@/utils/utils";
import {useStore} from "vuex";

const Props = defineProps({
  is对话框可见: {
    type: Boolean,
    default: false
  },
  id: {
    type: Number,
    default: 0
  },
})
const emit = defineEmits(['on对话框详细信息关闭'])
const on对话框被关闭 = () => {
  emit('on对话框详细信息关闭', is重新读取.value)
}

const is对话框可见2 = ref(true)
const is加载中 = ref(false)
interface UserInfo {
  id: number;
  status: number;
  user: string;
  phone: string;
  passWord: string;
  superPassWord: string;
  email: string;
  qq: string;
  rmb: number;
  role: number;
  note: string;
  realNameAttestation: string;
  uPAgentId: number;
  uPAgentUser: string;
  agentDiscount: number;
  loginTime: number;
  loginIp: string;
  loginAppName: string;
  registerTime: number;
  registerIp: string;
  sort: number;
  loginAppid: number;
}

const data = ref<UserInfo>({
  id: 0,
  status: 1,
  user: "",
  phone: "",
  passWord: "",
  superPassWord: "",
  email: "",
  qq: "",
  rmb: 0.0,
  role: 0,
  note: "",
  realNameAttestation: "",
  uPAgentId: 0,
  uPAgentUser: "",
  agentDiscount: 0,
  loginTime: 0,
  loginIp: "",
  loginAppName: "",
  registerTime: 0,
  registerIp: "",
  sort: 0,
  loginAppid: 0,
})

const ruleFormRef = ref<FormInstance>()
const is重新读取 = ref(false)
const Store = useStore()
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
  is加载中.value=true
  if (Props.id === 0) {
    data.value.UPAgentId=-1 //负数为管理员ID
    返回 = await New用户信息(data.value);
  } else {
    返回 = await Save用户信息(data.value);
  }
  is加载中.value=false
  console.log(返回)
  if (返回.code == 10000) {
    is重新读取.value = true
    is对话框可见2.value = false
ElMessage.success(返回.msg)
  }
}


onMounted(() => {
  console.info("用户详细信息对话框加载完毕了")
  on对话框被打开()
})


const on表单校验 = ref({
  User: [
    {required: true, message: '请输入用户名', trigger: 'change'},
    {min: 2, message: '最低2位字符', trigger: ''}
  ],
  Phone: [
    {pattern: /^1([38][0-9]|4[014-9]|[59][0-35-9]|6[2567]|7[0-8])\d{8}$/, message: '请输入合法手机号', trigger: 'change'},
  ],
  Email: [
    {
      pattern: /^([0-9A-Za-z\-_.]+)@([0-9a-z]+\.[a-z]{2,3}(\.[a-z]{2})?)$/g,
      message: '请输入正确的邮箱',
      trigger: 'change'
    },
  ],
  SuperPassWord: [
    {required: true, message: '请输入用户密码', trigger: 'change'},
    {min: 6, message: '最低6位字符', trigger: ''}
  ],
  PassWord: [
    {required: true, message: '请输入用户密码', trigger: 'change'},
    {min: 6, message: '最低6位字符', trigger: ''}
  ]
})
const on校验表单重置 = (formEl: FormInstance | undefined) => {

  if (Props.id === 0) {
    // 添加账号 验证密码
    on表单校验.value.User[0].required = true
    on表单校验.value.PassWord[0].required = true
    on表单校验.value.SuperPassWord[0].required = true
  } else {
    //修改账号不验证密码
    on表单校验.value.User[0].required = false
    on表单校验.value.PassWord[0].required = false
    on表单校验.value.SuperPassWord[0].required = false
  }

  if (formEl) {
    console.log("重置表单")
    formEl.resetFields()
  }

}

const on对话框被打开 = () => {
  is重新读取.value = false
  console.info("on对话框被打开")
  data.value={
    id: 0,
    Status: 1,
    "User": "",
    "Phone": "",
    "PassWord": "",
    "SuperPassWord": "",
    "Email": "",
    "Qq": "",
    "Rmb": 0.0,
    "Role": 0,
    "Note": "",
    "UPAgentId": 0,
    "UPAgentUser": "",
    "AgentDiscount": 0,
    "LoginTime": 0,
    "LoginIp": "",
    "LoginAppName": "",
    "RegisterTime": 0,
    "RegisterIp": "",
    "Sort": 0,
    "LoginAppid": 0
  }
  on校验表单重置(ruleFormRef.value)
  读取详细信息(Props.id)
  console.log(Props.id)
}
const 读取详细信息 = async (id: number) => {
  if (id > 0) {
    let 返回 = await Get用户详细信息({ "Id": id });
    if (返回.code == 10000) {
      // ✅ 直接 shallow assign，字段名完全对齐 API（小驼峰）
      Object.assign(data.value, 返回.data);
      // 防御性默认值（可选）
      data.value.rmb = data.value.rmb ?? 0.0;
      data.value.status = data.value.status ?? 1;
      data.value.role = data.value.role ?? 0;
    } else {
      is重新读取.value = false;
      is对话框可见2.value = false;
    }
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

</style>
