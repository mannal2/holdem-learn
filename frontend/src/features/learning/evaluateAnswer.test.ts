import { multiChoiceStep, singleChoiceStep } from '../../test/learningFixtures'
import { evaluateAnswer } from './evaluateAnswer'

it('단일 선택의 정답과 해설을 반환한다', () => {
  expect(evaluateAnswer(singleChoiceStep, ['call'])).toEqual({ isCorrect: true, explanation: singleChoiceStep.explanation })
})

it('복수 선택은 순서와 무관하게 정확히 같은 집합만 정답이다', () => {
  expect(evaluateAnswer(multiChoiceStep, ['suited', 'connected'])).toMatchObject({ isCorrect: true })
  expect(evaluateAnswer(multiChoiceStep, ['connected', 'suited'])).toMatchObject({ isCorrect: true })
  expect(evaluateAnswer(multiChoiceStep, ['suited'])).toMatchObject({ isCorrect: false })
})
