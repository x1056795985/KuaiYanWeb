<template>
  <div class="最底层div">
    <div class="内容div">
      <el-divider content-position="left">提现设置</el-divider>
      <el-form v-loading="loading" :model="config" label-width="180px" class="setting-form">
        <el-form-item label="启用代理提现">
          <el-switch v-model="config.enable" />
        </el-form-item>
        <el-form-item label="最小提现金额">
          <el-input-number v-model="config.minAmount" :precision="2" :min="0" />
        </el-form-item>
        <el-form-item label="最大提现金额">
          <el-input-number v-model="config.maxAmount" :precision="2" :min="0" />
          <el-text class="hint">填 0 表示不限制</el-text>
        </el-form-item>
        <el-form-item label="提现间隔秒数">
          <el-input-number v-model="config.intervalSeconds" :min="0" />
        </el-form-item>
        <el-form-item label="允许代理取消待审核">
          <el-switch v-model="config.allowUserCancel" />
        </el-form-item>
        <el-form-item label="必须使用收款码">
          <el-switch v-model="config.requirePayeeQr" />
        </el-form-item>
        <el-form-item label="允许填写收款账号">
          <el-switch v-model="config.allowPayeeAccount" />
        </el-form-item>
        <el-form-item label="启用风险标签">
          <el-switch v-model="config.riskEnable" />
        </el-form-item>
        <el-form-item label="凭证上传token有效秒数">
          <el-input-number v-model="config.voucherTokenSeconds" :min="60" />
        </el-form-item>
        <el-form-item label="收款码最大MB">
          <el-input-number v-model="config.payeeQrMaxSizeMb" :min="1" />
        </el-form-item>
        <el-form-item label="付款凭证最大MB">
          <el-input-number v-model="config.voucherMaxSizeMb" :min="1" />
        </el-form-item>
      </el-form>
    </div>
    <div class="内容div">
    <div style="text-align:center">
      <el-button style="width: 15vh;" icon="Check" type="primary" @click="saveConfig">保存</el-button>
    </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Check } from '@element-plus/icons-vue'
import { withdrawApi } from '@/api/提现审核api.js'

const loading = ref(false)
const config = reactive({
  enable: false,
  minAmount: 10,
  maxAmount: 5000,
  intervalSeconds: 86400,
  allowUserCancel: true,
  requirePayeeQr: false,
  allowPayeeAccount: true,
  voucherTokenSeconds: 300,
  riskEnable: true,
  payeeQrMaxSizeMb: 5,
  voucherMaxSizeMb: 10
})

const loadConfig = async () => {
  loading.value = true
  const res = await withdrawApi.getConfig()
  loading.value = false
  if (res.code === 10000) Object.assign(config, res.data || {})
}

const saveConfig = async () => {
  const res = await withdrawApi.saveConfig(config)
  if (res.code === 10000) {
    ElMessage.success(res.msg)
    loadConfig()
  }
}

onMounted(loadConfig)
</script>

<style scoped lang="scss">
.最底层div {
  min-height: calc(100vh - 200px);
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
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: auto;
}
.page-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}
.setting-form {
  max-width: 720px;
  padding-top: 4px;
}
.el-form-item {
  padding: 0;
  margin: 0 10px 16px 0;
}
.hint {
  margin-left: 12px;
}
</style>
