import service from '@/api/request'

import {取url根入口路径} from "@/utils/utils";
const url=取url根入口路径() +"/taskPoolData/"

//{ "Page": 0,"Size": 10 }
// @Success 200 {string} json "{"success":true,"data":{},"msg":"获取成功"}"
export const GetTaskPoolDataList = (data) => {
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
