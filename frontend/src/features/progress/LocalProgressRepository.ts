import type { LearningProgress, ResumePoint } from '../../types/progress'
import { getLesson, getPart } from '../../content/catalog'
import { createEmptyProgress } from './createEmptyProgress'
import type { ProgressLoadResult, ProgressRepository } from './ProgressRepository'

const KEY = 'holdem-learning-progress'
const record = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value)
const strings = (value: unknown): value is string[] => Array.isArray(value) && value.every((item) => typeof item === 'string')
const finiteNonNegative = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0

function isResumePoint(value: unknown): value is ResumePoint {
  if (!record(value) || typeof value.partId !== 'string' || typeof value.lessonId !== 'string' || !Number.isInteger(value.stepIndex)) return false
  const part = getPart(value.partId); const lesson = getLesson(value.lessonId)
  if (!part || !lesson || !part.lessonIds.includes(lesson.id) || (value.stepIndex as number) < 0 || (value.stepIndex as number) >= lesson.steps.length) return false
  return (value.answered === undefined || finiteNonNegative(value.answered)) && (value.correct === undefined || finiteNonNegative(value.correct)) && (value.submittedStepIds === undefined || strings(value.submittedStepIds)) && (value.missedStepIds === undefined || strings(value.missedStepIds)) && (value.selectedOptionIds === undefined || strings(value.selectedOptionIds)) && (value.selectionsByStep === undefined || (record(value.selectionsByStep) && Object.values(value.selectionsByStep).every(strings)))
}

function isProgress(value: unknown): value is LearningProgress {
  if (!record(value) || value.version !== 1 || !strings(value.completedLessonIds) || !strings(value.completedPartIds) || !record(value.resumeByPart) || !record(value.lessonResults)) return false
  if (value.recent !== null && !isResumePoint(value.recent)) return false
  if (!Object.values(value.resumeByPart).every(isResumePoint)) return false
  return Object.values(value.lessonResults).every((result) => record(result) && finiteNonNegative(result.answered) && finiteNonNegative(result.correct) && finiteNonNegative(result.bestPercentage) && result.bestPercentage <= 100 && Number.isInteger(result.attempts) && (result.attempts as number) >= 0 && (result.missedStepIds === undefined || strings(result.missedStepIds)))
}

export class LocalProgressRepository implements ProgressRepository {
  private readonly suppliedStorage?: Storage
  constructor(storage?: Storage) { this.suppliedStorage = storage }
  private storage() { return this.suppliedStorage ?? window.localStorage }
  async load(): Promise<ProgressLoadResult> {
    try {
      const storage = this.storage(); const raw = storage.getItem(KEY)
      if (!raw) return { progress: createEmptyProgress(), recovered: false }
      const parsed: unknown = JSON.parse(raw)
      if (!isProgress(parsed)) throw new Error('invalid progress')
      return { progress: parsed, recovered: false }
    } catch {
      try { this.storage().removeItem(KEY) } catch { /* 저장소가 차단돼도 앱은 계속한다. */ }
      return { progress: createEmptyProgress(), recovered: true }
    }
  }
  async save(progress: LearningProgress) { this.storage().setItem(KEY, JSON.stringify(progress)) }
  async reset() { this.storage().removeItem(KEY) }
}
