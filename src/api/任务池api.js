import service from '@/api/request'

import {取url根入口路径} from "@/utils/utils";
const url=取url根入口路径() +"/taskPool/"

//{ "Page": 0,"Size": 10 }
// @Success 200 {string} json "{"success":true,"data":{},"msg":"获取成功"}"
export const GetTaskPoolList = (data) => {
  return service({
    url: url+'getList',
    method: 'post',
    data: data
  })
}

//  Del批量删除TaskPool
//{ "id": [ 5 ]}
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "注销成功"}"
export const Del批量删除TaskPool = (data) => {
  return service({
    url: url+'delete',
    method: 'post',
    data: data
  })
}

//  GetTaskPool详细信息
//{"Id": 1}
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "获取成功"}"
export const GetTaskPool详细信息 = (data) => {
  return service({
    url:  url+'getInfo',
    method: 'post',
    data: data
  })
}

//  SaveTaskPool详细信息
//...
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "获取成功"}"
export const  SaveTaskPool信息 = (data) => {
  return service({
    url:  url+'saveInfo',
    method: 'post',
    data: data
  })
}

//  NewTaskPool信息
//...
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "添加成功"}"
export const  NewTaskPool信息 = (data) => {
  return service({
    url: url+'new',
    method: 'post',
    data: data
  })
}


export const  设置任务池任务类型状态 = (data) => {
  return service({
    url: url+'setStatus',
    method: 'post',
    data: data
  })
}

export const  清空队列Tid = (data) => {
  return service({
    url: url+'deleteTaskQueueTid',
    method: 'post',
    data: data
  })
}


export const  添加uuid到队列 = (data) => {
  return service({
    url: url+'uuidAddQueue',
    method: 'post',
    data: data
  })
}
export const  添加uuid到队列批量 = (data) => {
  return service({
    url: url+'batchUuidAddQueue',
    method: 'post',
    data: data
  })
}

//设置 排序 权重
export const  SetTaskPoolTypeSort = (data) => {
  return service({
    url:  url+'setSort',
    method: 'post',
    data: data
  })
}
