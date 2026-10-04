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
  { id: 'none', label: '해당 없음 (이 보기만 선택)' },
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
  ['10s 9s', '10h 3h', '둘 다 수딧이지만 10·9는 숫자도 이어져 스트레이트를 만들기 더 유리해요.'],
  ['9c 8c', '9d 3d', '같은 무늬뿐 아니라 숫자의 연결도 함께 보세요. 98은 커넥티드입니다.'],
  ['Ah Jc', 'Ad 3s', 'A가 있다는 이유만으로 같은 강도로 보지 않습니다. 함께 있는 J와 3의 차이를 봅니다.'],
]
// 모호한 네 등급 대신, 해당 카드에서 확인할 판단을 두 보기로 대비합니다.
const strengths: [string, string, string, string][] = [
  ['Ks Kh', '높은 포켓 페어라 강한 시작 패예요.', '장점이 부족한 약한 시작 패예요.', 'KK는 매우 높은 포켓 페어입니다. 이후 보드와 상대 행동도 살펴야 합니다.'],
  ['Qd Qc', '높은 포켓 페어라 강한 시작 패예요.', '장점이 부족한 약한 시작 패예요.', 'QQ는 높은 포켓 페어로 강하게 출발하는 대표 패입니다.'],
  ['Ah 10h', 'A와 같은 무늬라는 장점이 있어요.', '같은 무늬 외에는 좋은 특징이 없다.', 'A와 같은 무늬라는 장점이 있어요. 하지만 높은 포켓 페어처럼 이미 페어인 패는 아니에요.'],
  ['Kc Qc', '높은 카드·같은 무늬·연속된 숫자가 장점이에요.', '특별한 장점이 거의 없는 패다.', 'KQ는 높은 카드 두 장이며 무늬와 숫자의 연결도 좋습니다. 아직 완성된 페어는 아닙니다.'],
  ['9s 8s', '같은 무늬·연속된 숫자가 장점이지만, 자리도 살펴야 해요.', '높은 포켓 페어처럼 기본 강도가 매우 높다.', '수딧 커넥터는 잠재력이 있지만 낮은 카드이고 완성된 페어도 아닙니다.'],
  ['6d 5d', '같은 무늬·연속된 숫자가 장점이지만, 자리도 살펴야 해요.', '높은 포켓 페어처럼 기본 강도가 매우 높다.', '플러시와 스트레이트의 잠재력은 있지만 낮은 카드 두 장이라는 한계도 있습니다.'],
  ['8c 3h', '두 카드가 함께 만드는 장점이 부족하다.', '강한 시작 패의 특징이 여러 개 있다.', '페어가 아니며 무늬가 다르고 숫자도 멀리 떨어져 있습니다.'],
  ['10s 3d', '10 한 장만으로 강한 패는 아니에요.', '10이 있으므로 강한 패예요.', '한 장만 보지 마세요. 두 카드가 함께 만드는 장점이 부족합니다.'],
  ['Jc Jh', '높은 포켓 페어라 강한 시작 패예요.', '장점이 부족한 약한 시작 패예요.', 'JJ는 높은 포켓 페어입니다. 플랍에 Q·K·A가 나오면 이후 판단은 달라질 수 있습니다.'],
]
const positions: [string, PositionGroup, string, string, string][] = [
  ['Ks 10h', 'early', 'dependent', 'fold', '뒤에 행동할 사람이 많아요. 이 앱의 입문 기준에서는 K·10을 초반에 폴드해요.'],
  ['Ks 10h', 'late', 'dependent', 'raise', '뒤에는 SB·BB만 남아요. 이 앱의 입문 기준에서는 초반보다 넓게 참여할 수 있어요.'],
  ['Qd 10c', 'early', 'dependent', 'fold', '높은 카드가 있어도 초반에는 참여할 패를 신중하게 골라요. 이 앱에서는 Q·10을 폴드해요.'],
  ['Qd 10c', 'late', 'dependent', 'raise', '앞선 사람들이 폴드한 후반이라, 이 앱에서는 Q·10으로 참여할 수 있어요.'],
  ['As Ad', 'early', 'strong', 'raise', 'AA는 매우 강한 포켓 페어예요. 초반에서도 오픈 레이즈해요.'],
  ['As Ad', 'late', 'strong', 'raise', 'AA는 후반에서도 강한 패예요. 자리가 달라져도 오픈 레이즈한다는 판단은 같아요.'],
  ['8c 3h', 'early', 'weak', 'fold', '8·3은 페어도 아니고 무늬·숫자도 연결되지 않아요. 뒤에 사람도 많아 폴드해요.'],
  ['8c 3h', 'late', 'weak', 'fold', '8·3은 카드 조합의 장점이 적어요. 후반이어도 모든 패로 참여하지는 않아요.'],
  ['Qh 9c', 'early', 'dependent', 'fold', 'Q 한 장만 보고 참여하지 않아요. 뒤에 사람이 많아 이 앱에서는 Q·9를 폴드해요.'],
  ['Qh 9c', 'late', 'dependent', 'raise', '앞선 사람들이 폴드한 후반이라, 이 앱에서는 Q·9로 참여할 수 있어요. 승리 보장은 아니에요.'],
  ['8d 2c', 'late', 'weak', 'fold', '8·2는 조합의 장점이 적어요. 후반이어도 SB·BB가 남아 있으므로 폴드해요.'],
]

export const part1PracticeQuestions: PracticeQuestion[] = [
  ...featureExamples.map(([cards, correctOptionIds, explanation], i): PracticeQuestion => ({
    id: `practice-identify-properties-${i + 1}`, lessonId: 'identify-properties', concept: 'p1-features', type: 'multi-choice',
    prompt: '이 시작 패의 특징을 모두 골라주세요.', hands: [{ label: '내 시작 패', cards: hand(cards) }],
    options: features, correctOptionIds, explanation,
  })),
  ...comparisons.map(([better, weaker, explanation], i): PracticeQuestion => ({
    id: `practice-compare-hands-${i + 1}`, lessonId: 'compare-hands', concept: 'p1-compare', type: 'single-choice',
    prompt: '다른 조건이 같다면, 어느 시작 패가 더 유리할까요?',
    hands: [{ label: '패 A', cards: hand(i % 2 ? weaker : better) }, { label: '패 B', cards: hand(i % 2 ? better : weaker) }],
    options: [{ id: 'hand-a', label: '패 A' }, { id: 'hand-b', label: '패 B' }], correctOptionId: i % 2 ? 'hand-b' : 'hand-a', explanation,
  })),
  ...strengths.map(([cards, answer, other, explanation], i): PracticeQuestion => ({
    id: `practice-classify-strength-${i + 1}`, lessonId: 'classify-strength', concept: 'p1-strength', type: 'single-choice',
    prompt: '이 시작 패를 바르게 설명한 것은?', hands: [{ label: '내 시작 패', cards: hand(cards) }],
    options: [{ id: 'reason', label: answer }, { id: 'misconception', label: other }], correctOptionId: 'reason', explanation,
  })),
  ...positions.map(([cards, position, kind, correctOptionId, explanation], i): PracticeQuestion => ({
    id: `practice-same-hand-different-position-${i + 1}`, lessonId: 'same-hand-different-position', concept: `p1-position-${kind}`, type: 'single-choice',
    prompt: `${position === 'early' ? '초반 UTG' : '후반 딜러 버튼'}에서 어떤 행동이 적절할까요?`,
    visual: { kind: 'position', activeGroup: position, foldedBefore: position === 'late', holeCards: hand(cards), conditions: ['6인 테이블', '내 칩: 약 100BB', position === 'early' ? '내가 먼저 행동' : '앞선 플레이어 모두 폴드'], notes: ['100BB: 빅 블라인드 금액의 100배만큼 가진 칩', '이 앱의 입문 기준이에요. 실제 판단은 상대와 상황에 따라 달라져요.'] },
    options: [{ id: 'raise', label: '오픈 레이즈 — 처음으로 블라인드보다 높게 올리기' }, { id: 'fold', label: '폴드 — 카드 포기하기' }], correctOptionId,
    explanation,
  })),
]
