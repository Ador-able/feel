<template>
  <div class="progress-view">
    <header class="progress-header">
      <h1>训练进度</h1>
      <p>查看您的练习记录和技能提升曲线</p>
    </header>

    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-icon">📏</div>
        <h3>长度训练</h3>
        <div class="stat-numbers">
          <div class="stat-item" v-if="lengthStats.totalSessions > 0">
            <span class="stat-value">{{ lengthStats.totalSessions }}</span>
            <span class="stat-label">练习次数</span>
          </div>
          <div class="stat-item" v-if="lengthStats.totalSessions > 0">
            <span class="stat-value">{{ lengthStats.averageAccuracy }}%</span>
            <span class="stat-label">平均准确率</span>
          </div>
          <div class="stat-item" v-if="lengthStats.totalSessions > 0">
            <span class="stat-value">{{ lengthStats.bestScore }}</span>
            <span class="stat-label">最高分数</span>
          </div>
          <div class="no-data" v-if="lengthStats.totalSessions === 0">
            <p>📊 暂无长度训练数据</p>
            <router-link to="/length-training" class="start-training-link">开始练习</router-link>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📐</div>
        <h3>角度训练</h3>
        <div class="stat-numbers">
          <div class="stat-item" v-if="angleStats.totalSessions > 0">
            <span class="stat-value">{{ angleStats.totalSessions }}</span>
            <span class="stat-label">练习次数</span>
          </div>
          <div class="stat-item" v-if="angleStats.totalSessions > 0">
            <span class="stat-value">{{ angleStats.averageAccuracy }}%</span>
            <span class="stat-label">平均准确率</span>
          </div>
          <div class="stat-item" v-if="angleStats.totalSessions > 0">
            <span class="stat-value">{{ angleStats.averageError }}°</span>
            <span class="stat-label">平均误差</span>
          </div>
          <div class="no-data" v-if="angleStats.totalSessions === 0">
            <p>📊 暂无角度训练数据</p>
            <router-link to="/angle-training" class="start-training-link">开始练习</router-link>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">⚖️</div>
        <h3>比例训练</h3>
        <div class="stat-numbers">
          <div class="stat-item" v-if="proportionStats.totalSessions > 0">
            <span class="stat-value">{{ proportionStats.totalSessions }}</span>
            <span class="stat-label">练习次数</span>
          </div>
          <div class="stat-item" v-if="proportionStats.totalSessions > 0">
            <span class="stat-value">{{ proportionStats.averageAccuracy }}%</span>
            <span class="stat-label">平均准确率</span>
          </div>
          <div class="stat-item" v-if="proportionStats.totalSessions > 0">
            <span class="stat-value">{{ proportionStats.bestScore }}</span>
            <span class="stat-label">最高分数</span>
          </div>
          <div class="no-data" v-if="proportionStats.totalSessions === 0">
            <p>📊 暂无比例训练数据</p>
            <router-link to="/proportion-training" class="start-training-link">开始练习</router-link>
          </div>
        </div>
      </div>
    </div>

    <div class="progress-charts">
      <div class="chart-container">
        <h3>准确率趋势</h3>
        <div class="chart-area" ref="accuracyChart" v-if="accuracyData.length > 0">
          <svg :width="chartWidth" :height="chartHeight" class="trend-chart">
            <!-- 坐标轴 -->
            <line :x1="padding" :y1="chartHeight - padding" :x2="chartWidth - padding" :y2="chartHeight - padding"
              stroke="#ddd" stroke-width="2" />
            <line :x1="padding" :y1="padding" :x2="padding" :y2="chartHeight - padding" stroke="#ddd"
              stroke-width="2" />

            <!-- 准确率趋势线 -->
            <polyline :points="accuracyTrendPoints" fill="none" stroke="#007bff" stroke-width="3"
              v-if="accuracyTrendPoints" />

            <!-- 数据点 -->
            <circle v-for="(point, index) in accuracyDataPoints" :key="index" :cx="point.x" :cy="point.y" r="4"
              fill="#007bff" />

            <!-- Y轴标签 -->
            <text x="20" y="30" fill="#666" font-size="12">100%</text>
            <text x="20" y="80" fill="#666" font-size="12">75%</text>
            <text x="20" y="130" fill="#666" font-size="12">50%</text>
            <text x="20" y="180" fill="#666" font-size="12">25%</text>
            <text x="20" y="230" fill="#666" font-size="12">0%</text>
          </svg>
        </div>
        <div v-else class="empty-chart">
          <p>暂无趋势数据</p>
          <small>完成更多训练后将显示准确率趋势</small>
        </div>
      </div>

      <div class="chart-container">
        <h3>练习频率</h3>
        <div class="frequency-grid">
          <div class="frequency-day" v-for="day in frequencyData" :key="day.date" :class="{ active: day.sessions > 0 }">
            <div class="day-label">{{ day.label }}</div>
            <div class="day-sessions">{{ day.sessions }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="achievements">
      <h3>成就徽章</h3>
      <div class="achievement-grid">
        <div class="achievement-badge" :class="{ earned: achievement.earned }" v-for="achievement in achievements"
          :key="achievement.id">
          <div class="badge-icon">{{ achievement.icon }}</div>
          <div class="badge-info">
            <h4>{{ achievement.title }}</h4>
            <p>{{ achievement.description }}</p>
            <div v-if="!achievement.earned" class="progress-bar">
              <div class="progress-fill" :style="{ width: achievement.progress + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="practice-log">
      <h3>最近练习记录</h3>
      <div class="log-container" v-if="recentLogs.length > 0">
        <div class="log-item" v-for="log in recentLogs" :key="log.id">
          <div class="log-icon">{{ log.icon }}</div>
          <div class="log-info">
            <h4>{{ log.title }}</h4>
            <p>{{ log.date }} - 准确率: {{ log.accuracy }}% - 分数: {{ log.score }}</p>
          </div>
          <div class="log-score" :class="log.scoreClass">{{ log.score }}</div>
        </div>
      </div>
      <div v-else class="empty-logs">
        <p>暂无练习记录</p>
        <small>开始训练后将显示您的练习历史</small>
      </div>
    </div>

    <div class="tips">
      <h3>个性化建议</h3>
      <div class="tip-cards" v-if="personalizedTips.length > 0">
        <div class="tip-card" v-for="tip in personalizedTips" :key="tip.id">
          <div class="tip-icon">{{ tip.icon }}</div>
          <div class="tip-content">
            <h4>{{ tip.title }}</h4>
            <p>{{ tip.content }}</p>
          </div>
        </div>
      </div>
      <div v-else class="empty-tips">
        <p>💡 暂无个性化建议</p>
        <small>完成更多训练后，我们将根据您的表现提供针对性建议</small>
      </div>
    </div>

    <!-- 演示数据控制 -->
    <div class="demo-controls" v-if="trainingStore.sessions.length === 0">
      <div class="demo-notice">
        <h3>🎯 开始您的训练之旅</h3>
        <p>目前还没有训练记录。您可以开始练习，或者查看演示数据了解功能。</p>
        <div class="demo-buttons">
          <button @click="generateDemo" class="demo-btn">
            📊 查看演示数据
          </button>
          <router-link to="/proportion-training" class="training-btn">
            🎯 开始比例训练
          </router-link>
          <router-link to="/length-training" class="training-btn">
            📏 开始长度训练
          </router-link>
          <router-link to="/angle-training" class="training-btn">
            📐 开始角度训练
          </router-link>
        </div>
      </div>
    </div>

    <div class="data-controls" v-else>
      <details class="data-management">
        <summary>数据管理</summary>
        <div class="control-buttons">
          <button @click="generateDemo" class="demo-btn small">
            重新生成演示数据
          </button>
          <button @click="clearData" class="clear-btn small">
            清除所有数据
          </button>
        </div>
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useTrainingDataStore } from '@/stores/trainingData'

const chartWidth = 500
const chartHeight = 250
const padding = 50

// 使用训练数据存储
const trainingStore = useTrainingDataStore()

// 从存储中获取统计数据
const lengthStats = computed(() => trainingStore.lengthStats)
const angleStats = computed(() => trainingStore.angleStats)
const proportionStats = computed(() => trainingStore.proportionStats)

// 准确率趋势数据
const accuracyData = computed(() => trainingStore.accuracyTrend)

const accuracyDataPoints = computed(() => {
  if (accuracyData.value.length === 0) return []

  return accuracyData.value.map((data, index) => {
    const x = padding + (index * (chartWidth - 2 * padding)) / (accuracyData.value.length - 1)
    const y = chartHeight - padding - (data.accuracy * (chartHeight - 2 * padding)) / 100
    return { x, y }
  })
})

const accuracyTrendPoints = computed(() => {
  if (accuracyDataPoints.value.length === 0) return ''
  return accuracyDataPoints.value.map(point => `${point.x},${point.y}`).join(' ')
})

// 练习频率数据（最近30天）
const frequencyData = computed(() => trainingStore.dailyFrequency)

// 成就系统
const achievements = computed(() => trainingStore.achievements)

// 最近练习记录
const recentLogs = computed(() => {
  return trainingStore.recentSessions.map(session => {
    const typeIcons = {
      length: '📏',
      angle: '📐',
      proportion: '⚖️'
    }

    const typeNames = {
      length: '长度目测训练',
      angle: '角度目测训练',
      proportion: '比例训练'
    }

    const getScoreClass = (accuracy: number) => {
      if (accuracy >= 90) return 'excellent'
      if (accuracy >= 75) return 'good'
      if (accuracy >= 60) return 'normal'
      return 'poor'
    }

    return {
      id: parseInt(session.id),
      type: session.type,
      title: typeNames[session.type],
      date: new Date(session.date).toLocaleDateString('zh-CN'),
      accuracy: session.accuracy,
      score: session.score,
      icon: typeIcons[session.type],
      scoreClass: getScoreClass(session.accuracy)
    }
  })
})

// 个性化建议
const personalizedTips = computed(() => trainingStore.getPersonalizedTips)

// 演示数据和数据管理方法
const generateDemo = () => {
  trainingStore.generateDemoData()
}

const clearData = () => {
  if (confirm('确定要清除所有数据吗？此操作不可恢复。')) {
    trainingStore.clearAllData()
  }
}

onMounted(() => {
  // 确保 store 数据已加载
  trainingStore.loadData()

  // 数据已经在 store 中管理，不需要额外操作
  console.log('进度视图加载，训练数据:', trainingStore.sessions)
  console.log('sessions 数量:', trainingStore.sessions.length)
  console.log('准确率趋势数据:', accuracyData.value)
  console.log('练习频率数据:', frequencyData.value)
  console.log('比例训练统计:', trainingStore.proportionStats)
  console.log('长度训练统计:', trainingStore.lengthStats)
  console.log('角度训练统计:', trainingStore.angleStats)
})
</script>

<style scoped>
.progress-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.progress-header {
  text-align: center;
  margin-bottom: 3rem;
}

.progress-header h1 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.progress-header p {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.stat-card h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.stat-numbers {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 1rem;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #007bff;
}

.stat-label {
  display: block;
  color: #6c757d;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.progress-charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.chart-container {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.chart-container h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  text-align: center;
}

.chart-area {
  display: flex;
  justify-content: center;
}

.trend-chart {
  border: 1px solid #e9ecef;
  border-radius: 8px;
}

.empty-chart {
  height: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.empty-chart p {
  margin: 0 0 0.5rem 0;
  font-weight: bold;
}

.empty-chart small {
  opacity: 0.8;
}

.frequency-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 4px;
}

.frequency-day {
  aspect-ratio: 1;
  background: #f8f9fa;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  transition: all 0.3s ease;
}

.frequency-day.active {
  background: #007bff;
  color: white;
}

.day-label {
  font-weight: bold;
}

.day-sessions {
  margin-top: 2px;
  font-size: 0.7rem;
}

.achievements {
  margin-bottom: 3rem;
}

.achievements h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  text-align: center;
}

.achievement-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.achievement-badge {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.achievement-badge.earned {
  opacity: 1;
  border: 2px solid #28a745;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.badge-icon {
  font-size: 2.5rem;
}

.badge-info {
  flex: 1;
}

.badge-info h4 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.badge-info p {
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.progress-bar {
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #007bff;
  transition: width 0.3s ease;
}

.practice-log {
  margin-bottom: 3rem;
}

.practice-log h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  text-align: center;
}

.log-container {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.log-item {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  gap: 1rem;
}

.log-item:last-child {
  border-bottom: none;
}

.log-icon {
  font-size: 1.5rem;
}

.log-info {
  flex: 1;
}

.log-info h4 {
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.log-info p {
  color: #6c757d;
  font-size: 0.9rem;
}

.log-score {
  font-size: 1.5rem;
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 8px;
}

.log-score.excellent {
  background: #d4edda;
  color: #28a745;
}

.log-score.good {
  background: #cce5ff;
  color: #007bff;
}

.log-score.normal {
  background: #fff3cd;
  color: #856404;
}

.empty-logs {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 3rem 2rem;
  text-align: center;
  color: #6c757d;
  border: 1px solid #e9ecef;
}

.empty-logs p {
  margin: 0 0 0.5rem 0;
  font-weight: bold;
  font-size: 1.1rem;
}

.empty-logs small {
  opacity: 0.8;
}

.tips h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  text-align: center;
}

.tip-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.tip-card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.tip-icon {
  font-size: 2rem;
}

.tip-content h4 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.tip-content p {
  color: #6c757d;
  line-height: 1.5;
}

.empty-tips {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 2rem;
  text-align: center;
  color: #6c757d;
  border: 1px solid #e9ecef;
}

.empty-tips p {
  margin: 0 0 0.5rem 0;
  font-weight: bold;
  font-size: 1.1rem;
}

.empty-tips small {
  opacity: 0.8;
}

/* 演示数据控制样式 */
.demo-controls {
  margin-top: 3rem;
  text-align: center;
}

.demo-notice {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 15px;
  padding: 3rem 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.demo-notice h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.demo-notice p {
  color: #6c757d;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.demo-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.demo-btn {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.demo-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 123, 255, 0.3);
}

.demo-btn.small {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.training-btn {
  background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.training-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(40, 167, 69, 0.3);
}

.data-controls {
  margin-top: 2rem;
  text-align: center;
}

.data-management {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 1rem;
  border: 1px solid #e9ecef;
}

.data-management summary {
  cursor: pointer;
  font-weight: bold;
  color: #6c757d;
  padding: 0.5rem;
}

.data-management summary:hover {
  color: #495057;
}

.control-buttons {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.clear-btn {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(220, 53, 69, 0.3);
}

.clear-btn.small {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .stats-overview {
    grid-template-columns: 1fr;
  }

  .progress-charts {
    grid-template-columns: 1fr;
  }

  .achievement-grid {
    grid-template-columns: 1fr;
  }

  .tip-cards {
    grid-template-columns: 1fr;
  }

  .frequency-grid {
    grid-template-columns: repeat(7, 1fr);
  }

  .stat-numbers {
    justify-content: center;
  }

  .demo-buttons {
    flex-direction: column;
    align-items: center;
  }

  .demo-btn,
  .training-btn {
    width: 100%;
    max-width: 300px;
  }
}

/* 新增样式 */
.no-data {
  text-align: center;
  color: #6c757d;
  padding: 1rem;
}

.no-data p {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
}

.start-training-link {
  color: #007bff;
  text-decoration: none;
  font-weight: bold;
  font-size: 0.85rem;
  padding: 0.3rem 0.8rem;
  border: 1px solid #007bff;
  border-radius: 15px;
  transition: all 0.3s ease;
  display: inline-block;
}

.start-training-link:hover {
  background: #007bff;
  color: white;
  transform: translateY(-1px);
}

.training-btn {
  background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
  color: white !important;
  text-decoration: none;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-block;
  margin: 0.25rem;
}

.training-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(40, 167, 69, 0.3);
  color: white !important;
}
</style>
