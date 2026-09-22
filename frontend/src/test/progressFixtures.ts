import type { LearningProgress } from '../types/progress'
import type { ProgressAction } from '../features/progress/progressReducer'

export const progressFixture: LearningProgress = { version: 1, recent: null, resumeByPart: {}, completedLessonIds: [], completedPartIds: [], lessonResults: {} }
export function progressWithBestScore(score: number): LearningProgress { return { ...structuredClone(progressFixture), lessonResults: { 'part-1-challenge': { answered: 5, correct: 5, bestPercentage: score, attempts: 1 } } } }
export function progressAfterSubmittingStepFive(): LearningProgress { const point = { partId: 'part-1', lessonId: 'hand-properties', stepIndex: 5 }; return { ...structuredClone(progressFixture), recent: point, resumeByPart: { 'part-1': point } } }
export const expectedPart0ResumePoint = { partId: 'part-0', lessonId: 'goal-and-cards', stepIndex: 1 }
export const expectedPart1ResumePoint = { partId: 'part-1', lessonId: 'hand-properties', stepIndex: 2 }
export const confirmedPart0Step: ProgressAction = { type: 'confirm-step', point: expectedPart0ResumePoint }
export const confirmedPart1Step: ProgressAction = { type: 'confirm-step', point: expectedPart1ResumePoint }

export const progressAtPartOneStepSix: LearningProgress = {
  ...structuredClone(progressFixture),
  recent: { partId: 'part-1', lessonId: 'hand-properties', stepIndex: 6 },
  resumeByPart: { 'part-1': { partId: 'part-1', lessonId: 'hand-properties', stepIndex: 6 } },
}

export const progressWithCompletedPart0: LearningProgress = {
  ...structuredClone(progressFixture),
  completedLessonIds: ['guided-hand'],
  completedPartIds: ['part-0'],
  lessonResults: { 'guided-hand': { answered: 5, correct: 4, bestPercentage: 80, attempts: 1 } },
}

export const progressWithFailedPart1Challenge: LearningProgress = {
  ...structuredClone(progressFixture),
  lessonResults: { 'starting-hand-challenge': { answered: 5, correct: 3, bestPercentage: 60, attempts: 1 } },
}

export const progressInBothParts: LearningProgress = {
  ...structuredClone(progressFixture),
  recent: expectedPart1ResumePoint,
  resumeByPart: { 'part-0': expectedPart0ResumePoint, 'part-1': expectedPart1ResumePoint },
  completedLessonIds: ['goal-and-cards', 'hand-notation'],
  lessonResults: {
    'goal-and-cards': { answered: 1, correct: 1, bestPercentage: 100, attempts: 1 },
    'hand-notation': { answered: 3, correct: 2, bestPercentage: 67, attempts: 1 },
  },
}

export function createMemoryStorage(): Storage {
  const values = new Map<string, string>()
  return { get length() { return values.size }, clear: () => values.clear(), getItem: (key) => values.get(key) ?? null, key: (index) => [...values.keys()][index] ?? null, removeItem: (key) => { values.delete(key) }, setItem: (key, value) => { values.set(key, value) } }
}
