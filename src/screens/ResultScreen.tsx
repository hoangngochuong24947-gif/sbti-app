import styles from './ResultScreen.module.css'
import type { OutcomeEntry } from '../types/outcomes'
import type { DimensionKey, DimensionLevel, DimensionMeta, QuizResult } from '../types/quiz'

interface ResultScreenProps {
  result: QuizResult
  outcomeLookup: Record<string, OutcomeEntry>
  dimensions: Record<DimensionKey, DimensionMeta>
  dimensionCopy: Record<DimensionKey, Record<DimensionLevel, string>>
  authorNote: string
  funNote: string
  onRestart: () => void
  onBackIntro: () => void
}

function resolvePosterSrc(imagePath?: string) {
  if (!imagePath) {
    return null
  }

  return imagePath.startsWith('/') ? imagePath : `/${imagePath}`
}

export function ResultScreen({
  result,
  outcomeLookup,
  dimensions,
  dimensionCopy,
  authorNote,
  funNote,
  onRestart,
  onBackIntro,
}: ResultScreenProps) {
  const finalType = result.finalType
  const outcome = outcomeLookup[finalType.code]
  const posterSrc = resolvePosterSrc(outcome?.image)

  return (
    <section className={`card-surface ${styles.wrap}`}>
      <div className={styles.resultLayout}>
        <div className={styles.resultTop}>
          <section className={styles.posterBox}>
            {posterSrc ? (
              <img
                alt={`${finalType.code} · ${finalType.cn}`}
                className={styles.posterImage}
                src={posterSrc}
              />
            ) : null}
            <p className={styles.posterCaption}>{finalType.intro}</p>
          </section>

          <section className={styles.typeBox}>
            <div className={styles.typeKicker}>{result.modeKicker}</div>
            <h1 className={styles.typeName}>
              {finalType.code} · {finalType.cn}
            </h1>
            <p className={styles.typeSubname}>{result.sub}</p>
            <div className={styles.match}>{result.badge}</div>
            <p className={styles.typeDesc}>{finalType.desc}</p>

            {outcome?.rarity ? (
              <div className={styles.metaGrid}>
                <div className={styles.metaItem}>
                  <div className={styles.metaKey}>理论稀有度</div>
                  <div className={styles.metaValue}>{outcome.rarity.percent}%</div>
                </div>
                <div className={styles.metaItem}>
                  <div className={styles.metaKey}>大约命中率</div>
                  <div className={styles.metaValue}>1 / {outcome.rarity.oneInX}</div>
                </div>
              </div>
            ) : null}
          </section>
        </div>

        <section className={styles.analysisBox}>
          <h2>人格简析</h2>
          <p>{outcome?.commentary ?? finalType.desc}</p>
          {result.secondaryType ? (
            <p className={styles.secondaryHint}>
              常规人格候选：{result.secondaryType.code} · {result.secondaryType.cn} ·{' '}
              {result.secondaryType.similarity}%
            </p>
          ) : null}
        </section>

        <section className={styles.dimBox}>
          <h2>十五维度评分</h2>
          <div className={styles.dimList}>
            {Object.keys(dimensions).map((dimensionKey) => {
              const key = dimensionKey as DimensionKey
              const level = result.levels[key]
              const score = result.rawScores[key]

              return (
                <article className={styles.dimItem} key={key}>
                  <div className={styles.dimItemTop}>
                    <div className={styles.dimItemName}>{dimensions[key].name}</div>
                    <div className={styles.dimItemScore}>
                      {level} / {score} 分
                    </div>
                  </div>
                  <p>{dimensionCopy[key][level]}</p>
                </article>
              )
            })}
          </div>
        </section>

        <section className={styles.noteBox}>
          <h2>友情提示</h2>
          <p>{funNote}</p>
        </section>

        <details className={styles.authorBox}>
          <summary>作者的话</summary>
          <div className={styles.authorContent}>
            {authorNote.split(/\r?\n\r?\n/).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </details>

        <div className={styles.resultActions}>
          <button className="btn-secondary" type="button" onClick={onBackIntro}>
            回到首页
          </button>
          <button className="btn-primary" type="button" onClick={onRestart}>
            再测一次
          </button>
        </div>
      </div>
    </section>
  )
}
