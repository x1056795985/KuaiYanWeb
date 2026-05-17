<template>
  <div class="最底层div">
    <div class="内容div" style="align-items: center ">
      <el-form :inline="true">
        <el-form-item label="选择应用" prop="" style="width:300px">
          <el-select v-model.number="对象_搜索条件.AppId" clear placeholder="请选择应用" filterable @change="on读取列表">
            <el-option v-for="(item,index) in 数组AppId_Name" :key="item.appId"
                       :label="item.appName+'('+item.appId.toString()+')'" :value="item.appId"/>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input class="搜索框"
                    v-model.trim="对象_搜索条件.Keywords"
                    placeholder="搜索内容"
                    style="top:0 ; width: auto;padding: 0;margin: 0"
                    clearable
          >
            <template #prepend>
              <el-select v-model="对象_搜索条件.Type" placeholder="Id" style="width: 100px;">
                <el-option label="Id" :value="1"/>
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
        <el-button icon="Plus" type="primary" style="margin: 8px 8px 8px; width: 65px" @click="on对话框详细信息打开(0)">
          新增
        </el-button>

        <el-popconfirm title="确定删除勾选用户类型?,所有已经设置该类型的软件用户修改为未分类." width="200"
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

      <el-table v-loading="is加载中" :data="Data.List" border style="width: 100% ;white-space: pre-wrap;"
                ref="tableRef"
                @header-dragend="on表格列宽被改变"
                :max-height="tableHeight"
                @selection-change="on选择框被选择"
                :header-cell-style="{background:'#FAFAFAFF',color:'#606266'}">
        <el-table-column type="selection" width="45"/>
<!--        <el-table-column prop="Id" label="Id" width="80"/>-->
        <!--        <el-table-column prop="Uid" label="用户id" width="100"/>-->
        <el-table-column prop="Name" label="用户类型名称" width="300"/>
        <el-table-column prop="Mark" label="整数代号" width="100"/>
        <el-table-column prop="Weight" label="权重" width="100"/>

        <el-table-column :fixed="is移动端()?false:'right'" label="操作" width="110">
          <template #default="scope">
            <el-button link type="primary" size="default" @click="on单个编辑(scope.row.Id)" style="color:#79bbff">
              <el-icon color="#79bbff" class="no-inherit">
                <Edit/>
              </el-icon>
              编辑
            </el-button>
            <!--            <el-button link type="primary" size="default" @click="on单个删除(scope.row.Id)" style="color:#f56d6d">-->
            <!--              <el-icon color="#f56d6d" class="no-inherit">-->
            <!--                <Delete/>-->
            <!--              </el-icon>-->
            <!--              删除-->
            <!--            </el-button>-->
          </template>
        </el-table-column>
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
              :page-sizes="[10, 20, 30, 40,50,100]"
              size="small"
              :layout="is移动端()?'total,prev, pager, next':'total, sizes, prev, pager, next, jumper'"
              :pager-count="is移动端()?5:9"
                :total="Data.Count"
              @current-change="on读取列表"
          />
        </el-config-provider>
      </div>

    </div>
  </div>
  <UserClassinfo :is对话框可见="is对话框可见" :id="is对话框id" :AppId="对象_搜索条件.AppId"
                 :AppName="MapAppId_Name[对象_搜索条件.AppId.toString()]" :AppType="Data.AppType"
                 @on对话框详细信息关闭="on对话框详细信息关闭"></UserClassinfo>
</template>

<script lang="ts" setup>
import {onBeforeUnmount, onMounted, ref} from "vue";
import {GetUserClassList, Del批量删除UserClass} from "@/api/用户类型api.js";
import {GetAppIdNameList} from "@/api/应用列表api.js";
import {时间_时间戳到时间, 时间_取现行时间戳, is移动端, 表格读取列宽数组, 表格写入列宽数组} from "@/utils/utils";
import {useStore} from "vuex";
// 引入中文包
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import {ElMessage, ElMessageBox} from 'element-plus'
import {Delete} from "@element-plus/icons-vue";
import UserClassinfo from "./组件/用户类型详细信息.vue";


const on单个删除 = async (id: number) => {
  console.log('on单个删除' + id)

  const res = await Del批量删除UserClass({"ID": [id]})
  console.log(res)
  if (res.code == 10000) {
ElMessage.success(res.msg)
    on读取列表()
  }
}
const on单个编辑 = async (id: number) => {
  on对话框详细信息打开(id)
}

const on批量删除 = async () => {
  const ids = 表格被选中列表.value.map((item => item.Id))
  console.log(ids)
  const res = await Del批量删除UserClass({"AppId": 对象_搜索条件.value.AppId, "ID": ids})
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

const Data = ref({
  "Count": 0,
  "AppType": 1,
  "List": [
    {
      "Id": 3,
      "AppId": 10001,
      "Name": "测试用户类型2",
      "Mark": 2,
      "Weight": 1
    }]
})
const Store = useStore()
const 对象_搜索条件 = ref({AppId: 10000, Type: 1, Size: 10, Page: 1, Keywords: ""})

const on读取列表 = () => {
  console.log("对象_搜索条件")
  console.log(对象_搜索条件.value)
  onGetUserClassList()
}
const onReset = () => {
  let Appidc = 对象_搜索条件.value.AppId
  console.log("重置搜索条件,保留appid:" + Appidc)
  对象_搜索条件.value = {AppId: Appidc, Type: 1, Size: 10, Page: 1, Keywords: ""}
  onGetAppIdNameList()
}


const is加载中 = ref(false)
const onGetUserClassList = async () => {
  if (对象_搜索条件.value.AppId === 10000) {
    ElMessage.success("请选选择应用")
    return   // 默认值 不搜索
  }

  is加载中.value = true
  const res = await GetUserClassList(对象_搜索条件.value)
  console.log(res)
  is加载中.value = false
  if (res.code === 10000 && res.data) {
    Data.value = {
      Count: res.data.count || 0,
      AppType: Data.value.AppType,
      List: res.data.list || []
    }
  } else {
    ElMessage.error(res.msg || "获取数据失败")
    Data.value = {
      Count: 0,
      AppType: Data.value.AppType,
      List: []
    }
  }
  Store.commit("set搜索_默认选择应用AppId", 对象_搜索条件.value.AppId)

}

const MapAppId_Name = ref({})
const 数组AppId_Name = ref([{
  "appId": 10004,
  "appName": ""
}])
const onGetAppIdNameList = async () => {
  const res = await GetAppIdNameList()
  数组AppId_Name.value = res.data.array
  MapAppId_Name.value = res.data.map
  console.log("没有搜索条件的应用,修改第一个,现在搜索条件的值为:" + res.data.map[对象_搜索条件.value.AppId.toString()])
  if (res.data.map[对象_搜索条件.value.AppId.toString()] == null || 对象_搜索条件.value.AppId <= 10000) {
    let 局_默认appid=Store.state.搜索_默认选择应用AppId
    对象_搜索条件.value.AppId = 数组AppId_Name.value.some(item => item.appId === 局_默认appid)?局_默认appid:数组AppId_Name.value[0].appId
  }
}

// table元素
import {useTableHeight} from "@/composables/useTableHeight";
const { tableRef, tableHeight, updateTableHeight } = useTableHeight(85)
const on表格列宽被改变 = (newWidth: any, oldWidth: any, columns: any, event: any) => {
  let 局_列宽数组: number[] =表格读取列宽数组(tableRef.value)

  localStorage.setItem('列宽_用户类型', JSON.stringify(局_列宽数组));
}
const on表格列宽初始化 = () => {

  let 局_列宽数组文本 = localStorage.getItem('列宽_用户类型')
  if (局_列宽数组文本 != null) {
    let 局_列宽数组: number[] = JSON.parse(局_列宽数组文本)

    表格写入列宽数组(tableRef.value, 局_列宽数组)
  }
}


onMounted(async () => {

  onReset()
  //如果 Store zize 不为0 且不为 null  才读取,不然就使用默认的
  if (Store.state.搜索_用户类型.Size != 0 && Store.state.搜索_用户类型.Size != null) {
    对象_搜索条件.value = Store.state.搜索_用户类型
    console.log("恢复搜索条件")
    console.log(Store.state.搜索_用户类型.Size)
    console.log(Store.state.搜索_用户类型)
  }
  await onGetAppIdNameList()
  await onGetUserClassList()
  on表格列宽初始化()
})

onBeforeUnmount(() => {
  console.log("事件在卸载之前触发")
  Store.commit("set搜索_用户类型", 对象_搜索条件.value)
})

export interface UserInfo2 {
  id: number;
  user: string;
  status: number;
  rmb: number;
  realNameAttestation: string;
  role: number;
  loginAppid: string;
  loginAppName: string;
  loginIp: string;
  loginTime: number;
  registerIp: string;
  registerTime: string;
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
