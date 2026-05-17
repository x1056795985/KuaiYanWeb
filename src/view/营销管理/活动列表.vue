<template>
  <div class="最底层div">
    <div class="内容div" style="align-items: center ">
      <el-form :inline="true">
        <el-form-item :label="is移动端()?'':'选择应用'" prop="" :style="{ width: is移动端() ? '100%' : '280px' }">
          <el-select v-model.number="对象_搜索条件.AppId" clear placeholder="请选择应用" filterable
                     @change="on读取列表">
            <el-option v-for="(item,index) in 数组AppId_Name" :key="item.appId"
                       :label="item.appName+'('+item.appId.toString()+')'" :value="item.appId"/>
          </el-select>
        </el-form-item>
        <el-form-item prop="status" style="width:120px" v-show="!is移动端()">
          <el-select v-model="对象_搜索条件.Status" clear placeholder="请选择">
            <el-option key="0" label="全部状态" :value="0"/>
            <el-option key="1" label="未开始" :value="1"/>
            <el-option key="2" label="活动中" :value="2"/>
            <el-option key="3" label="已结束" :value="3"/>
          </el-select>
        </el-form-item>

        <el-form-item prop="PromotionType" style="width:120px" v-show="!is移动端()">
          <el-select v-model="对象_搜索条件.PromotionType" clear placeholder="选择类型">
            <el-option key="0" label="全部类型" :value="0"/>
            <el-option v-for="(值,index) in 对象_活动类型" :key="index" :label="对象_活动类型[index]+String(index)"
                       :value="Number(index)"/>
          </el-select>
        </el-form-item>

        <el-form-item prop="Keywords">
          <el-input class="搜索框"
                    v-model.trim="对象_搜索条件.Keywords"
                    placeholder="搜索内容"
                    style="top:0 ; padding: 0;margin: 0"
                    :style="{ width: is移动端() ? '100%' : '280px' }"
                    clearable
          >
            <template #prepend>
              <el-select v-model="对象_搜索条件.Type" placeholder="名称" style="width: 100px;">
                <el-option label="Id" :value="1"/>
                <el-option label="活动名称" :value="2"/>
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
        <el-button icon="Plus" type="primary"
                   style="margin: 8px 8px 8px;"
                   :style="{ width: is移动端() ? '15px' : '75px' }"
                   @click="on对话框详细信息打开(0,false)">
          {{ is移动端() ? "" : "创建" }}
        </el-button>

        <el-popconfirm
            title="'确定删除勾选活动?'"
            width="200"
            @confirm="on批量删除" confirm-button-text="确定"
            cancel-button-text="取消">
          <template #reference>
            <el-button icon="delete" type="danger" style="margin: 8px 8px 8px"
                       :style="{ width: is移动端() ? '15px' : '65px' }"
                       :disabled=is批量删除禁用>{{ is移动端() ? "" : "删除" }}
            </el-button>
          </template>
        </el-popconfirm>
        <div class="工具栏">
<!--          <el-popover placement="right" trigger="hover">-->
<!--            <template #reference>-->
<!--              <el-icon>-->
<!--                <More/>-->
<!--              </el-icon>-->
<!--            </template>-->
<!--            <li class="工具_更多_li" @click="on批量结束活动(1)">批量结束活动</li>-->
<!--          </el-popover>-->
<!--          <el-tooltip content="分析"-->
<!--                      effect="dark"-->
<!--                      placement="top"-->
<!--                      v-if="!is移动端()"-->
<!--          >-->
<!--            <el-icon @click="on图表分析被点击">-->
<!--              <DataAnalysis/>-->
<!--            </el-icon>-->
<!--          </el-tooltip>-->
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
        <el-table-column prop="id" label="Id" width="80"/>
        <el-table-column prop="name" label="名称" width="210"/>
        <el-table-column prop="promotionType" label="活动类型" width="160">
          <template #default="scope">
            <el-tag  effect="plain" :type="['primary', 'info', 'warning','success','danger'][scope.row.Status]">
              {{ 对象_活动类型[scope.row.promotionType]}}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="startTime" label="开始时间" width="180">
          <template #default="scope">
            <div style="display: flex; align-items: center">
              <el-icon>
                <timer/>
              </el-icon>
              <span style="margin-left: 10px">{{ 时间_时间戳到时间(scope.row.startTime) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="endTime" label="结束时间" width="180">
          <template #default="scope">
            <div style="display: flex; align-items: center">
              <el-icon>
                <timer/>
              </el-icon>
              <span style="margin-left: 10px">{{ 时间_时间戳到时间(scope.row.endTime) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="endTime" label="剩余时间" width="220">
          <template #default="scope">
            <div style="display: flex; align-items: center">
              <el-icon>
                <timer/>
              </el-icon>
              <span style="margin-left: 10px">{{ 时间_计算天时分秒提示(scope.row.endTime-时间_取现行时间戳()) }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column :fixed="is移动端()?false:'right'" label="操作" width="240">
          <template #default="scope">
            <el-button link type="primary" size="default" @click="on单个编辑(scope.row.id)" style="color:#79bbff">
              <el-icon color="#79bbff" class="no-inherit">
                <Edit/>
              </el-icon>
              编辑
            </el-button>
            <el-button link type="primary" size="default" @click="on单个重置(scope.row)" style="color:#79bbff">
              <el-icon color="#79bbff" class="no-inherit">
                <RefreshLeft/>
              </el-icon>
              重置
            </el-button>
            <el-button link type="primary" size="default" @click="on单个删除(scope.row.id)" style="color:#f56d6d">
              <el-icon color="#f56d6d" class="no-inherit">
                <Delete/>
              </el-icon>
              删除
            </el-button>
            <el-button link type="primary" size="default" style="color:#79bbff"
                       @click="on置顶(scope.row)">
              <el-icon size="20" :color="scope.row.sort>100?'#79bbff':'#556375'" class="no-inherit"  ><Star /></el-icon>
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
              :page-sizes="[10, 20, 30, 50,100,1000]"
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
  <appPromotionConfig v-if="is对话框可见活动详细信息"   :id="is对话框活动详细信息id" :AppId="对象_搜索条件.AppId" :对象_活动类型="对象_活动类型"
                      :AppName="MapAppId_Name[对象_搜索条件.AppId.toString()]"
                      @on对话框详细信息关闭="on对话框详细信息关闭"  ></appPromotionConfig>
<!--  <ChartData v-if="is图表分析抽屉可见" @on图表分析抽屉关闭="is图表分析抽屉可见 = false"/>-->
</template>

<script lang="ts" setup>
import {onBeforeUnmount, onMounted, ref} from "vue";
// 在Vue组件中使用
import {活动列表api} from "@/api/活动列表api";
import {GetAppIdNameList} from "@/api/应用列表api.js";
import {
  时间_时间戳到时间,
  时间_计算天时分秒提示,
  is移动端,
  置剪辑版文本,
  表格读取列宽数组, 表格写入列宽数组, 时间_取现行时间戳
} from "@/utils/utils";
import {useStore} from "vuex";
// 引入中文包
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import {ElMessage, ElMessageBox} from 'element-plus'
import {Delete} from "@element-plus/icons-vue";
import appPromotionConfig from "../应用管理/组件/活动详细信息.vue";

import {useTableHeight} from "@/composables/useTableHeight";


const {tableRef, tableHeight, updateTableHeight} = useTableHeight(60)// 表格实例,表格高度,更新表格高度
const is图表分析抽屉可见 = ref(false)

const on图表分析被点击 = () => {
  Store.commit("set搜索_活动列表", 对象_搜索条件.value)
  is图表分析抽屉可见.value = true
}
// 1-cps 2-签到"
const 对象_活动类型 = {1: "cps(拉新推广)", 2: "签到"}


const on批量结束活动 = async (Status: number) => {
  const ids = 表格被选中列表.value.map((item => item.id))
  if (ids.length == 0) {
    ElMessage.error("选中数据不能为0")
    return
  }
  // const res = await SetStatus({"AppId": 对象_搜索条件.value.AppId, "Id": ids, "Status": Status})
  //
  // console.log(res)
  // if (res.code == 10000) {
  //   ElMessage.success(res.msg)
  //
  //   for (let i = 0; i < Data.value.List.length; i++) {
  //     if (ids.some(ele => ele === Data.value.List[i].Id)) { //判断数组内是否存在该ID,如果存在则修改状态
  //       Data.value.List[i].Status = Status
  //     }
  //   }
  //   return true
  // }

}

const on单个删除 = async (id: number) => {
  console.log('on单个删除' + id)

  const res = await 活动列表api.delete({"ids": [id]})
  console.log(res)
  if (res.code == 10000) {
    ElMessage.success(res.msg)
    on读取列表()
  }
}
const on单个编辑 = async (id: number) => {
  is对话框可见活动详细信息.value = true
  is对话框活动详细信息id.value = id
}

const on批量删除 = async () => {
  const ids = 表格被选中列表.value.map((item => item.id))
  console.log(ids)
  const res = await 活动列表api.delete({"ids": ids})
  console.log(res)
  if (res.code == 10000) {
    ElMessage.success(res.msg)
    on读取列表()
  }
}
const on置顶 = async (row:list_item) => {
  let 局_新sort = row.sort > 100 ? 0 : 时间_取现行时间戳();
  let 返回 = await 活动列表api.setSort({ ids: [row.id], sort: 局_新sort });
  if (返回.code === 10000) {
    const currentIndex = Data.value.list.findIndex(item => item.id === row.id);
    if (currentIndex === -1) return;
    // 更新排序数值
    Data.value.list[currentIndex].sort = 局_新sort;
    // 分离非零排序项和零排序项
    const nonZeroSort = Data.value.list.filter(item => Number(item.sort) >1000 );
    const zeroSort = Data.value.list.filter(item => Number(item.sort) <1000);
    const newList = [
      ...nonZeroSort.sort((a, b) => Number(b.sort) - Number(a.sort)),
      ...zeroSort.sort((a, b) => Number(a.id) - Number(b.id))
    ];


    Data.value.list.splice(0, Data.value.list.length, ...newList);
  }
};

const 表格被选中列表 = ref([])
const is批量删除禁用 = ref(true)

const is对话框可见活动详细信息 = ref(false)
const is对话框活动详细信息id = ref(0)

const on对话框详细信息打开 = (id: number, is维护: boolean) => {
  is对话框可见活动详细信息.value = true
  is对话框活动详细信息id.value = id
}
const on对话框详细信息关闭 = (is重新读取: boolean) => {
  //console.info("父组件收到对话框被关闭了")

  is对话框可见活动详细信息.value = false
  is对话框活动详细信息id.value = 0

  if (is重新读取) {
    on读取列表()
  }
}

const on选择框被选择 = (val: any) => {
  表格被选中列表.value = val
  is批量删除禁用.value = 表格被选中列表.value.length == 0
}


type list_item = {
  id: number,
  name: string,
  appId: number,
  createTime: number,
  updateTime: number,
  startTime: number,
  endTime: number,
  promotionType: number,
  typeAssociatedId: number,
  sort: number
}
type Data = {
  count: number,
  list: list_item[]
}
const Data = ref<Data>({
  "count": 1,
  "list": []
})
const Store = useStore()
const 对象_搜索条件 = ref({
  AppId: 10000,
  Status: 0,
  PromotionType: 0,
  Type: 2,
  Size: 10,
  Page: 1,
  Keywords: ""
})

const on读取列表 = () => {
  console.log("对象_搜索条件")
  console.log(对象_搜索条件.value)
  onGetList()
}
const onReset = () => {
  let Appidc = 对象_搜索条件.value.AppId
  对象_搜索条件.value = {
    AppId: Appidc,
    Status: 0,
    PromotionType: 0,
    Type: 2,
    Size: 10,
    Page: 1,
    Keywords: ""
  }
  onGetAppIdNameList()
}


const is加载中 = ref(false)
const onGetList = async () => {
  if (对象_搜索条件.value.AppId === 10000) {
    ElMessage.error("请选选择应用")
    return   // 默认值 不搜索
  }

  is加载中.value = true
  const res = await 活动列表api.getList(对象_搜索条件.value)
  console.log(res)
  is加载中.value = false
  Data.value = res.data
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
    let 局_默认appid = Store.state.搜索_默认选择应用AppId
    对象_搜索条件.value.AppId = 数组AppId_Name.value.some(item => item.appId === 局_默认appid) ? 局_默认appid : 数组AppId_Name.value[0].appId
  }
}


const on表格列宽被改变 = (newWidth: any, oldWidth: any, columns: any, event: any) => {
  let 局_列宽数组: number[] = 表格读取列宽数组(tableRef.value)
  localStorage.setItem('列宽_活动列表', JSON.stringify(局_列宽数组));
}
const on表格列宽初始化 = () => {
  let 局_列宽数组文本 = localStorage.getItem('列宽_活动列表')
  if (局_列宽数组文本 != null) {
    let 局_列宽数组: number[] = JSON.parse(局_列宽数组文本)

    表格写入列宽数组(tableRef.value, 局_列宽数组)
  }
}


onMounted(async () => {
      Data.value = {"count": 0, "list": []}
      onReset()
      //如果 Store zize 不为0 且不为 null  才读取,不然就使用默认的
      if (Store.state.搜索_活动列表.Size != 0 && Store.state.搜索_活动列表.Size != null) {
        对象_搜索条件.value = Store.state.搜索_活动列表
      }
      await onGetAppIdNameList()
      await onGetList()
      on表格列宽初始化()
    }
)


onBeforeUnmount(() => {
  console.log("事件在卸载之前触发")
  Store.commit("set搜索_活动列表", 对象_搜索条件.value)
})
const on单个重置 = async (row: list_item) => {
  let 提示信息="该应用确认要重置活动嘛?将删除或重置<br/>"
  if (row.promotionType == 1) {
    提示信息 += "<span style='color:red;'>用户邀请记录,<br/>邀请累计数量和金额,<br/>cps佣金订单信息<br/></span>"
  } else if (row.promotionType == 2) {
    提示信息 += "<span style='color:red;'>用户签到记录,<br/>用户签到分,<br/>用户的签到分变化记录<br/></span>"
  }
  提示信息+="仅建议活动结束后,在重置."

  ElMessageBox.confirm(
      提示信息,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true, // 启用HTML渲染
      }
  )
      .then(async () => {
        let res = await 活动列表api.reset({"id": row.id})
        if (res.code == 10000) {
          ElMessage.success(res.msg)
        }
      })
      .catch(() => {

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
  padding: 2px 16px;
  margin: 0 2px 5px;
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
  margin: 0 10px 8px 0;
}

.el-table .cell {
  white-space: pre-line;
}
</style>
