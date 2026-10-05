<template>
  <div class="最底层div">
    <div class="内容div" style="align-items: center">
      <el-form :inline="true">
        <el-form-item>
          <el-input class="搜索框" v-model.trim="对象_搜索条件.Keywords"
                    placeholder="搜索内容" clearable @keyup.enter="on读取列表">
            <template #prepend>
              <el-select v-model="对象_搜索条件.Type" placeholder="名称" style="width: 100px;">
                <el-option label="名称" :value="1"/>
                <el-option label="Url" :value="2"/>
                <el-option label="备注" :value="3"/>
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
        <el-button icon="Plus" type="primary" style="margin: 8px 8px 8px; width: 65px"
                   @click="on对话框详细信息打开('')">新增
        </el-button>
        <el-popconfirm title="确定删除勾选的网关?" width="200" @confirm="on批量删除"
                       confirm-button-text="确定" cancel-button-text="取消">
          <template #reference>
            <el-button icon="warning" type="danger" :disabled="is批量删除禁用">删除</el-button>
          </template>
        </el-popconfirm>
        <div class="工具栏">
          <span class="选中统计">已选 {{ 表格被选中列表.length }} / 总 {{ Data.count }}</span>
          <el-tooltip content="刷新" effect="dark" placement="top">
            <el-icon @click="on读取列表">
              <RefreshRight/>
            </el-icon>
          </el-tooltip>
        </div>
      </div>

      <el-table v-loading="is加载中" :data="Data.list" border
                ref="tableRef" @header-dragend="on表格列宽被改变"
                :max-height="tableHeight"
                @selection-change="on选择框被选择"
                :header-cell-style="{background:'#FAFAFAFF',color:'#606266'}">
        <el-table-column type="selection" width="45"/>
        <el-table-column prop="Id" label="网关Id" width="80"/>
        <el-table-column prop="Name" label="网关名称" width="160" show-overflow-tooltip/>
        <el-table-column prop="Url" label="业务Url" min-width="240" show-overflow-tooltip/>
        <el-table-column prop="Status" label="状态" width="90">
          <template #default="scope">
            <el-tag :type="scope.row.Status === 1 ? 'success' : 'danger'">
              {{ scope.row.Status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="TimeoutSec" label="超时(秒)" width="90"/>
        <el-table-column prop="Secret" label="Secret" width="260" show-overflow-tooltip/>
        <el-table-column prop="Remark" label="备注" min-width="140" show-overflow-tooltip/>
        <el-table-column :fixed="is移动端()?false:'right'" label="操作" :width="is移动端()?260:330">
          <template #default="scope">
            <el-button link type="primary" size="default" @click="on单个编辑(scope.row.Id)"
                       style="color:#79bbff">
              <el-icon color="#79bbff" class="no-inherit">
                <Edit/>
              </el-icon>
              编辑
            </el-button>
            <el-button link type="primary" size="default" @click="on单个测试(scope.row.Id)"
                       style="color:#67c23a">
              <el-icon color="#67c23a" class="no-inherit">
                <Connection/>
              </el-icon>
              连通测试
            </el-button>
            <el-popconfirm title="确定删除该网关?" width="200" @confirm="on单个删除(scope.row.Id)"
                           confirm-button-text="确定" cancel-button-text="取消">
              <template #reference>
                <el-button link type="primary" size="default" style="color:#f56d6d">
                  <el-icon color="#f56d6d" class="no-inherit">
                    <Delete/>
                  </el-icon>
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
        <template v-slot:empty>
          <el-empty description="还没有网关,点击新增创建"/>
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
              :total="parseInt(Data.count)"
              @current-change="on读取列表"/>
        </el-config-provider>
      </div>
    </div>
  </div>

  <WangGuanXinXi v-if="is对话框可见" :id="Id"
                 @on对话框详细信息关闭="on对话框详细信息关闭"></WangGuanXinXi>
</template>

<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref} from 'vue'
import {useStore} from 'vuex'
import {ElMessage} from "element-plus";
import {DeleteInfo, GetList, Test} from "@/api/网关转发api.js";
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import WangGuanXinXi from "./组件/网关转发详细信息.vue";
import {is移动端, 表格写入列宽数组, 表格读取列宽数组} from "@/utils/utils";
import {useTableHeight} from "@/composables/useTableHeight";

const {tableRef, tableHeight, updateTableHeight} = useTableHeight(85)

const Store = useStore();
const Data = ref({count: 0, list: []})
const 对象_搜索条件初始值 = {Type: 1, Size: 10, Page: 1, Keywords: ""}
const 对象_搜索条件 = ref(Object.assign({}, 对象_搜索条件初始值))
const is加载中 = ref(false)
const 表格被选中列表 = ref([])
const is批量删除禁用 = ref(true)
const is对话框可见 = ref(false)
const Id = ref("")
const onGetList = async () => {
  is加载中.value = true
  const res = await GetList(对象_搜索条件.value)
  is加载中.value = false
  if (res.code == 10000) {
    Data.value = res.data
  }
}
const on读取列表 = () => {
  onGetList()
}
const onReset = () => {
  对象_搜索条件.value = Object.assign({}, 对象_搜索条件初始值)
  on读取列表()
}

const on选择框被选择 = (val: any) => {
  表格被选中列表.value = val
  is批量删除禁用.value = 表格被选中列表.value.length == 0
}

const on批量删除 = async () => {
  const 局_ids = 表格被选中列表.value.map((item: any) => item.Id)
  if (局_ids.length == 0) {
    ElMessage.warning("请选择要删除的网关")
    return
  }
  const res = await DeleteInfo({Ids: 局_ids})
  if (res.code == 10000) {
    ElMessage.success(res.msg)
    on读取列表()
  } else {
    ElMessage.error(res.msg)
  }
}

const on单个删除 = async (id: number) => {
  const res = await DeleteInfo({Ids: [id]})
  if (res.code == 10000) {
    ElMessage.success(res.msg)
    on读取列表()
  } else {
    ElMessage.error(res.msg)
  }
}

const on单个编辑 = (id: number) => {
  is对话框可见.value = true
  Id.value = String(id)
}

const on单个测试 = async (id: number) => {
  const res = await Test({Id: id})
  if (res.code == 10000 && res.data?.IsOk) {
    ElMessage.success(res.msg + ",耗时 " + res.data.耗时 + "ms,状态码 " + res.data.StatusCode)
  } else if (res.code == 10000) {
    ElMessage.warning(res.msg + ":" + (res.data?.Err || '未知错误'))
  } else {
    ElMessage.error(res.msg)
  }
}

const on对话框详细信息打开 = (id: string) => {
  is对话框可见.value = true
  Id.value = id
}
const on对话框详细信息关闭 = (is重新读取: boolean) => {
  is对话框可见.value = false
  if (is重新读取) {
    on读取列表()
  }
}

//列宽记忆
const on表格列宽被改变 = () => {
  localStorage.setItem('列宽_网关转发', JSON.stringify(表格读取列宽数组(tableRef.value)))
}
const on表格列宽初始化 = () => {
  const 局_列宽 = localStorage.getItem('列宽_网关转发')
  if (局_列宽) {
    表格写入列宽数组(tableRef.value, JSON.parse(局_列宽))
  }
}

onMounted(async () => {
  Data.value.list = []
  if (Store.state.搜索_网关转发?.Size != 0 && Store.state.搜索_网关转发?.Size != null) {
    对象_搜索条件.value = Store.state.搜索_网关转发
  }
  await onGetList()
  on表格列宽初始化()
})
onBeforeUnmount(() => {
  Store.commit("set搜索_网关转发", 对象_搜索条件.value)
})
</script>

<style scoped lang="scss">
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
    font-size: 16px;
    margin-left: 10px;
    padding: 5px;
    border: 1px solid rgb(235, 238, 245);
    color: #0c0d0e;
    speak: none;
    font-style: normal;
    font-variant: normal;
    text-transform: none;
    line-height: 1;
    vertical-align: baseline;
    display: inline-block;
    -webkit-font-smoothing: antialiased;
    cursor: pointer;
  }
}

.选中统计 {
  margin: 8px 8px;
  padding: 4px 8px;
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 4px;
  color: #1890ff;
  font-size: 13px;
  align-self: center;
}

.el-form-item {
  padding: 0;
  margin: 0 15px 8px 0;
}

.el-table .cell {
  white-space: pre-wrap;
}
</style>
