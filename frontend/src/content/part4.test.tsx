import { cleanup, render, screen } from '@testing-library/react'
import { part4, part4Lessons } from './part4'
import { courseCatalog, getNextPartId } from './catalog'
import { validateCourse } from './validateCourse'
import { LearningStepRenderer } from '../features/learning/LearningStepRenderer'
import { evaluateAnswer } from '../features/learning/evaluateAnswer'
import { getPracticePart } from '../features/practice/practice'
import { RuleIllustration } from '../features/learning/RuleIllustration'
import type { LearningStep, RangeSceneVisual } from '../types/course'

const steps = Object.values(part4Lessons).flatMap(lesson => lesson.steps)
const questions = steps.filter(step => step.type === 'single-choice' || step.type === 'multi-choice')
const draw = (id: string, submitted = false) => render(<LearningStepRenderer step={steps.find(step => step.id === id)!} selectedOptionIds={[]} feedbackVisible={submitted} onSelect={() => {}} />)

it('턴 후보를 유지하면서 같은 상황의 팟·베팅 금액도 보여준다', () => {
  const visual = { kind: 'range-scene', stage: 'turn', board: [{ rank: 'J', suit: 'hearts' }, { rank: '8', suit: 'hearts' }, { rank: '2', suit: 'clubs' }, { rank: '4', suit: 'hearts' }], candidates: [], bet: { pot: 100, bet: 100 } } as RangeSceneVisual
  render(<RuleIllustration visual={visual} />)
  expect(screen.getByRole('group', { name: '공용 카드' }).querySelectorAll('.playing-card')).toHaveLength(4)
  expect(screen.getByRole('group', { name: '이번 베팅' })).toHaveTextContent('베팅 전 팟 100칩상대 베팅 100칩')
})

it('7레슨·56화면·24문제를 기존 카탈로그에 연결하며 추가연습은 등록하지 않는다', () => {
  expect(validateCourse(courseCatalog)).toEqual([])
  expect(getNextPartId(courseCatalog, 'part-3')).toBe('part-4')
  expect(part4.lessonIds.map(id => part4Lessons[id].steps.length)).toEqual([7, 8, 8, 8, 8, 9, 8])
  expect(steps).toHaveLength(56)
  expect(questions).toHaveLength(24)
  expect(part4Lessons['range-challenge'].passingPercentage).toBe(80)
  expect(getPracticePart('range-challenge')).toBeUndefined()
})

it.each(['p4-q18-v2', 'p4-q24-v2'])('%s의 제출 후에도 턴 판단에 사용한 베팅 금액을 유지한다', id => {
  draw(id, true)
  expect(screen.getByRole('group', { name: '이번 베팅' })).toBeVisible()
  const step = steps.find(step => step.id === id)!
  if (step.type !== 'single-choice') throw new Error('턴 판단은 단일 선택 문제입니다.')
  expect((step.feedbackVisual as RangeSceneVisual).bet).toEqual((step.visual as RangeSceneVisual).bet)
})

it('턴 후보 그림에서도 올바르지 않은 팟·베팅액을 거부한다', () => {
  const step = steps.find(step => step.id === 'p4-q18-v2')!
  const visual = step.visual as RangeSceneVisual
  for (const bet of [{ pot: 0, bet: 100 }, { pot: 100, bet: -1 }, { pot: Infinity, bet: 100 }]) {
    expect(validateCourse({ parts: [], lessons: { test: { id: 'test', title: '', objective: '', steps: [{ ...step, visual: { ...visual, bet } }] } } })).toContain('Step p4-q18-v2의 팟·베팅 금액이 올바르지 않습니다.')
  }
})

it.each(questions)('$id는 제출 전 정답 강조·후보 상태를 노출하지 않는다', step => {
  const view = render(<LearningStepRenderer step={step} selectedOptionIds={[]} feedbackVisible={false} onSelect={() => {}} />)
  expect(view.container.querySelector('.poker-table__highlight')).toBeNull()
  expect(view.container.querySelector('.range-candidate__status')).toBeNull()
  if (step.visual?.kind === 'range-scene' && !step.visual.holeCards) expect(screen.queryByRole('group', { name: '내 개인 카드' })).not.toBeInTheDocument()
  cleanup()
})

it('플러시 완성 해설은 원래 보드·내 카드·세 후보를 유지하고 다섯 장만 강조한다', () => {
  draw('p4-q17', true)
  expect(screen.getByRole('group', { name: '공용 카드' }).querySelectorAll('.playing-card')).toHaveLength(4)
  expect(screen.getByRole('group', { name: '내 개인 카드' }).querySelectorAll('.playing-card')).toHaveLength(2)
  expect(screen.getAllByRole('group', { name: /^후보 / })).toHaveLength(3)
  expect(document.querySelectorAll('.poker-table__highlight')).toHaveLength(5)
  expect(screen.getByRole('group', { name: '내 개인 카드' }).querySelectorAll('.poker-table__highlight')).toHaveLength(0)
  expect(screen.getByText('턴 · 추가')).toBeVisible()
})

it('자리 그림은 상대 자리라고 표시하고 내 카드와 행동 기록도 보존한다', () => {
  draw('p4-6-start')
  expect(screen.getByRole('group', { name: '딜러 버튼 · 상대 자리' })).toBeInTheDocument()
  expect(screen.getByRole('group', { name: '내 개인 카드' }).querySelectorAll('.playing-card')).toHaveLength(2)
  expect(screen.getByRole('group', { name: '지금까지의 행동' })).toHaveTextContent('나 BB 콜')
  expect(screen.getByText('딜러 버튼 · 뒤에 SB·BB가 남아 있어요')).toBeVisible()
})

it('후보 제목으로만 안내하고 반복 문구와 후보별 예시 표기를 넣지 않는다', () => {
  draw('p4-1-range')
  expect(screen.getByRole('heading', { name: '가능한 상대 패 예시' })).toBeVisible()
  expect(screen.getByRole('heading', { name: 'AK' })).toBeVisible()
  expect(screen.queryByText('각각 따로 가정한 패예요.')).not.toBeInTheDocument()
  expect(screen.queryByText('가능한 패의 일부만 보여줘요.')).not.toBeInTheDocument()
})

it('팟 대비 크기는 제출 전 금액만, 제출 후 정확한 두 비율을 표시한다', () => {
  const view = draw('p4-q12')
  expect(view.container.querySelector('.bet-comparison__track')).toBeNull()
  view.unmount()
  draw('p4-q12', true)
  expect(screen.getByText('팟의 50%')).toBeVisible()
  expect(screen.getByText('팟의 20%')).toBeVisible()
})

it('종합 도전의 카드 상황은 앞선 레슨과 다르다', () => {
  const sceneKeys = (items: LearningStep[]) => items.flatMap(step => step.visual?.kind === 'range-scene' && step.visual.board.length ? [JSON.stringify(step.visual.board)] : [])
  const previous = new Set(part4.lessonIds.slice(0, -1).flatMap(id => sceneKeys(part4Lessons[id].steps)))
  const challenge = sceneKeys(part4Lessons['range-challenge'].steps)
  expect(challenge).toHaveLength(4)
  expect(new Set(challenge).size).toBe(4)
  expect(challenge.every(key => !previous.has(key))).toBe(true)
})

it('일반 레슨의 정답 위치도 한쪽에만 고정하지 않는다', () => {
  for (const lesson of Object.values(part4Lessons)) {
    const single = lesson.steps.filter(step => step.type === 'single-choice')
    expect(new Set(single.map(step => step.options.findIndex(option => option.id === step.correctOptionId))).size).toBeGreaterThan(1)
  }
})

it('24문제의 정답을 독립 제작 기준과 대조해 채점한다', () => {
  const expected = [[1], [0], [1], [0], [0], [1], [0], [1, 2], [0, 2], [0], [1], [0], [1], [0], [0], [0, 1, 2], [2], [1], [1], [0], [2], [0, 1], [1], [0]]
  questions.forEach((step, index) => {
    expect(evaluateAnswer(step, expected[index].map(n => step.options[n].id)).isCorrect).toBe(true)
    expect(evaluateAnswer(step, []).isCorrect).toBe(false)
  })
})

it('정상 후보의 충돌·잘못된 강조를 검사하고 의도된 불가능 후보만 구분한다', () => {
  const step = steps.find(s => s.id === 'p4-q15')!
  const visual = step.visual as RangeSceneVisual
  const check = (visual: RangeSceneVisual, explanation = false) => validateCourse({ parts: [], lessons: { test: { id: 'test', title: '', objective: '', steps: [explanation ? { id: 'invalid', type: 'explanation', body: '', visual } : { ...step, visual }] } } })
  expect(check(visual)).toEqual([])
  expect(check({ ...visual, candidates: visual.candidates.map(c => ({ ...c, impossibleExample: undefined })) })).toContain('Step p4-q15의 확인용 후보가 공개 카드와 충돌합니다.')
  expect(check(visual, true)).toContain('Step invalid의 불가능 후보 예시는 충돌을 찾는 문제에서만 허용합니다.')
  expect(check({ ...visual, boardHighlights: [{ rank: 'K', suit: 'clubs' }] })).toContain('Step p4-q15의 후보 그림 강조가 실제 카드와 다릅니다.')
  expect(check({ ...visual, stage: 'turn' })).toContain('Step p4-q15의 후보 그림 공개 단계와 장수가 다릅니다.')
})
