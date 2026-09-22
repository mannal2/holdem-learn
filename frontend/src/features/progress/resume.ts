import type { CourseCatalog } from '../../types/course'
import type { LearningProgress, ResumePoint } from '../../types/progress'
export function getResumePoint(progress: LearningProgress, _catalog: CourseCatalog, partId?: string): ResumePoint | null { return partId ? progress.resumeByPart[partId] ?? null : progress.recent }
