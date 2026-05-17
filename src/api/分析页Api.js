import service from '@/api/request'

import {取url根入口路径} from "@/utils/utils";
const url=取url根入口路径() +"/panel/"

export const get图表在线用户统计 = (data) => {
    return service({
        url: url+'chartLinksUser',
        method: 'POST',
        donNotShowLoading: true,
        data: data
    })
}
export const Get在线用户Ip地图分布统计 = () => {
    return service({
        url: url+'chartLinksUserIPCity',
        method: 'POST',
        donNotShowLoading: true,
    })
}

export const get图表用户账号统计 = (data) => {
    return service({
        url: url+'chartUser',
        method: 'POST',
        donNotShowLoading: true,
        data: data
    })
}

export const get图表余额充值消费统计 = (data) => {
    return service({
        url: url+'chartRMBAddSub',
        method: 'POST',
        donNotShowLoading: true,
        data: data
    })
}
export const Get代理组织架构图 = (data) => {
    return service({
        url: url+'chartAgentLevel',
        method: 'POST',
        donNotShowLoading: true,
        data: data
    })
}
export const get图表积分点数消费统计 = (data) => {
    return service({
        url: url+'chartVipNumberAddSub',
        method: 'POST',
        donNotShowLoading: true,
        data: data
    })
}
export const get图表取余额消费排行榜 = (data) => {
    return service({
        url: url+'getConsumptionRanking',
        method: 'POST',
        donNotShowLoading: true,
        data: data
    })
}
export const get图表取余额增长排行榜 = (data) => {
    return service({
        url: url+'getRmbIncreaseRanking',
        method: 'POST',
        donNotShowLoading: true,
        data: data
    })
}
export const get图表取积分消费排行榜 = (data) => {
    return service({
        url: url+'getNumberIncreaseRanking',
        method: 'POST',
        donNotShowLoading: true,
        data: data
    })
}
export const get图表在线用户登录活动时间 = (data) => {
    return service({
        url: url+'chartLinksUserLoginTime',
        method: 'POST',
        donNotShowLoading: true,
        data: data
    })
}
export const Get统计分时段在线总数 = (data) => {
    return service({
        url: url+'chartEveryHourLinksCount',
        method: 'POST',
        donNotShowLoading: true,
        data: data
    })
}
export const get图表应用用户统计 = (data) => {
    return service({
        url: url+'chartAppUser',
        method: 'POST',
        donNotShowLoading: true,
        data: data
    })
}
export const Get任务池任务Id分析 = (data) => {
    return service({
        url: url+'chartTidTaskData',
        method: 'POST',
        donNotShowLoading: true,
        data: data
    })
}

export const get图表卡号统计制卡 = (data) => {
    return service({
        url: url+'chartKaRegister',
        method: 'POST',
        donNotShowLoading: true,
        data: data
    })
}
export const get图表卡号列表统计应用卡可用已用 = (data) => {
    return service({
        url: url+'chartAppKa',
        method: 'POST',
        donNotShowLoading: true,
        data: data
    })
}
export const get图表卡号列表统计应用卡类可用已用 = (data) => {
    return service({
        url: url+'chartAppKaClass',
        method: 'POST',
        donNotShowLoading: true,
        data: data
    })
}
export const get图表应用用户类型统计 = (data) => {
    return service({
        url: url+'chartAppUserClass',
        method: 'POST',
        donNotShowLoading: true,
        data: data
    })
}

export const get图表应用用户账号注册统计 = (data) => {
    return service({
        url: url+'chartAppUserRegister',
        method: 'POST',
        donNotShowLoading: true,
        data: data
    })
}

export const get高德天气接口 = (data) => {
    return service({
        url: url+'gaodeWeather',
        method: 'POST',
        donNotShowLoading: true,
        data: data
    })
}
