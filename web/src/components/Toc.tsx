import { useEffect, useRef, useState } from 'react'
import { animate, spring } from 'animejs'
import { docHref } from '../lib/router'
import type { Heading } from '../lib/markdown'

const tocItems = (headings: Heading[]) => headings.filter((heading) => heading.depth === 2 || heading.depth === 3)

function useActiveHeading(headings: Heading[]) {
  const [active, setActive] = useState<string | undefined>(headings[0]?.id)
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      let current = headings[0]?.id
      for (const heading of headings) {
        const element = document.getElementById(heading.id)
        if (element && element.getBoundingClientRect().top <= window.innerHeight * 0.3) current = heading.id
      }
      setActive(current)
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame) }
  }, [headings])
  return active
}

function List({ docId, headings, active, onPick }: { docId: string; headings: Heading[]; active?: string; onPick?: () => void }) {
  return <>{headings.map((heading) => (
    <li key={heading.id} className={heading.depth === 3 ? 'sub' : undefined}>
      <a href={docHref(docId, heading.id)} aria-current={heading.id === active ? 'true' : undefined} onClick={onPick}>{heading.text}</a>
    </li>
  ))}</>
}

/** Sticky outline for wide screens, with a marker that glides to the heading being read. */
export function TocAside({ docId, headings }: { docId: string; headings: Heading[] }) {
  const items = tocItems(headings)
  const active = useActiveHeading(items)
  const trackRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<HTMLSpanElement>(null)
  const placed = useRef(false)

  useEffect(() => {
    const link = trackRef.current?.querySelector<HTMLElement>('a[aria-current="true"]')
    const marker = markerRef.current
    if (!link || !marker || !link.offsetParent) return
    const y = link.offsetTop + (link.offsetHeight - 24) / 2
    marker.style.opacity = '1'
    if (!placed.current || matchMedia('(prefers-reduced-motion: reduce)').matches) marker.style.transform = `translateY(${y}px)`
    else animate(marker, { translateY: y, duration: 450, ease: spring({ bounce: 0.15 }) })
    placed.current = true
    link.scrollIntoView({ block: 'nearest' })
  }, [active])

  if (!items.length) return <aside className="toc" />
  return (
    <aside className="toc" aria-label="Mục lục bài">
      <h2>Trong bài này</h2>
      <div className="toc-track" ref={trackRef}>
        <span className="toc-marker" ref={markerRef} aria-hidden />
        <ol><List docId={docId} headings={items} active={active} /></ol>
      </div>
    </aside>
  )
}

/** Collapsible outline shown above the article below 1200px. */
export function TocInline({ docId, headings }: { docId: string; headings: Heading[] }) {
  const items = tocItems(headings)
  const ref = useRef<HTMLDetailsElement>(null)
  if (!items.length) return null
  return (
    <details className="toc-inline" ref={ref}>
      <summary>Mục lục ({items.length})</summary>
      <ol><List docId={docId} headings={items} onPick={() => { if (ref.current) ref.current.open = false }} /></ol>
    </details>
  )
}
