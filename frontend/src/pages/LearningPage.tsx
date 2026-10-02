import { useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getLesson, getPart } from '../content/catalog'
import { hasPassed } from '../features/learning/calculateResult'
import { LearningSession } from '../features/learning/LearningSession'
import { useProgress } from '../features/progress/progressContext'

export function LearningPage() {
  const { partId, lessonId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const consumedRestart = useRef<string | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const { progress, status, confirmStep, completeLesson } = useProgress()
  const part = partId ? getPart(partId) : undefined
  const lesson = lessonId ? getLesson(lessonId) : undefined

  useEffect(() => {
    if (status !== 'ready' || !part || !lesson || !part.lessonIds.includes(lesson.id) || searchParams.get('restart') !== '1' || consumedRestart.current === location.key) return
    // 브라우저 주소 교체가 끝나기 전 다시 렌더돼도 같은 재시작을 반복하지 않습니다.
    consumedRestart.current = location.key
    // 재시작은 한 번만 적용합니다. 주소에 남겨 두면 새로고침마다 저장된 해설을 무시합니다.
    void confirmStep({ partId: part.id, lessonId: lesson.id, stepIndex: 0, answered: 0, correct: 0, submittedStepIds: [], missedStepIds: [], selectedOptionIds: [], selectionsByStep: {} })
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('restart')
    setSearchParams(nextParams, { replace: true })
  }, [status, part, lesson, searchParams, setSearchParams, confirmStep, location.key])

  if (status === 'loading') return <main className="page-shell"><p>진도를 불러오는 중이에요…</p></main>
  if (!part || !lesson || !part.lessonIds.includes(lesson.id)) {
    return <main className="page-shell page-shell--centered"><section className="message-panel"><h1>학습 내용을 찾을 수 없어요</h1><p>주소가 잘못됐거나 아직 준비되지 않은 Lesson입니다.</p><Link className="primary-link" to="/">Part 0으로 돌아가기</Link></section></main>
  }

  const saved = searchParams.get('restart') === '1' ? undefined : progress.resumeByPart[part.id]
  const initialStepIndex = saved?.lessonId === lesson.id ? saved.stepIndex : 0

  return (
    <main className="page-shell learning-page">
      <Link className="back-link" to={`/parts/${part.id}`}>← 레슨 목록</Link>
      <header className="lesson-header"><p className="eyebrow">Part {part.order}</p><h1>{lesson.title}</h1><p>{lesson.objective}</p></header>
      <LearningSession
        key={lesson.id}
        lesson={lesson}
        initialStepIndex={initialStepIndex}
        initialProgress={saved?.lessonId === lesson.id ? saved : undefined}
        onProgressChange={(attempt) => void confirmStep({ partId: part.id, lessonId: lesson.id, ...attempt })}
        onComplete={async ({ answered, correct, missedStepIds }) => {
          const passedPart = Boolean(lesson.passingPercentage) && hasPassed(correct, answered, lesson.passingPercentage ?? 100)
          await completeLesson({ lessonId: lesson.id, partId: part.id, correct, answered, missedStepIds, passedPart })
          navigate(`/results/${part.id}/${lesson.id}`)
        }}
      />
    </main>
  )
}
