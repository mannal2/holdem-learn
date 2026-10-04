import { render, screen } from '@testing-library/react'
import { LearningStepRenderer } from './LearningStepRenderer'
import type { ExplanationStep, SingleChoiceStep } from '../../types/course'

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

it.each([
  ['turn', 4],
  ['river', 5],
] as const)('%s 문제는 공개 단계에 맞는 공용 카드를 보여준다', (stage, count) => {
  const question = {
    ...step,
    table: {
      ...step.table,
      stage,
      communityCards: [
        ...step.table!.communityCards,
        { rank: '7', suit: 'clubs' },
        { rank: 'J', suit: 'diamonds' },
      ].slice(0, count),
    },
  } as unknown as SingleChoiceStep
  render(<LearningStepRenderer step={question} selectedOptionIds={[]} feedbackVisible={false} onSelect={() => {}} />)
  expect(screen.getByLabelText('클로버 7')).toBeInTheDocument()
  expect(screen.queryAllByLabelText('뒤집힌 카드')).toHaveLength(0)
  expect(screen.getAllByTestId('community-card')).toHaveLength(count)
  if (stage === 'river') expect(screen.getByLabelText('다이아몬드 잭')).toBeInTheDocument()
})

it('설명에서 아웃츠 아홉 장을 실제 카드로 보여준다', () => {
  const explanation = {
    id: 'outs-example', type: 'explanation', title: '남은 하트', body: '하트는 아홉 장입니다.',
    cardGroups: [{ label: '플러시를 완성하는 9아웃츠', cards: ['K', 'J', '10', '8', '7', '6', '5', '3', '2'].map(rank => ({ rank, suit: 'hearts' })) }],
  } as unknown as ExplanationStep
  render(<LearningStepRenderer step={explanation} selectedOptionIds={[]} feedbackVisible={false} onSelect={() => {}} />)
  const group = screen.getByRole('group', { name: '플러시를 완성하는 9아웃츠' })
  expect(group.querySelectorAll('.playing-card')).toHaveLength(9)
  expect(screen.getByLabelText('하트 킹')).toBeInTheDocument()
})
