import { screen } from '@testing-library/react'
import { renderAppAt } from '../test/renderApp'

it('Part 0 첫 Lesson을 열어 첫 설명을 보여준다', async () => {
  renderAppAt('/learn/part-0/goal-and-cards')
  expect(await screen.findByRole('heading', { name: '게임의 목표와 카드 구성' })).toBeInTheDocument()
  expect(screen.getByText(/개인 카드 두 장/)).toBeInTheDocument()
})
it('존재하지 않는 Lesson은 복구 화면을 보여준다', async () => {
  renderAppAt('/learn/part-0/missing')
  expect(await screen.findByRole('heading', { name: '학습 내용을 찾을 수 없어요' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Part 0으로 돌아가기' })).toBeInTheDocument()
})
