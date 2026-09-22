import type { MultiChoiceStep, SingleChoiceStep } from '../../types/course'
import { evaluateAnswer, type AnswerResult } from './evaluateAnswer'

export interface LearningSessionState { stepIndex: number; selectedOptionIds: string[]; feedback: AnswerResult | null; answered: number; correct: number; submittedStepIds: string[] }
export type LearningSessionAction =
  | { type: 'select-option'; optionId: string; multiple: boolean }
  | { type: 'submit-answer'; step: SingleChoiceStep | MultiChoiceStep }
  | { type: 'advance'; totalSteps: number }
  | { type: 'reset'; stepIndex: number }

export function createSessionState(stepIndex = 0): LearningSessionState { return { stepIndex, selectedOptionIds: [], feedback: null, answered: 0, correct: 0, submittedStepIds: [] } }
export function sessionReducer(state: LearningSessionState, action: LearningSessionAction): LearningSessionState {
  if (action.type === 'select-option') {
    const selected = action.multiple
      ? state.selectedOptionIds.includes(action.optionId) ? state.selectedOptionIds.filter((id) => id !== action.optionId) : [...state.selectedOptionIds, action.optionId]
      : [action.optionId]
    return { ...state, selectedOptionIds: selected }
  }
  if (action.type === 'submit-answer') {
    if (state.submittedStepIds.includes(action.step.id)) return state
    const feedback = evaluateAnswer(action.step, state.selectedOptionIds)
    return { ...state, feedback, answered: state.answered + 1, correct: state.correct + (feedback.isCorrect ? 1 : 0), submittedStepIds: [...state.submittedStepIds, action.step.id] }
  }
  if (action.type === 'advance') return { ...state, stepIndex: Math.min(state.stepIndex + 1, action.totalSteps), selectedOptionIds: [], feedback: null }
  return createSessionState(action.stepIndex)
}
