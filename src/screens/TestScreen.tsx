import styles from './TestScreen.module.css'
import type { Question, QuizAnswers, QuizProgress } from '../types/quiz'

interface TestScreenProps {
  questions: Question[]
  answers: QuizAnswers
  progress: QuizProgress
  onAnswerChange: (questionId: string, value: number) => void
  onSubmit: () => void
  onBack: () => void
}

function getQuestionMetaLabel(question: Question) {
  return 'special' in question && question.special ? '补充题' : '维度题'
}

export function TestScreen({
  questions,
  answers,
  progress,
  onAnswerChange,
  onSubmit,
  onBack,
}: TestScreenProps) {
  const testHint = progress.isComplete
    ? '都做完了。现在可以把你的电子灵魂交给结果页审判。'
    : '全部做完才会放行。世界已经够乱了，起码把题做完整。'

  return (
    <section className={`card-surface ${styles.wrap}`}>
      <div className={styles.topbar}>
        <div className={styles.progress}>
          <span style={{ width: `${progress.percent}%` }} />
        </div>
        <div className={styles.progressText}>
          {progress.answered} / {progress.total}
        </div>
      </div>

      <div className={styles.questionList}>
        {questions.map((question, questionIndex) => (
          <article className={styles.question} key={question.id}>
            <div className={styles.questionMeta}>
              <div className="chip">第 {questionIndex + 1} 题</div>
              <div>{getQuestionMetaLabel(question)}</div>
            </div>

            <div className={styles.questionTitle}>{question.text}</div>

            <div className={styles.options}>
              {question.options.map((option, optionIndex) => {
                const code = ['A', 'B', 'C', 'D'][optionIndex] ?? String(optionIndex + 1)

                return (
                  <label className={styles.option} key={`${question.id}-${option.value}`}>
                    <input
                      checked={answers[question.id] === option.value}
                      name={question.id}
                      onChange={() => onAnswerChange(question.id, option.value)}
                      type="radio"
                      value={option.value}
                    />
                    <div className={styles.optionCode}>{code}</div>
                    <div>{option.label}</div>
                  </label>
                )
              })}
            </div>
          </article>
        ))}
      </div>

      <div className={styles.actionsBottom}>
        <div className={styles.hint}>{testHint}</div>
        <div className={styles.actionButtons}>
          <button className="btn-secondary" type="button" onClick={onBack}>
            返回介绍
          </button>
          <button
            className="btn-primary"
            disabled={!progress.isComplete}
            type="button"
            onClick={onSubmit}
          >
            查看结果
          </button>
        </div>
      </div>
    </section>
  )
}
