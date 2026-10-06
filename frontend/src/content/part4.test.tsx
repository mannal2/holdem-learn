import { cleanup, render, screen } from '@testing-library/react'
import { part4, part4Lessons } from './part4'
import { courseCatalog } from './catalog'
import { validateCourse } from './validateCourse'
import { LearningStepRenderer } from '../features/learning/LearningStepRenderer'
import { evaluateAnswer } from '../features/learning/evaluateAnswer'
import { hasPassed } from '../features/learning/calculateResult'
import type { RangeSceneVisual } from '../types/course'

const steps = Object.values(part4Lessons).flatMap(lesson => lesson.steps)
const questions = steps.filter(step => step.type === 'single-choice' || step.type === 'multi-choice')
const question = (n: number) => questions.find(step => step.id.startsWith(`p4-seq-q${String(n).padStart(2, '0')}-v`))!
const draw = (n: number, submitted = false) => render(<LearningStepRenderer step={question(n)} selectedOptionIds={[]} feedbackVisible={submitted} onSelect={() => {}} />)
const scene = (n: number) => question(n)?.visual as RangeSceneVisual

it('승인한 7레슨·48화면·31문제를 유효한 카탈로그로 제공한다', () => {
  expect(validateCourse(courseCatalog)).toEqual([])
  expect(part4.lessonIds.map(id => part4Lessons[id].steps.length)).toEqual([8, 5, 7, 4, 4, 6, 14])
  expect(steps).toHaveLength(48)
  expect(questions).toHaveLength(31)
})

it('31문제의 채점은 승인한 독립 정답 기준과 일치한다', () => {
  const answers = [[1], [2], [0, 2, 3], [0], [1], [2], [2], [1, 2, 3], [0], [1], [2], [0], [1], [2], [0], [1], [1, 2], [0], [2], [1], [2], [0], [1], [0], [2], [1], [0], [2], [0, 1, 2], [0], [1]]
  expect(questions.length).toBe(answers.length)
  answers.forEach((indices, index) => {
    const step = question(index + 1)
    expect(step, `Q${index + 1}`).toBeDefined()
    expect(evaluateAnswer(step, indices.map(i => step.options[i].id)).isCorrect).toBe(true)
    expect(evaluateAnswer(step, []).isCorrect).toBe(false)
  })
})

it('같은 후보를 유지하고 플랍·턴·리버를 순서대로 공개한다', () => {
  expect(scene(4)?.candidates.map(c => c.cards)).toEqual([
    [{ rank: '8', suit: 'clubs' }, { rank: '8', suit: 'diamonds' }],
    [{ rank: 'A', suit: 'hearts' }, { rank: 'K', suit: 'diamonds' }],
    [{ rank: 'A', suit: 'spades' }, { rank: 'J', suit: 'spades' }],
    [{ rank: 'A', suit: 'clubs' }, { rank: 'J', suit: 'diamonds' }],
  ])
  for (const n of [5, 6, 8, 9, 10, 11, 12, 13, 14, 15]) expect(scene(n).candidates.map(c => c.cards)).toEqual(scene(4).candidates.map(c => c.cards))
  expect(scene(9).board).toHaveLength(3)
  expect(scene(11).board).toEqual([...scene(9).board, { rank: '2', suit: 'hearts' }])
  expect(scene(14).board).toEqual([...scene(11).board, { rank: 'Q', suit: 'spades' }])
  expect(scene(9).bet).toEqual({ pot: 13, bet: 8 })
  expect(scene(11).bet).toEqual({ pot: 29, bet: 20 })
  expect(scene(14).bet).toEqual({ pot: 69, bet: 52 })
  expect(scene(10).history?.join(' ')).not.toContain('20칩 베팅')
})

it('종합은 새 핸드 세 개를 각각 프리플랍부터 리버까지 연결한다', () => {
  expect(question(20)).toBeDefined()
  for (const start of [20, 24, 28]) {
    const scenes = [0, 1, 2, 3].map(offset => scene(start + offset))
    expect(scenes.map(s => s.board.length)).toEqual([0, 3, 4, 5])
    expect(scenes[0].candidates).toHaveLength(0)
    expect(scenes[2].board.slice(0, 3)).toEqual(scenes[1].board)
    expect(scenes[3].board.slice(0, 4)).toEqual(scenes[2].board)
    expect(scenes[3].candidates.map(c => c.cards)).toEqual(scenes[1].candidates.map(c => c.cards))
    expect(scenes[1].board).not.toEqual(scene(4).board)
  }
  expect(scene(30).bet).toBeUndefined()
  expect(question(30).conditions?.join(' ')).toContain('버튼 12칩 베팅 · 상대 BB 레이즈 · 이번 베팅 총액 36칩')
  expect(scene(31).bet).toEqual({ pot: 101, bet: 60 })
  expect(scene(31).history?.join(' ')).toContain('상대 BB')
})

it.each(Array.from({ length: 31 }, (_, i) => i + 1))('Q%i 제출 전에는 정답 상태·강조를 노출하지 않는다', n => {
  expect(question(n)).toBeDefined()
  const view = draw(n)
  expect(view.container.querySelector('.poker-table__highlight')).toBeNull()
  expect(view.container.querySelector('.range-candidate__status')).toBeNull()
  cleanup()
})

it('턴 해설은 낮아짐·유지의 근거와 같은 팟을 보여준다', () => {
  expect(question(11)).toBeDefined()
  draw(11, true)
  expect(screen.getByRole('group', { name: '후보 D' })).toHaveTextContent('가능성 ↓')
  expect(screen.getByRole('group', { name: '후보 A' })).toHaveTextContent('판단 유지')
  expect(screen.getByRole('group', { name: '이번 베팅' })).toHaveTextContent('29칩')
  expect(question(11).conditions?.join(' ')).toContain('플랍·턴 연속 베팅')
})

it('리버 완성은 네 후보를 유지하며 플러시 다섯 장을 강조한다', () => {
  expect(question(13)).toBeDefined()
  draw(13, true)
  expect(screen.getAllByRole('group', { name: /^후보 / })).toHaveLength(4)
  expect(document.querySelectorAll('.poker-table__highlight')).toHaveLength(5)
  expect(screen.getByText('리버 · 추가')).toBeVisible()
  expect(screen.queryByRole('group', { name: '내 개인 카드' })).not.toBeInTheDocument()
})

it('종합은 9/12 미통과·10/12 통과다', () => {
  const lesson = part4Lessons['range-hand-challenge']
  expect(lesson).toBeDefined()
  expect(hasPassed(9, 12, lesson.passingPercentage!)).toBe(false)
  expect(hasPassed(10, 12, lesson.passingPercentage!)).toBe(true)
})

it.each([20, 24])('Q%i 프리플랍 조건은 앞으로의 공격 지속·약화를 예고하지 않는다', n => {
  const view = draw(n)
  expect(view.container).not.toHaveTextContent(/끝까지 공격|공격이 약해지/)
  cleanup()
})

it('후보 충돌·잘못된 강조·금액·공개 단계 오류를 계속 거부한다', () => {
  const step = question(14)
  const original = scene(14)
  const check = (visual: RangeSceneVisual) => validateCourse({ parts: [], lessons: { test: { id: 'test', title: '', objective: '', steps: [{ ...step, visual }] } } })
  expect(check({ ...original, candidates: [{ label: '충돌', cards: [original.board[0], original.candidates[0].cards[0]] }] })).not.toEqual([])
  expect(check({ ...original, boardHighlights: [{ rank: '2', suit: 'clubs' }] })).not.toEqual([])
  expect(check({ ...original, bet: { pot: 0, bet: 52 } })).not.toEqual([])
  expect(check({ ...original, stage: 'flop' })).not.toEqual([])
})

it('개념 설명은 판단 방법만 가르치고 별도 카드 예시는 원래 후보 문제 뒤에 나온다', () => {
  const flop = part4Lessons['range-flop'].steps
  expect(flop.findIndex(step => step.id === 'p4-seq-2-both')).toBeGreaterThan(flop.findIndex(step => step.id === question(6).id))
  for (const id of ['p4-seq-3-size', 'p4-seq-3-reasons', 'p4-seq-3-uncertainty']) {
    const step = steps.find(step => step.id === id)!
    expect(step.type).toBe('explanation')
    const view = render(<LearningStepRenderer step={step} selectedOptionIds={[]} feedbackVisible={false} onSelect={() => {}} />)
    expect(view.container.querySelector('.range-candidate')).toBeNull()
    expect(view.container).not.toHaveTextContent(/13칩|80칩|A·B|C는|D는/)
    cleanup()
  }
})

it('문장 길이만으로 종합 도전을 통과하지 못하고 단일 정답 위치가 고르게 배분된다', () => {
  const positions = [0, 0, 0]
  let longestCorrect = 0
  for (const step of questions) {
    if (step.type !== 'single-choice') continue
    const index = step.options.findIndex(option => option.id === step.correctOptionId)
    positions[index]++
    const lengths = step.options.map(option => option.label.replace(/\s/g, '').length)
    if (lengths[index] === Math.max(...lengths) && lengths.filter(length => length === lengths[index]).length === 1) longestCorrect++
  }
  expect(positions).toEqual([9, 9, 9])
  expect(longestCorrect).toBeLessThanOrEqual(5)
  const challenge = part4Lessons['range-hand-challenge']
  const bestLongestScore = challenge.steps.filter(step => {
    if (step.type !== 'single-choice' && step.type !== 'multi-choice') return false
    const longest = Math.max(...step.options.map(option => option.label.replace(/\s/g, '').length))
    const keys = step.type === 'single-choice' ? [step.correctOptionId] : step.correctOptionIds
    return keys.every(id => step.options.find(option => option.id === id)!.label.replace(/\s/g, '').length === longest)
  }).length
  expect(hasPassed(bestLongestScore, 12, challenge.passingPercentage!)).toBe(false)
})

it('성향 적용 문제는 큰 행동의 범위와 직접 드로우의 뜻을 제공한다', () => {
  for (const n of [11, 12, 22]) expect(question(n).conditions?.join(' ')).toContain('한 장으로 완성할')
  for (const n of [14, 15, 23]) expect(question(n).conditions?.join(' ')).toContain('이번 리버 베팅은 큰 베팅에 해당')
  for (const n of [18, 30]) expect(question(n).conditions?.join(' ')).toContain('이번 턴 레이즈는 큰 레이즈에 해당')
  expect(question(28).conditions?.join(' ')).toContain('콜 성향은 아직 모름')
})

it('상대 BB의 행동만 강조하고 버튼 행동·팟 정보·선택지는 강조하지 않는다', () => {
  const view = draw(31)
  const history = screen.getByRole('group', { name: '지금까지의 행동' })
  const highlighted = Array.from(history.querySelectorAll('strong')).map(element => element.textContent?.trim())
  expect(highlighted).toEqual(['상대 BB가 4칩 추가 콜', '상대 BB 체크', '상대 BB 콜', '상대 BB 체크', '상대 BB 총 36칩으로 레이즈', '상대 BB 60칩 베팅'])
  expect(view.container.querySelector('fieldset strong')).toBeNull()
  expect(highlighted.join(' ')).not.toMatch(/버튼|팟/)
})

it('변형 B의 상대 체크를 강조하며 행동 비교 예시는 그대로 둔다', () => {
  draw(17)
  const history = screen.getByRole('group', { name: '지금까지의 행동' })
  expect(Array.from(history.querySelectorAll('strong')).map(element => element.textContent?.trim())).toEqual([
    '상대 버튼이 총 6칩으로 첫 레이즈', '상대 버튼 8칩 베팅', '상대 버튼 체크', '상대 버튼 체크',
  ])
  cleanup()
  const step = steps.find(step => step.id === 'p4-seq-1-reraise')!
  const view = render(<LearningStepRenderer step={step} selectedOptionIds={[]} feedbackVisible={false} onSelect={() => {}} />)
  expect(view.container.querySelector('.range-history strong')).toBeNull()
})
