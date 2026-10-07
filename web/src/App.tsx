import { useCallback, useEffect, useState } from 'react'
import { docById } from './docs'
import { useProgress } from './lib/progress'
import { useRoute } from './lib/router'
import Header from './components/Header'
import Landing from './routes/Landing'
import Reader from './routes/Reader'
import './prose.css'
import './App.css'

const SITE_TITLE = 'Microsoft REST API Guidelines — Bản dịch tiếng Việt'

export default function App() {
  const route = useRoute()
  const { read, scores, toggleRead, saveScore } = useProgress()
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = useCallback(() => setMenuOpen(false), [])
  const doc = route.name === 'doc' ? docById.get(route.id) : undefined

  useEffect(() => {
    document.title = doc ? `${doc.vi} — REST API Guidelines` : SITE_TITLE
  }, [doc])

  useEffect(() => {
    window.addEventListener('hashchange', closeMenu)
    return () => window.removeEventListener('hashchange', closeMenu)
  }, [closeMenu])

  // Keyboard users land on the new page's content, not on the link they activated.
  useEffect(() => {
    if (route.name === 'doc' && route.anchor) return
    document.getElementById('main')?.focus({ preventScroll: true })
  }, [doc?.id, route.name]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <a className="skip-link" href="#main" onClick={(event) => { event.preventDefault(); document.getElementById('main')?.focus() }}>Đến nội dung</a>
      <Header onMenu={doc ? () => setMenuOpen((open) => !open) : undefined} menuOpen={menuOpen} />
      {doc
        ? <Reader doc={doc} anchor={route.name === 'doc' ? route.anchor : undefined} read={read} scores={scores} menuOpen={menuOpen} onCloseMenu={closeMenu} onToggleRead={toggleRead} onScore={saveScore} />
        : <Landing />}
    </>
  )
}
