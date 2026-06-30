import service from '@/api/request'

const rootPath = window.location.pathname.endsWith('/') ? window.location.pathname.slice(0, -1) : window.location.pathname
const url = rootPath + '/withdraw/'

export const withdrawApi = {
  getConfig(data = {}) {
    return service({ url: url + 'getConfig', method: 'post', data })
  },
  saveConfig(data) {
    return service({ url: url + 'saveConfig', method: 'post', data })
  },
  list(data) {
    return service({ url: url + 'list', method: 'post', data })
  },
  detail(data) {
    return service({ url: url + 'detail', method: 'post', data })
  },
  auditPass(data) {
    return service({ url: url + 'auditPass', method: 'post', data })
  },
  reject(data) {
    return service({ url: url + 'reject', method: 'post', data })
  },
  markPaid(data) {
    return service({ url: url + 'markPaid', method: 'post', data })
  },
  delete(data) {
    return service({ url: url + 'delete', method: 'post', data })
  },
  uploadVoucher(data) {
    return service({
      url: url + 'uploadVoucher',
      method: 'post',
      data,
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  image(data) {
    return service({ url: url + 'image', method: 'post', data, responseType: 'blob' })
  },
  createVoucherToken(data) {
    return service({ url: url + 'createVoucherToken', method: 'post', data })
  },
  getUploadVoucherByTokenStatus(data) {
    return service({ url: url + 'getUploadVoucherByTokenStatus', method: 'post', data })
  },
  logs(data) {
    return service({ url: url + 'logs', method: 'post', data })
  }
}
