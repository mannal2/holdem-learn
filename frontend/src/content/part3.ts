import type { CardRank, CardSuit, PlayingCard } from '../types/cards'
import type { CommunityCards, LessonDefinition, PartDefinition, RuleVisual, SingleChoiceStep, TableRevealStep, TableStage } from '../types/course'

const card = (rank: CardRank, suit: CardSuit): PlayingCard => ({ rank, suit })
const table = (holeCards: [PlayingCard, PlayingCard], communityCards: CommunityCards, highlightedCards: PlayingCard[] = [], stage: TableStage = 'flop'): NonNullable<SingleChoiceStep['table']> => ({ holeCards, communityCards, highlightedCards, stage })
const reveal = (id: string, title: string, body: string, example: NonNullable<SingleChoiceStep['table']>, visual?: RuleVisual): TableRevealStep => ({ id, type: 'table-reveal', title, body, stage: example.stage ?? 'flop', holeCards: example.holeCards, communityCards: example.communityCards, highlightedCards: example.highlightedCards, visual })

// 확률을 계산하지 않고, 각 고정 값에 해당하는 기회와 조건을 붙여 표시합니다.
const odds = (turn: string, both: string, river: string): RuleVisual => ({ kind: 'draw-chances', rows: [
  { label: '플랍에서 다음 턴 1장', cards: ['턴'], value: turn, detail: '바로 다음 턴 카드로 완성될 확률' },
  { label: '플랍에서 턴·리버 모두 보기', cards: ['턴', '리버'], value: both, detail: '턴 또는 리버 중 적어도 한 장이 완성 카드면 돼요.' },
  { label: '턴에 완성되지 않았을 때', cards: ['리버'], value: river, detail: '마지막 리버 한 장으로 완성될 확률' },
] })

// 같은 상황을 비교하는 고정 예시입니다. 미공개 카드를 무작위로 생성하지 않습니다.
const hearts = table([card('A', 'hearts'), card('Q', 'hearts')], [card('9', 'hearts'), card('4', 'hearts'), card('2', 'clubs')])
const heartHit = table(hearts.holeCards, [card('9', 'hearts'), card('4', 'hearts'), card('2', 'clubs'), card('8', 'hearts')], [], 'turn')
const heartMiss = table(hearts.holeCards, [card('9', 'hearts'), card('4', 'hearts'), card('2', 'clubs'), card('8', 'clubs')], [], 'turn')
const openEnd = table([card('8', 'spades'), card('7', 'diamonds')], [card('6', 'clubs'), card('5', 'hearts'), card('K', 'spades')])
const gutshot = table(openEnd.holeCards, [card('5', 'clubs'), card('4', 'hearts'), card('K', 'spades')])
const spades = table([card('K', 'spades'), card('Q', 'spades')], [card('9', 'spades'), card('3', 'spades'), card('2', 'diamonds')])
const spadeTurn = table(spades.holeCards, [card('9', 'spades'), card('3', 'spades'), card('2', 'diamonds'), card('7', 'clubs')], [], 'turn')
const spadeRiver = table(spades.holeCards, [card('9', 'spades'), card('3', 'spades'), card('2', 'diamonds'), card('7', 'clubs'), card('J', 'diamonds')], [], 'river')

export const part3Lessons: Record<string, LessonDefinition> = {
  'made-hand-and-draw': {
    id: 'made-hand-and-draw', title: '지금의 패와 앞으로의 가능성', objective: '현재 족보와 드로우를 구분하고, 원 페어와 드로우가 동시에 있을 수 있음을 이해한다.',
    steps: [
      { id: 'p3-1-intro', type: 'explanation', title: '현재 패 다음에는 가능성을 봐요', body: '지금의 족보를 읽었다면, 어떤 카드가 나오면 좋아지는지도 살펴봐요.' },
      reveal('p3-1-flop', '아직 플러시는 아니에요', '드로우는 카드가 더 나오면 목표 족보를 완성할 수 있는 상태예요.', hearts, { kind: 'draw-facts', items: [{ label: '현재 패', value: 'A 하이', detail: '페어 없이 A가 가장 높아요.' }, { label: '앞으로의 가능성', value: '하트 한 장 → 플러시', detail: '지금 하트 4장, 완성에는 5장.' }] }),
      reveal('p3-1-hit', '턴에 하트가 나왔다면', '턴에 8♥가 추가됐어요. 내 하트 2장과 공용 하트 3장으로 플러시가 완성돼요.', heartHit),
      reveal('p3-1-made-flush', '완성된 다섯 장을 확인해요', '금색 테두리의 하트 다섯 장이 플러시를 만들어요. 공용 2♣는 사용하지 않아요.', table(heartHit.holeCards, heartHit.communityCards, [card('A', 'hearts'), card('Q', 'hearts'), card('9', 'hearts'), card('8', 'hearts'), card('4', 'hearts')], 'turn')),
      reveal('p3-1-miss', '같은 플랍, 다른 턴이었다면', '같은 플랍에서 턴이 8♣였던 다른 경우예요. 하트는 여전히 네 장이라 리버를 기다려야 해요.', heartMiss),
      { id: 'p3-1-q1', type: 'single-choice', table: table([card('K', 'spades'), card('J', 'spades')], [card('8', 'spades'), card('3', 'spades'), card('2', 'diamonds')], [card('K', 'spades'), card('J', 'spades'), card('8', 'spades'), card('3', 'spades')]), prompt: '현재 패와 앞으로의 가능성을 올바르게 설명한 것은?', options: [{ id: 'made', label: '이미 플러시다' }, { id: 'draw', label: 'K 하이, 스페이드 한 장 더 나오면 플러시' }], correctOptionId: 'draw', explanation: '지금은 K 하이예요. 스페이드 네 장이라 한 장 더 나오면 플러시가 돼요.' },
      { id: 'p3-1-q2', type: 'single-choice', table: table([card('K', 'hearts'), card('Q', 'hearts')], [card('K', 'clubs'), card('8', 'hearts'), card('3', 'hearts')], [card('K', 'hearts'), card('K', 'clubs'), card('Q', 'hearts'), card('8', 'hearts'), card('3', 'hearts')]), prompt: '이 패를 올바르게 설명한 것은?', options: [{ id: 'both', label: 'K 원 페어이면서 플러시 드로우도 있다' }, { id: 'pair-only', label: '원 페어가 있으므로 드로우는 없다' }], correctOptionId: 'both', explanation: 'K♥와 K♣로 원 페어가 있고, 하트 네 장으로 플러시 드로우도 있습니다. 현재 족보와 개선 가능성은 함께 설명할 수 있습니다.' },
      { id: 'p3-1-q3', type: 'single-choice', prompt: '플러시 드로우가 있다는 말은 플러시가 반드시 완성된다는 뜻일까요?', options: [{ id: 'guaranteed', label: '반드시 완성된다' }, { id: 'possible', label: '필요한 카드가 나오지 않으면 완성되지 않는다' }], correctOptionId: 'possible', explanation: '드로우는 가능성입니다. 필요한 문양이 턴과 리버에 나오지 않으면 플러시는 완성되지 않습니다.' },
      { id: 'p3-1-summary', type: 'summary', title: '현재와 가능성을 따로 말해요', body: '드로우는 아직 완성되지 않은 가능성입니다.', bullets: ['현재 완성된 족보를 먼저 확인합니다.', '어떤 카드가 나오면 좋아지는지 찾습니다.', '원 페어와 드로우가 동시에 있을 수도 있습니다.'] },
    ],
  },
  'flush-draw': {
    id: 'flush-draw', title: '플러시 드로우: 같은 문양을 함께 세기', objective: '내 카드와 보드를 합쳐 같은 문양을 세고, 한 장과 두 장이 필요한 상황을 구분한다.',
    steps: [
      { id: 'p3-2-intro', type: 'explanation', title: '같은 문양 다섯 장을 목표로 해요', body: '플러시는 같은 무늬 다섯 장이에요. 내 카드와 공용 카드를 함께 세요.' },
      reveal('p3-2-two-hole', '내 카드 두 장을 사용하는 경우', '하트 한 장만 더 나오면 플러시예요.', hearts, { kind: 'draw-facts', items: [{ label: '지금 보이는 하트', value: '내 카드 2 + 공용 2 = 4장', detail: '완성에는 하트 5장 필요' }] }),
      reveal('p3-2-one-hole', '내 카드 한 장만 사용해도 돼요', '내 카드 두 장이 같은 무늬일 필요는 없어요.', table([card('A', 'hearts'), card('Q', 'clubs')], [card('9', 'hearts'), card('4', 'hearts'), card('2', 'hearts')]), { kind: 'draw-facts', items: [{ label: '지금 보이는 하트', value: '내 카드 1 + 공용 3 = 4장', detail: '하트 한 장 더 나오면 플러시' }] }),
      reveal('p3-2-backdoor', '하트 세 장이면 한 장으로는 부족해요', '지금은 하트 세 장이에요. 두 장이 더 필요한 이런 가능성을 백도어 드로우라고 해요.', table([card('A', 'hearts'), card('Q', 'hearts')], [card('9', 'hearts'), card('4', 'clubs'), card('2', 'diamonds')]), { kind: 'draw-chances', rows: [{ label: '하트 세 장에서 플러시 완성', cards: ['턴', '리버'], detail: '두 장 모두 하트여야 해요. 턴만 하트면 아직 네 장이에요.' }] }),
      { id: 'p3-2-q1', type: 'single-choice', table: table([card('J', 'spades'), card('9', 'spades')], [card('K', 'spades'), card('4', 'spades'), card('2', 'diamonds')], [card('J', 'spades'), card('9', 'spades'), card('K', 'spades'), card('4', 'spades')]), prompt: '다음 한 장으로 플러시를 완성하는 문양은?', options: [{ id: 'hearts', label: '하트' }, { id: 'spades', label: '스페이드' }, { id: 'diamonds', label: '다이아몬드' }, { id: 'clubs', label: '클로버' }], correctOptionId: 'spades', explanation: '스페이드가 네 장입니다. 아직 보이지 않은 스페이드 한 장이 나오면 같은 문양 다섯 장을 구성합니다.' },
      { id: 'p3-2-q2', type: 'single-choice', table: table([card('Q', 'diamonds'), card('9', 'clubs')], [card('A', 'diamonds'), card('6', 'diamonds'), card('2', 'diamonds')], [card('Q', 'diamonds'), card('A', 'diamonds'), card('6', 'diamonds'), card('2', 'diamonds')]), prompt: '내 카드 두 장의 문양이 다른데도 플러시 드로우가 있을까요?', options: [{ id: 'yes', label: '있다' }, { id: 'no', label: '없다' }], correctOptionId: 'yes', explanation: 'Q♦와 보드의 다이아몬드 세 장을 합치면 네 장입니다. 다이아몬드 한 장이 더 나오면 플러시를 구성할 수 있습니다.' },
      { id: 'p3-2-q3', type: 'single-choice', table: table([card('K', 'clubs'), card('J', 'clubs')], [card('8', 'clubs'), card('5', 'diamonds'), card('2', 'hearts')], [card('K', 'clubs'), card('J', 'clubs'), card('8', 'clubs')]), prompt: '턴에 클로버 한 장이 나오면 바로 플러시가 될까요?', options: [{ id: 'made', label: '바로 플러시다' }, { id: 'two', label: '아직 네 장이므로 리버에도 클로버가 필요하다' }], correctOptionId: 'two', explanation: '플랍까지 클로버는 세 장입니다. 턴에 클로버가 나와도 네 장이며, 플러시에는 다섯 장이 필요합니다.' },
      { id: 'p3-2-summary', type: 'summary', title: '내 카드와 보드를 함께 세요', body: '내 카드와 공용 카드를 합쳐, 같은 무늬가 몇 장인지 봐요.', bullets: ['네 장이면 같은 무늬 한 장이 더 필요해요.', '플랍에서 세 장이면 턴과 리버 모두 같은 무늬여야 해요.', '내 카드 한 장 + 공용 카드 세 장으로도 드로우예요.'] },
    ],
  },
  'straight-draw': {
    id: 'straight-draw', title: '스트레이트 드로우: 양끝과 가운데 빈칸', objective: '완성에 필요한 숫자를 찾아 오픈엔디드와 거샷 드로우를 구분한다.',
    steps: [
      { id: 'p3-3-intro', type: 'explanation', title: '이번에는 문양보다 숫자를 봐요', body: '스트레이트는 무늬와 상관없이 연속된 다섯 숫자예요. 빠진 숫자를 찾아봐요.' },
      reveal('p3-3-open', '양끝이 열려 있어요', '이어진 네 숫자의 양끝을 기다리면 오픈엔디드 드로우예요.', openEnd, { kind: 'rank-sequences', rows: [{ label: '양끝에 필요한 숫자', ranks: ['4', '5', '6', '7', '8', '9'], needed: ['4', '9'], detail: '지금은 5–6–7–8. 점선의 4 또는 9 중 하나면 완성돼요.' }] }),
      reveal('p3-3-open-made', '9가 나오면 이렇게 완성돼요', '턴 9♣가 추가됐어요. 강조한 다섯 장이 스트레이트를 만들고 K♠는 사용하지 않아요.', table(openEnd.holeCards, [card('6', 'clubs'), card('5', 'hearts'), card('K', 'spades'), card('9', 'clubs')], [card('9', 'clubs'), card('8', 'spades'), card('7', 'diamonds'), card('6', 'clubs'), card('5', 'hearts')], 'turn'), { kind: 'rank-sequences', rows: [{ label: '완성된 숫자 순서', ranks: ['5', '6', '7', '8', '9'], detail: '9가 양끝 중 한쪽을 채웠어요. 4가 나와도 완성돼요.' }] }),
      reveal('p3-3-gutshot', '가운데에 빈칸이 있어요', '이번 공용 카드는 달라요. 가운데 한 숫자를 기다리면 거샷 드로우예요.', gutshot, { kind: 'rank-sequences', rows: [{ label: '가운데 필요한 숫자', ranks: ['4', '5', '6', '7', '8'], needed: ['6'], detail: '점선의 6이 아직 없어요. 3이나 9로는 빈칸을 채울 수 없어요.' }] }),
      reveal('p3-3-gutshot-made', '6이 가운데를 채워요', '턴 6♦가 추가됐어요. 강조한 다섯 장이 스트레이트를 만들고 K♠는 사용하지 않아요.', table(gutshot.holeCards, [card('5', 'clubs'), card('4', 'hearts'), card('K', 'spades'), card('6', 'diamonds')], [card('8', 'spades'), card('7', 'diamonds'), card('6', 'diamonds'), card('5', 'clubs'), card('4', 'hearts')], 'turn'), { kind: 'rank-sequences', rows: [{ label: '완성된 숫자 순서', ranks: ['4', '5', '6', '7', '8'], detail: '6이 가운데 빈칸을 채웠어요.' }] }),
      { id: 'p3-3-ace', type: 'explanation', title: 'A는 양쪽을 연결하는 카드가 아니에요', body: 'A는 가장 낮거나 가장 높게 쓸 수 있지만, K와 2를 이어주지는 않아요.', visual: { kind: 'rank-sequences', rows: [{ label: '가능 · A를 낮게 사용', ranks: ['A', '2', '3', '4', '5'], detail: 'A–2–3–4에서는 5만 기다려요. 양끝 드로우는 아니에요.' }, { label: '가능 · A를 높게 사용', ranks: ['10', 'J', 'Q', 'K', 'A'], detail: 'A를 K 다음에 놓을 수 있어요.' }, { label: '불가능 · 양쪽 연결', ranks: ['K', 'A', '2'], detail: 'K–A–2는 연속된 숫자가 아니에요.' }] } },
      { id: 'p3-3-q1', type: 'multi-choice', table: table([card('Q', 'clubs'), card('J', 'diamonds')], [card('10', 'hearts'), card('9', 'spades'), card('3', 'clubs')], [card('Q', 'clubs'), card('J', 'diamonds'), card('10', 'hearts'), card('9', 'spades')]), prompt: '다음 한 장으로 스트레이트를 완성하는 숫자를 모두 고르세요.', options: [{ id: 'Q', label: 'Q' }, { id: '8', label: '8' }, { id: '7', label: '7' }, { id: 'K', label: 'K' }], correctOptionIds: ['8', 'K'], explanation: '9–10–J–Q가 이어집니다. 8이면 8부터 Q까지, K이면 9부터 K까지 스트레이트입니다. Q는 페어만 만들며, 7은 8이 여전히 빠져 있습니다.' },
      { id: 'p3-3-q2', type: 'single-choice', table: table([card('Q', 'clubs'), card('10', 'diamonds')], [card('9', 'hearts'), card('8', 'spades'), card('3', 'clubs')], [card('Q', 'clubs'), card('10', 'diamonds'), card('9', 'hearts'), card('8', 'spades')]), prompt: '다음 한 장으로 스트레이트를 완성하는 숫자는?', options: [{ id: '7', label: '7' }, { id: 'J', label: 'J' }, { id: 'K', label: 'K' }], correctOptionId: 'J', explanation: '8–9–10–□–Q에서 J이 빠져 있습니다. 가운데 한 숫자가 필요한 거샷 드로우입니다.' },
      { id: 'p3-3-q3', type: 'single-choice', table: table([card('Q', 'clubs'), card('J', 'diamonds')], [card('9', 'hearts'), card('5', 'spades'), card('2', 'clubs')]), prompt: '턴에 10이 나오면 스트레이트가 바로 완성될까요?', options: [{ id: 'four', label: '아직 9–10–J–Q 네 숫자라 한 장이 더 필요하다' }, { id: 'made', label: '완성된다' }], correctOptionId: 'four', explanation: '턴에 10이 나와도 연결된 숫자는 네 개입니다. 스트레이트에는 연속된 다섯 숫자가 필요합니다.' },
      { id: 'p3-3-summary', type: 'summary', title: '이름보다 필요한 숫자를 찾아요', body: '다음 한 장으로 연속된 다섯 숫자를 만들 수 있는지 확인하세요.', bullets: ['양끝의 두 숫자를 기다리면 오픈엔디드 드로우입니다.', '가운데 한 숫자를 기다리면 거샷 드로우입니다.', '연결된 네 숫자는 아직 스트레이트가 아닙니다.'] },
    ],
  },
  'counting-outs': {
    id: 'counting-outs', title: '아웃츠: 숫자 종류가 아니라 카드 장수', objective: '지정한 족보를 완성하는 미확인 카드의 실제 장수를 센다.',
    steps: [
      { id: 'p3-4-intro', type: 'explanation', title: '좋아지는 카드가 몇 장일까요?', body: '아웃츠는 목표 족보를 완성하는, 아직 보이지 않는 카드의 장수예요.', visual: { kind: 'draw-facts', items: [{ label: '세는 기준', value: '숫자 종류가 아닌 카드 장수', detail: '플러시가 목표라면 페어만 만드는 카드는 제외해요.' }, { label: '이 레슨의 조건', value: '내 카드와 공용 카드만 공개', detail: '상대 카드 등 추가 공개 정보는 없어요.' }] } },
      reveal('p3-4-flush', '하트는 총 13장이에요', '이미 보이는 하트는 후보에서 빼요.', hearts, { kind: 'draw-facts', items: [{ label: '플러시 아웃츠', value: '13 − 4 = 9장', detail: '전체 하트 − 보이는 하트 = 미확인 후보' }] }),
      { id: 'p3-4-flush-outs', type: 'explanation', title: '플러시를 완성하는 아홉 장', body: '아래 하트 중 한 장이 공용 카드로 나오면 완성돼요. 미확인 후보 9장이지, 모두 실제 덱에 남아 있다는 뜻은 아니에요.', cardGroups: [{ label: '플러시를 완성하는 9아웃츠', cards: [card('K', 'hearts'), card('J', 'hearts'), card('10', 'hearts'), card('8', 'hearts'), card('7', 'hearts'), card('6', 'hearts'), card('5', 'hearts'), card('3', 'hearts'), card('2', 'hearts')] }] },
      reveal('p3-4-open', '두 숫자지만 두 장은 아니에요', '4 또는 9면 스트레이트예요. 각 숫자는 무늬별로 네 장씩 있어요.', openEnd, { kind: 'draw-facts', items: [{ label: '스트레이트 아웃츠', value: '4장 + 4장 = 8장', detail: '숫자 4 네 장 + 숫자 9 네 장' }] }),
      { id: 'p3-4-open-outs', type: 'explanation', title: '4 네 장과 9 네 장', body: '두 숫자를 기다리지만 카드는 총 여덟 장이에요. 아래 어느 한 장이면 완성돼요.', cardGroups: [{ label: '4 · 네 문양 4장', cards: [card('4', 'spades'), card('4', 'hearts'), card('4', 'diamonds'), card('4', 'clubs')] }, { label: '9 · 네 문양 4장', cards: [card('9', 'spades'), card('9', 'hearts'), card('9', 'diamonds'), card('9', 'clubs')] }] },
      reveal('p3-4-gutshot', '한 숫자를 기다려도 네 장이에요', '6이면 가운데가 채워져요. 무늬는 상관없어요.', gutshot, { kind: 'draw-facts', items: [{ label: '스트레이트 아웃츠', value: '숫자 6 × 네 문양 = 4장', detail: '한 숫자 종류를 기다려도 실제 카드는 네 장' }] }),
      { id: 'p3-4-gutshot-outs', type: 'explanation', title: '가운데를 채우는 네 장', body: '6 한 종류를 기다리지만 실제 카드는 네 장입니다. 페어를 만드는 다른 카드는 스트레이트 아웃츠로 세지 않습니다.', cardGroups: [{ label: '스트레이트를 완성하는 4아웃츠', cards: [card('6', 'spades'), card('6', 'hearts'), card('6', 'diamonds'), card('6', 'clubs')] }] },
      { id: 'p3-4-q1', type: 'single-choice', table: table([card('K', 'diamonds'), card('J', 'diamonds')], [card('8', 'diamonds'), card('4', 'diamonds'), card('2', 'spades')], [card('K', 'diamonds'), card('J', 'diamonds'), card('8', 'diamonds'), card('4', 'diamonds')]), prompt: '상대 카드 등 추가 공개 정보는 없습니다. 다음 한 장으로 플러시를 완성하는 미확인 아웃츠는 몇 장인가요?', options: [{ id: '4', label: '4장' }, { id: '9', label: '9장' }, { id: '13', label: '13장' }], correctOptionId: '9', explanation: '다이아몬드 13장 중 이미 보이는 네 장을 제외하면 9장입니다. K이나 J의 다른 문양은 페어를 만들 수 있지만 플러시 아웃츠에는 포함하지 않습니다.' },
      { id: 'p3-4-q2', type: 'single-choice', table: table([card('9', 'clubs'), card('8', 'diamonds')], [card('7', 'hearts'), card('6', 'spades'), card('K', 'clubs')], [card('9', 'clubs'), card('8', 'diamonds'), card('7', 'hearts'), card('6', 'spades')]), prompt: '추가 공개 정보는 없습니다. 5 또는 10이 나오면 스트레이트입니다. 스트레이트 아웃츠는 몇 장인가요?', options: [{ id: '2', label: '2장' }, { id: '4', label: '4장' }, { id: '8', label: '8장' }], correctOptionId: '8', explanation: '5가 네 장, 10이 네 장입니다. 두 숫자 종류를 기다리지만 카드 장수는 총 여덟 장입니다.' },
      { id: 'p3-4-q3', type: 'single-choice', table: table([card('9', 'clubs'), card('7', 'diamonds')], [card('6', 'hearts'), card('5', 'spades'), card('K', 'clubs')], [card('9', 'clubs'), card('7', 'diamonds'), card('6', 'hearts'), card('5', 'spades')]), prompt: '추가 공개 정보는 없습니다. 8이 나오면 스트레이트입니다. 스트레이트 아웃츠는 몇 장인가요?', options: [{ id: '1', label: '1장' }, { id: '4', label: '4장' }, { id: '8', label: '8장' }], correctOptionId: '4', explanation: '5–6–7–□–9의 빈칸은 8입니다. 아직 보이지 않은 8은 네 문양으로 네 장입니다.' },
      { id: 'p3-4-summary', type: 'summary', title: '목표를 정하고 카드 장수를 세요', body: '목표 족보를 완성하는 카드만 세요. 아래는 추가 공개 정보가 없는 예시예요.', visual: { kind: 'draw-facts', items: [{ label: '플러시 드로우', value: '13 − 4 = 9장' }, { label: '오픈엔디드', value: '4 + 4 = 8장' }, { label: '거샷', value: '한 숫자, 네 문양 = 4장' }] }, bullets: ['완성 후보라고 반드시 상대를 이기는 카드는 아니에요.'] },
    ],
  },
  'remaining-chances': {
    id: 'remaining-chances', title: '턴과 리버: 남은 기회가 다르다', objective: '다음 한 장과 리버까지 두 장의 완성 확률을 구분한다.',
    steps: [
      { id: 'p3-5-intro', type: 'explanation', title: '장수 다음에는 남은 기회를 봐요', body: '같은 드로우라도 완성 카드를 만날 기회가 줄면 확률이 달라져요.', visual: { kind: 'draw-chances', rows: [{ label: '플랍 이후 남은 기회', cards: ['턴', '리버'], detail: '두 장을 모두 본다면 두 번의 기회가 있어요.' }, { label: '턴에서 빗나간 뒤', cards: ['리버'], detail: '마지막 리버 한 번만 남아요.' }] } },
      reveal('p3-5-flop', '플랍에서는 두 장이 아직 남아 있어요', '스페이드 네 장이에요. 턴·리버를 모두 보면 둘 중 한 장만 스페이드여도 완성돼요.', spades),
      reveal('p3-5-turn', '턴에서 빗나가면 한 장만 남아요', '턴 7♣로는 완성되지 않았어요. 9아웃츠는 그대로지만, 이제 리버 한 장만 남아요.', spadeTurn),
      reveal('p3-5-river', '리버까지 빗나갔다면', '리버 J♦로도 완성되지 않았어요. 더 나올 공용 카드는 없어요. 드로우는 완성을 보장하지 않아요.', spadeRiver),
      { id: 'p3-5-conditions', type: 'explanation', title: '이 숫자는 완성 확률이에요', body: '퍼센트는 목표 족보가 완성될 가능성이에요. 상대를 이길 확률은 아니에요.', visual: { kind: 'draw-facts', items: [{ label: '약 35%의 뜻', value: '반복하면 약 100번 중 35번', detail: '이번 판에서 반드시 완성된다는 뜻은 아니에요.' }, { label: '계산의 조건', value: '추가 공개 정보 없음', detail: '내 카드와 공용 카드만 알고, 아웃츠가 계속 완성 후보라고 가정해요.' }, { label: '두 장을 보는 조건', value: '턴과 리버 모두 보기', detail: '중간에 폴드하면 리버까지 보지 못해요.' }] } },
      { id: 'p3-5-flush-odds', type: 'summary', title: '플러시 드로우 · 9아웃츠', body: '스페이드 네 장에서 한 장 더 만나 플러시가 될 확률이에요.', visual: odds('약 19%', '약 35%', '약 20%'), bullets: ['두 장이 모두 스페이드일 필요는 없어요. 턴에 완성된 경우도 포함해요.', '추가 공개 정보 없이 9아웃츠가 유지되는 예시예요.'] },
      { id: 'p3-5-open-odds', type: 'summary', title: '오픈엔디드 드로우 · 8아웃츠', body: '5–6–7–8에 4 또는 9 한 장이 붙어 스트레이트가 될 확률이에요.', visual: odds('약 17%', '약 31%', '약 17%'), bullets: ['4와 9가 모두 나올 필요는 없어요. 턴에 완성된 경우도 포함해요.', '추가 공개 정보 없이 8아웃츠가 유지되는 예시예요.'] },
      { id: 'p3-5-gutshot-odds', type: 'summary', title: '거샷 드로우 · 4아웃츠', body: '4–5–빈칸–7–8에 6 한 장이 나와 스트레이트가 될 확률이에요.', visual: odds('약 9%', '약 16%', '약 9%'), bullets: ['턴 또는 리버 중 한 번만 6이 나와도 돼요.', '추가 공개 정보 없이 4아웃츠가 유지되는 예시예요.'] },
      { id: 'p3-5-rule', type: 'summary', title: '2·4 법칙으로 빠르게 어림잡아요', body: '정확한 계산이 아닌 빠른 근삿값이에요. 9아웃츠로 비교해 봐요.', visual: { kind: 'draw-chances', rows: [{ label: '다음 공용 카드 1장 · ×2', cards: ['리버'], value: '9 × 2 ≈ 18%', detail: '턴에서 빗나간 뒤 리버를 기다리는 예시예요. 기본 계산은 약 20%예요.' }, { label: '플랍에서 턴·리버 모두 · ×4', cards: ['턴', '리버'], value: '9 × 4 ≈ 36%', detail: '둘 중 한 번이라도 완성될 확률을 어림잡아요. 기본 계산은 약 35%예요.' }] }, bullets: ['한 장을 보는 ×2는 플랍에서 다음 턴을 기다릴 때도 써요.', '아웃츠가 많은 복합 상황에서는 오차가 커질 수 있어요.'] },
      { id: 'p3-5-q1', type: 'single-choice', prompt: '같은 9아웃츠 플러시 드로우입니다. 다른 조건이 같다면 완성 가능성이 더 높은 것은?', options: [{ id: 'two', label: '플랍에서 턴·리버 두 장을 모두 보는 경우' }, { id: 'one', label: '완성되지 않은 턴에서 리버 한 장을 보는 경우' }], correctOptionId: 'two', explanation: '턴·리버를 모두 보면 두 번 중 한 번이라도 완성될 수 있어요. 턴에서 빗나간 뒤에는 리버 한 번만 남아요.' },
      { id: 'p3-5-q2', type: 'single-choice', table: spadeTurn, prompt: '플러시 9아웃츠로 리버 한 장을 기다립니다. 2·4 법칙으로 어림잡은 완성 확률은?', options: [{ id: '18', label: '약 18% — 9×2' }, { id: '36', label: '약 36% — 9×4' }], correctOptionId: '18', explanation: '남은 카드는 리버 한 장이므로 2를 곱해 약 18%로 추정합니다. 정확한 기본 계산은 약 20%이며, 여기서는 명시한 근사 방법을 묻습니다.' },
      { id: 'p3-5-q3', type: 'single-choice', prompt: '플랍에서 9아웃츠×4로 얻은 약 36%는 어떤 경우의 근삿값인가요?', options: [{ id: 'one', label: '턴 한 장만 보는 경우' }, { id: 'two', label: '턴과 리버 두 장을 모두 보는 경우' }, { id: 'win', label: '상대를 반드시 이기는 확률' }], correctOptionId: 'two', explanation: '4를 곱하는 것은 플랍에서 턴과 리버 두 장을 모두 보는 경우의 완성 가능성 추정이에요. 다음 한 장만 보는 경우는 아니에요.' },
      { id: 'p3-5-summary', type: 'summary', title: '확률 앞에 조건을 붙여요', body: '몇 장을 보는지와 무엇이 완성되는지를 함께 읽어요.', bullets: ['다음 한 장과 턴·리버 중 한 번이라도 완성되는 경우는 달라요.', '턴에 빗나갔다면 리버 한 번만 남아요. 서로 다른 조건의 확률을 더하지 않아요.', '2·4 법칙은 근삿값이에요.'] },
    ],
  },
  'draw-cautions': {
    id: 'draw-cautions', title: '완성돼도 반드시 이기는 것은 아니다', objective: '완성과 승리를 구분하고, 겹치는 아웃츠는 한 번만 센다.',
    steps: [
      { id: 'p3-6-intro', type: 'explanation', title: '가능성이 보여도 과신하지 마세요', body: '드로우를 찾았다고 과신하지 마세요. 완성 카드는 내 패를 개선하지만 승리를 보장하지 않습니다.' },
      reveal('p3-6-flush', '플러시가 완성됐어요', '턴에 Q♥가 나와 내 플러시가 완성됐습니다. 상대 카드가 아직 보이지 않는다면 누가 더 강한지는 확정할 수 없습니다.', table([card('8', 'hearts'), card('7', 'hearts')], [card('K', 'hearts'), card('4', 'hearts'), card('2', 'clubs'), card('Q', 'hearts')], [], 'turn')),
      { ...reveal('p3-6-higher-flush', '상대에게 더 높은 플러시가 있다면', '같은 공용 하트 3장에 각자의 하트 2장을 더해 비교해요. 아래는 가정일 뿐, 실제 상대 패나 최종 승패는 알 수 없어요.', table([card('8', 'hearts'), card('7', 'hearts')], [card('K', 'hearts'), card('4', 'hearts'), card('2', 'clubs'), card('Q', 'hearts')], [card('K', 'hearts'), card('Q', 'hearts'), card('4', 'hearts'), card('8', 'hearts'), card('7', 'hearts'), card('A', 'hearts'), card('J', 'hearts')], 'turn'), { kind: 'draw-facts', items: [{ label: '현재 내 패', value: 'K 하이 플러시' }, { label: '가정한 상대 패', value: 'A 하이 플러시', detail: '이 턴에서는 상대의 플러시가 더 높아요.' }] }), opponentCards: [card('A', 'hearts'), card('J', 'hearts')] },
      reveal('p3-6-combo', '두 가지 드로우가 함께 있다면', '하트 한 장이면 플러시, 4나 9면 스트레이트입니다. 두 목록을 단순히 더하면 같은 카드가 중복될 수 있습니다.', table([card('8', 'hearts'), card('7', 'hearts')], [card('6', 'hearts'), card('5', 'clubs'), card('K', 'hearts')])),
      { id: 'p3-6-overlap', type: 'explanation', title: '같은 카드는 한 번만 세요', body: '4♥와 9♥는 두 목록에 모두 들어가요. 중복된 두 장을 빼요.', visual: { kind: 'draw-facts', items: [{ label: '서로 다른 완성 후보', value: '9 + 8 − 2 = 15장', detail: '플러시 9 + 스트레이트 8 − 겹친 2. 모든 복합 드로우가 15아웃츠인 것은 아니에요.' }] }, cardGroups: [{ label: '두 드로우에 겹치는 카드', cards: [card('4', 'hearts'), card('9', 'hearts')] }] },
      { id: 'p3-6-q1', type: 'single-choice', table: table([card('9', 'clubs'), card('8', 'clubs')], [card('K', 'clubs'), card('5', 'clubs'), card('2', 'diamonds'), card('J', 'clubs')], [card('9', 'clubs'), card('8', 'clubs'), card('K', 'clubs'), card('5', 'clubs'), card('J', 'clubs')], 'turn'), prompt: '플러시가 완성됐습니다. 상대 카드가 안 보이는 지금, 맞는 설명은?', options: [{ id: 'win', label: '플러시니까 승리가 확정됐다' }, { id: 'uncertain', label: '상대가 더 강할 수 있어 승리는 확정할 수 없다' }], correctOptionId: 'uncertain', explanation: '상대가 A♣ Q♣라면 더 높은 플러시예요. 내 패의 완성과 승리 여부는 다른 판단이에요.' },
      { id: 'p3-6-q2', type: 'single-choice', table: table([card('J', 'diamonds'), card('10', 'diamonds')], [card('9', 'diamonds'), card('8', 'clubs'), card('2', 'diamonds')]), prompt: '7♦는 플러시와 스트레이트를 모두 완성합니다. 아웃츠 합계에서 7♦를 몇 번 세야 할까요?', options: [{ id: 'once', label: '한 번' }, { id: 'twice', label: '두 번' }], correctOptionId: 'once', explanation: '한 장이 두 목표를 완성해도 실제 카드는 한 장입니다. Q♦도 두 목록에 겹치므로 각각 한 번만 셉니다.' },
      { id: 'p3-6-q3', type: 'single-choice', prompt: '플러시 드로우가 있으면 베팅 금액과 상관없이 콜해도 될까요?', options: [{ id: 'always', label: '가능성이 있으니 무조건 따라간다' }, { id: 'context', label: '베팅 금액 등도 살펴야 한다' }], correctOptionId: 'context', explanation: '완성 가능성만으로 콜을 결정할 수는 없어요. 베팅 금액 등도 살펴야 해요. 그 판단은 이후 과정에서 배워요.' },
      { id: 'p3-6-summary', type: 'summary', title: '완성·승리·행동은 다른 판단이에요', body: '내 패가 좋아진다는 것만으로 모든 판단이 끝나지는 않습니다.', bullets: ['완성 가능성과 승리 가능성을 구분합니다.', '두 드로우가 겹쳐도 같은 카드는 한 번만 셉니다.', '드로우가 있다는 이유만으로 콜을 확정하지 않습니다.'] },
    ],
  },
  'draw-challenge': {
    id: 'draw-challenge', title: '미래 가능성 종합 도전', objective: '새로운 카드에서 현재 패·완성 카드·아웃츠·남은 기회를 함께 판단한다.', passingPercentage: 80,
    steps: [
      { id: 'p3-7-intro', type: 'summary', title: '새 카드에서도 같은 순서로 판단해요', body: '새로운 상황의 여섯 문제입니다. 5문제 이상 맞히면 통과합니다. 확률은 족보 완성 가능성이며 승리를 보장하지 않습니다.', bullets: ['현재 완성된 패는 무엇인가?', '어떤 카드가 나오면 목표 족보가 완성되는가?', '그 카드는 몇 장이고 앞으로 몇 장을 볼 수 있는가?', '완성되더라도 승리를 확정할 수 있는가?'] },
      { id: 'p3-7-q1', type: 'single-choice', table: table([card('A', 'clubs'), card('10', 'clubs')], [card('A', 'diamonds'), card('7', 'clubs'), card('3', 'clubs')], [card('A', 'clubs'), card('A', 'diamonds'), card('10', 'clubs'), card('7', 'clubs'), card('3', 'clubs')]), prompt: '현재 패와 앞으로의 가능성을 올바르게 설명한 것은?', options: [{ id: 'both', label: 'A 원 페어이며 플러시 드로우도 있다' }, { id: 'made', label: '이미 플러시다' }, { id: 'pair-only', label: 'A 원 페어이므로 드로우는 없다' }], correctOptionId: 'both', explanation: '두 A로 원 페어입니다. 클로버도 네 장이므로 클로버 한 장이 더 나오면 플러시가 됩니다.' },
      { id: 'p3-7-q2', type: 'single-choice', table: table([card('Q', 'diamonds'), card('8', 'spades')], [card('K', 'diamonds'), card('6', 'diamonds'), card('2', 'diamonds')], [card('Q', 'diamonds'), card('K', 'diamonds'), card('6', 'diamonds'), card('2', 'diamonds')]), prompt: '다음 한 장으로 내 플러시를 완성할 문양은?', options: [{ id: 'spades', label: '스페이드' }, { id: 'diamonds', label: '다이아몬드' }, { id: 'none', label: '내 카드가 다른 무늬라 완성 불가능' }], correctOptionId: 'diamonds', explanation: '내 Q♦와 공용 다이아몬드 세 장으로 네 장이에요. 다이아몬드 한 장 더 나오면 플러시예요.' },
      { id: 'p3-7-q3', type: 'multi-choice', table: table([card('J', 'clubs'), card('10', 'diamonds')], [card('9', 'hearts'), card('8', 'spades'), card('2', 'clubs')], [card('J', 'clubs'), card('10', 'diamonds'), card('9', 'hearts'), card('8', 'spades')]), prompt: '스트레이트를 완성할 숫자를 모두 고르세요.', options: [{ id: 'J', label: 'J' }, { id: '7', label: '7' }, { id: '6', label: '6' }, { id: 'Q', label: 'Q' }], correctOptionIds: ['7', 'Q'], explanation: '8–9–10–J의 양끝에 7 또는 Q가 붙으면 연속된 다섯 숫자입니다. J는 페어만 만들고, 6은 7이 빠져 있습니다.' },
      { id: 'p3-7-q4', type: 'single-choice', table: table([card('10', 'clubs'), card('8', 'diamonds')], [card('7', 'hearts'), card('6', 'spades'), card('A', 'clubs')], [card('10', 'clubs'), card('8', 'diamonds'), card('7', 'hearts'), card('6', 'spades')]), prompt: '상대 카드 등 추가 정보가 없을 때, 다음 한 장으로 스트레이트를 완성하는 아웃츠는?', options: [{ id: '1', label: '9 한 종류이므로 1장' }, { id: '8', label: '양끝 두 종류로 8장' }, { id: '4', label: '9 네 문양으로 4장' }], correctOptionId: '4', explanation: '6–7–8–□–10에서 9가 필요합니다. 아직 보이지 않은 9는 네 문양으로 네 장입니다. 페어를 만드는 카드는 여기서 세지 않습니다.' },
      { id: 'p3-7-q5', type: 'single-choice', table: table([card('K', 'hearts'), card('9', 'hearts')], [card('J', 'hearts'), card('5', 'hearts'), card('2', 'clubs'), card('3', 'diamonds')], [], 'turn'), prompt: '플러시 9아웃츠로 리버를 기다립니다. 2·4 법칙의 올바른 추정은?', options: [{ id: '18', label: '9×2로 약 18%' }, { id: '36', label: '9×4로 약 36%' }], correctOptionId: '18', explanation: '이제 리버 한 장만 남았으므로 2를 곱합니다. 이 값은 근삿값이며 상대를 이길 확률을 뜻하지 않습니다.' },
      { id: 'p3-7-q6', type: 'single-choice', table: table([card('Q', 'spades'), card('J', 'spades')], [card('9', 'spades'), card('4', 'spades'), card('2', 'hearts'), card('7', 'spades')], [card('Q', 'spades'), card('J', 'spades'), card('9', 'spades'), card('4', 'spades'), card('7', 'spades')], 'turn'), prompt: '플러시가 완성됐습니다. 올바른 설명은?', options: [{ id: 'win', label: '완성됐으니 상대 카드를 몰라도 승리가 확정된다' }, { id: 'uncertain', label: '더 높은 플러시가 가능해 승리는 확정할 수 없다' }], correctOptionId: 'uncertain', explanation: '내 패는 Q 하이 플러시예요. 상대가 A♠ 10♠라면 현재 더 높아요. 완성이 곧 승리는 아니에요.' },
      { id: 'p3-7-summary', type: 'summary', title: '현재에서 다음 카드까지 생각했어요', body: '지금의 패를 읽고, 좋아질 카드를 찾고, 장수와 남은 기회를 연결하세요.', bullets: ['현재 족보와 드로우는 따로 판단합니다.', '필요한 숫자·문양을 찾고 실제 카드 장수를 셉니다.', '다음 한 장과 리버까지 두 장을 구분합니다.', '드로우는 가능성이며 완성도 승리도 보장하지 않습니다.'] },
    ],
  },
}

export const part3: PartDefinition = {
  id: 'part-3', order: 3, title: '앞으로 좋아질 가능성 판단',
  description: '드로우와 아웃츠를 찾고 턴·리버에서 패가 좋아질 가능성을 판단합니다.',
  lessonIds: Object.keys(part3Lessons),
}
