import { render, screen, within } from '@testing-library/react'
import { part1Lessons } from '../../content/part1'
import { LearningStepRenderer } from './LearningStepRenderer'

function show(lesson: string, index: number, feedbackVisible = false) {
  return render(<LearningStepRenderer step={part1Lessons[lesson].steps[index]} selectedOptionIds={[]} feedbackVisible={feedbackVisible} onSelect={() => {}} />)
}

it.each([1, 2, 3])('표기 문제 %s는 제출한 뒤에만 카드 두 장을 공개한다', index => {
  const view = show('hand-notation', index)
  expect(view.container.querySelectorAll('.playing-card')).toHaveLength(0)
  view.rerender(<LearningStepRenderer step={part1Lessons['hand-notation'].steps[index]} selectedOptionIds={[]} feedbackVisible onSelect={() => {}} />)
  expect(view.container.querySelectorAll('.playing-card')).toHaveLength(2)
})

it.each([0, 1, 2, 3])('시작 패 특징 설명 %s는 실제 개인 카드 두 장을 보여준다', index => {
  const view = show('hand-properties', index)
  expect(view.container.querySelectorAll('.playing-card')).toHaveLength(2)
})

it.each(['identify-properties', 'classify-strength', 'starting-hand-challenge'])('%s 문제는 풀이 전에 실제 개인 카드 두 장을 보여준다', lesson => {
  const steps = part1Lessons[lesson].steps
  const index = steps.findIndex(step => step.type === 'single-choice' || step.type === 'multi-choice')
  const view = show(lesson, index)
  expect(view.container.querySelectorAll('.playing-card')).toHaveLength(2)
})

it('비교 문제의 카드 두 묶음과 선택지가 같은 이름으로 대응한다', () => {
  show('compare-hands', 0)
  for (const name of ['시작 패 A', '시작 패 B']) {
    expect(within(screen.getByRole('group', { name })).getAllByLabelText(/스페이드|하트|다이아몬드|클로버/)).toHaveLength(2)
    expect(screen.getByRole('radio', { name })).toBeInTheDocument()
  }
})

it('같은 패는 유지하고 후반으로 이동하면 앞선 폴드와 뒤의 두 자리를 구분한다', () => {
  const view = show('same-hand-different-position', 0)
  const cards = [...view.container.querySelectorAll('.playing-card')].map(card => card.getAttribute('aria-label'))
  expect(cards).toHaveLength(2)
  expect(screen.getByRole('group', { name: 'UTG · 내 자리' })).toBeInTheDocument()
  expect(screen.getAllByText('아직 행동 전', { exact: true })).toHaveLength(5)
  view.rerender(<LearningStepRenderer step={part1Lessons['same-hand-different-position'].steps[1]} selectedOptionIds={[]} feedbackVisible={false} onSelect={() => {}} />)
  expect([...view.container.querySelectorAll('.playing-card')].map(card => card.getAttribute('aria-label'))).toEqual(cards)
  expect(screen.getByRole('group', { name: '딜러 버튼 · 내 자리' })).toBeInTheDocument()
  expect(screen.getAllByText('이미 폴드', { exact: true })).toHaveLength(3)
  expect(screen.getAllByText('아직 행동 전', { exact: true })).toHaveLength(2)
})
