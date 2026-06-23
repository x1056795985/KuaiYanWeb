<template>
  <div class="最底层div">
    <div class="内容div" style="align-items: center ">
      <el-form :inline="true">
        <el-form-item>
          <el-input class="搜索框"
                    v-model.trim="对象_搜索条件.Keywords"
                    placeholder="搜索内容"
                    style="top:0 ; width: auto;padding: 0;margin: 0"
                    clearable
          >
            <template #prepend>
              <el-select v-model="对象_搜索条件.Type" placeholder="用户名" style="width: 130px;">
                <el-option label="Id" :value="1"/>
                <el-option label="任务类型名称" :value="2"/>
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

        <el-popconfirm title="确定删除勾选任务类型?" width="200" @confirm="on批量删除" confirm-button-text="确定"
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
              <el-icon>
                <More/>
              </el-icon>
            </template>
            <li class="工具_更多_li" @click="on添加uuid到队列">添加uuid到队列</li>
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

      <el-table v-loading="is加载中" :data="List.list" border style="width: 100% ;white-space: pre-wrap;"
                ref="tableRef"
                @header-dragend="on表格列宽被改变"
                :max-height="tableHeight"
                @selection-change="on选择框被选择"
                :header-cell-style="{background:'#FAFAFAFF',color:'#606266'}">
        <el-table-column type="selection" width="45"/>
        <el-table-column prop="Id" label="Id" width="80"/>
        <el-table-column prop="Name" label="任务类型名称" width="230"/>
        <el-table-column label="状态" prop="status">
          <template #default="scope">
            <el-switch
                :active-value="1"
                :inactive-value="2"
                v-model="scope.row.Status"
                inline-prompt
                style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                active-text="正常"
                inactive-text="维护"
                @change="on状态被改变(scope.$index,scope.row.Id,scope.row.Status)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="Name" label="队列剩余" width="130">
          <template #default="scope">
            <el-tag>
              {{ scope.row.queueCount }}
            </el-tag>
            <el-icon v-if="scope.row.queueCount>0" class="复制按钮" @click="on清空队列(scope.$index,scope.row)">
              <Delete/>
            </el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="taskCount" label="30天任务总计" width="130"/>

        <el-table-column prop="HookSubmitDataStart" label="Hook函数创建入库前" width="230"/>
        <el-table-column prop="HookSubmitDataEnd" label="Hook函数创建入库后" width="230"/>
        <el-table-column prop="HookReturnDataStart" label="Hook函数执行入库前" width="230"/>
        <el-table-column prop="HookReturnDataEnd" label="Hook函数执行入库后" width="230"/>


        <el-table-column :fixed="is移动端()?false:'right'" label="操作" width="210">
          <template #default="scope">
            <el-button link type="primary" size="default" @click="on单个编辑(scope.row.Id)" style="color:#79bbff">
              <el-icon color="#79bbff" class="no-inherit">
                <Edit/>
              </el-icon>
              编辑
            </el-button>
            <el-button link type="primary" size="default" @click="on查看任务(scope.row)" style="color:#79bbff">
              <el-icon color="#79bbff" class="no-inherit">
                <ZoomIn/>
              </el-icon>
              查看任务
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
              :total="parseInt( List.count)"
              @current-change="on读取列表"
          />
        </el-config-provider>
      </div>
    </div>
  </div>
  <Userinfo :is对话框可见="is对话框可见" :id="is对话框id" @on对话框详细信息关闭="on对话框详细信息关闭"></Userinfo>
</template>

<script lang="ts" setup>
import {onBeforeUnmount, onMounted, ref} from "vue";
import {
  Del批量删除TaskPool,
  GetTaskPoolList,
  设置任务池任务类型状态,
  清空队列Tid,
  添加uuid到队列, SetTaskPoolTypeSort
} from "@/api/任务池api.js";
import {时间_时间戳到时间, 时间_取现行时间戳, is移动端, 表格读取列宽数组, 表格写入列宽数组} from "@/utils/utils";
import {useStore} from "vuex";
// 引入中文包
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import {ElMessage, ElMessageBox} from 'element-plus'
import {Delete} from "@element-plus/icons-vue";
import Userinfo from "@/view/二开扩展/组件/任务类型详细信息.vue";
import {SetUserStatus} from "@/api/用户信息api";
import service from "@/api/request";
import {SaveInfoSMS} from "@/api/系统设置api";
import router from "@/router";
import {useTableHeight} from "@/composables/useTableHeight";
import {SetAppSort} from "@/api/应用列表api";
const { tableRef, tableHeight, updateTableHeight } = useTableHeight(85)
const on单个删除 = async (id: number) => {
  console.log('on单个删除' + id)

  const res = await Del批量删除TaskPool({"ID": [id]})
  console.log(res)
  if (res.code == 10000) {
    ElMessage.success(res.msg)
    on读取列表()
  }
}
const on单个编辑 = async (id: number) => {
  on对话框详细信息打开(id)

}
const on查看任务 = async (data: any) => {
  Store.commit("set搜索_任务池数据", {Type: 1, Size: 10, Page: 1, Keywords: "",Order:2,Tid:data.Id,TidName:data.Name})
  router.push("/二开扩展/任务池数据")

}

const on清空队列 = async (索引: number, row: any) => {
  ElMessageBox.confirm(
      '确认清空>' + row.Name + '<剩余队列吗?,被清空的uuid会直接修改任务状态失败',
      'Warning',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  )
      .then(async () => {

        let 返回;
        is加载中.value = true
        返回 = await 清空队列Tid({Id: [row.Id]});
        is加载中.value = false
        List.value.list[索引].QueueCount = 0
        console.log(返回)
        if (返回.code == 10000) {
          ElMessage.success(返回.msg)
        }

      })
      .catch(() => {
      })

}

const on添加uuid到队列 = async () => {
  ElMessageBox.prompt('请输入uuid', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  })
      .then(async ({value}) => {
        let 返回;
        is加载中.value = true
        返回 = await 添加uuid到队列({uuid: value});
        is加载中.value = false
        List.value.list[索引].QueueCount = 0
        console.log(返回)
        if (返回.code == 10000) {
          ElMessage.success(返回.msg)
        }

      })
      .catch(() => {
      })

}

const on批量删除 = async () => {
  const ids = 表格被选中列表.value.map((item => item.Id))
  console.log(ids)
  const res = await Del批量删除TaskPool({"id": ids})
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
type TaskPool = {
  "Id": number,
  "Name": string,
  "Status": number,
  "QueueCount": number,
  "TaskCount": number,
  "HookSubmitDataStart": string,
  "HookSubmitDataEnd": string,
  "HookReturnDataStart": string,
  "HookReturnDataEnd": string,
  "Sort": number,
}


const List = ref({
  "count": 0,
  "list": [
    {
      "Id": 1,
      "Name": "test3",
      "Status": 1,
      "QueueCount": 0,
      "TaskCount": 0,
      "HookSubmitDataStart": "",
      "HookSubmitDataEnd": "",
      "HookReturnDataStart": "",
      "HookReturnDataEnd": "",
      "Sort": "",
    }]
})

const Store = useStore()
const 对象_搜索条件 = ref({Type: 2, Size: 10, Page: 1, Keywords: ""})

const on读取列表 = () => {
  console.log("对象_搜索条件")
  console.log(对象_搜索条件.value)
  onGetList()
}
const onReset = () => {
  对象_搜索条件.value = {Type: 2, Size: 10, Page: 1, Keywords: ""}
}


const is加载中 = ref(false)
const onGetList = async () => {
  is加载中.value = true
  const res = await GetTaskPoolList(对象_搜索条件.value)
  console.log(res)
  is加载中.value = false
  List.value = res.data
  Store.commit("set搜索_默认选择应用AppId", 对象_搜索条件.value.AppId)
}

const on表格列宽被改变 = (newWidth: any, oldWidth: any, columns: any, event: any) => {
  let 局_列宽数组: number[] = 表格读取列宽数组(tableRef.value)
  localStorage.setItem('列宽_任务池', JSON.stringify(局_列宽数组));
}
const on表格列宽初始化 = () => {

  let 局_列宽数组文本 = localStorage.getItem('列宽_任务池')
  if (局_列宽数组文本 != null) {
    let 局_列宽数组: number[] = JSON.parse(局_列宽数组文本)
    表格写入列宽数组(tableRef.value, 局_列宽数组)
  }
}


onMounted(() => {

  onReset()
  //如果 Store zize 不为0 且不为 null  才读取,不然就使用默认的
  if (Store.state.搜索_任务池.Size != 0 && Store.state.搜索_任务池.Size != null) {
    对象_搜索条件.value = Store.state.搜索_任务池
    console.log("恢复搜索条件")
    console.log(Store.state.搜索_任务池.Size)
    console.log(Store.state.搜索_任务池)
  }

  onGetList()
  on表格列宽初始化()
})
const on状态被改变 = async (表项索引: number, ID: number, Status: number) => {
  // console.info("on状态被改变索引:"+表项索引+",Id:"+ID,"Status:"+Status)
  // console.info(表项索引)
  //{Id: 16, User: 'test52', Status: 2, Rmb: 81.69, RegisterIp: '127.0.0.1', …}
  const res = await 设置任务池任务类型状态({"Id": [ID], "Status": Status})

  console.log(res)
  if (res.code == 10000) {
    ElMessage.success(res.msg)
    return true
  } else {
    List.value.list[表项索引].Status = Status == 1 ? 2 : 1
    return false
  }

}
onBeforeUnmount(() => {
  console.log("事件在卸载之前触发")
  Store.commit("set搜索_任务池", 对象_搜索条件.value)
})
const on置顶 = async (TaskPool: TaskPool) => {
  let 局_新sort = TaskPool.Sort > 100 ? 0 : 时间_取现行时间戳();
  let 返回 = await SetTaskPoolTypeSort({ Id: TaskPool.Id, Sort: 局_新sort });
  if (返回.code === 10000) {
    const currentIndex = List.value.list.findIndex(item => item.Id === TaskPool.Id);
    if (currentIndex === -1) return;
    // 更新排序数值
    List.value.list[currentIndex].Sort = 局_新sort;
    // 分离非零排序项和零排序项
    const nonZeroSort = List.value.list.filter(item => Number(item.Sort) >1000 );
    const zeroSort = List.value.list.filter(item => Number(item.Sort) <1000);
    const newList = [
      ...nonZeroSort.sort((a, b) => Number(b.Sort) - Number(a.Sort)),
      ...zeroSort.sort((a, b) => Number(a.Id) - Number(b.Id))
    ];

    List.value.list.splice(0, List.value.list.length, ...newList);
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
