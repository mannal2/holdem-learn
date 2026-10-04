import { render, screen, cleanup } from '@testing-library/react'
import { part3PracticeQuestions } from './part3Practice'
import { validateCourse } from './validateCourse'
import { LearningStepRenderer } from '../features/learning/LearningStepRenderer'
import type { PlayingCard } from '../types/cards'

const question = (n: number) => part3PracticeQuestions.find(q => q.id === `p3-practice-${String(n).padStart(2, '0')}`)!
const draw = (n: number, feedbackVisible = false) => render(<LearningStepRenderer step={question(n)} selectedOptionIds={[]} feedbackVisible={feedbackVisible} onSelect={() => {}} />)

it('60문제의 실제 카드·정답·공개 단계·강조가 유효하다', () => {
  expect(part3PracticeQuestions).toHaveLength(60)
  expect(validateCourse({ parts: [], lessons: { practice: { id: 'practice', title: '', objective: '', steps: part3PracticeQuestions } } })).toEqual([])
  const cases = new Set<string>()
  for (const q of part3PracticeQuestions) {
    const ids = q.options.map(o => o.id)
    expect(new Set(ids).size).toBe(ids.length)
    if (!q.table) continue
    const table = q.table
    expect(table.communityCards).toHaveLength({ flop: 3, turn: 4, river: 5 }[table.stage as 'flop' | 'turn' | 'river'])
    const all = [...table.holeCards, ...table.communityCards, ...table.opponentCards ?? []]
    const key = JSON.stringify([table.holeCards, table.communityCards])
    expect(cases.has(key)).toBe(false)
    cases.add(key)
    for (const card of table.highlightedCards ?? []) expect(all).toContainEqual(card)
  }
})

it.each(part3PracticeQuestions)('$id는 필요한 해설만 제출 후 표시하고 정답 강조를 미리 노출하지 않는다', q => {
    const view = render(<LearningStepRenderer step={q} selectedOptionIds={[]} feedbackVisible={false} onSelect={() => {}} />)
    expect(view.container.querySelectorAll('.poker-table__highlight')).toHaveLength(0)
    expect(screen.queryByRole('group', { name: '정답 근거' })).not.toBeInTheDocument()
    view.rerender(<LearningStepRenderer step={q} selectedOptionIds={[]} feedbackVisible onSelect={() => {}} />)
    if (q.id === 'p3-practice-59') expect(screen.queryByRole('group', { name: '정답 근거' })).not.toBeInTheDocument()
    else expect(screen.getByRole('group', { name: '정답 근거' })).toBeInTheDocument()
    cleanup()
})

it('상대 예시는 제출 후 공개하지만 두 사람을 비교하는 문제는 처음부터 공개한다', () => {
  const view = draw(53)
  expect(screen.queryByRole('group', { name: '가정한 상대 카드' })).not.toBeInTheDocument()
  view.rerender(<LearningStepRenderer step={question(53)} selectedOptionIds={[]} feedbackVisible onSelect={() => {}} />)
  expect(screen.getByRole('group', { name: '가정한 상대 카드' }).querySelectorAll('.playing-card')).toHaveLength(2)
  cleanup()
  draw(56)
  expect(screen.getByRole('group', { name: '가정한 상대 카드' })).toBeInTheDocument()
})

it('제출 후 상대 카드가 내 카드와 중복되면 콘텐츠 검증에서 거부한다', () => {
  const q = question(53)
  const invalid = { ...q, table: { ...q.table!, feedbackOpponentCards: q.table!.holeCards } }
  expect(validateCourse({ parts: [], lessons: { practice: { id: 'practice', title: '', objective: '', steps: [invalid] } } })).toContain(`Step ${q.id}에 중복 카드가 있습니다.`)
})

it('해설 후보 묶음 안의 중복 카드를 콘텐츠 검증에서 거부한다', () => {
  const q = question(57)
  const c = q.feedbackCardGroups![0].cards[0]
  const invalid = { ...q, feedbackCardGroups: [{ label: '중복 후보', cards: [c, c] }] }
  expect(validateCourse({ parts: [], lessons: { practice: { id: 'practice', title: '', objective: '', steps: [invalid] } } })).toContain(`Step ${q.id}의 중복 후보 묶음에 중복 카드가 있습니다.`)
})

it('중복 후보는 실제 공용카드에 올리지 않고 별도 카드 묶음에서 보여준다', () => {
  const view = draw(57)
  expect(screen.queryByRole('group', { name: '겹치는 후보 · 한 번만 세기' })).not.toBeInTheDocument()
  view.rerender(<LearningStepRenderer step={question(57)} selectedOptionIds={[]} feedbackVisible onSelect={() => {}} />)
  expect(screen.getByRole('group', { name: '공용 카드' }).querySelectorAll('.playing-card')).toHaveLength(3)
  expect(screen.getByRole('group', { name: '겹치는 후보 · 한 번만 세기' }).querySelectorAll('.playing-card')).toHaveLength(2)
  expect(screen.getByText('9 + 8 − 2 = 15장')).toBeInTheDocument()
})

it('기회 비교는 제출 전부터 두 상황을 같은 디자인으로 보여준다', () => {
  draw(45)
  const a = screen.getByRole('group', { name: 'A · 플랍에서 두 장 모두 보기' })
  const b = screen.getByRole('group', { name: 'B · 턴에 빗나간 뒤' })
  expect(a.querySelectorAll('.draw-chance__card')).toHaveLength(2)
  expect(b.querySelectorAll('.draw-chance__card')).toHaveLength(1)
  expect(screen.queryByRole('group', { name: '정답 근거' })).not.toBeInTheDocument()
})

it('원 페어와 드로우가 함께 있으면 같은 무늬 네 장만 강조해 완성 다섯 장과 구분한다', () => {
  for (const [n, suit] of [[5, 'spades'], [7, 'hearts'], [8, 'clubs']] as const) {
    const q = question(n)
    expect(q.table!.highlightedCards).toHaveLength(4)
    expect(q.table!.highlightedCards!.every(c => c.suit === suit)).toBe(true)
  }
  draw(5, true)
  expect(screen.getByText('A 원 페어 + 스페이드 4장')).toBeInTheDocument()
  expect(screen.queryByText('A 원 페어 + 하트 4장')).not.toBeInTheDocument()
})

it('해설에서도 원래 조건을 유지하고 중복 후보 두 목록의 관계를 보여준다', () => {
  draw(49, true)
  expect(screen.getByLabelText('이번 상황의 조건')).toHaveTextContent('아웃츠 유지')
  expect(screen.getByLabelText('이번 상황의 조건')).toHaveTextContent('추가 공개 정보 없음')
  cleanup()
  draw(57, true)
  expect(screen.getByRole('group', { name: '플러시 완성 후보 · 9장' }).querySelectorAll('.playing-card')).toHaveLength(9)
  expect(screen.getByRole('group', { name: '스트레이트 완성 후보 · 8장' }).querySelectorAll('.playing-card')).toHaveLength(8)
  expect(screen.getByRole('group', { name: '플러시 완성 후보 · 9장' }).querySelectorAll('.poker-table__highlight')).toHaveLength(2)
})

it('K♠를 한 번 세는 문제는 반복 목록·보조 문구 없이 짧은 해설만 제공한다', () => {
  const view = draw(59, true)
  expect(view.container.querySelectorAll('.lesson-card-group, .rule-illustration')).toHaveLength(0)
  expect(question(59).explanation).toBe('두 드로우를 모두 완성해도 K♠는 실제 카드 한 장이므로 한 번만 세어요.')
  expect(screen.getByRole('group', { name: '공용 카드' }).querySelectorAll('.playing-card')).toHaveLength(3)
})

it('무승부는 상대 개인 카드도 같은 최종 족보의 구성 카드로 강조한다', () => {
  draw(56, true)
  expect(screen.getByRole('group', { name: '가정한 상대 카드' }).querySelectorAll('.poker-table__highlight')).toHaveLength(2)
})

const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const
it('제출 후 후보 카드도 유효한 숫자·무늬이며 실제 보드와 중복되지 않는다', () => {
  for (const q of part3PracticeQuestions) {
    const actual = q.table ? [...q.table.holeCards, ...q.table.communityCards] : []
    for (const group of q.feedbackCardGroups ?? []) {
      expect(new Set(group.cards.map(c => c.rank + c.suit)).size).toBe(group.cards.length)
      for (const card of group.cards) {
        expect(ranks).toContain(card.rank)
        expect(['spades', 'hearts', 'diamonds', 'clubs']).toContain(card.suit)
        expect(actual).not.toContainEqual(card)
      }
    }
  }
})
const deck: PlayingCard[] = ['spades', 'hearts', 'diamonds', 'clubs'].flatMap(suit => ranks.map(rank => ({ rank, suit: suit as PlayingCard['suit'] })))
function straight(cards: PlayingCard[]) {
  const values = new Set(cards.map(c => ranks.indexOf(c.rank) + 2))
  if (values.has(14)) values.add(1)
  return Array.from({ length: 10 }, (_, n) => n + 1).some(n => [0, 1, 2, 3, 4].every(d => values.has(n + d)))
}
const flush = (cards: PlayingCard[]) => cards.some(c => cards.filter(x => x.suit === c.suit).length >= 5)

it.each([[29, 9], [30, 9], [31, 9], [32, 9], [33, 8], [34, 8], [35, 8], [36, 8], [37, 4], [38, 4], [39, 4], [40, 4], [57, 15], [58, 12]])('문제 %i의 다음 카드 완성 후보는 %i장이다', (n, expected) => {
  const q = question(n)
  const known = [...q.table!.holeCards, ...q.table!.communityCards]
  const available = deck.filter(c => !known.some(x => x.rank === c.rank && x.suit === c.suit))
  const count = available.filter(c => n < 33 ? flush([...known, c]) : n < 41 ? straight([...known, c]) : flush([...known, c]) || straight([...known, c])).length
  expect(count).toBe(expected)
  expect(q.type === 'single-choice' && q.options.find(o => o.id === q.correctOptionId)?.label).toBe(`${expected}장`)
})
