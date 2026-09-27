import { createContext, useContext } from 'react'
import type { LearningProgress, ResumePoint } from '../../types/progress'

export interface ProgressContextValue {
  progress: LearningProgress
  status: 'loading' | 'ready'
  warning: string | null
  confirmStep(point: ResumePoint): Promise<void>
  completeLesson(input: { lessonId: string; partId: string; correct: number; answered: number; missedStepIds: string[]; passedPart: boolean }): Promise<void>
  resetProgress(partId?: string): Promise<void>
}

export const ProgressContext = createContext<ProgressContextValue | null>(null)

export function useProgress() {
  const value = useContext(ProgressContext)
  if (!value) throw new Error('ProgressProvider가 필요합니다.')
  return value
}
