<template>
  <div class="全局搜索容器" :style="{ width: is移动端() ? '130px' : '240px' }">
    <el-autocomplete
        ref="搜索框Ref"
        v-model="关键词"
        :fetch-suggestions="查询建议"
        :trigger-on-focus="true"
        :debounce="80"
        :hide-loading="true"
        clearable
        placeholder="搜索页面/功能"
        popper-class="全局搜索下拉"
        class="全局搜索框"
        @focus="确保索引加载"
        @select="on选中跳转"
    >
      <template #prefix>
        <el-icon>
          <Search/>
        </el-icon>
      </template>
      <template #default="{ item }">
        <div class="搜索建议项">
          <el-tag size="small" :type="item.是否最近 ? 'success' : 'info'" class="建议分组">
            {{ item.是否最近 ? '最近' : item.分组 }}
          </el-tag>
          <span class="建议名称">
            <template v-for="(seg, i) in item.名称分段" :key="i">
              <span v-if="seg.hit" class="建议命中">{{ seg.t }}</span>
              <template v-else>{{ seg.t }}</template>
            </template>
          </span>
          <span class="建议命中词" v-if="item.命中词">{{ item.命中词 }}</span>
        </div>
      </template>
    </el-autocomplete>
  </div>
</template>

<script setup lang='ts'>
import {onBeforeUnmount, onMounted, ref} from "vue";
import {useRouter} from "vue-router";
import {Search} from "@element-plus/icons-vue";
import {is移动端} from "@/utils/utils";
import 菜单json from "@/store/菜单.json";

interface 搜索项 {
  路径: string
  名称: string
  分组: string
  词: string[]
}

interface 建议项 {
  路径: string
  名称: string
  分组: string
  value: string
  命中词?: string
  是否最近?: boolean
  名称分段: { t: string; hit: boolean }[]
}

const router = useRouter()
const 关键词 = ref("")
const 搜索框Ref = ref()
// 全量功能词索引(构建期生成),首次聚焦搜索框才异步加载,加载后由模块缓存,不再重复请求
const 全量索引 = ref<搜索项[] | null>(null)
const 索引加载中 = ref(false)
const 最近使用 = ref<{ 路径: string; 名称: string; 分组: string }[]>(
    JSON.parse(localStorage.getItem("全局搜索_最近使用") || "[]")
)

// 菜单级数据集:直接来自菜单json,静态打包进bundle,不依赖索引文件也能搜页面名
const 菜单数据集 = ref<搜索项[]>([])
const 扁平化菜单 = (列表: any[], 分组名?: string) => {
  列表.forEach((item: any) => {
    const 有子级 = item.children && item.children.length
    if (有子级) {
      扁平化菜单(item.children, item.meta?.title || item.name)
    } else {
      菜单数据集.value.push({
        路径: item.path,
        名称: item.meta?.title || item.name,
        分组: 分组名 || "",
        词: []
      })
    }
  })
}
扁平化菜单(菜单json)

const 确保索引加载 = async () => {
  if (全量索引.value || 索引加载中.value) return
  索引加载中.value = true
  try {
    const mod: any = await import("@/assets/json/搜索索引.json")
    全量索引.value = (mod.default || mod) as 搜索项[]
    // 首次聚焦后立刻输入的话,索引可能晚于第一次查询到位,补一次查询
    if (关键词.value) (搜索框Ref.value as any)?.getData?.(关键词.value)
  } catch (e) {
    console.warn("搜索索引加载失败,仅支持页面名搜索", e)
  }
  索引加载中.value = false
}

// 把名称按命中关键字切段用于高亮,纯模板渲染,不用v-html
const 生成分段 = (名称: string, kw: string): { t: string; hit: boolean }[] => {
  if (!kw) return [{t: 名称, hit: false}]
  const 小名称 = 名称.toLowerCase()
  const idx = 小名称.indexOf(kw)
  if (idx === -1) return [{t: 名称, hit: false}]
  const 分段: { t: string; hit: boolean }[] = []
  if (idx > 0) 分段.push({t: 名称.slice(0, idx), hit: false})
  分段.push({t: 名称.slice(idx, idx + kw.length), hit: true})
  if (idx + kw.length < 名称.length) 分段.push({t: 名称.slice(idx + kw.length), hit: false})
  return 分段
}

const 查询建议 = (查询词: string, callback: Function) => {
  const kw = (查询词 || "").trim().toLowerCase()
  if (!kw) {
    callback(最近使用.value.map(x => ({
      ...x, value: x.名称, 是否最近: true,
      名称分段: [{t: x.名称, hit: false}]
    })))
    return
  }
  const 词组 = kw.split(/\s+/).filter(Boolean)
  // 候选池 = 菜单数据集(永远可用) ∪ 全量索引(带功能词,同路径覆盖合并)
  const 候选 = new Map<string, 搜索项>()
  菜单数据集.value.forEach(it => 候选.set(it.路径, {...it}))
  if (全量索引.value) {
    全量索引.value.forEach(it => {
      const 已有 = 候选.get(it.路径)
      if (已有) 已有.词 = it.词
      else 候选.set(it.路径, {...it})
    })
  }
  const 结果: 建议项[] = []
  候选.forEach((it) => {
    const 名称小 = it.名称.toLowerCase()
    const 词数组小 = it.词.map(x => x.toLowerCase())
    const 全命中 = (w: string) => 词组.every(x => w.includes(x))
    let 分数 = 99
    let 命中词 = ""
    if (词组.every(w => 名称小.includes(w))) {
      分数 = 名称小.startsWith(词组[0]) ? 0 : 1
    } else if (词数组小.some(全命中)) {
      分数 = 2
      命中词 = it.词.find(w => 全命中(w.toLowerCase())) || ""
    } else if (全命中(it.分组.toLowerCase())) {
      分数 = 3
    }
    if (分数 < 99) {
      结果.push({
        路径: it.路径, 名称: it.名称, 分组: it.分组 || "其他", value: it.名称,
        命中词, 分数,
        名称分段: 生成分段(it.名称, 词组[0])
      })
    }
  })
  结果.sort((a, b) => (a as any).分数 - (b as any).分数 || a.名称.localeCompare(b.名称))
  callback(结果.slice(0, 12))
}

const on选中跳转 = (item: any) => {
  if (!item?.路径) return
  const 列表 = 最近使用.value.filter(x => x.路径 !== item.路径)
  列表.unshift({路径: item.路径, 名称: item.名称, 分组: item.分组})
  最近使用.value = 列表.slice(0, 5)
  localStorage.setItem("全局搜索_最近使用", JSON.stringify(最近使用.value))
  router.push("/" + item.路径)
}

// Ctrl+K / Cmd+K 聚焦搜索框
const on全局按键 = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
    e.preventDefault()
    确保索引加载()
    搜索框Ref.value?.focus?.()
  }
}
onMounted(() => window.addEventListener("keydown", on全局按键))
onBeforeUnmount(() => window.removeEventListener("keydown", on全局按键))
</script>

<style scoped lang="scss">
.全局搜索容器 {
  margin-right: 10px;
  vertical-align: middle;
}

.全局搜索框 {
  width: 100%;
}
</style>

<style lang="scss">
// popper挂在body下,不能用scoped
.全局搜索下拉 {
  min-width: 340px !important;

  .搜索建议项 {
    display: flex;
    align-items: center;
    gap: 8px;
    line-height: 24px;
    width: 100%;
    overflow: hidden;
  }

  .建议分组 {
    flex-shrink: 0;
  }

  .建议名称 {
    font-weight: 500;
    white-space: nowrap;
  }

  .建议命中 {
    color: var(--el-color-primary);
    font-weight: 700;
  }

  .建议命中词 {
    margin-left: auto;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    max-width: 45%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
