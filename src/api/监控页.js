import service from '@/api/request'
import { 取url根入口路径 } from '@/utils/utils'

const url = `${取url根入口路径()}/panel/`

export const getSystemState = () => {
  return service({
    url: `${url}getServerInfo`,
    method: 'post',
    donNotShowLoading: true
  })
}

export const getMonitorOverview = () => {
  return service({
    url: `${url}getMonitorOverview`,
    method: 'post',
    donNotShowLoading: true
  })
}

export const getMonitorProcessTop = () => {
  return service({
    url: `${url}getMonitorProcessTop`,
    method: 'post',
    donNotShowLoading: true
  })
}

export const getMonitorProfileText = (data) => {
  return service({
    url: `${url}getMonitorProfileText`,
    method: 'post',
    data,
    donNotShowLoading: true
  })
}

export const updateMonitorSettings = (data) => {
  return service({
    url: `${url}updateMonitorSettings`,
    method: 'post',
    data
  })
}

export const captureCPUProfile = (data) => {
  return service({
    url: `${url}captureCPUProfile`,
    method: 'post',
    data
  })
}

export const downloadMonitorProfile = (data) => {
  return service({
    url: `${url}downloadMonitorProfile`,
    method: 'post',
    data,
    responseType: 'blob',
    donNotShowLoading: true
  })
}

export const downloadLastCPUProfile = () => {
  return service({
    url: `${url}downloadLastCPUProfile`,
    method: 'post',
    responseType: 'blob',
    donNotShowLoading: true
  })
}

export const 系统热重启 = () => {
  return service({
    url: `${url}reloadSystem`,
    method: 'post'
  })
}

export const reloadSystem = () => {
  return service({
    url: `${url}reloadSystem`,
    method: 'post'
  })
}

export const 系统停止 = () => {
  return service({
    url: `${url}stopSystem`,
    method: 'post'
  })
}

export const stopSystem = () => {
  return service({
    url: `${url}stopSystem`,
    method: 'post'
  })
}
