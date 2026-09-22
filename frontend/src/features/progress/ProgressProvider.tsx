import { createContext, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react'
import type { LearningProgress, ResumePoint } from '../../types/progress'
import { createEmptyProgress } from './createEmptyProgress'
import { LocalProgressRepository } from './LocalProgressRepository'
import type { ProgressRepository } from './ProgressRepository'
import { progressReducer } from './progressReducer'

interface ContextValue { progress: LearningProgress; status: 'loading' | 'ready'; warning: string | null; confirmStep(point: ResumePoint): Promise<void>; completeLesson(input: { lessonId: string; partId: string; correct: number; answered: number; passedPart: boolean }): Promise<void>; resetProgress(partId?: string): Promise<void> }
const ProgressContext = createContext<ContextValue | null>(null)
export function ProgressProvider({ children, repository = new LocalProgressRepository() }: { children: ReactNode; repository?: ProgressRepository }) {
  const [progress, dispatch] = useReducer(progressReducer, undefined, createEmptyProgress); const [status, setStatus] = useState<'loading' | 'ready'>('loading'); const [warning, setWarning] = useState<string | null>(null)
  useEffect(() => { void repository.load().then(({ progress: loaded, recovered }) => { dispatch({ type: 'hydrate', progress: loaded }); setWarning(recovered ? '저장된 진도를 복구할 수 없어 새로 시작했어요.' : null); setStatus('ready') }) }, [repository])
  const persist = async (next: LearningProgress) => { try { await repository.save(next) } catch { setWarning('현재 학습은 계속할 수 있지만 최신 진도가 저장되지 않았어요.') } }
  const value = useMemo<ContextValue>(() => ({ progress, status, warning, confirmStep: async (point) => { const next = progressReducer(progress, { type: 'confirm-step', point }); dispatch({ type: 'confirm-step', point }); await persist(next) }, completeLesson: async (input) => { let next = progressReducer(progress, { type: 'complete-attempt', lessonId: input.lessonId, correct: input.correct, answered: input.answered }); next = progressReducer(next, { type: 'complete-lesson', lessonId: input.lessonId, partId: input.partId, passedPart: input.passedPart }); dispatch({ type: 'complete-attempt', lessonId: input.lessonId, correct: input.correct, answered: input.answered }); dispatch({ type: 'complete-lesson', lessonId: input.lessonId, partId: input.partId, passedPart: input.passedPart }); await persist(next) }, resetProgress: async (partId) => { dispatch({ type: 'reset', partId }); await repository.reset(partId) } }), [progress, repository, status, warning])
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}
export function useProgress() { const value = useContext(ProgressContext); if (!value) throw new Error('ProgressProvider가 필요합니다.'); return value }
