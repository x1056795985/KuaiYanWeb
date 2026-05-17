import service from '@/api/request'


import {取url根入口路径} from "@/utils/utils";
const url=取url根入口路径() +"/setSystem/"

//  GetUserClass详细信息
//{}
/*{
	"code": 0,
	"data": {
		"系统名称": "飞鸟快验后台管理系统111",
		"系统地址": "www.baidu.com",
		"系统开关": true,
		"系统关闭提示": "系统已经关闭使用",
		"用户中心开关": true,
		"代理中心开关": true,
		"代理中心关闭提示": "www.baidu.com"
	},
	"msg": "获取成功"
}*/
export const GetInfo系统设置 = (data) => {
    return service({
        url:  url+'getInfoSystem',
        method: 'post',
        data: data
    })
}

/*type 请求_S生成API加密源码SDK struct {
  Y用户API加密盐 string `mapstructure:"用户API加密盐" json:"用户API加密盐" yaml:"用户API加密盐"`
  Type      string `mapstructure:"Type" json:"Type" yaml:"Type"` //"E"  易源码
}*/
export const S生成API加密源码SDK = (data) => {
    return service({
        url:  url+'generateAPIEncryptedSDK',
        method: 'post',
        data: data
    })
}
//  SaveUserClass详细信息
// {
// 		"系统名称": "飞鸟快验后台管理系统111",
// 		"系统地址": "www.baidu.com",
// 		"系统开关": true,
// 		"系统关闭提示": "系统已经关闭使用",
// 		"用户中心开关": true,
// 		"代理中心开关": true,
// 		"代理中心关闭提示": "www.baidu.com"
// 	}
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "获取成功"}"
export const  SaveInfo系统设置 = (data) => {
    return service({
        url:  url+'saveInfoSystem',
        method: 'post',
        data: data
    })
}


//  GetUserClass详细信息
//{}
/*{
	"code": 0,
	"data": {
		"支付宝启用": false,
		"支付宝商户ID": "20210088888888",
		"支付宝商户私钥": "",
		"支付宝商户公钥": "",
		"支付宝同步回调url": "https://www.baidu.com/s?wd=%E5%85%85%E5%80%BC%E6%88%90%E5%8A%9F%E6%9B%B4%E6%96%B0%E7%94%A8%E6%88%B7%E4%BF%A1%E6%81%AF%E6%9F%A5%E7%9C%8B",
		"微信支付启用": false,
		"微信支付商户ID": "1234567",
		"微信支付AppId": "1234567",
		"微信支付商户密匙": "",
		"微信支付异步回调Url": "https://www.baidu.com",
		"微信支付单次最大金额": 500
	},
	"msg": "获取成功"
}*/
export const GetInfoPay = (data) => {
    return service({
        url:  url+'getInfoPay',
        method: 'post',
        data: data
    })
}

//  SaveUserClass详细信息
/* {
"支付宝启用": false,
    "支付宝商户ID": "20210088888888",
    "支付宝商户私钥": "",
    "支付宝商户公钥": "",
    "支付宝同步回调url": "https://www.baidu.com/s?wd=%E5%85%85%E5%80%BC%E6%88%90%E5%8A%9F%E6%9B%B4%E6%96%B0%E7%94%A8%E6%88%B7%E4%BF%A1%E6%81%AF%E6%9F%A5%E7%9C%8B",
    "微信支付启用": false,
    "微信支付商户ID": "1234567",
    "微信支付AppId": "1234567",
    "微信支付商户密匙": "",
    "微信支付异步回调Url": "https://www.baidu.com",
    "微信支付单次最大金额": 500
	}*/
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "获取成功"}"
export const  SaveInfoPay = (data) => {
    return service({
        url:  url+'saveInfoPay',
        method: 'post',
        data: data
    })
}



//  GetInfoSMS详细信息
//{}
/*{
	"code": 0,
	"data": {
		"TX云Sms": {
			"SECRET_ID": "",
			"SECRET_KEY": "",
			"短信应用ID": "",
			"短信签名": "",
			"正文模板ID": ""
		}
	},
	"msg": "获取成功"
}*/
export const GetInfoSMS= (data) => {
    return service({
        url:  url+'getInfoSMS',
        method: 'post',
        data: data
    })
}

//  SaveInfoSMS
/* {
	"TX云Sms": {
		"SECRET_ID": "",
		"SECRET_KEY": "",
		"短信应用ID": "",
		"短信签名": "",
		"正文模板ID": ""
	}
}*/
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "保存成功"}"
export const  SaveInfoSMS = (data) => {
    return service({
        url:  url+'saveInfoSMS',
        method: 'post',
        data: data
    })
}
export const  TestSendSms = (data) => {
    return service({
        url:  url+'testSendSMS',
        method: 'post',
        data: data
    })
}
//行为验证码设置读取
export const GetInfoCaptcha2= (data) => {
    return service({
        url:  url+'getInfoCaptcha2',
        method: 'post',
        data: data
    })
}
//行为验证码设置保存
export const  SaveInfoCaptcha2 = (data) => {
    return service({
        url:  url+'saveInfoCaptcha2',
        method: 'post',
        data: data
    })
}


export const  SaveInfoCloudStorage = (data) => {
    return service({
        url:  url+'saveInfoCloudStorage',
        method: 'post',
        data: data
    })
}

export const  GetInfoCloudStorage = (data) => {
    return service({
        url:  url+'getInfoCloudStorage',
        method: 'post',
        data: data
    })
}

export const  SaveUserMsgConfig = (data) => {
    return service({
        url:  url+'saveUserMsgConfig',
        method: 'post',
        data: data
    })
}

export const  GetUserMsgConfig = (data) => {
    return service({
        url:  url+'getUserMsgConfig',
        method: 'post',
        data: data
    })
}
