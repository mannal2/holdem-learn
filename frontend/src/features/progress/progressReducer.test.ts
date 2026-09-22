import { catalogFixture } from '../../test/courseFixtures'
import { confirmedPart0Step, confirmedPart1Step, expectedPart0ResumePoint, expectedPart1ResumePoint, progressAfterSubmittingStepFive, progressWithBestScore } from '../../test/progressFixtures'
import { createEmptyProgress } from './createEmptyProgress'
import { progressReducer } from './progressReducer'
import { getResumePoint } from './resume'

it('확정된 문제 다음 단계에서 이어간다', () => { expect(getResumePoint(progressAfterSubmittingStepFive(), catalogFixture, 'part-1')).toEqual({ partId: 'part-1', lessonId: 'hand-properties', stepIndex: 5 }) })
it('더 낮은 재도전 점수는 최고 점수를 낮추지 않는다', () => { const updated = progressReducer(progressWithBestScore(90), { type: 'complete-attempt', lessonId: 'part-1-challenge', correct: 4, answered: 5 }); expect(updated.lessonResults['part-1-challenge'].bestPercentage).toBe(90) })
it('다른 Part를 시작해도 기존 Part의 이어하기 위치를 유지한다', () => { const afterPart0 = progressReducer(createEmptyProgress(), confirmedPart0Step); const afterPart1 = progressReducer(afterPart0, confirmedPart1Step); expect(afterPart1.resumeByPart['part-0']).toEqual(expectedPart0ResumePoint); expect(afterPart1.resumeByPart['part-1']).toEqual(expectedPart1ResumePoint); expect(afterPart1.recent).toEqual(expectedPart1ResumePoint) })
it('저장소에서 불러온 완료 기록과 점수를 그대로 복구한다', () => { const saved = progressWithBestScore(90); expect(progressReducer(createEmptyProgress(), { type: 'hydrate', progress: saved })).toEqual(saved) })
