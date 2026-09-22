import type { LearningProgress, ResumePoint } from '../../types/progress'
import { calculatePercentage } from '../learning/calculateResult'

export type ProgressAction = { type: 'hydrate'; progress: LearningProgress } | { type: 'confirm-step'; point: ResumePoint } | { type: 'complete-attempt'; lessonId: string; correct: number; answered: number } | { type: 'complete-lesson'; lessonId: string; partId?: string; passedPart?: boolean } | { type: 'reset'; partId?: string; lessonIds?: string[] }
export function progressReducer(progress: LearningProgress, action: ProgressAction): LearningProgress {
  if (action.type === 'hydrate') return action.progress
  if (action.type === 'confirm-step') return { ...progress, recent: action.point, resumeByPart: { ...progress.resumeByPart, [action.point.partId]: action.point } }
  if (action.type === 'complete-attempt') { const previous = progress.lessonResults[action.lessonId]; const percentage = calculatePercentage(action.correct, action.answered); return { ...progress, lessonResults: { ...progress.lessonResults, [action.lessonId]: { answered: action.answered, correct: action.correct, bestPercentage: Math.max(previous?.bestPercentage ?? 0, percentage), attempts: (previous?.attempts ?? 0) + 1 } } } }
  if (action.type === 'complete-lesson') return { ...progress, completedLessonIds: [...new Set([...progress.completedLessonIds, action.lessonId])], completedPartIds: action.passedPart && action.partId ? [...new Set([...progress.completedPartIds, action.partId])] : progress.completedPartIds }
  if (!action.partId) return { version: 1, recent: null, resumeByPart: {}, completedLessonIds: [], completedPartIds: [], lessonResults: {} }
  const resumeByPart = { ...progress.resumeByPart }; delete resumeByPart[action.partId]
  const lessonIds = new Set(action.lessonIds ?? [])
  const lessonResults = Object.fromEntries(Object.entries(progress.lessonResults).filter(([id]) => !lessonIds.has(id)))
  return { ...progress, recent: progress.recent?.partId === action.partId ? Object.values(resumeByPart)[0] ?? null : progress.recent, resumeByPart, completedLessonIds: progress.completedLessonIds.filter((id) => !lessonIds.has(id)), completedPartIds: progress.completedPartIds.filter((id) => id !== action.partId), lessonResults }
}
