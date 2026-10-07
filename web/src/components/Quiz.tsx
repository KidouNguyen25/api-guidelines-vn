import { useRef, useState } from 'react'
import { animate, spring } from 'animejs'
import type { QuizQuestion } from '../quiz'

export default function Quiz({ questions, best, onScore }: { questions: QuizQuestion[]; best?: number; onScore: (score: number) => void }) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)
  const score = questions.reduce((total, question, index) => total + (answers[index] === question.correct ? 1 : 0), 0)
  const complete = Object.keys(answers).length === questions.length

  const submit = () => {
    setSubmitted(true)
    onScore(score)
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // Options and explanations are re-rendered with their result classes on the next frame.
    requestAnimationFrame(() => {
      const root = bodyRef.current
      if (!root) return
      animate(root.querySelectorAll('.is-correct, .is-wrong'), { scale: [0.98, 1], duration: 600, ease: spring({ bounce: 0.45 }) })
      animate(root.querySelectorAll('.quiz-explain'), { opacity: [0, 1], translateY: [-4, 0], duration: 300, ease: 'outQuad' })
    })
  }

  const reset = () => { setAnswers({}); setSubmitted(false) }

  return (
    <details className="quiz">
      <summary>Kiểm tra nhanh{best !== undefined ? ` · điểm cao nhất ${best}/${questions.length}` : ''}</summary>
      <div className="quiz-body" ref={bodyRef}>
        {questions.map((item, questionIndex) => (
          <fieldset key={item.question}>
            <legend>{questionIndex + 1}. {item.question}</legend>
            <div className="quiz-options">
              {item.answers.map((answer, answerIndex) => {
                const selected = answers[questionIndex] === answerIndex
                const correct = submitted && item.correct === answerIndex
                const wrong = submitted && selected && !correct
                return (
                  <button
                    type="button" key={answer} disabled={submitted} aria-pressed={selected}
                    className={`quiz-option${correct ? ' is-correct' : ''}${wrong ? ' is-wrong' : ''}`}
                    onClick={() => setAnswers((current) => ({ ...current, [questionIndex]: answerIndex }))}
                  >
                    <span className="quiz-key">{String.fromCharCode(65 + answerIndex)}</span><span>{answer}</span>
                  </button>
                )
              })}
            </div>
            {submitted && <p className="quiz-explain">{item.explanation}</p>}
          </fieldset>
        ))}
        {submitted
          ? <p className="quiz-result" role="status">Kết quả: {score}/{questions.length} <button type="button" className="btn btn-quiet" onClick={reset} style={{ marginLeft: '1rem' }}>Làm lại</button></p>
          : <button type="button" className="btn" disabled={!complete} onClick={submit}>Kiểm tra đáp án</button>}
      </div>
    </details>
  )
}
