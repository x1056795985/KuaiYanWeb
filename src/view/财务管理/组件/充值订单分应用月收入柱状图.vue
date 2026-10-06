<template>
  <div v-loading="is加载中" element-loading-text="数据努力统计中..." class="dashboard-line-box"
       style="width: 100%;min-height: 360px;position:relative">
    <!--echarts绘图区域-->
    <div ref="echart" class="dashboard-line" style="width: 100%;min-height: 320px;z-index:99;position:absolute"></div>
    <!--切换按钮-->
    <div style="padding-left: 10px; z-index:999;float:left;position:absolute">
      <el-radio-group v-model="统计指标" size="small" @change="setOptions">
        <el-radio-button value="金额">金额(元)</el-radio-button>
        <el-radio-button value="单数">订单数</el-radio-button>
      </el-radio-group>
    </div>
  </div>
</template>

<script setup>
import * as echarts from 'echarts'
import {nextTick, onMounted, onUnmounted, ref, shallowRef} from 'vue'
import {is移动端} from "@/utils/utils";
import {Get图表充值订单分应用月收入} from "@/api/支付充值订单api.js";

const is加载中 = ref(false)
const 统计指标 = ref("金额")
const chart = shallowRef(null)
const echart = ref(null)
const 数据 = ref({应用: [], 本月金额: [], 上月金额: [], 本月单数: [], 上月单数: []})

// 计算环比增长率文本
const 取环比文本 = (本月, 上月) => {
  本月 = Number(本月 || 0)
  上月 = Number(上月 || 0)
  if (上月 <= 0) {
    return 本月 > 0 ? '新增' : '-'
  }
  let 环比 = Math.round((本月 - 上月) / 上月 * 1000) / 10
  return (环比 >= 0 ? '+' : '') + 环比 + '%'
}

const setOptions = () => {
  const 应用 = 数据.value.应用 || []
  const 本月数据 = 统计指标.value === '金额' ? 数据.value.本月金额 : 数据.value.本月单数
  const 上月数据 = 统计指标.value === '金额' ? 数据.value.上月金额 : 数据.value.上月单数
  const 单位 = 统计指标.value === '金额' ? '元' : '笔'

  chart.value.setOption({
    title: {
      text: '分应用本月收入(对比上月)',
      left: 'center',
      textStyle: {fontSize: 14}
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {type: 'shadow'},
      formatter: (params) => {
        let 文本 = params[0].name + '<br/>'
        params.forEach(item => {
          文本 += item.marker + item.seriesName + ': ' + Number(item.value || 0).toLocaleString('zh-CN') + ' ' + 单位 + '<br/>'
        })
        //追加环比
        let 索引 = params[0].dataIndex
        文本 += '环比上月: ' + 取环比文本(本月数据[索引], 上月数据[索引])
        return 文本
      }
    },
    legend: {data: ['本月', '上月'], top: 24},
    grid: {left: '3%', right: '4%', top: 70, bottom: '3%', containLabel: true},
    toolbox: {feature: {saveAsImage: {}}},
    xAxis: {
      type: 'category',
      data: 应用,
      axisLabel: {
        interval: 0,
        rotate: 应用.length > 6 ? 30 : 0,
        formatter: (名称) => 名称.length > 6 ? 名称.slice(0, 6) + '…' : 名称
      }
    },
    yAxis: {type: 'value'},
    series: [
      {
        name: '本月',
        type: 'bar',
        data: 本月数据,
        itemStyle: {color: '#409EFF'},
        label: {
          show: !is移动端() && 应用.length <= 8,
          position: 'top',
          fontSize: 10,
          formatter: (p) => Number(p.value || 0).toLocaleString('zh-CN')
        }
      },
      {
        name: '上月',
        type: 'bar',
        data: 上月数据,
        itemStyle: {color: '#C0C4CC'}
      }
    ]
  }, {notMerge: true})
}

const on读取图表数据 = async () => {
  is加载中.value = true
  const 返回 = await Get图表充值订单分应用月收入()
  is加载中.value = false
  if (返回.code === 10000) {
    数据.value = 返回.data
    setOptions()
  }
}

const on窗口尺寸变化 = () => {
  if (chart.value) chart.value.resize()
}

onMounted(async () => {
  await nextTick()
  chart.value = echarts.init(echart.value)
  setOptions()
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
