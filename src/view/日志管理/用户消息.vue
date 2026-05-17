<template>
  <div class="最底层div">
    <div class="内容div" style="align-items: center ">
      <el-form :inline="true">
        <el-form-item label="选择应用" prop="" style="width:300px">
          <el-select v-model.number="对象_搜索条件.Appid" clear placeholder="请选择应用" filterable @change="on读取列表">
            <el-option label="全部" :value="0"/>
            <el-option v-for="(item,index) in 数组AppId_Name" :key="item.appId"
                       :label="item.appName+'('+item.appId.toString()+')'" :value="item.appId"/>
          </el-select>
        </el-form-item>
        <el-form-item prop="MsgType" label="消息类型">
          <el-select v-model="对象_搜索条件.MsgType" style="width: 100px;">
            <el-option   label="全部" :value="0"/>
            <el-option  v-for="(val,i)  in on用户消息类型列表 "   :label="val" :value="i+1"/>
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
          <el-button type="primary" icon="search" @click="on读取列表">查询</el-button>
          <el-button icon="refresh" @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="内容div">
      <div class="gva-btn-list" style="background:#FAFAFAFF">
        <el-button icon="MuteNotification" type="primary" style="margin: 8px 8px 8px; width: 89px" @click="on全部已读">
          全部已读
        </el-button>
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
            <li class="工具_更多_li" @click="on设置消息类型">设置消息类型</li>
            <li class="工具_更多_li" @click="on批量删除(3)">删除 全部</li>
            <li class="工具_更多_li" @click="on批量删除(4)">删除 7天前</li>
            <li class="工具_更多_li" @click="on批量删除(5)">删除30天前</li>
            <li class="工具_更多_li" @click="on批量删除(6)">删除90天前</li>
            <li class="工具_更多_li" @click="on批量删除用户名或关键字(2)">删指定用户</li>
            <li class="工具_更多_li" @click="on批量删除用户名或关键字(7)">删消息关键字</li>
            <li class="工具_更多_li" @click="on删除重复消息">删除重复消息</li>
          </el-popover>
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
                :row-class-name="tableRowClassName"
                :header-cell-style="{background:'#FAFAFAFF',color:'#606266'}  ">
        <el-table-column type="selection" width="45"/>
        <el-table-column prop="Id" label="Id" width="80"/>
        <el-table-column prop="App" label="应用名称" width="290">
          <template #default="scope">
            <div>

              <el-tag type="success" v-if="scope.row.AppVer">
                {{ scope.row.AppVer }}
              </el-tag>
              {{ scope.row.App }}
            </div>
          </template>
        </el-table-column>


        <el-table-column prop="User" label="用户名" width="130" show-overflow-tooltip=""/>
        <el-table-column prop="MsgType" label="消息类型" width="90">
          <template #default="scope">
            <el-tag size="small" :type="on消息类型标签(scope.row.MsgType)">
              {{ on消息类型提示(scope.row.MsgType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="Time" label="时间" width="160">
          <template #default="scope">
            {{ 时间_时间戳到时间(scope.row.Time) }}
          </template>
        </el-table-column>
        <el-table-column prop="Ip" label="IP" width="140" show-overflow-tooltip=""/>
        <el-table-column prop="Note" label="消息" show-overflow-tooltip="">

          <template #default="scope">
            <el-icon class="复制按钮" @click="置剪辑版文本(scope.row.Note,'已复制到剪辑版')">
              <DocumentCopy/>
            </el-icon>
            {{ scope.row.Note }}
          </template>

        </el-table-column>
        <el-table-column :fixed="is移动端()?false:'right'" label="操作" width="75">
          <template #default="scope">
            <el-button link type="primary" size="default" @click="on单个已读(scope.$index,scope.row.Id)"
                       style="color:#79bbff" v-show="!scope.row.IsRead">
              <el-icon color="#79bbff" class="no-inherit">
                <MuteNotification/>
              </el-icon>
              已读
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
              :total="parseInt( Data.count)"
              @current-change="on读取列表"
          />
        </el-config-provider>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {onBeforeUnmount, onMounted, ref} from "vue";
import {GetLogList, Del批量删除, 批量已读, 删除重复用户消息} from "@/api/用户消息api.js";
import {
  时间_时间戳到时间,
  时间_取现行时间戳,
  时间_计算天时分秒提示,
  is移动端,
  置剪辑版文本,
  表格读取列宽数组, 表格写入列宽数组
} from "@/utils/utils";
import {useStore} from "vuex";
// 引入中文包
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import {Delete} from "@element-plus/icons-vue";
import {More, MuteNotification, RefreshRight} from "@element-plus/icons";
import {ElMessage} from "element-plus";
import {GetUserMsgConfig, SaveUserMsgConfig} from "@/api/系统设置api";


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
  const res = await Del批量删除(提交数据)
  is加载中.value = false
  console.log(res)
  if (res.code == 10000) {
    ElMessage.success(res.msg)
    on读取列表()
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
          const res = await Del批量删除(提交数据)
          is加载中.value = false
          if (res.code == 10000) {
            ElMessage.success(res.msg)
            on读取列表()
          }

        } else {
          ElMessage.info((Type === 2 ? '用户名' : Type === 7 ? '消息关键字' : '未知类型') + '不能为空')
        }
      })
}
const on删除重复消息 = async () => {
  const res = await 删除重复用户消息({})
  if (res.code == 10000) {
    ElMessage.success(res.msg)
    on读取列表()
    return true
  }
}
const on单个已读 = async (表项索引: number, id: number) => {
  const res = await 批量已读({"Id": [id], "IsRead": true, Type: 1})
  if (res.code == 10000) {
    Data.value.list[表项索引].IsRead = true

    let temp = Store.state.userInfo
    temp.userMsgNoRead--
    Store.commit("setUserInfo", temp)
    ElMessage.success(res.msg)
    return true
  } else {
    return false
  }
}
const on全部已读 = async () => {
  const res = await 批量已读({"Id": [], "IsRead": true, Type: 2})
  if (res.code == 10000) {
    for (let i = 0; Data.value.list.length > i; i++) {
      if (!Data.value.list[i].IsRead) {
        Data.value.list[i].IsRead = true
      }
    }
    let temp = Store.state.userInfo
    temp.userMsgNoRead = 0
    Store.commit("setUserInfo", temp)

    ElMessage.success(res.msg)
    return true
  } else {
    return false
  }
}

const 表格被选中列表 = ref([])
const is批量删除禁用 = ref(true)
const is工具_更多 = ref(false)

const on选择框被选择 = (val: any) => {
  表格被选中列表.value = val
  is批量删除禁用.value = 表格被选中列表.value.length == 0
}
const on消息类型提示 = (MsgType: number) => {
  let Msg = on用户消息类型列表.value
  if (MsgType - 1 > Msg.length) {
    return ""
  }
  return Msg[MsgType - 1]
}
const on消息类型标签 = (MsgType: number) => {
  let Msg = ["info", "warning", "primary", "danger"]
  if (MsgType - 1 > Msg.length) {
    return ""
  }
  return Msg[MsgType - 1]
}
const Data = ref({
  "count": 0,
  "list": [
    {
      "Id": 1,
      "User": "",
      "App": "",
      "MsgType": 2,
      "Time": 0,
      "Ip": "",
      "LoginType": 0,
      "Msg": "",
      "IsRead": false
    }]
})
const Store = useStore()
const 对象_搜索条件 = ref({
  RegisterTime: ["", ""],
  MsgType: 0,
  Type: 2,
  Size: 10,
  Page: 1,
  Keywords: "",
  Appid: 0,
})

const on读取列表 = () => {
  console.log("对象_搜索条件")
  console.log(对象_搜索条件.value)
  onGetLogLoginList()
}
const onReset = () => {
  对象_搜索条件.value = {
    RegisterTime: ["", ""],
    Type: 1,
    MsgType: 0,
    Size: 10,
    Page: 1,
    Keywords: ""
  }
}

const is加载中 = ref(false)
const onGetLogLoginList = async () => {
  is加载中.value = true
  const res = await GetLogList(对象_搜索条件.value)
  console.log(res)
  is加载中.value = false
  Data.value = res.data
  Store.commit("set搜索_默认选择应用AppId", 对象_搜索条件.value.AppId)

}


// table元素
import {useTableHeight} from "@/composables/useTableHeight";
import {GetAppIdNameList} from "@/api/应用列表api";
const { tableRef, tableHeight, updateTableHeight } = useTableHeight(85)
const on表格列宽被改变 = (newWidth: any, oldWidth: any, columns: any, event: any) => {
  let 局_列宽数组: number[] = 表格读取列宽数组(tableRef.value)

  localStorage.setItem('列宽_用户消息', JSON.stringify(局_列宽数组));
}
const on表格列宽初始化 = () => {

  let 局_列宽数组文本 = localStorage.getItem('列宽_用户消息')
  if (局_列宽数组文本 != null) {
    let 局_列宽数组: number[] = JSON.parse(局_列宽数组文本)

    表格写入列宽数组(tableRef, 局_列宽数组)
    console.log("用户消息列宽被初始化")
    console.log(局_列宽数组)
  }
}





onMounted(async () => {
  await onGetAppIdNameList()
  Data.value = {
    "Count": 0,
    "List": []
  }

  onReset()
  if (Store.state.搜索_用户消息.Size != 0 && Store.state.搜索_用户消息.Size != null) {
    对象_搜索条件.value = Store.state.搜索_用户消息
    console.log("恢复搜索条件")
    console.log(Store.state.搜索_用户消息.Size)
    console.log(Store.state.搜索_用户消息)
  }
  on更新on用户消息类型列表()
  await onGetLogLoginList()

  on表格列宽初始化()
})

onBeforeUnmount(() => {
  console.log("事件在卸载之前触发")
  Store.commit("set搜索_用户消息", 对象_搜索条件.value)
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

const tableRowClassName = ({
                             row,
                             rowIndex,
                           }: {
  row: any
  rowIndex: number
}) => {
  if (row.IsRead) {
    return ''
  }
  return '未读-row'
}



// <el-option label="全部" :value="0"/>
//     <el-option label="其他" :value="1"/>
//     <el-option label="Bug" :value="2"/>
//     <el-option label="投诉建议" :value="3"/>
//     <el-option label="系统内部" :value="4"/>
const onMsgTypeList = ref<string>("")
const on用户消息类型列表 = ref<string[]>([ "其他", "Bug", "投诉建议", "系统内部"])

const on更新on用户消息类型列表 = async () => {
  let 返回  = await GetUserMsgConfig()
  if (返回.code == 10000) {
    onMsgTypeList.value = 返回.data.MsgTypeList
    重置消息类型()
  }
}
const 重置消息类型 = () => {

  on用户消息类型列表.value= [ "其他", "Bug", "投诉建议", "系统内部"]
    let 局_临时数组 = onMsgTypeList.value.split("|")
    for (let i = 0; i < 局_临时数组.length; i++) {
      if (局_临时数组[i] == "") {
        continue
      }
      on用户消息类型列表.value.push(局_临时数组[i])
    }

}


const on设置消息类型 = async () => {
  //输入消息类型
  ElMessageBox.prompt('请输入要追加设置的消息类型，以"|"分割', 'Tip', {
    confirmButtonText: '确定设置',
    cancelButtonText: '取消',
    inputValue: onMsgTypeList.value,
  })
      .then(async ({value}) => {
        let 返回 = await SaveUserMsgConfig({
          MsgTypeList: value
        })
        if (返回.code == 10000) {
          onMsgTypeList.value = value
          重置消息类型()
        }
      })


}

const MapAppId_Name = ref({
  1: "管理平台",
  2: "代理平台",
  3: "WebApi",
  10: "Web用户中心",
  11: "WebSocket",
})
const 数组AppId_Name = ref([{
  "appId": 1,
  "appName": "1级代理平台"
}])
const onGetAppIdNameList = async () => {

  const res = await GetAppIdNameList()
  数组AppId_Name.value = res.data.array
  MapAppId_Name.value = res.data.map
  let a={
    1: "管理平台",
    2: "系统自动",
    3: "WebApi",
    10: "Web用户中心",
    11: "WebSocket",
  }
  for ( let key in a){
    数组AppId_Name.value.push({appId:Number(key),appName:a[key]})
    MapAppId_Name.value[Number(key)]=a[key]
  }

}
</script>

<style scoped lang="scss">
.el-table ::v-deep(.未读-row) {
  --el-table-tr-bg-color: var(--el-color-primary-light-9);
}

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
  margin: 0 10px 8px 0;
}

.el-table .cell {
  white-space: pre-line;

}

</style>
