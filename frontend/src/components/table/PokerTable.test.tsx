import { render, screen } from '@testing-library/react'
import {
  aceSpades,
  jackDiamonds,
  kingHearts,
  queenClubs,
  sevenClubs,
  tenHearts,
  twoSpades,
} from '../../test/cardFixtures'
import { PokerTable } from './PokerTable'

it('플랍에서는 공용 카드 세 장만 공개한다', () => {
  render(
    <PokerTable
      stage="flop"
      holeCards={[aceSpades, kingHearts]}
      communityCards={[
        sevenClubs,
        jackDiamonds,
        twoSpades,
        queenClubs,
        tenHearts,
      ]}
    />,
  )
  expect(screen.getAllByTestId('community-card')).toHaveLength(5)
  expect(screen.getAllByLabelText('뒤집힌 카드')).toHaveLength(2)
})
