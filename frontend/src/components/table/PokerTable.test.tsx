import { render, screen, within } from '@testing-library/react'
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

it('공용 카드와 내 카드를 제목이 보이는 서로 다른 영역에 표시한다', () => {
  render(<PokerTable stage="turn" holeCards={[aceSpades, kingHearts]} communityCards={[sevenClubs, jackDiamonds, twoSpades, queenClubs]} />)
  const board = screen.getByRole('group', { name: '공용 카드' })
  const hand = screen.getByRole('group', { name: '내 개인 카드' })
  expect(within(board).getByRole('heading', { name: '공용 카드' })).toBeVisible()
  expect(within(hand).getByRole('heading', { name: '내 카드' })).toBeVisible()
  expect(within(board).getAllByTestId('community-card')).toHaveLength(4)
  expect(within(board).queryByLabelText('스페이드 에이스')).not.toBeInTheDocument()
  expect(within(hand).getByLabelText('스페이드 에이스')).toBeInTheDocument()
  expect(within(hand).getByLabelText('하트 킹')).toBeInTheDocument()
  expect(within(hand).queryByLabelText('클로버 7')).not.toBeInTheDocument()
})

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

it('턴에서는 다섯 번째 카드가 정의되어 있어도 이름을 숨긴다', () => {
  render(<PokerTable stage="turn" holeCards={[aceSpades, kingHearts]} communityCards={[sevenClubs, jackDiamonds, twoSpades, queenClubs, tenHearts]} />)
  expect(screen.getByLabelText('클로버 퀸')).toBeInTheDocument()
  expect(screen.queryByLabelText('하트 10')).not.toBeInTheDocument()
  expect(screen.getAllByLabelText('뒤집힌 카드')).toHaveLength(1)
})
