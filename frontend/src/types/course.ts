import type { PlayingCard } from './cards'

export interface ChoiceOption {
  id: string
  label: string
}

interface BaseStep {
  id: string
  title?: string
}

export interface ExplanationStep extends BaseStep {
  type: 'explanation'
  body: string
}

export type TableStage = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown'

export interface TableRevealStep extends BaseStep {
  type: 'table-reveal'
  stage: TableStage
  holeCards: [PlayingCard, PlayingCard]
  communityCards: [PlayingCard, PlayingCard, PlayingCard, PlayingCard, PlayingCard]
  body: string
}

export interface SingleChoiceStep extends BaseStep {
  type: 'single-choice'
  prompt: string
  options: ChoiceOption[]
  correctOptionId: string
  explanation: string
}

export interface MultiChoiceStep extends BaseStep {
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

export type LearningStep =
  | ExplanationStep
  | TableRevealStep
  | SingleChoiceStep
  | MultiChoiceStep
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
