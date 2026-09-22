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
