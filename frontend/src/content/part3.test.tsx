import { render, screen, within } from '@testing-library/react'
import { part3, part3Lessons } from './part3'
import { validateCourse } from './validateCourse'
import { LearningStepRenderer } from '../features/learning/LearningStepRenderer'
import { getPracticePart } from '../features/practice/practice'
import { evaluateAnswer } from '../features/learning/evaluateAnswer'
import type { LearningStep } from '../types/course'

const isQuestion = (step: LearningStep) => step.type === 'single-choice' || step.type === 'multi-choice'

it('가정한 상대 카드도 내 카드·보드와 중복될 수 없다', () => {
  const duplicate = { rank: 'A', suit: 'hearts' }
  const step = { id: 'comparison', type: 'table-reveal', stage: 'turn', body: '', holeCards: [duplicate, { rank: 'Q', suit: 'hearts' }], communityCards: [{ rank: '9', suit: 'hearts' }, { rank: '4', suit: 'hearts' }, { rank: '2', suit: 'clubs' }, { rank: '8', suit: 'hearts' }], opponentCards: [duplicate, { rank: 'J', suit: 'hearts' }] } as unknown as LearningStep
  expect(validateCourse({ parts: [], lessons: { comparison: { id: 'comparison', title: '', objective: '', steps: [step] } } })).toContain('Step comparison에 중복 카드가 있습니다.')
})

it.each([
  ['made-hand-and-draw', 'p3-1-made-flush', '클로버 2', '하트 8'],
  ['straight-draw', 'p3-3-open-made', '스페이드 킹', '클로버 9'],
  ['straight-draw', 'p3-3-gutshot-made', '스페이드 킹', '다이아몬드 6'],
])('%s의 %s은 전체 턴 카드에서 족보 다섯 장만 강조한다', (lessonId, stepId, unused, added) => {
  const step = part3Lessons[lessonId].steps.find(s => s.id === stepId)!
  render(<LearningStepRenderer step={step} selectedOptionIds={[]} feedbackVisible={false} onSelect={() => {}} />)
  expect(within(screen.getByRole('group', { name: '공용 카드' })).getAllByTestId('community-card')).toHaveLength(4)
  expect(screen.getByRole('group', { name: '내 개인 카드' }).querySelectorAll('.playing-card')).toHaveLength(2)
  expect(document.querySelectorAll('.poker-table__highlight')).toHaveLength(5)
  expect(screen.getByLabelText(unused).closest('.poker-table__highlight')).toBeNull()
  expect(screen.getByLabelText(added).closest('.poker-table__highlight')).not.toBeNull()
})

it('더 높은 플러시 비교는 같은 보드와 가정한 상대 카드의 소속을 유지한다', () => {
  const step = part3Lessons['draw-cautions'].steps.find(s => s.id === 'p3-6-higher-flush')!
  render(<LearningStepRenderer step={step} selectedOptionIds={[]} feedbackVisible={false} onSelect={() => {}} />)
  expect(screen.getAllByTestId('community-card')).toHaveLength(4)
  const own = screen.getByRole('group', { name: '내 개인 카드' })
  const opponent = screen.getByRole('group', { name: '가정한 상대 카드' })
  expect(within(own).getByLabelText('하트 8')).toBeInTheDocument()
  expect(within(opponent).getByLabelText('하트 에이스')).toBeInTheDocument()
  expect(within(opponent).getByLabelText('하트 잭')).toBeInTheDocument()
  expect(within(opponent).getByText('실제 공개된 상대 카드가 아닌 비교 예시')).toBeVisible()
  expect(screen.getByLabelText('클로버 2').closest('.poker-table__highlight')).toBeNull()
  expect(own.querySelectorAll('.poker-table__highlight')).toHaveLength(2)
  expect(opponent.querySelectorAll('.poker-table__highlight')).toHaveLength(2)
  expect(screen.getByRole('group', { name: '공용 카드' }).querySelectorAll('.poker-table__highlight')).toHaveLength(3)
})

it('일곱 레슨은 승인한 고정 24문제를 제공하고 카드·정답 연결이 유효하다', () => {
  expect(validateCourse({ parts: [part3], lessons: part3Lessons })).toEqual([])
  expect(part3.lessonIds.map(id => part3Lessons[id].steps.filter(isQuestion).length)).toEqual([3, 3, 3, 3, 3, 3, 6])
  expect(part3Lessons['draw-challenge'].passingPercentage).toBe(80)
})

it('종합 도전은 앞 레슨과 다른 여섯 카드 상황을 사용한다', () => {
  const scenarios = (steps: LearningStep[]) => steps.flatMap(step => {
    const table = step.type === 'table-reveal' ? step : isQuestion(step) ? step.table : undefined
    return table ? [JSON.stringify([table.holeCards, table.communityCards])] : []
  })
  const seen = new Set(part3.lessonIds.slice(0, -1).flatMap(id => scenarios(part3Lessons[id].steps)))
  const questions = part3Lessons['draw-challenge'].steps.filter(isQuestion)
  const challenge = scenarios(questions)
  expect(challenge).toHaveLength(6)
  expect(new Set(challenge).size).toBe(6)
  expect(challenge.every(item => !seen.has(item))).toBe(true)
})

it.each([
  ['p3-1-q1', ['draw']], ['p3-1-q2', ['both']], ['p3-1-q3', ['possible']],
  ['p3-2-q1', ['spades']], ['p3-2-q2', ['yes']], ['p3-2-q3', ['two']],
  ['p3-3-q1', ['8', 'K']], ['p3-3-q2', ['J']], ['p3-3-q3', ['four']],
  ['p3-4-q1', ['9']], ['p3-4-q2', ['8']], ['p3-4-q3', ['4']],
  ['p3-5-q1', ['two']], ['p3-5-q2', ['18']], ['p3-5-q3', ['two']],
  ['p3-6-q1', ['uncertain']], ['p3-6-q2', ['once']], ['p3-6-q3', ['context']],
  ['p3-7-q1', ['both']], ['p3-7-q2', ['diamonds']], ['p3-7-q3', ['7', 'Q']],
  ['p3-7-q4', ['4']], ['p3-7-q5', ['18']], ['p3-7-q6', ['uncertain']],
])('%s은 카드에서 도출한 정답을 채점한다', (id, answer) => {
  const step = Object.values(part3Lessons).flatMap(lesson => lesson.steps).find(step => step.id === id)
  expect(step).toBeDefined()
  if (!step || !isQuestion(step)) throw new Error('문제가 없습니다.')
  expect(evaluateAnswer(step, answer).isCorrect).toBe(true)
  expect(evaluateAnswer(step, []).isCorrect).toBe(false)
})

it('플러시 아웃츠는 이미 보이는 네 장을 제외한 하트 아홉 장이다', () => {
  const step = part3Lessons['counting-outs'].steps.find(step => step.id === 'p3-4-flush-outs')
  expect(step?.type).toBe('explanation')
  if (step?.type !== 'explanation') throw new Error('설명이 없습니다.')
  render(<LearningStepRenderer step={step} selectedOptionIds={[]} feedbackVisible={false} onSelect={() => {}} />)
  const group = screen.getByRole('group', { name: '플러시를 완성하는 9아웃츠' })
  expect(group.querySelectorAll('.playing-card')).toHaveLength(9)
  expect(step.cardGroups?.[0].cards).toEqual(['K', 'J', '10', '8', '7', '6', '5', '3', '2'].map(rank => ({ rank, suit: 'hearts' })))
})

it('Part 3 연습을 연결하고 기존 Part의 연습도 유지한다', () => {
  for (const id of part3.lessonIds) expect(getPracticePart(id)?.id).toBe('part-3')
  expect(getPracticePart('compare-hands')?.id).toBe('part-1')
  expect(getPracticePart('read-current-hand')?.id).toBe('part-2')
})
