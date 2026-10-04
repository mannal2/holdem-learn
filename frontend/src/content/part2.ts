import type { PlayingCard, CardRank, CardSuit } from '../types/cards'
import type { LessonDefinition, PartDefinition } from '../types/course'

const card = (rank: CardRank, suit: CardSuit): PlayingCard => ({ rank, suit })
const flop = (holeCards: [PlayingCard, PlayingCard], communityCards: [PlayingCard, PlayingCard, PlayingCard], highlightedCards: PlayingCard[] = []) => ({ holeCards, communityCards, highlightedCards })

const akHit = flop([card('A', 'spades'), card('K', 'spades')], [card('A', 'diamonds'), card('7', 'clubs'), card('2', 'hearts')], [card('A', 'spades'), card('A', 'diamonds')])
const akMiss = flop([card('A', 'spades'), card('K', 'spades')], [card('9', 'diamonds'), card('8', 'clubs'), card('2', 'hearts')], [card('A', 'spades')])
const highCard = flop([card('K', 'spades'), card('Q', 'diamonds')], [card('9', 'clubs'), card('7', 'hearts'), card('2', 'spades')], [card('K', 'spades')])
const pair = flop([card('J', 'spades'), card('8', 'diamonds')], [card('J', 'hearts'), card('5', 'clubs'), card('2', 'spades')], [card('J', 'spades'), card('J', 'hearts')])
const straight = flop([card('J', 'spades'), card('10', 'diamonds')], [card('Q', 'clubs'), card('9', 'hearts'), card('8', 'spades')], [card('J', 'spades'), card('10', 'diamonds'), card('Q', 'clubs'), card('9', 'hearts'), card('8', 'spades')])
const topPair = flop([card('K', 'spades'), card('Q', 'clubs')], [card('K', 'hearts'), card('8', 'diamonds'), card('2', 'spades')], [card('K', 'spades'), card('K', 'hearts')])
const middlePair = flop([card('A', 'spades'), card('8', 'clubs')], [card('K', 'hearts'), card('8', 'diamonds'), card('2', 'spades')], [card('8', 'clubs'), card('8', 'diamonds')])
const bottomPair = flop([card('A', 'spades'), card('2', 'clubs')], [card('K', 'hearts'), card('8', 'diamonds'), card('2', 'spades')], [card('2', 'clubs'), card('2', 'spades')])
const overpair = flop([card('9', 'spades'), card('9', 'hearts')], [card('7', 'clubs'), card('4', 'diamonds'), card('2', 'spades')], [card('9', 'spades'), card('9', 'hearts')])
const twoPair = flop([card('A', 'spades'), card('7', 'clubs')], [card('A', 'hearts'), card('7', 'diamonds'), card('2', 'spades')], [card('A', 'spades'), card('7', 'clubs'), card('A', 'hearts'), card('7', 'diamonds')])
const set = flop([card('8', 'spades'), card('8', 'hearts')], [card('A', 'clubs'), card('8', 'diamonds'), card('2', 'spades')], [card('8', 'spades'), card('8', 'hearts'), card('8', 'diamonds')])
const boardPair = flop([card('A', 'spades'), card('K', 'diamonds')], [card('9', 'clubs'), card('9', 'hearts'), card('2', 'spades')], [card('9', 'clubs'), card('9', 'hearts')])
const dryAces = flop([card('A', 'spades'), card('A', 'diamonds')], [card('7', 'clubs'), card('4', 'diamonds'), card('2', 'spades')], [card('A', 'spades'), card('A', 'diamonds')])
const wetAces = flop([card('A', 'spades'), card('A', 'diamonds')], [card('9', 'clubs'), card('8', 'clubs'), card('7', 'clubs')], [card('9', 'clubs'), card('8', 'clubs'), card('7', 'clubs')])

// 종합 도전은 앞 레슨의 카드를 그대로 기억해서 풀 수 없도록 별도의 상황을 사용합니다.
const challengeTop = flop([card('Q', 'spades'), card('9', 'diamonds')], [card('Q', 'hearts'), card('6', 'clubs'), card('2', 'diamonds')], [card('Q', 'spades'), card('Q', 'hearts')])
const challengeHigh = flop([card('A', 'spades'), card('J', 'diamonds')], [card('K', 'clubs'), card('8', 'hearts'), card('3', 'spades')], [card('A', 'spades')])
const challengeTwoPair = flop([card('K', 'spades'), card('4', 'clubs')], [card('K', 'hearts'), card('4', 'diamonds'), card('9', 'spades')], [card('K', 'spades'), card('4', 'clubs'), card('K', 'hearts'), card('4', 'diamonds')])
const challengeSet = flop([card('6', 'spades'), card('6', 'hearts')], [card('Q', 'clubs'), card('6', 'diamonds'), card('3', 'spades')], [card('6', 'spades'), card('6', 'hearts'), card('6', 'diamonds')])
const challengeBoardPair = flop([card('A', 'clubs'), card('Q', 'diamonds')], [card('10', 'spades'), card('10', 'hearts'), card('4', 'clubs')], [card('10', 'spades'), card('10', 'hearts')])
const challengeFlushRisk = flop([card('A', 'clubs'), card('J', 'diamonds')], [card('A', 'hearts'), card('9', 'hearts'), card('3', 'hearts')], [card('A', 'hearts'), card('9', 'hearts'), card('3', 'hearts')])

export const part2Lessons: Record<string, LessonDefinition> = {
  'preflop-to-flop': {
    id: 'preflop-to-flop', title: '같은 시작 패, 다른 플랍', objective: '시작 패의 기대와 플랍에서 완성된 패를 구분한다.', steps: [
      { id: 'p2-change-intro', type: 'explanation', title: '이제 공용 카드도 봐야 해요', body: '좋은 시작 패라도 플랍에 따라 달라져요. 공용 카드가 열리면 현재 족보를 다시 확인해요.', visual: { kind: 'starting-hands', groups: [{ label: '내 시작 패 · AKs', cards: akHit.holeCards }] } },
      { id: 'p2-change-hit', type: 'single-choice', table: akHit, prompt: '이 플랍에서 현재 내 족보는 무엇인가요?', options: [{ id: 'pair', label: 'A 원 페어' }, { id: 'high', label: 'A 하이 카드' }], correctOptionId: 'pair', explanation: '내 A♠와 공용 카드 A♦가 짝이 되어 A 원 페어입니다.' },
      { id: 'p2-change-miss', type: 'single-choice', table: akMiss, prompt: '같은 시작 패지만 이 플랍에서 현재 내 족보는 무엇인가요?', options: [{ id: 'pair', label: 'A 원 페어' }, { id: 'high', label: 'A 하이 카드' }], correctOptionId: 'high', explanation: 'A나 K와 짝이 없고 다른 족보도 없어 A 하이 카드예요. 이후 카드에 따라 달라질 수 있어요.' },
      { id: 'p2-change-summary', type: 'summary', title: '핵심 정리', body: '좋은 시작 패가 항상 강한 현재 패는 아니에요.', bullets: ['시작 패와 현재 족보는 다른 판단입니다.', '플랍이 바뀌면 같은 시작 패의 현재 가치도 바뀝니다.'] },
    ],
  },
  'read-current-hand': {
    id: 'read-current-hand', title: '다섯 장으로 현재 족보 읽기', objective: '내 카드 둘과 플랍 셋을 합쳐 현재 족보를 알아낸다.', steps: [
      { id: 'p2-read-intro', type: 'explanation', title: '플랍에서는 다섯 장을 함께 봐요', body: '내 카드 2장과 공용 카드 3장을 함께 봐요. 같은 숫자·무늬·연속된 숫자를 찾아 족보를 확인해요. 턴에는 6장, 리버에는 7장 중 가장 강한 5장을 골라요.', visual: { kind: 'table', stage: 'flop', holeCards: highCard.holeCards, communityCards: highCard.communityCards } },
      { id: 'p2-read-high', type: 'single-choice', table: highCard, prompt: '지금 보이는 다섯 장의 족보는?', options: [{ id: 'high', label: 'K 하이 카드' }, { id: 'pair', label: 'K 원 페어' }], correctOptionId: 'high', explanation: '같은 숫자도, 다른 완성된 족보도 없어요. 가장 높은 K를 기준으로 K 하이 카드예요.' },
      { id: 'p2-read-pair', type: 'single-choice', table: pair, prompt: '지금 보이는 다섯 장의 족보는?', options: [{ id: 'high', label: 'J 하이 카드' }, { id: 'pair', label: 'J 원 페어' }], correctOptionId: 'pair', explanation: '내 J♠와 공용 J♥가 같은 숫자라 J 원 페어예요. 무늬는 달라도 괜찮아요.' },
      { id: 'p2-read-straight', type: 'single-choice', table: straight, prompt: '8·9·10·J·Q가 모두 보입니다. 현재 족보는?', options: [{ id: 'straight', label: '스트레이트' }, { id: 'high', label: 'Q 하이 카드' }], correctOptionId: 'straight', explanation: '무늬가 달라도 8부터 Q까지 다섯 숫자가 연속되어 스트레이트입니다.' },
      { id: 'p2-read-summary', type: 'summary', title: '핵심 정리', body: '내 카드와 공용 카드를 함께 보고 족보를 찾아요.', bullets: ['공용 카드가 추가되면 족보도 바뀔 수 있어요.', '같은 숫자·같은 무늬·연속된 숫자를 확인해요.'] },
    ],
  },
  'pair-types': {
    id: 'pair-types', title: '원 페어의 위치 구분하기', objective: '탑·미들·바텀 페어와 오버페어를 카드에서 찾는다.', steps: [
      { id: 'p2-pairs-intro', type: 'explanation', title: '같은 원 페어라도 위치가 달라요', body: '내 카드가 공용 카드 중 어느 숫자와 짝이 됐는지 봐요. 탑·미들·바텀은 행동 순서가 아니라 페어의 높이를 뜻해요.', visual: { kind: 'ranked-board', cards: topPair.communityCards, labels: ['탑 · 가장 높음', '미들 · 가운데', '바텀 · 가장 낮음'] } },
      { id: 'p2-pairs-top', type: 'single-choice', table: topPair, prompt: '내 K가 공용 K와 짝이 됐어요. 어떤 페어인가요?', options: [{ id: 'top', label: '탑 페어' }, { id: 'middle', label: '미들 페어' }, { id: 'bottom', label: '바텀 페어' }], correctOptionId: 'top', explanation: 'K는 플랍에서 가장 높은 숫자이고 내 K♠와 공용 카드 K♥가 짝입니다.' },
      { id: 'p2-pairs-middle', type: 'single-choice', table: middlePair, prompt: '같은 플랍에서 내 8이 만든 페어는?', options: [{ id: 'top', label: '탑 페어' }, { id: 'middle', label: '미들 페어' }, { id: 'bottom', label: '바텀 페어' }], correctOptionId: 'middle', explanation: '8은 플랍의 가운데 숫자이며 내 8♣와 공용 카드 8♦가 짝입니다.' },
      { id: 'p2-pairs-bottom', type: 'single-choice', table: bottomPair, prompt: '같은 플랍에서 내 2가 만든 페어는?', options: [{ id: 'top', label: '탑 페어' }, { id: 'middle', label: '미들 페어' }, { id: 'bottom', label: '바텀 페어' }], correctOptionId: 'bottom', explanation: '2는 플랍에서 가장 낮은 숫자이며 내 2♣와 공용 카드 2♠가 짝입니다.' },
      { id: 'p2-pairs-over', type: 'single-choice', table: overpair, prompt: '내 9 두 장은 공용 카드와 짝이 없으니 페어가 없을까요?', options: [{ id: 'overpair', label: '아니요. 9 오버페어가 있어요.' }, { id: 'none', label: '네. 페어가 없어요.' }], correctOptionId: 'overpair', explanation: '처음부터 가진 9 포켓 페어가 있습니다. 9는 플랍에서 가장 높은 7보다도 커서 오버페어입니다.' },
      { id: 'p2-pairs-summary', type: 'summary', title: '핵심 정리', body: '먼저 짝을 찾고, 공용 카드에서 그 숫자의 높이를 봐요.', bullets: ['가장 높은 숫자와 짝 → 탑 / 가운데 → 미들 / 가장 낮은 숫자 → 바텀', '내 포켓 페어가 공용 카드 모두보다 높으면 오버페어예요.'] },
    ],
  },
  'two-pair-and-set': {
    id: 'two-pair-and-set', title: '투 페어와 셋 찾기', objective: '두 종류의 짝과 포켓 페어로 만든 셋을 구분한다.', steps: [
      { id: 'p2-strong-intro', type: 'explanation', title: '짝이 더 늘어나면?', body: '서로 다른 두 숫자가 각각 짝이면 투 페어예요. 아래처럼 내 포켓 페어에 공용 카드 한 장이 더해지면 셋이에요. 족보는 같은 숫자 세 장인 트리플이에요.', visual: { kind: 'table', stage: 'flop', ...set } },
      { id: 'p2-strong-two-pair', type: 'single-choice', table: twoPair, prompt: 'A와 7이 각각 짝이 되었습니다. 현재 족보는?', options: [{ id: 'pair', label: '원 페어' }, { id: 'two-pair', label: '투 페어' }, { id: 'set', label: '셋' }], correctOptionId: 'two-pair', explanation: '내 A와 공용 A, 내 7과 공용 7이 각각 짝이 되어 투 페어입니다.' },
      { id: 'p2-strong-set', type: 'single-choice', table: set, prompt: '내 8 포켓 페어에 공용 카드 8이 더해졌습니다. 현재 패는?', options: [{ id: 'pair', label: '원 페어' }, { id: 'two-pair', label: '투 페어' }, { id: 'set', label: '셋' }], correctOptionId: 'set', explanation: '내 8 두 장과 플랍의 8 한 장으로 같은 숫자 세 장을 만들었습니다. 포켓 페어로 만든 이 형태를 셋이라고 합니다.' },
      { id: 'p2-strong-summary', type: 'summary', title: '핵심 정리', body: '강조된 카드에서 짝과 같은 숫자 세 장을 찾아요.', bullets: ['투 페어: 서로 다른 숫자의 페어 두 종류', '셋: 내 포켓 페어 2장 + 같은 숫자의 공용 카드 1장'] },
    ],
  },
  'board-and-risk': {
    id: 'board-and-risk', title: '공용 카드와 위험 살피기', objective: '보드의 짝을 내 카드의 짝과 구별하고 보드의 위험을 살핀다.', steps: [
      { id: 'p2-board-intro', type: 'explanation', title: '공용 카드는 상대도 써요', body: '공용 카드의 짝은 상대도 써요. 내 카드가 어떤 역할을 하는지 확인해요.' },
      { id: 'p2-board-pair', type: 'single-choice', table: boardPair, prompt: '현재 9 원 페어는 내 A나 K가 공용 카드와 짝이 되어 만든 건가요?', options: [{ id: 'no', label: '아니요. 9 두 장이 공용 카드에 있어요.' }, { id: 'yes', label: '네. 내 A가 공용 카드와 짝이 됐어요.' }], correctOptionId: 'no', explanation: '9 두 장은 모두 공용 카드라 상대도 써요. 내 A와 K가 만든 페어는 아니에요.' },
      { id: 'p2-board-dry', type: 'table-reveal', stage: 'flop', holeCards: dryAces.holeCards, communityCards: dryAces.communityCards, title: '같은 A 포켓 페어 · 첫 번째 플랍', body: '무늬가 제각각이고 숫자가 떨어져 있어요. 이 플랍에서 상대가 플러시나 스트레이트를 이미 완성할 수는 없어요. 그래도 셋 같은 더 강한 패는 가능해요.' },
      { id: 'p2-board-wet', type: 'table-reveal', stage: 'flop', holeCards: wetAces.holeCards, communityCards: wetAces.communityCards, title: '같은 A 포켓 페어 · 두 번째 플랍', body: '같은 무늬 · 이어지는 숫자에 주의해요. 내 패는 여전히 A 원 페어지만, 상대가 클로버 두 장이면 플러시, J·10이면 스트레이트일 수 있어요.' },
      { id: 'p2-board-risk', type: 'single-choice', prompt: '내 패는 A 원 페어예요. 상대의 플러시·스트레이트를 더 주의할 플랍은?', options: [{ id: 'first', label: '7♣ 4♦ 2♠' }, { id: 'second', label: '9♣ 8♣ 7♣' }], correctOptionId: 'second', explanation: '9♣ 8♣ 7♣에서는 상대가 플러시나 스트레이트를 이미 만들었을 수 있어요. 실제 상대 패를 안다는 뜻은 아니에요.' },
      { id: 'p2-board-summary', type: 'summary', title: '핵심 정리', body: '내 족보가 같아도 공용 카드에 따라 위험은 달라져요.', bullets: ['공용 카드의 페어는 상대도 써요.', '같은 무늬·이어지는 숫자를 살펴요.', '내 족보만으로 지금 이긴다고 단정할 수 없어요.'] },
    ],
  },
  'flop-reading-challenge': {
    id: 'flop-reading-challenge', title: '플랍 이후 패 읽기 도전', objective: '처음 보는 플랍에서도 현재 족보와 공용 카드의 위험을 설명한다.', passingPercentage: 80, steps: [
      { id: 'p2-challenge-checklist', type: 'summary', title: '처음 보는 플랍을 판단하는 순서', body: '새로운 카드에서도 이 순서로 판단해요.', bullets: ['현재 족보는 무엇인가?', '그 족보를 만든 카드는 내 카드인가, 공용 카드인가?', '이 보드에서 상대도 더 강한 패를 만들 수 있는가?'] },
      { id: 'p2-challenge-top', type: 'single-choice', table: challengeTop, prompt: '현재 어떤 페어인가요?', options: [{ id: 'middle', label: '9 미들 페어: 내 9와 공용 카드의 9가 짝' }, { id: 'top', label: 'Q 탑 페어: 내 Q와 플랍에서 가장 높은 Q가 짝' }, { id: 'high', label: 'Q 하이 카드: 짝이 없음' }], correctOptionId: 'top', explanation: '내 Q♠와 공용 카드 Q♥가 짝입니다. Q는 플랍에서 가장 높은 숫자이므로 탑 페어입니다.' },
      { id: 'p2-challenge-high', type: 'single-choice', table: challengeHigh, prompt: '플랍이 열린 지금의 족보는?', options: [{ id: 'high', label: 'A 하이 카드: 짝이나 완성된 다른 족보가 없음' }, { id: 'pair', label: 'A 원 페어: 높은 A를 가지고 있음' }], correctOptionId: 'high', explanation: 'A 한 장만으로는 페어가 아니에요. 짝이나 다른 족보가 없어 A 하이 카드예요.' },
      { id: 'p2-challenge-two-pair', type: 'single-choice', table: challengeTwoPair, prompt: '현재 족보와 근거가 맞는 것은?', options: [{ id: 'pair', label: '원 페어: K 두 장만' }, { id: 'set', label: '셋: K 세 장' }, { id: 'two-pair', label: '투 페어: K 두 장과 4 두 장' }], correctOptionId: 'two-pair', explanation: '내 K와 공용 K, 내 4와 공용 4가 각각 짝이 됩니다.' },
      { id: 'p2-challenge-set', type: 'single-choice', table: challengeSet, prompt: '6 세 장은 어떻게 만들어졌나요?', options: [{ id: 'board', label: '공용 카드에만 있는 6 세 장' }, { id: 'set', label: '내 6 포켓 페어와 공용 카드 6 한 장으로 만든 셋' }, { id: 'two-pair', label: '6 두 장과 Q 두 장으로 만든 투 페어' }], correctOptionId: 'set', explanation: '내 6♠·6♥와 공용 카드 6♦가 합쳐져 셋이 되었습니다.' },
      { id: 'p2-challenge-board-pair', type: 'single-choice', table: challengeBoardPair, prompt: '현재 10 원 페어에 대한 설명으로 맞는 것은?', options: [{ id: 'shared', label: '10 두 장이 공용 카드에 있어 상대도 사용할 수 있다.' }, { id: 'private', label: '내 A와 공용 카드가 짝이 되어 나만 10 페어를 쓴다.' }], correctOptionId: 'shared', explanation: '10♠와 10♥는 모두 공용 카드입니다. 내 A나 Q가 10 페어를 만든 것이 아닙니다.' },
      { id: 'p2-challenge-flush-risk', type: 'single-choice', table: challengeFlushRisk, prompt: '현재 내 패와 보드의 위험을 함께 설명한 것은?', options: [{ id: 'safe', label: 'A 원 페어이므로 상대는 플러시를 만들 수 없다.' }, { id: 'my-flush', label: '내가 이미 플러시를 만들었다.' }, { id: 'caution', label: 'A 원 페어지만 상대가 하트 두 장으로 이미 플러시를 만들었을 수도 있다.' }], correctOptionId: 'caution', explanation: '내 A♣와 공용 A♥는 원 페어예요. 공용 하트 세 장에 상대의 하트 두 장이 더해지면 플러시지만, 실제 상대 패는 아직 몰라요.' },
    ],
  },
}

export const part2: PartDefinition = {
  id: 'part-2', order: 2, title: '플랍 이후 내 패의 현재 가치 판단', description: '내 카드와 플랍을 합쳐 현재 패를 읽고, 보드에 따라 판단이 달라짐을 익힙니다.',
  lessonIds: ['preflop-to-flop', 'read-current-hand', 'pair-types', 'two-pair-and-set', 'board-and-risk', 'flop-reading-challenge'],
}
