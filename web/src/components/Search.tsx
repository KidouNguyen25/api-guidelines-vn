import { useEffect, useMemo, useRef, useState } from 'react'
import { Search as SearchIcon } from 'lucide-react'
import { docs, type Doc } from '../docs'
import { docHref } from '../lib/router'
import { normalize, plainText, snippet } from '../lib/markdown'

type Entry = { doc: Doc; plain: string }
let indexPromise: Promise<Entry[]> | null = null

// Built on first use so the landing page does not download every document.
function loadIndex() {
  indexPromise ??= Promise.all(docs.filter((doc) => doc.load).map(async (doc) => ({ doc, plain: plainText((await doc.load!()).normalize('NFC')) })))
  return indexPromise
}

function Highlight({ text, query }: { text: string; query: string }) {
  const at = normalize(text).indexOf(normalize(query))
  if (at < 0) return <>{text}</>
  return <>{text.slice(0, at)}<mark>{text.slice(at, at + query.length)}</mark>{text.slice(at + query.length)}</>
}

export default function Search() {
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState<Entry[]>([])
  const [active, setActive] = useState(0)
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const term = query.trim()

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const typing = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement
      if (event.key === '/' && !typing && !event.metaKey && !event.ctrlKey) { event.preventDefault(); inputRef.current?.focus() }
    }
    const onPointer = (event: PointerEvent) => { if (!boxRef.current?.contains(event.target as Node)) setOpen(false) }
    const onHash = () => { setOpen(false); setQuery('') }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onPointer)
    window.addEventListener('hashchange', onHash)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('pointerdown', onPointer); window.removeEventListener('hashchange', onHash) }
  }, [])

  const results = useMemo(() => {
    if (!term) return []
    const needle = normalize(term)
    return [
      ...docs.filter((doc) => normalize(`${doc.vi} ${doc.en}`).includes(needle)).map((doc) => ({ doc, text: doc.en })),
      ...index.filter((entry) => !normalize(`${entry.doc.vi} ${entry.doc.en}`).includes(needle)).flatMap((entry) => {
        const found = snippet(entry.plain, term)
        return found ? [{ doc: entry.doc, text: found }] : []
      }),
    ].slice(0, 12)
  }, [term, index])

  const go = (doc: Doc) => {
    location.hash = docHref(doc.id)
    setOpen(false)
    setQuery('')
    inputRef.current?.blur()
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') { setOpen(false); setQuery(''); inputRef.current?.blur() }
    else if (event.key === 'ArrowDown') { event.preventDefault(); setActive((value) => Math.min(value + 1, results.length - 1)) }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setActive((value) => Math.max(value - 1, 0)) }
    else if (event.key === 'Enter' && results[active]) go(results[active].doc)
  }

  return (
    <div className="search" ref={boxRef} role="search">
      <label className="search-field">
        <SearchIcon size={18} aria-hidden />
        <span className="sr-only">Tìm trong tài liệu</span>
        <input
          ref={inputRef} value={query} placeholder="Tìm trong tài liệu" autoComplete="off" spellCheck={false}
          role="combobox" aria-expanded={open && !!term} aria-controls="search-results" aria-activedescendant={results[active] ? `result-${active}` : undefined}
          onFocus={() => { setOpen(true); loadIndex().then(setIndex) }}
          onChange={(event) => { setQuery(event.target.value); setActive(0); setOpen(true) }}
          onKeyDown={onKeyDown}
        />
        <kbd aria-hidden>/</kbd>
      </label>
      {open && term && (
        results.length
          ? <ul className="search-results" id="search-results" role="listbox">{results.map(({ doc, text }, position) => (
            <li key={doc.id} role="presentation">
              <a id={`result-${position}`} role="option" aria-selected={position === active} href={docHref(doc.id)} onClick={(event) => { event.preventDefault(); go(doc) }} onMouseEnter={() => setActive(position)}>
                <strong>{doc.vi}</strong>
                <span><Highlight text={text} query={term} /></span>
              </a>
            </li>
          ))}</ul>
          : <div className="search-results" role="status"><p className="search-empty">Không tìm thấy “{term}”.</p></div>
      )}
    </div>
  )
}
