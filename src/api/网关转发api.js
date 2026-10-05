import service from '@/api/request'
import {取url根入口路径} from "@/utils/utils";

const url = 取url根入口路径() + "/gateway/"

// 网关转发管理 API
export const GetList = (data) => {
    return service({url: url + 'getList', method: 'post', data: data})
}
export const GetInfo = (data) => {
    return service({url: url + 'getInfo', method: 'post', data: data})
}
export const New = (data) => {
    return service({url: url + 'new', method: 'post', data: data})
}
export const SaveInfo = (data) => {
    return service({url: url + 'saveInfo', method: 'post', data: data})
}
export const DeleteInfo = (data) => {
    return service({url: url + 'delete', method: 'post', data: data})
}
export const Test = (data) => {
    return service({url: url + 'test', method: 'post', data: data})
}
