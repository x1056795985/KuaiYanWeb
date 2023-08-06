import service from '@/api/request'

const url="/admin/LogAgentInventory/"
// 分页获取Ka信息列表
//{ "Page": 0,"Size": 10 }
// @Success 200 {string} json "{"success":true,"data":{},"msg":"获取成功"}"
export const GetLogMoneyList = (data) => {
  return service({
    url: url+'GetList',
    method: 'post',
    data: data
  })
}

//  Del批量删除Ka
//{ "id": [ 5 ]}
// @Success 200 {string} json "{"code": 0, "data": {},"msg": "注销成功"}"
export const Del批量删除LogMoney = (data) => {
  return service({
    url: url+'Delete',
    method: 'post',
    data: data
  })
}

