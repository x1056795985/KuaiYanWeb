<template>
  <div>
    <el-divider content-position="left">签到推广,关联id:{{ typeAssociatedId }}</el-divider>
    <el-form :model="data" class="demo-form-inline">
      <el-text v-if="!is移动端()" type="warning">建议分享7天可以获取一次奖励,提升客户分享习惯</el-text>
      <el-form-item label="分享任务赠送积分">
        <el-input-number v-model="data.shareGivePoints"/>
      </el-form-item>
      <el-text v-if="!is移动端()" type="warning">邀请1个就可以获取一次奖励,提升客户积极性</el-text>
      <el-form-item label="邀请任务赠送积分">
        <el-input-number v-model="data.inviteGivePoints"/>
      </el-form-item>
    </el-form>
    <el-divider content-position="left">兑换奖励配置</el-divider>

    <el-form :inline="true" v-for="(item, index) in data.cardClassList" :key="index"
             class="demo-form-inline">
      <el-form-item label="兑换">
        <el-select v-model="item.id" clear placeholder="选择卡类" style="width: 220px">
          <el-option key="0" label="无" :value="0"/>
          <el-option v-for="(值,index) in 数组_卡类" :key="index" :label="数组_卡类[index].Name"
                     :value="Number(数组_卡类[index].Id)"/>
        </el-select>
      </el-form-item>
      <el-form-item label="消耗签到分">
        <el-input-number :precision="0" :step="1" :value-on-clear="0" :min="0" v-model="item.p"/>
        <div class="工具栏">
          <el-icon size="16" @click="onMoveDown(index)"
                   :class="{ 'is-disabled': index === data.cardClassList.length - 1 }">
            <SortDown/>
          </el-icon>
          <el-icon size="16" @click="onMoveUp(index)" :class="{ 'is-disabled': index == 0 }">
            <SortUp/>
          </el-icon>
          <el-icon size="16" style="color: #f56d6d;" @click="onDeleteItem(index)">
            <Delete/>
          </el-icon>
        </div>
      </el-form-item>
    </el-form>
    <el-divider>
      <el-button type="primary" size="large" :icon="Plus" style="width: 110px" round
                 @click="data.cardClassList.push({id: 0, p: 100})">
        添加兑换奖励
      </el-button>
    </el-divider>
  </div>
</template>

<script setup lang="ts">
import {ref, watch} from 'vue'
import {is移动端} from "@/utils/utils";
import {checkInInfoapi} from "@/api/checkInInfoapi";
import {Plus} from "@element-plus/icons";
import {GetKaClassListAll} from "@/api/卡类列表api";

defineOptions({name: '签到推广详细信息'})

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

type cardClassListItem = {
  id: number,
  p: number,
}
type checkInInfo = {
  id: number,
  shareGivePoints: number,
  inviteGivePoints: number,
  cardClassList: cardClassListItem[]
}

const data = ref<checkInInfo>({
  id: 0,
  shareGivePoints: 0,
  inviteGivePoints: 0,
  cardClassList: [
    {id: 0, p: 0},
    {id: 1, p: 2}
  ]
})

const 数组_卡类 = ref([])

const 读取详细信息 = async (id: number) => {
  let 签到配置相关信息 = await checkInInfoapi.info({"id": id})
  if (签到配置相关信息.code == 10000) {
    data.value = 签到配置相关信息.data
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

const onMoveUp = (index: number) => {
  if (index > 0) {
    const temp = data.value.cardClassList[index];
    data.value.cardClassList[index] = data.value.cardClassList[index - 1];
    data.value.cardClassList[index - 1] = temp;
  }
};

const onMoveDown = (index: number) => {
  if (index < data.value.cardClassList.length - 1) {
    const temp = data.value.cardClassList[index];
    data.value.cardClassList[index] = data.value.cardClassList[index + 1];
    data.value.cardClassList[index + 1] = temp;
  }
};

const onDeleteItem = (index: number) => {
  if (data.value.cardClassList.length > 1) {
    data.value.cardClassList.splice(index, 1);
  } else {
    data.value.cardClassList[0] = {id: 0, p: 0};
  }
};

const getData = () => {
  return data.value
}

const update = async () => {
  return await checkInInfoapi.update(data.value)
}

defineExpose({getData, update})
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
