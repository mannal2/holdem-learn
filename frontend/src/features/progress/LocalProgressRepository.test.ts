import { createMemoryStorage, progressFixture } from '../../test/progressFixtures'
import { createEmptyProgress } from './createEmptyProgress'
import { LocalProgressRepository } from './LocalProgressRepository'

it.each([
  ['range-preflop', 4, 'p4-seq-q02', 2, 'p4-seq-q01'],
  ['range-flop', 2, 'p4-seq-q04', 6, 'p4-seq-q06'],
  ['range-flop', 4, 'p4-seq-q05', 6, 'p4-seq-q06'],
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
  expect(progress.recent).toEqual({ ...point, answered: 1, correct: 1, submittedStepIds: [otherId],
    selectedOptionIds: [], selectionsByStep: { [otherIndex]: [`${otherId}-option-0`] }, missedStepIds: [] })
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
