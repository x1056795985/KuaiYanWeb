<template>
  <el-dialog
    v-model="is显示"
    title="上传文件"
    width="min(720px, calc(100vw - 24px))"
    class="cloud-upload-dialog"
    append-to-body
    destroy-on-close
    :close-on-click-modal="!is上传中"
    :before-close="on请求关闭"
    @closed="on关闭完成"
  >
    <div class="cloud-upload-path">
      <el-icon><FolderOpened /></el-icon>
      <div>
        <span>上传到</span>
        <strong>{{ 当前显示路径 }}</strong>
      </div>
    </div>

    <el-upload
      ref="uploadRef"
      class="cloud-upload-dropzone"
      drag
      multiple
      :show-file-list="false"
      :http-request="on自定义上传方法"
      :on-change="on文件加入"
      :auto-upload="true"
    >
      <el-icon class="cloud-upload-main-icon"><UploadFilled /></el-icon>
      <div class="cloud-upload-title">拖放文件到这里，或点击选择</div>
      <div class="cloud-upload-subtitle">文件将上传到当前目录</div>
    </el-upload>

    <div v-if="上传任务列表.length" class="cloud-upload-tasks" aria-live="polite">
      <div class="cloud-upload-task-header">
        <span>上传任务</span>
        <span>{{ 已成功数量 }} / {{ 上传任务列表.length }} 完成</span>
      </div>
      <el-scrollbar max-height="280px">
        <article v-for="任务 in 上传任务列表" :key="任务.uid" class="cloud-upload-task">
          <span class="cloud-upload-file-icon" :class="`is-${任务.status}`">
            <el-icon>
              <CircleCheckFilled v-if="任务.status === 'success'" />
              <WarningFilled v-else-if="任务.status === 'error'" />
              <Document v-else />
            </el-icon>
          </span>
          <div class="cloud-upload-task-content">
            <div class="cloud-upload-task-line">
              <strong>{{ 任务.name }}</strong>
              <span>{{ 字节转换(任务.size) }}</span>
            </div>
            <el-progress
              v-if="任务.status === 'uploading'"
              :percentage="任务.percent"
              :stroke-width="5"
              :show-text="false"
            />
            <small v-else-if="任务.status === 'error'" class="cloud-upload-error">{{ 任务.error }}</small>
            <small v-else-if="任务.status === 'success'" class="cloud-upload-success">
              上传完成
              <template v-if="任务.ETag">，ETag: {{ 任务.ETag }}</template>
              <template v-if="任务.ETag"><el-tooltip v-if="任务.status === 'success' && 任务.ETag" content="复制 ETag" placement="top">
                <el-button
                    class="cloud-upload-copy-etag"
                    circle
                    text
                    :icon="DocumentCopy"
                    aria-label="复制 ETag"
                    @click="置剪辑版文本(任务.ETag, 'ETag 已复制')"
                />
              </el-tooltip></template>

              <template v-else-if="任务.ETag错误">，ETag 获取失败</template>
              <template v-else>，正在获取 ETag...</template>
            </small>
            <small v-else>等待上传</small>
          </div>

          <el-button
            v-if="任务.status === 'error'"
            link
            type="primary"
            :icon="RefreshRight"
            @click="on重试上传(任务)"
          >
            重试
          </el-button>
        </article>
      </el-scrollbar>
    </div>

    <template #footer>
      <div class="cloud-upload-footer">
        <span v-if="上传任务列表.length" class="cloud-upload-summary">
          <template v-if="is上传中">正在上传 {{ 上传中数量 }} 个文件</template>
          <template v-else-if="失败数量">{{ 失败数量 }} 个文件上传失败</template>
          <template v-else>全部任务已完成</template>
        </span>
        <span v-else />
        <el-button :disabled="is上传中" @click="on请求关闭(() => (is显示 = false))">
          {{ is上传中 ? '上传中' : '关闭' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import axios from 'axios'
import { ElMessageBox, type UploadFile, type UploadRequestOptions } from 'element-plus'
import {
  CircleCheckFilled,
  Document,
  DocumentCopy,
  FolderOpened,
  RefreshRight,
  UploadFilled,
  WarningFilled,
} from '@element-plus/icons-vue'
import { GetETag, GetUpToken } from '@/api/云存储api'
import { 置剪辑版文本 } from '@/utils/utils'

type 上传状态 = 'waiting' | 'uploading' | 'success' | 'error'

interface 上传任务 {
  uid: string
  name: string
  size: number
  percent: number
  status: 上传状态
  error: string
  path: string
  ETag: string
  ETag错误: string
  raw: File
}

interface 上传凭证 {
  Path: string
  Type: number
  Url: string
  UpToken: string
}

const Props = withDefaults(defineProps<{
  path?: string
  initialFiles?: File[]
}>(), {
  path: '',
  initialFiles: () => [],
})

const emit = defineEmits<{
  (事件: 'on对话框详细信息关闭', is重新读取: boolean): void
}>()

const is显示 = ref(true)
const uploadRef = ref<any>()
const 上传任务列表 = ref<上传任务[]>([])
const is已通知关闭 = ref(false)

const 规范路径 = computed(() => {
  const 局_路径 = String(Props.path || '').trim().replace(/^\/+/, '')
  return 局_路径 && !局_路径.endsWith('/') ? `${局_路径}/` : 局_路径
})
const 当前显示路径 = computed(() => 规范路径.value || '根目录')
const 上传中数量 = computed(() => 上传任务列表.value.filter((局_任务) => 局_任务.status === 'uploading').length)
const 已成功数量 = computed(() => 上传任务列表.value.filter((局_任务) => 局_任务.status === 'success').length)
const 失败数量 = computed(() => 上传任务列表.value.filter((局_任务) => 局_任务.status === 'error').length)
const is上传中 = computed(() => 上传中数量.value > 0)

const on确保任务存在 = (文件: File) => {
  const 局_uid = String((文件 as any).uid || `${文件.name}-${文件.size}-${文件.lastModified}`)
  let 局_任务 = 上传任务列表.value.find((局_现有任务) => 局_现有任务.uid === 局_uid)
  if (!局_任务) {
    局_任务 = {
      uid: 局_uid,
      name: 文件.name,
      size: 文件.size,
      percent: 0,
      status: 'waiting',
      error: '',
      path: '',
      ETag: '',
      ETag错误: '',
      raw: 文件,
    }
    上传任务列表.value.push(局_任务)
  }
  return 局_任务
}

const on文件加入 = (上传文件: UploadFile) => {
  if (上传文件.raw) on确保任务存在(上传文件.raw)
}

const on执行上传 = async (
  文件: File,
  回调?: Pick<UploadRequestOptions, 'onProgress' | 'onSuccess' | 'onError'>,
) => {
  const 局_任务 = on确保任务存在(文件)
  局_任务.status = 'uploading'
  局_任务.percent = 0
  局_任务.error = ''
  局_任务.path = ''
  局_任务.ETag = ''
  局_任务.ETag错误 = ''

  try {
    const 局_文件路径 = 规范路径.value + 文件.name
    const 局_凭证返回 = await GetUpToken({ Path: 局_文件路径 })
    if (!局_凭证返回 || 局_凭证返回.code !== 10000) {
      throw new Error(局_凭证返回?.msg || '获取上传凭证失败')
    }
    const 局_凭证 = 局_凭证返回.data as 上传凭证
    const 局_进度回调 = (局_事件: any) => {
      const 局_总大小 = Number(局_事件.total || 文件.size || 1)
      局_任务.percent = Math.min(100, Math.round((局_事件.loaded * 100) / 局_总大小))
      回调?.onProgress({ percent: 局_任务.percent } as any)
    }

    if (局_凭证.Type === 1) {
      await axios.put(局_凭证.Url, 文件, {
        headers: { 'Content-Type': 文件.type || 'application/octet-stream' },
        onUploadProgress: 局_进度回调,
      })
    } else if (局_凭证.Type === 2) {
      const 局_表单数据 = new FormData()
      局_表单数据.append('file', 文件)
      局_表单数据.append('token', 局_凭证.UpToken)
      局_表单数据.append('key', 局_凭证.Path)
      await axios.post(局_凭证.Url, 局_表单数据, { onUploadProgress: 局_进度回调 })
    } else {
      throw new Error('不支持的云存储上传类型')
    }

    局_任务.percent = 100
    局_任务.status = 'success'
    局_任务.path = 局_文件路径
    回调?.onSuccess({ code: 10000 })
    void on查询ETag(局_任务)
  } catch (局_错误: any) {
    局_任务.status = 'error'
    局_任务.error = 局_错误?.message || '上传失败，请稍后重试'
    ;(回调?.onError as any)?.(局_错误 instanceof Error ? 局_错误 : new Error(局_任务.error))
  }
}

const on查询ETag = async (任务: 上传任务) => {
  try {
    const 局_返回 = await GetETag({ path: 任务.path })
    if (!局_返回 || 局_返回.code !== 10000 || !局_返回.data) {
      throw new Error(局_返回?.msg || '未获取到 ETag')
    }
    任务.ETag = String(局_返回.data)
  } catch (局_错误: any) {
    任务.ETag错误 = 局_错误?.message || '获取失败'
  }
}

const on自定义上传方法 = (选项: UploadRequestOptions) => {
  return on执行上传(选项.file, 选项)
}

const on重试上传 = (任务: 上传任务) => on执行上传(任务.raw)

const on请求关闭 = async (done: () => void) => {
  if (is上传中.value) {
    try {
      await ElMessageBox.confirm('仍有文件正在上传，关闭后本次任务可能中断。', '关闭上传窗口', {
        confirmButtonText: '仍然关闭',
        cancelButtonText: '继续上传',
        type: 'warning',
      })
    } catch {
      return
    }
  }
  done()
}

const on关闭完成 = () => {
  if (is已通知关闭.value) return
  is已通知关闭.value = true
  emit('on对话框详细信息关闭', 已成功数量.value > 0)
}

const 字节转换 = (字节数: number) => {
  if (!Number.isFinite(字节数) || 字节数 <= 0) return '0 B'
  const 局_单位 = ['B', 'KB', 'MB', 'GB', 'TB']
  const 局_单位序号 = Math.min(Math.floor(Math.log(字节数) / Math.log(1024)), 局_单位.length - 1)
  const 局_数值 = 字节数 / 1024 ** 局_单位序号
  return `${局_数值 >= 100 || 局_单位序号 === 0 ? 局_数值.toFixed(0) : 局_数值.toFixed(1)} ${局_单位[局_单位序号]}`
}

onMounted(async () => {
  is显示.value = true
  if (!Props.initialFiles.length) return
  await nextTick()
  for (const 局_文件 of Props.initialFiles) {
    on确保任务存在(局_文件)
    void on执行上传(局_文件)
  }
})
</script>

<style scoped lang="scss">
:global(:root) {
  --cloud-surface: #ffffff;
  --cloud-surface-alt: #f8fafc;
  --cloud-surface-hover: #f1f5f9;
  --cloud-border: #dfe4ea;
  --cloud-border-strong: #c7d0da;
  --cloud-text: #172033;
  --cloud-text-secondary: #526071;
  --cloud-text-tertiary: #7b8798;
  --cloud-accent: #2563eb;
  --cloud-accent-soft: #eaf2ff;
  --cloud-success: #16875c;
  --cloud-success-soft: #e8f7f0;
  --cloud-error: #c73535;
  --cloud-error-soft: #fff0f0;
}

.cloud-upload-path {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding: 10px 12px;
  border: 1px solid var(--cloud-border);
  border-radius: 6px;
  background: var(--cloud-surface-alt);
  color: var(--cloud-text-secondary);

  > .el-icon {
    flex: 0 0 auto;
    color: var(--cloud-accent);
    font-size: 22px;
  }

  div {
    display: flex;
    min-width: 0;
    flex-direction: column;
  }

  span {
    font-size: 12px;
  }

  strong {
    overflow: hidden;
    color: var(--cloud-text);
    font-size: 14px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.cloud-upload-dropzone {
  :deep(.el-upload) {
    width: 100%;
  }

  :deep(.el-upload-dragger) {
    width: 100%;
    min-height: 196px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    border: 1px dashed var(--cloud-border-strong);
    border-radius: 8px;
    background: var(--cloud-surface-alt);
    transition: border-color 160ms ease, background-color 160ms ease;

    &:hover,
    &:focus-visible {
      border-color: var(--cloud-accent);
      background: var(--cloud-accent-soft);
    }
  }
}

.cloud-upload-main-icon {
  margin-bottom: 10px;
  color: var(--cloud-accent);
  font-size: 40px;
}

.cloud-upload-title {
  color: var(--cloud-text);
  font-size: 15px;
  font-weight: 600;
}

.cloud-upload-subtitle {
  margin-top: 4px;
  color: var(--cloud-text-tertiary);
  font-size: 13px;
}

.cloud-upload-tasks {
  margin-top: 18px;
  border: 1px solid var(--cloud-border);
  border-radius: 8px;
  overflow: hidden;
}

.cloud-upload-task-header,
.cloud-upload-task,
.cloud-upload-task-line,
.cloud-upload-footer {
  display: flex;
  align-items: center;
}

.cloud-upload-task-header {
  justify-content: space-between;
  min-height: 42px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--cloud-border);
  background: var(--cloud-surface-alt);
  color: var(--cloud-text);
  font-size: 13px;
  font-weight: 600;

  span:last-child {
    color: var(--cloud-text-tertiary);
    font-weight: 400;
  }
}

.cloud-upload-task {
  min-height: 66px;
  gap: 10px;
  padding: 9px 12px;
  border-bottom: 1px solid var(--cloud-border);
  background: var(--cloud-surface);

  &:last-child {
    border-bottom: 0;
  }
}

.cloud-upload-file-icon {
  display: grid;
  inline-size: 34px;
  block-size: 34px;
  flex: 0 0 34px;
  place-items: center;
  border-radius: 6px;
  background: var(--cloud-surface-alt);
  color: var(--cloud-text-secondary);

  &.is-success {
    background: var(--cloud-success-soft);
    color: var(--cloud-success);
  }

  &.is-error {
    background: var(--cloud-error-soft);
    color: var(--cloud-error);
  }
}

.cloud-upload-task-content {
  min-width: 0;
  flex: 1;

  small {
    color: var(--cloud-text-tertiary);
    font-size: 12px;
  }
}

.cloud-upload-task-line {
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 3px;

  strong {
    min-width: 0;
    overflow: hidden;
    color: var(--cloud-text);
    font-size: 13px;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    flex: 0 0 auto;
    color: var(--cloud-text-tertiary);
    font-size: 12px;
  }
}

.cloud-upload-error {
  color: var(--cloud-error) !important;
}

.cloud-upload-success {
  color: var(--cloud-success) !important;
}

.cloud-upload-copy-etag {
  flex: 0 0 auto;
  color: var(--cloud-text-secondary);

  &:hover,
  &:focus-visible {
    color: var(--cloud-accent);
  }
}

.cloud-upload-footer {
  justify-content: space-between;
  gap: 12px;
}

.cloud-upload-summary {
  color: var(--cloud-text-secondary);
  font-size: 13px;
}

@media (max-width: 600px) {
  .cloud-upload-dropzone :deep(.el-upload-dragger) {
    min-height: 168px;
  }

  .cloud-upload-task {
    min-height: 72px;
  }

  .cloud-upload-task > .el-button {
    min-height: 44px;
  }

  .cloud-upload-footer > .el-button {
    min-width: 88px;
    min-height: 44px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cloud-upload-dropzone :deep(.el-upload-dragger) {
    transition-duration: 0.01ms !important;
  }
}
</style>
