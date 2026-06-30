<template>
  <div class="最底层div">
    <div class="内容div" style="align-items: center">
      <el-form :inline="true" :model="search">
        <el-form-item label="UID">
          <el-input-number v-model="search.uid" :min="0" controls-position="right" style="width: 130px" />
        </el-form-item>
        <el-form-item label="订单号">
          <el-input v-model.trim="search.orderNo" clearable style="width: 190px" />
        </el-form-item>
        <el-form-item label="关键字">
          <el-input v-model.trim="search.keywords" clearable placeholder="操作人/备注" style="width: 180px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="loadList(1)">查询</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="内容div">
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="data.list"
        border
        style="width: 100%; white-space: pre-wrap;"
        :max-height="tableHeight"
        highlight-current-row
        :header-cell-style="{ background: '#FAFAFAFF', color: '#606266' }"
      >
        <el-table-column prop="Id" label="ID" width="80" />
        <el-table-column prop="OrderNo" label="提现单号" width="190" show-overflow-tooltip />
        <el-table-column prop="Uid" label="UID" width="90" />
        <el-table-column prop="Action" label="动作" width="130">
          <template #default="{ row }">{{ actionText(row.Action) }}</template>
        </el-table-column>
        <el-table-column prop="BeforeStatus" label="前状态" width="110">
          <template #default="{ row }">{{ statusText(row.BeforeStatus) }}</template>
        </el-table-column>
        <el-table-column prop="AfterStatus" label="后状态" width="110">
          <template #default="{ row }">{{ statusText(row.AfterStatus) }}</template>
        </el-table-column>
        <el-table-column prop="OperatorUser" label="操作人" width="140" />
        <el-table-column prop="OperatorType" label="类型" width="100">
          <template #default="{ row }">{{ row.OperatorType === 1 ? '用户' : row.OperatorType === 2 ? '管理员' : '系统' }}</template>
        </el-table-column>
        <el-table-column prop="Ip" label="IP" width="140" />
        <el-table-column prop="Note" label="备注" min-width="220" show-overflow-tooltip />
        <el-table-column prop="Time" label="时间" width="170">
          <template #default="{ row }">{{ formatTime(row.Time) }}</template>
        </el-table-column>
      </el-table>
      <div class="demo-pagination-block">
        <el-config-provider :locale="zhCn">
          <el-pagination
            v-model:current-page="search.page"
            v-model:page-size="search.size"
            :page-sizes="[10, 20, 30, 40, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="data.count"
            size="small"
            @size-change="loadList(1)"
            @current-change="loadList(0)"
          />
        </el-config-provider>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { Refresh, Search } from '@element-plus/icons-vue'
import { withdrawApi } from '@/api/提现审核api.js'
import { useTableHeight } from '@/composables/useTableHeight'

const loading = ref(false)
const data = reactive({ list: [], count: 0 })
const search = reactive({ page: 1, size: 10, uid: 0, orderNo: '', keywords: '' })
const { tableRef, tableHeight } = useTableHeight(85)

const statusText = (value) => ({ 0: '-', 1: '待审核', 2: '已驳回', 3: '待付款', 4: '已付款', 5: '已取消' }[value] || '未知')
const actionText = (value) => ({ 1: '提交', 2: '取消', 3: '审核通过', 4: '驳回', 5: '上传凭证', 6: '重传凭证', 7: '标记付款', 8: '付款失败驳回' }[value] || '操作')
const formatTime = (value) => value ? new Date(Number(value) * 1000).toLocaleString() : ''

const loadList = async (reset) => {
  if (reset) search.page = 1
  loading.value = true
  const res = await withdrawApi.logs(search)
  loading.value = false
  if (res.code === 10000) {
    data.list = res.data.list || []
    data.count = res.data.count || 0
  }
}

const resetSearch = () => {
  Object.assign(search, { page: 1, size: 10, uid: 0, orderNo: '', keywords: '' })
  loadList(1)
}

onMounted(() => loadList(1))
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
.demo-pagination-block {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}
.el-form-item {
  padding: 0;
  margin: 0 10px 8px 0;
}
.el-table .cell {
  white-space: pre-line;
}
</style>
