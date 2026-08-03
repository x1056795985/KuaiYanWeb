<template>
  <div>
    <el-divider content-position="left">cps推广,关联id:{{ typeAssociatedId }}</el-divider>
    <el-text type="warning">邀请关系</el-text>
    <el-form :model="data" class="demo-form-inline" label-width="120px">
      <el-form-item label="绑定天数">
        <el-input-number v-model="data.bindingDay"/>
      </el-form-item>
      <el-form-item label="被邀请用户奖励" prop="RegisterGiveKaClassId">
        <el-popover placement="right" trigger="hover"
                    content="用户填写邀请码时自动充值该卡,可以激励用户主动填写邀请码,也可以用来宣传">
          <template #reference>
            <el-select v-model="data.bindGiveKaClassId" clear placeholder="选择卡类" :style="{ width: is移动端() ? '100%' : '280px' }">
              <el-option key="0" label="无赠送" :value="0"/>
              <el-option v-for="(值,index) in 数组_卡类" :key="index" :label="数组_卡类[index].Name"
                         :value="Number(数组_卡类[index].Id)"/>
            </el-select>
          </template>
        </el-popover>
      </el-form-item>
    </el-form>
    <el-text type="warning">推荐一个新用户并且成交至少一个订单,推荐成功+1,达到(包含)阈值即可升级</el-text>
    <el-form :inline="true" :model="data" class="demo-form-inline">
      <el-form-item label="铜牌推广数量阈值">
        <el-input-number v-model="data.bronzeThreshold"/>
      </el-form-item>
      <el-form-item label="铜牌分成比例">
        <el-input-number v-model="data.bronzeKickback"/>
      </el-form-item>
    </el-form>
    <el-form :inline="true" :model="data" class="demo-form-inline">
      <el-form-item label="银牌推广数量阈值">
        <el-input-number v-model="data.silverThreshold"/>
      </el-form-item>
      <el-form-item label="银牌分成比例">
        <el-input-number v-model="data.silverKickback"/>
      </el-form-item>
    </el-form>
    <el-form :inline="true" :model="data" class="demo-form-inline">
      <el-form-item label="金牌推广数量阈值">
        <el-input-number v-model="data.goldMedalThreshold"/>
      </el-form-item>
      <el-form-item label="金牌分成比例">
        <el-input-number v-model="data.goldMedalKickback"/>
      </el-form-item>
    </el-form>
    <el-text type="warning">少量徒孙订单奖励,可以让用户教导新用户拉新,有效裂变</el-text>
    <el-form :model="data" class="demo-form-inline">
      <el-form-item label="徒孙订单分成比例">
        <el-input-number v-model="data.grandsonKickback"/>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import {ref, watch} from 'vue'
import {is移动端} from "@/utils/utils";
import {cpsInfoapi} from "@/api/cpsInfoapi";
import {GetKaClassListAll} from "@/api/卡类列表api";

defineOptions({name: 'Cps推广详细信息'})

const Props = defineProps({
  typeAssociatedId: {
    type: Number,
    default: 0
  },
  AppId: {
    type: Number,
    default: 0
  },
})

type cpsInfo = {
  id: number,
  createTime: number,
  updateTime: number,
  bronzeThreshold: number,
  bronzeKickback: number,
  silverThreshold: number,
  silverKickback: number,
  goldMedalThreshold: number,
  goldMedalKickback: number,
  grandsonKickback: number,
  widePic: string,
  detailPic: string,
  bindingDay: number,
  bindGiveKaClassId: number,
}

const data = ref<cpsInfo>({
  id: 0,
  createTime: 0,
  updateTime: 0,
  bronzeThreshold: 0,
  bronzeKickback: 0,
  silverThreshold: 0,
  silverKickback: 0,
  goldMedalThreshold: 0,
  goldMedalKickback: 0,
  grandsonKickback: 0,
  widePic: "",
  detailPic: "",
  bindingDay: 180,
  bindGiveKaClassId: 0,
})

const 数组_卡类 = ref([])

const 读取详细信息 = async (id: number) => {
  if (id > 0) {
    let 返回 = await cpsInfoapi.info({"id": id})
    if (返回.code == 10000) {
      data.value = 返回.data
    }
  }
}

const 初始化卡类信息 = async () => {
  const res = await GetKaClassListAll({AppId: Props.AppId})
  if (res.code == 10000) {
    数组_卡类.value = res.data
  }
}

watch(() => Props.typeAssociatedId, (newVal) => {
  if (newVal > 0) {
    初始化卡类信息()
    读取详细信息(newVal)
  }
}, {immediate: true})

const getData = () => {
  return data.value
}

const update = async () => {
  return await cpsInfoapi.update(data.value)
}

defineExpose({getData, update})
</script>

<style scoped lang="scss">
.demo-form-inline .el-input {
  --el-input-width: 80px;
}
</style>
