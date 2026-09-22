import type { LessonDefinition, PartDefinition } from '../types/course'

const condition = '6인 테이블 · 약 100BB · 앞선 플레이어 모두 폴드'
const actions = [{ id: 'raise', label: '오픈 레이즈' }, { id: 'fold', label: '폴드' }]

export const part1Lessons: Record<string, LessonDefinition> = {
  'hand-notation': {
    id: 'hand-notation', title: '시작 패 표기 읽기', objective: '축약 표기만 보고 두 카드의 관계를 읽는다.', steps: [
      { id: 'p1-notation-intro', type: 'explanation', title: 's, o, 숫자 두 개', body: 's는 같은 무늬(suited), o는 다른 무늬(offsuit)입니다. 같은 숫자 두 개는 포켓 페어를 뜻합니다.' },
      { id: 'p1-notation-aks', type: 'single-choice', prompt: 'AKs는 어떤 카드일까요?', options: [{ id: 'suited', label: '같은 무늬의 A와 K' }, { id: 'offsuit', label: '다른 무늬의 A와 K' }], correctOptionId: 'suited', explanation: '끝의 s는 두 카드가 같은 무늬라는 뜻입니다.' },
      { id: 'p1-notation-aqo', type: 'single-choice', prompt: 'AQo는 어떤 카드일까요?', options: [{ id: 'suited', label: '같은 무늬의 A와 Q' }, { id: 'offsuit', label: '다른 무늬의 A와 Q' }], correctOptionId: 'offsuit', explanation: '끝의 o는 두 카드의 무늬가 다르다는 뜻입니다.' },
      { id: 'p1-notation-tt', type: 'single-choice', prompt: 'TT는 어떤 카드일까요?', options: [{ id: 'pair', label: '10 포켓 페어' }, { id: 'connected', label: '10과 9' }], correctOptionId: 'pair', explanation: '같은 숫자를 두 번 적은 TT는 10 두 장으로 이루어진 포켓 페어입니다.' },
      { id: 'p1-notation-summary', type: 'summary', title: '핵심 정리', body: '두 글자와 접미사로 시작 패를 빠르게 표현합니다.', bullets: ['s = 같은 무늬', 'o = 다른 무늬', '같은 숫자 두 개 = 포켓 페어'] },
    ],
  },
  'hand-properties': {
    id: 'hand-properties', title: '시작 패의 네 가지 특징', objective: '시작 패를 평가하는 기본 재료를 이해한다.', steps: [
      { id: 'p1-property-high', type: 'explanation', title: '높은 카드', body: 'A♠ K♥처럼 높은 숫자는 카드 자체의 힘이 크고 높은 원 페어를 만들 수 있습니다.' },
      { id: 'p1-property-pair', type: 'explanation', title: '포켓 페어', body: '9♠ 9♥처럼 처음부터 같은 숫자 두 장을 가진 패입니다.' },
      { id: 'p1-property-suited', type: 'explanation', title: '수딧', body: 'A♠ J♠처럼 같은 무늬 두 장은 플러시 가능성을 더합니다.' },
      { id: 'p1-property-connected', type: 'explanation', title: '커넥티드', body: '9♠ 8♥처럼 숫자가 이어진 두 장은 스트레이트 가능성을 더합니다.' },
      { id: 'p1-property-summary', type: 'summary', title: '핵심 정리', body: '한 시작 패는 여러 특징을 동시에 가질 수 있습니다.', bullets: ['높은 카드', '포켓 페어', '수딧', '커넥티드'] },
    ],
  },
  'identify-properties': {
    id: 'identify-properties', title: '카드 특징 찾아내기', objective: '실제 카드에서 해당하는 특징을 모두 고른다.', steps: [
      { id: 'p1-identify-aks', type: 'multi-choice', prompt: 'A♠ K♠의 특징을 모두 고르세요.', options: [{ id: 'high', label: '높은 카드' }, { id: 'suited', label: '수딧' }, { id: 'connected', label: '커넥티드' }, { id: 'pair', label: '포켓 페어' }], correctOptionIds: ['high', 'suited', 'connected'], explanation: 'A와 K는 높은 카드이면서 숫자가 이어지고, 두 장 모두 스페이드라 수딧입니다.' },
      { id: 'p1-identify-98s', type: 'multi-choice', prompt: '9♠ 8♠의 특징을 모두 고르세요.', options: [{ id: 'high', label: '높은 카드' }, { id: 'suited', label: '수딧' }, { id: 'connected', label: '커넥티드' }, { id: 'pair', label: '포켓 페어' }], correctOptionIds: ['suited', 'connected'], explanation: '같은 스페이드이면서 9와 8이 이어집니다. 입문 분류에서 높은 카드나 포켓 페어는 아닙니다.' },
      { id: 'p1-identify-77', type: 'multi-choice', prompt: '7♣ 7♦의 특징을 모두 고르세요.', options: [{ id: 'pair', label: '포켓 페어' }, { id: 'suited', label: '수딧' }, { id: 'connected', label: '커넥티드' }], correctOptionIds: ['pair'], explanation: '같은 숫자 7 두 장이므로 포켓 페어입니다. 무늬는 다르고 서로 이어진 숫자도 아닙니다.' },
      { id: 'p1-identify-83o', type: 'multi-choice', prompt: '8♣ 3♥의 특징을 고르세요.', options: [{ id: 'none', label: '해당 없음' }, { id: 'pair', label: '포켓 페어' }, { id: 'suited', label: '수딧' }, { id: 'connected', label: '커넥티드' }], correctOptionIds: ['none'], explanation: '숫자가 낮고 떨어져 있으며 무늬도 다릅니다. 네 가지 강점 중 해당하는 것이 없습니다.' },
    ],
  },
  'compare-hands': {
    id: 'compare-hands', title: '두 시작 패 비교하기', objective: '특징을 근거로 더 유리한 시작 패를 고른다.', steps: [
      { id: 'p1-compare-ak', type: 'single-choice', prompt: '더 유리한 시작 패는?', options: [{ id: 'aks', label: 'A♠ K♠' }, { id: 'a8o', label: 'A♥ 8♣' }], correctOptionId: 'aks', explanation: 'A♠ K♠는 두 카드가 모두 높고 수딧이며 연결되어 A♥ 8♣보다 발전 가능성이 많습니다.' },
      { id: 'p1-compare-99', type: 'single-choice', prompt: '더 유리한 시작 패는?', options: [{ id: '99', label: '9♠ 9♥' }, { id: 'k4o', label: 'K♣ 4♦' }], correctOptionId: '99', explanation: '9♠ 9♥는 이미 원 페어를 이룬 포켓 페어라 K♣ 4♦보다 기본 완성도가 높습니다.' },
      { id: 'p1-compare-jt', type: 'single-choice', prompt: '더 유리한 시작 패는?', options: [{ id: 'jts', label: 'J♠ 10♠' }, { id: 'j4o', label: 'J♥ 4♣' }], correctOptionId: 'jts', explanation: 'J♠ 10♠는 수딧과 커넥티드 성질을 모두 가져 J♥ 4♣보다 강한 조합으로 발전할 길이 많습니다.' },
    ],
  },
  'classify-strength': {
    id: 'classify-strength', title: '시작 패 강도 분류', objective: '입문 기준의 상대적인 강도를 구분한다.', steps: [
      { id: 'p1-strength-context', type: 'explanation', title: '절대 차트가 아니에요', body: '아래 분류는 카드 특징을 익히기 위한 입문 기준입니다. 실제 결정은 포지션, 상대, 스택과 액션에 따라 달라집니다.' },
      { id: 'p1-strength-aa', type: 'single-choice', prompt: 'A♠ A♥의 입문 강도는?', options: [{ id: 'strong', label: '강함' }, { id: 'weak', label: '약함' }], correctOptionId: 'strong', explanation: '가장 높은 포켓 페어인 AA는 매우 강한 시작 패입니다.' },
      { id: 'p1-strength-ajs', type: 'single-choice', prompt: 'A♠ J♠의 입문 강도는?', options: [{ id: 'okay', label: '괜찮음' }, { id: 'weak', label: '약함' }], correctOptionId: 'okay', explanation: '높은 A와 J에 수딧 가능성까지 있어 입문 기준에서 괜찮은 패입니다.' },
      { id: 'p1-strength-76s', type: 'single-choice', prompt: '7♠ 6♠의 입문 강도는?', options: [{ id: 'situational', label: '상황에 따라' }, { id: 'strong', label: '항상 강함' }], correctOptionId: 'situational', explanation: '수딧 커넥터지만 카드 자체는 낮아 포지션과 상황에 따라 가치가 크게 달라집니다.' },
      { id: 'p1-strength-72o', type: 'single-choice', prompt: '7♣ 2♦의 입문 강도는?', options: [{ id: 'weak', label: '약함' }, { id: 'okay', label: '괜찮음' }], correctOptionId: 'weak', explanation: '낮고 떨어진 다른 무늬 카드라 강한 조합으로 발전할 가능성이 적습니다.' },
    ],
  },
  'understand-position': {
    id: 'understand-position', title: '포지션 이해하기', objective: '행동 순서가 판단에 주는 영향을 이해한다.', steps: [
      { id: 'p1-position-early', type: 'position', activeGroup: 'early', title: '초반 포지션', body: '먼저 결정해야 하므로 뒤 플레이어의 행동을 알 수 없습니다.' },
      { id: 'p1-position-middle', type: 'position', activeGroup: 'middle', title: '중간 포지션', body: '일부 행동을 확인했지만 뒤에 남은 플레이어도 있습니다.' },
      { id: 'p1-position-late', type: 'position', activeGroup: 'late', title: '후반 포지션', body: '앞선 플레이어의 결정을 더 많이 본 뒤 행동합니다.' },
      { id: 'p1-position-information', type: 'single-choice', prompt: `${condition}\n어느 포지션이 보통 더 많은 정보를 가지고 행동할까요?`, options: [{ id: 'early', label: '초반 포지션' }, { id: 'late', label: '후반 포지션' }], correctOptionId: 'late', explanation: '뒤에서 행동할수록 앞선 선택을 더 많이 봅니다. 그래서 같은 패도 후반에서 활용 범위가 넓어질 수 있습니다.' },
      { id: 'p1-position-caution', type: 'explanation', title: '초반에서는 더 신중하게', body: '초반 포지션은 뒤에 여러 사람이 남아 있어 더 강하고 좁은 시작 패 범위를 선택합니다.' },
    ],
  },
  'same-hand-different-position': {
    id: 'same-hand-different-position', title: '같은 패, 다른 포지션', objective: '같은 카드라도 포지션에 따라 판단이 달라짐을 이해한다.', steps: [
      { id: 'p1-same-j9-early', type: 'position', activeGroup: 'early', title: 'J♠ 9♥ · 초반', body: `${condition}. 뒤에 많은 플레이어가 남아 있어 입문 범위에서는 폴드합니다.` },
      { id: 'p1-same-j9-late', type: 'position', activeGroup: 'late', title: 'J♠ 9♥ · 후반', body: `${condition}. 앞선 모두가 폴드했다면 입문 범위에서 오픈 레이즈할 수 있습니다.` },
      { id: 'p1-same-a9-early', type: 'position', activeGroup: 'early', title: 'A♣ 9♦ · 초반', body: `${condition}. 약한 키커와 남은 인원을 고려해 입문 범위에서는 폴드합니다.` },
      { id: 'p1-same-a9-late', type: 'position', activeGroup: 'late', title: 'A♣ 9♦ · 후반', body: `${condition}. 늦은 순서의 정보 이점 덕분에 플레이 가능 범위가 넓어집니다.` },
      { id: 'p1-same-summary', type: 'summary', title: '핵심 정리', body: '후반이라고 아무 카드나 플레이하는 것은 아니지만, 같은 핸드의 활용 범위는 넓어질 수 있습니다.', bullets: ['초반은 더 신중하게', '후반은 더 많은 정보를 보고 결정', '플레이는 승리 보장이 아니라 오픈 레이즈할 가치가 있다는 뜻'] },
    ],
  },
  'starting-hand-challenge': {
    id: 'starting-hand-challenge', title: '시작 패 종합 도전', objective: '카드 특징과 포지션을 함께 보고 첫 행동을 고른다.', passingPercentage: 80, steps: [
      { id: 'p1-challenge-aks', type: 'single-choice', prompt: `${condition}\nA♠ K♠ · 초반에서 첫 행동은?`, options: actions, correctOptionId: 'raise', explanation: 'AKs는 높은 카드·수딧·커넥티드 특징을 가진 강한 패라 초반에서도 오픈 레이즈합니다.' },
      { id: 'p1-challenge-72o', type: 'single-choice', prompt: `${condition}\n7♣ 2♦ · 후반에서 첫 행동은?`, options: actions, correctOptionId: 'fold', explanation: '후반 포지션이어도 72o는 강점이 너무 적어 폴드합니다. 포지션이 모든 약한 패를 플레이하게 만들지는 않습니다.' },
      { id: 'p1-challenge-j9-early', type: 'single-choice', prompt: `${condition}\nJ♠ 9♥ · 초반에서 첫 행동은?`, options: actions, correctOptionId: 'fold', explanation: '초반에는 뒤에 남은 플레이어가 많아 입문 범위를 좁게 잡고 J9o를 폴드합니다.' },
      { id: 'p1-challenge-j9-late', type: 'single-choice', prompt: `${condition}\nJ♠ 9♥ · 후반에서 첫 행동은?`, options: actions, correctOptionId: 'raise', explanation: '앞선 플레이어가 모두 폴드한 후반이라 입문 범위에서는 오픈 레이즈할 수 있습니다. 플레이가 항상 이긴다는 뜻은 아닙니다.' },
      { id: 'p1-challenge-99', type: 'single-choice', prompt: `${condition}\n9♣ 9♦ · 중간에서 첫 행동은?`, options: actions, correctOptionId: 'raise', explanation: '99는 이미 원 페어인 탄탄한 포켓 페어라 중간 포지션에서 오픈 레이즈할 가치가 있습니다.' },
    ],
  },
}

export const part1: PartDefinition = {
  id: 'part-1', order: 1, title: '시작 패의 가치 판단하기', description: '카드 특징과 포지션을 함께 보고 첫 결정을 연습합니다.',
  lessonIds: ['hand-notation', 'hand-properties', 'identify-properties', 'compare-hands', 'classify-strength', 'understand-position', 'same-hand-different-position', 'starting-hand-challenge'],
}
