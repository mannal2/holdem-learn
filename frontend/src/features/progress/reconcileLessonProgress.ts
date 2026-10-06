import { getLesson } from '../../content/catalog'
import type { LearningProgress, ResumePoint } from '../../types/progress'

// 바뀐 문제에만 새 ID와 supersedes를 붙입니다. 화면 위치·완료 기록은 건드리지 않습니다.
function reconcilePoint(point: ResumePoint): ResumePoint {
  const lesson = getLesson(point.lessonId)
  if (!lesson) return point
  const replaced = lesson.steps.flatMap((step, index) => step.supersedes && (step.type === 'single-choice' || step.type === 'multi-choice')
    ? [{ step, index, oldIds: Array.isArray(step.supersedes) ? step.supersedes : [step.supersedes] }] : [])
  const submitted = point.submittedStepIds ?? []
  const removed = submitted.filter(id => replaced.some(({ oldIds }) => oldIds.includes(id)))
  const removedMissed = (point.missedStepIds ?? []).filter(id => removed.includes(id))
  const selections = { ...point.selectionsByStep }
  let selectedOptionIds = point.selectedOptionIds
  let changed = removed.length > 0
  for (const { step, index, oldIds } of replaced) {
    const valid = new Set(step.options.map(option => option.id))
    const oldSelection = selections[index]
    if (oldSelection?.some(id => !valid.has(id)) || (oldIds.some(id => removed.includes(id)) && !submitted.includes(step.id))) {
      delete selections[index]
      changed = true
    }
    if (index === point.stepIndex && selectedOptionIds?.some(id => !valid.has(id))) {
      selectedOptionIds = []
      changed = true
    }
  }
  if (!changed) return point
  return { ...point, selectedOptionIds, selectionsByStep: selections,
    submittedStepIds: submitted.filter(id => !removed.includes(id)),
    missedStepIds: (point.missedStepIds ?? []).filter(id => !removed.includes(id)),
    answered: Math.max(0, (point.answered ?? 0) - removed.length),
    correct: Math.max(0, (point.correct ?? 0) - (removed.length - removedMissed.length)) }
}

export function reconcileLessonProgress(progress: LearningProgress): LearningProgress {
  const recent = progress.recent ? reconcilePoint(progress.recent) : null
  const entries = Object.entries(progress.resumeByPart).map(([id, point]) => [id, reconcilePoint(point)] as const)
  if (recent === progress.recent && entries.every(([id, point]) => point === progress.resumeByPart[id])) return progress
  return { ...progress, recent, resumeByPart: Object.fromEntries(entries) }
}
