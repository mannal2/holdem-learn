import { createMemoryStorage, progressFixture } from '../../test/progressFixtures'
import { LocalProgressRepository } from './LocalProgressRepository'

const key = 'holdem-learning-progress'
const other = { partId: 'part-0', lessonId: 'goal-and-cards', stepIndex: 1 }
const old = { partId: 'part-4', lessonId: 'range-challenge', stepIndex: 7, answered: 6, correct: 5, submittedStepIds: ['p4-q24-v2'], selectionsByStep: { 6: ['p4-q24-v2-option-0'] } }
const result = { answered: 6, correct: 5, bestPercentage: 100, attempts: 2 }
const previous = { ...progressFixture, recent: old, resumeByPart: { 'part-0': other, 'part-4': old }, completedLessonIds: ['goal-and-cards', 'range-challenge'], completedPartIds: ['part-0', 'part-4'], lessonResults: { 'goal-and-cards': result, 'range-challenge': result } }

it('구판 레슨 검증 전에 Part 4만 지우고 다른 Part·추가연습을 보존해 저장한다', async () => {
  const storage = createMemoryStorage()
  storage.setItem(key, JSON.stringify(previous))
  storage.setItem('holdem-practice-progress', 'untouched-practice')
  const loaded = await new LocalProgressRepository(storage).load()
  expect(loaded).toEqual({ recovered: false, progress: { ...progressFixture, recent: null, resumeByPart: { 'part-0': other }, completedLessonIds: ['goal-and-cards'], completedPartIds: ['part-0'], lessonResults: { 'goal-and-cards': result } } })
  expect(JSON.parse(storage.getItem(key)!)).toEqual(loaded.progress)
  expect(storage.getItem('holdem-practice-progress')).toBe('untouched-practice')
})

it('이어하기가 없는 구판 완료 기록도 지우고 다른 Part의 최근 위치는 보존한다', async () => {
  const storage = createMemoryStorage()
  storage.setItem(key, JSON.stringify({ ...previous, recent: other, resumeByPart: { 'part-0': other } }))
  const loaded = await new LocalProgressRepository(storage).load()
  expect(loaded.progress.recent).toEqual(other)
  expect(loaded.progress.completedPartIds).toEqual(['part-0'])
  expect(loaded.progress.lessonResults['range-challenge']).toBeUndefined()
})

it('개정판 선택·제출·완료 기록은 재로딩해도 삭제하지 않는다', async () => {
  const storage = createMemoryStorage()
  const point = { partId: 'part-4', lessonId: 'range-turn', stepIndex: 3, answered: 2, correct: 2, submittedStepIds: ['p4-seq-q10', 'p4-seq-q11'], selectedOptionIds: ['p4-seq-q11-option-2'], selectionsByStep: { 3: ['p4-seq-q11-option-2'] } }
  const current = { ...progressFixture, recent: point, resumeByPart: { 'part-0': other, 'part-4': point }, completedLessonIds: ['range-preflop', 'range-hand-challenge'], completedPartIds: ['part-4'], lessonResults: { 'range-hand-challenge': { answered: 12, correct: 10, bestPercentage: 83, attempts: 1 } } }
  const repository = new LocalProgressRepository(storage)
  await repository.save(current)
  expect(await repository.load()).toEqual({ progress: current, recovered: false })
  expect(await repository.load()).toEqual({ progress: current, recovered: false })
})

it('전환 저장 실패는 실패로 알리고 다른 Part를 포함한 원본을 삭제하지 않는다', async () => {
  const storage = createMemoryStorage()
  const raw = JSON.stringify(previous)
  storage.setItem(key, raw)
  storage.setItem = () => { throw new DOMException('full', 'QuotaExceededError') }
  const loaded = await new LocalProgressRepository(storage).load()
  expect(loaded).toMatchObject({ recovered: false, saveFailed: true })
  expect(loaded.progress.resumeByPart['part-0']).toEqual(other)
  expect(loaded.progress.resumeByPart['part-4']).toBeUndefined()
  expect(storage.getItem(key)).toBe(raw)
})
