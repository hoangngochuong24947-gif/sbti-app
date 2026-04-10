import type { dimensions, dimensionOrder } from '../data/generated/dimensions'
import type { baseQuestions, specialQuestions } from '../data/generated/questions'

export type DimensionKey = keyof typeof dimensions
export type DimensionLevel = 'L' | 'M' | 'H'

export type BaseQuestion = (typeof baseQuestions)[number]
export type SpecialQuestion = (typeof specialQuestions)[number]
export type Question = BaseQuestion | SpecialQuestion
export type QuestionId = Question['id']

export type DimensionMeta = (typeof dimensions)[DimensionKey]
export type DimensionOrder = typeof dimensionOrder
export type PatternType = {
  code: string
  pattern: string
}
export type PersonalityTypeCode = string
export type PersonalityType = {
  code: string
  cn: string
  intro: string
  desc: string
}

export type QuizAnswers = Partial<Record<QuestionId, number>>

export type DimensionLevelMap = Record<DimensionKey, DimensionLevel>
export type DimensionScoreMap = Record<DimensionKey, number>

export interface QuizSession {
  shuffledQuestions: Question[]
  answers: QuizAnswers
  previewMode: boolean
}

export type RankedPatternMatch = PatternType &
  PersonalityType & {
    distance: number
    exact: number
    similarity: number
  }

export interface QuizResult {
  rawScores: DimensionScoreMap
  levels: DimensionLevelMap
  ranked: RankedPatternMatch[]
  bestNormal: RankedPatternMatch
  finalType: PersonalityType | RankedPatternMatch
  modeKicker: string
  badge: string
  sub: string
  special: boolean
  secondaryType: RankedPatternMatch | null
}

export interface QuizProgress {
  answered: number
  total: number
  percent: number
  isComplete: boolean
}
