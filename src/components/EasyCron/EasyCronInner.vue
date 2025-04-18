<template>
  <div class="easy-cron-inner">
    <div class="content">
      <el-tabs v-model="activeKey" type="border-card">
        <el-tab-pane label="秒" name="second" v-if="!hideSecond">
          <SecondUI v-model:value="second" :disabled="disabled"/>
        </el-tab-pane>
        <el-tab-pane label="分" name="minute">
          <MinuteUI v-model:value="minute" :disabled="disabled"/>
        </el-tab-pane>
        <el-tab-pane label="时" name="hour">
          <HourUI v-model:value="hour" :disabled="disabled"/>
        </el-tab-pane>
        <el-tab-pane label="日" name="day">
          <DayUI v-model:value="day" :week="week" :disabled="disabled"/>
        </el-tab-pane>
        <el-tab-pane label="月" name="month">
          <MonthUI v-model:value="month" :disabled="disabled"/>
        </el-tab-pane>
        <el-tab-pane label="周" name="week">
          <WeekUI v-model:value="week" :day="day" :disabled="disabled"/>
        </el-tab-pane>
        <el-tab-pane label="年" name="year" v-if="!hideYear && !hideSecond">
          <YearUI v-model:value="year" :disabled="disabled"/>
        </el-tab-pane>
        <el-tab-pane label="常用循环" name="common">
          <div>
            <el-row v-for="row in buttonData" :key="row">
              <el-col :span="4" v-for="button in row" :key="button.text">
                <el-button :type="button.type" @click="emitValue(button.value)">{{ button.text }}</el-button>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>
      </el-tabs>
      <!-- 执行时间预览 -->
      <el-row :gutter="8">
        <el-col :span="18" style="margin-top: 22px">
          <el-row :gutter="8">
            <el-col :span="8" style="margin-bottom: 12px">
              <el-input v-model="inputValues.second" @blur="onInputBlur">
                <template #prepend>
                  <span class="allow-click" @click="activeKey = 'second'"> 秒 </span>
                </template>
              </el-input>
            </el-col>
            <el-col :span="8" style="margin-bottom: 12px">
              <el-input v-model="inputValues.minute" @blur="onInputBlur">
                <template #prepend>
                  <span class="allow-click" @click="activeKey = 'minute'"> 分 </span>
                </template>
              </el-input>
            </el-col>
            <el-col :span="8" style="margin-bottom: 12px">
              <el-input v-model="inputValues.hour" @blur="onInputBlur">
                <template #prepend>
                  <span class="allow-click" @click="activeKey = 'hour'"> 时 </span>
                </template>
              </el-input>
            </el-col>
            <el-col :span="8" style="margin-bottom: 12px">
              <el-input v-model="inputValues.day" @blur="onInputBlur">
                <template #prepend>
                  <span class="allow-click" @click="activeKey = 'day'">日</span>
                </template>
              </el-input>
            </el-col>
            <el-col :span="8" style="margin-bottom: 12px">
              <el-input v-model="inputValues.month" @blur="onInputBlur">
                <template #prepend>
                  <span class="allow-click" @click="activeKey = 'month'"> 月 </span>
                </template>
              </el-input>
            </el-col>
            <el-col :span="8" style="margin-bottom: 12px">
              <el-input v-model="inputValues.week" @blur="onInputBlur">
                <template #prepend>
                  <span class="allow-click" @click="activeKey = 'week'"> 周 </span>
                </template>
              </el-input>
            </el-col>
            <el-col :span="8">
              <el-input v-if="!hideYear && !hideSecond" v-model="inputValues.year" @blur="onInputBlur">
                <template #prepend>
                  <span class="allow-click" @click="activeKey = 'year'"> 年 </span>
                </template>
              </el-input>
            </el-col>
            <el-col :span="16">
              <el-input v-model="inputValues.cron" @blur="onInputCronBlur">
                <template #prepend>
                  <el-tooltip content="Cron表达式">
                    <span class="allow-click"> 式 </span>
                  </el-tooltip>
                </template>
              </el-input>
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="6">
          <div class="ten-times">近十次执行时间（不含年）</div>
          <el-input type="textarea" v-model="preTimeList" :rows="5"/>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, reactive, ref, watch, provide} from 'vue'
import CronParser from 'cron-parser'
import SecondUI from './tabs/SecondUI.vue'
import MinuteUI from './tabs/MinuteUI.vue'
import HourUI from './tabs/HourUI.vue'
import DayUI from './tabs/DayUI.vue'
import MonthUI from './tabs/MonthUI.vue'
import WeekUI from './tabs/WeekUI.vue'
import YearUI from './tabs/YearUI.vue'
import {cronEmits, cronProps} from './easy.cron.data'
import {dateFormat, simpleDebounce} from './compUtils'

provide('prefixCls', 'easy-cron-inner')
const emit = defineEmits([...cronEmits])
const props = defineProps({...cronProps})
//const activeKey = ref(props.hideSecond ? 'minute' : 'second')
const activeKey = ref('common')
const second = ref('*')
const minute = ref('*')
const hour = ref('*')
const day = ref('*')
const month = ref('*')
const week = ref('?')
const year = ref('*')
const inputValues = reactive({
  second: '',
  minute: '',
  hour: '',
  day: '',
  month: '',
  week: '',
  year: '',
  cron: '',
})
const preTimeList = ref('执行预览，会忽略年份参数。')

// cron表达式
const cronValueInner = computed(() => {
  const result: string[] = []
  if (!props.hideSecond) {
    result.push(second.value ? second.value : '*')
  }
  result.push(minute.value ? minute.value : '*')
  result.push(hour.value ? hour.value : '*')
  result.push(day.value ? day.value : '*')
  result.push(month.value ? month.value : '*')
  result.push(week.value ? week.value : '?')
  if (!props.hideYear && !props.hideSecond) {
    result.push(year.value ? year.value : '*')
  }
  return result.join(' ')
})
// 不含年
const cronValueNoYear = computed(() => {
  const v = cronValueInner.value
  if (props.hideYear || props.hideSecond) return v
  const vs = v.split(' ')
  if (vs.length >= 6) {
    // 转成 Quartz 的规则
    vs[5] = convertWeekToQuartz(vs[5])
  }
  return vs.slice(0, vs.length - 1).join(' ')
})
const calTriggerList = simpleDebounce(calTriggerListInner, 500)

watch(
    () => props.value,
    (newVal) => {
      if (newVal === cronValueInner.value) {
        return
      }
      formatValue()
    },
)

watch(cronValueInner, (newValue) => {
  calTriggerList()
  emitValue(newValue)
  assignInput()
})

// watch(minute, () => {
//   if (second.value === '*') {
//     second.value = '0'
//   }
// })
// watch(hour, () => {
//   if (minute.value === '*') {
//     minute.value = '0'
//   }
// })
// watch(day, () => {
//   if (day.value !== '?' && hour.value === '*') {
//     hour.value = '0'
//   }
// })
// watch(week, () => {
//   if (week.value !== '?' && hour.value === '*') {
//     hour.value = '0'
//   }
// })
// watch(month, () => {
//   if (day.value === '?' && week.value === '*') {
//     week.value = '1'
//   } else if (week.value === '?' && day.value === '*') {
//     day.value = '1'
//   }
// })
// watch(year, () => {
//   if (month.value === '*') {
//     month.value = '1'
//   }
// })

assignInput()
formatValue()
calTriggerListInner()

function assignInput() {
  inputValues.second = second.value
  inputValues.minute = minute.value
  inputValues.hour = hour.value
  inputValues.day = day.value
  inputValues.month = month.value
  inputValues.week = week.value
  inputValues.year = year.value
  inputValues.cron = cronValueInner.value
}

function formatValue() {
  if (!props.value) return
  const values = props.value.split(' ').filter((item) => !!item)
  if (!values || values.length <= 0) return
  let i = 0
  if (!props.hideSecond) second.value = values[i++]
  if (values.length > i) minute.value = values[i++]
  if (values.length > i) hour.value = values[i++]
  if (values.length > i) day.value = values[i++]
  if (values.length > i) month.value = values[i++]
  if (values.length > i) week.value = values[i++]
  if (values.length > i) year.value = values[i]
  assignInput()
}

// Quartz 的规则：
// 1 = 周日，2 = 周一，3 = 周二，4 = 周三，5 = 周四，6 = 周五，7 = 周六
function convertWeekToQuartz(week: string) {
  const convert = (v: string) => {
    if (v === '0') {
      return '1'
    }
    if (v === '1') {
      return '0'
    }
    return (Number.parseInt(v) - 1).toString()
  }
  // 匹配示例 1-7 or 1/7
  const patten1 = /^([0-7])([-/])([0-7])$/
  // 匹配示例 1,4,7
  const patten2 = /^([0-7])(,[0-7])+$/
  if (/^[0-7]$/.test(week)) {
    return convert(week)
  } else if (patten1.test(week)) {
    return week.replace(patten1, ($0, before, separator, after) => {
      if (separator === '/') {
        return convert(before) + separator + after
      } else {
        return convert(before) + separator + convert(after)
      }
    })
  } else if (patten2.test(week)) {
    return week
        .split(',')
        .map((v) => convert(v))
        .join(',')
  }
  return week
}

function calTriggerListInner() {
  // 设置了回调函数
  if (props.remote) {
    props.remote(cronValueInner.value, +new Date(), (v) => {
      preTimeList.value = v
    })
    return
  }
  const format = 'yyyy-MM-dd hh:mm:ss'
  const options = {
    currentDate: dateFormat(new Date(), format),
  }
  const iter = CronParser.parseExpression(cronValueNoYear.value, options)
  const result: string[] = []
  for (let i = 1; i <= 10; i++) {
    result.push(dateFormat(new Date(iter.next() as any), format))
  }
  preTimeList.value = result.length > 0 ? result.join('\n') : '无执行时间'
}

function onInputBlur() {
  second.value = inputValues.second
  minute.value = inputValues.minute
  hour.value = inputValues.hour
  day.value = inputValues.day
  month.value = inputValues.month
  week.value = inputValues.week
  year.value = inputValues.year
}

function onInputCronBlur(event: any) {
  emitValue(event.target.value)
}

function emitValue(value: any) {
  emit('change', value)
  emit('update:value', value)
}

const buttonData = [
  [
    {text: '每5秒执行一次', value: '0/5 * * * * ?', type: 'success'},
    {text: '每10秒', value: '0/10 * * * * ?', type: 'primary'},
    {text: '每30秒', value: '0/30 * * * * ?', type: 'info'}
  ],
  [
    {text: '每分钟', value: '0 * * * * ?', type: 'success'},
    {text: '每10分钟', value: '0 0/10 * * * ?', type: 'primary'},
    {text: '每30分钟', value: '0 0/30 * * * ?', type: 'info'}
  ],
  [
    {text: '每1小时', value: '0 0 * * * ?', type: 'success'},
    {text: '每6小时', value: '0 0 0/6 * * ?', type: 'primary'},
    {text: '每12小时', value: '0 0 0/12 * * ?', type: 'info'}
  ],
  [
    {text: '每天0点', value: '0 0 0 * * ?', type: 'success'},
    {text: '每3天0点', value: '0 0 0 0/3 * ?', type: 'primary'},
    {text: '每10天0点', value: '0 0 0 0/10 * ?', type: 'info'},
    {text: '每30天0点', value: '0 0 0 0/30 * ?', type: 'warning'}
  ]
];
</script>
<style lang="scss">
@import './easy.cron.inner.scss';
</style>
