<template>
  <div class="monitor-page" v-loading="loading">
    <el-card class="toolbar-card" shadow="never">
      <div class="toolbar-row">
        <div class="toolbar-left">
          <div class="title-block">
            <h2>运行监控</h2>
            <p>轻量指标常驻采集，CPU / block / mutex 按需抓样，数据库死锁和慢 SQL 单独展示。</p>
          </div>
          <el-tag type="info">最近刷新：{{ lastRefreshText }}</el-tag>
        </div>
        <div class="toolbar-actions">
          <el-switch v-model="autoRefresh" active-text="自动刷新" inactive-text="手动刷新" />
          <el-input-number v-model="autoRefreshSeconds" :min="5" :max="60" :step="5" size="small" />
          <el-button :icon="RefreshRight" @click="handleManualRefresh">刷新</el-button>
          <el-button :icon="SwitchButton" type="danger" plain @click="stopSystem">停止系统</el-button>
        </div>
      </div>
    </el-card>

    <el-row :gutter="16" class="summary-grid">
      <el-col :xs="24" :md="12" :xl="6">
        <el-card class="summary-card">
          <template #header>进程概览</template>
          <div class="metric-row"><span>Go 版本</span><strong>{{ serverOs.goVersion || '-' }}</strong></div>
          <div class="metric-row"><span>系统</span><strong>{{ serverOs.goos || '-' }}</strong></div>
          <div class="metric-row"><span>Goroutine</span><strong>{{ runtimeInfo.goroutines || 0 }}</strong></div>
          <div class="metric-row"><span>线程创建数</span><strong>{{ runtimeInfo.threadCreateCount || 0 }}</strong></div>
          <div class="metric-row"><span>已运行</span><strong>{{ formatSeconds(runtimeInfo.uptimeSeconds) }}</strong></div>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="12" :xl="6">
        <el-card class="summary-card">
          <template #header>CPU / 调度</template>
          <div class="metric-row"><span>逻辑核数</span><strong>{{ serverOs.numCpu || 0 }}</strong></div>
          <div class="metric-row"><span>GOMAXPROCS</span><strong>{{ runtimeInfo.goMaxProcs || 0 }}</strong></div>
          <div class="metric-row"><span>Cgo 调用</span><strong>{{ runtimeInfo.numCgoCall || 0 }}</strong></div>
          <div class="metric-row"><span>GC CPU 占比</span><strong>{{ percent(runtimeInfo.gcCpuFraction) }}</strong></div>
          <div class="mini-bars">
            <div v-for="(item, index) in serverCpu.cpus || []" :key="index" class="mini-bar-item">
              <span>#{{ index + 1 }}</span>
              <el-progress :percentage="Number(Number(item || 0).toFixed(0))" :stroke-width="10" />
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="12" :xl="6">
        <el-card class="summary-card">
          <template #header>内存 / GC</template>
          <div class="metric-row"><span>进程 Alloc</span><strong>{{ mb(runtimeInfo.allocMb) }}</strong></div>
          <div class="metric-row"><span>HeapAlloc</span><strong>{{ mb(runtimeInfo.heapAllocMb) }}</strong></div>
          <div class="metric-row"><span>HeapInuse</span><strong>{{ mb(runtimeInfo.heapInuseMb) }}</strong></div>
          <div class="metric-row"><span>HeapObjects</span><strong>{{ runtimeInfo.heapObjects || 0 }}</strong></div>
          <div class="metric-row"><span>Next GC</span><strong>{{ mb(runtimeInfo.nextGcMb) }}</strong></div>
          <div class="metric-row"><span>最近 GC 暂停</span><strong>{{ ms(runtimeInfo.lastGcPauseMs) }}</strong></div>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="12" :xl="6">
        <el-card class="summary-card">
          <template #header>宿主机资源</template>
          <div class="metric-row"><span>内存占用</span><strong>{{ serverRam.usedMb || 0 }} / {{ serverRam.totalMb || 0 }} MB</strong></div>
          <el-progress :percentage="Number(serverRam.usedPercent || 0)" />
          <div class="metric-row disk-row"><span>磁盘占用</span><strong>{{ serverDisk.usedGb || 0 }} / {{ serverDisk.totalGb || 0 }} GB</strong></div>
          <el-progress :percentage="Number(serverDisk.usedPercent || 0)" status="warning" />
          <div class="metric-row"><span>累计申请内存</span><strong>{{ mb(runtimeInfo.totalAllocMb) }}</strong></div>
          <div class="metric-row"><span>当前向系统申请</span><strong>{{ mb(runtimeInfo.sysMb) }}</strong></div>
          <div class="metric-note">前者只会持续累加，后者更接近当前进程真正占着的总内存。</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="content-grid">
      <el-col :xs="24" :xl="8">
        <el-card class="panel-card alert-card">
          <template #header>监控告警</template>
          <div class="alert-list">
            <el-alert
              v-for="(item, index) in alertRows"
              :key="`${item.title}-${index}`"
              :type="item.level"
              :closable="false"
              :title="item.title"
              class="monitor-alert"
            >
              <template #default>
                <div class="alert-detail">{{ item.detail }}</div>
              </template>
            </el-alert>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :xl="16">
        <el-card class="panel-card">
          <template #header>
            <div class="card-header">
              <span>路由趋势</span>
              <div class="header-tools">
                <el-select v-model="routeTrendKey" class="route-trend-route">
                  <el-option v-for="item in routeTrendOptions" :key="item.key" :label="item.label" :value="item.key" />
                </el-select>
                <el-select v-model="routeTrendMetric" class="route-trend-metric">
                  <el-option label="请求次数" value="count" />
                  <el-option label="错误次数" value="errorCount" />
                  <el-option label="平均耗时" value="avgMs" />
                  <el-option label="P95" value="p95Ms" />
                </el-select>
                <el-select v-model="routeTrendRange" class="route-trend-range">
                  <el-option label="近 5 分钟" value="5m" />
                  <el-option label="近 15 分钟" value="15m" />
                  <el-option label="近 1 小时" value="1h" />
                </el-select>
              </div>
            </div>
          </template>
          <el-alert
            type="info"
            :closable="false"
            title="每 10 秒采样一次，适合看某个功能是持续变慢还是偶发抖动。"
            class="hint-alert"
          />
          <div ref="routeTrendChartRef" class="route-trend-chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="content-grid">
      <el-col :xs="24">
        <el-card class="panel-card">
          <template #header>
            <div class="card-header">
              <span>进程占用 Top 10</span>
              <div class="header-tools">
                <el-tag type="info">仅手动刷新</el-tag>
                <el-tag type="info">最近采集：{{ processCollectedAtText }}</el-tag>
                <el-button :icon="RefreshRight" :loading="processLoading" @click="loadProcessTop">刷新进程排行</el-button>
              </div>
            </div>
          </template>
          <el-alert
            type="info"
            :closable="false"
            title="按约 0.8 秒采样窗口统计，已自动排除当前后端进程，避免刷新动作把自己顶到第一位。CPU 100% 大致表示占满 1 个核心。"
            class="hint-alert"
          />
          <el-table :data="processRows" size="small" max-height="320" stripe>
            <el-table-column prop="pid" label="PID" width="90" />
            <el-table-column prop="name" label="进程名" min-width="180" show-overflow-tooltip />
            <el-table-column prop="cpuPercent" label="CPU%" width="100" />
            <el-table-column prop="memoryMb" label="内存(MB)" width="110" />
            <el-table-column prop="memoryPercent" label="内存占比%" width="110" />
            <el-table-column prop="threadCount" label="线程数" width="90" />
            <el-table-column prop="status" label="状态" width="110" show-overflow-tooltip />
            <el-table-column prop="uptimeText" label="已运行" width="110" />
            <el-table-column prop="startedAt" label="启动时间" min-width="180" />
            <el-table-column prop="command" label="命令行" min-width="320" show-overflow-tooltip />
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="content-grid">
      <el-col :xs="24" :xl="15">
        <el-card class="panel-card">
          <template #header>
            <div class="card-header">
              <span>路由热点</span>
              <div class="header-tools">
                <el-input v-model="routeKeyword" placeholder="筛选路由 / 方法" clearable class="route-filter" />
                <el-select v-model="routeSort" class="route-sort">
                  <el-option label="总耗时" value="totalMs" />
                  <el-option label="P95" value="p95Ms" />
                  <el-option label="最大耗时" value="maxMs" />
                  <el-option label="请求次数" value="count" />
                </el-select>
              </div>
            </div>
          </template>
          <el-alert
            type="info"
            :closable="false"
            title="这张表用来快速定位哪个功能最重。精确 CPU / 内存归因，请继续看下方 CPU 或 heap profile。"
            class="hint-alert"
          />
          <el-table :data="filteredRoutes" max-height="460" stripe>
            <el-table-column prop="method" label="方法" width="90" />
            <el-table-column prop="route" label="路由" min-width="260" show-overflow-tooltip />
            <el-table-column prop="count" label="次数" width="90" />
            <el-table-column prop="inFlight" label="进行中" width="90" />
            <el-table-column prop="avgMs" label="平均(ms)" width="110" />
            <el-table-column prop="p95Ms" label="P95(ms)" width="110" />
            <el-table-column prop="maxMs" label="最大(ms)" width="110" />
            <el-table-column prop="totalMs" label="总耗时(ms)" width="120" />
            <el-table-column prop="errorCount" label="错误" width="80" />
            <el-table-column prop="panicCount" label="Panic" width="80" />
            <el-table-column prop="lastSeenAt" label="最后请求" min-width="180" />
          </el-table>
        </el-card>
      </el-col>

      <el-col :xs="24" :xl="9">
        <el-card class="panel-card">
          <template #header>活动请求 / 慢请求</template>
          <el-descriptions :column="1" border size="small" class="mini-desc">
            <el-descriptions-item label="进行中请求">{{ activeRequests.length }}</el-descriptions-item>
            <el-descriptions-item label="慢请求缓存">{{ slowRequests.length }}</el-descriptions-item>
            <el-descriptions-item label="Panic 缓存">{{ panicEvents.length }}</el-descriptions-item>
          </el-descriptions>

          <div class="sub-block">
            <div class="sub-title">当前活动请求</div>
            <el-table :data="activeRequests" max-height="180" size="small" stripe>
              <el-table-column prop="method" label="方法" width="80" />
              <el-table-column prop="route" label="路由" min-width="180" show-overflow-tooltip />
              <el-table-column prop="currentDurationMs" label="耗时(ms)" width="110" />
            </el-table>
          </div>

          <div class="sub-block">
            <div class="sub-title">最近慢请求</div>
            <el-table :data="slowRequests" max-height="180" size="small" stripe>
              <el-table-column prop="method" label="方法" width="80" />
              <el-table-column prop="route" label="路由" min-width="180" show-overflow-tooltip />
              <el-table-column prop="status" label="状态" width="80" />
              <el-table-column prop="durationMs" label="耗时(ms)" width="110" />
            </el-table>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="content-grid">
      <el-col :xs="24">
        <el-card class="panel-card">
          <template #header>
            <div class="card-header">
              <span>数据库死锁 / 慢 SQL</span>
              <el-tag :type="databaseInfo.enabled ? 'success' : 'info'">
                {{ databaseInfo.enabled ? '已连接' : '未连接数据库' }}
              </el-tag>
            </div>
          </template>

          <el-row :gutter="16">
            <el-col :xs="24" :xl="7">
              <el-descriptions :column="1" border size="small" class="mini-desc">
                <el-descriptions-item label="慢 SQL 阈值">
                  {{ Number(databaseInfo.slowThresholdMs || 0).toFixed(0) }} ms
                </el-descriptions-item>
                <el-descriptions-item label="Open / InUse / Idle">
                  {{ dbPool.openConnections || 0 }} / {{ dbPool.inUse || 0 }} / {{ dbPool.idle || 0 }}
                </el-descriptions-item>
                <el-descriptions-item label="WaitCount">{{ dbPool.waitCount || 0 }}</el-descriptions-item>
                <el-descriptions-item label="WaitDuration">{{ ms(dbPool.waitDurationMs) }}</el-descriptions-item>
                <el-descriptions-item label="LifetimeClosed">{{ dbPool.maxLifetimeClosed || 0 }}</el-descriptions-item>
              </el-descriptions>
              <el-alert
                type="warning"
                :closable="false"
                title="MySQL 1213 通常表示死锁，1205 通常表示锁等待超时。下面会把这两类错误单独标出来。"
                class="hint-alert"
              />
            </el-col>
            <el-col :xs="24" :xl="17">
              <div class="sub-block first-sub-block">
                <div class="sub-title">最近慢 SQL</div>
                <el-table :data="slowSqlRows" size="small" max-height="220" stripe>
                  <el-table-column prop="at" label="时间" width="180" />
                  <el-table-column prop="durationMs" label="耗时(ms)" width="110" />
                  <el-table-column prop="rowsAffected" label="影响行" width="100" />
                  <el-table-column prop="sql" label="SQL" min-width="480" show-overflow-tooltip />
                </el-table>
              </div>
              <div class="sub-block">
                <div class="sub-title">SQL 模板排行</div>
                <el-table :data="sqlTemplateRows" size="small" max-height="220" stripe>
                  <el-table-column prop="template" label="模板" min-width="420" show-overflow-tooltip />
                  <el-table-column prop="count" label="次数" width="90" />
                  <el-table-column prop="avgMs" label="平均(ms)" width="100" />
                  <el-table-column prop="maxMs" label="最大(ms)" width="100" />
                  <el-table-column prop="deadlockCount" label="死锁" width="80" />
                  <el-table-column prop="lastAt" label="最近时间" width="180" />
                </el-table>
              </div>
              <div class="sub-block">
                <div class="sub-title">最近 SQL 错误 / 死锁</div>
                <el-table :data="dbErrorRows" size="small" max-height="220" stripe>
                  <el-table-column prop="at" label="时间" width="180" />
                  <el-table-column prop="deadlock" label="死锁/锁等待" width="110">
                    <template #default="{ row }">
                      <el-tag :type="row.deadlock ? 'danger' : 'warning'">
                        {{ row.deadlock ? '是' : '否' }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="durationMs" label="耗时(ms)" width="110" />
                  <el-table-column prop="error" label="错误" min-width="220" show-overflow-tooltip />
                  <el-table-column prop="sql" label="SQL" min-width="360" show-overflow-tooltip />
                </el-table>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="content-grid">
      <el-col :xs="24" :xl="12">
        <el-card class="panel-card">
          <template #header>异常 / 死锁线索</template>
          <el-alert
            type="warning"
            :closable="false"
            title="如果遇到卡死或死锁，先看活动请求、慢请求、慢 SQL，再看 goroutine / block / mutex profile。"
            class="hint-alert"
          />
          <el-collapse>
            <el-collapse-item
              v-for="(item, index) in panicEvents"
              :key="`${item.createdAt}-${index}`"
              :title="`${item.createdAt} | ${item.method} ${item.route || item.path}`"
              :name="index"
            >
              <div class="panic-meta">
                <div>来源 IP：{{ item.clientIp || '-' }}</div>
                <div>Query：{{ item.query || '-' }}</div>
                <div>错误：{{ item.error }}</div>
              </div>
              <pre class="stack-box">{{ item.stack }}</pre>
            </el-collapse-item>
          </el-collapse>
        </el-card>
      </el-col>

      <el-col :xs="24" :xl="12">
        <el-card class="panel-card">
          <template #header>pprof 开关与抓样</template>
          <div class="settings-grid">
            <div class="setting-item">
              <div class="setting-top">
                <div>
                  <div class="setting-title">阻塞等待采样</div>
                  <div class="setting-help">建议按需开启。`1000000` 表示按 1ms 阻塞时间采样。</div>
                </div>
                <div class="setting-toggle">
                  <el-switch v-model="settingForm.enableBlockProfile" size="small" />
                  <el-tag :type="settingForm.enableBlockProfile ? 'success' : 'info'" size="small">
                    {{ settingForm.enableBlockProfile ? '已开启' : '已关闭' }}
                  </el-tag>
                </div>
              </div>
              <div class="setting-input-row">
                <span class="setting-input-label">采样速率</span>
                <el-input-number v-model="settingForm.blockProfileRate" :min="0" :step="100000" />
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-top">
                <div>
                  <div class="setting-title">锁竞争采样</div>
                  <div class="setting-help">`5` 表示大约采样五分之一的锁竞争事件。</div>
                </div>
                <div class="setting-toggle">
                  <el-switch v-model="settingForm.enableMutexProfile" size="small" />
                  <el-tag :type="settingForm.enableMutexProfile ? 'success' : 'info'" size="small">
                    {{ settingForm.enableMutexProfile ? '已开启' : '已关闭' }}
                  </el-tag>
                </div>
              </div>
              <div class="setting-input-row">
                <span class="setting-input-label">采样比例</span>
                <el-input-number v-model="settingForm.mutexFraction" :min="0" :step="1" />
              </div>
            </div>

            <div class="setting-actions">
              <el-button type="primary" @click="saveSettings">保存采样设置</el-button>
            </div>
          </div>

          <el-divider />

          <div class="cpu-capture">
            <div class="cpu-toolbar">
              <div>
                <div class="sub-title">CPU 抓样</div>
                <div class="setting-help">复现高 CPU 功能时点击抓样，页面会等待采样结束后返回热点函数。</div>
              </div>
              <div class="cpu-actions">
                <el-input-number v-model="cpuForm.seconds" :min="5" :max="60" :step="5" />
                <el-button type="primary" :icon="VideoPlay" :loading="cpuLoading" @click="runCpuCapture">抓 CPU</el-button>
                <el-button :icon="Download" @click="downloadCpuRaw">下载最近 CPU Profile</el-button>
              </div>
            </div>
            <el-table :data="cpuTopRows" size="small" max-height="240" stripe>
              <el-table-column prop="function" label="函数" min-width="260" show-overflow-tooltip />
              <el-table-column prop="flatMs" label="Flat(ms)" width="100" />
              <el-table-column prop="flatPercent" label="Flat%" width="90" />
              <el-table-column prop="cumulativeMs" label="Cum(ms)" width="100" />
              <el-table-column prop="cumulativePercent" label="Cum%" width="90" />
            </el-table>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="panel-card profile-card">
      <template #header>
        <div class="card-header">
          <span>pprof 文本查看</span>
          <div class="header-tools">
            <el-select v-model="profileForm.name" class="profile-select">
              <el-option
                v-for="item in profileOptions"
                :key="item.name"
                :label="`${item.name}${item.manualToggle ? ' / 手动开关' : ''}`"
                :value="item.name"
              />
            </el-select>
            <el-select v-model="profileForm.debug" class="profile-select">
              <el-option label="debug=1" :value="1" />
              <el-option label="debug=2" :value="2" />
            </el-select>
            <el-switch v-model="profileForm.gc" active-text="heap 前先 GC" inactive-text="直接抓取" />
            <el-button :icon="RefreshRight" :loading="profileLoading" @click="loadProfileText">读取文本</el-button>
            <el-button :icon="Download" @click="downloadProfileRaw">下载原始文件</el-button>
          </div>
        </div>
      </template>

      <el-row :gutter="16">
        <el-col :xs="24" :xl="7">
          <el-table :data="profileOptions" size="small" stripe>
            <el-table-column prop="name" label="Profile" width="140" />
            <el-table-column prop="enabled" label="已开启" width="90">
              <template #default="{ row }">
                <el-tag :type="row.enabled ? 'success' : 'info'">
                  {{ row.enabled ? '是' : '否' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="count" label="Count" width="90" />
            <el-table-column prop="description" label="说明" min-width="180" show-overflow-tooltip />
          </el-table>
          <ul class="notes-list">
            <li v-for="(item, index) in notes" :key="index">{{ item }}</li>
          </ul>
        </el-col>

        <el-col :xs="24" :xl="17">
          <div class="profile-meta">
            <span>抓取时间：{{ profileMeta.collectedAt || '-' }}</span>
            <el-tag v-if="profileMeta.truncated" type="warning">文本已截断</el-tag>
          </div>

          <div v-if="profileReadableSummary" class="readable-summary">
            <el-alert
              :closable="false"
              :type="profileReadableSummary.level || 'success'"
              :title="profileReadableSummary.summaryText"
              class="hint-alert"
            />
            <el-descriptions :column="2" border size="small" class="mini-desc readable-desc">
              <el-descriptions-item
                v-for="item in profileReadableSummary.metricItems || []"
                :key="item.label"
                :label="item.label"
              >
                {{ item.value }}
              </el-descriptions-item>
            </el-descriptions>
            <el-table :data="profileReadableSummary.groups" size="small" stripe class="readable-table">
              <el-table-column prop="count" label="数量" width="70" />
              <el-table-column prop="valueText" label="核心数值" width="170" show-overflow-tooltip />
              <el-table-column label="类型" width="140">
                <template #default="{ row }">
                  <el-tag :type="row.levelTag">
                    {{ row.title }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="detail" label="人话说明" min-width="240" show-overflow-tooltip />
              <el-table-column prop="featureText" label="可能关联功能" min-width="220" show-overflow-tooltip />
              <el-table-column prop="locationText" label="关键位置" min-width="180" show-overflow-tooltip />
            </el-table>
          </div>

          <div class="sub-title raw-profile-title">原始文本</div>
          <pre class="profile-box">{{ profileText || '请选择 profile 后点击“读取文本”。' }}</pre>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, RefreshRight, SwitchButton, VideoPlay } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import * as monitorApi from '@/api/监控页'

const createOverview = () => ({
  server: {
    os: {},
    cpu: { cpus: [] },
    ram: {},
    disk: {}
  },
  runtime: {},
  database: {},
  routes: [],
  routeTrends: [],
  activeRequests: [],
  slowRequests: [],
  panicEvents: [],
  alerts: [],
  pprof: {
    profiles: [],
    lastCpuTop: []
  },
  notes: []
})

const createProcessSnapshot = () => ({
  collectedAt: '',
  processes: []
})

const normalizeOverview = (data = {}) => {
  const base = createOverview()
  return {
    ...base,
    ...data,
    server: {
      ...base.server,
      ...(data.server || {}),
      os: { ...(data.server?.os || {}) },
      cpu: { cpus: [], ...(data.server?.cpu || {}) },
      ram: { ...(data.server?.ram || {}) },
      disk: { ...(data.server?.disk || {}) }
    },
    runtime: { ...(data.runtime || {}) },
    database: { ...(data.database || {}) },
    routes: data.routes || [],
    routeTrends: data.routeTrends || [],
    activeRequests: data.activeRequests || [],
    slowRequests: data.slowRequests || [],
    panicEvents: data.panicEvents || [],
    alerts: data.alerts || [],
    pprof: {
      ...base.pprof,
      ...(data.pprof || {}),
      profiles: data.pprof?.profiles || [],
      lastCpuTop: data.pprof?.lastCpuTop || []
    },
    notes: data.notes || []
  }
}

const loading = ref(false)
const profileLoading = ref(false)
const cpuLoading = ref(false)
const processLoading = ref(false)
const autoRefresh = ref(true)
const autoRefreshSeconds = ref(5)
const timer = ref(null)
const lastRefreshAt = ref('')
const overview = ref(createOverview())
const processSnapshot = ref(createProcessSnapshot())

const routeKeyword = ref('')
const routeSort = ref('totalMs')
const profileText = ref('')
const profileMeta = ref({
  collectedAt: '',
  truncated: false
})
const settingForm = ref({
  enableBlockProfile: false,
  blockProfileRate: 1000000,
  enableMutexProfile: false,
  mutexFraction: 5
})
const cpuForm = ref({
  seconds: 10
})
const profileForm = ref({
  name: 'goroutine',
  debug: 1,
  gc: false
})

const routeTrendChartRef = ref(null)
let routeTrendChart = null
const routeTrendKey = ref('')
const routeTrendMetric = ref('p95Ms')
const routeTrendRange = ref('15m')

const serverOs = computed(() => overview.value.server?.os || {})
const serverCpu = computed(() => overview.value.server?.cpu || { cpus: [] })
const serverRam = computed(() => overview.value.server?.ram || {})
const serverDisk = computed(() => overview.value.server?.disk || {})
const runtimeInfo = computed(() => overview.value.runtime || {})
const databaseInfo = computed(() => overview.value.database || {})
const dbPool = computed(() => databaseInfo.value.pool || {})
const slowSqlRows = computed(() => databaseInfo.value.slowSqls || [])
const dbErrorRows = computed(() => databaseInfo.value.errors || [])
const sqlTemplateRows = computed(() => databaseInfo.value.sqlTemplates || [])
const activeRequests = computed(() => overview.value.activeRequests || [])
const slowRequests = computed(() => overview.value.slowRequests || [])
const panicEvents = computed(() => overview.value.panicEvents || [])
const profileOptions = computed(() => overview.value.pprof?.profiles || [])
const notes = computed(() => overview.value.notes || [])
const cpuTopRows = computed(() => overview.value.pprof?.lastCpuTop || [])
const lastRefreshText = computed(() => lastRefreshAt.value || '未刷新')
const processCollectedAtText = computed(() => processSnapshot.value.collectedAt || '未采集')
const processRows = computed(() => {
  return (processSnapshot.value.processes || []).map((item) => ({
    ...item,
    cpuPercent: Number(item.cpuPercent || 0).toFixed(2),
    memoryMb: Number(item.memoryMb || 0).toFixed(2),
    memoryPercent: Number(item.memoryPercent || 0).toFixed(2),
    uptimeText: formatSeconds(item.uptimeSeconds || 0),
    command: item.command || '-'
  }))
})
const alertRows = computed(() => {
  const list = overview.value.alerts || []
  if (list.length > 0) {
    return list
  }
  return [
    {
      level: 'success',
      title: '当前没有重点告警',
      detail: 'CPU、内存、磁盘、慢请求和数据库死锁都还在安全范围内。'
    }
  ]
})
const routeTrendOptions = computed(() => {
  return (overview.value.routeTrends || []).map((item) => ({
    key: buildRouteTrendKey(item),
    label: `${item.method} ${item.route}`
  }))
})
const selectedRouteTrend = computed(() => {
  return (overview.value.routeTrends || []).find((item) => buildRouteTrendKey(item) === routeTrendKey.value) || null
})
const filteredRouteTrendPoints = computed(() => {
  const points = [...(selectedRouteTrend.value?.points || [])].sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()
  )
  const rangeStart = resolveRouteTrendRangeStart(routeTrendRange.value)
  return points.filter((item) => new Date(item.at).getTime() >= rangeStart)
})
const profileReadableSummary = computed(() => buildReadableProfile(profileForm.value.name, profileText.value))
const filteredRoutes = computed(() => {
  const keyword = routeKeyword.value.trim().toLowerCase()
  const list = [...(overview.value.routes || [])].filter((item) => {
    if (!keyword) {
      return true
    }
    return `${item.method} ${item.route}`.toLowerCase().includes(keyword)
  })
  const sortKey = routeSort.value
  list.sort((a, b) => Number(b[sortKey] || 0) - Number(a[sortKey] || 0))
  return list
})

const routeTrendMetricMap = {
  count: { label: '请求次数', unit: '次' },
  errorCount: { label: '错误次数', unit: '次' },
  avgMs: { label: '平均耗时', unit: 'ms' },
  p95Ms: { label: 'P95 耗时', unit: 'ms' }
}

const syncSettingsFromOverview = () => {
  settingForm.value.enableBlockProfile = !!runtimeInfo.value.blockProfileEnabled
  settingForm.value.blockProfileRate = Number(runtimeInfo.value.blockProfileRate || 1000000)
  settingForm.value.enableMutexProfile = !!runtimeInfo.value.mutexProfileEnabled
  settingForm.value.mutexFraction = Number(runtimeInfo.value.mutexProfileFraction || 5)
}

const buildRouteTrendKey = (item) => `${item?.method || ''} ${item?.route || ''}`.trim()

const resolveRouteTrendRangeStart = (range) => {
  const now = Date.now()
  if (range === '5m') {
    return now - 5 * 60 * 1000
  }
  if (range === '15m') {
    return now - 15 * 60 * 1000
  }
  return now - 60 * 60 * 1000
}

const formatRouteTrendTime = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value || '-'
  }
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const formatTrendMetricValue = (metric, value) => {
  const number = Number(value || 0)
  if (metric === 'count' || metric === 'errorCount') {
    return `${number.toFixed(0)} 次`
  }
  return `${number.toFixed(2)} ms`
}

const formatTrendAxisValue = (metric, value) => {
  const number = Number(value || 0)
  if (metric === 'count' || metric === 'errorCount') {
    return `${number.toFixed(0)}`
  }
  return `${number.toFixed(0)} ms`
}

const queueRouteTrendRender = () => {
  nextTick(() => {
    renderRouteTrendChart()
  })
}

const renderRouteTrendChart = () => {
  if (!routeTrendChartRef.value) {
    return
  }
  if (!routeTrendChart) {
    routeTrendChart = echarts.init(routeTrendChartRef.value)
  }

  const selected = selectedRouteTrend.value
  const points = filteredRouteTrendPoints.value
  const metric = routeTrendMetric.value
  const metricMeta = routeTrendMetricMap[metric] || routeTrendMetricMap.p95Ms
  const hasData = !!selected && points.length > 0

  routeTrendChart.setOption(
    {
      animationDuration: 200,
      color: ['#2f6fed'],
      title: {
        left: 0,
        top: 0,
        text: selected ? `${selected.method} ${selected.route}` : '暂无路由趋势数据',
        textStyle: {
          color: '#243040',
          fontSize: 14,
          fontWeight: 600
        }
      },
      grid: {
        left: 52,
        right: 24,
        top: 56,
        bottom: 36
      },
      tooltip: {
        trigger: 'axis',
        confine: true,
        formatter(params) {
          if (!params?.length || !selected) {
            return '暂无数据'
          }
          const point = points[params[0].dataIndex] || {}
          return [
            `${selected.method} ${selected.route}`,
            formatRouteTrendTime(point.at),
            `${metricMeta.label}：${formatTrendMetricValue(metric, point[metric])}`,
            `请求次数：${Number(point.count || 0).toFixed(0)} 次`,
            `错误次数：${Number(point.errorCount || 0).toFixed(0)} 次`
          ].join('<br/>')
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: hasData ? points.map((item) => formatRouteTrendTime(item.at)) : [],
        axisLabel: {
          color: '#6b7684'
        }
      },
      yAxis: {
        type: 'value',
        name: metricMeta.label,
        nameTextStyle: {
          color: '#6b7684'
        },
        axisLabel: {
          color: '#6b7684',
          formatter: (value) => formatTrendAxisValue(metric, value)
        },
        splitLine: {
          lineStyle: {
            color: '#ebeff5'
          }
        }
      },
      graphic: hasData
        ? []
        : [
            {
              type: 'text',
              left: 'center',
              top: 'middle',
              style: {
                text: selected ? '当前时间范围内还没有采样点' : '先产生一些请求，这里才会出现趋势图',
                fill: '#8a93a0',
                fontSize: 14
              }
            }
          ],
      series: [
        {
          name: metricMeta.label,
          type: 'line',
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 3
          },
          areaStyle: {
            opacity: 0.12
          },
          data: hasData ? points.map((item) => Number(item[metric] || 0)) : []
        }
      ]
    },
    true
  )
}

const resizeRouteTrendChart = () => {
  routeTrendChart?.resize()
}

const loadOverview = async (showLoading = false) => {
  if (showLoading) {
    loading.value = true
  }
  try {
    const res = await monitorApi.getMonitorOverview()
    overview.value = normalizeOverview(res.data || {})
    syncSettingsFromOverview()
    lastRefreshAt.value = new Date().toLocaleString()
    queueRouteTrendRender()
  } finally {
    if (showLoading) {
      loading.value = false
    }
  }
}

const handleManualRefresh = async () => {
  await loadOverview(true)
}

const loadProfileText = async () => {
  profileLoading.value = true
  try {
    const res = await monitorApi.getMonitorProfileText(profileForm.value)
    profileText.value = res.data?.text || ''
    profileMeta.value.collectedAt = res.data?.collectedAt || ''
    profileMeta.value.truncated = !!res.data?.truncated
  } finally {
    profileLoading.value = false
  }
}

const saveSettings = async () => {
  const res = await monitorApi.updateMonitorSettings(settingForm.value)
  overview.value.runtime = {
    ...overview.value.runtime,
    ...(res.data || {})
  }
  syncSettingsFromOverview()
  ElMessage.success('采样设置已更新')
}

const runCpuCapture = async () => {
  cpuLoading.value = true
  try {
    const res = await monitorApi.captureCPUProfile(cpuForm.value)
    overview.value.pprof = {
      ...(overview.value.pprof || {}),
      lastCpuTop: res.data?.top || []
    }
    overview.value.runtime = {
      ...overview.value.runtime,
      lastCpuProfileAt: res.data?.capturedAt || '',
      lastCpuProfileSeconds: res.data?.durationSeconds || cpuForm.value.seconds
    }
    ElMessage.success(`CPU Profile 抓取完成，时长 ${res.data?.durationSeconds || cpuForm.value.seconds} 秒`)
  } finally {
    cpuLoading.value = false
  }
}

const loadProcessTop = async () => {
  processLoading.value = true
  try {
    const res = await monitorApi.getMonitorProcessTop()
    processSnapshot.value = res.data || createProcessSnapshot()
  } finally {
    processLoading.value = false
  }
}

const downloadBlobResponse = async (response, fallbackName) => {
  const blob = response?.data
  if (!blob) {
    return false
  }
  if (blob.type?.includes('application/json')) {
    const text = await blob.text()
    try {
      const json = JSON.parse(text)
      ElMessage.error(json.msg || '下载失败')
    } catch {
      ElMessage.error('下载失败')
    }
    return false
  }

  const disposition = response.headers?.['content-disposition'] || ''
  const matched = disposition.match(/filename="?([^"]+)"?/)
  const fileName = matched?.[1] || fallbackName
  const href = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = href
  link.download = decodeURIComponent(fileName)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(href)
  return true
}

const downloadProfileRaw = async () => {
  const response = await monitorApi.downloadMonitorProfile({
    name: profileForm.value.name,
    gc: profileForm.value.gc
  })
  await downloadBlobResponse(response, `${profileForm.value.name}.pprof`)
}

const downloadCpuRaw = async () => {
  const response = await monitorApi.downloadLastCPUProfile()
  await downloadBlobResponse(response, 'cpu.pprof')
}

const stopSystem = async () => {
  await monitorApi.stopSystem()
  ElMessage.warning('停止命令已发送')
}

const resetTimer = () => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
  if (!autoRefresh.value) {
    return
  }
  timer.value = setInterval(() => {
    loadOverview()
  }, autoRefreshSeconds.value * 1000)
}

watch(
  routeTrendOptions,
  (options) => {
    if (!options.some((item) => item.key === routeTrendKey.value)) {
      routeTrendKey.value = options[0]?.key || ''
    }
  },
  { immediate: true }
)

watch(
  [() => overview.value.routeTrends, routeTrendKey, routeTrendMetric, routeTrendRange],
  () => {
    queueRouteTrendRender()
  },
  { deep: true }
)

watch([autoRefresh, autoRefreshSeconds], resetTimer)

onMounted(async () => {
  window.addEventListener('resize', resizeRouteTrendChart)
  await loadOverview(true)
  resetTimer()
  queueRouteTrendRender()
})

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
  window.removeEventListener('resize', resizeRouteTrendChart)
  if (routeTrendChart) {
    routeTrendChart.dispose()
    routeTrendChart = null
  }
})

const formatSeconds = (seconds) => {
  const value = Number(seconds || 0)
  if (value < 60) {
    return `${value}s`
  }
  if (value < 3600) {
    return `${Math.floor(value / 60)}m ${value % 60}s`
  }
  return `${Math.floor(value / 3600)}h ${Math.floor((value % 3600) / 60)}m`
}

const percent = (value) => `${(Number(value || 0) * 100).toFixed(2)}%`
const mb = (value) => `${Number(value || 0).toFixed(2)} MB`
const ms = (value) => `${Number(value || 0).toFixed(2)} ms`

const buildReadableProfile = (name, text) => {
  if (!text) {
    return null
  }
  if (name === 'goroutine') {
    return parseGoroutineProfile(text)
  }
  if (name === 'heap' || name === 'allocs') {
    return parseHeapProfile(name, text)
  }
  if (name === 'block' || name === 'mutex') {
    return parseContentionProfile(name, text)
  }
  return null
}

const parseGoroutineProfile = (text) => {
  const normalizedText = String(text || '').replace(/\r/g, '')
  const totalMatch = normalizedText.match(/goroutine profile:\s*total\s+(\d+)/i)
  const sections = normalizedText.split(/\n\s*\n/)
  const groups = []

  for (const section of sections) {
    const lines = section.split('\n').map((item) => item.trimEnd()).filter(Boolean)
    if (!lines.length || !/^\d+\s+@/.test(lines[0].trim())) {
      continue
    }

    const countMatch = lines[0].trim().match(/^(\d+)\s+@/)
    const count = Number(countMatch?.[1] || 0)
    const frames = lines.filter((line) => line.trim().startsWith('#')).map(parseStackFrame).filter(Boolean)
    groups.push(explainGoroutineGroup(count, frames))
  }

  groups.sort(sortReadableGroups)

  const total = Number(totalMatch?.[1] || groups.reduce((sum, item) => sum + Number(item.count || 0), 0))
  const currentProfileCount = groups
    .filter((item) => item.kind === 'currentProfile')
    .reduce((sum, item) => sum + Number(item.count || 0), 0)
  const watchCount = groups
    .filter((item) => item.levelTag === 'danger' || item.levelTag === 'warning')
    .reduce((sum, item) => sum + Number(item.count || 0), 0)
  const backgroundCount = Math.max(total - currentProfileCount - watchCount, 0)

  return {
    level: watchCount > 0 ? 'warning' : 'success',
    summaryText:
      watchCount > 0
        ? `共 ${total} 个 goroutine，其中 ${watchCount} 个值得优先关注。`
        : `共 ${total} 个 goroutine，当前没有明显卡在业务代码里的堆栈。`,
    metricItems: [
      { label: 'goroutine 总数', value: `${total}` },
      { label: '需关注堆栈', value: `${watchCount}` },
      { label: '后台/等待', value: `${backgroundCount}` },
      { label: '本次采样自身', value: `${currentProfileCount}` }
    ],
    groups
  }
}

const parseHeapProfile = (name, text) => {
  const normalizedText = String(text || '').replace(/\r/g, '')
  const headerMatch = normalizedText.match(/(?:heap|allocs) profile:\s*(\d+):\s*(\d+)\s*\[(\d+):\s*(\d+)\]/i)
  const sections = normalizedText.split(/\n\s*\n/)
  const groups = []

  for (const section of sections) {
    const lines = section.split('\n').map((item) => item.trimEnd()).filter(Boolean)
    if (!lines.length || !/^\d+:\s*\d+\s+\[\d+:\s*\d+\]\s+@/.test(lines[0].trim())) {
      continue
    }

    const groupMatch = lines[0].trim().match(/^(\d+):\s*(\d+)\s+\[(\d+):\s*(\d+)\]\s+@/)
    const currentCount = Number(groupMatch?.[1] || 0)
    const currentBytes = Number(groupMatch?.[2] || 0)
    const totalCount = Number(groupMatch?.[3] || 0)
    const totalBytes = Number(groupMatch?.[4] || 0)
    const frames = lines.filter((line) => line.trim().startsWith('#')).map(parseStackFrame).filter(Boolean)

    groups.push(explainHeapGroup(name, currentCount, currentBytes, totalCount, totalBytes, frames))
  }

  groups.sort(sortReadableGroups)

  const currentObjects = Number(headerMatch?.[1] || 0)
  const currentBytes = Number(headerMatch?.[2] || 0)
  const totalObjects = Number(headerMatch?.[3] || 0)
  const totalBytes = Number(headerMatch?.[4] || 0)

  return {
    level: currentBytes >= 512 * 1024 * 1024 ? 'warning' : 'info',
    summaryText:
      name === 'allocs'
        ? '这里显示历史累计分配最重的调用路径，更适合找“哪里一直在创建对象”。'
        : '这里显示当前仍留在堆里的对象来源，更适合找“现在哪些功能最吃内存”。',
    metricItems: [
      { label: '采样类型', value: name === 'allocs' ? '累计分配' : '当前堆快照' },
      { label: '当前对象数', value: `${currentObjects}` },
      { label: '当前内存', value: formatBytes(currentBytes) },
      { label: '累计对象数', value: `${totalObjects}` },
      { label: '累计内存', value: formatBytes(totalBytes) }
    ],
    groups
  }
}

const parseContentionProfile = (name, text) => {
  const normalizedText = String(text || '').replace(/\r/g, '')
  const cyclesMatch = normalizedText.match(/cycles\/second\s*=\s*(\d+)/i)
  const cyclesPerSecond = Number(cyclesMatch?.[1] || 0)
  const sections = normalizedText.split(/\n\s*\n/)
  const groups = []
  let totalDelayMs = 0
  let totalCount = 0

  for (const section of sections) {
    const lines = section.split('\n').map((item) => item.trimEnd()).filter(Boolean)
    if (!lines.length || !/^\d+\s+\d+\s+@/.test(lines[0].trim())) {
      continue
    }

    const groupMatch = lines[0].trim().match(/^(\d+)\s+(\d+)\s+@/)
    const cycles = Number(groupMatch?.[1] || 0)
    const count = Number(groupMatch?.[2] || 0)
    const delayMs = cyclesPerSecond > 0 ? (cycles / cyclesPerSecond) * 1000 : 0
    const frames = lines.filter((line) => line.trim().startsWith('#')).map(parseStackFrame).filter(Boolean)

    totalDelayMs += delayMs
    totalCount += count
    groups.push(explainContentionGroup(name, count, delayMs, frames))
  }

  groups.sort(sortReadableGroups)

  return {
    level: groups.some((item) => item.levelTag === 'danger') ? 'warning' : 'info',
    summaryText:
      name === 'mutex'
        ? '这里显示锁竞争最重的调用路径，重点看哪些业务函数在争抢同一把锁。'
        : '这里显示阻塞等待最重的调用路径，重点看哪些业务功能卡在通道、锁或 I/O 上。',
    metricItems: [
      { label: '采样类型', value: name === 'mutex' ? '互斥锁竞争' : '阻塞等待' },
      { label: '累计等待', value: `${totalDelayMs.toFixed(2)} ms` },
      { label: '累计事件数', value: `${totalCount}` },
      { label: 'cycles/second', value: cyclesPerSecond ? `${cyclesPerSecond}` : '-' }
    ],
    groups
  }
}

const parseStackFrame = (line) => {
  const cleaned = line.trim()
  const matched = cleaned.match(/^#\s+(\S+)\s+(.+?)\+0x[0-9a-fA-F]+\s+(.+)$/)
  if (!matched) {
    return null
  }

  const fullFunction = matched[2].trim()
  const location = matched[3].trim()
  return {
    pc: matched[1],
    fullFunction,
    functionName: shortFunctionName(fullFunction),
    location,
    shortLocation: shortLocationName(location)
  }
}

const explainGoroutineGroup = (count, frames) => {
  const frameNames = frames.map((item) => item.fullFunction)
  const businessFrame = findBusinessFrame(frames)
  const keyFrame = businessFrame || frames[0] || null

  if (hasFrame(frameNames, 'runtime/pprof.writeGoroutine') || hasFrame(frameNames, 'server/app/monitoring.')) {
    return buildReadableGroup(
      count,
      'currentProfile',
      'info',
      '当前正在生成监控快照',
      '这是你点击“读取文本”时临时产生的采样协程，不是异常。',
      keyFrame,
      `${count} 个 goroutine`,
      count
    )
  }
  if (hasFrame(frameNames, 'net/http.(*Server).Serve') || hasFrame(frameNames, 'internal/poll.(*FD).Accept')) {
    return buildReadableGroup(
      count,
      'httpListen',
      'success',
      'HTTP 监听协程',
      '服务正在等待新的 HTTP 请求进入，属于正常常驻协程。',
      keyFrame,
      `${count} 个 goroutine`,
      count
    )
  }
  if (hasFrame(frameNames, 'net/http.(*connReader).backgroundRead')) {
    return buildReadableGroup(
      count,
      'httpIdle',
      'success',
      'HTTP 连接空闲等待',
      '连接已经建立，但当前只是等待客户端继续发送数据，通常不是卡死。',
      keyFrame,
      `${count} 个 goroutine`,
      count
    )
  }
  if (hasFrame(frameNames, 'database/sql.(*DB).connectionCleaner')) {
    return buildReadableGroup(
      count,
      'dbCleaner',
      'success',
      '数据库连接池清理',
      '这是数据库连接池的后台清理协程，属于正常维护任务。',
      keyFrame,
      `${count} 个 goroutine`,
      count
    )
  }
  if (hasFrame(frameNames, 'database/sql.(*DB).connectionOpener')) {
    return buildReadableGroup(
      count,
      'dbOpener',
      'success',
      '数据库连接池建连',
      '数据库连接池在后台等待或创建连接，通常是正常行为。',
      keyFrame,
      `${count} 个 goroutine`,
      count
    )
  }
  if (hasFrame(frameNames, 'github.com/go-sql-driver/mysql.(*mysqlConn).startWatcher')) {
    return buildReadableGroup(
      count,
      'mysqlWatcher',
      'success',
      'MySQL 驱动 watcher',
      '这是 MySQL 驱动内部的后台 watcher，通常可以忽略。',
      keyFrame,
      `${count} 个 goroutine`,
      count
    )
  }
  if (hasFrame(frameNames, 'github.com/robfig/cron/v3.(*Cron).run')) {
    return buildReadableGroup(
      count,
      'cron',
      'primary',
      '定时任务调度',
      '这是 cron 调度器的常驻协程；若怀疑某个定时任务卡住，还要继续看任务执行时的调用栈。',
      keyFrame,
      `${count} 个 goroutine`,
      count
    )
  }
  if (hasFrame(frameNames, 'github.com/gogf/gf/v2/os/gtimer.(*Timer).loop')) {
    return buildReadableGroup(
      count,
      'timer',
      'primary',
      '框架定时器循环',
      '这是框架内部定时器循环，本身通常不是问题。',
      keyFrame,
      `${count} 个 goroutine`,
      count
    )
  }
  if (hasFrame(frameNames, 'github.com/gogf/gf/v2/util/grand.asyncProducingRandomBufferBytesLoop')) {
    return buildReadableGroup(
      count,
      'randomBuffer',
      'info',
      '随机数缓冲线程',
      '框架在后台预生成随机字节缓存，属于正常框架行为。',
      keyFrame,
      `${count} 个 goroutine`,
      count
    )
  }
  if (hasFrame(frameNames, 'github.com/qiniu/go-sdk/v7/internal/uplog')) {
    return buildReadableGroup(
      count,
      'qiniuUplog',
      'info',
      '七牛上传日志线程',
      '这是七牛 SDK 的后台日志缓冲协程，通常不是异常。',
      keyFrame,
      `${count} 个 goroutine`,
      count
    )
  }
  if (hasFrame(frameNames, 'server/app/utils/Qqwry')) {
    return buildReadableGroup(
      count,
      'qqwry',
      'info',
      'IP 地址库后台线程',
      '这是 IP 地址库相关的后台协程，通常可以忽略。',
      keyFrame,
      `${count} 个 goroutine`,
      count
    )
  }
  if (businessFrame) {
    return buildReadableGroup(
      count,
      'business',
      'warning',
      '业务协程停在业务代码',
      '这组协程已经进入你的业务代码，建议结合“慢请求 / 路由热点 / SQL 面板”继续排查。',
      keyFrame,
      `${count} 个 goroutine`,
      count
    )
  }
  if (hasFrame(frameNames, 'internal/poll.runtime_pollWait')) {
    return buildReadableGroup(
      count,
      'netPoll',
      'primary',
      '网络 I/O 等待',
      '协程正在等待网络事件，单看这一条堆栈无法说明异常，需要结合上层业务函数一起看。',
      keyFrame,
      `${count} 个 goroutine`,
      count
    )
  }

  return buildReadableGroup(
    count,
    'unknown',
    'warning',
    '暂时无法自动归类',
    '这组协程没有命中已知模式，建议查看原始堆栈和第一个业务函数。',
    keyFrame,
    `${count} 个 goroutine`,
    count
  )
}

const explainHeapGroup = (name, currentCount, currentBytes, totalCount, totalBytes, frames) => {
  const frameNames = frames.map((item) => item.fullFunction)
  const businessFrame = findBusinessFrame(frames)
  const keyFrame = businessFrame || frames[0] || null
  const valueText = `${formatBytes(currentBytes)} / ${currentCount} 个；累计 ${formatBytes(totalBytes)} / ${totalCount} 次`
  const sortValue = currentBytes || totalBytes || currentCount || totalCount
  const count = currentCount || totalCount || 1

  if (businessFrame) {
    return buildReadableGroup(
      count,
      'businessHeap',
      sortValue >= 64 * 1024 * 1024 ? 'warning' : 'primary',
      '业务分配热点',
      name === 'allocs'
        ? '这条调用链历史上创建过很多对象，说明这个业务路径一直在分配内存。'
        : '这条调用链当前还持有较多堆内存，通常更接近真正的内存占用来源。',
      keyFrame,
      valueText,
      sortValue
    )
  }
  if (hasFrame(frameNames, 'database/sql') || hasFrame(frameNames, 'gorm.io/')) {
    return buildReadableGroup(
      count,
      'dbHeap',
      'primary',
      '数据库相关分配',
      '这组内存来自数据库查询、扫描或 ORM 过程，建议结合慢 SQL 和结果集大小一起看。',
      keyFrame,
      valueText,
      sortValue
    )
  }
  if (hasFrame(frameNames, 'net/http') || hasFrame(frameNames, 'github.com/gin-gonic/gin')) {
    return buildReadableGroup(
      count,
      'httpHeap',
      'info',
      'HTTP 链路分配',
      '这组对象更多出现在请求处理链路里，常见于请求体、响应体、JSON 编解码。',
      keyFrame,
      valueText,
      sortValue
    )
  }

  return buildReadableGroup(
    count,
    'commonHeap',
    'info',
    '常见分配路径',
    '这条路径没有明显落到业务函数，建议继续结合原始堆栈和上游调用者排查。',
    keyFrame,
    valueText,
    sortValue
  )
}

const explainContentionGroup = (name, count, delayMs, frames) => {
  const frameNames = frames.map((item) => item.fullFunction)
  const businessFrame = findBusinessFrame(frames)
  const keyFrame = businessFrame || frames[0] || null
  const valueText = `${delayMs.toFixed(2)} ms / ${count} 次`

  if (businessFrame) {
    return buildReadableGroup(
      count,
      `${name}Business`,
      delayMs >= 200 ? 'danger' : 'warning',
      name === 'mutex' ? '业务锁竞争' : '业务阻塞等待',
      name === 'mutex'
        ? '这条业务调用链发生了明显的锁竞争，优先看共享状态、批量操作或大事务。'
        : '这条业务调用链有明显等待，通常要结合慢请求、SQL 或外部 I/O 一起判断。',
      keyFrame,
      valueText,
      delayMs
    )
  }
  if (hasFrame(frameNames, 'database/sql') || hasFrame(frameNames, 'github.com/go-sql-driver/mysql')) {
    return buildReadableGroup(
      count,
      `${name}Db`,
      'warning',
      '数据库等待',
      '等待点落在数据库相关调用里，优先看慢 SQL、锁等待、连接池和事务范围。',
      keyFrame,
      valueText,
      delayMs
    )
  }
  if (hasFrame(frameNames, 'sync.(*Mutex)') || hasFrame(frameNames, 'sync.(*RWMutex)')) {
    return buildReadableGroup(
      count,
      `${name}Mutex`,
      'primary',
      '锁原语竞争',
      '热点直接落在互斥锁原语上，说明多个 goroutine 正在争用同一把锁。',
      keyFrame,
      valueText,
      delayMs
    )
  }

  return buildReadableGroup(
    count,
    `${name}Common`,
    'info',
    name === 'mutex' ? '通用锁竞争' : '通用阻塞等待',
    '这条等待链没有明显命中已知模式，建议继续查看原始文本里的上游业务调用。',
    keyFrame,
    valueText,
    delayMs
  )
}

const buildReadableGroup = (count, kind, levelTag, title, detail, frame, valueText, sortValue) => ({
  count,
  kind,
  levelTag,
  title,
  detail,
  valueText,
  sortValue: Number(sortValue || 0),
  featureText: frame?.functionName || '-',
  locationText: frame?.shortLocation || '-'
})

const sortReadableGroups = (a, b) => {
  const rank = {
    danger: 0,
    warning: 1,
    primary: 2,
    success: 3,
    info: 4
  }
  if ((rank[a.levelTag] ?? 9) !== (rank[b.levelTag] ?? 9)) {
    return (rank[a.levelTag] ?? 9) - (rank[b.levelTag] ?? 9)
  }
  return Number(b.sortValue || 0) - Number(a.sortValue || 0)
}

const findBusinessFrame = (frames) => {
  return frames.find((item) => {
    const name = item.fullFunction || ''
    return name.includes('server/app/') &&
      !name.includes('server/app/monitoring.') &&
      !name.includes('server/app/router/middleware.') &&
      !name.includes('.Q监控画像文本')
  })
}

const hasFrame = (frameNames, keyword) => frameNames.some((item) => item.includes(keyword))

const shortFunctionName = (name) => {
  if (!name) {
    return '-'
  }
  return name
    .replace(/^server\/app\//, '')
    .replace(/^github\.com\//, '')
}

const shortLocationName = (location) => {
  if (!location) {
    return '-'
  }
  const normalized = location.replace(/\\/g, '/')
  const markers = ['/server2/', '/web3/', '/Go/src/', '/pkg/mod/']
  for (const marker of markers) {
    const index = normalized.indexOf(marker)
    if (index >= 0) {
      return normalized.slice(index + marker.length)
    }
  }
  const matched = normalized.match(/([^/]+:\d+)$/)
  return matched?.[1] || normalized
}

const formatBytes = (value) => {
  const number = Number(value || 0)
  if (number >= 1024 * 1024 * 1024) {
    return `${(number / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }
  if (number >= 1024 * 1024) {
    return `${(number / (1024 * 1024)).toFixed(2)} MB`
  }
  if (number >= 1024) {
    return `${(number / 1024).toFixed(2)} KB`
  }
  return `${number.toFixed(0)} B`
}
</script>

<script>
export default {
  name: 'MonitorPage'
}
</script>

<style lang="scss">
.monitor-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px;
}

.toolbar-card,
.panel-card,
.summary-card {
  border-radius: 14px;
}

.toolbar-row,
.toolbar-left,
.toolbar-actions,
.card-header,
.header-tools,
.cpu-toolbar,
.cpu-actions,
.setting-row {
  display: flex;
  align-items: center;
}

.toolbar-row,
.card-header,
.cpu-toolbar {
  justify-content: space-between;
  gap: 12px;
}

.toolbar-left,
.toolbar-actions,
.header-tools,
.cpu-actions {
  gap: 12px;
  flex-wrap: wrap;
}

.title-block h2 {
  margin: 0;
  font-size: 20px;
}

.title-block p {
  margin: 6px 0 0;
  color: #707985;
  font-size: 13px;
}

.summary-grid,
.content-grid {
  margin-top: 0;
}

.summary-card {
  height: 280px;
}

.summary-card :deep(.el-card__body) {
  height: calc(100% - 50px);
  overflow: auto;
}

.metric-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
  color: #5a6470;
}

.metric-row strong {
  color: #17212b;
}

.metric-note {
  margin-top: 8px;
  color: #717b88;
  font-size: 12px;
  line-height: 1.5;
}

.disk-row {
  margin-top: 12px;
}

.mini-bars {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 12px;
  flex: 1;
  overflow: auto;
  max-height: 120px;
  padding-right: 4px;
}

.mini-bar-item {
  background: #f7f9fc;
  border-radius: 10px;
  padding: 8px;
}

.mini-bar-item span {
  display: block;
  margin-bottom: 6px;
  color: #66707d;
  font-size: 12px;
}

.hint-alert {
  margin-bottom: 12px;
}

.alert-card :deep(.el-card__body) {
  max-height: 320px;
  overflow: auto;
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.monitor-alert {
  border-radius: 12px;
}

.alert-detail {
  line-height: 1.6;
}

.route-trend-route {
  width: 280px;
}

.route-trend-metric,
.route-trend-range {
  width: 140px;
}

.route-trend-chart {
  height: 320px;
}

.route-filter {
  width: 240px;
}

.route-sort,
.profile-select {
  width: 150px;
}

.sub-block {
  margin-top: 16px;
}

.first-sub-block {
  margin-top: 0;
}

.sub-title {
  margin-bottom: 10px;
  color: #27313c;
  font-weight: 600;
}

.mini-desc {
  margin-bottom: 12px;
}

.panic-meta {
  display: grid;
  gap: 6px;
  margin-bottom: 10px;
  color: #596473;
}

.stack-box,
.profile-box {
  margin: 0;
  padding: 12px;
  background: #0f1720;
  color: #dfe7f1;
  border-radius: 10px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 12px;
  line-height: 1.55;
}

.profile-card .profile-box {
  min-height: 520px;
}

.settings-grid {
  display: grid;
  gap: 12px;
}

.setting-item {
  padding: 14px 16px;
  border: 1px solid #e8edf3;
  border-radius: 14px;
  background: #fbfcfe;
}

.setting-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.setting-title {
  color: #27313c;
  font-weight: 600;
  font-size: 14px;
}

.setting-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
}

.setting-input-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
}

.setting-input-label {
  min-width: 72px;
  color: #6b7684;
  font-size: 12px;
}

.setting-input-row :deep(.el-input-number) {
  width: 160px;
}

.setting-input-row :deep(.el-input-number .el-input__inner) {
  text-align: center;
}

.setting-actions {
  padding-top: 2px;
}

.setting-help {
  color: #717b88;
  font-size: 12px;
  line-height: 1.5;
  margin-top: 4px;
}

.profile-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  color: #6b7684;
}

.readable-summary {
  margin-bottom: 14px;
}

.readable-desc {
  margin-bottom: 12px;
}

.readable-table {
  margin-bottom: 12px;
}

.raw-profile-title {
  margin-bottom: 8px;
}

.notes-list {
  margin: 16px 0 0;
  padding-left: 18px;
  color: #5e6976;
  font-size: 12px;
  line-height: 1.7;
}

@media (max-width: 960px) {
  .route-filter,
  .route-sort,
  .profile-select,
  .route-trend-route,
  .route-trend-metric,
  .route-trend-range {
    width: 100%;
  }

  .toolbar-actions,
  .header-tools,
  .cpu-actions,
  .setting-top,
  .setting-input-row {
    width: 100%;
  }

  .toolbar-actions > *,
  .header-tools > *,
  .cpu-actions > * {
    flex: 1 1 auto;
  }

  .setting-toggle {
    margin-left: auto;
  }

  .setting-input-row :deep(.el-input-number) {
    width: 100%;
  }
}
</style>
