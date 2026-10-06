import { screen } from '@testing-library/react'
import { progressWithCompletedPart0, progressWithFailedPart1Challenge } from '../test/progressFixtures'
import { renderAppWithProgress } from '../test/renderApp'
import { createEmptyProgress } from '../features/progress/createEmptyProgress'

it.each([['range-turn', 'p4-seq-q11', 29, 20], ['range-hand-challenge', 'p4-seq-q31', 101, 60]] as const)('%s result preserves bet context', async (lessonId, stepId, pot, bet) => {
  const progress = createEmptyProgress()
  progress.lessonResults[lessonId] = { answered: 1, correct: 0, bestPercentage: 0, attempts: 1, missedStepIds: [stepId] }
  renderAppWithProgress(progress, `/results/part-4/${lessonId}`)
  expect(await screen.findByRole('group', { name: '이번 베팅' })).toHaveTextContent(`베팅 전 팟 ${pot}칩상대 베팅 ${bet}칩`)
  expect(screen.getByLabelText('이번 상황의 조건')).toBeVisible()
})

it.each([4, 5])('Part 3 종합 결과 %i/6에서 통과 여부와 종합연습 링크를 표시한다', async correct => {
  const progress = createEmptyProgress()
  progress.lessonResults['draw-challenge'] = { answered: 6, correct, bestPercentage: Math.round(correct / 6 * 100), attempts: 1 }
  renderAppWithProgress(progress, '/results/part-3/draw-challenge')
  expect(await screen.findByRole('link', { name: '← 레슨 목록' })).toHaveAttribute('href', '/parts/part-3')
  expect(Boolean(screen.queryByRole('link', { name: 'Part 결과 보기' }))).toBe(correct === 5)
  expect(screen.getByRole('link', { name: '새 카드로 연습하기' })).toHaveAttribute('href', '/practice/part-3/draw-challenge')
})

it.each(['/results/part-0', '/results/part-0/goal-and-cards', '/results/part-2/read-current-hand'])('결과 화면 %s에서 해당 Part의 레슨 목록으로 돌아간다', async path => {
  renderAppWithProgress(createEmptyProgress(), path)
  expect(await screen.findByRole('link', { name: '← 레슨 목록' })).toHaveAttribute('href', path.includes('part-2') ? '/parts/part-2' : '/parts/part-0')
})

it('Part 0을 통과하면 Part 1 추천 버튼을 보여준다', async () => {
  renderAppWithProgress(progressWithCompletedPart0, '/results/part-0')
  expect(await screen.findByRole('link', { name: 'Part 1 시작하기' })).toHaveAttribute('href', '/parts/part-1')
})
it('최신 점수와 최고 기록을 구분해 표시한다', async () => {
  const progress = createEmptyProgress(); progress.lessonResults['starting-hand-challenge'] = { answered: 5, correct: 2, bestPercentage: 100, attempts: 2, missedStepIds: [] }
  renderAppWithProgress(progress, '/results/part-1/starting-hand-challenge')
  expect(await screen.findByText('2/5 정답 · 40%')).toBeInTheDocument()
  expect(screen.getByText('최고 기록 100%')).toBeInTheDocument()
})
it('최종 도전이 80% 미만이면 놓친 개념과 다시 도전을 보여준다', async () => {
  renderAppWithProgress(progressWithFailedPart1Challenge, '/results/part-1/starting-hand-challenge')
  expect(await screen.findByText('아직 Part 1을 완료하지 못했어요')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: '종합 도전 다시 풀기' })).toBeInTheDocument()
  expect(screen.getByText(/J♠ 9♥ · 초반/)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: '종합 도전 다시 풀기' })).toHaveAttribute('href', '/learn/part-1/starting-hand-challenge?restart=1')
  expect(screen.getByRole('link', { name: '새 카드로 연습하기' })).toHaveAttribute('href', '/practice/part-1/starting-hand-challenge')
})

it.each([
  ['identify-properties', 'p1-identify-83o', ['8♣', '3♥']],
  ['compare-hands', 'p1-compare-ak', ['A♠ K♠', 'A♥ 8♣']],
  ['classify-strength', 'p1-strength-76s', ['7♠ 6♠']],
])('시각화된 %s 레슨도 오답 결과에서 어떤 카드를 판단했는지 알 수 있다', async (lessonId, stepId, cards) => {
  const progress = createEmptyProgress()
  progress.lessonResults[lessonId] = { answered: 1, correct: 0, bestPercentage: 0, attempts: 1, missedStepIds: [stepId] }
  renderAppWithProgress(progress, `/results/part-1/${lessonId}`)
  await screen.findByText('0/1 정답 · 0%')
  const review = screen.getByRole('listitem')
  for (const card of cards) expect(review).toHaveTextContent(card)
})
