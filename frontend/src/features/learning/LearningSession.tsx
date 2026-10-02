import { useLayoutEffect, useReducer, useRef } from 'react'
import type { LessonDefinition } from '../../types/course'
import { FeedbackPanel } from '../../components/learning/FeedbackPanel'
import { ProgressBar } from '../../components/learning/ProgressBar'
import { LearningStepRenderer } from './LearningStepRenderer'
import { createSessionState, selectOptionIds, sessionReducer } from './sessionReducer'
import type { ResumePoint } from '../../types/progress'

export interface SessionProgress { stepIndex: number; answered: number; correct: number; submittedStepIds: string[]; missedStepIds: string[]; selectedOptionIds: string[]; selectionsByStep: Record<number, string[]> }
export interface LearningSessionProps { lesson: LessonDefinition; initialStepIndex: number; initialProgress?: Partial<ResumePoint>; onProgressChange: (progress: SessionProgress) => void; onComplete: (result: { answered: number; correct: number; missedStepIds: string[] }) => void }

export function LearningSession({ lesson, initialStepIndex, initialProgress, onProgressChange, onComplete }: LearningSessionProps) {
  const sessionRef = useRef<HTMLElement>(null)
  const [state, dispatch] = useReducer(sessionReducer, undefined, () => {
    const base = createSessionState(Math.min(initialStepIndex, lesson.steps.length - 1))
    const step = lesson.steps[base.stepIndex]
    const submitted = initialProgress?.submittedStepIds ?? []
    const missed = initialProgress?.missedStepIds ?? []
    return { ...base, answered: initialProgress?.answered ?? 0, correct: initialProgress?.correct ?? 0, submittedStepIds: submitted, missedStepIds: missed, selectionsByStep: initialProgress?.selectionsByStep ?? {}, selectedOptionIds: initialProgress?.selectionsByStep?.[base.stepIndex] ?? initialProgress?.selectedOptionIds ?? [], feedback: step && submitted.includes(step.id) && (step.type === 'single-choice' || step.type === 'multi-choice') ? { isCorrect: !missed.includes(step.id), explanation: step.explanation } : null }
  })
  // 단계가 바뀔 때만 시작 부분을 보여줍니다. 답 선택·해설 표시는 스크롤을 바꾸지 않습니다.
  useLayoutEffect(() => { sessionRef.current?.scrollIntoView({ block: 'start' }) }, [state.stepIndex])
  const step = lesson.steps[state.stepIndex]
  if (!step) return <p>학습 콘텐츠를 표시할 수 없어요.</p>
  const question = step.type === 'single-choice' || step.type === 'multi-choice'
  const last = state.stepIndex === lesson.steps.length - 1
  const feedback = state.feedback ?? (question && state.submittedStepIds.includes(step.id) ? { isCorrect: !state.missedStepIds.includes(step.id), explanation: step.explanation } : null)
  const select = (optionId: string, multiple: boolean) => {
    if (feedback) return
    const selectedOptionIds = selectOptionIds(state.selectedOptionIds, optionId, multiple)
    dispatch({ type: 'select-option', optionId, multiple })
    onProgressChange({ stepIndex: state.stepIndex, answered: state.answered, correct: state.correct, submittedStepIds: state.submittedStepIds, missedStepIds: state.missedStepIds, selectedOptionIds, selectionsByStep: { ...state.selectionsByStep, [state.stepIndex]: selectedOptionIds } })
  }
  const previous = () => {
    if (state.stepIndex === 0) return
    const stepIndex = state.stepIndex - 1
    const selectionsByStep = { ...state.selectionsByStep, [state.stepIndex]: state.selectedOptionIds }
    dispatch({ type: 'previous' })
    onProgressChange({ stepIndex, answered: state.answered, correct: state.correct, submittedStepIds: state.submittedStepIds, missedStepIds: state.missedStepIds, selectedOptionIds: selectionsByStep[stepIndex] ?? [], selectionsByStep })
  }
  const advance = () => {
    if (last) { onComplete({ answered: state.answered, correct: state.correct, missedStepIds: state.missedStepIds }); return }
    const next = state.stepIndex + 1
    const selectionsByStep = { ...state.selectionsByStep, [state.stepIndex]: state.selectedOptionIds }
    dispatch({ type: 'advance', totalSteps: lesson.steps.length })
    onProgressChange({ stepIndex: next, answered: state.answered, correct: state.correct, submittedStepIds: state.submittedStepIds, missedStepIds: state.missedStepIds, selectedOptionIds: selectionsByStep[next] ?? [], selectionsByStep })
  }
  const submit = () => {
    if (!question || feedback || state.selectedOptionIds.length === 0) return
    const isCorrect = step.type === 'single-choice' ? state.selectedOptionIds[0] === step.correctOptionId : [...state.selectedOptionIds].sort().join() === [...step.correctOptionIds].sort().join()
    const selectionsByStep = { ...state.selectionsByStep, [state.stepIndex]: state.selectedOptionIds }
    dispatch({ type: 'submit-answer', step })
    // 제출은 현재 문제와 해설을 저장하고, 다음 버튼을 눌러야 다음 위치를 저장합니다.
    onProgressChange({ stepIndex: state.stepIndex, answered: state.answered + 1, correct: state.correct + (isCorrect ? 1 : 0), submittedStepIds: [...state.submittedStepIds, step.id], missedStepIds: isCorrect ? state.missedStepIds : [...state.missedStepIds, step.id], selectedOptionIds: state.selectedOptionIds, selectionsByStep })
  }
  return <section ref={sessionRef} className="learning-session"><ProgressBar current={state.stepIndex + 1} total={lesson.steps.length} label={lesson.title} /><LearningStepRenderer step={step} selectedOptionIds={state.selectedOptionIds} feedbackVisible={Boolean(feedback)} onSelect={select} />{feedback && <FeedbackPanel status={feedback.isCorrect ? 'correct' : 'incorrect'} title={feedback.isCorrect ? '정답이에요' : '다시 확인해 봐요'} explanation={feedback.explanation} />}<div className="learning-session__actions"><button type="button" onClick={previous} disabled={state.stepIndex === 0}>이전</button>{question && !feedback ? <button type="button" onClick={submit} disabled={!state.selectedOptionIds.length}>정답 확인</button> : <button type="button" onClick={advance}>{last ? '완료' : '다음'}</button>}</div></section>
}
