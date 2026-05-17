import service from '@/api/request'

import {取url根入口路径} from "@/utils/utils";
const url=取url根入口路径() +"/app/"
// 分页获取App信息列表
//{ "Page": 0,"Size": 10 }
// @Success 200 {string} json "{"success":true,"data":{},"msg":"获取成功"}"
export const GetAppList = (data) => {
  return service({
    url: url+'getList',
    method: 'post',
    data: data
  })
}

//  Del批量删除App
//{ "id": [ 5 ]}
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "注销成功"}"
export const Del批量删除App = (data) => {
  return service({
    url: url+'delete',
    method: 'post',
    data: data
  })
}

//  GetApp详细信息
//{"Id": 1}
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "获取成功"}"
export const GetApp详细信息 = (data) => {
  return service({
    url:  url+'getInfo',
    method: 'post',
    data: data
  })
}

//  SaveApp详细信息
//...
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "获取成功"}"
export const  SaveApp信息 = (data) => {
  return service({
    url:  url+'saveInfo',
    method: 'post',
    data: data
  })
}

//  NewApp信息
//...
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "添加成功"}"
export const  NewApp信息 = (data) => {
  return service({
    url: url+'new',
    method: 'post',
    data: data
  })
}
//  GetAppIdMax
// {
//   "code": 0,
//     "data": {
//   "AppIdMax": 10003
// },
//   "msg": "获取成功"
// }
export const  GetAppIdMax = () => {
  return service({
    url: url+'getAppIdMax',
    method: 'get',
  })
}

//  GetAppIdNameList
/*{
  "code": 0,
    "data": {
  "10001": "测试应用"
},
  "msg": "获取成功"
}*/
export const  GetAppIdNameList = () => {
  return service({
    url: url+'getAppIdNameList',
    method: 'get',
  })
}
export const  Get全部用户APi = () => {
  return service({
    url: url+'getAllUserApi',
    method: 'get',
  })
}

export const  Get全部WebAPi = () => {
  return service({
    url: url+'getAllWebApi',
    method: 'get',
  })
}

//设置 排序 权重
export const  SetAppSort = (data) => {
  return service({
    url:  url+'setAppSort',
    method: 'post',
    data: data
  })
}
