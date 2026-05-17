import service from '@/api/request'

import {取url根入口路径} from "@/utils/utils";
const url=取url根入口路径() +"/publicData/"
// GetList
//{ "Page": 0,"Size": 10 }
// @Success 200 {string} json "{"success":true,"data":{},"msg":"获取成功"}"
export const GetList = (data) => {
  return service({
    url: url+'getList',
    method: 'post',
    data: data
  })
}

//  Delete
// {
//   "data": [
//   {
//     "AppId": 1,
//     "Name": "系统名称",
//   },
//   {
//     "AppId": 1,
//     "Name": "系统类型",
//   }
// ]
// }
export const DeleteInfo= (data) => {
  return service({
    url: url+'delete',
    method: 'post',
    data: data
  })
}

//  GetInfo
//*{
// 	"AppId": 1,
// 	"Name": "系统名称"
// }*/
export const GetInfo = (data) => {
  return service({
    url:  url+'getInfo',
    method: 'post',
    data: data
  })
}

//  SaveInfo
/*{
	"AppId": 1,
	"Name": "系统名称",
	"Value":"飞鸟快验应用管理系统",
}*/
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "获取成功"}"
export const  SaveInfo = (data) => {
  return service({
    url:  url+'saveInfo',
    method: 'post',
    data: data
  })
}

//  New
/*{
	"AppId": 1,
	"Name": "系统名称",
	"Value":"飞鸟快验应用管理系统",
	"KeyType":11
}*/
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "添加成功"}"
export const  New = (data) => {
  return service({
    url: url+'new',
    method: 'post',
    data: data
  })
}
