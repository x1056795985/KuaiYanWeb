<template>
  <div class="最底层div">
    <div class="内容div" style="align-items: center ">
      <el-form :inline="true">
        <el-form-item label="状态" prop="status" style="width:120px">
          <el-select v-model="对象_搜索条件.Status" clear placeholder="全部">
            <el-option key="0" label="全部" :value="0"/>
            <el-option key="1" label="正常" :value="1"/>
            <el-option key="2" label="冻结" :value="2"/>
          </el-select>
        </el-form-item>
        <!--        <el-form-item label="角色" prop="Role" style="width:140px">
                  <el-select v-model="对象_搜索条件.Role" clear placeholder="全部">
                    <el-option key="0" label="全部" :value="0"/>
                    <el-option key="1" label="普通用户" :value="1"/>
                    <el-option key="2" label="代理" :value="2"/>
                  </el-select>
                </el-form-item>-->
        <el-form-item>
          <el-input class="搜索框"
                    v-model.trim="对象_搜索条件.Keywords"
                    placeholder="搜索内容"
                    style="top:0 ; width: 280px;padding: 0;margin: 0"
                    clearable
          >
            <template #prepend>
              <el-select v-model="对象_搜索条件.Type" placeholder="用户名" style="width: 120px;">
                <el-option label="Id" :value="1"/>
                <el-option label="用户名" :value="2"/>
                <el-option label="余额大于?" :value="3"/>
                <el-option label="email邮箱" :value="4"/>
                <el-option label="手机号" :value="5"/>
                <el-option label="QQ" :value="6"/>
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

        <el-popconfirm title="确定删除勾选用户?(不建议删除代理,因为如果存在下级代理,可能会出问题,推荐冻结代理)"
                       width="200" @confirm="on批量删除" confirm-button-text="确定"
                       cancel-button-text="取消">
          <template #reference>
            <el-button icon="warning" type="danger" style="margin: 8px 8px 8px;; width: 65px"
                       :disabled=is批量删除禁用>删除
            </el-button>
          </template>
        </el-popconfirm>
        <el-link type="success" href="/Agent" target="_blank" >打开代理后台</el-link>
        <div class="工具栏">

          <el-popover placement="right" trigger="hover">
            <template #reference>
              <el-icon>
                <More/>
              </el-icon>
            </template>
            <li class="工具_更多_li" @click="on批量维护增减余额输入框可见将打开">on批量增减余额</li>
            <li class="工具_更多_li" @click="on批量维护销售统计">销售统计</li>
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
                :header-cell-style="{background:'#FAFAFAFF',color:'#606266'}">
        <el-table-column type="selection" width="45"/>
        <el-table-column prop="Id" label="Id" width="80"/>
        <el-table-column prop="User" label="用户名" width="130" show-overflow-tooltip="">
          <template #default="scope">
            <el-icon class="复制按钮" @click="置剪辑版文本(scope.row.User,'已复制到剪辑版')">
              <DocumentCopy/>
            </el-icon>
            {{ scope.row.User }}
          </template>
        </el-table-column>

        <el-table-column align="left" label="状态" prop="status" width="80">
          <template #default="scope">
            <el-switch
                :active-value="1"
                :inactive-value="2"
                v-model="scope.row.Status"
                class="ml-2"
                inline-prompt
                style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                active-text="正常"
                inactive-text="冻结"
                @change="on冻结状态被改变(scope.$index,scope.row.Id,scope.row.Status)"
            />
          </template>
        </el-table-column>

        <el-table-column align="left" label="用户角色" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.Role ===0?'primary':'success'">
              {{ scope.row.Role === 0 ? '普通用户' : (scope.row.Role + "级代理") }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="Rmb" label="余额" width="140"/>
        <el-table-column prop="RealNameAttestation" label="实名认证" width="140">
          <template #default="scope">
            <el-tag :type="scope.row.RealNameAttestation!==''?'primary':'danger'">
              {{ scope.row.RealNameAttestation === '' ? '未实名' : '已实名' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="UPAgentId" label="上级代理ID" width="140">
          <template #default="scope">
            {{ scope.row.UPAgentId > 0 ? scope.row.UPAgentId : -scope.row.UPAgentId }}
            <el-tag v-show="scope.row.UPAgentId<0" type="info">
              {{ scope.row.UPAgentId === -1 ? '管理员ID' : '开发者ID' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="AgentDiscount" label="分成百分比" width="160">
          <template #default="scope">
            {{ scope.row.AgentDiscount }}%
          </template>
        </el-table-column>
        <el-table-column prop="Note" label="备注" width="160"  show-overflow-tooltip/>
        <el-table-column prop="LoginTime" label="最后登录时间" width="160" :formatter="on格式化_登录时间"/>
        <!--        <el-table-column prop="LoginIp" label="登录ip" width="140"/>-->
        <el-table-column :fixed="is移动端()?false:'right'" label="操作" width="210">
          <template #default="scope">
            <el-button link type="primary" size="default" @click="on单个编辑(scope.row.Id)" style="color:#79bbff">
              <el-icon color="#79bbff" class="no-inherit">
                <Edit/>
              </el-icon>
              编辑
            </el-button>
            <el-button link type="primary" size="default" @click="is制卡授权对话框可见= true;is对话框id=scope.row.Id"
                       style="color:#79bbff">
              <el-icon color="#79bbff" class="no-inherit">
                <Setting/>
              </el-icon>
              制卡授权
            </el-button>
            <el-button link type="primary" size="default" style="color:#79bbff"
                       @click="on置顶(scope.row)">
              <el-icon size="20" :color="scope.row.Sort>100?'#79bbff':'#556375'" class="no-inherit"  ><Star /></el-icon>
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
  <Userinfo v-if="is对话框可见" :id="is对话框id" @on对话框详细信息关闭="on对话框详细信息关闭"></Userinfo>
  <KaClassAuthority v-if="is制卡授权对话框可见" :id="is对话框id"
                    @on对话框详细信息关闭="is制卡授权对话框可见=false"></KaClassAuthority>
  <BatchAddRmb v-if="is批量维护增减余额输入框可见"
               @on批量维护增减余额输入框被关闭="on批量维护增减余额输入框被关闭"></BatchAddRmb>
  <ChartData v-if="is图表分析抽屉可见" @on图表分析抽屉关闭="on图表分析抽屉关闭"/>
</template>

<script lang="ts" setup>
import {onBeforeUnmount, onMounted, ref} from "vue";
import {GetUserList, Del批量删除用户, SetUserStatus, SetAgentSort} from "@/api/代理信息api.js";
import {时间_时间戳到时间, 时间_取现行时间戳, is移动端,   置剪辑版文本,表格读取列宽数组, 表格写入列宽数组} from "@/utils/utils";
import {useStore} from "vuex";

import zhCn from 'element-plus/es/locale/lang/zh-cn'// 引入中文包
import {ElMessage, ElMessageBox} from 'element-plus'
import {Delete} from "@element-plus/icons-vue";
import Userinfo from "@/view/代理管理/组件/代理用户详细信息.vue";
import KaClassAuthority from "@/view/代理管理/组件/代理制卡授权详细信息.vue";
import ChartData from "@/view/代理管理/组件/代理账号图表抽屉.vue";
import BatchAddRmb from "@/view/用户管理/组件/批量维护增减余额.vue";
import {Set批量维护增减余额} from "@/api/用户信息api";
import router from "@/router";


const is制卡授权对话框可见 = ref(false)
const is图表分析抽屉可见 = ref(false)
const on图表分析抽屉关闭 = (is重新读取: boolean) => {

  is图表分析抽屉可见.value = false
  if (is重新读取) {
    on读取列表()
  }
}
const on单个删除 = async (id: number) => {
  console.log('on单个删除' + id)

  const res = await Del批量删除用户({"ID": [id]})
  console.log(res)
  if (res.code == 10000) {
ElMessage.success(res.msg)
    on读取列表()
  }
}
const on单个编辑 = async (id: number) => {
  on对话框详细信息打开(id)

}
const is批量维护增减余额输入框可见 = ref(false)
const on批量维护增减余额输入框可见将打开 = async () => {
  if (表格被选中列表.value.length == 0) {
    ElMessage.error("选中数据不能为0")
    return
  }
  is批量维护增减余额输入框可见.value = true
}

const on批量维护销售统计 = async () => {
  router.push("/代理管理/销售统计")
}



const on批量维护增减余额输入框被关闭 = async (is确定: boolean, 请求: any) => {

  is批量维护增减余额输入框可见.value = false
  if (!is确定) {
    return
  }

  if (请求.RMB == 0) {
    ElMessage.error("增减数值不能为0")
    return
  }

  请求.Id = 表格被选中列表.value.map((item => item.Id))
  is加载中.value = true
  const res = await Set批量维护增减余额(请求)
  is加载中.value = false
  console.log(res)
  if (res.code == 10000) {
ElMessage.success(res.msg)
    for (let i = 0; i < List.value.List.length; i++) {
      if (请求.Id.some(ele => ele === List.value.List[i].Id)) { //判断数组内是否存在该ID,如果存在则修改状态
        List.value.List[i].Rmb += 请求.RMB
      }
    }
    return true
  }
}
const on批量删除 = async () => {
  const ids = 表格被选中列表.value.map((item => item.Id))
  console.log(ids)
  const res = await Del批量删除用户({"ID": ids})
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
  console.info("on对话框详细信息打开")
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

const List = ref({
  "Count": 0,
  "List": [
    {
      "Id": 1,
      "User": "test3",
      "Status": 2,
      "Rmb": 81.69,
      "RealNameAttestation": "",
      "AgentDiscount": 0,
      "LoginAppid": "2",
      "LoginAppName": "代理平台",
      "LoginIp": "",
      "LoginTime": 0,
      "RegisterIp": "127.0.0.1",
      "RegisterTime": "1680790525",
      "UPAgentId": 0,
      "Sort": 0
    }]
})
const Store = useStore()
const 对象_搜索条件 = ref({Type: 2, Size: 10, Page: 1, Status: 0, Role: 0, Keywords: "", Order: 1})

const on读取列表 = () => {
  console.log("对象_搜索条件")
  console.log(对象_搜索条件.value)
  onGetUserList()
}
const onReset = () => {
  对象_搜索条件.value = {Type: 2, Size: 10, Page: 1, Status: 0, Role: 0, Keywords: "", Order: 1}
}
const on冻结状态被改变 = async (表项索引: number, ID: number, Status: number) => {
  // console.info("on冻结状态被改变索引:"+表项索引+",Id:"+ID,"Status:"+Status)
  // console.info(表项索引)
  //{Id: 16, User: 'test52', Status: 2, Rmb: 81.69, RegisterIp: '127.0.0.1', …}
  const res = await SetUserStatus({"Id": [ID], "Status": Status})

  console.log(res)
  if (res.code == 10000) {
ElMessage.success(res.msg)
    return true
  } else {
    List.value.List[表项索引].Status = Status == 1 ? 2 : 1
    return false
  }

}
const on格式化_时间 = (Time: number) => {
  if (Time === 0) {
    return ""
  }
  let time: number = 时间_取现行时间戳()
  time = time - Time //看剩余秒数
  if (time < 0) {
    time = parseInt((-time / 60).toString())//看剩余分钟数
    if (time > 60) {
      return 时间_时间戳到时间(Time)
    }
    return time + "分钟后\n" + 时间_时间戳到时间(Time)
  } else {
    time = parseInt((time / 60).toString())  //看剩余分钟数
    if (time > 60) {
      return 时间_时间戳到时间(Time)
    }
    return time + "分钟前"
  }
}
const on格式化_登录时间 = (row: any, column: any, Time: number) => {
  return on格式化_时间(row.LoginTime)
}
const on格式化_注册时间 = (row: any, column: any, Time: number) => {
  return on格式化_时间(row.RegisterTime)
}


const is加载中 = ref(false)
const onGetUserList = async () => {
  is加载中.value = true
  const res = await GetUserList(对象_搜索条件.value)
  console.log(res)
  is加载中.value = false
  List.value = res.data
  Store.commit("set搜索_默认选择应用AppId", 对象_搜索条件.value.AppId)

}
// table元素
import {useTableHeight} from "@/composables/useTableHeight";

const { tableRef, tableHeight, updateTableHeight } = useTableHeight(85)
const on表格列宽被改变 = (newWidth: any, oldWidth: any, columns: any, event: any) => {
  let 局_列宽数组: number[] = 表格读取列宽数组(tableRef.value)

  localStorage.setItem('列宽_代理账号', JSON.stringify(局_列宽数组));
}
const on表格列宽初始化 = () => {

  let 局_列宽数组文本 = localStorage.getItem('列宽_代理账号')
  if (局_列宽数组文本 != null) {
    let 局_列宽数组: number[] = JSON.parse(局_列宽数组文本)

    表格写入列宽数组(tableRef.value, 局_列宽数组)
  }
}


onMounted(() => {

  onReset()
  //如果 Store zize 不为0 且不为 null  才读取,不然就使用默认的
  if (Store.state.搜索_代理账号.Size != 0 && Store.state.搜索_代理账号.Size != null) {
    对象_搜索条件.value = Store.state.搜索_代理账号
    console.log("恢复搜索条件")
    console.log(Store.state.搜索_代理账号.Size)
    console.log(Store.state.搜索_代理账号)
  }

  onGetUserList()
  on表格列宽初始化()
})

onBeforeUnmount(() => {
  console.log("事件在卸载之前触发")
  Store.commit("set搜索_代理账号", 对象_搜索条件.value)
})



export interface UserInfo2 {
  Id: number;
  User: string;
  Status: number;
  Rmb: number;
  RealNameAttestation: string;
  Role: number;
  LoginAppid: string;
  LoginAppName: string;
  LoginIp: string;
  LoginTime: number;
  RegisterIp: string;
  RegisterTime: string;
  Sort: number;
}

const on置顶 = async (UserInfo2: UserInfo2) => {
  let 局_新sort = UserInfo2.Sort > 100 ? 0 : 时间_取现行时间戳();
  let 返回 = await SetAgentSort({ Id: UserInfo2.Id, Sort: 局_新sort });
  if (返回.code === 10000) {
    const currentIndex = List.value.List.findIndex(item => item.Id === UserInfo2.Id);
    if (currentIndex === -1) return;
    // 更新排序数值
    List.value.List[currentIndex].Sort = 局_新sort;
    // 分离非零排序项和零排序项
    const nonZeroSort = List.value.List.filter(item => Number(item.Sort) >1000 );
    const zeroSort = List.value.List.filter(item => Number(item.Sort) <1000);
    const newList = [
      ...nonZeroSort.sort((a, b) => Number(b.Sort) - Number(a.Sort)),
      ...zeroSort.sort((a, b) => Number(a.Id) - Number(b.Id))
    ];

    List.value.List.splice(0, List.value.List.length, ...newList);
  }
};
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
