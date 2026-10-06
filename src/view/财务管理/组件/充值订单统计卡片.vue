<template>
  <div v-loading="is加载中" element-loading-text="数据努力统计中..." class="汇总卡片行">
    <!-- 今日充值 -->
    <el-card shadow="never" class="汇总卡片">
      <div class="卡片标题">
        <span>今日充值</span>
        <el-tooltip content="今日成功订单充值总金额" placement="top">
          <el-icon class="提示图标">
            <InfoFilled/>
          </el-icon>
        </el-tooltip>
      </div>
      <div class="卡片数值">¥{{ 格式化金额(汇总.今日金额) }}</div>
      <div class="卡片底部">
        <span class="卡片副文本">{{ 汇总.今日单数 || 0 }} 笔</span>
        <span v-if="计算同比(汇总.今日金额, 汇总.昨日金额) !== null"
              :class="['同比', 计算同比(汇总.今日金额, 汇总.昨日金额) >= 0 ? '同比涨' : '同比跌']">
          {{ 计算同比(汇总.今日金额, 汇总.昨日金额) >= 0 ? '↑' : '↓' }} 较昨日 ¥{{ 格式化金额(汇总.昨日金额) }}
          {{ Math.abs(计算同比(汇总.今日金额, 汇总.昨日金额)) }}%
        </span>
        <span v-else class="同比">较昨日 ¥{{ 格式化金额(汇总.昨日金额) }} --</span>
      </div>
    </el-card>
    <!-- 本周充值 -->
    <el-card shadow="never" class="汇总卡片">
      <div class="卡片标题">
        <span>本周充值</span>
        <el-tooltip content="本周(周一起)成功订单充值总金额" placement="top">
          <el-icon class="提示图标">
            <InfoFilled/>
          </el-icon>
        </el-tooltip>
      </div>
      <div class="卡片数值">¥{{ 格式化金额(汇总.本周金额) }}</div>
      <div class="卡片底部">
        <span class="卡片副文本">{{ 汇总.本周单数 || 0 }} 笔</span>
      </div>
    </el-card>
    <!-- 本月充值 -->
    <el-card shadow="never" class="汇总卡片">
      <div class="卡片标题">
        <span>本月充值</span>
        <el-tooltip content="本月成功订单充值总金额" placement="top">
          <el-icon class="提示图标">
            <InfoFilled/>
          </el-icon>
        </el-tooltip>
      </div>
      <div class="卡片数值">¥{{ 格式化金额(汇总.本月金额) }}</div>
      <div class="卡片底部">
        <span class="卡片副文本">{{ 汇总.本月单数 || 0 }} 笔</span>
        <span v-if="计算同比(汇总.本月金额, 汇总.上月金额) !== null"
              :class="['同比', 计算同比(汇总.本月金额, 汇总.上月金额) >= 0 ? '同比涨' : '同比跌']">
          {{ 计算同比(汇总.本月金额, 汇总.上月金额) >= 0 ? '↑' : '↓' }} 较上月 ¥{{ 格式化金额(汇总.上月金额) }}
          {{ Math.abs(计算同比(汇总.本月金额, 汇总.上月金额)) }}%
        </span>
        <span v-else class="同比">较上月 ¥{{ 格式化金额(汇总.上月金额) }} --</span>
      </div>
    </el-card>
    <!-- 本月客单价 -->
    <el-card shadow="never" class="汇总卡片">
      <div class="卡片标题">
        <span>本月客单价</span>
        <el-tooltip content="本月充值总额 / 本月成功订单数" placement="top">
          <el-icon class="提示图标">
            <InfoFilled/>
          </el-icon>
        </el-tooltip>
      </div>
      <div class="卡片数值">¥{{ 格式化金额(汇总.本月客单价) }}</div>
      <div class="卡片底部">
        <span class="卡片副文本">上月 ¥{{ 格式化金额(汇总.上月金额) }}</span>
      </div>
    </el-card>
    <!-- 待处理订单 -->
    <el-card shadow="never" class="汇总卡片">
      <div class="卡片标题">
        <span>待处理订单</span>
        <el-tooltip content="等待支付+已付待处理的订单总数" placement="top">
          <el-icon class="提示图标">
            <InfoFilled/>
          </el-icon>
        </el-tooltip>
      </div>
      <div class="卡片数值" :style="汇总.待处理单数 > 0 ? 'color:#e6a23c' : ''">{{ 汇总.待处理单数 || 0 }}</div>
      <div class="卡片底部">
        <span class="卡片副文本">等待支付 / 已付待处理</span>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import {onMounted, ref} from "vue";
import {InfoFilled} from "@element-plus/icons-vue";
import {Get图表充值订单汇总} from "@/api/支付充值订单api.js";

const is加载中 = ref(false)
const 汇总 = ref({})

const 格式化金额 = (金额) => {
  return Number(金额 || 0).toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2})
}
// 同比增长率(%), 分母为0或无效时返回null
const 计算同比 = (当前, 上期) => {
  当前 = Number(当前 || 0)
  上期 = Number(上期 || 0)
  if (上期 <= 0) {
    return 当前 > 0 ? 100 : null
  }
  return Math.round((当前 - 上期) / 上期 * 1000) / 10
}

const on读取汇总 = async () => {
  is加载中.value = true
  const 返回 = await Get图表充值订单汇总()
  is加载中.value = false
  if (返回.code === 10000) {
    汇总.value = 返回.data
  }
}
onMounted(() => {
  on读取汇总()
})
</script>

<style lang="scss" scoped>
.汇总卡片行 {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;

  .汇总卡片 {
    flex: 1;
    min-width: 200px;

    :deep(.el-card__body) {
      padding: 14px 18px;
    }
  }
}

.卡片标题 {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #909399;

  .提示图标 {
    cursor: pointer;
  }
}

.卡片数值 {
  font-size: 24px;
  font-weight: 600;
  margin: 6px 0;
  color: #303133;
}

.卡片底部 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;

  .卡片副文本 {
    color: #909399;
  }

  .同比 {
    color: #909399;
  }

  .同比涨 {
    color: #f56c6c; //红涨
  }

  .同比跌 {
    color: #67c23a; //绿跌
  }
}
</style>
