import {ElMessage} from "element-plus";
import service from '@/api/request'
import {取url根入口路径} from "@/utils/utils"

// AI配置管理 - 后端API
const aiConfigUrl = 取url根入口路径() + "/setSystem/"

export const defaultConfig = {
  apiUrl: 'https://api.deepseek.com/v1/chat/completions',
  apiKey: '',
  model: 'deepseek-chat',
  systemPrompt: '',
}

/** 从后端获取AI配置 */
export async function getAiConfig() {
  try {
    const res = await service({
      url: aiConfigUrl + 'getInfoAiConfig',
      method: 'post',
      data: {}
    })
    if (res.code === 10000 && res.data) {
      return {...defaultConfig, ...res.data}
    }
    return {...defaultConfig}
  } catch {
    return {...defaultConfig}
  }
}

/** 保存AI配置到后端 */
export async function saveAiConfig(config) {
  const res = await service({
    url: aiConfigUrl + 'SaveInfoAiConfig',
    method: 'post',
    data: config
  })
  return res
}

// 公共函数API系统提示词（从skill规则中提取的核心内容）
export const 公共函数系统提示词 = `你是飞鸟快验管理系统的公共函数(JS)开发助手。帮助用户编写和修改公共函数代码。

## 编码规则
1. 函数名必须与用户指定的函数名一致
2. 函数必须有一个参数，通常命名为 JSON形参 或 JSON形参文本
3. 局部变量用 var 声明，变量名建议用"局_"前缀（项目风格）
4. 返回值自动转字符串，对象需 JSON.stringify() 或直接 return 对象
5. 代码中使用中文注释和变量名是项目正常风格
6. 除了 import 加载其他js库外，不要使用ES6+的import/export

## 全局变量（只读）
- $Request: 请求信息 {Method,Url,Header,Host,Body} Api执行前Hook可用
- $应用信息: {AppId,AppName,Status,VipData}
- $用户在线信息: {User,Key,Status,Tab,Uid,Id,LoginAppid}
- $任务状态: Hook专用，可读写
- $拦截原因: Hook专用，值不为空则拦截

## 全局函数
- $api_用户Id取详情($用户在线信息) → {Id,User,PassWord,Phone,Email,Status,Rmb,...}
- $api_取软件用户详情($用户在线信息) → {Id,Uid,Status,Key,VipTime,VipNumber,Note,MaxOnline,...}
- $api_用户Id增减余额($用户在线信息, 增减值float, 原因string) → {IsOk,Err}
- $api_用户Id增减积分($用户在线信息, 增减值float, 原因string) → {IsOk,Err}
- $api_用户Id增减时间点数(AppId, $用户在线信息, 增减值int, 原因string) → {IsOk,Err}
- $api_读公共变量(变量名) → string
- $api_置公共变量(变量名, 值) → bool
- $api_网页访问_GET(Url, 协议头, Cookies, 超时秒, 代理ip) → {StatusCode,Headers,Cookies,Body}
- $api_网页访问_POST(Url, post, 协议头, Cookies, 超时秒, 代理ip) → {StatusCode,Headers,Cookies,Body}
  协议头多个用\\r分割，推荐: 协议头数组.join("\\r")
- $api_置动态标记($用户在线信息, 新标签) → bool
- $api_执行SQL查询(SQL, 预处理绑定[]) → {IsOk,Err,Data} 只能SELECT
- $api_执行SQL功能(SQL, 预处理绑定[]) → {IsOk,Err} 增删改
- $api_置用户云配置($用户在线信息, 配置名, 配置值) → {IsOk,Err}
- $api_取用户云配置($用户在线信息, 配置名) → {IsOk,Err,Data}
- $api_用户名或卡号取uid(AppId, 用户名) → uid(int) 无返回0
- $api_置黑名单(AppId, 黑名单信息, 备注) → {IsOk,Err}
- $api_置软件用户状态($用户在线信息, 状态码) → {IsOk,Err} 1正常 2冻结
- $api_置缓存(配置名, 配置值, 有效期秒) → bool -1永久
- $api_取缓存(配置名) → string
- $api_在线注销($用户在线信息) → {IsOk,Err}
- $api_任务池_任务创建($用户在线信息, 任务类型ID, JSON参数) → {IsOk,Err,Data:{TaskUuid}}
- $api_任务池_任务查询(TaskUuid) → {IsOk,Err,Data:{ReturnData,Status,TimeEnd,TimeStart}} Status:1刚创建2处理中3成功4失败
- $api_任务池Uuid添加到队列(uuid) → {IsOk,Err}
- $api_任务池_取队列长度() → {IsOk,Err,Data}
- $api_Jwt生成(JSON字符串, 签名密钥) → {IsOk,Err,Data}
- $api_云存储_取外链(文件路径, 过期秒) → {IsOk,Err,Data}
- $api_云存储_取文件上传授权(文件路径) → {IsOk,Err,Data:{Path,Type,Url,UpToken}}
- $api_ws_发送消息(ids int, msg string)
- $api_ws_发送消息_批量(ids []int, msg string)
- $api_ws_筛选id(AppIdEx, uid, tap) → {IsOk,Err,Data:[id数组]}
- $程序_延时(毫秒) 同步延迟
- $api_编码_BASE64编码/解码, 字节集_十六进制互转, 文本_取右/左/中间/替换, 时间_取时间戳/13位, 生成二维码并转base64
- $api_VMP计算授权码(Rsa位数, Rsa私钥, Rsa模数, base64产品代码, 授权配置JSON) → {IsOk,Err,Data}
- $api_ip查地区(ip) → string

## import加载其他js库
import "https://cdn.example.com/lib.min.js"  // 网络加载有缓存
//@import "url"  // 不缓存
//import "lib/path.js"  // 本地: ./云函数/lib/path.js

## 输出规则
当你需要生成或修改代码时，请将完整的新代码放在 \`\`\`js 和 \`\`\` 之间。可以同时给出解释说明。

## MCP工具
你可以使用以下工具直接操作编辑器中的表单:
- read_form: 读取当前表单所有字段值
- edit_form: 编辑表单字段(函数名Name/归属应用AppId/备注Note/JS代码Value/登录限制IsVip)
- query_apps: 查询所有可用应用列表`

// MCP工具定义（OpenAI function calling格式）
export const mcpTools = [
  {
    type: 'function',
    function: {
      name: 'read_form',
      description: '读取当前编辑器中公共函数表单的所有字段值，包括函数名、归属应用、备注、JS代码、登录限制等',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'edit_form',
      description: '编辑公共函数表单字段。可以修改函数名(Name)、归属应用AppId(AppId)、备注(Note)、JS函数代码(Value)、登录限制(IsVip:1限登录/0任意)。修改Value时会自动保存代码快照用于回退。',
      parameters: {
        type: 'object',
        properties: {
          Name: {
            type: 'string',
            description: '函数名称，必须与代码中function后的名称一致',
          },
          AppId: {
            type: 'number',
            description: '归属应用ID。可用query_apps查询完整列表。常用: 1=全局, 2=任务池Hook, 3=ApiHook, 11=WebSocket, 10001+=自定义应用',
          },
          Note: {
            type: 'string',
            description: '备注说明',
          },
          Value: {
            type: 'string',
            description: 'JS函数完整代码，会替换整个代码编辑器内容',
          },
          IsVip: {
            type: 'number',
            description: '登录限制: 1=限登录, 0=任意调用',
            enum: [0, 1],
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'query_apps',
      description: '查询所有可用的应用列表，返回AppId和应用名称的对应关系。用于确定edit_form中AppId应填什么值。',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
]

// 从AI回复中提取代码块
export function extractCodeFromReply(reply) {
  const codeBlockRegex = /```(?:js|javascript)\s*\n([\s\S]*?)```/g
  const matches = []
  let match
  while ((match = codeBlockRegex.exec(reply)) !== null) {
    matches.push(match[1].trim())
  }
  if (matches.length > 0) {
    return matches[0]
  }

  const trimmed = reply.trim()
  if (trimmed.startsWith('function ') || trimmed.startsWith('function\t')) {
    return trimmed
  }

  return null
}

// 带MCP工具的流式聊天（支持function calling循环）
export async function chatWithTools({messages, tools, onToolCall, onChunk, onDone, onError, signal}) {
  const config = await getAiConfig()

  if (!config.apiKey) {
    onError?.('请先在设置中配置 AI API Key')
    return
  }

  const maxToolRounds = 5 // 最多5轮工具调用，防止死循环

  for (let round = 0; round < maxToolRounds; round++) {
    try {
      const body = {
        model: config.model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 4096,
      }

      // 只在第一轮传入tools定义，后续轮次AI已经知道工具了
      if (tools && tools.length > 0) {
        body.tools = tools
        body.tool_choice = 'auto'
      }

      const response = await fetch(config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify(body),
        signal,
      })

      if (!response.ok) {
        const errText = await response.text()
        onError?.(`API请求失败(${response.status}): ${errText}`)
        return
      }

      // 非流式读取完整响应，以便处理tool_calls
      const data = await response.json()
      const choice = data.choices?.[0]
      if (!choice) {
        onError?.('API返回数据异常')
        return
      }

      const assistantMessage = choice.message

      // 如果有tool_calls，执行工具调用
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        // 先把assistant消息（含tool_calls）加入历史
        messages.push(assistantMessage)

        // 逐个执行工具调用
        for (const toolCall of assistantMessage.tool_calls) {
          const toolName = toolCall.function.name
          let toolArgs = {}
          try {
            toolArgs = JSON.parse(toolCall.function.arguments)
          } catch {
            toolArgs = {}
          }

          // 调用工具处理函数
          const toolResult = await onToolCall?.(toolName, toolArgs)

          // 把工具结果加入消息历史
          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult),
          })
        }

        // 继续下一轮，让AI根据工具结果继续回复
        continue
      }

      // 没有tool_calls，流式输出内容
      const content = assistantMessage.content || ''
      // 模拟流式输出效果
      if (content) {
        const chars = content.split('')
        let displayed = ''
        for (const char of chars) {
          displayed += char
          onChunk?.(char, displayed)
          // 极短的延迟让UI能渲染
          await new Promise(r => setTimeout(r, 5))
        }
      }

      onDone?.(content)
      return
    } catch (e) {
      if (e.name === 'AbortError') return
      onError?.(`请求异常: ${e.message}`)
      return
    }
  }

  // 达到最大轮次
  onError?.('工具调用轮次超过限制')
}

// 原始流式聊天（保留兼容）
export async function chatStream({messages, onChunk, onDone, onError, signal}) {
  const config = await getAiConfig()

  if (!config.apiKey) {
    onError?.('请先在设置中配置 AI API Key')
    return
  }

  try {
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 4096,
      }),
      signal,
    })

    if (!response.ok) {
      const errText = await response.text()
      onError?.(`API请求失败(${response.status}): ${errText}`)
      return
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''
    let fullContent = ''

    while (true) {
      const {done, value} = await reader.read()
      if (done) break

      buffer += decoder.decode(value, {stream: true})
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed === 'data: [DONE]') continue
        if (!trimmed.startsWith('data: ')) continue

        try {
          const json = JSON.parse(trimmed.slice(6))
          const content = json.choices?.[0]?.delta?.content
          if (content) {
            fullContent += content
            onChunk?.(content, fullContent)
          }
        } catch {
          // 忽略解析错误
        }
      }
    }

    onDone?.(fullContent)
  } catch (e) {
    if (e.name === 'AbortError') return
    onError?.(`请求异常: ${e.message}`)
  }
}

// 非流式聊天
export async function chat(messages) {
  const config = await getAiConfig()

  if (!config.apiKey) {
    ElMessage.error('请先在设置中配置 AI API Key')
    return null
  }

  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 4096,
    }),
  })

  if (!response.ok) {
    throw new Error(`API请求失败: ${response.status}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}
