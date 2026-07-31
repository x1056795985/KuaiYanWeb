<template>
  <div
    ref="页面Ref"
    class="cloud-storage-page"
    tabindex="-1"
    @dragenter.prevent="on拖拽进入"
    @dragover.prevent
    @dragleave.prevent="on拖拽离开"
    @drop.prevent="on文件被拖入"
  >

    <section class="cloud-workspace" aria-label="云存储文件管理器">
      <aside class="cloud-sidebar" aria-label="目录导航">
        <div class="cloud-sidebar-header">
          <span>目录</span>
          <el-tooltip content="返回根目录" placement="top">
            <button
              class="cloud-icon-button"
              type="button"
              aria-label="返回根目录"
              @click="on切换目录('')"
            >
              <el-icon><FolderOpened /></el-icon>
            </button>
          </el-tooltip>
        </div>
        <el-scrollbar class="cloud-tree-scrollbar">
          <el-tree
            ref="elTreeRef"
            class="cloud-tree"
            :data="树"
            :props="defaultProps"
            node-key="path"
            highlight-current
            :current-node-key="Data.Path"
            :default-expanded-keys="['']"
            :expand-on-click-node="false"
            @node-click="on树节点点击"
          >
            <template #default="{ data }">
              <span class="cloud-tree-node">
                <el-icon><Folder /></el-icon>
                <span>{{ data.label }}</span>
              </span>
            </template>
          </el-tree>
        </el-scrollbar>
      </aside>

      <main class="cloud-main">
        <div class="cloud-pathbar">
          <el-tooltip v-if="is移动端视图" content="打开目录" placement="top">
            <button
              class="cloud-icon-button cloud-mobile-menu"
              type="button"
              aria-label="打开目录"
              @click="is显示目录抽屉 = true"
            >
              <el-icon><Menu /></el-icon>
            </button>
          </el-tooltip>

          <el-breadcrumb separator="/" class="cloud-breadcrumb">
            <el-breadcrumb-item>
              <button
                class="cloud-breadcrumb-link"
                type="button"
                :aria-current="Data.Path === '' ? 'page' : undefined"
                @click="on切换目录('')"
              >
                {{ 根目录名称 }}
              </button>
            </el-breadcrumb-item>
            <el-breadcrumb-item v-for="面包屑 in 面包屑列表" :key="面包屑.path">
              <button
                class="cloud-breadcrumb-link"
                type="button"
                :aria-current="面包屑.path === Data.Path ? 'page' : undefined"
                @click="on切换目录(面包屑.path)"
              >
                {{ 面包屑.label }}
              </button>
            </el-breadcrumb-item>
          </el-breadcrumb>

          <el-tooltip content="复制当前路径" placement="top">
            <button
              class="cloud-icon-button cloud-copy-path"
              type="button"
              aria-label="复制当前路径"
              @click="置剪辑版文本(Data.Path || '/', '当前路径已复制')"
            >
              <el-icon><DocumentCopy /></el-icon>
            </button>
          </el-tooltip>
        </div>

        <div v-if="表格被选中列表.length" class="cloud-toolbar cloud-bulk-toolbar">
          <div class="cloud-bulk-summary">
            <el-icon><Files /></el-icon>
            <span>已选 {{ 表格被选中列表.length }} 个文件</span>
            <span class="cloud-muted">{{ 字节转换(已选择总大小) }}</span>
          </div>
          <div class="cloud-toolbar-spacer" />
          <el-button @click="on清空选择">取消选择</el-button>
          <el-button type="danger" :icon="Delete" @click="on批量删除">删除</el-button>
        </div>

        <div v-else class="cloud-toolbar">
          <el-button type="primary" :icon="Upload" @click="on打开上传界面()">上传文件</el-button>

          <el-input
            v-model="搜索关键词"
            class="cloud-search"
            clearable
            :prefix-icon="Search"
            placeholder="搜索当前目录"
            aria-label="搜索当前目录"
          />

          <el-select
            v-model="排序选项"
            class="cloud-sort-select"
            aria-label="文件排序"
            @change="on排序改变"
          >
            <el-option label="名称升序" value="Name:1" />
            <el-option label="名称降序" value="Name:0" />
            <el-option label="最近上传" value="UpTime:0" />
            <el-option label="最早上传" value="UpTime:1" />
            <el-option label="文件从大到小" value="Size:0" />
            <el-option label="文件从小到大" value="Size:1" />
          </el-select>

          <div class="cloud-toolbar-spacer" />
          <el-tooltip content="刷新当前目录" placement="top">
            <button
              class="cloud-icon-button"
              type="button"
              aria-label="刷新当前目录"
              :disabled="is加载中"
              @click="on读取列表"
            >
              <el-icon :class="{ 'cloud-refresh-icon': true, 'is-loading': is加载中 }">
                <RefreshRight />
              </el-icon>
            </button>
          </el-tooltip>
        </div>

        <div v-if="请求错误" class="cloud-state cloud-state--error" role="alert">
          <el-icon><WarningFilled /></el-icon>
          <div>
            <strong>当前目录加载失败</strong>
            <p>{{ 请求错误 }}</p>
          </div>
          <el-button @click="on读取列表">重新加载</el-button>
        </div>

        <div v-else-if="is加载中 && !is已完成首次加载" class="cloud-skeleton" aria-label="正在加载文件">
          <el-skeleton :rows="7" animated />
        </div>

        <template v-else>
          <el-table
            v-if="!is移动端视图"
            ref="tableRef"
            v-loading="is加载中"
            class="cloud-table"
            :data="Data.List"
            :height="tableHeight"
            row-key="Path"
            :row-class-name="on获取表格行类名"
            @selection-change="on选择框被选择"
            @row-dblclick="on行被双击"
          >
            <el-table-column type="selection" width="48" :selectable="on文件是否可选择" />
            <el-table-column label="名称" min-width="260">
              <template #default="scope">
                <button
                  v-if="scope.row.Type === 1"
                  class="cloud-file-name cloud-file-name--folder"
                  type="button"
                  @click="on进入目录(scope.row)"
                >
                  <span class="cloud-file-icon cloud-file-icon--folder"><el-icon><Folder /></el-icon></span>
                  <span class="cloud-file-name-text">{{ scope.row.Name }}</span>
                </button>
                <div v-else class="cloud-file-name">
                  <span class="cloud-file-icon"><el-icon><Document /></el-icon></span>
                  <span class="cloud-file-name-text">{{ scope.row.Name }}</span>
                  <span v-if="on取扩展名(scope.row.Name)" class="cloud-file-extension">
                    {{ on取扩展名(scope.row.Name) }}
                  </span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="路径" min-width="240" class-name="cloud-column--path">
              <template #default="scope">
                <div class="cloud-path-cell">
                  <span>{{ scope.row.Path }}</span>
                  <el-tooltip content="复制路径" placement="top">
                    <button
                      class="cloud-inline-icon-button"
                      type="button"
                      aria-label="复制路径"
                      @click.stop="置剪辑版文本(scope.row.Path, '文件路径已复制')"
                    >
                      <el-icon><DocumentCopy /></el-icon>
                    </button>
                  </el-tooltip>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="大小" width="116" align="right">
              <template #default="scope">{{ scope.row.Type === 1 ? '--' : 字节转换(scope.row.Size) }}</template>
            </el-table-column>
            <el-table-column label="上传时间" width="176" class-name="cloud-column--updated-at">
              <template #default="scope">{{ scope.row.UpTime ? 时间_时间戳到时间(scope.row.UpTime) : '--' }}</template>
            </el-table-column>
            <el-table-column prop="MD5" label="ETag" min-width="220" class-name="cloud-column--etag" show-overflow-tooltip />
            <el-table-column label="操作" width="176" fixed="right" align="right">
              <template #default="scope">
                <div class="cloud-row-actions">
                  <template v-if="scope.row.Type === 1">
                    <el-button link type="primary" @click="on进入目录(scope.row)">打开</el-button>
                  </template>
                  <template v-else>
                    <el-tooltip content="下载" placement="top">
                      <button class="cloud-inline-action" type="button" aria-label="下载" @click="on单个下载(scope.row)">
                        <el-icon><Download /></el-icon>
                      </button>
                    </el-tooltip>
                    <el-tooltip content="复制外链" placement="top">
                      <button class="cloud-inline-action" type="button" aria-label="复制外链" @click="on打开外链设置(scope.row)">
                        <el-icon><Link /></el-icon>
                      </button>
                    </el-tooltip>
                  </template>
                  <el-dropdown trigger="click">
                    <button class="cloud-inline-action" type="button" aria-label="更多操作">
                      <el-icon><MoreFilled /></el-icon>
                    </button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item :icon="DocumentCopy" @click="置剪辑版文本(scope.row.Path, '文件路径已复制')">
                          复制路径
                        </el-dropdown-item>
                        <el-dropdown-item v-if="scope.row.Type === 2" :icon="EditPen" @click="on单个重命名(scope.row)">
                          重命名
                        </el-dropdown-item>
                        <el-dropdown-item v-if="scope.row.Type === 2" :icon="Delete" divided @click="on单个删除(scope.row)">
                          删除
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </template>
            </el-table-column>
            <template #empty>
              <div class="cloud-empty-state">
                <el-empty :description="搜索关键词 ? '没有匹配的文件' : '当前目录为空'">
                  <el-button v-if="搜索关键词" @click="搜索关键词 = ''">清空搜索</el-button>
                  <el-button v-else type="primary" :icon="Upload" @click="on打开上传界面()">上传文件</el-button>
                </el-empty>
              </div>
            </template>
          </el-table>

          <div v-else class="cloud-mobile-file-list" :class="{ 'is-loading': is加载中 }">
            <div v-if="!Data.List.length" class="cloud-empty-state">
              <el-empty :description="搜索关键词 ? '没有匹配的文件' : '当前目录为空'">
                <el-button v-if="搜索关键词" @click="搜索关键词 = ''">清空搜索</el-button>
                <el-button v-else type="primary" :icon="Upload" @click="on打开上传界面()">上传文件</el-button>
              </el-empty>
            </div>
            <article
              v-for="文件 in Data.List"
              v-else
              :key="文件.Path"
              class="cloud-mobile-file-row"
              :class="{ 'is-selected': on是否已选择(文件), 'is-folder': 文件.Type === 1 }"
              @dblclick="on行被双击(文件)"
            >
              <el-checkbox
                v-if="文件.Type === 2"
                :model-value="on是否已选择(文件)"
                :aria-label="`选择 ${文件.Name}`"
                @change="on切换移动端选择(文件)"
              />
              <span v-else class="cloud-mobile-checkbox-placeholder" />

              <button
                class="cloud-mobile-file-content"
                type="button"
                @click="文件.Type === 1 ? on进入目录(文件) : undefined"
              >
                <span class="cloud-file-icon" :class="{ 'cloud-file-icon--folder': 文件.Type === 1 }">
                  <el-icon><Folder v-if="文件.Type === 1" /><Document v-else /></el-icon>
                </span>
                <span class="cloud-mobile-file-copy">
                  <strong>{{ 文件.Name }}</strong>
                  <small>
                    {{ 文件.Type === 1 ? '文件夹' : 字节转换(文件.Size) }}
                    <template v-if="文件.UpTime"> · {{ 时间_时间戳到时间(文件.UpTime) }}</template>
                  </small>
                </span>
              </button>

              <el-dropdown trigger="click">
                <button class="cloud-icon-button" type="button" aria-label="更多操作">
                  <el-icon><MoreFilled /></el-icon>
                </button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-if="文件.Type === 1" :icon="FolderOpened" @click="on进入目录(文件)">打开</el-dropdown-item>
                    <el-dropdown-item v-if="文件.Type === 2" :icon="Download" @click="on单个下载(文件)">下载</el-dropdown-item>
                    <el-dropdown-item v-if="文件.Type === 2" :icon="Link" @click="on打开外链设置(文件)">复制外链</el-dropdown-item>
                    <el-dropdown-item :icon="DocumentCopy" @click="置剪辑版文本(文件.Path, '文件路径已复制')">复制路径</el-dropdown-item>
                    <el-dropdown-item v-if="文件.Type === 2" :icon="EditPen" @click="on单个重命名(文件)">重命名</el-dropdown-item>
                    <el-dropdown-item v-if="文件.Type === 2" :icon="Delete" divided @click="on单个删除(文件)">删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </article>
          </div>
        </template>

        <div v-if="!请求错误 && (Data.Count > 0 || 页码 > 1)" class="cloud-pagination">
          <span class="cloud-pagination-summary">共 {{ Data.Count }} 项</span>
          <el-pagination
            v-model:current-page="页码"
            v-model:page-size="每页数量"
            :page-sizes="[20, 50, 100]"
            :total="Data.Count"
            :layout="is移动端视图 ? 'prev, pager, next' : 'sizes, prev, pager, next'"
            background
            @current-change="on页码改变"
            @size-change="on每页数量改变"
          />
        </div>
      </main>
    </section>

    <div v-if="is拖拽中" class="cloud-drop-overlay" aria-live="polite">
      <el-icon><Upload /></el-icon>
      <strong>上传到 {{ 当前显示路径 }}</strong>
      <span>松开即可添加文件</span>
    </div>

    <uplode
      v-if="is显示上传界面"
      :path="Data.Path"
      :initial-files="待上传文件列表"
      @on对话框详细信息关闭="on上传界面关闭"
    />

    <el-dialog
      v-model="外链设置.is显示"
      title="复制文件外链"
      width="min(480px, calc(100vw - 24px))"
      class="cloud-link-dialog"
      append-to-body
      destroy-on-close
    >
      <div class="cloud-link-dialog-file">
        <el-icon><Document /></el-icon>
        <span>{{ 外链设置.文件?.Name }}</span>
      </div>
      <el-form label-position="top">
        <el-form-item label="有效期">
          <el-radio-group v-model="外链设置.有效秒数" class="cloud-link-presets">
            <el-radio-button :label="3600">1 小时</el-radio-button>
            <el-radio-button :label="86400">1 天</el-radio-button>
            <el-radio-button :label="604799">7 天</el-radio-button>
            <el-radio-button :label="-1">自定义</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="外链设置.有效秒数 === -1" label="自定义秒数">
          <el-input-number v-model="外链设置.自定义秒数" :min="60" :max="604799" controls-position="right" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="外链设置.is显示 = false">取消</el-button>
        <el-button type="primary" :loading="外链设置.is提交中" @click="on确认获取外链">生成并复制</el-button>
      </template>
    </el-dialog>

    <el-drawer
      v-model="is显示目录抽屉"
      title="目录"
      direction="ltr"
      size="86%"
      class="cloud-directory-drawer"
      append-to-body
    >
      <el-tree
        :data="树"
        :props="defaultProps"
        node-key="path"
        highlight-current
        :current-node-key="Data.Path"
        :default-expanded-keys="['']"
        :expand-on-click-node="false"
        @node-click="on移动端树节点点击"
      >
        <template #default="{ data }">
          <span class="cloud-tree-node">
            <el-icon><Folder /></el-icon>
            <span>{{ data.label }}</span>
          </span>
        </template>
      </el-tree>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Cloudy,
  Delete,
  Document,
  DocumentCopy,
  Download,
  EditPen,
  Files,
  Folder,
  FolderOpened,
  Link,
  Menu,
  MoreFilled,
  RefreshRight,
  Search,
  Upload,
  WarningFilled,
} from '@element-plus/icons-vue'
import { 时间_时间戳到时间, 置剪辑版文本, 置剪辑版文本2 } from '@/utils/utils'
import { Del批量删除, GetCloudStorageList, 文件移动, 下载, 获取外链 } from '@/api/云存储api'
import { GetInfoCloudStorage } from '@/api/系统设置api'
import { useTableHeight } from '@/composables/useTableHeight'
import uplode from './组件/云存储上传.vue'

interface 文件对象 {
  Name: string
  Path: string
  Type: number
  Size: number
  MD5: string
  UpTime: number
}

interface 目录节点 {
  label: string
  path: string
  children?: 目录节点[]
}

const 页面Ref = ref<HTMLElement>()
const elTreeRef = ref<any>()
const { tableRef, tableHeight, updateTableHeight } = useTableHeight(174)

const is加载中 = ref(false)
const is已完成首次加载 = ref(false)
const 请求错误 = ref('')
const is显示上传界面 = ref(false)
const is显示目录抽屉 = ref(false)
const is移动端视图 = ref(false)
const is拖拽中 = ref(false)
const 待上传文件列表 = ref<File[]>([])
const 搜索关键词 = ref('')
const 排序选项 = ref('Name:1')
const 页码 = ref(1)
const 每页数量 = ref(20)
const 表格被选中列表 = ref<文件对象[]>([])

const Data = reactive<{ Count: number; Path: string; List: 文件对象[] }>({
  Count: 0,
  Path: '',
  List: [],
})

const 存储信息 = reactive({
  provider: '云存储',
  bucket: '',
  rootPath: 'fnkuaiyan/',
})

const 树 = ref<目录节点[]>([{ label: 'fnkuaiyan', path: '', children: [] }])
const defaultProps = { children: 'children', label: 'label' }
const 外链设置 = reactive<{
  is显示: boolean
  is提交中: boolean
  文件?: 文件对象
  有效秒数: number
  自定义秒数: number
}>({
  is显示: false,
  is提交中: false,
  文件: undefined,
  有效秒数: 604799,
  自定义秒数: 3600,
})

let 局_搜索定时器: ReturnType<typeof setTimeout> | undefined
let 局_请求序号 = 0
let 局_拖拽层级 = 0
let 局_忽略搜索监听 = false
let 局_媒体查询: MediaQueryList | undefined

const 根目录名称 = computed(() => 存储信息.rootPath.replace(/^\/+|\/+$/g, '') || '云存储')
const 当前显示路径 = computed(() => (Data.Path ? `${根目录名称.value}/${Data.Path}` : 根目录名称.value))
const 已选择总大小 = computed(() => 表格被选中列表.value.reduce((局_总大小, 局_文件) => 局_总大小 + 局_文件.Size, 0))
const 面包屑列表 = computed(() => {
  const 局_目录片段 = Data.Path.split('/').filter(Boolean)
  let 局_累计路径 = ''
  return 局_目录片段.map((局_目录名) => {
    局_累计路径 += `${局_目录名}/`
    return { label: 局_目录名, path: 局_累计路径 }
  })
})

watch(
  搜索关键词,
  () => {
    if (局_忽略搜索监听) return
    if (局_搜索定时器) clearTimeout(局_搜索定时器)
    局_搜索定时器 = setTimeout(() => {
      页码.value = 1
      on读取列表()
    }, 250)
  },
  { flush: 'sync' },
)

const on读取存储配置 = async () => {
  const 局_返回 = await GetInfoCloudStorage({})
  if (!局_返回 || 局_返回.code !== 10000) {
    throw new Error(局_返回?.msg || '读取云存储配置失败')
  }
  const 局_当前选择 = 局_返回.data?.当前选择 || 1
  const 局_当前配置 = 局_当前选择 === 2 ? 局_返回.data?.七牛云对象存储 : 局_返回.data?.S3兼容协议
  存储信息.provider = 局_当前选择 === 2 ? '七牛云对象存储' : 'S3 兼容存储'
  存储信息.bucket = 局_当前配置?.Bucket || ''
  存储信息.rootPath = 局_当前配置?.rootPath || 'fnkuaiyan/'
  树.value[0].label = 根目录名称.value
}

const on读取列表 = async () => {
  const 局_当前请求序号 = ++局_请求序号
  is加载中.value = true
  请求错误.value = ''
  const [局_排序字段, 局_排序方式] = 排序选项.value.split(':')
  try {
    const 局_返回 = await GetCloudStorageList({
      Type: 2,
      Size: 每页数量.value,
      Page: 页码.value,
      Keywords: 搜索关键词.value.trim(),
      Path: Data.Path,
      Delimiter: '/',
      SortBy: 局_排序字段,
      Order: Number(局_排序方式),
    })
    if (局_当前请求序号 !== 局_请求序号) return
    if (!局_返回 || 局_返回.code !== 10000) {
      throw new Error(局_返回?.msg || '目录读取失败')
    }

    Data.List = Array.isArray(局_返回.data?.List) ? 局_返回.data.List : []
    Data.Count = Number(局_返回.data?.Count || 0)
    表格被选中列表.value = []
    if (!搜索关键词.value && 页码.value === 1) {
      on更新目录树(Data.Path, Data.List)
    }
    await nextTick()
    updateTableHeight()
  } catch (局_错误: any) {
    if (局_当前请求序号 !== 局_请求序号) return
    请求错误.value = 局_错误?.message || '目录读取失败，请检查存储配置或网络连接'
  } finally {
    if (局_当前请求序号 === 局_请求序号) {
      is加载中.value = false
      is已完成首次加载.value = true
    }
  }
}

const on更新目录树 = (路径: string, 文件列表: 文件对象[]) => {
  const 局_子目录 = 文件列表
    .filter((局_文件) => 局_文件.Type === 1)
    .map((局_文件) => ({ label: 局_文件.Name, path: 局_文件.Path, children: [] }))
  if (路径 === '') 树.value[0].children = 局_子目录
  elTreeRef.value?.updateKeyChildren(路径, 局_子目录)
  nextTick(() => elTreeRef.value?.setCurrentKey(路径))
}

const on切换目录 = async (路径: string) => {
  if (is加载中.value && 路径 === Data.Path) return
  局_忽略搜索监听 = true
  搜索关键词.value = ''
  局_忽略搜索监听 = false
  Data.Path = 路径 || ''
  页码.value = 1
  表格被选中列表.value = []
  await on读取列表()
}

const on树节点点击 = (节点: 目录节点) => on切换目录(节点.path)
const on移动端树节点点击 = async (节点: 目录节点) => {
  is显示目录抽屉.value = false
  await on切换目录(节点.path)
}
const on进入目录 = (文件: 文件对象) => on切换目录(文件.Path)
const on行被双击 = (文件: 文件对象) => {
  if (文件.Type === 1) on进入目录(文件)
  else on单个下载(文件)
}

const on排序改变 = () => {
  页码.value = 1
  on读取列表()
}
const on页码改变 = () => on读取列表()
const on每页数量改变 = () => {
  页码.value = 1
  on读取列表()
}

const on文件是否可选择 = (文件: 文件对象) => 文件.Type === 2
const on选择框被选择 = (文件列表: 文件对象[]) => {
  表格被选中列表.value = 文件列表
}
const on是否已选择 = (文件: 文件对象) => 表格被选中列表.value.some((局_文件) => 局_文件.Path === 文件.Path)
const on切换移动端选择 = (文件: 文件对象) => {
  if (on是否已选择(文件)) {
    表格被选中列表.value = 表格被选中列表.value.filter((局_文件) => 局_文件.Path !== 文件.Path)
  } else {
    表格被选中列表.value = [...表格被选中列表.value, 文件]
  }
}
const on清空选择 = () => {
  表格被选中列表.value = []
  ;(tableRef.value as any)?.clearSelection?.()
}

const on单个重命名 = (文件: 文件对象) => {
  ElMessageBox.prompt('新文件名不能包含 / 或 \\', '重命名文件', {
    confirmButtonText: '保存',
    cancelButtonText: '取消',
    inputValue: 文件.Name,
    inputValidator: (局_值) => {
      const 局_文件名 = String(局_值 || '').trim()
      if (!局_文件名) return '请输入文件名'
      if (/[\\/]/.test(局_文件名)) return '文件名不能包含 / 或 \\'
      return true
    },
  }).then(async ({ value }) => {
    const 局_文件名 = value.trim()
    if (局_文件名 === 文件.Name) return
    const 局_返回 = await 文件移动({ Path1: 文件.Path, Path2: Data.Path + 局_文件名 })
    if (局_返回?.code === 10000) {
      ElMessage.success('重命名成功')
      await on读取列表()
    }
  }).catch(() => undefined)
}

const on单个下载 = async (文件: 文件对象) => {
  const 局_返回 = await 下载({ Path: 文件.Path })
  if (局_返回?.code !== 10000 || !局_返回.data) return
  const 局_下载链接 = document.createElement('a')
  局_下载链接.href = 局_返回.data
  局_下载链接.download = 文件.Name
  局_下载链接.target = '_blank'
  局_下载链接.rel = 'noopener'
  局_下载链接.click()
}

const on打开外链设置 = (文件: 文件对象) => {
  外链设置.文件 = 文件
  外链设置.有效秒数 = 604799
  外链设置.自定义秒数 = 3600
  外链设置.is显示 = true
}

const on确认获取外链 = async () => {
  if (!外链设置.文件) return
  const 局_有效秒数 = 外链设置.有效秒数 === -1 ? 外链设置.自定义秒数 : 外链设置.有效秒数
  外链设置.is提交中 = true
  try {
    const 局_返回 = await 获取外链({ Path: 外链设置.文件.Path, LongTime: 局_有效秒数 })
    if (局_返回?.code === 10000) {
      置剪辑版文本2(局_返回.data, '文件外链已复制')
      外链设置.is显示 = false
    }
  } finally {
    外链设置.is提交中 = false
  }
}

const on删除文件列表 = async (文件列表: 文件对象[]) => {
  if (!文件列表.length) return
  const 局_是否批量 = 文件列表.length > 1
  await ElMessageBox.confirm(
    局_是否批量 ? `确定删除选中的 ${文件列表.length} 个文件吗？此操作无法撤销。` : `确定删除“${文件列表[0].Name}”吗？此操作无法撤销。`,
    局_是否批量 ? '批量删除文件' : '删除文件',
    { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning', confirmButtonClass: 'el-button--danger' },
  )
  const 局_返回 = await Del批量删除({ Path: 文件列表.map((局_文件) => 局_文件.Path) })
  if (局_返回?.code === 10000) {
    ElMessage.success(局_是否批量 ? `已删除 ${文件列表.length} 个文件` : '文件已删除')
    if (Data.List.length <= 文件列表.length && 页码.value > 1) 页码.value -= 1
    await on读取列表()
  }
}

const on单个删除 = (文件: 文件对象) => on删除文件列表([文件]).catch(() => undefined)
const on批量删除 = () => on删除文件列表([...表格被选中列表.value]).catch(() => undefined)

const on打开上传界面 = (文件列表: File[] = []) => {
  待上传文件列表.value = 文件列表
  is显示上传界面.value = true
}
const on上传界面关闭 = async (is重新读取: boolean) => {
  is显示上传界面.value = false
  待上传文件列表.value = []
  if (is重新读取) await on读取列表()
}

const on拖拽进入 = (事件: DragEvent) => {
  if (!事件.dataTransfer?.types.includes('Files')) return
  局_拖拽层级 += 1
  is拖拽中.value = true
}
const on拖拽离开 = () => {
  局_拖拽层级 = Math.max(0, 局_拖拽层级 - 1)
  if (局_拖拽层级 === 0) is拖拽中.value = false
}
const on文件被拖入 = (事件: DragEvent) => {
  局_拖拽层级 = 0
  is拖拽中.value = false
  const 局_文件列表 = Array.from(事件.dataTransfer?.files || [])
  if (局_文件列表.length) on打开上传界面(局_文件列表)
}

const on页面快捷键 = (事件: KeyboardEvent) => {
  const 局_目标 = 事件.target as HTMLElement
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(局_目标?.tagName) || 局_目标?.isContentEditable) return
  if ((事件.ctrlKey || 事件.metaKey) && 事件.key.toLowerCase() === 'a') {
    事件.preventDefault()
    if (is移动端视图.value) {
      表格被选中列表.value = Data.List.filter((局_文件) => 局_文件.Type === 2)
    } else {
      ;(tableRef.value as any)?.toggleAllSelection?.()
    }
  }
  if (事件.key === 'Escape') on清空选择()
}

const on媒体查询改变 = (事件: MediaQueryListEvent | MediaQueryList) => {
  is移动端视图.value = 事件.matches
  nextTick(updateTableHeight)
}

const on获取表格行类名 = ({ row }: { row: 文件对象 }) => (row.Type === 1 ? 'cloud-table-folder-row' : '')
const 字节转换 = (字节数: number) => {
  if (!Number.isFinite(字节数) || 字节数 <= 0) return '0 B'
  const 局_单位 = ['B', 'KB', 'MB', 'GB', 'TB']
  const 局_单位序号 = Math.min(Math.floor(Math.log(字节数) / Math.log(1024)), 局_单位.length - 1)
  const 局_数值 = 字节数 / 1024 ** 局_单位序号
  return `${局_数值 >= 100 || 局_单位序号 === 0 ? 局_数值.toFixed(0) : 局_数值.toFixed(1)} ${局_单位[局_单位序号]}`
}
const on取扩展名 = (文件名: string) => {
  const 局_扩展名 = 文件名.includes('.') ? 文件名.split('.').pop() || '' : ''
  return 局_扩展名.length <= 6 ? 局_扩展名.toUpperCase() : ''
}

onMounted(async () => {
  window.addEventListener('keydown', on页面快捷键)
  局_媒体查询 = window.matchMedia('(max-width: 767px)')
  on媒体查询改变(局_媒体查询)
  局_媒体查询.addEventListener('change', on媒体查询改变)
  try {
    await on读取存储配置()
    await on读取列表()
  } catch (局_错误: any) {
    请求错误.value = 局_错误?.message || '云存储初始化失败'
    is已完成首次加载.value = true
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', on页面快捷键)
  局_媒体查询?.removeEventListener('change', on媒体查询改变)
  if (局_搜索定时器) clearTimeout(局_搜索定时器)
})
</script>

<style scoped lang="scss">
:global(:root) {
  --cloud-bg: #f4f6f8;
  --cloud-surface: #ffffff;
  --cloud-surface-alt: #f8fafc;
  --cloud-surface-hover: #f1f5f9;
  --cloud-surface-active: #eaf2ff;
  --cloud-border: #dfe4ea;
  --cloud-border-strong: #c7d0da;
  --cloud-border-hover: #94a3b8;
  --cloud-text: #172033;
  --cloud-text-secondary: #526071;
  --cloud-text-tertiary: #7b8798;
  --cloud-text-inverse: #ffffff;
  --cloud-accent: #2563eb;
  --cloud-accent-hover: #1d4ed8;
  --cloud-accent-active: #1e40af;
  --cloud-accent-soft: #eaf2ff;
  --cloud-success: #16875c;
  --cloud-success-soft: #e8f7f0;
  --cloud-warning: #b86109;
  --cloud-warning-soft: #fff4df;
  --cloud-error: #c73535;
  --cloud-error-hover: #a92d2d;
  --cloud-error-soft: #fff0f0;
  --cloud-info: #0f7490;
  --cloud-info-soft: #e8f7fb;
  --cloud-surface-rgb: 255, 255, 255;
  --cloud-text-rgb: 23, 32, 51;
  --cloud-accent-rgb: 37, 99, 235;
}

:global(.cloud-directory-drawer) {
  max-width: 320px;
}

.cloud-storage-page {
  --el-color-primary: var(--cloud-accent);
  --el-color-danger: var(--cloud-error);
  position: relative;
  min-width: 0;
  min-height: calc(100vh - 100px);
  padding: 20px 24px 24px;
  overflow: hidden;
  background: var(--cloud-bg);
  color: var(--cloud-text);
  font-family: 'Noto Sans SC', 'Inter', 'Microsoft YaHei', sans-serif;
  font-size: 15px;
  line-height: 1.7;
  letter-spacing: 0;
  animation: cloud-page-enter 220ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.cloud-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 60px;
  margin-bottom: 16px;
}

.cloud-title-group,
.cloud-header-meta,
.cloud-bulk-summary,
.cloud-row-actions,
.cloud-path-cell,
.cloud-link-dialog-file {
  display: flex;
  align-items: center;
}

.cloud-title-group {
  min-width: 0;
  gap: 12px;

  h1 {
    margin: 0;
    font-size: 22px;
    font-weight: 600;
    line-height: 1.45;
    letter-spacing: 0;
  }

  p {
    margin: 2px 0 0;
    overflow: hidden;
    color: var(--cloud-text-secondary);
    font-size: 13px;
    line-height: 1.6;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.cloud-title-icon {
  display: grid;
  flex: 0 0 42px;
  inline-size: 42px;
  block-size: 42px;
  place-items: center;
  border: 1px solid var(--cloud-border);
  border-radius: 8px;
  background: var(--cloud-surface);
  color: var(--cloud-accent);
  box-shadow: 0 1px 2px rgba(var(--cloud-text-rgb), 0.04);
  font-size: 22px;
}

.cloud-header-meta {
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.cloud-workspace {
  display: grid;
  grid-template-columns: minmax(220px, 248px) minmax(0, 1fr);
  min-width: 0;
  min-height: calc(100vh - 196px);
  overflow: hidden;
  border: 1px solid var(--cloud-border);
  border-radius: 8px;
  background: var(--cloud-surface);
  box-shadow: 0 1px 2px rgba(var(--cloud-text-rgb), 0.04);
  transition: border-color 180ms ease, box-shadow 180ms ease;

  &:hover {
    border-color: var(--cloud-border-strong);
  }

  &:focus-within {
    border-color: var(--cloud-border-strong);
    box-shadow: 0 0 0 3px rgba(var(--cloud-accent-rgb), 0.08);
  }
}

.cloud-sidebar {
  min-width: 0;
  border-right: 1px solid var(--cloud-border);
  background: var(--cloud-surface-alt);
}

.cloud-sidebar-header,
.cloud-pathbar,
.cloud-toolbar,
.cloud-pagination {
  display: flex;
  align-items: center;
}

.cloud-sidebar-header {
  justify-content: space-between;
  min-height: 52px;
  padding: 8px 12px 8px 16px;
  border-bottom: 1px solid var(--cloud-border);
  color: var(--cloud-text);
  font-size: 13px;
  font-weight: 600;
}

.cloud-tree-scrollbar {
  height: calc(100vh - 249px);
}

.cloud-tree {
  padding: 8px;
  background: transparent;

  :deep(.el-tree-node__content) {
    min-height: 38px;
    border-radius: 5px;
    transition: background-color 150ms ease, color 150ms ease;
  }

  :deep(.el-tree-node__content:hover) {
    background: var(--cloud-surface-hover);
  }

  :deep(.el-tree-node.is-current > .el-tree-node__content) {
    background: var(--cloud-accent-soft);
    color: var(--cloud-accent);
  }
}

.cloud-tree-node {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.cloud-main {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.cloud-pathbar {
  min-height: 52px;
  gap: 8px;
  padding: 8px 12px 8px 16px;
  border-bottom: 1px solid var(--cloud-border);
}

.cloud-breadcrumb {
  min-width: 0;
  flex: 1;
  overflow: hidden;

  :deep(.el-breadcrumb__item) {
    float: none;
  }
}

.cloud-breadcrumb-link {
  max-width: 180px;
  padding: 4px 6px;
  overflow: hidden;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: var(--cloud-text-secondary);
  font: inherit;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 150ms ease, color 150ms ease;

  &:hover {
    background: var(--cloud-surface-hover);
    color: var(--cloud-text);
  }

  &[aria-current='page'] {
    color: var(--cloud-text);
    font-weight: 600;
  }

  &:focus-visible {
    outline: 2px solid var(--cloud-accent);
    outline-offset: 1px;
  }
}

.cloud-mobile-menu {
  display: none;
}

.cloud-copy-path {
  flex: 0 0 36px;
}

.cloud-toolbar {
  min-height: 56px;
  gap: 8px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--cloud-border);
  background: var(--cloud-surface);
}

.cloud-bulk-toolbar {
  background: var(--cloud-accent-soft);
}

.cloud-bulk-summary {
  gap: 8px;
  color: var(--cloud-accent);
  font-weight: 600;
}

.cloud-muted {
  color: var(--cloud-text-secondary);
  font-size: 13px;
  font-weight: 400;
}

.cloud-toolbar-spacer {
  min-width: 8px;
  flex: 1;
}

.cloud-search {
  width: min(320px, 32vw);
}

.cloud-sort-select {
  width: 150px;
}

.cloud-icon-button,
.cloud-inline-icon-button,
.cloud-inline-action {
  display: inline-grid;
  place-items: center;
  padding: 0;
  border: 1px solid transparent;
  background: transparent;
  color: var(--cloud-text-secondary);
  cursor: pointer;
  transition: background-color 160ms ease, border-color 160ms ease, color 160ms ease, transform 120ms ease;

  &:hover {
    border-color: var(--cloud-border);
    background: var(--cloud-surface-hover);
    color: var(--cloud-text);
  }

  &:active {
    transform: translateY(1px);
    background: var(--cloud-surface-active);
  }

  &:focus-visible {
    outline: 2px solid var(--cloud-accent);
    outline-offset: 2px;
  }

  &:disabled {
    color: var(--cloud-text-tertiary);
    cursor: not-allowed;
    opacity: 0.52;
    transform: none;
  }
}

.cloud-icon-button {
  inline-size: 36px;
  block-size: 36px;
  flex: 0 0 36px;
  border-radius: 6px;
}

.cloud-inline-icon-button {
  inline-size: 28px;
  block-size: 28px;
  flex: 0 0 28px;
  border-radius: 5px;
}

.cloud-inline-action {
  inline-size: 32px;
  block-size: 32px;
  border-radius: 5px;
  font-size: 16px;
}

.cloud-table {
  flex: 1;

  :deep(.el-table__header th) {
    height: 44px;
    background: var(--cloud-surface-alt);
    color: var(--cloud-text-secondary);
    font-size: 13px;
    font-weight: 600;
  }

  :deep(.el-table__row) {
    height: 54px;
    color: var(--cloud-text-secondary);
    transition: background-color 140ms ease;
  }

  :deep(.el-table__row:hover > td.el-table__cell) {
    background: var(--cloud-surface-hover);
  }

  :deep(.cloud-table-folder-row .cloud-file-name-text) {
    color: var(--cloud-text);
    font-weight: 600;
  }
}

.cloud-file-name {
  display: flex;
  min-width: 0;
  width: 100%;
  align-items: center;
  gap: 10px;
  border: 0;
  background: transparent;
  color: var(--cloud-text);
  font: inherit;
  text-align: left;

  &--folder {
    border-radius: 5px;
    cursor: pointer;

    &:hover .cloud-file-name-text {
      color: var(--cloud-accent);
      text-decoration: underline;
      text-underline-offset: 3px;
    }

    &:focus-visible {
      outline: 2px solid var(--cloud-accent);
      outline-offset: 2px;
    }
  }
}

.cloud-file-icon {
  display: grid;
  inline-size: 32px;
  block-size: 32px;
  flex: 0 0 32px;
  place-items: center;
  border-radius: 6px;
  background: var(--cloud-surface-alt);
  color: var(--cloud-text-secondary);

  &--folder {
    background: var(--cloud-warning-soft);
    color: var(--cloud-warning);
  }
}

.cloud-file-name-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.cloud-file-extension {
  flex: 0 0 auto;
  padding: 1px 6px;
  border: 1px solid var(--cloud-border);
  border-radius: 999px;
  background: var(--cloud-surface-alt);
  color: var(--cloud-text-tertiary);
  font-size: 11px;
  line-height: 1.7;
  letter-spacing: 0;
}

.cloud-path-cell {
  min-width: 0;
  gap: 4px;
  font-family: 'Inter', monospace;
  font-size: 13px;
  font-variant-numeric: tabular-nums;

  span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.cloud-row-actions {
  justify-content: flex-end;
  gap: 2px;
}

.cloud-skeleton {
  min-height: 420px;
  padding: 24px;
}

.cloud-state {
  display: flex;
  min-height: 240px;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 24px;

  &--error {
    color: var(--cloud-error);

    > .el-icon {
      font-size: 30px;
    }

    strong {
      color: var(--cloud-text);
    }

    p {
      margin: 2px 0 0;
      color: var(--cloud-text-secondary);
    }
  }
}

.cloud-empty-state {
  display: grid;
  min-height: 320px;
  place-items: center;
}

.cloud-pagination {
  justify-content: flex-end;
  gap: 16px;
  min-height: 58px;
  padding: 8px 16px;
  border-top: 1px solid var(--cloud-border);
}

.cloud-pagination-summary {
  margin-right: auto;
  color: var(--cloud-text-secondary);
  font-size: 13px;
}

.cloud-mobile-file-list {
  display: none;
}

.cloud-drop-overlay {
  position: absolute;
  z-index: 40;
  inset: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  border: 2px dashed var(--cloud-accent);
  border-radius: 8px;
  background: rgba(var(--cloud-surface-rgb), 0.96);
  color: var(--cloud-accent);
  pointer-events: none;

  .el-icon {
    font-size: 42px;
  }

  span {
    color: var(--cloud-text-secondary);
  }
}

.cloud-link-dialog-file {
  gap: 8px;
  margin-bottom: 16px;
  padding: 10px 12px;
  border: 1px solid var(--cloud-border);
  border-radius: 6px;
  background: var(--cloud-surface-alt);
  color: var(--cloud-text-secondary);

  span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.cloud-link-presets {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(4, minmax(0, 1fr));

  :deep(.el-radio-button__inner) {
    width: 100%;
  }
}

.cloud-refresh-icon.is-loading {
  animation: cloud-spin 700ms linear infinite;
}

@keyframes cloud-page-enter {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes cloud-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1199px) {
  .cloud-storage-page {
    padding: 16px;
  }

  .cloud-workspace {
    grid-template-columns: 220px minmax(0, 1fr);
  }

  .cloud-toolbar {
    flex-wrap: wrap;
  }

  .cloud-search {
    min-width: 220px;
    flex: 1 1 220px;
  }
}

@media (max-width: 767px) {
  .cloud-storage-page {
    min-height: calc(100dvh - 72px);
    padding: 12px;
    overflow: visible;
  }

  .cloud-page-header {
    align-items: flex-start;
    margin-bottom: 12px;
  }

  .cloud-header-meta {
    max-width: 44%;
  }

  .cloud-title-group p {
    max-width: 52vw;
  }

  .cloud-workspace {
    display: block;
    min-height: calc(100dvh - 162px);
  }

  .cloud-sidebar {
    display: none;
  }

  .cloud-mobile-menu {
    display: inline-grid;
  }

  .cloud-pathbar {
    padding: 8px 10px;
  }

  .cloud-breadcrumb-link {
    max-width: 104px;
  }

  .cloud-toolbar {
    min-height: auto;
    padding: 10px 12px;
  }

  .cloud-toolbar > .el-button {
    min-height: 44px;
  }

  .cloud-icon-button {
    inline-size: 44px;
    block-size: 44px;
    flex-basis: 44px;
  }

  .cloud-copy-path {
    inline-size: 36px;
    block-size: 36px;
    flex-basis: 36px;
  }

  .cloud-search {
    min-width: 100%;
    width: 100%;
    flex-basis: 100%;
    order: 10;

    :deep(.el-input__wrapper) {
      min-height: 44px;
    }
  }

  .cloud-sort-select {
    min-width: 0;
    flex: 1;

    :deep(.el-input__wrapper),
    :deep(.el-select__wrapper) {
      min-height: 44px;
    }
  }

  .cloud-table {
    display: none;
  }

  .cloud-mobile-file-list {
    display: block;
    min-height: 240px;
    opacity: 1;
    transition: opacity 160ms ease;

    &.is-loading {
      opacity: 0.58;
      pointer-events: none;
    }
  }

  .cloud-mobile-file-row {
    display: grid;
    min-height: 76px;
    align-items: center;
    grid-template-columns: 24px minmax(0, 1fr) 44px;
    gap: 8px;
    padding: 10px 12px;
    border-bottom: 1px solid var(--cloud-border);
    background: var(--cloud-surface);
    transition: background-color 140ms ease;

    &.is-selected {
      background: var(--cloud-surface-active);
    }
  }

  .cloud-mobile-checkbox-placeholder {
    inline-size: 24px;
  }

  .cloud-mobile-file-content {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 10px;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--cloud-text);
    font: inherit;
    text-align: left;

    &:focus-visible {
      outline: 2px solid var(--cloud-accent);
      outline-offset: 2px;
      border-radius: 5px;
    }
  }

  .cloud-mobile-file-copy {
    display: flex;
    min-width: 0;
    flex-direction: column;

    strong {
      overflow: hidden;
      font-size: 15px;
      font-weight: 500;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    small {
      overflow: hidden;
      color: var(--cloud-text-tertiary);
      font-size: 12px;
      font-variant-numeric: tabular-nums;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .cloud-pagination {
    position: sticky;
    bottom: 0;
    min-height: 58px;
    justify-content: center;
    padding: 8px;
    background: var(--cloud-surface);
  }

  .cloud-pagination-summary {
    display: none;
  }

  .cloud-bulk-toolbar {
    position: sticky;
    z-index: 5;
    bottom: max(8px, env(safe-area-inset-bottom));
    flex-wrap: nowrap;
  }

  .cloud-bulk-summary .cloud-muted {
    display: none;
  }

  .cloud-link-presets {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;

    :deep(.el-radio-button__inner) {
      border: 1px solid var(--cloud-border);
      border-radius: 6px;
    }
  }
}

@media (max-width: 420px) {
  .cloud-header-meta .el-tag:first-child {
    display: none;
  }

  .cloud-title-icon {
    display: none;
  }

  .cloud-bulk-summary {
    min-width: 0;
    flex: 1;

    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .cloud-storage-page,
  .cloud-refresh-icon.is-loading,
  .cloud-mobile-file-list,
  .cloud-icon-button,
  .cloud-inline-icon-button,
  .cloud-inline-action,
  .cloud-file-row {
    animation: none !important;
    transition-duration: 0.01ms !important;
    transform: none !important;
  }
}
</style>
