import { useReducer } from 'react'
import type { LessonDefinition } from '../../types/course'
import { FeedbackPanel } from '../../components/learning/FeedbackPanel'
import { ProgressBar } from '../../components/learning/ProgressBar'
import { LearningStepRenderer } from './LearningStepRenderer'
import { createSessionState, sessionReducer } from './sessionReducer'
import type { ResumePoint } from '../../types/progress'

export interface ConfirmedProgress { stepIndex: number; answered: number; correct: number; submittedStepIds: string[]; missedStepIds: string[]; selectedOptionIds: string[] }
export interface LearningSessionProps { lesson: LessonDefinition; initialStepIndex: number; initialProgress?: Partial<ResumePoint>; onConfirmedProgress: (progress: ConfirmedProgress) => void; onComplete: (result: { answered: number; correct: number; missedStepIds: string[] }) => void }

export function LearningSession({ lesson, initialStepIndex, initialProgress, onConfirmedProgress, onComplete }: LearningSessionProps) {
  const [state, dispatch] = useReducer(sessionReducer, undefined, () => {
    const base = createSessionState(Math.min(initialStepIndex, lesson.steps.length - 1))
    const step = lesson.steps[base.stepIndex]
    const submitted = initialProgress?.submittedStepIds ?? []
    const missed = initialProgress?.missedStepIds ?? []
    return { ...base, answered: initialProgress?.answered ?? 0, correct: initialProgress?.correct ?? 0, submittedStepIds: submitted, missedStepIds: missed, selectedOptionIds: initialProgress?.selectedOptionIds ?? [], feedback: step && submitted.includes(step.id) && (step.type === 'single-choice' || step.type === 'multi-choice') ? { isCorrect: !missed.includes(step.id), explanation: step.explanation } : null }
  })
  const step = lesson.steps[state.stepIndex]
  if (!step) return <p>학습 콘텐츠를 표시할 수 없어요.</p>
  const question = step.type === 'single-choice' || step.type === 'multi-choice'
  const last = state.stepIndex === lesson.steps.length - 1
  const advance = () => {
    if (last) { onComplete({ answered: state.answered, correct: state.correct, missedStepIds: state.missedStepIds }); return }
    const next = state.stepIndex + 1
    dispatch({ type: 'advance', totalSteps: lesson.steps.length })
    onConfirmedProgress({ stepIndex: next, answered: state.answered, correct: state.correct, submittedStepIds: state.submittedStepIds, missedStepIds: state.missedStepIds, selectedOptionIds: [] })
  }
  const submit = () => {
    if (!question || state.feedback || state.selectedOptionIds.length === 0) return
    const isCorrect = step.type === 'single-choice' ? state.selectedOptionIds[0] === step.correctOptionId : [...state.selectedOptionIds].sort().join() === [...step.correctOptionIds].sort().join()
    dispatch({ type: 'submit-answer', step })
    onConfirmedProgress({ stepIndex: last ? state.stepIndex : state.stepIndex + 1, answered: state.answered + 1, correct: state.correct + (isCorrect ? 1 : 0), submittedStepIds: [...state.submittedStepIds, step.id], missedStepIds: isCorrect ? state.missedStepIds : [...state.missedStepIds, step.id], selectedOptionIds: last ? state.selectedOptionIds : [] })
  }
  return <section className="learning-session"><ProgressBar current={state.stepIndex + 1} total={lesson.steps.length} label={lesson.title} /><LearningStepRenderer step={step} selectedOptionIds={state.selectedOptionIds} feedbackVisible={Boolean(state.feedback)} onSelect={(optionId, multiple) => dispatch({ type: 'select-option', optionId, multiple })} />{state.feedback && <FeedbackPanel status={state.feedback.isCorrect ? 'correct' : 'incorrect'} title={state.feedback.isCorrect ? '정답이에요' : '다시 확인해 봐요'} explanation={state.feedback.explanation} />}{question && !state.feedback ? <button type="button" onClick={submit} disabled={!state.selectedOptionIds.length}>정답 확인</button> : <button type="button" onClick={advance}>{last ? '완료' : '다음'}</button>}</section>
}
