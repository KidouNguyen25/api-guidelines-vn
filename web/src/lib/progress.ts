import { useCallback, useEffect, useState } from 'react'

type Progress = { read: string[]; scores: Record<string, number> }
const STORAGE_KEY = 'api-guidelines-vn-progress-v2'

function load(): Progress {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Partial<Progress> | null
    return { read: saved?.read ?? [], scores: saved?.scores ?? {} }
  } catch {
    return { read: [], scores: {} }
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(load)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)) } catch { /* storage unavailable */ }
  }, [progress])

  const toggleRead = useCallback((id: string) => {
    setProgress((current) => ({ ...current, read: current.read.includes(id) ? current.read.filter((item) => item !== id) : [...current.read, id] }))
  }, [])

  const saveScore = useCallback((id: string, score: number) => {
    setProgress((current) => ({ ...current, scores: { ...current.scores, [id]: Math.max(current.scores[id] ?? 0, score) } }))
  }, [])

  return { read: progress.read, scores: progress.scores, toggleRead, saveScore }
}
