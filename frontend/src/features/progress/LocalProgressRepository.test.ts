import { createMemoryStorage, progressFixture } from '../../test/progressFixtures'
import { createEmptyProgress } from './createEmptyProgress'
import { LocalProgressRepository } from './LocalProgressRepository'

it('Part 4 구판 제출·선택만 제거하고 현재 위치·다른 답·최고 기록을 유지한다', async () => {
  const storage = createMemoryStorage()
  const point = { partId: 'part-4', lessonId: 'range-challenge', stepIndex: 7, answered: 6, correct: 5,
    submittedStepIds: ['p4-q19', 'p4-q20', 'p4-q21', 'p4-q22', 'p4-q23', 'p4-q24'], missedStepIds: ['p4-q23'],
    selectedOptionIds: [], selectionsByStep: { 1: ['p4-q19-option-1'], 2: ['p4-q20-option-0'], 3: ['p4-q21-option-2'], 4: ['p4-q22-option-0', 'p4-q22-option-1'], 5: ['p4-q23-option-0'], 6: ['p4-q24-option-0'] } }
  const other = { partId: 'part-0', lessonId: 'goal-and-cards', stepIndex: 1 }
  const progress = { ...structuredClone(progressFixture), recent: point, resumeByPart: { 'part-4': point, 'part-0': other }, completedPartIds: ['part-0', 'part-4'], completedLessonIds: ['range-challenge'], lessonResults: { 'range-challenge': { answered: 6, correct: 5, bestPercentage: 100, attempts: 2, missedStepIds: ['p4-q23'] } } }
  storage.setItem('holdem-learning-progress', JSON.stringify(progress))
  const repository = new LocalProgressRepository(storage)
  const loaded = await repository.load()
  expect(loaded.recovered).toBe(false)
  expect(loaded.progress.recent).toEqual(loaded.progress.resumeByPart['part-4'])
  expect(loaded.progress.recent).toMatchObject({ stepIndex: 7, answered: 3, correct: 3, submittedStepIds: ['p4-q19', 'p4-q20', 'p4-q21'], missedStepIds: [], selectionsByStep: { 1: ['p4-q19-option-1'], 2: ['p4-q20-option-0'], 3: ['p4-q21-option-2'] } })
  expect(Object.keys(loaded.progress.recent!.selectionsByStep!)).toEqual(['1', '2', '3'])
  expect(loaded.progress.resumeByPart['part-0']).toEqual(other)
  expect(loaded.progress.lessonResults).toEqual(progress.lessonResults)
  expect(loaded.progress.completedPartIds).toEqual(progress.completedPartIds)
  expect(loaded.progress.completedLessonIds).toEqual(progress.completedLessonIds)
  await repository.save(loaded.progress)
  expect((await repository.load()).progress).toEqual(loaded.progress)
})

it('제출 전 구판 선택도 비우며 이미 새 ID로 제출한 답은 다시 지우지 않는다', async () => {
  const storage = createMemoryStorage()
  const point = { partId: 'part-4', lessonId: 'actions-and-reasons', stepIndex: 4, answered: 1, correct: 1, submittedStepIds: ['p4-q09'], missedStepIds: [], selectedOptionIds: ['p4-q10-option-0'], selectionsByStep: { 2: ['p4-q9-option-0', 'p4-q9-option-2'], 4: ['p4-q10-option-0'] } }
  storage.setItem('holdem-learning-progress', JSON.stringify({ ...progressFixture, recent: point, resumeByPart: { 'part-4': point } }))
  const repository = new LocalProgressRepository(storage)
  const loaded = (await repository.load()).progress
  expect(loaded.recent).toMatchObject({ stepIndex: 4, answered: 1, correct: 1, selectedOptionIds: [], selectionsByStep: { 2: ['p4-q9-option-0', 'p4-q9-option-2'] } })
  expect(loaded.recent!.selectionsByStep![4]).toBeUndefined()
  const next = { ...point, answered: 2, correct: 2, submittedStepIds: ['p4-q09', 'p4-q10-v2'], selectedOptionIds: ['p4-q10-v2-option-0'], selectionsByStep: { ...point.selectionsByStep, 4: ['p4-q10-v2-option-0'] } }
  await repository.save({ ...loaded, recent: next, resumeByPart: { 'part-4': next } })
  expect((await repository.load()).progress.recent).toEqual(next)
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
