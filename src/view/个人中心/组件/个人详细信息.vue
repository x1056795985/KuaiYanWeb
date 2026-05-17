<template>
  <div>
    <el-card>
      <el-descriptions class="margin-top" title="简介" :column="2" border>
        <template slot="extra">
          <el-button type="primary">操作</el-button>
        </template>
        <el-descriptions-item>
          <template #label>
            <i class="el-icon-picture-outline"></i>
            头像
          </template>

          <img class="img" src="./头像.jpeg" alt=""/>
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <i class="el-icon-user"></i>

          </template>
          <el-tag v-if="Props.UserInfo.agentUid>0 " size="small">定制编号{{Props.UserInfo.agentUid}}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <i class="el-icon-s-custom"></i>
            用户名
          </template>
          {{ Props.UserInfo.user }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <i class="el-icon-odometer"></i>
            注册时间
          </template>
          {{ 时间_时间戳到时间(Props.UserInfo.registerTime) }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <i class="el-icon-male"></i>
            <i class="el-icon-female"></i>
            类型
          </template>
          <el-tag size="small"> {{ Props.UserInfo.userClassName }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <i class="el-icon-message"></i>
            邮箱Email
          </template>
          {{ Props.UserInfo.email }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <i class="el-icon-location-outline"></i>
            登录Ip
          </template>
          {{ Props.UserInfo.loginIp }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <i class="el-icon-office-building"></i>
            登录时间
          </template>
          {{ 时间_时间戳到时间(Props.UserInfo.loginTime) }}

        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <i class="el-icon-location-outline"></i>
            当前版本
          </template>
          {{ Props.UserInfo.appVer }}({{ Props.UserInfo.appVerUpdateTime }})
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <i class="el-icon-office-building"></i>
            最新版本
          </template>
          <div class="工具栏">
            {{ Props.UserInfo.appVerNew }}
            <el-tooltip
                effect="dark"
                content="升级到最新版本"
                placement="right"
            >
              <el-icon size="20"  v-if="Props.UserInfo.appVer!==Props.UserInfo.appVerNew"  @click="on升级最新版本">
                <UploadFilled/>
              </el-icon>
            </el-tooltip>
          </div>


        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup>
import {快验系统更新} from "@/api/快验个人中心api.js";
import {ElMessage} from "element-plus";

  const Props = defineProps({
    UserInfo: {
      type: Object,
      default: {
        user: "",
        userClassName: "",
        vipNumber: 180.00,
        rmb: 180.01,
        vipTime: 1685678065,
        email: "13888888888@qq.com",
        loginTime: 1685678065,
        loginIp: "127.0.0.1",
        registerTime: 1685678065,
        appVer: "",
        appVerUpdateTime: "",
        appVerNew: "",
      }
    }
  })
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
const 时间_时间戳到时间 = (Time) => {
  var date = new Date(Time * 1000);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
  var Y = date.getFullYear() + '-';
  var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
  var D = date.getDate() + ' ';

  if (D.length === 2) {
    D = "0" + D
  }

  var h = date.getHours() + ':';
  if (h.length === 2) {
    h = "0" + h
  }
  var m = date.getMinutes() + ':';
  if (m.length === 2) {
    m = "0" + m
  }

  var s = date.getSeconds().toString();
  if (s.length === 1) {
    s = "0" + s
  }
  return Y + M + D + h + m + s;
}
</script>

<style scoped lang="scss">
.img {
  width: 80px;
  height: 80px;
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
