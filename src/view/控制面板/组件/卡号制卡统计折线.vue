<template>
  <div v-loading="is加载中" element-loading-text="数据努力统计中..." class="dashboard-line-box" style="width: 100%;min-height: 360px;position:relative">
    <!--这里是echarts绘图区域-->
    <div
        ref="echart"
        class="dashboard-line"
        style="width: 100%;min-height: 200px;z-index:99;position:absolute">
    </div>
    <!--这里是放置按钮让其显示在最前面-->
    <div style="padding-left: 120px; z-index:999;float:left;position:absolute">
      <el-radio-group v-model="图表时间单位" size="small" @change="on读取图表数据">
        <el-radio-button :value="1">单位(日)</el-radio-button>
        <el-radio-button :value="2">单位(月)</el-radio-button>
      </el-radio-group>
    </div>
  </div>
</template>
<script setup>
import * as echarts from 'echarts'
import {nextTick, onMounted, onUnmounted, ref, shallowRef} from 'vue'
import {is移动端,获取前几个个月的月份} from "@/utils/utils";
import {get图表卡号统计制卡} from "@/api/分析页Api.js";

const Props = defineProps({
  AppId: {
    type: Number,
    default: 0
  }
})
const is加载中 = ref(false)
const 图表时间单位 = ref(1)
const chart = shallowRef(null)
const echart = ref(null)
const initChart = () => {
  chart.value = echarts.init(echart.value /* 'macarons' */)
  setOptions(1,[{
    name: '制卡数量',
    type: 'line',
    data: [120, 132, 101, 134, 90, 230, 210]
  }
  ])
}

const setOptions = (单位,data) => {

  let 图数据 = {
    title: {
      text: '制卡数量统计'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        // Use axis to trigger tooltip
        type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
      },
    },
    legend: {
      data: ['制卡数量']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['大大大大前天', '大大大前天', '大大前天', '大前天', '前天', '昨天', '今天']
    },
    yAxis: {
      type: 'value'
    },
    series: data
  }
  图数据.title = is移动端() ? "" : 图数据.title
  //创建date变量
  let nowDate = new Date();

//添加天数
  if (单位=== 2) {
    图数据.xAxis.data=获取前几个个月的月份(7)
    图数据.xAxis.data[6] += "(本月)"
  } else {
    for (let i = 0; i < 7; i++) {
      图数据.xAxis.data[6 - i] = nowDate.getDate().toString() + "日"
      nowDate.setDate(nowDate.getDate() - 1);
    }
    图数据.xAxis.data[6] += "(今天)"
    图数据.xAxis.data[5] += "(昨天)"
  }

  console.log(图数据.xAxis.data)
  chart.value.setOption(图数据)
}
const on读取图表数据 = async () => {
  is加载中.value=true
  let 返回;
  返回 = await get图表卡号统计制卡({Type:图表时间单位.value, AppId: Props.AppId})
  is加载中.value=false
  console.log(返回)
  if (返回.code === 10000) {
    setOptions(图表时间单位.value,返回.data)
  }
}
onMounted(async () => {
  await nextTick()
  initChart()
  await on读取图表数据()
})

onUnmounted(() => {
  if (!chart.value) {
    return
  }
  chart.value.dispose()
  chart.value = null
})
window.onresize = function () {
  if (chart.value){
    chart.value.resize();
  }
}
</script>
<style lang="scss" scoped>
.dashboard-line-box {
  .dashboard-line {
    background-color: #fff;
    height: 360px;
    width: 100%;
  }

  .dashboard-line-title {
    font-weight: 600;
    margin-bottom: 12px;
  }
}
</style>
