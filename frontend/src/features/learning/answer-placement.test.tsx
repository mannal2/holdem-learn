import { render, screen, within } from '@testing-library/react'
import { part1Lessons } from '../../content/part1'
import { part2Lessons } from '../../content/part2'
import { part3Lessons } from '../../content/part3'
import { LearningStepRenderer } from './LearningStepRenderer'

it.each([
  [part1Lessons['compare-hands'], [0, 1, 0]],
  [part1Lessons['classify-strength'], [0, 1, 1, 0]],
  [part2Lessons['flop-reading-challenge'], [1, 0, 2, 1, 0, 2]],
  [part3Lessons['straight-draw'], [1, 0]],
  [part3Lessons['draw-challenge'], [0, 1, 2, 0, 1]],
])('%s에서는 보기 위치만으로 정답을 반복 선택할 수 없다', (lesson, expected) => {
  const questions = lesson.steps.filter(step => step.type === 'single-choice')
  const positions = questions.map(step => step.options.findIndex(option => option.id === step.correctOptionId))
  expect(positions.sort()).toEqual([...expected].sort())
})

it('비교 카드 배치를 바꿔도 저장된 99 선택은 같은 실제 카드와 정답을 가리킨다', () => {
  const step = part1Lessons['compare-hands'].steps[1]
  render(<LearningStepRenderer step={step} selectedOptionIds={['99']} feedbackVisible onSelect={() => {}} />)
  expect(screen.getByRole('radio', { name: '시작 패 B' })).toBeChecked()
  const cards = within(screen.getByRole('group', { name: '시작 패 B' }))
  expect(cards.getByLabelText('스페이드 9')).toBeInTheDocument()
  expect(cards.getByLabelText('하트 9')).toBeInTheDocument()
})

it.each([
  [part1Lessons['identify-properties'], 'p1-identify-77', [1]],
  [part1Lessons['identify-properties'], 'p1-identify-83o', [2]],
  [part3Lessons['straight-draw'], 'p3-3-q1', [1, 3]],
  [part3Lessons['draw-challenge'], 'p3-7-q3', [1, 3]],
])('복수 선택 %s도 앞쪽 보기만 고르는 패턴을 피한다', (lesson, id, expected) => {
  const step = lesson.steps.find(step => step.id === id)!
  if (step.type !== 'multi-choice') throw new Error('복수 선택 문제여야 합니다.')
  expect(step.options.flatMap((option, index) => step.correctOptionIds.includes(option.id) ? [index] : [])).toEqual(expected)
})
