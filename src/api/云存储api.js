import service from '@/api/request'
import {取url根入口路径} from "@/utils/utils";
const url=取url根入口路径() +"/cloudStorage/"

//{ "Page": 0,"Size": 10 }
// @Success 200 {string} json "{"success":true,"data":{},"msg":"获取成功"}"
export const GetCloudStorageList = (data) => {
  return service({
    url: url+'getList',
    method: 'post',
    data: data
  })
}


//获取上传凭证
export const GetUpToken = (data) => {
  return service({
    url: url+'getUpToken',
    method: 'post',
    data: data
  })
}



//  Del批量删除
//{ "path": [ "" ]}
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "注销成功"}"
export const Del批量删除 = (data) => {
  return service({
    url: url+'delete',
    method: 'post',
    data: data
  })
}


//  文件移动
//{ "path": [ "" ]}
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "注销成功"}"
export const 文件移动 = (data) => {
  return service({
    url: url+'moveTo',
    method: 'post',
    data: data
  })
}
export const 下载 = (data) => {
  return service({
    url: url+'download',
    method: 'post',
    data: data
  })
}

export const 获取外链 = (data) => {
  return service({
    url: url+'getDownloadUrl',
    method: 'post',
    data: data
  })
}

export const 取基础信息 = (data) => {
  return service({
    url: url+'getBaseInfo',
    method: 'post',
    data: data
  })
}
