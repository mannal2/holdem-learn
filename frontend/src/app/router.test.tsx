import { render, screen } from '@testing-library/react'
import { RouterProvider } from 'react-router-dom'
import { createAppRouter } from './router'

it('홈에서 두 학습 Part를 안내한다', async () => {
  render(<RouterProvider router={createAppRouter(['/'])} />)

  expect(
    await screen.findByRole('heading', { name: '홀덤을 판단하는 법부터 배워요' }),
  ).toBeInTheDocument()
  expect(screen.getByText('Part 0')).toBeInTheDocument()
  expect(screen.getByText('Part 1')).toBeInTheDocument()
})

it('잘못된 주소에서 홈으로 돌아갈 수 있다', async () => {
  render(<RouterProvider router={createAppRouter(['/없는-주소'])} />)

  expect(
    await screen.findByRole('heading', { name: '페이지를 찾을 수 없어요' }),
  ).toBeInTheDocument()
  expect(screen.getByRole('link', { name: '홈으로 돌아가기' })).toHaveAttribute(
    'href',
    '/',
  )
})
