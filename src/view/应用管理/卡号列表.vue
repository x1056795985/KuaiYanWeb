<template>
  <div class="最底层div">
    <div class="内容div" style="align-items: center ">
      <el-form :inline="true">
        <el-form-item :label="is移动端()?'':'选择应用'" prop=""   :style="{ width: is移动端() ? '100%' : '280px' }">
          <el-select v-model.number="对象_搜索条件.AppId" clear placeholder="请选择应用" filterable @change="on读取列表">
            <el-option v-for="(item,index) in 数组AppId_Name" :key="item.appId"
                       :label="item.appName+'('+ (item.appId?.toString() ?? '') +')'" :value="item.appId"/>
          </el-select>
        </el-form-item>
        <el-form-item prop="status" style="width:120px" v-show="is更多筛选||!is移动端()">
          <el-select v-model="对象_搜索条件.Status" clear placeholder="请选择">
            <el-option key="0" label="全部状态" :value="0"/>
            <el-option key="1" label="正常" :value="1"/>
            <el-option key="2" label="冻结" :value="2"/>
          </el-select>
        </el-form-item>

        <el-form-item prop="KaClassId" style="width:120px" v-show="is更多筛选||!is移动端()">
          <el-select v-model="对象_搜索条件.KaClassId" clear placeholder="选择卡类">
            <el-option key="0" label="全部卡类" :value="0"/>
            <el-option v-for="(值,index) in 对象_卡类型" :key="index" :label="对象_卡类型[index]"
                       :value="Number(index)"/>
          </el-select>
        </el-form-item>

        <el-form-item prop="status" style="width:120px"  v-if="!is移动端()" v-show="is更多筛选||!is移动端()">
          <el-select v-model="对象_搜索条件.Num" clear placeholder="请选择">
            <el-option key="0" label="全部使用" :value="0"/>
            <el-option key="1" label="已耗尽次数" :value="1"/>
            <el-option key="2" label="有使用次数" :value="2"/>
          </el-select>
        </el-form-item>

        <el-form-item prop="status" style="width:250px" v-show="is更多筛选">
          <el-config-provider :locale="zhCn">
            <el-date-picker
                v-model="对象_搜索条件.RegisterTime"
                value-format="X"
                type="daterange"
                unlink-panels
                range-separator="到"
                start-placeholder="制卡开始日期"
                end-placeholder="制卡结束日期"
                :shortcuts="数组_制卡预选日期"
            />
          </el-config-provider>
        </el-form-item>
        <el-form-item prop="status" style="width:250px"  v-show="is更多筛选">
          <el-config-provider :locale="zhCn">
            <el-date-picker
                v-model="对象_搜索条件.UseTime"
                value-format="X"
                type="daterange"
                unlink-panels
                range-separator="到"
                start-placeholder="使用开始日期"
                end-placeholder="使用结束日期"
                :shortcuts="数组_制卡预选日期"
            />
          </el-config-provider>
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
                <el-option label="卡号" :value="2"/>
                <el-option label="管理员备注" :value="3"/>
                <el-option label="代理备注" :value="4"/>
                <el-option label="制卡人" :value="5"/>
                <el-option label="充值用户" :value="6"/>
                <el-option label="推荐人" :value="7"/>
              </el-select>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item style="padding-left: 5px">
          <el-button type="primary" icon="search" @click="on读取列表">查询</el-button>
          <el-button icon="refresh" @click="onReset">重置</el-button>
          <el-tooltip
              v-if="!is移动端()"
              class="box-item"
              effect="light"
              content="更多筛选"
              placement="top"
          >
            <el-button icon="Plus" v-show="!is更多筛选" @click="is更多筛选=true"></el-button>
          </el-tooltip>
          <el-button v-else icon="Plus" v-show="!is更多筛选" @click="is更多筛选=true"></el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="内容div">
      <div class="gva-btn-list" style="background:#FAFAFAFF">
        <el-button icon="Plus" type="primary"
                   style="margin: 8px 8px 8px;"
                   :style="{ width: is移动端() ? '15px' : '75px' }"
                   @click="on对话框详细信息打开(0,false)">
          {{is移动端()?"":"制新卡"}}
        </el-button>

        <el-popconfirm
            :title="Data.AppType>=3?'卡号登录应用,删除后无法登录改卡号,确定删除勾选卡号?':'确定删除勾选卡号?'"
            width="200"
            @confirm="on批量删除" confirm-button-text="确定"
            cancel-button-text="取消">
          <template #reference>
            <el-button icon="delete" type="danger"   style="margin: 8px 8px 8px"
                       :style="{ width: is移动端() ? '15px' : '65px' }"
                       :disabled=is批量删除禁用>{{is移动端()?"":"删除"}}
            </el-button>
          </template>
        </el-popconfirm>
        <el-button icon="Memo"   style="margin: 8px 8px 8px"
                   :style="{ width: is移动端() ? '15px' : '85px' }" @click="on跳转卡类列表(对象_搜索条件.AppId)">
           {{is移动端()?"":"卡类列表"}}
        </el-button>
        <div class="工具栏">

          <el-popover placement="right" trigger="hover">
            <template #reference>
              <el-icon>
                <More/>
              </el-icon>
            </template>
            <li class="工具_更多_li" @click="on批量冻结解冻(2)">批量冻结</li>
            <li class="工具_更多_li" @click="on批量冻结解冻(1)">批量解冻</li>
            <li class="工具_更多_li" @click="表格导出csv文本并下载(tableRef, '卡号列表' + Date().toLocaleString(),[])">
              导出到csv
            </li>
            <li class="工具_更多_li" @click="on对话框详细信息打开(0,true)">导入误删卡</li>
            <li class="工具_更多_li" @click="on批量维护删除(1)">删除已耗尽卡号</li>
          </el-popover>
          <el-tooltip content="分析"
                      effect="dark"
                      placement="top"
                      v-if="!is移动端()"
          >
            <el-icon @click="on图表分析被点击">
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

      <el-table v-loading="is加载中" :data="Data.list" border style="width: 100% ;white-space: pre-wrap;"
                ref="tableRef"
                @header-dragend="on表格列宽被改变"
                :max-height="tableHeight"
                @selection-change="on选择框被选择"
                :header-cell-style="{background:'#FAFAFAFF',color:'#606266'}">
        <el-table-column type="selection" width="45"/>
        <el-table-column prop="Id" label="Id" width="80"/>
        <el-table-column prop="Name" label="卡号" width="210" show-overflow-tooltip="">
          <template #default="scope">
            <el-icon class="复制按钮" @click="置剪辑版文本(scope.row.Name,'已复制到剪辑版')">
              <DocumentCopy/>
            </el-icon>
            {{ scope.row.Name }}
          </template>
        </el-table-column>
        <el-table-column prop="KaClassId" label="卡类名称" width="150">
          <template #default="scope">
            <el-tag
                :type="对象_卡类型.hasOwnProperty(scope.row.KaClassId.toString())?'primary':'danger'">
              {{
                !对象_卡类型.hasOwnProperty(scope.row.KaClassId.toString()) ? '卡类已删' : 对象_卡类型[scope.row.KaClassId.toString()]
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="left" label="状态" prop="status">
          <template #default="scope">
            <el-switch
                :active-value="1"
                :inactive-value="2"
                v-model="scope.row.Status"
                inline-prompt
                style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                active-text="正常"
                inactive-text="冻结"
                @change="on冻结状态被改变(scope.$index,scope.row.Id,scope.row.Status)"
            />
          </template>
        </el-table-column>


        <el-table-column prop="VipTime" :label="isAppType计点()?'点数':'时间'" width="120">
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
        <el-table-column prop="InviteCount" :label="isAppType计点()?'推荐人送点':'推荐人送时'" width="120"
                         v-if="Data.AppType<=2">
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
        <el-table-column prop="RMb" label="余额" width="60" v-if="Data.AppType<=2"/>
        <el-table-column prop="VipNumber" label="积分" width="60"/>
        <el-table-column prop="Num" label="已用/最大" width="85">
          <template #default="scope">
            <el-tag
                :type="scope.row.Num<scope.row.NumMax?'primary':'warning'">
              {{ scope.row.Num.toString() + '/' + scope.row.NumMax.toString() }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="RegisterTime" label="使用时间" width="160">
          <template #default="scope">
            {{ scope.row.UseTime===0?'':时间_时间戳到时间(scope.row.UseTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="RegisterUser" label="制卡人" width="100"/>
        <el-table-column prop="RegisterTime" label="制卡时间" width="160">
          <template #default="scope">
            {{ 时间_时间戳到时间(scope.row.RegisterTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="AdminNote" label="管理员备注" width="150" show-overflow-tooltip="">
          <template #default="scope">
            <el-button link type="primary" size="default"
                       @click="on管理员备注被改变(scope.$index,scope.row.Id,scope.row.AdminNote)" style="color:#79bbff">
              <el-icon color="#79bbff" size="18" class="管理员备注编辑">
                <Edit/>
              </el-icon>
            </el-button>
            {{ scope.row.AdminNote }}
          </template>
        </el-table-column>
        <el-table-column prop="AgentNote" label="代理备注" width="150" show-overflow-tooltip=""/>
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
        <el-table-column prop="NoUserClass" label="用户类型不同处理方式" width="180" v-if="Data.AppType<=2">
          <template #default="scope">
            <el-tag :type="scope.row.NoUserClass===1?'success':'warning'">
              {{
                scope.row.NoUserClass === 1 ? '自动根据权重转换新分组' : scope.row.NoUserClass === 2 ? '禁止充值' : '未知方式' + scope.row.NoUserClass
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="KaType" label="充值类型" width="100" v-if="Data.AppType<=2">
          <template #default="scope">
            <el-text>
              {{
                scope.row.KaType === 1 ? '有次数即可' : scope.row.KaType === 2 ? '每用户一次' : '未知方式' + scope.row.KaType
              }}
            </el-text>
          </template>
        </el-table-column>
        <el-table-column prop="MaxOnline" label="最大在线数" width="100"/>
        <el-table-column prop="EndTime" label="有效期" width="160">
          <template #default="scope">
            {{ scope.row.EndTime >= 9999999999 ? "无限制" : 时间_时间戳到时间(scope.row.EndTime) }}
          </template>
        </el-table-column>
        <el-table-column :fixed="is移动端()?false:'right'" label="操作" width="140">
          <template #default="scope">
            <el-button link type="primary" size="default" @click="on单个编辑(scope.row.Id)" style="color:#79bbff">
              <el-icon color="#79bbff" class="no-inherit">
                <Edit/>
              </el-icon>
              编辑
            </el-button>
            <el-button link type="primary" size="default" v-if="scope.row.Num>0" @click="on单个追回(scope.row.Id)"
                       style="color:#E6A23C">
              <el-icon color="#E6A23C" class="no-inherit">
                <RefreshLeft/>
              </el-icon>
              追回
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
              :page-sizes="[10, 20, 30, 50,100,1000]"
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
  <KaNew v-if="is对话框可见" :id="is对话框id" :AppId="对象_搜索条件.AppId"
         :AppName="MapAppId_Name?.[对象_搜索条件.AppId?.toString() ?? '0'] ?? ''" :AppType="Data.appType"
         @on对话框详细信息关闭="on对话框详细信息关闭" :KaClass="对象_卡类型"
         :批量维护导入卡号="批量维护导入卡号"></KaNew>

  <KaEdit :is对话框可见="is对话框可见卡详细信息" :id="is对话框卡详细信息id" :AppId="对象_搜索条件.AppId"
          :AppName="MapAppId_Name?.[对象_搜索条件.AppId?.toString() ?? '0'] ?? ''" :AppType="Data.appType"
          @on对话框详细信息关闭="on对话框详细信息关闭" :KaClass="对象_卡类型" :UserType="对象_用户类型"></KaEdit>
  <ChartData v-if="is图表分析抽屉可见" @on图表分析抽屉关闭="is图表分析抽屉可见 = false"/>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref} from "vue";
import {GetKaList, Del批量删除Ka, SetStatus, SetAdminNote, Del批量追回Ka, Del批量维护_删除} from "@/api/卡号列表api.js";
import {GetAppIdNameList} from "@/api/应用列表api.js";
import {
  时间_时间戳到时间,
  时间_计算天时分秒提示,
  is移动端,
  置剪辑版文本,
  表格导出csv文本并下载, 表格读取列宽数组, 表格写入列宽数组
} from "@/utils/utils";
import {useStore} from "vuex";
// 引入中文包
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import {ElMessage, ElMessageBox} from 'element-plus'
import {Delete} from "@element-plus/icons-vue";
import KaNew from "./组件/卡号列表制卡.vue";
import KaEdit from "./组件/卡号详细信息.vue";
import ChartData from "@/view/应用管理/组件/卡号列表图表抽屉.vue";
import router from "@/router";
import {useTableHeight} from "@/composables/useTableHeight";
const { tableRef, tableHeight, updateTableHeight } = useTableHeight(60)// 表格实例,表格高度,更新表格高度
const is图表分析抽屉可见 = ref(false)
const is更多筛选 = ref(false)
const on图表分析被点击 = () => {
  Store.commit("set搜索_卡号列表", 对象_搜索条件.value)
  is图表分析抽屉可见.value = true
}

const on批量冻结解冻 = async (Status: number) => {
  const ids = 表格被选中列表.value.map((item => item.Id))
  if (ids.length == 0) {
    ElMessage.error("选中数据不能为0")
    return
  }
  const res = await SetStatus({"AppId": 对象_搜索条件.value.AppId, "Id": ids, "Status": Status})

  console.log(res)
  if (res.code == 10000) {
    ElMessage.success(res.msg)

    for (let i = 0; i < Data.value.list.length; i++) {
      if (ids.some(ele => ele === Data.value.list[i].Id)) { //判断数组内是否存在该ID,如果存在则修改状态
        Data.value.list[i].Status = Status
      }
    }
    return true
  }

}


const on单个追回 = async (id: number) => {

  let 局_类型 = '确认要追回ID为' + id.toString() + '卡号吗?,<br>已充值的用户和推荐人扣回卡号(' + (isAppType计点() ? "点数" : "时间") + ',积分,余额)值,<br>可能会导致用户该值变为负数,<br>卡号冻结并清除使用记录(会写备注)'

  ElMessageBox.confirm(
      局_类型,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        draggable: true,
        dangerouslyUseHTMLString: true
      }
  )
      .then(async () => {
        const res = await Del批量追回Ka({"ID": [id]})
        console.log(res)
        if (res.code == 10000) {
          ElMessage.success(res.msg)
          on读取列表()
        }
      })
      .catch(() => {
        return
      })
}
const on单个删除 = async (id: number) => {
  console.log('on单个删除' + id)

  const res = await Del批量删除Ka({"ID": [id]})
  console.log(res)
  if (res.code == 10000) {
    ElMessage.success(res.msg)
    on读取列表()
  }
}
const on单个编辑 = async (id: number) => {
  is对话框可见卡详细信息.value = true
  is对话框卡详细信息id.value = id
}

const on批量删除 = async () => {
  const ids = 表格被选中列表.value.map((item => item.Id))
  console.log(ids)
  const res = await Del批量删除Ka({"AppId": 对象_搜索条件.value.AppId, "ID": ids})
  console.log(res)
  if (res.code == 10000) {
    ElMessage.success(res.msg)
    on读取列表()
  }
}
const on批量维护删除 = async (Type: number) => {

  var 提示信息 = {
    1: "删除全部已耗尽次数卡号"
  }
  console.log(提示信息)
  ElMessageBox.confirm(
      '确定要' + 提示信息[Type] + '?',
      '',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(async () => {
    let 返回 = await Del批量维护_删除({AppId: 对象_搜索条件.value.AppId, Type: Type})
    if (返回.code == 10000) {
      ElMessage.success(返回.msg)
      on读取列表()
    }

  }).catch()
}

const 表格被选中列表 = ref([])
const is批量删除禁用 = ref(true)
const is工具_更多 = ref(false)

const is对话框可见 = ref(false)
const is对话框id = ref(0)
const is对话框可见卡详细信息 = ref(false)
const is对话框卡详细信息id = ref(0)
const 批量维护导入卡号 = ref(false)
const on对话框详细信息打开 = (id: number, is维护: boolean) => {
  is对话框id.value = id
  批量维护导入卡号.value = is维护
  is对话框可见.value = true
}
const on对话框详细信息关闭 = (is重新读取: boolean) => {
  //console.info("父组件收到对话框被关闭了")
  is对话框可见.value = false
  is对话框id.value = 0
  is对话框可见卡详细信息.value = false
  is对话框卡详细信息id.value = 0

  if (is重新读取) {
    on读取列表()
  }
}

const on选择框被选择 = (val: any) => {
  表格被选中列表.value = val
  is批量删除禁用.value = 表格被选中列表.value.length == 0
}

const Data = ref({
  count: 0,
  appType: 1,
  list: []
})
const Store = useStore()
const 对象_搜索条件 = ref({
  AppId: 10000,
  Status: 0,
  Num: 0,
  RegisterTime: ["", ""],
  UseTime: ["", ""],
  KaClassId: 0,
  Type: 2,
  Size: 10,
  Page: 1,
  Keywords: ""
})

const on读取列表 = () => {
  console.log("对象_搜索条件")
  console.log(对象_搜索条件.value)
  onGetKaList()
}
const onReset = () => {
  let Appidc = 对象_搜索条件.value.AppId
  console.log("重置搜索条件,保留appid:" + Appidc)
  console.log(Store.state.搜索_卡号列表)
  对象_搜索条件.value = {
    AppId: 10000,
    Status: 0,
    Num: 0,
    RegisterTime: ["", ""],
    UseTime: ["", ""],
    KaClassId: 0,
    Type: 2,
    Size: 10,
    Page: 1,
    Keywords: ""
  }
  onGetAppIdNameList()
}


const is加载中 = ref(false)
const onGetKaList = async () => {
  if (对象_搜索条件.value.AppId === 10000) {
    ElMessage.error("请选选择应用")
    return   // 默认值 不搜索
  }

  is加载中.value = true
  const res = await GetKaList(对象_搜索条件.value)
  console.log(res)
  is加载中.value = false
  if (res.code === 10000 && res.data) {
    Data.value.count = res.data.count ?? 0
    Data.value.appType = res.data.appType ?? 1
    Data.value.list = res.data.list ?? []
    对象_用户类型.value = res.data.userClass ?? {}
    对象_用户类型.value["0"] = "未分类"
    对象_卡类型.value = res.data.kaClass ?? {}
  }
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
  数组AppId_Name.value = res.data?.array ?? []
  MapAppId_Name.value = res.data?.map ?? {}
  const appIdStr = 对象_搜索条件.value.AppId?.toString() ?? '0'
  console.log("没有搜索条件的应用,修改第一个,现在搜索条件的值为:" + (MapAppId_Name.value[appIdStr] ?? 'null'))

  if (!MapAppId_Name.value[appIdStr] || 对象_搜索条件.value.AppId <= 10000) {
    let 局_默认appid = Store.state.搜索_默认选择应用AppId
    if (数组AppId_Name.value.length > 0) {
      对象_搜索条件.value.AppId = 数组AppId_Name.value.some(item => item.appId === 局_默认appid)
        ? 局_默认appid
        : 数组AppId_Name.value[0].appId
    } else {
      对象_搜索条件.value.AppId = 0 // no app available
    }
  }

}
const 对象_用户类型 = ref({"0": "未分类"})
const 对象_卡类型 = ref({})

const on表格列宽被改变 = (newWidth: any, oldWidth: any, columns: any, event: any) => {
  let 局_列宽数组: number[] = 表格读取列宽数组(tableRef.value)

  localStorage.setItem('列宽_卡号列表', JSON.stringify(局_列宽数组));
}
const on表格列宽初始化 = () => {

  let 局_列宽数组文本 = localStorage.getItem('列宽_卡号列表')
  if (局_列宽数组文本 != null) {
    let 局_列宽数组: number[] = JSON.parse(局_列宽数组文本)

    表格写入列宽数组(tableRef.value, 局_列宽数组)
  }
}



onMounted(async () => {

      Data.value = {"Count": 0, "AppType": 1, "List": []}
      onReset()
      //如果 Store zize 不为0 且不为 null  才读取,不然就使用默认的
      if (Store.state.搜索_卡号列表.Size != 0 && Store.state.搜索_卡号列表.Size != null) {
        对象_搜索条件.value = Store.state.搜索_卡号列表
        console.log("恢复搜索条件")
        console.log(Store.state.搜索_卡号列表.Size)
        console.log(Store.state.搜索_卡号列表)
      }
      await onGetAppIdNameList()
      await onGetKaList()
      on表格列宽初始化()
    }
)


onBeforeUnmount(() => {
  console.log("事件在卸载之前触发")
  Store.commit("set搜索_卡号列表", 对象_搜索条件.value)
})
const isAppType计点 = () => {
  return Data.value.AppType === 2 || Data.value.AppType === 4
}
const on冻结状态被改变 = async (表项索引: number, ID: number, Status: number) => {
  // console.info("on冻结状态被改变索引:"+表项索引+",Id:"+ID,"Status:"+Status)
  // console.info(表项索引)
  const res = await SetStatus({"AppId": 对象_搜索条件.value.AppId, "Id": [ID], "Status": Status})

  console.log(res)
  if (res.code == 10000) {
    ElMessage.success(res.msg)
    return true
  } else {
    Data.value.list[表项索引].Status = Status == 1 ? 2 : 1
    return false
  }

}

const on管理员备注被改变 = async (表项索引: number, ID: number, AdminNote: string) => {
  console.log("on管理员备注被改变")
  let 新管理员备注 = AdminNote
  await ElMessageBox.prompt('请输入新管理员备注', '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValue: AdminNote
  })
      .then(async ({value}) => {
        新管理员备注 = value
        const res = await SetAdminNote({"Id": [ID], "AdminNote": 新管理员备注})
        console.log(res)
        if (res.code == 10000) {
          Data.value.list[表项索引].AdminNote = 新管理员备注   //成功赋新值
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
const 数组_制卡预选日期 = [{
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

const on跳转卡类列表 = (AppId: Number) => {

  Store.commit("set搜索_卡类列表", {AppId: AppId, Type: 2, Size: 10, Page: 1, Keywords: ""})
  router.push("/应用管理/卡类列表")
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
