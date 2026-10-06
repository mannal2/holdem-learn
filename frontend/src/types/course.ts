import type { PlayingCard } from './cards'

export interface ChoiceOption {
  id: string
  label: string
}

export interface HandRankingExample {
  name: string
  description: string
  cards: [PlayingCard, PlayingCard, PlayingCard, PlayingCard, PlayingCard]
}

interface BaseStep {
  id: string
  supersedes?: string | string[]
  title?: string
  visual?: RuleVisual
}

// 후보들은 서로 다른 가정입니다. 실제 공용·개인 카드와 구분해 표시합니다.
export interface RangeSceneVisual {
  kind: 'range-scene'
  stage: 'preflop' | 'flop' | 'turn' | 'river'
  board: PlayingCard[]
  holeCards?: [PlayingCard, PlayingCard]
  history?: string[]
  candidates: { label: string; cards: [PlayingCard, PlayingCard]; status?: string; highlightedCards?: PlayingCard[]; impossibleExample?: true }[]
  boardHighlights?: PlayingCard[]
  holeHighlights?: PlayingCard[]
  markLatestCard?: boolean
  bet?: { pot: number; bet: number }
}

export type RuleVisual =
  | RangeSceneVisual
  | { kind: 'action-lines'; rows: { label: string; actions: string[] }[] }
  | { kind: 'bet-comparison'; rows: { label: string; pot: number; bet: number }[]; showRatio?: boolean }
  | { kind: 'position-scenes'; rows: { label: string; activeGroup: PositionGroup; foldedBefore?: boolean }[]; holeCards?: [PlayingCard, PlayingCard]; history?: string[] }
  | { kind: 'draw-facts'; items: { label: string; value: string; detail?: string }[] }
  | { kind: 'rank-sequences'; rows: { label: string; ranks: string[]; needed?: string[]; detail: string }[] }
  | { kind: 'draw-chances'; rows: { label: string; cards: ('턴' | '리버')[]; value?: string; detail: string }[] }
  | { kind: 'table'; stage: TableStage; holeCards: [PlayingCard, PlayingCard]; communityCards: CommunityCards; highlightedCards?: PlayingCard[] }
  | { kind: 'ranked-board'; cards: [PlayingCard, PlayingCard, PlayingCard]; labels: [string, string, string] }
  | { kind: 'starting-hands'; groups: { label: string; cards: [PlayingCard, PlayingCard] }[] }
  | { kind: 'position'; activeGroup: PositionGroup; foldedBefore?: boolean; holeCards?: [PlayingCard, PlayingCard]; conditions?: string[]; notes?: string[] }
  | { kind: 'cards'; mode: 'hole' | 'community' | 'best-five'; holeCards: [PlayingCard, PlayingCard]; communityCards: [PlayingCard, PlayingCard, PlayingCard, PlayingCard, PlayingCard]; highlightedCards?: PlayingCard[] }
  | { kind: 'actions'; situation?: 'unopened' | 'facing-bet'; showActions?: boolean }
  | { kind: 'seats'; focus: 'blinds' | 'preflop' | 'postflop' | 'late' }

export interface ExplanationStep extends BaseStep {
  type: 'explanation'
  body: string
  conditions?: string[]
  handExamples?: HandRankingExample[]
  cardGroups?: { label: string; cards: PlayingCard[] }[]
}

export type TableStage = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown'
export type CommunityCards =
  | [PlayingCard, PlayingCard, PlayingCard]
  | [PlayingCard, PlayingCard, PlayingCard, PlayingCard]
  | [PlayingCard, PlayingCard, PlayingCard, PlayingCard, PlayingCard]

export interface TableRevealStep extends BaseStep {
  type: 'table-reveal'
  stage: TableStage
  holeCards: [PlayingCard, PlayingCard]
  communityCards: CommunityCards
  highlightedCards?: PlayingCard[]
  opponentCards?: [PlayingCard, PlayingCard]
  body: string
  markLatestCard?: boolean
}

interface ChoiceStepBase extends BaseStep {
  feedbackVisual?: RuleVisual
  conditions?: string[]
  feedbackCardGroups?: { label: string; cards: PlayingCard[]; highlightedCards?: PlayingCard[] }[]
  hands?: { label: string; cards: [PlayingCard, PlayingCard] }[]
  position?: PositionGroup
  table?: {
    stage?: TableStage
    holeCards: [PlayingCard, PlayingCard]
    communityCards: CommunityCards
    highlightedCards?: PlayingCard[]
    opponentCards?: [PlayingCard, PlayingCard]
    feedbackOpponentCards?: [PlayingCard, PlayingCard]
  }
}

export interface SingleChoiceStep extends ChoiceStepBase {
  type: 'single-choice'
  prompt: string
  options: ChoiceOption[]
  correctOptionId: string
  explanation: string
}

export interface MultiChoiceStep extends ChoiceStepBase {
  type: 'multi-choice'
  prompt: string
  options: ChoiceOption[]
  correctOptionIds: string[]
  explanation: string
}

export interface SummaryStep extends BaseStep {
  type: 'summary'
  body: string
  bullets: string[]
}

export type PositionGroup = 'early' | 'middle' | 'late'

export interface PositionStep extends BaseStep {
  type: 'position'
  activeGroup: PositionGroup
  body: string
}

export type LearningStep =
  | ExplanationStep
  | TableRevealStep
  | SingleChoiceStep
  | MultiChoiceStep
  | PositionStep
  | SummaryStep

export interface LessonDefinition {
  id: string
  progressRevision?: number
  title: string
  objective: string
  steps: LearningStep[]
  passingPercentage?: number
}

export interface PartDefinition {
  id: string
  order: number
  title: string
  description: string
  lessonIds: string[]
}

export interface CourseCatalog {
  parts: PartDefinition[]
  lessons: Record<string, LessonDefinition>
}
