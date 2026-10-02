import { createPracticeSession, getPracticeQuestions, loadPractice, savePractice } from './practice'

beforeEach(() => localStorage.clear())

it.each(['identify-properties', 'compare-hands', 'classify-strength', 'same-hand-different-position'])('%s는 네 문제를 뽑고 다음 회차에서 직전 문제를 피한다', lessonId => {
  const first = createPracticeSession(lessonId)
  const next = createPracticeSession(lessonId, first.questionIds)
  expect(first.questionIds).toHaveLength(4)
  expect(new Set(first.questionIds).size).toBe(4)
  expect(next.questionIds.some(id => first.questionIds.includes(id))).toBe(false)
  expect(getPracticeQuestions(first).every(q => q.lessonId === lessonId)).toBe(true)
})

it('종합은 특징·비교·강도와 세 종류의 포지션 문제를 하나씩 뽑는다', () => {
  const first = createPracticeSession('starting-hand-challenge')
  const questions = getPracticeQuestions(first)
  expect(questions).toHaveLength(6)
  expect(questions.map(q => q.concept).sort()).toEqual(['p1-compare', 'p1-features', 'p1-position-dependent', 'p1-position-strong', 'p1-position-weak', 'p1-strength'])
  const next = createPracticeSession('starting-hand-challenge', first.questionIds)
  expect(next.questionIds.some(id => first.questionIds.includes(id))).toBe(false)
})

it('강도 문제는 명확하게 대비되는 두 선택지를 제공한다', () => {
  expect(getPracticeQuestions(createPracticeSession('classify-strength')).every(q => q.options.length === 2)).toBe(true)
})

it('복수 선택의 답과 순서 및 기존 Part 2 회차를 함께 복원한다', () => {
  const part1 = createPracticeSession('identify-properties')
  part1.progress.selectedOptionIds = part1.optionOrders[part1.questionIds[0]].slice(0, 2)
  part1.progress.selectionsByStep = { 0: part1.progress.selectedOptionIds }
  const part2 = createPracticeSession('pair-types')
  const data = { version: 1 as const, sessions: { 'identify-properties': part1, 'pair-types': part2 }, results: {} }
  savePractice(data)
  expect(loadPractice()).toEqual({ data, recovered: false })
  part1.progress.selectedOptionIds.push(part1.progress.selectedOptionIds[0])
  savePractice(data)
  expect(loadPractice().recovered).toBe(true)
})
