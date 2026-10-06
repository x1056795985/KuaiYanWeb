<template>
  <div v-loading="is加载中" element-loading-text="数据努力统计中..." class="dashboard-line-box"
       style="width: 100%;min-height: 360px;position:relative">
    <!--echarts绘图区域-->
    <div ref="echart" class="dashboard-line" style="width: 100%;min-height: 320px;z-index:99;position:absolute"></div>
  </div>
</template>

<script setup>
import * as echarts from 'echarts'
import {nextTick, onMounted, onUnmounted, ref, shallowRef} from 'vue'
import {is移动端} from "@/utils/utils";
import {Get图表充值订单分应用近7天} from "@/api/支付充值订单api.js";

const is加载中 = ref(false)
const chart = shallowRef(null)
const echart = ref(null)

const setOptions = (data) => {
  const 日期 = data.日期 || []
  const 系列 = data.系列 || []
  chart.value.setOption({
    title: {
      text: '分应用近7天收入趋势(成功订单)',
      left: 'center',
      textStyle: {fontSize: 14}
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {type: 'line'},
      valueFormatter: (值) => Number(值 || 0).toLocaleString('zh-CN') + ' 元'
    },
    legend: {
      top: 24,
      type: 'scroll',
    },
    grid: {left: '3%', right: '4%', top: 70, bottom: '3%', containLabel: true},
    toolbox: {feature: {saveAsImage: {}}},
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: 日期
    },
    yAxis: {
      type: 'value',
      axisLabel: {formatter: (值) => 值 >= 10000 ? (值 / 10000) + 'w' : 值}
    },
    series: 系列.map(item => ({
      name: item.name,
      type: 'line',
      smooth: true,
      data: item.data,
      emphasis: {focus: 'series'}
    }))
  }, {notMerge: true})
}

const on读取图表数据 = async () => {
  is加载中.value = true
  const 返回 = await Get图表充值订单分应用近7天()
  is加载中.value = false
  if (返回.code === 10000) {
    setOptions(返回.data)
  }
}

const on窗口尺寸变化 = () => {
  if (chart.value) chart.value.resize()
}

onMounted(async () => {
  await nextTick()
  chart.value = echarts.init(echart.value)
  setOptions({日期: [], 系列: []})
  await on读取图表数据()
  window.addEventListener('resize', on窗口尺寸变化)
})

onUnmounted(() => {
  window.removeEventListener('resize', on窗口尺寸变化)
  if (!chart.value) return
  chart.value.dispose()
  chart.value = null
})
</script>

<style lang="scss" scoped>
.dashboard-line-box {
  .dashboard-line {
    background-color: #fff;
    height: 360px;
    width: 100%;
  }
}
</style>
