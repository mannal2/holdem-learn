import { createMemoryStorage, progressFixture } from '../../test/progressFixtures'
import { createEmptyProgress } from './createEmptyProgress'
import { LocalProgressRepository } from './LocalProgressRepository'

it.each([
  ['range-preflop', 4, 'p4-seq-q02', 2, 'p4-seq-q01-v2'],
  ['range-flop', 2, 'p4-seq-q04', 6, 'p4-seq-q06-v2'],
  ['range-flop', 4, 'p4-seq-q05', 6, 'p4-seq-q06-v2'],
] as const)('%s의 %s번째 구판 문제 답만 정리하고 위치·다른 답·완료 기록은 보존한다', async (lessonId, index, oldId, otherIndex, otherId) => {
  const storage = createMemoryStorage()
  const point = { partId: 'part-4', lessonId, stepIndex: index, answered: 2, correct: 2,
    submittedStepIds: [oldId, otherId], selectedOptionIds: [`${oldId}-option-0`],
    selectionsByStep: { [index]: [`${oldId}-option-0`], [otherIndex]: [`${otherId}-option-0`] } }
  const saved = { ...progressFixture, recent: point, resumeByPart: { 'part-0': { partId: 'part-0', lessonId: 'goal-and-cards', stepIndex: 1 }, 'part-4': point },
    completedPartIds: ['part-0', 'part-4'],
    completedLessonIds: [lessonId], lessonResults: { [lessonId]: { answered: 3, correct: 3, bestPercentage: 100, attempts: 1 } } }
  storage.setItem('holdem-learning-progress', JSON.stringify(saved))
  const { progress, recovered } = await new LocalProgressRepository(storage).load()
  expect(recovered).toBe(false)
  expect(progress.recent).toEqual({ ...point, ...(lessonId === 'range-flop' ? { stepIndex: oldId === 'p4-seq-q04' ? 0 : 1, lessonRevision: 1 } : {}), answered: 1, correct: 1, submittedStepIds: [otherId],
    selectedOptionIds: [], selectionsByStep: { [lessonId === 'range-flop' ? 2 : otherIndex]: [`${otherId}-option-0`] }, missedStepIds: [] })
  expect(progress.resumeByPart['part-4']).toEqual(progress.recent)
  expect(progress.resumeByPart['part-0']).toEqual(saved.resumeByPart['part-0'])
  expect(progress.completedLessonIds).toEqual(saved.completedLessonIds)
  expect(progress.completedPartIds).toEqual(saved.completedPartIds)
  expect(progress.lessonResults).toEqual(saved.lessonResults)
})

it('저장한 진도를 다시 불러온다', async () => {
  const repository = new LocalProgressRepository(createMemoryStorage())
  await repository.save(progressFixture)
  await expect(repository.load()).resolves.toEqual({ progress: progressFixture, recovered: false })
})
it('저장값이 없으면 새 진도를 반환한다', async () => {
  await expect(new LocalProgressRepository(createMemoryStorage()).load()).resolves.toEqual({ progress: createEmptyProgress(), recovered: false })
})
it('손상된 JSON은 초기화하고 복구 상태를 알린다', async () => {
  const storage = createMemoryStorage(); storage.setItem('holdem-learning-progress', '{broken')
  await expect(new LocalProgressRepository(storage).load()).resolves.toEqual({ progress: createEmptyProgress(), recovered: true })
})
it('문제별 선택 기록이 배열이 아니면 손상된 진도로 처리한다', async () => {
  const storage = createMemoryStorage()
  const point = { partId: 'part-0', lessonId: 'goal-and-cards', stepIndex: 3, selectionsByStep: { 2: 'seven' } }
  storage.setItem('holdem-learning-progress', JSON.stringify({ ...progressFixture, recent: point, resumeByPart: { 'part-0': point } }))
  await expect(new LocalProgressRepository(storage).load()).resolves.toEqual({ progress: createEmptyProgress(), recovered: true })
})
it('지원하지 않는 진도 버전은 새 진도로 복구한다', async () => {
  const storage = createMemoryStorage(); storage.setItem('holdem-learning-progress', JSON.stringify({ version: 99 }))
  expect((await new LocalProgressRepository(storage).load()).recovered).toBe(true)
})
it('null 객체와 범위를 벗어난 재개 위치는 새 진도로 복구한다', async () => {
  const storage = createMemoryStorage(); storage.setItem('holdem-learning-progress', JSON.stringify({ ...progressFixture, resumeByPart: null }))
  await expect(new LocalProgressRepository(storage).load()).resolves.toEqual({ progress: createEmptyProgress(), recovered: true })
})
it('브라우저 저장소 읽기가 거부되어도 새 진도로 복구한다', async () => {
  const storage = createMemoryStorage(); storage.getItem = () => { throw new DOMException('blocked', 'SecurityError') }
  await expect(new LocalProgressRepository(storage).load()).resolves.toEqual({ progress: createEmptyProgress(), recovered: true })
})

it('통합 전 변형 레슨의 위치를 한 번만 옮기고 개정된 구판 답만 정리한다', async () => {
  for (const [oldIndex, newIndex] of [[0, 0], [1, 1], [2, 1], [3, 2], [4, 2], [5, 3], [6, 3], [7, 4], [8, 4], [9, 5]]) {
    const storage = createMemoryStorage()
    const point = { partId: 'part-4', lessonId: 'range-variations', stepIndex: oldIndex,
      answered: 2, correct: 1, submittedStepIds: ['p4-seq-q16', 'p4-seq-q17'], missedStepIds: ['p4-seq-q17'],
      selectionsByStep: { 2: ['p4-seq-q16-option-1'], 4: ['p4-seq-q17-option-0'] } }
    const saved = { ...progressFixture, recent: point, resumeByPart: { ...progressFixture.resumeByPart, 'part-4': point } }
    storage.setItem('holdem-learning-progress', JSON.stringify(saved))
    const repository = new LocalProgressRepository(storage)
    const result = await repository.load()
    expect(result.recovered).toBe(false)
    expect(result.progress.recent).toEqual(expect.objectContaining({ stepIndex: newIndex, lessonRevision: 1,
      answered: 0, correct: 0, submittedStepIds: [], missedStepIds: [], selectionsByStep: {} }))
    expect(result.progress.resumeByPart['part-4']).toEqual(result.progress.recent)
    expect(result.progress.resumeByPart['part-0']).toEqual(progressFixture.resumeByPart['part-0'])
    expect(result.progress.completedLessonIds).toEqual(saved.completedLessonIds)
    expect(result.progress.lessonResults).toEqual(saved.lessonResults)
    expect((await repository.load()).progress).toEqual(result.progress)
  }
})

it.each([
  ['range-flop', [0, 0, 0, 1, 1, 3, 2, 4], [[2, 0, 'p4-seq-q04-v2'], [4, 1, 'p4-seq-q05-v2'], [6, 2, 'p4-seq-q06']]],
  ['range-flop-actions', [0, 0, 1, 2, 3, 4, 5, 6], [[2, 1, 'p4-seq-q07'], [4, 3, 'p4-seq-q08'], [6, 5, 'p4-seq-q09']]],
  ['range-turn', [0, 0, 1, 1, 2, 2, 3, 3], [[1, 0, 'p4-seq-q10'], [3, 1, 'p4-seq-q11'], [5, 2, 'p4-seq-q12']]],
  ['range-river', [0, 0, 1, 1, 2, 2, 3, 3], [[1, 0, 'p4-seq-q13'], [3, 1, 'p4-seq-q14'], [5, 2, 'p4-seq-q15']]],
] as const)('%s의 구판 위치를 복원하고 교체된 문항 제출·점수만 정리한다', async (lessonId, mapping, questions) => {
  for (const [oldIndex, newIndex] of mapping.entries()) {
    const storage = createMemoryStorage()
    const ids = questions.map(([, , id]) => id)
    const selections = Object.fromEntries(questions.map(([old, , id]) => [old, [`${id}-option-0`]]))
    const point = { partId: 'part-4', lessonId, stepIndex: oldIndex, answered: 3, correct: 3, submittedStepIds: ids, selectionsByStep: selections }
    storage.setItem('holdem-learning-progress', JSON.stringify({ ...progressFixture, recent: point, resumeByPart: { ...progressFixture.resumeByPart, 'part-4': point } }))
    const result = await new LocalProgressRepository(storage).load()
    expect(result.recovered).toBe(false)
    expect(result.progress.recent).toEqual(expect.objectContaining({ stepIndex: newIndex, answered: 0, correct: 0, submittedStepIds: [], selectionsByStep: {} }))
  }
})

it('화면 순서 변환의 저장이 실패해도 기존 원본을 지우지 않는다', async () => {
  const storage = createMemoryStorage()
  const point = { partId: 'part-4', lessonId: 'range-variations', stepIndex: 9 }
  const raw = JSON.stringify({ ...progressFixture, recent: point, resumeByPart: { 'part-4': point } })
  storage.setItem('holdem-learning-progress', raw)
  storage.setItem = () => { throw new Error('blocked') }
  const result = await new LocalProgressRepository(storage).load()
  expect(result.saveFailed).toBe(true)
  expect(result.recovered).toBe(false)
  expect(result.progress.recent?.stepIndex).toBe(5)
  expect(storage.getItem('holdem-learning-progress')).toBe(raw)
})
