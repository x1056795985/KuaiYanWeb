<template>
  <div class="最底层div">
    <div class="内容div" style="align-items: center ">
      <el-form :inline="true">
        <el-form-item label="选择应用" prop="">
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
              <el-select v-model="对象_搜索条件.Type" placeholder="名称" style="width: 100px">
                <el-option label="Id" :value="1"/>
                <el-option label="名称" :value="2"/>
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
        <el-button icon="Plus" type="primary" style="margin: 8px 8px 8px; width: 65px" @click="on对话框详细信息打开(0)">
          新增
        </el-button>

        <el-popconfirm title="确定删除勾选类型?" width="200"
                       @confirm="on批量删除" confirm-button-text="确定"
                       cancel-button-text="取消">
          <template #reference>
            <el-button icon="warning" type="danger" style="margin: 8px 8px 8px;; width: 65px"
                       :disabled=is批量删除禁用>删除
            </el-button>
          </template>
        </el-popconfirm>
        <el-button icon="Tickets"   style="margin: 8px 8px 8px; width: 85px" @click="on跳转卡号列表(对象_搜索条件.AppId)">
          卡号列表
        </el-button>
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
        <el-table-column prop="Id" label="Id" width="80"/>
        <el-table-column prop="Name" label="卡类名称" width="100"/>
        <el-table-column prop="Note" label="卡类备注" width="100"/>
        <el-table-column prop="Prefix" label="卡前缀" width="100"/>
        <el-table-column prop="VipTime" :label="isAppType计点()?'点数':'时间'" width="170">
          <template #default="scope" v-if="!isAppType计点()">
            <div style="display: flex; align-items: center">
              <el-icon>
                <timer/>
              </el-icon>
              <span style="margin-left: 10px">{{ 时间_计算天时分秒提示(scope.row.VipTime) }}</span>
            </div>
          </template>
          <template #default="scope" v-else>
            <div style="display: flex; align-items: center">
              <span style="margin-left: 10px">{{ scope.row.VipTime }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="InviteCount" :label="isAppType计点()?'推荐人送点':'推荐人送时'" width="170">
          <template #default="scope" v-if="!isAppType计点()">
            <div style="display: flex; align-items: center">
              <el-icon>
                <timer/>
              </el-icon>
              <span style="margin-left: 10px">{{ 时间_计算天时分秒提示(scope.row.InviteCount) }}</span>
            </div>
          </template>
          <template #default="scope" v-else>
            <div style="display: flex; align-items: center">
              <span style="margin-left: 10px">{{ scope.row.InviteCount }}</span>
            </div>
          </template>
        </el-table-column>


        <el-table-column prop="RMb" label="余额" width="100"/>
        <el-table-column prop="VipNumber" label="积分" width="80"/>
        <el-table-column prop="Money" label="用户售价" width="100">
          <template #default="scope">
            <div style="display: flex; align-items: center">
              <span style="margin-left: 10px">￥{{ scope.row.Money }}</span>
            </div>
          </template>

        </el-table-column>
        <el-table-column prop="AgentMoney" label="代理售价" width="100">
          <template #default="scope">
            <div style="display: flex; align-items: center">
              <span style="margin-left: 10px">￥{{ scope.row.AgentMoney }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="UserClassId" label="用户类型" width="110">
          <template #default="scope">
            <el-tag
                :type="scope.row.UserClassId!==0?对象_用户类型.hasOwnProperty(scope.row.UserClassId.toString())?'primary':'danger':'warning'">
              {{
                对象_用户类型.hasOwnProperty(scope.row.UserClassId.toString()) ? 对象_用户类型[scope.row.UserClassId.toString()] : '已删待改' + scope.row.UserClassId.toString()
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="NoUserClass" label="用户类型不同处理方式" width="180">
          <template #default="scope">
            <el-tag :type="scope.row.NoUserClass===1?'success':'warning'">
              {{
                scope.row.NoUserClass === 1 ? '自动根据权重转换新分组' : scope.row.NoUserClass === 2 ? '禁止充值' : '未知方式' + scope.row.NoUserClass
              }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="KaLength" label="卡长度" width="100"/>
        <el-table-column prop="KaStringType" label="卡内容字符集" width="140">
          <template #default="scope">
            <el-text>
              {{  {1: '大小写字母+数字', 2: '大写字母+数字', 3: '小写字母+数字', 4: '数字'}[scope.row.KaStringType] || '未知方式' + scope.row.KaStringType }}
            </el-text>
          </template>
        </el-table-column>

        <el-table-column prop="Num" label="可用次数" width="100"/>
        <el-table-column prop="KaType" label="充值类型" width="100">
          <template #default="scope">
            <el-text>
              {{  {1: '有次数即可', 2: '每用户一次'}[scope.row.KaType] || '未知方式' + scope.row.KaType }}
            </el-text>
          </template>
        </el-table-column>
        <el-table-column prop="MaxOnline" label="最大在线数" width="100"/>

        <el-table-column :fixed="is移动端()?false:'right'" label="操作" width="75">
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
              @current-change="on读取列表"
          />
        </el-config-provider>
      </div>

    </div>
  </div>
  <KaClassInfo :is对话框可见="is对话框可见" :id="is对话框id" :AppId="对象_搜索条件.AppId"
               :AppName="MapAppId_Name[对象_搜索条件.AppId?.toString() || '10000']" :AppType="Data.AppType"
               @on对话框详细信息关闭="on对话框详细信息关闭" :UserType="对象_用户类型"></KaClassInfo>
</template>

<script lang="ts" setup>
import {onBeforeUnmount, onMounted, ref} from "vue";
import {GetKaClassList, Del批量删除KaClass} from "@/api/卡类列表api.js";
import {GetAppIdNameList} from "@/api/应用列表api.js";
import {
  时间_时间戳到时间,
  时间_取现行时间戳,
  时间_计算天时分秒提示,
  is移动端,
  表格读取列宽数组,
  表格写入列宽数组
} from "@/utils/utils";
import {useStore} from "vuex";
// 引入中文包
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import {ElMessage, ElMessageBox} from 'element-plus'
import {Delete} from "@element-plus/icons-vue";
import KaClassInfo from "./组件/卡类详细信息.vue";
import router from "@/router";

import {useTableHeight} from "@/composables/useTableHeight";
const { tableRef, tableHeight, updateTableHeight } = useTableHeight(85)// 表格实例,表格高度,更新表格高度
const on单个删除 = async (id: number) => {
  console.log('on单个删除' + id)

  const res = await Del批量删除KaClass({"ID": [id]})
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
  const res = await Del批量删除KaClass({"AppId": 对象_搜索条件.value.AppId, "ID": ids})
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
      "Name": "天卡",
      "Prefix": "T1",
      "VipTime": 86400,
      "InviteCount": 3600,
      "RMb": 5.55,
      "VipNumber": 10,
      "Money": 3.02,
      "AgentMoney": 3,
      "UserClassId": 13,
      "NoUserClass": 1,
      "KaLength": 25,
      "Num": 1,
      "KaType": 1,
      "MaxOnline": 1
    }]
})
const Store = useStore()
const 对象_搜索条件 = ref({AppId: 10000, Type: 2, Size: 10, Page: 1, Keywords: ""})

const on读取列表 = () => {
  console.log("对象_搜索条件")
  console.log(对象_搜索条件.value)
  onGetKaClassList()
}
const onReset = () => {
  let Appidc = 对象_搜索条件.value.AppId
  console.log("重置搜索条件,保留appid:" + Appidc)
  console.log(Store.state.搜索_卡类列表)
  对象_搜索条件.value = {AppId: Appidc, Type: 2, Size: 10, Page: 1, Keywords: ""}
  onGetAppIdNameList()
}


const is加载中 = ref(false)
const onGetKaClassList = async () => {
  if (对象_搜索条件.value.AppId === 10000) {
    ElMessage.success("请选选择应用")
    return   // 默认值 不搜索
  }

  is加载中.value = true
  const res = await GetKaClassList(对象_搜索条件.value)
  console.log(res)
  is加载中.value = false
  Data.value = {
    Count: res.data.count ?? 0,
    AppType: res.data.appType ?? 1,
    List: res.data.list ?? []
  };
  对象_用户类型.value = { ...(res.data.userClass ?? {}), "0": "未分类" };
  console.log("对象_用户类型")
  console.log(对象_用户类型.value)
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
  console.log("没有搜索条件的应用,修改第一个,现在搜索条件的值为:" + (res.data.map[(对象_搜索条件.value.AppId ?? 10000).toString()] ?? 'N/A'))

if (res.data.map[(对象_搜索条件.value.AppId ?? 10000).toString()] == null || 对象_搜索条件.value.AppId <= 10000) {
  let 局_默认appid = Store.state.搜索_默认选择应用AppId;
  对象_搜索条件.value.AppId = 数组AppId_Name.value.some(item => item.appId === 局_默认appid)
    ? 局_默认appid
    : 数组AppId_Name.value.length > 0 ? 数组AppId_Name.value[0].appId : 10000;
}
}
const 对象_用户类型 = ref({"0": "未分类"})
// table元素

const on表格列宽被改变 = (newWidth: any, oldWidth: any, columns: any, event: any) => {
  let 局_列宽数组: number[] = 表格读取列宽数组(tableRef.value)

  localStorage.setItem('列宽_卡类列表', JSON.stringify(局_列宽数组));
}
const on表格列宽初始化 = () => {

  let 局_列宽数组文本 = localStorage.getItem('列宽_卡类列表')
  if (局_列宽数组文本 != null) {
    let 局_列宽数组: number[] = JSON.parse(局_列宽数组文本)

    表格写入列宽数组(tableRef.value, 局_列宽数组)
  }
}

onMounted(async () => {

  onReset()
  //如果 Store zize 不为0 且不为 null  才读取,不然就使用默认的
  if (Store.state.搜索_卡类列表.Size != 0 && Store.state.搜索_卡类列表.Size != null) {
    对象_搜索条件.value = Store.state.搜索_卡类列表
    console.log("恢复搜索条件")
    console.log(Store.state.搜索_卡类列表.Size)
    console.log(Store.state.搜索_卡类列表)
  }

  await onGetAppIdNameList()
  await onGetKaClassList()
  on表格列宽初始化()
})

onBeforeUnmount(() => {
  console.log("事件在卸载之前触发")
  Store.commit("set搜索_卡类列表", 对象_搜索条件.value)
})
const isAppType计点 = () => {
  return Data.value.AppType === 2 || Data.value.AppType === 4
}


const on跳转卡号列表 = (AppId: Number) => {
  console.log("on跳转卡号列表" + AppId)
  Store.commit("set搜索_卡号列表", {
    AppId: AppId,
    Status: 0,
    Num: 0,
    RegisterTime: ["", ""],
    KaClassId: 0,
    Type: 2,
    Size: 10,
    Page: 1,
    Keywords: ""
  })
  router.push("/应用管理/卡号列表")
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
