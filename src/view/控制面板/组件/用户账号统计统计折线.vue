<template>
  <div v-loading="is加载中" element-loading-text="数据努力统计中..." class="dashboard-line-box" style="width: 100%;min-height: 360px;position:relative">
    <!--这里是echarts绘图区域-->
    <div
        ref="echart"
        class="dashboard-line"
        style="width: 100%;min-height: 200px;z-index:99;position:absolute"
    >
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
import {get图表用户账号统计} from "@/api/分析页Api.js";

const is加载中 = ref(false)
const 图表时间单位 = ref(1)
const chart = shallowRef(null)
const echart = ref(null)
const initChart = () => {
  chart.value = echarts.init(echart.value /* 'macarons' */)
  setOptions(1,
    [{ name: '本周注册', type: 'line', data: [120, 132, 101, 134, 90, 230, 210] },
     { name: '上周注册', type: 'line', data: [110, 122, 91, 114, 80, 210, 190] },
     { name: '本周登录', type: 'line', data: [220, 182, 191, 234, 290, 330, 310] },
     { name: '上周登录', type: 'line', data: [210, 172, 181, 224, 270, 310, 290] }]
  )
}

const setOptions = (单位, 本周期数据, 上周期数据) => {
  // 本周期数据: [{name:'注册数量',type:'line',data:[...]},{name:'登录数量',...}]
  // 上周期数据: 同结构(可选,用于对比)
  let series = []
  let legendData = []

  if (本周期数据 && 本周期数据.length >= 1) {
    series.push({ name: 单位 === 2 ? '本月注册' : '本周注册', type: 'line', data: 本周期数据[0].data, smooth: true, itemStyle: { color: '#409eff' }, lineStyle: { width: 2 } })
    legendData.push(单位 === 2 ? '本月注册' : '本周注册')
  }
  if (上周期数据 && 上周期数据.length >= 1) {
    series.push({ name: 单位 === 2 ? '上月注册' : '上周注册', type: 'line', data: 上周期数据[0].data, smooth: true, itemStyle: { color: '#a0cfff' }, lineStyle: { width: 2, type: 'dashed' } })
    legendData.push(单位 === 2 ? '上月注册' : '上周注册')
  }
  if (本周期数据 && 本周期数据.length >= 2) {
    series.push({ name: 单位 === 2 ? '本月登录' : '本周登录', type: 'line', data: 本周期数据[1].data, smooth: true, itemStyle: { color: '#67c23a' }, lineStyle: { width: 2 } })
    legendData.push(单位 === 2 ? '本月登录' : '本周登录')
  }
  if (上周期数据 && 上周期数据.length >= 2) {
    series.push({ name: 单位 === 2 ? '上月登录' : '上周登录', type: 'line', data: 上周期数据[1].data, smooth: true, itemStyle: { color: '#b3e19d' }, lineStyle: { width: 2, type: 'dashed' } })
    legendData.push(单位 === 2 ? '上月登录' : '上周登录')
  }

  let 图数据 = {
    title: {
      text: '用户统计'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
    },
    legend: {
      data: legendData,
      top: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
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
    series: series
  }
  图数据.title = is移动端() ? "" : 图数据.title
  //创建date变量
  let nowDate = new Date();

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

  chart.value.setOption(图数据, true)
}

const on读取图表数据 = async () => {
  is加载中.value=true
  try {
    // 同时请求当前周期和上一周期的数据
    // Offset=0: 当前7天/7月; Offset=-7: 上一周期7天/7月
    const [本周期返回, 上周期返回] = await Promise.all([
      get图表用户账号统计({Type: 图表时间单位.value, Offset: 0}),
      get图表用户账号统计({Type: 图表时间单位.value, Offset: -7})
    ])

    let 本周期数据 = null
    let 上周期数据 = null

    if (本周期返回.code === 10000) {
      本周期数据 = 本周期返回.data
    }
    if (上周期返回.code === 10000) {
      上周期数据 = 上周期返回.data
    }

    if (本周期数据) {
      setOptions(图表时间单位.value, 本周期数据, 上周期数据)
    }
  } finally {
    is加载中.value=false
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
