import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ConfirmDialog } from '../components/feedback/ConfirmDialog'
import { getLesson, getPart } from '../content/catalog'
import { useProgress } from '../features/progress/progressContext'

export function PartPage() {
  const { partId } = useParams(); const { progress, status, resetProgress } = useProgress(); const [confirming, setConfirming] = useState(false); const part = partId ? getPart(partId) : undefined
  if (status === 'loading') return <main className="page-shell"><p>진도를 불러오는 중이에요…</p></main>
  if (!part) return <main className="page-shell page-shell--centered"><section className="message-panel"><h1>Part를 찾을 수 없어요</h1><Link to="/">홈으로 돌아가기</Link></section></main>
  const resume = progress.resumeByPart[part.id]; const firstLessonId = part.lessonIds[0]; const number = part.order
  return <main className="page-shell"><Link className="back-link" to="/">← 홈</Link><header className="hero-panel"><p className="eyebrow">Part {number}</p><h1>{part.title}</h1><p className="hero-copy">{part.description}</p><Link className="primary-link" to={resume ? `/learn/${part.id}/${resume.lessonId}` : `/learn/${part.id}/${firstLessonId}`}>{resume ? `Part ${number} 이어하기` : `Part ${number} 시작하기`}</Link></header>
    <section><h2>Lesson 목록</h2><ol className="lesson-list">{part.lessonIds.map((id, index) => { const lesson = getLesson(id)!; const isResume = resume?.lessonId === id; const completed = progress.completedLessonIds.includes(id); const label = completed ? '완료' : isResume ? '진행 중' : '미시작'; const action = completed ? '복습하기' : isResume ? '이어하기' : '시작하기'; return <li key={id}><div><strong>{lesson.title}</strong><span>{label}</span></div><Link aria-label={index === 0 && !resume ? '첫 Lesson 시작하기' : undefined} to={`/learn/${part.id}/${id}${completed ? '?restart=1' : ''}`}>{action}</Link></li> })}</ol></section>
    <button type="button" onClick={() => setConfirming(true)}>Part {number} 진도 초기화</button>{confirming && <ConfirmDialog title={`Part ${number} 진도를 초기화할까요?`} description={`Part ${number}의 이어하기, 완료 기록과 점수만 삭제됩니다.`} confirmLabel="초기화하기" onCancel={() => setConfirming(false)} onConfirm={() => { void resetProgress(part.id); setConfirming(false) }} />}
  </main>
}
