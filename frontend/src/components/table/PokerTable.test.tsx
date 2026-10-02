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

it('플랍 문제에 세 장만 지정하면 아직 나오지 않은 두 자리는 표시하지 않는다', () => {
  render(<PokerTable stage="flop" holeCards={[aceSpades, kingHearts]} communityCards={[sevenClubs, jackDiamonds, twoSpades]} />)
  expect(screen.getAllByTestId('community-card')).toHaveLength(3)
  expect(screen.queryAllByLabelText('뒤집힌 카드')).toHaveLength(0)
})
