import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { multiChoiceStep, renderLearningSession, singleChoiceStep, singleQuestionLesson } from '../../test/learningFixtures'
import type { LessonDefinition } from '../../types/course'
import type { SessionProgress } from './LearningSession'

const reviewLesson: LessonDefinition = {
  id: 'review-lesson', title: '복습', objective: '이전 단계 확인',
  steps: [
    { id: 'intro', type: 'explanation', title: '시작', body: '첫 설명입니다.' },
    singleChoiceStep,
    { id: 'end', type: 'summary', title: '마무리', body: '마지막입니다.', bullets: [] },
  ],
}

it('현재 요약 화면은 복원하되 미제출 문제를 풀기 전에는 완료하지 않는다', async () => {
  const user = userEvent.setup()
  const onComplete = vi.fn()
  const onProgressChange = vi.fn()
  renderLearningSession(reviewLesson, { initialStepIndex: 2, initialProgress: { answered: 0, correct: 0, submittedStepIds: [], missedStepIds: [], selectionsByStep: {} }, onComplete, onProgressChange })
  expect(screen.getByText('마지막입니다.')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: '남은 문제 풀기' }))
  expect(onComplete).not.toHaveBeenCalled()
  expect(screen.getByRole('radio', { name: '콜' })).not.toBeChecked()
  await user.click(screen.getByRole('radio', { name: '콜' }))
  await user.click(screen.getByRole('button', { name: '정답 확인' }))
  await user.click(screen.getByRole('button', { name: '다음' }))
  await user.click(screen.getByRole('button', { name: '완료' }))
  expect(onComplete).toHaveBeenCalledWith({ answered: 1, correct: 1, missedStepIds: [] })
})

it('첫 단계의 이전 버튼은 비활성화하고, 다음 단계에서는 이전 화면으로 돌아간다', async () => {
  const user = userEvent.setup()
  const onProgressChange = vi.fn()
  renderLearningSession(reviewLesson, { onProgressChange })
  expect(screen.getByRole('button', { name: '이전' })).toBeDisabled()
  await user.click(screen.getByRole('button', { name: '다음' }))
  await user.click(screen.getByRole('button', { name: '이전' }))
  expect(screen.getByText('첫 설명입니다.')).toBeInTheDocument()
  expect(onProgressChange).toHaveBeenLastCalledWith(expect.objectContaining({ stepIndex: 0 }))
})

it('제출한 문제를 다시 보면 해설을 보여주고 점수를 중복 집계하지 않는다', async () => {
  const user = userEvent.setup()
  const onProgressChange = vi.fn()
  renderLearningSession(reviewLesson, { onProgressChange })
  await user.click(screen.getByRole('button', { name: '다음' }))
  await user.click(screen.getByRole('radio', { name: '콜' }))
  await user.click(screen.getByRole('button', { name: '정답 확인' }))
  await user.click(screen.getByRole('button', { name: '다음' }))
  await user.click(screen.getByRole('button', { name: '이전' }))
  expect(screen.getByRole('status')).toHaveTextContent('정답이에요')
  expect(screen.getByRole('radio', { name: '콜' })).toBeChecked()
  expect(screen.queryByRole('button', { name: '정답 확인' })).not.toBeInTheDocument()
  expect(onProgressChange).toHaveBeenLastCalledWith(expect.objectContaining({ stepIndex: 1, answered: 1, correct: 1 }))
})

it('복수 선택 문제로 돌아오면 실제로 체크했던 보기만 복원한다', async () => {
  const user = userEvent.setup()
  renderLearningSession({ ...reviewLesson, steps: [reviewLesson.steps[0], multiChoiceStep, reviewLesson.steps[2]] })
  await user.click(screen.getByRole('button', { name: '다음' }))
  await user.click(screen.getByRole('checkbox', { name: '수딧' }))
  await user.click(screen.getByRole('checkbox', { name: '포켓 페어' }))
  await user.click(screen.getByRole('button', { name: '정답 확인' }))
  await user.click(screen.getByRole('button', { name: '다음' }))
  await user.click(screen.getByRole('button', { name: '이전' }))
  expect(screen.getByRole('checkbox', { name: '수딧' })).toBeChecked()
  expect(screen.getByRole('checkbox', { name: '포켓 페어' })).toBeChecked()
  expect(screen.getByRole('checkbox', { name: '커넥티드' })).not.toBeChecked()
})

it('레슨을 다시 열어도 제출했던 문제의 체크 표시를 복원한다', async () => {
  const user = userEvent.setup()
  const onProgressChange = vi.fn()
  const view = renderLearningSession(reviewLesson, { onProgressChange })
  await user.click(screen.getByRole('button', { name: '다음' }))
  await user.click(screen.getByRole('radio', { name: '폴드' }))
  await user.click(screen.getByRole('button', { name: '정답 확인' }))
  const saved = onProgressChange.mock.lastCall?.[0] as SessionProgress
  view.unmount()
  renderLearningSession(reviewLesson, { initialStepIndex: saved.stepIndex, initialProgress: saved })
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2')
  expect(screen.getByRole('radio', { name: '폴드' })).toBeChecked()
  expect(screen.getByRole('radio', { name: '콜' })).not.toBeChecked()
  expect(screen.getByRole('status')).toHaveTextContent('다시 확인해 봐요')
})

it('제출한 단계에서 해설을 유지하고 다음을 누를 때만 저장 위치를 옮긴다', async () => {
  const user = userEvent.setup()
  const onProgressChange = vi.fn()
  renderLearningSession(reviewLesson, { onProgressChange })
  await user.click(screen.getByRole('button', { name: '다음' }))
  await user.click(screen.getByRole('radio', { name: '콜' }))
  await user.click(screen.getByRole('button', { name: '정답 확인' }))
  expect(onProgressChange).toHaveBeenLastCalledWith(expect.objectContaining({ stepIndex: 1, selectedOptionIds: ['call'], answered: 1 }))
  await user.click(screen.getByRole('button', { name: '다음' }))
  expect(onProgressChange).toHaveBeenLastCalledWith(expect.objectContaining({ stepIndex: 2, selectedOptionIds: [], answered: 1 }))
})

it('정답 확인 전 새로고침해도 선택 중이던 보기들을 복원한다', async () => {
  const user = userEvent.setup()
  const onProgressChange = vi.fn()
  const lesson = { ...reviewLesson, steps: [reviewLesson.steps[0], multiChoiceStep, reviewLesson.steps[2]] }
  const view = renderLearningSession(lesson, { onProgressChange })
  await user.click(screen.getByRole('button', { name: '다음' }))
  await user.click(screen.getByRole('checkbox', { name: '수딧' }))
  await user.click(screen.getByRole('checkbox', { name: '포켓 페어' }))
  const saved = onProgressChange.mock.lastCall?.[0] as SessionProgress
  view.unmount()
  renderLearningSession(lesson, { initialStepIndex: saved.stepIndex, initialProgress: saved })
  expect(screen.getByRole('checkbox', { name: '수딧' })).toBeChecked()
  expect(screen.getByRole('checkbox', { name: '포켓 페어' })).toBeChecked()
  expect(screen.getByRole('button', { name: '정답 확인' })).toBeEnabled()
})

it('답 제출 후 피드백과 완료 버튼을 보여준다', async () => {
  const user = userEvent.setup()
  renderLearningSession(singleQuestionLesson)
  await user.click(screen.getByRole('radio', { name: '콜' }))
  await user.click(screen.getByRole('button', { name: '정답 확인' }))
  expect(screen.getByRole('status')).toHaveTextContent('정답이에요')
  expect(screen.getByRole('button', { name: '완료' })).toBeEnabled()
  expect(screen.queryByRole('button', { name: '정답 확인' })).not.toBeInTheDocument()
})

it('제출 버튼을 빠르게 두 번 눌러도 응답은 한 번만 기록한다', async () => {
  const onProgressChange = vi.fn()
  const user = userEvent.setup()
  renderLearningSession(singleQuestionLesson, { onProgressChange })
  await user.click(screen.getByRole('radio', { name: '콜' }))
  await user.dblClick(screen.getByRole('button', { name: '정답 확인' }))
  const submissions = onProgressChange.mock.calls.filter(([progress]) => (progress as SessionProgress).submittedStepIds.includes('call-question'))
  expect(submissions).toHaveLength(1)
})

it('재개한 도전의 이전 정답 수를 포함해 최종 결과를 계산한다', async () => {
  const onComplete = vi.fn(); const user = userEvent.setup()
  renderLearningSession(singleQuestionLesson, { initialProgress: { stepIndex: 0, answered: 4, correct: 0, submittedStepIds: [], missedStepIds: ['q1', 'q2', 'q3', 'q4'], selectedOptionIds: [] }, onComplete })
  await user.click(screen.getByRole('radio', { name: '콜' })); await user.click(screen.getByRole('button', { name: '정답 확인' })); await user.click(screen.getByRole('button', { name: '완료' }))
  expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ answered: 5, correct: 1 }))
})

it('마지막 문제 제출 뒤 재개 위치가 콘텐츠 범위를 넘지 않는다', async () => {
  const onProgressChange = vi.fn(); const user = userEvent.setup()
  renderLearningSession(singleQuestionLesson, { onProgressChange })
  await user.click(screen.getByRole('radio', { name: '콜' })); await user.click(screen.getByRole('button', { name: '정답 확인' }))
  expect(onProgressChange).toHaveBeenLastCalledWith(expect.objectContaining({ stepIndex: 0, answered: 1, correct: 1 }))
})
