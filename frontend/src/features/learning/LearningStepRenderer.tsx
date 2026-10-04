import type { LearningStep, MultiChoiceStep, SingleChoiceStep } from '../../types/course'
import { PokerTable } from '../../components/table/PokerTable'
import { PositionDiagram } from '../../components/table/PositionDiagram'
import { HandRankingList } from './HandRankingList'
import { PlayingCard } from '../../components/cards/PlayingCard'
import './lesson-card-groups.css'
import { RuleIllustration } from './RuleIllustration'

interface Props { step: LearningStep; selectedOptionIds: string[]; feedbackVisible: boolean; onSelect: (id: string, multiple: boolean) => void }
export function LearningStepRenderer({ step, selectedOptionIds, feedbackVisible, onSelect }: Props) {
  if (step.type === 'explanation') return <section><h2>{step.title}</h2><p>{step.body}</p>{step.visual && <RuleIllustration visual={step.visual} />}{step.handExamples && <HandRankingList examples={step.handExamples} />}{step.cardGroups?.map(group => <div className="lesson-card-group" key={group.label}><h3>{group.label}</h3><div className="lesson-card-group__cards" role="group" aria-label={group.label}>{group.cards.map(card => <PlayingCard key={card.rank + card.suit} card={card} />)}</div></div>)}</section>
  if (step.type === 'summary') return <section><h2>{step.title}</h2><p>{step.body}</p>{step.visual && <RuleIllustration visual={step.visual} />}<ul>{step.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul></section>
  if (step.type === 'table-reveal') return <section><h2>{step.title}</h2><p>{step.body}</p><PokerTable stage={step.stage} holeCards={step.holeCards} communityCards={step.communityCards} highlightedCards={step.highlightedCards} opponentCards={step.opponentCards} markLatestCard={step.markLatestCard} />{step.visual && <RuleIllustration visual={step.visual} />}</section>
  if (step.type === 'position') return <section><h2>{step.title}</h2><p>{step.body}</p>{step.visual ? <RuleIllustration visual={step.visual} /> : <PositionDiagram activeGroup={step.activeGroup} />}</section>
  return <ChoiceStep step={step} selectedOptionIds={selectedOptionIds} feedbackVisible={feedbackVisible} onSelect={onSelect} />
}

function ChoiceStep({ step, selectedOptionIds, feedbackVisible, onSelect }: { step: SingleChoiceStep | MultiChoiceStep; selectedOptionIds: string[]; feedbackVisible: boolean; onSelect: (id: string, multiple: boolean) => void }) {
  const multiple = step.type === 'multi-choice'
  const visual = feedbackVisible ? step.feedbackVisual ?? step.visual : step.visual
  return <>
    {step.conditions && <ul className="rule-conditions" aria-label="이번 상황의 조건">{step.conditions.map(condition => <li key={condition}>{condition}</li>)}</ul>}
    {visual && !step.table && <RuleIllustration visual={visual} />}
    {step.hands && <div className="practice-hands">{step.hands.map(group => <section key={group.label}><h2>{group.label}</h2><div className="card-row">{group.cards.map(card => <PlayingCard key={card.rank + card.suit} card={card} />)}</div></section>)}</div>}
    {step.position && <PositionDiagram activeGroup={step.position} />}
    {step.table && <PokerTable stage={step.table.stage ?? 'flop'} holeCards={step.table.holeCards} communityCards={step.table.communityCards} highlightedCards={feedbackVisible ? step.table.highlightedCards : []} opponentCards={feedbackVisible ? step.table.feedbackOpponentCards ?? step.table.opponentCards : step.table.opponentCards} />}
    {visual && step.table && <RuleIllustration visual={visual} />}
    {feedbackVisible && step.feedbackCardGroups?.map(group => <div className="lesson-card-group" key={group.label}>
      <h3>{group.label}</h3>
      <div className="lesson-card-group__cards" role="group" aria-label={group.label}>{group.cards.map(card =>
        <span key={card.rank + card.suit} className={group.highlightedCards?.some(c => c.rank === card.rank && c.suit === card.suit) ? 'poker-table__highlight' : undefined}><PlayingCard card={card} /></span>,
      )}</div>
    </div>)}
    <fieldset disabled={feedbackVisible}><legend>{step.prompt}</legend>{step.options.map((option) => <label key={option.id}><input type={multiple ? 'checkbox' : 'radio'} name={step.id} checked={selectedOptionIds.includes(option.id)} onChange={() => onSelect(option.id, multiple)} />{option.label}</label>)}</fieldset>
  </>
}
