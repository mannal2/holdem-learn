import { calculatePercentage, hasPassed } from './calculateResult'

it('5문제 중 4문제는 80% 기준을 통과한다', () => { expect(hasPassed(4, 5, 80)).toBe(true) })
it('5문제 중 3문제는 80% 기준을 통과하지 못한다', () => { expect(hasPassed(3, 5, 80)).toBe(false) })
it('답한 문제가 없으면 점수는 0이다', () => { expect(calculatePercentage(0, 0)).toBe(0) })
