import service from '@/api/request'

import {取url根入口路径} from "@/utils/utils";
const url=取url根入口路径() +"/ka/"
// 分页获取Ka信息列表
//{ "Page": 0,"Size": 10 }
// @Success 200 {string} json "{"success":true,"data":{},"msg":"获取成功"}"
export const GetKaList = (data) => {
  return service({
    url: url+'getList',
    method: 'post',
    data: data
  })
}

//  Del批量维护_删除
export const Del批量删除Ka = (data) => {
  return service({
    url: url+'delete',
    method: 'post',
    data: data
  })
}
//  Del批量删除Ka
//{ "id": [ 5 ]}
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "注销成功"}"
export const Del批量维护_删除 = (data) => {
  return service({
    url: url+'deleteBatch',
    method: 'post',
    data: data
  })
}

//  Del批量追回Ka
//{ "id": [ 5 ]}
export const Del批量追回Ka = (data) => {
  return service({
    url: url+'recover',
    method: 'post',
    data: data
  })
}

//  GetKa详细信息
//{"Id": 1}
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "获取成功"}"
export const GetKa详细信息 = (data) => {
  return service({
    url:  url+'getInfo',
    method: 'post',
    data: data
  })
}

//  SaveKa详细信息
//...
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "获取成功"}"
export const  SaveKa信息 = (data) => {
  return service({
    url:  url+'saveInfo',
    method: 'post',
    data: data
  })
}

//  NewKa信息
//...
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "添加成功"}"
export const  NewKa信息 = (data) => {
  return service({
    url: url+'new',
    method: 'post',
    data: data
  })
}

//  NewKa信息
//...
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "添加成功"}"
export const  NewKa信息_指定卡号 = (data) => {
  return service({
    url: url+'batchKaNameNew',
    method: 'post',
    data: data
  })
}
//  SetStatus
//...
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "修改成"}"
export const  SetStatus = (data) => {
  return service({
    url: url+'setStatus',
    method: 'post',
    data: data
  })
}

//  SetAdminNote
//...
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "修改成"}"
export const SetAdminNote = (data) => {
  return service({
    url: url+'setAdminNote',
    method: 'post',
    data: data
  })
}


//  取卡号格式模板配置
//...
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "修改成"}"
export const SetKaTemplate = (data) => {
  return service({
    url: url+'setKaTemplate',
    method: 'post',
    data: data
  })
}

//  取卡号格式模板配置
//...
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "修改成"}"
export const GetKaTemplate = (data) => {
  return service({
    url: url+'getKaTemplate',
    method: 'post',
    data: data
  })
}
