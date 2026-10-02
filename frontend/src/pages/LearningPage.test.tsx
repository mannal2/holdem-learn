import { screen, waitFor } from '@testing-library/react'
import { renderAppAt } from '../test/renderApp'
import { createEmptyProgress } from '../features/progress/createEmptyProgress'

it('Part 0 첫 Lesson을 열어 첫 설명을 보여준다', async () => {
  renderAppAt('/learn/part-0/goal-and-cards')
  expect(await screen.findByRole('heading', { name: '게임의 목표와 카드 구성' })).toBeInTheDocument()
  expect(screen.getByText(/개인 카드 두 장/)).toBeInTheDocument()
})
it('복습 주소는 저장된 위치와 관계없이 첫 단계에서 시작한다', async () => {
  const progress = createEmptyProgress(); progress.resumeByPart['part-0'] = { partId: 'part-0', lessonId: 'goal-and-cards', stepIndex: 3 }; progress.recent = progress.resumeByPart['part-0']
  renderAppAt('/learn/part-0/goal-and-cards?restart=1', progress)
  expect(await screen.findByRole('heading', { name: '내가 받는 카드' })).toBeInTheDocument()
})

it('복습 시작은 한 번만 적용하고 새로고침할 주소와 새 시도 위치를 저장한다', async () => {
  const progress = createEmptyProgress()
  progress.resumeByPart['part-0'] = { partId: 'part-0', lessonId: 'goal-and-cards', stepIndex: 3, answered: 1, correct: 1 }
  const { repository, router } = renderAppAt('/learn/part-0/goal-and-cards?restart=1&source=result', progress)
  await screen.findByRole('heading', { name: '내가 받는 카드' })
  await waitFor(() => expect(router.state.location.search).toBe('?source=result'))
  expect(repository.progress.resumeByPart['part-0']).toEqual(expect.objectContaining({ stepIndex: 0, answered: 0, correct: 0, selectedOptionIds: [], submittedStepIds: [], selectionsByStep: {} }))
})
it('존재하지 않는 Lesson은 복구 화면을 보여준다', async () => {
  renderAppAt('/learn/part-0/missing')
  expect(await screen.findByRole('heading', { name: '학습 내용을 찾을 수 없어요' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Part 0으로 돌아가기' })).toBeInTheDocument()
})
