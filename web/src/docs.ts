import manifest from './manifest.json'
import meta from './generated/docs-meta.json'

export type GroupId = 'overview' | 'azure' | 'graph' | 'archive'
export type Doc = {
  id: string
  group: GroupId
  subgroup?: 'guide' | 'articles' | 'patterns'
  path: string
  vi: string
  en: string
  sourceUrl: string
  anchors: string[]
  sections: number
  minutes: number
  translated: boolean
  load: (() => Promise<string>) | null
}

const SOURCE_BASE = 'https://github.com/microsoft/api-guidelines/blob/vNext/'
export const SOURCE_REPO = 'https://github.com/microsoft/api-guidelines'
export const LICENSE_URL = 'https://creativecommons.org/licenses/by/4.0/'

const loaders = import.meta.glob<string>('./content/**/*.md', { query: '?raw', import: 'default' })
const metaById = meta as Record<string, { anchors: string[]; sections: number; minutes: number; translated: boolean }>

export const docs: Doc[] = (manifest as Array<Omit<Doc, 'sourceUrl' | 'anchors' | 'sections' | 'minutes' | 'translated' | 'load'>>).map((item) => ({
  ...item,
  sourceUrl: SOURCE_BASE + item.path,
  anchors: metaById[item.id]?.anchors ?? [],
  sections: metaById[item.id]?.sections ?? 0,
  minutes: metaById[item.id]?.minutes ?? 0,
  translated: metaById[item.id]?.translated ?? false,
  load: loaders[`./content/${item.path}`] ?? null,
}))

export const docById = new Map(docs.map((doc) => [doc.id, doc]))
export const docByPath = new Map(docs.map((doc) => [doc.path, doc]))

export const groups: Array<{ id: GroupId; title: string; subgroups?: Array<{ id: NonNullable<Doc['subgroup']>; title: string }> }> = [
  { id: 'overview', title: 'Tổng quan' },
  { id: 'azure', title: 'Azure' },
  { id: 'graph', title: 'Microsoft Graph', subgroups: [
    { id: 'guide', title: 'Hướng dẫn' },
    { id: 'articles', title: 'Bài viết' },
    { id: 'patterns', title: 'Mẫu thiết kế' },
  ] },
  { id: 'archive', title: 'Lưu trữ' },
]

export const groupTitle = (id: GroupId) => groups.find((group) => group.id === id)?.title ?? id

export function neighbours(doc: Doc) {
  const index = docs.indexOf(doc)
  return { prev: docs[index - 1], next: docs[index + 1] }
}
