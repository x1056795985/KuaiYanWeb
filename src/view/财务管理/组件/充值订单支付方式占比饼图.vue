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
import {Get图表充值订单支付方式} from "@/api/支付充值订单api.js";

const is加载中 = ref(false)
const chart = shallowRef(null)
const echart = ref(null)

const setOptions = (data) => {
  const 名称 = data.名称 || []
  const 金额 = data.金额 || []
  const 单数 = data.单数 || []
  const 饼图数据 = 名称.map((name, i) => ({name, value: 金额[i], 单数: 单数[i]}))

  chart.value.setOption({
    title: {
      text: '近30天支付方式占比',
      left: 'center',
      textStyle: {fontSize: 14}
    },
    tooltip: {
      trigger: 'item',
      formatter: (p) => `${p.name}<br/>${p.marker}金额: ¥${Number(p.value || 0).toLocaleString('zh-CN')} (${p.percent}%)<br/>单数: ${p.data.单数 || 0} 笔`
    },
    legend: {bottom: 0, type: 'scroll'},
    toolbox: {feature: {saveAsImage: {}}},
    series: [
      {
        name: '支付方式',
        type: 'pie',
        radius: ['40%', '68%'],
        center: ['50%', '54%'],
        avoidLabelOverlap: true,
        itemStyle: {borderRadius: 6, borderColor: '#fff', borderWidth: 2},
        label: {
          formatter: '{b}\n{d}%',
          fontSize: 11
        },
        emphasis: {
          label: {show: true, fontSize: 13, fontWeight: 'bold'}
        },
        data: 饼图数据
      }
    ]
  }, {notMerge: true})
}

const on读取图表数据 = async () => {
  is加载中.value = true
  const 返回 = await Get图表充值订单支付方式()
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
  setOptions({名称: [], 金额: [], 单数: []})
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
