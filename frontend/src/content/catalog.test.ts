import { courseCatalog, getNextPartId } from './catalog'
import { validateCourse } from './validateCourse'

it('Part 0과 Part 1을 합친 전체 코스에 검증 오류가 없다', () => { expect(validateCourse(courseCatalog)).toEqual([]) })
it('Part 0 다음 추천 Part는 Part 1이다', () => { expect(getNextPartId(courseCatalog, 'part-0')).toBe('part-1') })
