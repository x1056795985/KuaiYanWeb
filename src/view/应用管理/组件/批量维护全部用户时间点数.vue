<template>
  <el-dialog
      v-model="is显示对话框"
      :title="isAppType计点 ? '批量维护全部软件用户' : '批量维护全部软件用户'"
      width="1260px"
      draggable="draggable"
      @close="on对话框被关闭"
  >
    <div class="容器" v-loading="is加载中">
      <div class="头部信息">
        <div>AppId：{{ Props.AppInfo.AppId }}</div>
        <div>应用名称：{{ Props.AppInfo.AppName }}</div>
      </div>

      <el-tabs v-model="当前页签" class="页签">
        <el-tab-pane label="1.筛选用户" name="筛选用户"/>
        <el-tab-pane :disabled="!筛选结果.TaskId" label="2.修改数据" name="修改数据"/>
        <el-tab-pane :disabled="结果数据.UidList.length === 0" label="3.修改结果" name="修改结果"/>
      </el-tabs>

      <div v-if="当前页签 === '筛选用户'" class="页面内容">
        <el-form label-width="140px">
          <el-form-item label="账号状态:">
            <el-radio-group v-model="筛选表单.UserVipTimeStatus">
              <el-radio-button :value="1">全部</el-radio-button>
              <el-radio-button :value="2">{{ isAppType计点 ? '无点数' : '会员已到期' }}</el-radio-button>
              <el-radio-button :value="3">{{ isAppType计点 ? '有点数' : '会员未过期' }}</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item :label="isAppType卡号 ? '账号前缀(卡号):' : '账号前缀:'">
            <el-input v-model.trim="筛选表单.UserPrefix" placeholder="可空" style="max-width: 320px"/>
          </el-form-item>

          <el-form-item label="用户类型:">
            <el-select
                v-model="筛选表单.UserClassId"
                multiple
                collapse-tags
                collapse-tags-tooltip
                placeholder="可空"
                style="width: 320px"
            >
              <el-option
                  v-for="item in Props.UserClassId"
                  :key="item.Id"
                  :label="item.Name"
                  :value="item.Id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="首次登录时间范围:">
            <el-config-provider :locale="zhCn">
              <el-date-picker
                  v-model="首次登录时间数组"
                  value-format="X"
                  type="daterange"
                  unlink-panels
                  range-separator="到"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  :shortcuts="时间快捷选项"
              />
            </el-config-provider>
          </el-form-item>
        </el-form>

        <div class="筛选操作区">
          <el-button type="primary" @click="on查询符合用户数">查询符合用户数</el-button>
          <el-button v-if="筛选结果.Count > 0" type="success" @click="当前页签 = '修改数据'">
            下一步修改数据
          </el-button>
        </div>

        <el-alert
            v-if="筛选结果.已查询"
            :title="筛选结果.Count > 0 ? `符合条件用户数：${筛选结果.Count}` : '没有符合条件的用户'"
            :type="筛选结果.Count > 0 ? 'success' : 'warning'"
            :closable="false"
        />

        <div v-if="筛选结果.UidPreview.length > 0" class="预览框">
          <div class="预览标题">UID预览{{ 筛选结果.HasMore ? '（仅展示前100个）' : '' }}</div>
          <el-input
              :model-value="筛选结果.UidPreview.join('\\n')"
              type="textarea"
              :rows="8"
              readonly
          />
        </div>
      </div>

      <div v-if="当前页签 === '修改数据'" class="页面内容">
        <el-alert
            :title="`已锁定符合条件用户 ${筛选结果.Count} 个，如需重新筛选请返回上一步。`"
            type="info"
            :closable="false"
            show-icon
        />

        <el-form label-width="180px" class="修改表单">
          <el-form-item :label="`${时间字段标题}:`">
            <div class="字段编辑区">
              <el-select v-model="修改表单.VipTimeType" style="width: 120px">
                <el-option label="不修改" :value="0"/>
                <el-option label="增加" :value="1"/>
                <el-option label="减少" :value="2"/>
                <el-option label="指定" :value="3"/>
              </el-select>

              <template v-if="修改表单.VipTimeType !== 0">
                <template v-if="isAppType计点 || 修改表单.VipTimeType !== 3">
                  <el-tooltip
                      v-if="!isAppType计点"
                      :content="时间_计算天时分秒提示(Math.abs(修改表单.VipTimeValue))"
                      placement="top"
                  >
                    <el-input-number
                        v-model="修改表单.VipTimeValue"
                        :precision="0"
                        :step="1"
                        :min="0"
                        :value-on-clear="0"
                        style="width: 220px"
                    />
                  </el-tooltip>
                  <el-input-number
                      v-else
                      v-model="修改表单.VipTimeValue"
                      :precision="0"
                      :step="1"
                      :min="0"
                      :value-on-clear="0"
                      style="width: 220px"
                  />
                </template>
                <el-config-provider v-else :locale="zhCn">
                  <el-date-picker
                      v-model="指定时间值"
                      value-format="X"
                      type="datetime"
                      style="width: 220px"
                      @change="on指定时间变化"
                  />
                </el-config-provider>

                <div class="快捷按钮区">
                  <template v-if="isAppType计点">
                    <el-button @click="修改表单.VipTimeValue = 0">归零</el-button>
                    <el-button @click="修改表单.VipTimeValue += 10">+10</el-button>
                    <el-button @click="修改表单.VipTimeValue += 100">+100</el-button>
                    <el-button @click="修改表单.VipTimeValue += 500">+500</el-button>
                  </template>
                  <template v-else>
                    <el-button @click="on设置时间快捷值(0)">归零</el-button>
                    <el-button @click="on设置时间快捷值(86400)">+1天</el-button>
                    <el-button @click="on设置时间快捷值(86400 * 3)">+3</el-button>
                    <el-button @click="on设置时间快捷值(86400 * 30)">+30</el-button>
                    <el-button @click="on设置时间快捷值(86400 * 365)">+365</el-button>
                  </template>
                </div>
              </template>
            </div>
          </el-form-item>

          <el-form-item label="积分:">
            <div class="字段编辑区">
              <el-select v-model="修改表单.VipNumberType" style="width: 120px">
                <el-option label="不修改" :value="0"/>
                <el-option label="增加" :value="1"/>
                <el-option label="减少" :value="2"/>
                <el-option label="指定" :value="3"/>
              </el-select>
              <template v-if="修改表单.VipNumberType !== 0">
                <el-input-number
                    v-model="修改表单.VipNumberValue"
                    :precision="0"
                    :step="1"
                    :min="0"
                    :value-on-clear="0"
                    style="width: 220px"
                />
                <div class="快捷按钮区">
                  <el-button @click="修改表单.VipNumberValue = 0">归零</el-button>
                  <el-button @click="修改表单.VipNumberValue += 10">+10</el-button>
                  <el-button @click="修改表单.VipNumberValue += 100">+100</el-button>
                  <el-button @click="修改表单.VipNumberValue += 500">+500</el-button>
                </div>
              </template>
            </div>
          </el-form-item>

          <el-form-item label="备注:">
            <div class="字段编辑区">
              <el-select v-model="修改表单.NoteType" style="width: 120px">
                <el-option label="不修改" :value="0"/>
                <el-option label="修改" :value="1"/>
                <el-option label="追加" :value="2"/>
              </el-select>
              <template v-if="修改表单.NoteType !== 0">
                <el-input
                    v-model="修改表单.NoteValue"
                    type="textarea"
                    :rows="2"
                    placeholder="备注内容"
                    style="width: 560px"
                />
              </template>
            </div>
          </el-form-item>

          <el-form-item label="最大同时在线数量:">
            <div class="字段编辑区">
              <el-select v-model="修改表单.MaxOnlineType" style="width: 120px">
                <el-option label="不修改" :value="0"/>
                <el-option label="增加" :value="1"/>
                <el-option label="减少" :value="2"/>
                <el-option label="指定" :value="3"/>
              </el-select>
              <template v-if="修改表单.MaxOnlineType !== 0">
                <el-input-number
                    v-model="修改表单.MaxOnlineValue"
                    :precision="0"
                    :step="1"
                    :min="0"
                    :value-on-clear="0"
                    style="width: 220px"
                />
              </template>
            </div>
          </el-form-item>

          <el-form-item :label="'用户类型'+(修改表单.UserClassType=== 1 ? 修改表单.UserClassId : '')">
            <div class="字段编辑区">
              <el-select v-model="修改表单.UserClassType" style="width: 120px">
                <el-option label="不修改" :value="0"/>
                <el-option label="修改为" :value="1"/>
              </el-select>
              <template v-if="修改表单.UserClassType === 1">
                <el-select v-model="修改表单.UserClassId" placeholder="所有用户类型..." style="width: 320px">
                  <el-option
                      v-for="item in Props.UserClassId"
                      :key="item.Id"
                      :label="item.Name"
                      :value="item.Id"
                  />
                </el-select>
              </template>
            </div>
          </el-form-item>

          <el-form-item label="归属代理Uid:">
            <div class="字段编辑区">
              <el-select v-model="修改表单.AgentUidType" style="width: 120px">
                <el-option label="不修改" :value="0"/>
                <el-option label="指定" :value="1"/>
              </el-select>
              <template v-if="修改表单.AgentUidType === 1">
                <el-input-number
                    v-model="修改表单.AgentUidValue"
                    :precision="0"
                    :step="1"
                    :min="0"
                    :value-on-clear="0"
                    style="width: 220px"
                />
              </template>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <div v-if="当前页签 === '修改结果'" class="页面内容">
        <el-alert title="修改成功" type="success" :closable="false" show-icon/>

        <div class="结果说明">
          <div class="结果标题">本次修改内容</div>
          <div v-for="item in 修改摘要" :key="item" class="结果项">{{ item }}</div>
        </div>

        <div class="结果说明">
          <div class="结果标题">修改成功的UID列表</div>
          <div class="提示行">
            <span>如果修改错误，请按照UID处理。</span>
            <el-button link type="primary" @click="on复制Uid列表">复制UID列表</el-button>
          </div>
          <el-input
              :model-value="结果Uid文本"
              type="textarea"
              :rows="12"
              readonly
          />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button v-if="当前页签 === '修改数据'" @click="当前页签 = '筛选用户'">上一步</el-button>
        <el-button @click="is显示对话框 = false">{{ 当前页签 === '修改结果' ? '关闭' : '取消' }}</el-button>
        <el-button
            v-if="当前页签 === '修改数据'"
            type="primary"
            @click="on确定修改"
        >
          确定修改
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import {ElMessage} from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import {Get批量维护全部用户筛选结果, Set批量维护全部用户数据} from '@/api/软件用户api'
import {时间_时间戳到时间, 时间_取现行时间戳, 时间_计算天时分秒提示, 置剪辑版文本} from '@/utils/utils'
import 用户类型 from "@/view/应用管理/用户类型.vue";

const Props = defineProps({
  AppInfo: {
    type: Object,
    default: () => ({})
  },
  UserClassId: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['on批量维护输入框被关闭'])

const is显示对话框 = ref(true)
const is加载中 = ref(false)
const is重新读取 = ref(false)
const 当前页签 = ref('筛选用户')

const 时间快捷选项 = [{
  text: '今天',
  value: () => {
    const end = new Date()
    const start = new Date()
    start.setTime(start.getTime() - 3600 * 1000)
    return [start, end]
  }
}, {
  text: '最近1天',
  value: () => {
    const end = new Date()
    const start = new Date()
    start.setTime(start.getTime() - 3600 * 1000 * 24)
    return [start, end]
  }
}, {
  text: '最近1周',
  value: () => {
    const end = new Date()
    const start = new Date()
    start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
    return [start, end]
  }
}, {
  text: '最近1个月',
  value: () => {
    const end = new Date()
    const start = new Date()
    start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
    return [start, end]
  }
}, {
  text: '最近3个月',
  value: () => {
    const end = new Date()
    const start = new Date()
    start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
    return [start, end]
  }
}]

const 筛选表单 = ref({
  UserVipTimeStatus: 1,
  UserPrefix: '',
  UserClassId: [] as number[]
})

const 首次登录时间数组 = ref<(string | null)[]>([null, null])

const 筛选结果 = ref({
  已查询: false,
  TaskId: '',
  Count: 0,
  UidPreview: [] as number[],
  HasMore: false
})

const 修改表单 = ref({
  VipTimeType: 0,
  VipTimeValue: 0,
  VipNumberType: 0,
  VipNumberValue: 0,
  NoteType: 0,
  NoteValue: '',
  MaxOnlineType: 0,
  MaxOnlineValue: 0,
  UserClassType: 0,
  UserClassId: 0,
  AgentUidType: 0,
  AgentUidValue: 0
})

const 指定时间值 = ref('')

const 结果数据 = ref({
  Count: 0,
  UidList: [] as number[]
})

const isAppType计点 = computed(() => Props.AppInfo.AppType === 2 || Props.AppInfo.AppType === 4)
const isAppType卡号 = computed(() => Props.AppInfo.AppType === 3 || Props.AppInfo.AppType === 4)
const 时间字段标题 = computed(() => isAppType计点.value ? '点数' : '时间')
const 用户类型Map = computed(() => {
  const map: Record<number, string> = {0: '不修改'}
  Props.UserClassId.forEach((item: any) => {
    map[item.Id] = item.Name
  })
  return map
})
const 结果Uid文本 = computed(() => 结果数据.value.UidList.join('\n'))
const 修改摘要 = computed(() => {
  const summary: string[] = [`符合条件用户数：${结果数据.value.Count}`]

  if (修改表单.value.VipTimeType > 0) {
    const 操作文本 = 获取增减指定文本(修改表单.value.VipTimeType)
    if (isAppType计点.value) {
      summary.push(`${时间字段标题.value}：${操作文本} ${修改表单.value.VipTimeValue}`)
    } else if (修改表单.value.VipTimeType === 3) {
      summary.push(`${时间字段标题.value}：指定为 ${时间_时间戳到时间(修改表单.value.VipTimeValue)}`)
    } else {
      summary.push(`${时间字段标题.value}：${操作文本} ${时间_计算天时分秒提示(修改表单.value.VipTimeValue)}`)
    }
  }

  if (修改表单.value.VipNumberType > 0) {
    summary.push(`积分：${获取增减指定文本(修改表单.value.VipNumberType)} ${修改表单.value.VipNumberValue}`)
  }

  if (修改表单.value.NoteType > 0) {
    const 文本 = 修改表单.value.NoteType === 1 ? '修改' : '追加'
    summary.push(`备注：${文本}${修改表单.value.NoteValue === '' ? '为空' : `为 ${修改表单.value.NoteValue}`}`)
  }

  if (修改表单.value.MaxOnlineType > 0) {
    summary.push(`最大同时在线数量：${获取增减指定文本(修改表单.value.MaxOnlineType)} ${修改表单.value.MaxOnlineValue}`)
  }

  if (修改表单.value.UserClassType === 1) {
    summary.push(`用户类型：指定为 ${用户类型Map.value[修改表单.value.UserClassId] ?? 修改表单.value.UserClassId}`)
  }

  if (修改表单.value.AgentUidType === 1) {
    summary.push(`归属代理Uid：指定为 ${修改表单.value.AgentUidValue}`)
  }

  return summary
})

watch(筛选表单, () => {
  on重置筛选结果()
}, {deep: true})

watch(首次登录时间数组, () => {
  on重置筛选结果()
}, {deep: true})

watch(() => 修改表单.value.VipTimeType, (val) => {
  if (val !== 3) {
    指定时间值.value = ''
  } else if (!isAppType计点.value && 修改表单.value.VipTimeValue > 0) {
    指定时间值.value = 修改表单.value.VipTimeValue.toString()
  }
})

watch(() => 修改表单.value.UserClassType, (val) => {
  if (val !== 1) {
    修改表单.value.UserClassId = 0
  }
})

const 获取筛选请求数据 = () => {
  return {
    AppId: Props.AppInfo.AppId,
    UserVipTimeStatus: 筛选表单.value.UserVipTimeStatus,
    UserPrefix: 筛选表单.value.UserPrefix,
    OneLoginTimeStart: Number(首次登录时间数组.value?.[0] ?? 0),
    OneLoginTimeEnd: Number(首次登录时间数组.value?.[1] ?? 0),
    UserClassId: 筛选表单.value.UserClassId
  }
}

const on重置筛选结果 = () => {
  筛选结果.value.TaskId = ''
  筛选结果.value.Count = 0
  筛选结果.value.UidPreview = []
  筛选结果.value.HasMore = false
  筛选结果.value.已查询 = false
  if (当前页签.value !== '筛选用户') {
    当前页签.value = '筛选用户'
  }
}

const on查询符合用户数 = async () => {
  if (!Props.AppInfo.AppId) {
    ElMessage.error('AppId不能为空')
    return
  }

  is加载中.value = true
  try {
    const res = await Get批量维护全部用户筛选结果(获取筛选请求数据())
    if (res.code === 10000) {
      筛选结果.value.已查询 = true
      筛选结果.value.TaskId = res.data.taskId ?? ''
      筛选结果.value.Count = res.data.count ?? 0
      筛选结果.value.UidPreview = res.data.uidPreview ?? []
      筛选结果.value.HasMore = res.data.hasMore ?? false
      if (筛选结果.value.Count > 0) {
        ElMessage.success(`符合条件用户数：${筛选结果.value.Count}`)
      } else {
        ElMessage.warning('没有符合条件的用户')
      }
    }
  } finally {
    is加载中.value = false
  }
}

const on指定时间变化 = (val: string) => {
  修改表单.value.VipTimeValue = Number(val || 0)
}

const on设置时间快捷值 = (增量: number) => {
  if (修改表单.value.VipTimeType === 3 && !isAppType计点.value) {
    if (增量 === 0) {
      修改表单.value.VipTimeValue = 0
      指定时间值.value = ''
      return
    }
    const 基准时间 = Math.max(修改表单.value.VipTimeValue || 0, 时间_取现行时间戳())
    修改表单.value.VipTimeValue = 基准时间 + 增量
    指定时间值.value = 修改表单.value.VipTimeValue.toString()
    return
  }

  if (增量 === 0) {
    修改表单.value.VipTimeValue = 0
    return
  }
  修改表单.value.VipTimeValue += 增量
}

const on确定修改 = async () => {
  if (!筛选结果.value.TaskId) {
    ElMessage.error('请先筛选用户')
    return
  }

  is加载中.value = true
  try {
    const res = await Set批量维护全部用户数据({
      TaskId: 筛选结果.value.TaskId,
      VipTimeType: 修改表单.value.VipTimeType,
      VipTimeValue: Number(修改表单.value.VipTimeValue),
      VipNumberType: 修改表单.value.VipNumberType,
      VipNumberValue: Number(修改表单.value.VipNumberValue),
      NoteType: 修改表单.value.NoteType,
      NoteValue: 修改表单.value.NoteValue,
      MaxOnlineType: 修改表单.value.MaxOnlineType,
      MaxOnlineValue: Number(修改表单.value.MaxOnlineValue),
      UserClassType: 修改表单.value.UserClassType,
      UserClassId: 修改表单.value.UserClassId,
      AgentUidType: 修改表单.value.AgentUidType,
      AgentUidValue: Number(修改表单.value.AgentUidValue)
    })
    if (res.code === 10000) {
      结果数据.value.Count = Number(res.data.count ?? 0)
      结果数据.value.UidList = res.data.uidList ?? []
      is重新读取.value = true
      当前页签.value = '修改结果'
      ElMessage.success(res.msg || '修改成功')
    }
  } finally {
    is加载中.value = false
  }
}

const on复制Uid列表 = () => {
  if (结果Uid文本.value === '') {
    ElMessage.warning('没有可复制的UID')
    return
  }
  置剪辑版文本(结果Uid文本.value, '已复制UID列表')
}

const 获取增减指定文本 = (type: number) => {
  if (type === 1) {
    return '增加'
  }
  if (type === 2) {
    return '减少'
  }
  if (type === 3) {
    return '指定'
  }
  return '不修改'
}

const on对话框被关闭 = () => {
  emit('on批量维护输入框被关闭', is重新读取.value)
}
</script>

<style scoped lang="scss">
.容器 {
  padding: 0 12px;
}

.头部信息 {
  display: flex;
  gap: 24px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #606266;
  flex-wrap: wrap;
}

.页签 {
  margin-bottom: 16px;
}

.页面内容 {
  min-height: 420px;
}

.筛选操作区 {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.预览框 {
  margin-top: 16px;
}

.预览标题 {
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.修改表单 {
  margin-top: 16px;
}

.字段编辑区 {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: nowrap;
  overflow-x: auto;
}

.快捷按钮区 {
  display: flex;
  gap: 8px;
  flex-wrap: nowrap;
  white-space: nowrap;
}

.结果说明 {
  margin-top: 18px;
}

.结果标题 {
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.结果项 {
  line-height: 26px;
  color: #606266;
}

.提示行 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  color: #909399;
}

@media screen and (max-width: 768px) {
  .提示行 {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
