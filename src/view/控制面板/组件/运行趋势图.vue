<template>
  <div class="trend-chart">
    <div class="trend-chart__title">{{ title }}</div>
    <div v-show="points.length" ref="chartElement" class="trend-chart__canvas" />
    <el-empty v-if="!points.length" :image-size="64" description="等待监控数据" />
  </div>
</template>

<script setup>
import * as echarts from 'echarts'
import { nextTick, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  unit: { type: String, default: '' },
  points: { type: Array, default: () => [] },
  series: { type: Array, default: () => [] }
})

const chartElement = ref(null)
const chart = shallowRef(null)
let resizeObserver = null

const getColor = (name, fallback) => {
  if (!chartElement.value) {
    return fallback
  }
  return getComputedStyle(chartElement.value).getPropertyValue(name).trim() || fallback
}

const updateChart = () => {
  if (!chart.value) {
    return
  }

  const palette = [
    getColor('--monitor-accent', '#409eff'),
    getColor('--monitor-success', '#67c23a'),
    getColor('--monitor-warning', '#e6a23c')
  ]

  chart.value.setOption(
    {
      animationDuration: 180,
      color: palette,
      tooltip: {
        trigger: 'axis',
        valueFormatter: (value) => `${Number(value).toFixed(2)} ${props.unit}`
      },
      legend: {
        top: 0,
        right: 0,
        textStyle: { color: getColor('--monitor-text-secondary', '#606266') }
      },
      grid: { left: 16, right: 18, top: 38, bottom: 8, containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: props.points.map((item) => item.time),
        axisLabel: { color: getColor('--monitor-text-tertiary', '#909399') },
        axisLine: { lineStyle: { color: getColor('--monitor-border', '#e4e7ed') } }
      },
      yAxis: {
        type: 'value',
        name: props.unit,
        min: 0,
        axisLabel: { color: getColor('--monitor-text-tertiary', '#909399') },
        splitLine: { lineStyle: { color: getColor('--monitor-border', '#e4e7ed'), type: 'dashed' } }
      },
      series: props.series.map((item) => ({
        name: item.name,
        type: 'line',
        showSymbol: false,
        smooth: false,
        connectNulls: true,
        lineStyle: { width: 2 },
        areaStyle: { opacity: 0.04 },
        data: props.points.map((point) => Number(point[item.key] || 0).toFixed(2))
      }))
    },
    true
  )
}

onMounted(async () => {
  await nextTick()
  if (!chartElement.value) {
    return
  }
  chart.value = echarts.init(chartElement.value)
  resizeObserver = new ResizeObserver(() => chart.value?.resize())
  resizeObserver.observe(chartElement.value)
  updateChart()
})

watch(
  () => [props.points, props.series, props.unit],
  async () => {
    await nextTick()
    if (!chart.value && chartElement.value) {
      chart.value = echarts.init(chartElement.value)
    }
    updateChart()
  },
  { deep: true }
)

onUnmounted(() => {
  resizeObserver?.disconnect()
  chart.value?.dispose()
  chart.value = null
})
</script>

<style lang="scss" scoped>
.trend-chart {
  min-width: 0;

  &__title {
    color: var(--monitor-text, #303133);
    font-size: 14px;
    font-weight: 600;
    line-height: 1.7;
    margin-bottom: 8px;
  }

  &__canvas {
    width: 100%;
    height: 260px;
  }
}

@media (max-width: 767px) {
  .trend-chart__canvas {
    height: 220px;
  }
}
</style>
