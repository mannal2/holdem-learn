import { part2PracticeQuestions } from '../../content/part2Practice'
import { part1PracticeQuestions, type PracticeQuestion } from '../../content/part1Practice'
import { getPartForLesson } from '../../content/catalog'
import type { SessionProgress } from '../learning/LearningSession'

export interface PracticeSession {
  questionIds: string[]
  optionOrders: Record<string, string[]>
  progress: SessionProgress
  completed: boolean
}
export interface PracticeData { version: 1; sessions: Record<string, PracticeSession>; results: Record<string, PracticeSession> }
const KEY = 'holdem-practice-progress'
const empty = (): PracticeData => ({ version: 1, sessions: {}, results: {} })
export const practiceLessonIds = ['identify-properties', 'compare-hands', 'classify-strength', 'same-hand-different-position', 'starting-hand-challenge', 'preflop-to-flop', 'read-current-hand', 'pair-types', 'two-pair-and-set', 'board-and-risk', 'flop-reading-challenge']
const practiceQuestions: PracticeQuestion[] = [...part1PracticeQuestions, ...part2PracticeQuestions]
export const isComprehensivePractice = (lessonId: string) => ['starting-hand-challenge', 'flop-reading-challenge'].includes(lessonId)
export function getPracticePart(lessonId: string) {
  return practiceLessonIds.includes(lessonId) ? getPartForLesson(lessonId) : undefined
}
function belongsToPractice(q: PracticeQuestion, lessonId: string): boolean {
  return isComprehensivePractice(lessonId) ? Boolean(getPracticePart(lessonId)?.lessonIds.includes(q.lessonId)) : q.lessonId === lessonId
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// 먼저 개념별 수를 정하고, 그 안에서 문제를 뽑습니다. 무작위 편중을 막는 부분입니다.
function groups(lessonId: string): [string, number][] {
  switch (lessonId) {
    case 'identify-properties': return [['p1-features', 4]]
    case 'compare-hands': return [['p1-compare', 4]]
    case 'classify-strength': return [['p1-strength', 4]]
    case 'same-hand-different-position': return [['p1-position-dependent', 2], ['p1-position-strong', 1], ['p1-position-weak', 1]]
    case 'starting-hand-challenge': return [['p1-features', 1], ['p1-compare', 1], ['p1-strength', 1], ['p1-position-dependent', 1], ['p1-position-strong', 1], ['p1-position-weak', 1]]
    case 'preflop-to-flop': return [['hit', 2], ['miss', 2]]
    case 'read-current-hand': return [['high', 1], ['pair', 1], ...shuffle(['two', 'trips', 'straight', 'flush']).slice(0, 2).map(c => [c, 1] as [string, number])]
    case 'pair-types': return [['top', 1], ['middle', 1], ['bottom', 1], ['over', 1]]
    case 'two-pair-and-set': return [['two', 2], ['set', 2]]
    case 'board-and-risk': return [['shared', 2], ['flush-risk', 1], ['straight-risk', 1]]
    case 'flop-reading-challenge': return [['high', 1], ['top', 1], ['two', 1], ['set', 1], ['shared', 1], [shuffle(['flush-risk', 'straight-risk'])[0], 1]]
    default: throw new Error('알 수 없는 연습 레슨')
  }
}

export function createPracticeSession(lessonId: string, previousIds: string[] = []): PracticeSession {
  const questions = groups(lessonId).flatMap(([concept, count]) => {
    const candidates = practiceQuestions.filter(q => q.concept === concept && belongsToPractice(q, lessonId))
    const fresh = shuffle(candidates.filter(q => !previousIds.includes(q.id)))
    const repeated = shuffle(candidates.filter(q => previousIds.includes(q.id)))
    return [...fresh, ...repeated].slice(0, count)
  })
  return {
    questionIds: shuffle(questions).map(q => q.id),
    optionOrders: Object.fromEntries(questions.map(q => [q.id, shuffle(q.options.map(o => o.id))])),
    progress: { stepIndex: 0, answered: 0, correct: 0, submittedStepIds: [], missedStepIds: [], selectedOptionIds: [], selectionsByStep: {} }, completed: false,
  }
}

// 저장된 순서대로 구성해야 새로고침에도 문제와 선택한 답이 어긋나지 않습니다.
export function getPracticeQuestions(session: PracticeSession): PracticeQuestion[] {
  return session.questionIds.map(id => {
    const q = practiceQuestions.find(q => q.id === id)!
    return { ...q, options: session.optionOrders[id].map(optionId => q.options.find(o => o.id === optionId)!) }
  })
}

const record = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value)
const strings = (value: unknown): value is string[] => Array.isArray(value) && value.every(v => typeof v === 'string')
function validSession(value: unknown, lessonId: string): value is PracticeSession {
  if (!practiceLessonIds.includes(lessonId) || !record(value) || !strings(value.questionIds) || !record(value.optionOrders) || !record(value.progress) || typeof value.completed !== 'boolean') return false
  const ids = value.questionIds
  if (ids.length !== (isComprehensivePractice(lessonId) ? 6 : 4) || new Set(ids).size !== ids.length) return false
  for (const id of ids) {
    const q = practiceQuestions.find(q => q.id === id)
    const order = value.optionOrders[id]
    if (!q || !belongsToPractice(q, lessonId) || !strings(order) || order.length !== q.options.length || new Set(order).size !== order.length || !order.every(o => q.options.some(option => option.id === o))) return false
  }
  const p = value.progress
  if (!Number.isInteger(p.stepIndex) || (p.stepIndex as number) < 0 || (p.stepIndex as number) >= ids.length || !strings(p.submittedStepIds) || !strings(p.missedStepIds) || !strings(p.selectedOptionIds) || !record(p.selectionsByStep)) return false
  if (new Set(p.submittedStepIds).size !== p.submittedStepIds.length || new Set(p.missedStepIds).size !== p.missedStepIds.length || !p.submittedStepIds.every(id => ids.includes(id)) || !p.missedStepIds.every(id => (p.submittedStepIds as string[]).includes(id))) return false
  if (p.answered !== p.submittedStepIds.length || p.correct !== p.submittedStepIds.length - p.missedStepIds.length || (value.completed && p.answered !== ids.length)) return false
  for (const [index, selected] of Object.entries(p.selectionsByStep)) {
    if (!/^\d+$/.test(index) || Number(index) >= ids.length || !validSelection(selected, ids[Number(index)], value.optionOrders)) return false
  }
  return validSelection(p.selectedOptionIds, ids[p.stepIndex as number], value.optionOrders)
}

// 단일 선택은 한 개, 복수 선택은 여러 개를 허용하되 중복·없는 보기 ID는 거부합니다.
function validSelection(selected: unknown, questionId: string, orders: Record<string, unknown>): boolean {
  const question = practiceQuestions.find(q => q.id === questionId)!
  const order = orders[questionId] as string[]
  return strings(selected) && new Set(selected).size === selected.length && (question.type === 'multi-choice' || selected.length <= 1) && selected.every(id => order.includes(id))
}

export function loadPractice(): { data: PracticeData; recovered: boolean } {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return { data: empty(), recovered: false }
    const data: unknown = JSON.parse(raw)
    if (!record(data) || data.version !== 1 || !record(data.sessions) || !record(data.results) || !Object.entries(data.sessions).every(([id, session]) => validSession(session, id)) || !Object.entries(data.results).every(([id, session]) => validSession(session, id) && session.completed)) throw new Error('invalid practice')
    return { data: data as unknown as PracticeData, recovered: false }
  } catch { return { data: empty(), recovered: true } }
}

export function savePractice(data: PracticeData): boolean {
  try { window.localStorage.setItem(KEY, JSON.stringify(data)); return true }
  catch { return false }
}
