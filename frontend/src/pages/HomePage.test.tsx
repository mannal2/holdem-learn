import { screen } from '@testing-library/react'
import { createEmptyProgress } from '../features/progress/createEmptyProgress'
import { progressAtPartOneStepSix } from '../test/progressFixtures'
import { renderAppWithProgress } from '../test/renderApp'

it('저장된 마지막 위치로 계속 학습하기 링크를 제공한다', async () => {
  renderAppWithProgress(progressAtPartOneStepSix, '/')
  expect(await screen.findByRole('link', { name: /Part 1 이어하기/ })).toHaveAttribute('href', '/learn/part-1/hand-properties')
})
it('로그인 전 진도의 저장 범위를 안내한다', async () => {
  renderAppWithProgress(createEmptyProgress(), '/')
  expect(await screen.findByText('진도는 현재 이 기기와 브라우저에만 저장돼요.')).toBeInTheDocument()
})
