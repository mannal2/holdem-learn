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
  useEffect(() => { void progressRepository.load().then(({ progress: loaded, recovered, saveFailed }) => { dispatch({ type: 'hydrate', progress: loaded }); setWarning(saveFailed ? '현재 학습은 계속할 수 있지만 최신 진도가 저장되지 않았어요.' : recovered ? '저장된 진도를 복구할 수 없어 새로 시작했어요.' : null); setStatus('ready') }).catch(() => { dispatch({ type: 'hydrate', progress: createEmptyProgress() }); setWarning('진도가 저장되지 않을 수 있어요. 현재 학습은 계속할 수 있습니다.'); setStatus('ready') }) }, [progressRepository])
  const persist = async (next: LearningProgress) => { try { await progressRepository.save(next) } catch { setWarning('현재 학습은 계속할 수 있지만 최신 진도가 저장되지 않았어요.') } }
  const value: ProgressContextValue = { progress, status, warning, confirmStep: async (point) => { const next = progressReducer(progress, { type: 'confirm-step', point }); dispatch({ type: 'confirm-step', point }); await persist(next) }, completeLesson: async (input) => { const attempt = { type: 'complete-attempt' as const, lessonId: input.lessonId, correct: input.correct, answered: input.answered, missedStepIds: input.missedStepIds }; let next = progressReducer(progress, attempt); next = progressReducer(next, { type: 'complete-lesson', lessonId: input.lessonId, partId: input.partId, passedPart: input.passedPart }); dispatch(attempt); dispatch({ type: 'complete-lesson', lessonId: input.lessonId, partId: input.partId, passedPart: input.passedPart }); await persist(next) }, resetProgress: async (partId) => { if (!partId) { dispatch({ type: 'reset' }); try { await progressRepository.reset() } catch { setWarning('진도 저장소를 초기화하지 못했어요.') }; return }; const action = { type: 'reset' as const, partId, lessonIds: getPart(partId)?.lessonIds }; const next = progressReducer(progress, action); dispatch(action); await persist(next) } }
  return <ProgressContext.Provider value={value}>{warning && <p className="save-warning global-warning" role="status">{warning}</p>}{children}</ProgressContext.Provider>
}
