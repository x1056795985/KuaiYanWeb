<template>
  <el-dialog v-model="is对话框可见2" title="库存新增"
             :width="is移动端()?'90%':'760px'"
             @close="on对话框被关闭">
    <div style="overflow:auto;padding:0 12px;" v-loading="is加载中">
      <el-form :inline="Props.id>0" style="min-width: 80px" label-width="100px" :model="data"
               :label-position="is移动端()?'top':'right'">
        <el-form-item label="代理选择" prop="" style="width:100%">
          <el-cascader
              clearable
              placeholder="可以搜索用户名,点击代理左边圆点为选中"
              v-model="data.Uid"
              :options="Data代理"
              filterable
              style="width:100%"
              :key="'agent-tree'"
              :props='{ multiple:false, checkStrictly: true,label:"Label", value:"Value", children:"children" }'
          />
        </el-form-item>
        <el-form-item label="卡类选择" prop="" style="width:100%">
          <el-cascader
              placeholder="可以搜索卡类名称"
              v-model="data.KaClassId"
              :options="Data卡类"
              filterable
              style="width:100%"
              :key="'ka-class-tree'"
              :props='{  label:"label", value:"Value" }'
          />
        </el-form-item>

        <el-form-item label="库存可用数量" prop="Number">
          <el-input-number v-model="data.NumMax" :precision="0" :step="1" :value-on-clear="1" :min="1" :max="100000"/>
          <el-button @click="data.NumMax=1" :style="is移动端()?'width: 5vh':'width: 5vh'">
            归一
          </el-button>
          <el-button @click="data.NumMax+=10"
                     :style="is移动端()?'width: 9vh':'width: 4vh'">+10
          </el-button>
          <el-button @click="data.NumMax+=100"
                     :style="is移动端()?'width: 9vh':'width: 4vh'">+100
          </el-button>
        </el-form-item>
        <el-form-item label="有效期" prop="EndTime">
          <el-tooltip
              class="box-item"
              effect="light"
              :content="data.EndTime===0?'无限制':('剩余:'+时间_计算天时分秒提示 (data.EndTime-时间_取现行时间戳()))"
              placement="left"
          >
            <div>
              <el-config-provider :locale="zhCn">
                <el-date-picker
                    v-model.number="data.EndTime"
                    type="datetime"
                    format="YYYY/MM/DD HH:mm:ss"
                    value-format="X"
                />
              </el-config-provider>
              <el-button @click="data.EndTime=时间_取现行时间戳()" :style="is移动端()?'width: 5vh':'width: 4vh'">
                此刻
              </el-button>
              <el-button @click="data.EndTime+=86400" :style="is移动端()?'width: 9vh':'width: 4vh'">+1天</el-button>
              <el-button @click="data.EndTime+=86400*3" :style="is移动端()?'width: 9vh':'width: 4vh'">+3</el-button>
              <el-button @click="data.EndTime+=86400*30" :style="is移动端()?'width: 9vh':'width: 4vh'">+30</el-button>
              <el-button @click="data.EndTime+=86400*365" :style="is移动端()?'width: 9vh':'width: 4vh'">+365</el-button>
              <el-button @click="data.EndTime=0" :style="is移动端()?'width: 9vh':'width: 4vh'">无限制</el-button>
            </div>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="备注" prop="AdminNote">
          <el-input
              v-model="data.Note"
              placeholder="下级可以看到的备注"
          >
          </el-input>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <div class="dialog-footer" v-loading="is加载中">
        <el-button @click="is对话框可见2=false">取 消</el-button>
        <el-button type="primary" @click="on确定按钮被点击">确 定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {Get代理树和应用卡类树, New库存信息} from "@/api/代理库存管理api";
import {ElMessage} from "element-plus";
import {is移动端, 时间_取现行时间戳, 时间_时间戳到时间, 时间_计算天时分秒提示} from "@/utils/utils";
import {useStore} from "vuex";
import zhCn from "element-plus/es/locale/lang/zh-cn";

const Props = defineProps({
  id: {
    type: Number,
    default: 0
  },
})
const emit = defineEmits(['on对话框详细信息关闭'])
const on对话框被关闭 = () => {
  emit('on对话框详细信息关闭', is重新读取.value)
}

const is对话框可见2 = ref(true)

const data = ref({
  Uid: [],
  KaClassId: [],
  NumMax: 1,
  EndTime: 0,
  Note: "",
})

const is加载中 = ref(false)
const is重新读取 = ref(false)
const Store = useStore()
const on确定按钮被点击 = async () => {
  if (data.value.Uid.length == 0 || data.value.KaClassId.length == 0) {
    ElMessage.error("请选择代理用户名和库存所属卡类")
    return
  }
  is加载中.value = true
  let 返回;
  //Uid 是个数组,但是实际只需要最后一个成员为ID,所以改一下
  data.value.Uid = data.value.Uid[data.value.Uid.length - 1]
  data.value.KaClassId = data.value.KaClassId[data.value.KaClassId.length - 1]
  返回 = await New库存信息(data.value);
  is加载中.value = false
  console.log(返回)
  if (返回.code == 10000) {
    is重新读取.value = true
    is对话框可见2.value = false
ElMessage.success(返回.msg)
  }
}


onMounted(() => {
  console.info("用户详细信息对话框加载完毕了")
  on对话框被打开()
})


const on对话框被打开 = () => {
  is重新读取.value = false
  console.info("on对话框被打开")
  读取详细信息(Props.id)
  console.log(Props.id)
}

const 读取详细信息 = async (id: number) => {
  if (id != 0) {
    is重新读取.value = true
    let 返回 = await Get代理树和应用卡类树({"Id": id})
    is重新读取.value = false
    if (返回.code == 10000) {
      // Transform agentTree: map id→Value, user→Label, recurse children
      const transformAgentNode = (node: any): any => ({
        Value: node.id,
        Label: node.user,
        children: node.children?.map(transformAgentNode) || []
      })
      Data代理.value = 返回.data.agentTree.map(transformAgentNode)

      // Transform kaClassTree: ensure root Value is unique (id=0 appears many times)
      const transformKaClassNode = (node: any, index: number): any => ({
        Value: node.id === 0 ? `root-${index}` : node.id,
        label: node.label,
        children: node.children?.map((child: any, i: number) => transformKaClassNode(child, i)) || []
      })
      Data卡类.value = 返回.data.kaClassTree.map((node: any, i: number) => transformKaClassNode(node, i))
    } else {
      is重新读取.value = false
      is对话框可见2.value = false
    }
  }
}

const Data代理 = ref([])
const Data卡类 = ref([])

</script>

<style scoped lang="scss">

.li展示不可修改信息 {
  font-size: 16px;
  margin-left: 10px;
  float: left;
  clear: right;
  width: 100%;
  height: 30px;
  word-wrap: break-word;
  word-break: normal;
}

</style>
