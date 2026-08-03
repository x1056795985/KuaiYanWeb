<template>
  <div>
    <el-divider content-position="left">大转盘抽奖,关联id:{{ typeAssociatedId }}</el-divider>

    <el-form :model="data" class="demo-form-inline" label-width="140px">
      <el-form-item label="每日免费次数">
        <el-input-number v-model="data.dailyFreeCount" :min="0" />
        <el-text type="warning">每天用户可免费领取的抽奖次数,0为关闭</el-text>
      </el-form-item>
      <el-form-item label="拉新奖励次数">
        <el-input-number v-model="data.inviteGiveCount" :min="0" />
        <el-text type="warning">每拉新一个注册用户增加的抽奖次数,0为关闭</el-text>
      </el-form-item>
    </el-form>

    <el-divider content-position="left">奖品概率配置</el-divider>
    <el-text type="warning">概率为万分比,所有奖品概率之和不超过10000,不足10000的部分自动作为"谢谢参与"</el-text>
    <br>
    <el-text :type="概率总和 > 10000 ? 'danger' : 'success'" style="margin-left: 20px;">
      当前概率总和: {{ 概率总和 }} / 10000
      <span v-if="概率总和 > 10000" style="color: red;"> (已超出!)</span>
      <span v-else-if="概率总和 < 10000"> (谢谢参与概率: {{ ((10000 - 概率总和) / 100).toFixed(2) }}%  )</span>
      <span v-else> (无谢谢参与)</span>
    </el-text>

    <el-form :inline="true" v-for="(item, index) in data.prizeList" :key="index"
             class="demo-form-inline">
      <el-form-item label="奖品">
        <el-select v-model="item.kaClassId" clear placeholder="选择卡类" style="width: 220px">
          <el-option v-for="(值,index) in 数组_卡类" :key="index" :label="数组_卡类[index].Name"
                     :value="Number(数组_卡类[index].Id)"/>
        </el-select>
      </el-form-item>
      <el-form-item label="概率(万分比)">
        <el-input-number v-model="item.probability" :min="0" :max="10000" :step="100"/>
        <el-text type="info" size="small" style="margin-left: 10px;">
          {{ (item.probability / 100).toFixed(2) }}%
        </el-text>
        <div class="工具栏">
          <el-icon size="16" @click="onPrizeMoveDown(index)"
                   :class="{ 'is-disabled': index === data.prizeList.length - 1 }">
            <SortDown/>
          </el-icon>
          <el-icon size="16" @click="onPrizeMoveUp(index)" :class="{ 'is-disabled': index == 0 }">
            <SortUp/>
          </el-icon>
          <el-icon size="16" style="color: #f56d6d;" @click="onPrizeDelete(index)">
            <Delete/>
          </el-icon>
        </div>
      </el-form-item>
    </el-form>
    <el-divider>
      <el-button type="primary" size="large" :icon="Plus" style="width: 110px" round
                 @click="data.prizeList.push({kaClassId: 0, probability: 0, name: ''})">
        添加奖品
      </el-button>
    </el-divider>

    <el-divider content-position="left">外观配置</el-divider>
    <el-form :model="data" label-width="140px">
      <el-form-item label="转盘主题色">
        <el-input v-model="data.themeColor" placeholder="如 #FF6B6B,不填用默认渐变色"/>
        <el-text type="warning">转盘完全由前端CSS实现,可选自定义主题色</el-text>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import {ref, watch, computed} from 'vue'
import {is移动端} from "@/utils/utils";
import {luckyWheelInfoapi} from "@/api/luckyWheelInfoapi";
import {Plus} from "@element-plus/icons";
import {GetKaClassListAll} from "@/api/卡类列表api";

defineOptions({name: '大转盘详细信息'})

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

type prizeItem = {
  kaClassId: number,
  probability: number,
  name: string,
}
type luckyWheelInfo = {
  id: number,
  createTime: number,
  updateTime: number,
  dailyFreeCount: number,
  inviteGiveCount: number,
  prizeList: prizeItem[],
  themeColor: string,
}

const data = ref<luckyWheelInfo>({
  id: 0,
  createTime: 0,
  updateTime: 0,
  dailyFreeCount: 1,
  inviteGiveCount: 1,
  prizeList: [
    {kaClassId: 0, probability: 500, name: "谢谢参与"}
  ],
  themeColor: "",
})

const 数组_卡类 = ref([])

const 概率总和 = computed(() => {
  return data.value.prizeList.reduce((sum, item) => sum + Number(item.probability || 0), 0)
})

const 读取详细信息 = async (id: number) => {
  if (id > 0) {
    let 返回 = await luckyWheelInfoapi.info({"id": id})
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

const onPrizeMoveUp = (index: number) => {
  if (index > 0) {
    const temp = data.value.prizeList[index];
    data.value.prizeList[index] = data.value.prizeList[index - 1];
    data.value.prizeList[index - 1] = temp;
  }
};
const onPrizeMoveDown = (index: number) => {
  if (index < data.value.prizeList.length - 1) {
    const temp = data.value.prizeList[index];
    data.value.prizeList[index] = data.value.prizeList[index + 1];
    data.value.prizeList[index + 1] = temp;
  }
};
const onPrizeDelete = (index: number) => {
  if (data.value.prizeList.length > 1) {
    data.value.prizeList.splice(index, 1);
  } else {
    data.value.prizeList[0] = {kaClassId: 0, probability: 0, name: "谢谢参与"};
  }
};

const getData = () => {
  return data.value
}

const update = async () => {
  return await luckyWheelInfoapi.update(data.value)
}

const 校验概率 = () => {
  let 局_概率总和 = data.value.prizeList.reduce((sum, item) => sum + Number(item.probability || 0), 0)
  if (局_概率总和 > 10000) {
    return {valid: false, msg: "奖品概率总和为" + 局_概率总和 + ",超过了10000,请调整后保存"}
  }
  // 过滤掉未选择卡类的项
  data.value.prizeList = data.value.prizeList.filter(item => item.kaClassId > 0)
  if (data.value.prizeList.length == 0) {
    return {valid: false, msg: "至少配置一个奖品"}
  }
  // 根据卡类id填充name字段
  data.value.prizeList.forEach(item => {
    const 卡类 = 数组_卡类.value.find((k: any) => Number(k.Id) === Number(item.kaClassId))
    item.name = 卡类 ? 卡类.Name : ""
  })
  return {valid: true}
}

defineExpose({getData, update, 校验概率})
</script>

<style scoped lang="scss">
.demo-form-inline .el-input {
  --el-input-width: 80px;
}

.工具栏 {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  flex-shrink: 0;
  white-space: nowrap;
  padding-right: 1px;

  .el-icon {
    font-size: 16px;
    margin-left: 10px;
    padding: 5px;
    border: 1px solid rgb(235, 238, 245);
    color: #409EFF;
    speak: none;
    font-style: normal;
    font-variant: normal;
    text-transform: none;
    line-height: 1;
    vertical-align: baseline;
    display: inline-flex;
    flex: 0 0 auto;
    -webkit-font-smoothing: antialiased;
    cursor: pointer;
  }

  .el-icon.is-disabled {
    color: transparent;
    cursor: default;
    border-color: transparent;
  }
}
</style>
