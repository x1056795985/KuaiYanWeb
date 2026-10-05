<template>
  <el-dialog v-model="is显示"
             :title="Props.id === '' ? '新增网关' : '修改网关'"
             width="620px"
             :close-on-click-modal="false"
             @closed="on对话框已关闭">
    <el-form :rules="on表单校验" :model="data" label-width="90px" ref="ruleFormRef">
      <el-form-item label="网关名称" prop="Name">
        <el-input v-model.trim="data.Name" placeholder="如:短信系统" maxlength="100"/>
      </el-form-item>
      <el-form-item label="业务Url" prop="Url">
        <el-input v-model.trim="data.Url" placeholder="http://127.0.0.1:18899" maxlength="255"/>
      </el-form-item>
      <el-form-item label="状态">
        <el-radio-group v-model="data.Status">
          <el-radio :label="1">启用</el-radio>
          <el-radio :label="2">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="响应超时">
        <el-input-number v-model="data.TimeoutSec" :min="1" :max="600"/>
        <span style="margin-left: 8px; color: #909399; font-size: 12px">秒,只限制到业务响应头,流式响应不受限</span>
      </el-form-item>
      <el-form-item label="Secret" prop="Secret">
        <el-input v-model.trim="data.Secret" type="textarea" :rows="2"
                  :placeholder="'可手动修改或点击右侧随机生成(8~128位)'">
          <template #append>
            <el-button @click="on随机生成">随机生成</el-button>
          </template>
        </el-input>
        <div style="font-size: 12px; color: #909399; line-height: 1.5">
          每个网关独立密钥,严禁多网关共用;修改后请同步更新业务服务器的验签密钥
        </div>
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="data.Remark" type="textarea" :rows="2" maxlength="255" placeholder="备注"/>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="is显示 = false">取 消</el-button>
        <el-button type="primary" @click="on确定按钮被点击">确 定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import {ElMessage} from "element-plus";
import {New, SaveInfo, GetInfo} from "@/api/网关转发api.js";

const Props = defineProps({
  id: {
    type: String,
    default: ""
  },
})
const emit = defineEmits(['on对话框详细信息关闭'])

//父页面用 v-if 挂载本组件,挂载即打开;关闭动画结束后 @closed 通知父页面销毁
const is显示 = ref(true)
const is重新读取 = ref(false)
const ruleFormRef = ref()

//生成64位hex随机密钥
const 生成随机密钥文本 = () => {
  const 局_字节 = new Uint8Array(32)
  crypto.getRandomValues(局_字节)
  return Array.from(局_字节).map(b => b.toString(16).padStart(2, '0')).join('')
}

//新建时默认自动生成一个;编辑时会被详情回显覆盖
const data = ref({
  Id: 0, Name: "", Url: "", Status: 1, TimeoutSec: 60, Remark: "",
  Secret: 生成随机密钥文本()
})

const on表单校验 = ref({
  Name: [{required: true, message: '请输入网关名称', trigger: 'blur'}],
  Url: [{
    required: true,
    pattern: /^https?:\/\/\S+$/,
    message: '必须是http://或https://开头的业务地址',
    trigger: 'blur'
  }],
})

const on随机生成 = () => {
  data.value.Secret = 生成随机密钥文本()
}

const on确定按钮被点击 = async () => {
  if (!ruleFormRef.value) return
  await ruleFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    if (data.value.Secret && (data.value.Secret.length < 8 || data.value.Secret.length > 128)) {
      ElMessage.error("Secret长度必须在8到128位之间")
      return
    }
    if (Props.id === '') {
      const res = await New({
        Name: data.value.Name,
        Url: data.value.Url,
        Secret: data.value.Secret,
        Status: data.value.Status,
        TimeoutSec: data.value.TimeoutSec,
        Remark: data.value.Remark,
      })
      if (res.code == 10000) {
        ElMessage.success(res.msg + (data.value.Secret ? '' : ',Secret已自动生成,可在编辑中查看'))
        is重新读取.value = true
        is显示.value = false
      } else {
        ElMessage.error(res.msg)
      }
    } else {
      const res = await SaveInfo({
        Id: Number(Props.id),
        Name: data.value.Name,
        Url: data.value.Url,
        Secret: data.value.Secret,
        Status: data.value.Status,
        TimeoutSec: data.value.TimeoutSec,
        Remark: data.value.Remark,
      })
      if (res.code == 10000) {
        ElMessage.success(res.msg)
        is重新读取.value = true
        is显示.value = false
      } else {
        ElMessage.error(res.msg)
      }
    }
  })
}

//回显:编辑时读详情,新增用默认值
const on对话框被打开 = async () => {
  if (Props.id !== '') {
    const res = await GetInfo({Id: Number(Props.id)})
    if (res.code == 10000 && res.data) {
      data.value = res.data
    }
  }
}
on对话框被打开()
</script>
