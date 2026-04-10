import styles from './IntroScreen.module.css'

interface IntroScreenProps {
  questionCount: number
  outcomeCount: number
  onStart: () => void
  outcomeError: string | null
}

export function IntroScreen({
  questionCount,
  outcomeCount,
  onStart,
  outcomeError,
}: IntroScreenProps) {
  return (
    <section className={`card-surface ${styles.hero} ${styles.heroMinimal}`}>
      <div className={styles.eyebrow}>SBTI 人格测试重构版</div>
      <h1>SBTI测试 人格解析注入版</h1>
      <p className={styles.sub}>
        当前技术栈采用 Vite + React + TypeScript + ESLint9，后续开发可以围绕此框架。结果插画与图鉴说明来自开源项目https://github.com/serenakeyitan/sbti-wiki的整理成果。
      </p>

      <div className={styles.heroGrid}>
        <section className={styles.miniPanel}>
          <h2>这版保留了什么</h2>
          <ul>
            <li>{questionCount} 道主流程题，外加饮酒分支特殊题</li>
            <li>15 维度评分、27 结局匹配、HHHH/DRUNK 特殊分支</li>
            <li>结果页主海报、匹配度、维度解释、作者说明等等全部原模原样保留，在展示端仅加入了Wiki的图鉴数据</li>
          </ul>
        </section>

        <section className={styles.miniPanel}>
          <h2>这版做了什么</h2>
          <ul>
            <li>我重新写了一版更具解耦性和可维护性的项目结构，方便其他开发者投入SBTI的题设当中</li>
            <li>本项目将原先的三文件逻辑拆分成了多个文件，并进行了模块化处理提升</li>
            <li>把Wiki中对于各维度和各人格的解读、稀有度分析等注入了网页端的分析结果</li>
          </ul>
        </section>
      </div>

      <div className={styles.metaRow}>
        <span>{questionCount} 主题</span>
        <span>{outcomeCount} 种结局</span>
        <span>本人的服务器经不起折腾，所以暂时没办法供大家使用，请将本项目克隆到本地后使用</span>
      </div>

      <div className={styles.actions}>
        <button className="btn-primary" type="button" onClick={onStart}>
          开始测试
        </button>
      </div>

      {outcomeError ? (
        <p className={styles.warning}>
          结果图鉴数据加载失败：{outcomeError}。答题流程仍可运行，但结果页会退回本地文案。
        </p>
      ) : null}
    </section>
  )
}
