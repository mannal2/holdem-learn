import { render, screen } from '@testing-library/react'
import { aceSpades } from '../../test/cardFixtures'
import { PlayingCard } from './PlayingCard'

it('스페이드 에이스의 숫자와 접근성 이름을 표시한다', () => {
  render(<PlayingCard card={aceSpades} />)
  expect(screen.getByLabelText('스페이드 에이스')).toBeInTheDocument()
  expect(screen.getByText('A')).toBeInTheDocument()
  expect(screen.getByText('♠')).toBeInTheDocument()
})

it('뒤집힌 카드는 실제 값을 노출하지 않는다', () => {
  render(<PlayingCard card={aceSpades} hidden />)
  expect(screen.getByLabelText('뒤집힌 카드')).toBeInTheDocument()
  expect(screen.queryByLabelText('스페이드 에이스')).not.toBeInTheDocument()
})
