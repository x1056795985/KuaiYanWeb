<template>
  <div v-show="Props.侧栏可见" class="分类侧栏">
    <!-- 全部函数 -->
    <div class="固定项" :class="{'固定项_选中': Props.当前分类Id === 0}" @click="emit('on选择分类', 0)">
      <el-icon class="图标"><FolderOpened/></el-icon>
      <span class="名称">全部函数</span>
      <span class="数量徽标">{{ Props.全部Count }}</span>
    </div>
    <!-- 未分类 -->
    <div class="固定项" :class="{'固定项_选中': Props.当前分类Id === -1}" @click="emit('on选择分类', -1)">
      <el-icon class="图标"><Files/></el-icon>
      <span class="名称">未分类</span>
      <span class="数量徽标">{{ Props.未分类Count }}</span>
    </div>

    <el-divider style="margin: 6px 0"/>

    <!-- 分类树 -->
    <div class="树容器">
      <el-tree ref="分类树Ref" :data="Props.分类树" node-key="Id"
               :expand-on-click-node="false" default-expand-all
               :current-node-key="Props.当前分类Id" highlight-current
               :props="{label: 'Name', children: 'children'}"
               @node-click="(数据: 分类树节点) => emit('on选择分类', 数据.Id)">
        <template #default="{ data }">
          <div class="树节点">
            <el-icon class="图标"><Folder/></el-icon>
            <span class="名称" :title="data.Note">{{ data.Name }}</span>
            <span class="数量徽标">{{ data.Count }}</span>
            <el-dropdown trigger="click" @command="(命令: string) => on节点菜单(命令, data)"
                         @visible-change="(可见: boolean) => 可见 && emit('on节点菜单打开')">
              <el-icon class="节点菜单" @click.stop>
                <MoreFilled/>
              </el-icon>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="新建子分类">新建子分类</el-dropdown-item>
                  <el-dropdown-item command="重命名">重命名</el-dropdown-item>
                  <el-dropdown-item command="删除" divided style="color: var(--el-color-danger)">
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </template>
      </el-tree>
      <el-empty v-if="Props.分类树.length === 0" description="暂无分类" :image-size="50"/>
    </div>

    <div class="侧栏底部">
      <el-button icon="Plus" type="primary" plain style="width: 100%" @click="emit('on新建分类', 0)">
        新建分类
      </el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref, watch} from "vue";

export type 分类树节点 = {
  Id: number, ParentId: number, Name: string, Sort: number, Note: string,
  Count: number, children: 分类树节点[]
}

const Props = defineProps({
  侧栏可见: {type: Boolean, default: true},
  当前分类Id: {type: Number, default: 0},
  分类树: {type: Array, default: () => []},        //树形分类数据
  未分类Count: {type: Number, default: 0},
  全部Count: {type: Number, default: 0},
})

const emit = defineEmits(['on选择分类', 'on新建分类', 'on编辑分类', 'on删除分类', 'on节点菜单打开'])

const 分类树Ref = ref()

//外部筛选分类变化时同步树高亮(全部/未分类时清除高亮)
watch(() => Props.当前分类Id, (新值) => {
  if (分类树Ref.value) {
    分类树Ref.value.setCurrentKey(新值 > 0 ? 新值 : null as any)
  }
})

const on节点菜单 = (命令: string, data: 分类树节点) => {
  if (命令 === '新建子分类') emit('on新建分类', data.Id)
  else if (命令 === '重命名') emit('on编辑分类', data)
  else if (命令 === '删除') emit('on删除分类', data)
}
</script>

<style scoped lang="scss">
.分类侧栏 {
  width: 225px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  padding: 10px 8px;
  background: #ffffff;
  border: 1px solid rgb(235, 238, 245);
  border-radius: 4px;
  min-height: calc(100vh - 200px);
  max-height: calc(100vh - 200px);
  overflow: hidden;
}

.固定项 {
  display: flex;
  align-items: center;
  height: 36px;
  padding: 0 10px;
  border-radius: 6px;
  cursor: pointer;
  color: #606266;
  user-select: none;

  &:hover {
    background: #f5f7fa;
  }
}

.固定项_选中 {
  background: #ecf5ff;
  color: #409eff;
  font-weight: 600;

  &:hover {
    background: #ecf5ff;
  }
}

.树容器 {
  flex: 1;
  overflow-y: auto;

  :deep(.el-tree) {
    background: transparent;
    --el-tree-node-content-height: 34px;

    .el-tree-node__content {
      border-radius: 6px;
      padding-right: 4px;
    }

    .el-tree-node.is-current > .el-tree-node__content {
      background: #ecf5ff;
      color: #409eff;

      .数量徽标 {
        background: #409eff;
      }
    }
  }
}

.树节点 {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  overflow: hidden;

  &:hover .节点菜单 {
    opacity: 1;
  }
}

.图标 {
  margin-right: 6px;
  flex-shrink: 0;
}

.名称 {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
}

.数量徽标 {
  background: #c0c4cc;
  color: #fff;
  border-radius: 10px;
  font-size: 12px;
  line-height: 18px;
  padding: 0 7px;
  margin: 0 4px;
  flex-shrink: 0;
}

.节点菜单 {
  opacity: 0; //hover 节点时才显示
  font-size: 15px;
  color: #909399;
  cursor: pointer;
  flex-shrink: 0;
  transition: opacity 0.15s;

  &:hover {
    color: #409eff;
  }
}

.侧栏底部 {
  padding-top: 8px;
  border-top: 1px solid #ebeef5;
}
</style>
