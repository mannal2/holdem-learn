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
    ['As Qh', 'Ad 6c 3s', '내 A와 공용 A가 짝이 되어 A 원 페어입니다. 높은 시작 패의 이름이 아니라 공개된 카드를 확인합니다.', [0, 2]],
    ['Ks Jh', 'Kd 9c 4s', '내 K와 공용 K가 짝이 되어 K 원 페어입니다.', [0, 2]],
    ['Ah Jd', 'Jc 7s 2h', '내 J와 공용 J가 짝이 되어 J 원 페어입니다. A가 아니라 J가 페어를 만들었습니다.', [1, 2]],
    ['Qs Js', 'Jd 8c 3h', '내 J와 공용 J로 J 원 페어가 완성되었습니다. 시작 패가 수딧이라고 플러시가 되는 것은 아닙니다.', [1, 2]],
  ]),
  ...questions('preflop-to-flop', 'miss', current, '하이 카드', changed, [
    ['As Qh', '10d 6c 3s', 'A나 Q와 짝이 되는 카드가 없고 다른 족보도 없어 A 하이 카드입니다.', [0]],
    ['Ks Jh', '9d 6c 2s', 'K와 J가 보드에 맞지 않았고 다른 족보도 없어 K 하이 카드입니다.', [0]],
    ['Ah Jd', 'Qc 7s 2h', '높은 A를 들고 있어도 A 한 장은 페어가 아닙니다. 현재는 A 하이 카드입니다.', [0]],
    ['Qs Js', 'Ad 8c 3h', '같은 무늬 두 장만으로 플러시가 되지 않습니다. 다섯 장 중 가장 높은 공용 A를 기준으로 A 하이 카드입니다.', [2]],
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
    ['10s 10h', '10d 6c 2s', '10 세 장으로 트리플입니다. 포켓 페어 두 장에 보드 한 장이 더해진 형태는 셋이라고도 부릅니다.', [0, 1, 2]],
    ['Kh 4d', 'Kc Ks 8h', 'K 세 장으로 트리플입니다. 셋과 달리 공용 카드에 K 두 장이 있습니다.', [0, 2, 3]],
  ]),
  ...questions('read-current-hand', 'straight', current, '스트레이트', ranks, [
    ['8s 9h', '10d Jc Qs', '8·9·10·J·Q 다섯 숫자가 연속되어 스트레이트입니다.', [0, 1, 2, 3, 4]],
    ['As 2h', '3d 4c 5s', 'A는 A·2·3·4·5에서 낮은 숫자로 사용되어 5 하이 스트레이트입니다.', [0, 1, 2, 3, 4]],
  ]),
  ...questions('read-current-hand', 'flush', current, '플러시', ranks, [
    ['Ah 8h', 'Kh 6h 2h', '하트가 다섯 장입니다. 숫자가 연속되지는 않아 플러시입니다.', [0, 1, 2, 3, 4]],
    ['Qc 9c', 'Ac 7c 3c', '클로버 다섯 장이 모여 플러시입니다.', [0, 1, 2, 3, 4]],
  ]),
  ...questions('pair-types', 'top', position, '탑 페어', pairs, [
    ['As 9d', 'Ah 7c 3s', '보드에서 가장 높은 A와 내 A가 짝이므로 탑 페어입니다.', [0, 2]],
    ['Jh 8d', 'Jc 6s 2h', '보드에서 가장 높은 J와 내 J가 짝이므로 탑 페어입니다.', [0, 2]],
    ['Qs 5h', 'Qd 9c 4s', '보드의 최고 숫자 Q와 내 Q가 짝입니다. 내 다른 카드 5의 높이는 페어 위치를 바꾸지 않습니다.', [0, 2]],
  ]),
  ...questions('pair-types', 'middle', position, '미들 페어', pairs, [
    ['As 9d', 'Kh 9c 3s', '보드의 숫자는 K·9·3입니다. 가운데 9와 내 9가 짝이므로 미들 페어입니다.', [1, 3]],
    ['Jh 8d', 'Qc 8s 2h', 'Q·8·2 중 가운데 8이 내 8과 짝입니다.', [1, 3]],
    ['Qs 5h', 'Kd 5c 4s', '내 Q가 높아도 페어는 5가 만들었습니다. K·5·4 중 가운데 5이므로 미들 페어입니다.', [1, 3]],
  ]),
  ...questions('pair-types', 'bottom', position, '바텀 페어', pairs, [
    ['As 3d', 'Kh 9c 3s', 'K·9·3 중 가장 낮은 3과 내 3이 짝이므로 바텀 페어입니다.', [1, 4]],
    ['Jh 2d', 'Qc 8s 2h', '보드의 가장 낮은 2와 내 2가 짝입니다.', [1, 4]],
    ['Qs 4h', 'Kd 9c 4s', '내 Q의 높이가 아니라 짝을 만든 4의 위치를 봅니다. 4는 보드에서 가장 낮으므로 바텀 페어입니다.', [1, 4]],
  ]),
  ...questions('pair-types', 'over', position, '오버페어', pairs, [
    ['Js Jh', '9d 5c 3s', '내 J 포켓 페어는 보드의 최고 카드 9보다 높아 오버페어입니다.', [0, 1]],
    ['10h 10d', '8c 6s 2h', '내 10 포켓 페어가 보드의 모든 카드보다 높습니다.', [0, 1]],
    ['Qs Qh', 'Jd 7c 4s', '보드에 Q가 없어도 내 Q 두 장이 페어입니다. 보드 최고 J보다 높으므로 오버페어입니다.', [0, 1]],
  ]),
  ...questions('two-pair-and-set', 'two', '현재 패의 구성에 맞는 이름은?', '투 페어', strong, [
    ['Qs 8h', 'Qd 8c 2s', '내 Q와 공용 Q, 내 8과 공용 8이 각각 짝이 되어 투 페어입니다.', [0, 1, 2, 3]],
    ['Jh 6d', 'Jc 6s 3h', 'J 두 장과 6 두 장으로 두 종류의 페어를 만듭니다.', [0, 1, 2, 3]],
    ['Ks 9h', 'Kd 9c 5s', 'K와 9가 각각 두 장입니다. 같은 숫자 세 장이 아니므로 셋이 아니라 투 페어입니다.', [0, 1, 2, 3]],
    ['Ah 4d', 'Ac 4s 8h', '내 카드가 각각 보드와 짝을 이뤄 A와 4의 투 페어입니다.', [0, 1, 2, 3]],
  ]),
  ...questions('two-pair-and-set', 'set', '현재 패의 구성에 맞는 이름은?', '셋', strong, [
    ['5s 5h', 'Kd 5c 2s', '내 포켓 5 두 장과 공용 5 한 장으로 셋입니다.', [0, 1, 3]],
    ['Jh Jd', 'Ac Js 3h', '내 J 두 장과 공용 J 한 장이 같은 숫자 세 장을 만듭니다.', [0, 1, 3]],
    ['9s 9h', 'Qd 9c 4s', '내 포켓 9에 보드의 9가 더해져 셋입니다. Q는 짝이 없습니다.', [0, 1, 3]],
    ['4h 4d', 'Kc 4s 7h', '내 4 두 장에 공용 4 한 장이 더해졌습니다. 서로 다른 두 짝이 아니라 같은 숫자 세 장입니다.', [0, 1, 3]],
  ]),
  ...questions('board-and-risk', 'shared', '공용 카드의 페어에 대한 올바른 설명은?', '공용 카드끼리 만든 페어이므로 상대도 사용할 수 있다.', ['공용 카드끼리 만든 페어이므로 상대도 사용할 수 있다.', '내 카드가 보드와 짝이 된 것이므로 나만 사용할 수 있다.', '내 카드와 보드에 같은 숫자가 없으므로 페어가 없다.'], [
    ['Ks Qh', '8d 8c 3s', '8 두 장은 모두 공용 카드에 있습니다. 상대도 사용할 수 있고, 내 K와 Q는 그 페어를 만든 카드가 아닙니다.', [2, 3]],
    ['Ah 10d', '6c 6s 2h', '현재 6 페어는 보드의 6 두 장으로 구성됩니다. 내 A가 있다는 이유로 A 페어가 되는 것은 아닙니다.', [2, 3]],
    ['Qs Jd', '9h 4c 9s', '9 두 장이 떨어져 표시되어도 공용 카드의 페어입니다. 상대도 같은 보드를 씁니다.', [2, 4]],
    ['Kh 8d', '3c As 3h', '공용 3 두 장이 페어입니다. 이 페어만으로 내가 상대를 이긴다고 단정할 수 없습니다.', [2, 4]],
  ]),
  ...questions('board-and-risk', 'flush-risk', '현재 내 패와 보드의 위험을 함께 설명한 것은?', '나는 원 페어지만 상대는 이미 플러시일 수도 있다.', ['나는 원 페어지만 상대는 이미 플러시일 수도 있다.', '공용 카드에 같은 무늬 세 장이 있으므로 내가 이미 플러시다.', '나는 높은 원 페어이므로 상대가 더 강한 패를 만들 수 없다.'], [
    ['Ks Qd', 'Kh 8h 3h', '내 K는 K 원 페어입니다. 상대가 하트 두 장을 들고 있다면 공용 하트 세 장과 합쳐 이미 플러시입니다. 실제 상대 패는 모릅니다.', [2, 3, 4]],
    ['Ah Jd', 'Ac 7c 2c', '내 A는 A 원 페어입니다. 상대가 클로버 두 장을 갖고 있으면 이미 플러시일 수 있습니다. 내 클로버는 없으므로 나는 플러시가 아닙니다.', [2, 3, 4]],
  ]),
  ...questions('board-and-risk', 'straight-risk', '현재 내 패와 보드의 위험을 함께 설명한 것은?', '나는 원 페어지만 상대는 이미 스트레이트일 수도 있다.', ['나는 원 페어지만 상대는 이미 스트레이트일 수도 있다.', '보드의 숫자 세 장이 연속되므로 내가 이미 스트레이트다.', '나는 오버페어이므로 상대가 더 강한 패를 만들 수 없다.'], [
    ['Qs Qh', '10d 9c 8s', '나는 Q 원 페어입니다. 상대가 J와 7을 들고 있다면 7·8·9·10·J 스트레이트입니다. 연속된 세 장만으로 내 스트레이트가 완성된 것은 아닙니다.', [2, 3, 4]],
    ['Ks Kh', '8d 7c 6s', '나는 K 원 페어입니다. 상대가 9와 5를 들고 있다면 5·6·7·8·9 스트레이트입니다. 보드만 보고 상대의 실제 카드를 단정하지 않습니다.', [2, 3, 4]],
  ]),
]
