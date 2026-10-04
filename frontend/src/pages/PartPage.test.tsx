import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createEmptyProgress } from '../features/progress/createEmptyProgress'
import { progressInBothParts } from '../test/progressFixtures'
import { renderAppWithProgress } from '../test/renderApp'
import { getPart } from '../content/catalog'

it('Part 3의 일곱 레슨 옆에 추가·종합 연습을 연결한다', async () => {
  renderAppWithProgress(createEmptyProgress(), '/parts/part-3')
  await screen.findByRole('heading', { name: 'Lesson 목록' })
  expect(document.querySelectorAll('.lesson-list li')).toHaveLength(7)
  expect(document.querySelectorAll('.lesson-practice-link')).toHaveLength(7)
  expect(screen.getByRole('link', { name: '미래 가능성 종합 도전 · 종합 연습' })).toHaveAttribute('href', '/practice/part-3/draw-challenge')
  expect(screen.getByRole('link', { name: 'Part 3 시작하기' })).toHaveAttribute('href', '/learn/part-3/made-hand-and-draw')
})

it.each([[4, '재도전 필요', '다시 풀기'], [5, '완료', '복습하기']] as const)('Part 3 종합 도전 %i/6 결과의 상태를 표시한다', async (correct, status, action) => {
  const progress = createEmptyProgress()
  progress.completedLessonIds = ['draw-challenge']
  progress.lessonResults['draw-challenge'] = { answered: 6, correct, bestPercentage: Math.round(correct / 6 * 100), attempts: 1 }
  renderAppWithProgress(progress, '/parts/part-3')
  const row = (await screen.findByText('미래 가능성 종합 도전')).closest('li')!
  expect(within(row).getByText(status, { exact: true })).toBeInTheDocument()
  expect(within(row).getByRole('link', { name: action })).toHaveAttribute('href', '/learn/part-3/draw-challenge?restart=1')
})

it('Part 1은 승인된 네 레슨과 종합 도전에만 연습 링크를 제공한다', async () => {
  renderAppWithProgress(createEmptyProgress(), '/parts/part-1')
  await screen.findByRole('heading', { name: 'Lesson 목록' })
  expect(document.querySelectorAll('.lesson-practice-link')).toHaveLength(5)
  expect(screen.getByRole('link', { name: '시작 패 종합 도전 · 종합 연습' })).toHaveAttribute('href', '/practice/part-1/starting-hand-challenge')
  expect(screen.queryByRole('link', { name: '시작 패 표기 읽기 · 추가 연습' })).not.toBeInTheDocument()
})

it('Part 2의 연습 링크를 해당 레슨 행에 붙이고 별도 하단 목록은 표시하지 않는다', async () => {
  renderAppWithProgress(createEmptyProgress(), '/parts/part-2')
  const title = await screen.findByText('원 페어의 위치 구분하기')
  const row = title.closest('li')!
  const practice = within(row).getByRole('link', { name: '원 페어의 위치 구분하기 · 추가 연습' })
  expect(practice).toHaveTextContent('추가 연습')
  expect(practice).toHaveAttribute('href', '/practice/part-2/pair-types')
  expect(within(row).getByRole('link', { name: '시작하기' })).toHaveAttribute('href', '/learn/part-2/pair-types')
  const challengeRow = screen.getByText('플랍 이후 패 읽기 도전').closest('li')!
  expect(within(challengeRow).getByRole('link', { name: '플랍 이후 패 읽기 도전 · 종합 연습' })).toHaveTextContent('종합 연습')
  expect(screen.queryByRole('heading', { name: '새 카드로 추가 연습' })).not.toBeInTheDocument()
})

it('중간에 멈춘 위치가 있으면 다음 미완료 레슨보다 이어하기를 우선한다', async () => {
  renderAppWithProgress(progressInBothParts, '/parts/part-0')
  expect(await screen.findByRole('link', { name: 'Part 0 이어하기' })).toHaveAttribute('href', '/learn/part-0/goal-and-cards')
})

it('레슨을 완료하면 순서상 첫 미완료 레슨 시작을 안내한다', async () => {
  const progress = createEmptyProgress()
  progress.completedLessonIds = ['goal-and-cards', 'player-actions']
  renderAppWithProgress(progress, '/parts/part-0')
  expect(await screen.findByRole('link', { name: '다음 레슨 시작하기' })).toHaveAttribute('href', '/learn/part-0/hand-rankings')
})

it('다른 Part의 완료 기록은 처음 시작하는 Part 버튼에 영향을 주지 않는다', async () => {
  const progress = createEmptyProgress()
  progress.completedLessonIds = ['hand-notation']
  renderAppWithProgress(progress, '/parts/part-0')
  expect(await screen.findByRole('link', { name: 'Part 0 시작하기' })).toHaveAttribute('href', '/learn/part-0/goal-and-cards')
})

it('모든 레슨과 도전을 완료하면 처음부터 복습을 안내한다', async () => {
  const progress = createEmptyProgress()
  progress.completedLessonIds = [...getPart('part-0')!.lessonIds]
  progress.lessonResults['guided-hand'] = { answered: 5, correct: 4, bestPercentage: 80, attempts: 1 }
  progress.completedPartIds = ['part-0']
  renderAppWithProgress(progress, '/parts/part-0')
  expect(await screen.findByRole('link', { name: '처음부터 복습하기' })).toHaveAttribute('href', '/learn/part-0/goal-and-cards?restart=1')
})

it('도전 점수가 미통과이면 완료 ID가 있어도 재도전을 안내한다', async () => {
  const progress = createEmptyProgress()
  progress.completedLessonIds = [...getPart('part-0')!.lessonIds]
  progress.lessonResults['guided-hand'] = { answered: 5, correct: 3, bestPercentage: 60, attempts: 1 }
  renderAppWithProgress(progress, '/parts/part-0')
  expect(await screen.findByRole('link', { name: '종합 도전 다시 풀기' })).toHaveAttribute('href', '/learn/part-0/guided-hand?restart=1')
  const row = screen.getByText('모의 한 판').closest('li')!
  expect(within(row).getByText('재도전 필요')).toBeInTheDocument()
  expect(within(row).getByRole('link', { name: '다시 풀기' })).toHaveAttribute('href', '/learn/part-0/guided-hand?restart=1')
})

it('Part 2 도전도 미통과 결과를 완료로 표시하지 않는다', async () => {
  const progress = createEmptyProgress()
  progress.completedLessonIds = ['flop-reading-challenge']
  progress.lessonResults['flop-reading-challenge'] = { answered: 6, correct: 0, bestPercentage: 0, attempts: 1 }
  renderAppWithProgress(progress, '/parts/part-2')
  const row = (await screen.findByText('플랍 이후 패 읽기 도전')).closest('li')!
  expect(within(row).getByText('재도전 필요')).toBeInTheDocument()
  expect(within(row).getByRole('link', { name: '다시 풀기' })).toHaveAttribute('href', '/learn/part-2/flop-reading-challenge?restart=1')
})

it('복습 중인 레슨 행도 저장된 위치를 이어하고 처음부터 재시작하지 않는다', async () => {
  const progress = createEmptyProgress()
  progress.completedLessonIds = ['goal-and-cards']
  progress.resumeByPart['part-0'] = { partId: 'part-0', lessonId: 'goal-and-cards', stepIndex: 2 }
  renderAppWithProgress(progress, '/parts/part-0')
  const row = (await screen.findByText('게임의 목표와 카드 구성')).closest('li')!
  expect(within(row).getByRole('link', { name: '이어하기' })).toHaveAttribute('href', '/learn/part-0/goal-and-cards')
})

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
