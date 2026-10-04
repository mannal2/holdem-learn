import type { LessonDefinition, PartDefinition, RuleVisual } from '../types/course'
import type { PlayingCard } from '../types/cards'

// 예시 카드는 명시적으로 작성합니다. 강도나 정답을 자동 계산하는 로직이 아닙니다.
const hands = {
  aks: [{ rank: 'A', suit: 'spades' }, { rank: 'K', suit: 'spades' }],
  ako: [{ rank: 'A', suit: 'spades' }, { rank: 'K', suit: 'hearts' }],
  aqo: [{ rank: 'A', suit: 'spades' }, { rank: 'Q', suit: 'hearts' }],
  tt: [{ rank: '10', suit: 'clubs' }, { rank: '10', suit: 'diamonds' }],
  nines: [{ rank: '9', suit: 'spades' }, { rank: '9', suit: 'hearts' }],
  ajs: [{ rank: 'A', suit: 'spades' }, { rank: 'J', suit: 'spades' }],
  n8o: [{ rank: '9', suit: 'spades' }, { rank: '8', suit: 'hearts' }],
  n8s: [{ rank: '9', suit: 'spades' }, { rank: '8', suit: 'spades' }],
  sevens: [{ rank: '7', suit: 'clubs' }, { rank: '7', suit: 'diamonds' }],
  e3o: [{ rank: '8', suit: 'clubs' }, { rank: '3', suit: 'hearts' }],
  a8o: [{ rank: 'A', suit: 'hearts' }, { rank: '8', suit: 'clubs' }],
  k4o: [{ rank: 'K', suit: 'clubs' }, { rank: '4', suit: 'diamonds' }],
  jts: [{ rank: 'J', suit: 'spades' }, { rank: '10', suit: 'spades' }],
  j4o: [{ rank: 'J', suit: 'hearts' }, { rank: '4', suit: 'clubs' }],
  aces: [{ rank: 'A', suit: 'spades' }, { rank: 'A', suit: 'hearts' }],
  s6s: [{ rank: '7', suit: 'spades' }, { rank: '6', suit: 'spades' }],
  s2o: [{ rank: '7', suit: 'clubs' }, { rank: '2', suit: 'diamonds' }],
  j9o: [{ rank: 'J', suit: 'spades' }, { rank: '9', suit: 'hearts' }],
  a9o: [{ rank: 'A', suit: 'clubs' }, { rank: '9', suit: 'diamonds' }],
  ninesChallenge: [{ rank: '9', suit: 'clubs' }, { rank: '9', suit: 'diamonds' }],
} satisfies Record<string, [PlayingCard, PlayingCard]>

const handVisual = (label: string, cards: [PlayingCard, PlayingCard]): RuleVisual => ({
  kind: 'starting-hands', groups: [{ label, cards }],
})
const notationExamples: RuleVisual = { kind: 'starting-hands', groups: [
  { label: 'AKs · s = 같은 무늬', cards: hands.aks },
  { label: 'AQo · o = 다른 무늬', cards: hands.aqo },
  { label: 'TT · 같은 숫자 두 장', cards: hands.tt },
] }
const propertyExamples: RuleVisual = { kind: 'starting-hands', groups: [
  { label: '높은 카드 · 두 장 모두 J·Q·K·A', cards: hands.ako },
  { label: '포켓 페어 · 같은 숫자', cards: hands.nines },
  { label: '수딧 · 같은 무늬', cards: hands.ajs },
  { label: '커넥티드 · 이어지는 숫자', cards: hands.n8o },
] }
const conditions = ['6인 테이블', '내 칩: 약 100BB', '앞선 플레이어 모두 폴드']

const actions = [{ id: 'raise', label: '오픈 레이즈' }, { id: 'fold', label: '폴드' }]

export const part1Lessons: Record<string, LessonDefinition> = {
  'hand-notation': {
    id: 'hand-notation', title: '시작 패 표기 읽기', objective: '축약 표기만 보고 두 카드의 관계를 읽는다.', steps: [
      { id: 'p1-notation-intro', type: 'explanation', title: 's, o, 숫자 두 개', body: '시작 패는 처음 받은 개인 카드 2장이에요. A·K·Q·J는 에이스·킹·퀸·잭, T는 10을 뜻해요.', visual: notationExamples },
      { id: 'p1-notation-aks', type: 'single-choice', prompt: 'AKs는 어떤 카드일까요?', options: [{ id: 'suited', label: '같은 무늬의 A와 K' }, { id: 'offsuit', label: '다른 무늬의 A와 K' }], correctOptionId: 'suited', explanation: '끝의 s는 두 카드가 같은 무늬라는 뜻입니다.', feedbackVisual: handVisual('AKs · 같은 무늬', hands.aks) },
      { id: 'p1-notation-aqo', type: 'single-choice', prompt: 'AQo는 어떤 카드일까요?', options: [{ id: 'suited', label: '같은 무늬의 A와 Q' }, { id: 'offsuit', label: '다른 무늬의 A와 Q' }], correctOptionId: 'offsuit', explanation: '끝의 o는 두 카드의 무늬가 다르다는 뜻입니다.', feedbackVisual: handVisual('AQo · 다른 무늬', hands.aqo) },
      { id: 'p1-notation-tt', type: 'single-choice', prompt: 'TT는 어떤 카드일까요?', options: [{ id: 'pair', label: '10 포켓 페어' }, { id: 'connected', label: '10과 9' }], correctOptionId: 'pair', explanation: 'T는 10이에요. TT는 같은 숫자 10 두 장을 뜻해요.', feedbackVisual: handVisual('TT · 10 포켓 페어', hands.tt) },
      { id: 'p1-notation-summary', type: 'summary', title: '핵심 정리', body: '표기와 실제 카드를 함께 기억해요.', bullets: ['s: 같은 무늬 / o: 다른 무늬', '같은 숫자 두 개: 포켓 페어'], visual: notationExamples },
    ],
  },
  'hand-properties': {
    id: 'hand-properties', title: '시작 패의 네 가지 특징', objective: '시작 패를 평가하는 기본 재료를 이해한다.', steps: [
      { id: 'p1-property-high', type: 'explanation', title: '높은 카드', body: '두 장 모두 높으면 높은 원 페어를 만들 수 있어요. 이 앱에서는 두 장 모두 J·Q·K·A인 경우를 높은 카드로 분류해요.', visual: handVisual('높은 카드 · 아직 원 페어는 아니에요', hands.ako) },
      { id: 'p1-property-pair', type: 'explanation', title: '포켓 페어', body: '같은 숫자 두 장이면 포켓 페어예요. 이미 원 페어로 출발하지만 승리가 보장되지는 않아요.', visual: handVisual('포켓 페어 · 같은 숫자 9', hands.nines) },
      { id: 'p1-property-suited', type: 'explanation', title: '수딧', body: '같은 무늬 두 장이면 수딧이에요. 플러시로 발전할 수 있지만, 아직 5장이 모인 플러시는 아니에요.', visual: handVisual('수딧 · 둘 다 스페이드', hands.ajs) },
      { id: 'p1-property-connected', type: 'explanation', title: '커넥티드', body: '숫자가 바로 이어지는 두 장이면 커넥티드예요. 스트레이트로 발전할 수 있지만, 아직 완성된 것은 아니에요.', visual: handVisual('커넥티드 · 9와 8이 이어져요', hands.n8o) },
      { id: 'p1-property-summary', type: 'summary', title: '핵심 정리', body: '한 시작 패는 여러 특징을 함께 가질 수 있어요.', bullets: ['숫자와 무늬를 함께 살펴봐요.', '발전 가능성과 이미 완성된 족보는 달라요.'], visual: propertyExamples },
    ],
  },
  'identify-properties': {
    id: 'identify-properties', title: '카드 특징 찾아내기', objective: '실제 카드에서 해당하는 특징을 모두 고른다.', steps: [
      { id: 'p1-identify-aks', type: 'multi-choice', prompt: 'A♠ K♠의 특징을 모두 고르세요.', options: [{ id: 'high', label: '높은 카드' }, { id: 'suited', label: '수딧' }, { id: 'connected', label: '커넥티드' }, { id: 'pair', label: '포켓 페어' }], correctOptionIds: ['high', 'suited', 'connected'], explanation: '두 장 모두 높고, 같은 무늬이며 A와 K는 이어지는 숫자예요.', visual: handVisual('내 카드 · 2장', hands.aks) },
      { id: 'p1-identify-98s', type: 'multi-choice', prompt: '9♠ 8♠의 특징을 모두 고르세요.', options: [{ id: 'high', label: '높은 카드' }, { id: 'suited', label: '수딧' }, { id: 'connected', label: '커넥티드' }, { id: 'pair', label: '포켓 페어' }], correctOptionIds: ['suited', 'connected'], explanation: '같은 스페이드이고 9와 8이 이어져요. 두 장 모두 J·Q·K·A는 아니에요.', visual: handVisual('내 카드 · 2장', hands.n8s) },
      { id: 'p1-identify-77', type: 'multi-choice', prompt: '7♣ 7♦의 특징을 모두 고르세요.', options: [{ id: 'suited', label: '수딧' }, { id: 'pair', label: '포켓 페어' }, { id: 'connected', label: '커넥티드' }], correctOptionIds: ['pair'], explanation: '같은 숫자 7 두 장이므로 포켓 페어예요. 무늬는 달라요.', visual: handVisual('내 카드 · 2장', hands.sevens) },
      { id: 'p1-identify-83o', type: 'multi-choice', prompt: '8♣ 3♥의 특징을 고르세요.', options: [{ id: 'pair', label: '포켓 페어' }, { id: 'suited', label: '수딧' }, { id: 'none', label: '해당 없음' }, { id: 'connected', label: '커넥티드' }], correctOptionIds: ['none'], explanation: '같은 숫자도, 같은 무늬도, 이어지는 숫자도 아니에요. 높은 카드 두 장에도 해당하지 않아요.', visual: handVisual('내 카드 · 2장', hands.e3o) },
    ],
  },
  'compare-hands': {
    id: 'compare-hands', title: '두 시작 패 비교하기', objective: '특징을 근거로 더 유리한 시작 패를 고른다.', steps: [
      { id: 'p1-compare-ak', type: 'single-choice', prompt: 'A♠ K♠와 A♥ 8♣ 중 더 유리한 시작 패는?', options: [{ id: 'aks', label: '시작 패 A' }, { id: 'a8o', label: '시작 패 B' }], correctOptionId: 'aks', explanation: 'AKs는 두 장 모두 높고, 같은 무늬이며 숫자도 이어져요.', visual: { kind: 'starting-hands', groups: [{ label: '시작 패 A', cards: hands.aks }, { label: '시작 패 B', cards: hands.a8o }] } },
      { id: 'p1-compare-99', type: 'single-choice', prompt: 'K♣ 4♦와 9♠ 9♥ 중 더 유리한 시작 패는?', options: [{ id: 'k4o', label: '시작 패 A' }, { id: '99', label: '시작 패 B' }], correctOptionId: '99', explanation: '99는 이미 원 페어인 포켓 페어라 K4o보다 기본 완성도가 높아요.', visual: { kind: 'starting-hands', groups: [{ label: '시작 패 A', cards: hands.k4o }, { label: '시작 패 B', cards: hands.nines }] } },
      { id: 'p1-compare-jt', type: 'single-choice', prompt: 'J♠ 10♠와 J♥ 4♣ 중 더 유리한 시작 패는?', options: [{ id: 'jts', label: '시작 패 A' }, { id: 'j4o', label: '시작 패 B' }], correctOptionId: 'jts', explanation: 'J와 10은 같은 무늬이고 숫자도 이어져요. J4o보다 발전할 길이 많아요.', visual: { kind: 'starting-hands', groups: [{ label: '시작 패 A', cards: hands.jts }, { label: '시작 패 B', cards: hands.j4o }] } },
    ],
  },
  'classify-strength': {
    id: 'classify-strength', title: '시작 패 강도 분류', objective: '입문 기준의 상대적인 강도를 구분한다.', steps: [
      { id: 'p1-strength-context', type: 'explanation', title: '절대 차트가 아니에요', body: '카드 자체의 기본 강도를 알아보는 입문 기준이에요. 실제 행동은 내 자리와 상대의 행동에 따라 달라져요.' },
      { id: 'p1-strength-aa', type: 'single-choice', prompt: 'A♠ A♥는 어떤 시작 패인가요?', options: [{ id: 'strong', label: '강함' }, { id: 'weak', label: '약함' }], correctOptionId: 'strong', explanation: 'AA는 가장 높은 포켓 페어라 매우 강한 시작 패예요.', visual: handVisual('내 카드 · 2장', hands.aces) },
      { id: 'p1-strength-ajs', type: 'single-choice', prompt: 'A♠ J♠는 어떤 시작 패인가요?', options: [{ id: 'weak', label: '약함' }, { id: 'okay', label: '괜찮음' }], correctOptionId: 'okay', explanation: '높은 A와 J에 같은 무늬의 장점까지 있어 괜찮은 패예요.', visual: handVisual('내 카드 · 2장', hands.ajs) },
      { id: 'p1-strength-76s', type: 'single-choice', prompt: '7♠ 6♠는 어떤 시작 패인가요?', options: [{ id: 'strong', label: '항상 강함' }, { id: 'situational', label: '상황에 따라 가치가 달라짐' }], correctOptionId: 'situational', explanation: '같은 무늬이고 숫자도 이어지지만 낮은 카드예요. 자리와 상황을 함께 봐야 해요.', visual: handVisual('내 카드 · 2장', hands.s6s) },
      { id: 'p1-strength-72o', type: 'single-choice', prompt: '7♣ 2♦는 어떤 시작 패인가요?', options: [{ id: 'weak', label: '약함' }, { id: 'okay', label: '괜찮음' }], correctOptionId: 'weak', explanation: '낮고 떨어진 숫자에 무늬도 달라, 발전 가능성이 적어요.', visual: handVisual('내 카드 · 2장', hands.s2o) },
    ],
  },
  'understand-position': {
    id: 'understand-position', title: '포지션 이해하기', objective: '행동 순서가 판단에 주는 영향을 이해한다.', steps: [
      { id: 'p1-position-early', type: 'position', activeGroup: 'early', title: '초반 포지션', body: '포지션은 행동 순서상의 자리예요. 초반에는 뒤에 행동할 사람이 많아 다른 사람의 선택을 모른 채 결정해요.', visual: { kind: 'position', activeGroup: 'early' } },
      { id: 'p1-position-middle', type: 'position', activeGroup: 'middle', title: '중간 포지션', body: '앞선 사람의 선택을 일부 보고 결정해요. 하지만 내 뒤에도 아직 행동할 사람이 남아 있어요.', visual: { kind: 'position', activeGroup: 'middle' } },
      { id: 'p1-position-late', type: 'position', activeGroup: 'late', title: '후반 포지션', body: '앞선 사람의 선택을 더 많이 보고 결정해요. 프리플랍에서는 딜러 버튼 뒤에도 SB·BB가 남아 있어요.', visual: { kind: 'position', activeGroup: 'late' } },
      { id: 'p1-position-information', type: 'single-choice', prompt: '어느 포지션이 보통 더 많은 정보를 가지고 행동할까요?', options: [{ id: 'early', label: '초반 포지션' }, { id: 'late', label: '후반 포지션' }], correctOptionId: 'late', explanation: '후반에서는 앞선 선택을 더 많이 보고 결정해요. 그래서 같은 패도 활용할 범위가 넓어질 수 있어요.' },
      { id: 'p1-position-caution', type: 'explanation', title: '초반에서는 더 신중하게', body: '초반에는 뒤에 강한 패를 가진 사람이 있을 수 있어요. 그래서 참여할 패를 더 신중하게 골라요.', visual: { kind: 'position', activeGroup: 'early' } },
    ],
  },
  'same-hand-different-position': {
    id: 'same-hand-different-position', title: '같은 패, 다른 포지션', objective: '같은 카드라도 포지션에 따라 판단이 달라짐을 이해한다.', steps: [
      { id: 'p1-same-j9-early', type: 'position', activeGroup: 'early', title: '같은 카드 · 초반', body: '뒤에 행동할 사람이 많아, 이 앱의 입문 기준에서는 폴드해요. 아래 100BB는 빅 블라인드 금액의 100배만큼 가진 칩을 뜻해요.', visual: { kind: 'position', activeGroup: 'early', foldedBefore: true, holeCards: hands.j9o, conditions } },
      { id: 'p1-same-j9-late', type: 'position', activeGroup: 'late', title: '같은 카드 · 후반', body: '앞선 사람들이 모두 폴드했다면, 이 앱의 입문 기준에서 오픈 레이즈할 수 있어요. 오픈 레이즈는 앞선 레이즈가 없을 때 처음으로 블라인드보다 높게 올리는 행동이에요.', visual: { kind: 'position', activeGroup: 'late', foldedBefore: true, holeCards: hands.j9o, conditions } },
      { id: 'p1-same-a9-early', type: 'position', activeGroup: 'early', title: 'A9도 자리와 함께 봐요 · 초반', body: '상대가 더 강한 A를 가졌을 수 있어요. 뒤에 남은 사람도 많아, 이 앱의 초반 입문 기준에서는 폴드해요.', visual: { kind: 'position', activeGroup: 'early', foldedBefore: true, holeCards: hands.a9o, conditions } },
      { id: 'p1-same-a9-late', type: 'position', activeGroup: 'late', title: '같은 A9 · 후반', body: '앞선 사람들이 폴드했고 뒤에는 SB·BB만 남아요. 이 앱의 입문 기준에서는 오픈 레이즈할 수 있지만 승리가 보장되지는 않아요.', visual: { kind: 'position', activeGroup: 'late', foldedBefore: true, holeCards: hands.a9o, conditions } },
      { id: 'p1-same-summary', type: 'summary', title: '핵심 정리', body: '같은 카드라도 자리와 앞선 행동에 따라 판단이 달라져요.', bullets: ['초반: 참여할 패를 더 신중하게 골라요.', '후반: 앞선 선택을 더 많이 보고 결정해요.', '후반이어도 모든 패로 참여하는 것은 아니에요.', '오픈 레이즈할 가치가 있다는 것과 승리 보장은 달라요.'] },
    ],
  },
  'starting-hand-challenge': {
    id: 'starting-hand-challenge', title: '시작 패 종합 도전', objective: '카드 특징과 포지션을 함께 보고 첫 행동을 고른다.', passingPercentage: 80, steps: [
      { id: 'p1-challenge-aks', type: 'single-choice', prompt: 'A♠ K♠ · 초반에서 첫 행동은?', options: actions, correctOptionId: 'raise', explanation: 'AKs는 높은 카드·수딧·커넥티드 특징이 있는 강한 패예요. 초반에서도 오픈 레이즈해요.', visual: { kind: 'position', activeGroup: 'early', foldedBefore: true, holeCards: hands.aks, conditions } },
      { id: 'p1-challenge-72o', type: 'single-choice', prompt: '7♣ 2♦ · 후반에서 첫 행동은?', options: actions, correctOptionId: 'fold', explanation: '후반이어도 72o는 강점이 적어 폴드해요. 자리가 좋다고 모든 약한 패로 참여하지는 않아요.', visual: { kind: 'position', activeGroup: 'late', foldedBefore: true, holeCards: hands.s2o, conditions } },
      { id: 'p1-challenge-j9-early', type: 'single-choice', prompt: 'J♠ 9♥ · 초반에서 첫 행동은?', options: actions, correctOptionId: 'fold', explanation: '뒤에 행동할 사람이 많아 참여할 패를 엄격하게 골라요. 입문 기준에서는 J9o를 폴드해요.', visual: { kind: 'position', activeGroup: 'early', foldedBefore: true, holeCards: hands.j9o, conditions } },
      { id: 'p1-challenge-j9-late', type: 'single-choice', prompt: 'J♠ 9♥ · 후반에서 첫 행동은?', options: actions, correctOptionId: 'raise', explanation: '앞선 사람들이 모두 폴드한 후반이라 오픈 레이즈할 수 있어요. 항상 이긴다는 뜻은 아니에요.', visual: { kind: 'position', activeGroup: 'late', foldedBefore: true, holeCards: hands.j9o, conditions } },
      { id: 'p1-challenge-99', type: 'single-choice', prompt: '9♣ 9♦ · 중간에서 첫 행동은?', options: actions, correctOptionId: 'raise', explanation: '99는 이미 원 페어인 탄탄한 포켓 페어예요. 중간에서 오픈 레이즈할 가치가 있어요.', visual: { kind: 'position', activeGroup: 'middle', foldedBefore: true, holeCards: hands.ninesChallenge, conditions } },
    ],
  },
}

export const part1: PartDefinition = {
  id: 'part-1', order: 1, title: '시작 패의 가치 판단하기', description: '카드 특징과 포지션을 함께 보고 첫 결정을 연습합니다.',
  lessonIds: ['hand-notation', 'hand-properties', 'identify-properties', 'compare-hands', 'classify-strength', 'understand-position', 'same-hand-different-position', 'starting-hand-challenge'],
}
