import { dimensions, dimensionOrder } from '../data/generated/dimensions'
import { baseQuestions, specialQuestions } from '../data/generated/questions'
import { patternTypes, personalityTypes } from '../data/generated/types'
import type {
  BaseQuestion,
  DimensionKey,
  DimensionLevel,
  DimensionLevelMap,
  DimensionScoreMap,
  PatternType,
  PersonalityType,
  Question,
  QuizAnswers,
  QuizProgress,
  QuizResult,
  QuizSession,
  RankedPatternMatch,
} from '../types/quiz'

const specialGateQuestion = specialQuestions[0]
const drinkTriggerQuestion = specialQuestions[1]

const levelToValue: Record<DimensionLevel, number> = {
  L: 1,
  M: 2,
  H: 3,
}

function shuffleQuestions<T>(questions: readonly T[], randomFn: () => number) {
  const clonedQuestions = [...questions]

  for (let index = clonedQuestions.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(randomFn() * (index + 1))
    const currentQuestion = clonedQuestions[index]

    clonedQuestions[index] = clonedQuestions[swapIndex]
    clonedQuestions[swapIndex] = currentQuestion
  }

  return clonedQuestions
}

function getDimensionLevel(score: number): DimensionLevel {
  if (score <= 3) {
    return 'L'
  }

  if (score === 4) {
    return 'M'
  }

  return 'H'
}

function toPatternValues(pattern: string) {
  return pattern.replaceAll('-', '').split('').map((level) => levelToValue[level as DimensionLevel])
}

function shouldActivateDrinkMode(answers: QuizAnswers) {
  return answers[specialGateQuestion.id] === 3 && answers[drinkTriggerQuestion.id] === 2
}

export function createQuizSession(
  randomFn: () => number = Math.random,
  previewMode = false,
): QuizSession {
  const shuffledBaseQuestions = shuffleQuestions(baseQuestions, randomFn)
  const gateInsertIndex = Math.floor(randomFn() * shuffledBaseQuestions.length) + 1

  return {
    shuffledQuestions: [
      ...shuffledBaseQuestions.slice(0, gateInsertIndex),
      specialGateQuestion,
      ...shuffledBaseQuestions.slice(gateInsertIndex),
    ],
    answers: {},
    previewMode,
  }
}

export function getVisibleQuestions(session: QuizSession): Question[] {
  const visibleQuestions = [...session.shuffledQuestions]
  const gateQuestionIndex = visibleQuestions.findIndex(
    (question) => question.id === specialGateQuestion.id,
  )

  if (gateQuestionIndex === -1) {
    return visibleQuestions
  }

  if (session.answers[specialGateQuestion.id] === 3) {
    visibleQuestions.splice(gateQuestionIndex + 1, 0, drinkTriggerQuestion)
  }

  return visibleQuestions
}

export function getQuizProgress(session: QuizSession): QuizProgress {
  const visibleQuestions = getVisibleQuestions(session)
  const answered = visibleQuestions.filter(
    (question) => session.answers[question.id] !== undefined,
  ).length
  const total = visibleQuestions.length
  const percent = total > 0 ? (answered / total) * 100 : 0

  return {
    answered,
    total,
    percent,
    isComplete: answered === total && total > 0,
  }
}

export function calculateQuizResult(answers: QuizAnswers): QuizResult {
  const rawScores = Object.keys(dimensions).reduce<DimensionScoreMap>(
    (scoreMap, dimensionKey) => ({
      ...scoreMap,
      [dimensionKey]: 0,
    }),
    {} as DimensionScoreMap,
  )

  baseQuestions.forEach((question) => {
    rawScores[question.dim] += Number(answers[question.id] ?? 0)
  })

  const levels = Object.entries(rawScores).reduce<DimensionLevelMap>(
    (levelMap, [dimensionKey, score]) => ({
      ...levelMap,
      [dimensionKey]: getDimensionLevel(score),
    }),
    {} as DimensionLevelMap,
  )

  const sourcePattern = dimensionOrder.map(
    (dimensionKey) => levelToValue[levels[dimensionKey as DimensionKey]],
  )

  const ranked = patternTypes
    .map<RankedPatternMatch>((patternType) => {
      const targetPattern = toPatternValues(patternType.pattern)
      let distance = 0
      let exact = 0

      for (let index = 0; index < targetPattern.length; index += 1) {
        const difference = Math.abs(sourcePattern[index] - targetPattern[index])

        distance += difference

        if (difference === 0) {
          exact += 1
        }
      }

      const similarity = Math.max(0, Math.round((1 - distance / 30) * 100))

      return {
        ...patternType,
        ...personalityTypes[patternType.code as keyof typeof personalityTypes],
        distance,
        exact,
        similarity,
      }
    })
    .sort((left, right) => {
      if (left.distance !== right.distance) {
        return left.distance - right.distance
      }

      if (left.exact !== right.exact) {
        return right.exact - left.exact
      }

      return right.similarity - left.similarity
    })

  const bestNormal = ranked[0]
  const drinkMode = shouldActivateDrinkMode(answers)
  let finalType: PersonalityType | RankedPatternMatch = bestNormal
  let modeKicker = '你的主类型'
  let badge = `匹配度 ${bestNormal.similarity}% · 精准命中 ${bestNormal.exact}/15 维`
  let sub = '维度命中度较高，当前结果可视为你的第一人格画像。'
  let special = false
  let secondaryType: RankedPatternMatch | null = null

  if (drinkMode) {
    finalType = personalityTypes.DRUNK
    secondaryType = bestNormal
    modeKicker = '隐藏人格已激活'
    badge = '匹配度 100% · 酒精异常因子已接管'
    sub = '乙醇亲和性过强，系统已直接跳过常规人格审判。'
    special = true
  } else if (bestNormal.similarity < 60) {
    finalType = personalityTypes.HHHH
    modeKicker = '系统强制兜底'
    badge = `标准人格库最高匹配仅 ${bestNormal.similarity}%`
    sub = '标准人格库对你的脑回路集体罢工了，于是系统把你强制分配给了 HHHH。'
    special = true
  }

  return {
    rawScores,
    levels,
    ranked,
    bestNormal,
    finalType,
    modeKicker,
    badge,
    sub,
    special,
    secondaryType,
  }
}

export function getDimensionQuestions(dimensionKey: DimensionKey) {
  return baseQuestions.filter((question) => question.dim === dimensionKey) as BaseQuestion[]
}

export function getPatternMatchByCode(code: PatternType['code']) {
  return patternTypes.find((patternType) => patternType.code === code) ?? null
}
