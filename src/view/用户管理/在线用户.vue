<template>
  <div class="最底层div">
    <div class="内容div" style="align-items: center ">
      <el-form :inline="true" :model="对象_搜索条件">
        <el-form-item label="选择应用" prop="">
          <el-select v-model.number="对象_搜索条件.AppId" clear placeholder="请选择应用" filterable>
            <el-option :key="0" label="全部" :value="0"/>
            <el-option v-for="(item,index) in 数组AppId_Name" :key="item.Appid"
                       :label="item.AppName+'('+item.Appid.toString()+')'" :value="item.Appid"/>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status" style="width:120px">
          <el-select v-model="对象_搜索条件.Status" clear placeholder="请选择">
            <el-option key="0" label="全部" :value="0"/>
            <el-option key="1" label="正常" :value="1"/>
            <el-option key="2" label="注销" :value="2"/>
          </el-select>
        </el-form-item>
        <el-form-item label="游客" prop="status" style="width:120px">
          <el-select v-model="对象_搜索条件.Tourist" clear placeholder="请选择">
            <el-option key="0" label="包含" :value="0"/>
            <el-option key="1" label="排除" :value="1"/>
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
              <el-select v-model="对象_搜索条件.Type" placeholder="用户名" style="width: 100px;">
                <el-option label="Id" :value="1"/>
                <el-option label="用户名" :value="2"/>
                <el-option label="绑定信息" :value="3"/>
                <el-option label="动态标记" :value="4"/>
                <el-option label="软件版本" :value="5"/>
                <el-option label="代理标识Uid" :value="6"/>
<!--                <el-option label="软件用户备注 需链表搜索效率差,暂不考虑" :value="7"/>-->
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
        <el-popconfirm title="确定注销勾选在线用户?" width="200" @confirm="on批量注销" confirm-button-text="确定"
                       cancel-button-text="取消">
          <template #reference>
            <el-button icon="warning" type="danger" style="margin: 8px 8px 8px;"
                       :disabled=is批量注销禁用>注销
            </el-button>
          </template>
        </el-popconfirm>
        <div class="工具栏">

          <el-popover placement="right" trigger="hover">
            <template #reference>
              <el-icon v-if="is移动端()">
                <More/>
              </el-icon>
              <span v-else style="display:inline-flex;align-items:center;gap:4px;margin-left:10px;padding:5px 10px;border:1px solid rgb(235,238,245);border-radius:4px;cursor:pointer;font-size:14px;color:#606266;white-space:nowrap;">
                <el-icon style="margin:0!important;border:none!important;padding:0!important;font-size:14px;"><More/></el-icon>
                <span>更多功能</span>
              </span>
            </template>
            <li class="工具_更多_li" @click="is对话框可见_创建令牌=1">新WebApi令牌</li>
            <li class="工具_更多_li" @click="on删除已注销">删除已注销</li>
            <li class="工具_更多_li" @click="on批量永不注销">修改永不注销</li>
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
                fit="fit"
                :header-cell-style="{background:'#FAFAFAFF',color:'#606266'}">
        <el-table-column type="selection" width="45"/>
        <el-table-column prop="Id" label="Id" width="80" show-overflow-tooltip=""/>
        <el-table-column prop="User" label="用户名" width="130" show-overflow-tooltip="">
          <template #default="scope">

            <el-icon  class="复制按钮"
                     @click="置剪辑版文本(scope.row.User,'已复制到剪辑版')">
              <DocumentCopy/>
            </el-icon>
            <el-tag v-if="scope.row.RiskControl>0" :type="scope.row.RiskControl<20?'info':'danger'">
              {{ scope.row.RiskControl < 20 ? '可疑' : "非法" }}
            </el-tag>
            {{ scope.row.User }}
          </template>


        </el-table-column>
        <el-table-column align="left" label="状态" prop="status" width="80">
          <template #default="scope">
            <div>
              <el-tag :type="scope.row.Status===1?'primary':'warning'">{{
                  scope.row.Status === 1 ? '正常' : "已注销"
                }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="AppName" label="登录位置" width="282" show-overflow-tooltip="">
          <template #default="scope">
            <div>
              {{ scope.row.AppName }}
              <el-tag type="success" v-if="scope.row.AppVer">
                {{ scope.row.AppVer }}
              </el-tag>
              <el-tag type="primary" v-if="scope.row.AgentUid" >
                代:{{ scope.row.AgentUid }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="Tab" label="动态标记" width="140" show-overflow-tooltip=""/>
        <el-table-column prop="Key" label="绑定信息" width="140" show-overflow-tooltip=""/>
        <el-table-column prop="Note" label="软件用户备注" width="140" show-overflow-tooltip=""/>
        <el-table-column label="在线ip" width="140" show-overflow-tooltip="">
          <template #default="scope">
            {{ scope.row.Ip + " " + scope.row.IPCity }}
          </template>
        </el-table-column>
        <el-table-column prop="LoginTime" label="登录时间" width="160" :formatter="on格式化_登录时间" show-overflow-tooltip=""/>
        <el-table-column prop="LastTime" label="最后活动时间" width="160" :formatter="on格式化_最后活动时间" show-overflow-tooltip=""/>
        <el-table-column prop="OutTime" label="心跳超时注销" width="160" >
          <template #default="scope">
            <div v-if="scope.row.OutTime<315360000">
              <el-countdown style="font-size: 18px" :value="(scope.row.LastTime+scope.row.OutTime)*1000"/>
            </div>
            <div v-else-if="scope.row.OutTime>=315360000">
              永不注销
            </div>
          </template>
        </el-table-column>
        <el-table-column :fixed="is移动端()?false:'right'" label="操作" width="75">
          <template #default="scope">
            <el-button link type="primary" size="default" @click="on单个注销(scope.row.Id)"
                       v-if="scope.row.Status === 1"
                       style="color:#f56d6d">
              <el-icon color="#f56d6d" class="no-inherit">
                <SwitchButton/>
              </el-icon>
              注销
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
  <vueNewWebApiToken :is对话框可见_创建令牌="is对话框可见_创建令牌" @on对话框详细信息关闭="on对话框详细信息关闭"/>
  <ChartData v-if="is图表分析抽屉可见" @on图表分析抽屉关闭="on图表分析抽屉关闭"/>
</template>

<script lang="ts" setup>
import {onBeforeUnmount, onMounted, Ref, ref, watch,} from "vue";
import {GetLinkUserList, Del批量注销, Del批量删除, 批量永不注销} from "@/api/在线用户api.js";
import {
  时间_时间戳到时间,
  时间_取现行时间戳,
  时间_计算分钟提示,
  is移动端,
  置剪辑版文本,
  表格读取列宽数组, 表格写入列宽数组
} from "@/utils/utils";
import {useStore} from "vuex";
// 引入中文包
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import {ElMessage, ElMessageBox, FormInstance} from 'element-plus'
import {GetAppIdNameList} from "@/api/应用列表api";
import vueNewWebApiToken from "@/view/用户管理/组件/创建WebApi令牌.vue";
import ChartData from "@/view/用户管理/组件/在线用户图表抽屉.vue";

const on单个注销 = async (id: number) => {
  console.log('在线注销id' + id)
  is加载中.value = true
  const res = await Del批量注销({"ID": [id]})
  is加载中.value = false
  console.log(res)
  if (res.code == 10000) {
ElMessage.success(res.msg)
    for (let i = 0; i < List.value.List.length; i++) {
      //console.log(List.value.List[i])
      if (List.value.List[i].Id == id) {
        List.value.List[i].Status = 2
        break
      }

    }

  }

}

const on批量注销 = async () => {
  const ids = 表格被选中列表.value.map((item => item.Id))
  if (ids.length == 0) {
    ElMessage.error("选中数据不能为0")
    return
  }
  const res = await Del批量注销({"ID": ids})
  console.log(res)
  if (res.code == 10000) {
ElMessage.success(res.msg)

    for (let i = 0; i < List.value.List.length; i++) {
      if (ids.includes(List.value.List[i].Id)) {
        List.value.List[i].Status = 2
      }
    }
  }
}
const on批量永不注销 = async () => {

  ElMessageBox.confirm(
      '确定修改在线为永不超时注销吗?',
      'Warning',
      {
        confirmButtonText: '确定修改',
        cancelButtonText: '取消',
        type: 'warning',
      }
  )
      .then(async () => {
        const ids = 表格被选中列表.value.map((item => item.Id))
        if (ids.length == 0) {
          ElMessage.error("选中数据不能为0")
          return
        }
        const res = await 批量永不注销({"Id": ids, "OutTime": 9999999999})
        if (res.code == 10000) {
          ElMessage.success(res.msg)
          for (let i = 0; i < List.value.List.length; i++) {
            if (ids.includes(List.value.List[i].Id)) {
              List.value.List[i].OutTime = 9999999999
            }
          }
        }
      })
      .catch(() => {
      })
}
const on删除已注销 = async () => {
  is工具_更多.value = false
  const res = await Del批量删除({"ID": [-1]})

  if (res.code == 10000) {
ElMessage.success(res.msg)
    on读取列表()
  }
}
const MapAppId_Name = ref({})
const 数组AppId_Name = ref([{
  "Appid": 10000,
  "AppName": ""
}])
const onGetAppIdNameList = async () => {
  let res = await GetAppIdNameList()
  数组AppId_Name.value = res.data.Array
  数组AppId_Name.value.push({Appid:1,AppName:"管理平台"})
  数组AppId_Name.value.push({Appid:2,AppName:"代理平台"})
  数组AppId_Name.value.push({Appid:3,AppName:"WebApi"})
  数组AppId_Name.value.push({Appid:10,AppName:"WebUser"})
  数组AppId_Name.value.push({Appid:11,AppName:"WebSocket"})
  MapAppId_Name.value = res.data.Map
  console.log("没有搜索条件的应用,修改第一个,现在搜索条件的值为:" + res.data.Map[对象_搜索条件.value.AppId.toString()])

  if (res.data.Map[对象_搜索条件.value.AppId.toString()] == null || 对象_搜索条件.value.AppId <= 10000) {
    // let 局_默认appid=Store.state.搜索_默认选择应用AppId
    // 对象_搜索条件.value.AppId = 数组AppId_Name.value.some(item => item.Appid === 局_默认appid)?局_默认appid:数组AppId_Name.value[0].Appid
  }

}
const is图表分析抽屉可见 = ref(false)
const on图表分析抽屉关闭 = (is重新读取: boolean) => {

  is图表分析抽屉可见.value = false
  if (is重新读取) {
    on读取列表()
  }
}
const is对话框可见_创建令牌 = ref(false)
const on对话框详细信息关闭 = (is重新读取: boolean) => {
  //console.info("父组件收到对话框被关闭了")
  is对话框可见_创建令牌.value = false
  if (is重新读取) {
    on读取列表()
  }
}


const 表格被选中列表 = ref([])
const is批量注销禁用 = ref(true)
const is工具_更多 = ref(false)

const on选择框被选择 = (val: any) => {
  表格被选中列表.value = val
  is批量注销禁用.value = 表格被选中列表.value.length == 0
}
const List = ref({
  "Count": 0,
  List: [{
    "Id": 11,
    "Uid": 1,
    "User": "admin",
    "Status": 1,
    "LoginAppid": 1,
    "LoginTime": 1680176166,
    "LastTime": 1680176166,
    "OutTime": 3600,
    "Key": "",
    "Tab": "",
    "Ip": "127.0.0.1",
    "AppName": "管理后台",
    "RiskControl": 0,
    "IPCity": ""
  }]
})
const Store = useStore()
const 对象_搜索条件 = ref({Type: 2, Size: 10, Page: 1, Status: 1, Tourist: 1, Keywords: "", AppId: 0})

const on读取列表 = () => {
  console.log("对象_搜索条件")
  console.log(对象_搜索条件.value)
  onGetLinkUserList()
}
const onReset = () => {
  对象_搜索条件.value = {Type: 2, Size: 10, Page: 1, Status: 1, Tourist: 1, Keywords: "", AppId: 0}
}
const on格式化_状态 = (row: any, column: any) => {
  // console.log("on状态格式化")
  // console.log(row)
  // console.log(column)
  if (row.Status == 1) {
    return "正常"
  } else if (row.Status == 2) {
    return "已注销"
  }
  return "未知" + row.Status
}


const on格式化_登录时间 = (row: any, column: any, Time: number) => {
  return 时间_计算分钟提示(Time)
}
const on格式化_最后活动时间 = (row: any, column: any, Time: number) => {
  return 时间_计算分钟提示(Time)
}
const on格式化_自动注销时间 = (row: any, column: any, Time: number) => {

  let time: number = 时间_取现行时间戳()

  time = time - row.OutTime - row.LastTime  //看剩余秒数
  if (time < 0) {
    time = parseInt((-time / 60).toString())//看剩余分钟数
    return time + "分钟后\n" + 时间_时间戳到时间(row.OutTime + row.LastTime)
  } else {
    time = parseInt((time / 60).toString())  //看剩余分钟数
    return time + "分钟前\n" + 时间_时间戳到时间(row.OutTime + row.LastTime)
  }
}
const is加载中 = ref(false)
const onGetLinkUserList = async () => {
  is加载中.value = true
  const res = await GetLinkUserList(对象_搜索条件.value)
  console.log(res)
  is加载中.value = false
  List.value = res.data
  Store.commit("set搜索_默认选择应用AppId", 对象_搜索条件.value.AppId)

}

// table元素
import {useTableHeight} from "@/composables/useTableHeight";
const { tableRef, tableHeight, updateTableHeight } = useTableHeight(85)
const on表格列宽被改变 =  (newWidth: number, oldWidth: number, column: any, event: MouseEvent) => {
  let 局_列宽数组: number[] = 表格读取列宽数组(tableRef.value)
  localStorage.setItem('列宽_在线用户', JSON.stringify(局_列宽数组));
}
const on表格列宽初始化 = () => {
  let 局_列宽数组文本 = localStorage.getItem('列宽_在线用户')
  console.log("表格列宽被读取")
  console.log(局_列宽数组文本)
  if (局_列宽数组文本 != null) {
    let 局_列宽数组: number[] = JSON.parse(局_列宽数组文本)
    表格写入列宽数组(tableRef.value, 局_列宽数组)
  }
}

onMounted(async () => {

  onReset()
  //如果 Store zize 不为0 且不为 null  才读取,不然就使用默认的
  if (Store.state.搜索_在线用户.Size != 0 && Store.state.搜索_在线用户.Size != null) {
    对象_搜索条件.value = Store.state.搜索_在线用户
    console.log("恢复搜索条件")
    console.log(Store.state.搜索_在线用户.Size)
    console.log(Store.state.搜索_在线用户)
  }
  await onGetAppIdNameList()
  await onGetLinkUserList()
  on表格列宽初始化()

})

onBeforeUnmount(() => {
  console.log("事件在卸载之前触发")
  Store.commit("set搜索_在线用户", 对象_搜索条件.value)
})


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

.el-form-item {
  padding: 0;
  margin: 0 15px 8px 0;
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

</style>
