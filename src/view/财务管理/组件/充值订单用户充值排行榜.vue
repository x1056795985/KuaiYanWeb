<template>
  <div v-loading="is加载中" element-loading-text="数据努力统计中..." class="dashboard-line-box"
       style="width: 100%;min-height: 360px;position:relative">
    <!--echarts绘图区域-->
    <div ref="echart" class="dashboard-line" style="width: 100%;min-height: 420px;z-index:99;position:absolute"></div>
    <!--切换按钮-->
    <div style="padding-left: 10px; z-index:999;float:left;position:absolute">
      <el-radio-group v-model="排行榜类型" size="small" @change="on读取图表数据">
        <el-radio-button :value="1">日榜(今日)</el-radio-button>
        <el-radio-button :value="2">周榜(本周)</el-radio-button>
        <el-radio-button :value="3">月榜(本月)</el-radio-button>
      </el-radio-group>
    </div>
  </div>
</template>

<script setup>
import * as echarts from 'echarts'
import {nextTick, onMounted, onUnmounted, ref, shallowRef} from 'vue'
import {is移动端} from "@/utils/utils";
import {Get图表充值订单用户排行} from "@/api/支付充值订单api.js";

const is加载中 = ref(false)
const 排行榜类型 = ref(1)
const chart = shallowRef(null)
const echart = ref(null)

const setOptions = (data) => {
  const 用户 = data.用户 || []
  const 金额 = data.金额 || []
  const 单数 = data.单数 || []
  //echarts横向柱状图y轴从下往上,反转数组让金额最高的显示在顶部
  const 用户倒序 = [...用户].reverse()
  const 金额倒序 = [...金额].reverse()
  const 单数倒序 = [...单数].reverse()
  //名次标注(顶部为第1名)
  const 名次数组 = 用户.map((_, i) => i + 1).reverse()

  chart.value.setOption({
    title: {
      text: '用户充值排行TOP10(应用-用户)',
      left: 'center',
      textStyle: {fontSize: 14}
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {type: 'shadow'},
      formatter: (params) => {
        const item = params[0]
        const 索引 = 用户倒序.length - 1 - item.dataIndex
        return `${item.name}<br/>${item.marker}充值: ¥${Number(金额[索引] || 0).toLocaleString('zh-CN')}<br/>单数: ${单数[索引] || 0} 笔`
      }
    },
    grid: {left: '3%', right: '12%', top: 50, bottom: '3%', containLabel: true},
    toolbox: {feature: {saveAsImage: {}}},
    xAxis: {
      type: 'value',
      axisLabel: {formatter: (值) => 值 >= 10000 ? (值 / 10000) + 'w' : 值}
    },
    yAxis: {
      type: 'category',
      data: 用户倒序,
      axisLabel: {
        fontSize: 11,
        formatter: (名称, 索引) => {
          const 名次 = 名次数组[索引]
          const 图标 = ['🥇', '🥈', '🥉']
          const 前缀 = 名次 <= 3 ? 图标[名次 - 1] : `No.${名次}`
          return 前缀 + ' ' + (名称.length > 14 ? 名称.slice(0, 14) + '…' : 名称)
        }
      }
    },
    series: [
      {
        name: '充值金额',
        type: 'bar',
        data: 金额倒序,
        itemStyle: {color: '#67C23A', borderRadius: [0, 4, 4, 0]},
        label: {
          show: !is移动端(),
          position: 'right',
          fontSize: 10,
          formatter: (p) => '¥' + Number(p.value || 0).toLocaleString('zh-CN')
        }
      }
    ]
  }, {notMerge: true})
}

const on读取图表数据 = async () => {
  is加载中.value = true
  const 返回 = await Get图表充值订单用户排行({Type: 排行榜类型.value})
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
  setOptions({用户: [], 金额: [], 单数: []})
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
    height: 460px;
    width: 100%;
  }
}
</style>
