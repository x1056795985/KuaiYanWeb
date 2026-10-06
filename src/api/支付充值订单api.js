import service from '@/api/request'

import {取url根入口路径} from "@/utils/utils";
const url=取url根入口路径() +"/logRMBPayOrder/"
// 分页获取Ka信息列表
// { "Page": 0,"Size": 10 }
// @Success 200 {string} json "{"success":true,"data":{},"msg":"获取成功"}"
export const GetLogRMBPayOrderList = (data) => {
  return service({
    url: url+'getList',
    method: 'post',
    data: data
  })
}

//  Del批量删除Ka
// { "id": [ 5 ]}
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "注销成功"}"
export const Del批量删除LogRMBPayOrder = (data) => {
  return service({
    url: url+'delete',
    method: 'post',
    data: data
  })
}

//  退款
export const OutRMBPayOrder = (data) => {
  return service({
    url: url+'out',
    method: 'post',
    data: data
  })
}

//  SetAdminNote
//...
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "修改成"}"
export const SetPayOrderNote = (data) => {
  return service({
    url: url+'setPayOrderNote',
    method: 'post',
    data: data
  })
}

//  手动补单 - 对未支付订单进行手动补单
// { "payOrder": "订单号", "note": "备注" }
export const MakeUpRMBPayOrder = (data) => {
  return service({
    url: url+'makeUp',
    method: 'post',
    data: data
  })
}

// ========== 充值订单图表统计(仅统计成功订单) ==========
// 顶部汇总卡片: 今日/本周/本月金额及单数,同比昨日/上月,客单价,待处理单数
export const Get图表充值订单汇总 = () => {
  return service({
    url: url+'chartSummary',
    method: 'post',
    donNotShowLoading: true,
  })
}
// 分应用本月收入与上月收入对比
export const Get图表充值订单分应用月收入 = () => {
  return service({
    url: url+'chartAppMonthRmb',
    method: 'post',
    donNotShowLoading: true,
  })
}
// 分应用近7天每天成功订单金额折线
export const Get图表充值订单分应用近7天 = () => {
  return service({
    url: url+'chartAppWeekDay',
    method: 'post',
    donNotShowLoading: true,
  })
}
// 用户充值排行榜TOP10 {Type: 1今日 2本周 3本月} 按应用+用户分组
export const Get图表充值订单用户排行 = (data) => {
  return service({
    url: url+'chartUserRank',
    method: 'post',
    donNotShowLoading: true,
    data: data
  })
}
// 近30天支付方式金额占比
export const Get图表充值订单支付方式 = () => {
  return service({
    url: url+'chartPayType',
    method: 'post',
    donNotShowLoading: true,
  })
}
// 近30天充值金额区间分布
export const Get图表充值订单金额区间 = () => {
  return service({
    url: url+'chartRmbRange',
    method: 'post',
    donNotShowLoading: true,
  })
}
