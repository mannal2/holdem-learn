import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderLearningSession, singleQuestionLesson } from '../../test/learningFixtures'

it('답 제출 후 피드백을 보여주고 다음 단계만 제공한다', async () => {
  const user = userEvent.setup()
  renderLearningSession(singleQuestionLesson)
  await user.click(screen.getByRole('radio', { name: '콜' }))
  await user.click(screen.getByRole('button', { name: '정답 확인' }))
  expect(screen.getByRole('status')).toHaveTextContent('정답이에요')
  expect(screen.getByRole('button', { name: '완료' })).toBeEnabled()
  expect(screen.queryByRole('button', { name: '정답 확인' })).not.toBeInTheDocument()
})

it('제출 버튼을 빠르게 두 번 눌러도 응답은 한 번만 기록한다', async () => {
  const onConfirmedProgress = vi.fn()
  const user = userEvent.setup()
  renderLearningSession(singleQuestionLesson, { onConfirmedProgress })
  await user.click(screen.getByRole('radio', { name: '콜' }))
  await user.dblClick(screen.getByRole('button', { name: '정답 확인' }))
  expect(onConfirmedProgress).toHaveBeenCalledTimes(1)
})

it('재개한 도전의 이전 정답 수를 포함해 최종 결과를 계산한다', async () => {
  const onComplete = vi.fn(); const user = userEvent.setup()
  renderLearningSession(singleQuestionLesson, { initialProgress: { stepIndex: 0, answered: 4, correct: 0, submittedStepIds: [], missedStepIds: ['q1', 'q2', 'q3', 'q4'], selectedOptionIds: [] }, onComplete })
  await user.click(screen.getByRole('radio', { name: '콜' })); await user.click(screen.getByRole('button', { name: '정답 확인' })); await user.click(screen.getByRole('button', { name: '완료' }))
  expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ answered: 5, correct: 1 }))
})

it('마지막 문제 제출 뒤 재개 위치가 콘텐츠 범위를 넘지 않는다', async () => {
  const onConfirmedProgress = vi.fn(); const user = userEvent.setup()
  renderLearningSession(singleQuestionLesson, { onConfirmedProgress })
  await user.click(screen.getByRole('radio', { name: '콜' })); await user.click(screen.getByRole('button', { name: '정답 확인' }))
  expect(onConfirmedProgress).toHaveBeenLastCalledWith(expect.objectContaining({ stepIndex: 0, answered: 1, correct: 1 }))
})
