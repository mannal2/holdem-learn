import type { RangeSceneVisual } from '../../types/course'
import type { PlayingCard as Card } from '../../types/cards'
import { PlayingCard } from '../../components/cards/PlayingCard'
import '../../components/table/poker-table.css'
import './range-illustration.css'

// 데이터에 정한 후보·상태만 그립니다. 추론·채점·확률 계산은 하지 않습니다.
export function RangeIllustration({ visual }: { visual: RangeSceneVisual }) {
  const cards = (items: Card[], highlights: Card[] = [], latest = false) => items.map((card, index) => <span key={card.rank + card.suit} className={highlights.some(c => c.rank === card.rank && c.suit === card.suit) ? 'poker-table__highlight' : undefined}>
    <PlayingCard card={card} />
    {latest && index === items.length - 1 && <span className="poker-table__new-card">{visual.stage === 'turn' ? '턴 · 추가' : '리버 · 추가'}</span>}
  </span>)
  const stageNames = { preflop: '프리플랍', flop: '플랍', turn: '턴', river: '리버' }
  return <div className="range-scene rule-illustration">
    {visual.board.length > 0 && <div className="poker-table__board" role="group" aria-label="공용 카드"><h3 className="poker-table__label">공용 카드 · {stageNames[visual.stage]} {visual.board.length}장</h3><div className="poker-table__cards">{cards(visual.board, visual.boardHighlights, visual.markLatestCard)}</div></div>}
    {visual.holeCards && <div className="poker-table__hand" role="group" aria-label="내 개인 카드"><h3 className="poker-table__label">내 카드 · 2장</h3><div className="poker-table__cards">{cards(visual.holeCards, visual.holeHighlights)}</div></div>}
    {visual.history && <div className="range-history" role="group" aria-label="지금까지의 행동"><h3>지금까지의 행동</h3><ol>{visual.history.map((action, index) => <li key={index}>{action}</li>)}</ol></div>}
    {visual.candidates.length > 0 && <section aria-label="가능한 상대 패 예시"><h3>가능한 상대 패 예시</h3><div className="range-candidates">{visual.candidates.map(candidate => <div className="range-candidate" role="group" aria-label={candidate.label} key={candidate.label}><h4>{candidate.label}</h4><div className="poker-table__cards">{cards(candidate.cards, candidate.highlightedCards)}</div>{candidate.status && <p className="range-candidate__status">{candidate.status}</p>}</div>)}</div></section>}
  </div>
}
