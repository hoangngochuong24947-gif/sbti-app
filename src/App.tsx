import { startTransition, useEffect, useState } from 'react'

import { AppShell } from './components/AppShell'
import { dimensions, dimensionCopy } from './data/generated/dimensions'
import { funNoteDefault, funNoteSpecial, authorNote } from './data/generated/meta'
import { personalityTypes } from './data/generated/types'
import {
  calculateQuizResult,
  createQuizSession,
  getQuizProgress,
  getVisibleQuestions,
} from './lib/quizEngine'
import { IntroScreen } from './screens/IntroScreen'
import { ResultScreen } from './screens/ResultScreen'
import { TestScreen } from './screens/TestScreen'
import type { OutcomeDataset } from './types/outcomes'
import type { QuizResult, QuizSession } from './types/quiz'

type AppView = 'intro' | 'test' | 'result'

function App() {
  const [view, setView] = useState<AppView>('intro')
  const [session, setSession] = useState<QuizSession | null>(null)
  const [result, setResult] = useState<QuizResult | null>(null)
  const [outcomeDataset, setOutcomeDataset] = useState<OutcomeDataset | null>(null)
  const [outcomeError, setOutcomeError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadOutcomeDataset() {
      try {
        const response = await fetch('/data/outcomes.json')
        if (!response.ok) {
          throw new Error(`Failed to load outcomes: ${response.status}`)
        }

        const dataset = (await response.json()) as OutcomeDataset
        if (active) {
          setOutcomeDataset(dataset)
          setOutcomeError(null)
        }
      } catch (error) {
        if (active) {
          setOutcomeError(error instanceof Error ? error.message : 'Unknown error')
        }
      }
    }

    loadOutcomeDataset()

    return () => {
      active = false
    }
  }, [])

  const visibleQuestions = session ? getVisibleQuestions(session) : []
  const progress = session ? getQuizProgress(session) : null
  const outcomeLookup = Object.fromEntries(
    (outcomeDataset?.outcomes ?? []).map((outcome) => [outcome.code, outcome]),
  )

  function handleStart() {
    setSession(createQuizSession())
    setResult(null)
    startTransition(() => {
      setView('test')
    })
  }

  function handleBackIntro() {
    startTransition(() => {
      setView('intro')
    })
  }

  function handleRestart() {
    handleStart()
  }

  function handleAnswerChange(questionId: string, value: number) {
    setSession((currentSession) => {
      if (!currentSession) {
        return currentSession
      }

      const nextAnswers = {
        ...currentSession.answers,
        [questionId]: value,
      }

      if (questionId === 'drink_gate_q1' && value !== 3) {
        delete nextAnswers.drink_gate_q2
      }

      return {
        ...currentSession,
        answers: nextAnswers,
      }
    })
  }

  function handleSubmit() {
    if (!session) {
      return
    }

    const currentProgress = getQuizProgress(session)
    if (!currentProgress.isComplete) {
      return
    }

    setResult(calculateQuizResult(session.answers))
    startTransition(() => {
      setView('result')
    })
  }

  return (
    <AppShell>
      {view === 'intro' ? (
        <IntroScreen
          questionCount={30}
          outcomeCount={Object.keys(personalityTypes).length}
          onStart={handleStart}
          outcomeError={outcomeError}
        />
      ) : null}

      {view === 'test' && session && progress ? (
        <TestScreen
          onBack={handleBackIntro}
          onSubmit={handleSubmit}
          onAnswerChange={handleAnswerChange}
          progress={progress}
          questions={visibleQuestions}
          answers={session.answers}
        />
      ) : null}

      {view === 'result' && result ? (
        <ResultScreen
          result={result}
          outcomeLookup={outcomeLookup}
          dimensions={dimensions}
          dimensionCopy={dimensionCopy}
          authorNote={authorNote}
          funNote={result.special ? funNoteSpecial : funNoteDefault}
          onRestart={handleRestart}
          onBackIntro={handleBackIntro}
        />
      ) : null}
    </AppShell>
  )
}

export default App
