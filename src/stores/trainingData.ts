import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// 训练数据接口
export interface TrainingSession {
  id: string
  type: 'length' | 'angle' | 'proportion'
  date: string
  score: number
  accuracy: number
  totalQuestions: number
  correctAnswers: number
  averageError?: number
  streak: number
  duration?: number // 训练时长（秒）
}

export interface DailyStats {
  date: string
  sessions: number
  totalScore: number
  averageAccuracy: number
}

export interface Achievement {
  id: number
  title: string
  description: string
  icon: string
  earned: boolean
  progress: number
  earnedDate?: string
}

export const useTrainingDataStore = defineStore('trainingData', () => {
  // 存储键名
  const STORAGE_KEY = 'trainingData'
  const ACHIEVEMENTS_KEY = 'achievements'

  // 训练记录
  const sessions = ref<TrainingSession[]>([])

  // 成就数据
  const achievements = ref<Achievement[]>([
    {
      id: 1,
      title: '初学者',
      description: '完成第一次训练',
      icon: '🌟',
      earned: false,
      progress: 0,
    },
    {
      id: 2,
      title: '坚持不懈',
      description: '连续7天练习',
      icon: '🔥',
      earned: false,
      progress: 0,
    },
    {
      id: 3,
      title: '精准射手',
      description: '单次练习准确率达到90%',
      icon: '🎯',
      earned: false,
      progress: 0,
    },
    {
      id: 4,
      title: '全能选手',
      description: '完成所有类型训练各10次',
      icon: '🏆',
      earned: false,
      progress: 0,
    },
    {
      id: 5,
      title: '完美主义者',
      description: '连续5次练习准确率超过85%',
      icon: '💎',
      earned: false,
      progress: 0,
    },
    {
      id: 6,
      title: '百发百中',
      description: '单次训练全部答题正确',
      icon: '🎖️',
      earned: false,
      progress: 0,
    },
    {
      id: 7,
      title: '持久训练',
      description: '累计训练100次',
      icon: '💪',
      earned: false,
      progress: 0,
    },
  ])

  // 计算属性 - 按类型统计
  const lengthStats = computed(() => {
    const lengthSessions = sessions.value.filter((s) => s.type === 'length')
    return {
      totalSessions: lengthSessions.length,
      averageAccuracy:
        lengthSessions.length > 0
          ? Math.round(
              lengthSessions.reduce((sum, s) => sum + s.accuracy, 0) / lengthSessions.length,
            )
          : 0,
      bestScore: lengthSessions.length > 0 ? Math.max(...lengthSessions.map((s) => s.score)) : 0,
    }
  })

  const angleStats = computed(() => {
    const angleSessions = sessions.value.filter((s) => s.type === 'angle')
    return {
      totalSessions: angleSessions.length,
      averageAccuracy:
        angleSessions.length > 0
          ? Math.round(angleSessions.reduce((sum, s) => sum + s.accuracy, 0) / angleSessions.length)
          : 0,
      bestScore: angleSessions.length > 0 ? Math.max(...angleSessions.map((s) => s.score)) : 0,
      averageError:
        angleSessions.length > 0 && angleSessions.some((s) => s.averageError !== undefined)
          ? Math.round(
              (angleSessions
                .filter((s) => s.averageError !== undefined)
                .reduce((sum, s) => sum + (s.averageError || 0), 0) /
                angleSessions.filter((s) => s.averageError !== undefined).length) *
                10,
            ) / 10
          : 0,
    }
  })

  const proportionStats = computed(() => {
    const proportionSessions = sessions.value.filter((s) => s.type === 'proportion')
    return {
      totalSessions: proportionSessions.length,
      averageAccuracy:
        proportionSessions.length > 0
          ? Math.round(
              proportionSessions.reduce((sum, s) => sum + s.accuracy, 0) /
                proportionSessions.length,
            )
          : 0,
      bestScore:
        proportionSessions.length > 0 ? Math.max(...proportionSessions.map((s) => s.score)) : 0,
    }
  })

  // 最近的训练记录
  const recentSessions = computed(() => {
    return sessions.value
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)
  })

  // 准确率趋势数据
  const accuracyTrend = computed(() => {
    return sessions.value
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-10)
      .map((session, index) => ({
        session: index + 1,
        accuracy: session.accuracy,
      }))
  })

  // 每日练习频率数据（最近30天）
  const dailyFrequency = computed(() => {
    const today = new Date()
    const data: { date: string; label: string; sessions: number }[] = []

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      const daysSessions = sessions.value.filter((s) => s.date.startsWith(dateStr)).length

      data.push({
        date: dateStr,
        label: date.getDate().toString(),
        sessions: daysSessions,
      })
    }

    return data
  })

  // 从本地存储加载数据
  const loadData = () => {
    try {
      const savedSessions = localStorage.getItem(STORAGE_KEY)
      if (savedSessions) {
        sessions.value = JSON.parse(savedSessions)
        console.log('加载训练数据:', sessions.value.length, '条记录')
      } else {
        console.log('未找到保存的训练数据')
        sessions.value = [] // 确保初始化为空数组
      }

      const savedAchievements = localStorage.getItem(ACHIEVEMENTS_KEY)
      if (savedAchievements) {
        const saved = JSON.parse(savedAchievements)
        // 合并已有成就和新成就
        achievements.value = achievements.value.map((achievement) => {
          const savedAchievement = saved.find((a: Achievement) => a.id === achievement.id)
          return savedAchievement || achievement
        })
        console.log('加载成就数据')
      }
    } catch (error) {
      console.error('加载训练数据失败:', error)
      sessions.value = [] // 发生错误时确保初始化为空数组
    }
  }

  // 保存数据到本地存储
  const saveData = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.value))
      localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements.value))
      console.log('保存训练数据:', sessions.value.length, '条记录')
    } catch (error) {
      console.error('保存训练数据失败:', error)
    }
  }

  // 添加新的训练记录
  const addSession = (sessionData: Omit<TrainingSession, 'id' | 'date'>) => {
    const newSession: TrainingSession = {
      ...sessionData,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    }

    console.log('addSession 被调用，参数:', sessionData)
    console.log('创建的新会话:', newSession)

    sessions.value.push(newSession)
    console.log('新增训练记录:', newSession)
    console.log('当前总记录数:', sessions.value.length)
    console.log('sessions.value:', sessions.value)

    updateAchievements()
    saveData()

    return newSession
  }

  // 更新成就进度
  const updateAchievements = () => {
    const totalSessions = sessions.value.length
    const types = ['length', 'angle', 'proportion'] as const

    // 1. 初学者 - 完成第一次训练
    if (totalSessions >= 1 && !achievements.value[0].earned) {
      achievements.value[0].earned = true
      achievements.value[0].progress = 100
      achievements.value[0].earnedDate = new Date().toISOString()
    }

    // 2. 坚持不懈 - 连续7天练习
    const consecutiveDays = getConsecutiveDays()
    achievements.value[1].progress = Math.min((consecutiveDays / 7) * 100, 100)
    if (consecutiveDays >= 7 && !achievements.value[1].earned) {
      achievements.value[1].earned = true
      achievements.value[1].earnedDate = new Date().toISOString()
    }

    // 3. 精准射手 - 单次练习准确率达到90%
    const hasHighAccuracy = sessions.value.some((s) => s.accuracy >= 90)
    if (hasHighAccuracy && !achievements.value[2].earned) {
      achievements.value[2].earned = true
      achievements.value[2].progress = 100
      achievements.value[2].earnedDate = new Date().toISOString()
    } else {
      const maxAccuracy =
        sessions.value.length > 0 ? Math.max(...sessions.value.map((s) => s.accuracy)) : 0
      achievements.value[2].progress = Math.min((maxAccuracy / 90) * 100, 100)
    }

    // 4. 全能选手 - 完成所有类型训练各10次
    const typeCounts = types.map((type) => sessions.value.filter((s) => s.type === type).length)
    const minTypeCount = Math.min(...typeCounts)
    achievements.value[3].progress = Math.min((minTypeCount / 10) * 100, 100)
    if (minTypeCount >= 10 && !achievements.value[3].earned) {
      achievements.value[3].earned = true
      achievements.value[3].earnedDate = new Date().toISOString()
    }

    // 5. 完美主义者 - 连续5次练习准确率超过85%
    const consecutive85Plus = getConsecutiveHighAccuracy()
    achievements.value[4].progress = Math.min((consecutive85Plus / 5) * 100, 100)
    if (consecutive85Plus >= 5 && !achievements.value[4].earned) {
      achievements.value[4].earned = true
      achievements.value[4].earnedDate = new Date().toISOString()
    }

    // 6. 百发百中 - 单次训练全部答题正确
    const hasPerfectSession = sessions.value.some((s) => s.accuracy === 100)
    if (hasPerfectSession && !achievements.value[5].earned) {
      achievements.value[5].earned = true
      achievements.value[5].progress = 100
      achievements.value[5].earnedDate = new Date().toISOString()
    } else {
      const maxAccuracy =
        sessions.value.length > 0 ? Math.max(...sessions.value.map((s) => s.accuracy)) : 0
      achievements.value[5].progress = maxAccuracy
    }

    // 7. 持久训练 - 累计训练100次
    achievements.value[6].progress = Math.min((totalSessions / 100) * 100, 100)
    if (totalSessions >= 100 && !achievements.value[6].earned) {
      achievements.value[6].earned = true
      achievements.value[6].earnedDate = new Date().toISOString()
    }
  }

  // 获取连续训练天数
  const getConsecutiveDays = (): number => {
    if (sessions.value.length === 0) return 0

    const today = new Date()
    const dates = new Set(sessions.value.map((s) => s.date.split('T')[0]))
    let consecutive = 0

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(checkDate.getDate() - i)
      const dateStr = checkDate.toISOString().split('T')[0]

      if (dates.has(dateStr)) {
        consecutive++
      } else if (consecutive > 0) {
        break
      }
    }

    return consecutive
  }

  // 获取连续高准确率次数
  const getConsecutiveHighAccuracy = (): number => {
    if (sessions.value.length === 0) return 0

    const recentSessions = sessions.value
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    let consecutive = 0
    for (const session of recentSessions) {
      if (session.accuracy >= 85) {
        consecutive++
      } else {
        break
      }
    }

    return consecutive
  }

  // 获取个性化建议
  const getPersonalizedTips = computed(() => {
    const tips: Array<{ id: number; title: string; content: string; icon: string }> = []

    // 基于准确率给出建议
    const avgAccuracy =
      sessions.value.length > 0
        ? sessions.value.reduce((sum, s) => sum + s.accuracy, 0) / sessions.value.length
        : 0

    if (avgAccuracy < 70) {
      tips.push({
        id: 1,
        title: '基础练习建议',
        content: '建议多进行基础训练，从简单的练习开始，逐步提升准确率',
        icon: '📚',
      })
    }

    // 基于练习频率给出建议
    const recentDays = dailyFrequency.value
      .slice(-7)
      .reduce((sum, day) => sum + (day.sessions > 0 ? 1 : 0), 0)
    if (recentDays < 3) {
      tips.push({
        id: 2,
        title: '保持练习频率',
        content: '连续练习能更好地建立肌肉记忆，建议每天至少练习一次',
        icon: '⏰',
      })
    }

    // 基于训练类型平衡给出建议
    const typeBalance = [
      lengthStats.value.totalSessions,
      angleStats.value.totalSessions,
      proportionStats.value.totalSessions,
    ]
    const maxType = Math.max(...typeBalance)
    const minType = Math.min(...typeBalance)
    if (maxType - minType > 5) {
      tips.push({
        id: 3,
        title: '均衡发展',
        content: '建议均衡练习各种类型的训练，有助于全面提升绘画技能',
        icon: '⚖️',
      })
    }

    // 针对特定类型的建议
    if (angleStats.value.averageAccuracy > 0 && angleStats.value.averageAccuracy < 75) {
      tips.push({
        id: 4,
        title: '提升角度感知',
        content: '您的角度训练准确率还有提升空间，建议多练习常见角度（30°、45°、60°、90°）',
        icon: '📐',
      })
    }

    if (proportionStats.value.averageAccuracy > 0 && proportionStats.value.averageAccuracy < 75) {
      tips.push({
        id: 5,
        title: '提升比例感知',
        content: '比例训练需要更多练习，建议观察日常物品的比例关系来培养感觉',
        icon: '🎨',
      })
    }

    return tips.slice(0, 3) // 最多显示3个建议
  })

  // 清除所有数据（用于调试）
  const clearAllData = () => {
    sessions.value = []
    achievements.value.forEach((achievement) => {
      achievement.earned = false
      achievement.progress = 0
      delete achievement.earnedDate
    })
    saveData()
  }

  // 生成演示数据
  const generateDemoData = () => {
    // 清除现有数据
    sessions.value = []

    const types: Array<'length' | 'angle' | 'proportion'> = ['length', 'angle', 'proportion']
    const today = new Date()

    // 生成过去15天的训练记录
    for (let dayOffset = 14; dayOffset >= 0; dayOffset--) {
      const date = new Date(today)
      date.setDate(date.getDate() - dayOffset)

      // 每天随机生成0-3次训练
      const sessionsPerDay = Math.floor(Math.random() * 4)

      for (let i = 0; i < sessionsPerDay; i++) {
        const type = types[Math.floor(Math.random() * types.length)]
        const baseAccuracy = 45 + dayOffset * 2 + Math.random() * 20 // 逐渐提升的趋势
        const accuracy = Math.min(95, Math.max(35, Math.round(baseAccuracy)))
        const totalQuestions = type === 'angle' ? 15 : 20
        const correctAnswers = Math.round((accuracy / 100) * totalQuestions)
        const score = correctAnswers * 10 + Math.floor(Math.random() * 50)
        const duration = 180 + Math.floor(Math.random() * 300) // 3-8分钟

        const sessionDate = new Date(date)
        sessionDate.setHours(Math.floor(Math.random() * 24))
        sessionDate.setMinutes(Math.floor(Math.random() * 60))

        const newSession: TrainingSession = {
          id: `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type,
          date: sessionDate.toISOString(),
          score,
          accuracy,
          totalQuestions,
          correctAnswers,
          streak: Math.floor(Math.random() * 10),
          duration,
          ...(type === 'angle' && { averageError: Math.random() * 15 + 2 }),
        }

        sessions.value.push(newSession)
      }
    }

    updateAchievements()
    saveData()
  }

  // 初始化时加载数据
  loadData()

  // 初始化时加载数据
  loadData()

  return {
    // 状态
    sessions,
    achievements,

    // 计算属性
    lengthStats,
    angleStats,
    proportionStats,
    recentSessions,
    accuracyTrend,
    dailyFrequency,
    getPersonalizedTips,

    // 方法
    addSession,
    updateAchievements,
    saveData,
    loadData,
    clearAllData,
    generateDemoData,
  }
})
