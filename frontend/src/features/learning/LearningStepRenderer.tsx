import type { LearningStep, MultiChoiceStep, SingleChoiceStep } from '../../types/course'
import { PokerTable } from '../../components/table/PokerTable'
import { PositionDiagram } from '../../components/table/PositionDiagram'
import { HandRankingList } from './HandRankingList'
import { PlayingCard } from '../../components/cards/PlayingCard'

interface Props { step: LearningStep; selectedOptionIds: string[]; feedbackVisible: boolean; onSelect: (id: string, multiple: boolean) => void }
export function LearningStepRenderer({ step, selectedOptionIds, feedbackVisible, onSelect }: Props) {
  if (step.type === 'explanation') return <section><h2>{step.title}</h2><p>{step.body}</p>{step.handExamples && <HandRankingList examples={step.handExamples} />}</section>
  if (step.type === 'summary') return <section><h2>{step.title}</h2><p>{step.body}</p><ul>{step.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul></section>
  if (step.type === 'table-reveal') return <section><h2>{step.title}</h2><p>{step.body}</p><PokerTable stage={step.stage} holeCards={step.holeCards} communityCards={step.communityCards} /></section>
  if (step.type === 'position') return <section><h2>{step.title}</h2><p>{step.body}</p><PositionDiagram activeGroup={step.activeGroup} /></section>
  return <ChoiceStep step={step} selectedOptionIds={selectedOptionIds} feedbackVisible={feedbackVisible} onSelect={onSelect} />
}

function ChoiceStep({ step, selectedOptionIds, feedbackVisible, onSelect }: { step: SingleChoiceStep | MultiChoiceStep; selectedOptionIds: string[]; feedbackVisible: boolean; onSelect: (id: string, multiple: boolean) => void }) {
  const multiple = step.type === 'multi-choice'
  return <>{step.hands && <div className="practice-hands">{step.hands.map(group => <section key={group.label}><h2>{group.label}</h2><div className="card-row">{group.cards.map(card => <PlayingCard key={card.rank + card.suit} card={card} />)}</div></section>)}</div>}{step.position && <PositionDiagram activeGroup={step.position} />}{step.table && <PokerTable stage="flop" holeCards={step.table.holeCards} communityCards={step.table.communityCards} highlightedCards={feedbackVisible ? step.table.highlightedCards : []} />}<fieldset disabled={feedbackVisible}><legend>{step.prompt}</legend>{step.options.map((option) => <label key={option.id}><input type={multiple ? 'checkbox' : 'radio'} name={step.id} checked={selectedOptionIds.includes(option.id)} onChange={() => onSelect(option.id, multiple)} />{option.label}</label>)}</fieldset></>
}
