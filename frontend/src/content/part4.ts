import type { CardRank, CardSuit, PlayingCard } from '../types/cards'
import type { LearningStep, LessonDefinition, PartDefinition, RangeSceneVisual, RuleVisual } from '../types/course'
import { part4Questions } from './part4Questions'

const suits: Record<string, CardSuit> = { s: 'spades', h: 'hearts', d: 'diamonds', c: 'clubs' }
const cards = (codes: string): PlayingCard[] => codes ? codes.split(' ').map(code => ({ rank: code.slice(0, -1) as CardRank, suit: suits[code.slice(-1)] })) : []
const hand = (codes: string) => cards(codes) as [PlayingCard, PlayingCard]
const explain = (id: string, title: string, body: string, visual?: RuleVisual, conditions?: string[]): LearningStep => ({ id: `p4-seq-${id}`, type: 'explanation', title, body, visual, ...(conditions ? { conditions } : {}) })
const summary = (id: string, body: string, bullets: string[], visual?: RuleVisual): LearningStep => ({ id: `p4-seq-${id}`, type: 'summary', title: '핵심 정리', body, bullets, visual })

const setup = '6명 · 각 200칩 · 스몰 블라인드(SB) 1칩 / 빅 블라인드(BB) 2칩'
const opening = '상대 성향: 초반 자리는 좋은 패 위주로 참가. 앞사람이 모두 폴드한 버튼에서는 더 다양한 패로 참가.'
const repeat = '상대 성향: 페어·드로우가 없으면 플랍·턴 연속 베팅은 드묾.'
const noTripleBluff = '상대 성향: 페어 없이 플랍·턴 베팅 후 리버까지 블러프하는 일은 드묾. 드로우 실패도 포함.'
const riverRead = ['상대 성향: 플러시가 가능한 공용 카드에서 원 페어로 큰 베팅은 드묾.', noTripleBluff]
const lateRaise = ['상대 성향: 원 페어로 턴에 큰 레이즈는 드묾.', '상대 성향: 블러프 레이즈는 가능.']
const unknown = '상대 성향: 플랍 이후 베팅·체크 성향은 아직 모름.'
const directDraw = '여기서 드로우: 한 장으로 완성할 플러시·스트레이트 드로우'
const bigRiverBet = '이번 리버 베팅은 큰 베팅에 해당'
const bigTurnRaise = '이번 턴 레이즈는 큰 레이즈에 해당'
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
const hStates = ['셋 · 8 세 장', '탑 페어 · K 두 장', '페어 없음 · 스페이드 4장, 플러시 드로우', '페어 없음 · 한 장으로 완성할 플러시·스트레이트 드로우 없음']
const hTurnJudgment = ['셋\n판단 유지 · 셋으로 칩을 더 얻으려는 베팅 가능', '탑 페어\n판단 유지 · 원 페어로 계속 베팅 가능', '플러시 드로우\n판단 유지 · 폴드를 노리며 플러시 완성도 기대', '페어 없음\n가능성 ↓ · 이 패로 두 번 베팅하는 일은 드묾']
const hRiverJudgment = ['셋\n판단 유지 · 셋으로 큰 베팅 가능', '탑 페어\n가능성 ↓ · 원 페어로 크게 베팅하는 일은 드묾', '플러시\n판단 유지 · 플러시로 큰 베팅 가능, A와의 순위는 모름', '페어 없음\n가능성 ↓ · 리버까지 블러프를 이어가는 일은 드묾']

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
  const originalId = `p4-seq-q${String(n).padStart(2, '0')}`
  // 개정한 31문제는 새 보기 ID를 사용하며, 이전 두 판본의 답도 함께 정리합니다.
  const previouslyRevised = [2, 4, 5].includes(n)
  const supersedes = previouslyRevised ? [originalId, `${originalId}-v2`] : originalId
  const id = `${originalId}-${previouslyRevised ? 'v3' : 'v2'}`
  const options = data.options.map((label, index) => ({ id: `${id}-option-${index}`, label }))
  const common = { id, supersedes, prompt: data.prompt, options, explanation: data.explanation, visual, feedbackVisual, conditions: [setup, ...conditions] }
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
const cJudgment = ['셋\n판단 유지 · 셋도 플랍에 체크 가능', '탑 페어\n가능성 ↓ · 원 페어로 큰 레이즈는 드묾', '플러시\n판단 유지 · 플러시로 레이즈 가능, A와의 순위는 모름', '페어 없음\n판단 유지 · 블러프 레이즈 가능 · 얼마나 자주 하는지는 모름']

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
      explain('1-start', '버튼에서 레이즈한 상대는 어떤 패를 가졌을까요?', '상대가 가질 수 있는 패들을 묶어 레인지라고 해요. 앞으로 카드와 행동을 보며 어떤 패가 더 유력한지 판단해 볼게요.', { kind: 'position-scenes', rows: [{ label: '이번 판에서 상대는 딜러 버튼 자리예요', activeGroup: 'late', foldedBefore: true }], history: [setup, ...start] }),
      explain('1-position', '같은 상대라도 자리에 따라 달라요', '같은 레이즈라도, 상대 자리에 따라 가능한 패의 범위를 다르게 생각해야 해요.', facts([
        { label: '초반 자리', value: '좋은 패 위주로 참가', detail: '뒤에 행동할 사람이 많이 남아 있어요.' },
        { label: '버튼 자리', value: '조금 덜 좋은 패로도 참가', detail: '앞사람들이 모두 폴드했다면 더 다양한 패로 참가할 수 있어요.' },
      ])),
      question(1, undefined, undefined, ['상대 성향은 문제에서 주어진 정보입니다.', opening, '같은 상대가 같은 보유 칩으로 초반 자리와 버튼에서 각각 첫 레이즈한 상황입니다.', '두 상황 모두 앞사람들은 전부 폴드했습니다.']),
      explain('1-reraise', '먼저 올렸나요, 다시 올렸나요?', '아무도 레이즈하지 않았을 때 처음 올리면 첫 레이즈예요. 앞사람의 레이즈를 다시 올리면 재레이즈예요.', { kind: 'action-lines', rows: [{ label: '첫 레이즈', actions: ['앞사람 모두 폴드 → 버튼이 처음 레이즈'] }, { label: '재레이즈', actions: ['앞사람이 레이즈 → 버튼이 다시 레이즈'] }] }),
      question(2, lines('재레이즈한 상황', ['UTG 총 6칩 레이즈 → HJ·CO 폴드', '버튼 총 20칩으로 재레이즈']), undefined, [opening]),
      question(3, scene('', [], start), undefined, [opening, '높은 카드: J·Q·K·A']),
      explain('1-candidates', '네 후보를 함께 따라가 볼게요', '가능한 패 중 네 가지 예시예요. 다른 패도 가능하며, 네 후보의 가능성이 같다는 뜻은 아니에요.', H('', start, ['페어', '높은 카드', '같은 무늬 높은 카드', '서로 다른 무늬 높은 카드'])),
      summary('1-summary', '자리 → 앞선 행동 → 상대 행동 → 출발 후보 순서로 생각해요.', ['다음에는 같은 A~D를 공용 카드와 함께 살펴봐요.', '플랍이 나오면 시작패 평가와 별개로 각 후보의 현재 족보를 비교해요.']),
    ],
  },
  'range-flop': {
    id: 'range-flop', progressRevision: 1, title: '플랍과 후보의 상태', objective: '같은 후보들이 플랍에서 어떤 족보와 드로우를 갖는지 확인해요.',
    steps: [
      question(4, H(hFlop, start), H(hFlop, start, hStates), ['플랍 공개 · 앞서 본 네 후보를 공용 카드와 비교']),
      question(5, H(hFlop, start), H(hFlop, start, hStates)),
      question(6, H(hFlop, start), H(hFlop, start, hStates)),
      explain('2-both', '페어와 드로우가 함께 있을 수도 있어요', '다른 카드 예시예요. J 원 페어와 하트 4장이 있어, 원 페어와 플러시 드로우를 함께 가졌어요.', scene('Jh 7h 2h', ['Ah Jc'], ['페어와 드로우를 함께 가진 예시'], ['탑 페어 + 플러시 드로우'])),
      summary('2-summary', '현재 족보와 다음 카드로 완성할 수 있는 드로우를 함께 봐요.', ['A 셋 · B 탑 페어 · C 플러시 드로우 · D 페어 없음', '다음에는 이 후보들이 왜 베팅할 수 있는지 생각해요.']),
    ],
  },
  'range-flop-actions': {
    id: 'range-flop-actions', progressRevision: 1, title: '플랍 행동과 후보의 가능성', objective: '베팅의 이유와 팟에 비해 얼마나 큰 베팅인지 살펴봐요.',
    steps: [
      explain('3-size', '가운데 모인 칩과 비교해요', '팟은 가운데 모인 칩이에요. 같은 베팅액도 팟에 따라 크기가 달라요. 베팅액을 베팅 전 팟으로 나눠 비교해요.', facts([{ label: '비교 방법', value: '베팅액 ÷ 베팅 전 팟' }])),
      question(7, { kind: 'bet-comparison', rows: [{ label: '이번 판', pot: 13, bet: 8 }, { label: '팟이 80칩인 상황', pot: 80, bet: 8 }] }, { kind: 'bet-comparison', rows: [{ label: '이번 판', pot: 13, bet: 8 }, { label: '팟이 80칩인 상황', pot: 80, bet: 8 }], showRatio: true }),
      explain('3-reasons', '패마다 베팅 이유가 달라요', '더 약한 패의 콜로 칩을 얻거나, 상대를 폴드시키려고 베팅할 수 있어요. 드로우라면 상대의 폴드와 다음 카드의 완성을 함께 기대할 수 있어요.'),
      question(8, H(hFlop, flopBet, [], { pot: 13, bet: 8 }), H(hFlop, flopBet, hStates, { pot: 13, bet: 8 }), ['BB 체크 → 상대 버튼 8칩 베팅 · 베팅 전 팟 13칩']),
      explain('3-uncertainty', '패의 강도와 상대가 가졌을 가능성은 달라요', '족보의 강도는 카드로 확인해요. 상대가 그 패를 가졌을 가능성은 자리·행동·상대 성향을 근거로 판단해요.', facts([{ label: '족보 강도', value: '카드로 비교' }, { label: '보유 가능성', value: '자리·행동·상대 성향으로 추론' }])),
      question(9, H(hFlop, flopBet, [], { pot: 13, bet: 8 }), H(hFlop, flopBet, hStates, { pot: 13, bet: 8 }), [unknown]),
      summary('3-summary', '첫 베팅에는 여러 이유가 있어요. 다음 정보로 판단을 이어가요.', ['A~D는 모두 가능해요. 어느 패가 더 유력한지는 다음 카드와 행동을 더 봐야 해요.', 'BB가 8칩 콜했어요. 팟 29칩으로 턴을 봐요.'], H(hFlop, flopCall)),
    ],
  },
  'range-turn': {
    id: 'range-turn', progressRevision: 1, title: '턴에서의 후보 갱신', objective: '턴 카드와 두 번째 베팅을 보고 후보를 다시 판단해요.',
    steps: [
      question(10, H(hTurn, flopCall), H(hTurn, flopCall, hStates)),
      question(11, H(hTurn, turnBet, [], { pot: 29, bet: 20 }), H(hTurn, turnBet, hTurnJudgment, { pot: 29, bet: 20 }), [repeat, directDraw]),
      question(12, H(hTurn, turnBet, [], { pot: 29, bet: 20 }), undefined, ['상대 성향: 페어·드로우 없이 연속 베팅하는지는 모름.', directDraw, '카드·베팅은 앞 문제와 같음.']),
      summary('4-summary', '새 카드 → 후보 상태 → 새 행동 → 판단 변화 순서로 봐요.', ['가능성 ↑: 상대가 이 패를 가졌을 가능성을 이전보다 높게 봄', '가능성 ↓: 상대가 이 패를 가졌을 가능성을 이전보다 낮게 봄', '판단 유지: 가능성을 바꿀 근거가 없음', '가능성을 바꾸는 근거는 카드·행동·상대 성향이에요.', 'BB가 20칩 콜해 팟은 69칩이 됐어요.']),
    ],
  },
  'range-river': {
    id: 'range-river', progressRevision: 1, title: '리버의 최종 판단', objective: '마지막 카드와 행동을 앞선 추론에 연결해요.',
    steps: [
      question(13, H(hRiver, turnCall), flushFeedback(H(hRiver, turnCall, ['셋', '탑 페어', '플러시 완성', '페어 없음']), 2, 'Ks 8s Qs')),
      question(14, H(hRiver, riverBet, [], { pot: 69, bet: 52 }), H(hRiver, riverBet, hRiverJudgment, { pot: 69, bet: 52 }), [...riverRead, bigRiverBet, '보기의 앞·뒤 후보는 앞·뒤 설명에 각각 대응']),
      question(15, H(hRiver, riverBet, [], { pot: 69, bet: 52 }), H(hRiver, riverBet, hRiverJudgment, { pot: 69, bet: 52 }), [repeat, ...riverRead, bigRiverBet, directDraw]),
      summary('5-summary', '마지막 베팅만 보지 말고, 처음부터 나온 카드와 행동을 함께 봐요.', ['성향과 맞지 않아 덜 고려할 후보에도 다른 가능성은 남겨요.', '후보 사이의 순위를 정할 정보가 충분한지도 확인해요.'], facts([{ label: '프리플랍', value: '자리·첫 행동으로 출발 후보' }, { label: '플랍', value: '족보·드로우와 베팅 이유' }, { label: '턴', value: '두 번의 베팅과 상대 성향 → D 가능성 ↓' }, { label: '리버', value: '큰 베팅의 성향 → B·D를 덜 고려할 근거, A·C 순위는 모름' }])),
    ],
  },
  'range-variations': {
    id: 'range-variations', progressRevision: 1, title: '다른 흐름에 적용하기', objective: '세 가지 다른 전개에서 같은 사고 과정을 적용해요.',
    steps: [
      explain('6-start', '다른 카드와 행동이 나왔다면?', '앞서 본 네 후보와 플랍은 유지해요. 턴·리버 카드나 행동이 달라진 세 상황을 각각 살펴봐요.', H(hFlop, start)),
      question(16, H(variationA, riverBet, [], { pot: 69, bet: 52 }), H(variationA, riverBet, ['셋\n판단 유지 · 셋으로 베팅 가능', '탑 페어\n판단 유지 · 탑 페어로 베팅 가능', '플러시 완성 실패\n가능성 ↓ · 드로우로 계속 베팅하다 리버에서도 블러프하는 일은 드묾', '페어 없음\n가능성 ↓ · 리버까지 블러프를 이어가는 일은 드묾'], { pot: 69, bet: 52 }), ['변형 A · 리버 6♦ · 플랍·턴 카드와 베팅은 앞서 본 판과 같음', noTripleBluff]),
      question(17, H(variationA, variationBHistory), undefined, ['변형 B · 턴부터 체크, 팟 29칩', unknown]),
      question(18, H(cTurn, variationCTurn), H(cTurn, variationCTurn, cJudgment), ['변형 C · 턴 베팅 전 팟 13칩 · BB 8칩 베팅 · 상대 레이즈 · 이번 베팅 총액 24칩', ...lateRaise, bigTurnRaise]),
      question(19, H(cRiver, variationCRiver, [], { pot: 61, bet: 40 }), H(cRiver, variationCRiver, ['셋 · 판단 유지 · 이 패로 리버 베팅을 설명할 수 있음', '탑 페어 · 판단 유지 · 턴에서 가능성을 낮게 본 후보', '플러시 · 판단 유지 · 이 패로 리버 베팅을 설명할 수 있음', '페어 없음 · 블러프 가능'], { pot: 61, bet: 40 }), ['변형 C · 리버', '상대 성향: 리버 블러프 빈도는 아직 모름.', ...lateRaise]),
      summary('6-summary', '행동 하나로 패를 단정하지 않아요.', ['계속 베팅해도 처음부터 가장 좋은 패였다고 단정할 수 없어요.', '체크는 원 페어·드로우·강한 패로도 가능해요.', '턴 레이즈는 새로 완성된 플러시·플랍부터 있던 셋·블러프 모두로 설명할 수 있어요.']),
    ],
  },
  'range-hand-challenge': {
    id: 'range-hand-challenge', title: '상대 패 추론 종합 도전', objective: '새로운 세 판에서 상대가 가질 만한 패를 판단해요.', passingPercentage: 80,
    steps: [
      explain('7-start', '새로운 세 판에서 상대 패를 추론해 보세요', '한 판마다 프리플랍·플랍·턴·리버 문제를 하나씩 풀어요. 12문제 중 10문제 이상 맞히면 통과예요.'),
      question(20, scene('', [], start), undefined, ['사례 E · 프리플랍', opening]),
      question(21, scene(eFlop, e, flopBet, [], { pot: 13, bet: 8 }), scene(eFlop, e, flopBet, eStates, { pot: 13, bet: 8 }), ['사례 E · 플랍', unknown]),
      question(22, scene(eTurn, e, turnBet, [], { pot: 29, bet: 20 }), scene(eTurn, e, turnBet, ['탑 페어\n판단 유지', '셋\n판단 유지', '플러시 드로우\n판단 유지', '페어 없음\n가능성 ↓ · 이 패로 두 번 베팅하는 일은 드묾'], { pot: 29, bet: 20 }), ['사례 E · 턴', repeat, directDraw]),
      question(23, scene(eRiver, e, riverBet, [], { pot: 69, bet: 52 }), flushFeedback(scene(eRiver, e, riverBet, ['탑 페어\n가능성 ↓ · 원 페어로 크게 베팅하는 일은 드묾', '셋\n판단 유지', '플러시\n판단 유지 · 플러시로 큰 베팅 가능, B와의 순위는 모름', '페어 없음\n가능성 ↓ · 리버까지 블러프를 이어가는 일은 드묾'], { pot: 69, bet: 52 }), 2, 'Qh 9h 6h'), ['사례 E · 리버', ...riverRead, bigRiverBet]),
      question(24, scene('', [], start), undefined, ['사례 F · 프리플랍', opening]),
      question(25, scene(fFlop, f, flopBet, [], { pot: 13, bet: 8 }), scene(fFlop, f, flopBet, ['탑 페어', '셋', '플러시 드로우', '페어 없음 · 턴·리버 모두 클로버면 플러시 가능'], { pot: 13, bet: 8 }), ['사례 F · 플랍', unknown]),
      question(26, scene(fTurn, f, fTurnHistory), scene(fTurn, f, fTurnHistory, ['탑 페어 · 팟을 키우지 않으려 체크 가능', '셋도 체크 가능', '드로우 · 추가 베팅 없이 다음 카드 기다림', '페어 없음 · 턴이 클로버가 아니어서 리버까지 플러시 완성 불가']), ['사례 F · 턴 · 팟 29칩', unknown]),
      question(27, scene(fRiver, f, fRiverHistory), scene(fRiver, f, fRiverHistory, ['탑 페어 · 체크로 끝낼 수 있음', '셋 · 완전히 제외하지 않음', '페어 없음 · 드로우 실패', '페어 없음']), ['사례 F · 리버 · 팟 29칩', unknown]),
      question(28, scene('', [], gStart), undefined, ['사례 G · 이번에 관찰하는 상대는 BB', '상대 성향: 콜 성향은 아직 모름.']),
      question(29, scene(gFlop, g, gFlopHistory), scene(gFlop, g, gFlopHistory, ['거샷 드로우 · 9가 필요', '탑 페어', '셋', '페어 없음']), ['사례 G · 상대 BB의 플랍 콜 · 콜 후 팟 29칩']),
      question(30, scene(gTurn, g, gTurnHistory), scene(gTurn, g, gTurnHistory, ['스트레이트\n판단 유지 · 체크-레이즈 가능, C와의 순위는 모름', '탑 페어\n가능성 ↓ · 원 페어로 큰 레이즈는 드묾', '셋\n판단 유지 · 셋으로 콜한 뒤 레이즈할 수 있음', '거샷 드로우 · 10이 필요\n판단 유지 · 블러프 가능']), ['사례 G · 턴 시작 팟 29칩 · 버튼 12칩 베팅 · 상대 BB 레이즈 · 이번 베팅 총액 36칩', ...lateRaise, bigTurnRaise]),
      question(31, scene(gRiver, g, gRiverHistory, [], { pot: 101, bet: 60 }), scene(gRiver, g, gRiverHistory, ['스트레이트 · 판단 유지 · 이 패로 리버 베팅을 설명할 수 있음', '탑 페어 · 판단 유지 · 턴에서 가능성을 낮게 본 후보', '셋 · 판단 유지 · 이 패로 리버 베팅을 설명할 수 있음', '페어 없음 · 드로우 실패, 블러프 가능'], { pot: 101, bet: 60 }), ['사례 G · 리버', '상대 성향: 리버 블러프 빈도는 아직 모름.', ...lateRaise]),
      summary('7-summary', '새 카드와 행동을 보고 후보를 판단하는 근거와 한계를 살펴봤어요.', ['자리·첫 행동으로 가능한 패를 생각해요.', '플랍의 족보·드로우를 확인하고 베팅 이유를 생각해요.', '턴·리버 카드와 행동으로 덜 고려할 후보의 근거를 찾아요.', '후보 사이의 순위를 모르면 판단을 보류하고 다른 가능성도 남겨요.']),
    ],
  },
}
