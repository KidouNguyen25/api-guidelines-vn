import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, ExternalLink } from 'lucide-react'
import { animate, onScroll } from 'animejs'
import { docById, groupTitle, groups, neighbours, type Doc } from '../docs'
import { buildHeadings, renderDoc, splitForFigures } from '../lib/markdown'
import { useMotion } from '../lib/motion'
import { docHref } from '../lib/router'
import { quizzes } from '../quiz'
import Figure from '../diagrams/Figure'
import { figuresFor } from '../diagrams/specs'
import Footer from '../components/Footer'
import Nav from '../components/Nav'
import Quiz from '../components/Quiz'
import { TocAside, TocInline } from '../components/Toc'

type Props = {
  doc: Doc
  anchor?: string
  read: string[]
  scores: Record<string, number>
  menuOpen: boolean
  onCloseMenu: () => void
  onToggleRead: (id: string) => void
  onScore: (id: string, score: number) => void
}

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

export default function Reader({ doc, anchor, read, scores, menuOpen, onCloseMenu, onToggleRead, onScore }: Props) {
  const [loaded, setLoaded] = useState<{ id: string; text: string } | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const text = loaded?.id === doc.id ? loaded.text : null

  useLayoutEffect(() => {
    let live = true
    doc.load?.().then((value) => { if (live) setLoaded({ id: doc.id, text: value }) })
    return () => { live = false }
  }, [doc])

  const headings = useMemo(() => (text ? buildHeadings(text, doc.anchors) : []), [text, doc])
  const html = useMemo(() => (text ? renderDoc(doc, text, headings) : ''), [text, doc, headings])
  const figures = useMemo(() => figuresFor(doc.id), [doc.id])
  const parts = useMemo(() => splitForFigures(html, figures.map((figure) => figure.after)), [html, figures])

  // New document: start at the top. Same document: jump to the requested heading.
  const lastDoc = useRef<string>(undefined)
  useLayoutEffect(() => {
    if (lastDoc.current === doc.id) return
    lastDoc.current = doc.id
    if (!anchor) window.scrollTo(0, 0)
  }, [doc.id, anchor])
  useLayoutEffect(() => {
    if (!html || !anchor) return
    // Some source anchors are `<a name="…">` rather than heading ids.
    const target = document.getElementById(anchor) ?? document.getElementsByName(anchor)[0]
    target?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' })
  }, [html, anchor])

  useMotion(rootRef, () => {
    const root = rootRef.current!
    animate(root.querySelector('.doc-head')!, { opacity: [0, 1], translateY: [8, 0], duration: 320, ease: 'outQuad' })
    animate(root.querySelector('.read-progress')!, {
      scaleX: [0, 1], ease: 'linear',
      autoplay: onScroll({ target: root.querySelector('.reader-article')!, enter: 'top top', leave: 'bottom bottom', sync: true }),
    })
  }, [doc.id])

  useMotion(rootRef, () => {
    const headingEls = [...rootRef.current!.querySelectorAll<HTMLElement>('.prose h2')]
    if (!headingEls.length) return
    const seen = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        seen.unobserve(entry.target)
        animate(entry.target, { '--u': [0, 1], duration: 800, ease: 'outExpo' })
      }
    }, { rootMargin: '0px 0px -12% 0px' })
    headingEls.forEach((el) => { el.style.setProperty('--u', '0'); seen.observe(el) })
    return () => { seen.disconnect(); headingEls.forEach((el) => el.style.removeProperty('--u')) }
  }, [html])

  const { prev, next } = neighbours(doc)
  const isRead = read.includes(doc.id)
  const questions = quizzes[doc.id]
  const group = groups.find((item) => item.id === doc.group)
  const subgroup = group?.subgroups?.find((item) => item.id === doc.subgroup)

  return (
    <div className="shell" ref={rootRef}>
      <div className="read-progress" aria-hidden />
      <Nav current={doc.id} read={read} open={menuOpen} onClose={onCloseMenu} />
      <main className="main" id="main" tabIndex={-1}>
        <article className="reader-article">
          <header className="doc-head">
            <p className="crumbs">{groupTitle(doc.group)}{subgroup && <> <span aria-hidden>/</span> {subgroup.title}</>}</p>
            <h1>{doc.vi}</h1>
            <p className="doc-orig" lang="en">{doc.en}</p>
            <p className="doc-meta">
              {doc.translated && <span>{doc.sections} mục · {doc.minutes} phút đọc</span>}
              <a className="text-link" href={doc.sourceUrl} target="_blank" rel="noreferrer">Bản gốc <ExternalLink size={15} aria-hidden /><span className="sr-only">(mở trang mới)</span></a>
            </p>
          </header>

          {doc.group === 'archive' && <p className="notice"><strong>Đã ngừng sử dụng.</strong> Nhóm dịch vụ Azure và nhóm dịch vụ Microsoft Graph dùng các hướng dẫn riêng. Xem <a href={docHref('guidelines')}>{docById.get('guidelines')?.vi.toLowerCase()}</a>.</p>}
          {!doc.load && <p className="notice">Tài liệu này chưa có bản dịch. <a href={doc.sourceUrl} target="_blank" rel="noreferrer">Đọc bản gốc</a>.</p>}

          <TocInline docId={doc.id} headings={headings} />
          {doc.load && !text && <p className="doc-loading" role="status">Đang tải…</p>}
          {html && <div className="prose">{parts.segments.map((segment, index) => (
            <div key={`${doc.id}-${index}`} className="prose-part">
              <div dangerouslySetInnerHTML={{ __html: segment }} />
              {index < parts.order.length && <Figure spec={figures[parts.order[index]]} />}
            </div>
          ))}</div>}

          <div className="doc-foot">
            {doc.load && <button type="button" className="btn btn-quiet" aria-pressed={isRead} onClick={() => onToggleRead(doc.id)}>{isRead && <Check size={18} aria-hidden />}{isRead ? 'Đã đọc' : 'Đánh dấu đã đọc'}</button>}
            {questions && <Quiz key={doc.id} questions={questions} best={scores[doc.id]} onScore={(score) => onScore(doc.id, score)} />}
            <nav className="pager" aria-label="Bài trước và bài sau">
              {prev && <a className="prev" href={docHref(prev.id)} rel="prev"><small><ArrowLeft size={14} aria-hidden /> Trước</small><strong>{prev.vi}</strong></a>}
              {next && <a className="next" href={docHref(next.id)} rel="next"><small>Sau <ArrowRight size={14} aria-hidden /></small><strong>{next.vi}</strong></a>}
            </nav>
          </div>
          <Footer />
        </article>
      </main>
      <TocAside docId={doc.id} headings={headings} />
    </div>
  )
}
