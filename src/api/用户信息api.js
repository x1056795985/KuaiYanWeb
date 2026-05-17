import service from '@/api/request'
import {取url根入口路径} from "@/utils/utils";
const url=取url根入口路径() +"/user/"

// 分页获取用户信息列表
//{ "Page": 0,"Size": 10 }
// @Success 200 {string} json "{"success":true,"data":{},"msg":"获取成功"}"
export const GetUserList = (data) => {
  return service({
    url: url+'getUserList',
    method: 'post',
    data: data
  })
}

//  Del批量删除用户
//{ "id": [ 5 ]}
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "注销成功"}"
export const Del批量删除用户 = (data) => {
  return service({
    url: url+'deleteUser',
    method: 'post',
    data: data
  })
}

//  Get用户详细信息
//{"Id": 1}
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "获取成功"}"
export const Get用户详细信息 = (data) => {
  return service({
    url: url+'getUserInfo',
    method: 'post',
    data: data
  })
}

//  Save用户详细信息
//...
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "获取成功"}"
export const  Save用户信息 = (data) => {
  return service({
    url: url+'saveUser',
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
    url: url+'setUserStatus',
    method: 'post',
    data: data
  })
}
//  New用户信息
//...
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "添加成功"}"
export const  New用户信息 = (data) => {
  return service({
    url: url+'newUser',
    method: 'post',
    data: data
  })
}

//  New用户信息
//...
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "添加成功"}"
export const  Set批量维护增减余额 = (data) => {
  return service({
    url: url+'setBatchAddRMB',
    method: 'post',
    data: data
  })
}
