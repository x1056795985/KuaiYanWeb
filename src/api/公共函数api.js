import service from '@/api/request'

import {取url根入口路径} from "@/utils/utils";
const url=取url根入口路径() +"/publicJs/"
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
export const GetPublicAppList = (data) => {
  return service({
    url: url+'getPublicAppList',
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

//测试执行js {"Id":1,"Param":"{}"}
export const  TestRunJs = (data) => {
  return service({
    url: url+'testRunJs',
    method: 'post',
    data: data
  })
}

//==================== 公共函数分类 ====================
// 分类列表 { } → { list:[{Id,Name,Sort,Note,Count}], 未分类Count }
export const GetCategoryList = (data) => {
  return service({
    url: url+'category/getList',
    method: 'post',
    data: data
  })
}

// 新建分类 { "Name":"", "Sort":0, "Note":"" }
export const NewCategory = (data) => {
  return service({
    url: url+'category/new',
    method: 'post',
    data: data
  })
}

// 修改分类 { "Id":1, "Name":"", "Sort":0, "Note":"" }
export const SaveCategoryInfo = (data) => {
  return service({
    url: url+'category/saveInfo',
    method: 'post',
    data: data
  })
}

// 删除分类 { "Id":1 } 其下函数自动移入未分类
export const DeleteCategory = (data) => {
  return service({
    url: url+'category/delete',
    method: 'post',
    data: data
  })
}

// 批量移动函数到分类 { "Id":[1,2], "CategoryId":1 }  CategoryId=0 移入未分类
export const SetFunctionCategory = (data) => {
  return service({
    url: url+'category/setFunctionCategory',
    method: 'post',
    data: data
  })
}
