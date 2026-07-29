<template>
  <div v-loading="is加载中"  element-loading-text="数据努力统计中..." class="dashboard-line-box" style="width: 100%;min-height: 360px;position:relative">
    <!--这里是echarts绘图区域-->
    <div
        ref="echart"
        class="dashboard-line"
        style="width: 100%;min-height: 200px;z-index:99;position:absolute">
    </div>
  </div>
</template>
<script setup>
import * as echarts from 'echarts'
import {nextTick, onMounted, onUnmounted, ref, shallowRef} from 'vue'
import {is移动端} from "@/utils/utils";
import {Get统计分时段在线总数} from "@/api/分析页Api.js";

const Props = defineProps({
  AppId: {
    type: Number,
    default: 0
  }
})
const is加载中 = ref(false)
const chart = shallowRef(null)
const echart = ref(null)
const initChart = () => {
  chart.value = echarts.init(echart.value /* 'macarons' */)
  setOptions(['0时','1时','2时','3时','4时','5时','6时','7时','8时','9时','10时','11时','12时','13时','14时','15时','16时','17时','18时','19时','20时','21时','22时','23时'], [
    { name: '今日', type: 'line', data: [] },
    { name: '昨日', type: 'line', data: [] },
    { name: '前日', type: 'line', data: [] }
  ])
}

const setOptions = (x轴数据, series数据) => {
  let 图数据 = {
    title: {
      text: '分时在线统计(今日/昨日/前日对比)'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
    },
    legend: {
      data: series数据.map(s => s.name)
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
      data: x轴数据
    },
    yAxis: {
      type: 'value'
    },
    series: series数据
  }
  图数据.title = is移动端() ? "" : 图数据.title
  chart.value.setOption(图数据, true)
}

const on读取图表数据 = async () => {
  is加载中.value = true
  try {
    // 后端一次性返回今日/昨日/前日三天数据,只需请求一次
    const 返回 = await Get统计分时段在线总数({Type: 1, AppId: Props.AppId})
    if (返回.code === 10000 && 返回.data && 返回.data.length >= 4) {
      const x轴数据 = 返回.data[3].data // 统计分时段在线时间(0-23时)
      const series数据 = [
        { name: '今日', type: 'line', smooth: true, data: 返回.data[0].data },
        { name: '昨日', type: 'line', smooth: true, data: 返回.data[1].data },
        { name: '前日', type: 'line', smooth: true, data: 返回.data[2].data }
      ]
      setOptions(x轴数据, series数据)
    }
  } finally {
    is加载中.value = false
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
