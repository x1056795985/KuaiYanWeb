import service from '@/api/request'

import {取url根入口路径} from "@/utils/utils";
const url=取url根入口路径() +"/agentInventory/"
// 分页获取用户信息列表
//{ "Page": 0,"Size": 10 }
// @Success 200 {string} json "{"success":true,"data":{},"msg":"获取成功"}"
export const GetList = (data) => {
  return service({
    url: url+'getList',
    method: 'post',
    data: data
  })
}

//  Del批量删除用户
//{ "id": [ 5 ]}
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "注销成功"}"
export const Del批量删除 = (data) => {
  return service({
    url: url+'delete',
    method: 'post',
    data: data
  })
}

//  Get用户详细信息
//{"Id": 1}
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "获取成功"}"
export const Get详细信息 = (data) => {
  return service({
    url: url+'getInfo',
    method: 'post',
    data: data
  })
}

/* type 结构请求_库存撤回 struct {
	Id   int    `json:"Id"`   //库存Id
	Num  int    `json:"Num"`  //撤回数量
	Note string `json:"Note"` //备注
}
* */
export const  C撤回库存 = (data) => {
  return service({
    url: url+'withdraw',
    method: 'post',
    data: data
  })
}

//  New用户信息
//...
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "添加成功"}"
export const  New库存信息 = (data) => {
  return service({
    url: url+'new',
    method: 'post',
    data: data
  })
}
//  Get下级代理树和可制卡类树
//{"Id": 1}
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "获取成功"}"
export const Get代理树和应用卡类树 = (data) => {
  return service({
    url: url+'getAgentTreeAndKaClassTree',
    method: 'post',
    data: data
  })
}
