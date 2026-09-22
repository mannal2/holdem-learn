import './learning-ui.css'

interface ProgressBarProps { current: number; total: number; label: string }
export function ProgressBar({ current, total, label }: ProgressBarProps) {
  return <div className="progress"><div className="progress__meta"><span>{label}</span><span>{current}/{total}</span></div><div className="progress__track" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={total} aria-valuenow={current}><span style={{ width: `${total ? (current / total) * 100 : 0}%` }} /></div></div>
}
