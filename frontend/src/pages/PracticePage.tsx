import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getLesson } from '../content/catalog'
import { LearningSession } from '../features/learning/LearningSession'
import { LearningStepRenderer } from '../features/learning/LearningStepRenderer'
import { ConfirmDialog } from '../components/feedback/ConfirmDialog'
import { createPracticeSession, getPracticeQuestions, getPracticePart, isComprehensivePractice, loadPractice, savePractice } from '../features/practice/practice'
import type { PracticeSession } from '../features/practice/practice'

export function PracticePage() {
  const { partId, lessonId } = useParams()
  if (!lessonId || getPracticePart(lessonId)?.id !== partId) return <main className="page-shell"><h1>추가 연습을 찾을 수 없어요</h1><Link to="/">홈으로 돌아가기</Link></main>
  return <Practice key={lessonId} lessonId={lessonId} />
}

function Practice({ lessonId }: { lessonId: string }) {
  const [loaded] = useState(loadPractice)
  const [data, setData] = useState(loaded.data)
  const [active, setActive] = useState(false)
  // 완료 기록은 저장하지만 결과 화면 표시 여부는 이번 방문에서만 유지합니다.
  const [showResult, setShowResult] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [saveFailed, setSaveFailed] = useState(false)
  const lesson = getLesson(lessonId)!
  const part = getPracticePart(lessonId)!
  const practiceLabel = isComprehensivePractice(lessonId) ? '종합 연습' : '추가 연습'
  const session = data.sessions[lessonId]
  const update = (next: PracticeSession) => {
    const updated = { ...data, sessions: { ...data.sessions, [lessonId]: next }, results: next.completed ? { ...data.results, [lessonId]: next } : data.results }
    setData(updated)
    setSaveFailed(!savePractice(updated))
  }
  const start = () => { update(createPracticeSession(lessonId, session?.questionIds)); setActive(true); setShowResult(false); setConfirming(false) }
  const newSession = () => { if (session && !session.completed) setConfirming(true); else start() }
  const questions = session ? getPracticeQuestions(session) : []
  const actions = <div className="result-actions">
    {session && !session.completed && <button type="button" onClick={() => setActive(true)}>이어서 연습하기</button>}
    <button type="button" onClick={newSession}>{session && (!session.completed || showResult) ? '새 문제로 연습하기' : '연습 시작'}</button>
  </div>
  return <main className="page-shell learning-page practice-page">
    <Link className="back-link" to={`/parts/${part.id}`}>← Part {part.order}로 돌아가기</Link>
    <header className="lesson-header"><p className="eyebrow">Part {part.order} · {practiceLabel}</p><h1>{lesson.title}</h1><p>새로운 카드로 배운 내용을 확인해요. 연습 점수는 레슨 완료 기록에 영향을 주지 않아요.</p>{!active && !showResult && actions}</header>
    {loaded.recovered && <p role="alert">저장된 연습을 불러오지 못했어요. 새 연습을 시작할 수 있으며 기존 레슨 진도는 유지됩니다.</p>}
    {saveFailed && <p role="alert">브라우저에 연습을 저장하지 못했어요. 지금은 계속 풀 수 있지만 새로고침하면 복원되지 않을 수 있어요.</p>}
    {active && session && !session.completed ? <LearningSession key={session.questionIds.join(',')} lesson={{ id: `practice-${lessonId}`, title: `${lesson.title} ${practiceLabel}`, objective: lesson.objective, steps: questions }} initialStepIndex={session.progress.stepIndex} initialProgress={session.progress} onProgressChange={progress => update({ ...session, progress })} onComplete={() => { update({ ...session, completed: true }); setActive(false); setShowResult(true) }} /> : showResult && session?.completed ? <section className="message-panel"><PracticeResult session={session} practiceLabel={practiceLabel} />{actions}</section> : null}
    {confirming && <ConfirmDialog title="새 연습을 시작할까요?" description="진행 중인 연습의 문제와 답을 새 회차로 교체합니다. 기존 레슨 진도는 유지됩니다." confirmLabel="새 연습 시작" onCancel={() => setConfirming(false)} onConfirm={start} />}
  </main>
}

function PracticeResult({ session, practiceLabel }: { session: PracticeSession; practiceLabel: string }) {
  const missed = getPracticeQuestions(session).filter(q => session.progress.missedStepIds.includes(q.id))
  return <section className="practice-result"><h2>{practiceLabel}을 마쳤어요</h2><p>{session.progress.correct}/{session.progress.answered} 정답 · {Math.round(session.progress.correct / session.progress.answered * 100)}%</p><p>합격·불합격 없이 부족한 개념을 확인하는 연습이에요.</p>
    {missed.length > 0 ? <><h3>틀린 문제 다시 보기</h3>{missed.map(q => {
      const index = session.questionIds.indexOf(q.id)
      const selected = session.progress.selectionsByStep[index] ?? []
      const correctIds = q.type === 'multi-choice' ? q.correctOptionIds : [q.correctOptionId]
      return <details key={q.id}><summary>{index + 1}번 · {q.prompt}</summary><LearningStepRenderer step={q} selectedOptionIds={selected} feedbackVisible onSelect={() => {}} /><p>내 선택: {q.options.filter(o => selected.includes(o.id)).map(o => o.label).join(', ') || '선택 없음'}</p><p>정답: {q.options.filter(o => correctIds.includes(o.id)).map(o => o.label).join(', ')}</p><p>{q.explanation}</p></details>
    })}</> : <p>모든 문제를 맞혔어요. 새 카드에서도 같은 근거로 판단해 보세요.</p>}
  </section>
}
