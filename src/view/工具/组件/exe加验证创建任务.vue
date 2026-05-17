<template>
  <el-dialog v-model="is显示" title="EXE加验证创建任务"  :width="is移动端()?'90%':'50%'" @close="on关闭" top="2%" >
    <el-form label-width="70px">
      <el-form-item label="选择EXE">
        <el-upload
            class="upload-demo"
            drag
            multiple
            ref="upload"
            :before-upload="beforeAvatarUpload"
            :limit="1"
            :on-exceed="on上传数量超限制"
            :on-change="on文件状态被改变"
            :on-success="on上传成功"
            :auto-upload="false"
            accept=".exe"
            :data="上传凭证"
            :http-request="on自定义上传方法"
            style="width: 100%;"
        >
          <div>
          <el-icon class="el-icon--upload">
            <upload-filled/>
          </el-icon>
          <div class="el-upload__text">
            将exe文件拖放到此处或(暂时只支持32位程序)<em>点击上传</em>最大20Mb
          </div>
          </div>
        </el-upload>
      </el-form-item>
      <el-form-item label="选择应用" prop="">
        <el-select v-model.number="FormData.AppId" clear placeholder="请选择应用" filterable style="width: 100%;">
          <el-option v-for="(item,index) in 数组AppId_Name" :key="item.appId"
                     :label="item.appName+'('+item.appId.toString()+')'" :value="item.appId"/>
        </el-select>
      </el-form-item>
      <!-- ... existing code ... -->
      <el-form-item label="安全强度">
        <div class="custom-style">
          <el-segmented v-model="安全强度" :options="安全强度options" @change="on安全强度被点击" />
        </div>
        <div   style="height: 20px;width: 100%" ></div>
        <div>
          <el-checkbox-group v-model="安全项目选中" size="small"   >
            <el-tooltip content="必选,高强度VMP一机一码保护,根服务器校验防山寨服务器,不可更换飞鸟快验账号"
                        effect="dark"
                        placement="left">
              <el-checkbox   label="VMP一机一码" value="VMP一机一码" border disabled  />
            </el-tooltip>
            <el-checkbox  v-for="item in 安全项目列表" :key="item" :label="item" :value="item" border   />
          </el-checkbox-group>
        </div>

      </el-form-item>
      <el-form-item label="UI选择">
          <el-radio-group v-model="FormData.Ui" @change ="预览图片url=[UiId取Url(FormData.Ui)]">
            <el-radio v-for="图片 in Props.ui列表" :value="图片.id" border>{{图片.label}}</el-radio>
          </el-radio-group>
      </el-form-item>
      <el-form-item label="UI预览">
          <el-image style="width: 100% ;height: 20vh" :src="UiId取Url(FormData.Ui)" fit="contain"
                    :preview-src-list="预览图片url"
                    show-progress
                    :hide-on-click-modal="true"
                    :initial-index="0">
            <template #error>
              <div class="image-slot">
                <el-icon><picture /></el-icon>
              </div>
            </template>
          </el-image>
      </el-form-item>
    </el-form>

    <div>
        <el-link href="https://www.fnkuaiyan.cn/%E6%8C%87%E5%8D%97/exe%E5%8A%A0%E9%AA%8C%E8%AF%81.html"
                 target="_blank">
          常见问题
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
import {computed, onMounted, ref} from "vue";

import {GetAppIdNameList} from "@/api/应用列表api";
import { GetUploadToken, CreateExeAddFNKYTask} from "@/api/Exe加验证";
import {ElMessage, genFileId, UploadInstance, UploadProps, UploadRawFile} from "element-plus";
import {UploadFile, UploadFiles} from "element-plus/es/components/upload/src/upload";
import {is移动端} from "@/utils/utils";
import {UiList, W文件上传凭证} from "./strct";
import axios from "axios";
const is显示 = ref(true)
const is重新读取 = ref(false)

const FormData = ref({
  fileName: "",
  AppId: 10000,
  Ui: 1,
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
  console.log("没有搜索条件的应用,修改第一个,现在搜索条件的值为:" + res.data.map[FormData.value.AppId.toString()])
  if (res.data.map[FormData.value.AppId.toString()] == null || FormData.value.AppId <= 10000) {
    FormData.value.AppId = 数组AppId_Name.value[0].Appid
  }
}

const on上传成功 = async (response: any, uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  if (上传凭证.value.key=="") return //防抖, 自定义上传,on上传成功会被执行两次
//{"name":"火山程序.apk","percentage":100,"status":"success","size":220117,"raw":{"uid":1737344416100},"uid":1737444446100,"response":{"hash":"Fnf2Aol-0k5FX9FtK7PJ0A7MX-AW","key":"fnkuaiyan/aaaaaa/火山程序.apk"}}

  let json = FormData.value
  json.Path=上传凭证.value.key  //防抖, 自定义上传,on上传成功会被执行两次
  上传凭证.value.key=""
  json.uploadFile=uploadFile
  json.fileName=uploadFile.name
  //循环 安全项目列表 判断 是否在 安全项目选中  如果存在,则值为 true
  for (let i = 0; i < 安全项目列表.length; i++){
    json[安全项目列表[i]]=安全项目选中.value.indexOf(安全项目列表[i])!=-1
  }
  let res = await CreateExeAddFNKYTask(json)
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

    const isExe = uploadFile.name.toLowerCase().endsWith('.exe');
    const isLt20M = uploadFile?.raw.size / 1024 / 1024 < 20;
    if (!isExe) {
      ElMessage.error('只能上传exe文件!');
      upload.value!.clearFiles(); // 清除不符合条件的文件
    }
    if (!isLt20M) {
      ElMessage.error('上传文件大小不能超过 20MB!');
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

  const isExe = file.name.toLowerCase().endsWith('.exe');
  const isLt20M = file.size / 1024 / 1024 < 20;

  if (!isExe) {
    ElMessage.error('只能上传 exe文件!');
    return false
  }
  if (!isLt20M) {
    ElMessage.error('上传 exe 文件大小不能超过 20MB!');
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


const 安全强度map = {
  '高兼容': ["VMP一机一码","压缩文件"],
  '平衡': ["VMP一机一码","压缩文件", "移除重定位信息", "移除调试信息"],
  '高安全': ["VMP一机一码","检测调试器", "内存保护", "导入表保护", "资源保护", "压缩文件", "寄存器保护", "常量保护", "虚拟化工具", "移除重定位信息", "移除调试信息"],
  '自定义': ["VMP一机一码"]
}

//为计算属性,安全项目选中  等于安全强度map的键值,则返回键名
const 安全强度 = computed({
  get: () => {
    // 遍历安全强度map，找到匹配的键名
    for (const key in 安全强度map) {
      if (JSON.stringify(安全强度map[key].sort()) === JSON.stringify(安全项目选中.value.sort())) {
        if (key=="自定义"){
          安全强度选中颜色.value="#909399"
        }else if (key=="高兼容"){
          安全强度选中颜色.value="#67C23A"
        }else if (key=="平衡"){
          安全强度选中颜色.value="#409EFF"
        }else if (key=="高安全"){
          安全强度选中颜色.value="#E6A23C"
        }
        return key;
      }
    }
    // 如果没有匹配的，返回 "自定义"
    安全强度选中颜色.value="#ebeef5"
    return "自定义";
  },
  set: (value) => {
    // 根据选择的安全强度，更新安全项目选中
    if (value in 安全强度map) {
      安全项目选中.value = 安全强度map[value];
    } else {
      安全项目选中.value = ["VMP一机一码"]; // 默认值
    }
  }
});



const 安全强度选中颜色 = ref("#efef00")
const 安全强度options = ['高兼容', '平衡', '高安全', '自定义']

const on安全强度被点击 = (value) => {
  安全强度.value = value; // 直接更新计算属性
};

const 安全项目选中=ref(["VMP一机一码","压缩文件", "移除重定位信息", "移除调试信息"])
const 安全项目列表 =  ["检测调试器", "内存保护", "导入表保护", "资源保护", "压缩文件", "寄存器保护", "常量保护", "虚拟化工具", "移除重定位信息", "移除调试信息"]

const Props = defineProps({
  ui列表: {
    type: Array as () => UiList[], // 正确写法
    default: () => [],            // 建议给数组默认值用工厂函数
  }
})

const UiId取Url = (id: number) => {
  for (let i = 0; i < Props.ui列表.length; i++) {
    if (Props.ui列表[i].id == id) {
      return Props.ui列表[i].url
    }
  }
  return ""  //默认返回第一个
}


const 预览图片url = ref<string[]>([])

</script>


<style scoped lang="scss">
.custom-style .el-segmented {
  --el-segmented-item-selected-color: var(--el-text-color-primary);
  --el-border-radius-base: 16px;
}
.custom-style :deep(.el-segmented) {  /* 添加作用域穿透 */
  --el-segmented-item-selected-bg-color: v-bind(安全强度选中颜色); /* 使用Vue3的v-bind绑定 */
  /* 其他样式保持不变 */
}

/* 在style部分添加 */
.el-button.is-loading:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
