import type { PlayingCard as Card } from '../../types/cards'
import type { CommunityCards, TableStage } from '../../types/course'
import { PlayingCard } from '../cards/PlayingCard'
import './poker-table.css'

const VISIBLE_CARDS: Record<TableStage, number> = {
  preflop: 0,
  flop: 3,
  turn: 4,
  river: 5,
  showdown: 5,
}

interface PokerTableProps {
  stage: TableStage
  holeCards: [Card, Card]
  communityCards: CommunityCards
  highlightedCards?: Card[]
  opponentCards?: [Card, Card]
  markLatestCard?: boolean
}

export function PokerTable({ stage, holeCards, communityCards, highlightedCards = [], opponentCards, markLatestCard = false }: PokerTableProps) {
  const visibleCount = VISIBLE_CARDS[stage]
  const isHighlighted = (card: Card) => highlightedCards.some((highlighted) => highlighted.rank === card.rank && highlighted.suit === card.suit)
  return (
    <section className="poker-table" aria-label="홀덤 테이블">
      <div className="poker-table__board" role="group" aria-label="공용 카드">
        <h3 className="poker-table__label">공용 카드</h3>
        <p className="poker-table__description">모두가 함께 사용하는 카드</p>
        <div className="poker-table__cards">
        {communityCards.map((card, index) => <span data-testid="community-card" className={index < visibleCount && isHighlighted(card) ? 'poker-table__highlight' : undefined} key={`${card.rank}-${card.suit}`}>
          <PlayingCard card={card} hidden={index >= visibleCount} />
          {markLatestCard && (stage === 'turn' || stage === 'river') && index === visibleCount - 1 && <small className="poker-table__new-card">이번에 공개</small>}
        </span>)}
        </div>
      </div>
      <div className="poker-table__hand" role="group" aria-label="내 개인 카드">
        <h3 className="poker-table__label">내 카드</h3>
        <p className="poker-table__description">나만 사용하는 2장</p>
        <div className="poker-table__cards">
        {holeCards.map((card) => <span className={isHighlighted(card) ? 'poker-table__highlight' : undefined} key={`${card.rank}-${card.suit}`}><PlayingCard card={card} /></span>)}
        </div>
      </div>
      {opponentCards && <div className="poker-table__hand" role="group" aria-label="가정한 상대 카드">
        <h3 className="poker-table__label">가정한 상대 카드</h3>
        <p className="poker-table__description">실제 공개된 상대 카드가 아닌 비교 예시</p>
        <div className="poker-table__cards">
          {opponentCards.map(card => <span className={isHighlighted(card) ? 'poker-table__highlight' : undefined} key={`${card.rank}-${card.suit}`}><PlayingCard card={card} /></span>)}
        </div>
      </div>}
    </section>
  )
}
