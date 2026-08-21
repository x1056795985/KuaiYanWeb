<template>
  <!-- 悬浮按钮 -->
  <div v-if="!isOpen" class="mon-ai-fab" title="监控诊断助手" @click="on打开">
    <img :src="logoImg" alt="AI" class="mon-ai-fab-img" />
    <span class="mon-ai-fab-tip">监控诊断助手</span>
  </div>

  <!-- 悬浮可拖动面板 -->
  <div v-if="isOpen" ref="panelRef" class="mon-ai-panel" :style="panelStyle">
    <div class="mon-ai-header" @mousedown="on拖动开始($event, 'mouse')" @touchstart="on拖动开始($event, 'touch')">
      <div class="mon-ai-title">
        <img :src="logoImg" class="mon-ai-title-logo" />
        <span>监控诊断助手</span>
      </div>
      <div class="mon-ai-header-actions">
        <el-tooltip content="AI设置" placement="top">
          <el-icon class="mon-ai-icon-btn" @click="on去配置"><Setting /></el-icon>
        </el-tooltip>
        <el-tooltip content="清空对话" placement="top">
          <el-icon class="mon-ai-icon-btn" @click="on清空对话"><Delete /></el-icon>
        </el-tooltip>
        <el-tooltip content="收起" placement="top">
          <el-icon class="mon-ai-icon-btn" @click="on关闭"><Close /></el-icon>
        </el-tooltip>
      </div>
    </div>

    <!-- 未配置 API Key -->
    <div v-if="!hasApiKey" class="mon-ai-nokey">
      <el-icon :size="28" color="#e6a23c"><WarningFilled /></el-icon>
      <p class="nokey-title">未检测到 AI API Key</p>
      <p class="nokey-sub">请先到 系统设置 → AI配置 填写 OpenAI 兼容接口与 Key</p>
      <el-button size="small" type="primary" @click="on去配置">去系统设置配置</el-button>
    </div>

    <template v-else>
      <!-- 消息列表 -->
      <div ref="messagesRef" class="mon-ai-messages">
        <div v-if="chatMessages.length === 0" class="mon-ai-empty">
          <img :src="logoImg" class="mon-ai-empty-logo" />
          <p>我是监控诊断助手，可以读取本页所有监控数据并调用页面接口</p>
          <p class="mon-ai-empty-sub">CPU / 内存 / 慢SQL / 死锁 / 路由热点 / 协程 / 锁竞争 都能分析</p>
          <div class="mon-ai-quick-actions">
            <el-tag
              v-for="a in quickActions"
              :key="a.text"
              class="mon-ai-quick-tag"
              effect="plain"
              @click="on快捷提问(a.text)"
            >{{ a.text }}</el-tag>
          </div>
        </div>

        <div
          v-for="(msg, index) in chatMessages"
          :key="index"
          :class="['mon-ai-message', 'mon-ai-message-' + msg.role]"
        >
          <div class="mon-ai-message-role">
            <template v-if="msg.role === 'user'">你</template>
            <template v-else-if="msg.role === 'tool'">🔧</template>
            <template v-else>AI</template>
          </div>
          <div class="mon-ai-message-content">
            <!-- 工具结果 -->
            <div v-if="msg.role === 'tool'" class="mon-ai-message-tool">
              <div class="mon-ai-tool-header">
                <el-tag size="small" :type="msg.toolSuccess ? 'success' : 'danger'">{{ msg.toolName }}</el-tag>
              </div>
              <pre class="mon-ai-message-text mon-ai-tool-result">{{ msg.content }}</pre>
            </div>
            <!-- AI 消息 -->
            <pre v-else-if="msg.role === 'assistant'" class="mon-ai-message-text">{{ msg.content }}</pre>
            <!-- 用户消息 -->
            <div v-else class="mon-ai-message-text">{{ msg.content }}</div>
          </div>
        </div>

        <!-- AI 生成中 -->
        <div v-if="is生成中 && !is工具执行中" class="mon-ai-message mon-ai-message-assistant">
          <div class="mon-ai-message-role">AI</div>
          <div class="mon-ai-message-content">
            <pre class="mon-ai-message-text">{{ streamingContent }}<span class="mon-ai-cursor">▌</span></pre>
          </div>
        </div>

        <!-- 工具执行中 -->
        <div v-if="is工具执行中" class="mon-ai-message mon-ai-message-tool-running">
          <div class="mon-ai-message-role">🔧</div>
          <div class="mon-ai-message-content">
            <div class="mon-ai-tool-executing">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span>正在执行: {{ 当前工具名 }}...</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区 -->
      <div class="mon-ai-input-area">
        <el-input
          v-model="inputText"
          type="textarea"
          :rows="3"
          :disabled="is生成中"
          placeholder="描述问题，如：CPU 为什么这么高？是不是有慢 SQL？"
          resize="none"
          @keydown.enter.ctrl="on发送消息"
        />
        <div class="mon-ai-input-footer">
          <span class="mon-ai-hint">Ctrl+Enter 发送 | AI 可读取并调用本页接口</span>
          <div class="mon-ai-input-btns">
            <el-button
              type="primary"
              size="small"
              :loading="is生成中"
              :disabled="!inputText.trim() || is生成中"
              @click="on发送消息"
            >{{ is生成中 ? '生成中...' : '发送' }}</el-button>
            <el-button v-if="is生成中" size="small" type="danger" @click="on停止生成">停止</el-button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, computed, onBeforeUnmount } from 'vue'
import { Delete, Close, WarningFilled, Loading, Setting } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { chatWithTools, getAiConfig } from '@/api/ai.js'
import logoImg from '@/assets/logo4.png'

const Props = defineProps({
  context: { type: Object, default: () => ({}) }
})

const router = useRouter()
const isOpen = ref(false)
const hasApiKey = ref(true)

// ============ 拖动 ============
const panelRef = ref(null)
const panelPos = ref({ x: 24, y: 24 })
const panelStyle = computed(() => ({
  left: panelPos.value.x + 'px',
  top: panelPos.value.y + 'px'
}))
let dragging = false
let dragType = 'mouse'
let dragStart = { mx: 0, my: 0, px: 0, py: 0 }

const on打开 = async () => {
  isOpen.value = true
  await nextTick()
  const w = panelRef.value?.offsetWidth || 420
  const h = panelRef.value?.offsetHeight || 600
  const vw = window.innerWidth
  const vh = window.innerHeight
  // 默认右上，避免遮挡底部内容
  panelPos.value = {
    x: Math.max(8, vw - w - 24),
    y: Math.max(8, Math.min(24, vh - h - 24))
  }
  // 检查 API Key
  try {
    const cfg = await getAiConfig()
    hasApiKey.value = !!cfg.apiKey
  } catch {
    hasApiKey.value = false
  }
}

const on关闭 = () => {
  isOpen.value = false
}

const on去配置 = () => {
  router.push({ name: '系统设置', query: { tab: 'AI配置' } })
}

const on拖动开始 = (e, type) => {
  // 点击按钮区域不拖动
  if (e.target.closest('.mon-ai-header-actions')) return
  dragging = true
  dragType = type
  const p = type === 'touch' ? e.touches[0] : e
  dragStart = { mx: p.clientX, my: p.clientY, px: panelPos.value.x, py: panelPos.value.y }
  if (type === 'touch') {
    window.addEventListener('touchmove', on拖动移动, { passive: false })
    window.addEventListener('touchend', on拖动结束)
  } else {
    window.addEventListener('mousemove', on拖动移动)
    window.addEventListener('mouseup', on拖动结束)
  }
}

const on拖动移动 = (e) => {
  if (!dragging) return
  if (dragType === 'touch') e.preventDefault?.()
  const p = dragType === 'touch' ? e.touches[0] : e
  const dx = p.clientX - dragStart.mx
  const dy = p.clientY - dragStart.my
  const w = panelRef.value?.offsetWidth || 420
  const h = panelRef.value?.offsetHeight || 600
  let nx = dragStart.px + dx
  let ny = dragStart.py + dy
  nx = Math.max(0, Math.min(nx, window.innerWidth - w))
  ny = Math.max(0, Math.min(ny, window.innerHeight - h))
  panelPos.value = { x: nx, y: ny }
}

const on拖动结束 = () => {
  dragging = false
  window.removeEventListener('mousemove', on拖动移动)
  window.removeEventListener('mouseup', on拖动结束)
  window.removeEventListener('touchmove', on拖动移动)
  window.removeEventListener('touchend', on拖动结束)
}

// ============ MCP 工具定义（OpenAI function calling 格式） ============
const monitorTools = [
  {
    type: 'function',
    function: {
      name: 'read_snapshot',
      description: '读取当前监控页所有数据快照：KPI、CPU/内存/磁盘、Go运行时、数据库连接池、慢SQL、SQL模板排行、SQL错误/死锁、路由热点Top、活动/慢请求、Panic、告警、进程Top、历史趋势、MySQL诊断等。这是最常用的工具，分析前优先调用它。',
      parameters: { type: 'object', properties: {}, required: [] }
    }
  },
  {
    type: 'function',
    function: {
      name: 'refresh_data',
      description: '触发刷新监控概览与进程排行，获取最新数据后再返回快照。怀疑数据过期或想看实时状态时调用。',
      parameters: { type: 'object', properties: {}, required: [] }
    }
  },
  {
    type: 'function',
    function: {
      name: 'run_mysql_diag',
      description: '运行 MySQL 诊断（SHOW FULL PROCESSLIST + performance_schema 语句摘要），返回进程列表、慢日志状态、SQL摘要Top10及诊断建议。用于死锁、锁等待、慢查询、无索引查询分析。',
      parameters: { type: 'object', properties: {}, required: [] }
    }
  },
  {
    type: 'function',
    function: {
      name: 'capture_cpu',
      description: '抓取 CPU profile 采样（默认10秒），返回占用 CPU 最高的函数列表。用于定位高CPU来自哪个函数。抓取期间需等待。',
      parameters: {
        type: 'object',
        properties: {
          seconds: { type: 'number', description: '采样秒数 5-60', minimum: 5, maximum: 60 }
        },
        required: []
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'load_profile',
      description: '读取 pprof 文本并返回解析后的人话摘要+关键堆栈。goroutine 看协程泄漏/卡死；heap 看当前内存占用来源；allocs 看历史累计分配热点；block 看阻塞等待；mutex 看锁竞争。',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', enum: ['goroutine', 'heap', 'allocs', 'block', 'mutex'], description: 'profile 类型' },
          debug: { type: 'number', enum: [1, 2], description: 'debug 级别，默认1' },
          gc: { type: 'boolean', description: '仅 heap，抓取前是否先 GC' }
        },
        required: ['name']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'save_settings',
      description: '保存 pprof 采样开关（阻塞采样 blockProfileRate / 锁竞争采样 mutexFraction）。诊断锁竞争或阻塞问题时，可先开启采样让系统运行一段时间产生数据。',
      parameters: {
        type: 'object',
        properties: {
          enableBlockProfile: { type: 'boolean' },
          blockProfileRate: { type: 'number' },
          enableMutexProfile: { type: 'boolean' },
          mutexFraction: { type: 'number' }
        },
        required: []
      }
    }
  }
]

const 监控诊断系统提示词 = `你是飞鸟快验管理系统的运行监控诊断助手，专门帮运维人员分析系统异常、性能瓶颈、慢SQL、死锁、高CPU、高内存等问题。

## 你的能力（MCP 工具）
- read_snapshot：读取当前监控页所有数据快照。分析前优先调用它。
- refresh_data：刷新概览与进程排行后返回最新快照。
- run_mysql_diag：运行 MySQL 诊断，返回进程列表与 performance_schema SQL 摘要Top及建议。
- capture_cpu：抓取 N 秒 CPU 采样，返回热点函数。
- load_profile：读取 pprof 文本并返回解析后的人话摘要（goroutine/heap/allocs/block/mutex）+ 关键堆栈。
- save_settings：保存 pprof 采样开关（block/mutex profile）。

## 快照字段含义
- kpis：进程CPU、进程RSS、Go Heap、goroutine、最近GC暂停、互斥锁等待（含 level：normal/warning/danger）
- server：os/go版本/numCpu、cpuAverage、cpuCores、ram(usedMb/totalMb/usedPercent)、disk(usedGb/totalGb/usedPercent)
- runtime：uptimeSeconds、goroutines、heapAllocMb、heapObjects、stackInuseMb、numGc、lastGcPauseMs、mutexWaitSeconds、block/mutex profile 开关状态
- database：enabled、slowThresholdMs、pool(openConnections/inUse/idle/waitCount/waitDurationMs/maxLifetimeClosed)、slowSqls、sqlTemplates、errors(deadlock=true即死锁)
- routes.top：按总耗时排序的路由热点(method/route/count/inFlight/avgMs/p95Ms/maxMs/totalMs/errorCount/panicCount)
- activeRequests/slowRequests：当前进行中与最近慢请求
- panicEvents：Panic 异常堆栈
- alerts：页面告警
- processTop：进程占用排行（已排除后端进程自身）
- mysqlDiag：MySQL 诊断（进程列表/SQL摘要/无索引/磁盘临时表/扫描行发送行比值/建议）
- history：近30个采样点 CPU/内存/goroutine/GC 趋势
- pprofProfiles：可用 profile 列表及开关状态

## 分析方向
- 高CPU：先看 kpis.processCpu、server.cpuAverage、routes.top，再用 capture_cpu 定位函数。
- 高内存/泄漏：看 kpis.rss/heap、runtime.goroutines 与 history 趋势；load_profile(name=heap) 看当前堆来源，name=allocs 看历史累计分配。
- 慢SQL/死锁：看 database.slowSqls/sqlTemplates/errors(deadlock)；run_mysql_diag；关注 sumNoIndexUsed、sumTmpDiskTables、扫描行/发送行比值。
- 锁竞争/阻塞：save_settings 开启 mutex/block 采样，运行一段时间后 load_profile(name=mutex/block)。
- 协程泄漏/卡死：看 runtime.goroutines 与 history；load_profile(name=goroutine) 看堆栈归类。
- 慢请求/路由热点：看 routes.top、activeRequests、slowRequests、panicEvents。
- 连接池：database.pool 的 WaitDuration/WaitCount 高说明连接不够或SQL太慢占着连接。
- 磁盘/资源：server.ram/server.disk 使用率。

## 输出要求
1. 简体中文，先给结论再给依据，分点列出。
2. 引用具体数值，如“进程CPU 92%，路由 POST /api/xxx P95=820ms”。
3. 给出可执行建议（加索引、限流、缓存、调连接池、查代码、开启采样再复现等）。
4. 只依据工具返回的数据，不要编造不存在的数值。
5. 涉及抓CPU/开采样等耗时操作时，先提示用户需要等待。
6. 若数据不足以判断，主动调用 refresh_data 或对应工具补全，再下结论。`

// ============ 聊天 ============
interface ChatMessage {
  role: 'user' | 'assistant' | 'tool'
  content: string
  toolName?: string
  toolSuccess?: boolean
}

const chatMessages = ref<ChatMessage[]>([])
const inputText = ref('')
const is生成中 = ref(false)
const is工具执行中 = ref(false)
const 当前工具名 = ref('')
const streamingContent = ref('')
const messagesRef = ref<HTMLElement>()
let abortController = null
let fullMessages = []

const quickActions = [
  { text: '一键诊断系统健康状况' },
  { text: '分析CPU是否过高' },
  { text: '分析内存/堆是否过高' },
  { text: '分析慢SQL和死锁' },
  { text: '分析路由热点和慢请求' },
  { text: '抓CPU profile分析热点函数' }
]

// ============ 工具调度 ============
const onToolCall = async (toolName, args) => {
  当前工具名.value = toolName
  is工具执行中.value = true
  let result
  try {
    const ctx = Props.context || {}
    switch (toolName) {
      case 'read_snapshot':
        result = ctx.getSnapshot ? ctx.getSnapshot() : '快照不可用'
        break
      case 'refresh_data':
        result = ctx.refresh ? await ctx.refresh() : '刷新不可用'
        break
      case 'run_mysql_diag':
        result = ctx.runMysqlDiag ? await ctx.runMysqlDiag() : '诊断不可用'
        break
      case 'capture_cpu':
        result = ctx.captureCpu ? await ctx.captureCpu(args.seconds) : '抓样不可用'
        break
      case 'load_profile':
        result = ctx.loadProfile ? await ctx.loadProfile(args) : 'profile 不可用'
        break
      case 'save_settings':
        result = ctx.saveSettings ? await ctx.saveSettings(args) : '保存不可用'
        break
      default:
        result = `未知工具: ${toolName}`
    }
  } catch (e) {
    result = JSON.stringify({ error: e?.message || String(e) })
  } finally {
    is工具执行中.value = false
    当前工具名.value = ''
  }
  const isSuccess = typeof result === 'string' &&
    !result.startsWith('未知工具') &&
    !result.startsWith('{"error"')
  chatMessages.value.push({ role: 'tool', content: result, toolName, toolSuccess: isSuccess })
  scrollToBottom()
  return result
}

const buildMessages = (userMessage) => {
  const messages = [{ role: 'system', content: 监控诊断系统提示词 }]
  if (fullMessages.length > 0) {
    messages.push(...fullMessages.slice(-20))
  }
  messages.push({ role: 'user', content: userMessage })
  return messages
}

const on发送消息 = async () => {
  const text = inputText.value.trim()
  if (!text || is生成中.value) return

  chatMessages.value.push({ role: 'user', content: text })
  inputText.value = ''
  is生成中.value = true
  streamingContent.value = ''
  abortController = new AbortController()

  const messages = buildMessages(text)
  fullMessages.push({ role: 'user', content: text })

  await chatWithTools({
    messages,
    tools: monitorTools,
    signal: abortController.signal,
    onToolCall: async (toolName, args) => {
      const r = await onToolCall(toolName, args)
      return r
    },
    onChunk: (_chunk, full) => {
      streamingContent.value = full
      scrollToBottom()
    },
    onDone: (fullContent) => {
      chatMessages.value.push({ role: 'assistant', content: fullContent })
      fullMessages.push({ role: 'assistant', content: fullContent })
      is生成中.value = false
      streamingContent.value = ''
      abortController = null
      scrollToBottom()
    },
    onError: (err) => {
      ElMessage.error(err)
      is生成中.value = false
      streamingContent.value = ''
      is工具执行中.value = false
      abortController = null
    }
  })
}

const on停止生成 = () => {
  if (abortController) {
    abortController.abort()
    if (streamingContent.value) {
      chatMessages.value.push({ role: 'assistant', content: streamingContent.value })
    }
    is生成中.value = false
    streamingContent.value = ''
    is工具执行中.value = false
    abortController = null
  }
}

const on快捷提问 = (text) => {
  inputText.value = text
  on发送消息()
}

const on清空对话 = () => {
  chatMessages.value = []
  fullMessages = []
  streamingContent.value = ''
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  }
}

onBeforeUnmount(() => {
  on拖动结束()
  if (abortController) abortController.abort()
})
</script>

<style scoped lang="scss">
.mon-ai-fab {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 2000;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 6px 20px rgba(31, 45, 61, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  overflow: hidden;
  &:hover {
    transform: translateY(-2px) scale(1.04);
    box-shadow: 0 10px 26px rgba(58, 123, 253, 0.35);
    .mon-ai-fab-tip { opacity: 1; transform: translateX(0); }
  }
}
.mon-ai-fab-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}
.mon-ai-fab-tip {
  position: absolute;
  right: 64px;
  white-space: nowrap;
  background: #1f2937;
  color: #fff;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 6px;
  opacity: 0;
  transform: translateX(8px);
  transition: all 0.2s;
  pointer-events: none;
}

.mon-ai-panel {
  position: fixed;
  z-index: 2001;
  width: 420px;
  max-width: calc(100vw - 16px);
  height: 600px;
  max-height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(31, 45, 61, 0.28);
  border: 1px solid #e5eaf1;
  overflow: hidden;
}

.mon-ai-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: linear-gradient(135deg, #3a7bfd, #6f9cff);
  color: #fff;
  cursor: move;
  user-select: none;
}
.mon-ai-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
}
.mon-ai-title-logo {
  width: 22px;
  height: 22px;
  border-radius: 50%;
}
.mon-ai-header-actions {
  display: flex;
  gap: 8px;
}
.mon-ai-icon-btn {
  cursor: pointer;
  font-size: 16px;
  color: #fff;
  &:hover { color: #e8f0ff; }
}

.mon-ai-nokey {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 24px;
  text-align: center;
  color: #556070;
  .nokey-title { font-size: 14px; font-weight: 600; color: #1f2937; margin: 4px 0 0; }
  .nokey-sub { font-size: 12px; color: #8590a0; margin: 0 0 10px; line-height: 1.6; }
}

.mon-ai-messages {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  background: #f7f9fc;
}

.mon-ai-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #8590a0;
  text-align: center;
  p { margin: 6px 0 0; font-size: 13px; }
  .mon-ai-empty-sub { font-size: 11px; color: #a0aab8; margin-top: 2px; }
}
.mon-ai-empty-logo {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(58, 123, 253, 0.25);
}

.mon-ai-quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  padding: 10px 6px 0;
}
.mon-ai-quick-tag {
  cursor: pointer;
  font-size: 12px;
  &:hover { color: #3a7bfd; border-color: #3a7bfd; }
}

.mon-ai-message {
  margin-bottom: 12px;
  display: flex;
  gap: 8px;
}
.mon-ai-message-user {
  flex-direction: row-reverse;
  .mon-ai-message-role { background: #3a7bfd; color: #fff; }
  .mon-ai-message-content { align-items: flex-end; }
  .mon-ai-message-text { background: #e8f0ff; border-color: #d4e3ff; }
}
.mon-ai-message-assistant {
  .mon-ai-message-role { background: #2fb344; color: #fff; }
  .mon-ai-message-text { background: #ebf9ee; border-color: #d6f0dd; }
}
.mon-ai-message-tool-running {
  .mon-ai-message-role { background: #e6a23c; color: #fff; }
}
.mon-ai-message-tool {
  width: 100%;
  .mon-ai-tool-header { margin-bottom: 4px; }
  .mon-ai-tool-result {
    background: #fafafa;
    border-color: #e4e7ed;
    max-height: 160px;
    overflow-y: auto;
    font-size: 11px;
  }
}
.mon-ai-tool-executing {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: #fdf6ec;
  border: 1px solid #faecd8;
  border-radius: 6px;
  font-size: 12px;
  color: #e6a23c;
}
.mon-ai-message-role {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
}
.mon-ai-message-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 85%;
}
.mon-ai-message-text {
  margin: 0;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid;
  font-size: 13px;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: inherit;
}
.mon-ai-cursor {
  animation: mon-ai-blink 1s infinite;
  color: #3a7bfd;
}
@keyframes mon-ai-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.mon-ai-input-area {
  padding: 8px;
  border-top: 1px solid #e5eaf1;
  background: #fff;
}
.mon-ai-input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
}
.mon-ai-input-btns {
  display: flex;
  gap: 4px;
}
.mon-ai-hint {
  font-size: 11px;
  color: #a0aab8;
}

@media (max-width: 480px) {
  .mon-ai-panel {
    left: 8px !important;
    right: 8px !important;
    width: auto !important;
  }
  .mon-ai-fab-tip { display: none; }
}
</style>
