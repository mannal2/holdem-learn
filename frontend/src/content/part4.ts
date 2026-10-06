import type { CardRank, CardSuit, PlayingCard } from '../types/cards'
import type { LearningStep, LessonDefinition, PartDefinition, RangeSceneVisual, RuleVisual } from '../types/course'
import { part4Questions } from './part4Questions'

const suits: Record<string, CardSuit> = { s: 'spades', h: 'hearts', d: 'diamonds', c: 'clubs' }
const cards = (codes: string): PlayingCard[] => codes ? codes.split(' ').map(code => ({ rank: code.slice(0, -1) as CardRank, suit: suits[code.slice(-1)] })) : []
const hand = (codes: string) => cards(codes) as [PlayingCard, PlayingCard]
const explain = (id: string, title: string, body: string, visual?: RuleVisual): LearningStep => ({ id: `p4-seq-${id}`, type: 'explanation', title, body, visual })
const summary = (id: string, body: string, bullets: string[], visual?: RuleVisual): LearningStep => ({ id: `p4-seq-${id}`, type: 'summary', title: '핵심 정리', body, bullets, visual })

const setup = '6명 · 각 200칩 · 스몰 블라인드(SB) 1칩 / 빅 블라인드(BB) 2칩'
const opening = '가정: 이 상대는 초반에는 좋은 패로 참가하지만, 앞사람들이 모두 폴드한 버튼에서는 조금 덜 좋은 패로도 참가해요.'
const repeat = '가정: 이 상대는 페어도 뚜렷한 드로우도 없으면 플랍·턴에 연속 베팅을 잘 하지 않아요.'
const riverRead = '가정: 이 상대는 플러시가 가능한 공용 카드에서 원 페어로 크게 베팅하는 일이 드물어요. 페어도 없고 드로우도 완성되지 않은 패로 세 번 연속 블러프하는 일도 드물어요.'
const lateRaise = '가정: 이 상대는 원 페어로 턴에 크게 레이즈하는 일이 드물어요. 블러프 레이즈는 가능해요.'
const noTripleBluff = '가정: 이 상대는 페어도 없고 드로우도 완성되지 않은 패로 세 번 연속 블러프하는 일이 드물어요.'
const unknown = '플랍 이후 어떤 패로 베팅하거나 체크하는지는 아직 모름'
const start = ['프리플랍: UTG·HJ·CO 폴드', '상대 버튼이 총 6칩으로 첫 레이즈', 'SB 폴드 → BB가 4칩 추가 콜 · 팟 13칩']
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
const hTurnJudgment = ['셋\n판단 유지 · 셋으로 칩을 더 얻으려는 베팅 가능', '탑 페어\n판단 유지 · 원 페어로 계속 베팅 가능', '플러시 드로우\n판단 유지 · 폴드를 노리며 플러시 완성도 기대', '페어 없음\n가능성 ↓ · 이 패로 두 번 베팅하는 일은 드묾']
const hRiverJudgment = ['셋\n판단 유지 · 셋으로 큰 베팅 가능', '탑 페어\n가능성 ↓ · 원 페어로 크게 베팅하는 일은 드묾', '플러시\n가능성 ↑ · 플러시 완성 뒤 큰 베팅', '페어 없음\n가능성 ↓ · 페어 없이 세 번 블러프는 드묾']

// 한 핸드에서는 카드·후보 순서를 고정하고, 현재까지 공개된 정보만 전달합니다.
function scene(board: string, candidates: string[], history: string[], states: string[] = [], bet?: RangeSceneVisual['bet']): RangeSceneVisual {
  const community = cards(board)
  return { kind: 'range-scene', stage: community.length === 5 ? 'river' : community.length === 4 ? 'turn' : community.length === 3 ? 'flop' : 'preflop', board: community,
    candidates: candidates.map((code, index) => ({ label: `후보 ${'ABCD'[index]}`, cards: hand(code), ...(states[index] ? { status: states[index] } : {}) })), history, bet, markLatestCard: community.length >= 4 }
}
const H = (board: string, history: string[], states: string[] = [], bet?: RangeSceneVisual['bet']) => scene(board, h, history, states, bet)
const facts = (items: { label: string; value: string; detail?: string }[]): RuleVisual => ({ kind: 'draw-facts', items })
const lines = (label: string, actions: string[]): RuleVisual => ({ kind: 'action-lines', rows: [{ label, actions }] })

function question(n: number, visual: RuleVisual | undefined, feedbackVisual?: RuleVisual, conditions: string[] = []): LearningStep {
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
const cJudgment = ['셋\n판단 유지 · 셋도 플랍에 체크 가능', '탑 페어\n가능성 ↓ · 원 페어로 큰 레이즈는 드묾', '플러시\n가능성 ↑ · 플러시 완성 뒤 레이즈', '페어 없음\n판단 유지 · 블러프 가능, 얼마나 하는지는 모름']

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
const gStart = ['프리플랍: UTG·HJ·CO 폴드', '버튼이 총 6칩으로 첫 레이즈', 'SB 폴드 → 상대 BB가 4칩 추가 콜 · 팟 13칩']
const gFlopHistory = [...gStart, '플랍: 상대 BB 체크 → 버튼 8칩 베팅 → 상대 BB 콜 · 팟 29칩']
const gTurnHistory = [...gFlopHistory, '턴: 상대 BB 체크 → 버튼 12칩 베팅 → 상대 BB 총 36칩으로 레이즈']
const gRiverHistory = [...gTurnHistory, '버튼 24칩 추가 콜 · 팟 101칩', '리버: 상대 BB 60칩 베팅']

export const part4: PartDefinition = {
  id: 'part-4', order: 4, title: '상대가 가질 수 있는 패 추론',
  description: '프리플랍부터 리버까지, 카드와 행동을 보고 상대가 가질 만한 패를 생각해요.',
  lessonIds: ['range-preflop', 'range-flop', 'range-flop-actions', 'range-turn', 'range-river', 'range-variations', 'range-hand-challenge'],
}

export const part4Lessons: Record<string, LessonDefinition> = {
  'range-preflop': {
    id: 'range-preflop', title: '프리플랍의 출발 후보', objective: '상대의 자리와 첫 행동을 보고 가능한 패를 생각해요.',
    steps: [
      explain('1-start', '이 자리에서 어떤 패로 참가했을까요?', '상대가 가질 수 있는 여러 패의 범위를 레인지라고 해요. 새 카드와 행동을 보며 후보를 다시 판단해 볼게요.', { kind: 'position-scenes', rows: [{ label: '이번 판에서 상대는 딜러 버튼 자리예요', activeGroup: 'late', foldedBefore: true }], history: [setup, ...start] }),
      explain('1-position', '같은 상대라도 자리에 따라 달라요', '같은 레이즈라도, 상대 자리에 따라 가능한 패의 범위를 다르게 생각해야 해요.', facts([
        { label: '초반 자리', value: '좋은 패 위주로 참가', detail: '뒤에 행동할 사람이 많이 남아 있어요.' },
        { label: '버튼 자리', value: '조금 덜 좋은 패로도 참가', detail: '앞사람들이 모두 폴드했다면 더 다양한 패로 참가할 수 있어요.' },
      ])),
      question(1, undefined, undefined, [opening, '같은 상대가 같은 보유 칩으로 초반 자리와 버튼에서 각각 첫 레이즈한 상황입니다.', '두 상황 모두 앞사람들은 전부 폴드했습니다.']),
      explain('1-reraise', '먼저 올렸나요, 다시 올렸나요?', '아무도 레이즈하지 않았을 때 처음 올리면 첫 레이즈예요. 앞사람의 레이즈를 다시 올리면 재레이즈예요.', { kind: 'action-lines', rows: [{ label: '이번 판 · 첫 레이즈', actions: start }, { label: '별도 비교 · 재레이즈', actions: ['UTG 총 6칩 레이즈 → HJ·CO 폴드', '버튼 총 20칩으로 재레이즈'] }] }),
      question(2, lines('별도 비교 · 재레이즈', ['UTG 총 6칩 레이즈 → HJ·CO 폴드', '버튼 총 20칩으로 재레이즈']), undefined, [opening]),
      question(3, scene('', [], start), undefined, [opening]),
      explain('1-candidates', '네 후보를 함께 따라가 볼게요', '가능한 패 중 네 가지 예시예요. 다른 패도 가능하며, 네 후보의 가능성이 같다는 뜻은 아니에요.', H('', start, ['페어', '높은 카드', '같은 무늬 높은 카드', '서로 다른 무늬 높은 카드'])),
      summary('1-summary', '자리 → 앞선 행동 → 상대 행동 → 출발 후보 순서로 생각해요.', ['다음에는 같은 A~D를 공용 카드와 함께 살펴봐요.', '좋은 시작패가 플랍에서도 가장 강한 것은 아니에요.']),
    ],
  },
  'range-flop': {
    id: 'range-flop', title: '플랍과 후보의 상태', objective: '같은 후보들이 플랍에서 어떤 족보와 드로우를 갖는지 확인해요.',
    steps: [
      explain('2-start', '같은 네 후보가 플랍을 만났어요', '상대 버튼이 첫 레이즈하고 BB가 콜했어요. 네 후보를 공용 카드와 함께 보고, 현재 족보를 확인해요.', H(hFlop, start)),
      explain('2-made', '현재 패를 다시 읽어요', 'A는 개인 카드 8 두 장과 공용 카드 8이 만나 셋이에요. B는 개인 카드 K와 공용 카드 K가 만나 탑 페어예요.', H(hFlop, start, hStates)),
      question(4, H(hFlop, start), H(hFlop, start, hStates)),
      explain('2-draw', '페어가 없어도 가능성은 달라요', 'C는 스페이드가 네 장이라 한 장 더 나오면 플러시예요. D에는 그런 플러시 드로우가 없어요.', H(hFlop, start, hStates)),
      question(5, H(hFlop, start), H(hFlop, start, hStates)),
      explain('2-both', '페어와 드로우가 함께 있을 수도 있어요', '다른 카드 예시예요. J 원 페어와 하트 4장이 있어, 원 페어와 플러시 드로우를 함께 가졌어요.', scene('Jh 7h 2h', ['Ah Jc'], ['별도 비교 · 앞서 본 판과 다른 카드'], ['탑 페어 + 플러시 드로우'])),
      question(6, H(hFlop, start), H(hFlop, start, hStates)),
      summary('2-summary', '현재 강도와 앞으로 좋아질 가능성을 함께 봐요.', ['A 셋 · B 탑 페어 · C 플러시 드로우 · D 페어 없음', '다음에는 이 후보들이 왜 베팅할 수 있는지 생각해요.']),
    ],
  },
  'range-flop-actions': {
    id: 'range-flop-actions', title: '플랍 행동과 후보의 가능성', objective: '베팅의 이유와 팟에 비해 얼마나 큰 베팅인지 살펴봐요.',
    steps: [
      explain('3-bet', '상대가 처음으로 베팅했어요', 'BB가 체크하자 상대 버튼이 8칩을 베팅했어요. 각 후보라면 왜 베팅할까요?', H(hFlop, flopBet, hStates, { pot: 13, bet: 8 })),
      explain('3-size', '가운데 모인 칩과 비교해요', '팟은 베팅 전 가운데 모인 칩이에요. 13칩 팟의 8칩은 절반보다 크지만, 80칩 팟의 8칩은 10분의 1이에요.', { kind: 'bet-comparison', rows: [{ label: '이번 판', pot: 13, bet: 8 }, { label: '별도 금액 비교', pot: 80, bet: 8 }], showRatio: true }),
      question(7, { kind: 'bet-comparison', rows: [{ label: '이번 판', pot: 13, bet: 8 }, { label: '별도 금액 비교', pot: 80, bet: 8 }] }, { kind: 'bet-comparison', rows: [{ label: '이번 판', pot: 13, bet: 8 }, { label: '별도 금액 비교', pot: 80, bet: 8 }], showRatio: true }),
      explain('3-reasons', '각 후보는 왜 베팅할까요?', 'A·B라면 더 약한 패에게 콜을 받아 칩을 더 얻으려는 베팅일 수 있어요. C는 폴드를 노리며, 콜을 받아도 다음 스페이드로 플러시가 될 기회가 있어요. D는 페어 없이 폴드를 노리는 블러프일 수 있어요.', H(hFlop, flopBet, hStates, { pot: 13, bet: 8 })),
      question(8, H(hFlop, flopBet, [], { pot: 13, bet: 8 }), H(hFlop, flopBet, hStates, { pot: 13, bet: 8 })),
      explain('3-uncertainty', '가장 강한 패가 가장 유력한 패일까요?', '가장 강한 패라고 가장 유력한 것은 아니에요. 상대가 어떤 패로 참가하고 베팅하는지도 알아야 해요.', facts([{ label: '판단 방법', value: '기존 후보 → 새 정보 → 판단 변화 → 이유' }, { label: '아직 모르는 정보', value: '어느 후보가 더 유력한지는 아직 알 수 없어요.' }])),
      question(9, H(hFlop, flopBet, [], { pot: 13, bet: 8 }), H(hFlop, flopBet, hStates, { pot: 13, bet: 8 }), [unknown]),
      summary('3-summary', '첫 베팅에는 여러 이유가 있어요. 다음 정보로 판단을 이어가요.', ['A~D는 모두 가능해요. 어느 패가 더 유력한지는 다음 카드와 행동을 더 봐야 해요.', 'BB가 8칩 콜했어요. 팟 29칩으로 턴을 봐요.'], H(hFlop, flopCall)),
    ],
  },
  'range-turn': {
    id: 'range-turn', title: '턴에서의 후보 갱신', objective: '턴 카드와 두 번째 베팅을 보고 후보를 다시 판단해요.',
    steps: [
      explain('4-card', '턴 · 2♥가 나왔어요', '플랍에서 상대가 베팅하고 BB가 콜했어요. 이번 카드가 기존 네 후보를 어떻게 바꿨는지 먼저 봐요.', H(hTurn, flopCall)),
      question(10, H(hTurn, flopCall), H(hTurn, flopCall, hStates)),
      explain('4-bet', '상대가 두 번째로 베팅했어요', `${repeat} 상대가 턴에서도 베팅했어요. 위의 가정에 따라 어떤 후보의 가능성이 달라질지 생각해 보세요.`, H(hTurn, turnBet, [], { pot: 29, bet: 20 })),
      question(11, H(hTurn, turnBet, [], { pot: 29, bet: 20 }), H(hTurn, turnBet, hTurnJudgment, { pot: 29, bet: 20 }), [repeat]),
      explain('4-change', '무엇이 달라졌나요?', 'D로 두 번 베팅하는 일은 드물다고 정했으므로 D의 가능성을 낮게 봐요. A·B·C는 이전 판단을 유지하며, 세 후보의 가능성이 같다는 뜻은 아니에요.', H(hTurn, turnBet, hTurnJudgment, { pot: 29, bet: 20 })),
      question(12, H(hTurn, turnBet, [], { pot: 29, bet: 20 }), undefined, ['같은 카드와 베팅이라도, 약한 패로 연속 베팅하는지는 모르는 상대라면?']),
      explain('4-compare', '카드만 보고 바꾼 판단이 아니에요', 'D의 가능성을 낮춘 이유는 턴 카드가 아니라 두 번의 베팅과 상대의 습관이에요. BB가 20칩 콜해 팟은 69칩이 됐어요.', H(hTurn, turnCall, hTurnJudgment)),
      summary('4-summary', '새 카드 → 후보 상태 → 새 행동 → 판단 변화 순서로 봐요.', ['가능성 ↑: 이전보다 더 유력함', '가능성 ↓: 이전보다 덜 유력함', '판단 유지: 이전 판단을 바꿀 근거가 없음']),
    ],
  },
  'range-river': {
    id: 'range-river', title: '리버의 최종 판단', objective: '마지막 카드와 행동을 앞선 추론에 연결해요.',
    steps: [
      explain('5-card', '리버 · Q♠가 나왔어요', '턴까지 남겨둔 후보를 그대로 봐요. 새 카드로 족보가 바뀐 후보와 그대로인 후보를 확인해요.', H(hRiver, turnCall)),
      question(13, H(hRiver, turnCall), flushFeedback(H(hRiver, turnCall, ['셋', '탑 페어', '플러시 완성', '페어 없음']), 2, 'Ks 8s Qs')),
      explain('5-bet', '마지막에도 크게 베팅했어요', `${riverRead} 상대는 69칩 팟에 52칩, 약 4분의 3을 베팅했어요.`, H(hRiver, riverBet, [], { pot: 69, bet: 52 })),
      question(14, H(hRiver, riverBet, [], { pot: 69, bet: 52 }), H(hRiver, riverBet, hRiverJudgment, { pot: 69, bet: 52 }), [riverRead]),
      explain('5-judgment', '어떤 패가 더 유력할까요?', '이 가정에서는 A·C가 더 유력하고 B·D의 가능성은 낮게 봐요. A와 C 중 어느 쪽이 더 유력한지는 아직 알 수 없어요.', H(hRiver, riverBet, hRiverJudgment, { pot: 69, bet: 52 })),
      question(15, H(hRiver, riverBet, [], { pot: 69, bet: 52 }), H(hRiver, riverBet, hRiverJudgment, { pot: 69, bet: 52 }), [repeat, riverRead]),
      explain('5-recap', '처음 후보가 어떻게 달라졌나요?', '각 후보가 지금까지의 카드와 행동에 얼마나 잘 맞는지 살펴봤어요.', facts([{ label: '프리플랍', value: '페어·높은 카드·같은 무늬 카드' }, { label: '플랍', value: '셋·탑 페어·드로우·페어 없음' }, { label: '턴', value: '두 번의 베팅과 상대 습관 → D 가능성 ↓' }, { label: '리버', value: '완성된 족보와 큰 베팅 → A·C가 더 유력' }])),
      summary('5-summary', '마지막 베팅만 보지 말고, 처음부터 나온 카드와 행동을 함께 봐요.', ['더 유력한 후보와 다른 가능한 후보를 함께 남겨요.', '실제 상대 패를 보지 않아도 판단의 근거를 설명할 수 있어요.']),
    ],
  },
  'range-variations': {
    id: 'range-variations', title: '다른 흐름에 적용하기', objective: '세 가지 다른 전개에서 같은 사고 과정을 적용해요.',
    steps: [
      explain('6-start', '다른 카드와 행동이 나왔다면?', '같은 후보와 플랍에서, 이후 카드와 행동만 바꾼 별도 예시예요.', H(hFlop, start)),
      explain('6-a', '변형 A · 계속 공격했지만 드로우는 실패했어요', `${noTripleBluff} 이번에는 리버 6♦라서 C의 플러시가 완성되지 않았어요.`, H(variationA, riverBet, ['셋', '탑 페어', '페어 없음 · 플러시 드로우 실패', '페어 없음'], { pot: 69, bet: 52 })),
      question(16, H(variationA, riverBet, [], { pot: 69, bet: 52 }), H(variationA, riverBet, ['셋\n판단 유지 · 완성된 패로 베팅 가능', '탑 페어\n판단 유지 · 완성된 패로 베팅 가능', '플러시 완성 실패\n가능성 ↓ · 완성 실패 뒤 세 번 블러프는 드묾', '페어 없음\n가능성 ↓ · 페어 없이 세 번 블러프는 드묾'], { pot: 69, bet: 52 }), ['변형 A · 앞서 본 판과 다른 리버', noTripleBluff]),
      explain('6-b', '체크했다는 이유만으로 강한 패를 지우지 않아요', '변형 B에서는 턴과 리버에 체크했어요. 원 페어로 팟을 키우지 않거나 드로우로 추가 베팅 없이 다음 카드를 보려 했을 수 있어요. 셋도 체크할 수 있어요.', H(variationA, variationBHistory, ['셋도 체크할 수 있음', '원 페어로 팟을 키우지 않으려 체크', '플러시 완성 실패 · 추가 베팅을 피했을 수 있음', '블러프를 멈췄을 수도 있음'])),
      question(17, H(variationA, variationBHistory), undefined, ['변형 B · 턴부터 체크, 팟 29칩', unknown]),
      explain('6-c', '변형 C · 뒤늦게 다시 올렸어요', `${lateRaise} 플랍 체크 뒤 턴 4♠가 나왔어요. BB가 8칩을 베팅하자 상대는 총 24칩으로 레이즈했어요.`, H(cTurn, variationCTurn)),
      question(18, H(cTurn, variationCTurn), H(cTurn, variationCTurn, cJudgment), ['변형 C · 턴 베팅 전 팟 13칩 · BB 8칩 베팅 · 상대 레이즈 · 이번 베팅 총액 24칩', lateRaise]),
      explain('6-c-river', '같은 변형 C를 리버까지 봐요', 'BB가 추가로 16칩 콜해 팟 61칩이 됐어요. 리버 6♦에서 BB 체크 뒤 상대가 40칩 베팅했어요.', H(cRiver, variationCRiver, [], { pot: 61, bet: 40 })),
      question(19, H(cRiver, variationCRiver, [], { pot: 61, bet: 40 }), H(cRiver, variationCRiver, ['셋 · 이 패로 베팅했을 가능성 유지', '탑 페어 · 턴에서 낮게 봤던 후보', '플러시 · 이 패로 베팅했을 가능성 유지', '페어 없음 · 블러프 가능'], { pot: 61, bet: 40 }), ['변형 C · 리버에서 블러프를 얼마나 자주 하는지는 아직 모름', lateRaise]),
      summary('6-summary', '행동 하나로 패를 단정하지 않아요.', ['계속 베팅해도 처음부터 가장 좋은 패였다고 단정할 수 없어요.', '체크는 원 페어·드로우·강한 패로도 가능해요.', '늦은 레이즈는 새로 완성된 패·기존의 강한 패·블러프 모두 가능해요.']),
    ],
  },
  'range-hand-challenge': {
    id: 'range-hand-challenge', title: '상대 패 추론 종합 도전', objective: '새로운 세 판에서 상대가 가질 만한 패를 판단해요.', passingPercentage: 80,
    steps: [
      explain('7-start', '새 핸드 세 개를 끝까지 읽어보세요', '각 판을 프리플랍부터 리버까지 네 문제로 봐요. 12문제 중 10문제 이상 맞히면 통과예요.'),
      question(20, scene('', [], start), undefined, ['사례 E · 프리플랍', opening]),
      question(21, scene(eFlop, e, flopBet, [], { pot: 13, bet: 8 }), scene(eFlop, e, flopBet, eStates, { pot: 13, bet: 8 }), ['사례 E · 플랍', unknown]),
      question(22, scene(eTurn, e, turnBet, [], { pot: 29, bet: 20 }), scene(eTurn, e, turnBet, ['탑 페어\n판단 유지', '셋\n판단 유지', '플러시 드로우\n판단 유지', '페어 없음\n가능성 ↓ · 이 패로 두 번 베팅하는 일은 드묾'], { pot: 29, bet: 20 }), ['사례 E · 턴', repeat]),
      question(23, scene(eRiver, e, riverBet, [], { pot: 69, bet: 52 }), flushFeedback(scene(eRiver, e, riverBet, ['탑 페어\n가능성 ↓ · 원 페어로 크게 베팅하는 일은 드묾', '셋\n판단 유지', '플러시\n가능성 ↑ · 완성 뒤 큰 베팅', '페어 없음\n가능성 ↓ · 페어 없이 세 번 블러프는 드묾'], { pot: 69, bet: 52 }), 2, 'Qh 9h 6h'), ['사례 E · 리버', riverRead]),
      question(24, scene('', [], start), undefined, ['사례 F · 프리플랍', opening]),
      question(25, scene(fFlop, f, flopBet, [], { pot: 13, bet: 8 }), scene(fFlop, f, flopBet, ['탑 페어', '셋', '플러시 드로우', '페어 없음 · 턴·리버 모두 클로버면 플러시 가능'], { pot: 13, bet: 8 }), ['사례 F · 플랍', unknown]),
      question(26, scene(fTurn, f, fTurnHistory), scene(fTurn, f, fTurnHistory, ['탑 페어 · 팟을 키우지 않으려 체크 가능', '셋도 체크 가능', '드로우 · 추가 베팅 없이 다음 카드 기다림', '페어 없음 · 턴이 클로버가 아니라 플러시 불가능']), ['사례 F · 턴 · 팟 29칩', unknown]),
      question(27, scene(fRiver, f, fRiverHistory), scene(fRiver, f, fRiverHistory, ['탑 페어 · 체크로 끝낼 수 있음', '셋 · 완전히 제외하지 않음', '페어 없음 · 드로우 실패', '페어 없음']), ['사례 F · 리버 · 팟 29칩', unknown]),
      question(28, scene('', [], gStart), undefined, ['사례 G · 이번에 관찰하는 상대는 BB', '콜에도 페어·높은 카드·같은 무늬 연결 카드 등이 가능해요.']),
      question(29, scene(gFlop, g, gFlopHistory), scene(gFlop, g, gFlopHistory, ['거샷 드로우 · 9가 필요', '탑 페어', '셋', '페어 없음']), ['사례 G · 상대 BB의 플랍 콜 · 콜 후 팟 29칩']),
      question(30, scene(gTurn, g, gTurnHistory), scene(gTurn, g, gTurnHistory, ['스트레이트\n가능성 ↑ · 완성 뒤 체크-레이즈', '탑 페어\n가능성 ↓ · 원 페어로 큰 레이즈는 드묾', '셋\n판단 유지 · 셋으로 콜한 뒤 레이즈할 수 있음', '거샷 드로우 · 10이 필요\n판단 유지 · 블러프 가능']), ['사례 G · 턴 시작 팟 29칩 · 버튼 12칩 베팅 · 상대 BB 레이즈 · 이번 베팅 총액 36칩', lateRaise]),
      question(31, scene(gRiver, g, gRiverHistory, [], { pot: 101, bet: 60 }), scene(gRiver, g, gRiverHistory, ['스트레이트 · 이 패로 베팅했을 가능성 유지', '탑 페어 · 턴에서 낮게 봤던 후보', '셋 · 이 패로 베팅했을 가능성 유지', '페어 없음 · 드로우 실패, 블러프 가능'], { pot: 101, bet: 60 }), ['사례 G · 리버에서 블러프를 얼마나 자주 하는지는 아직 모름', lateRaise]),
      summary('7-summary', '새 카드와 행동을 보고 더 유력한 후보와 그 이유를 판단했어요.', ['출발 후보 → 플랍 상태 → 행동 이유 → 턴 갱신 → 리버 정리', '더 유력한 후보와 남아 있는 다른 가능성을 이유와 함께 설명해요.']),
    ],
  },
}
