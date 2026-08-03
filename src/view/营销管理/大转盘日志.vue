<template>
  <div class="最底层div">
    <div class="内容div" style="align-items: center ">
      <el-form :inline="true">
        <el-form-item label="选择应用" prop="">
          <el-select v-model.number="对象_搜索条件.AppId" clear placeholder="请选择应用" filterable>
            <el-option :key="0" label="全部" :value="0"/>
            <el-option v-for="(item,index) in 数组AppId_Name" :key="item.appId"
                       :label="item.appName+'('+item.appId.toString()+')'" :value="item.appId"/>
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
                start-placeholder="开始日期"
                end-placeholder="结束日期"
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
                <el-option label="卡类名称" :value="2"/>
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
        <el-popconfirm title="确定删除勾选记录?" width="200"
                       @confirm="on批量删除" confirm-button-text="确定"
                       cancel-button-text="取消">
          <template #reference>
            <el-button icon="delete" type="danger" style="margin: 8px 8px 8px;; width: 65px"
                       :disabled=is批量删除禁用>删除
            </el-button>
          </template>
        </el-popconfirm>

        <div class="工具栏">
          <el-tooltip content="刷新"
                      effect="dark"
                      placement="top">
            <el-icon @click="on读取列表(1)">
              <RefreshRight/>
            </el-icon>
          </el-tooltip>
        </div>
      </div>

      <el-table v-loading="is加载中" :data="Data.list" border style="width: 100% ;white-space: pre-wrap;"
                ref="tableRef"
                @header-dragend="on表格列宽被改变"
                :max-height="tableHeight"
                @selection-change="on选择框被选择"
                :header-cell-style="{background:'#FAFAFAFF',color:'#606266'}">
        <el-table-column type="selection" width="45"/>
        <el-table-column prop="id" label="Id" width="80"/>
        <el-table-column prop="name" label="用户名" width="160" show-overflow-tooltip=""/>
        <el-table-column prop="appId" label="应用名称" width="160" show-overflow-tooltip="">
          <template #default="scope">
            {{ MapAppId_Name.hasOwnProperty(scope.row.appId.toString()) ? MapAppId_Name[scope.row.appId.toString()] : '已删' + scope.row.appId.toString()}}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="抽奖时间" width="160">
          <template #default="scope">
            {{ 时间_时间戳到时间(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="kaClassName" label="中奖卡类" width="180" show-overflow-tooltip="">
          <template #default="scope">
            <el-tag v-if="scope.row.kaClassId>0" type="success">{{ scope.row.kaClassName }}</el-tag>
            <el-tag v-else type="info">谢谢参与</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="source" label="抽奖来源" width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.source==1" type="primary">每日免费</el-tag>
            <el-tag v-else-if="scope.row.source==2" type="warning">拉新奖励</el-tag>
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
              :page-sizes="[10, 20, 30, 50, 100, 1000]"
              :layout="is移动端()?'total,prev, pager, next':'total, sizes, prev, pager, next, jumper'"
              :pager-count="is移动端()?5:9"
              :total="parseInt(Data.count.toString())"
              size="small"
              @current-change="on读取列表(0)"
          />
        </el-config-provider>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {onBeforeUnmount, onMounted, ref} from "vue";
import {luckyWheelLogapi} from "@/api/luckyWheelLogapi";
import {
  时间_时间戳到时间,
  is移动端,
  表格读取列宽数组,
  表格写入列宽数组,
} from "@/utils/utils";
import {useStore} from "vuex";
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import {RefreshRight} from "@element-plus/icons";
import {GetAppIdNameList} from "@/api/应用列表api";
import {ElMessage} from "element-plus";

const MapAppId_Name = ref({})
const 数组AppId_Name = ref([{
  "appId": 10000,
  "appName": ""
}])
const onGetAppIdNameList = async () => {
  let res = await GetAppIdNameList()
  数组AppId_Name.value = res.data.array
  MapAppId_Name.value = res.data.map
}

type list_item = {
  id: number,
  appId: number,
  userId: number,
  createTime: number,
  kaClassId: number,
  kaClassName: string,
  source: number,
  name: string,
}
type data = {
  "count": number,
  "list": list_item[]
}

const 表格被选中列表 = ref<list_item[]>([])
const is批量删除禁用 = ref(true)
const on批量删除 = async () => {
  const ids = 表格被选中列表.value.map((item => item.id))
  const res = await luckyWheelLogapi.delete({"ids": ids})
  if (res.code == 10000) {
    ElMessage.success(res.msg)
    on读取列表(1)
  }
}

const on选择框被选择 = (val: any) => {
  表格被选中列表.value = val
  is批量删除禁用.value = 表格被选中列表.value.length == 0
}

const Data = ref<data>({
  "count": 0,
  "list": []
})
const Store = useStore()
const 对象_搜索条件 = ref({
  RegisterTime: ["", ""],
  Type: 1,
  Size: 10,
  Page: 1,
  Keywords: "",
  count: 0,
  AppId: 0
})

const on读取列表 = (Type: number) => {
  if (Type === 1) {
    对象_搜索条件.value.count = 0
  }
  onGetList()
}
const onReset = () => {
  对象_搜索条件.value = {
    RegisterTime: ["", ""],
    Type: 1,
    Size: 10,
    Page: 1,
    Keywords: "",
    count: 0,
    AppId: 0
  }
  onGetAppIdNameList()
}

const is加载中 = ref(false)
const onGetList = async () => {
  is加载中.value = true
  let aa = JSON.parse(JSON.stringify(对象_搜索条件.value))
  aa.registerTime = aa.RegisterTime
  delete aa.RegisterTime
  if (aa.registerTime && aa.registerTime.length == 2) {
    aa.registerTime[0] = Number(aa.registerTime[0])
    aa.registerTime[1] = Number(aa.registerTime[1])
    if (aa.registerTime[1] > 0) {
      aa.registerTime[1] = aa.registerTime[1] + 86400
    }
  }

  const res = await luckyWheelLogapi.getList(aa)
  is加载中.value = false
  Data.value = res.data
  对象_搜索条件.value.count = Data.value.count
  Store.commit("set搜索_默认选择应用AppId", 对象_搜索条件.value.AppId)
}

import {useTableHeight} from "@/composables/useTableHeight";

const {tableRef, tableHeight} = useTableHeight(85)
const on表格列宽被改变 = (newWidth: any, oldWidth: any, columns: any, event: any) => {
  let 局_列宽数组: number[] = 表格读取列宽数组(tableRef.value)
  localStorage.setItem('列宽_大转盘日志', JSON.stringify(局_列宽数组));
}
const on表格列宽初始化 = () => {
  let 局_列宽数组文本 = localStorage.getItem('列宽_大转盘日志')
  if (局_列宽数组文本 != null) {
    let 局_列宽数组: number[] = JSON.parse(局_列宽数组文本)
    表格写入列宽数组(tableRef.value, 局_列宽数组)
  }
}

onMounted(async () => {
  Data.value = {"count": 0, "list": []}
  onReset()
  await onGetAppIdNameList()
  await onGetList()
  on表格列宽初始化()
})

onBeforeUnmount(() => {
  Store.commit("set搜索_大转盘日志", 对象_搜索条件.value)
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
}, {
  text: '最近1周',
  value: () => {
    const end = new Date()
    const start = new Date()
    start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
    return [start, end]
  },
}, {
  text: '最近1个月',
  value: () => {
    const end = new Date()
    const start = new Date()
    start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
    return [start, end]
  },
}]
</script>

<style scoped lang="scss">
.el-table .cell {
  white-space: pre-wrap;
}

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
    font-size: 16px;
    margin-left: 10px;
    padding: 5px;
    border: 1px solid rgb(235, 238, 245);
    color: #0c0d0e;
    speak: none;
    font-style: normal;
    font-variant: normal;
    text-transform: none;
    line-height: 1;
    vertical-align: baseline;
    display: inline-block;
    -webkit-font-smoothing: antialiased;
    cursor: pointer;
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
