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
      { id: 'p2-change-intro', type: 'explanation', title: '이제 공용 카드도 봐야 해요', body: 'A♠ K♠는 좋은 시작 패입니다. 하지만 플랍이 공개되면 내 카드와 공용 카드 세 장을 합쳐 현재 패를 다시 판단해야 합니다.' },
      { id: 'p2-change-hit', type: 'single-choice', table: akHit, prompt: '이 플랍에서 현재 내 족보는 무엇인가요?', options: [{ id: 'pair', label: 'A 원 페어' }, { id: 'high', label: 'A 하이 카드' }], correctOptionId: 'pair', explanation: '내 A♠와 공용 카드 A♦가 짝이 되어 A 원 페어입니다.' },
      { id: 'p2-change-miss', type: 'single-choice', table: akMiss, prompt: '같은 시작 패지만 이 플랍에서 현재 내 족보는 무엇인가요?', options: [{ id: 'pair', label: 'A 원 페어' }, { id: 'high', label: 'A 하이 카드' }], correctOptionId: 'high', explanation: '내 A나 K와 짝이 되는 카드가 없고 다른 족보도 완성되지 않아 현재는 A 하이 카드입니다. 앞으로의 결과는 아직 모릅니다.' },
      { id: 'p2-change-summary', type: 'summary', title: '핵심 정리', body: '프리플랍에서 좋았던 카드가 플랍 이후에도 반드시 완성된 강한 패인 것은 아닙니다.', bullets: ['시작 패와 현재 족보는 다른 판단입니다.', '플랍이 바뀌면 같은 시작 패의 현재 가치도 바뀝니다.'] },
    ],
  },
  'read-current-hand': {
    id: 'read-current-hand', title: '다섯 장으로 현재 족보 읽기', objective: '내 카드 둘과 플랍 셋을 합쳐 현재 족보를 알아낸다.', steps: [
      { id: 'p2-read-intro', type: 'explanation', title: '플랍에서는 다섯 장을 함께 봐요', body: '지금 보이는 내 카드 두 장과 공용 카드 세 장으로 현재 족보를 읽습니다. 턴과 리버가 나오면 나중에 달라질 수 있는 패입니다.' },
      { id: 'p2-read-high', type: 'single-choice', table: highCard, prompt: '지금 보이는 다섯 장의 족보는?', options: [{ id: 'high', label: 'K 하이 카드' }, { id: 'pair', label: 'K 원 페어' }], correctOptionId: 'high', explanation: '같은 숫자의 카드가 없고 다른 족보도 없으므로 가장 높은 K를 기준으로 하는 하이 카드입니다.' },
      { id: 'p2-read-pair', type: 'single-choice', table: pair, prompt: '지금 보이는 다섯 장의 족보는?', options: [{ id: 'high', label: 'J 하이 카드' }, { id: 'pair', label: 'J 원 페어' }], correctOptionId: 'pair', explanation: '내 J♠와 공용 카드 J♥가 짝입니다.' },
      { id: 'p2-read-straight', type: 'single-choice', table: straight, prompt: '8·9·10·J·Q가 모두 보입니다. 현재 족보는?', options: [{ id: 'straight', label: '스트레이트' }, { id: 'high', label: 'Q 하이 카드' }], correctOptionId: 'straight', explanation: '무늬가 달라도 8부터 Q까지 다섯 숫자가 연속되어 스트레이트입니다.' },
      { id: 'p2-read-summary', type: 'summary', title: '핵심 정리', body: '내 카드만 따로 보지 말고 현재 공개된 다섯 장을 모두 살펴보세요.', bullets: ['현재 족보와 최종 쇼다운의 족보는 다를 수 있습니다.', '파트 0에서 배운 모든 족보를 다시 확인합니다.'] },
    ],
  },
  'pair-types': {
    id: 'pair-types', title: '원 페어의 위치 구분하기', objective: '탑·미들·바텀 페어와 오버페어를 카드에서 찾는다.', steps: [
      { id: 'p2-pairs-intro', type: 'explanation', title: '같은 원 페어라도 위치가 달라요', body: '내 카드가 플랍에서 가장 높은 숫자와 짝이면 탑 페어, 가운데 숫자면 미들 페어, 가장 낮은 숫자면 바텀 페어입니다.' },
      { id: 'p2-pairs-top', type: 'single-choice', table: topPair, prompt: 'K♥ 8♦ 2♠ 플랍에서 내 K가 만든 페어는?', options: [{ id: 'top', label: '탑 페어' }, { id: 'middle', label: '미들 페어' }, { id: 'bottom', label: '바텀 페어' }], correctOptionId: 'top', explanation: 'K는 플랍에서 가장 높은 숫자이고 내 K♠와 공용 카드 K♥가 짝입니다.' },
      { id: 'p2-pairs-middle', type: 'single-choice', table: middlePair, prompt: '같은 플랍에서 내 8이 만든 페어는?', options: [{ id: 'top', label: '탑 페어' }, { id: 'middle', label: '미들 페어' }, { id: 'bottom', label: '바텀 페어' }], correctOptionId: 'middle', explanation: '8은 플랍의 가운데 숫자이며 내 8♣와 공용 카드 8♦가 짝입니다.' },
      { id: 'p2-pairs-bottom', type: 'single-choice', table: bottomPair, prompt: '같은 플랍에서 내 2가 만든 페어는?', options: [{ id: 'top', label: '탑 페어' }, { id: 'middle', label: '미들 페어' }, { id: 'bottom', label: '바텀 페어' }], correctOptionId: 'bottom', explanation: '2는 플랍에서 가장 낮은 숫자이며 내 2♣와 공용 카드 2♠가 짝입니다.' },
      { id: 'p2-pairs-over', type: 'single-choice', table: overpair, prompt: '내 9 두 장은 공용 카드와 짝이 없으니 페어가 없을까요?', options: [{ id: 'overpair', label: '아니요. 9 오버페어가 있어요.' }, { id: 'none', label: '네. 페어가 없어요.' }], correctOptionId: 'overpair', explanation: '처음부터 가진 9 포켓 페어가 있습니다. 9는 플랍에서 가장 높은 7보다도 커서 오버페어입니다.' },
      { id: 'p2-pairs-summary', type: 'summary', title: '핵심 정리', body: '이름을 외우기 전에 어떤 카드끼리 짝이 되었는지 먼저 찾으세요.', bullets: ['플랍의 가장 높은·가운데·낮은 숫자와 짝이면 탑·미들·바텀 페어입니다.', '내 포켓 페어가 플랍의 모든 카드보다 높으면 오버페어입니다.'] },
    ],
  },
  'two-pair-and-set': {
    id: 'two-pair-and-set', title: '투 페어와 셋 찾기', objective: '두 종류의 짝과 포켓 페어로 만든 셋을 구분한다.', steps: [
      { id: 'p2-strong-intro', type: 'explanation', title: '짝이 더 늘어나면?', body: '서로 다른 숫자의 짝이 두 개면 투 페어입니다. 포켓 페어와 같은 숫자가 플랍에 한 장 더 나오면 같은 숫자 세 장의 셋입니다.' },
      { id: 'p2-strong-two-pair', type: 'single-choice', table: twoPair, prompt: 'A와 7이 각각 짝이 되었습니다. 현재 족보는?', options: [{ id: 'pair', label: '원 페어' }, { id: 'two-pair', label: '투 페어' }, { id: 'set', label: '셋' }], correctOptionId: 'two-pair', explanation: '내 A와 공용 A, 내 7과 공용 7이 각각 짝이 되어 투 페어입니다.' },
      { id: 'p2-strong-set', type: 'single-choice', table: set, prompt: '내 8 포켓 페어에 공용 카드 8이 더해졌습니다. 현재 패는?', options: [{ id: 'pair', label: '원 페어' }, { id: 'two-pair', label: '투 페어' }, { id: 'set', label: '셋' }], correctOptionId: 'set', explanation: '내 8 두 장과 플랍의 8 한 장으로 같은 숫자 세 장을 만들었습니다. 포켓 페어로 만든 이 형태를 셋이라고 합니다.' },
      { id: 'p2-strong-summary', type: 'summary', title: '핵심 정리', body: '정답 확인 뒤 강조되는 카드를 보며 짝이 몇 종류인지 세어 보세요.', bullets: ['A 두 장 + 7 두 장 = 투 페어', '내 8 두 장 + 공용 8 한 장 = 셋'] },
    ],
  },
  'board-and-risk': {
    id: 'board-and-risk', title: '공용 카드와 위험 살피기', objective: '보드의 짝을 내 카드의 짝과 구별하고 보드의 위험을 살핀다.', steps: [
      { id: 'p2-board-intro', type: 'explanation', title: '공용 카드는 상대도 써요', body: '공용 카드에 있는 짝은 상대도 사용할 수 있습니다. 현재 족보를 찾은 뒤에는 내 카드가 거기에 무엇을 더하는지도 확인해야 합니다.' },
      { id: 'p2-board-pair', type: 'single-choice', table: boardPair, prompt: '현재 9 원 페어는 내 A나 K가 공용 카드와 짝이 되어 만든 건가요?', options: [{ id: 'no', label: '아니요. 9 두 장이 공용 카드에 있어요.' }, { id: 'yes', label: '네. 내 A가 공용 카드와 짝이 됐어요.' }], correctOptionId: 'no', explanation: '9♣와 9♥가 공용 카드에 있습니다. 내 A와 K는 그 페어를 만들지 않았고, 상대도 공용 카드의 9 페어를 사용할 수 있습니다.' },
      { id: 'p2-board-dry', type: 'table-reveal', stage: 'flop', holeCards: dryAces.holeCards, communityCards: dryAces.communityCards, title: '같은 A 포켓 페어 · 첫 번째 플랍', body: '7♣ 4♦ 2♠에서 현재 내 족보는 A 원 페어입니다. 숫자가 떨어져 있고 무늬도 제각각입니다.' },
      { id: 'p2-board-wet', type: 'table-reveal', stage: 'flop', holeCards: wetAces.holeCards, communityCards: wetAces.communityCards, title: '같은 A 포켓 페어 · 두 번째 플랍', body: '9♣ 8♣ 7♣에서도 현재 내 족보는 A 원 페어입니다. 하지만 숫자가 이어지고 무늬가 같습니다.' },
      { id: 'p2-board-risk', type: 'single-choice', table: wetAces, prompt: '두 플랍 모두 A 원 페어입니다. 상대가 이미 더 강한 패를 가졌을 가능성을 어느 플랍에서 더 주의해야 할까요?', options: [{ id: 'first', label: '7♣ 4♦ 2♠' }, { id: 'second', label: '9♣ 8♣ 7♣' }], correctOptionId: 'second', explanation: '두 번째 플랍은 상대가 클로버 두 장으로 플러시를, 연결된 숫자 카드로 스트레이트를 이미 만들었을 수 있습니다. 실제 상대 패를 안다는 뜻은 아닙니다.' },
      { id: 'p2-board-summary', type: 'summary', title: '핵심 정리', body: '셋·투 페어처럼 이미 완성된 패와 하이 카드는 구별할 수 있습니다. 하지만 같은 원 페어도 보드와 상대 카드에 따라 실제 강함이 달라져, 지금 이기는지는 단정할 수 없습니다.', bullets: ['공용 카드의 페어는 상대도 사용할 수 있습니다.', '같은 A 원 페어라도 보드에 따라 주의할 점이 달라집니다.', '보드에 같은 무늬 세 장이 있으면 상대가 이미 플러시를 만들었을 수도 있습니다.'] },
    ],
  },
  'flop-reading-challenge': {
    id: 'flop-reading-challenge', title: '플랍 이후 패 읽기 도전', objective: '처음 보는 플랍에서도 현재 족보와 공용 카드의 위험을 설명한다.', passingPercentage: 80, steps: [
      { id: 'p2-challenge-checklist', type: 'summary', title: '처음 보는 플랍을 판단하는 순서', body: '앞 레슨의 카드를 외우기보다 아래 세 질문을 차례대로 생각해 보세요.', bullets: ['현재 족보는 무엇인가?', '그 족보를 만든 카드는 내 카드인가, 공용 카드인가?', '이 보드에서 상대도 더 강한 패를 만들 수 있는가?'] },
      { id: 'p2-challenge-top', type: 'single-choice', table: challengeTop, prompt: '현재 어떤 페어인가요?', options: [{ id: 'top', label: 'Q 탑 페어: 내 Q와 플랍에서 가장 높은 Q가 짝' }, { id: 'middle', label: '9 미들 페어: 내 9와 공용 카드의 9가 짝' }, { id: 'high', label: 'Q 하이 카드: 짝이 없음' }], correctOptionId: 'top', explanation: '내 Q♠와 공용 카드 Q♥가 짝입니다. Q는 플랍에서 가장 높은 숫자이므로 탑 페어입니다.' },
      { id: 'p2-challenge-high', type: 'single-choice', table: challengeHigh, prompt: '플랍이 열린 지금의 족보는?', options: [{ id: 'high', label: 'A 하이 카드: 짝이나 완성된 다른 족보가 없음' }, { id: 'pair', label: 'A 원 페어: 높은 A를 가지고 있음' }], correctOptionId: 'high', explanation: '시작 패에 A가 있어도 같은 숫자의 카드가 없고 다른 족보도 완성되지 않았으므로 현재는 A 하이 카드입니다.' },
      { id: 'p2-challenge-two-pair', type: 'single-choice', table: challengeTwoPair, prompt: '현재 족보와 근거가 맞는 것은?', options: [{ id: 'two-pair', label: '투 페어: K 두 장과 4 두 장' }, { id: 'pair', label: '원 페어: K 두 장만' }, { id: 'set', label: '셋: K 세 장' }], correctOptionId: 'two-pair', explanation: '내 K와 공용 K, 내 4와 공용 4가 각각 짝이 됩니다.' },
      { id: 'p2-challenge-set', type: 'single-choice', table: challengeSet, prompt: '6 세 장은 어떻게 만들어졌나요?', options: [{ id: 'set', label: '내 6 포켓 페어와 공용 카드 6 한 장으로 만든 셋' }, { id: 'board', label: '공용 카드에만 있는 6 세 장' }, { id: 'two-pair', label: '6 두 장과 Q 두 장으로 만든 투 페어' }], correctOptionId: 'set', explanation: '내 6♠·6♥와 공용 카드 6♦가 합쳐져 셋이 되었습니다.' },
      { id: 'p2-challenge-board-pair', type: 'single-choice', table: challengeBoardPair, prompt: '현재 10 원 페어에 대한 설명으로 맞는 것은?', options: [{ id: 'shared', label: '10 두 장이 공용 카드에 있어 상대도 사용할 수 있다.' }, { id: 'private', label: '내 A와 공용 카드가 짝이 되어 나만 10 페어를 쓴다.' }], correctOptionId: 'shared', explanation: '10♠와 10♥는 모두 공용 카드입니다. 내 A나 Q가 10 페어를 만든 것이 아닙니다.' },
      { id: 'p2-challenge-flush-risk', type: 'single-choice', table: challengeFlushRisk, prompt: '현재 내 패와 보드의 위험을 함께 설명한 것은?', options: [{ id: 'caution', label: 'A 원 페어지만 상대가 하트 두 장으로 이미 플러시를 만들었을 수도 있다.' }, { id: 'safe', label: 'A 원 페어이므로 상대는 플러시를 만들 수 없다.' }, { id: 'my-flush', label: '내가 이미 플러시를 만들었다.' }], correctOptionId: 'caution', explanation: '내 A♣와 공용 카드 A♥가 짝입니다. 공용 카드에 하트가 세 장 있으므로 상대가 하트 두 장을 갖고 있다면 이미 플러시일 수 있습니다. 실제 상대 카드는 아직 모릅니다.' },
    ],
  },
}

export const part2: PartDefinition = {
  id: 'part-2', order: 2, title: '플랍 이후 내 패의 현재 가치 판단', description: '내 카드와 플랍을 합쳐 현재 패를 읽고, 보드에 따라 판단이 달라짐을 익힙니다.',
  lessonIds: ['preflop-to-flop', 'read-current-hand', 'pair-types', 'two-pair-and-set', 'board-and-risk', 'flop-reading-challenge'],
}
