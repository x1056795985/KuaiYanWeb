import service from '@/api/request'

import {取url根入口路径} from "@/utils/utils";
const url=取url根入口路径() +"/exeTools/"
export const GetList = (data) => {
  return service({
    url: url+'getList',
    method: 'post',
    data: data
  })
}


//  获取上传凭证
//{"Path": "aa/aa.apk"}
export const GetUploadToken = (data) => {
  return service({
    url:  url+'getUploadToken',
    method: 'post',
    data: data
  })
}


//  创建apk加验证任务
//{"Path": "aa/aa.apk"}
export const CreateExeAddFNKYTask = (data) => {
  return service({
    url:  url+'createExeAddFNKYTask',
    method: 'post',
    data: data
  })
}


export const GetTaskIdStatus = () => {
  return service({
    url:  url+'getTaskIdStatus',
    method: 'post'
  })
}

export const GetUiList = () => {
  return service({
    url:  url+'getUiList',
    method: 'post'
  })
}
