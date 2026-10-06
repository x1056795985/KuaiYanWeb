<template>
  <el-drawer v-model="is图表分析抽屉可见2" direction="ltr" @close="on抽屉被关闭" show-close size="90%">
    <template #header>
      <span style="font-weight: 600">充值订单数据分析</span>
      <el-tag size="small" type="success" style="margin-left: 8px">收入统计口径: 成功订单</el-tag>
    </template>
    <template #default>
      <!-- 汇总卡片: 今日/本周/本月充值,同比,客单价,待处理订单 -->
      <Echarts充值订单统计卡片/>

      <el-row :gutter="12">
        <el-col :xs="24" :md="14">
          <el-card shadow="never" style="margin-bottom: 12px">
            <Echarts充值订单分应用月收入柱状图/>
          </el-card>
        </el-col>
        <el-col :xs="24" :md="10">
          <el-card shadow="never" style="margin-bottom: 12px">
            <Echarts充值订单支付方式占比饼图/>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="12">
        <el-col :xs="24" :md="14">
          <el-card shadow="never" style="margin-bottom: 12px">
            <Echarts充值订单分应用近7天折线图/>
          </el-card>
        </el-col>
        <el-col :xs="24" :md="10">
          <el-card shadow="never" style="margin-bottom: 12px">
            <Echarts充值订单金额区间分布柱状图/>
          </el-card>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24">
          <el-card shadow="never" style="margin-bottom: 12px">
            <Echarts充值订单用户充值排行榜/>
          </el-card>
        </el-col>
      </el-row>
    </template>
    <template #footer>
      <div style="flex: auto"></div>
    </template>
  </el-drawer>
</template>

<script setup lang='ts'>
import Echarts充值订单统计卡片 from '@/view/财务管理/组件/充值订单统计卡片.vue'
import Echarts充值订单分应用月收入柱状图 from '@/view/财务管理/组件/充值订单分应用月收入柱状图.vue'
import Echarts充值订单分应用近7天折线图 from '@/view/财务管理/组件/充值订单分应用近7天折线图.vue'
import Echarts充值订单用户充值排行榜 from '@/view/财务管理/组件/充值订单用户充值排行榜.vue'
import Echarts充值订单支付方式占比饼图 from '@/view/财务管理/组件/充值订单支付方式占比饼图.vue'
import Echarts充值订单金额区间分布柱状图 from '@/view/财务管理/组件/充值订单金额区间分布柱状图.vue'
import {ref} from "vue";

const Props = defineProps({
})
const emit = defineEmits(['on图表分析抽屉关闭'])

const is图表分析抽屉可见2 = ref(true)
const on抽屉被关闭 = () => {
  is图表分析抽屉可见2.value = false
  emit('on图表分析抽屉关闭', false)
}

</script>

<style scoped lang="scss">

</style>
