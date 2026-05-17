import service from '@/api/request'

import {取url根入口路径} from "@/utils/utils";
const url=取url根入口路径() +"/agent/"
// 分页获取用户信息列表
//{ "Page": 0,"Size": 10 }
// @Success 200 {string} json "{"success":true,"data":{},"msg":"获取成功"}"
export const GetUserList = (data) => {
  return service({
    url: url+'getAgentUserList',
    method: 'post',
    data: data
  })
}

//  Del批量删除用户
//{ "id": [ 5 ]}
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "注销成功"}"
export const Del批量删除用户 = (data) => {
  return service({
    url: url+'deleteAgentUser',
    method: 'post',
    data: data
  })
}

//  Get用户详细信息
//{"Id": 1}
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "获取成功"}"
export const Get用户详细信息 = (data) => {
  return service({
    url: url+'getAgentUserInfo',
    method: 'post',
    data: data
  })
}



//  Save用户详细信息
//...
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "获取成功"}"
export const  Save用户信息 = (data) => {
  return service({
    url: url+'saveAgentUser',
    method: 'post',
    data: data
  })
}

//  批量修改用户状态
//{
//     "id": [
//         1,
//         2,
//         3
//     ],
//     "Status": 2
// }
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "msg"}"
export const  SetUserStatus = (data) => {
  return service({
    url: url+'setAgentUserStatus',
    method: 'post',
    data: data
  })
}
//  New用户信息
//...
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "添加成功"}"
export const  New用户信息 = (data) => {
  return service({
    url: url+'newAgentUser',
    method: 'post',
    data: data
  })
}


//设置 排序 权重
export const  SetAgentSort = (data) => {
  return service({
    url:  url+'setSort',
    method: 'post',
    data: data
  })
}


//  Get代理可制卡类列表
//{"Id": 1}
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "获取成功"}"
export const Get代理可制卡类列表 = (data) => {
  return service({
    url: url+'getAgentKaClassAuthority',
    method: 'post',
    data: data
  })
}
//  Set代理可制卡类列表
//{"Id": 1,"Kid":[1,2,3]}
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "获取成功"}"
export const Set代理可制卡类列表 = (data) => {
  return service({
    url: url+'setAgentKaClassAuthority',
    method: 'post',
    data: data
  })
}

export const Get销售统计 = (data) => {
  return service({
    url: url+'getKaSalesStatistics',
    method: 'post',
    data: data
  })
}
