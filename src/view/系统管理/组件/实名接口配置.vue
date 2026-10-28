<template>
  <div class="最底层div">
    <el-form v-loading="is加载中" :inline="false" style="min-width: 80px" label-width="130px" :model="Data"
             :label-position="is移动端()?'top':'right'" ref="ruleFormRef">

      <div class="内容div">
        <el-form-item label="当前选择">
          <el-select v-model="Data.当前选择" class="m-2" placeholder="Select" size="">
            <el-option label="未开启" :value="0"/>
            <el-option label="腾讯云身份二要素核验" :value="1"/>
          </el-select>
        </el-form-item>

        <div class="内容div" v-if="Data.当前选择===0">
          <el-divider content-position="left">未开启</el-divider>
          <el-form-item label="说明">
            <el-text>未开启实名认证功能,用户端(账号模式应用)不显示实名认证入口</el-text>
          </el-form-item>
        </div>

        <div class="内容div" v-if="Data.当前选择===1">
          <el-divider content-position="left">腾讯云身份二要素核验
            <el-link style="margin-left: 8px" href="https://www.fnkuaiyan.cn/%E6%8C%87%E5%8D%97/%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98.html#%E5%AE%9E%E5%90%8D%E8%AE%A4%E8%AF%81%E9%85%8D%E7%BD%AE%E5%8F%82%E6%95%B0%E8%8E%B7%E5%8F%96%E6%96%B9%E6%B3%95" target="_blank">教程</el-link>
          </el-divider>
          <el-form-item label="SECRET_ID">
            <el-input v-model.trim="Data.TX云实名.SECRET_ID" placeholder="腾讯云账户SECRET_ID"/>
          </el-form-item>
          <el-form-item label="SECRET_KEY">
            <el-input v-model.trim="Data.TX云实名.SECRET_KEY" type="password" show-password placeholder="腾讯云账户SECRET_KEY"/>
          </el-form-item>
          <el-form-item label="说明">
            <el-text>使用腾讯云人脸核身-身份信息核验(IdCardVerification)接口,核验姓名与身份证号一致性,按次计费,请确认已开通人脸核身服务</el-text>
          </el-form-item>
        </div>

        <div style="text-align:center">
          <el-button style="width: 15vh; " type="primary" @click="on确定按钮被点击(ruleFormRef)">保存</el-button>
        </div>
      </div>

    </el-form>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, ref} from "vue";
import {GetInfoRealName, SaveInfoRealName} from "@/api/系统设置api.js";
import {ElMessage, FormInstance} from 'element-plus'
import {is移动端} from "@/utils/utils";

const Data = ref({
  "当前选择": 0,
  "TX云实名": {
    "SECRET_ID": "",
    "SECRET_KEY": ""
  }
})
const ruleFormRef = ref<FormInstance>()
const is加载中 = ref(false)

const onGetList = async () => {
  is加载中.value = true
  const res = await GetInfoRealName({})
  Data.value = res.data
  is加载中.value = false
}

onMounted(async () => {
  await onGetList()
})

const on确定按钮被点击 = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  let 表单验证结果 = await formEl.validate((valid, fields) => {
    if (!valid) {
      console.log('参数验证失败', fields)
    }
  })
  if (!表单验证结果) return   //如果是假直接返回
  let 返回;
  is加载中.value = true
  返回 = await SaveInfoRealName(Data.value);
  is加载中.value = false
  if (返回.code == 10000) {
    ElMessage.success(返回.msg)
  }
}
</script>

<style scoped lang="scss">

.最底层div {
  padding: 12px 16px;
  margin: 0 2px 10px;
  background: #f0f2f5;
}

.内容div {
  min-height: 20%;
  padding: 12px 16px;
  margin: 0 2px 10px;
  background: #ffffff;
}
</style>
