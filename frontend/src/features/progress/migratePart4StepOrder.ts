import { getLesson } from '../../content/catalog'

// 2026-10-06 설명·문제 통합 전의 화면 번호 → 통합 후 같은 내용의 화면 번호.
// 삭제한 설명은 해당 문제나 요약으로 연결하고, 이동한 문제의 선택도 함께 옮깁니다.
const previousToCurrent: Record<string, number[]> = {
  'range-flop': [0, 0, 0, 1, 1, 3, 2, 4],
  'range-flop-actions': [0, 0, 1, 2, 3, 4, 5, 6],
  'range-turn': [0, 0, 1, 1, 2, 2, 3, 3],
  'range-river': [0, 0, 1, 1, 2, 2, 3, 3],
  'range-variations': [0, 1, 1, 2, 2, 3, 3, 4, 4, 5],
}
const record = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value)

function migratePoint(value: unknown): unknown {
  if (!record(value) || value.partId !== 'part-4' || typeof value.lessonId !== 'string' || value.lessonRevision !== undefined) return value
  const mapping = previousToCurrent[value.lessonId]
  if (!mapping || !Number.isInteger(value.stepIndex) || (value.stepIndex as number) < 0 || (value.stepIndex as number) >= mapping.length) return value
  if (value.selectionsByStep !== undefined && (!record(value.selectionsByStep) || !Object.entries(value.selectionsByStep).every(([index, ids]) => /^\d+$/.test(index) && Number(index) < mapping.length && Array.isArray(ids) && ids.every(id => typeof id === 'string')))) return value
  const lesson = getLesson(value.lessonId)!
  const selectionsByStep: Record<number, string[]> = {}
  for (const [index, ids] of Object.entries(value.selectionsByStep ?? {})) {
    const target = mapping[Number(index)]
    const step = lesson.steps[target]
    if ((step.type === 'single-choice' || step.type === 'multi-choice') && (ids as string[]).length) selectionsByStep[target] = ids as string[]
  }
  const stepIndex = mapping[value.stepIndex as number]
  return { ...value, stepIndex, lessonRevision: 1, selectionsByStep,
    selectedOptionIds: selectionsByStep[stepIndex] ?? value.selectedOptionIds ?? [] }
}

// 범위 검사 전에 변환해야 짧아진 레슨의 구판 마지막 위치도 정상 복원됩니다.
export function migratePart4StepOrder(value: unknown): unknown {
  if (!record(value) || value.version !== 1 || !record(value.resumeByPart)) return value
  const recent = migratePoint(value.recent)
  const entries = Object.entries(value.resumeByPart).map(([id, point]) => [id, migratePoint(point)] as const)
  if (recent === value.recent && entries.every(([id, point]) => point === (value.resumeByPart as Record<string, unknown>)[id])) return value
  return { ...value, recent, resumeByPart: Object.fromEntries(entries) }
}
