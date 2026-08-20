import { createCrudApi } from '@/api/common'

export const couponUserApi = createCrudApi('webUserCouponUser', {
  void: (data: any) => couponUserApi.httpSend('void', data),
})
