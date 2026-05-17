import service from '@/api/request'

import {取url根入口路径} from "@/utils/utils";
const url=取url根入口路径() +"/appWebUser/"
//  GetApp详细信息
//{"Id": 1}
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "获取成功"}"
export const Get网页用户中心详细信息 = (data) => {
  return service({
    url:  url+'getInfo',
    method: 'post',
    data: data
  })
}
