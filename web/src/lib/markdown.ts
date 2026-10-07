import DOMPurify from 'dompurify'
import { marked, Renderer, type Tokens } from 'marked'
import aliases from '../link-aliases.json'
import { docByPath, type Doc } from '../docs'
import { docHref } from './router'

export type Heading = { depth: number; text: string; id: string }

const IMAGE_BASE = `${import.meta.env.BASE_URL}doc-images/`
// Source links that point at paths that do not exist in the original repository.
const PATH_ALIASES: Record<string, string> = aliases

export function normalize(value: string) {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLocaleLowerCase('vi')
}

const slugify = (value: string) => normalize(value).replace(/<[^>]*>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'muc'

function collect(tokens: Tokens.Generic[]): Array<{ depth: number; text: string }> {
  return tokens.flatMap((token) => {
    if (token.type === 'heading') return [{ depth: token.depth as number, text: token.text as string }]
    const children = (token.tokens ?? token.items) as Tokens.Generic[] | undefined
    return children ? collect(children) : []
  })
}

/** Heading ids come from the English original (GitHub slugs) so anchors match the source documents. */
export function buildHeadings(markdown: string, anchors: string[] = []): Heading[] {
  const used = new Map<string, number>()
  return collect(marked.lexer(markdown) as Tokens.Generic[]).map((heading, index) => {
    let id = anchors[index] ?? slugify(heading.text)
    const count = used.get(id) ?? 0
    used.set(id, count + 1)
    if (anchors[index] === undefined && count) id = `${id}-${count}`
    return { depth: heading.depth, text: marked.parseInline(heading.text).toString().replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'"), id }
  })
}

const MARKS: Record<string, { kind: string; label: string }> = {
  white_check_mark: { kind: 'yes', label: 'Nên làm' },
  heavy_check_mark: { kind: 'yes', label: 'Nên làm' },
  ballot_box_with_check: { kind: 'soft', label: 'Nên làm (khuyến nghị)' },
  no_entry: { kind: 'no', label: 'Không được làm' },
  warning: { kind: 'warn', label: 'Không nên làm' },
}

const KEYWORDS = /\b(YOU SHOULD NOT|YOU SHOULD|YOU MUST NOT|YOU MUST|YOU MAY|DO NOT|MUST NOT|SHOULD NOT|MUST|SHOULD|MAY|DO)\b/g
const keywordKind = (word: string) => (/NOT$/.test(word) ? 'not' : /MAY$/.test(word) ? 'may' : /SHOULD/.test(word) ? 'should' : 'must')

/** Decorates RFC 2119 keywords and emoji shortcodes in text nodes, never inside <code>/<pre>. */
function decorate(html: string) {
  let codeDepth = 0
  return html.split(/(<[^>]+>)/g).map((part) => {
    if (part.startsWith('<')) {
      if (/^<(code|pre)[\s>]/i.test(part)) codeDepth++
      else if (/^<\/(code|pre)>/i.test(part)) codeDepth = Math.max(0, codeDepth - 1)
      return part
    }
    if (codeDepth) return part
    return part
      .replace(/:([a-z_]+):/g, (all, name: string) => {
        const mark = MARKS[name]
        return mark ? `<span class="mark mark-${mark.kind}" role="img" aria-label="${mark.label}"></span>` : all
      })
      .replace(KEYWORDS, (word) => `<span class="kw kw-${keywordKind(word)}">${word}</span>`)
  }).join('')
}

function resolveHref(href: string, doc: Doc): { href: string; external: boolean } {
  if (/^(https?:|mailto:)/i.test(href)) return { href, external: true }
  if (href.startsWith('#')) return { href: docHref(doc.id, href.slice(1)), external: false }
  const [rawPath, ...hash] = href.split('#')
  const folder = doc.path.includes('/') ? doc.path.slice(0, doc.path.lastIndexOf('/') + 1) : ''
  const parts: string[] = []
  for (const part of (folder + rawPath.replace(/^\.\//, '')).split('/')) {
    if (part === '..') parts.pop()
    else if (part && part !== '.') parts.push(part)
  }
  const path = parts.join('/')
  const target = docByPath.get(PATH_ALIASES[path] ?? path)
  const anchor = hash.join('#') || undefined
  if (target) return { href: docHref(target.id, anchor), external: false }
  return { href: `https://github.com/microsoft/api-guidelines/blob/vNext/${path}${anchor ? `#${anchor}` : ''}`, external: true }
}

export function renderDoc(doc: Doc, markdown: string, headings: Heading[]) {
  let headingIndex = 0
  const renderer = new Renderer()
  renderer.heading = function (token) {
    const heading = headings[headingIndex++]
    // The page already shows the document title as its h1; keep the anchor but drop the duplicate heading.
    if (headingIndex === 1 && token.depth === 1) return `<span id="${heading?.id ?? slugify(token.text)}"></span>`
    return `<h${token.depth} id="${heading?.id ?? slugify(token.text)}">${this.parser.parseInline(token.tokens)}</h${token.depth}>\n`
  }
  renderer.link = function (token) {
    const { href, external } = resolveHref(token.href, doc)
    const title = token.title ? ` title="${token.title.replace(/"/g, '&quot;')}"` : ''
    const attrs = external ? ' target="_blank" rel="noreferrer"' : ''
    return `<a href="${href}"${title}${attrs}>${this.parser.parseInline(token.tokens)}</a>`
  }
  renderer.image = (token) => {
    const src = /^https?:/i.test(token.href) ? token.href : IMAGE_BASE + token.href.replace(/^\.\//, '').split('/').pop()
    return `<img src="${src}" alt="${token.text.replace(/"/g, '&quot;')}" loading="lazy">`
  }
  const table = renderer.table.bind(renderer)
  renderer.table = (token) => `<div class="table-wrap" role="region" tabindex="0" aria-label="Bảng">${table(token)}</div>`
  const code = renderer.code.bind(renderer)
  renderer.code = (token) => code(token).replace(/^<pre>/, '<pre tabindex="0">')
  const html = marked.parse(markdown, { renderer, async: false }) as string
  // Raw HTML anchors (`<a href="#id" name="id">`) bypass the renderer; route them like markdown links.
  const withLinks = html.replace(/<a\s([^>]*?)href="(?!#\/|https?:|mailto:|\/)([^"]+)"/g, (_all, before: string, href: string) => {
    const resolved = resolveHref(href, doc)
    return `<a ${before}href="${resolved.href}"${resolved.external ? ' target="_blank" rel="noreferrer"' : ''}`
  })
  const withImages = withLinks.replace(/<img([^>]*?)\ssrc="(?!https?:|\/)([^"]+)"/g, (all, before: string, src: string) => src.startsWith(IMAGE_BASE) ? all : `<img${before} src="${IMAGE_BASE}${src.split('/').pop()}"`)
  return DOMPurify.sanitize(decorate(withImages), { ADD_ATTR: ['target'] })
}

export function plainText(markdown: string) {
  return markdown.replace(/```[\s\S]*?```/g, ' ').replace(/<[^>]+>/g, ' ').replace(/[`*_>#|[\]()]/g, ' ').replace(/\s+/g, ' ').trim()
}

export function snippet(plain: string, query: string) {
  const index = normalize(plain).indexOf(normalize(query))
  if (index < 0) return ''
  const start = Math.max(0, index - 70)
  return `${start ? '…' : ''}${plain.slice(start, index + query.length + 120).trim()}…`
}

/** Splits rendered HTML so figures can be placed after a section's text (just before the next heading). */
export function splitForFigures(html: string, anchors: string[]) {
  const cuts = anchors.flatMap((anchor, index) => {
    const start = html.search(new RegExp(`<(?:h[1-6]|span)[^>]*\\sid="${anchor.replace(/[^\w-]/g, '\\$&')}"`))
    if (start < 0) return []
    const rest = html.slice(start + 3)
    const next = rest.search(/<h[1-6][\s>]/)
    return [{ index, at: next < 0 ? html.length : start + 3 + next }]
  }).sort((a, b) => a.at - b.at)
  const segments: string[] = []
  let last = 0
  for (const cut of cuts) { segments.push(html.slice(last, cut.at)); last = cut.at }
  segments.push(html.slice(last))
  return { segments, order: cuts.map((cut) => cut.index) }
}
