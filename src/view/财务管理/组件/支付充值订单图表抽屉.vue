<template>
  <el-drawer v-model="is图表分析抽屉可见2" direction="ltr" @close="on抽屉被关闭" show-close  size="90%">
    <template #header>
<!--      <h4>set title by slot</h4>-->
    </template>
    <template #default>
      <div style="flex: auto;width: 100%">
        <Echarts余额充值消费折线/>
      </div>
      <el-row>
        <el-col :span="12">
          <div style="flex: auto;width: 100%">
            <Echarts余额消费排行/>
          </div>
        </el-col>
        <el-col :span="12">
          <div style="flex: auto;width: 100%">
            <Echarts余额增长排行/>
          </div>
        </el-col>
      </el-row>


    </template>
    <template #footer>
      <div style="flex: auto">

      </div>
    </template>
  </el-drawer>
</template>

<script setup lang='ts'>
import Echarts余额充值消费折线 from '@/view/控制面板/组件/余额充值消费折线.vue'
import Echarts余额消费排行 from '@/view/控制面板/组件/余额消费排行柱状图.vue'
import Echarts余额增长排行 from '@/view/控制面板/组件/余额增长排行柱状图.vue'
import {onMounted, ref} from "vue";


const Props = defineProps({
})
const emit = defineEmits(['on图表分析抽屉关闭'])

const is图表分析抽屉可见2 = ref(true)
onMounted(() => {
  console.info("图表分析加载完毕了")
})
const on抽屉被关闭 = () => {
  console.info("on对话框被关闭")
  is图表分析抽屉可见2.value = false
  emit('on图表分析抽屉关闭', false)
}

</script>

<style scoped css="scss">

</style>
