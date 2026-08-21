<template>
  <div class="最底层div">
    <el-tabs v-model="activeNames"  @tab-click="on折叠面板表项被打开">
      <el-tab-pane label="基础设置" name="基础设置">
        <template #title>
          <el-icon size="18" color="#73767a">
            <Tools/>
          </el-icon>
          基础设置
        </template>

        <SetBaseInfo></SetBaseInfo>
      </el-tab-pane>
      <el-tab-pane label="在线支付配置" name="在线支付配置">
        <template #title>
          <el-icon size="18" color="#73767a">
            <CreditCard/>
          </el-icon>
          在线支付配置
        </template>
        <SetPayInfo></SetPayInfo>
      </el-tab-pane>
      <el-tab-pane label="短信平台配置" name="短信平台配置">
        <template #title>
          <el-icon size="18" color="#73767a">
            <ChatSquare/>
          </el-icon>
          短信平台配置
        </template>
        <SetSmsInfo></SetSmsInfo>
      </el-tab-pane>
      <el-tab-pane label="行为验证码平台配置" name="行为验证码平台配置">
        <template #title>
          <el-icon size="18" color="#73767a">
            <ChatSquare/>
          </el-icon>
          行为验证码平台配置
        </template>
        <SetCaptcha2Info></SetCaptcha2Info>
      </el-tab-pane>
      <el-tab-pane label="云存储配置" name="云存储配置">
        <template #title>
          <el-icon size="18" color="#73767a">
            <ChatSquare/>
          </el-icon>
          云存储配置
        </template>
        <oss></oss>
      </el-tab-pane>
      <el-tab-pane label="AI配置" name="AI配置">
        <template #title>
          <el-icon size="18" color="#73767a">
            <MagicStick/>
          </el-icon>
          AI配置
        </template>
        <SetAiInfo></SetAiInfo>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts" setup>
import {ref, watch} from 'vue'
import {useRoute} from 'vue-router'
import SetPayInfo from "@/view/系统管理/组件/在线支付设置.vue";
import SetBaseInfo from "@/view/系统管理/组件/基础信息设置.vue";
import SetSmsInfo from "@/view/系统管理/组件/短信平台配置.vue";
import SetCaptcha2Info from "@/view/系统管理/组件/行为验证码平台配置.vue";
import oss from "@/view/系统管理/组件/云存储配置.vue";
import SetAiInfo from "@/view/系统管理/组件/AI配置.vue";


const route = useRoute()
const activeNames = ref((route.query.tab as string) || '基础设置')
watch(() => route.query.tab, (val) => {
  if (val) {
    activeNames.value = val as string
  }
})
const on折叠面板表项被打开 = (val: string[]) => {
  console.log(val)
}
</script>
