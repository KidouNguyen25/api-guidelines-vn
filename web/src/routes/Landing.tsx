import { useLayoutEffect, useRef } from 'react'
import { ArrowRight, ExternalLink } from 'lucide-react'
import { animate, onScroll, splitText, stagger } from 'animejs'
import { SOURCE_REPO, docs, groups, type Doc } from '../docs'
import { fontsReady, useMotion } from '../lib/motion'
import { docHref } from '../lib/router'
import Footer from '../components/Footer'

// Taken from source/Guidelines.md and the READMEs.
const GROUP_NOTE: Record<string, string> = {
  overview: 'Giới thiệu kho tài liệu và thông báo về tài liệu đã ngừng sử dụng.',
  azure: 'Dành cho nhóm dịch vụ Azure.',
  graph: 'Dành cho nhóm dịch vụ Microsoft Graph, kèm bài viết chi tiết và danh mục mẫu thiết kế.',
  archive: 'Tài liệu đã ngừng sử dụng, giữ lại để tham khảo.',
}

function Row({ doc, number }: { doc: Doc; number: number }) {
  return (
    <li className="index-row">
      <a href={docHref(doc.id)}>
        <span className="num">{String(number).padStart(2, '0')}</span>
        <span className="name">{doc.vi}<span className="orig">{doc.en}</span></span>
        <span className="facts">{doc.translated ? `${doc.sections} mục · ${doc.minutes} phút đọc` : <span className="state">Chưa dịch</span>}</span>
      </a>
    </li>
  )
}

export default function Landing() {
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => { window.scrollTo(0, 0) }, [])

  useMotion(ref, () => {
    const title = ref.current!.querySelector<HTMLElement>('.hero-title')!
    const rest = ref.current!.querySelectorAll('.hero-kicker, .hero-lead, .hero-actions')
    let split: ReturnType<typeof splitText> | undefined
    let dead = false
    title.style.visibility = 'hidden'
    animate(rest, { opacity: [0, 1], translateY: [14, 0], delay: stagger(110, { start: 450 }), duration: 800, ease: 'outQuart' })
    fontsReady().then(() => {
      if (dead) return
      split = splitText(title, { lines: { wrap: 'clip' } })
      title.style.visibility = ''
      animate(split.lines, { translateY: ['105%', '0%'], delay: stagger(110), duration: 1100, ease: 'outExpo' })
    })

    ref.current!.querySelectorAll<HTMLElement>('.index-group').forEach((group) => {
      const rows = group.querySelectorAll('.index-row')
      animate(rows, {
        opacity: [0, 1], translateY: [16, 0], '--u': [0, 1],
        delay: stagger(40), duration: 800, ease: 'outQuart',
        autoplay: onScroll({ target: group, enter: 'bottom-=15% top', repeat: false }),
      })
    })

    return () => { dead = true; title.style.visibility = ''; split?.revert() }
  }, [])

  let number = 0
  return (
    <div ref={ref}>
      <div className="landing">
        <section className="hero" aria-labelledby="hero-title">
          <p className="hero-kicker">Bản dịch tiếng Việt</p>
          <h1 className="hero-title" id="hero-title">Microsoft REST API Guidelines</h1>
          <p className="hero-lead">Hướng dẫn thiết kế REST API do Microsoft công bố, dành cho nhóm dịch vụ Azure và Microsoft Graph. Bản dịch theo kho microsoft/api-guidelines, nhánh vNext.</p>
          <div className="hero-actions">
            <a className="btn" href={docHref(docs[0].id)}>Bắt đầu đọc <ArrowRight size={18} aria-hidden /></a>
            <a className="text-link" href={SOURCE_REPO} target="_blank" rel="noreferrer">Bản gốc trên GitHub <ExternalLink size={16} aria-hidden /><span className="sr-only">(mở trang mới)</span></a>
          </div>
        </section>

        <main id="main" tabIndex={-1}>
          {groups.map((group) => {
            const items = docs.filter((doc) => doc.group === group.id)
            return (
              <section className="index-group" key={group.id} aria-labelledby={`g-${group.id}`}>
                <header><h2 id={`g-${group.id}`}>{group.title}</h2><p>{GROUP_NOTE[group.id]}</p></header>
                <div>
                  {group.subgroups
                    ? group.subgroups.map((sub) => (
                      <div key={sub.id}>
                        <h3 className="index-sub">{sub.title}</h3>
                        <ul className="index-list">{items.filter((doc) => doc.subgroup === sub.id).map((doc) => <Row key={doc.id} doc={doc} number={++number} />)}</ul>
                      </div>
                    ))
                    : <ul className="index-list">{items.map((doc) => <Row key={doc.id} doc={doc} number={++number} />)}</ul>}
                </div>
              </section>
            )
          })}
        </main>
      </div>
      <Footer />
    </div>
  )
}
