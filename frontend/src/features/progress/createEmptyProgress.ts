import type { LearningProgress } from '../../types/progress'
export function createEmptyProgress(): LearningProgress { return { version: 1, recent: null, resumeByPart: {}, completedLessonIds: [], completedPartIds: [], lessonResults: {} } }
