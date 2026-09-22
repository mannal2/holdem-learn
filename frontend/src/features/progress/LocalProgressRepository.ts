import type { LearningProgress } from '../../types/progress'
import { createEmptyProgress } from './createEmptyProgress'
import type { ProgressLoadResult, ProgressRepository } from './ProgressRepository'

const KEY = 'holdem-learning-progress'
function isProgress(value: unknown): value is LearningProgress { if (!value || typeof value !== 'object') return false; const item = value as Partial<LearningProgress>; return item.version === 1 && Array.isArray(item.completedLessonIds) && Array.isArray(item.completedPartIds) && typeof item.resumeByPart === 'object' && typeof item.lessonResults === 'object' }
export class LocalProgressRepository implements ProgressRepository {
  private readonly storage: Storage
  constructor(storage: Storage = window.localStorage) { this.storage = storage }
  async load(): Promise<ProgressLoadResult> { const raw = this.storage.getItem(KEY); if (!raw) return { progress: createEmptyProgress(), recovered: false }; try { const parsed: unknown = JSON.parse(raw); if (!isProgress(parsed)) throw new Error('invalid progress'); return { progress: parsed, recovered: false } } catch { this.storage.removeItem(KEY); return { progress: createEmptyProgress(), recovered: true } } }
  async save(progress: LearningProgress) { this.storage.setItem(KEY, JSON.stringify(progress)) }
  async reset() { this.storage.removeItem(KEY) }
}
