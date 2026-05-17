import service from '@/api/request'

import {取url根入口路径} from "@/utils/utils";
const url=取url根入口路径() +"/cron/"

// 列表
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
export const DeleteInfo = (data) => {
  return service({
    url: url+'delete',
    method: 'post',
    data: data
  })
}

//  Del批量删除
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

//  更新状态
export const UpdateStatus = (data) => {
  return service({
    url: url+'UpdateStatus',
    method: 'post',
    data: data
  })
}

//  测试执行
export const TestRunId = (data) => {
  return service({
    url: url+'TestRunId',
    method: 'post',
    data: data
  })
}
