<template>
  <div class="ai-assistant">
    <!-- 头部 -->
    <div class="ai-header">
      <span class="ai-title">AI 助手</span>
      <div class="ai-header-actions">
        <el-tooltip content="设置" placement="top">
          <el-icon class="ai-icon-btn" @click="is设置可见 = !is设置可见"><Setting/></el-icon>
        </el-tooltip>
        <el-tooltip content="清空对话" placement="top">
          <el-icon class="ai-icon-btn" @click="on清空对话"><Delete/></el-icon>
        </el-tooltip>
      </div>
    </div>

    <!-- 设置面板 -->
    <div v-if="is设置可见" class="ai-settings">
      <el-form size="small" label-width="80px">
        <el-form-item label="API地址">
          <el-input v-model="aiConfig.apiUrl" placeholder="OpenAI兼容接口地址"/>
        </el-form-item>
        <el-form-item label="API Key">
          <el-input v-model="aiConfig.apiKey" type="password" show-password placeholder="输入API Key"/>
        </el-form-item>
        <el-form-item label="模型">
          <el-input v-model="aiConfig.model" placeholder="如 deepseek-chat"/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" @click="on保存设置">保存设置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 消息列表 -->
    <div class="ai-messages" ref="messagesRef">
      <div v-if="chatMessages.length === 0" class="ai-empty">
        <el-icon :size="32" color="#c0c4cc"><ChatDotRound/></el-icon>
        <p>输入需求，AI帮你写公共函数代码</p>
        <p class="ai-empty-sub">AI可读取/编辑表单字段，直接操作页面</p>
        <div class="ai-quick-actions">
          <el-tag v-for="action in quickActions" :key="action.text"
                  @click="on快捷提问(action.text)" class="ai-quick-tag" effect="plain">
            {{ action.text }}
          </el-tag>
        </div>
      </div>
      <div v-for="(msg, index) in chatMessages" :key="index"
           :class="['ai-message', 'ai-message-' + msg.role]">
        <div class="ai-message-role">
          <template v-if="msg.role === 'user'">你</template>
          <template v-else-if="msg.role === 'tool'">🔧</template>
          <template v-else>AI</template>
        </div>
        <div class="ai-message-content">
          <!-- 工具调用结果 -->
          <div v-if="msg.role === 'tool'" class="ai-message-tool">
            <div class="ai-tool-header">
              <el-tag size="small" :type="msg.toolSuccess ? 'success' : 'danger'">
                {{ msg.toolName }}
              </el-tag>
            </div>
            <pre class="ai-message-text ai-tool-result">{{ msg.content }}</pre>
          </div>
          <!-- AI消息 -->
          <pre v-else-if="msg.role === 'assistant'" class="ai-message-text">{{ msg.content }}</pre>
          <!-- 用户消息 -->
          <div v-else class="ai-message-text">{{ msg.content }}</div>
          <!-- AI消息操作按钮 -->
          <div v-if="msg.role === 'assistant' && msg.content && extractCodeFromReply(msg.content)" class="ai-message-actions">
            <el-button size="small" type="primary" @click="on应用代码(msg.content)">
              应用代码
            </el-button>
            <el-button size="small" @click="on复制代码(msg.content)">
              复制代码
            </el-button>
          </div>
        </div>
      </div>
      <!-- 加载中 -->
      <div v-if="is生成中" class="ai-message ai-message-assistant">
        <div class="ai-message-role">AI</div>
        <div class="ai-message-content">
          <pre class="ai-message-text">{{ streamingContent }}<span class="ai-cursor">▌</span></pre>
        </div>
      </div>
      <!-- 工具执行中提示 -->
      <div v-if="is工具执行中" class="ai-message ai-message-tool-running">
        <div class="ai-message-role">🔧</div>
        <div class="ai-message-content">
          <div class="ai-tool-executing">
            <el-icon class="is-loading"><Loading/></el-icon>
            <span>正在执行: {{ 当前工具名 }}...</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 代码快照回退 -->
    <div v-if="codeSnapshots.length > 0" class="ai-snapshots">
      <el-popover placement="top-start" :width="300" trigger="click">
        <template #reference>
          <el-button size="small" type="warning" plain>
            <el-icon><RefreshLeft/></el-icon>
            回退代码 ({{ codeSnapshots.length }})
          </el-button>
        </template>
        <div class="ai-snapshot-list">
          <div class="ai-snapshot-title">选择要回退的版本：</div>
          <div v-for="(snap, i) in [...codeSnapshots].reverse()" :key="i" class="ai-snapshot-item">
            <span class="ai-snapshot-time">{{ snap.time }}</span>
            <el-button size="small" @click="on回退代码(codeSnapshots.length - 1 - i)">
              回退此版本
            </el-button>
          </div>
        </div>
      </el-popover>
    </div>

    <!-- 输入框 -->
    <div class="ai-input-area">
      <el-input
          v-model="inputText"
          type="textarea"
          :rows="3"
          :disabled="is生成中"
          placeholder="描述需求，如：帮我写一个扣余额的函数，然后设置备注为扣费函数"
          resize="none"
          @keydown.enter.ctrl="on发送消息"
      />
      <div class="ai-input-footer">
        <span class="ai-hint">Ctrl+Enter 发送 | AI可直接操作表单</span>
        <div class="ai-input-btns">
          <el-button type="primary" size="small" :loading="is生成中"
                     :disabled="!inputText.trim() || is生成中"
                     @click="on发送消息">
            {{ is生成中 ? '生成中...' : '发送' }}
          </el-button>
          <el-button v-if="is生成中" size="small" type="danger" @click="on停止生成">
            停止
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, nextTick, onMounted, onBeforeUnmount} from 'vue'
import {Setting, Delete, ChatDotRound, RefreshLeft, Loading} from '@element-plus/icons-vue'
import {ElMessage} from 'element-plus'
import {chatWithTools, extractCodeFromReply, getAiConfig, saveAiConfig, defaultConfig, 公共函数系统提示词, mcpTools} from '@/api/ai.js'

const Props = defineProps({
  currentCode: {type: String, default: ''},
  functionName: {type: String, default: ''},
  formData: {type: Object, default: () => ({})},
  appList: {type: Array, default: () => ([])},
})

const emit = defineEmits(['applyCode', 'restoreCode', 'editForm'])

// 配置
const is设置可见 = ref(false)
const aiConfig = ref({...defaultConfig})

const on保存设置 = async () => {
  try {
    await saveAiConfig(aiConfig.value)
    is设置可见.value = false
    ElMessage.success('设置已保存')
  } catch {
    ElMessage.error('保存配置失败')
  }
}

// 聊天消息
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
let abortController: AbortController | null = null

// 代码快照（用于回退）
interface CodeSnapshot {
  code: string
  time: string
}

const codeSnapshots = ref<CodeSnapshot[]>([])

// 快捷操作
const quickActions = [
  {text: '读取当前表单信息'},
  {text: '写一个扣余额的函数'},
  {text: '写一个网页POST请求函数'},
  {text: '写一个Hook拦截函数'},
  {text: '查询可用应用列表'},
]

// ======================== MCP 工具执行 ========================

function onToolCall(toolName: string, args: Record<string, any>): Promise<string> {
  switch (toolName) {
    case 'read_form':
      return onTool读取表单()
    case 'edit_form':
      return onTool编辑表单(args)
    case 'query_apps':
      return onTool查询应用列表()
    default:
      return Promise.resolve(`未知工具: ${toolName}`)
  }
}

function onTool读取表单(): Promise<string> {
  当前工具名.value = 'read_form'
  is工具执行中.value = true
  return new Promise((resolve) => {
    setTimeout(() => {
      is工具执行中.value = false
      const form = Props.formData
      const result = {
        Name: form.Name || '',
        AppId: form.AppId || 0,
        Note: form.Note || '',
        IsVip: form.IsVip ?? 0,
        Value: form.Value || '',
        Id: form.Id || 0,
      }
      resolve(JSON.stringify(result, null, 2))
    }, 100)
  })
}

function onTool编辑表单(args: Record<string, any>): Promise<string> {
  当前工具名.value = 'edit_form'
  is工具执行中.value = true
  return new Promise((resolve) => {
    setTimeout(() => {
      is工具执行中.value = false
      const changedFields: string[] = []

      // 修改Value时保存快照
      if (args.Value !== undefined) {
        codeSnapshots.value.push({
          code: Props.currentCode,
          time: new Date().toLocaleTimeString(),
        })
      }

      // 通过emit通知父组件修改
      emit('editForm', args)

      // 记录修改了哪些字段
      if (args.Name !== undefined) changedFields.push('函数名')
      if (args.AppId !== undefined) changedFields.push('归属应用')
      if (args.Note !== undefined) changedFields.push('备注')
      if (args.Value !== undefined) changedFields.push('JS代码')
      if (args.IsVip !== undefined) changedFields.push('登录限制')

      resolve(`已修改: ${changedFields.join(', ')}${args.Value !== undefined ? '（代码快照已保存，可回退）' : ''}`)
    }, 100)
  })
}

function onTool查询应用列表(): Promise<string> {
  当前工具名.value = 'query_apps'
  is工具执行中.value = true
  return new Promise((resolve) => {
    setTimeout(() => {
      is工具执行中.value = false
      if (!Props.appList || Props.appList.length === 0) {
        resolve('暂无应用列表数据')
        return
      }
      const result = Props.appList.map((item: any) => ({
        AppId: item.appId,
        AppName: item.appName,
      }))
      resolve(JSON.stringify(result, null, 2))
    }, 100)
  })
}

// ======================== 聊天逻辑 ========================

// 完整的消息历史（包含tool消息，用于API调用）
let fullMessages: Array<any> = []

function buildMessages(userMessage: string): Array<any> {
  const messages: Array<any> = [
    {
      role: 'system',
      content: 公共函数系统提示词 + `\n\n当前正在编辑的函数名: ${Props.functionName}\n当前代码内容:\n\`\`\`js\n${Props.currentCode}\n\`\`\``
    }
  ]

  // 使用完整的消息历史（包含tool调用结果）
  if (fullMessages.length > 0) {
    // 取最近的完整历史（最多保留20条）
    const recent = fullMessages.slice(-20)
    messages.push(...recent)
  }

  // 添加当前用户消息
  messages.push({role: 'user', content: userMessage})

  return messages
}

const on发送消息 = async () => {
  const text = inputText.value.trim()
  if (!text || is生成中.value) return

  chatMessages.value.push({role: 'user', content: text})
  inputText.value = ''
  is生成中.value = true
  streamingContent.value = ''

  abortController = new AbortController()

  const messages = buildMessages(text)
  // 保存到fullMessages
  fullMessages.push({role: 'user', content: text})

  let assistantContent = ''

  await chatWithTools({
    messages,
    tools: mcpTools,
    signal: abortController.signal,
    onToolCall: async (toolName, args) => {
      // 在聊天列表中显示工具调用结果
      const result = await onToolCall(toolName, args)
      const isSuccess = !result.startsWith('未知工具')
      chatMessages.value.push({
        role: 'tool',
        content: result,
        toolName,
        toolSuccess: isSuccess,
      })
      scrollToBottom()
      return result
    },
    onChunk: (_chunk, full) => {
      streamingContent.value = full
      assistantContent = full
      scrollToBottom()
    },
    onDone: (fullContent) => {
      chatMessages.value.push({role: 'assistant', content: fullContent})
      fullMessages.push({role: 'assistant', content: fullContent})
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
    },
  })
}

const on停止生成 = () => {
  if (abortController) {
    abortController.abort()
    if (streamingContent.value) {
      chatMessages.value.push({role: 'assistant', content: streamingContent.value})
    }
    is生成中.value = false
    streamingContent.value = ''
    is工具执行中.value = false
    abortController = null
  }
}

const on快捷提问 = (text: string) => {
  inputText.value = text
  on发送消息()
}

const on应用代码 = (reply: string) => {
  const code = extractCodeFromReply(reply)
  if (!code) {
    ElMessage.warning('未检测到可应用的代码')
    return
  }
  codeSnapshots.value.push({
    code: Props.currentCode,
    time: new Date().toLocaleTimeString(),
  })
  emit('applyCode', code)
  ElMessage.success('代码已应用，可点击"回退代码"恢复')
}

const on回退代码 = (index: number) => {
  const snapshot = codeSnapshots.value[index]
  if (snapshot) {
    codeSnapshots.value.splice(index)
    emit('restoreCode', snapshot.code)
    ElMessage.success('已回退到之前的版本')
  }
}

const on复制代码 = async (reply: string) => {
  const code = extractCodeFromReply(reply)
  if (!code) return
  try {
    await navigator.clipboard.writeText(code)
    ElMessage.success('代码已复制')
  } catch {
    ElMessage.error('复制失败')
  }
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

onMounted(async () => {
  // 从后端加载AI配置
  const config = await getAiConfig()
  aiConfig.value = config
  // API Key为空时自动展开设置
  if (!config.apiKey) {
    is设置可见.value = true
  }
})

onBeforeUnmount(() => {
  if (abortController) {
    abortController.abort()
  }
})
</script>

<style scoped lang="scss">
.ai-assistant {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-left: 1px solid #e4e7ed;
  background: #fff;
}

.ai-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #e4e7ed;
  background: #fafafa;
}

.ai-title {
  font-weight: 600;
  font-size: 14px;
  color: #303133;
}

.ai-header-actions {
  display: flex;
  gap: 8px;
}

.ai-icon-btn {
  cursor: pointer;
  font-size: 16px;
  color: #606266;
  &:hover { color: #409eff; }
}

.ai-settings {
  padding: 8px 12px;
  border-bottom: 1px solid #e4e7ed;
  background: #f5f7fa;
}

.ai-messages {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.ai-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
  p { margin: 8px 0 0; font-size: 13px; }
  .ai-empty-sub { font-size: 11px; color: #c0c4cc; margin-top: 2px; }
}

.ai-quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  padding: 8px 12px 0;
}

.ai-quick-tag {
  cursor: pointer;
  font-size: 12px;
  &:hover { color: #409eff; border-color: #409eff; }
}

.ai-message {
  margin-bottom: 12px;
  display: flex;
  gap: 8px;
}

.ai-message-user {
  flex-direction: row-reverse;
  .ai-message-role { background: #409eff; color: #fff; }
  .ai-message-content { align-items: flex-end; }
  .ai-message-text { background: #ecf5ff; border-color: #d9ecff; }
}

.ai-message-assistant {
  .ai-message-role { background: #67c23a; color: #fff; }
  .ai-message-content { align-items: flex-start; }
  .ai-message-text { background: #f0f9eb; border-color: #e1f3d8; }
}

.ai-message-tool {
  width: 100%;
  .ai-tool-header { margin-bottom: 4px; }
  .ai-tool-result {
    background: #fafafa;
    border-color: #e4e7ed;
    max-height: 150px;
    overflow-y: auto;
    font-size: 11px;
  }
}

.ai-message-tool-running {
  .ai-message-role { background: #e6a23c; color: #fff; }
  .ai-message-content { align-items: flex-start; }
}

.ai-tool-executing {
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

.ai-message-role {
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

.ai-message-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 85%;
}

.ai-message-text {
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
}

.ai-message-actions {
  display: flex;
  gap: 4px;
}

.ai-cursor {
  animation: blink 1s infinite;
  color: #409eff;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.ai-snapshots {
  padding: 4px 12px;
  border-top: 1px solid #e4e7ed;
  background: #fafafa;
}

.ai-snapshot-list {
  .ai-snapshot-title { font-size: 13px; margin-bottom: 8px; color: #606266; }
}

.ai-snapshot-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  border-bottom: 1px solid #f0f0f0;
  .ai-snapshot-time { font-size: 12px; color: #909399; }
}

.ai-input-area {
  padding: 8px;
  border-top: 1px solid #e4e7ed;
  background: #fafafa;
}

.ai-input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.ai-input-btns {
  display: flex;
  gap: 4px;
}

.ai-hint {
  font-size: 11px;
  color: #c0c4cc;
}
</style>
