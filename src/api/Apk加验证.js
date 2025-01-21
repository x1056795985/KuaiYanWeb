import service from '@/api/request'

const url="/Admin/ApkTools/"
export const GetList = (data) => {
  return service({
    url: url+'GetList',
    method: 'post',
    data: data
  })
}


//  获取上传凭证
//{"Path": "aa/aa.apk"}
export const GetUploadToken = (data) => {
  return service({
    url:  url+'GetUploadToken',
    method: 'post',
    data: data
  })
}


//  创建apk加验证任务
//{"Path": "aa/aa.apk"}
export const CreateApkAddFNKYTask = (data) => {
  return service({
    url:  url+'CreateApkAddFNKYTask',
    method: 'post',
    data: data
  })
}


export const GetTaskIdStatus = () => {
  return service({
    url:  url+'GetTaskIdStatus',
    method: 'post'
  })
}
