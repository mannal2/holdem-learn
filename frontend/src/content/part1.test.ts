import { makeCatalog } from '../test/courseFixtures'
import { validateCourse } from './validateCourse'
import { part1, part1Lessons } from './part1'

it('Part 1은 정해진 순서의 여덟 Lesson을 가진다', () => {
  expect(part1.lessonIds).toEqual([
    'hand-notation',
    'hand-properties',
    'identify-properties',
    'compare-hands',
    'classify-strength',
    'understand-position',
    'same-hand-different-position',
    'starting-hand-challenge',
  ])
})

it('종합 도전은 카드 특징과 포지션 문제 다섯 개로 구성된다', () => {
  const challenge = part1Lessons['starting-hand-challenge']
  expect(challenge.passingPercentage).toBe(80)
  expect(challenge.steps.filter((step) => step.type === 'single-choice' || step.type === 'multi-choice')).toHaveLength(5)
})

it('Part 1 콘텐츠 검증 오류가 없다', () => {
  expect(validateCourse(makeCatalog(part1, part1Lessons))).toEqual([])
})
