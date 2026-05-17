<template>
  <el-badge v-if="!is移动端()" :value="Store.state.userInfo.userMsgNoRead" :max="99" class="item"
            :hidden="Store.state.userInfo.userMsgNoRead===0">
    <el-icon class="右上角图标" @click="on路由跳转('用户消息')">
      <Bell/>
    </el-icon>
  </el-badge>

  <el-dropdown>
    <span class="el-dropdown-link" style="color:#0c0d0e ;font-size: 18px;">
      <el-icon class="右上角图标"><User/></el-icon>  {{ is移动端() ? '' : Store.state.userInfo?.adminInfo?.User }}
      <el-icon class="el-icon--right">
        <arrow-down/>
      </el-icon>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item @click="on个人中心">个人中心</el-dropdown-item>
        <el-dropdown-item @click="on修改密码">修改密码</el-dropdown-item>
        <el-dropdown-item @click="on退出登录">退出登录</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
import {useStore} from "vuex";
import {useRouter} from "vue-router";
import {onMounted, ref} from "vue";
import {AdminNewPassword, GetAdminInfo, OutLogin} from "@/api/user.js"
import {is移动端} from "@/utils/utils";
import {ElMessage} from "element-plus";

const Store = useStore()
const Router = useRouter()

const on路由跳转 = (name) => {
  Router.push({name})
}

const on修改密码 = async () => {
  ElMessageBox.prompt('请输入新密码', 'Tip', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern:
        /^\S{5,18}$/,
    inputErrorMessage: '密码以字母开头，长度在5-18之间，只能包含字符、数字和下划线',
  })
      .then(async ({value}) => {
        const res = await AdminNewPassword({NewPassword: value})
        console.log(res)
        if (res.code === 10000) {
          ElMessage.success(res.msg)
        }
      })
      .catch(() => {

      })
}
const on退出登录 = async () => {
  await OutLogin()

  Store.commit("setToken", "")
  Store.commit("onTabs菜单删除", "关闭所有")
  Store.commit("on更新菜单当前Path", "")
  Router.replace({path: "Login"})
}


const on个人中心 = async () => {
  on路由跳转("个人中心")
}
const onGetUserInfo = async () => {
  console.log(Store.state.userInfo)
  if (!Store.state.userInfo?.adminInfo?.User) {
    console.log("用户信息没有了需要更新")
    const res = await GetAdminInfo()
    console.log(res.data)
    if (res.data.adminInfo?.Id!==undefined) {
      Store.commit("setUserInfo", res.data)
      console.log("res.data.serverName")
      console.log(res.data.serverName)
      Store.commit("set服务器名称", res.data.serverName)
    }

  }
}
onMounted(() => {
  onGetUserInfo()
})


</script>

<style lang="scss">
.右上角图标 {
  margin-left: 15px;
  cursor: pointer;
  border-radius: 25px;
  border: 2px solid #e9e9eb;
  padding: 3px;
}


</style>
