const parts = [
  {
    id: 'part-0',
    eyebrow: 'Part 0',
    title: '한 판의 흐름 이해하기',
    description: '카드가 공개되는 순서와 플레이어의 기본 행동을 익혀요.',
  },
  {
    id: 'part-1',
    eyebrow: 'Part 1',
    title: '시작 패의 가치 판단하기',
    description: '두 장의 특징을 읽고 포지션에 따라 판단하는 법을 익혀요.',
  },
]

export function HomePage() {
  return (
    <main className="page-shell">
      <header className="hero-panel">
        <p className="eyebrow">HOLDEM LEARNING PATH</p>
        <h1>홀덤을 판단하는 법부터 배워요</h1>
        <p className="hero-copy">
          긴 설명을 외우기보다 직접 고르고, 바로 이유를 확인하면서 홀덤의
          흐름과 판단 기준을 익힙니다.
        </p>
      </header>

      <section aria-labelledby="learning-path-title">
        <h2 id="learning-path-title">학습 경로</h2>
        <div className="part-grid">
          {parts.map((part) => (
            <article className="part-card" key={part.id}>
              <p className="part-card__eyebrow">{part.eyebrow}</p>
              <h3>{part.title}</h3>
              <p>{part.description}</p>
              <span className="part-card__status">준비 중</span>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
