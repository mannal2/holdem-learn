import './learning-ui.css'

interface FeedbackPanelProps { status: 'correct' | 'incorrect'; title: string; explanation: string }
export function FeedbackPanel({ status, title, explanation }: FeedbackPanelProps) {
  return <section className={`feedback feedback--${status}`} role="status"><strong><span aria-hidden="true">{status === 'correct' ? '✓' : '!'}</span> {title}</strong><p>{explanation}</p></section>
}
