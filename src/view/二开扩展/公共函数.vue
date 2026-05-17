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
        <el-form-item>
          <el-input class="搜索框"
                    v-model.trim="对象_搜索条件.Keywords"
                    placeholder="搜索内容"
                    style="top:0 ;width: auto;padding: 0;margin: 0"
                    clearable
          >
            <template #prepend>
              <el-select v-model="对象_搜索条件.Type" placeholder="名称" style="width: 100px;">
                <el-option label="函数名" :value="1"/>
              </el-select>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" icon="search" @click="on读取列表">查询</el-button>
          <el-button icon="refresh" @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="内容div">
      <div class="gva-btn-list" style="background:#FAFAFAFF">
        <el-button icon="Plus" type="primary" style="margin: 8px 8px 8px; width: 65px"
                   @click="on对话框详细信息打开('')">
          新增
        </el-button>

        <el-popconfirm title="确定删除勾选Js函数?" width="200"
                       @confirm="on批量删除" confirm-button-text="确定"
                       cancel-button-text="取消">
          <template #reference>
            <el-button icon="warning" type="danger" style="margin: 8px 8px 8px;; width: 65px"
                       :disabled=is批量删除禁用>删除
            </el-button>
          </template>
        </el-popconfirm>

        <div class="工具栏">

          <!--          <el-popover placement="right"  trigger="hover">-->
          <!--            <template #reference>-->
          <!--              <el-icon  ><More /></el-icon>-->
          <!--            </template>-->
          <!--            <li class="工具_更多_li"  @click="on删除已注销" >删除已注销</li>-->
          <!--          </el-popover>-->
          <el-tooltip content="刷新"
                      effect="dark"
                      placement="top">
            <el-icon @click="on读取列表">
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
        <el-table-column prop="Id" label="Id" width="70"/>
        <el-table-column prop="Name" label="函数名" width="280"/>
        <el-table-column prop="AppId" label="函数归属" width="200">
          <template #default="scope">
            <el-tag  :type="scope.row.AppId>10000?'primary':'success'">
              {{ scope.row.appName }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="Note" label="备注" width="%100"/>
        <!--        <el-table-column prop="Type" label="函数类型" width="100">
                  <template #default="scope">
                    <el-tag :type="scope.row.Type>4?'danger':scope.row.Type===3?'':'success'">
                      {{ onTypeId转换文本(scope.row.Type) }}
                    </el-tag>
                  </template>
                </el-table-column>-->
        <!--        <el-table-column prop="Value" label="函数值" width="%100" show-overflow-tooltip="">
                  <template #default="scope">
                    <el-tag v-if="scope.row.Type===3" :type="scope.row.Value==='0'?'info':scope.row.Value==='1'?'':'danger'">
                      {{ scope.row.Value === '0' ? '关闭' : scope.row.Value === '1' ? '开启' : scope.row.Value }}
                    </el-tag>
                    <template v-else>
                      {{ scope.row.Value }}
                    </template>
                  </template>
                </el-table-column>-->

        <el-table-column :fixed="is移动端()?false:'right'" label="操作" :width="2*85">
          <template #default="scope">
            <el-button link type="primary" size="default" @click="on单个编辑(scope.row.Name)"
                       style="color:#79bbff">
              <el-icon color="#79bbff" class="no-inherit">
                <Edit/>
              </el-icon>
              编辑
            </el-button>
<!--            <el-button link type="primary" size="default" @click="on单个删除(scope.row.Name)"
                       style="color:#f56d6d">
              <el-icon color="#f56d6d" class="no-inherit">
                <Delete/>
              </el-icon>
              删除
            </el-button>-->
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
              :total="parseInt( Data.count)"
              @current-change="on读取列表"
          />
        </el-config-provider>
      </div>

    </div>
  </div>
  <PublicDataInfo v-if="is对话框可见" :AppId="1" :id="Id"
                  @on对话框详细信息关闭="on对话框详细信息关闭"></PublicDataInfo>
</template>

<script lang="ts" setup>
import {onBeforeUnmount, onMounted, ref} from "vue";
import {GetList, DeleteInfo, GetPublicAppList} from "@/api/公共函数api.js";
import {useStore} from "vuex";
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import {ElMessage, ElMessageBox} from 'element-plus'
import PublicDataInfo from "./组件/公共函数详细信息.vue";

import {is移动端, 表格写入列宽数组, 表格读取列宽数组} from "@/utils/utils";
import {useTableHeight} from "@/composables/useTableHeight";
const { tableRef, tableHeight, updateTableHeight } = useTableHeight(85)
const on单个删除 = async (id: string) => {
  console.log('on单个删除' + id)
  const res = await DeleteInfo({"data": [{"AppId": 1, "Name": id}]})
  console.log(res)
  if (res.code == 10000) {
ElMessage.success(res.msg)
    on读取列表()
  }
}
const on单个编辑 = async (Name: string) => {
  on对话框详细信息打开(Name)
}
const onTypeId转换文本 = (Id: number) => {
  let str = "未知类型" + Id
  switch (Id) {
    case 1:
      str = "单行文本"
      break
    case 2:
      str = "多行文本"
      break
    case 3:
      str = "逻辑开关"
      break
    case 4:
      str = "JSON"
      break
  }

  return str
}
const on批量删除 = async () => {
  const ids = 表格被选中列表.value.map((item => item.Id))
  console.log(ids)
  const res = await DeleteInfo({"Id": ids,"Type": 1 })
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
const 公共变量初始数据 = {
  "AppId": 1,
  "Name": "",
  "Value": "",
  "Type": 1,
  "IsVip": 1
}

const Id = ref("")
const 公共变量 = ref(公共变量初始数据)

const on对话框详细信息打开 = (id: string) => {
  Id.value = id
  is对话框可见.value = true

}
const on对话框详细信息关闭 = (is重新读取: boolean) => {
  //console.info("父组件收到对话框被关闭了")
  is对话框可见.value = false
  if (is重新读取) {
    on读取列表()
  }
}

const on选择框被选择 = (val: any) => {
  表格被选中列表.value = val
  is批量删除禁用.value = 表格被选中列表.value.length == 0
}

const Data = ref({
  "count": 0,
  "list": [
    {
      "Id": 0,
      "AppId": 1,
      "Name": "",
      "Value": "",
      "Type": 1,
      "IsVip": 1,
      "Note": "",
      "AppName": ""
    }]
})
const Store = useStore()
const 对象_搜索条件初始值 = {AppId: 0, Type: 1, Size: 10, Page: 1, Keywords: ""}
const 对象_搜索条件 = ref(Object.assign({}, 对象_搜索条件初始值))

const on读取列表 = () => {
  console.log("对象_搜索条件")
  console.log(对象_搜索条件.value)
  onGetList()
}
const onReset = () => {

  对象_搜索条件.value = Object.assign({}, 对象_搜索条件初始值)

  console.log(对象_搜索条件.value)
}


const is加载中 = ref(false)
const onGetList = async () => {
  is加载中.value = true
  对象_搜索条件.value.PublicDataType = [11]  //只展示js 固定为11
  const res = await GetList(对象_搜索条件.value)
  console.log(res)
  is加载中.value = false
  Data.value = res.data
  Store.commit("set搜索_默认选择应用AppId", 对象_搜索条件.value.AppId)
}


const on表格列宽被改变 = (newWidth: any, oldWidth: any, columns: any, event: any) => {
  let 局_列宽数组: number[] =表格读取列宽数组(tableRef.value)

  localStorage.setItem('列宽_公共函数', JSON.stringify(局_列宽数组));
}
const on表格列宽初始化 = () => {

  let 局_列宽数组文本 = localStorage.getItem('列宽_公共函数')
  if (局_列宽数组文本 != null) {
    let 局_列宽数组: number[] = JSON.parse(局_列宽数组文本)

    表格写入列宽数组(tableRef.value, 局_列宽数组)
  }
}


onMounted(async () => {

  Data.value.list = []
  onReset()
  //如果 Store zize 不为0 且不为 null  才读取,不然就使用默认的
  if (Store.state.搜索_公共函数.Size != 0 && Store.state.搜索_公共函数.Size != null) {
    对象_搜索条件.value = Store.state.搜索_公共函数
  }
  await GetAppList()
  await onGetList()
  on表格列宽初始化()

})

onBeforeUnmount(() => {
  console.log("事件在卸载之前触发")
  Store.commit("set搜索_公共函数", 对象_搜索条件.value)
})

type AppInfo = {
  appId: number,
  appName: string
}
const 数组AppId_Name = ref<AppInfo[]>()

const GetAppList = async () => {

  const res = await GetPublicAppList({})
  数组AppId_Name.value = res.data

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
