import service from'@/api/request'
import {取url根入口路径} from "@/utils/utils";
const url = 取url根入口路径() + "/base/";
// @Tags InitDB
// @Summary 初始化用户数据库
// @Produce  application/json
// @Param data body request.InitDB true "初始化数据库参数"
// @Success 200 {string} string "{"code":0,"data":{},"msg":"自动创建数据库成功"}"
// @Router /init/initdb [post]
export const initDB = (data) => {
  return service({
    url: url+'initDB',
    method: 'post',
    data
  })
}

// @Tags CheckDB
// @Summary 初始化用户数据库
// @Produce  application/json
// @Success 200 {string} string "{"code":0,"data":{},"msg":"探测完成"}"
// @Router /init/checkdb [post]
export const checkDB = () => {
  return service({
    url: url+'checkDB',
    method: 'post'
  })
}
