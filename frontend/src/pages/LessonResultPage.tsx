import { Link, useParams } from 'react-router-dom'
import { getLesson, getPart } from '../content/catalog'
import { useProgress } from '../features/progress/ProgressProvider'

export function LessonResultPage() {
  const { partId, lessonId } = useParams(); const { progress, status } = useProgress(); const part = partId ? getPart(partId) : undefined; const lesson = lessonId ? getLesson(lessonId) : undefined
  if (status === 'loading') return <main className="page-shell"><p>결과를 불러오는 중이에요…</p></main>
  if (!part || !lesson || !part.lessonIds.includes(lesson.id)) return <main className="page-shell"><h1>결과를 찾을 수 없어요</h1><Link to="/">홈으로 돌아가기</Link></main>
  const result = progress.lessonResults[lesson.id]; const passed = Boolean(result && (!lesson.passingPercentage || result.bestPercentage >= lesson.passingPercentage)); const index = part.lessonIds.indexOf(lesson.id); const nextLesson = part.lessonIds[index + 1]
  return <main className="page-shell page-shell--centered"><section className="message-panel result-panel"><p className="eyebrow">Part {part.order} 결과</p><h1>{lesson.passingPercentage && !passed ? `아직 Part ${part.order}을 완료하지 못했어요` : `${lesson.title} 학습을 마쳤어요`}</h1><p>{result ? `${result.correct}/${result.answered} 정답 · ${result.bestPercentage}%` : '아직 저장된 결과가 없어요.'}</p><h2>핵심 개념</h2><p>{lesson.objective}</p><div className="result-actions"><Link to={`/learn/${part.id}/${lesson.id}`}>{lesson.passingPercentage && !passed ? '종합 도전 다시 풀기' : '다시 풀기'}</Link>{nextLesson && <Link className="primary-link" to={`/learn/${part.id}/${nextLesson}`}>다음 Lesson</Link>}{lesson.passingPercentage && passed && <Link className="primary-link" to={`/results/${part.id}`}>Part 결과 보기</Link>}</div></section></main>
}
