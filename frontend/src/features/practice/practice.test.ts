import { createPracticeSession, getPracticeQuestions, loadPractice, savePractice } from './practice'
import { part2PracticeQuestions } from '../../content/part2Practice'

beforeEach(() => localStorage.clear())

it('페어 위치는 유형별 하나를 출제하고 직전 문제를 제외한다', () => {
  const first = createPracticeSession('pair-types')
  const next = createPracticeSession('pair-types', first.questionIds)
  expect(first.questionIds).toHaveLength(4)
  expect(new Set(getPracticeQuestions(first).map(q => q.concept))).toEqual(new Set(['top', 'middle', 'bottom', 'over']))
  expect(next.questionIds.some(id => first.questionIds.includes(id))).toBe(false)
})

it('각 레슨은 네 문제, 종합 연습은 여섯 개념을 출제한다', () => {
  for (const lesson of ['preflop-to-flop', 'read-current-hand', 'two-pair-and-set', 'board-and-risk']) {
    const session = createPracticeSession(lesson)
    expect(session.questionIds).toHaveLength(4)
    expect(new Set(session.questionIds).size).toBe(4)
  }
  const session = createPracticeSession('flop-reading-challenge')
  expect(session.questionIds).toHaveLength(6)
  expect(new Set(getPracticeQuestions(session).map(q => q.lessonId)).size).toBeGreaterThanOrEqual(4)
})

it('48문제의 실제 카드는 중복되지 않고 정답은 보기 안에 있다', () => {
  expect(part2PracticeQuestions).toHaveLength(48)
  expect(new Set(part2PracticeQuestions.map(q => q.id)).size).toBe(48)
  for (const q of part2PracticeQuestions) {
    const cards = [...q.table!.holeCards, ...q.table!.communityCards]
    expect(new Set(cards.map(c => c.rank + c.suit)).size).toBe(5)
    expect(q.options.some(o => o.id === q.correctOptionId)).toBe(true)
    expect(q.table!.highlightedCards!.every(c => cards.some(actual => actual.rank === c.rank && actual.suit === c.suit))).toBe(true)
  }
})

it('저장 후 문제와 보기 순서, 제출 전 선택을 그대로 복원한다', () => {
  const session = createPracticeSession('pair-types')
  session.progress.selectedOptionIds = [session.optionOrders[session.questionIds[0]][0]]
  session.progress.selectionsByStep = { 0: session.progress.selectedOptionIds }
  const data = { version: 1 as const, sessions: { 'pair-types': session }, results: {} }
  savePractice(data)
  expect(loadPractice().data).toEqual(data)
  expect(localStorage.getItem('holdem-learning-progress')).toBeNull()
})

it('깨진 연습 저장은 안내하고 레슨 저장은 건드리지 않는다', () => {
  localStorage.setItem('holdem-learning-progress', 'lesson-progress')
  localStorage.setItem('holdem-practice-progress', '{broken')
  expect(loadPractice().recovered).toBe(true)
  expect(localStorage.getItem('holdem-learning-progress')).toBe('lesson-progress')
})

it('출제 수보다 짧은 저장 회차는 복원하지 않는다', () => {
  const session = createPracticeSession('pair-types')
  session.questionIds.pop()
  localStorage.setItem('holdem-practice-progress', JSON.stringify({ version: 1, sessions: { 'pair-types': session }, results: {} }))
  expect(loadPractice().recovered).toBe(true)
})

it('저장이 차단되면 실패를 반환한다', () => {
  const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => { throw new Error('quota exceeded') })
  expect(savePractice({ version: 1, sessions: {}, results: {} })).toBe(false)
  spy.mockRestore()
})

it('실제 다섯 장의 족보와 저작된 정답이 일치한다', () => {
  const rankOrder = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
  for (const q of part2PracticeQuestions) {
    const { holeCards, communityCards } = q.table!
    const cards = [...holeCards, ...communityCards]
    const values = cards.map(c => rankOrder.indexOf(c.rank) + 2).sort((a, b) => a - b)
    const counts = values.map(v => values.filter(x => x === v).length)
    const pairs = new Set(values.filter((_, i) => counts[i] === 2))
    const straight = new Set(values).size === 5 && (values[4] - values[0] === 4 || values.join(',') === '2,3,4,5,14')
    const flush = cards.every(c => c.suit === cards[0].suit)
    const actual = flush ? '플러시' : straight ? '스트레이트' : counts.includes(3) ? '트리플' : pairs.size === 2 ? '투 페어' : pairs.size === 1 ? '원 페어' : '하이 카드'
    const answer = q.options.find(o => o.id === q.correctOptionId)!.label
    if (q.lessonId === 'pair-types') {
      expect(actual).toBe('원 페어')
      const pairedRank = [...pairs][0]
      const board = communityCards.map(c => rankOrder.indexOf(c.rank) + 2).sort((a, b) => b - a)
      const position = pairedRank > board[0] ? '오버페어' : pairedRank === board[0] ? '탑 페어' : pairedRank === board[1] ? '미들 페어' : '바텀 페어'
      expect(answer).toBe(position)
    } else if (q.lessonId === 'board-and-risk') {
      expect(actual).toBe('원 페어')
      if (q.concept === 'shared') expect(new Set(communityCards.map(c => c.rank)).size).toBe(2)
      if (q.concept === 'flush-risk') expect(new Set(communityCards.map(c => c.suit)).size).toBe(1)
    } else {
      expect(answer === '셋' ? '트리플' : answer).toBe(actual)
      if (answer === '셋') expect(holeCards[0].rank).toBe(holeCards[1].rank)
    }
  }
})
