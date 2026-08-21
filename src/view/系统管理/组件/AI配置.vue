<template>
  <div class="最底层div">
    <el-form v-loading="is加载中" :inline="false" label-width="130px" :model="Data"
             :label-position="is移动端()?'top':'right'" ref="ruleFormRef">
      <div class="内容div">
        <el-divider content-position="left">AI 接口配置</el-divider>
        <el-form-item label="API地址" prop="apiUrl">
          <el-input v-model.trim="Data.apiUrl" placeholder="OpenAI兼容接口地址"/>
        </el-form-item>
        <el-form-item label="API Key" prop="apiKey">
          <el-input v-model.trim="Data.apiKey" type="password" show-password placeholder="输入API Key"/>
        </el-form-item>
        <el-form-item label="模型" prop="model">
          <el-input v-model.trim="Data.model" placeholder="如 deepseek-chat"/>
        </el-form-item>
      </div>
      <div class="内容div">
        <div style="text-align:center">
          <el-button style="width: 15vh; " type="primary" @click="on确定按钮被点击(ruleFormRef)">保存</el-button>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, ref} from "vue";
import {getAiConfig, saveAiConfig} from "@/api/ai.js";
import {ElMessage, FormInstance} from 'element-plus'
import {is移动端} from "@/utils/utils";

const Data = ref({
  apiUrl: '',
  apiKey: '',
  model: '',
  systemPrompt: '',
})
const ruleFormRef = ref<FormInstance>()
const is加载中 = ref(false)

const onGetList = async () => {
  is加载中.value = true
  const config = await getAiConfig()
  Data.value = config
  is加载中.value = false
}

onMounted(async () => {
  await onGetList()
})

const on确定按钮被点击 = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (!valid) {
      console.log('参数验证失败', fields)
    } else {
      console.log('参数验证通过')
    }
  })
  is加载中.value = true
  const 返回 = await saveAiConfig(Data.value)
  is加载中.value = false
  console.log(返回)
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

.el-form-item {
  padding: 0;
  margin: 0 15px 8px 0;
}
</style>
