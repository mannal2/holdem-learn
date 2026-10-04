import { createPracticeSession, getPracticeQuestions, getPracticePart, loadPractice, savePractice } from './practice'

const lessonIds = ['made-hand-and-draw', 'flush-draw', 'straight-draw', 'counting-outs', 'remaining-chances', 'draw-cautions']
beforeEach(() => localStorage.clear())

it('Part 3 일반 연습은 네 문제, 종합은 여섯 레슨에서 한 문제씩 출제한다', () => {
  for (const id of lessonIds) {
    expect(getPracticePart(id)?.id).toBe('part-3')
    const session = createPracticeSession(id)
    expect(session.questionIds).toHaveLength(4)
    expect(new Set(session.questionIds).size).toBe(4)
    expect(getPracticeQuestions(session).every(q => q.lessonId === id)).toBe(true)
  }
  const questions = getPracticeQuestions(createPracticeSession('draw-challenge'))
  expect(questions).toHaveLength(6)
  expect(questions.map(q => q.lessonId).sort()).toEqual([...lessonIds].sort())
})

it('Part 3 개념별 배분을 유지하고 직전 회차 문제를 피한다', () => {
  for (let n = 0; n < 30; n++) {
    for (const id of lessonIds) {
      const first = createPracticeSession(id)
      const qs = getPracticeQuestions(first)
      const counts = (concept: string) => qs.filter(q => q.concept === concept).length
      if (id === 'made-hand-and-draw') {
        expect(counts('p3-current')).toBe(2)
        expect(counts('p3-pair-draw')).toBe(2)
      } else if (id === 'draw-cautions') {
        expect(counts('p3-win')).toBe(2)
        expect(counts('p3-overlap')).toBe(2)
      } else if (id === 'remaining-chances') {
        expect(counts('p3-opportunities')).toBe(1)
        expect(counts('p3-compare-chances')).toBe(1)
        expect(counts('p3-estimate')).toBe(2)
      } else {
        expect(new Set(qs.map(q => q.concept)).size).toBe(3)
        if (id === 'flush-draw') expect(counts('p3-backdoor')).toBe(1)
        if (id === 'straight-draw') expect(counts('p3-boundary')).toBe(1)
      }
      const next = createPracticeSession(id, first.questionIds)
      // 플러시의 3문제짜리 유형을 연속 두 회차에서 2개씩 뽑으면 한 문제 재사용이 불가피합니다.
      const repeated = next.questionIds.filter(q => first.questionIds.includes(q))
      expect(repeated.length).toBeLessThanOrEqual(id === 'flush-draw' ? 1 : 0)
    }
  }
})

it('Part 3 제출한 복수 선택과 보기 순서를 기존 Part 2 기록과 함께 복원한다', () => {
  const session = createPracticeSession('straight-draw')
  const qs = getPracticeQuestions(session)
  const index = qs.findIndex(q => q.type === 'multi-choice')
  expect(index).toBeGreaterThanOrEqual(0)
  const q = qs[index]
  const selected = q.type === 'multi-choice' ? q.correctOptionIds : []
  session.progress = { stepIndex: index, answered: 1, correct: 1, submittedStepIds: [q.id], missedStepIds: [], selectedOptionIds: selected, selectionsByStep: { [index]: selected } }
  const existing = createPracticeSession('pair-types')
  const data = { version: 1 as const, sessions: { 'straight-draw': session, 'pair-types': existing }, results: {} }
  expect(savePractice(data)).toBe(true)
  expect(loadPractice()).toEqual({ data, recovered: false })
  expect(getPracticeQuestions(loadPractice().data.sessions['straight-draw'])).toEqual(qs)
  expect(localStorage.getItem('holdem-learning-progress')).toBeNull()
})
