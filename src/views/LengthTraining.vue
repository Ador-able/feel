<template>
  <div class="length-training">
    <header class="training-header">
      <h1>长度目测训练</h1>
      <div class="score-board">
        <div class="score-item">
          <span class="label">当前分数:</span>
          <span class="value">{{ score }}</span>
        </div>
        <div class="score-item">
          <span class="label">连续正确:</span>
          <span class="value">{{ streak }}</span>
        </div>
        <div class="score-item">
          <span class="label">准确率:</span>
          <span class="value">{{ accuracy }}%</span>
        </div>
      </div>
    </header>

    <div class="training-area" v-if="!gameOver">
      <div class="instructions">
        <p>{{ currentInstruction }}</p>
      </div>

      <div class="canvas-container">
        <svg ref="svgRef" :width="canvasWidth" :height="canvasHeight" class="training-canvas">
          <!-- 参考线段 -->
          <line :x1="referenceLine.x1" :y1="referenceLine.y1" :x2="referenceLine.x2" :y2="referenceLine.y2"
            stroke="#3498db" stroke-width="3" class="reference-line" />

          <!-- 目标线段 -->
          <line :x1="targetLine.x1" :y1="targetLine.y1" :x2="targetLine.x2" :y2="targetLine.y2" stroke="#e74c3c"
            stroke-width="3" class="target-line" />

          <!-- 用户绘制的线段 -->
          <line v-if="userLine.x2 !== 0" :x1="userLine.x1" :y1="userLine.y1" :x2="userLine.x2" :y2="userLine.y2"
            stroke="#2ecc71" stroke-width="3" class="user-line" />

          <!-- 线段标签 -->
          <text :x="referenceLine.x1" :y="referenceLine.y1 - 10" fill="#3498db" class="line-label" pointer-events="none"
            user-select="none">
            参考线段
          </text>
          <text :x="targetLine.x1" :y="targetLine.y1 - 10" fill="#e74c3c" class="line-label" pointer-events="none"
            user-select="none">
            目标长度: {{ targetRatio }}倍
          </text>
        </svg>
      </div>

      <div class="controls">
        <button @click="submitAnswer" :disabled="userLine.x2 === 0" class="submit-btn">
          提交答案
        </button>
        <button @click="clearLine" class="clear-btn">清除</button>
        <button @click="nextExercise" class="next-btn">下一题</button>
      </div>

      <div v-if="showResult" class="result-panel">
        <div class="result-content" :class="resultClass">
          <h3>{{ resultTitle }}</h3>
          <p>目标比例: {{ targetRatio }}倍</p>
          <p>您的比例: {{ userRatio }}倍</p>
          <p>误差: {{ Math.abs(error) }}%</p>
          <div class="result-feedback">
            {{ resultFeedback }}
          </div>
        </div>
      </div>
    </div>

    <div v-else class="game-over">
      <h2>训练完成！</h2>
      <div class="final-stats">
        <div class="stat">
          <span class="stat-label">最终分数:</span>
          <span class="stat-value">{{ score }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">总题数:</span>
          <span class="stat-value">{{ totalQuestions }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">正确率:</span>
          <span class="stat-value">{{ accuracy }}%</span>
        </div>
      </div>
      <button @click="restartTraining" class="restart-btn">重新开始</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useTrainingDataStore } from '@/stores/trainingData'

interface Point {
  x: number
  y: number
}

interface Line {
  x1: number
  y1: number
  x2: number
  y2: number
}

const svgRef = ref<SVGElement>()
const canvasWidth = 800
const canvasHeight = 500

// 使用数据存储
const trainingStore = useTrainingDataStore()

// 游戏状态
const score = ref(0)
const streak = ref(0)
const totalQuestions = ref(0)
const correctAnswers = ref(0)
const gameOver = ref(false)
const startTime = ref<Date | null>(null)

// 线段数据
const referenceLine = ref<Line>({ x1: 100, y1: 200, x2: 200, y2: 200 })
const targetLine = ref<Line>({ x1: 100, y1: 300, x2: 100, y2: 300 })
const userLine = ref<Line>({ x1: 0, y1: 0, x2: 0, y2: 0 })

// 训练参数
const targetRatio = ref(1.5)
const currentInstruction = ref('')
const showResult = ref(false)
const isDrawing = ref(false)

// 结果数据
const userRatio = ref(0)
const error = ref(0)
const resultTitle = ref('')
const resultFeedback = ref('')
const resultClass = ref('')

const accuracy = computed(() => {
  if (totalQuestions.value === 0) return 0
  return Math.round((correctAnswers.value / totalQuestions.value) * 100)
})

const generateExercise = () => {
  showResult.value = false

  // 随机生成参考线段
  const refLength = 80 + Math.random() * 120
  referenceLine.value = {
    x1: 100,
    y1: 150,
    x2: 100 + refLength,
    y2: 150
  }

  // 随机生成目标比例
  targetRatio.value = Math.round((0.5 + Math.random() * 2) * 10) / 10

  // 设置目标线段起点
  targetLine.value = {
    x1: 100,
    y1: 250,
    x2: 100,
    y2: 250
  }

  // 清除用户线段
  userLine.value = { x1: 0, y1: 0, x2: 0, y2: 0 }

  currentInstruction.value = `请在下方绘制一条长度为参考线段 ${targetRatio.value} 倍的线段`
}

const handleMouseDown = (event: MouseEvent) => {
  if (showResult.value) return

  const rect = svgRef.value?.getBoundingClientRect()
  if (!rect) return

  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  // 检查是否在目标线段区域附近
  if (Math.abs(y - 350) < 50) {
    isDrawing.value = true
    userLine.value = {
      x1: 100,
      y1: 350,
      x2: 100,
      y2: 350
    }
  }
}

const handleMouseMove = (event: MouseEvent) => {
  if (!isDrawing.value || showResult.value) return

  const rect = svgRef.value?.getBoundingClientRect()
  if (!rect) return

  const x = event.clientX - rect.left

  userLine.value.x2 = Math.max(100, Math.min(x, canvasWidth - 50))
}

const handleMouseUp = () => {
  isDrawing.value = false
}

const calculateLineLength = (line: Line): number => {
  return Math.sqrt(Math.pow(line.x2 - line.x1, 2) + Math.pow(line.y2 - line.y1, 2))
}

const submitAnswer = () => {
  if (userLine.value.x2 === 0) return

  const refLength = calculateLineLength(referenceLine.value)
  const userLength = calculateLineLength(userLine.value)

  userRatio.value = Math.round((userLength / refLength) * 10) / 10
  error.value = Math.round(((userRatio.value - targetRatio.value) / targetRatio.value) * 100)

  totalQuestions.value++

  // 判断准确性（允许10%误差）
  const isCorrect = Math.abs(error.value) <= 10

  if (isCorrect) {
    correctAnswers.value++
    streak.value++
    score.value += 10 + streak.value
    resultTitle.value = '很好！'
    resultClass.value = 'success'
    resultFeedback.value = '您的目测很准确！'
  } else {
    streak.value = 0
    resultTitle.value = '继续练习'
    resultClass.value = 'error'
    if (Math.abs(error.value) <= 20) {
      resultFeedback.value = '已经很接近了，再仔细观察一下'
    } else {
      resultFeedback.value = '多练习观察线段的相对长度关系'
    }
  }

  showResult.value = true

  // 每5题自动保存一次数据，但不结束训练
  if (totalQuestions.value > 0 && totalQuestions.value % 5 === 0) {
    saveTrainingSession()
  }
}

const clearLine = () => {
  userLine.value = { x1: 0, y1: 0, x2: 0, y2: 0 }
}

const nextExercise = () => {
  generateExercise()
}

const saveTrainingSession = () => {
  if (!startTime.value) return

  const duration = Math.floor((new Date().getTime() - startTime.value.getTime()) / 1000)

  trainingStore.addSession({
    type: 'length',
    score: score.value,
    accuracy: accuracy.value,
    totalQuestions: totalQuestions.value,
    correctAnswers: correctAnswers.value,
    streak: streak.value,
    duration
  })
}

const restartTraining = () => {
  score.value = 0
  streak.value = 0
  totalQuestions.value = 0
  correctAnswers.value = 0
  gameOver.value = false
  startTime.value = new Date()
  generateExercise()
}

onMounted(async () => {
  await nextTick()

  if (svgRef.value) {
    svgRef.value.addEventListener('mousedown', handleMouseDown)
    svgRef.value.addEventListener('mousemove', handleMouseMove)
    svgRef.value.addEventListener('mouseup', handleMouseUp)
  }

  startTime.value = new Date()
  generateExercise()
})
</script>

<style scoped>
.length-training {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.training-header {
  text-align: center;
  margin-bottom: 2rem;
}

.training-header h1 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.score-board {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.score-item {
  background: #f8f9fa;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 2px solid #e9ecef;
}

.score-item .label {
  color: #6c757d;
  margin-right: 0.5rem;
}

.score-item .value {
  font-weight: bold;
  color: #2c3e50;
}

.training-area {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.instructions {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.1rem;
  color: #495057;
}

.canvas-container {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.training-canvas {
  border: 2px solid #dee2e6;
  border-radius: 10px;
  background: #f8f9fa;
  cursor: crosshair;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.line-label {
  font-size: 12px;
  font-weight: bold;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  pointer-events: none;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.submit-btn,
.clear-btn,
.next-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn {
  background: #28a745;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background: #218838;
}

.submit-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.clear-btn {
  background: #ffc107;
  color: #212529;
}

.clear-btn:hover {
  background: #e0a800;
}

.next-btn {
  background: #007bff;
  color: white;
}

.next-btn:hover {
  background: #0056b3;
}

.result-panel {
  margin-top: 2rem;
}

.result-content {
  padding: 1.5rem;
  border-radius: 10px;
  text-align: center;
}

.result-content.success {
  background: #d4edda;
  border: 2px solid #28a745;
  color: #155724;
}

.result-content.error {
  background: #f8d7da;
  border: 2px solid #dc3545;
  color: #721c24;
}

.result-feedback {
  margin-top: 1rem;
  font-style: italic;
}

.game-over {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.final-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin: 2rem 0;
  flex-wrap: wrap;
}

.stat {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 10px;
  border: 2px solid #e9ecef;
}

.stat-label {
  display: block;
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.restart-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s ease;
}

.restart-btn:hover {
  background: #0056b3;
}

@media (max-width: 768px) {
  .canvas-container {
    overflow-x: auto;
  }

  .score-board {
    flex-direction: column;
    align-items: center;
  }

  .controls {
    flex-direction: column;
    align-items: center;
  }

  .final-stats {
    flex-direction: column;
    align-items: center;
  }
}
</style>
