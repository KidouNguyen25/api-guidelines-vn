import { useEffect, useRef, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { createTimeline, svg, utils, stagger, type Timeline } from 'animejs'
import { useMotion } from '../lib/motion'
import type { BoxNode, FigureSpec, SequenceStep } from './specs'

type Body = FigureSpec['body']
const stepCaptions = (body: Body): string[] =>
  body.kind === 'sequence' ? body.steps.map((step) => step.caption) : body.kind === 'boxes' ? body.captions : body.parts.map((part) => `${part.name}: ${part.caption}`)

/* ---------- Sequence ---------- */
const SEQ_W = 720, ROW = 70, TOP = 76
const actorX = (index: number, count: number) => (count === 1 ? SEQ_W / 2 : 120 + (index * (SEQ_W - 240)) / (count - 1))

function Sequence({ actors, steps }: { actors: string[]; steps: SequenceStep[] }) {
  const height = TOP + steps.length * ROW + 10
  return (
    <svg className="fig-svg" viewBox={`0 0 ${SEQ_W} ${height}`} role="presentation" aria-hidden>
      {actors.map((name, index) => {
        const x = actorX(index, actors.length)
        return (
          <g key={name} className="d-actor">
            <rect x={x - 60} y={8} width={120} height={34} rx={2} className="fig-box" />
            <text x={x} y={30} textAnchor="middle" className="fig-text-strong">{name}</text>
            <line x1={x} y1={42} x2={x} y2={height - 6} className="fig-lifeline d-life" />
          </g>
        )
      })}
      {steps.map((step, index) => {
        const y = TOP + index * ROW + 24
        if (step.type === 'note') {
          const width = Math.max(180, step.label.length * 8.8 + 28)
          const x = Math.min(Math.max(actorX(step.actor, actors.length), width / 2 + 8), SEQ_W - width / 2 - 8)
          return (
            <g key={index} className="d-step" data-step={index}>
              <rect x={x - width / 2} y={y - 16} width={width} height={32} rx={2} className="fig-note d-note" />
              <text x={x} y={y + 5} textAnchor="middle" className="fig-text d-label">{step.label}</text>
            </g>
          )
        }
        const x1 = actorX(step.from, actors.length), x2 = actorX(step.to, actors.length)
        const dir = x2 > x1 ? 1 : -1
        const mid = (x1 + x2) / 2
        return (
          <g key={index} className={`d-step${step.tone === 'error' ? ' is-error' : ''}`} data-step={index}>
            <text x={mid} y={y - 12} textAnchor="middle" className="fig-text-mono d-label">{step.label}</text>
            <line x1={x1} y1={y} x2={x2 - dir * 2} y2={y} className="fig-arrow d-line" />
            <path d={`M${x2} ${y} l${-dir * 9} -5 v10 z`} className="fig-head d-head" />
            {step.sub && <text x={mid} y={y + 20} textAnchor="middle" className="fig-text-sub d-label">{step.sub}</text>}
          </g>
        )
      })}
    </svg>
  )
}

function playSequence(root: HTMLElement, onStep: (index: number) => void): Timeline {
  const tl = createTimeline({ defaults: { ease: 'outQuad' } })
  const hidden = root.querySelectorAll('.d-actor .fig-box, .d-actor text, .d-label, .d-head, .d-note')
  utils.set(hidden, { opacity: 0 })
  const lifelines = svg.createDrawable(root.querySelectorAll('.d-life'))
  const lines = svg.createDrawable(root.querySelectorAll('.d-line'))
  tl.add(root.querySelectorAll('.d-actor .fig-box, .d-actor text'), { opacity: [0, 1], translateY: [-6, 0], duration: 350, delay: stagger(90) })
  tl.add(lifelines, { draw: ['0 0', '0 1'], duration: 600, ease: 'inOutQuad' }, '<<+=150')
  const lineEls = [...root.querySelectorAll('.d-line')]
  root.querySelectorAll<SVGGElement>('.d-step').forEach((group, index) => {
    const line = group.querySelector('.d-line')
    tl.call(() => onStep(index), index === 0 ? '+=200' : '+=150')
    if (line) tl.add(lines[lineEls.indexOf(line)], { draw: ['0 0', '0 1'], duration: 380, ease: 'inOutQuad' }, '<<')
    tl.add(group.querySelectorAll('.d-head, .d-note'), { opacity: [0, 1], duration: 180 }, line ? '<<+=280' : '<<')
    tl.add(group.querySelectorAll('.d-label'), { opacity: [0, 1], translateY: [4, 0], duration: 320, delay: stagger(90) }, '<<+=0')
  })
  tl.call(() => onStep(-1), '+=250')
  return tl
}

/* ---------- Boxes ---------- */
function anchorPoints(from: BoxNode, to: BoxNode) {
  if (Math.abs(from.x + from.w / 2 - (to.x + to.w / 2)) < 6 || to.y > from.y + from.h - 2 && Math.abs(to.x - from.x) < from.w) {
    return { x1: from.x + from.w / 2, y1: from.y + from.h, x2: to.x + to.w / 2, y2: to.y, vertical: true }
  }
  const right = to.x > from.x
  return { x1: right ? from.x + from.w : from.x, y1: from.y + from.h / 2, x2: right ? to.x : to.x + to.w, y2: to.y + to.h / 2, vertical: false }
}

function Boxes({ body }: { body: Extract<Body, { kind: 'boxes' }> }) {
  const byId = new Map(body.nodes.map((node) => [node.id, node]))
  return (
    <svg className="fig-svg" viewBox={`0 0 ${body.width} ${body.height}`} role="presentation" aria-hidden>
      {body.edges.map((edge) => {
        const a = byId.get(edge.from)!, b = byId.get(edge.to)!
        const p = anchorPoints(a, b)
        const d = p.vertical
          ? `M${p.x1} ${p.y1} V${(p.y1 + p.y2) / 2} H${p.x2} V${p.y2}`
          : `M${p.x1} ${p.y1} H${(p.x1 + p.x2) / 2} V${p.y2} H${p.x2}`
        return (
          <g key={`${edge.from}-${edge.to}`} className="d-edge" data-step={b.step}>
            <path d={d} className={`fig-arrow d-line${edge.dashed ? ' is-dashed' : ''}`} fill="none" />
            {edge.label && <text x={(p.x1 + p.x2) / 2} y={(p.y1 + p.y2) / 2 - 8} textAnchor="middle" className="fig-text-strong d-label">{edge.label}</text>}
          </g>
        )
      })}
      {body.nodes.map((node) => (
        <g key={node.id} className="d-node" data-step={node.step}>
          <rect x={node.x} y={node.y} width={node.w} height={node.h} rx={2} className="fig-box" />
          <text x={node.x + 12} y={node.y + 24} className="fig-text-strong">{node.title}</text>
          {node.lines?.map((line, index) => <text key={line} x={node.x + 12} y={node.y + 48 + index * 24} className="fig-text-mono">{line}</text>)}
        </g>
      ))}
    </svg>
  )
}

function playBoxes(root: HTMLElement, onStep: (index: number) => void, steps: number): Timeline {
  const tl = createTimeline({ defaults: { ease: 'outQuad' } })
  utils.set(root.querySelectorAll('.d-node, .d-label'), { opacity: 0 })
  const lines = [...root.querySelectorAll('.d-line')]
  const drawables = svg.createDrawable(lines)
  for (let step = 0; step < steps; step++) {
    tl.call(() => onStep(step), step === 0 ? 150 : '+=250')
    tl.add(root.querySelectorAll(`.d-node[data-step="${step}"]`), { opacity: [0, 1], translateY: [8, 0], duration: 400, delay: stagger(90) }, '<<')
    root.querySelectorAll(`.d-edge[data-step="${step}"]`).forEach((edge) => {
      const index = lines.indexOf(edge.querySelector('.d-line')!)
      tl.add(drawables[index], { draw: ['0 0', '0 1'], duration: 450, ease: 'inOutQuad' }, '<<+=250')
      tl.add(edge.querySelectorAll('.d-label'), { opacity: [0, 1], duration: 250 }, '<<+=250')
    })
  }
  tl.call(() => onStep(-1), '+=300')
  return tl
}

/* ---------- URL ---------- */
function UrlAnatomy({ parts }: { parts: Array<{ text: string; name: string }> }) {
  return (
    <div className="fig-url" aria-hidden>
      {parts.map((part, index) => <span key={part.name} className="fig-url-part d-label" data-step={index} data-n={index + 1}>{part.text}</span>)}
    </div>
  )
}

function playUrl(root: HTMLElement, onStep: (index: number) => void, steps: number): Timeline {
  const tl = createTimeline({ defaults: { ease: 'outQuad' } })
  utils.set(root.querySelectorAll('.fig-url-part'), { opacity: 0 })
  for (let step = 0; step < steps; step++) {
    tl.call(() => onStep(step), step === 0 ? 200 : '+=350')
    tl.add(root.querySelectorAll(`.fig-url-part[data-step="${step}"]`), { opacity: [0, 1], translateY: [10, 0], duration: 450 }, '<<')
  }
  tl.call(() => onStep(-1), '+=400')
  return tl
}

/* ---------- Figure ---------- */
export default function Figure({ spec }: { spec: FigureSpec }) {
  const rootRef = useRef<HTMLElement>(null)
  const [started, setStarted] = useState(false)
  const [run, setRun] = useState(0)
  const [active, setActive] = useState(-1)
  const captions = stepCaptions(spec.body)

  useEffect(() => {
    const root = rootRef.current
    if (!root || started) return
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect() } }, { threshold: 0.4 })
    observer.observe(root)
    return () => observer.disconnect()
  }, [started])

  useMotion(rootRef, () => {
    if (!started) return
    const root = rootRef.current!
    const body = spec.body
    const timeline = body.kind === 'sequence' ? playSequence(root, setActive) : body.kind === 'boxes' ? playBoxes(root, setActive, captions.length) : playUrl(root, setActive, captions.length)
    return () => { timeline.revert(); setActive(-1) }
  }, [started, run])

  return (
    <figure className="figure" ref={rootRef}>
      <figcaption className="figure-head">
        <span className="figure-title">{spec.title}</span>
        <button type="button" className="figure-replay" onClick={() => setRun((value) => value + 1)} aria-label={`Phát lại: ${spec.title}`}><RotateCcw size={16} aria-hidden /> Phát lại</button>
      </figcaption>
      <div className="figure-canvas" tabIndex={0} role="group" aria-label={spec.title}>
        {spec.body.kind === 'sequence' && <Sequence actors={spec.body.actors} steps={spec.body.steps} />}
        {spec.body.kind === 'boxes' && <Boxes body={spec.body} />}
        {spec.body.kind === 'url' && <UrlAnatomy parts={spec.body.parts} />}
      </div>
      <ol className="figure-steps">
        {captions.map((caption, index) => <li key={caption} className={index === active ? 'is-active' : undefined}>{caption}</li>)}
      </ol>
      <p className="figure-source">Minh họa theo: {spec.source}.</p>
    </figure>
  )
}
