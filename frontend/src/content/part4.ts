import type { CardRank, CardSuit, PlayingCard } from '../types/cards'
import type { LearningStep, LessonDefinition, PartDefinition, RangeSceneVisual, RuleVisual } from '../types/course'

// 실제 카드와 정답을 정적으로 작성합니다. 상대의 실제 패를 계산하지 않습니다.
const suits: Record<string, CardSuit> = { s: 'spades', h: 'hearts', d: 'diamonds', c: 'clubs' }
const cards = (codes: string): PlayingCard[] => codes ? codes.split(' ').map(code => ({ rank: code.slice(0, -1) as CardRank, suit: suits[code.slice(-1)] })) : []
const hand = (codes: string) => cards(codes) as [PlayingCard, PlayingCard]
type Candidate = RangeSceneVisual['candidates'][number]
const candidate = (label: string, codes: string, details: Omit<Candidate, 'label' | 'cards'> = {}): Candidate => ({ label, cards: hand(codes), ...details })
const scene = (board: string, candidates: Candidate[] = [], details: Partial<Omit<RangeSceneVisual, 'kind' | 'board' | 'candidates'>> = {}): RangeSceneVisual => {
  const community = cards(board)
  return { kind: 'range-scene', stage: community.length === 4 ? 'turn' : community.length === 5 ? 'river' : community.length === 3 ? 'flop' : 'preflop', board: community, candidates, ...details }
}
const explain = (id: string, title: string, body: string, visual?: RuleVisual): LearningStep => ({ id, type: 'explanation', title, body, visual })
const summary = (id: string, title: string, body: string, bullets: string[] = []): LearningStep => ({ id, type: 'summary', title, body, bullets })

// 보기 위치는 제작용입니다. 저장·채점에는 아래 고정 ID를 사용합니다.
function question(n: number, prompt: string, labels: string[], answers: number[], explanation: string, visual: RuleVisual, feedbackVisual?: RuleVisual, conditions?: string[]): LearningStep {
  const options = labels.map((label, index) => ({ id: `p4-q${n}-option-${index}`, label }))
  const common = { id: `p4-q${String(n).padStart(2, '0')}`, prompt, options, explanation, visual, feedbackVisual, conditions }
  return answers.length === 1
    ? { ...common, type: 'single-choice', correctOptionId: options[answers[0]].id }
    : { ...common, type: 'multi-choice', correctOptionIds: answers.map(index => options[index].id) }
}
const positionComparison: RuleVisual = { kind: 'position-scenes', rows: [{ label: 'A · 초반에서 첫 레이즈', activeGroup: 'early' }, { label: 'B · 앞선 세 사람 폴드 후 버튼 레이즈', activeGroup: 'late', foldedBefore: true }] }
const comparisonConditions = ['6인 · 같은 상대 · 비슷한 보유 칩', '앞에 참가한 사람 없이 첫 레이즈']
const tendency = '앞선 여러 판에서 강한 패로 큰 베팅을 자주 했어요.'
const bets = (rows: { label: string; pot: number; bet: number }[], showRatio = false): RuleVisual => ({ kind: 'bet-comparison', rows, showRatio })
const lines = (rows: { label: string; actions: string[] }[]): RuleVisual => ({ kind: 'action-lines', rows })

const s1Board = 'Ks 8d 3c'
const s1 = scene(s1Board, [candidate('AK', 'Ah Kd', { status: 'K 원 페어' }), candidate('88', '8c 8h', { status: '셋' }), candidate('AQ', 'Ac Qd', { status: '현재 페어 없음 · 블러프 가능' })], { history: ['상대 베팅'] })
const s3Board = 'Qs 8s 3d'
const s3Candidates = [candidate('후보 A', 'Qh Jc'), candidate('후보 B', '8h 8d'), candidate('후보 C', 'As Js')]
const s4Board = 'Kh 9h 4c'
const s6Hole = hand('Ah Jd')
const s6Candidates = [candidate('후보 A', 'Kh Qh'), candidate('후보 B', 'Js 10s'), candidate('후보 C', '8c 8d')]
const s6Start = ['프리플랍: UTG·HJ·CO 폴드', '상대 버튼 레이즈', 'SB 폴드', '나 BB 콜']
const s6FlopHistory = [...s6Start, '플랍: 나 체크', '상대 베팅']
const s6TurnHistory = [...s6FlopHistory, '나 콜', '턴: 나 체크', '상대 베팅']
const s6 = (turn: boolean, history: string[], candidates = s6Candidates): RangeSceneVisual => scene(turn ? 'Jh 8h 2c 4h' : 'Jh 8h 2c', candidates, { holeCards: s6Hole, history, markLatestCard: turn })

export const part4: PartDefinition = {
  id: 'part-4', order: 4, title: '상대가 가질 수 있는 패 추론',
  description: '자리·카드·행동을 연결해, 상대가 가질 수 있는 패의 범위를 생각해요.',
  lessonIds: ['several-possible-hands', 'position-and-first-action', 'board-and-candidates', 'actions-and-reasons', 'bet-size-clues', 'updating-a-range', 'range-challenge'],
}

export const part4Lessons: Record<string, LessonDefinition> = {
  'several-possible-hands': {
    id: 'several-possible-hands', title: '상대 패는 하나로 정할 수 없어요', objective: '같은 베팅에 어떤 패들이 가능한지 살펴봐요.',
    steps: [
      explain('p4-1-intro', '베팅했으니 AK일까요?', '베팅만 보고 상대의 두 장을 정할 수는 없어요.', scene(s1Board, [], { history: ['상대 베팅'] })),
      explain('p4-1-value', '같은 베팅, 다른 패', '원 페어로도, 셋으로도 베팅할 수 있어요.', { ...s1, candidates: s1.candidates.slice(0, 2) }),
      explain('p4-1-bluff', '페어가 없어도 베팅해요', '상대가 포기하기를 바라며 베팅할 수도 있어요. 이런 시도를 블러프라고 해요.', { ...s1, candidates: s1.candidates.slice(2) }),
      explain('p4-1-range', '여러 후보를 함께 생각해요', '상대가 가질 수 있다고 생각하는 패의 범위를 레인지라고 해요.', s1),
      question(1, '상대가 베팅했어요. 어떤 판단이 맞을까요?', ['반드시 AK예요.', '여러 종류의 패가 가능해요.'], [1], '같은 베팅도 원 페어·셋·블러프에서 나올 수 있어요.', scene(s1Board, [], { history: ['상대 베팅'] }), s1, ['플랍에 두 사람만 남음']),
      question(2, '여러 상대 패를 후보로 생각하는 이유는 무엇일까요?', ['아직 실제 패를 모르기 때문이에요.', '세 패의 가능성이 똑같기 때문이에요.'], [0], '후보를 함께 남긴다는 뜻이지, 가능성이 모두 같다는 뜻은 아니에요.', scene('', [candidate('후보 A', 'As Jd'), candidate('후보 B', 'Jc Jh'), candidate('후보 C', 'Kc Qc')])),
      summary('p4-1-summary', '핵심 정리', '여러 후보를 남기고, 다음 정보를 기다려요.'),
    ],
  },
  'position-and-first-action': {
    id: 'position-and-first-action', title: '자리와 첫 행동에서 출발해요', objective: '상대의 자리와 앞선 행동을 함께 봐요.',
    steps: [
      explain('p4-2-early', '뒤에 몇 명이 남았나요?', '뒤에 결정할 사람이 많을수록 시작패를 더 신중하게 고르는 편이에요.', { kind: 'position-scenes', rows: [{ label: '초반 자리 · UTG', activeGroup: 'early' }] }),
      explain('p4-2-late', '후반에는 더 넓게 참가할 수 있어요', '앞선 사람들이 모두 폴드했다면, 버튼에서는 더 다양한 패로 참가할 수 있어요.', { kind: 'position-scenes', rows: [{ label: '딜러 버튼', activeGroup: 'late', foldedBefore: true }] }),
      question(3, '일반적으로 더 다양한 패로 참가할 수 있는 쪽은 어디일까요?', ['A · 초반 자리', 'B · 딜러 버튼'], [1], '버튼은 뒤에 두 사람만 남아, 초반보다 다양한 패로 첫 레이즈를 할 수 있어요.', positionComparison, undefined, comparisonConditions),
      explain('p4-2-raises', '먼저 올린 건가요, 다시 올린 건가요?', '첫 레이즈와 재레이즈는 앞선 상황이 달라요.', lines([{ label: '첫 레이즈', actions: ['모두 폴드', '상대 레이즈'] }, { label: '재레이즈', actions: ['앞사람 레이즈', '상대 재레이즈'] }])),
      question(4, '앞선 레이즈 금액을 다시 올린 장면은 무엇인가요?', ['B · 재레이즈', 'A · 콜'], [0], '재레이즈는 앞사람이 올린 금액을 다시 높이는 행동이에요.', lines([{ label: 'A', actions: ['앞사람 레이즈', '상대 콜'] }, { label: 'B', actions: ['앞사람 레이즈', '상대 재레이즈'] }])),
      explain('p4-2-call', '콜에도 여러 패가 있어요', '콜만 보고 작은 페어라고 정할 수는 없어요.', scene('', [candidate('작은 페어', '7c 7d'), candidate('다른 후보', 'As Js')], { history: ['앞사람 레이즈', '상대 콜'] })),
      question(5, '재레이즈한 상대 후보를 어떻게 생각할까요?', ['AA만 남겨요.', '여러 후보를 남겨요.'], [1], 'AA 외의 강한 패나 블러프로도 재레이즈할 수 있어요.', lines([{ label: '프리플랍', actions: ['앞사람 레이즈', '상대 재레이즈'] }]), undefined, ['상대의 특별한 성향은 모름']),
      summary('p4-2-summary', '핵심 정리', '상대 자리 → 앞선 행동 → 상대 행동 순서로 살펴봐요.'),
    ],
  },
  'board-and-candidates': {
    id: 'board-and-candidates', title: '공용 카드가 후보를 바꿔요', objective: '상대에게 가능한 족보와 드로우를 살펴봐요.',
    steps: [
      explain('p4-3-made', '같은 공용 카드, 다른 족보', '상대 후보마다 만들어지는 패가 달라요.', scene(s3Board, [candidate('QJ', 'Qh Jc', { status: '탑 페어' }), candidate('88', '8h 8d', { status: '셋' })])),
      explain('p4-3-draw', '아직 완성되지 않은 후보도 있어요', '지금의 족보와 앞으로의 가능성을 함께 봐요.', scene(s3Board, [candidate('스페이드 AJ', 'As Js', { status: '페어 없음 + 플러시 드로우' }), candidate('다른 무늬 AK', 'Ah Kc', { status: '페어 없음' })])),
      question(6, '현재 셋을 가진 후보는 무엇인가요?', ['후보 A', '후보 B', '후보 C'], [1], '개인 카드 8 두 장과 공용 카드 8이 만나 셋이 돼요.', scene(s3Board, s3Candidates), scene(s3Board, [s3Candidates[0], candidate('후보 B', '8h 8d', { status: '셋', highlightedCards: cards('8h 8d') }), s3Candidates[2]], { boardHighlights: cards('8s') })),
      question(7, '스페이드 한 장이 더 나오면 플러시가 되는 후보는 무엇인가요?', ['후보 A', '후보 B', '후보 C'], [0], 'A♠ J♠는 공용 카드와 합쳐 스페이드가 네 장이에요.', scene(s3Board, [candidate('후보 A', 'As Js'), candidate('후보 B', 'Ah Kc'), candidate('후보 C', 'Qh Jc')]), scene(s3Board, [candidate('후보 A', 'As Js', { status: '스페이드 4장 · 플러시 드로우' }), candidate('후보 B', 'Ah Kc'), candidate('후보 C', 'Qh Jc')])),
      explain('p4-3-pair', '페어와 드로우가 함께 있을 수 있어요', '원 페어와 플러시 드로우가 함께 있어요.', scene('Jh 7h 2h', [candidate('후보', 'Jc Ah', { status: '현재: 탑 페어', highlightedCards: cards('Jc') })], { boardHighlights: cards('Jh') })),
      explain('p4-3-both', '탑 페어이면서 플러시 드로우', '하트 한 장이 더 나오면 플러시예요.', scene('Jh 7h 2h', [candidate('후보', 'Jc Ah', { status: '탑 페어 + 하트 4장 · 플러시 드로우' })])),
      question(8, '이 후보에 맞는 설명을 모두 고르세요.', ['이미 플러시예요.', '탑 페어예요.', '플러시 드로우예요.'], [1, 2], 'K 원 페어가 있고, 다이아몬드 한 장이 더 나오면 플러시도 완성돼요.', scene('Kd 8d 3d', [candidate('후보', 'Kc Ad')]), scene('Kd 8d 3d', [candidate('후보', 'Kc Ad', { status: '현재: 탑 페어 / 가능성: 플러시 드로우' })])),
      summary('p4-3-summary', '핵심 정리', '현재 패와 앞으로의 가능성을 함께 봐요.', ['지금 무엇인가요?', '다음 카드로 좋아질 수 있나요?']),
    ],
  },
  'actions-and-reasons': {
    id: 'actions-and-reasons', title: '같은 행동에도 여러 이유가 있어요', objective: '베팅·콜·체크의 여러 이유를 알아봐요.',
    steps: [
      explain('p4-4-value', '좋은 패로 더 받을 수 있어요', '좋은 패를 가진 상대는 칩을 더 받으려고 베팅할 수 있어요.', scene(s4Board, [candidate('KQ', 'Kc Qd', { status: '탑 페어' })], { history: ['상대 베팅'] })),
      explain('p4-4-draw', '드로우로도 베팅할 수 있어요', '지금 상대가 포기해도 좋고, 다음 카드로 좋아질 수도 있어요.', scene(s4Board, [candidate('하트 AJ', 'Ah Jh', { status: '플러시 드로우' })], { history: ['상대 베팅'] })),
      question(9, '상대가 베팅할 수 있는 이유를 모두 고르세요.', ['후보 A로 칩을 더 받으려고', '후보 B로 이미 플러시여서', '후보 B로 상대가 포기하길 바라며'], [0, 2], '탑 페어로 더 받으려 하거나, 드로우로 상대의 폴드를 기대할 수 있어요.', scene(s4Board, [candidate('후보 A', 'Kc Qd'), candidate('후보 B', 'Ah Jh')], { history: ['상대 베팅'] }), undefined, ['플랍에 두 사람만 남음']),
      explain('p4-4-call', '콜은 드로우일 수도 있어요', '다음 카드를 보려고 베팅을 따라갈 수도 있어요.', scene(s4Board, [candidate('하트 AJ', 'Ah Jh', { status: '플러시 드로우' })], { history: ['나 베팅', '상대 콜'] })),
      question(10, '이 플러시 드로우를 상대 후보로 남길까요?', ['후보로 남겨요.', '콜했으니 제외해요.'], [0], '플러시 완성을 기다리며 콜할 수도 있어요.', scene('Qc 10c 4d', [candidate('후보', 'Ac 8c')], { history: ['나 베팅', '상대 콜'] })),
      explain('p4-4-check', '체크만으로 강한 패를 지우지 않아요', '강한 패로 상대가 베팅하기를 기다릴 수도 있어요.', scene(s4Board, [candidate('99', '9c 9d', { status: '셋' })], { history: ['상대 체크'] })),
      question(11, '체크했다는 이유만으로 이 셋 후보를 지워도 될까요?', ['지워도 돼요.', '남겨야 해요.'], [1], '셋을 가지고도 상대의 베팅을 기다리며 체크할 수 있어요.', scene('Ad 7c 2s', [candidate('후보', '7d 7h')], { history: ['상대 체크'] })),
      summary('p4-4-summary', '핵심 정리', '베팅·콜·체크에 연결되는 여러 후보를 함께 생각해요.'),
    ],
  },
  'bet-size-clues': {
    id: 'bet-size-clues', title: '베팅 크기도 단서예요', objective: '베팅 크기와 상대의 습관을 함께 봐요.',
    steps: [
      explain('p4-5-pot', '가운데 모인 칩과 비교해요', '팟은 지금까지 가운데 모인 칩이에요. 베팅은 팟에 비해 얼마나 큰지 봐요.', bets([{ label: '팟의 절반 베팅', pot: 100, bet: 50 }], true)),
      explain('p4-5-size', '같은 50칩도 달라요', '팟이 다르면 같은 베팅도 비중이 달라요.', bets([{ label: 'A · 팟의 절반', pot: 100, bet: 50 }, { label: 'B · 팟의 10분의 1', pot: 500, bet: 50 }], true)),
      question(12, '팟에 비해 더 큰 베팅은 어느 쪽인가요?', ['A', 'B'], [0], 'A는 팟의 절반, B는 5분의 1을 베팅했어요.', bets([{ label: 'A', pot: 80, bet: 40 }, { label: 'B', pot: 200, bet: 40 }]), bets([{ label: 'A', pot: 80, bet: 40 }, { label: 'B', pot: 200, bet: 40 }], true)),
      explain('p4-5-bluff', '크게 걸어도 패는 확정되지 않아요', '큰 베팅에는 강한 패뿐 아니라 블러프도 있을 수 있어요.', { kind: 'draw-facts', items: [{ label: '강한 패', value: '강한 패로 더 받기' }, { label: '블러프', value: '블러프로 폴드 유도' }] }),
      question(13, '이 정보만으로 할 수 있는 판단은 무엇인가요?', ['강한 패로 확정해요.', '강한 패와 블러프를 모두 고려해요.'], [1], '팟만큼 크게 베팅했다는 사실만으로 상대 패를 확정할 수는 없어요.', bets([{ label: '이번 베팅', pot: 100, bet: 100 }]), undefined, ['상대의 성향은 모름']),
      explain('p4-5-tendency', '관찰한 습관을 함께 봐요', '앞선 판에서 본 상대의 습관도 참고해요.', lines([{ label: '관찰한 상대', actions: ['여러 판 확인: 강한 패일 때 큰 베팅을 자주 함', '이번에도 큰 베팅'] }])),
      question(14, '이번 큰 베팅은 어떻게 볼까요?', ['강한 패 쪽에 더 무게를 둬요.', '베팅 크기와 습관은 무시해요.'], [0], '앞서 본 습관 때문에 강한 패를 더 의심할 수 있어요.', bets([{ label: '이번 베팅', pot: 100, bet: 100 }]), undefined, [tendency]),
      summary('p4-5-summary', '핵심 정리', '팟 대비 크기와 관찰한 행동을 함께 살펴봐요.'),
    ],
  },
  'updating-a-range': {
    id: 'updating-a-range', title: '새로운 정보로 다시 판단해요', objective: '새 카드와 행동을 보고 가능한 패를 다시 살펴봐요.',
    steps: [
      explain('p4-6-start', '출발한 상황을 기억해요', '상대는 앞선 사람들이 폴드한 뒤 버튼에서 레이즈했어요.', { kind: 'position-scenes', rows: [{ label: '6인 · 상대는 버튼, 나는 BB', activeGroup: 'late', foldedBefore: true }], holeCards: s6Hole, history: s6Start }),
      question(15, '내가 가진 카드 때문에 제외해야 하는 후보는 무엇인가요?', ['후보 A', '후보 B', '후보 C'], [0], 'A♥는 내가 가지고 있어요. 상대가 같은 A♥를 가질 수는 없어요.', scene('', [candidate('후보 A', 'Ah Qc', { impossibleExample: true }), s6Candidates[0], s6Candidates[2]].map((c, i) => ({ ...c, label: `후보 ${['A', 'B', 'C'][i]}` })), { holeCards: s6Hole, history: s6Start }), scene('', [candidate('후보 A', 'Ah Qc', { impossibleExample: true, status: '내 A♥와 충돌 · 제외', highlightedCards: cards('Ah') }), candidate('후보 B', 'Kh Qh'), s6Candidates[2]], { holeCards: s6Hole, history: s6Start, holeHighlights: cards('Ah') })),
      explain('p4-6-flop', '플랍에서 어떤 패가 됐나요?', '각 후보의 족보와 드로우를 확인해요.', s6(false, s6Start, [candidate('후보 A', 'Kh Qh', { status: '플러시 드로우' }), candidate('후보 B', 'Js 10s', { status: '탑 페어' }), candidate('후보 C', '8c 8d', { status: '셋' })])),
      question(16, '베팅한 상대에게 가능한 패를 모두 고르세요.', ['A · K♥ Q♥', 'B · J♠ 10♠', 'C · 8♣ 8♦'], [0, 1, 2], '드로우·탑 페어·셋 모두 베팅할 수 있어요.', s6(false, s6FlopHistory), s6(false, s6FlopHistory, [candidate('후보 A', 'Kh Qh', { status: '플러시 드로우' }), candidate('후보 B', 'Js 10s', { status: '탑 페어' }), candidate('후보 C', '8c 8d', { status: '셋' })])),
      explain('p4-6-turn', '턴 한 장이 달라졌어요', '하트 한 장이 더 나왔어요. 후보를 다시 살펴봐요.', s6(true, [...s6FlopHistory, '나 콜'])),
      question(17, '이번 턴에 플러시를 완성한 후보는 무엇인가요?', ['B · J♠ 10♠', 'C · 8♣ 8♦', 'A · K♥ Q♥'], [2], 'K♥ Q♥와 공용 카드의 하트 세 장이 플러시를 만들어요.', s6(true, [...s6FlopHistory, '나 콜']), { ...s6(true, [...s6FlopHistory, '나 콜'], [candidate('후보 A', 'Kh Qh', { status: '플러시 완성', highlightedCards: cards('Kh Qh') }), s6Candidates[1], s6Candidates[2]]), boardHighlights: cards('Jh 8h 4h') }),
      explain('p4-6-bet', '다시 베팅했어요', '상대가 턴에도 베팅했어요.', s6(true, s6TurnHistory, [candidate('후보 A', 'Kh Qh', { status: '플러시' }), candidate('후보 B', 'Js 10s', { status: '탑 페어' }), candidate('후보 C', '8c 8d', { status: '셋' })])),
      question(18, '지금의 후보를 어떻게 판단할까요?', ['플러시 후보만 남기고 나머지는 지워요.', '플러시를 주의하며 다른 후보도 남겨요.'], [1], '플러시를 주의해야 하지만, 탑 페어나 셋으로도 베팅할 수 있어요.', s6(true, s6TurnHistory), s6(true, s6TurnHistory, [candidate('후보 A', 'Kh Qh', { status: '플러시 완성 · 주의' }), candidate('후보 B', 'Js 10s', { status: '탑 페어 · 계속 고려' }), candidate('후보 C', '8c 8d', { status: '셋 · 계속 고려' })])),
      summary('p4-6-summary', '핵심 정리', '새 정보가 나오면 후보를 다시 평가해요.', ['자리·첫 행동', '플랍·행동', '새 카드·행동']),
    ],
  },
  'range-challenge': {
    id: 'range-challenge', title: '상대 패 추론 종합 도전', objective: '배운 내용을 새 상황에 적용해 봐요.', passingPercentage: 80,
    steps: [
      explain('p4-7-intro', '상대 후보를 살펴보세요', '새로운 상황의 총 6문제예요. 자리·카드·행동을 함께 봐요.'),
      question(19, '이 베팅을 어떻게 해석할까요?', ['상대는 반드시 AK예요.', 'A 원 페어·셋·블러프 등이 가능해요.'], [1], '베팅 한 번에 여러 패가 연결될 수 있어요.', scene('Ac 9d 5s', [], { history: ['상대 베팅'] }), scene('Ac 9d 5s', [candidate('원 페어', 'Ad Qh'), candidate('셋', '5c 5d'), candidate('블러프', 'Kc Jh')], { history: ['상대 베팅'] }), ['플랍에 두 사람만 남음 · 상대 성향은 모름']),
      question(20, '일반적으로 더 다양한 패가 포함될 수 있는 쪽은 어디일까요?', ['A · 딜러 버튼', 'B · 초반 자리'], [0], '앞선 사람들이 폴드한 버튼에서는 초반보다 다양한 패로 참가할 수 있어요.', { kind: 'position-scenes', rows: [{ label: 'A · 앞선 세 사람 폴드 후 버튼 레이즈', activeGroup: 'late', foldedBefore: true }, { label: 'B · 초반에서 첫 레이즈', activeGroup: 'early' }] }, undefined, comparisonConditions),
      question(21, '다이아몬드 한 장이 더 나오면 플러시가 되는 후보는 무엇인가요?', ['후보 A', '후보 B', '후보 C'], [2], 'K♦ Q♦는 공용 카드와 합쳐 다이아몬드가 네 장이에요.', scene('10d 6d 2s', [candidate('후보 A', '6c 6h'), candidate('후보 B', 'Ac 10s'), candidate('후보 C', 'Kd Qd')]), scene('10d 6d 2s', [candidate('후보 A', '6c 6h'), candidate('후보 B', 'Ac 10s'), candidate('후보 C', 'Kd Qd', { status: '다이아몬드 4장 · 플러시 드로우' })])),
      question(22, '콜한 상대에게 가능한 후보를 모두 고르세요.', ['후보 A', '후보 B', '두 후보 모두 콜할 수 없어요.'], [0, 1], '플러시 드로우로 다음 카드를 보거나, 탑 페어로 따라갈 수 있어요.', scene('Jc 8d 3c', [candidate('후보 A', 'Ac 7c'), candidate('후보 B', 'Jd Qh')], { history: ['나 베팅', '상대 콜'] }), scene('Jc 8d 3c', [candidate('후보 A', 'Ac 7c', { status: '플러시 드로우' }), candidate('후보 B', 'Jd Qh', { status: '탑 페어' })], { history: ['나 베팅', '상대 콜'] }), ['플랍에 두 사람만 남음']),
      question(23, '이번 큰 베팅은 어떻게 볼까요?', ['블러프라고 확정해요.', '강한 패 후보에 더 무게를 둬요.', '관찰한 습관을 무시해요.'], [1], '앞서 본 습관 때문에 강한 패에 더 무게를 둬요.', bets([{ label: '이번 베팅', pot: 120, bet: 120 }]), undefined, [tendency]),
      question(24, '턴이 나온 뒤 올바른 판단은 무엇인가요?', ['A는 플러시가 됐고, B도 후보로 남아요.', 'A만 가능하므로 B는 반드시 제외해요.', 'A는 아직 플러시 드로우예요.'], [0], 'A는 다이아몬드 다섯 장을 만들었어요. 턴 베팅만으로 B를 지울 수는 없어요.', scene('Qd 9c 2d 5d', [candidate('후보 A', 'Ad 7d'), candidate('후보 B', 'Qh Js')], { markLatestCard: true, history: ['플랍: 나 베팅', '상대 콜', '턴: 나 체크', '상대 베팅'] }), scene('Qd 9c 2d 5d', [candidate('후보 A', 'Ad 7d', { status: '플러시 완성', highlightedCards: cards('Ad 7d') }), candidate('후보 B', 'Qh Js', { status: '계속 고려' })], { markLatestCard: true, boardHighlights: cards('Qd 2d 5d'), history: ['플랍: 나 베팅', '상대 콜', '턴: 나 체크', '상대 베팅'] }), ['두 사람만 남음']),
      summary('p4-7-summary', '핵심 정리', '상대 패를 하나로 정하지 않고, 자리·카드·행동으로 후보를 다시 살펴봐요.'),
    ],
  },
}
