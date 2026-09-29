import { getDeviceInfo } from '@zos/device'
import { localStorage } from '@zos/storage'

export const { width: W, height: H } = getDeviceInfo()
export const ROUND = W === H // okrągłe ekrany Zepp są kwadratowe w px, prostokątne (Bip 6: 390x450) nie
export const PAD = ROUND ? Math.round(W * 0.13) : 18
export const TOP = ROUND ? Math.round(H * 0.14) : 24

// wspólna pamięć na czas działania apki – przetrwa przejścia między stronami
const fallback = {}
export function store() {
  try {
    const g = getApp()._options.globalData
    if (g) return g
  } catch (e) { }
  return fallback
}

export function loadNotes() {
  const g = store()
  if (!g.notes) {
    try {
      g.notes = JSON.parse(localStorage.getItem('notes', '[]')) || []
    } catch (e) {
      g.notes = []
    }
  }
  return g.notes
}

export function fontSize() {
  const g = store()
  if (!g.fontSize) g.fontSize = Number(localStorage.getItem('fontSize', '26')) || 26
  return g.fontSize
}

// po synchronizacji – wyrzuca stare notatki i policzone układy
export function resetCache() {
  const g = store()
  g.notes = null
  g.fontSize = null
  g.plans = {}
  g.measure = {}
  g.textH = {}
}