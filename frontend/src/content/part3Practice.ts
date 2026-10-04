import type { CardRank, CardSuit, PlayingCard } from '../types/cards'
import type { CommunityCards, RuleVisual, SingleChoiceStep, TableStage } from '../types/course'
import type { PracticeQuestion } from './part1Practice'

interface Example {
  n: number
  lessonId: string
  concept: string
  hole?: string
  board?: string
  stage?: TableStage
  prompt: string
  options: string[]
  correct: number[]
  explanation: string
  condition?: string
}

const suits: Record<string, CardSuit> = { s: 'spades', h: 'hearts', d: 'diamonds', c: 'clubs' }
function cards(value: string): PlayingCard[] {
  return value.split(' ').map(code => ({ rank: code.slice(0, -1) as CardRank, suit: suits[code.slice(-1)] }))
}

// 60개의 승인된 고정 사례입니다. correct는 위에서부터 0으로 시작하는 보기 위치입니다.
// 정답을 자동 생성하지 않습니다. 시작할 때만 기존 연습 엔진이 문제와 보기를 섞습니다.
const examples: Example[] = [
  {
    n: 1, lessonId: "made-hand-and-draw", concept: "p3-current",
    hole: "Kc Qc", board: "Jc 6c 2d", stage: "flop",
    prompt: "지금의 패와 가능성을 맞게 설명한 것은?",
    options: ["이미 플러시","K 하이 + 플러시 드로우"], correct: [1],
    explanation: "지금은 K 하이예요. 클로버 한 장 더 나오면 플러시예요.",
  },
  {
    n: 2, lessonId: "made-hand-and-draw", concept: "p3-current",
    hole: "Ad Js", board: "10d 6d 2d", stage: "flop",
    prompt: "지금의 패와 가능성을 맞게 설명한 것은?",
    options: ["A 하이 + 플러시 드로우","내 카드 무늬가 달라 플러시 불가능"], correct: [0],
    explanation: "A♦와 공용 다이아몬드 세 장을 합치면 네 장이에요. 한 장 더 나오면 플러시예요.",
  },
  {
    n: 3, lessonId: "made-hand-and-draw", concept: "p3-current",
    hole: "Qs 10s", board: "Ks 7s 3d 2s", stage: "turn",
    prompt: "플러시를 아직 기다리는 상태인가요?",
    options: ["한 장 더 필요","이미 완성"], correct: [1],
    explanation: "스페이드 다섯 장으로 플러시가 이미 완성됐어요.",
  },
  {
    n: 4, lessonId: "made-hand-and-draw", concept: "p3-current",
    hole: "9d 8c", board: "Ks 5h 2c", stage: "flop",
    prompt: "지금의 패와 플러시 가능성을 맞게 설명한 것은?",
    options: ["K 하이 + 한 장으로 플러시 완성 불가","K 하이 + 플러시까지 한 장"], correct: [0],
    explanation: "현재는 K 하이예요. 같은 무늬가 네 장인 상황은 아니에요.",
  },
  {
    n: 5, lessonId: "made-hand-and-draw", concept: "p3-pair-draw",
    hole: "As 9s", board: "Ah 8s 4s", stage: "flop",
    prompt: "두 상태가 함께 있을 수 있나요?",
    options: ["A 원 페어와 플러시 드로우","A 원 페어이므로 드로우 없음"], correct: [0],
    explanation: "A 두 장은 페어, 스페이드 네 장은 플러시 드로우예요.",
  },
  {
    n: 6, lessonId: "made-hand-and-draw", concept: "p3-pair-draw",
    hole: "Kd Qc", board: "Ks 7d 2d", stage: "flop",
    prompt: "현재 K 원 페어예요. 다이아몬드 한 장이면 플러시도 될까요?",
    options: ["바로 완성","아직 부족"], correct: [1],
    explanation: "지금 다이아몬드는 세 장이에요. 한 장 추가돼도 네 장이에요.",
  },
  {
    n: 7, lessonId: "made-hand-and-draw", concept: "p3-pair-draw",
    hole: "Jh 10h", board: "Jc 6h 2h", stage: "flop",
    prompt: "현재 패와 가능성을 맞게 설명한 것은?",
    options: ["이미 플러시","J 원 페어 + 플러시 드로우"], correct: [1],
    explanation: "J 두 장은 페어예요. 하트 네 장도 있어 한 장 더 나오면 플러시예요.",
  },
  {
    n: 8, lessonId: "made-hand-and-draw", concept: "p3-pair-draw",
    hole: "7c 7d", board: "Ac 9c 3c", stage: "flop",
    prompt: "현재 패와 가능성을 맞게 설명한 것은?",
    options: ["7 원 페어 + 플러시 드로우","공용 A가 있으니 A 원 페어"], correct: [0],
    explanation: "내 7 두 장으로 페어예요. 내 7♣와 공용 클로버 세 장은 플러시를 기다려요.",
  },
  {
    n: 9, lessonId: "flush-draw", concept: "p3-flush-two",
    hole: "Kh 10h", board: "Qh 7h 3c", stage: "flop",
    prompt: "다음 한 장으로 플러시를 완성할 무늬는?",
    options: ["하트","클로버","다이아몬드"], correct: [0],
    explanation: "내 하트 두 장 + 공용 하트 두 장으로 네 장이에요.",
  },
  {
    n: 10, lessonId: "flush-draw", concept: "p3-flush-two",
    hole: "Qd 6d", board: "Ad 10d 4s", stage: "flop",
    prompt: "다음 한 장으로 플러시를 완성할 무늬는?",
    options: ["스페이드","다이아몬드","하트"], correct: [1],
    explanation: "다이아몬드 네 장이라 한 장 더 필요해요.",
  },
  {
    n: 11, lessonId: "flush-draw", concept: "p3-flush-two",
    hole: "Js 8s", board: "Ks 5s 2h", stage: "flop",
    prompt: "다음 한 장으로 플러시를 완성할 무늬는?",
    options: ["하트","클로버","스페이드"], correct: [2],
    explanation: "개인 카드와 공용 카드를 합쳐 스페이드 네 장이에요.",
  },
  {
    n: 12, lessonId: "flush-draw", concept: "p3-flush-one",
    hole: "Ac Jd", board: "Kc 8c 4c", stage: "flop",
    prompt: "내 카드 무늬가 달라도 플러시를 한 장으로 완성할 수 있나요?",
    options: ["가능","불가능"], correct: [0],
    explanation: "A♣ 한 장 + 공용 클로버 세 장으로 네 장이에요.",
  },
  {
    n: 13, lessonId: "flush-draw", concept: "p3-flush-one",
    hole: "Kd 10s", board: "Qd 9d 3d", stage: "flop",
    prompt: "다음 한 장으로 플러시를 완성할 무늬는?",
    options: ["스페이드","다이아몬드","어느 무늬도 불가능"], correct: [1],
    explanation: "내 K♦와 공용 다이아몬드 세 장이 같은 무늬예요.",
  },
  {
    n: 14, lessonId: "flush-draw", concept: "p3-flush-one",
    hole: "9h 8c", board: "Ah 6h 2h", stage: "flop",
    prompt: "다음 한 장으로 플러시를 완성할 무늬는?",
    options: ["클로버","하트","스페이드"], correct: [1],
    explanation: "내 9♥와 공용 하트 세 장으로 네 장이에요.",
  },
  {
    n: 15, lessonId: "flush-draw", concept: "p3-backdoor",
    hole: "Qc 9c", board: "Jc 7d 3h", stage: "flop",
    prompt: "턴만 클로버면 플러시가 완성될까요?",
    options: ["바로 완성","리버도 클로버여야 완성"], correct: [1],
    explanation: "지금 클로버는 세 장이에요. 턴과 리버가 모두 클로버여야 다섯 장이에요.",
  },
  {
    n: 16, lessonId: "flush-draw", concept: "p3-backdoor",
    hole: "As 8d", board: "Ks 6s 2c", stage: "flop",
    prompt: "플러시를 만들려면 남은 두 카드가 어떻게 나와야 할까요?",
    options: ["둘 중 하나만 스페이드","턴·리버 모두 스페이드"], correct: [1],
    explanation: "개인 카드까지 합쳐 스페이드는 세 장이에요. 두 장 더 필요해요.",
  },
  {
    n: 17, lessonId: "straight-draw", concept: "p3-open",
    hole: "10s 9d", board: "8c 7h Ac", stage: "flop",
    prompt: "다음 한 장으로 스트레이트를 완성할 숫자를 모두 고르세요",
    options: ["10","6","Q","J"], correct: [1,3],
    explanation: "7–8–9–10의 양끝에 6 또는 J가 붙으면 완성돼요.",
  },
  {
    n: 18, lessonId: "straight-draw", concept: "p3-open",
    hole: "Qh Jc", board: "10d 9h 4s", stage: "flop",
    prompt: "다음 한 장으로 스트레이트를 완성할 숫자를 모두 고르세요",
    options: ["Q","K","7","8"], correct: [3,1],
    explanation: "9–10–J–Q가 이어져 있어요. 8 또는 K면 다섯 숫자예요.",
  },
  {
    n: 19, lessonId: "straight-draw", concept: "p3-open",
    hole: "7d 6c", board: "5s 4d Kh", stage: "flop",
    prompt: "다음 한 장으로 스트레이트를 완성할 숫자를 모두 고르세요",
    options: ["3","7","9","8"], correct: [0,3],
    explanation: "4–5–6–7의 양끝은 3과 8이에요.",
  },
  {
    n: 20, lessonId: "straight-draw", concept: "p3-open",
    hole: "Js 10h", board: "9c 8d 2s", stage: "flop",
    prompt: "다음 한 장으로 스트레이트를 완성할 숫자를 모두 고르세요",
    options: ["K","7","Q","10"], correct: [1,2],
    explanation: "8–9–10–J에 7 또는 Q가 붙으면 완성돼요.",
  },
  {
    n: 21, lessonId: "straight-draw", concept: "p3-gut",
    hole: "9s 7h", board: "6d 5c Kd", stage: "flop",
    prompt: "다음 한 장으로 스트레이트를 완성할 숫자는?",
    options: ["4","8","10"], correct: [1],
    explanation: "5–6–7–빈칸–9에서 8이 빠져 있어요.",
  },
  {
    n: 22, lessonId: "straight-draw", concept: "p3-gut",
    hole: "Qc 10h", board: "9d 8c 3s", stage: "flop",
    prompt: "다음 한 장으로 스트레이트를 완성할 숫자는?",
    options: ["J","7","K"], correct: [0],
    explanation: "8–9–10–빈칸–Q에 J가 필요해요.",
  },
  {
    n: 23, lessonId: "straight-draw", concept: "p3-gut",
    hole: "6h 4c", board: "3d 2s Kc", stage: "flop",
    prompt: "다음 한 장으로 스트레이트를 완성할 숫자는?",
    options: ["A","7","5"], correct: [2],
    explanation: "2–3–4–빈칸–6을 채우는 숫자는 5예요.",
  },
  {
    n: 24, lessonId: "straight-draw", concept: "p3-gut",
    hole: "Kd Jh", board: "10c 9s 4d", stage: "flop",
    prompt: "다음 한 장으로 스트레이트를 완성할 숫자는?",
    options: ["A","Q","8"], correct: [1],
    explanation: "9–10–J–빈칸–K에서 Q만 빠져 있어요.",
  },
  {
    n: 25, lessonId: "straight-draw", concept: "p3-boundary",
    hole: "Ad 2c", board: "3s 4h 9c", stage: "flop",
    prompt: "다음 한 장으로 스트레이트를 완성할 숫자는?",
    options: ["K","5","K와 5 둘 다"], correct: [1],
    explanation: "A–2–3–4–5로만 완성돼요. K–A–2는 이어지지 않아요.",
  },
  {
    n: 26, lessonId: "straight-draw", concept: "p3-boundary",
    hole: "Kc Ah", board: "2d 3c 8h", stage: "flop",
    prompt: "턴에 4♦가 나오면 스트레이트일까요?",
    options: ["아직 아님","K–A–2–3–4로 완성"], correct: [0],
    explanation: "A–2–3–4는 네 숫자예요. K는 그 앞에 붙일 수 없어요.",
  },
  {
    n: 27, lessonId: "straight-draw", concept: "p3-boundary",
    hole: "9c 8h", board: "6s 3d As", stage: "flop",
    prompt: "턴에 7♦가 나오면 스트레이트일까요?",
    options: ["이미 완성","아직 네 숫자"], correct: [1],
    explanation: "7이 나와도 6–7–8–9 네 숫자예요. 다섯 숫자가 필요해요.",
  },
  {
    n: 28, lessonId: "straight-draw", concept: "p3-boundary",
    hole: "Qs Jd", board: "10h 9c 2s", stage: "flop",
    prompt: "턴에 K♣가 나오면 스트레이트일까요?",
    options: ["완성","아직 네 숫자"], correct: [0],
    explanation: "9–10–J–Q–K 다섯 숫자가 이어져요.",
  },
  {
    n: 29, lessonId: "counting-outs", concept: "p3-outs-flush",
    hole: "Jd 8d", board: "Ad 5d 2c", stage: "flop",
    prompt: "다음 한 장으로 플러시를 만드는 아웃츠는 몇 장인가요?",
    options: ["4장","9장","13장"], correct: [1],
    explanation: "다이아몬드는 총 13장이에요. 보이는 4장을 빼면 9장이 남아요.",
  },
  {
    n: 30, lessonId: "counting-outs", concept: "p3-outs-flush",
    hole: "Kc 7s", board: "Qc 9c 3c", stage: "flop",
    prompt: "다음 한 장으로 플러시를 만드는 아웃츠는 몇 장인가요?",
    options: ["13장","4장","9장"], correct: [2],
    explanation: "내 클로버 한 장과 공용 세 장을 합쳐 네 장이에요. 남은 클로버는 9장이에요.",
  },
  {
    n: 31, lessonId: "counting-outs", concept: "p3-outs-flush",
    hole: "10h 6h", board: "Kh 8h 4d", stage: "flop",
    prompt: "다음 한 장으로 플러시를 만드는 아웃츠는 몇 장인가요?",
    options: ["9장","13장","4장"], correct: [0],
    explanation: "하트 네 장이 보이니 남은 하트는 9장이에요.",
  },
  {
    n: 32, lessonId: "counting-outs", concept: "p3-outs-flush",
    hole: "As Qd", board: "Js 7s 2s", stage: "flop",
    prompt: "다음 한 장으로 플러시를 만드는 아웃츠는 몇 장인가요?",
    options: ["4장","13장","9장"], correct: [2],
    explanation: "스페이드라면 숫자에 상관없이 플러시가 돼요. 남은 스페이드는 9장이에요.",
  },
  {
    n: 33, lessonId: "counting-outs", concept: "p3-outs-open",
    hole: "9d 8s", board: "7c 6h Qs", stage: "flop",
    prompt: "다음 한 장으로 스트레이트를 만드는 아웃츠는 몇 장인가요?",
    options: ["2장","4장","8장"], correct: [2],
    explanation: "5 또는 10이 필요해요. 각각 네 장씩 있으니 총 8장이에요.",
  },
  {
    n: 34, lessonId: "counting-outs", concept: "p3-outs-open",
    hole: "Kh Qc", board: "Jd 10c 3h", stage: "flop",
    prompt: "다음 한 장으로 스트레이트를 만드는 아웃츠는 몇 장인가요?",
    options: ["8장","2장","4장"], correct: [0],
    explanation: "9 또는 A가 필요해요. 두 숫자를 네 장씩 세면 8장이에요.",
  },
  {
    n: 35, lessonId: "counting-outs", concept: "p3-outs-open",
    hole: "6s 5h", board: "4c 3d Jc", stage: "flop",
    prompt: "다음 한 장으로 스트레이트를 만드는 아웃츠는 몇 장인가요?",
    options: ["4장","8장","2장"], correct: [1],
    explanation: "2와 7이 각각 네 장씩 남아 있어요. 총 8장이에요.",
  },
  {
    n: 36, lessonId: "counting-outs", concept: "p3-outs-open",
    hole: "Jd 10s", board: "9h 8c 4d", stage: "flop",
    prompt: "다음 한 장으로 스트레이트를 만드는 아웃츠는 몇 장인가요?",
    options: ["2장","8장","4장"], correct: [1],
    explanation: "7과 Q가 필요해요. 무늬가 다른 네 장씩을 모두 세어요.",
  },
  {
    n: 37, lessonId: "counting-outs", concept: "p3-outs-gut",
    hole: "10c 8h", board: "7d 6c Ks", stage: "flop",
    prompt: "다음 한 장으로 스트레이트를 만드는 아웃츠는 몇 장인가요?",
    options: ["1장","4장","8장"], correct: [1],
    explanation: "가운데 9가 필요해요. 9는 무늬별로 네 장 있어요.",
  },
  {
    n: 38, lessonId: "counting-outs", concept: "p3-outs-gut",
    hole: "Qd Jh", board: "9s 8d 2c", stage: "flop",
    prompt: "다음 한 장으로 스트레이트를 만드는 아웃츠는 몇 장인가요?",
    options: ["8장","1장","4장"], correct: [2],
    explanation: "10 하나의 숫자가 필요해요. 남은 10 네 장이 아웃츠예요.",
  },
  {
    n: 39, lessonId: "counting-outs", concept: "p3-outs-gut",
    hole: "8c 6d", board: "5h 4s Ad", stage: "flop",
    prompt: "다음 한 장으로 스트레이트를 만드는 아웃츠는 몇 장인가요?",
    options: ["4장","8장","1장"], correct: [0],
    explanation: "필요한 숫자는 7 하나지만, 카드는 네 무늬로 4장이에요.",
  },
  {
    n: 40, lessonId: "counting-outs", concept: "p3-outs-gut",
    hole: "5d 4h", board: "2s Ac Qh", stage: "flop",
    prompt: "다음 한 장으로 스트레이트를 만드는 아웃츠는 몇 장인가요?",
    options: ["8장","4장","1장"], correct: [1],
    explanation: "3이 나오면 A–2–3–4–5가 돼요. 3 네 장을 세어요.",
  },
  {
    n: 41, lessonId: "remaining-chances", concept: "p3-opportunities",
    hole: "Ks 10s", board: "Js 6s 3h", stage: "flop",
    prompt: "리버까지 계속 참여하면 공용카드를 몇 장 더 보나요?",
    options: ["1장","2장"], correct: [1],
    explanation: "턴 한 장, 리버 한 장이 남아 있어요.",
  },
  {
    n: 42, lessonId: "remaining-chances", concept: "p3-opportunities",
    hole: "Qh 9h", board: "Kh 7h 2d 5c", stage: "turn",
    prompt: "리버까지 계속 참여하면 공용카드를 몇 장 더 보나요?",
    options: ["2장","1장"], correct: [1],
    explanation: "턴까지 나왔으니 리버 한 장만 남아요.",
  },
  {
    n: 43, lessonId: "remaining-chances", concept: "p3-opportunities",
    hole: "8d 7c", board: "6h 5s Kc", stage: "flop",
    prompt: "리버까지 계속 참여하면 공용카드를 몇 장 더 보나요?",
    options: ["2장","1장"], correct: [0],
    explanation: "드로우 종류와 관계없이 플랍 뒤에는 턴과 리버가 남아요.",
  },
  {
    n: 44, lessonId: "remaining-chances", concept: "p3-opportunities",
    hole: "Jc 9s", board: "8d 7h Kd 2c", stage: "turn",
    prompt: "턴에서 완성하지 못했어요. 앞으로 몇 장의 기회가 남았나요?",
    options: ["1장","2장"], correct: [0],
    explanation: "이미 나온 턴은 다시 볼 기회가 아니에요. 리버 한 장이 남아요.",
  },
  {
    n: 45, lessonId: "remaining-chances", concept: "p3-compare-chances",
    prompt: "어느 쪽이 드로우를 완성할 기회가 더 많나요?",
    options: ["A · 턴과 리버","B · 리버만"], correct: [0],
    explanation: "같은 아웃츠라면 두 번의 기회가 한 번보다 유리해요.",
    condition: "두 상황 모두 아웃츠 9장. A는 플랍에서 턴·리버 모두 보기, B는 턴에 빗나간 뒤 리버만 보기",
  },
  {
    n: 46, lessonId: "remaining-chances", concept: "p3-compare-chances",
    prompt: "어느 쪽의 완성 가능성이 더 높나요?",
    options: ["A · 턴만","B · 턴과 리버"], correct: [1],
    explanation: "플랍이라는 이름보다 몇 장을 볼지가 중요해요. 두 장을 보면 기회가 더 많아요.",
    condition: "아웃츠 8장. A는 플랍에서 다음 턴만 보기, B는 플랍에서 턴·리버 모두 보기",
  },
  {
    n: 47, lessonId: "remaining-chances", concept: "p3-compare-chances",
    prompt: "어느 쪽의 완성 가능성이 더 높나요?",
    options: ["B · 턴과 리버","A · 리버만"], correct: [0],
    explanation: "아웃츠가 4장이어도 두 장의 기회와 한 장의 기회는 달라요.",
    condition: "두 상황 모두 아웃츠 4장. A는 턴에 빗나간 뒤 리버만 보기, B는 플랍에서 턴·리버 모두 보기",
  },
  {
    n: 48, lessonId: "remaining-chances", concept: "p3-compare-chances",
    prompt: "완성 가능성이 더 낮은 쪽은 어디인가요?",
    options: ["A · 턴과 리버","B · 턴만"], correct: [1],
    explanation: "한 장만 보면 두 장을 모두 볼 때보다 완성 기회가 적어요.",
    condition: "아웃츠 9장. A는 플랍에서 턴·리버 모두 보기, B는 플랍에서 다음 턴만 보기",
  },
  {
    n: 49, lessonId: "remaining-chances", concept: "p3-estimate",
    hole: "Ah 10h", board: "Qh 8h 3c 2d", stage: "turn",
    prompt: "2·4 법칙으로 완성 가능성을 어림잡으면 몇 %인가요?",
    options: ["약 18%","약 36%","약 9%"], correct: [0],
    explanation: "한 장의 기회는 아웃츠에 2를 곱해요. 9 × 2 = 약 18%예요.",
    condition: "플러시 아웃츠 9장, 남은 기회는 리버 한 장",
  },
  {
    n: 50, lessonId: "remaining-chances", concept: "p3-estimate",
    hole: "9s 8d", board: "7h 6c Kd", stage: "flop",
    prompt: "2·4 법칙으로 완성 가능성을 어림잡으면 몇 %인가요?",
    options: ["약 16%","약 32%","약 8%"], correct: [1],
    explanation: "두 장의 기회는 4를 곱해요. 8 × 4 = 약 32%예요.",
    condition: "스트레이트 아웃츠 8장, 턴과 리버를 모두 보기",
  },
  {
    n: 51, lessonId: "remaining-chances", concept: "p3-estimate",
    hole: "Jc 9h", board: "8s 7d Ac 2h", stage: "turn",
    prompt: "2·4 법칙으로 완성 가능성을 어림잡으면 몇 %인가요?",
    options: ["약 16%","약 4%","약 8%"], correct: [2],
    explanation: "한 장만 남았으니 4 × 2 = 약 8%예요.",
    condition: "스트레이트 아웃츠 4장, 남은 기회는 리버 한 장",
  },
  {
    n: 52, lessonId: "remaining-chances", concept: "p3-estimate",
    hole: "Kd 8d", board: "Qd 6d 2s", stage: "flop",
    prompt: "2·4 법칙으로 완성 가능성을 어림잡으면 몇 %인가요?",
    options: ["약 18%","약 36%","약 9%"], correct: [1],
    explanation: "두 장을 모두 보는 조건이니 9 × 4 = 약 36%예요.",
    condition: "플러시 아웃츠 9장, 턴과 리버를 모두 보기",
  },
  {
    n: 53, lessonId: "draw-cautions", concept: "p3-win",
    hole: "Jh 8h", board: "Kh 7h 3c 5h", stage: "turn",
    prompt: "플러시가 됐어요. 이것만으로 승리가 확정됐나요?",
    options: ["확정 아님","플러시니 승리 확정"], correct: [0],
    explanation: "상대에게 A♥가 있으면 더 높은 플러시가 가능해요.",
  },
  {
    n: 54, lessonId: "draw-cautions", concept: "p3-win",
    hole: "Ac 2d", board: "3h 4s 9d 5c", stage: "turn",
    prompt: "A–2–3–4–5 스트레이트면 승리가 확정됐나요?",
    options: ["스트레이트니 승리 확정","확정 아님"], correct: [1],
    explanation: "상대가 6과 7을 가지고 있으면 더 높은 스트레이트가 돼요.",
  },
  {
    n: 55, lessonId: "draw-cautions", concept: "p3-win",
    hole: "Kc Kd", board: "Kh 8s 8h 3d 2c", stage: "river",
    prompt: "K 풀하우스예요. 상대에게 더 강한 패가 가능할까요?",
    options: ["불가능","가능"], correct: [1],
    explanation: "상대가 남은 8 두 장을 가지고 있으면 포카드가 돼요.",
  },
  {
    n: 56, lessonId: "draw-cautions", concept: "p3-win",
    hole: "As Kh", board: "Qc Jd 10s 9h 8c", stage: "river",
    prompt: "두 사람 중 누가 이기나요?",
    options: ["나","상대","무승부로 팟 나눔"], correct: [2],
    explanation: "두 사람 모두 10–J–Q–K–A 스트레이트예요. 무늬로 승패를 나누지 않아요.",
  },
  {
    n: 57, lessonId: "draw-cautions", concept: "p3-overlap",
    hole: "10h 9h", board: "8h 7c Kh", stage: "flop",
    prompt: "둘 중 하나를 완성하는 서로 다른 후보 카드는 몇 장인가요?",
    options: ["17장","15장","9장"], correct: [1],
    explanation: "6♥와 J♥는 두 목록에 겹쳐요. 9 + 8 − 2 = 15장이에요.",
    condition: "플러시 후보 9장, 스트레이트 후보 8장",
  },
  {
    n: 58, lessonId: "draw-cautions", concept: "p3-overlap",
    hole: "9d 7d", board: "6d 5c Kd", stage: "flop",
    prompt: "둘 중 하나를 완성하는 서로 다른 후보 카드는 몇 장인가요?",
    options: ["13장","12장","9장"], correct: [1],
    explanation: "8♦가 두 목록에 겹쳐요. 9 + 4 − 1 = 12장이에요.",
    condition: "플러시 후보 9장, 스트레이트 후보 4장",
  },
  {
    n: 59, lessonId: "draw-cautions", concept: "p3-overlap",
    hole: "Qs Js", board: "10s 9d 3s", stage: "flop",
    prompt: "K♠는 두 드로우를 모두 완성해요. 후보 수를 합칠 때 몇 번 세나요?",
    options: ["두 번","한 번"], correct: [1],
    explanation: "두 드로우를 모두 완성해도 K♠는 실제 카드 한 장이므로 한 번만 세어요.",
  },
  {
    n: 60, lessonId: "draw-cautions", concept: "p3-overlap",
    hole: "Jc 9c", board: "8c 7h Ac", stage: "flop",
    prompt: "플러시와 스트레이트를 모두 완성하는 카드는 무엇인가요?",
    options: ["10♣","10♦","Q♣","6♣"], correct: [0],
    explanation: "10이 빈칸을 채우고, 클로버는 다섯 번째 같은 무늬가 돼요. 둘 다 되는 카드는 10♣예요.",
  },
]

const fact = (value: string): RuleVisual => ({ kind: 'draw-facts', items: [{ label: '정답 근거', value }] })
const sequence = (ranks: string, needed: string, detail: string): RuleVisual => ({ kind: 'rank-sequences', rows: [{ label: '정답 근거', ranks: ranks.split(' '), needed: needed ? needed.split(' ') : [], detail }] })
const chances = (future: ('턴' | '리버')[], detail: string, value?: string): RuleVisual => ({ kind: 'draw-chances', rows: [{ label: '정답 근거', cards: future, detail, value }] })

// 숫자 띠·계산식은 정답을 제출한 뒤에만 표시합니다. 후보는 실제 보드에 추가하지 않습니다.
const feedback: Record<number, RuleVisual> = {
  1: fact('현재 K 하이 · 클로버 4장'), 2: fact('현재 A 하이 · 다이아몬드 4장'),
  3: fact('스페이드 5장 · 플러시 완성'), 4: fact('현재 K 하이 · 같은 무늬 최대 2장'),
  5: fact('A 원 페어 + 스페이드 4장'), 6: fact('다이아몬드 3 + 1 = 4장 · 아직 플러시 아님'),
  7: fact('J 원 페어 + 하트 4장'), 8: fact('7 원 페어 + 클로버 4장'),
  9: fact('내 하트 2장 + 공용 하트 2장 = 4장'),
  10: fact('내 다이아몬드 2장 + 공용 다이아몬드 2장 = 4장'),
  11: fact('내 스페이드 2장 + 공용 스페이드 2장 = 4장'),
  12: fact('내 클로버 1장 + 공용 클로버 3장 = 4장'),
  13: fact('내 다이아몬드 1장 + 공용 다이아몬드 3장 = 4장'),
  14: fact('내 하트 1장 + 공용 하트 3장 = 4장'),
  15: chances(['턴', '리버'], '현재 클로버 3장 → 턴과 리버 둘 다 클로버 필요'),
  16: chances(['턴', '리버'], '현재 스페이드 3장 → 턴과 리버 둘 다 스페이드 필요'),
  17: sequence('6 7 8 9 10 J', '6 J', '양끝의 6 또는 J 중 하나가 필요해요.'),
  18: sequence('8 9 10 J Q K', '8 K', '양끝의 8 또는 K 중 하나가 필요해요.'),
  19: sequence('3 4 5 6 7 8', '3 8', '양끝의 3 또는 8 중 하나가 필요해요.'),
  20: sequence('7 8 9 10 J Q', '7 Q', '양끝의 7 또는 Q 중 하나가 필요해요.'),
  21: sequence('5 6 7 8 9', '8', '가운데 8이 필요해요.'),
  22: sequence('8 9 10 J Q', 'J', '가운데 J가 필요해요.'),
  23: sequence('2 3 4 5 6', '5', '가운데 5가 필요해요.'),
  24: sequence('9 10 J Q K', 'Q', '가운데 Q가 필요해요.'),
  25: sequence('A 2 3 4 5', '5', 'A를 낮게 쓰면 5만 필요해요. K는 연결되지 않아요.'),
  26: sequence('A 2 3 4', '', '턴에 4가 나왔다고 가정해도 네 숫자예요. K는 붙지 않아요.'),
  27: sequence('6 7 8 9', '', '턴에 7이 나왔다고 가정해도 네 숫자예요.'),
  28: sequence('9 10 J Q K', '', '턴에 K가 나왔다고 가정하면 다섯 숫자가 이어져요.'),
  29: fact('13 − 4 = 9장'), 30: fact('13 − 4 = 9장'),
  31: fact('13 − 4 = 9장'), 32: fact('13 − 4 = 9장'),
  33: sequence('5 6 7 8 9 10', '5 10', '5 네 장 + 10 네 장 = 8장'),
  34: sequence('9 10 J Q K A', '9 A', '9 네 장 + A 네 장 = 8장'),
  35: sequence('2 3 4 5 6 7', '2 7', '2 네 장 + 7 네 장 = 8장'),
  36: sequence('7 8 9 10 J Q', '7 Q', '7 네 장 + Q 네 장 = 8장'),
  37: sequence('6 7 8 9 10', '9', '9 한 숫자 × 네 무늬 = 4장'),
  38: sequence('8 9 10 J Q', '10', '10 한 숫자 × 네 무늬 = 4장'),
  39: sequence('4 5 6 7 8', '7', '7 한 숫자 × 네 무늬 = 4장'),
  40: sequence('A 2 3 4 5', '3', '3 한 숫자 × 네 무늬 = 4장'),
  41: chances(['턴', '리버'], '플랍 뒤에는 두 장의 기회가 남아요.'),
  42: chances(['리버'], '턴까지 나왔으니 한 장의 기회가 남아요.'),
  43: chances(['턴', '리버'], '드로우 종류와 관계없이 두 장이 남아요.'),
  44: chances(['리버'], '이미 나온 턴은 제외하고 리버 한 장만 남아요.'),
  45: { kind: 'draw-chances', rows: [
    { label: '정답 근거', cards: ['턴', '리버'], value: 'A · 두 번', detail: '플랍에서 두 장을 모두 보는 조건' },
    { label: 'B · 한 번', cards: ['리버'], detail: '턴에 빗나간 뒤 마지막 한 장' },
  ] },
  46: { kind: 'draw-chances', rows: [
    { label: 'A · 한 번', cards: ['턴'], detail: '플랍에서 다음 턴만 보는 조건' },
    { label: '정답 근거', cards: ['턴', '리버'], value: 'B · 두 번', detail: '같은 출발점에서 두 장을 모두 보기' },
  ] },
  47: { kind: 'draw-chances', rows: [
    { label: 'A · 한 번', cards: ['리버'], detail: '턴에 빗나간 뒤 마지막 한 장' },
    { label: '정답 근거', cards: ['턴', '리버'], value: 'B · 두 번', detail: '플랍에서 두 장을 모두 보기' },
  ] },
  48: { kind: 'draw-chances', rows: [
    { label: 'A · 두 번', cards: ['턴', '리버'], detail: '플랍에서 두 장을 모두 보기' },
    { label: '정답 근거', cards: ['턴'], value: 'B · 더 낮음', detail: '다음 턴 한 장만 보는 조건' },
  ] },
  49: chances(['리버'], '아웃츠 9장 · 한 장의 기회는 ×2', '9 × 2 ≈ 18%'),
  50: chances(['턴', '리버'], '아웃츠 8장 · 두 장을 모두 보면 ×4', '8 × 4 ≈ 32%'),
  51: chances(['리버'], '아웃츠 4장 · 한 장의 기회는 ×2', '4 × 2 ≈ 8%'),
  52: chances(['턴', '리버'], '아웃츠 9장 · 두 장을 모두 보면 ×4', '9 × 4 ≈ 36%'),
  53: fact('내 K 하이 플러시 < 가능한 상대 A 하이 플러시'),
  54: sequence('A 2 3 4 5 6 7', '', '내 5 하이 스트레이트 < 가능한 상대 7 하이 스트레이트'),
  55: fact('내 K 풀하우스 < 가능한 상대 8 포카드'),
  56: sequence('10 J Q K A', '', '두 사람 모두 같은 A 하이 스트레이트 → 팟 나눔'),
  57: fact('9 + 8 − 2 = 15장'), 58: fact('9 + 4 − 1 = 12장'),
  60: sequence('7 8 9 10 J', '10', '10♣는 빈칸과 클로버 다섯 장을 함께 완성해요.'),
}
const highlighted: Record<number, number[]> = {
  1: [0, 1, 2, 3], 2: [0, 2, 3, 4], 3: [0, 1, 2, 3, 5],
  5: [0, 1, 3, 4], 6: [0, 3, 4], 7: [0, 1, 3, 4], 8: [0, 2, 3, 4],
  9: [0, 1, 2, 3], 10: [0, 1, 2, 3], 11: [0, 1, 2, 3],
  12: [0, 2, 3, 4], 13: [0, 2, 3, 4], 14: [0, 2, 3, 4],
  15: [0, 1, 2], 16: [0, 2, 3],
  29: [0, 1, 2, 3], 30: [0, 2, 3, 4], 31: [0, 1, 2, 3], 32: [0, 2, 3, 4],
  53: [0, 1, 2, 3, 5], 54: [0, 1, 2, 3, 5], 55: [0, 1, 2, 3, 4], 56: [0, 1, 2, 3, 4],
}
const opponents: Record<number, string> = { 53: 'Ah Qh', 54: '6s 7h', 55: '8c 8d', 56: 'Ah Kd' }
const candidateRanks: Record<number, string[]> = {
  33: ['5', '10'], 34: ['9', 'A'], 35: ['2', '7'], 36: ['7', 'Q'],
  37: ['9'], 38: ['10'], 39: ['7'], 40: ['3'],
}
const overlap: Record<number, string> = { 57: '6h Jh', 58: '8d', 60: '10c' }
const overlapFlush: Record<number, string> = {
  57: 'Ah Qh Jh 7h 6h 5h 4h 3h 2h',
  58: 'Ad Qd Jd 10d 8d 5d 4d 3d 2d',
  60: 'Kc Qc 10c 7c 6c 5c 4c 3c 2c',
}
const overlapStraight: Record<number, string[]> = { 57: ['6', 'J'], 58: ['8'], 60: ['10'] }
const comparisons: Record<number, RuleVisual> = {
  45: { kind: 'draw-chances', rows: [
    { label: 'A · 플랍에서 두 장 모두 보기', cards: ['턴', '리버'], detail: '아웃츠 9장 · 리버까지 계속 참여' },
    { label: 'B · 턴에 빗나간 뒤', cards: ['리버'], detail: '아웃츠 9장 · 마지막 리버만 보기' },
  ] },
  46: { kind: 'draw-chances', rows: [
    { label: 'A · 플랍에서 다음 한 장만', cards: ['턴'], detail: '아웃츠 8장 · 다음 턴만 보기' },
    { label: 'B · 플랍에서 두 장 모두 보기', cards: ['턴', '리버'], detail: '아웃츠 8장 · 리버까지 계속 참여' },
  ] },
  47: { kind: 'draw-chances', rows: [
    { label: 'A · 턴에 빗나간 뒤', cards: ['리버'], detail: '아웃츠 4장 · 마지막 리버만 보기' },
    { label: 'B · 플랍에서 두 장 모두 보기', cards: ['턴', '리버'], detail: '아웃츠 4장 · 리버까지 계속 참여' },
  ] },
  48: { kind: 'draw-chances', rows: [
    { label: 'A · 플랍에서 두 장 모두 보기', cards: ['턴', '리버'], detail: '아웃츠 9장 · 리버까지 계속 참여' },
    { label: 'B · 플랍에서 다음 한 장만', cards: ['턴'], detail: '아웃츠 9장 · 다음 턴만 보기' },
  ] },
}

export const part3PracticeQuestions: PracticeQuestion[] = examples.map(example => {
  const options = example.options.map((label, index) => ({ id: `option-${index}`, label }))
  const condition = example.lessonId === 'counting-outs' ? '추가 공개 정보 없음 · 다음 한 장으로 목표 족보 완성'
    : example.concept === 'p3-estimate' ? `${example.condition} · 추가 공개 정보 없음 · 아웃츠 유지` : example.condition
  const base = {
    id: `p3-practice-${String(example.n).padStart(2, '0')}`,
    lessonId: example.lessonId, concept: example.concept,
    prompt: example.prompt, options, explanation: example.explanation,
    feedbackVisual: feedback[example.n],
    ...(candidateRanks[example.n] ? { feedbackCardGroups: candidateRanks[example.n].map(rank => ({
      label: `아직 나오지 않은 후보 · ${rank} 네 무늬`, cards: cards(['s', 'h', 'd', 'c'].map(suit => rank + suit).join(' ')),
    })) } : {}),
    ...(overlap[example.n] ? { feedbackCardGroups: [
      { label: '플러시 완성 후보 · 9장', cards: cards(overlapFlush[example.n]), highlightedCards: cards(overlap[example.n]) },
      { label: `스트레이트 완성 후보 · ${example.n === 57 ? 8 : 4}장`, cards: overlapStraight[example.n].flatMap(rank => cards(['s', 'h', 'd', 'c'].map(suit => rank + suit).join(' '))), highlightedCards: cards(overlap[example.n]) },
      { label: '겹치는 후보 · 한 번만 세기', cards: cards(overlap[example.n]) },
    ] } : {}),
    ...(example.hole && example.board ? { table: {
      holeCards: cards(example.hole) as [PlayingCard, PlayingCard],
      communityCards: cards(example.board) as CommunityCards,
      stage: example.stage,
      highlightedCards: [...(highlighted[example.n] ?? []).map(index => cards(`${example.hole} ${example.board}`)[index]), ...(example.n === 56 ? cards(opponents[56]) : [])],
      ...(opponents[example.n] ? example.n === 56
        ? { opponentCards: cards(opponents[example.n]) as [PlayingCard, PlayingCard] }
        : { feedbackOpponentCards: cards(opponents[example.n]) as [PlayingCard, PlayingCard] } : {}),
    } satisfies NonNullable<SingleChoiceStep['table']> } : {}),
    ...(condition && !comparisons[example.n] ? { conditions: condition.split(' · ') } : {}),
    ...(comparisons[example.n] ? { visual: comparisons[example.n] } : {}),
  }
  return example.correct.length > 1
    ? { ...base, type: 'multi-choice', correctOptionIds: example.correct.map(index => options[index].id) }
    : { ...base, type: 'single-choice', correctOptionId: options[example.correct[0]].id }
})
