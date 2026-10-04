import type { HandRankingExample, LessonDefinition, PartDefinition, RuleVisual } from '../types/course'

const holeCards = [
  { rank: 'A', suit: 'spades' },
  { rank: 'K', suit: 'hearts' },
] as const

const communityCards = [
  { rank: '7', suit: 'clubs' },
  { rank: 'J', suit: 'diamonds' },
  { rank: '2', suit: 'spades' },
  { rank: 'Q', suit: 'clubs' },
  { rank: '10', suit: 'hearts' },
] as const

const handRankingExamples: HandRankingExample[] = [
  {
    name: '로열 플러시', description: '같은 무늬의 A·K·Q·J·10',
    cards: [
      { rank: 'A', suit: 'spades' }, { rank: 'K', suit: 'spades' }, { rank: 'Q', suit: 'spades' },
      { rank: 'J', suit: 'spades' }, { rank: '10', suit: 'spades' },
    ],
  },
  {
    name: '스트레이트 플러시', description: '같은 무늬로 숫자가 이어지는 다섯 장',
    cards: [
      { rank: '9', suit: 'hearts' }, { rank: '8', suit: 'hearts' }, { rank: '7', suit: 'hearts' },
      { rank: '6', suit: 'hearts' }, { rank: '5', suit: 'hearts' },
    ],
  },
  {
    name: '포카드', description: '같은 숫자 네 장',
    cards: [
      { rank: 'Q', suit: 'spades' }, { rank: 'Q', suit: 'hearts' }, { rank: 'Q', suit: 'diamonds' },
      { rank: 'Q', suit: 'clubs' }, { rank: '2', suit: 'spades' },
    ],
  },
  {
    name: '풀 하우스', description: '같은 숫자 세 장과 다른 숫자 두 장',
    cards: [
      { rank: 'J', suit: 'spades' }, { rank: 'J', suit: 'hearts' }, { rank: 'J', suit: 'diamonds' },
      { rank: '4', suit: 'clubs' }, { rank: '4', suit: 'hearts' },
    ],
  },
  {
    name: '플러시', description: '숫자가 이어지지 않아도 같은 무늬 다섯 장',
    cards: [
      { rank: 'A', suit: 'clubs' }, { rank: 'J', suit: 'clubs' }, { rank: '8', suit: 'clubs' },
      { rank: '5', suit: 'clubs' }, { rank: '2', suit: 'clubs' },
    ],
  },
  {
    name: '스트레이트', description: '무늬와 관계없이 숫자가 이어지는 다섯 장',
    cards: [
      { rank: '9', suit: 'spades' }, { rank: '8', suit: 'hearts' }, { rank: '7', suit: 'diamonds' },
      { rank: '6', suit: 'clubs' }, { rank: '5', suit: 'spades' },
    ],
  },
  {
    name: '트리플', description: '같은 숫자 세 장',
    cards: [
      { rank: '7', suit: 'spades' }, { rank: '7', suit: 'hearts' }, { rank: '7', suit: 'diamonds' },
      { rank: 'K', suit: 'clubs' }, { rank: '2', suit: 'spades' },
    ],
  },
  {
    name: '투 페어', description: '숫자가 같은 카드 두 장씩 두 쌍',
    cards: [
      { rank: 'A', suit: 'spades' }, { rank: 'A', suit: 'diamonds' }, { rank: '8', suit: 'hearts' },
      { rank: '8', suit: 'clubs' }, { rank: '3', suit: 'spades' },
    ],
  },
  {
    name: '원 페어', description: '숫자가 같은 카드 한 쌍',
    cards: [
      { rank: 'K', suit: 'spades' }, { rank: 'K', suit: 'diamonds' }, { rank: 'Q', suit: 'hearts' },
      { rank: '7', suit: 'clubs' }, { rank: '2', suit: 'spades' },
    ],
  },
  {
    name: '하이 카드', description: '다른 족보가 없을 때 가장 높은 카드로 비교',
    cards: [
      { rank: 'A', suit: 'spades' }, { rank: 'J', suit: 'diamonds' }, { rank: '8', suit: 'clubs' },
      { rank: '5', suit: 'hearts' }, { rank: '2', suit: 'spades' },
    ],
  },
]

function cardsVisual(mode: 'hole' | 'community' | 'best-five'): RuleVisual {
  return {
    kind: 'cards', mode, holeCards: [...holeCards], communityCards: [...communityCards],
    highlightedCards: mode === 'best-five' ? [holeCards[0], holeCards[1], communityCards[1], communityCards[3], communityCards[4]] : undefined,
  }
}

export const part0Lessons: Record<string, LessonDefinition> = {
  'goal-and-cards': {
    id: 'goal-and-cards',
    title: '게임의 목표와 카드 구성',
    objective: '개인 카드와 공용 카드를 조합하는 기본 규칙을 이해한다.',
    steps: [
      { id: 'p0-goal-intro', type: 'explanation', title: '내가 받는 카드', body: '나만 볼 수 있는 개인 카드 2장을 받아요.', visual: cardsVisual('hole') },
      { id: 'p0-goal-community', type: 'explanation', title: '함께 쓰는 공용 카드', body: '공용 카드(보드)는 모두가 함께 사용해요. 3장 → 1장 → 1장 순서로 공개돼요.', visual: cardsVisual('community') },
      { id: 'p0-goal-question', type: 'single-choice', prompt: '최종 승부에 사용하는 카드 수는 몇 장일까요?', options: [{ id: 'two', label: '2장' }, { id: 'five', label: '5장' }, { id: 'seven', label: '7장' }], correctOptionId: 'five', explanation: '내 카드 2장과 공용 카드 5장, 총 7장 중 가장 강한 5장을 써요. 내 카드는 0·1·2장 원하는 만큼 사용해도 돼요.', feedbackVisual: cardsVisual('best-five') },
      { id: 'p0-goal-summary', type: 'summary', title: '핵심 정리', body: '7장 중 가장 강한 5장으로 승부해요.', bullets: ['개인 카드 2장 + 공용 카드 최대 5장.', '내 카드 두 장을 꼭 모두 쓸 필요는 없어요.'], visual: cardsVisual('best-five') },
    ],
  },
  'hand-rankings': {
    id: 'hand-rankings',
    title: '족보의 강한 순서',
    objective: '자주 비교하는 족보의 우열을 판단한다.',
    steps: [
      { id: 'p0-rank-intro', type: 'explanation', title: '족보 순서', body: '가장 강한 족보부터 살펴보세요. 각 줄의 카드 다섯 장이 해당 족보의 한 가지 예시입니다.', handExamples: handRankingExamples },
      { id: 'p0-rank-pair', type: 'single-choice', prompt: '원 페어와 하이 카드 중 더 강한 패는?', options: [{ id: 'pair', label: '원 페어' }, { id: 'high', label: '하이 카드' }], correctOptionId: 'pair', explanation: '같은 숫자 두 장이 있는 원 페어가 어떤 조합도 없는 하이 카드보다 강합니다.' },
      { id: 'p0-rank-flush', type: 'single-choice', prompt: '플러시와 스트레이트 중 더 강한 패는?', options: [{ id: 'flush', label: '플러시' }, { id: 'straight', label: '스트레이트' }], correctOptionId: 'flush', explanation: '같은 무늬 다섯 장인 플러시는 연속된 숫자 다섯 장인 스트레이트보다 강합니다.' },
      { id: 'p0-rank-quads', type: 'single-choice', prompt: '풀 하우스와 포카드 중 더 강한 패는?', options: [{ id: 'full-house', label: '풀 하우스' }, { id: 'quads', label: '포카드' }], correctOptionId: 'quads', explanation: '같은 숫자 네 장을 만든 포카드는 트리플과 원 페어를 합친 풀 하우스보다 강합니다.' },
      { id: 'p0-rank-summary', type: 'summary', title: '핵심 정리', body: '처음에는 자주 만나는 패의 상대적인 순서부터 익히면 충분합니다.', bullets: ['원 페어 > 하이 카드', '플러시 > 스트레이트', '포카드 > 풀 하우스'] },
    ],
  },
  'hand-stages': {
    id: 'hand-stages',
    title: '한 판이 진행되는 단계',
    objective: '프리플랍부터 쇼다운까지 카드가 공개되는 순서를 익힌다.',
    steps: [
      { id: 'p0-stage-preflop', type: 'table-reveal', stage: 'preflop', holeCards: [...holeCards], communityCards: [...communityCards], title: '프리플랍', body: '내 카드 2장만 받았어요. 공용 카드는 아직 없어요.' },
      { id: 'p0-stage-flop', type: 'table-reveal', stage: 'flop', holeCards: [...holeCards], communityCards: [...communityCards], title: '플랍', body: '공용 카드 3장이 한꺼번에 공개돼요.' },
      { id: 'p0-stage-turn', type: 'table-reveal', stage: 'turn', holeCards: [...holeCards], communityCards: [...communityCards], title: '턴', body: '1장이 추가돼 공용 카드가 4장이 돼요.', markLatestCard: true },
      { id: 'p0-stage-river', type: 'table-reveal', stage: 'river', holeCards: [...holeCards], communityCards: [...communityCards], title: '리버', body: '마지막 1장이 추가돼 공용 카드가 총 5장이 돼요.', markLatestCard: true },
      { id: 'p0-stage-showdown', type: 'table-reveal', stage: 'showdown', holeCards: [...holeCards], communityCards: [...communityCards], title: '쇼다운', body: '남은 플레이어가 패를 공개하고 가장 강한 5장을 비교해요.' },
      { id: 'p0-stage-flop-question', type: 'single-choice', prompt: '공용 카드 3장이 처음 공개되는 단계는?', options: [{ id: 'preflop', label: '프리플랍' }, { id: 'flop', label: '플랍' }, { id: 'turn', label: '턴' }], correctOptionId: 'flop', explanation: '플랍에서 첫 공용 카드 세 장이 공개됩니다. 프리플랍에는 공용 카드가 없습니다.' },
      { id: 'p0-stage-order-question', type: 'single-choice', prompt: '공용 카드가 공개되는 올바른 순서는?', options: [{ id: 'correct', label: '프리플랍 → 플랍 → 턴 → 리버' }, { id: 'wrong-one', label: '프리플랍 → 턴 → 플랍 → 리버' }, { id: 'wrong-two', label: '플랍 → 프리플랍 → 리버 → 턴' }], correctOptionId: 'correct', explanation: '개인 카드만 있는 프리플랍 뒤에 플랍, 턴, 리버 순으로 공용 카드가 공개됩니다.' },
      { id: 'p0-stage-summary', type: 'summary', title: '핵심 정리', body: '공용 카드는 플랍 3장 → 턴 1장 → 리버 1장 순서예요.', bullets: ['공용 카드가 나오기 전은 프리플랍이에요.', '끝까지 남은 플레이어는 쇼다운에서 패를 비교해요.'], visual: cardsVisual('community') },
    ],
  },
  'player-actions': {
    id: 'player-actions',
    title: '플레이어의 다섯 행동',
    objective: '상황에 맞는 기본 행동을 구분한다.',
    steps: [
      { id: 'p0-action-intro', type: 'explanation', title: '다섯 가지 기본 행동', body: '먼저 칩을 더 맞춰야 하는지 확인해요. 아래 숫자는 행동을 비교하기 위한 예시예요.', visual: { kind: 'actions' } },
      { id: 'p0-action-check', type: 'single-choice', prompt: '앞선 베팅이 없을 때 칩을 내지 않고 차례를 넘기는 행동은?', options: [{ id: 'check', label: '체크' }, { id: 'call', label: '콜' }, { id: 'fold', label: '폴드' }], correctOptionId: 'check', explanation: '체크는 칩을 더 내지 않고 차례를 넘기는 행동이에요. 맞출 금액이 없어야 해요. BB도 아무도 레이즈하지 않았다면 체크할 수 있어요.' },
      { id: 'p0-action-call', type: 'single-choice', prompt: '상대 베팅과 같은 금액을 내고 계속하는 행동은?', options: [{ id: 'raise', label: '레이즈' }, { id: 'call', label: '콜' }, { id: 'check', label: '체크' }], correctOptionId: 'call', explanation: '콜은 현재 베팅 금액에 맞추는 행동이에요. 이미 낸 칩이 있다면 부족한 차액만 추가해요.' },
      { id: 'p0-action-fold', type: 'single-choice', prompt: '현재 판에서 카드를 포기하는 행동은?', options: [{ id: 'bet', label: '베팅' }, { id: 'fold', label: '폴드' }, { id: 'call', label: '콜' }], correctOptionId: 'fold', explanation: '폴드는 이번 판을 포기하는 행동이에요. 이미 팟(모두가 건 칩)에 낸 칩은 돌려받지 못해요.' },
      { id: 'p0-action-summary', type: 'summary', title: '핵심 정리', body: '맞출 금액이 없으면 체크, 있으면 콜·레이즈·폴드를 생각해요.', bullets: ['아직 베팅이 없다면 먼저 베팅할 수 있어요.', 'BB가 이미 금액을 맞췄다면 체크하거나 레이즈할 수 있어요.'], visual: { kind: 'actions' } },
    ],
  },
  'blinds-and-order': {
    id: 'blinds-and-order',
    title: '블라인드와 행동 순서',
    objective: '강제 베팅과 단계별 행동 순서를 이해한다.',
    steps: [
      { id: 'p0-order-intro', type: 'explanation', title: '딜러 버튼, 스몰 블라인드, 빅 블라인드', body: '딜러 버튼은 자리의 기준이에요. 왼쪽의 SB·BB는 카드를 받기 전에 칩을 내요. 번호는 자리 구분용이에요.', visual: { kind: 'seats', focus: 'blinds' } },
      { id: 'p0-order-preflop', type: 'explanation', title: '프리플랍 행동 순서', body: '공용 카드가 나오기 전에는 BB 다음 사람이 먼저 행동해요.', visual: { kind: 'seats', focus: 'preflop' } },
      { id: 'p0-order-postflop', type: 'single-choice', prompt: '플랍 이후에는 누가 먼저 행동할까요?', options: [{ id: 'dealer-left', label: '딜러 버튼 왼쪽의 남아 있는 플레이어' }, { id: 'dealer', label: '딜러 버튼' }, { id: 'big-blind', label: '항상 빅 블라인드' }], correctOptionId: 'dealer-left', explanation: '플랍 이후에는 딜러 버튼 왼쪽의 남아 있는 사람부터 시작해요. 폴드한 자리는 건너뛰어요.', visual: { kind: 'seats', focus: 'blinds' }, feedbackVisual: { kind: 'seats', focus: 'postflop' } },
      { id: 'p0-order-position', type: 'explanation', title: '후반 포지션의 이점', body: '늦게 행동하면 앞선 사람들의 선택을 보고 결정할 수 있어요.', visual: { kind: 'seats', focus: 'late' } },
      { id: 'p0-order-summary', type: 'summary', title: '핵심 정리', body: '6인 테이블 예시예요. 딜러 버튼을 기준으로 자리를 읽어요.', bullets: ['SB·BB: 먼저 칩을 내는 두 자리.', '프리플랍: BB 다음 사람부터.', '플랍 이후: 딜러 버튼 왼쪽의 남아 있는 사람부터.'], visual: { kind: 'seats', focus: 'blinds' } },
    ],
  },
  'guided-hand': {
    id: 'guided-hand',
    title: '모의 한 판',
    objective: '배운 규칙을 한 판의 흐름에 적용한다.',
    passingPercentage: 80,
    steps: [
      { id: 'p0-guided-stage', type: 'single-choice', prompt: '개인 카드만 받고 공용 카드가 없다면 현재 단계는?', options: [{ id: 'preflop', label: '프리플랍' }, { id: 'flop', label: '플랍' }, { id: 'river', label: '리버' }], correctOptionId: 'preflop', explanation: '공용 카드가 나오기 전, 개인 카드 두 장만 받은 단계가 프리플랍입니다.', table: { stage: 'preflop', holeCards: [...holeCards], communityCards: [...communityCards] } },
      { id: 'p0-guided-flop', type: 'single-choice', prompt: '플랍에서 처음 공개되는 공용 카드는 몇 장일까요?', options: [{ id: 'one', label: '1장' }, { id: 'three', label: '3장' }, { id: 'five', label: '5장' }], correctOptionId: 'three', explanation: '플랍에서는 공용 카드 세 장이 동시에 공개됩니다. 턴과 리버에서 한 장씩 더해집니다.', table: { holeCards: [...holeCards], communityCards: [...communityCards] } },
      { id: 'p0-guided-no-bet', type: 'multi-choice', prompt: '상대 베팅이 없을 때 가능한 행동을 모두 고르세요.', options: [{ id: 'check', label: '체크' }, { id: 'bet', label: '베팅' }, { id: 'call', label: '콜' }], correctOptionIds: ['check', 'bet'], explanation: '앞선 베팅이 없으면 체크하거나 새로 베팅할 수 있습니다. 콜은 따라갈 베팅이 있을 때 사용합니다.', visual: { kind: 'actions', situation: 'unopened', showActions: false } },
      { id: 'p0-guided-call', type: 'single-choice', prompt: '상대의 베팅 금액을 그대로 따라가는 행동은?', options: [{ id: 'call', label: '콜' }, { id: 'raise', label: '레이즈' }, { id: 'fold', label: '폴드' }], correctOptionId: 'call', explanation: '같은 금액을 내면 콜입니다. 금액을 높이면 레이즈, 포기하면 폴드입니다.', visual: { kind: 'actions', situation: 'facing-bet', showActions: false } },
      { id: 'p0-guided-river', type: 'single-choice', prompt: '마지막 공용 카드가 공개되는 단계는?', options: [{ id: 'flop', label: '플랍' }, { id: 'turn', label: '턴' }, { id: 'river', label: '리버' }], correctOptionId: 'river', explanation: '다섯 번째이자 마지막 공용 카드는 리버에서 공개됩니다.', table: { stage: 'river', holeCards: [...holeCards], communityCards: [...communityCards] } },
    ],
  },
}

export const part0: PartDefinition = {
  id: 'part-0',
  order: 0,
  title: '한 판의 흐름 이해하기',
  description: '카드 구성, 족보, 진행 단계와 기본 행동을 익힙니다.',
  lessonIds: ['goal-and-cards', 'hand-rankings', 'hand-stages', 'player-actions', 'blinds-and-order', 'guided-hand'],
}
