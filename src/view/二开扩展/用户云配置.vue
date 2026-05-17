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
                    style="top:0 ; width: auto;padding: 0;margin: 0"
                    clearable
          >
            <template #prepend>
              <el-select v-model="对象_搜索条件.Type" placeholder="名称" style="width: 100px;">
                <el-option label="配置名称" :value="1"/>
                <el-option label="用户" :value="2"/>
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
        <!--        <el-button icon="Plus" type="primary" style="margin: 8px 8px 8px; width: 65px"
                           @click="on对话框详细信息打开('')">
                  新增
                </el-button>-->

        <el-popconfirm title="确定删除勾选变量?" width="200"
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
                fit="fit"
                :header-cell-style="{background:'#FAFAFAFF',color:'#606266'}">
        <el-table-column type="selection" width="45"/>
        <el-table-column prop="appName" label="应用名称" width="220" show-overflow-tooltip=""/>
        <el-table-column prop="Ka" label="用户" width="210" show-overflow-tooltip="">
          <template #default="scope">
            <el-icon class="复制按钮" @click="置剪辑版文本(scope.row.User,'已复制到剪辑版')">
              <DocumentCopy/>
            </el-icon>
            {{ scope.row.User }}
          </template>
        </el-table-column>
        <el-table-column prop="Name" label="云配置名称" width="120"/>
        <el-table-column prop="Value" label="云配置值" width="500" show-overflow-tooltip="">
          <template #default="scope">
            <el-button link type="primary" size="default" v-if="scope.row.Uid>0"
                       @click="on云配置值被改变(scope.$index,scope.row)" style="color:#79bbff">
              <el-icon color="#79bbff" size="18" class="管理员备注编辑">
                <Edit/>
              </el-icon>
            </el-button>
            {{ scope.row.Value }}
          </template>
        </el-table-column>
        <el-table-column prop="UpdateTime" label="更新时间" width="170" show-overflow-tooltip="">
          <template #default="scope">
            {{ 时间_时间戳到时间(scope.row.UpdateTime) }}
          </template>
        </el-table-column>
        <el-table-column :fixed="is移动端()?false:'right'" label="操作" :width="2*85">
          <template #default="scope">
            <!--            <el-button link type="primary" size="default" @click="on单个编辑(scope.row.Name)"
                                   style="color:#79bbff">
                          <el-icon color="#79bbff" class="no-inherit">
                            <Edit/>
                          </el-icon>
                          编辑
                        </el-button>-->
            <el-button link type="primary" size="default" @click="on单个删除(scope.row)"
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
import {GetList, DeleteInfo,SetUserConfig} from "@/api/用户云配置api.js";
import {useStore} from "vuex";
// 引入中文包
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import {ElMessage, ElMessageBox} from 'element-plus'

import {Delete} from "@element-plus/icons-vue";
import {
  is移动端,
  时间_取现行时间戳,
  时间_时间戳到时间,
  置剪辑版文本,
  表格写入列宽数组,
  表格读取列宽数组
} from "@/utils/utils";
import {GetAppIdNameList} from "@/api/应用列表api";


const MapAppId_Name = ref({})
const 数组AppId_Name = ref([{
  "appId": 10000,
  "appName": ""
}])
const onGetAppIdNameList = async () => {
  let res = await GetAppIdNameList()
  数组AppId_Name.value = res.data.array
  MapAppId_Name.value = res.data.map
  console.log("没有搜索条件的应用,修改第一个,现在搜索条件的值为:" + res.data.map[对象_搜索条件.value.AppId.toString()])

  if (res.data.map[对象_搜索条件.value.AppId.toString()] == null || 对象_搜索条件.value.AppId <= 10000) {
    // let 局_默认appid=Store.state.搜索_默认选择应用AppId
    // 对象_搜索条件.value.AppId = 数组AppId_Name.value.some(item => item.Appid === 局_默认appid)?局_默认appid:数组AppId_Name.value[0].Appid
  }

}
const on单个删除 = async (row: any) => {

  const res = await DeleteInfo({"data": [{"AppId": row.AppId, "Name": row.Name, "Uid": row.Uid}]})
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
  let ids: object[] = []
  for (let i = 0; i < 表格被选中列表.value.length; i++) {
    ids.push({
      "AppId": 表格被选中列表.value[i].AppId,
      "Name": 表格被选中列表.value[i].Name,
      "Uid": 表格被选中列表.value[i].Uid
    })
  }
  console.log(ids)
  const res = await DeleteInfo({"data": ids})
  console.log(res)
  if (res.code == 10000) {
ElMessage.success(res.msg)
    on读取列表()
  }
}


const 表格被选中列表 = ref([])
const is批量删除禁用 = ref(true)

const on选择框被选择 = (val: any) => {
  表格被选中列表.value = val
  is批量删除禁用.value = 表格被选中列表.value.length == 0
}

const Data = ref({
  "count": 0,
  "list": [
    {
      "AppId": 1,
      "Name": "",
      "Value": "",
      "Type": 1,
      "IsVip": 1
    }]
})
const Store = useStore()
const 对象_搜索条件初始值 = {AppId: 0, Type: 2, Size: 10, Page: 1, Keywords: ""}
const 对象_搜索条件 = ref(Object.assign({}, 对象_搜索条件初始值))

const on读取列表 = () => {
  console.log("对象_搜索条件")
  console.log(对象_搜索条件.value)
  onGetList()
}
const onReset = () => {
  let Appidc = 对象_搜索条件.value.AppId
  对象_搜索条件.value = Object.assign({}, 对象_搜索条件初始值)
  对象_搜索条件.value.AppId = Appidc
  console.log(对象_搜索条件.value)
  onGetAppIdNameList()
}


const is加载中 = ref(false)
const onGetList = async () => {
  is加载中.value = true
  const res = await GetList(对象_搜索条件.value)
  console.log(res)
  is加载中.value = false
  Data.value = res.data
  Store.commit("set搜索_默认选择应用AppId", 对象_搜索条件.value.AppId)

}

// table元素
import {useTableHeight} from "@/composables/useTableHeight";
const { tableRef, tableHeight, updateTableHeight } = useTableHeight(85)
const on表格列宽被改变 = (newWidth: any, oldWidth: any, columns: any, event: any) => {
  let 局_列宽数组: number[] = 表格读取列宽数组(tableRef.value)

  localStorage.setItem('列宽_用户云配置', JSON.stringify(局_列宽数组));
}
const on表格列宽初始化 = () => {

  let 局_列宽数组文本 = localStorage.getItem('列宽_用户云配置')
  if (局_列宽数组文本 != null) {
    let 局_列宽数组: number[] = JSON.parse(局_列宽数组文本)

    表格写入列宽数组(tableRef.value, 局_列宽数组)
  }
}

onMounted(async () => {
  Data.value.list = []
  onReset()
  //如果 Store zize 不为0 且不为 null  才读取,不然就使用默认的
  if (Store.state.搜索_用户云配置 .Size != 0 && Store.state.搜索_用户云配置.Size != null) {
    对象_搜索条件.value = Store.state.搜索_用户云配置
  }
  await onGetAppIdNameList()
  await onGetList()
  on表格列宽初始化()
})

onBeforeUnmount(() => {
  console.log("事件在卸载之前触发")
  Store.commit("set搜索_用户云配置", 对象_搜索条件.value)
})

const on云配置值被改变 = async (表项索引: number, row:any ) => {
  if (row.Uid<=0){
    ElMessage.error("请先选择用户")
    return
  }


  let 新云配置值 = row.Value
  await ElMessageBox.prompt('请输入云配置值', '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValue: 新云配置值
  })
      .then(async ({value}) => {
        新云配置值 = value
        const res = await SetUserConfig({"AppId": row.AppId,"Uid":row.Uid,"Name":row.Name, "Value": 新云配置值})
        console.log(res)
        if (res.code == 10000) {
          Data.value.list[表项索引].Value = 新云配置值   //成功赋新值
          Data.value.list[表项索引].UpdateTime = 时间_取现行时间戳()   //成功赋新值
          ElMessage.success(res.msg)
          return true
        } else {
          return false
        }
      })
      .catch(() => {
        return
      })


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
