import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main className="page-shell page-shell--centered">
      <section className="message-panel">
        <p className="eyebrow">404</p>
        <h1>페이지를 찾을 수 없어요</h1>
        <p>주소가 바뀌었거나 존재하지 않는 학습 화면이에요.</p>
        <Link className="primary-link" to="/">
          홈으로 돌아가기
        </Link>
      </section>
    </main>
  )
}
