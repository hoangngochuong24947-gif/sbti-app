export interface OutcomeVectorItem {
  dim: string
  model: string
  name: string
  level: 'L' | 'M' | 'H'
  explanation: string
}

export interface OutcomeEntry {
  code: string
  cn: string
  intro: string
  desc: string
  image?: string
  isSpecial: boolean
  pattern?: string
  vector?: OutcomeVectorItem[]
  oneLiner?: string
  commentary?: string
  rarity?: {
    percent: number
    label: string
    oneInX: number
  }
}

export interface OutcomeDataset {
  meta: Record<string, string>
  dimensionOrder: string[]
  dimensionMeta: Record<string, { name: string; model: string }>
  dimExplanations: Record<string, Record<'L' | 'M' | 'H', string>>
  specialTriggers: Record<string, string>
  outcomes: OutcomeEntry[]
}
