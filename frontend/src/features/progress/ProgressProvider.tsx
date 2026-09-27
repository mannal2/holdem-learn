import { useEffect, useReducer, useState, type ReactNode } from 'react'
import type { LearningProgress } from '../../types/progress'
import { createEmptyProgress } from './createEmptyProgress'
import { LocalProgressRepository } from './LocalProgressRepository'
import type { ProgressRepository } from './ProgressRepository'
import { progressReducer } from './progressReducer'
import { getPart } from '../../content/catalog'
import { ProgressContext, type ProgressContextValue } from './progressContext'

export function ProgressProvider({ children, repository }: { children: ReactNode; repository?: ProgressRepository }) {
  const [defaultRepository] = useState<ProgressRepository>(() => new LocalProgressRepository())
  const progressRepository = repository ?? defaultRepository
  const [progress, dispatch] = useReducer(progressReducer, undefined, createEmptyProgress); const [status, setStatus] = useState<'loading' | 'ready'>('loading'); const [warning, setWarning] = useState<string | null>(null)
  useEffect(() => { void progressRepository.load().then(({ progress: loaded, recovered }) => { dispatch({ type: 'hydrate', progress: loaded }); setWarning(recovered ? '저장된 진도를 복구할 수 없어 새로 시작했어요.' : null); setStatus('ready') }) }, [progressRepository])
  const persist = async (next: LearningProgress) => { try { await progressRepository.save(next) } catch { setWarning('현재 학습은 계속할 수 있지만 최신 진도가 저장되지 않았어요.') } }
  const value: ProgressContextValue = { progress, status, warning, confirmStep: async (point) => { const next = progressReducer(progress, { type: 'confirm-step', point }); dispatch({ type: 'confirm-step', point }); await persist(next) }, completeLesson: async (input) => { let next = progressReducer(progress, { type: 'complete-attempt', lessonId: input.lessonId, correct: input.correct, answered: input.answered }); next = progressReducer(next, { type: 'complete-lesson', lessonId: input.lessonId, partId: input.partId, passedPart: input.passedPart }); dispatch({ type: 'complete-attempt', lessonId: input.lessonId, correct: input.correct, answered: input.answered }); dispatch({ type: 'complete-lesson', lessonId: input.lessonId, partId: input.partId, passedPart: input.passedPart }); await persist(next) }, resetProgress: async (partId) => { if (!partId) { dispatch({ type: 'reset' }); await progressRepository.reset(); return }; const action = { type: 'reset' as const, partId, lessonIds: getPart(partId)?.lessonIds }; const next = progressReducer(progress, action); dispatch(action); await persist(next) } }
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}
