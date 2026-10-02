import { PlayingCard } from '../../components/cards/PlayingCard'
import type { HandRankingExample } from '../../types/course'
import './hand-ranking-list.css'

export function HandRankingList({ examples }: { examples: HandRankingExample[] }) {
  return (
    <ol className="hand-ranking-list" aria-label="족보 강한 순서">
      {examples.map((example) => (
        <li className="hand-ranking-list__item" key={example.name}>
          <div className="hand-ranking-list__text">
            <h3>{example.name}</h3>
            <p>{example.description}</p>
          </div>
          <div className="hand-ranking-list__cards" role="group" aria-label={`${example.name} 카드 예시`}>
            {example.cards.map((card) => <PlayingCard card={card} key={`${card.rank}-${card.suit}`} />)}
          </div>
        </li>
      ))}
    </ol>
  )
}
