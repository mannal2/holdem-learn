import type { PlayingCard, CardRank, CardSuit } from '../types/cards'
import type { SingleChoiceStep } from '../types/course'

export interface PracticeQuestion extends SingleChoiceStep { lessonId: string; concept: string }
// 각 행은 검수한 카드 상황입니다. 카드를 무작위 생성하거나 족보를 자동 판정하지 않습니다.
type Example = [hole: string, board: string, explanation: string, highlighted: number[]]
const suits: Record<string, CardSuit> = { s: 'spades', h: 'hearts', d: 'diamonds', c: 'clubs' }
function cards(value: string): PlayingCard[] {
  return value.split(' ').map(code => ({ rank: code.slice(0, -1) as CardRank, suit: suits[code.slice(-1)] }))
}
function questions(lessonId: string, concept: string, prompt: string, answer: string, choices: string[], examples: Example[]): PracticeQuestion[] {
  return examples.map(([hole, board, explanation, highlighted], index) => {
    const holeCards = cards(hole) as [PlayingCard, PlayingCard]
    const communityCards = cards(board) as [PlayingCard, PlayingCard, PlayingCard]
    const all = [...holeCards, ...communityCards]
    return { id: `practice-${lessonId}-${concept}-${index + 1}`, lessonId, concept, type: 'single-choice', prompt,
      options: choices.map((label, i) => ({ id: `option-${i}`, label })), correctOptionId: `option-${choices.indexOf(answer)}`, explanation,
      table: { holeCards, communityCards, highlightedCards: highlighted.map(i => all[i]) } }
  })
}
const changed = ['원 페어', '하이 카드']
const ranks = ['하이 카드', '원 페어', '투 페어', '트리플', '스트레이트', '플러시']
const pairs = ['탑 페어', '미들 페어', '바텀 페어', '오버페어']
const strong = ['원 페어', '투 페어', '셋']
const current = '현재 공개된 다섯 장으로 만든 족보는 무엇인가요?'
const position = '현재 내 원 페어의 위치를 바르게 설명한 것은?'

export const part2PracticeQuestions: PracticeQuestion[] = [
  ...questions('preflop-to-flop', 'hit', current, '원 페어', changed, [
    ['As Qh', 'Ad 6c 3s', '내 A와 공용 A가 짝이라 A 원 페어예요. 시작 패보다 현재 카드 구성을 봐요.', [0, 2]],
    ['Ks Jh', 'Kd 9c 4s', '내 K와 공용 K가 짝이 되어 K 원 페어입니다.', [0, 2]],
    ['Ah Jd', 'Jc 7s 2h', '내 J와 공용 J가 짝이라 J 원 페어예요. A가 아니라 J가 짝을 만들었어요.', [1, 2]],
    ['Qs Js', 'Jd 8c 3h', '내 J와 공용 J가 짝이라 J 원 페어예요. 같은 무늬 두 장만으로 플러시는 아니에요.', [1, 2]],
  ]),
  ...questions('preflop-to-flop', 'miss', current, '하이 카드', changed, [
    ['As Qh', '10d 6c 3s', 'A나 Q와 짝이 되는 카드가 없고 다른 족보도 없어 A 하이 카드입니다.', [0]],
    ['Ks Jh', '9d 6c 2s', 'K와 J가 보드에 맞지 않았고 다른 족보도 없어 K 하이 카드입니다.', [0]],
    ['Ah Jd', 'Qc 7s 2h', '높은 A를 들고 있어도 A 한 장은 페어가 아닙니다. 현재는 A 하이 카드입니다.', [0]],
    ['Qs Js', 'Ad 8c 3h', '짝이나 다른 족보가 없어 A 하이 카드예요. 가장 높은 A는 공용 카드에 있어요.', [2]],
  ]),
  ...questions('read-current-hand', 'high', current, '하이 카드', ranks, [
    ['As 10h', 'Kd 6c 2s', '짝·연속된 다섯 숫자·같은 무늬 다섯 장이 없어 A 하이 카드입니다.', [0]],
    ['Jh 8d', 'Ac 7s 3h', '내 카드보다 높은 A가 공용 카드에 있습니다. 현재는 A 하이 카드입니다.', [2]],
  ]),
  ...questions('read-current-hand', 'pair', current, '원 페어', ranks, [
    ['Qh 10d', 'Qc 7s 3h', '내 Q와 공용 Q 두 장으로 Q 원 페어입니다.', [0, 2]],
    ['7s 7h', 'Ad 9c 2s', '내 포켓 7 두 장이 이미 7 원 페어를 만듭니다.', [0, 1]],
  ]),
  ...questions('read-current-hand', 'two', current, '투 페어', ranks, [
    ['Jh 5d', 'Jc 5s 2h', 'J 두 장과 5 두 장, 서로 다른 두 종류의 짝이 있어 투 페어입니다.', [0, 1, 2, 3]],
    ['Qs 9h', 'Qd 9c 4s', 'Q와 9가 각각 짝을 이뤄 투 페어입니다.', [0, 1, 2, 3]],
  ]),
  ...questions('read-current-hand', 'trips', current, '트리플', ranks, [
    ['10s 10h', '10d 6c 2s', '10 세 장이라 트리플이에요. 내 포켓 페어에 공용 10이 더해진 이 형태를 셋이라고 불러요.', [0, 1, 2]],
    ['Kh 4d', 'Kc Ks 8h', 'K 세 장으로 트리플입니다. 셋과 달리 공용 카드에 K 두 장이 있습니다.', [0, 2, 3]],
  ]),
  ...questions('read-current-hand', 'straight', current, '스트레이트', ranks, [
    ['8s 9h', '10d Jc Qs', '8·9·10·J·Q 다섯 숫자가 연속되어 스트레이트입니다.', [0, 1, 2, 3, 4]],
    ['As 2h', '3d 4c 5s', 'A가 2 앞에 이어져 A·2·3·4·5 스트레이트예요. 이 경우 가장 높은 카드는 5예요.', [0, 1, 2, 3, 4]],
  ]),
  ...questions('read-current-hand', 'flush', current, '플러시', ranks, [
    ['Ah 8h', 'Kh 6h 2h', '하트가 다섯 장입니다. 숫자가 연속되지는 않아 플러시입니다.', [0, 1, 2, 3, 4]],
    ['Qc 9c', 'Ac 7c 3c', '내 클로버 2장과 공용 클로버 3장, 총 5장이라 플러시예요.', [0, 1, 2, 3, 4]],
  ]),
  ...questions('pair-types', 'top', position, '탑 페어', pairs, [
    ['As 9d', 'Ah 7c 3s', '보드에서 가장 높은 A와 내 A가 짝이므로 탑 페어입니다.', [0, 2]],
    ['Jh 8d', 'Jc 6s 2h', '보드에서 가장 높은 J와 내 J가 짝이므로 탑 페어입니다.', [0, 2]],
    ['Qs 5h', 'Qd 9c 4s', '내 Q와 공용 Q가 짝이에요. Q가 공용 카드 중 가장 높아 탑 페어예요.', [0, 2]],
  ]),
  ...questions('pair-types', 'middle', position, '미들 페어', pairs, [
    ['As 9d', 'Kh 9c 3s', '보드의 숫자는 K·9·3입니다. 가운데 9와 내 9가 짝이므로 미들 페어입니다.', [1, 3]],
    ['Jh 8d', 'Qc 8s 2h', '내 8과 공용 8이 짝이에요. 8은 공용 카드 Q·8·2의 가운데라 미들 페어예요.', [1, 3]],
    ['Qs 5h', 'Kd 5c 4s', '짝을 만든 숫자는 Q가 아니라 5예요. 공용 카드 K·5·4의 가운데라 미들 페어예요.', [1, 3]],
  ]),
  ...questions('pair-types', 'bottom', position, '바텀 페어', pairs, [
    ['As 3d', 'Kh 9c 3s', 'K·9·3 중 가장 낮은 3과 내 3이 짝이므로 바텀 페어입니다.', [1, 4]],
    ['Jh 2d', 'Qc 8s 2h', '보드의 가장 낮은 2와 내 2가 짝입니다.', [1, 4]],
    ['Qs 4h', 'Kd 9c 4s', '내 4와 공용 4가 짝이에요. 4가 공용 카드 중 가장 낮아 바텀 페어예요.', [1, 4]],
  ]),
  ...questions('pair-types', 'over', position, '오버페어', pairs, [
    ['Js Jh', '9d 5c 3s', '내 J 포켓 페어는 보드의 최고 카드 9보다 높아 오버페어입니다.', [0, 1]],
    ['10h 10d', '8c 6s 2h', '내 10 두 장이 페어예요. 공용 카드 중 가장 높은 8보다 높아 오버페어예요.', [0, 1]],
    ['Qs Qh', 'Jd 7c 4s', '내 Q 두 장이 페어예요. 공용 카드 중 가장 높은 J보다 높아 오버페어예요.', [0, 1]],
  ]),
  ...questions('two-pair-and-set', 'two', '현재 패의 구성에 맞는 이름은?', '투 페어', strong, [
    ['Qs 8h', 'Qd 8c 2s', '내 Q와 공용 Q, 내 8과 공용 8이 각각 짝이 되어 투 페어입니다.', [0, 1, 2, 3]],
    ['Jh 6d', 'Jc 6s 3h', 'J 두 장과 6 두 장으로 두 종류의 페어를 만듭니다.', [0, 1, 2, 3]],
    ['Ks 9h', 'Kd 9c 5s', 'K와 9가 각각 짝이라 투 페어예요. 같은 숫자 세 장인 셋과는 달라요.', [0, 1, 2, 3]],
    ['Ah 4d', 'Ac 4s 8h', '내 카드가 각각 보드와 짝을 이뤄 A와 4의 투 페어입니다.', [0, 1, 2, 3]],
  ]),
  ...questions('two-pair-and-set', 'set', '현재 패의 구성에 맞는 이름은?', '셋', strong, [
    ['5s 5h', 'Kd 5c 2s', '내 포켓 5 두 장과 공용 5 한 장으로 셋입니다.', [0, 1, 3]],
    ['Jh Jd', 'Ac Js 3h', '내 J 두 장에 공용 J가 더해져 셋이에요. 포켓 페어로 만든 트리플을 셋이라고 불러요.', [0, 1, 3]],
    ['9s 9h', 'Qd 9c 4s', '내 포켓 9에 보드의 9가 더해져 셋입니다. Q는 짝이 없습니다.', [0, 1, 3]],
    ['4h 4d', 'Kc 4s 7h', '내 4 두 장 + 공용 4 한 장으로 셋이에요. 서로 다른 페어 두 종류가 아니므로 투 페어는 아니에요.', [0, 1, 3]],
  ]),
  ...questions('board-and-risk', 'shared', '공용 카드의 페어에 대한 올바른 설명은?', '공용 카드의 페어라 상대도 쓸 수 있어요.', ['공용 카드의 페어라 상대도 쓸 수 있어요.', '내 카드로 만든 페어라 나만 쓸 수 있어요.', '내 카드와 짝이 없으니 페어가 없어요.'], [
    ['Ks Qh', '8d 8c 3s', '8 두 장은 공용 카드라 상대도 써요. 내 K와 Q가 만든 페어는 아니에요.', [2, 3]],
    ['Ah 10d', '6c 6s 2h', '공용 6 두 장이 페어예요. 내 A 한 장만으로 A 페어가 되지는 않아요.', [2, 3]],
    ['Qs Jd', '9h 4c 9s', '9 두 장이 떨어져 표시되어도 공용 카드의 페어입니다. 상대도 같은 보드를 씁니다.', [2, 4]],
    ['Kh 8d', '3c As 3h', '공용 3 두 장이 페어입니다. 이 페어만으로 내가 상대를 이긴다고 단정할 수 없습니다.', [2, 4]],
  ]),
  ...questions('board-and-risk', 'flush-risk', '현재 내 패와 보드의 위험을 함께 설명한 것은?', '내 패는 원 페어지만, 상대는 플러시일 수 있어요.', ['내 패는 원 페어지만, 상대는 플러시일 수 있어요.', '같은 무늬의 공용 카드 세 장이라 나는 플러시예요.', '내 페어가 높으니 상대는 더 강한 패가 없어요.'], [
    ['Ks Qd', 'Kh 8h 3h', '나는 K 원 페어예요. 상대가 하트 두 장이면 공용 하트 세 장과 합쳐 플러시예요. 실제 상대 패는 아직 몰라요.', [2, 3, 4]],
    ['Ah Jd', 'Ac 7c 2c', '나는 A 원 페어예요. 상대가 클로버 두 장이면 플러시예요. 내 클로버는 없어 나는 플러시가 아니에요.', [2, 3, 4]],
  ]),
  ...questions('board-and-risk', 'straight-risk', '현재 내 패와 보드의 위험을 함께 설명한 것은?', '내 패는 원 페어지만, 상대는 스트레이트일 수 있어요.', ['내 패는 원 페어지만, 상대는 스트레이트일 수 있어요.', '공용 카드 세 장이 이어져 나는 스트레이트예요.', '나는 오버페어라 상대는 더 강한 패가 없어요.'], [
    ['Qs Qh', '10d 9c 8s', '나는 Q 원 페어예요. 상대가 J·7이면 7·8·9·10·J 스트레이트예요. 이어진 공용 카드 세 장만으로 내 스트레이트는 아니에요.', [2, 3, 4]],
    ['Ks Kh', '8d 7c 6s', '나는 K 원 페어예요. 상대가 9·5이면 5·6·7·8·9 스트레이트예요. 실제 상대 패를 안다는 뜻은 아니에요.', [2, 3, 4]],
  ]),
]
