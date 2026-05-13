<template>
  <div class="最底层div">
    <div class="内容div" style="align-items: center ">
      <el-form :inline="true">
        <el-form-item prop="status" style="width:250px">
          <el-config-provider :locale="zhCn">
            <el-date-picker
                v-model="对象_搜索条件.RegisterTime"
                value-format="X"
                type="daterange"
                unlink-panels
                range-separator="到"
                start-placeholder="日志开始日期"
                end-placeholder="日志结束日期"
                :shortcuts="数组_日志预选日期"
            />
          </el-config-provider>
        </el-form-item>
        <el-form-item label="任务类型" style="width:180px">
          <el-select v-model="对象_搜索条件.TaskType" clear>
            <el-option key="0" label="全部" :value="0"/>
            <el-option key="1" label="HTTP请求" :value="1"/>
            <el-option key="2" label="公共js" :value="2"/>
            <el-option key="3" label="SQL" :value="3"/>
          </el-select>
        </el-form-item>

        <el-form-item label="执行结果" style="width:150px">
          <el-select v-model="对象_搜索条件.Result" clear>
            <el-option key="0" label="全部" :value="0"/>
            <el-option key="1" label="成功" :value="1"/>
            <el-option key="2" label="失败" :value="2"/>
          </el-select>
        </el-form-item>

        <el-form-item prop="Keywords">
          <el-input class="搜索框"
                    v-model.trim="对象_搜索条件.Keywords"
                    placeholder="搜索内容"
                    style="top:0 ; width: auto;padding: 0;margin: 0"
                    clearable
          >
            <template #prepend>
              <el-select v-model="对象_搜索条件.Type" placeholder="名称" style="width: 100px;">
                <el-option label="定时任务id" :value="1"/>
                <el-option label="任务返回数据或失败原因" :value="2"/>
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
        <el-popconfirm title="确定删除勾选日志?" width="200"
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
              <el-icon v-if="is移动端()">
                <More/>
              </el-icon>
              <span v-else style="display:inline-flex;align-items:center;gap:4px;margin-left:10px;padding:5px 10px;border:1px solid rgb(235,238,245);border-radius:4px;cursor:pointer;font-size:14px;color:#606266;white-space:nowrap;">
                <el-icon style="margin:0!important;border:none!important;padding:0!important;font-size:14px;"><More/></el-icon>
                <span>更多功能</span>
              </span>
            </template>
            <li class="工具_更多_li" @click="on批量维护(1)">删除 全部</li>
            <li class="工具_更多_li" @click="on批量维护(2)">删除 7天前</li>
            <li class="工具_更多_li" @click="on批量维护(3)">删除30天前</li>
            <li class="工具_更多_li" @click="on批量维护(4)">删除90天前</li>
            <li class="工具_更多_li" @click="on批量删除用户名或关键字(5)">删任务返回关键字</li>
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
        <el-table-column prop="CronID" label="任务Id" width="80"/>
        <el-table-column prop="Type" label="任务类型" width="210">
          <template #default="scope">
            <el-tag size="small" :type="['primary','success','info','primary'][scope.row.Type]">
              {{ ["", "HTTP请求", "公共js", "SQL"][scope.row.Type] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="RunTime" label="执行时间" width="160">
          <template #default="scope">
            {{ 时间_时间戳到时间(scope.row.RunTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="KaType" label="结果" width="80">
          <template #default="scope">
            <el-tag size="small" effect="plain"
                    :type="scope.row.Result === 1 ? 'success' : scope.row.KaType === 2 ? 'warning' :'primary'">
              {{
                scope.row.Result === 1 ? '成功' : scope.row.Result === 2 ? '失败' : "未知" + scope.row.Result.toString()
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ReturnText" label="返回数据" show-overflow-tooltip="">
          <template #default="scope">
            <el-icon class="复制按钮" @click="置剪辑版文本(scope.row.ReturnText,'已复制到剪辑版')">
              <DocumentCopy/>
            </el-icon>
            {{ scope.row.ReturnText }}
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
</template>

<script lang="ts" setup>
import {onBeforeUnmount, onMounted, ref} from "vue";
import {GetLogList, Del批量删除, Del批量维护删除} from "@/api/定时任务日志api.js";
import {is移动端, 时间_时间戳到时间, 置剪辑版文本, 表格写入列宽数组, 表格读取列宽数组,} from "@/utils/utils";
import {useStore} from "vuex";
// 引入中文包
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import {More, RefreshRight} from "@element-plus/icons";


const on批量删除 = async () => {
  const ids = 表格被选中列表.value.map((item => item.Id))
  let 提交数据 = {"Ids": ids}

  is加载中.value = true
  const res = await Del批量删除(提交数据)
  is加载中.value = false
  console.log(res)
  if (res.code == 10000) {
    ElMessage.success(res.msg)
    on读取列表(1)
  }
}

const on批量维护 = async (Type) => {

  let 提交数据 = {"Type": Type}

  is加载中.value = true
  const res = await Del批量维护删除 (提交数据)
  is加载中.value = false
  console.log(res)
  if (res.code == 10000) {
    ElMessage.success(res.msg)
    on读取列表(1)
  }
}
const on批量删除用户名或关键字 = async (Type: number) => {
  ElMessageBox.prompt('请输入要删除的' + (Type === 5 ? '结果数据关键字' : '未知类型'), 'Tip', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
  })
      .then(async ({value}) => {
        if (value) {
          let 提交数据 = {"Type": Type, Keywords: value}
          is加载中.value = true
          const res = await Del批量维护删除(提交数据)
          is加载中.value = false
          if (res.code == 10000) {
            ElMessage.success(res.msg)
            on读取列表(1)
          }

        } else {
          ElMessage.info((Type === 5 ? '消息关键字' : '未知类型') + '不能为空')
        }
      })
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
      "User": "",
      "Time": 0,
      "Ip": "",
      "Count": 0,
      "Msg": ""
    }]
})
const Store = useStore()

const 对象_搜索条件 = ref({
  RegisterTime: ["", ""],
  Type: 1,
  Size: 10,
  Page: 1,
  Order: 2,
  Keywords: "",
  Count: 0,
  TaskType: 0,
  Result: 0

})

const on读取列表 = (Type: number) => {
  if (Type === 1) {
    对象_搜索条件.value.Count = 0 //只有翻页缓存总数数据,新搜索不缓存总数
  }
  console.log("对象_搜索条件")
  console.log(对象_搜索条件.value)
  onGetLogMoneyList()
}
const onReset = () => {
  对象_搜索条件.value = {
    RegisterTime: ["", ""],
    Type: 1,
    Size: 10,
    Page: 1,
    Order: 2,
    Keywords: "",
    Count: 0,
    TaskType: 0,
    Result: 0
  }
}


const is加载中 = ref(false)
const onGetLogMoneyList = async () => {
  is加载中.value = true
  const res = await GetLogList(对象_搜索条件.value)
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

  localStorage.setItem('列宽_定时任务日志', JSON.stringify(局_列宽数组));
}
const on表格列宽初始化 = () => {

  let 局_列宽数组文本 = localStorage.getItem('列宽_定时任务日志')
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
  if (Store.state.搜索_定时任务日志.Size != 0 && Store.state.搜索_定时任务日志.Size != null) {
    对象_搜索条件.value = Store.state.搜索_定时任务日志
    console.log("恢复搜索条件")
    console.log(Store.state.搜索_定时任务日志.Size)
    console.log(Store.state.搜索_定时任务日志)
  }
  await onGetLogMoneyList()
  on表格列宽初始化()
})

onBeforeUnmount(() => {
  console.log("事件在卸载之前触发")
  Store.commit("set搜索_定时任务日志", 对象_搜索条件.value)
})

const 数组_日志预选日期 = [{
  text: '今天',
  value: () => {
    const end = new Date()
    const start = new Date()
    start.setTime(start.getTime() - 3600 * 1000);
    return [start, end]
  }
}, {
  text: '最近1天',
  value: () => {
    const end = new Date()
    const start = new Date()
    start.setTime(start.getTime() - 3600 * 1000 * 24);
    return [start, end]
  }
},
  {
    text: '最近1周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    },
  },
  {
    text: '最近1个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    },
  },
  {
    text: '最近3个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    },
  },
]
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
