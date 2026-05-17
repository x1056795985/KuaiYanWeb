<template>
  <el-dialog v-model="is对话框可见2" :title='"修改代理ID:"+Props.id.toString()+"授权:"'
             :width="is移动端()?'90%':'860px'"
             top="5%"
             @close="on对话框被关闭">

    <div v-loading="is加载中">
      <!-- 功能授权部分 -->
      <el-tooltip content="点击进入官网查看权限详细说明"
                  effect="dark"
                  placement="top">
        <el-divider><el-link href="https://www.fnkuaiyan.cn/%E6%8C%87%E5%8D%97/3%E7%BA%A7%E4%BB%A3%E7%90%86%E7%B3%BB%E7%BB%9F.html#代理权限说明" target="_blank">功能授权<el-icon><WarningFilled /></el-icon></el-link></el-divider>

      </el-tooltip>
      <div v-if="D代理功能_功能可见ID测 && Object.keys(D代理功能_功能可见ID测).length > 0">
        <el-checkbox-group v-model="D代理功能_功能已选中测" @change="on代理选中被改变">
          <el-checkbox v-for="(value, key) in D代理功能_功能可见ID测"
                       :key="key"
                       :label="key" 
                       border>
            {{ key }}
          </el-checkbox>
        </el-checkbox-group>
      </div>
      <div v-else>
        <el-text type="info">暂无功能权限可配置</el-text>
      </div>

        <el-tooltip content="应用必须有可以授权的卡类且卡类代理价格>0,才会显示到下方"
                    effect="dark"
                    placement="top">
          <el-divider>可制卡类授权<el-icon><WarningFilled /></el-icon></el-divider>
        </el-tooltip>

      <el-text></el-text>
      <el-tree
          ref="treeRef"
          :data="data"
          show-checkbox
          default-expand-all
          node-key="id"
          highlight-current

          :props="defaultProps"
          :class="customNodeClass"
      />
    </div>
    <template #footer>
      <div class="dialog-footer" v-loading="is加载中">
        <el-button
            @click="if (treeRef.value) { treeRef.value.setCheckedKeys([], false); } D代理功能_功能已选中测 = []">
          清空
        </el-button>
        <el-button @click="is对话框可见2=false">取 消</el-button>
        <el-popover
            placement="top-start"
            title="Title"
            :width="200"
            trigger="hover"
            content="取消某卡类Id,会取消该所有下级代理的该卡类ID,增加某卡类Id,不会授权下级代理,需要代理重新操作授权下级代理"
        >
          <template #reference>
            <el-button type="primary" @click="on确定按钮被点击(ruleFormRef)">确 定</el-button>
          </template>
        </el-popover>

      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {onMounted, Ref, ref, watch} from 'vue'
import {New用户信息, Save用户信息, Get用户详细信息, Get代理可制卡类列表, Set代理可制卡类列表} from "@/api/代理信息api";
import {ElMessage, FormInstance} from "element-plus";
import {is移动端, 时间_时间戳到时间} from "@/utils/utils";
import type {ElTree} from 'element-plus'
import type Node from 'element-plus/es/components/tree/src/model/node'

const Props = defineProps({
  id: {
    type: Number,
    default: 0
  },
})
const emit = defineEmits(['on对话框详细信息关闭'])

const customNodeClass = (data: Tree, node: Node) => {
  // 顶级节点没有 parent，所以用 node.level === 1 来判断
  if (node.level === 1) {
    return 'is-penultimate'
  }
  return null
}
const defaultProps = {
  children: 'children',
  label: 'label',
}

interface Tree {
  id: number
  label: string
  children?: Tree[]
}

const is加载中 = ref(false)
const D代理功能_功能已选中测 = ref([])
const D代理功能_功能可见ID测 = ref({})
//const D代理功能_功能可见ID测 =ref({卡号冻结: -1, 卡号解冻: -2, 卡号追回: -7})

const data = ref<Tree[]>([])

const treeRef = ref<InstanceType<typeof ElTree>>()
const getCheckedNodes = () => {
  console.log(treeRef.value!.getCheckedNodes(false, false))
}

const setCheckedKeys = () => {
  treeRef.value!.setCheckedKeys([3], false)
}
const on代理选中被改变 = (value: string[] | number[]) => {
  console.log(value)
  console.log(D代理功能_功能已选中测.value)
}


const on对话框被关闭 = () => {
  emit('on对话框详细信息关闭', is重新读取.value)
}

const is对话框可见2 = ref(true)
const is重新读取 = ref(false)
const on确定按钮被点击 = async (formEl: FormInstance | undefined) => {
  is加载中.value = true
  let 返回;
  let Kids: number[] = [];
  if (treeRef.value) {
    Kids = treeRef.value.getCheckedKeys(false)  //获取已选中卡号
  }
  
  // 添加功能权限到卡类ID列表
  for (let i = 0; i < D代理功能_功能已选中测.value.length; i++) {
    const funcId = D代理功能_功能可见ID测.value[D代理功能_功能已选中测.value[i]];
    if (funcId !== undefined && funcId !== null) {
      Kids.push(funcId);
    }
  }

  // 过滤掉ID为0的卡号（顶级分类）
  Kids = Kids.filter(num => num !== 0);
  
  // 去重
  Kids = [...new Set(Kids)];
  
  返回 = await Set代理可制卡类列表({Id: Props.id, Kid: Kids})
  is加载中.value = false
  console.log(返回)
  if (返回.code == 10000) {
    is重新读取.value = true
    is对话框可见2.value = false
    ElMessage.success(返回.msg)
  } else {
    ElMessage.error(返回.msg || '操作失败')
  }

}


onMounted(() => {
  console.info("用户详细信息对话框加载完毕了")
  on对话框被打开()
})

const on对话框被打开 = () => {
  is重新读取.value = false
  读取详细信息(Props.id)
}
const 读取详细信息 = async (id: number) => {
  if (id > 0) {
    is加载中.value = true
    let 返回 = await Get代理可制卡类列表({"Id": id})

    if (返回.code == 10000) {
      // 确保 KaList 存在且是数组
      data.value = Array.isArray(返回.data.kaList) ? 返回.data.kaList : [];
      
      // 确保 idListAuthority 是数组
      const idList = Array.isArray(返回.data.idListAuthority) ? 返回.data.idListAuthority : [];
      if (treeRef.value) {
        treeRef.value.setCheckedKeys(idList, false);
      }
      
      // 确保 functionList 是对象
      D代理功能_功能可见ID测.value = 返回.data.functionList || {};
      console.log(返回.data.functionList)
      
      // 初始化功能选中数组
      D代理功能_功能已选中测.value = [];
      
      // 处理功能权限
      if (返回.data.functionList && 返回.data.functionId) {
        for (let key in 返回.data.functionList) {
          const funcId = 返回.data.functionList[key];
          if (返回.data.functionId.includes(funcId)) {
            D代理功能_功能已选中测.value.push(key);
          }
        }
      }

    } else {
      is重新读取.value = false
      is对话框可见2.value = false
      ElMessage.error(返回.msg || '获取数据失败')
    }
    is加载中.value = false
  }
}

</script>

<style lang="scss">
//scoped 不能限定,不然不变色了
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

/*下面部分样式*/
.person_body {
  width: 1000px;
  display: flex;
  position: absolute;
  border-radius: 5px;
}

.person_body_left {
  width: 27%;
  height: 600px;
  border-radius: 5px;
  margin-right: 3%;
  text-align: center;
}

.person_body_list {
  width: 100%;
  height: 50px;
  margin-top: 25px;
  font-size: 22px;
  border-bottom: 1px solid #f0f0f0;
  background-image: -webkit-linear-gradient(
          left,
          rgb(42, 134, 141),
          #e9e625dc 20%,
          #3498db 40%,
          #e74c3c 60%,
          #09ff009a 80%,
          rgba(82, 196, 204, 0.281) 100%
  );
  -webkit-text-fill-color: transparent;
  -webkit-background-clip: text;
  -webkit-background-size: 200% 100%;
  -webkit-animation: masked-animation 4s linear infinite;
}

.is-penultimate > .el-tree-node__content {
  color: #626aef;
}


</style>
