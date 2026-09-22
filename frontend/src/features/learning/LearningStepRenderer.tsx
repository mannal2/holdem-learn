import type { LearningStep, MultiChoiceStep, SingleChoiceStep } from '../../types/course'
import { PokerTable } from '../../components/table/PokerTable'

interface Props { step: LearningStep; selectedOptionIds: string[]; feedbackVisible: boolean; onSelect: (id: string, multiple: boolean) => void }
export function LearningStepRenderer({ step, selectedOptionIds, feedbackVisible, onSelect }: Props) {
  if (step.type === 'explanation') return <section><h2>{step.title}</h2><p>{step.body}</p></section>
  if (step.type === 'summary') return <section><h2>{step.title}</h2><p>{step.body}</p><ul>{step.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul></section>
  if (step.type === 'table-reveal') return <section><h2>{step.title}</h2><p>{step.body}</p><PokerTable stage={step.stage} holeCards={step.holeCards} communityCards={step.communityCards} /></section>
  return <ChoiceStep step={step} selectedOptionIds={selectedOptionIds} feedbackVisible={feedbackVisible} onSelect={onSelect} />
}

function ChoiceStep({ step, selectedOptionIds, feedbackVisible, onSelect }: { step: SingleChoiceStep | MultiChoiceStep; selectedOptionIds: string[]; feedbackVisible: boolean; onSelect: (id: string, multiple: boolean) => void }) {
  const multiple = step.type === 'multi-choice'
  return <fieldset disabled={feedbackVisible}><legend>{step.prompt}</legend>{step.options.map((option) => <label key={option.id}><input type={multiple ? 'checkbox' : 'radio'} name={step.id} checked={selectedOptionIds.includes(option.id)} onChange={() => onSelect(option.id, multiple)} />{option.label}</label>)}</fieldset>
}
