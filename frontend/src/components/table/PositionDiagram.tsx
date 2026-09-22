import type { PositionGroup } from '../../types/course'

const groups: { id: PositionGroup; label: string }[] = [
  { id: 'early', label: '초반 포지션' },
  { id: 'middle', label: '중간 포지션' },
  { id: 'late', label: '후반 포지션' },
]

export function PositionDiagram({ activeGroup }: { activeGroup: PositionGroup }) {
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
