import { render } from '@testing-library/react'
import type { LessonDefinition, MultiChoiceStep, SingleChoiceStep } from '../types/course'
import { LearningSession, type LearningSessionProps } from '../features/learning/LearningSession'

export const singleChoiceStep: SingleChoiceStep = { id: 'call-question', type: 'single-choice', prompt: '같은 금액을 내는 행동은?', options: [{ id: 'call', label: '콜' }, { id: 'fold', label: '폴드' }], correctOptionId: 'call', explanation: '콜은 같은 금액을 내는 행동입니다.' }
export const multiChoiceStep: MultiChoiceStep = { id: 'property-question', type: 'multi-choice', prompt: '9♠ 8♠의 특징은?', options: [{ id: 'suited', label: '수딧' }, { id: 'connected', label: '커넥티드' }, { id: 'pair', label: '포켓 페어' }], correctOptionIds: ['suited', 'connected'], explanation: '같은 무늬이고 숫자가 이어집니다.' }
export const singleQuestionLesson: LessonDefinition = { id: 'single-question', title: '행동 판단', objective: '콜을 구분한다.', steps: [singleChoiceStep] }

export function renderLearningSession(lesson = singleQuestionLesson, overrides: Partial<LearningSessionProps> = {}) {
  const props: LearningSessionProps = { lesson, initialStepIndex: 0, onProgressChange: vi.fn(), onComplete: vi.fn(), ...overrides }
  return render(<LearningSession {...props} />)
}
