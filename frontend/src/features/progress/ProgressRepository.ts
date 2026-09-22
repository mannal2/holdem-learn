import type { LearningProgress } from '../../types/progress'
export interface ProgressLoadResult { progress: LearningProgress; recovered: boolean }
export interface ProgressRepository { load(): Promise<ProgressLoadResult>; save(progress: LearningProgress): Promise<void>; reset(partId?: string): Promise<void> }
