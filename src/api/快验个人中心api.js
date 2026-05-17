import service from '@/api/request'

import {取url根入口路径} from "@/utils/utils";
const url=取url根入口路径() +"/kuaiYan/"

export const 取英数验证码 = (data) => {
  return service({
    url:  url+'getCaptcha',
    method: 'post',
    data: data
  })
}
export const 取短信验证码 = (data) => {
  return service({
    url:  url+'getSmsCaptcha',
    method: 'post',
    data: data
  })
}

export const 快验登录 = (data) => {
  return service({
    url:  url+'login',
    method: 'post',
    data: data
  })
}
export const 快验注册 = (data) => {
  return service({
    url:  url+'register',
    method: 'post',
    data: data
  })
}

export const 快验找回密码 = (data) => {
  return service({
    url:  url+'setPassword',
    method: 'post',
    data: data
  })
}
export const 快验取用户信息 = (data) => {
  return service({
    url:  url+'getUserInfo',
    method: 'post',
    data: data
  })
}

export const 快验取可购买充值卡 = (data) => {
  return service({
    url:  url+'getIsBuyKaList',
    method: 'post',
    data: data
  })
}
export const 余额购买充值卡 = (data) => {
  return service({
    url:  url+'payMoneyToKa',
    method: 'post',
    data: data
  })
}
export const 购买充值卡记录 = (data) => {
  return service({
    url:  url+'getPurchasedKaList',
    method: 'post',
    data: data
  })
}
export const 使用充值卡 = (data) => {
  return service({
    url:  url+'useKa',
    method: 'post',
    data: data
  })
}

export const 取支付通道状态 = (data) => {
  return service({
    url:  url+'getPayStatus',
    method: 'post',
    data: data
  })
}


export const 取余额充值地址 = (data) => {
  return service({
    url:  url+'getPayPC',
    method: 'post',
    data: data
  })
}


export const 取开启验证码接口列表 = (data) => {
  return service({
    url:  url+'getCaptchaApiList',
    method: 'post',
    data: data
  })
}
export const 快验注销 = (data) => {
  return service({
    url:  url+'outLogin',
    method: 'post',
    data: data
  })
}

export const 快验系统更新 = (data) => {
  return service({
    url:  url+'updater',
    method: 'post',
    data: data
  })
}

