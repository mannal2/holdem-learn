import type { LessonDefinition, PartDefinition } from '../types/course'

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

export const part0Lessons: Record<string, LessonDefinition> = {
  'goal-and-cards': {
    id: 'goal-and-cards',
    title: '게임의 목표와 카드 구성',
    objective: '개인 카드와 공용 카드를 조합하는 기본 규칙을 이해한다.',
    steps: [
      { id: 'p0-goal-intro', type: 'explanation', title: '내가 받는 카드', body: '각 플레이어는 자신만 볼 수 있는 개인 카드 두 장을 받습니다.' },
      { id: 'p0-goal-community', type: 'explanation', title: '함께 쓰는 공용 카드', body: '테이블에는 모든 플레이어가 함께 사용할 수 있는 공용 카드가 최대 다섯 장 공개됩니다.' },
      { id: 'p0-goal-question', type: 'single-choice', prompt: '최종 승부에 사용하는 카드 수는 몇 장일까요?', options: [{ id: 'two', label: '2장' }, { id: 'five', label: '5장' }, { id: 'seven', label: '7장' }], correctOptionId: 'five', explanation: '개인 카드와 공용 카드 중 가장 강한 조합을 만드는 5장을 사용합니다. 7장을 모두 쓰는 것은 아닙니다.' },
      { id: 'p0-goal-summary', type: 'summary', title: '핵심 정리', body: '내 카드와 테이블의 카드를 조합해 가장 강한 다섯 장을 만듭니다.', bullets: ['개인 카드는 2장입니다.', '공용 카드는 최대 5장입니다.', '최종 패는 가장 좋은 5장으로 결정합니다.'] },
    ],
  },
  'hand-rankings': {
    id: 'hand-rankings',
    title: '족보의 강한 순서',
    objective: '자주 비교하는 족보의 우열을 판단한다.',
    steps: [
      { id: 'p0-rank-intro', type: 'explanation', title: '족보 순서', body: '높은 카드부터 로열 플러시, 스트레이트 플러시, 포카드, 풀 하우스, 플러시, 스트레이트, 트리플, 투 페어, 원 페어, 하이 카드 순입니다.' },
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
      { id: 'p0-stage-preflop', type: 'table-reveal', stage: 'preflop', holeCards: [...holeCards], communityCards: [...communityCards], title: '프리플랍', body: 'A♠ K♥ 개인 카드 두 장을 받고 공용 카드는 아직 공개되지 않았습니다.' },
      { id: 'p0-stage-flop', type: 'table-reveal', stage: 'flop', holeCards: [...holeCards], communityCards: [...communityCards], title: '플랍', body: '7♣ J♦ 2♠, 공용 카드 세 장이 한꺼번에 공개됩니다.' },
      { id: 'p0-stage-turn', type: 'table-reveal', stage: 'turn', holeCards: [...holeCards], communityCards: [...communityCards], title: '턴', body: '네 번째 공용 카드 Q♣가 공개됩니다.' },
      { id: 'p0-stage-river', type: 'table-reveal', stage: 'river', holeCards: [...holeCards], communityCards: [...communityCards], title: '리버', body: '마지막 공용 카드 10♥가 공개됩니다.' },
      { id: 'p0-stage-showdown', type: 'table-reveal', stage: 'showdown', holeCards: [...holeCards], communityCards: [...communityCards], title: '쇼다운', body: '남은 플레이어가 카드를 공개하고 가장 강한 다섯 장 조합을 비교합니다.' },
      { id: 'p0-stage-flop-question', type: 'single-choice', prompt: '공용 카드 3장이 처음 공개되는 단계는?', options: [{ id: 'preflop', label: '프리플랍' }, { id: 'flop', label: '플랍' }, { id: 'turn', label: '턴' }], correctOptionId: 'flop', explanation: '플랍에서 첫 공용 카드 세 장이 공개됩니다. 프리플랍에는 공용 카드가 없습니다.' },
      { id: 'p0-stage-order-question', type: 'single-choice', prompt: '공용 카드가 공개되는 올바른 순서는?', options: [{ id: 'correct', label: '프리플랍 → 플랍 → 턴 → 리버' }, { id: 'wrong-one', label: '프리플랍 → 턴 → 플랍 → 리버' }, { id: 'wrong-two', label: '플랍 → 프리플랍 → 리버 → 턴' }], correctOptionId: 'correct', explanation: '개인 카드만 있는 프리플랍 뒤에 플랍, 턴, 리버 순으로 공용 카드가 공개됩니다.' },
      { id: 'p0-stage-summary', type: 'summary', title: '핵심 정리', body: '공개되는 공용 카드 수와 단계 이름을 함께 기억하세요.', bullets: ['프리플랍 0장', '플랍 3장', '턴 4장', '리버 5장', '쇼다운에서 패를 비교합니다.'] },
    ],
  },
  'player-actions': {
    id: 'player-actions',
    title: '플레이어의 다섯 행동',
    objective: '상황에 맞는 기본 행동을 구분한다.',
    steps: [
      { id: 'p0-action-intro', type: 'explanation', title: '다섯 가지 기본 행동', body: '체크는 넘기기, 베팅은 처음 칩 걸기, 콜은 같은 금액 내기, 레이즈는 금액 올리기, 폴드는 카드 포기하기입니다.' },
      { id: 'p0-action-check', type: 'single-choice', prompt: '앞선 베팅이 없을 때 칩을 내지 않고 차례를 넘기는 행동은?', options: [{ id: 'check', label: '체크' }, { id: 'call', label: '콜' }, { id: 'fold', label: '폴드' }], correctOptionId: 'check', explanation: '앞선 베팅이 없을 때만 체크로 비용 없이 차례를 넘길 수 있습니다.' },
      { id: 'p0-action-call', type: 'single-choice', prompt: '상대 베팅과 같은 금액을 내고 계속하는 행동은?', options: [{ id: 'raise', label: '레이즈' }, { id: 'call', label: '콜' }, { id: 'check', label: '체크' }], correctOptionId: 'call', explanation: '콜은 현재 베팅액과 같은 금액을 맞추는 행동입니다. 더 올리면 레이즈입니다.' },
      { id: 'p0-action-fold', type: 'single-choice', prompt: '현재 판에서 카드를 포기하는 행동은?', options: [{ id: 'bet', label: '베팅' }, { id: 'fold', label: '폴드' }, { id: 'call', label: '콜' }], correctOptionId: 'fold', explanation: '폴드하면 더는 칩을 내지 않지만 이미 팟에 낸 칩을 되찾지는 못합니다.' },
      { id: 'p0-action-summary', type: 'summary', title: '핵심 정리', body: '내 차례에는 앞선 베팅 유무를 먼저 확인합니다.', bullets: ['베팅이 없으면 체크 또는 베팅', '베팅이 있으면 콜, 레이즈 또는 폴드'] },
    ],
  },
  'blinds-and-order': {
    id: 'blinds-and-order',
    title: '블라인드와 행동 순서',
    objective: '강제 베팅과 단계별 행동 순서를 이해한다.',
    steps: [
      { id: 'p0-order-intro', type: 'explanation', title: '딜러, 스몰 블라인드, 빅 블라인드', body: '딜러 버튼을 기준으로 왼쪽 두 사람이 SB와 BB를 맡아 카드를 보기 전에 강제 베팅을 냅니다.' },
      { id: 'p0-order-preflop', type: 'explanation', title: '프리플랍 행동 순서', body: '프리플랍에서는 빅 블라인드 다음 사람이 가장 먼저 행동합니다.' },
      { id: 'p0-order-postflop', type: 'single-choice', prompt: '플랍 이후에는 누가 먼저 행동할까요?', options: [{ id: 'dealer-left', label: '딜러 왼쪽의 남아 있는 플레이어' }, { id: 'dealer', label: '딜러' }, { id: 'big-blind', label: '항상 빅 블라인드' }], correctOptionId: 'dealer-left', explanation: '플랍 이후에는 딜러 버튼 왼쪽에서 아직 핸드에 남아 있는 플레이어부터 행동합니다.' },
      { id: 'p0-order-position', type: 'explanation', title: '후반 포지션의 이점', body: '늦게 행동하면 앞선 플레이어의 선택을 본 뒤 결정할 수 있어 더 많은 정보를 얻습니다.' },
      { id: 'p0-order-summary', type: 'summary', title: '핵심 정리', body: '버튼 위치가 블라인드와 행동 순서를 결정합니다.', bullets: ['SB와 BB는 강제 베팅입니다.', '프리플랍은 BB 다음부터 시작합니다.', '플랍 이후에는 딜러 왼쪽부터 시작합니다.'] },
    ],
  },
  'guided-hand': {
    id: 'guided-hand',
    title: '모의 한 판',
    objective: '배운 규칙을 한 판의 흐름에 적용한다.',
    passingPercentage: 80,
    steps: [
      { id: 'p0-guided-stage', type: 'single-choice', prompt: '개인 카드만 받고 공용 카드가 없다면 현재 단계는?', options: [{ id: 'preflop', label: '프리플랍' }, { id: 'flop', label: '플랍' }, { id: 'river', label: '리버' }], correctOptionId: 'preflop', explanation: '공용 카드가 나오기 전, 개인 카드 두 장만 받은 단계가 프리플랍입니다.' },
      { id: 'p0-guided-flop', type: 'single-choice', prompt: '플랍에서 처음 공개되는 공용 카드는 몇 장일까요?', options: [{ id: 'one', label: '1장' }, { id: 'three', label: '3장' }, { id: 'five', label: '5장' }], correctOptionId: 'three', explanation: '플랍에서는 공용 카드 세 장이 동시에 공개됩니다. 턴과 리버에서 한 장씩 더해집니다.' },
      { id: 'p0-guided-no-bet', type: 'multi-choice', prompt: '상대 베팅이 없을 때 가능한 행동을 모두 고르세요.', options: [{ id: 'check', label: '체크' }, { id: 'bet', label: '베팅' }, { id: 'call', label: '콜' }], correctOptionIds: ['check', 'bet'], explanation: '앞선 베팅이 없으면 체크하거나 새로 베팅할 수 있습니다. 콜은 따라갈 베팅이 있을 때 사용합니다.' },
      { id: 'p0-guided-call', type: 'single-choice', prompt: '상대의 베팅 금액을 그대로 따라가는 행동은?', options: [{ id: 'call', label: '콜' }, { id: 'raise', label: '레이즈' }, { id: 'fold', label: '폴드' }], correctOptionId: 'call', explanation: '같은 금액을 내면 콜입니다. 금액을 높이면 레이즈, 포기하면 폴드입니다.' },
      { id: 'p0-guided-river', type: 'single-choice', prompt: '마지막 공용 카드가 공개되는 단계는?', options: [{ id: 'flop', label: '플랍' }, { id: 'turn', label: '턴' }, { id: 'river', label: '리버' }], correctOptionId: 'river', explanation: '다섯 번째이자 마지막 공용 카드는 리버에서 공개됩니다.' },
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
