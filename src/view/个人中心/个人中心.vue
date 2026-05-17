<template>

  <el-row>
    <el-col>
      <div class="PersonTop" v-loading="is加载中">
        <div class="PersonTop_img">
          <img src="./组件/头像.jpeg">
        </div>
        <div class="PersonTop_text">
          <div class="user_text">
            <div class="user_name">
              <span>  {{ UserInfo.user }}  </span>
            </div>
            <div class="user-v">
              <span class="user-v-font">{{ UserInfo.userClassName }}</span>
            </div>
            <div class="user_qianming">
<!--              <span v-if="UserInfo.vipTime>时间_取现行时间戳()"> 有效期:{{ 时间_时间戳到时间(UserInfo.vipTime) }}</span>
              <span style="color: red" v-else-if="UserInfo.linkTokenCount>120">恭喜管理员同时在线用户数量已超过100,当前{{UserInfo.linkTokenCount}},请开通商业会员,感谢您的支持</span>-->

<!--因为客户看着不舒服,所以不显示了-->
<!--              <span
                  v-if="UserInfo.userClassName !=='商业会员' || UserInfo.vipTime<时间_取现行时间戳()">{{
                  "在线用户量(" + UserInfo.linkTokenCount + ")<100无需开通商业会员"
                }}</span>-->

            </div>

            <div class="user_anniu">
              <el-button
                  type="danger"
                  plain
                  @click="快验注销({});UserInfo.User='';is对话框可见=true"
              >注销
              </el-button>
              <el-button
                  type="primary"
                  plain
                  @click="on更新个人信息"
              >更新信息
              </el-button>

            </div>
          </div>
          <div class="user_num">
            <div style="cursor: pointer">
              <div class="num_number">{{ UserInfo.rmb }}</div>
              <span class="num_text">历史赞助</span>
            </div>
            <div style="cursor: pointer">
              <div class="num_number">{{ UserInfo.vipNumber }}</div>
              <span class="num_text">会员积分</span>
            </div>
          </div>
        </div>
      </div>
    </el-col>
  </el-row>
  <el-row>
    <el-col>
      <div class="person_body" v-loading="is加载中">
        <div class="person_body_left">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span class="person_body_list" style="border-bottom: none"
              >个人中心</span
              >
            </div>
            <el-menu
                active-text-color="#00c3ff"
                :default-active="当前选择"
                class="el-menu-vertical-demo"
                @select="handleSelect"

            >
              <el-menu-item
                  index="个人信息"
              >
                <i class="el-icon-user"></i>
                <span slot="title">个人信息</span>
              </el-menu-item>
<!--              <el-menu-item
                  index="购卡充值"
              >
                <i class="el-icon-edit-outline"></i>
                <span slot="title">购卡充值</span>
              </el-menu-item>-->
              <el-menu-item
                  index="余额充值"
              >
                <i class="el-icon-document"></i>
                <span slot="title">我要赞助</span>
              </el-menu-item>
            </el-menu>
          </el-card>
        </div>
        <div class="person_body_right">
          <KyUserInfo v-if="当前选择==='个人信息'" :UserInfo="UserInfo"
                      @on更新个人信息="on更新个人信息"></KyUserInfo>
          <PayKa v-if="当前选择==='购卡充值'" :UserInfo="UserInfo" @on更新个人信息="on更新个人信息"></PayKa>
          <PayRMB v-if="当前选择==='余额充值'" :UserInfo="UserInfo" @on更新个人信息="on更新个人信息"></PayRMB>
        </div>
      </div>
    </el-col>
  </el-row>


  <LoginView :is对话框可见="is对话框可见" @on对话框详细信息关闭="on对话框详细信息关闭" :UserInfo="UserInfo"></LoginView>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";
import KyUserInfo from "@/view/个人中心/组件/个人详细信息.vue";
import PayKa from "@/view/个人中心/组件/购卡充值.vue";
import PayRMB from "@/view/个人中心/组件/余额充值.vue";
import LoginView from "@/view/个人中心/组件/登录注册找回密码.vue";

import {快验取用户信息, 快验登录, 快验注销} from "@/api/快验个人中心api";
import {ElMessage} from "element-plus";
import {useStore} from "vuex";
import {时间_取现行时间戳} from "@/utils/utils";

const Store = useStore()

  const UserInfo = ref({
    user: "",
    userClassName: "",
    vipNumber: 180.00,
    rmb: 180.01,
    vipTime: 1685678065,
    email: "13888888888@qq.com",
    loginTime: 1685678065,
    loginIp: "127.0.0.1",
    registerTime: 1685678065,
    appVar: "",
    appVerUpdateTime: "",
    appVarNew: "",
    linkTokenCount: 0,
    agentUid: 0,
  });
const is加载中 = ref(false);
const 当前选择 = ref("个人信息");


const handleSelect = (key, keyPath) => {
  console.log(key, keyPath)
  当前选择.value = key
}
const is对话框可见 = ref(false)
const on更新个人信息 = async () => {
  is加载中.value = true
  let 返回 = await 快验取用户信息({})
  is加载中.value = false
  if (返回.code == 10000) {
    UserInfo.value = 返回.data
  }
  is对话框可见.value = UserInfo.value.user.length < 6
  console.log(UserInfo.value.user.length < 6)
  console.log(UserInfo.value)

}

const on对话框详细信息关闭 = (is重新读取: boolean) => {
  //console.info("父组件收到对话框被关闭了")
  is对话框可见.value = false
  if (is重新读取) {
    on更新个人信息()
  }
}
onMounted(async () => {
  await on更新个人信息()
})
const 时间_时间戳到时间 = (Time) => {
  let date = new Date(Time * 1000);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
  let Y = date.getFullYear() + '-';
  let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
  let D = date.getDate() + ' ';

  if (D.length === 2) {
    D = "0" + D
  }

  let h = date.getHours() + ':';
  if (h.length === 2) {
    h = "0" + h
  }
  let m = date.getMinutes() + ':';
  if (m.length === 2) {
    m = "0" + m
  }

  let s = date.getSeconds().toString();
  if (s.length === 1) {
    s = "0" + s
  }
  return Y + M + D + h + m + s;
}

</script>

<style scoped lang="scss">
.me-video-player {
  background-color: transparent;
  width: 100%;
  height: 100%;
  object-fit: fill;
  display: block;
  position: fixed;
  left: 0;
  z-index: 0;
  top: 0;
}

.PersonTop {
  width: 1000px;
  height: 140px;
  padding-top: 20px;
  background-color: white;
  margin-top: 30px;
  position: absolute;
left: 5%;
  display: flex;
  border-radius: 5px;
}

.PersonTop_img {
  width: 150px;
  height: 120px;
  background-color: #8c939d;
  margin-right: 24px;
  margin-left: 20px;
  overflow: hidden;
  border-radius: 20px;
}

.PersonTop_img img {
  width: 100%;
  height: 100%;
  border-radius: 20px;
}

.PersonTop_text {
  height: 120px;
  width: 880px;
  display: flex;
}

.user_text {
  width: 60%;
  height: 100%;
  line-height: 30px;
}

.user_name {
  font-weight: bold;
}

.user-v {
  margin-bottom: -5px;
}

.user-v-img {
  width: 15px;
  height: 15px;
}

.user-v-font {
  font-size: 15px;
  color: #00c3ff;
}

.user_qianming {
  font-size: 12px;
  color: #999;
}

.user_num {
  width: 40%;
  height: 100%;
  display: flex;
  align-items: center;
}

.user_num > div {
  text-align: center;
  border-right: 1px dotted #999;
  box-sizing: border-box;
  width: 340px;
  height: 40px;
  line-height: 20px;
}

.num_text {
  color: #999;
}

.num_number {
  font-size: 20px;
  color: #333;
}

.el-menu-item > span {
  font-size: 16px;
  color: #999;
}

/*下面部分样式*/
.person_body {
  width: 1000px;
  margin-top: 210px;
  display: flex;
  position: absolute;
  left: 5%;
  border-radius: 5px;
}

.person_body_left {
  width: 27%;
  height: 600px;
  border-radius: 5px;
  margin-right: 3%;
  text-align: center;
}

.person_body_list {
  width: 100%;
  height: 50px;
  margin-top: 25px;
  font-size: 22px;
  border-bottom: 1px solid #f0f0f0;
  background-image: -webkit-linear-gradient(
          left,
          rgb(42, 134, 141),
          #e9e625dc 20%,
          #3498db 40%,
          #e74c3c 60%,
          #09ff009a 80%,
          rgba(82, 196, 204, 0.281) 100%
  );
  -webkit-text-fill-color: transparent;
  -webkit-background-clip: text;
  -webkit-background-size: 200% 100%;
  -webkit-animation: masked-animation 4s linear infinite;
}

.el-menu-item {
  margin-top: 22px;
}

.person_body_right {
  width: 70%;
  /* height: 500px; */
  border-radius: 5px;
  background-color: white;
}

.box-card {
  height: 500px;
}

/*ui样式*/
.el-button {
  width: 84px;
}
</style>
