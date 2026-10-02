import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderAppAt } from '../test/renderApp'
import { createEmptyProgress } from '../features/progress/createEmptyProgress'

beforeEach(() => localStorage.clear())

it('Part 1 복수 선택과 제출한 해설을 복원하고 Part 1 목록으로 돌아간다', async () => {
  const user = userEvent.setup()
  const view = renderAppAt('/practice/part-1/identify-properties')
  await user.click(await screen.findByRole('button', { name: '연습 시작' }))
  const labels = screen.getAllByRole('checkbox').slice(0, 2).map(input => input.parentElement!.textContent!)
  for (const label of labels) await user.click(screen.getByRole('checkbox', { name: label }))
  await user.click(screen.getByRole('button', { name: '정답 확인' }))
  const feedback = screen.getByRole('status').textContent
  view.unmount()
  renderAppAt('/practice/part-1/identify-properties')
  await user.click(await screen.findByRole('button', { name: '이어서 연습하기' }))
  for (const label of labels) expect(screen.getByRole('checkbox', { name: label })).toBeChecked()
  expect(screen.getByRole('status').textContent).toBe(feedback)
  expect(screen.getByRole('link', { name: '← Part 1로 돌아가기' })).toHaveAttribute('href', '/parts/part-1')
  expect(document.querySelectorAll('.practice-hands .playing-card')).toHaveLength(2)
})

it('다른 Part에 속한 연습 주소는 열지 않는다', async () => {
  renderAppAt('/practice/part-2/identify-properties')
  expect(await screen.findByRole('heading', { name: '추가 연습을 찾을 수 없어요' })).toBeInTheDocument()
})

it('시작 버튼은 소개 영역에 두고 별도 안내 박스와 잠시 나가기를 표시하지 않는다', async () => {
  const user = userEvent.setup()
  const view = renderAppAt('/practice/part-2/pair-types')
  const start = await screen.findByRole('button', { name: '연습 시작' })
  expect(start.closest('header')).toBeInTheDocument()
  expect(view.container.querySelector('.message-panel')).not.toBeInTheDocument()
  await user.click(start)
  expect(screen.queryByRole('button', { name: '연습 잠시 나가기' })).not.toBeInTheDocument()
})

it('돌아가기 링크는 레슨 목록으로 이동하고 저장된 레슨 진도는 유지한다', async () => {
  const user = userEvent.setup()
  const progress = createEmptyProgress()
  progress.resumeByPart['part-2'] = { partId: 'part-2', lessonId: 'pair-types', stepIndex: 2 }
  const view = renderAppAt('/practice/part-2/pair-types', progress)
  const back = await screen.findByRole('link', { name: '← Part 2로 돌아가기' })
  expect(screen.getAllByRole('link').filter(link => link.getAttribute('href') === '/parts/part-2')).toHaveLength(1)
  await user.click(back)
  expect(await screen.findByRole('heading', { name: 'Lesson 목록' })).toBeInTheDocument()
  expect((await view.repository.load()).progress.resumeByPart['part-2'].stepIndex).toBe(2)
})

it('답 제출 후 다시 열면 같은 문제의 선택과 해설을 유지한다', async () => {
  const user = userEvent.setup()
  const view = renderAppAt('/practice/part-2/pair-types')
  await user.click(await screen.findByRole('button', { name: '연습 시작' }))
  const radio = screen.getAllByRole('radio')[0]
  const label = radio.parentElement!.textContent!
  await user.click(radio)
  await user.click(screen.getByRole('button', { name: '정답 확인' }))
  const feedback = screen.getByRole('status').textContent
  view.unmount()
  renderAppAt('/practice/part-2/pair-types')
  await user.click(await screen.findByRole('button', { name: '이어서 연습하기' }))
  expect(screen.getByRole('radio', { name: label })).toBeChecked()
  expect(screen.getByRole('status').textContent).toBe(feedback)
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1')
})

it('연습 완료는 레슨 완료를 바꾸지 않고 새 회차는 이전 답을 지운다', async () => {
  const user = userEvent.setup()
  const view = renderAppAt('/practice/part-2/pair-types')
  await user.click(await screen.findByRole('button', { name: '연습 시작' }))
  for (let i = 0; i < 4; i++) {
    await user.click(screen.getAllByRole('radio')[0])
    await user.click(screen.getByRole('button', { name: '정답 확인' }))
    await user.click(screen.getByRole('button', { name: i === 3 ? '완료' : '다음' }))
  }
  expect(screen.getByRole('heading', { name: '추가 연습을 마쳤어요' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: '← Part 2로 돌아가기' })).toHaveAttribute('href', '/parts/part-2')
  expect(screen.getAllByRole('link').filter(link => link.getAttribute('href') === '/parts/part-2')).toHaveLength(1)
  expect((await view.repository.load()).progress.completedLessonIds).toEqual([])
  await user.click(screen.getByRole('button', { name: '새 문제로 연습하기' }))
  expect(screen.getAllByRole('radio').every(r => !(r as HTMLInputElement).checked)).toBe(true)
})

it('완료 후 목록에서 다시 들어오면 시작 화면을 보이고 최근 결과는 보관한다', async () => {
  const user = userEvent.setup()
  renderAppAt('/practice/part-2/read-current-hand')
  await user.click(await screen.findByRole('button', { name: '연습 시작' }))
  for (let i = 0; i < 4; i++) {
    await user.click(screen.getAllByRole('radio')[0])
    await user.click(screen.getByRole('button', { name: '정답 확인' }))
    await user.click(screen.getByRole('button', { name: i === 3 ? '완료' : '다음' }))
  }
  expect(screen.getByRole('heading', { name: '추가 연습을 마쳤어요' })).toBeInTheDocument()
  const saved = localStorage.getItem('holdem-practice-progress')
  await user.click(screen.getByRole('link', { name: '← Part 2로 돌아가기' }))
  await user.click(await screen.findByRole('link', { name: '다섯 장으로 현재 족보 읽기 · 추가 연습' }))
  expect(screen.getByRole('button', { name: '연습 시작' }).closest('header')).toBeInTheDocument()
  expect(screen.queryByText('추가 연습을 마쳤어요')).not.toBeInTheDocument()
  expect(screen.queryByText('최근 완료 결과 보기')).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: '이어서 연습하기' })).not.toBeInTheDocument()
  expect(localStorage.getItem('holdem-practice-progress')).toBe(saved)
  await user.click(screen.getByRole('button', { name: '연습 시작' }))
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1')
  expect(screen.getAllByRole('radio').every(r => !(r as HTMLInputElement).checked)).toBe(true)
})

it('저장이 차단되어도 풀 수 있고 새로고침 복원 제한을 안내한다', async () => {
  const user = userEvent.setup()
  const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
  renderAppAt('/practice/part-2/pair-types')
  await user.click(await screen.findByRole('button', { name: '연습 시작' }))
  expect(screen.getByRole('alert')).toHaveTextContent('새로고침하면 복원되지 않을 수 있어요')
  await user.click(screen.getAllByRole('radio')[0])
  await user.click(screen.getByRole('button', { name: '정답 확인' }))
  expect(screen.getByRole('status')).toBeInTheDocument()
  spy.mockRestore()
})

it('존재하지 않는 레슨의 연습은 문제를 뽑지 않는다', async () => {
  renderAppAt('/practice/part-0/pair-types')
  expect(await screen.findByRole('heading', { name: '추가 연습을 찾을 수 없어요' })).toBeInTheDocument()
  expect(localStorage.getItem('holdem-practice-progress')).toBeNull()
})
