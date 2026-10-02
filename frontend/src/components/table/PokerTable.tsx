import type { PlayingCard as Card } from '../../types/cards'
import type { TableStage } from '../../types/course'
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
  communityCards: [Card, Card, Card] | [Card, Card, Card, Card, Card]
  highlightedCards?: Card[]
}

export function PokerTable({ stage, holeCards, communityCards, highlightedCards = [] }: PokerTableProps) {
  const visibleCount = VISIBLE_CARDS[stage]
  const isHighlighted = (card: Card) => highlightedCards.some((highlighted) => highlighted.rank === card.rank && highlighted.suit === card.suit)
  return (
    <section className="poker-table" aria-label="홀덤 테이블">
      <div className="poker-table__board" aria-label="공용 카드">
        {communityCards.map((card, index) => <span data-testid="community-card" className={index < visibleCount && isHighlighted(card) ? 'poker-table__highlight' : undefined} key={`${card.rank}-${card.suit}`}>
          <PlayingCard card={card} hidden={index >= visibleCount} />
        </span>)}
      </div>
      <div className="poker-table__hand" aria-label="내 개인 카드">
        {holeCards.map((card) => <span className={isHighlighted(card) ? 'poker-table__highlight' : undefined} key={`${card.rank}-${card.suit}`}><PlayingCard card={card} /></span>)}
      </div>
    </section>
  )
}
