import { screen } from '@testing-library/react'
import { progressWithCompletedPart0, progressWithFailedPart1Challenge } from '../test/progressFixtures'
import { renderAppWithProgress } from '../test/renderApp'

it('Part 0을 통과하면 Part 1 추천 버튼을 보여준다', async () => {
  renderAppWithProgress(progressWithCompletedPart0, '/results/part-0')
  expect(await screen.findByRole('link', { name: 'Part 1 시작하기' })).toHaveAttribute('href', '/parts/part-1')
})
it('최종 도전이 80% 미만이면 놓친 개념과 다시 도전을 보여준다', async () => {
  renderAppWithProgress(progressWithFailedPart1Challenge, '/results/part-1/starting-hand-challenge')
  expect(await screen.findByText('아직 Part 1을 완료하지 못했어요')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: '종합 도전 다시 풀기' })).toBeInTheDocument()
})
