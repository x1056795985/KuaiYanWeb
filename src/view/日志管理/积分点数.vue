<template>
  <div class="最底层div">
    <div class="内容div" style="align-items: center ">
      <el-form :inline="true">
        <el-form-item label="选择应用" prop="">
          <el-select v-model.number="对象_搜索条件.AppId" clear placeholder="请选择应用" filterable>
            <el-option :key="0" label="全部" :value="0"/>
            <el-option v-for="(item,index) in 数组AppId_Name" :key="item.Appid"
                       :label="item.AppName+'('+item.Appid.toString()+')'" :value="item.Appid"/>
          </el-select>
        </el-form-item>
        <el-form-item label="选择日志类型" prop="">
          <el-select v-model.number="对象_搜索条件.LogType" clear placeholder="选择日志类型" STYLE="width: 80px">
            <el-option :key="0" label="全部" :value="0"/>
            <el-option :key="1" label="积分" :value="1"/>
            <el-option :key="2" label="点数" :value="2"/>
            <el-option :key="3" label="时间" :value="3"/>
          </el-select>
        </el-form-item>
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


        <el-form-item prop="Keywords">

          <el-input class="搜索框"
                    v-model.trim="对象_搜索条件.Keywords"
                    placeholder="搜索内容"
                    style="top:0 ; width: auto;padding: 0;margin: 0"
                    clearable
          >
            <template #prepend>
              <el-select v-model="对象_搜索条件.Type" placeholder="名称" style="width: 100px;">
                <el-option label="用户名" :value="1"/>
                <el-option label="消息" :value="2"/>
                <el-option label="Ip" :value="3"/>
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
              <el-icon>
                <More/>
              </el-icon>
            </template>

            <li class="工具_更多_li" @click="on批量删除(3)">删除 全部</li>
            <li class="工具_更多_li" @click="on批量删除(4)">删除 7天前</li>
            <li class="工具_更多_li" @click="on批量删除(5)">删除30天前</li>
            <li class="工具_更多_li" @click="on批量删除(6)">删除90天前</li>
            <li class="工具_更多_li" @click="on批量删除用户名或关键字(2)">删指定用户</li>
            <li class="工具_更多_li" @click="on批量删除用户名或关键字(7)">删消息关键字</li>
            <li class="工具_更多_li" @click="表格导出csv文本并下载(tableRef, '日志' + Date().toLocaleString())">导出到csv</li>
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
        <el-table-column prop="User" label="用户名" width="210" show-overflow-tooltip=""/>
        <el-table-column prop="AppId" label="应用名称" width="210" show-overflow-tooltip="">
          <template #default="scope">
            {{ MapAppId_Name.hasOwnProperty(scope.row.AppId.toString()) ? MapAppId_Name[scope.row.AppId.toString()] : '已删待改' + scope.row.AppId.toString()}}
          </template>
        </el-table-column>
        <el-table-column prop="Time" label="时间" width="160">
          <template #default="scope">
            {{ 时间_时间戳到时间(scope.row.Time) }}
          </template>
        </el-table-column>
        <el-table-column prop="Ip" label="IP" width="140" show-overflow-tooltip=""/>

        <el-table-column prop="Count" label="变化值" width="160">
          <template #default="scope">
            <el-tag
                 :type="scope.row.Type===1?'primary':scope.row.Type===2||scope.row.Type===3?'success':'warning'">
              {{scope.row.Type===1?'积分':scope.row.Type===2?'点数':scope.row.Type===3?'时间':'未知'}}
            </el-tag>
            {{scope.row.Count}}
          </template>
        </el-table-column>



        <el-table-column prop="Note" label="消息" :width="is移动端()?140:800" show-overflow-tooltip=""/>
              <template v-slot:empty >
          <div slot="empty"   style="text-align: left;">
            <el-empty description="居然没有数据啊" />
          </div>
        </template>
      </el-table>

      <div class="demo-pagination-block">
        <el-config-provider :locale="zhCn">
          <el-pagination
              v-model:current-page="对象_搜索条件.Page"
              v-model:page-size="对象_搜索条件.Size"
              :page-sizes="[10, 20, 30,  50,100,1000,10000]"
              :layout="is移动端()?'total,prev, pager, next':'total, sizes, prev, pager, next, jumper'"
              :pager-count="is移动端()?5:9"
              :total="parseInt(Data.Count.toString())"
              size="small"
              @current-change=" on读取列表(0) "
          />
        </el-config-provider>
      </div>
    </div>
  </div>
  <ChartData v-if="is图表分析抽屉可见" @on图表分析抽屉关闭="is图表分析抽屉可见 = false"/>
</template>

<script lang="ts" setup>
import {onBeforeUnmount, onMounted, ref} from "vue";
import {GetLogVipNumberList, Del批量删除LogVipNumber} from "@/api/积分点数api.js";
import {
  时间_时间戳到时间,
  时间_取现行时间戳,
  时间_计算天时分秒提示,
  is移动端,
  表格读取列宽数组,
  表格写入列宽数组, 表格导出csv文本并下载
} from "@/utils/utils";
import {useStore} from "vuex";
// 引入中文包
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import {Delete} from "@element-plus/icons-vue";
import {More, RefreshRight} from "@element-plus/icons";
import {GetAppIdNameList} from "@/api/应用列表api";
import ChartData from "@/view/日志管理/组件/积分点数消费图表抽屉.vue";
import {ElMessage} from "element-plus";

const is图表分析抽屉可见 = ref(false)

const MapAppId_Name = ref({})
const 数组AppId_Name = ref([{
  "Appid": 10000,
  "AppName": ""
}])
const onGetAppIdNameList = async () => {
  let res = await GetAppIdNameList()
  数组AppId_Name.value = res.data.Array
  MapAppId_Name.value = res.data.Map
  console.log("没有搜索条件的应用,修改第一个,现在搜索条件的值为:" + res.data.Map[对象_搜索条件.value.AppId.toString()])

  if (res.data.Map[对象_搜索条件.value.AppId.toString()] == null || 对象_搜索条件.value.AppId <= 10000) {
    // let 局_默认appid=Store.state.搜索_默认选择应用AppId
    // 对象_搜索条件.value.AppId = 数组AppId_Name.value.some(item => item.Appid === 局_默认appid)?局_默认appid:数组AppId_Name.value[0].Appid
  }

}
const on批量删除 = async (Type: number) => {
  let 提交数据 = {"Type": 0, "Id": [0], Keywords: ""}
  if (Type === 1) {
    const ids = 表格被选中列表.value.map((item => item.Id))
    提交数据 = {"Type": Type, "Id": ids, Keywords: ""}
  } else if (Type === 3) { //清空日志
    提交数据 = {"Type": Type, "Id": [], Keywords: ""}
  } else if (Type === 4) { //3天前日志
    提交数据 = {"Type": Type, "Id": [], Keywords: ""}
  } else if (Type === 5) { //30天前日志
    提交数据 = {"Type": Type, "Id": [], Keywords: ""}
  } else if (Type === 6) { //90天前日志
    提交数据 = {"Type": Type, "Id": [], Keywords: ""}
  } else {
    return
  }
  is加载中.value = true
  const res = await Del批量删除LogVipNumber(提交数据)
  is加载中.value = false
  console.log(res)
  if (res.code == 10000) {
ElMessage.success(res.msg)
    on读取列表(1)
  }
}

const on批量删除用户名或关键字 = async (Type: number) => {
  ElMessageBox.prompt('请输入要删除的' + (Type === 2 ? '用户名' : Type === 7 ? '消息关键字' : '未知类型'), 'Tip', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
  })
      .then(async ({value}) => {
        if (value != "") {
          let 提交数据 = {"Type": Type, "Id": [], Keywords: value}
          is加载中.value = true
          const res = await Del批量删除LogVipNumber(提交数据)
          is加载中.value = false
          if (res.code == 10000) {
ElMessage.success(res.msg)
            on读取列表(1)
          }

        } else {
          ElMessage.info((Type === 2 ? '用户名' : Type === 7 ? '消息关键字' : '未知类型') + '不能为空')
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
      "Msg": "",
      "AppId": 0,
      "Type": 1
    }]
})
const Store = useStore()
const 对象_搜索条件 = ref({
  RegisterTime: ["", ""],
  Type: 1,
  Size: 10,
  Page: 1,
  Keywords: "",
  Count: 0,
  LogType: 0,
  AppId: 0
})

const on读取列表 = (Type: number) => {
  if (Type === 1) {
    对象_搜索条件.value.Count = 0 //只有翻页缓存总数数据,新搜索不缓存总数
  }
  console.log("对象_搜索条件")
  console.log(对象_搜索条件.value)
  onGetLogVipNumberList()
}
const onReset = () => {
  对象_搜索条件.value = {
    RegisterTime: ["", ""],
    Type: 1,
    Size: 10,
    Page: 1,
    Keywords: "",
    Count: 0,
    LogType: 0,
    AppId: 0
  }
  onGetAppIdNameList()
}


const is加载中 = ref(false)
const onGetLogVipNumberList = async () => {
  is加载中.value = true
  const res = await GetLogVipNumberList(对象_搜索条件.value)
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
  let 局_列宽数组: number[] =表格读取列宽数组(tableRef.value)

  localStorage.setItem('列宽_积分点数', JSON.stringify(局_列宽数组));
}
const on表格列宽初始化 = () => {

  let 局_列宽数组文本 = localStorage.getItem('列宽_积分点数')
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
  if (Store.state.搜索_积分点数.Size != 0 && Store.state.搜索_积分点数.Size != null) {
    对象_搜索条件.value = Store.state.搜索_积分点数
    console.log("恢复搜索条件")
    console.log(Store.state.搜索_积分点数.Size)
    console.log(Store.state.搜索_积分点数)
  }
  await onGetAppIdNameList()
  await onGetLogVipNumberList()
  on表格列宽初始化()
})

onBeforeUnmount(() => {
  console.log("事件在卸载之前触发")
  Store.commit("set搜索_积分点数", 对象_搜索条件.value)
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
