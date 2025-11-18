<template>
  <div class="最底层div">
    <div class="内容div" style="align-items: center ">
      <el-form :inline="true">
        <el-form-item prop="Keywords">
          <el-input class="搜索框"
                    v-model.trim="对象_搜索条件.Keywords"
                    placeholder="搜索内容"
                    style="top:0 ; width: auto;padding: 0;margin: 0"
                    clearable
          >
            <template #prepend>
              <el-select v-model="对象_搜索条件.Type" placeholder="名称" style="width: 100px;">
                <el-option label="id" :value="1"/>
                <el-option label="任务名称" :value="2"/>
              </el-select>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item style="padding-left: 5px">
          <el-button type="primary" icon="search" @click="on读取列表(1)">查询</el-button>
          <el-button icon="refresh" @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="内容div">
      <div class="gva-btn-list" style="background:#FAFAFAFF">
        <el-button icon="Plus" type="primary" style="margin: 8px 8px 8px; width: 65px" @click="on对话框详细信息打开(0)">
          新增
        </el-button>
        <el-popconfirm title="确定删除勾选?" width="200"
                       @confirm="on批量删除(1)" confirm-button-text="确定"
                       cancel-button-text="取消">
          <template #reference>
            <el-button icon="warning" type="danger" style="margin: 8px 8px 8px;; width: 65px"
                       :disabled=is批量删除禁用>删除
            </el-button>
          </template>
        </el-popconfirm>
        <div class="工具栏">
          <el-popover placement="right" trigger="click" width="100">
            <template #reference>
              <el-icon>
                <More/>
              </el-icon>
            </template>
            <li class="工具_更多_li" @click="on批量删除维护(1)">删除 全部</li>
          </el-popover>
          <el-tooltip content="刷新"
                      effect="dark"
                      placement="top">
            <el-icon @click="on读取列表(1)">
              <RefreshRight/>
            </el-icon>
          </el-tooltip>

        </div>
      </div>

      <el-table v-loading="is加载中" :data="Data.List" border style="width: 100% ;white-space: pre-wrap;"
                ref="tableRef"
                @header-dragend="on表格列宽被改变"
                :max-height="tableHeight"
                @selection-change="on选择框被选择"
                :header-cell-style="{background:'#FAFAFAFF',color:'#606266'}  ">
        <el-table-column type="selection" width="45"/>
        <el-table-column prop="Id" label="Id" width="80"/>
        <el-table-column prop="Name" label="任务名称" width="210" show-overflow-tooltip=""/>
        <el-table-column align="left" label="状态" prop="status" width="80">
          <template #default="scope">
            <el-switch
                :active-value="1"
                :inactive-value="2"
                v-model="scope.row.Status"
                class="ml-2"
                inline-prompt
                style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                active-text="启用"
                inactive-text="停用"
                @change="on任务状态被改变(scope.$index,scope.row.Id,scope.row.Status)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="Cron" label="Cron表达式" width="200" show-overflow-tooltip=""/>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="scope">
            <el-tag :type='["","primary", "warning", "danger"][scope.row.Type]'>
              {{ ["","HTTP", "公共函数", "SQL"][scope.row.Type]??("未知"+scope.row.Type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="Note" label="备注" width="200" show-overflow-tooltip=""/>
        <el-table-column :fixed="is移动端()?false:'right'" label="操作" :width="3*85">
          <template #default="scope">
            <el-button link type="primary" size="default" @click="on测试执行(scope.row.Id)"
                       style="color:#79bbff">
              <el-icon color="#79bbff" class="no-inherit">
                <MagicStick/>
              </el-icon>
              执行
            </el-button>
            <el-button link type="primary" size="default" @click="on单个编辑(scope.row.Id)"
                       style="color:#79bbff">
              <el-icon color="#79bbff" class="no-inherit">
                <Edit/>
              </el-icon>
              编辑
            </el-button>
            <el-button link type="primary" size="default" @click="on单个删除(scope.row.Id)"
                       style="color:#f56d6d">
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
              :total="parseInt( Data.Count)"
              @current-change="on读取列表(0)"
          />
        </el-config-provider>
      </div>
    </div>
  </div>
  <CronTaskInfo v-if="is对话框可见"  :id="Id"
                  @on对话框详细信息关闭="on对话框详细信息关闭"></CronTaskInfo>
</template>
<script lang="ts" setup>
import {onBeforeUnmount, onMounted, ref} from "vue";
import {GetList, Info, Create, DeleteInfo, Update, UpdateStatus, DeleteBatch, TestRunId} from "@/api/定时任务管理.js";
import {is移动端, 时间_时间戳到时间, 置剪辑版文本, 表格写入列宽数组, 表格读取列宽数组,} from "@/utils/utils";
import {useStore} from "vuex";
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import {More, RefreshRight} from "@element-plus/icons";
import CronTaskInfo from "./组件/定时任务详细信息.vue";

const on单个编辑 = async (Id: number) => {
  on对话框详细信息打开(Id)
}
const on单个删除 = async (id: number) => {
  is加载中.value = true
  const res = await DeleteInfo({Ids:[id]})
  is加载中.value = false
  console.log(res)
  if (res.code == 10000) {
    ElMessage.success(res.msg)
    on读取列表(1)
  }
}
const on测试执行 = async (id: number) => {
  is加载中.value = true
  const res = await TestRunId({Id:id})
  is加载中.value = false
  console.log(res)
  if (res.code == 10000) {
    ElMessage.success(res.msg)
  }
}
const on批量删除 = async (Type: number) => {
  const ids = 表格被选中列表.value.map((item => item.Id))
  is加载中.value = true
  const res = await DeleteInfo({Ids:ids})
  is加载中.value = false
  console.log(res)
  if (res.code == 10000) {
    ElMessage.success(res.msg)
    on读取列表(1)
  }
}
const on批量删除维护 = async (Type: number) => {
  is加载中.value = true
  const res = await DeleteBatch({Type:Type})
  is加载中.value = false
  console.log(res)
  if (res.code == 10000) {
    ElMessage.success(res.msg)
    on读取列表(1)
  }
}

const on任务状态被改变 = async (表项索引: number, ID: number, Status: number) => {

  const res = await UpdateStatus({"Id": ID, "Status": Status})
  console.log(res)
  if (res.code == 10000) {
    ElMessage.success(res.msg)
    return true
  } else {
    Data.value.List[表项索引].Status = Status == 1 ? 2 : 1
    return false
  }
}
const 表格被选中列表 = ref([])
const is批量删除禁用 = ref(true)
const on选择框被选择 = (val: any) => {
  表格被选中列表.value = val
  is批量删除禁用.value = 表格被选中列表.value.length == 0
}

const Data = ref({
  "Count": 0,
  "List": [
    {
      "Id": 1,
      "Name": "",
      "Status": 1,
      "Cron": "",
      "Type": 1,
      "RunText": "",
      "Note": ""
    }]
})

const Store = useStore()

const 对象_搜索条件 = ref({
  Page: 1,
  Size: 10,
  Type: 2,
  Keywords: "",
  Order: 2,
  Count: 0,
})

const on读取列表 = (Type: number) => {
  if (Type === 1) {
    对象_搜索条件.value.Count = 0 //只有翻页缓存总数数据,新搜索不缓存总数
  }
  console.log("对象_搜索条件")
  console.log(对象_搜索条件.value)
  onGetList()
}
const onReset = () => {
  对象_搜索条件.value = {
    Page: 1,
    Size: 10,
    Type: 2,
    Keywords: "",
    Order: 2,
    Count: 0,
  }
}


const is加载中 = ref(false)
const onGetList = async () => {
  is加载中.value = true
  const res = await GetList(对象_搜索条件.value)
  is加载中.value = false
  console.log(res)
  Data.value = res.data
  对象_搜索条件.value.Count = Data.value.Count
  Store.commit("set搜索_默认选择应用AppId", 对象_搜索条件.value.AppId)

}


// table元素
import {useTableHeight} from "@/composables/useTableHeight";
const { tableRef, tableHeight, updateTableHeight } = useTableHeight(85)
const on表格列宽被改变 = (newWidth: any, oldWidth: any, columns: any, event: any) => {
  let 局_列宽数组: number[] = 表格读取列宽数组(tableRef.value)
  localStorage.setItem('列宽_定时任务', JSON.stringify(局_列宽数组));
}
const on表格列宽初始化 = () => {

  let 局_列宽数组文本 = localStorage.getItem('列宽_定时任务')
  if (局_列宽数组文本 != null) {
    let 局_列宽数组: number[] = JSON.parse(局_列宽数组文本)

    表格写入列宽数组(tableRef.value, 局_列宽数组)
  }
}



onMounted(async () => {
  Data.value = {
    "Count": 0,
    "List": []
  }
  onReset()
  if (Store.state.搜索_定时任务.Size != 0 && Store.state.搜索_定时任务.Size != null) {
    对象_搜索条件.value = Store.state.搜索_定时任务
    console.log("恢复搜索条件")
  }

  await onGetList()
  on表格列宽初始化()
})

onBeforeUnmount(() => {
  console.log("事件在卸载之前触发")
  Store.commit("set搜索_定时任务", 对象_搜索条件.value)
})

const is对话框可见=ref(false)
const Id = ref(0)
const on对话框详细信息打开 = (id: number) => {
  Id.value = id
  is对话框可见.value = true
}
const on对话框详细信息关闭 = (is重新读取: boolean) => {
  //console.info("父组件收到对话框被关闭了")
  is对话框可见.value = false
  if (is重新读取) {
    on读取列表(1)
  }
}

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
  padding: 2px 5px;
  //设置 鼠标悬停时样式
  &:hover {
    background: #889aa4; //改变背景颜色
    cursor: pointer; //改变鼠标样式为手型
  }
}

.el-form-item {
  padding: 0;
  margin: 0 10px 8px 0;
}

.el-table .cell {
  white-space: pre-line;
}
</style>
