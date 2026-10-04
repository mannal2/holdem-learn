import {
  makeCatalogWithDuplicateLessonId,
  makeCatalogWithMissingCorrectOption,
  validCatalog,
} from '../test/courseFixtures'
import { validateCourse } from './validateCourse'
import type { CourseCatalog, LearningStep } from '../types/course'
import { aceSpades, kingHearts, sevenClubs, jackDiamonds, twoSpades, queenClubs } from '../test/cardFixtures'

function catalogWithStep(step: LearningStep): CourseCatalog {
  return { parts: [{ id: 'test', order: 0, title: '검증', description: '', lessonIds: ['lesson'] }], lessons: { lesson: { id: 'lesson', title: '검증', objective: '', steps: [step] } } }
}

it('정상적인 코스는 오류가 없다', () => {
  expect(validateCourse(validCatalog)).toEqual([])
})

it('규칙 그림의 카드 중복을 검사한다', () => {
  const catalog = catalogWithStep({ id: 'visual-duplicate', type: 'explanation', body: '', visual: { kind: 'cards', mode: 'community', holeCards: [aceSpades, kingHearts], communityCards: [aceSpades, sevenClubs, jackDiamonds, twoSpades, queenClubs] } })
  expect(validateCourse(catalog)).toContain('Step visual-duplicate에 중복 카드가 있습니다.')
})

it.each(['starting-hands', 'position'] as const)('%s 그림은 같은 개인 카드를 두 번 넣을 수 없다', kind => {
  const visual = kind === 'starting-hands'
    ? { kind, groups: [{ label: '내 카드', cards: [aceSpades, aceSpades] as [typeof aceSpades, typeof aceSpades] }] }
    : { kind, activeGroup: 'early' as const, holeCards: [aceSpades, aceSpades] as [typeof aceSpades, typeof aceSpades] }
  expect(validateCourse(catalogWithStep({ id: 'hand-duplicate', type: 'explanation', body: '', visual }))).toContain('Step hand-duplicate의 개인 카드 그림에 중복 카드가 있습니다.')
})

it('최종 패 그림은 실제 카드 중 서로 다른 다섯 장만 강조한다', () => {
  const catalog = catalogWithStep({ id: 'visual-best', type: 'explanation', body: '', visual: { kind: 'cards', mode: 'best-five', holeCards: [aceSpades, kingHearts], communityCards: [sevenClubs, jackDiamonds, twoSpades, queenClubs, { rank: '10', suit: 'hearts' }], highlightedCards: [aceSpades] } })
  expect(validateCourse(catalog)).toContain('Step visual-best의 최종 패 강조는 실제 카드 중 서로 다른 5장이어야 합니다.')
})

it('설명용 테이블도 카드 중복과 공개 장수를 검사한다', () => {
  const catalog = catalogWithStep({ id: 'intro-table', type: 'explanation', body: '', visual: { kind: 'table', stage: 'turn', holeCards: [aceSpades, kingHearts], communityCards: [aceSpades, sevenClubs, twoSpades] } })
  expect(validateCourse(catalog)).toEqual(['Step intro-table에 중복 카드가 있습니다.', 'Step intro-table의 공용 카드 수가 공개 단계와 맞지 않습니다.'])
})

it('높이 표시용 공용 카드 그림의 중복을 검사한다', () => {
  const catalog = catalogWithStep({ id: 'ranked-board', type: 'explanation', body: '', visual: { kind: 'ranked-board', cards: [aceSpades, aceSpades, twoSpades], labels: ['높음', '가운데', '낮음'] } })
  expect(validateCourse(catalog)).toContain('Step ranked-board의 공용 카드 그림에 중복 카드가 있습니다.')
})

it('테이블의 내 카드와 공용 카드가 중복되면 오류다', () => {
  const catalog = catalogWithStep({ id: 'duplicate', type: 'table-reveal', stage: 'flop', body: '', holeCards: [aceSpades, kingHearts], communityCards: [aceSpades, sevenClubs, twoSpades] })
  expect(validateCourse(catalog)).toContain('Step duplicate에 중복 카드가 있습니다.')
})

it.each(['turn', 'river'] as const)('%s 공개에 필요한 공용 카드가 부족하면 오류다', stage => {
  const catalog = catalogWithStep({ id: 'short-board', type: 'table-reveal', stage, body: '', holeCards: [aceSpades, kingHearts], communityCards: [sevenClubs, jackDiamonds, twoSpades] })
  expect(validateCourse(catalog)).toContain('Step short-board의 공용 카드 수가 공개 단계와 맞지 않습니다.')
})

it('리버 선택 문제에 네 장만 지정하면 오류다', () => {
  const catalog = catalogWithStep({ id: 'river-question', type: 'single-choice', prompt: '', options: [{ id: 'yes', label: '예' }], correctOptionId: 'yes', explanation: '', table: { stage: 'river', holeCards: [aceSpades, kingHearts], communityCards: [sevenClubs, jackDiamonds, twoSpades, queenClubs] } })
  expect(validateCourse(catalog)).toContain('Step river-question의 공용 카드 수가 공개 단계와 맞지 않습니다.')
})

it('설명 카드 묶음 내부 중복은 오류지만 비교 묶음 사이의 재사용은 허용한다', () => {
  const duplicate = catalogWithStep({ id: 'outs', type: 'explanation', body: '', cardGroups: [{ label: '아웃츠', cards: [aceSpades, aceSpades] }] })
  expect(validateCourse(duplicate)).toContain('Step outs의 아웃츠 묶음에 중복 카드가 있습니다.')
  const comparison = catalogWithStep({ id: 'compare', type: 'explanation', body: '', cardGroups: [{ label: '내 패', cards: [aceSpades] }, { label: '상대 패', cards: [aceSpades] }] })
  expect(validateCourse(comparison)).toEqual([])
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
