import { render, screen, within } from '@testing-library/react'
import { part3Lessons } from '../../content/part3'
import { LearningStepRenderer } from './LearningStepRenderer'

function show(lessonId: string, stepId: string, feedbackVisible = false) {
  const step = part3Lessons[lessonId].steps.find(step => step.id === stepId)!
  return render(<LearningStepRenderer step={step} selectedOptionIds={[]} feedbackVisible={feedbackVisible} onSelect={() => {}} />)
}

it('테이블 설명의 현재 패와 미래 가능성은 카드 소속을 유지하며 구별한다', () => {
  show('made-hand-and-draw', 'p3-1-flop')
  expect(within(screen.getByRole('group', { name: '현재 패' })).getByText('A 하이')).toBeVisible()
  expect(within(screen.getByRole('group', { name: '앞으로의 가능성' })).getByText('하트 한 장 → 플러시')).toBeVisible()
  expect(screen.getAllByTestId('community-card')).toHaveLength(3)
  expect(screen.getByRole('group', { name: '내 개인 카드' }).querySelectorAll('.playing-card')).toHaveLength(2)
})

it('백도어 설명은 턴과 리버 모두 하트여야 하는 두 기회를 표시한다', () => {
  show('flush-draw', 'p3-2-backdoor')
  const chances = screen.getByRole('group', { name: '하트 세 장에서 플러시 완성' })
  expect(within(chances).getByText('턴')).toBeVisible()
  expect(within(chances).getByText('리버')).toBeVisible()
  expect(chances).toHaveTextContent('두 장 모두 하트여야 해요')
})

it.each([
  ['p3-3-open', '양끝에 필요한 숫자', ['4', '9']],
  ['p3-3-gutshot', '가운데 필요한 숫자', ['6']],
])('%s은 현재 숫자와 앞으로 필요한 숫자를 다른 표시로 보여준다', (id, label, needed) => {
  show('straight-draw', id)
  const sequence = screen.getByRole('group', { name: label })
  expect(sequence.querySelectorAll('[data-needed="true"]')).toHaveLength(needed.length)
  for (const rank of needed) expect(within(sequence).getByLabelText(`${rank} · 필요한 숫자`)).toBeVisible()
  expect(screen.getAllByTestId('community-card')).toHaveLength(3)
})

it('오픈엔디드 후보는 네 장씩 분리해서 실제 8장의 카드를 보여준다', () => {
  show('counting-outs', 'p3-4-open-outs')
  const fours = screen.getByRole('group', { name: '4 · 네 문양 4장' })
  const nines = screen.getByRole('group', { name: '9 · 네 문양 4장' })
  expect(fours.querySelectorAll('.playing-card')).toHaveLength(4)
  expect(nines.querySelectorAll('.playing-card')).toHaveLength(4)
  expect(within(fours).getByLabelText('하트 4')).toBeVisible()
  expect(within(nines).getByLabelText('하트 9')).toBeVisible()
})

it.each([
  ['p3-5-flush-odds', '약 19%', '약 35%', '약 20%'],
  ['p3-5-open-odds', '약 17%', '약 31%', '약 17%'],
  ['p3-5-gutshot-odds', '약 9%', '약 16%', '약 9%'],
])('%s은 확률을 해당 카드 기회와 함께 표시한다', (id, one, two, river) => {
  show('remaining-chances', id)
  const turnChance = screen.getByRole('group', { name: '플랍에서 다음 턴 1장' })
  const both = screen.getByRole('group', { name: '플랍에서 턴·리버 모두 보기' })
  const last = screen.getByRole('group', { name: '턴에 완성되지 않았을 때' })
  expect(turnChance).toHaveTextContent(one)
  expect(within(turnChance).getByText('턴')).toBeVisible()
  expect(both).toHaveTextContent(two)
  expect(within(both).getByText('턴')).toBeVisible()
  expect(within(both).getByText('리버')).toBeVisible()
  expect(both).toHaveTextContent('턴 또는 리버 중 적어도 한 장')
  expect(last).toHaveTextContent(river)
  expect(within(last).queryByText('턴')).not.toBeInTheDocument()
  expect(within(last).getByText('리버')).toBeVisible()
})

it('겹친 아웃츠는 두 장을 빼는 계산과 실제 두 카드를 함께 보여준다', () => {
  show('draw-cautions', 'p3-6-overlap')
  expect(screen.getByRole('group', { name: '서로 다른 완성 후보' })).toHaveTextContent('9 + 8 − 2 = 15장')
  const overlap = screen.getByRole('group', { name: '두 드로우에 겹치는 카드' })
  expect(overlap.querySelectorAll('.playing-card')).toHaveLength(2)
  expect(within(overlap).getByLabelText('하트 4')).toBeVisible()
  expect(within(overlap).getByLabelText('하트 9')).toBeVisible()
})

it('스트레이트 퀴즈는 제출 전 숫자 힌트나 구성 카드 강조를 보여주지 않는다', () => {
  const view = show('straight-draw', 'p3-3-q1')
  expect(screen.queryByRole('group', { name: '양끝에 필요한 숫자' })).not.toBeInTheDocument()
  expect(view.container.querySelectorAll('.poker-table__highlight')).toHaveLength(0)
  expect(screen.getAllByRole('checkbox')).toHaveLength(4)
})
