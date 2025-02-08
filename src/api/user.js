import service from '@/api/request'
// @Summary 用户登录
// @Produce  application/json
// @Param data body {username:"string",password:"string"}
// @Router /base/login [post]
export const login = (data) => {
  return service({
    url: 'Admin/base/Login',
    method: 'post',
    data: data
  })
}

// @Summary 获取验证码
// @Produce  application/json
// @Param data body {username:"string",password:"string"}
// @Router /base/captcha [post]
export const captcha = (data) => {
  return service({
    url: 'Admin/base/Captcha2',
    method: 'post',
    data: data
  })
}


// @Summary 获取管理员信息
export const GetAdminInfo = () => {
  return service({
    url: '/Admin/User/GetAdminInfo',
    method: 'get'
  })
}

// @Summary 注销登录
export const OutLogin = () => {
  return service({
    url: '/Admin/User/OutLogin',
    method: 'post'
  })
}

// @Summary 修改管理员密码
export const AdminNewPassword = (data) => {
  return service({
    url: '/Admin/User/AdminNewPassword',
    method: 'post',
    data: data
  })
}

