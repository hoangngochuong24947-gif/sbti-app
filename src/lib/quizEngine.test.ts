import { describe, expect, it } from 'vitest'

import { baseQuestions, specialQuestions } from '../data/generated/questions'
import { dimensionOrder } from '../data/generated/dimensions'
import { calculateQuizResult, createQuizSession, getVisibleQuestions } from './quizEngine'

const specialGateQuestion = specialQuestions[0]
const drinkTriggerQuestion = specialQuestions[1]

function buildAnswersFromPattern(pattern: string) {
  const answers: Record<string, number> = {
    [specialGateQuestion.id]: 1,
  }

  const levelToValues: Record<string, [number, number]> = {
    L: [1, 2],
    M: [2, 2],
    H: [2, 3],
  }

  const patternChars = pattern.replaceAll('-', '').split('')

  dimensionOrder.forEach((dimensionKey, index) => {
    const questions = baseQuestions.filter((question) => question.dim === dimensionKey)
    const [firstValue, secondValue] = levelToValues[patternChars[index]]

    answers[questions[0].id] = firstValue
    answers[questions[1].id] = secondValue
  })

  return answers
}

describe('quizEngine', () => {
  it('creates 31 visible questions by default and inserts the gate question into the shuffled list', () => {
    const session = createQuizSession(() => 0)
    const visibleQuestions = getVisibleQuestions(session)

    expect(session.shuffledQuestions).toHaveLength(31)
    expect(visibleQuestions).toHaveLength(31)
    expect(visibleQuestions[1].id).toBe(specialGateQuestion.id)
    expect(visibleQuestions.some((question) => question.id === drinkTriggerQuestion.id)).toBe(false)
  })

  it('injects the drink trigger question immediately after the gate question when the user selects 饮酒', () => {
    const session = createQuizSession(() => 0)
    const withDrinkAnswer = {
      ...session,
      answers: {
        [specialGateQuestion.id]: 3,
      },
    }

    const visibleQuestions = getVisibleQuestions(withDrinkAnswer)
    const gateIndex = visibleQuestions.findIndex((question) => question.id === specialGateQuestion.id)

    expect(visibleQuestions).toHaveLength(32)
    expect(visibleQuestions[gateIndex + 1].id).toBe(drinkTriggerQuestion.id)
  })

  it('matches the exact CTRL pattern to CTRL with 100% similarity', () => {
    const answers = buildAnswersFromPattern('HHH-HMH-MHH-HHH-MHM')

    const result = calculateQuizResult(answers)

    expect(result.finalType.code).toBe('CTRL')
    expect(result.badge).toContain('100%')
    expect(result.bestNormal.code).toBe('CTRL')
    expect(result.special).toBe(false)
    expect(result.levels.S1).toBe('H')
    expect(result.levels.S2).toBe('H')
  })

  it('returns the hidden DRUNK type when the trigger question chooses the heavy drinking branch', () => {
    const answers = {
      ...buildAnswersFromPattern('HHH-HMH-MHH-HHH-MHM'),
      [specialGateQuestion.id]: 3,
      [drinkTriggerQuestion.id]: 2,
    }

    const result = calculateQuizResult(answers)

    expect(result.finalType.code).toBe('DRUNK')
    expect(result.special).toBe(true)
    expect(result.secondaryType?.code).toBe('CTRL')
    expect(result.modeKicker).toBe('隐藏人格已激活')
  })

  it('does not return DRUNK when the gate answer no longer points to 饮酒', () => {
    const answers = {
      ...buildAnswersFromPattern('HHH-HMH-MHH-HHH-MHM'),
      [specialGateQuestion.id]: 1,
      [drinkTriggerQuestion.id]: 2,
    }

    const result = calculateQuizResult(answers)

    expect(result.finalType.code).toBe('CTRL')
    expect(result.special).toBe(false)
  })

  it('falls back to HHHH when the best similarity stays below 60%', () => {
    const answers = buildAnswersFromPattern('LHM-HLH-HLH-HLL-HLL')

    const result = calculateQuizResult(answers)

    expect(result.bestNormal.similarity).toBeLessThan(60)
    expect(result.finalType.code).toBe('HHHH')
    expect(result.special).toBe(true)
    expect(result.modeKicker).toBe('系统强制兜底')
  })
})
