<template>
  <div class="proportion-training">
    <header class="training-header">
      <h1>比例目测训练</h1>
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
          <!-- 参考图形 -->
          <g class="reference-shape">
            <!-- 圆形 -->
            <circle v-if="referenceShape.type === 'circle'" :cx="referenceShape.x" :cy="referenceShape.y"
              :r="referenceShape.size" fill="none" stroke="#3498db" stroke-width="3" />

            <!-- 正方形 -->
            <rect v-if="referenceShape.type === 'square'" :x="referenceShape.x - referenceShape.size / 2"
              :y="referenceShape.y - referenceShape.size / 2" :width="referenceShape.size" :height="referenceShape.size"
              fill="none" stroke="#3498db" stroke-width="3" />

            <!-- 三角形 -->
            <polygon v-if="referenceShape.type === 'triangle'" :points="getTrianglePoints(referenceShape)" fill="none"
              stroke="#3498db" stroke-width="3" />

            <!-- 线段 -->
            <line v-if="referenceShape.type === 'line'" :x1="referenceShape.x - referenceShape.size / 2"
              :y1="referenceShape.y" :x2="referenceShape.x + referenceShape.size / 2" :y2="referenceShape.y"
              stroke="#3498db" stroke-width="3" />
          </g>

          <!-- 目标图形区域 -->
          <g class="target-shape">
            <!-- 圆形 -->
            <circle v-if="targetShape.type === 'circle'" :cx="targetShape.x" :cy="targetShape.y" :r="userSize"
              fill="none" stroke="#e74c3c" stroke-width="3" stroke-dasharray="5,5" />

            <!-- 正方形 -->
            <rect v-if="targetShape.type === 'square'" :x="targetShape.x - userSize / 2"
              :y="targetShape.y - userSize / 2" :width="userSize" :height="userSize" fill="none" stroke="#e74c3c"
              stroke-width="3" stroke-dasharray="5,5" />

            <!-- 三角形 -->
            <polygon v-if="targetShape.type === 'triangle'"
              :points="getTrianglePoints({ ...targetShape, size: userSize })" fill="none" stroke="#e74c3c"
              stroke-width="3" stroke-dasharray="5,5" />

            <!-- 线段 -->
            <line v-if="targetShape.type === 'line'" :x1="targetShape.x - userSize / 2" :y1="targetShape.y"
              :x2="targetShape.x + userSize / 2" :y2="targetShape.y" stroke="#e74c3c" stroke-width="3"
              stroke-dasharray="5,5" />
          </g>

          <!-- 标签 -->
          <text :x="referenceShape.x" :y="referenceShape.y - referenceShape.size - 15" fill="#3498db"
            class="shape-label" text-anchor="middle">
            参考{{ getShapeName(referenceShape.type) }}
          </text>
          <text :x="targetShape.x" :y="targetShape.y - Math.max(userSize, 50) - 15" fill="#e74c3c" class="shape-label"
            text-anchor="middle">
            目标比例: {{ targetRatio }}倍
          </text>
        </svg>
      </div>

      <div class="controls">
        <div class="size-control">
          <label for="sizeSlider">调整大小:</label>
          <input id="sizeSlider" type="range" :min="minSize" :max="maxSize" v-model="userSize" class="size-slider" />
          <span class="size-value">{{ Math.round(userSize) }}</span>
        </div>
        <div class="button-group">
          <button @click="submitAnswer" class="submit-btn">
            {{ showResult ? '重新提交' : '提交答案' }}
          </button>
          <button @click="resetSize" class="reset-btn">重置</button>
          <button @click="nextExercise" class="next-btn">下一题</button>
        </div>
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
import { ref, computed, onMounted } from 'vue'
import { useTrainingDataStore } from '@/stores/trainingData'

type ShapeType = 'circle' | 'square' | 'triangle' | 'line'

interface Shape {
  type: ShapeType
  x: number
  y: number
  size: number
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

// 图形数据
const referenceShape = ref<Shape>({ type: 'circle', x: 200, y: 200, size: 50 })
const targetShape = ref<Shape>({ type: 'circle', x: 600, y: 200, size: 50 })

// 训练参数
const targetRatio = ref(1.5)
const userSize = ref(50)
const minSize = 20
const maxSize = 150
const currentInstruction = ref('')
const showResult = ref(false)

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

const getShapeName = (type: ShapeType): string => {
  const names = {
    circle: '圆形',
    square: '正方形',
    triangle: '三角形',
    line: '线段'
  }
  return names[type]
}

const getTrianglePoints = (shape: Shape): string => {
  const { x, y, size } = shape
  const height = size * Math.sqrt(3) / 2
  return `${x},${y - height / 2} ${x - size / 2},${y + height / 2} ${x + size / 2},${y + height / 2}`
}

const generateExercise = () => {
  showResult.value = false

  // 随机选择图形类型
  const shapeTypes: ShapeType[] = ['circle', 'square', 'triangle', 'line']
  const shapeType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)]

  // 生成参考图形
  const refSize = 40 + Math.random() * 40 // 40-80
  referenceShape.value = {
    type: shapeType,
    x: 200,
    y: 200,
    size: refSize
  }

  // 生成目标图形
  targetShape.value = {
    type: shapeType,
    x: 600,
    y: 200,
    size: refSize
  }

  // 随机生成目标比例
  const ratios = [0.5, 0.75, 1.25, 1.5, 2.0, 2.5]
  targetRatio.value = ratios[Math.floor(Math.random() * ratios.length)]

  // 重置用户大小到参考大小
  userSize.value = refSize

  currentInstruction.value = `请调整右侧${getShapeName(shapeType)}的大小，使其为左侧参考${getShapeName(shapeType)}的 ${targetRatio.value} 倍`
}

const resetSize = () => {
  userSize.value = referenceShape.value.size
}

const submitAnswer = () => {
  const referenceSize = referenceShape.value.size
  const actualRatio = userSize.value / referenceSize
  userRatio.value = Math.round(actualRatio * 100) / 100

  error.value = Math.round(((actualRatio - targetRatio.value) / targetRatio.value) * 100)

  const absError = Math.abs(error.value)

  // 只在第一次提交时计入题目数量和评分
  if (!showResult.value) {
    totalQuestions.value++

    if (absError <= 5) {
      // 非常准确 (±5%)
      score.value += 10
      streak.value++
      correctAnswers.value++
      resultTitle.value = '优秀！'
      resultClass.value = 'excellent'
      resultFeedback.value = '您的比例判断非常准确！'
    } else if (absError <= 10) {
      // 比较准确 (±10%)
      score.value += 7
      streak.value++
      correctAnswers.value++
      resultTitle.value = '很好！'
      resultClass.value = 'good'
      resultFeedback.value = '您的比例判断很不错！'
    } else if (absError <= 20) {
      // 一般准确 (±20%)
      score.value += 3
      streak.value = 0
      resultTitle.value = '还可以'
      resultClass.value = 'fair'
      resultFeedback.value = '您的比例判断基本正确，继续努力！'
    } else {
      // 不够准确 (>±20%)
      streak.value = 0
      resultTitle.value = '需要改进'
      resultClass.value = 'poor'
      resultFeedback.value = '您的比例判断偏差较大，多练习观察！'
    }

    // 连击奖励
    if (streak.value >= 5) {
      score.value += streak.value
    }
  } else {
    // 重新提交时，更新结果显示但不计入评分
    if (absError <= 5) {
      resultTitle.value = '优秀！'
      resultClass.value = 'excellent'
      resultFeedback.value = '调整后的比例非常准确！'
    } else if (absError <= 10) {
      resultTitle.value = '很好！'
      resultClass.value = 'good'
      resultFeedback.value = '调整后的比例很不错！'
    } else if (absError <= 20) {
      resultTitle.value = '还可以'
      resultClass.value = 'fair'
      resultFeedback.value = '调整后的比例基本正确！'
    } else {
      resultTitle.value = '需要改进'
      resultClass.value = 'poor'
      resultFeedback.value = '还需要继续调整比例！'
    }
  }

  showResult.value = true

  // 每5题自动保存一次数据，但不结束训练
  if (totalQuestions.value > 0 && totalQuestions.value % 5 === 0) {
    saveTrainingSession()
  }
}

const nextExercise = () => {
  generateExercise()
}

const saveTrainingSession = () => {
  if (!startTime.value) return

  const duration = Math.floor((new Date().getTime() - startTime.value.getTime()) / 1000)

  const sessionData = {
    type: 'proportion' as const,
    score: score.value,
    accuracy: accuracy.value,
    totalQuestions: totalQuestions.value,
    correctAnswers: correctAnswers.value,
    streak: streak.value,
    duration
  }

  console.log('准备保存比例训练数据:', sessionData)
  console.log('训练store引用:', trainingStore)
  console.log('addSession方法:', trainingStore.addSession)

  try {
    trainingStore.addSession(sessionData)
    console.log('调用addSession成功')
  } catch (error) {
    console.error('调用addSession失败:', error)
  }
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

onMounted(() => {
  startTime.value = new Date()
  generateExercise()
})
</script>

<style scoped>
.proportion-training {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.training-header {
  text-align: center;
  margin-bottom: 30px;
}

.training-header h1 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.score-board {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
}

.score-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.score-item .label {
  font-size: 0.9em;
  color: #7f8c8d;
  margin-bottom: 5px;
}

.score-item .value {
  font-size: 1.5em;
  font-weight: bold;
  color: #3498db;
}

.training-area {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.instructions {
  text-align: center;
  margin-bottom: 20px;
  font-size: 1.1em;
  color: #2c3e50;
}

.canvas-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.training-canvas {
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  background: #fafafa;
}

.shape-label {
  font-size: 14px;
  font-weight: bold;
  pointer-events: none;
  user-select: none;
}

.controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.size-control {
  display: flex;
  align-items: center;
  gap: 15px;
}

.size-control label {
  font-weight: bold;
  color: #2c3e50;
}

.size-slider {
  width: 300px;
  height: 6px;
  background: #ddd;
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.size-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: #3498db;
  border-radius: 50%;
  cursor: pointer;
}

.size-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #3498db;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.size-value {
  font-weight: bold;
  color: #3498db;
  min-width: 40px;
}

.button-group {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
}

.submit-btn,
.reset-btn,
.next-btn,
.restart-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 1em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn {
  background: #27ae60;
  color: white;
}

.submit-btn:hover {
  background: #2ecc71;
}

.reset-btn {
  background: #f39c12;
  color: white;
}

.reset-btn:hover {
  background: #e67e22;
}

.next-btn {
  background: #3498db;
  color: white;
}

.next-btn:hover {
  background: #5dade2;
}

.restart-btn {
  background: #e74c3c;
  color: white;
}

.restart-btn:hover {
  background: #c0392b;
}

.result-panel {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.result-content {
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  max-width: 400px;
}

.result-content.excellent {
  background: #d5f4e6;
  border: 2px solid #27ae60;
}

.result-content.good {
  background: #d6eaf8;
  border: 2px solid #3498db;
}

.result-content.fair {
  background: #fdeaa7;
  border: 2px solid #f39c12;
}

.result-content.poor {
  background: #fadbd8;
  border: 2px solid #e74c3c;
}

.result-content h3 {
  margin-top: 0;
  margin-bottom: 15px;
}

.result-content p {
  margin: 10px 0;
}

.result-feedback {
  font-style: italic;
  margin-top: 15px;
  font-weight: bold;
}

.game-over {
  text-align: center;
  background: white;
  border-radius: 10px;
  padding: 40px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.final-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin: 30px 0;
  flex-wrap: wrap;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 0.9em;
  color: #7f8c8d;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 2em;
  font-weight: bold;
  color: #3498db;
}

@media (max-width: 768px) {
  .proportion-training {
    padding: 10px;
  }

  .training-canvas {
    width: 100%;
    max-width: 600px;
    height: auto;
  }

  .score-board {
    gap: 20px;
  }

  .size-slider {
    width: 200px;
  }

  .button-group {
    gap: 10px;
  }

  .final-stats {
    gap: 20px;
  }
}
</style>
