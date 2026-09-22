import { makeCatalog } from '../test/courseFixtures'
import { validateCourse } from './validateCourse'
import { part0, part0Lessons } from './part0'

it('Part 0은 정해진 순서의 여섯 Lesson을 가진다', () => {
  expect(part0.lessonIds).toEqual(['goal-and-cards', 'hand-rankings', 'hand-stages', 'player-actions', 'blinds-and-order', 'guided-hand'])
})
it('모의 한 판은 80% 통과 기준과 다섯 문제를 가진다', () => {
  const lesson = part0Lessons['guided-hand']; expect(lesson.passingPercentage).toBe(80); expect(lesson.steps.filter((step) => step.type === 'single-choice' || step.type === 'multi-choice')).toHaveLength(5)
})
it('Part 0 콘텐츠 검증 오류가 없다', () => { expect(validateCourse(makeCatalog(part0, part0Lessons))).toEqual([]) })
