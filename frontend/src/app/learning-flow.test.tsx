import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderAppAt } from '../test/renderApp'

it('학습, 이어하기, Part 직접 접근과 부분 초기화를 한 흐름으로 처리한다', async () => {
  const user = userEvent.setup()
  const { repository, router } = renderAppAt('/learn/part-0/goal-and-cards')
  await screen.findByRole('heading', { name: '게임의 목표와 카드 구성' })

  await user.click(screen.getByRole('button', { name: '다음' }))
  await waitFor(() => expect(repository.progress.resumeByPart['part-0']?.stepIndex).toBe(1))
  await act(() => router.navigate('/'))
  expect(await screen.findByRole('link', { name: /Part 0 이어하기/ })).toHaveAttribute('href', '/learn/part-0/goal-and-cards')

  await act(() => router.navigate('/learn/part-0/goal-and-cards'))
  await screen.findByRole('heading', { name: '함께 쓰는 공용 카드' })
  await user.click(screen.getByRole('button', { name: '다음' }))
  await user.click(screen.getByRole('radio', { name: '5장' }))
  await user.click(screen.getByRole('button', { name: '정답 확인' }))
  await waitFor(() => expect(repository.progress.resumeByPart['part-0']?.stepIndex).toBe(2))

  await act(() => router.navigate('/'))
  await screen.findByRole('heading', { name: '레슨 목록' })
  await act(() => router.navigate('/learn/part-0/goal-and-cards'))
  expect(await screen.findByRole('radio', { name: '5장' })).toBeChecked()
  expect(screen.getByRole('status')).toHaveTextContent('정답이에요')
  await user.click(screen.getByRole('button', { name: '다음' }))
  expect(screen.getByRole('heading', { name: '핵심 정리' })).toBeInTheDocument()
  expect(repository.progress.lessonResults['goal-and-cards']).toBeUndefined()

  await act(() => router.navigate('/learn/part-1/hand-notation'))
  expect(await screen.findByRole('heading', { name: '시작 패 표기 읽기' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: '다음' }))
  await waitFor(() => expect(repository.progress.resumeByPart['part-1']).toBeDefined())

  await act(() => router.navigate('/parts/part-0'))
  await user.click(await screen.findByRole('button', { name: 'Part 0 진도 초기화' }))
  await user.click(screen.getByRole('button', { name: '초기화하기' }))
  await waitFor(() => expect(repository.progress.resumeByPart['part-0']).toBeUndefined())
  expect(repository.progress.resumeByPart['part-1']).toBeDefined()
})
