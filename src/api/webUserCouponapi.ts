import { createCrudApi } from '@/api/common'

export const couponApi: any = createCrudApi('webUserCoupon')
couponApi.setStatus = (data: any) => couponApi.httpSend('setStatus', data)
couponApi.batchGrant = (data: any) => couponApi.httpSend('batchGrant', data)
