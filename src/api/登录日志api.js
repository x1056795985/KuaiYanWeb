import service from '@/api/request'

import {取url根入口路径} from "@/utils/utils";
const url=取url根入口路径() +"/logLogin/"
// 分页获取Ka信息列表
//{ "Page": 0,"Size": 10 }
// @Success 200 {string} json "{"success":true,"data":{},"msg":"获取成功"}"
export const GetLogLoginList = (data) => {
  return service({
    url: url+'getList',
    method: 'post',
    data: data
  })
}

//  Del批量删除Ka
//{ "id": [ 5 ]}
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "注销成功"}"
export const Del批量删除LogLogin = (data) => {
  return service({
    url: url+'delete',
    method: 'post',
    data: data
  })
}
