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
import {Get图表充值订单金额区间} from "@/api/支付充值订单api.js";

const is加载中 = ref(false)
const chart = shallowRef(null)
const echart = ref(null)

const setOptions = (data) => {
  const 区间 = data.区间 || []
  const 单数 = data.单数 || []
  const 金额 = data.金额 || []

  chart.value.setOption({
    title: {
      text: '近30天充值金额区间分布',
      left: 'center',
      textStyle: {fontSize: 14}
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {type: 'shadow'},
      formatter: (params) => {
        let 文本 = '充值 ¥' + params[0].name + '<br/>'
        params.forEach(item => {
          const 单位 = item.seriesName === '金额' ? ' 元' : ' 笔'
          文本 += item.marker + item.seriesName + ': ' + Number(item.value || 0).toLocaleString('zh-CN') + 单位 + '<br/>'
        })
        return 文本
      }
    },
    legend: {data: ['订单数', '金额'], top: 24},
    grid: {left: '3%', right: '4%', top: 70, bottom: '3%', containLabel: true},
    toolbox: {feature: {saveAsImage: {}}},
    xAxis: {type: 'category', data: 区间},
    yAxis: [
      {type: 'value', name: '订单数'},
      {type: 'value', name: '金额(元)'}
    ],
    series: [
      {
        name: '订单数',
        type: 'bar',
        data: 单数,
        itemStyle: {color: '#409EFF'},
        label: {show: true, position: 'top', fontSize: 10}
      },
      {
        name: '金额',
        type: 'bar',
        yAxisIndex: 1,
        data: 金额,
        itemStyle: {color: '#E6A23C'},
        label: {show: true, position: 'top', fontSize: 10, formatter: (p) => Number(p.value || 0).toLocaleString('zh-CN')}
      }
    ]
  }, {notMerge: true})
}

const on读取图表数据 = async () => {
  is加载中.value = true
  const 返回 = await Get图表充值订单金额区间()
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
  setOptions({区间: [], 单数: [], 金额: []})
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
