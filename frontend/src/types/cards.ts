export type CardRank =
  | 'A'
  | 'K'
  | 'Q'
  | 'J'
  | '10'
  | '9'
  | '8'
  | '7'
  | '6'
  | '5'
  | '4'
  | '3'
  | '2'

export type CardSuit = 'spades' | 'hearts' | 'diamonds' | 'clubs'

export interface PlayingCard {
  rank: CardRank
  suit: CardSuit
}
