import { render, screen } from '@testing-library/react'
import { part1PracticeQuestions } from '../../content/part1Practice'
import { LearningStepRenderer } from './LearningStepRenderer'

function show(id: string) {
  const step = part1PracticeQuestions.find(question => question.id === id)!
  return render(<LearningStepRenderer step={step} selectedOptionIds={[]} feedbackVisible={false} onSelect={() => {}} />)
}

it('초반 연습은 UTG와 뒤에 행동할 다섯 자리를 구분한다', () => {
  show('practice-same-hand-different-position-1')
  expect(screen.getByRole('group', { name: 'UTG · 내 자리' })).toBeInTheDocument()
  expect(screen.getAllByRole('group', { name: / · 아직 행동 전$/ })).toHaveLength(5)
  expect(screen.queryAllByRole('group', { name: / · 이미 폴드$/ })).toHaveLength(0)
})

it('후반 연습은 앞선 폴드 세 자리와 남은 블라인드 두 자리를 표시한다', () => {
  show('practice-same-hand-different-position-2')
  expect(screen.getByRole('group', { name: '딜러 버튼 · 내 자리' })).toBeInTheDocument()
  expect(screen.getAllByRole('group', { name: / · 이미 폴드$/ })).toHaveLength(3)
  expect(screen.getAllByRole('group', { name: / · 아직 행동 전$/ })).toHaveLength(2)
})

it.each(['practice-same-hand-different-position-1', 'practice-same-hand-different-position-2'])('%s는 실제 카드 두 장을 중복 없이 표시하고 독립 연습 조건을 제공한다', id => {
  const view = show(id)
  expect(view.container.querySelectorAll('.playing-card')).toHaveLength(2)
  expect(screen.getByRole('list', { name: '이번 상황의 조건' })).toHaveTextContent('100BB')
  expect(screen.getAllByRole('note').map(note => note.textContent).join(' ')).toMatch(/빅 블라인드.*100배/)
})
