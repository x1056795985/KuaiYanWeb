<template>
  <div class="最底层div">
    <el-form v-loading="is加载中" :inline="false" style="min-width: 80px" label-width="130px" :model="Data"
             :label-position="is移动端()?'top':'right'" ref="ruleFormRef">
      <div class="内容div">
        <el-divider content-position="left">系统</el-divider>
        <el-form-item label="系统名称" prop="系统名称" disabled="disabled">
          <el-input v-model.trim="Data.系统名称"/>
        </el-form-item>
        <el-form-item label="系统地址" prop="系统地址">
          <el-tooltip
              content="系统默认端口为18888,请输入可被外网访问域名或ip地址,会被在线支付回调使用,尾部无需/"
              placement="top-start">
            <el-input v-model.trim="Data.系统地址" placeholder="系统地址"/>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="备案号" prop="备案号" disabled="disabled">
          <el-input clearable v-model.trim="Data.备案号" placeholder="登录页底部显示,可空"/>
        </el-form-item>

        <el-form-item label="WebApiHost" prop="WebApiHost">
          <el-input clearable v-model.trim="Data.WebApiHost"
                    placeholder="127.0.0.1:18888  限制该域名可访问,空不限制,这样可以WebApi和用户Api使用不同的域名访问,"/>
        </el-form-item>

        <el-form-item label="系统开关" prop="系统开关">
          <el-radio-group v-model="Data.系统开关">
            <el-radio-button :value="true" size="" border>开启</el-radio-button>
            <el-radio-button :value="false" size="" border>关闭</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="系统关闭提示" prop="系统关闭提示">
          <el-input v-model.trim="Data.系统关闭提示" placeholder="系统关闭提示" clearable/>
        </el-form-item>
        <el-form-item label="用户API加密盐" prop="用户API加密盐">
          <el-row style="width: 100%">
            <el-col :span="18">
              <el-input clearable v-model.trim="Data.用户API加密盐"
                        placeholder="新Api名称=MD5(Api名称 + 用户API加密盐) ,正确使用,有效解决服务器山寨问题,点击右侧打开官网查看详细说明"/>
            </el-col>
            <el-col :span="2">
              <el-tooltip
                  class="box-item"
                  effect="dark"
                  content="打开官网查询详细说明"
                  placement="top"
              >
                <el-link href="https://www.fnkuaiyan.cn/%E6%8C%87%E5%8D%97/%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98.html#api%E5%90%8D%E7%A7%B0%E5%8A%A0%E5%AF%86%E6%91%98%E8%A6%81"
                         target="_blank">
                  <el-icon size="24">
                    <Link/>
                  </el-icon>
                </el-link>
              </el-tooltip>
<!--              <el-tooltip
                  class="box-item"
                  effect="dark"
                  content="生成易语言Api加密对接源码并下载,其他语言,请按照官网说明修改"
                  placement="top"
              >
                <el-link @click="on生成API加密源码SDK('E')">
                  <el-icon size="24">
                    <Download/>
                    易
                  </el-icon>
                </el-link>
              </el-tooltip>-->
            </el-col>
          </el-row>
        </el-form-item>
      </div>
      <div class="内容div">
        <el-divider content-position="left">代理中心   <el-link href="/Agent" target="_blank">/Agent</el-link></el-divider>
        <el-form-item label="代理中心开关" prop="代理中心开关">
          <el-radio-group v-model="Data.代理中心开关">
            <el-radio-button :value="true" size="" border>开启</el-radio-button>
            <el-radio-button :value="false" size="" border>关闭</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="代理中心关闭提示" prop="代理中心关闭提示">
          <el-input v-model.trim="Data.代理中心关闭提示" placeholder="代理中心关闭提示"/>
        </el-form-item>
      </div>
      <div class="内容div">
        <el-divider content-position="left">其他(真诚等待您的建议+.0)</el-divider>
        <!--        <el-form-item label="用户中心开关" prop="用户中心开关">
                  <el-radio-group v-model="Data.用户中心开关">
                    <el-radio-button :value="true" size="" border>开启</el-radio-button>
                    <el-radio-button :value="false" size="" border>关闭</el-radio-button>
                  </el-radio-group>
                </el-form-item>-->


        <div style="text-align:center">
          <el-button style="width: 15vh; " type="primary" @click="on确定按钮被点击(ruleFormRef)">保存</el-button>
        </div>

      </div>
    </el-form>
  </div>
</template>

<script setup lang='ts'>

import {onBeforeUnmount, onMounted, ref} from "vue";
import {GetInfo系统设置, SaveInfo系统设置, S生成API加密源码SDK,} from "@/api/系统设置api.js";
import {ElMessage, FormInstance} from 'element-plus'
import {is移动端} from "@/utils/utils";


const Data = ref({
  "系统名称": "后台管理系统111",
  "备案号": "后台管理系统111",
  "系统地址": "https://www.baidu.com",
  "WebApiHost": "",
  "管理员后台Host": "",
  "系统开关": true,
  "用户API加密盐": "",
  "系统关闭提示": "系统已经关闭使用",
  "用户中心开关": true,
  "代理中心开关": true,
  "代理中心关闭提示": "www.baidu.com",
  "代理后台Host": ""
})

const ruleFormRef = ref<FormInstance>()
const is加载中 = ref(false)
const onGetList = async () => {
  is加载中.value = true
  const res = await GetInfo系统设置({})
  Data.value = res.data
  is加载中.value = false
}


onMounted(async () => {
  await onGetList()
})

const 校验系统地址 = (): boolean => {
  if (Data.value.系统地址.endsWith("/")) {
    ElMessage.error("系统地址尾部不用 / 斜杠")
    return false
  }
  return true
};


const on确定按钮被点击 = async (formEl: FormInstance | undefined) => {
  if (!formEl || !校验系统地址()) return
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
  is加载中.value = true
  返回 = await SaveInfo系统设置(Data.value);
  is加载中.value = false
  console.log(返回)
  if (返回.code == 10000) {
ElMessage.success(返回.msg)
  }
}

const on生成API加密源码SDK = async (Type: string) => {

  if (Data.value.用户API加密盐 === "") {
    ElMessage.error("API加密盐不能为空")
    return   //如果是假直接返回
  }

  let 返回;
  is加载中.value = true
  返回 = await S生成API加密源码SDK({Type: Type, 用户API加密盐: Data.value.用户API加密盐});
  is加载中.value = false
  console.log(返回)
  if (返回.code == 10000) {
ElMessage.success(返回.msg)
    const decodedData = atob(返回.data.Base64Data);
    const byteArray = new Uint8Array(decodedData.length);
    for (let i = 0; i < decodedData.length; i++) {
      byteArray[i] = decodedData.charCodeAt(i);
    }
    downloadFile(byteArray, 返回.data.Name);
  }
}
const downloadFile = (data, filename) => {
  const blob = new Blob([data]);
  if (window.navigator.msSaveOrOpenBlob) {
    // For IE
    window.navigator.msSaveOrOpenBlob(blob, filename);
  } else {
    // For other browsers
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
};


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
