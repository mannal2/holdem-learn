import { render, screen, within } from '@testing-library/react'
import { part0Lessons } from '../../content/part0'
import { LearningStepRenderer } from './LearningStepRenderer'

function show(lesson: string, index: number, feedbackVisible = false) {
  return render(<LearningStepRenderer step={part0Lessons[lesson].steps[index]} selectedOptionIds={[]} feedbackVisible={feedbackVisible} onSelect={() => {}} />)
}

it('자리 번호 안내는 첫 설명에만 표시하고 이후 문제와 요약에서는 반복하지 않는다', () => {
  const lesson = part0Lessons['blinds-and-order']
  const view = show('blinds-and-order', 0)
  expect(screen.getByText(/번호는 자리 구분용/)).toBeInTheDocument()
  for (const step of lesson.steps.slice(1)) {
    for (const feedbackVisible of [false, true]) {
      view.rerender(<LearningStepRenderer step={step} selectedOptionIds={[]} feedbackVisible={feedbackVisible} onSelect={() => {}} />)
      expect(screen.queryByText(/번호는 자리 구분용/)).not.toBeInTheDocument()
    }
  }
})

it('개인 카드 소개는 공용 카드 없이 내 카드 두 장을 보여준다', () => {
  show('goal-and-cards', 0)
  expect(screen.getByRole('group', { name: '내 개인 카드' }).querySelectorAll('.playing-card')).toHaveLength(2)
  expect(screen.queryByRole('group', { name: '공용 카드' })).not.toBeInTheDocument()
})

it('공용 카드 소개는 플랍 세 장과 턴·리버 한 장을 구분한다', () => {
  show('goal-and-cards', 1)
  for (const [name, count] of [['플랍 · 처음 3장', 3], ['턴 · 1장 추가', 1], ['리버 · 1장 추가', 1]] as const) {
    expect(screen.getByRole('group', { name }).querySelectorAll('.playing-card')).toHaveLength(count)
  }
})

it('최종 다섯 장의 근거는 제출 후에만 전체 카드 배치에서 강조한다', () => {
  const view = show('goal-and-cards', 2)
  expect(document.querySelectorAll('.poker-table__highlight')).toHaveLength(0)
  view.rerender(<LearningStepRenderer step={part0Lessons['goal-and-cards'].steps[2]} selectedOptionIds={['five']} feedbackVisible onSelect={() => {}} />)
  expect(screen.getByRole('group', { name: '공용 카드' }).querySelectorAll('.playing-card')).toHaveLength(5)
  expect(document.querySelectorAll('.poker-table__highlight')).toHaveLength(5)
  expect(screen.getByLabelText('강조한 5장: 스페이드 A, 하트 K, 다이아몬드 J, 클로버 Q, 하트 10')).toBeInTheDocument()
})

it('행동 소개는 칩을 맞출 상황과 먼저 거는 상황을 나눠 보여준다', () => {
  show('player-actions', 0)
  expect(within(screen.getByRole('group', { name: '먼저 베팅한 사람이 없음' })).getByText('체크')).toBeInTheDocument()
  expect(within(screen.getByRole('group', { name: '상대는 10칩을 걸었고, 나는 아직 칩을 내지 않았어요' })).getByText('콜')).toBeInTheDocument()
})

it('폴드 그림은 기존 카드 뒷면 두 장을 사용하고 카드 값은 공개하지 않는다', () => {
  show('player-actions', 0)
  const fold = screen.getByText('폴드', { exact: true }).parentElement!
  expect(fold.querySelectorAll('.playing-card--hidden')).toHaveLength(2)
  expect(within(fold).queryByLabelText('스페이드 에이스')).not.toBeInTheDocument()
  expect(within(fold).getByText('×')).toBeInTheDocument()
})

it.each([[1, '플레이어 4'], [2, 'SB']] as const)('행동 순서 화면 %s는 같은 여섯 자리에서 시작 위치를 표시한다', (index, seat) => {
  show('blinds-and-order', index, index === 2)
  const first = screen.getByRole('group', { name: `${seat} · 먼저 행동` })
  expect(first).toHaveTextContent('먼저 행동')
  expect(screen.getByRole('group', { name: '6인 테이블 자리' }).querySelectorAll('.rule-seat')).toHaveLength(6)
})

it.each([2, 3])('공개 단계 %s에는 새 카드 표시 한 개만 추가하며 족보 강조로 표시하지 않는다', index => {
  show('hand-stages', index)
  expect(screen.getAllByText('이번에 공개')).toHaveLength(1)
  expect(document.querySelectorAll('.poker-table__highlight')).toHaveLength(0)
})

it.each([2, 3])('모의 행동 문제 %s는 상황만 보여주고 행동 이름을 그림에 적지 않는다', index => {
  show('guided-hand', index)
  expect(document.querySelectorAll('.rule-action')).toHaveLength(0)
  expect(screen.getByRole('group', { name: index === 2 ? '먼저 베팅한 사람이 없음' : '상대는 10칩을 걸었고, 나는 아직 칩을 내지 않았어요' })).toBeInTheDocument()
})

it('새 카드 표시를 요청하지 않은 테이블은 기존 모습 그대로다', () => {
  show('hand-stages', 1)
  expect(screen.queryByText('이번에 공개')).not.toBeInTheDocument()
})
