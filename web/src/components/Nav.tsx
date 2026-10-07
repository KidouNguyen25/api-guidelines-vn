import { useEffect, useRef } from 'react'
import { Check } from 'lucide-react'
import { docs, groups, type Doc } from '../docs'
import { docHref } from '../lib/router'

function Item({ doc, current, read, onNavigate }: { doc: Doc; current: string; read: boolean; onNavigate: () => void }) {
  return (
    <li>
      <a href={docHref(doc.id)} aria-current={doc.id === current ? 'page' : undefined} onClick={onNavigate}>
        <span>{doc.vi}</span>
        {read && <Check className="read-tick" size={15} aria-label="Đã đọc" />}
      </a>
    </li>
  )
}

export default function Nav({ current, read, open, onClose }: { current: string; read: string[]; open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    ref.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: 'nearest' })
  }, [current])

  useEffect(() => {
    if (!open) return
    const nav = ref.current!
    nav.querySelector<HTMLElement>('a')?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { onClose(); return }
      if (event.key !== 'Tab') return
      const focusable = [...nav.querySelectorAll<HTMLElement>('a')]
      const first = focusable[0], last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <>
      <nav id="doc-nav" ref={ref} className={`nav ${open ? 'is-open' : ''}`} aria-label="Danh mục tài liệu">
        {groups.map((group) => {
          const items = docs.filter((doc) => doc.group === group.id)
          return (
            <div className="nav-group" key={group.id}>
              <h2>{group.title}</h2>
              {group.subgroups
                ? group.subgroups.map((sub) => (
                  <div key={sub.id}>
                    <h3>{sub.title}</h3>
                    <ul>{items.filter((doc) => doc.subgroup === sub.id).map((doc) => <Item key={doc.id} doc={doc} current={current} read={read.includes(doc.id)} onNavigate={onClose} />)}</ul>
                  </div>
                ))
                : <ul>{items.map((doc) => <Item key={doc.id} doc={doc} current={current} read={read.includes(doc.id)} onNavigate={onClose} />)}</ul>}
            </div>
          )
        })}
      </nav>
      {open && <button className="scrim" aria-label="Đóng danh mục" tabIndex={-1} onClick={onClose} />}
    </>
  )
}
