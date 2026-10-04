import { part1PracticeQuestions } from './part1Practice'
import { validateCourse } from './validateCourse'

it('38문제의 카드와 정답 ID가 유효하고 서로 다른 문제 ID를 사용한다', () => {
  expect(part1PracticeQuestions).toHaveLength(38)
  expect(new Set(part1PracticeQuestions.map(q => q.id)).size).toBe(38)
  expect(validateCourse({ parts: [], lessons: { practice: { id: 'practice', title: '연습', objective: '검증', steps: part1PracticeQuestions } } })).toEqual([])
  for (const q of part1PracticeQuestions) {
    const cards = q.visual?.kind === 'position' ? q.visual.holeCards! : q.hands!.flatMap(group => group.cards)
    expect(cards.length).toBe(q.lessonId === 'compare-hands' ? 4 : 2)
    expect(new Set(cards.map(c => c.rank + c.suit)).size).toBe(cards.length)
    expect(cards.every(c => ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'].includes(c.rank) && ['spades', 'hearts', 'diamonds', 'clubs'].includes(c.suit))).toBe(true)
  }
})

it('특징 문제의 실제 카드와 복수 정답이 일치한다', () => {
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
  for (const q of part1PracticeQuestions) {
    if (q.type !== 'multi-choice') continue
    const [a, b] = q.hands![0].cards
    const expected: string[] = []
    if (['J', 'Q', 'K', 'A'].includes(a.rank) && ['J', 'Q', 'K', 'A'].includes(b.rank)) expected.push('high')
    if (a.rank === b.rank) expected.push('pair')
    if (a.suit === b.suit) expected.push('suited')
    if (Math.abs(ranks.indexOf(a.rank) - ranks.indexOf(b.rank)) === 1) expected.push('connected')
    expect([...q.correctOptionIds].sort()).toEqual((expected.length ? expected : ['none']).sort())
  }
})

it('비교 정답이 항상 패 A로 고정되지 않고 카드 그룹과 연결된다', () => {
  const first = part1PracticeQuestions.find(q => q.id === 'practice-compare-hands-1')!
  const second = part1PracticeQuestions.find(q => q.id === 'practice-compare-hands-2')!
  expect(first.type === 'single-choice' && first.correctOptionId).toBe('hand-a')
  expect(second.type === 'single-choice' && second.correctOptionId).toBe('hand-b')
  expect(second.hands![1].cards.map(c => c.suit)).toEqual(['hearts', 'hearts'])
})
