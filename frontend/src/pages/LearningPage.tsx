import { Link, useParams } from 'react-router-dom'
import { part0, part0Lessons } from '../content/part0'
import { part1, part1Lessons } from '../content/part1'
import { hasPassed } from '../features/learning/calculateResult'
import { LearningSession } from '../features/learning/LearningSession'
import { useProgress } from '../features/progress/ProgressProvider'

export function LearningPage() {
  const { partId, lessonId } = useParams()
  const { progress, status, warning, confirmStep, completeLesson } = useProgress()
  const course = partId === part0.id ? { part: part0, lessons: part0Lessons } : partId === part1.id ? { part: part1, lessons: part1Lessons } : undefined
  const part = course?.part
  const lesson = course && lessonId ? course.lessons[lessonId] : undefined

  if (status === 'loading') return <main className="page-shell"><p>진도를 불러오는 중이에요…</p></main>
  if (!part || !lesson || !part.lessonIds.includes(lesson.id)) {
    return <main className="page-shell page-shell--centered"><section className="message-panel"><h1>학습 내용을 찾을 수 없어요</h1><p>주소가 잘못됐거나 아직 준비되지 않은 Lesson입니다.</p><Link className="primary-link" to="/">Part 0으로 돌아가기</Link></section></main>
  }

  const saved = progress.resumeByPart[part.id]
  const initialStepIndex = saved?.lessonId === lesson.id ? saved.stepIndex : 0

  return (
    <main className="page-shell learning-page">
      <Link className="back-link" to="/">← 학습 경로</Link>
      {warning && <p className="save-warning" role="status">{warning}</p>}
      <header className="lesson-header"><p className="eyebrow">Part {part.order}</p><h1>{lesson.title}</h1><p>{lesson.objective}</p></header>
      <LearningSession
        lesson={lesson}
        initialStepIndex={initialStepIndex}
        onConfirmedProgress={({ stepIndex }) => void confirmStep({ partId: part.id, lessonId: lesson.id, stepIndex })}
        onComplete={({ answered, correct }) => {
          const passedPart = Boolean(lesson.passingPercentage) && hasPassed(correct, answered, lesson.passingPercentage ?? 100)
          void completeLesson({ lessonId: lesson.id, partId: part.id, correct, answered, passedPart })
        }}
      />
    </main>
  )
}
