import { Link, useParams } from 'react-router-dom'
import { courseCatalog, getNextPartId, getPart } from '../content/catalog'
import { useProgress } from '../features/progress/ProgressProvider'

export function PartResultPage() {
  const { partId } = useParams(); const { progress, status } = useProgress(); const part = partId ? getPart(partId) : undefined
  if (status === 'loading') return <main className="page-shell"><p>결과를 불러오는 중이에요…</p></main>
  if (!part) return <main className="page-shell"><h1>결과를 찾을 수 없어요</h1><Link to="/">홈으로 돌아가기</Link></main>
  const completed = progress.completedPartIds.includes(part.id); const nextId = getNextPartId(courseCatalog, part.id); const next = nextId ? getPart(nextId) : undefined
  return <main className="page-shell page-shell--centered"><section className="message-panel result-panel"><p className="eyebrow">Part {part.order}</p><h1>{completed ? `${part.title} 완료!` : `Part ${part.order} 학습 결과`}</h1><p>{completed ? '핵심 기준을 통과했습니다. 다음 판단으로 이어가 보세요.' : '최종 도전을 완료하면 Part가 완료됩니다.'}</p><div className="result-actions">{next && <Link className="primary-link" to={`/parts/${next.id}`}>Part {next.order} 시작하기</Link>}<Link to={`/parts/${part.id}`}>Part {part.order} 돌아보기</Link></div></section></main>
}
