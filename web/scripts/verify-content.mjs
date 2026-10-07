// Compares each translated file in src/content with its English original in ../source.
// Structure must match: headings per level, code blocks (verbatim), table rows, list items,
// links, RFC 2119 keywords. Usage: node scripts/verify-content.mjs [path-substring]
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const documents = JSON.parse(readFileSync(new URL('../src/manifest.json', import.meta.url), 'utf8'))

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sourceDir = join(root, '..', 'source')
const contentDir = join(root, 'src', 'content')
const only = process.argv[2]

const KEYWORDS = ['YOU SHOULD NOT', 'YOU SHOULD', 'YOU MUST NOT', 'YOU MUST', 'YOU MAY', 'DO NOT', 'MUST NOT', 'SHOULD NOT', 'MUST', 'SHOULD', 'MAY', 'DO']

function analyze(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  const info = { headings: {}, codeBlocks: [], tableRows: 0, listItems: 0, links: 0, keywords: {}, images: 0, htmlTags: 0 }
  let fence = null
  let current = []
  for (const line of lines) {
    const marker = line.match(/^\s*(```+|~~~+)/)
    if (marker) {
      if (!fence) { fence = marker[1][0]; current = [] }
      else if (marker[1][0] === fence) { info.codeBlocks.push(current.map((l) => l.trimEnd()).join('\n').trim()); fence = null }
      continue
    }
    if (fence) { current.push(line); continue }
    const heading = line.match(/^(#{1,6})\s+\S/)
    if (heading) info.headings[heading[1].length] = (info.headings[heading[1].length] ?? 0) + 1
    if (/^\s*\|.*\|\s*$/.test(line) && !/^\s*\|[\s:|-]+\|\s*$/.test(line)) info.tableRows++
    if (/^\s*([-*+]|\d+\.)\s+\S/.test(line)) info.listItems++
    info.links += (line.match(/\]\(/g) ?? []).length
    info.images += (line.match(/!\[/g) ?? []).length
    info.htmlTags += (line.match(/<\/?[a-zA-Z][^>]*>/g) ?? []).length
    let rest = line
    for (const keyword of KEYWORDS) {
      const pattern = new RegExp(`\\b${keyword.replace(' ', '\\s+')}\\b`, 'g')
      const hits = rest.match(pattern)
      if (hits) { info.keywords[keyword] = (info.keywords[keyword] ?? 0) + hits.length; rest = rest.replace(pattern, ' ') }
    }
  }
  return info
}

function compare(src, vi) {
  const problems = []
  for (const level of new Set([...Object.keys(src.headings), ...Object.keys(vi.headings)])) {
    const a = src.headings[level] ?? 0, b = vi.headings[level] ?? 0
    if (a !== b) problems.push(`h${level}: gốc ${a}, dịch ${b}`)
  }
  if (src.codeBlocks.length !== vi.codeBlocks.length) problems.push(`code block: gốc ${src.codeBlocks.length}, dịch ${vi.codeBlocks.length}`)
  else src.codeBlocks.forEach((block, index) => { if (block !== vi.codeBlocks[index]) problems.push(`code block #${index + 1} khác nội dung`) })
  for (const key of ['tableRows', 'listItems', 'links', 'images', 'htmlTags']) if (src[key] !== vi[key]) problems.push(`${key}: gốc ${src[key]}, dịch ${vi[key]}`)
  for (const keyword of KEYWORDS) {
    const a = src.keywords[keyword] ?? 0, b = vi.keywords[keyword] ?? 0
    if (a !== b) problems.push(`${keyword}: gốc ${a}, dịch ${b}`)
  }
  return problems
}

if (only === '--pair') {
  const problems = compare(analyze(readFileSync(process.argv[3], 'utf8')), analyze(readFileSync(process.argv[4], 'utf8')))
  if (problems.length) { console.log('LỆCH'); problems.forEach((p) => console.log(`  - ${p}`)); process.exit(1) }
  console.log('ĐẠT')
  process.exit(0)
}

let failed = 0, checked = 0
for (const doc of documents) {
  if (only && !doc.path.includes(only)) continue
  const srcFile = join(sourceDir, doc.path), viFile = join(contentDir, doc.path)
  if (!existsSync(srcFile)) { console.log(`GỐC THIẾU  ${doc.path}`); failed++; continue }
  if (!existsSync(viFile)) { console.log(`CHƯA DỊCH  ${doc.path}`); failed++; continue }
  checked++
  const problems = compare(analyze(readFileSync(srcFile, 'utf8')), analyze(readFileSync(viFile, 'utf8')))
  if (problems.length) { failed++; console.log(`LỆCH       ${doc.path}`); problems.forEach((p) => console.log(`             - ${p}`)) }
  else console.log(`ĐẠT        ${doc.path}`)
}

// Relative .md links in translated content must resolve to a document in the manifest.
const known = new Set(documents.map((doc) => doc.path))
const aliases = JSON.parse(readFileSync(new URL('../src/link-aliases.json', import.meta.url), 'utf8'))
for (const doc of documents) {
  const viFile = join(contentDir, doc.path)
  if (!existsSync(viFile)) continue
  for (const match of readFileSync(viFile, 'utf8').matchAll(/\]\((?!https?:|#|mailto:)([^)\s]+)\)/g)) {
    const [target] = match[1].split('#')
    if (!target || /\.(png|gif|jpg|svg)$/i.test(target)) continue
    const resolved = join(dirname(doc.path), target).replace(/\\/g, '/').replace(/^\.\//, '')
    const final = aliases[resolved] ?? resolved
    if (!known.has(final) && !/\/$/.test(target)) {
      // Links that are already broken in the English original are reported but do not fail the check.
      if (readFileSync(join(sourceDir, doc.path), 'utf8').includes(`](${match[1]})`)) console.log(`CẢNH BÁO   ${doc.path} → ${match[1]} (hỏng ngay ở bản gốc)`)
      else { failed++; console.log(`LINK HỎNG  ${doc.path} → ${match[1]}`) }
    }
  }
}

console.log(`\n${checked} file đã so, ${failed} vấn đề`)
process.exit(failed ? 1 : 0)
