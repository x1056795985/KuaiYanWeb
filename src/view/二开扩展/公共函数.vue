<template>
  <div class="最底层div">
    <div style="display: flex; gap: 8px; align-items: flex-start">
      <PublicJsCategorySidebar
          :侧栏可见="is分类侧栏可见" :当前分类Id="对象_搜索条件.CategoryId"
          :分类树="树形分类列表" :未分类Count="未分类数量" :全部Count="全部数量"
          @on选择分类="on选择分类"
          @on新建分类="on新建分类对话框打开"
          @on编辑分类="on编辑分类对话框打开"
          @on删除分类="on删除分类"/>
      <div style="flex: 1; min-width: 0">
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
                    style="top:0 ;width: auto;padding: 0;margin: 0"
                    clearable
          >
            <template #prepend>
              <el-select v-model="对象_搜索条件.Type" placeholder="名称" style="width: 100px;">
                <el-option label="函数名" :value="1"/>
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
                   @click="on对话框详细信息打开('')">
          新增
        </el-button>

        <el-popconfirm title="确定删除勾选Js函数?" width="200"
                       @confirm="on批量删除" confirm-button-text="确定"
                       cancel-button-text="取消">
          <template #reference>
            <el-button icon="warning" type="danger" style="margin: 8px 8px 8px;; width: 65px"
                       :disabled=is批量删除禁用>删除
            </el-button>
          </template>
        </el-popconfirm>

        <el-button icon="FolderOpened" type="warning" plain style="margin: 8px 8px 8px"
                   @click="on切换分类侧栏">
          {{ 当前分类名 ? '分类: ' + 当前分类名 : '分类管理' }}
        </el-button>

        <div class="工具栏">

          <el-popover placement="bottom-end" trigger="hover" width="160">
            <template #reference>
              <span class="更多功能按钮">
                <el-icon style="margin:0!important;border:none!important;padding:0!important;font-size:14px;">
                  <More/>
                </el-icon>
                <span>更多功能</span>
              </span>
            </template>
            <li class="工具_更多_li" @click="on移动到分类对话框打开">移动到分类</li>
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
                :header-cell-style="{background:'#FAFAFAFF',color:'#606266'}">

        <el-table-column type="selection" width="45"/>
        <el-table-column prop="Id" label="Id" width="70"/>
        <el-table-column prop="Name" label="函数名" width="280"/>
        <el-table-column prop="AppId" label="函数归属" width="200">
          <template #default="scope">
            <el-tag  :type="scope.row.AppId>10000?'primary':'success'">
              {{ scope.row.appName }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="CategoryId" label="分类" min-width="180" show-overflow-tooltip>
          <template #default="scope">
            <span>{{ 分类链文本(scope.row.CategoryId) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="Note" label="备注" width="%100"/>
        <!--        <el-table-column prop="Type" label="函数类型" width="100">
                  <template #default="scope">
                    <el-tag :type="scope.row.Type>4?'danger':scope.row.Type===3?'':'success'">
                      {{ onTypeId转换文本(scope.row.Type) }}
                    </el-tag>
                  </template>
                </el-table-column>-->
        <!--        <el-table-column prop="Value" label="函数值" width="%100" show-overflow-tooltip="">
                  <template #default="scope">
                    <el-tag v-if="scope.row.Type===3" :type="scope.row.Value==='0'?'info':scope.row.Value==='1'?'':'danger'">
                      {{ scope.row.Value === '0' ? '关闭' : scope.row.Value === '1' ? '开启' : scope.row.Value }}
                    </el-tag>
                    <template v-else>
                      {{ scope.row.Value }}
                    </template>
                  </template>
                </el-table-column>-->

        <el-table-column :fixed="is移动端()?false:'right'" label="操作" :width="2*85">
          <template #default="scope">
            <el-button link type="primary" size="default" @click="on单个编辑(scope.row.Name)"
                       style="color:#79bbff">
              <el-icon color="#79bbff" class="no-inherit">
                <Edit/>
              </el-icon>
              编辑
            </el-button>
<!--            <el-button link type="primary" size="default" @click="on单个删除(scope.row.Name)"
                       style="color:#f56d6d">
              <el-icon color="#f56d6d" class="no-inherit">
                <Delete/>
              </el-icon>
              删除
            </el-button>-->
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
    </div><!-- flex 右侧内容区结束 -->
    </div><!-- 页面主体 flex 结束 -->
  </div>
  <PublicDataInfo v-if="is对话框可见" :AppId="1" :id="Id"
                  :当前筛选分类Id="对象_搜索条件.CategoryId"
                  @on对话框详细信息关闭="on对话框详细信息关闭"></PublicDataInfo>

  <!-- 新建/编辑分类对话框 -->
  <el-dialog v-model="is分类对话框可见" :title="编辑中分类.Id === 0 ? '新建分类' : '编辑分类'"
             width="420px" append-to-body>
    <el-form label-width="80px">
      <el-form-item label="上级分类">
        <el-tree-select v-model="编辑中分类.ParentId" :data="上级分类选项树"
                        check-strictly :render-after-expand="false"
                        node-key="Id" :props="{label: 'Name', children: 'children'}"
                        style="width: 100%" placeholder="无(顶级分类)"/>
      </el-form-item>
      <el-form-item label="分类名" required>
        <el-input v-model.trim="编辑中分类.Name" placeholder="请输入分类名" maxlength="50"
                  @keyup.enter="on保存分类"/>
      </el-form-item>
      <el-form-item label="排序">
        <el-input-number v-model="编辑中分类.Sort" :min="0" controls-position="right"/>
        <span style="margin-left: 10px;color: #909399;font-size: 12px">数字越小越靠前</span>
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="编辑中分类.Note" placeholder="备注(可选)" maxlength="200"/>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="is分类对话框可见 = false">取 消</el-button>
      <el-button type="primary" :loading="is分类保存中" @click="on保存分类">确 定</el-button>
    </template>
  </el-dialog>

  <!-- 批量移动到分类对话框 -->
  <el-dialog v-model="is移动到分类对话框可见" title="移动到" width="400px" append-to-body>
    <div style="margin-bottom: 8px;color: #606266">已选择 {{ 表格被选中列表.length }} 个函数,移动到:</div>
    <div class="移动目标树容器">
      <el-tree ref="移动目标树Ref" :data="移动目标树数据" node-key="Id"
               highlight-current default-expand-all :expand-on-click-node="false"
               :current-node-key="0"
               :props="{label: 'Name', children: 'children'}"
               @node-click="移动目标分类Id = $event.Id">
        <template #default="{ data }">
          <div class="移动目标节点">
            <el-icon style="margin-right: 6px">
              <Files v-if="data.Id === 0"/>
              <Folder v-else/>
            </el-icon>
            <span>{{ data.Name }}</span>
            <span class="数量徽标">{{ data.Count }}</span>
          </div>
        </template>
      </el-tree>
    </div>
    <template #footer>
      <el-button @click="is移动到分类对话框可见 = false">取 消</el-button>
      <el-button type="primary" @click="on批量移动分类确定">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import {computed, nextTick, onBeforeUnmount, onMounted, ref} from "vue";
import {
  GetList, DeleteInfo, GetPublicAppList,
  GetCategoryList, NewCategory, SaveCategoryInfo, DeleteCategory, SetFunctionCategory
} from "@/api/公共函数api.js";
import {useStore} from "vuex";
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import {ElMessage, ElMessageBox} from 'element-plus'
import PublicDataInfo from "./组件/公共函数详细信息.vue";
import PublicJsCategorySidebar from "./组件/公共函数分类侧栏.vue";

import {is移动端, 表格写入列宽数组, 表格读取列宽数组} from "@/utils/utils";
import {useTableHeight} from "@/composables/useTableHeight";
const { tableRef, tableHeight, updateTableHeight } = useTableHeight(85)
const on单个删除 = async (id: string) => {
  console.log('on单个删除' + id)
  const res = await DeleteInfo({"data": [{"AppId": 1, "Name": id}]})
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
  const ids = 表格被选中列表.value.map((item => item.Id))
  console.log(ids)
  const res = await DeleteInfo({"Id": ids,"Type": 1 })
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
const 公共变量初始数据 = {
  "AppId": 1,
  "Name": "",
  "Value": "",
  "Type": 1,
  "IsVip": 1
}

const Id = ref("")
const 公共变量 = ref(公共变量初始数据)

const on对话框详细信息打开 = (id: string) => {
  Id.value = id
  is对话框可见.value = true

}
const on对话框详细信息关闭 = (is重新读取: boolean) => {
  //console.info("父组件收到对话框被关闭了")
  is对话框可见.value = false
  if (is重新读取) {
    on读取列表()
  }
}

const on选择框被选择 = (val: any) => {
  表格被选中列表.value = val
  is批量删除禁用.value = 表格被选中列表.value.length == 0
}

const Data = ref({
  "count": 0,
  "list": [
    {
      "Id": 0,
      "AppId": 1,
      "Name": "",
      "Value": "",
      "Type": 1,
      "IsVip": 1,
      "Note": "",
      "AppName": ""
    }]
})
const Store = useStore()
const 对象_搜索条件初始值 = {AppId: 0, Type: 1, Size: 10, Page: 1, Keywords: "", CategoryId: 0}
const 对象_搜索条件 = ref(Object.assign({}, 对象_搜索条件初始值))

//==================== 分类管理 ====================
type 分类信息 = { Id: number, ParentId: number, Name: string, Sort: number, Note: string, Count: number }
type 分类树节点 = 分类信息 & { children: 分类树节点[] }

const 侧栏可见缓存键 = '公共函数_分类侧栏可见'
const is分类侧栏可见 = ref(localStorage.getItem(侧栏可见缓存键) !== '0')
const 分类列表 = ref<分类信息[]>([])
const 未分类数量 = ref(0)

//扁平分类列表 → 树形结构
const 树形分类列表 = computed<分类树节点[]>(() => {
  const 局_map = new Map<number, 分类树节点>()
  分类列表.value.forEach(v => 局_map.set(v.Id, {...v, children: []}))
  const 局_根: 分类树节点[] = []
  分类列表.value.forEach(v => {
    const 局_节点 = 局_map.get(v.Id)
    if (v.ParentId > 0 && 局_map.has(v.ParentId)) {
      局_map.get(v.ParentId)!.children.push(局_节点!)
    } else {
      局_根.push(局_节点!)
    }
  })
  return 局_根
})

//树形选择框数据源(根节点为虚拟"未分类")
const 分类树选项数据 = computed<分类树节点[]>(() => {
  return [{Id: 0, ParentId: -1, Name: '未分类', Sort: 0, Note: '', Count: 未分类数量.value, children: 树形分类列表.value}]
})

//编辑分类时上级分类选项(排除自己及子孙,防止环形引用)
const 上级分类选项树 = computed<分类树节点[]>(() => {
  const 自身Id = 编辑中分类.value.Id
  const 局_排除 = (节点们: 分类树节点[]): 分类树节点[] =>
      节点们.filter(n => n.Id !== 自身Id)
          .map(n => ({...n, children: 局_排除(n.children || [])}))
  return [{Id: 0, ParentId: -1, Name: '无(顶级分类)', Sort: 0, Note: '', Count: 0, children: 局_排除(树形分类列表.value)}]
})

const 全部数量 = computed(() => {
  return 分类列表.value.reduce((累计, v) => 累计 + (v.Count || 0), 0) + 未分类数量.value
})

const 当前分类名 = computed(() => {
  const id = 对象_搜索条件.value.CategoryId
  if (id > 0) {
    const 局_分类 = 分类列表.value.find(v => v.Id === id)
    return 局_分类 ? 局_分类.Name : ""
  }
  if (id === -1) return "未分类"
  return ""
})

const on切换分类侧栏 = () => {
  is分类侧栏可见.value = !is分类侧栏可见.value
  localStorage.setItem(侧栏可见缓存键, is分类侧栏可见.value ? '1' : '0')
}

const on读取分类列表 = async () => {
  const res = await GetCategoryList({})
  if (res.code == 10000) {
    分类列表.value = (res.data.list || []).map((v: any) => ({...v, ParentId: v.ParentId || 0}))
    未分类数量.value = res.data.未分类Count || 0
  }
}

const on选择分类 = (id: number) => {
  对象_搜索条件.value.CategoryId = id
  对象_搜索条件.value.Page = 1
  on读取列表()
}

//分类Id → 分类链文本 如: 顶级分类 → 下属分类 → 当前分类
const 分类链文本 = (分类Id: number): string => {
  if (分类Id <= 0) return "未分类"
  const 局_map = new Map<number, 分类信息>()
  分类列表.value.forEach(v => 局_map.set(v.Id, v))
  const 局_链: string[] = []
  let 局_当前 = 局_map.get(分类Id)
  let 局_防环 = 0
  while (局_当前 && 局_防环++ < 20) {
    局_链.unshift(局_当前.Name)
    局_当前 = 局_当前.ParentId > 0 ? 局_map.get(局_当前.ParentId) : undefined
  }
  return 局_链.length ? 局_链.join(" → ") : "未分类"
}

//批量移动到分类对话框
const is移动到分类对话框可见 = ref(false)
const 移动目标树Ref = ref()
const 移动目标分类Id = ref(0)
const 移动目标树数据 = computed<分类树节点[]>(() => 分类树选项数据.value)

const on移动到分类对话框打开 = () => {
  if (表格被选中列表.value.length === 0) {
    ElMessage.warning("请先勾选要移动的函数")
    return
  }
  移动目标分类Id.value = 0
  is移动到分类对话框可见.value = true
  nextTick(() => 移动目标树Ref.value?.setCurrentKey(0)) //默认选中"未分类"
}

const on批量移动分类确定 = async () => {
  const ids = 表格被选中列表.value.map((item: any) => item.Id)
  const res = await SetFunctionCategory({Id: ids, CategoryId: 移动目标分类Id.value})
  if (res.code == 10000) {
    is移动到分类对话框可见.value = false
    ElMessage.success(res.msg)
    on读取列表()
    on读取分类列表()
  }
}

//新建/编辑分类对话框
const is分类对话框可见 = ref(false)
const is分类保存中 = ref(false)
const 编辑中分类 = ref<分类信息>({Id: 0, ParentId: 0, Name: "", Sort: 0, Note: ""})

const on新建分类对话框打开 = (父分类Id: number = 0) => {
  编辑中分类.value = {Id: 0, ParentId: 父分类Id, Name: "", Sort: 0, Note: ""}
  is分类对话框可见.value = true
}
const on编辑分类对话框打开 = (item: 分类信息) => {
  编辑中分类.value = {Id: item.Id, ParentId: item.ParentId || 0, Name: item.Name, Sort: item.Sort, Note: item.Note}
  is分类对话框可见.value = true
}
const on保存分类 = async () => {
  if (!编辑中分类.value.Name) {
    ElMessage.error("分类名不能为空")
    return
  }
  is分类保存中.value = true
  let res
  if (编辑中分类.value.Id === 0) {
    res = await NewCategory(编辑中分类.value)
  } else {
    res = await SaveCategoryInfo(编辑中分类.value)
  }
  is分类保存中.value = false
  if (res.code == 10000) {
    ElMessage.success(res.msg)
    is分类对话框可见.value = false
    await on读取分类列表()
  }
}

const on删除分类 = async (分类节点: 分类信息) => {
  const res = await DeleteCategory({Id: 分类节点.Id})
  if (res.code == 10000) {
    ElMessage.success(res.msg)
    await on读取分类列表()
    //正在筛选的分类被删除→重置为全部(其子分类也一并删除)
    if (对象_搜索条件.value.CategoryId === 分类节点.Id) {
      对象_搜索条件.value.CategoryId = 0
      on读取列表()
    }
  }
}

const on读取列表 = () => {
  console.log("对象_搜索条件")
  console.log(对象_搜索条件.value)
  onGetList()
}
const onReset = () => {

  对象_搜索条件.value = Object.assign({}, 对象_搜索条件初始值)

  console.log(对象_搜索条件.value)
}


const is加载中 = ref(false)
const onGetList = async () => {
  is加载中.value = true
  对象_搜索条件.value.PublicDataType = [11]  //只展示js 固定为11
  const res = await GetList(对象_搜索条件.value)
  console.log(res)
  is加载中.value = false
  Data.value = res.data
  Store.commit("set搜索_默认选择应用AppId", 对象_搜索条件.value.AppId)
}


const on表格列宽被改变 = (newWidth: any, oldWidth: any, columns: any, event: any) => {
  let 局_列宽数组: number[] =表格读取列宽数组(tableRef.value)

  localStorage.setItem('列宽_公共函数', JSON.stringify(局_列宽数组));
}
const on表格列宽初始化 = () => {

  let 局_列宽数组文本 = localStorage.getItem('列宽_公共函数')
  if (局_列宽数组文本 != null) {
    let 局_列宽数组: number[] = JSON.parse(局_列宽数组文本)

    表格写入列宽数组(tableRef.value, 局_列宽数组)
  }
}


onMounted(async () => {

  Data.value.list = []
  onReset()
  //如果 Store zize 不为0 且不为 null  才读取,不然就使用默认的
  if (Store.state.搜索_公共函数.Size != 0 && Store.state.搜索_公共函数.Size != null) {
    对象_搜索条件.value = Store.state.搜索_公共函数
    if (对象_搜索条件.value.CategoryId === undefined) {
      对象_搜索条件.value.CategoryId = 0 //兼容旧缓存
    }
  }
  await GetAppList()
  await on读取分类列表()
  //上次筛选的分类可能已被删除→重置为全部
  if (对象_搜索条件.value.CategoryId > 0 && !分类列表.value.some(v => v.Id === 对象_搜索条件.value.CategoryId)) {
    对象_搜索条件.value.CategoryId = 0
  }
  await onGetList()
  on表格列宽初始化()

})

onBeforeUnmount(() => {
  console.log("事件在卸载之前触发")
  Store.commit("set搜索_公共函数", 对象_搜索条件.value)
})

type AppInfo = {
  appId: number,
  appName: string
}
const 数组AppId_Name = ref<AppInfo[]>()

const GetAppList = async () => {

  const res = await GetPublicAppList({})
  数组AppId_Name.value = res.data

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

//更多功能按钮(参考软件用户页样式)
.更多功能按钮 {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: 10px;
  padding: 5px 10px;
  border: 1px solid rgb(235, 238, 245);
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #606266;
  white-space: nowrap;

  &:hover {
    color: #409eff;
    border-color: #c6e2ff;
  }
}

//移动到分类弹窗
.移动目标树容器 {
  max-height: 320px;
  overflow-y: auto;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 6px;

  :deep(.el-tree-node__content) {
    height: 32px;
    border-radius: 4px;
  }
}

.移动目标节点 {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  font-size: 14px;
}

.数量徽标 {
  background: #c0c4cc;
  color: #fff;
  border-radius: 10px;
  font-size: 12px;
  line-height: 18px;
  padding: 0 7px;
  margin-left: auto;
  flex-shrink: 0;
}
</style>
