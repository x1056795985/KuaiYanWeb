<template>
  <div class="最底层div">
    <div class="内容div" style="align-items: center ">
      <el-form :inline="true">
        <el-form-item label="选择应用" prop="" style="width:300px">
          <el-select v-model.number="对象_搜索条件.AppId" clear placeholder="请选择应用" filterable
                     @change="on读取列表">
            <el-option v-for="(item,index) in 数组AppId_Name" :key="item.Appid"
                       :label="item.AppName+'('+item.Appid.toString()+')'" :value="item.Appid"/>
          </el-select>
        </el-form-item>
        <el-form-item label="在线" style="width:130px">
          <el-select v-model="对象_搜索条件.IsLogin" clear placeholder="全部" @change="on读取列表">
            <el-option key="0" label="全部" :value="0"/>
            <el-option key="1" label="仅在线" :value="1"/>
            <el-option key="2" label="不在线" :value="2"/>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" style="width:120px">
          <el-select v-model="对象_搜索条件.Status" clear placeholder="全部" @change="on读取列表">
            <el-option key="0" label="全部" :value="0"/>
            <el-option key="1" label="正常" :value="1"/>
            <el-option key="2" label="冻结" :value="2"/>
          </el-select>
        </el-form-item>
        <el-form-item label="用户类型" prop="" v-if="is更多筛选">
          <el-select v-model.number="对象_搜索条件.UserClassId" clear placeholder="选择用户类型" Style="width: 120px">
            <el-option key="-1" label="全部" :value="-1"/>
            <el-option v-for="(item,index) in 对象_用户类型Arr" :key="item.Id"
                       :label="item.Name" :value="item.Id"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="isAppType计点()?'剩余点数':'vip时间'" prop="status" style="width:180px" v-if="is更多筛选" >
          <el-select v-model="对象_搜索条件.VipTimeStatus" clear placeholder="全部" >
            <el-option key="0" label="全部" :value="0"/>
            <el-option key="1" :label="isAppType计点()?'有点':'正常'" :value="1"/>
            <el-option key="2" :label="isAppType计点()?'无点':'到期'" :value="2"/>
            <el-option v-if="!isAppType计点()" key="3" label="1日内到期" :value="3"/>
            <el-option v-if="!isAppType计点()" key="4" label="3日内到期" :value="4"/>
            <el-option v-if="!isAppType计点()" key="5" label="7日内到期" :value="5"/>
            <el-option v-if="!isAppType计点()" key="6" label="30日内到期" :value="6"/>
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
              <el-select v-model="对象_搜索条件.Type" placeholder="用户名Id" style="width: 150px;">
                <!--                <el-option label="Id" :value="1"/>-->
                <el-option :label="isAppType卡号2?'卡号Id':'用户名Id'" :value="2"/>
                <el-option :label="isAppType卡号2?'卡号':'用户名'" :value="3"/>
                <el-option label="绑定信息" :value="4"/>
                <el-option label="软件用户备注" :value="5"/>
                <el-option label="归属代理" :value="6"/>
                <el-option label="归属代理含子代理" :value="7"/>
                <el-option label="归属代理id" :value="8"/>
              </el-select>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item style="padding-left: 5px">
          <el-button type="primary" icon="search" @click="on读取列表">查询</el-button>
          <el-button icon="refresh" @click="onReset">重置</el-button>
          <el-tooltip
              class="box-item"
              effect="light"
              content="更多筛选"
              placement="top"
          >
            <el-button icon="Plus" v-show="is更多筛选===false" @click="is更多筛选=true"></el-button>
          </el-tooltip>
        </el-form-item>
      </el-form>
    </div>
    <div class="内容div">
      <div class="gva-btn-list" style="background:#FAFAFAFF">
        <el-button icon="Plus" type="primary" style="margin: 8px 8px 8px; width: 65px" @click="on对话框详细信息打开(0)">
          新增
        </el-button>

        <el-popconfirm title="确定删除勾选软件用户,会同时删除用户云配置信息?" width="200" @confirm="on批量删除"
                       confirm-button-text="确定"
                       cancel-button-text="取消">
          <template #reference>
            <el-button icon="warning" type="danger" style="margin: 8px 8px 8px;; width: 65px"
                       :disabled=is批量删除禁用>删除
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
            <li class="工具_更多_li"
                @click="表格导出csv文本并下载(tableRef, '软件用户列表' + Date().toLocaleString(),['','',isAppType卡号2?'Name':'User','Status'])">
              导出到csv
            </li>
            <li class="工具_更多_li"
                @click="is批量导入软件用户信息将打开可见 = true">
              批量导入用户
            </li>
            <li class="工具_更多_li" @click="on批量冻结解冻(1)">批量解冻</li>
            <li class="工具_更多_li" @click="is批量修改用户类型=true">批量改用户类型</li>
            <li class="工具_更多_li" @click="on批量维护积分输入框将打开">批量增减积分</li>
            <li class="工具_更多_li" @click="on维护用户云配置输入框将打开">批量置用户配置</li>
            <li class="工具_更多_li" @click="on批量维护输入框将打开">
              批量增减{{ (Data.AppType === 2 || Data.AppType === 4) ? "点数" : "时间" }}
            </li>
            <li class="工具_更多_li" @click="on批量维护删除(1)">
              删除{{ (Data.AppType === 2 || Data.AppType === 4) ? "0点数" : "vip到期" }}
            </li>
            <li class="工具_更多_li" @click="on批量维护删除(2)" v-if="isAppType卡号2">
              删除{{ (Data.AppType === 2 || Data.AppType === 4) ? "0点数" : "vip到期" }}且删卡号
            </li>
            <li class="工具_更多_li" @click="is批量修改全部用户时间点数=true">
              批量维护修改全部软件用户
            </li>
            <li class="工具_更多_li" @click="on批量维护删除(3)" v-if="isAppType卡号2">
              删除已删卡号软件用户
            </li>
            <li class="工具_更多_li" @click="on批量维护清空绑定信息()">
              批量清空绑定信息
            </li>
          </el-popover>
          <el-tooltip content="分析"
                      effect="dark"
                      placement="top">
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

      <el-table v-loading="is加载中" :data="Data.List" border style="width: 100% ;white-space: pre-wrap;"
                ref="tableRef"
                @header-dragend="on表格列宽被改变"
                :max-height="tableHeight"
                @selection-change="on选择框被选择"
                @sort-change="on排序被改变"
                :header-cell-style="{background:'#FAFAFAFF',color:'#606266'}">
        <el-table-column type="selection" width="45"/>
        <el-table-column prop="Uid" label="Uid" width="80" sortable="custom"/>
        <!--        <el-table-column prop="Uid" label="用户id" width="100"/>-->
        <el-table-column :label="isAppType卡号2?'卡号':'用户名'" :width="isAppType卡号2?280:180"
                         show-overflow-tooltip="">
          <template #default="scope">
            <el-icon class="复制按钮"
                     @click="置剪辑版文本( isAppType卡号2?scope.row.Name:scope.row.User,'已复制到剪辑版')">
              <DocumentCopy/>
            </el-icon>
            {{
              isAppType卡号2 ? scope.row.Name === '' ? '已删卡号ID' + scope.row.Uid : scope.row.Name : scope.row.User
            }}
            <el-tag v-if="scope.row.LinksCount>0">
              在线 {{ scope.row.LinksCount > 1 ? scope.row.LinksCount : "" }}
            </el-tag>


          </template>

        </el-table-column>

        <el-table-column align="left" label="本软件状态" prop="status" width="110">
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


        <el-table-column prop="Key" label="绑定信息" width="300" show-overflow-tooltip=""/>

        <el-table-column align="left" sortable="custom" :label="isAppType计点()?'剩余点数':'vip到期时间'" prop="VipTime"
                         width="160">
          <template #default="scope">
            <el-tag v-if="isAppType计点()" :type="scope.row.VipTime===0?'warning':'primary'">
              {{ scope.row.VipTime }}
            </el-tag>

            <el-tag v-else :type="on时间_是否过期(scope.row.VipTime)?'warning':'primary'">
              {{ on格式化_时间(scope.row.VipTime) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="VipNumber" label="积分" width="200"/>
        <el-table-column prop="Note" label="软件用户备注" show-overflow-tooltip="">
          <template #default="scope">
            <el-button link type="primary" size="default"
                       @click="on软件用户备注被改变(scope.$index,scope.row.Id,scope.row.Note)" style="color:#79bbff">
              <el-icon color="#79bbff" size="18" class="管理员备注编辑">
                <Edit/>
              </el-icon>
            </el-button>
            {{ scope.row.Note }}
          </template>
        </el-table-column>




        <el-table-column prop="UserClassId" label="用户类型" width="140">
          <template #default="scope">
            <el-tag
                :type="scope.row.UserClassId!==0?对象_用户类型.hasOwnProperty(scope.row.UserClassId.toString())?'primary':'danger':'warning'">
              <!--              {{ scope.row.UserClassId === 0 ? '未分类' : 对象_用户类型[scope.row.UserClassId.toString()] }}-->
              {{
                !对象_用户类型.hasOwnProperty(scope.row.UserClassId.toString()) ? '已删待改' : 对象_用户类型[scope.row.UserClassId.toString()]
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="MaxOnline" label="最大在线数量" width="110"/>
        <el-table-column prop="AgentName" label="归属代理" width="110">
          <template #default="scope">
            {{ scope.row.AgentName }}
            <el-tag v-if="scope.row.AgentUid" type="info">
              {{ scope.row.AgentUid }}
            </el-tag>


          </template>
        </el-table-column>
        <el-table-column :fixed="is移动端()?false:'right'" label="操作" width="80">
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
              :page-sizes="[10,20,30,50,100,1000,10000]"
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
  <AppUserinfo v-if="is对话框可见" :id="is对话框id" :AppId="对象_搜索条件.AppId"
               :AppName="MapAppId_Name[对象_搜索条件.AppId.toString()]" :AppType="Data.AppType"
               @on对话框详细信息关闭="on对话框详细信息关闭" :UserType="对象_用户类型"></AppUserinfo>
  <ChartData v-if="is图表分析抽屉可见" @on图表分析抽屉关闭="is图表分析抽屉可见 = false" :AppId="对象_搜索条件.AppId"/>

  <BatchElMessage :is批量维护输入框可见="is批量维护输入框可见" 标题="批量修改勾选用户,负数可能减到0以下"
                  :提示信息='isAppType计点()?"请输入增减点数(点)":"请输入增减时间(秒)"'
                  :AppType="Data.AppType"
                  @on批量维护输入框被关闭="on批量维护输入框被关闭"></BatchElMessage>


  <BatchElMessage2 v-if="is批量维护积分输入框可见"
                   :AppInfo="{AppType:Data.AppType,AppId:对象_搜索条件.AppId, ids:局_ids}"
                   :UserClassId="对象_用户类型Arr"
                   @on批量维护输入框被关闭="on批量维护积分输入框被关闭"></BatchElMessage2>
  <BatchElMessage3 v-if="is维护用户云配置输入框可见"
                   :AppInfo="{AppType:Data.AppType,AppId:对象_搜索条件.AppId}"
                   :Uids="局_uids"
                   @on批量维护输入框被关闭="on维护用户云配置输入框被关闭"></BatchElMessage3>

  <BatchSetAllUserVipTime v-if="is批量修改全部用户时间点数"
                          :AppInfo="{AppType:Data.AppType,AppId:对象_搜索条件.AppId, AppName:MapAppId_Name[对象_搜索条件.AppId.toString()]}"
                          :UserClassId="对象_用户类型Arr"
                          @on批量维护输入框被关闭="on对话框修改全部用户时间点数关闭"></BatchSetAllUserVipTime>


  <BatchElMessage4 v-if="is批量导入软件用户信息将打开可见"
                   :AppInfo="{AppType:Data.AppType,AppId:对象_搜索条件.AppId}"
                   @on批量维护输入框被关闭="on批量导入软件用户信息被关闭"></BatchElMessage4>
  <el-dialog v-model="is批量修改用户类型" title="Shipping address">
    <el-form>
      <el-form-item>
        <el-button v-for="(item,index) in 对象_用户类型Arr" :key="item.Id" type="primary"
                   style="margin: 8px 8px 8px; width: 65px" @click="on批量维护修改用户类型(item.Id)">
          {{ item.Name }}
        </el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script lang="ts" setup>
import {computed, onBeforeUnmount, onMounted, ref} from "vue";
import {
  GetAppUserList,
  Del批量删除AppUser,
  SetStatus,
  Set批量维护增减时间点数,
  Del批量维护_删除, Set批量维护修改用户类型, Set批量维护增减积分, Del批量维护_设置用户绑定信息, Set批量维护修改用户备注
} from "@/api/软件用户api.js";
import {GetAppIdNameList} from "@/api/应用列表api.js";
import {
  时间_时间戳到时间,
  时间_取现行时间戳,
  is移动端,
  表格读取列宽数组,
  表格写入列宽数组, 置剪辑版文本, 表格导出csv文本并下载
} from "@/utils/utils";
import {useStore} from "vuex";
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import {ElMessage, ElMessageBox} from 'element-plus'
import {Delete} from "@element-plus/icons-vue";
import AppUserinfo from "./组件/软件用户详细信息.vue";
import BatchElMessage from "./组件/批量维护点数时间增减输入框.vue";
import BatchElMessage2 from "./组件/批量维护积分.vue";
import BatchElMessage3 from "./组件/批量维护用户云配置.vue";
import BatchElMessage4 from "./组件/批量导入账号.vue";
import BatchSetAllUserVipTime from "./组件/批量维护全部用户时间点数.vue";
import ChartData from "@/view/应用管理/组件/软件用户图表抽屉.vue";


const is图表分析抽屉可见 = ref(false)
const is更多筛选 = ref(false)


const on图表分析被点击 = () => {
  Store.commit("set搜索_软件用户", 对象_搜索条件.value)
  is图表分析抽屉可见.value = true
}

//批量维护时间点数输入框=============================================================
const is批量维护输入框可见 = ref(false)
const on批量维护输入框将打开 = async () => {
  if (表格被选中列表.value.length == 0) {
    ElMessage.error("选中数据不能为0")
    return
  }
  is批量维护输入框可见.value = true
}

const on批量维护输入框被关闭 = async (is确定: boolean, 增减值: number, 备注: string) => {
  console.log("on批量维护输入框被关闭")
  is批量维护输入框可见.value = false
  if (!is确定) {
    return
  }

  if (增减值 == 0) {
    ElMessage.error("增减数值不能为0")
    return
  }

  let ids = 表格被选中列表.value.map((item => item.Id))
  const res = await Set批量维护增减时间点数({
    "AppId": 对象_搜索条件.value.AppId,
    "Id": ids,
    "Status": 增减值,
    "Note": 备注
  })
  console.log(res)
  if (res.code == 10000) {
    ElMessage.success(res.msg)
    for (let i = 0; i < Data.value.List.length; i++) {
      if (ids.some(ele => ele === Data.value.List[i].Id)) { //判断数组内是否存在该ID,如果存在则修改状态
        Data.value.List[i].VipTime += 增减值
      }
    }
    return true
  }
}
//===============================================================

const on单个删除 = async (id: number) => {
  console.log('on单个删除' + id)

  const res = await Del批量删除AppUser({"ID": [id]})
  console.log(res)
  if (res.code == 10000) {
    ElMessage.success(res.msg)
    on读取列表()
  }
}
const isAppType计点 = () => {
  return Data.value.AppType === 2 || Data.value.AppType === 4
}
const isAppType计点2 = computed(() => {
  if (Data.value.AppType === 2 || Data.value.AppType === 4) {
    return true
  }
  return false
})


const isAppType卡号 = () => {
  return Data.value.AppType === 3 || Data.value.AppType === 4
}
const isAppType卡号2 = computed(() => {
  if (Data.value.AppType === 3 || Data.value.AppType === 4) {
    return true
  }
  return false
})

const on单个编辑 = async (id: number) => {
  on对话框详细信息打开(id)

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
    Data.value.List[表项索引].Status = Status == 1 ? 2 : 1
    return false
  }

}


//
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

    for (let i = 0; i < Data.value.List.length; i++) {
      if (ids.some(ele => ele === Data.value.List[i].Id)) { //判断数组内是否存在该ID,如果存在则修改状态
        Data.value.List[i].Status = Status
      }
    }
    return true
  }

}
const on批量维护清空绑定信息 = async () => {
  const ids = 表格被选中列表.value.map((item => item.Id))
  if (ids.length == 0) {
    ElMessage.error("选中数据不能为0")
    return
  }
  ElMessageBox.confirm(
      '确定要清除已勾选用户绑定信息吗?',
      '',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(async () => {
    let 返回 = await Del批量维护_设置用户绑定信息({AppId: 对象_搜索条件.value.AppId, "Id": ids, Key: ""})
    if (返回.code == 10000) {
      ElMessage.success(返回.msg)
      on读取列表()
    }

  }).catch()
}

const on批量维护删除 = async (Type: number) => {
  let app类型 = "vip到期"
  if (Data.value.AppType === 2 || Data.value.AppType === 4) {
    app类型 = "0点数"
  }
  var 提示信息 = {
    1: "删除全部" + app类型 + "软件用户信息",
    2: "删除全部" + app类型 + "软件用户信息且删卡号",
    3: "删除全部卡号已删除软件用户"
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
const on批量删除 = async () => {
  const ids = 表格被选中列表.value.map((item => item.Id))
  console.log(ids)
  const res = await Del批量删除AppUser({"AppId": 对象_搜索条件.value.AppId, "ID": ids})
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
const on排序被改变 = (column: any) => {
  //{column: Proxy(Object), prop: 'VipTime', order: 'ascending'}
  console.log(column)
  对象_搜索条件.value.Sortable = column.prop === "VipTime" ? 1 : 0
  switch (column.order) {
    case "ascending":
      对象_搜索条件.value.Order = 1;
      break;
    case "descending":
      对象_搜索条件.value.Order = 0;
      break;
    default :
      对象_搜索条件.value.Sortable = 0
      对象_搜索条件.value.Order = 0;
      break;
  }


  on读取列表()
  console.log(对象_搜索条件.value)
}

const Data = ref({
  "Count": 0,
  "AppType": 1,
  "List": [
    {
      "Id": 1,
      "Uid": 1,
      "Status": 1,
      "Key": "绑定的key",
      "VipTime": 12346579,
      "VipNumber": 999,
      "Note": "用户备注",
      "MaxOnline": 1,
      "UserClassId": 0,
      "LinksCount": 0
    }]
})


const Store = useStore()
const 对象_搜索条件 = ref({
  AppId: 10000,
  Type: 3,
  Size: 10,
  Page: 1,
  Status: 0,
  Role: 0,
  Keywords: "",
  Order: 0,
  Sortable: 0,
  IsLogin: 0,
  VipTimeStatus: 0,
  UserClassId: -1
})

const on读取列表 = () => {
  Data.value.List = []
  console.log("对象_搜索条件")
  console.log(对象_搜索条件.value)
  onGetAppUserList()
}
const onReset = () => {
  let Appidc = 对象_搜索条件.value.AppId
  console.log("重置搜索条件,保留appid:" + Appidc)
  对象_搜索条件.value = {
    AppId: Appidc,
    Type: 3,
    Size: 10,
    Page: 1,
    Status: 0,
    Role: 0,
    Keywords: "",
    Order: 0,
    Sortable: 0,
    IsLogin: 0,
    VipTimeStatus: 0,
    UserClassId: -1
  }
  onGetAppIdNameList()
}
const on时间_是否过期 = (time: Number) => {
  return 时间_取现行时间戳() > time
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


const is加载中 = ref(false)
const 对象_用户类型 = ref({"0": "未分类"})
const 对象_用户类型Arr = ref([])
const onGetAppUserList = async () => {
  if (对象_搜索条件.value.AppId === 10000) {
    ElMessage.info("请选选择应用")
    return   // 默认值 不搜索
  }

  is加载中.value = true
  const res = await GetAppUserList(对象_搜索条件.value)
  console.log(res)
  is加载中.value = false
  Data.value = res.data
  对象_用户类型.value = res.data.UserClass
  //对象_用户类型.value["0"] = "未分类"
  对象_用户类型.value = {...对象_用户类型.value, 0: '未分类'};
  对象_用户类型Arr.value = []

  for (let 索引 in 对象_用户类型.value) {
    let a = {Id: Number(索引), Name: 对象_用户类型.value[索引]}
    对象_用户类型Arr.value.push(a)

  }
  console.log(对象_用户类型Arr.value)
  Store.commit("set搜索_默认选择应用AppId", 对象_搜索条件.value.AppId)

}

const MapAppId_Name = ref({})
const 数组AppId_Name = ref([{
  "Appid": 10004,
  "AppName": ""
}])

const onGetAppIdNameList = async () => {
  const res = await GetAppIdNameList()
  数组AppId_Name.value = res.data.Array
  MapAppId_Name.value = res.data.Map

  console.log("没有搜索条件的应用,修改第一个,现在搜索条件的值为:" + res.data.Map[对象_搜索条件.value.AppId.toString()])

  if (res.data.Map[对象_搜索条件.value.AppId.toString()] == null || 对象_搜索条件.value.AppId <= 10000) {
    let 局_默认appid = Store.state.搜索_默认选择应用AppId
    对象_搜索条件.value.AppId = 数组AppId_Name.value.some(item => item.Appid === 局_默认appid) ? 局_默认appid : 数组AppId_Name.value[0].Appid
  }

}
// table元素
import {useTableHeight} from "@/composables/useTableHeight";
import {SetPayOrderNote} from "@/api/支付充值订单api";

const {tableRef, tableHeight, updateTableHeight} = useTableHeight(85)
const on表格列宽被改变 = (newWidth: any, oldWidth: any, columns: any, event: any) => {
  let 局_列宽数组: number[] = 表格读取列宽数组(tableRef.value)

  localStorage.setItem('列宽_软件用户', JSON.stringify(局_列宽数组));
}
const on表格列宽初始化 = () => {

  let 局_列宽数组文本 = localStorage.getItem('列宽_软件用户')
  if (局_列宽数组文本 != null) {
    let 局_列宽数组: number[] = JSON.parse(局_列宽数组文本)

    表格写入列宽数组(tableRef.value, 局_列宽数组)
  }
}

onMounted(async () => {

  onReset()
  //如果 Store zize 不为0 且不为 null  才读取,不然就使用默认的
  if (Store.state.搜索_软件用户.Size != 0 && Store.state.搜索_软件用户.Size != null) {
    对象_搜索条件.value = Store.state.搜索_软件用户
    console.log("恢复搜索条件")
    console.log(Store.state.搜索_软件用户.Size)
    console.log(Store.state.搜索_软件用户)
  }

  await onGetAppIdNameList()
  await onGetAppUserList()
  on表格列宽初始化()
})

onBeforeUnmount(() => {
  console.log("事件在卸载之前触发")
  Store.commit("set搜索_软件用户", 对象_搜索条件.value)
})


//==========批量修改全部用户
const is批量修改全部用户时间点数 = ref(false)
const on对话框修改全部用户时间点数关闭 = (is重新读取: boolean) => {
  is批量修改全部用户时间点数.value = false
  if (is重新读取) {
    on读取列表()
  }
}
//===========
const is批量修改用户类型 = ref(false)

const on批量维护修改用户类型 = async (新类型: number) => {
  is批量修改用户类型.value = false

  let ids = 表格被选中列表.value.map((item => item.Id))
  const res = await Set批量维护修改用户类型({
    "AppId": 对象_搜索条件.value.AppId,
    "Id": ids,
    "UserClassId": 新类型
  })
  console.log(res)
  if (res.code == 10000) {
    ElMessage.success(res.msg)
    for (let i = 0; i < Data.value.List.length; i++) {
      if (ids.some(ele => ele === Data.value.List[i].Id)) { //判断数组内是否存在该ID,如果存在则修改状态
        Data.value.List[i].UserClassId = 新类型
      }
    }
    return true
  }
}
//批量维护用户积分输入框=============================================================
const is批量维护积分输入框可见 = ref(false)
const 局_ids = ref<any>([])
const on批量维护积分输入框将打开 = async () => {
  if (表格被选中列表.value.length == 0) {
    ElMessage.error("选中数据不能为0")
    return
  }
  局_ids.value = 表格被选中列表.value.map((item => item.Id))
  is批量维护积分输入框可见.value = true
}

const on批量维护积分输入框被关闭 = (is重新读取: boolean) => {
  is批量维护积分输入框可见.value = false
  if (is重新读取) {
    on读取列表()
  }
}



//批量导入软件用户信息将打开=============================================================
const is批量导入软件用户信息将打开可见 = ref(false)
const on批量导入软件用户信息被关闭 = (is重新读取: boolean) => {
  is批量导入软件用户信息将打开可见.value = false
  if (is重新读取) {
    on读取列表()
  }
}
//批量维护用户云配置输入框=============================================================
const is维护用户云配置输入框可见 = ref(false)
const 局_uids = ref<any>([])
const on维护用户云配置输入框将打开 = async () => {
  if (表格被选中列表.value.length == 0) {
    ElMessage.error("选中数据不能为0")
    return
  }
  局_uids.value = 表格被选中列表.value.map((item => item.Uid))
  is维护用户云配置输入框可见.value = true
}
const on维护用户云配置输入框被关闭 = (is重新读取: boolean) => {
  is维护用户云配置输入框可见.value = false
  if (is重新读取) {
    on读取列表()
  }
}
//===============================================================

const on软件用户备注被改变 = async (表项索引: number, AppUserId: number, Note: string) => {

  let 新备注 = Note
  await ElMessageBox.prompt('请输入新软件用户备注', '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValue: Note
  })
      .then(async ({value}) => {
        新备注 = value

        const res = await Set批量维护修改用户备注({
          "AppId": 对象_搜索条件.value.AppId,
          "Id": [AppUserId],
          "Note": 新备注
        })
        console.log(res)
        if (res.code == 10000) {
          Data.value.List[表项索引].Note = 新备注   //成功赋新值

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
  width: auto;
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
