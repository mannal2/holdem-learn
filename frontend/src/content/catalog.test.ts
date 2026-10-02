import { courseCatalog, getNextPartId } from './catalog'
import { validateCourse } from './validateCourse'

it('Part 0과 Part 1을 합친 전체 코스에 검증 오류가 없다', () => { expect(validateCourse(courseCatalog)).toEqual([]) })
it('Part 0 다음 추천 Part는 Part 1이다', () => { expect(getNextPartId(courseCatalog, 'part-0')).toBe('part-1') })
it('Part 1 다음에 여섯 레슨으로 구성된 Part 2가 이어진다', () => {
  expect(getNextPartId(courseCatalog, 'part-1')).toBe('part-2')
  expect(courseCatalog.parts.find((part) => part.id === 'part-2')?.lessonIds).toHaveLength(6)
})

it('Part 2 종합 도전은 앞 레슨과 다른 플랍 여섯 개를 사용한다', () => {
  const part = courseCatalog.parts.find((item) => item.id === 'part-2')
  expect(part).toBeDefined()
  if (!part) return
  const scenario = (holeCards: unknown, communityCards: unknown) => JSON.stringify([holeCards, (communityCards as unknown[]).slice(0, 3)])
  const practice = new Set(part.lessonIds.slice(0, -1).flatMap((id) => courseCatalog.lessons[id].steps.flatMap((step) => {
    if (step.type === 'table-reveal') return [scenario(step.holeCards, step.communityCards)]
    if ((step.type === 'single-choice' || step.type === 'multi-choice') && step.table) return [scenario(step.table.holeCards, step.table.communityCards)]
    return []
  })))
  const challenge = courseCatalog.lessons[part.lessonIds.at(-1)!]
  const questions = challenge.steps.filter((step) => step.type === 'single-choice' || step.type === 'multi-choice')
  expect(challenge.passingPercentage).toBe(80)
  expect(questions).toHaveLength(6)
  const challengeScenarios = questions.map((step) => step.table && scenario(step.table.holeCards, step.table.communityCards))
  expect(challengeScenarios.every(Boolean)).toBe(true)
  expect(new Set(challengeScenarios).size).toBe(6)
  expect(challengeScenarios.every((item) => !practice.has(item!))).toBe(true)
})
