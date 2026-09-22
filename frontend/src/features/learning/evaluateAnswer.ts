import type { MultiChoiceStep, SingleChoiceStep } from '../../types/course'

export interface AnswerResult { isCorrect: boolean; explanation: string }

export function evaluateAnswer(step: SingleChoiceStep | MultiChoiceStep, selectedOptionIds: string[]): AnswerResult {
  const expected = step.type === 'single-choice' ? [step.correctOptionId] : step.correctOptionIds
  const selected = [...new Set(selectedOptionIds)].sort()
  const correct = [...expected].sort()
  return { isCorrect: selected.length === correct.length && selected.every((id, index) => id === correct[index]), explanation: step.explanation }
}
