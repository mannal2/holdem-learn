import { render, screen, within } from '@testing-library/react'
import { part2Lessons } from '../../content/part2'
import { LearningStepRenderer } from './LearningStepRenderer'

it('위험 비교 문제는 특정 플랍 그림 없이 두 보기를 동등하게 제시한다', () => {
  const step = part2Lessons['board-and-risk'].steps[4]
  render(<LearningStepRenderer step={step} selectedOptionIds={[]} feedbackVisible={false} onSelect={() => {}} />)
  expect(screen.queryByRole('group', { name: '공용 카드' })).not.toBeInTheDocument()
  expect(screen.queryByRole('group', { name: '내 개인 카드' })).not.toBeInTheDocument()
  expect(screen.getByRole('radio', { name: '7♣ 4♦ 2♠' })).toBeInTheDocument()
  expect(screen.getByRole('radio', { name: '9♣ 8♣ 7♣' })).toBeInTheDocument()
})

function show(lesson: string, index = 0) {
  return render(<LearningStepRenderer step={part2Lessons[lesson].steps[index]} selectedOptionIds={[]} feedbackVisible={false} onSelect={() => {}} />)
}

it('시작 패 소개는 공용 카드 없이 기존 AKs 두 장을 보여준다', () => {
  show('preflop-to-flop')
  expect(screen.getByLabelText('스페이드 에이스')).toBeInTheDocument()
  expect(screen.getByLabelText('스페이드 킹')).toBeInTheDocument()
  expect(screen.queryByRole('group', { name: '공용 카드' })).not.toBeInTheDocument()
})

it.each(['read-current-hand', 'two-pair-and-set'])('%s 설명에서도 공용 세 장과 개인 두 장을 구분한다', lesson => {
  show(lesson)
  expect(screen.getByRole('group', { name: '공용 카드' }).querySelectorAll('.playing-card')).toHaveLength(3)
  expect(screen.getByRole('group', { name: '내 개인 카드' }).querySelectorAll('.playing-card')).toHaveLength(2)
})

it('셋 소개는 내 8 두 장과 공용 8 한 장만 강조한다', () => {
  const view = show('two-pair-and-set')
  expect(view.container.querySelectorAll('.poker-table__highlight')).toHaveLength(3)
  expect(screen.getByRole('group', { name: '내 개인 카드' }).querySelectorAll('.poker-table__highlight')).toHaveLength(2)
  expect(screen.getByRole('group', { name: '공용 카드' }).querySelectorAll('.poker-table__highlight')).toHaveLength(1)
})

it('페어 위치 설명은 공용 카드 각각에 높은·가운데·낮은 위치를 붙인다', () => {
  show('pair-types')
  for (const [name, card] of [['탑 · 가장 높음', '하트 킹'], ['미들 · 가운데', '다이아몬드 8'], ['바텀 · 가장 낮음', '스페이드 2']]) {
    expect(within(screen.getByRole('group', { name })).getByLabelText(card)).toBeInTheDocument()
  }
})
