import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createEmptyProgress } from '../features/progress/createEmptyProgress'
import { progressInBothParts } from '../test/progressFixtures'
import { renderAppWithProgress } from '../test/renderApp'

it('Part 0을 완료하지 않아도 Part 1을 시작할 수 있다', async () => {
  renderAppWithProgress(createEmptyProgress(), '/parts/part-1')
  expect(await screen.findByRole('link', { name: 'Part 1 시작하기' })).toBeInTheDocument()
})
it('Part 진도 초기화는 확인한 뒤 해당 Part만 삭제한다', async () => {
  const user = userEvent.setup()
  const repository = renderAppWithProgress(progressInBothParts, '/parts/part-0')
  await screen.findByRole('heading', { name: '한 판의 흐름 이해하기' })
  await user.click(screen.getByRole('button', { name: 'Part 0 진도 초기화' }))
  expect(screen.getByRole('dialog', { name: 'Part 0 진도를 초기화할까요?' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: '초기화하기' }))
  expect(repository.progress.resumeByPart['part-0']).toBeUndefined()
  expect(repository.progress.resumeByPart['part-1']).toBeDefined()
})
