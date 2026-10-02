import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

it('완료 레슨이 없어도 이어할 위치가 있으면 학습중으로 표시한다', async () => {
  const progress = createEmptyProgress()
  progress.resumeByPart['part-2'] = { partId: 'part-2', lessonId: 'preflop-to-flop', stepIndex: 1 }
  progress.recent = progress.resumeByPart['part-2']
  renderAppWithProgress(progress, '/')
  const card = (await screen.findByRole('heading', { name: '플랍 이후 내 패의 현재 가치 판단' })).closest('article')!
  expect(within(card).getByText('학습 중 · 0/6')).toBeInTheDocument()
  expect(within(card).getByRole('link', { name: 'Part 2 살펴보기' })).toBeInTheDocument()
  const untouched = screen.getByRole('heading', { name: '한 판의 흐름 이해하기' }).closest('article')!
  expect(within(untouched).getByText('미시작 · 0/6')).toBeInTheDocument()
})
it('전체 초기화 안내가 Part 2를 포함한 모든 Part에 적용된다', async () => {
  renderAppWithProgress(createEmptyProgress(), '/')
  await userEvent.click(await screen.findByRole('button', { name: '전체 진도 초기화' }))
  expect(screen.getByText('모든 Part의 저장된 진도가 삭제됩니다.')).toBeInTheDocument()
})
