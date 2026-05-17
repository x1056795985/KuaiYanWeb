import service from '@/api/request'

import {取url根入口路径} from "@/utils/utils";
const url=取url根入口路径() +"/kaClass/"
// 分页获取KaClass信息列表
//{ "Page": 0,"Size": 10 }
// @Success 200 {string} json "{"success":true,"data":{},"msg":"获取成功"}"
export const GetKaClassList = (data) => {
  return service({
    url: url+'getList',
    method: 'post',
    data: data
  })
}
export const GetKaClassListAll = (data) => {
  return service({
    url: url+'getListAll',
    method: 'post',
    data: data
  })
}

//  Del批量删除KaClass
//{ "id": [ 5 ]}
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "注销成功"}"
export const Del批量删除KaClass = (data) => {
  return service({
    url: url+'delete',
    method: 'post',
    data: data
  })
}

//  GetKaClass详细信息
//{"Id": 1}
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "获取成功"}"
export const GetKaClass详细信息 = (data) => {
  return service({
    url:  url+'getInfo',
    method: 'post',
    data: data
  })
}

//  SaveKaClass详细信息
//...
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "获取成功"}"
export const  SaveKaClass信息 = (data) => {
  return service({
    url:  url+'saveInfo',
    method: 'post',
    data: data
  })
}

//  NewKaClass信息
//...
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "添加成功"}"
export const  NewKaClass信息 = (data) => {
  return service({
    url: url+'new',
    method: 'post',
    data: data
  })
}
