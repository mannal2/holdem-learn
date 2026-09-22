import {
  makeCatalogWithDuplicateLessonId,
  makeCatalogWithMissingCorrectOption,
  validCatalog,
} from '../test/courseFixtures'
import { validateCourse } from './validateCourse'

it('정상적인 코스는 오류가 없다', () => {
  expect(validateCourse(validCatalog)).toEqual([])
})

it('중복된 Lesson 식별자를 찾는다', () => {
  const catalog = makeCatalogWithDuplicateLessonId('shared-lesson')
  expect(validateCourse(catalog)).toContain('중복된 Lesson ID: shared-lesson')
})

it('선택형 문제의 정답이 선택지에 없으면 오류를 반환한다', () => {
  const catalog = makeCatalogWithMissingCorrectOption()
  expect(validateCourse(catalog)).toContain(
    'Step sample-question의 정답 missing은 선택지에 없습니다.',
  )
})
