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
  title?: string
}

export interface ExplanationStep extends BaseStep {
  type: 'explanation'
  body: string
  handExamples?: HandRankingExample[]
}

export type TableStage = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown'

export interface TableRevealStep extends BaseStep {
  type: 'table-reveal'
  stage: TableStage
  holeCards: [PlayingCard, PlayingCard]
  communityCards: [PlayingCard, PlayingCard, PlayingCard] | [PlayingCard, PlayingCard, PlayingCard, PlayingCard, PlayingCard]
  body: string
}

interface ChoiceStepBase extends BaseStep {
  hands?: { label: string; cards: [PlayingCard, PlayingCard] }[]
  position?: PositionGroup
  table?: {
    holeCards: [PlayingCard, PlayingCard]
    communityCards: [PlayingCard, PlayingCard, PlayingCard]
    highlightedCards?: PlayingCard[]
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
