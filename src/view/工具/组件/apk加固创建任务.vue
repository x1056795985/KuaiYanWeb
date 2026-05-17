<template>
  <el-dialog v-model="is显示" title="APK加固创建任务"  :width="is移动端()?'90%':'50%'" @close="on关闭">
    <el-form label-width="70px">
      <el-form-item label="选择APK">
        <el-upload
            class="upload-demo"
            drag
            multiple
            ref="upload"
            :before-upload="beforeAvatarUpload"
            :http-request="on自定义上传方法"
            :limit="1"
            :on-exceed="on上传数量超限制"
            :on-change="on文件状态被改变"
            :on-success="on上传成功"
            :auto-upload="false"
            accept="application/vnd.android.package-archive"
            :data="上传凭证"
            style="width: 100%;"
        >
          <el-icon class="el-icon--upload">
            <upload-filled/>
          </el-icon>
          <div class="el-upload__text">
            将apk文件拖放到此处或<em>点击上传</em>最大100Mb
          </div>
        </el-upload>
      </el-form-item>
      <el-form-item label="选择应用" prop="">
        <el-select v-model.number="formModel.AppId" clear placeholder="请选择应用" filterable style="width: 100%;">
          <el-option v-for="(item,index) in 数组AppId_Name" :key="item.appId"
                     :label="item.appName+'('+item.appId.toString()+')'" :value="item.appId"/>
        </el-select>
      </el-form-item>
      <!-- ... existing code ... -->
      <el-form-item label="签名方式">
        <el-select v-model="formModel.签名方式" placeholder="请选择签名方式" style="width: 100%;">
          <el-option label="不签名" :value="1"/>
          <el-option label="随机签名" :value="2"/>
        </el-select>
      </el-form-item>
      <el-form-item label="Activity">
        <el-input v-model="formModel.Activity" placeholder="指定添加到的窗口,可空,默认首屏" style="width: 100%;">
        </el-input>
      </el-form-item>


      <!-- ... existing code ... -->
    </el-form>
    <div>

        <el-link href="https://www.fnkuaiyan.cn/%E6%8C%87%E5%8D%97/Apk%E5%8A%A0%E9%AA%8C%E8%AF%81.html"
                 target="_blank">
          常见导致加验证后闪退问题
          <el-icon size="24">
            <Link/>
          </el-icon>
        </el-link>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="on创建任务"
                   :disabled="上传凭证.key!=''"
                   :loading="上传凭证.key!=''"
        >开始加验证</el-button>
        <el-button type="info" @click="is显示=false">关 闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {UploadFilled} from '@element-plus/icons-vue'
import {onMounted, ref} from "vue";

import {GetAppIdNameList} from "@/api/应用列表api";
import { GetUploadToken, CreateApkAddFNKYTask} from "@/api/Apk加验证";
import {ElMessage, genFileId, UploadInstance, UploadProps, UploadRawFile} from "element-plus";
import {UploadFile, UploadFiles} from "element-plus/es/components/upload/src/upload";
import {is移动端} from "@/utils/utils";
import {W文件上传凭证} from "@/view/工具/组件/strct";
import axios from "axios";

const is显示 = ref(true)
const is重新读取 = ref(false)

const formModel = ref({
  fileName: "",
  签名方式: 2,
  AppId: 10000,
  Activity: "",
})

const emit = defineEmits(['on对话框详细信息关闭'])

onMounted(() => {
  is显示.value = true
  onGetAppIdNameList()
})
const MapAppId_Name = ref({})
const 数组AppId_Name = ref([{
  "appId": 10000,
  "appName": ""
}])
const onGetAppIdNameList = async () => {
  let res = await GetAppIdNameList()
  数组AppId_Name.value = res.data.array
  MapAppId_Name.value = res.data.map
  console.log("没有搜索条件的应用,修改第一个,现在搜索条件的值为:" + res.data.map[formModel.value.AppId.toString()])
  if (res.data.map[formModel.value.AppId.toString()] == null || formModel.value.AppId <= 10000) {
    formModel.value.AppId = 数组AppId_Name.value[0].Appid
  }
}
const on上传成功 = async (response: any, uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  if (上传凭证.value.key=="") return //防抖, 自定义上传,on上传成功会被执行两次
//{"name":"火山程序.apk","percentage":100,"status":"success","size":220117,"raw":{"uid":1737344416100},"uid":1737444446100,"response":{"hash":"Fnf2Aol-0k5FX9FtK7PJ0A7MX-AW","key":"fnkuaiyan/aaaaaa/火山程序.apk"}}

  let json = formModel.value // [!code ++]
  json.uploadFile=uploadFile
  json.Path=上传凭证.value.key
  上传凭证.value.key=""
  json.fileName=uploadFile.name
  let res = await CreateApkAddFNKYTask(json)
  console.log(res)
  if (res.code == 10000) {
    is重新读取.value=true
    is显示.value=false
  }

}

const upload = ref<UploadInstance>()

const on上传数量超限制: UploadProps['onExceed'] = (files) => {
  upload.value!.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  upload.value!.handleStart(file) //更换当前上传的为新文件
}

const on文件状态被改变: UploadProps['onChange'] = (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  if (uploadFile.status === 'ready') {
    if (!uploadFile?.raw) {
      return false;
    }
    const isApk = uploadFile.raw.type === 'application/vnd.android.package-archive';
    const isLt100M = uploadFile?.raw.size / 1024 / 1024 < 100;
    if (!isApk) {
      ElMessage.error('只能上传 APK 文件!');
      upload.value!.clearFiles(); // 清除不符合条件的文件
    }
    if (!isLt100M) {
      ElMessage.error('上传 APK 文件大小不能超过 100MB!');
      upload.value!.clearFiles(); // 清除不符合条件的文件
    }
  }
}


const on关闭 = () => {
  // console.info("关闭")
  emit('on对话框详细信息关闭', is重新读取.value)
}

const 上传凭证 = ref<W文件上传凭证>({
  Path: "",
  Type: 0,      //1 通用s3兼容协议  2 七牛云
  Url: "",
  UpToken: "",
  token: "",
  key: ""
})
//上传前hook
const beforeAvatarUpload = async (file) => {
  const isApk = file.type === 'application/vnd.android.package-archive';
  const isLt100M = file.size / 1024 / 1024 < 100;

  if (!isApk) {
    ElMessage.error('只能上传 APK 文件!');
    return false
  }
  if (!isLt100M) {
    ElMessage.error('上传 APK 文件大小不能超过 100MB!');
    return false
  }
  const ret = await GetUploadToken({"Path": file.name});
  console.info(ret)
  if (ret.code != 10000) {
    return false
  }
  switch (ret.data.Type) {
    case 1:
      // S3协议应仅使用预签名URL
      上传凭证.value = {
        Url: ret.data.Url,
        // 清空其他非必要字段
        Path: "",
        Type: 1,
        UpToken: "",
        token: "",
        key: ret.data.Path
      }
      break;
    case 2:
      上传凭证.value.Url = ret.data.Url
      上传凭证.value.Type = 2
      上传凭证.value.UpToken = ret.data.UpToken
      上传凭证.value.key = ret.data.Path
      上传凭证.value.token = ret.data.UpToken
      break;
  }
}
const on自定义上传方法 = async (options) => {
  const { file, onProgress, onSuccess, onError } = options; // 解构进度回调
  const formData = new window.FormData() // 显式指定使用浏览器原生对象

  try {
    // S3协议上传
    if(上传凭证.value.Type === 1){
      await axios.put(上传凭证.value.Url, file, {
        headers: {
          'Content-Type': file.type
        },
        onUploadProgress: (progressEvent) => {
          // 计算并触发进度更新
          const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress({ percent }); // 关键：触发进度条更新
        }
      });
      onSuccess({ code: 10000 }); // 触发成功回调
      return;
    }

    // 七牛云上传
    if(上传凭证.value.Type === 2){
      formData.append('file', file);
      formData.append('token', 上传凭证.value.token); // 新增
      formData.append('key', 上传凭证.value.key); // 新增
      await axios.post(上传凭证.value.Url, formData, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress({ percent });
        }
      });
      onSuccess({ code: 10000 });
      return;
    }
  } catch (error) {
    onError(error); // 触发错误回调
  }
}


const on创建任务 = () => {
  upload.value!.submit()
}

</script>

<style scoped lang="scss">
</style>
