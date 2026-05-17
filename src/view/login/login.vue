<template>
  <div id="userLayout">
    <div class="login_panel">
      <div class="login_panel_form" :style="is移动端()?'padding: 30px 2px 30px 2px;':'padding: 30px 40px 30px 40px;'">
        <div class="login_panel_form_title">
          <img
              class="login_panel_form_title_logo"
              src="@/assets/logo4_128_128.png"
              alt
          >
          <p class="login_panel_form_title_p">{{ Store.state.ServerName }}</p>
        </div>
        <el-form
            ref="loginForm"
            :model="loginFormData"
            :rules="rules"
            :validate-on-rule-change="false"
            @keyup.enter="submitForm"
        >
          <el-form-item prop="username">
            <el-input
                v-model="loginFormData.username"
                size="large"
                placeholder="请输入用户名"
                suffix-icon="user"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
                v-model="loginFormData.password"
                show-password
                size="large"
                type="password"
                placeholder="请输入密码"
            />
          </el-form-item>
          <el-form-item v-if="loginFormData.openCaptcha" prop="captcha">
            <div class="vPicBox">
              <div
                  :style="{
                  backgroundImage: `url(${picPath})`,
                  backgroundSize: '336px 192px',
                  backgroundRepeat: 'repeat',
                  backgroundPosition: 'top left',
                  width: '336px',
                  height: '192px',
                  position: 'relative'
                }"
                  @click="handleImageClick"
              >                  <!-- 添加刷新图标 -->
                <el-icon class="refresh-icon" @click="on刷新验证码">
                  <Refresh />
                </el-icon></div>
              <div
                      v-for="(mark, index) in clickMarks"
                      :key="index"
                      :style="{
                      position: 'absolute',
                      left: `${mark.x-5}px`,
                      top: `${mark.y-10}px`,
                      color: 'red',
                      fontSize: '30px',
                      fontWeight: 'bold',
                      pointerEvents: 'none',
                    }"
                  >
                    {{ mark.count }}
                  </div>

              </div>
          </el-form-item>
          <el-form-item>
            <!--            <el-button-->
            <!--              type="primary"-->
            <!--              style="width: 0% ;  visibility: hidden"-->
            <!--              size="large"-->
            <!--              @click="checkInit"-->
            <!--            >前往初始化</el-button>-->
            <el-button
                type="primary"
                size="large"
                style="width: 100%; margin-left: 0"
                @click="submitForm"
            >登 录
            </el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="login_panel_right"/>
      <div class="login_panel_foot">
        <div class="links">
          <!--底部版权信息提示-->
          <!--底部版权信息提示-->
          <!--底部版权信息提示-->
          <!-- 其他底部内容 -->

        </div>
        <div class="copyright">
          <!--          <BottomInfo />-->
          <el-button text></el-button>
          <el-link href="https://beian.miit.gov.cn" target="_blank" type="info">{{  Store.state.备案号 }}</el-link>
          <a target="_blank"></a>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup>

import {captcha} from '@/api/user'
import {checkDB} from '@/api/initdb'
import {login} from '@/api/user'
/* import BottomInfo from '@/view/layout/bottomInfo/bottomInfo.vue' */

import {ElMessage} from 'element-plus'
import {useRouter} from "vue-router";
import {useStore} from 'vuex'
import {reactive, ref} from 'vue'
import {onMounted} from 'vue'
const router = useRouter();

const is移动端 = ()=> {
  if ((navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i))) {
    return true
  }
  return false
}
const Store = useStore()
onMounted(() => {
  //console.log('测试')
  Store.commit("set服务器名称", '等待初始化')
  checkInit().then((is初始化) => {
    if (is初始化) {
      console.log("is初始化" + is初始化)
      console.log(is初始化)

      router.push("Init")
    }
  })
})


// 验证函数
const checkUsername = (rule, value, callback) => {
  if (value.length < 5) {
    return callback(new Error('请输入正确的用户名'))
  } else {
    callback()
  }
}
const checkPassword = (rule, value, callback) => {
  if (value.length < 5) {
    return callback(new Error('请输入正确的密码'))
  } else {
    callback()
  }
}



// 获取验证码
const on刷新验证码 = () => {
  captcha({}).then(async (ele) => {
    picPath.value = ele.data.picPath
    loginFormData.captchaId = ele.data.captchaId
    loginFormData.openCaptcha = ele.data.openCaptcha
    loginFormData.captcha = ""
    clickMarks.value = [] // 清空点击标记
  })
}
on刷新验证码()


const loginForm = ref(null)

const picPath = ref('')
// 定义点击位置和次数的接口
const clickMarks = ref([]);


const handleImageClick = (event) => {
  const rect = event.target.getBoundingClientRect();
  const x = event.clientX - rect.left; // 计算点击位置相对于图片的X坐标
  const y = event.clientY - rect.top; // 计算点击位置相对于图片的Y坐标
  if (y <= 48 || clickMarks.value.length>=4) {
    return
  }

  clickMarks.value.push({x, y, count: clickMarks.value.length+1});
  console.log('点击位置：', clickMarks.value)
}

const loginFormData = reactive({
  username: 'admin',
  password: '',
  captcha: '66',
  captchaId: '',
  openCaptcha: false,
})
//全局注册表单校验
const rules = reactive({
  username: [{validator: checkUsername, trigger: 'blur'}],
  password: [{validator: checkPassword, trigger: 'blur'}],
})

const onLogin = async (loginInfo) => {
  const res = await login(loginInfo)
  console.info("登录结果")
  console.info(res)
  if (res.code === 10000) {

    Store.commit("setToken", res.data.token)
    Store.commit("setUserInfo", res.data.userInfo)

    if (res.data.KuaiYan === true) {
      router.push('/个人中心').catch(err => {
        console.error('路由跳转失败:', err)
        ElMessage.error('跳转失败: ' + err.message)
      })
    } else {
      router.replace({path: "/"}).catch(err => {
        console.error('路由跳转失败:', err)
        ElMessage.error('跳转失败: ' + err.message)
      })
    }
    ElMessage.success(res.msg)
    return true
  } else {
    return false
  }
}


const submitForm = () => {
  loginForm.value.validate(async (v) => {
    if (v) {
      if (loginFormData.openCaptcha){
        if (clickMarks.value.length < 4) {
          ElMessage.error("请完成点选验证")
          return
        }
        loginFormData.captcha =""
        for (let i = 0; i < clickMarks.value.length; i++){
          loginFormData.captcha +=parseInt(clickMarks.value[i].x)+"|"+parseInt(clickMarks.value[i].y)
          if (i < clickMarks.value.length-1){
            loginFormData.captcha += ","
          }
        }
      }
      const is登录结果 = await onLogin(loginFormData)
      // 如果登录失败 就刷新验证码
      if (is登录结果) {

      } else {
        on刷新验证码()
      }
    } else {
      ElMessage.error("请正确填写登录信息")

      on刷新验证码()
      return false
    }
  })

}

// 跳转初始化
const checkInit = async () => {
  const res = await checkDB()
  /* {
	"code": 0,
	"data": {
		"ServerName": "飞鸟快验后台管理系统",
		"needInit": false
	},
	"msg": "数据库无需初始化"
} */

  /* 把系统名称赋值 */
  Store.commit("set服务器名称", res.data.serverName)
  Store.commit("set服务器备案号", res.data.filing)
  console.log("set服务器名称:" + res.data.serverName)
  console.log("set服务器备案号:" + res.data.filing)
  console.log(res)
  /* 判断你是否需要初始化数据库如果需要直接跳转 */
  if (res.code === 10000) {
    if (res.data?.needInit) {
      Store.commit("NeedInit")
      return true
    }
  }
  return false
}

</script>

<style lang="scss" scoped>
@import "@/styles/newLogin.scss";


.refresh-icon {
  position: absolute;
  right: 2px;
  bottom: 2px;  // 修改这里，从 top 改为 bottom
  cursor: pointer;
  font-size: 25px;
  color: #409EFF;
}
</style>
