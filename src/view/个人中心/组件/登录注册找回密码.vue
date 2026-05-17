<template>
  <el-dialog v-model="is对话框可见2"

             @open="on对话框被打开"
             :width="is移动端()?'90%':'30%'"
             top="5%"
             title=""
             :close-on-click-modal="false"
             :close-on-press-escape="false"
             :show-close="false"
             @close="on对话框被关闭">
    <div style="overflow:auto;padding:0 12px;height: 400px" v-loading="is加载中">
      <el-radio-group v-model="当前功能" style="margin-bottom: 5px">
        <el-radio-button label="登录"/>
        <el-radio-button label="注册"/>
        <el-radio-button label="找回"/>
      </el-radio-group>
      <el-form
          ref="loginForm"
          :model="data"
          :validate-on-rule-change="false"
      >
        <el-form-item prop="username">
          <el-input
              v-model="data.User"
              size="large"
              placeholder="请输入手机号"
              suffix-icon="user"

          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
              v-model="data.PassWord"
              show-password
              size="large"
              :placeholder="当前功能==='找回'?'请输入新密码':'请输入密码'"
          />
        </el-form-item>
        <el-form-item prop="username" v-if="当前功能==='注册'">
          <el-input
              v-model="data.Qq"
              size="large"
              placeholder="请输入联系QQ"

          />
        </el-form-item>

        <el-form-item prop="captcha"
                      v-if="(当前功能==='登录'&& 开启验证码接口列表.UserLogin===1)||(当前功能==='注册'&& 开启验证码接口列表.GetSMSCaptcha===1)||(当前功能==='找回'&& 开启验证码接口列表.GetSMSCaptcha===1)">
          <div class="英数验证码" style="height: 100%;width: 100%">
            <el-input
                v-model="data.CaptCha1.CaptChaValue"
                placeholder="请输入右侧验证码"
                size="large"
                style="flex:1;padding-right: 20px; width: 40%"
            />

            <img style="width: 30%; height: 30Px ;  padding: 0;margin: 0;"
                 :src="PicPath"
                 alt="请输入验证码"
                 @click="on刷新验证码()"
            >
          </div>
        </el-form-item>

        <el-form-item v-if="当前功能==='找回'||当前功能==='注册'" prop="captcha">
          <div class="短信验证码" style="height: 100%;width: 100%">
            <el-input
                v-model="data.CaptCha3.CaptChaValue"
                placeholder="请输入短信验证码"
                size="large"
                style="flex:1;padding-right: 20px; width: 40%"
            />

            <el-button @click="on发送短信被点击">
              {{ timer === 0 ? '发送验证码' : `${timer}s后重新获取` }}
            </el-button>
          </div>
        </el-form-item>

        <div id="captcha" :class="captchaConfig.config.product === 'bind' ? 'hideHeight' : ''">
          <GeeTestCaptcha :captcha-config="captchaConfig"/>
        </div>
        <el-form-item>
          <el-button
              type="primary"
              size="large"
              style="width: 100%; margin-left: 0"
              @click="on功能按钮被点击"
          >{{ 当前功能 }}
          </el-button>
        </el-form-item>

      </el-form>

    </div>
    <div class="工具栏">
      <el-tooltip
          effect="dark"
          content="升级到最新版本"
          placement="right"
      >
<!--        让icon框靠右侧-->
        <el-icon size="20"   v-if="Props.UserInfo.AppVer!==Props.UserInfo.AppVerNew" style="margin-left: 90%" @click="on升级最新版本">
          <UploadFilled/>
        </el-icon>
      </el-tooltip>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import {onMounted, reactive, ref, watch} from 'vue'

import {ElMessage, FormInstance} from "element-plus";
import {is移动端} from "@/utils/utils";
import {
  快验登录,
  快验取用户信息,
  快验找回密码,
  快验注册,
  取短信验证码,
  取英数验证码,
  取开启验证码接口列表, 快验系统更新
} from "@/api/快验个人中心api";
import {useIntervalFn} from '@vueuse/core'
import GeeTestCaptcha from './极验弹窗.vue'

const on升级最新版本 = () => {
  ElMessageBox.confirm(
      '确定要升级到最新版本吗?',
      '',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  )
      .then(async () => {
        let 返回 = await 快验系统更新({})
        ElMessage.success(返回.msg)
      })

}

//              @keyup="data.Qq=data.Qq.replace(/^(0+)|[^\d]+/g,'')"
const Props = defineProps({
  is对话框可见: {
    type: Boolean,
    default: false
  },
  UserInfo: {
    type: Object,
    default: {
      User: "",
      UserClassName: "",
      VipNumber: 180.00,
      RMB: 180.01,
      VipTime: 1685678065,
      Email: "13888888888@qq.com",
      LoginTime: 1685678065,
      LoginIp: "127.0.0.1",
      RegisterTime: 1685678065,
      AppVer: "",
      AppVerUpdateTime: "",
      AppVerNew: "",
    }
  }
})
const emit = defineEmits(['on对话框详细信息关闭'])

watch(() => Props.is对话框可见, (newVal, oldVal) => {
  if (newVal) {
    is对话框可见2.value = newVal;
    console.info("is对话框可见2被检测到改变了:")
  }
})

const 当前功能 = ref("登录")
const is加载中 = ref(false)
const is对话框可见2 = ref(false)
const data = ref({
  User: "",
  PassWord: "",
  Qq: "",
  CaptCha1: {
    captchaId: "",
    CaptChaValue: "",
  },
  CaptCha2: {
    captchaId: "",
    CaptChaValue: "",
  },
  CaptCha3: {
    captchaId: "",
    CaptChaValue: "",
  }
})


const timer = ref(0)
// 发送验证码倒计时
// useIntervalFn(定时的回调，回调的时间间隔，控制回调的调用方式)
// 参数三 {immediate: true, immediateCallback: false}
// 3-1) immediate 首次运行useIntervalFn函数时，是否立刻开启定时任务（默认值true表示默认开启）
// 3-2）immediateCallback 执行useIntervalFn函数立刻执行回调（在延时时间的前或者后调用），默认值是false，如果修改为true，表示为不延时，立刻启动定时任务（不要使用pause方法）
// pause暂停；resume启动
const {pause, resume} = useIntervalFn(
    () => {
      if (timer.value <= 0) {
        // 停止定时任务
        pause()
      } else {
        // 单次定时任务执行的回调
        timer.value--
      }
    },
    1000,
    {
      // 默认不开启定时任务
      immediate: false
    }
)

// 发送短信验证码
const on发送短信被点击 = async () => {


  let 错误信息 = "";
  if (data.value.User.length<8){
    错误信息 = "请先输入用户名手机号"
  }else if (开启验证码接口列表.value.GetSMSCaptcha === 1 && data.value.CaptCha1.CaptChaValue === "") {
    错误信息 = "请先输入英数验证码"
  } else if (开启验证码接口列表.value.GetSMSCaptcha === 2 && data.value.CaptCha2.CaptChaValue === "") {

    if (window.captchaObj) {
      window.captchaObj.showCaptcha();
      极验来源程序.value = "短信"
      return false  //直接返回不提示,
    }
    错误信息 = "请等待极验验证初始化完成"
  }

  if (错误信息 != "") {
    ElMessage.error(错误信息)
    return
  }


  // 开启倒计时效果
  if (timer.value === 0) {
    timer.value = 60
    resume()
  } else {
    return
  }
  // 这里写向后台发送请求的代码
  is加载中.value = true
  let 返回 = await 取短信验证码(data.value);
  is加载中.value = false
  if (返回.code == 10000) {
    data.value.CaptCha3.captchaId = 返回.data.CaptchaId
    data.value.CaptCha3.CaptChaValue = ""
    data.value.CaptCha2.CaptChaValue = ""   //滑动结果页删除
ElMessage.success(返回.msg)
  } else {
    timer.value = 0
    pause()
    await on刷新验证码()
  }

  console.log('发送请求')
}

const PicPath = ref("")
// 获取验证码
const on刷新验证码 = async () => {
  let 返回 = await 取英数验证码(data.value);
  if (返回.code == 10000) {
    PicPath.value = 返回.data.PicPath
    data.value.CaptCha1.captchaId = 返回.data.CaptchaId
  }
}
const 开启验证码接口列表 = ref({UserLogin: 0, GetSMSCaptcha: 0, NewUserInfo: 3})
const 极验来源程序 = ref("")
const on检查验证码合格 = () => {
  let 局_通过 = false
  let 错误内容 = "请先输入英数验证码"

  if (当前功能.value === "登录") {
    if (开启验证码接口列表.value.UserLogin === 0) {
      局_通过 = true
    } else if (开启验证码接口列表.value.UserLogin === 1) {
      局_通过 = data.value.CaptCha1.CaptChaValue != ""
    } else if (开启验证码接口列表.value.UserLogin === 2) {
      局_通过 = data.value.CaptCha2.CaptChaValue != ""

      if (!局_通过) {
        if (window.captchaObj) {
          window.captchaObj.showCaptcha();
          极验来源程序.value = "登录"
          return false  //直接返回不提示,
        } else {
          错误内容 = "请等待验证初始化完成"
        }
      }
    }
  }


  if (当前功能.value === "注册" || 当前功能.value === "找回") {
    错误内容 = "请填写短信验证码"
    局_通过 = data.value.CaptCha3.CaptChaValue != ""
  }


  if (!局_通过) {
    ElMessage.error(错误内容)
  }

  return 局_通过
}
const on功能按钮被点击 = async () => {

  if (!on检查验证码合格()) {
    return
  }


  if (当前功能.value === "注册") {
    console.log(data.value)
    is加载中.value = true
    let 返回 = await 快验注册(data.value);
    is加载中.value = false
    data.value.CaptCha2.CaptChaValue = ""   //滑动结果页删除
    if (返回.code == 10000) {
      当前功能.value = "登录"
      ElMessage.success(返回.msg)
      return
    }
    if (开启验证码接口列表.value.GetSMSCaptcha === 1) {
      await on刷新验证码()
    }
  }
  if (当前功能.value === "登录") {
    is加载中.value = true
    let 返回 = await 快验登录(data.value);
    is加载中.value = false
    data.value.CaptCha2.CaptChaValue = ""   //滑动结果页删除
    if (返回.code == 10000) {
     ElMessage.success(返回.msg)
      is对话框可见2.value = false
      emit('on对话框详细信息关闭', true)
      return
    }
    if (开启验证码接口列表.value.UserLogin === 1) {
      await on刷新验证码()
    }

  }

  if (当前功能.value === "找回") {
    is加载中.value = true
    let 返回 = await 快验找回密码(data.value);
    is加载中.value = false
    data.value.CaptCha2.CaptChaValue = ""   //滑动结果页删除
    if (返回.code == 10000) {
      当前功能.value = "登录"
     ElMessage.success(返回.msg)
      is对话框可见2.value = false
      emit('on对话框详细信息关闭', true)
      return
    }

    if (开启验证码接口列表.value.GetSMSCaptcha === 1) {
      await on刷新验证码()
    }
  }

}

const ruleFormRef = ref<FormInstance>()
const is重新读取 = ref(false)

const on校验表单重置 = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}
const on登录 = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}

onMounted(() => {
  读取开启验证码接口列表()
})

const 读取开启验证码接口列表 = async () => {

  let 返回 = await 取开启验证码接口列表({});
  if (返回.code == 10000) {
    console.log(返回.data)
    let 临时开启验证码接口列表 = JSON.parse(返回.data.map)
    开启验证码接口列表.value.UserLogin = 临时开启验证码接口列表.hasOwnProperty('UserLogin') ? 临时开启验证码接口列表.UserLogin : 0
    开启验证码接口列表.value.GetSMSCaptcha = 临时开启验证码接口列表.hasOwnProperty('GetSMSCaptcha') ? 临时开启验证码接口列表.GetSMSCaptcha : 0
  }
  console.log(开启验证码接口列表.value)
}
const on表单校验 = ref({})

const on对话框被打开 = () => {
  is重新读取.value = false
  console.info("on对话框被打开")
  on校验表单重置(ruleFormRef.value)

  data.value = {
    User: "",
    PassWord: "",
    Qq: "",
    CaptCha1: {
      captchaId: "",
      CaptChaValue: "",
    },
    CaptCha2: {
      captchaId: "",
      CaptChaValue: "",
    },
    CaptCha3: {
      captchaId: "",
      CaptChaValue: "",
    }
  }

  //console.log(JSON.stringify(data.value))
  on刷新验证码()

}

const on对话框被关闭 = () => {
  console.info("on对话框被关闭")
  is对话框可见2.value = false
  emit('on对话框详细信息关闭', is重新读取.value)
}
const captchaHandler = (captchaObj) => {
  window.captchaObj = captchaObj;
  captchaObj.appendTo("#captcha").onSuccess(function () {

    console.log("极验滑动结果")
    console.log(captchaObj.getValidate())

    data.value.CaptCha2.captchaId = captchaObj.getValidate().captcha_id

    data.value.CaptCha2.CaptChaValue = JSON.stringify(captchaObj.getValidate())
    //console.log(captchaObj.getValidate().toString())
    /*{
captcha_id: 'ea872eea9e20dce9de4e5da4297ee704',
lot_number: '1102ce66730447368e5a133b9f239099',
pass_token: '6c87a0000281f21b34e1262cdf5875475152def2a38d8900f1a591d04e66ac70',
gen_time: '1685946201',
captcha_output: 'BFZFX-sB_WLMfXEmGExfGuhvp6VqzHxjzMIoh3mpHd5VPSZVHi…bk-nnieRuvnf-r0ToBA1poA4hpEQGTSkbeW877oEMfXoWBp2s'
}*/
    if (极验来源程序.value === "登录") {
      on功能按钮被点击()
    } else if (极验来源程序.value === "短信") {
      on发送短信被点击()
    }

  })
};

//配置极验验证参数
const captchaConfig = reactive({
  config: {
    captchaId: "ea872eea9e20dce9de4e5da4297ee704",//实际你申请的captchaId
    product: "bind",
    // nativeButton: {
    //     height: '40px',
    //     width: '100%'
    // }
  },
  handler: captchaHandler,
})


</script>

<style lang="scss" scoped>
@import "@/styles/newLogin.scss";

.英数验证码 {
  padding: 0;
  margin: 0;
}

.工具栏 {
  margin: 7px 8px 8px;
  padding-right: 1px;
  .el-icon {
    /*设置边框阴影*/
    font-size: 16px;
    margin-left: 10px;
    padding: 5px;
    border: 1px solid rgb(235, 238, 245);
    color: #409EFF;
    speak: none;
    font-style: normal;
    font-variant: normal;
    text-transform: none;
    line-height: 1;
    vertical-align: baseline;
    display: inline-block;
    -webkit-font-smoothing: antialiased;
    cursor: pointer;
  }
}
</style>
