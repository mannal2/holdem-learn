import type { MultiChoiceStep, SingleChoiceStep } from '../../types/course'
import { evaluateAnswer, type AnswerResult } from './evaluateAnswer'

export interface LearningSessionState { stepIndex: number; selectedOptionIds: string[]; selectionsByStep: Record<number, string[]>; feedback: AnswerResult | null; answered: number; correct: number; submittedStepIds: string[]; missedStepIds: string[] }
export type LearningSessionAction =
  | { type: 'select-option'; optionId: string; multiple: boolean }
  | { type: 'submit-answer'; step: SingleChoiceStep | MultiChoiceStep }
  | { type: 'advance'; totalSteps: number }
  | { type: 'previous' }
  | { type: 'go-to'; stepIndex: number }
  | { type: 'reset'; stepIndex: number }

export function createSessionState(stepIndex = 0): LearningSessionState { return { stepIndex, selectedOptionIds: [], selectionsByStep: {}, feedback: null, answered: 0, correct: 0, submittedStepIds: [], missedStepIds: [] } }
export function selectOptionIds(selectedOptionIds: string[], optionId: string, multiple: boolean): string[] {
  return multiple
    ? selectedOptionIds.includes(optionId) ? selectedOptionIds.filter((id) => id !== optionId) : [...selectedOptionIds, optionId]
    : [optionId]
}
export function sessionReducer(state: LearningSessionState, action: LearningSessionAction): LearningSessionState {
  if (action.type === 'select-option') {
    return { ...state, selectedOptionIds: selectOptionIds(state.selectedOptionIds, action.optionId, action.multiple) }
  }
  if (action.type === 'submit-answer') {
    if (state.submittedStepIds.includes(action.step.id)) return state
    const feedback = evaluateAnswer(action.step, state.selectedOptionIds)
    return { ...state, feedback, answered: state.answered + 1, correct: state.correct + (feedback.isCorrect ? 1 : 0), submittedStepIds: [...state.submittedStepIds, action.step.id], missedStepIds: feedback.isCorrect ? state.missedStepIds : [...state.missedStepIds, action.step.id] }
  }
  if (action.type === 'advance' || action.type === 'previous' || action.type === 'go-to') {
    const stepIndex = action.type === 'go-to' ? action.stepIndex : action.type === 'advance' ? Math.min(state.stepIndex + 1, action.totalSteps) : Math.max(state.stepIndex - 1, 0)
    const selectionsByStep = { ...state.selectionsByStep, [state.stepIndex]: state.selectedOptionIds }
    return { ...state, stepIndex, selectionsByStep, selectedOptionIds: selectionsByStep[stepIndex] ?? [], feedback: null }
  }
  return createSessionState(action.stepIndex)
}
