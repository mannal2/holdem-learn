import type { PositionGroup } from '../../types/course'
import '../../features/learning/rule-illustration.css'

const groups: { id: PositionGroup; label: string }[] = [
  { id: 'early', label: '초반 포지션' },
  { id: 'middle', label: '중간 포지션' },
  { id: 'late', label: '후반 포지션' },
]

export function PositionDiagram({ activeGroup, detailed = false, foldedBefore = false, activeLabel = '내 자리' }: { activeGroup: PositionGroup; detailed?: boolean; foldedBefore?: boolean; activeLabel?: string }) {
  if (detailed) {
    // 프리플랍 순서입니다. 후반의 버튼 뒤에도 SB·BB가 남습니다.
    const order = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB']
    const activeSeat = { early: 'UTG', middle: 'HJ', late: 'BTN' }[activeGroup]
    const labels: Record<string, string> = { UTG: 'UTG', HJ: 'HJ', CO: 'CO', BTN: '딜러 버튼', SB: 'SB', BB: 'BB' }
    const names: Record<string, string> = { UTG: '언더 더 건', HJ: '하이잭', CO: '컷오프', BTN: '버튼 · 후반', SB: '스몰 블라인드', BB: '빅 블라인드' }
    return <div className="rule-illustration">
      <div className="rule-seats" role="group" aria-label="6인 테이블 포지션">
        <div className="rule-seats__center">프리플랍 행동 순서<span>UTG → HJ → CO → 버튼 → SB → BB ↻</span></div>
        {['BTN', 'SB', 'BB', 'UTG', 'HJ', 'CO'].map((seat, index) => {
          const mine = seat === activeSeat
          const before = order.indexOf(seat) < order.indexOf(activeSeat)
          const folded = foldedBefore && before
          const status = mine ? activeLabel : before ? folded ? '이미 폴드' : '앞서 행동' : '아직 행동 전'
          return <div key={seat} role="group" aria-label={`${labels[seat]} · ${status}`} className={`rule-seat rule-seat--${index}${mine ? ' rule-seat--active' : ''}${folded ? ' rule-seat--folded' : ''}`}>
            <strong>{labels[seat]}</strong><small>{names[seat]}</small><span className="rule-seat__badge">{status}</span>
          </div>
        })}
      </div>
      <p className="rule-caption">{activeGroup === 'early' ? '초반 예시: UTG. 뒤에 5명이 남아 있어요.' : activeGroup === 'middle' ? '중간 예시: HJ. 앞선 행동을 봤지만 뒤에도 사람이 남아 있어요.' : '후반 예시: 딜러 버튼. 앞선 선택을 보고 결정하지만 뒤에 SB·BB가 남아 있어요.'}</p>
    </div>
  }
  return (
    <div className="position-diagram" aria-label="6인 테이블 포지션">
      <div className="position-diagram__table">6인 테이블</div>
      <ul>
        {groups.map((group) => (
          <li key={group.id} className={`position-diagram__group position-diagram__group--${group.id}`} aria-current={group.id === activeGroup ? 'true' : undefined}>
            {group.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
