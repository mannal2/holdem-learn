import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ConfirmDialog } from '../components/feedback/ConfirmDialog'
import { getLesson, getPart } from '../content/catalog'
import { useProgress } from '../features/progress/progressContext'
import { hasPassed } from '../features/learning/calculateResult'
import { getPracticePart, isComprehensivePractice } from '../features/practice/practice'

export function PartPage() {
  const { partId } = useParams(); const { progress, status, resetProgress } = useProgress(); const [confirming, setConfirming] = useState(false); const part = partId ? getPart(partId) : undefined
  if (status === 'loading') return <main className="page-shell"><p>진도를 불러오는 중이에요…</p></main>
  if (!part) return <main className="page-shell page-shell--centered"><section className="message-panel"><h1>Part를 찾을 수 없어요</h1><Link to="/">홈으로 돌아가기</Link></section></main>
  const resume = progress.resumeByPart[part.id]; const firstLessonId = part.lessonIds[0]; const number = part.order
  const nextLessonId = part.lessonIds.find(id => !progress.completedLessonIds.includes(id))
  const failedChallengeId = part.lessonIds.find(id => {
    const lesson = getLesson(id)!
    const result = progress.lessonResults[id]
    return lesson.passingPercentage !== undefined && result && !hasPassed(result.correct, result.answered, lesson.passingPercentage)
  })
  let targetLessonId = resume?.lessonId ?? firstLessonId
  let actionLabel = resume ? `Part ${number} 이어하기` : `Part ${number} 시작하기`
  let restart = false
  // 진행 중 위치를 우선하고, 없을 때만 재도전·다음 미완료 레슨·전체 복습을 안내합니다.
  if (!resume) {
    if (failedChallengeId) { targetLessonId = failedChallengeId; actionLabel = '종합 도전 다시 풀기'; restart = true }
    else if (nextLessonId) { targetLessonId = nextLessonId; if (part.lessonIds.some(id => progress.completedLessonIds.includes(id))) actionLabel = '다음 레슨 시작하기' }
    else { actionLabel = '처음부터 복습하기'; restart = true }
  }
  return <main className="page-shell"><Link className="back-link" to="/">← 홈</Link><header className="hero-panel"><p className="eyebrow">Part {number}</p><h1>{part.title}</h1><p className="hero-copy">{part.description}</p><Link className="primary-link" to={`/learn/${part.id}/${targetLessonId}${restart ? '?restart=1' : ''}`}>{actionLabel}</Link></header>
    <section><h2>Lesson 목록</h2><ol className="lesson-list">{part.lessonIds.map((id, index) => {
      const lesson = getLesson(id)!; const isResume = resume?.lessonId === id; const completed = progress.completedLessonIds.includes(id)
      const result = progress.lessonResults[id]
      const failed = lesson.passingPercentage !== undefined && result && !hasPassed(result.correct, result.answered, lesson.passingPercentage)
      const label = isResume ? '학습 중' : failed ? '재도전 필요' : completed ? '완료' : '미시작'; const action = isResume ? '이어하기' : failed ? '다시 풀기' : completed ? '복습하기' : '시작하기'
      const practiceLabel = isComprehensivePractice(id) ? '종합 연습' : '추가 연습'
      return <li key={id}><div><div className="lesson-title"><strong>{lesson.title}</strong>{getPracticePart(id)?.id === part.id && <Link className="lesson-practice-link" aria-label={`${lesson.title} · ${practiceLabel}`} to={`/practice/${part.id}/${id}`}>{practiceLabel}</Link>}</div><span>{label}</span></div><Link aria-label={index === 0 && !resume && !completed && !failed ? '첫 Lesson 시작하기' : undefined} to={`/learn/${part.id}/${id}${!isResume && (completed || failed) ? '?restart=1' : ''}`}>{action}</Link></li>
    })}</ol></section>
    <button type="button" onClick={() => setConfirming(true)}>Part {number} 진도 초기화</button>{confirming && <ConfirmDialog title={`Part ${number} 진도를 초기화할까요?`} description={`Part ${number}의 이어하기, 완료 기록과 점수만 삭제됩니다.`} confirmLabel="초기화하기" onCancel={() => setConfirming(false)} onConfirm={() => { void resetProgress(part.id); setConfirming(false) }} />}
  </main>
}
