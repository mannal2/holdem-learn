import type { CardRank, CardSuit, PlayingCard } from '../types/cards'
import type { MultiChoiceStep, PositionGroup, SingleChoiceStep } from '../types/course'

export type PracticeQuestion = (SingleChoiceStep | MultiChoiceStep) & { lessonId: string; concept: string }
const suits: Record<string, CardSuit> = { s: 'spades', h: 'hearts', d: 'diamonds', c: 'clubs' }
function hand(value: string): [PlayingCard, PlayingCard] {
  return value.split(' ').map(code => ({ rank: code.slice(0, -1) as CardRank, suit: suits[code.slice(-1)] })) as [PlayingCard, PlayingCard]
}
const features = [
  { id: 'high', label: '두 장 모두 높은 카드 (J·Q·K·A)' },
  { id: 'pair', label: '포켓 페어' },
  { id: 'suited', label: '수딧 — 같은 무늬' },
  { id: 'connected', label: '커넥티드 — 연속된 숫자' },
  { id: 'none', label: '해당하는 특징 없음 (다른 보기와 함께 고르지 않아요)' },
]
const featureExamples: [string, string[], string][] = [
  ['Ks Qs', ['high', 'suited', 'connected'], 'K와 Q는 높은 카드이고 같은 무늬이며 순서도 이어집니다.'],
  ['Qh Jc', ['high', 'connected'], 'Q와 J는 연속된 높은 카드입니다. 무늬는 다릅니다.'],
  ['Ad Qd', ['high', 'suited'], '높은 카드 두 장에 같은 무늬입니다. A와 Q 사이에는 K가 있어 커넥티드는 아닙니다.'],
  ['Jc 8c', ['suited'], '같은 무늬이지만 숫자는 연속되지 않습니다. 두 장 모두 높은 카드인 것도 아닙니다.'],
  ['8h 7s', ['connected'], '8과 7은 연속되지만 무늬는 다릅니다.'],
  ['6d 6c', ['pair'], '같은 숫자 두 장으로 포켓 페어입니다. 같은 숫자는 연속된 숫자와 다른 특징입니다.'],
  ['Qs Qh', ['high', 'pair'], '높은 카드 두 장이면서 같은 숫자입니다. 특징이 여러 개일 수 있습니다.'],
  ['9c 4d', ['none'], '두 장 모두 높은 카드가 아니며 페어·수딧·커넥티드에도 해당하지 않습니다.'],
  ['Qd Jd', ['high', 'suited', 'connected'], 'Q와 J는 높은 카드이며 같은 무늬이고 숫자도 연속됩니다.'],
]
// 직접 검수한 비교입니다. 더 유리한 출발점이 승리나 참여를 보장하지는 않습니다.
const comparisons: [string, string, string][] = [
  ['As Qs', 'Ah Qc', '숫자가 같다면 수딧인 쪽에 플러시를 만들 가능성이 추가됩니다.'],
  ['Kh 10h', 'Kc 10d', '같은 K와 10 조합에서 같은 무늬라는 추가 장점을 비교합니다.'],
  ['Ac Qh', 'Ad 6s', '둘 다 A가 있지만 Q가 더 높은 동반 카드입니다. A 원 페어가 생겼을 때도 중요할 수 있습니다.'],
  ['Ks Qd', 'Kh 7c', 'K 한 장만 보지 마세요. 함께 있는 Q가 7보다 높은 카드입니다.'],
  ['8s 8h', 'Qc 3d', '88은 이미 원 페어로 출발합니다. Q 한 장만으로 약한 동반 카드까지 보완되지는 않습니다.'],
  ['Qs Qd', '8c 4h', '높은 포켓 페어와 특별한 장점이 적은 패의 차이입니다. QQ도 승리를 보장하지는 않습니다.'],
  ['10s 9s', '10h 3h', '둘 다 수딧이지만 T9는 숫자도 이어져 스트레이트를 만들기에 더 유리합니다.'],
  ['9c 8c', '9d 3d', '같은 무늬뿐 아니라 숫자의 연결도 함께 보세요. 98은 커넥티드입니다.'],
  ['Ah Jc', 'Ad 3s', 'A가 있다는 이유만으로 같은 강도로 보지 않습니다. 함께 있는 J와 3의 차이를 봅니다.'],
]
// 모호한 네 등급 대신, 해당 카드에서 확인할 판단을 두 보기로 대비합니다.
const strengths: [string, string, string, string][] = [
  ['Ks Kh', '기본 강도가 높은 출발점이다.', '특별한 장점이 부족한 약한 패다.', 'KK는 매우 높은 포켓 페어입니다. 이후 보드와 상대 행동도 살펴야 합니다.'],
  ['Qd Qc', '기본 강도가 높은 출발점이다.', '특별한 장점이 부족한 약한 패다.', 'QQ는 높은 포켓 페어로 강하게 출발하는 대표 패입니다.'],
  ['Ah 10h', 'A가 포함된 조합과 수딧이라는 장점이 있다.', '같은 무늬 외에는 좋은 특징이 없다.', 'A가 있다는 점과 같은 무늬라는 장점을 함께 봅니다. 특징 문제의 기준에서는 T를 J·Q·K·A에 포함하지 않습니다. AA·KK와 같은 패라는 뜻도 아닙니다.'],
  ['Kc Qc', '높은 카드·수딧·연결성의 장점이 함께 있다.', '특별한 장점이 거의 없는 패다.', 'KQ는 높은 카드 두 장이며 무늬와 숫자의 연결도 좋습니다. 아직 완성된 페어는 아닙니다.'],
  ['9s 8s', '잠재력은 있지만 포지션과 상황을 살펴야 한다.', '높은 포켓 페어처럼 기본 강도가 매우 높다.', '수딧 커넥터는 잠재력이 있지만 낮은 카드이고 완성된 페어도 아닙니다.'],
  ['6d 5d', '잠재력은 있지만 포지션과 상황을 살펴야 한다.', '높은 포켓 페어처럼 기본 강도가 매우 높다.', '플러시와 스트레이트의 잠재력은 있지만 낮은 카드 두 장이라는 한계도 있습니다.'],
  ['8c 3h', '두 카드가 함께 만드는 장점이 부족하다.', '강한 시작 패의 특징이 여러 개 있다.', '페어가 아니며 무늬가 다르고 숫자도 멀리 떨어져 있습니다.'],
  ['10s 3d', 'T 한 장만으로 강한 패라고 보기 어렵다.', 'T가 있으므로 강한 패다.', '한 장만 보지 마세요. 두 카드가 함께 만드는 장점이 부족합니다.'],
  ['Jc Jh', '기본 강도가 높은 출발점이다.', '특별한 장점이 부족한 약한 패다.', 'JJ는 높은 포켓 페어입니다. 플랍에 Q·K·A가 나오면 이후 판단은 달라질 수 있습니다.'],
]
const positions: [string, PositionGroup, string, string, string][] = [
  ['Ks 10h', 'early', 'dependent', 'fold', '뒤에 행동할 플레이어가 많습니다. 입문용 기준에서는 애매한 KTo를 초반에 제외합니다.'],
  ['Ks 10h', 'late', 'dependent', 'raise', '앞선 플레이어가 모두 폴드했고 뒤에는 블라인드만 남았습니다. 초반보다 넓게 참여할 수 있습니다.'],
  ['Qd 10c', 'early', 'dependent', 'fold', '높은 카드가 있어도 초반부터 모든 조합을 플레이하지 않습니다. 참여할 패를 엄격하게 고릅니다.'],
  ['Qd 10c', 'late', 'dependent', 'raise', '초반보다 참여 범위를 넓힐 수 있는 상황입니다. 후반이라는 정보가 판단을 바꿉니다.'],
  ['As Ad', 'early', 'strong', 'raise', '초반이라고 강한 패까지 버리지는 않습니다. AA는 적극적으로 참여할 대표 패입니다.'],
  ['As Ad', 'late', 'strong', 'raise', '후반에서도 강한 패입니다. 위치가 달라져도 행동이 반드시 달라지지는 않습니다.'],
  ['8c 3h', 'early', 'weak', 'fold', '기본 장점이 부족하고 포지션도 불리합니다.'],
  ['8c 3h', 'late', 'weak', 'fold', '후반이라고 아무 패나 플레이하지 않습니다. 참여 범위를 넓히는 것과 모든 패로 참여하는 것은 다릅니다.'],
  ['Qh 9c', 'early', 'dependent', 'fold', '높은 카드 한 장만으로 참여하지 않습니다. 뒤에 행동할 플레이어가 많다는 점까지 봅니다.'],
  ['Qh 9c', 'late', 'dependent', 'raise', '입문용 기준에서는 후반에서 참여할 수 있습니다. 유리한 위치가 승리를 보장하지는 않습니다.'],
  ['8d 2c', 'late', 'weak', 'fold', '후반에서도 카드 조합의 장점이 부족합니다. 아직 블라인드 플레이어의 행동도 남아 있습니다.'],
]

export const part1PracticeQuestions: PracticeQuestion[] = [
  ...featureExamples.map(([cards, correctOptionIds, explanation], i): PracticeQuestion => ({
    id: `practice-identify-properties-${i + 1}`, lessonId: 'identify-properties', concept: 'p1-features', type: 'multi-choice',
    prompt: '이 시작 패의 특징을 모두 골라주세요. 높은 카드는 J·Q·K·A로 봅니다.', hands: [{ label: '내 시작 패', cards: hand(cards) }],
    options: features, correctOptionIds, explanation,
  })),
  ...comparisons.map(([better, weaker, explanation], i): PracticeQuestion => ({
    id: `practice-compare-hands-${i + 1}`, lessonId: 'compare-hands', concept: 'p1-compare', type: 'single-choice',
    prompt: '다른 조건이 같을 때, 배운 특징을 기준으로 더 유리한 출발점인 패는?',
    hands: [{ label: '패 A', cards: hand(i % 2 ? weaker : better) }, { label: '패 B', cards: hand(i % 2 ? better : weaker) }],
    options: [{ id: 'hand-a', label: '패 A' }, { id: 'hand-b', label: '패 B' }], correctOptionId: i % 2 ? 'hand-b' : 'hand-a', explanation,
  })),
  ...strengths.map(([cards, answer, other, explanation], i): PracticeQuestion => ({
    id: `practice-classify-strength-${i + 1}`, lessonId: 'classify-strength', concept: 'p1-strength', type: 'single-choice',
    prompt: '시작 패의 기본 강도와 특징을 바르게 설명한 것은?', hands: [{ label: '내 시작 패', cards: hand(cards) }],
    options: [{ id: 'reason', label: answer }, { id: 'misconception', label: other }], correctOptionId: 'reason', explanation,
  })),
  ...positions.map(([cards, position, kind, correctOptionId, explanation], i): PracticeQuestion => ({
    id: `practice-same-hand-different-position-${i + 1}`, lessonId: 'same-hand-different-position', concept: `p1-position-${kind}`, type: 'single-choice', position,
    prompt: `6인 테이블 · 약 100BB · 앞선 플레이어 모두 폴드 · 아직 레이즈 없음. ${position === 'early' ? '초반 (UTG)' : '후반 (버튼)'}에서 이 앱의 입문용 기준으로 어떤 행동이 적절할까요?`,
    hands: [{ label: '내 시작 패', cards: hand(cards) }], options: [{ id: 'raise', label: '오픈 레이즈' }, { id: 'fold', label: '폴드' }], correctOptionId,
    explanation: `${explanation} 실제 전략은 상대·스택·게임 조건에 따라 달라질 수 있습니다.`,
  })),
]
