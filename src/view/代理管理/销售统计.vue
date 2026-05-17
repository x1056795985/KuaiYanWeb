<template>
  <div class="最底层div">
    <div class="内容div" style="align-items: center ">
      <el-form :inline="true">
        <el-form-item label="选择应用" prop="" style="width:300px">
          <el-select v-model.number="对象_搜索条件.AppId" clear placeholder="请选择应用" filterable @change="on更新卡类列表">
            <el-option v-for="(item,index) in 数组AppId_Name" :key="item.appId"
                       :label="item.appName+'('+item.appId.toString()+')'" :value="item.appId"/>
          </el-select>
        </el-form-item>

        <el-form-item prop="KaClassId" style="width:120px">
          <el-select v-model="对象_搜索条件.KaClassId" clear placeholder="选择卡类">
            <el-option key="0" label="全部卡类" :value="0"/>
            <el-option v-for="(值,index) in 对象_卡类型" :key="index" :label="对象_卡类型[index]"
                       :value="Number(index)"/>
          </el-select>
        </el-form-item>
        <el-form-item prop="status" style="width:120px"  >
          <el-select v-model="对象_搜索条件.AgentLv" clear placeholder="请选择">
            <el-option key="0" label="代理自身" :value="0"/>
            <el-option key="1" label="包括下1级代理" :value="1"/>
            <el-option key="2" label="包括下2级代理" :value="2"/>
            <el-option key="3" label="包括下3级代理" :value="3"/>
          </el-select>
        </el-form-item>
        <el-form-item prop="status" style="width:120px"  >
          <el-select v-model="对象_搜索条件.Num" clear placeholder="请选择">
            <el-option key="0" label="全部使用" :value="0"/>
            <el-option key="1" label="已耗尽次数" :value="1"/>
            <el-option key="2" label="有使用次数" :value="2"/>
          </el-select>
        </el-form-item>

        <el-form-item prop="status" style="width:250px"  >
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
        <el-form-item prop="status" style="width:250px"  >
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
        <el-form-item>
            <el-input class="搜索框"
                      v-model.trim="对象_搜索条件.AgentName"
                      placeholder="制卡人名称"
                      style="top:0 ; width: 150px;padding: 0;margin: 0"
                      clearable
            >
            </el-input>
        </el-form-item>
        <el-form-item style="padding-left: 5px">
          <el-button type="primary" icon="search" @click="on读取列表">查询</el-button>
          <el-button icon="refresh" @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="container">
      <div class="content">
        <el-input
            v-model="Data"
            type="textarea"
            placeholder="销售统计信息"
            autosize
            style="height: 100vh"
        >
        </el-input>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref} from "vue";
import {Get销售统计 } from "@/api/代理信息api.js";
import {GetAppIdNameList} from "@/api/应用列表api.js";

import {useStore} from "vuex";
// 引入中文包
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import {ElMessage, ElMessageBox} from 'element-plus'
import {Delete} from "@element-plus/icons-vue";
import router from "@/router";
import {GetKaList} from "@/api/卡号列表api";
import {GetKaClassList} from "@/api/卡类列表api";


const Data = ref("")
const Store = useStore()
const 对象_搜索条件 = ref({
  AppId: 10000,
  Num: 0,
  RegisterTime: ["", ""],
  UseTime: ["", ""],
  KaClassId: 0,
  AgentLv: 0,
  AgentName: "",
})

const on读取列表 = () => {
  console.log("对象_搜索条件")
  console.log(对象_搜索条件.value)
  onGetKaList()
}
const onReset = () => {

  对象_搜索条件.value = {
    AppId: 10000,
    Num: 0,
    RegisterTime: ["", ""],
    UseTime: ["", ""],
    KaClassId: 0,
    AgentLv: 0,
    AgentName: "",
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
  const res = await   Get销售统计(对象_搜索条件.value)
  console.log(res)
  is加载中.value = false
  Data.value = res.data

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
    let 局_默认appid=Store.state.搜索_默认选择应用AppId
    对象_搜索条件.value.AppId = 数组AppId_Name.value.some(item => item.appId === 局_默认appid)?局_默认appid:数组AppId_Name.value[0].appId
  }
  on更新卡类列表()
}

const 对象_卡类型 = ref({})

onMounted(async () => {
      onReset()

  await onGetAppIdNameList()
    }
)

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

const on更新卡类列表 = async () => {
  console.log("对象_搜索条件")
  console.log(对象_搜索条件.value)
  is加载中.value = true
  const res = await GetKaClassList({"AppId": 对象_搜索条件.value.AppId, "Type": 2, "Size": 1000, "Page": 1, "Keywords": ""})
  console.log(res)
  is加载中.value = false
  //判断应用是否切换,如果appId 相同 则不重新获取数据
  let 局_临时对象 = {}
  let is存在 = false
  let 数组_全部卡类列表 = res.data.List
  for (let i = 0; i < 数组_全部卡类列表.length; i++) {
    局_临时对象[数组_全部卡类列表[i].Id] = 数组_全部卡类列表[i].Name
    //判断 对象_搜索条件.KaClassId 是否存在 局_临时数组  中 如果不存在则赋值1
    if (数组_全部卡类列表[i].Id == 对象_搜索条件.value.KaClassId) {
      is存在 = true
    }
  }

  对象_卡类型.value = 局_临时对象
  if (!is存在) {
    对象_搜索条件.value.KaClassId = 0
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
  margin: 0 10px 8px 0;
}

.container {
  height: 70vh; /* 或者其他你希望的高度 */
}

.content {
  height: 100%;
  overflow-y: auto; /* 如果内容超出高度，允许滚动 */
  white-space: pre-wrap; /* 允许多行显示 */
}
</style>
