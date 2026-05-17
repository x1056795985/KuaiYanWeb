import service from '@/api/request'

import {取url根入口路径} from "@/utils/utils";
const url=取url根入口路径() +"/blacklist/"

// 黑名单列表
export const GetList = (data) => {
  return service({
    url: url+'getList',
    method: 'post',
    data: data
  })
}

//  添加
export const Create = (data) => {
  return service({
    url: url+'create',
    method: 'post',
    data: data
  })
}
//  Del批量删除
export const Delete = (data) => {
  return service({
    url: url+'delete',
    method: 'post',
    data: data
  })
}

//  Del批量删除Ka
export const Update = (data) => {
  return service({
    url: url+'update',
    method: 'post',
    data: data
  })
}
//  查询
export const Info = (data) => {
  return service({
    url: url+'info',
    method: 'post',
    data: data
  })
}

//  批量维护删除
export const DeleteBatch = (data) => {
  return service({
    url: url+'deleteBatch',
    method: 'post',
    data: data
  })
}
