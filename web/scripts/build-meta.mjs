// Writes src/generated/docs-meta.json: per document, heading anchors taken from the English
// original (GitHub slugs, so links and shared URLs keep the original anchors) plus counts
// measured on the Vietnamese text (headings, reading minutes).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { marked } from 'marked'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const documents = JSON.parse(readFileSync(join(root, 'src', 'manifest.json'), 'utf8'))
const WORDS_PER_MINUTE = 220

function collectHeadings(markdown) {
  const walk = (tokens) => tokens.flatMap((token) => {
    if (token.type === 'heading') return [{ depth: token.depth, text: token.text }]
    if (token.tokens) return walk(token.tokens)
    if (token.items) return walk(token.items)
    return []
  })
  return walk(marked.lexer(markdown))
}

function plainText(inline) {
  return marked.parseInline(inline)
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
}

function githubSlugs(headings) {
  const seen = new Map()
  return headings.map(({ text }) => {
    const base = plainText(text).trim().toLowerCase().replace(/[^\p{L}\p{N}\p{M}_\- ]/gu, '').replace(/ /g, '-')
    const count = seen.get(base) ?? 0
    seen.set(base, count + 1)
    return count ? `${base}-${count}` : base
  })
}

const meta = {}
for (const doc of documents) {
  const sourceFile = join(root, '..', 'source', doc.path)
  const viFile = join(root, 'src', 'content', doc.path)
  const entry = { anchors: [], sections: 0, minutes: 0, translated: false }
  if (existsSync(sourceFile)) entry.anchors = githubSlugs(collectHeadings(readFileSync(sourceFile, 'utf8')))
  if (existsSync(viFile)) {
    const text = readFileSync(viFile, 'utf8')
    entry.translated = true
    entry.sections = collectHeadings(text).filter((h) => h.depth >= 2 && h.depth <= 3).length
    entry.minutes = Math.max(1, Math.round(text.replace(/```[\s\S]*?```/g, ' ').split(/\s+/).filter(Boolean).length / WORDS_PER_MINUTE))
  }
  meta[doc.id] = entry
}

mkdirSync(join(root, 'src', 'generated'), { recursive: true })
writeFileSync(join(root, 'src', 'generated', 'docs-meta.json'), JSON.stringify(meta))
console.log(`docs-meta: ${Object.keys(meta).length} tài liệu`)
