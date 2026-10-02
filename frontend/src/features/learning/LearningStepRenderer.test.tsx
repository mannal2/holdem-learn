import { render, screen } from '@testing-library/react'
import { LearningStepRenderer } from './LearningStepRenderer'
import type { SingleChoiceStep } from '../../types/course'

const step: SingleChoiceStep = {
  id: 'flop-question',
  type: 'single-choice',
  prompt: '현재 족보는?',
  options: [{ id: 'pair', label: '원 페어' }, { id: 'high', label: '하이 카드' }],
  correctOptionId: 'pair',
  explanation: '두 장의 퀸이 짝입니다.',
  table: {
    holeCards: [{ rank: 'Q', suit: 'spades' }, { rank: '9', suit: 'diamonds' }],
    communityCards: [
      { rank: 'Q', suit: 'hearts' },
      { rank: '6', suit: 'clubs' },
      { rank: '2', suit: 'diamonds' },
    ],
    highlightedCards: [{ rank: 'Q', suit: 'spades' }, { rank: 'Q', suit: 'hearts' }],
  },
}

it('카드가 있는 문제는 플랍을 보여주고 답을 확인한 뒤 근거 카드를 강조한다', () => {
  const { rerender } = render(<LearningStepRenderer step={step} selectedOptionIds={[]} feedbackVisible={false} onSelect={() => {}} />)
  expect(screen.getByLabelText('스페이드 퀸')).toBeInTheDocument()
  expect(screen.getByLabelText('하트 퀸')).toBeInTheDocument()
  expect(screen.getByLabelText('공용 카드').querySelectorAll('.poker-table__highlight')).toHaveLength(0)

  rerender(<LearningStepRenderer step={step} selectedOptionIds={['pair']} feedbackVisible onSelect={() => {}} />)
  expect(screen.getByLabelText('공용 카드').querySelectorAll('.poker-table__highlight')).toHaveLength(1)
  expect(screen.getByLabelText('내 개인 카드').querySelectorAll('.poker-table__highlight')).toHaveLength(1)
})
