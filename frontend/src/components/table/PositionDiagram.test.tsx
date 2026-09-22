import { render, screen } from '@testing-library/react'
import { PositionDiagram } from './PositionDiagram'

it('활성 포지션을 글과 현재 상태로 함께 표시한다', () => {
  render(<PositionDiagram activeGroup="late" />)
  expect(screen.getByText('후반 포지션')).toHaveAttribute('aria-current', 'true')
  expect(screen.getByText('초반 포지션')).not.toHaveAttribute('aria-current')
})
