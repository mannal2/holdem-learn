import { createMemoryStorage, progressFixture } from '../../test/progressFixtures'
import { LocalProgressRepository } from './LocalProgressRepository'

const key = 'holdem-learning-progress'
const result = { answered: 3, correct: 2, bestPercentage: 100, attempts: 2, missedStepIds: ['p4-seq-q02-v2'] }
const other = { partId: 'part-0', lessonId: 'goal-and-cards', stepIndex: 1 }

it.each(['p4-seq-q02', 'p4-seq-q02-v2'])('%s 답만 정리하고 신판 답·현재 위치·완료·다른 Part를 보존해 저장한다', async oldId => {
  const storage = createMemoryStorage()
  const point = { partId: 'part-4', lessonId: 'range-preflop', stepIndex: 4, answered: 2, correct: 1,
    submittedStepIds: ['p4-seq-q01-v2', oldId], missedStepIds: [oldId],
    selectedOptionIds: [`${oldId}-option-0`], selectionsByStep: { 2: ['p4-seq-q01-v2-option-1'], 4: [`${oldId}-option-0`] } }
  const previous = { ...progressFixture, recent: point, resumeByPart: { 'part-0': other, 'part-4': point },
    completedLessonIds: ['range-preflop'], completedPartIds: ['part-4'], lessonResults: { 'range-preflop': result } }
  storage.setItem(key, JSON.stringify(previous))
  storage.setItem('holdem-practice-progress', 'untouched')
  const repository = new LocalProgressRepository(storage)
  const loaded = await repository.load()
  expect(loaded.recovered).toBe(false)
  expect(loaded.progress.recent).toEqual({ ...point, answered: 1, correct: 1,
    submittedStepIds: ['p4-seq-q01-v2'], missedStepIds: [], selectedOptionIds: [], selectionsByStep: { 2: ['p4-seq-q01-v2-option-1'] } })
  expect(loaded.progress.resumeByPart['part-4']).toEqual(loaded.progress.recent)
  expect(loaded.progress.resumeByPart['part-0']).toEqual(other)
  expect(loaded.progress.completedLessonIds).toEqual(previous.completedLessonIds)
  expect(loaded.progress.completedPartIds).toEqual(previous.completedPartIds)
  expect(loaded.progress.lessonResults).toEqual(previous.lessonResults)
  expect(JSON.parse(storage.getItem(key)!)).toEqual(loaded.progress)
  expect(await repository.load()).toEqual(loaded)
  expect(storage.getItem('holdem-practice-progress')).toBe('untouched')
})

it.each(['p4-seq-q04', 'p4-seq-q04-v2', 'p4-seq-q05', 'p4-seq-q05-v2'])('%s 정답 제출을 제거하고 진행 중 정답 수를 조정한다', async oldId => {
  const storage = createMemoryStorage()
  const index = oldId.startsWith('p4-seq-q04') ? 0 : 1
  const point = { partId: 'part-4', lessonId: 'range-flop', lessonRevision: 1, stepIndex: index,
    answered: 1, correct: 1, submittedStepIds: [oldId], selectedOptionIds: [`${oldId}-option-0`] }
  storage.setItem(key, JSON.stringify({ ...progressFixture, recent: point, resumeByPart: { 'part-4': point } }))
  const loaded = await new LocalProgressRepository(storage).load()
  expect(loaded.progress.recent).toMatchObject({ stepIndex: index, answered: 0, correct: 0, submittedStepIds: [], selectedOptionIds: [] })
})

it('구판 미제출 선택도 정리하고 쓰기 실패에는 원본을 보존한다', async () => {
  const storage = createMemoryStorage()
  const point = { partId: 'part-4', lessonId: 'range-preflop', stepIndex: 2,
    selectedOptionIds: ['p4-seq-q01-option-1'], selectionsByStep: { 2: ['p4-seq-q01-option-1'] } }
  const raw = JSON.stringify({ ...progressFixture, recent: point, resumeByPart: { 'part-4': point } })
  storage.setItem(key, raw)
  storage.setItem = () => { throw new DOMException('full', 'QuotaExceededError') }
  const loaded = await new LocalProgressRepository(storage).load()
  expect(loaded).toMatchObject({ recovered: false, saveFailed: true })
  expect(loaded.progress.recent).toMatchObject({ stepIndex: 2, selectedOptionIds: [], selectionsByStep: {} })
  expect(storage.getItem(key)).toBe(raw)
})

it('신판의 복수 선택·제출·해설용 기록을 반복 로딩해도 그대로 유지한다', async () => {
  const storage = createMemoryStorage()
  const point = { partId: 'part-4', lessonId: 'range-flop-actions', lessonRevision: 1, stepIndex: 3,
    answered: 2, correct: 2, submittedStepIds: ['p4-seq-q07-v2', 'p4-seq-q08-v2'], missedStepIds: [],
    selectedOptionIds: ['p4-seq-q08-v2-option-1', 'p4-seq-q08-v2-option-2', 'p4-seq-q08-v2-option-3'],
    selectionsByStep: { 1: ['p4-seq-q07-v2-option-2'], 3: ['p4-seq-q08-v2-option-1', 'p4-seq-q08-v2-option-2', 'p4-seq-q08-v2-option-3'] } }
  const progress = { ...progressFixture, recent: point, resumeByPart: { ...progressFixture.resumeByPart, 'part-4': point } }
  const repository = new LocalProgressRepository(storage)
  await repository.save(progress)
  expect(await repository.load()).toEqual({ recovered: false, progress })
  expect(await repository.load()).toEqual({ recovered: false, progress })
})
