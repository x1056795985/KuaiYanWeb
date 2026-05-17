<template>
  <div class="最底层div">
    <div class="内容div">
      <div class="gva-btn-list" style="background:#FAFAFAFF">
        <el-button icon="Refresh" type="primary" style="margin: 8px 8px 8px;; width: 65px" @click="on读取列表">
          刷新
        </el-button>
        <el-button  :disabled="局_任务状态.id9!==1"  icon="Plus" :type="局_任务状态.id9===1?'primary':'info'" style="margin: 8px 8px 8px;; width: 85px" @click="is显示上传界面=true">
          {{局_任务状态.id9===1?"创建任务":"维护中"}}
        </el-button>
<!--        <div class="工具栏">-->
<!--          <el-tooltip content="刷新"-->
<!--                      effect="dark"-->
<!--                      placement="top">-->
<!--            <el-icon @click="on读取列表">-->
<!--              <RefreshRight/>-->
<!--            </el-icon>-->
<!--          </el-tooltip>-->
<!--        </div>-->
      </div>

      <el-table v-loading="is加载中" :data="Data.list" border style="width: 100% ;white-space: pre-wrap;"
                ref="tableRef"
                @header-dragend="on表格列宽被改变"
                :max-height="tableHeight"
                @selection-change="on选择框被选择"
                fit="fit"
                :header-cell-style="{background:'#FAFAFAFF',color:'#606266'}">
        <el-table-column type="selection" width="45"/>
        <el-table-column prop="UUID" label="Uuid" width="120" show-overflow-tooltip="">
          <template #default="scope">
            <el-icon class="复制按钮" @click="置剪辑版文本(scope.row.uuid,'已复制到剪辑版')">
              <DocumentCopy/>
            </el-icon>
            {{ scope.row.uuid }}
          </template>
        </el-table-column>
        <el-table-column prop="timeStart" label="创建时间" width="170" show-overflow-tooltip="">
          <template #default="scope">
            {{ 时间_时间戳到时间(scope.row.timeStart) }}
          </template>
        </el-table-column>
        <el-table-column prop="fileName" label="apk名称" width="210" show-overflow-tooltip=""/>
        <el-table-column prop="appName" label="归属应用" width="220" show-overflow-tooltip=""/>
        <el-table-column prop="签名方式" label="签名方式" width="120" show-overflow-tooltip="">
          <template #default="scope">
            {{ ["", "不签名", "随机签名"][scope.row.签名方式] }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="任务状态" width="90" show-overflow-tooltip="">
          <template #default="scope">
            <el-tooltip
                class="box-item"
                effect="dark"
                :content="scope.row.err"
                placement="top"
                v-if="scope.row.err"
            >
              <el-tag  effect="plain" :type="['primary', 'info', 'warning','success','danger'][scope.row.status]">
                {{ 状态列表[scope.row.status] }}
              </el-tag>
            </el-tooltip>
            <el-tag  v-else effect="plain" :type="['primary', 'info', 'warning','success','danger'][scope.row.status]">
              {{ 状态列表[scope.row.status] }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="TimeEnd" label="完成时间" width="170" show-overflow-tooltip="">
          <template #default="scope">
            {{scope.row.timeEnd>0?时间_时间戳到时间(scope.row.timeEnd):"" }}
             <el-progress     v-if="scope.row.timeEnd==0" :percentage="scope.row.status==1?0:计算进度条(scope.row.ttimeStart)" :indeterminate="true"/>
          </template>
        </el-table-column>
        <el-table-column :fixed="is移动端()?false:'right'" label="操作" :width="2*85">
            <template #default="scope">
              <el-button v-if="scope.row.downloadUrl" link type="primary" size="default" @click="on单个下载(scope.row)"
                         style="color:#79bbff">
                <el-icon color="#79bbff" class="no-inherit">
                  <Download/>
                </el-icon>
                下载
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
  <uplode v-if="is显示上传界面" @on对话框详细信息关闭="on对话框详细信息关闭"/>
</template>

<script setup lang="ts">
import {ref, onMounted, computed} from 'vue';
import {ElMessage, ElMessageBox} from 'element-plus';

import type Node from 'element-plus/es/components/tree/src/model/node'
import {
  is移动端, 时间_取现行时间戳,
  时间_时间戳到时间,
  置剪辑版文本,
  置剪辑版文本2,
  表格写入列宽数组,
  表格读取列宽数组
} from "@/utils/utils";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import {Delete} from "@element-plus/icons-vue";

import {GetList,GetTaskIdStatus} from "@/api/Apk加验证";
import uplode from "./组件/apk加固创建任务.vue";

const 状态列表 = ["", "已创建", "处理中", "成功", "失败"]

const 计算进度条 =   (TimeStart: number) => {
  //计算属性,按300秒计算百分比 没完成永远90
  let 局_值= 时间_取现行时间戳()-TimeStart
  if (局_值>300 || 局_值<0) {
    return 95
  }
  //取整数
  局_值= Math.floor(局_值/300*100)
  return 局_值
};



const is加载中 = ref(false)
// table元素
import {useTableHeight} from "@/composables/useTableHeight";
const { tableRef, tableHeight, updateTableHeight } = useTableHeight(85)
const on表格列宽被改变 = (newWidth: any, oldWidth: any, columns: any, event: any) => {
  let 局_列宽数组: number[] = 表格读取列宽数组(tableRef.value)
  localStorage.setItem('列宽_Apk加验证', JSON.stringify(局_列宽数组));
}
const on表格列宽初始化 = () => {

  let 局_列宽数组文本 = localStorage.getItem('列宽_Apk加验证')
  if (局_列宽数组文本 != null) {
    let 局_列宽数组: number[] = JSON.parse(局_列宽数组文本)

    表格写入列宽数组(tableRef.value, 局_列宽数组)
  }
}


const 表格被选中列表 = ref([])
const is批量删除禁用 = ref(true)
const is显示上传界面 = ref(false)


const on选择框被选择 = (val: any) => {
  表格被选中列表.value = val
  is批量删除禁用.value = 表格被选中列表.value.length == 0
}
const 对象_搜索条件 = ref({
  Page: 1,
  Size: 10,
  Type: 2,
  Keywords: "",
  Order: 2,
  Count: 0,
})

onMounted(async () => {
  //对象_搜索条件.value = {Page: 1, Size: 10, Type: 2, Keywords: "", Order: 1, Count: 0}
  await on更新任务状态()
  await on读取列表()
  on表格列宽初始化()
})

const Data = ref({
  "count": 0,
  "list": [
    {
      AppId: 10007,
      AppName: "",
      FileName: "",
      Path: "",
      Status: 1,
      TimeEnd: 0,
      TimeStart: 1737357467,
      Uuid: "",
      签名方式: 1,
      DownloadUrl: "",
      Err: "",
    }]
})

interface Tree {
  label: string
  path?: string
  children?: Tree[]
}


const on单个下载 = async (row) => {
  // 输入新文件名,旧文件名为默认文件名
  window.location.href = row.DownloadUrl
};


const on读取列表 = async () => {
  is加载中.value = true
  const res = await GetList(对象_搜索条件.value)
  console.log(res)
  is加载中.value = false
  Data.value = res.data

}
const 局_任务状态 = ref({id9:0})
const on更新任务状态 = async () => {
  is加载中.value = true
  const res = await GetTaskIdStatus()
  console.log(res)
  is加载中.value = false
  if (res.code == 10000) {
    局_任务状态.value = res.data
  }

}



const on对话框详细信息关闭 = (is重新读取: boolean) => {
  // console.info("父组件收到对话框被关闭了")
  is显示上传界面.value = false
  if (is重新读取) {
    on读取列表()
  }
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
