<template>
  <div class="common-layout">
    <el-container>
      <el-aside :class="is折叠?'el-aside2 侧边栏菜单':'el-aside1 侧边栏菜单'" :width="is折叠?is移动端()?'0px':'60px':'256px'" :style="is移动端()?'':'overflow: hidden; //消除侧边栏' " >
        <!--左侧侧边栏-->
        <logoBar :is折叠="is折叠"></logoBar>
        <MenuBar :is折叠="is折叠"></MenuBar>
      </el-aside>
      <el-container>

        <el-header>
          <!--头部导航-->
          <div class="ele-admin-header-tool-item" @click="on折叠被点击">
            <el-icon style="font-size: 18px ; left: 0;padding: 15px 10px;">
              <component :is="is折叠?'Expand':'Fold'"></component>
            </el-icon>
          </div>

          <HeaderBar></HeaderBar>
          <div style="margin-left: auto; display: flex; align-items: center;">
            <GlobalSearch></GlobalSearch>
            <Userinfo></Userinfo>
          </div>

        </el-header>
        <el-main>
          <!--主体内容-->
          <tabs>

          </tabs>
          <AppMain></AppMain>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>


<script setup lang="ts">
import logoBar from "@/view/layout/components/logoBar/logo.vue"
import MenuBar from "@/view/layout/components/MenuBar/index.vue"
//引入图标  展开 折叠
import {Expand, Fold} from "@element-plus/icons-vue"
import {onMounted, ref} from "vue";
import {is移动端} from "@/utils/utils";
import AppMain from "@/view/layout/components/AppMain/AppMain.vue";
import HeaderBar from "@/view/layout/components/headerBar/headerBar.vue";
import tabs from "@/view/layout/components/TabBar/TabBar.vue";
import Userinfo from "@/view/layout/components/用户名下拉菜单/用户名下拉菜单.vue";
import GlobalSearch from "@/view/layout/components/全局搜索/全局搜索.vue";
import {triggerGlobalResize} from "@/composables/useTableHeight";

const is折叠 = ref<boolean>(true);

const on折叠被点击 = () => {
  is折叠.value = !is折叠.value
  triggerGlobalResize() // 直接调用全局方法
}


onMounted(()=>{
  is折叠.value=true
})

</script>

<style scoped lang="scss">
.common-layout {
  height: 100%;
}

.el-container {
  height: 100%;
}

.el-header {
  display: flex;
  flex-wrap: nowrap; // 组件不自动换行   wrap(换行)
  align-items: center; //对齐 居中
  color: #333;
  //text-align: center;
  height: 60px;
  overflow: hidden;
  border: none; //消除边框
  padding-left: 0;

  //background-color: #2b83f9;
  //background-image: linear-gradient(143deg,  #337ecc, #79bbff,  #a0cfff);
  .ele-admin-header-tool-item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: auto;
    padding: 0 12px;
    cursor: pointer;
    :hover {
      box-shadow:0 0  3px #556375;
    }

  }

}

.el-aside1 {
  background: #344359FF;
  background-size: 80% 160%;
  //color: #333;
  //text-align: center;
}
.el-aside2 {
  background: linear-gradient(-45deg, #dae, #f66, #3c9, #09f, #66f);
  background-size: 80% 160%;
  //color: #333;
  //text-align: center;
}

.el-main {
  //background-color: #e9eef3;
  //color: #333;
  //text-align: center;
  //line-height: 160px;
  padding:0  10px;
  //overflow: hidden;

}

.el-menu {
  background-color: transparent; /* 设置背景色为透明 */
}
</style>
