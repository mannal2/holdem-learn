export interface ResumePoint {
  partId: string
  lessonId: string
  stepIndex: number
  answered?: number
  correct?: number
  submittedStepIds?: string[]
  missedStepIds?: string[]
  selectedOptionIds?: string[]
}

export interface LessonResult {
  answered: number
  correct: number
  bestPercentage: number
  attempts: number
  missedStepIds?: string[]
}

export interface LearningProgress {
  version: 1
  recent: ResumePoint | null
  resumeByPart: Record<string, ResumePoint>
  completedLessonIds: string[]
  completedPartIds: string[]
  lessonResults: Record<string, LessonResult>
}
