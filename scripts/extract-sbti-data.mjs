import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const appRoot = path.resolve(__dirname, '..')
const sourceRoot = path.resolve(appRoot, '..')
const coreHtmlPath = path.join(sourceRoot, 'core.html')
const writerSpeakPath = path.join(sourceRoot, 'writerspeak.md')
const outDir = path.join(appRoot, 'src', 'data', 'generated')

const coreHtml = fs.readFileSync(coreHtmlPath, 'utf8')
const writerSpeak = fs.readFileSync(writerSpeakPath, 'utf8').trim()

function readLiteral(marker, openingChar) {
  const startMarker = coreHtml.indexOf(marker)
  if (startMarker === -1) {
    throw new Error(`Marker not found: ${marker}`)
  }

  const start = startMarker + marker.length - 1
  const actualOpeningChar = coreHtml[start]
  if (actualOpeningChar !== openingChar) {
    throw new Error(`Expected ${openingChar} after ${marker}, got ${actualOpeningChar}`)
  }

  if (openingChar === '`') {
    let escaped = false

    for (let index = start + 1; index < coreHtml.length; index += 1) {
      const char = coreHtml[index]
      if (char === '`' && !escaped) {
        return coreHtml.slice(start, index + 1)
      }

      escaped = char === '\\' && !escaped
    }

    throw new Error(`Unterminated template literal for marker: ${marker}`)
  }

  const closingChar = openingChar === '{' ? '}' : ']'
  let depth = 0
  let quote = null
  let escaped = false

  for (let index = start; index < coreHtml.length; index += 1) {
    const char = coreHtml[index]

    if (quote) {
      if (char === quote && !escaped) {
        quote = null
      }

      escaped = char === '\\' && !escaped
      continue
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char
      escaped = false
      continue
    }

    if (char === openingChar) {
      depth += 1
    } else if (char === closingChar) {
      depth -= 1
      if (depth === 0) {
        return coreHtml.slice(start, index + 1)
      }
    }
  }

  throw new Error(`Unterminated literal for marker: ${marker}`)
}

function evaluateLiteral(literal) {
  return vm.runInNewContext(`(${literal})`)
}

function formatTs(value) {
  return JSON.stringify(value, null, 2)
}

const dimensions = evaluateLiteral(readLiteral(', y = {', '{'))
const dimensionCopy = evaluateLiteral(readLiteral(', w = {', '{'))
const dimensionOrder = evaluateLiteral(readLiteral(', T = [', '['))
const patternTypes = evaluateLiteral(readLiteral(', C = [', '['))
const baseQuestions = evaluateLiteral(readLiteral(', b = [', '['))
const specialQuestions = evaluateLiteral(readLiteral(', x = [', '['))
const personalityTypes = evaluateLiteral(readLiteral(', S = {', '{'))
const posterImages = evaluateLiteral(readLiteral(', v = {', '{'))
const posterQr = evaluateLiteral(readLiteral(', te = `', '`'))

fs.mkdirSync(outDir, { recursive: true })

fs.writeFileSync(
  path.join(outDir, 'questions.ts'),
  `export const baseQuestions = ${formatTs(baseQuestions)} as const;\n\nexport const specialQuestions = ${formatTs(specialQuestions)} as const;\n`,
)

fs.writeFileSync(
  path.join(outDir, 'dimensions.ts'),
  `export const dimensions = ${formatTs(dimensions)} as const;\n\nexport const dimensionCopy = ${formatTs(dimensionCopy)} as const;\n\nexport const dimensionOrder = ${formatTs(dimensionOrder)} as const;\n`,
)

fs.writeFileSync(
  path.join(outDir, 'types.ts'),
  `export const personalityTypes = ${formatTs(personalityTypes)} as const;\n\nexport const patternTypes = ${formatTs(patternTypes)} as const;\n`,
)

fs.writeFileSync(
  path.join(outDir, 'assets.ts'),
  `export const posterImages = ${formatTs(posterImages)} as const;\n\nexport const posterQr = ${formatTs(posterQr)} as const;\n`,
)

fs.writeFileSync(
  path.join(outDir, 'meta.ts'),
  `export const authorNote = ${formatTs(writerSpeak)};\n\nexport const funNoteDefault = ${formatTs('本测试仅供娱乐，别拿它当诊断、面试、相亲、分手、招魂、算命或人生判决书。你可以笑，但别太当真。')};\n\nexport const funNoteSpecial = ${formatTs('本测试仅供娱乐。隐藏人格和傻乐兜底都属于作者故意埋的损招，请勿把它当成医学、心理学、相学、命理学或灵异学依据。')};\n`,
)

console.log('SBTI data extracted to', outDir)
