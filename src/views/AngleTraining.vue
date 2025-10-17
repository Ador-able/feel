<template>
  <div class="angle-training">
    <header class="training-header">
      <h1>角度目测训练</h1>
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
          <!-- 参考角度 -->
          <g v-if="showReference">
            <line :x1="referenceAngle.center.x" :y1="referenceAngle.center.y" :x2="referenceAngle.line1.x"
              :y2="referenceAngle.line1.y" stroke="#3498db" stroke-width="3" />
            <line :x1="referenceAngle.center.x" :y1="referenceAngle.center.y" :x2="referenceAngle.line2.x"
              :y2="referenceAngle.line2.y" stroke="#3498db" stroke-width="3" />
            <text :x="referenceAngle.center.x - 30" :y="referenceAngle.center.y - 20" fill="#3498db" class="angle-label"
              pointer-events="none" user-select="none">
              参考角度: {{ referenceAngle.degrees }}°
            </text>
          </g>

          <!-- 目标角度（只显示一条边） -->
          <g>
            <line :x1="targetAngle.center.x" :y1="targetAngle.center.y" :x2="targetAngle.line1.x"
              :y2="targetAngle.line1.y" stroke="#e74c3c" stroke-width="3" />
            <line v-if="userAngle.line2.x !== 0" :x1="targetAngle.center.x" :y1="targetAngle.center.y"
              :x2="userAngle.line2.x" :y2="userAngle.line2.y" stroke="#2ecc71" stroke-width="3" />
            <text :x="targetAngle.center.x - 30" :y="targetAngle.center.y + 40" fill="#e74c3c" class="angle-label"
              pointer-events="none" user-select="none">
              目标角度: {{ targetDegrees }}°
            </text>
          </g>

          <!-- 角度弧线 -->
          <path v-if="userAngle.line2.x !== 0" :d="arcPath" fill="none" stroke="#2ecc71" stroke-width="2"
            opacity="0.7" />

          <!-- 圆心点 -->
          <circle :cx="targetAngle.center.x" :cy="targetAngle.center.y" r="4" fill="#2c3e50" />
        </svg>
      </div>

      <div class="controls">
        <button @click="toggleReference" class="reference-btn">
          {{ showReference ? '隐藏参考' : '显示参考' }}
        </button>
        <button @click="submitAnswer" :disabled="userAngle.line2.x === 0" class="submit-btn">
          提交答案
        </button>
        <button @click="clearAngle" class="clear-btn">清除</button>
        <button @click="nextExercise" class="next-btn">下一题</button>
      </div>

      <div class="angle-input">
        <label for="angleSlider"></label>
        <input id="angleSlider" type="range" min="0" max="180" v-model="currentUserAngle" @input="updateUserAngle"
          class="angle-slider" />
      </div>

      <div v-if="showResult" class="result-panel">
        <div class="result-content" :class="resultClass">
          <h3>{{ resultTitle }}</h3>
          <p>目标角度: {{ targetDegrees }}°</p>
          <p>您的角度: {{ currentUserAngle }}°</p>
          <p>误差: {{ Math.abs(angleError) }}°</p>
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
        <div class="stat">
          <span class="stat-label">平均误差:</span>
          <span class="stat-value">{{ averageError }}°</span>
        </div>
      </div>
      <button @click="restartTraining" class="restart-btn">重新开始</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTrainingDataStore } from '@/stores/trainingData'

interface Point {
  x: number
  y: number
}

interface Angle {
  center: Point
  line1: Point
  line2: Point
  degrees: number
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
const totalError = ref(0)
const gameOver = ref(false)
const startTime = ref<Date | null>(null)

// 角度数据
const referenceAngle = ref<Angle>({
  center: { x: 150, y: 150 },
  line1: { x: 250, y: 150 },
  line2: { x: 200, y: 100 },
  degrees: 45
})

const targetAngle = ref<Angle>({
  center: { x: 150, y: 350 },
  line1: { x: 250, y: 350 },
  line2: { x: 150, y: 350 },
  degrees: 0
})

const userAngle = ref<Angle>({
  center: { x: 150, y: 350 },
  line1: { x: 250, y: 350 },
  line2: { x: 0, y: 0 },
  degrees: 0
})

// 训练参数
const targetDegrees = ref(45)
const currentUserAngle = ref(45)
const currentInstruction = ref('')
const showResult = ref(false)
const showReference = ref(true)

// 结果数据
const angleError = ref(0)
const resultTitle = ref('')
const resultFeedback = ref('')
const resultClass = ref('')

const accuracy = computed(() => {
  if (totalQuestions.value === 0) return 0
  return Math.round((correctAnswers.value / totalQuestions.value) * 100)
})

const averageError = computed(() => {
  if (totalQuestions.value === 0) return 0
  return Math.round((totalError.value / totalQuestions.value) * 10) / 10
})

const arcPath = computed(() => {
  if (userAngle.value.line2.x === 0) return ''

  const centerX = targetAngle.value.center.x
  const centerY = targetAngle.value.center.y
  const radius = 30

  const startAngle = 0
  const endAngle = (currentUserAngle.value * Math.PI) / 180

  const startX = centerX + radius * Math.cos(startAngle)
  const startY = centerY - radius * Math.sin(startAngle)
  const endX = centerX + radius * Math.cos(endAngle)
  const endY = centerY - radius * Math.sin(endAngle)

  const largeArcFlag = currentUserAngle.value > 180 ? 1 : 0

  return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${endX} ${endY}`
})

const generateExercise = () => {
  showResult.value = false

  // 随机生成参考角度
  const refDegrees = 15 + Math.random() * 150
  referenceAngle.value.degrees = Math.round(refDegrees)

  const refRadians = (refDegrees * Math.PI) / 180
  const refRadius = 100
  referenceAngle.value.line2 = {
    x: referenceAngle.value.center.x + refRadius * Math.cos(refRadians),
    y: referenceAngle.value.center.y - refRadius * Math.sin(refRadians)
  }

  // 随机生成目标角度
  targetDegrees.value = Math.round(15 + Math.random() * 150)

  // 重置用户角度
  currentUserAngle.value = 45
  userAngle.value.line2 = { x: 0, y: 0 }

  currentInstruction.value = `请调节滑块，使角度与目标角度 ${targetDegrees.value}° 相匹配`
}

const updateUserAngle = () => {
  const radians = (currentUserAngle.value * Math.PI) / 180
  const radius = 100

  userAngle.value.line2 = {
    x: targetAngle.value.center.x + radius * Math.cos(radians),
    y: targetAngle.value.center.y - radius * Math.sin(radians)
  }

  userAngle.value.degrees = currentUserAngle.value
}

const toggleReference = () => {
  showReference.value = !showReference.value
}

const submitAnswer = () => {
  if (userAngle.value.line2.x === 0) return

  angleError.value = currentUserAngle.value - targetDegrees.value
  totalError.value += Math.abs(angleError.value)
  totalQuestions.value++

  // 判断准确性（允许5度误差）
  const isCorrect = Math.abs(angleError.value) <= 5

  if (isCorrect) {
    correctAnswers.value++
    streak.value++
    score.value += 10 + streak.value
    resultTitle.value = '优秀！'
    resultClass.value = 'success'
    resultFeedback.value = '您的角度感知很准确！'
  } else {
    streak.value = 0
    resultTitle.value = '继续练习'
    resultClass.value = 'error'
    if (Math.abs(angleError.value) <= 10) {
      resultFeedback.value = '已经很接近了，再仔细观察一下'
    } else if (Math.abs(angleError.value) <= 20) {
      resultFeedback.value = '可以参考已知角度来估算目标角度'
    } else {
      resultFeedback.value = '多练习常见角度的识别，如30°、45°、60°、90°'
    }
  }

  showResult.value = true

  // 每5题自动保存一次数据，但不结束训练
  if (totalQuestions.value > 0 && totalQuestions.value % 5 === 0) {
    saveTrainingSession()
  }
}

const clearAngle = () => {
  currentUserAngle.value = 45
  userAngle.value.line2 = { x: 0, y: 0 }
}

const nextExercise = () => {
  generateExercise()
}

const saveTrainingSession = () => {
  if (!startTime.value) return

  const duration = Math.floor((new Date().getTime() - startTime.value.getTime()) / 1000)
  const avgError = totalQuestions.value > 0 ? totalError.value / totalQuestions.value : 0

  trainingStore.addSession({
    type: 'angle',
    score: score.value,
    accuracy: accuracy.value,
    totalQuestions: totalQuestions.value,
    correctAnswers: correctAnswers.value,
    averageError: Math.round(avgError * 10) / 10,
    streak: streak.value,
    duration
  })
}

const restartTraining = () => {
  score.value = 0
  streak.value = 0
  totalQuestions.value = 0
  correctAnswers.value = 0
  totalError.value = 0
  gameOver.value = false
  startTime.value = new Date()
  generateExercise()
}

onMounted(() => {
  startTime.value = new Date()
  generateExercise()
  updateUserAngle()
})
</script>

<style scoped>
.angle-training {
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
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.angle-label {
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
  flex-wrap: wrap;
}

.reference-btn,
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

.reference-btn {
  background: #6f42c1;
  color: white;
}

.reference-btn:hover {
  background: #5a369a;
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

.angle-input {
  text-align: center;
  margin-bottom: 2rem;
}

.angle-input label {
  display: block;
  margin-bottom: 1rem;
  font-weight: bold;
  color: #495057;
}

.angle-slider {
  width: 300px;
  height: 8px;
  border-radius: 4px;
  background: #ddd;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.angle-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
}

.angle-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
  border: none;
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

  .angle-slider {
    width: 250px;
  }
}
</style>
