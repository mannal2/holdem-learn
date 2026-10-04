import type {
  CourseCatalog,
  MultiChoiceStep,
  SingleChoiceStep,
  TableRevealStep,
  RangeSceneVisual,
} from '../types/course'
import type { PlayingCard } from '../types/cards'

function findDuplicates(values: string[]): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()

  values.forEach((value) => {
    if (seen.has(value)) duplicates.add(value)
    seen.add(value)
  })
  return [...duplicates]
}

function validateChoiceStep(
  step: SingleChoiceStep | MultiChoiceStep,
): string[] {
  const optionIds = new Set(step.options.map((option) => option.id))
  const correctIds =
    step.type === 'single-choice'
      ? [step.correctOptionId]
      : step.correctOptionIds

  return correctIds
    .filter((correctId) => !optionIds.has(correctId))
    .map(
      (correctId) =>
        `Step ${step.id}의 정답 ${correctId}은 선택지에 없습니다.`,
    )
}

function validateTable(id: string, table: TableRevealStep | NonNullable<SingleChoiceStep['table']>): string[] {
  const errors: string[] = []
  const cards = [...table.holeCards, ...table.communityCards, ...('opponentCards' in table ? table.opponentCards ?? [] : [])]
  if (findDuplicates(cards.map(card => card.rank + card.suit)).length > 0) {
    errors.push(`Step ${id}에 중복 카드가 있습니다.`)
  }
  const visibleCount = { preflop: 0, flop: 3, turn: 4, river: 5, showdown: 5 }[table.stage ?? 'flop']
  if (![3, 4, 5].includes(table.communityCards.length) || table.communityCards.length < visibleCount) {
    errors.push(`Step ${id}의 공용 카드 수가 공개 단계와 맞지 않습니다.`)
  }
  return errors
}

export function validateCourse(catalog: CourseCatalog): string[] {
  const errors: string[] = []

  findDuplicates(catalog.parts.map((part) => part.id)).forEach((id) => {
    errors.push(`중복된 Part ID: ${id}`)
  })

  const lessonEntries = Object.entries(catalog.lessons)
  findDuplicates(lessonEntries.map(([, lesson]) => lesson.id)).forEach((id) => {
    errors.push(`중복된 Lesson ID: ${id}`)
  })

  lessonEntries.forEach(([key, lesson]) => {
    if (key !== lesson.id) {
      errors.push(`Lesson 키 ${key}와 내부 ID ${lesson.id}가 다릅니다.`)
    }
    if (lesson.steps.length === 0) {
      errors.push(`Lesson ${lesson.id}에 Step이 없습니다.`)
    }
    if (
      lesson.passingPercentage !== undefined &&
      (lesson.passingPercentage <= 0 || lesson.passingPercentage > 100)
    ) {
      errors.push(`Lesson ${lesson.id}의 통과 기준은 1부터 100 사이여야 합니다.`)
    }

    lesson.steps.forEach((step) => {
      const visuals = [step.visual, ...('feedbackVisual' in step ? [step.feedbackVisual] : [])]
      visuals.forEach(visual => {
        if (visual?.kind === 'range-scene') errors.push(...validateRangeScene(step.id, visual, step.type === 'single-choice' || step.type === 'multi-choice'))
        if (visual?.kind === 'bet-comparison' && visual.rows.some(row => row.pot <= 0 || row.bet <= 0 || !Number.isFinite(row.pot) || !Number.isFinite(row.bet))) errors.push(`Step ${step.id}의 팟·베팅 금액이 올바르지 않습니다.`)
        const hands = visual?.kind === 'starting-hands' ? visual.groups.map(group => group.cards)
          : (visual?.kind === 'position' || visual?.kind === 'position-scenes') && visual.holeCards ? [visual.holeCards] : []
        hands.forEach(cards => {
          if (findDuplicates(cards.map(card => card.rank + card.suit)).length > 0) {
            errors.push(`Step ${step.id}의 개인 카드 그림에 중복 카드가 있습니다.`)
          }
        })
        if (visual?.kind === 'table') errors.push(...validateTable(step.id, visual))
        if (visual?.kind === 'ranked-board' && findDuplicates(visual.cards.map(card => card.rank + card.suit)).length > 0) {
          errors.push(`Step ${step.id}의 공용 카드 그림에 중복 카드가 있습니다.`)
        }
        if (visual?.kind !== 'cards') return
        errors.push(...validateTable(step.id, { ...visual, stage: 'river' }))
        if (visual.mode === 'best-five') {
          const cards = new Set([...visual.holeCards, ...visual.communityCards].map(card => card.rank + card.suit))
          const highlighted = visual.highlightedCards?.map(card => card.rank + card.suit) ?? []
          if (highlighted.length !== 5 || new Set(highlighted).size !== 5 || highlighted.some(card => !cards.has(card))) {
            errors.push(`Step ${step.id}의 최종 패 강조는 실제 카드 중 서로 다른 5장이어야 합니다.`)
          }
        }
      })
      if (step.type === 'single-choice' || step.type === 'multi-choice') {
        errors.push(...validateChoiceStep(step))
        if (step.table) errors.push(...validateTable(step.id, step.table))
        if (step.table?.feedbackOpponentCards) errors.push(...validateTable(step.id, { ...step.table, opponentCards: step.table.feedbackOpponentCards }))
        step.feedbackCardGroups?.forEach(group => {
          if (findDuplicates(group.cards.map(card => card.rank + card.suit)).length > 0) {
            errors.push(`Step ${step.id}의 ${group.label} 묶음에 중복 카드가 있습니다.`)
          }
        })
      }
      if (step.type === 'table-reveal') errors.push(...validateTable(step.id, step))
      if (step.type === 'explanation') {
        step.cardGroups?.forEach(group => {
          if (findDuplicates(group.cards.map(card => card.rank + card.suit)).length > 0) {
            errors.push(`Step ${step.id}의 ${group.label} 묶음에 중복 카드가 있습니다.`)
          }
        })
      }
    })
  })

  catalog.parts.forEach((part) => {
    part.lessonIds.forEach((lessonId) => {
      if (!catalog.lessons[lessonId]) {
        errors.push(`Part ${part.id}가 없는 Lesson ${lessonId}를 참조합니다.`)
      }
    })
  })

  const stepIds = lessonEntries.flatMap(([, lesson]) =>
    lesson.steps.map((step) => step.id),
  )
  findDuplicates(stepIds).forEach((id) => {
    errors.push(`중복된 Step ID: ${id}`)
  })

  return errors
}

function validateRangeScene(id: string, visual: RangeSceneVisual, allowImpossibleExample: boolean): string[] {
  const errors: string[] = []
  const key = (card: PlayingCard) => card.rank + card.suit
  const known = [...visual.board, ...visual.holeCards ?? []]
  const knownKeys = new Set(known.map(key))
  if (findDuplicates(known.map(key)).length) errors.push(`Step ${id}의 공개 카드에 중복이 있습니다.`)
  if (visual.board.length !== { preflop: 0, flop: 3, turn: 4, river: 5 }[visual.stage]) errors.push(`Step ${id}의 후보 그림 공개 단계와 장수가 다릅니다.`)
  const checkHighlights = (all: PlayingCard[], highlighted: PlayingCard[] = []) => {
    const keys = new Set(all.map(key))
    if (findDuplicates(highlighted.map(key)).length || highlighted.some(card => !keys.has(key(card)))) errors.push(`Step ${id}의 후보 그림 강조가 실제 카드와 다릅니다.`)
  }
  checkHighlights(visual.board, visual.boardHighlights)
  checkHighlights(visual.holeCards ?? [], visual.holeHighlights)
  visual.candidates.forEach(candidate => {
    const keys = candidate.cards.map(key)
    const conflict = keys.some(card => knownKeys.has(card))
    if (candidate.cards.length !== 2 || findDuplicates(keys).length) errors.push(`Step ${id}의 ${candidate.label} 카드가 올바르지 않습니다.`)
    if (conflict && !candidate.impossibleExample) errors.push(`Step ${id}의 ${candidate.label}가 공개 카드와 충돌합니다.`)
    if (candidate.impossibleExample && (!conflict || !allowImpossibleExample)) errors.push(`Step ${id}의 불가능 후보 예시는 충돌을 찾는 문제에서만 허용합니다.`)
    checkHighlights(candidate.cards, candidate.highlightedCards)
  })
  const all = [...known, ...visual.candidates.flatMap(candidate => candidate.cards)]
  if (all.some(card => !['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'].includes(card.rank) || !['spades', 'hearts', 'diamonds', 'clubs'].includes(card.suit))) errors.push(`Step ${id}의 후보 그림에 잘못된 카드가 있습니다.`)
  return errors
}
