import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ConfirmDialog } from '../components/feedback/ConfirmDialog'
import { courseCatalog, getPart } from '../content/catalog'
import { useProgress } from '../features/progress/progressContext'

export function HomePage() {
  const { progress, status, resetProgress } = useProgress()
  const [confirming, setConfirming] = useState(false)
  if (status === 'loading') return <main className="page-shell"><p>진도를 불러오는 중이에요…</p></main>
  const recentPart = progress.recent ? getPart(progress.recent.partId) : undefined
  return <main className="page-shell">
    <header className="hero-panel"><p className="eyebrow">HOLDEM LEARNING PATH</p><h1>홀덤을 판단하는 법부터 배워요</h1><p className="hero-copy">긴 설명을 외우기보다 직접 고르고, 바로 이유를 확인하면서 홀덤의 흐름과 판단 기준을 익힙니다.</p>{progress.recent && recentPart && <Link className="primary-link" to={`/learn/${progress.recent.partId}/${progress.recent.lessonId}`}>Part {recentPart.order} 이어하기 · {courseCatalog.lessons[progress.recent.lessonId]?.title}</Link>}</header>
    <section aria-labelledby="learning-path-title"><h2 id="learning-path-title">학습 경로</h2><div className="part-grid">{courseCatalog.parts.map((part) => { const done = part.lessonIds.filter((id) => progress.completedLessonIds.includes(id)).length; const statusText = progress.completedPartIds.includes(part.id) ? '완료' : done ? '진행 중' : '미시작'; return <article className="part-card" key={part.id}><p className="part-card__eyebrow">Part {part.order}</p><h3>{part.title}</h3><p>{part.description}</p><p className="part-card__status">{statusText} · {done}/{part.lessonIds.length}</p><Link className="text-link" to={`/parts/${part.id}`}>{statusText === '미시작' ? `Part ${part.order} 시작하기` : `Part ${part.order} 살펴보기`}</Link></article> })}</div></section>
    <aside className="storage-note"><strong>진도는 현재 이 기기와 브라우저에만 저장돼요.</strong><p>브라우저 데이터를 지우거나 시크릿 모드를 사용하면 사라질 수 있으며 다른 기기와 동기화되지 않습니다.</p><button type="button" onClick={() => setConfirming(true)}>전체 진도 초기화</button></aside>
    {confirming && <ConfirmDialog title="전체 진도를 초기화할까요?" description="Part 0과 Part 1의 저장된 진도가 모두 삭제됩니다." confirmLabel="초기화하기" onCancel={() => setConfirming(false)} onConfirm={() => { void resetProgress(); setConfirming(false) }} />}
  </main>
}
