<template>
  <div class="最底层div">
    <div class="内容div" style="align-items: center ">
      <el-form :inline="true">
        <el-form-item>
        <el-tag effect="plain" >
          {{ 对象_搜索条件.TidName }}({{对象_搜索条件.Tid }})
        </el-tag>
        </el-form-item>
        <el-form-item>
          <el-input
                    v-model.number="对象_搜索条件.submitUid"
                    placeholder="生产者uid"
                    style="top:0 ; width: auto;padding: 0;margin: 0"
                    clearable
          >
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-input class="搜索框"
                    v-model.trim="对象_搜索条件.Keywords"
                    placeholder="搜索内容"
                    style="top:0 ; width: auto;padding: 0;margin: 0"
                    clearable
          >
            <template #prepend>
              <el-select v-model="对象_搜索条件.Type"  style="width: 130px;">
                <el-option label="生产数据" :value="1"/>
                <el-option label="消费数据" :value="2"/>
                <el-option label="Uuid" :value="3"/>
              </el-select>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item style="padding-left: 5px">
          <el-button type="primary" icon="search" @click="on读取列表">查询</el-button>
          <el-button icon="refresh" @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="内容div">
      <div class="gva-btn-list" style="background:#FAFAFAFF">
        <el-popconfirm title="确定删除勾选任务类型?" width="200" @confirm="on批量删除" confirm-button-text="确定"
                       cancel-button-text="取消">
          <template #reference>
            <el-button icon="warning" type="danger" style="margin: 8px 8px 8px;; width: 65px"
                       :disabled=is批量删除禁用>删除
            </el-button>
          </template>
        </el-popconfirm>

        <div class="工具栏">

          <el-popover placement="right" trigger="hover">
            <template #reference>
              <el-icon>
                <More/>
              </el-icon>
            </template>
            <li class="工具_更多_li" @click="on添加uuid到队列">添加uuid到队列</li>
            <li class="工具_更多_li" @click="on添加uuid到队列批量">批量添加选中uuid到队列</li>
          </el-popover>
          <el-tooltip content="分析"
                      effect="dark"
                      placement="top">
            <el-icon @click="is图表分析抽屉可见=true">
              <DataAnalysis/>
            </el-icon>
          </el-tooltip>
          <el-tooltip content="刷新"
                      effect="dark"
                      placement="top">
            <el-icon @click="on读取列表">
              <RefreshRight/>
            </el-icon>
          </el-tooltip>
        </div>
      </div>

      <el-table v-loading="is加载中" :data="List.List" border style="width: 100% ;white-space: pre-wrap;"
                ref="tableRef"
                @header-dragend="on表格列宽被改变"
                :max-height="tableHeight"
                @selection-change="on选择框被选择"
                :header-cell-style="{background:'#FAFAFAFF',color:'#606266'}">
        <el-table-column type="selection" width="45"/>
        <el-table-column prop="UUID" label="Uuid" width="120" show-overflow-tooltip="">
          <template #default="scope">
            <el-icon class="复制按钮" @click="置剪辑版文本(scope.row.uuid,'已复制到剪辑版')">
              <DocumentCopy/>
            </el-icon>
            {{ scope.row.uuid }}
          </template>
        </el-table-column>

        <el-table-column prop="TimeStart" label="创建时间" width="170" show-overflow-tooltip="">
          <template #default="scope">
            {{ 时间_时间戳到时间(scope.row.TimeStart) }}
          </template>
        </el-table-column>
        <el-table-column prop="Status" label="任务状态" width="90" show-overflow-tooltip="">
          <template #default="scope">
            <el-tooltip
                class="box-item"
                effect="dark"
                :content="scope.row.Err"
                placement="top"
                v-if="scope.row.Err"
            >
              <el-tag  effect="plain" :type="['primary', 'info', 'warning','success','danger'][scope.row.Status]">
                {{ 状态列表[scope.row.Status] }}
              </el-tag>
            </el-tooltip>
            <el-tag  v-else effect="plain" :type="['primary', 'info', 'warning','success','danger'][scope.row.Status]">
              {{ 状态列表[scope.row.Status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="TimeEnd" label="完成时间" width="170" show-overflow-tooltip="">
          <template #default="scope">
            {{scope.row.TimeEnd>0?时间_时间戳到时间(scope.row.TimeEnd):"" }}
            <el-progress     v-if="scope.row.TimeEnd==0" :percentage="scope.row.Status==1?0:计算进度条(scope.row.TimeStart)" :indeterminate="true"/>
          </template>
        </el-table-column>

        <el-table-column   label="生产者" width="130" show-overflow-tooltip="">
          <template #default="scope">
            {{ scope.row.SubmitAppId }}->{{ scope.row.SubmitUid }}
          </template>
        </el-table-column>
        <el-table-column prop="SubmitAppId" label="消费者" width="130" show-overflow-tooltip="">
          <template #default="scope">
            {{ scope.row.ReturnAppId }}->{{ scope.row.ReturnUid }}
          </template>
        </el-table-column>

        <el-table-column prop="SubmitData" label="生产提交数据" width="130" show-overflow-tooltip="">
          <template #default="scope">
            <el-icon class="复制按钮" @click="置剪辑版文本(scope.row.SubmitData,'已复制到剪辑版')">
              <DocumentCopy/>
            </el-icon>
            {{ scope.row.SubmitData }}
          </template>
        </el-table-column>
        <el-table-column prop="ReturnData" label="消费返回数据" width="130" show-overflow-tooltip="">
          <template #default="scope">
            <el-icon class="复制按钮" @click="置剪辑版文本(scope.row.ReturnData,'已复制到剪辑版')">
              <DocumentCopy/>
            </el-icon>
            {{ scope.row.ReturnData }}
          </template>
        </el-table-column>
        <el-table-column :fixed="is移动端()?false:'right'" label="操作" width="140">
          <template #default="scope">
            <el-button link type="primary" size="default" @click="on单个删除(scope.row.uuid)" style="color:#f56d6d">
              <el-icon color="#f56d6d" class="no-inherit">
                <Delete/>
              </el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
        <template v-slot:empty>
          <div slot="empty" style="text-align: left;">
            <el-empty description="居然没有数据啊"/>
          </div>
        </template>
      </el-table>

      <div class="demo-pagination-block">
        <el-config-provider :locale="zhCn">
          <el-pagination
              v-model:current-page="对象_搜索条件.Page"
              v-model:page-size="对象_搜索条件.Size"
              :page-sizes="[10, 20, 30, 40,50,100]"
              size="small"
              :layout="is移动端()?'total,prev, pager, next':'total, sizes, prev, pager, next, jumper'"
              :pager-count="is移动端()?5:9"
              :total="parseInt( List.Count)"
              @current-change="on读取列表"
          />
        </el-config-provider>
      </div>
    </div>
  </div>
  <ChartData v-if="is图表分析抽屉可见" @on图表分析抽屉关闭="is图表分析抽屉可见 = false" :Tid="对象_搜索条件.Tid"/>
</template>

<script lang="ts" setup>
import {onBeforeUnmount, onMounted, ref} from "vue";
import {
  添加uuid到队列,
  添加uuid到队列批量
} from "@/api/任务池api.js";
import {
  Del批量删除Ka,
  GetTaskPoolDataList
} from "@/api/任务池数据api.js";
import {
  时间_时间戳到时间,
  时间_取现行时间戳,
  is移动端,
  表格读取列宽数组,
  表格写入列宽数组,
  置剪辑版文本
} from "@/utils/utils";
import {useStore} from "vuex";
// 引入中文包
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import {ElMessage, ElMessageBox} from 'element-plus'
import {Delete} from "@element-plus/icons-vue";
import Userinfo from "@/view/二开扩展/组件/任务类型详细信息.vue";
import {SetUserStatus} from "@/api/用户信息api";
import service from "@/api/request";
import {SaveInfoSMS} from "@/api/系统设置api";
// table元素
import {useTableHeight} from "@/composables/useTableHeight";
import ChartData from "@/view/应用管理/组件/任务池数据图表抽屉.vue";
const { tableRef, tableHeight, updateTableHeight } = useTableHeight(85)
const 状态列表 = ["", "已创建", "处理中", "成功", "失败"]

const 计算进度条 =   (TimeStart: number) => {
  //计算属性,按300秒计算百分比 没完成永远90
  let 局_值= 时间_取现行时间戳()-TimeStart
  if (局_值>300 || 局_值<0) {
    return 95
  }
  //取整数
  局_值= Math.floor(局_值/300*100)
  return 局_值
};
const on单个删除 = async (id: string) => {


  const res = await Del批量删除Ka({"Uuids": [id]})
  console.log(res)
  if (res.code == 10000) {
    ElMessage.success(res.msg)
    on读取列表()
  }
}


const on添加uuid到队列 = async () => {
  ElMessageBox.prompt('请输入uuid', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  })
      .then(async ({value}) => {
        let 返回;
        is加载中.value = true
        返回 = await 添加uuid到队列({uuid: value});
        is加载中.value = false
        console.log(返回)
        if (返回.code == 10000) {
          ElMessage.success(返回.msg)
        }
      })
      .catch(() => {
      })
}

const on添加uuid到队列批量 = async () => {
  const ids = 表格被选中列表.value.map((item => item.uuid))
  console.log(ids)
  const res = await 添加uuid到队列批量({"Uuids": ids})
  console.log(res)
  if (res.code == 10000) {
    ElMessage.success(res.msg)
    on读取列表()
  }
}

const on批量删除 = async () => {
  const ids = 表格被选中列表.value.map((item => item.uuid))
  console.log(ids)
  const res = await Del批量删除Ka({"Uuids": ids})
  console.log(res)
  if (res.code == 10000) {
    ElMessage.success(res.msg)
    on读取列表()
  }
}


const 表格被选中列表 = ref([])
const is批量删除禁用 = ref(true)
const is工具_更多 = ref(false)

const is对话框可见 = ref(false)
const is对话框id = ref(0)
const on对话框详细信息打开 = (id: number) => {
  is对话框可见.value = true
  is对话框id.value = id
}
const on对话框详细信息关闭 = (is重新读取: boolean) => {
  //console.info("父组件收到对话框被关闭了")
  is对话框可见.value = false
  is对话框id.value = 0
  if (is重新读取) {
    on读取列表()
  }
}

const on选择框被选择 = (val: any) => {
  表格被选中列表.value = val
  is批量删除禁用.value = 表格被选中列表.value.length == 0
}

interface DB_TaskPoolData {
  Uuid: string
  Tid: number
  TimeStart: number
  TimeEnd: number
  SubmitData: string
  ReturnData: string
  Status: number //1 已创建,2任务处理中,3成功,4任务失败
  SubmitAppId: number
  SubmitUid: number
}

const List = ref<{Count:number,List:DB_TaskPoolData[] }>([])

const Store = useStore()
const 对象_搜索条件 = ref({Type: 2, Size: 10, Page: 1, Keywords: "",Order:2,Tid:4,submitUid:0,TidName:"任务类型名称"})

const on读取列表 = () => {
  console.log("对象_搜索条件")
  console.log(对象_搜索条件.value)
  onGetList()
}


const is加载中 = ref(false)
const onGetList = async () => {
  is加载中.value = true
  const res = await GetTaskPoolDataList(对象_搜索条件.value)
  console.log(res)
  is加载中.value = false
  List.value = res.data
  Store.commit("set搜索_默认选择应用AppId", 对象_搜索条件.value.AppId)

}

const on表格列宽被改变 = (newWidth: any, oldWidth: any, columns: any, event: any) => {
  let 局_列宽数组: number[] = 表格读取列宽数组(tableRef.value)
  localStorage.setItem('列宽_任务池数据', JSON.stringify(局_列宽数组));
}
const on表格列宽初始化 = () => {

  let 局_列宽数组文本 = localStorage.getItem('列宽_任务池数据')
  if (局_列宽数组文本 != null) {
    let 局_列宽数组: number[] = JSON.parse(局_列宽数组文本)
    表格写入列宽数组(tableRef.value, 局_列宽数组)
  }
}




onMounted(() => {
  //如果 Store zize 不为0 且不为 null  才读取,不然就使用默认的
  let 局_临时= Store.state.搜索_任务池数据
  对象_搜索条件.value=局_临时
  console.log("恢复搜索条件")
  console.log(Store.state.搜索_任务池数据.Size)
  console.log(Store.state.搜索_任务池数据)


  onGetList()
  on表格列宽初始化()
})

onBeforeUnmount(() => {
  console.log("事件在卸载之前触发")
  Store.commit("set搜索_任务池数据", 对象_搜索条件.value)
})
const onReset = () => {
  对象_搜索条件.value.Page=1
  对象_搜索条件.value.Type=1
  对象_搜索条件.value.Keywords=""
  onGetList()
}
/// 抽屉图表
const is图表分析抽屉可见 = ref(false)




</script>

<style scoped lang="scss">
.el-table .cell {
  white-space: pre-wrap; /*这是重点。文本换行*/

}

/*.gva-search-box {*/
/*  padding: 24px;*/
/*  padding-bottom: 2px;*/
/*  background-color: #fff;*/
/*  border-radius: 2px;*/
/*  margin-bottom: 12px;*/
/*}*/
.最底层div {
  min-height: calc(100vh - 200px);
  padding: 12px 16px;
  margin: 0 2px 10px;
  background: #f0f2f5;
}

.内容div {
  min-height: 20%;
  padding: 12px 16px;
  margin: 0 2px 10px;
  background: #ffffff;
}

.搜索框 {
  top: -5px;
  padding: 0 0;
  margin: 0 0 10px;
  align-items: center;
}

.demo-pagination-block {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}

.el-statistic__number {
  font-size: 18px;
  color: #eebe77;
}

.gva-btn-list {
  border: 1px solid rgb(235, 238, 245);
}

.工具栏 {
  margin: 7px 8px 8px;
  background: #fafafa;
  color: #606266;
  float: right;
  padding-right: 1px;

  .el-icon {
    /*设置边框阴影*/

    font-size: 16px;
    margin-left: 10px;
    padding: 5px;
    ///*边框 1px  颜色 */
    border: 1px solid rgb(235, 238, 245);
    color: #0c0d0e;
    //box-shadow: 2px 2px 3px 0 rgba(45, 75, 74, 0.6);
    speak: none;
    font-style: normal;
    font-variant: normal;
    text-transform: none;
    line-height: 1;
    vertical-align: baseline;
    display: inline-block;
    -webkit-font-smoothing: antialiased;
    cursor: pointer; //改变鼠标样式为手型
  }
}


.工具_更多 {
  background-color: #ffffff;
  width: 150px;
  margin: 0;
  /*边框 1px  颜色 */
  border: 1px solid #ccc;
  /*图层高度  3000  值大一点 会在顶层*/
  z-index: 3000;
  /*定位方式 绝对定位*/
  position: absolute;
  list-style-type: none;
  border-radius: 4px; //设置圆角
  /*设置边框阴影*/
  box-shadow: 2px 2px 3px 0 rgba(45, 75, 74, 0.6);
  padding: 5px 0;
  font-size: 12px;

  li {
    margin: 0;
    padding: 7px 16px;
    //设置 鼠标悬停时样式
    &:hover {
      background: #889aa4; //改变背景颜色
      cursor: pointer; //改变鼠标样式为手型
    }
  }

}

.工具_更多_li {
  list-style-type: none;
  font-size: 12px;
  margin: 0;
  padding: 7px 16px;
  //设置 鼠标悬停时样式
  &:hover {
    background: #889aa4; //改变背景颜色
    cursor: pointer; //改变鼠标样式为手型
  }
}

.el-form-item {
  padding: 0;
  margin: 0 15px 8px 0;
}

.el-table .cell {
  white-space: pre-line;
}
</style>
