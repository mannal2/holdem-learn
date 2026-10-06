import type { CardRank, CardSuit, PlayingCard } from '../types/cards'
import type { LearningStep, LessonDefinition, PartDefinition, RangeSceneVisual, RuleVisual } from '../types/course'
import { part4Questions } from './part4Questions'

const suits: Record<string, CardSuit> = { s: 'spades', h: 'hearts', d: 'diamonds', c: 'clubs' }
const cards = (codes: string): PlayingCard[] => codes ? codes.split(' ').map(code => ({ rank: code.slice(0, -1) as CardRank, suit: suits[code.slice(-1)] })) : []
const hand = (codes: string) => cards(codes) as [PlayingCard, PlayingCard]
const explain = (id: string, title: string, body: string, visual?: RuleVisual): LearningStep => ({ id: `p4-seq-${id}`, type: 'explanation', title, body, visual })
const summary = (id: string, body: string, bullets: string[], visual?: RuleVisual): LearningStep => ({ id: `p4-seq-${id}`, type: 'summary', title: '핵심 정리', body, bullets, visual })

const setup = '6인 · 각 200칩(큰 블라인드 100개) · SB 1칩 / BB 2칩'
const opening = '입문용 가정: 이 상대는 자리에 따라 참가 범위를 바꾸며 버튼에서 초반보다 넓게 참가해요.'
const repeat = '이번 판단의 가정: 페어도 뚜렷한 드로우도 없는 패로 두 번 연속 베팅하는 경우는 드물어요.'
const riverRead = '이번 판단의 가정: 플러시 가능 보드에서 원 페어로 크게 베팅하거나, 미완성 패로 세 번 연속 블러프하는 경우는 드물어요.'
const lateRaise = '이번 판단의 가정: 원 페어로 턴 베팅을 크게 다시 올리는 경우는 드물어요. 블러프는 가능해요.'
const noTripleBluff = '이번 판단의 가정: 미완성 패로 세 번 연속 블러프하는 경우는 드물어요.'
const unknown = '상대의 포스트플랍 성향은 모름'
const start = ['프리플랍: UTG·HJ·CO 폴드', '상대 버튼이 총 6칩으로 첫 레이즈', 'SB 폴드 → BB가 총 6칩까지 콜 · 팟 13칩']
const flopBet = [...start, '플랍: BB 체크 → 상대 버튼 8칩 베팅']
const flopCall = [...flopBet, 'BB 8칩 콜 · 팟 29칩']
const turnBet = [...flopCall, '턴: BB 체크 → 상대 버튼 20칩 베팅']
const turnCall = [...turnBet, 'BB 20칩 콜 · 팟 69칩']
const riverBet = [...turnCall, '리버: BB 체크 → 상대 버튼 52칩 베팅']
const h = ['8c 8d', 'Ah Kd', 'As Js', 'Ac Jd']
const hFlop = 'Ks 8s 3d'
const hTurn = `${hFlop} 2h`
const hRiver = `${hTurn} Qs`
const hStates = ['셋 · 8 세 장', '탑 페어 · K 두 장', '페어 없음 · 스페이드 4장, 플러시 드로우', '페어 없음 · 뚜렷한 드로우 없음']
const hTurnJudgment = ['셋\n판단 유지 · 강한 패로 계속 받으려는 행동', '탑 페어\n판단 유지 · 원 페어로 계속 베팅할 수 있음', '플러시 드로우\n판단 유지 · 폴드 유도와 다음 카드 기대', '페어 없음\n가능성 ↓ · 이 조건에서는 두 번째 공격이 드묾']
const hRiverJudgment = ['셋\n판단 유지 · 강한 완성 패로 계속 고려', '탑 페어\n가능성 ↓ · 플러시 가능 보드의 큰 베팅과 덜 맞음', '플러시\n가능성 ↑ · 완성 뒤 큰 베팅이라는 흐름과 맞음', '페어 없음\n가능성 ↓ · 미완성 패의 세 번째 공격은 드묾']

// 한 핸드에서는 카드·후보 순서를 고정하고, 현재까지 공개된 정보만 전달합니다.
function scene(board: string, candidates: string[], history: string[], states: string[] = [], bet?: RangeSceneVisual['bet']): RangeSceneVisual {
  const community = cards(board)
  return { kind: 'range-scene', stage: community.length === 5 ? 'river' : community.length === 4 ? 'turn' : community.length === 3 ? 'flop' : 'preflop', board: community,
    candidates: candidates.map((code, index) => ({ label: `후보 ${'ABCD'[index]}`, cards: hand(code), ...(states[index] ? { status: states[index] } : {}) })), history, bet, markLatestCard: community.length >= 4 }
}
const H = (board: string, history: string[], states: string[] = [], bet?: RangeSceneVisual['bet']) => scene(board, h, history, states, bet)
const facts = (items: { label: string; value: string; detail?: string }[]): RuleVisual => ({ kind: 'draw-facts', items })
const lines = (label: string, actions: string[]): RuleVisual => ({ kind: 'action-lines', rows: [{ label, actions }] })
const positions: RuleVisual = { kind: 'position-scenes', rows: [{ label: '같은 상대 · UTG 첫 레이즈', activeGroup: 'early' }, { label: '같은 상대 · 앞선 세 사람 폴드 후 버튼 첫 레이즈', activeGroup: 'late', foldedBefore: true }] }

function question(n: number, visual: RuleVisual, feedbackVisual?: RuleVisual, conditions: string[] = []): LearningStep {
  const data = part4Questions[n - 1]
  const id = `p4-seq-q${String(n).padStart(2, '0')}`
  const options = data.options.map((label, index) => ({ id: `${id}-option-${index}`, label }))
  const common = { id, prompt: data.prompt, options, explanation: data.explanation, visual, feedbackVisual, conditions: [setup, ...conditions] }
  return data.correct.length === 1
    ? { ...common, type: 'single-choice', correctOptionId: options[data.correct[0]].id }
    : { ...common, type: 'multi-choice', correctOptionIds: data.correct.map(index => options[index].id) }
}

// 완성된 플러시만 다섯 장을 강조합니다. 후보들은 서로 독립된 가정입니다.
function flushFeedback(visual: RangeSceneVisual, index: number, boardCodes: string): RangeSceneVisual {
  return { ...visual, boardHighlights: cards(boardCodes), candidates: visual.candidates.map((candidate, i) => i === index ? { ...candidate, highlightedCards: candidate.cards } : candidate) }
}

const variationA = `${hTurn} 6d`
const variationBHistory = [...flopCall, '턴: BB 체크 → 상대 버튼 체크 · 팟 29칩', '리버: BB 체크 → 상대 버튼 체크 · 팟 29칩']
const variationCFlop = [...start, '플랍: BB 체크 → 상대 버튼 체크 · 팟 13칩']
const variationCTurn = [...variationCFlop, '턴: BB 8칩 베팅 → 상대 버튼 총 24칩으로 레이즈']
const variationCRiver = [...variationCTurn, 'BB 16칩 추가 콜 · 팟 61칩', '리버: BB 체크 → 상대 버튼 40칩 베팅']
const cTurn = `${hFlop} 4s`
const cRiver = `${cTurn} 6d`
const cJudgment = ['셋\n판단 유지 · 플랍 체크로 강한 패를 제외하지 않음', '탑 페어\n가능성 ↓ · 이 조건에서는 원 페어 레이즈가 드묾', '플러시\n가능성 ↑ · 턴 완성과 레이즈가 연결됨', '페어 없음\n판단 유지 · 블러프도 가능, 빈도는 모름']

const e = ['Qc Jd', '9c 9d', 'Ah 10h', 'As Kd']
const eFlop = 'Qh 9h 4c'
const eTurn = `${eFlop} 2s`
const eRiver = `${eTurn} 6h`
const eStates = ['탑 페어', '셋', '플러시 드로우', '페어 없음']
const f = ['As Jd', '7c 7d', 'Kh Qh', 'Ac Qc']
const fFlop = 'Jh 7h 2c'
const fTurn = `${fFlop} 4s`
const fRiver = `${fTurn} 9d`
const fTurnHistory = [...flopCall, '턴: BB 체크 → 상대 버튼 체크 · 팟 29칩']
const fRiverHistory = [...fTurnHistory, '리버: BB 체크 → 상대 버튼 체크 · 팟 29칩']
const g = ['Qh 10h', 'Ad Jh', '8c 8h', 'Kd Qc']
const gFlop = 'Jc 8d 2s'
const gTurn = `${gFlop} 9h`
const gRiver = `${gTurn} 3c`
const gStart = ['프리플랍: UTG·HJ·CO 폴드', '버튼이 총 6칩으로 첫 레이즈', 'SB 폴드 → 상대 BB가 총 6칩까지 콜 · 팟 13칩']
const gFlopHistory = [...gStart, '플랍: 상대 BB 체크 → 버튼 8칩 베팅 → 상대 BB 콜 · 팟 29칩']
const gTurnHistory = [...gFlopHistory, '턴: 상대 BB 체크 → 버튼 12칩 베팅 → 상대 BB 총 36칩으로 레이즈']
const gRiverHistory = [...gTurnHistory, '버튼 24칩 추가 콜 · 팟 101칩', '리버: 상대 BB 60칩 베팅']

export const part4: PartDefinition = {
  id: 'part-4', order: 4, title: '상대가 가질 수 있는 패 추론',
  description: '프리플랍부터 리버까지, 새 카드와 행동으로 상대 후보의 가능성을 갱신해요.',
  lessonIds: ['range-preflop', 'range-flop', 'range-flop-actions', 'range-turn', 'range-river', 'range-variations', 'range-hand-challenge'],
}

export const part4Lessons: Record<string, LessonDefinition> = {
  'range-preflop': {
    id: 'range-preflop', title: '프리플랍의 출발 후보', objective: '상대 자리와 첫 행동으로 가능한 패 종류를 생각해요.',
    steps: [
      explain('1-start', '이 자리에서 어떤 패로 참가했을까요?', '상대에게 가능하다고 생각하는 패들의 범위를 레인지라고 해요. 한 판을 리버까지 따라가며 후보를 갱신해 볼게요.', { kind: 'position-scenes', rows: [{ label: '이번 판에서 상대는 딜러 버튼 자리예요', activeGroup: 'late', foldedBefore: true }], history: [setup, ...start] }),
      explain('1-position', '같은 상대라도 자리에 따라 달라요', '초반 자리에서는 뒤에 사람이 많이 남아 있어 좋은 패를 골라 참가해요. 반면 버튼에서 앞사람들이 모두 폴드했다면, 조금 덜 좋은 패로도 참가할 수 있어요. 그래서 버튼에서 레이즈한 상대에게는 더 다양한 패가 있을 수 있어요.', positions),
      question(1, positions, undefined, [opening, '앞에 참가한 사람 없이 첫 레이즈 · 같은 상대·보유 칩']),
      explain('1-reraise', '먼저 올렸나요, 다시 올렸나요?', '첫 레이즈는 앞선 레이즈가 없어요. 재레이즈는 앞사람이 올린 금액을 다시 높이는 행동이에요.', { kind: 'action-lines', rows: [{ label: '이번 판 · 첫 레이즈', actions: start }, { label: '별도 비교 · 재레이즈', actions: ['UTG 총 6칩 레이즈 → HJ·CO 폴드', '버튼 총 20칩으로 재레이즈'] }] }),
      question(2, lines('별도 비교 · 재레이즈', ['UTG 총 6칩 레이즈 → HJ·CO 폴드', '버튼 총 20칩으로 재레이즈']), undefined, [opening]),
      question(3, scene('', [], start), undefined, [opening]),
      explain('1-candidates', '네 후보를 함께 따라가 볼게요', '페어·높은 카드·같은 무늬 카드 중 네 예시예요. 전체 레인지나 같은 확률을 뜻하지 않아요.', H('', start, ['페어', '높은 카드', '같은 무늬 높은 카드', '서로 다른 무늬 높은 카드'])),
      summary('1-summary', '자리 → 앞선 행동 → 상대 행동 → 출발 후보 순서로 생각해요.', ['다음 레슨에서는 같은 A~D가 플랍을 만나요.', '좋은 시작패가 플랍에서도 가장 강한 것은 아니에요.']),
    ],
  },
  'range-flop': {
    id: 'range-flop', title: '플랍과 후보의 상태', objective: '앞서 잡은 같은 후보들의 현재 패와 드로우를 확인해요.',
    steps: [
      explain('2-start', '같은 네 후보가 플랍을 만났어요', '상대 버튼이 첫 레이즈하고 BB가 콜했어요. 후보의 카드는 그대로 두고 공용 카드를 붙여 봐요.', H(hFlop, start)),
      explain('2-made', '현재 패를 다시 읽어요', 'A는 개인 카드 8 두 장과 공용 카드 8이 만나 셋이에요. B는 개인 카드 K와 공용 카드 K가 만나 탑 페어예요.', H(hFlop, start, hStates)),
      question(4, H(hFlop, start), H(hFlop, start, hStates)),
      explain('2-draw', '페어가 없어도 가능성은 달라요', 'C는 스페이드가 네 장이라 한 장 더 나오면 플러시예요. D에는 그런 플러시 드로우가 없어요.', H(hFlop, start, hStates)),
      question(5, H(hFlop, start), H(hFlop, start, hStates)),
      explain('2-both', '페어와 드로우가 함께 있을 수도 있어요', '별도 비교예요. J 원 페어가 있고 하트도 네 장이라 플러시 드로우예요.', scene('Jh 7h 2h', ['Ah Jc'], ['별도 비교 · 앞서 본 판과 다른 카드'], ['탑 페어 + 플러시 드로우'])),
      question(6, H(hFlop, start), H(hFlop, start, hStates)),
      summary('2-summary', '현재 강도와 앞으로 좋아질 가능성을 함께 봐요.', ['A 셋 · B 탑 페어 · C 플러시 드로우 · D 페어 없음', '다음에는 이 후보들이 왜 베팅할 수 있는지 생각해요.']),
    ],
  },
  'range-flop-actions': {
    id: 'range-flop-actions', title: '플랍 행동과 후보의 가능성', objective: '같은 후보에 베팅 이유와 팟 대비 크기를 연결해요.',
    steps: [
      explain('3-bet', '상대가 처음으로 베팅했어요', 'BB가 체크하자 상대 버튼이 8칩을 베팅했어요. 앞서 생각한 네 후보에 이 행동을 연결해 봐요.', H(hFlop, flopBet, hStates, { pot: 13, bet: 8 })),
      explain('3-size', '가운데 모인 칩과 비교해요', '팟은 베팅 전 가운데 모인 칩이에요. 13칩 팟의 8칩은 절반보다 크지만, 80칩 팟의 8칩은 10분의 1이에요.', { kind: 'bet-comparison', rows: [{ label: '이번 판', pot: 13, bet: 8 }, { label: '별도 금액 비교', pot: 80, bet: 8 }], showRatio: true }),
      question(7, { kind: 'bet-comparison', rows: [{ label: '이번 판', pot: 13, bet: 8 }, { label: '별도 금액 비교', pot: 80, bet: 8 }] }, { kind: 'bet-comparison', rows: [{ label: '이번 판', pot: 13, bet: 8 }, { label: '별도 금액 비교', pot: 80, bet: 8 }], showRatio: true }),
      explain('3-reasons', '각 후보는 왜 베팅할까요?', 'A·B는 더 약한 패의 콜을, C는 폴드와 다음 카드의 개선을 기대할 수 있어요. D처럼 완성 패 없이 폴드를 유도하는 베팅은 블러프예요.', H(hFlop, flopBet, hStates, { pot: 13, bet: 8 })),
      question(8, H(hFlop, flopBet, [], { pot: 13, bet: 8 }), H(hFlop, flopBet, hStates, { pot: 13, bet: 8 })),
      explain('3-uncertainty', '가장 강한 패가 가장 유력한 패일까요?', '처음에 어떤 후보가 얼마나 포함됐는지와 상대의 행동 방식도 중요해요. 정보가 부족하면 정확한 순위나 같은 확률을 만들지 않아요.', facts([{ label: '판단 방법', value: '기존 후보 → 새 정보 → 판단 변화 → 이유' }, { label: '지금의 한계', value: '정확한 우선순위는 아직 비교하기 어려워요.' }])),
      question(9, H(hFlop, flopBet, [], { pot: 13, bet: 8 }), H(hFlop, flopBet, hStates, { pot: 13, bet: 8 }), [unknown]),
      summary('3-summary', '첫 베팅에는 여러 이유가 있어요. 다음 정보로 판단을 이어가요.', ['A~D를 남기되 정확한 순위는 아직 보류해요.', 'BB가 8칩 콜했어요. 팟 29칩으로 턴을 봐요.'], H(hFlop, flopCall)),
    ],
  },
  'range-turn': {
    id: 'range-turn', title: '턴에서의 후보 갱신', objective: '새 카드와 두 번째 행동을 보고 이전 판단을 갱신해요.',
    steps: [
      explain('4-card', '턴 · 2♥가 나왔어요', '플랍에서 상대가 베팅하고 BB가 콜했어요. 이번 카드가 기존 네 후보를 어떻게 바꿨는지 먼저 봐요.', H(hTurn, flopCall)),
      question(10, H(hTurn, flopCall), H(hTurn, flopCall, hStates)),
      explain('4-bet', '상대가 두 번째로 베팅했어요', `${repeat} 이 가정과 새 행동을 함께 보고 후보를 다시 비교해요.`, H(hTurn, turnBet, [], { pot: 29, bet: 20 })),
      question(11, H(hTurn, turnBet, [], { pot: 29, bet: 20 }), H(hTurn, turnBet, hTurnJudgment, { pot: 29, bet: 20 }), [repeat]),
      explain('4-change', '무엇이 달라졌나요?', 'D는 이전보다 덜 그럴듯해졌어요. A·B·C의 판단 유지는 중간 확률이나 같은 확률이라는 뜻이 아니에요.', H(hTurn, turnBet, hTurnJudgment, { pot: 29, bet: 20 })),
      question(12, H(hTurn, turnBet, [], { pot: 29, bet: 20 }), undefined, ['비교: 같은 카드·행동이지만 반복 공격 습관을 모르는 상대라면?']),
      explain('4-compare', '카드만 보고 바꾼 판단이 아니에요', '두 번째 베팅과 상대 조건 때문에 D의 가능성을 낮췄어요. BB가 20칩 콜해 팟은 69칩이 됐어요.', H(hTurn, turnCall, hTurnJudgment)),
      summary('4-summary', '새 카드 → 후보 상태 → 새 행동 → 판단 변화 순서로 봐요.', ['가능성 ↑: 이전보다 더 그럴듯해짐', '가능성 ↓: 이전보다 덜 그럴듯해짐', '판단 유지: 이번 정보로 바꿀 근거 없음']),
    ],
  },
  'range-river': {
    id: 'range-river', title: '리버의 최종 판단', objective: '마지막 카드와 행동을 앞선 추론에 연결해요.',
    steps: [
      explain('5-card', '리버 · Q♠가 나왔어요', '턴까지 남겨둔 후보를 그대로 봐요. 새 카드로 완성된 패와 여전히 남은 패를 확인해요.', H(hRiver, turnCall)),
      question(13, H(hRiver, turnCall), flushFeedback(H(hRiver, turnCall, ['셋', '탑 페어', '플러시 완성', '페어 없음']), 2, 'Ks 8s Qs')),
      explain('5-bet', '마지막에도 크게 베팅했어요', `${riverRead} 상대는 69칩 팟에 52칩, 약 4분의 3을 베팅했어요.`, H(hRiver, riverBet, [], { pot: 69, bet: 52 })),
      question(14, H(hRiver, riverBet, [], { pot: 69, bet: 52 }), H(hRiver, riverBet, hRiverJudgment, { pot: 69, bet: 52 }), [riverRead]),
      explain('5-judgment', '더 유력한 후보와 낮은 후보를 나눠요', '이 조건에서는 A·C를 더 유력하게, B·D를 낮게 봐요. A와 C 중 어느 쪽이 더 유력한지는 지금 정보로 정하기 어려워요.', H(hRiver, riverBet, hRiverJudgment, { pot: 69, bet: 52 })),
      question(15, H(hRiver, riverBet, [], { pot: 69, bet: 52 }), H(hRiver, riverBet, hRiverJudgment, { pot: 69, bet: 52 }), [repeat, riverRead]),
      explain('5-recap', '처음 후보가 어떻게 달라졌나요?', '한 장의 패를 맞히기보다, 후보별 설명을 이어서 만들었어요.', facts([{ label: '프리플랍', value: '페어·높은 카드·같은 무늬 카드' }, { label: '플랍', value: '셋·탑 페어·드로우·페어 없음' }, { label: '턴', value: '반복 공격 조건 → D 가능성 ↓' }, { label: '리버', value: '완성과 큰 베팅 조건 → A·C 우선 검토' }])),
      summary('5-summary', '마지막 행동을 앞선 카드와 행동에 이어 붙여요.', ['더 유력한 후보와 다른 가능한 후보를 함께 남겨요.', '실제 상대 패를 보지 않아도 판단의 근거를 설명할 수 있어요.']),
    ],
  },
  'range-variations': {
    id: 'range-variations', title: '다른 흐름에 적용하기', objective: '세 가지 다른 전개에서 같은 사고 과정을 적용해요.',
    steps: [
      explain('6-start', '이제는 별도의 비교 전개예요', '같은 시작 후보와 플랍에서 다른 카드·행동이 이어졌다고 비교해요. 앞서 본 판의 실제 흐름이 바뀌는 것은 아니에요.', H(hFlop, start)),
      explain('6-a', '변형 A · 계속 공격했지만 드로우는 실패했어요', `${noTripleBluff} 이번에는 리버 6♦라서 C의 플러시가 완성되지 않았어요.`, H(variationA, riverBet, ['셋', '탑 페어', '페어 없음 · 플러시 드로우 실패', '페어 없음'], { pot: 69, bet: 52 })),
      question(16, H(variationA, riverBet, [], { pot: 69, bet: 52 }), H(variationA, riverBet, ['셋\n판단 유지 · 완성 패의 공격', '탑 페어\n판단 유지 · 완성 패의 공격', '드로우 실패\n가능성 ↓ · 세 번째 블러프가 드문 조건', '페어 없음\n가능성 ↓ · 세 번째 블러프가 드문 조건'], { pot: 69, bet: 52 }), ['변형 A · 앞서 본 판과 다른 리버', noTripleBluff]),
      explain('6-b', '체크했다는 이유만으로 강한 패를 지우지 않아요', '변형 B에서는 턴과 리버에 체크했어요. 원 페어로 팟을 키우지 않거나 드로우로 공격을 멈췄을 수 있어요. 셋도 완전히 제외하지 않아요.', H(variationA, variationBHistory, ['셋도 체크할 수 있음', '원 페어로 팟 조절 가능', '드로우 공격 중단·완성 실패 가능', '블러프를 멈췄을 수도 있음'])),
      question(17, H(variationA, variationBHistory), undefined, ['변형 B · 턴부터 체크, 팟 29칩', unknown]),
      explain('6-c', '변형 C · 뒤늦게 다시 올렸어요', `${lateRaise} 플랍 체크 뒤 턴 4♠에서 상대가 BB의 8칩을 총 24칩으로 올렸어요.`, H(cTurn, variationCTurn)),
      question(18, H(cTurn, variationCTurn), H(cTurn, variationCTurn, cJudgment), ['변형 C · 턴 베팅 전 팟 13칩 · BB 8칩 베팅 · 상대 총 24칩 레이즈', lateRaise]),
      explain('6-c-river', '같은 변형 C를 리버까지 봐요', 'BB가 추가로 16칩 콜해 팟 61칩이 됐어요. 리버 6♦에서 BB 체크 뒤 상대가 40칩 베팅했어요.', H(cRiver, variationCRiver, [], { pot: 61, bet: 40 })),
      question(19, H(cRiver, variationCRiver, [], { pot: 61, bet: 40 }), H(cRiver, variationCRiver, ['셋 · 계속 검토', '탑 페어 · 턴에서 낮게 봤던 후보', '플러시 · 계속 검토', '페어 없음 · 블러프 가능'], { pot: 61, bet: 40 }), ['변형 C · 리버 블러프 빈도는 모름', lateRaise]),
      summary('6-summary', '행동의 모양을 공식으로 외우지 않아요.', ['계속 공격해도 시작패를 확정하지 않아요.', '공격 약화에는 원 페어·드로우 등 다른 이유가 있어요.', '늦은 레이즈는 새 완성과 기존 강한 패·블러프를 함께 봐요.']),
    ],
  },
  'range-hand-challenge': {
    id: 'range-hand-challenge', title: '상대 패 추론 종합 도전', objective: '세 핸드를 프리플랍부터 리버까지 연결해 판단해요.', passingPercentage: 80,
    steps: [
      explain('7-start', '새 핸드 세 개를 끝까지 읽어보세요', '각 핸드의 프리플랍·플랍·턴·리버를 네 문제로 따라가요. 총 12문제 중 10문제 이상이면 통과예요.'),
      question(20, scene('', [], start), undefined, ['사례 E · 프리플랍', opening]),
      question(21, scene(eFlop, e, flopBet, [], { pot: 13, bet: 8 }), scene(eFlop, e, flopBet, eStates, { pot: 13, bet: 8 }), ['사례 E · 플랍', unknown]),
      question(22, scene(eTurn, e, turnBet, [], { pot: 29, bet: 20 }), scene(eTurn, e, turnBet, ['탑 페어\n판단 유지', '셋\n판단 유지', '플러시 드로우\n판단 유지', '페어 없음\n가능성 ↓ · 반복 공격 조건'], { pot: 29, bet: 20 }), ['사례 E · 턴', repeat]),
      question(23, scene(eRiver, e, riverBet, [], { pot: 69, bet: 52 }), flushFeedback(scene(eRiver, e, riverBet, ['탑 페어\n가능성 ↓ · 위험 보드의 큰 베팅', '셋\n판단 유지', '플러시\n가능성 ↑ · 완성 뒤 큰 베팅', '페어 없음\n가능성 ↓ · 반복 블러프가 드묾'], { pot: 69, bet: 52 }), 2, 'Qh 9h 6h'), ['사례 E · 리버', riverRead]),
      question(24, scene('', [], start), undefined, ['사례 F · 프리플랍', opening]),
      question(25, scene(fFlop, f, flopBet, [], { pot: 13, bet: 8 }), scene(fFlop, f, flopBet, ['탑 페어', '셋', '플러시 드로우', '페어 없음 · 백도어 클럽 가능성'], { pot: 13, bet: 8 }), ['사례 F · 플랍', unknown]),
      question(26, scene(fTurn, f, fTurnHistory), scene(fTurn, f, fTurnHistory, ['탑 페어 · 팟 조절 가능', '셋도 체크 가능', '드로우 · 공격 중단 가능', '페어 없음 · 백도어 클럽 실패']), ['사례 F · 턴 · 팟 29칩', unknown]),
      question(27, scene(fRiver, f, fRiverHistory), scene(fRiver, f, fRiverHistory, ['탑 페어 · 체크로 끝낼 수 있음', '셋 · 완전히 제외하지 않음', '페어 없음 · 드로우 실패', '페어 없음']), ['사례 F · 리버 · 팟 29칩', unknown]),
      question(28, scene('', [], gStart), undefined, ['사례 G · 이번에 관찰하는 상대는 BB', '콜에도 페어·높은 카드·같은 무늬 연결 카드 등이 가능해요.']),
      question(29, scene(gFlop, g, gFlopHistory), scene(gFlop, g, gFlopHistory, ['거샷 드로우 · 9가 필요', '탑 페어', '셋', '페어 없음']), ['사례 G · 상대 BB의 플랍 콜 · 콜 후 팟 29칩']),
      question(30, scene(gTurn, g, gTurnHistory), scene(gTurn, g, gTurnHistory, ['스트레이트\n가능성 ↑ · 완성 뒤 체크-레이즈', '탑 페어\n가능성 ↓ · 원 페어 레이즈가 드문 조건', '셋\n판단 유지 · 앞선 콜로 제외하지 않음', '거샷 드로우 · 10이 필요\n판단 유지 · 블러프 가능']), ['사례 G · 턴 시작 팟 29칩 · 버튼 12칩 베팅 · 상대 BB 총 36칩 레이즈', lateRaise]),
      question(31, scene(gRiver, g, gRiverHistory, [], { pot: 101, bet: 60 }), scene(gRiver, g, gRiverHistory, ['스트레이트 · 계속 검토', '탑 페어 · 턴에서 낮게 봤던 후보', '셋 · 계속 검토', '페어 없음 · 드로우 실패, 블러프 가능'], { pot: 101, bet: 60 }), ['사례 G · 리버 블러프 빈도는 모름', lateRaise]),
      summary('7-summary', '새 정보가 나올 때마다 기존 후보에 연결해 판단했어요.', ['출발 후보 → 플랍 상태 → 행동 이유 → 턴 갱신 → 리버 정리', '더 유력한 후보와 남아 있는 다른 가능성을 이유와 함께 설명해요.']),
    ],
  },
}
