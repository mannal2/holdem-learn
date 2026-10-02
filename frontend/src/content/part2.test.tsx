import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LearningStepRenderer } from '../features/learning/LearningStepRenderer'
import { renderLearningSession } from '../test/learningFixtures'
import { part2Lessons } from './part2'

it('종합 도전 전에 세 가지 판단 질문을 보여준 뒤 새 카드 문제를 시작한다', async () => {
  renderLearningSession(part2Lessons['flop-reading-challenge'])
  expect(screen.getByText('현재 족보는 무엇인가?')).toBeInTheDocument()
  expect(screen.getByText('그 족보를 만든 카드는 내 카드인가, 공용 카드인가?')).toBeInTheDocument()
  expect(screen.getByText('이 보드에서 상대도 더 강한 패를 만들 수 있는가?')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: '다음' }))
  expect(screen.getByText('현재 어떤 페어인가요?')).toBeInTheDocument()
})

it.each([
  ['board-and-risk', 'p2-board-risk'],
  ['flop-reading-challenge', 'p2-challenge-flush-risk'],
])('%s의 플러시 위험 문제는 제출 후 같은 무늬의 공용 카드 세 장을 강조한다', (lessonId, stepId) => {
  const step = part2Lessons[lessonId].steps.find((item) => item.id === stepId)
  if (!step || (step.type !== 'single-choice' && step.type !== 'multi-choice')) throw new Error('문제 Step을 찾을 수 없습니다.')
  render(<LearningStepRenderer step={step} selectedOptionIds={[]} feedbackVisible onSelect={() => {}} />)
  expect(screen.getByLabelText('공용 카드').querySelectorAll('.poker-table__highlight')).toHaveLength(3)
})
