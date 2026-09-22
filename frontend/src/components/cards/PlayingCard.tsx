import type { PlayingCard as PlayingCardValue } from '../../types/cards'
import './playing-card.css'

const SUITS = {
  spades: { symbol: '♠', label: '스페이드', tone: 'black' },
  hearts: { symbol: '♥', label: '하트', tone: 'red' },
  diamonds: { symbol: '♦', label: '다이아몬드', tone: 'red' },
  clubs: { symbol: '♣', label: '클로버', tone: 'black' },
} as const

const RANK_LABELS = { A: '에이스', K: '킹', Q: '퀸', J: '잭' } as const

interface PlayingCardProps {
  card: PlayingCardValue
  hidden?: boolean
}

export function PlayingCard({ card, hidden = false }: PlayingCardProps) {
  if (hidden) {
    return <span className="playing-card playing-card--hidden" aria-label="뒤집힌 카드" />
  }

  const suit = SUITS[card.suit]
  const rankLabel = card.rank in RANK_LABELS
    ? RANK_LABELS[card.rank as keyof typeof RANK_LABELS]
    : card.rank

  return (
    <span className={`playing-card playing-card--${suit.tone}`} aria-label={`${suit.label} ${rankLabel}`}>
      <strong>{card.rank}</strong>
      <span aria-hidden="true">{suit.symbol}</span>
    </span>
  )
}
