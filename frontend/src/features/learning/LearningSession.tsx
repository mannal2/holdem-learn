import { useReducer } from 'react'
import type { LessonDefinition } from '../../types/course'
import { FeedbackPanel } from '../../components/learning/FeedbackPanel'
import { ProgressBar } from '../../components/learning/ProgressBar'
import { LearningStepRenderer } from './LearningStepRenderer'
import { createSessionState, sessionReducer } from './sessionReducer'

export interface ConfirmedProgress { stepIndex: number; answered: number; correct: number }
export interface LearningSessionProps { lesson: LessonDefinition; initialStepIndex: number; onConfirmedProgress: (progress: ConfirmedProgress) => void; onComplete: (result: { answered: number; correct: number }) => void }

export function LearningSession({ lesson, initialStepIndex, onConfirmedProgress, onComplete }: LearningSessionProps) {
  const [state, dispatch] = useReducer(sessionReducer, initialStepIndex, createSessionState)
  const step = lesson.steps[state.stepIndex]
  if (!step) return <p>학습 콘텐츠를 표시할 수 없어요.</p>
  const question = step.type === 'single-choice' || step.type === 'multi-choice'
  const last = state.stepIndex === lesson.steps.length - 1
  const advance = () => {
    if (last) { onComplete({ answered: state.answered, correct: state.correct }); return }
    const next = state.stepIndex + 1
    dispatch({ type: 'advance', totalSteps: lesson.steps.length })
    onConfirmedProgress({ stepIndex: next, answered: state.answered, correct: state.correct })
  }
  const submit = () => {
    if (!question || state.feedback || state.selectedOptionIds.length === 0) return
    const isCorrect = step.type === 'single-choice' ? state.selectedOptionIds[0] === step.correctOptionId : [...state.selectedOptionIds].sort().join() === [...step.correctOptionIds].sort().join()
    dispatch({ type: 'submit-answer', step })
    onConfirmedProgress({ stepIndex: state.stepIndex + 1, answered: state.answered + 1, correct: state.correct + (isCorrect ? 1 : 0) })
  }
  return <section className="learning-session"><ProgressBar current={state.stepIndex + 1} total={lesson.steps.length} label={lesson.title} /><LearningStepRenderer step={step} selectedOptionIds={state.selectedOptionIds} feedbackVisible={Boolean(state.feedback)} onSelect={(optionId, multiple) => dispatch({ type: 'select-option', optionId, multiple })} />{state.feedback && <FeedbackPanel status={state.feedback.isCorrect ? 'correct' : 'incorrect'} title={state.feedback.isCorrect ? '정답이에요' : '다시 확인해 봐요'} explanation={state.feedback.explanation} />}{question && !state.feedback ? <button type="button" onClick={submit} disabled={!state.selectedOptionIds.length}>정답 확인</button> : <button type="button" onClick={advance}>{last ? '완료' : '다음'}</button>}</section>
}
