# 코드 해설

이 문서는 구현 결과만 보여주는 대신, 프로젝트 소유자가 코드를 읽고 설명할 수 있도록 각 단계의 역할과 데이터 흐름을 기록한다.

## 1. 프로젝트 시작점과 화면 이동

### 이번 단계가 제공하는 기능

- Vite로 만든 React·TypeScript 실행 환경
- 주소에 따라 홈 또는 404 화면을 보여주는 라우팅
- 모바일 한 열에서 시작해 데스크톱 두 열로 확장되는 기본 레이아웃
- 이후 모든 기능에서 사용할 테스트 실행 환경과 디자인 변수

### 파일별 역할

- `frontend/src/main.tsx`: HTML의 `root` 요소에 React 앱을 연결하고 전역 스타일을 불러온다.
- `frontend/src/App.tsx`: 앱 라우터를 React 화면에 연결한다.
- `frontend/src/app/router.tsx`: 주소와 Page 컴포넌트의 대응 관계를 정의한다. 실제 앱은 브라우저 라우터, 테스트는 메모리 라우터를 사용하지만 같은 route 목록을 공유한다.
- `frontend/src/pages/HomePage.tsx`: 첫 화면의 제목과 Part 0·1·2 소개를 표시한다.
- `frontend/src/pages/NotFoundPage.tsx`: 알 수 없는 주소에서 오류 설명과 홈 링크를 제공한다.
- `frontend/src/styles/tokens.css`: 색상, 간격, 둥근 모서리처럼 앱 전체가 공유하는 디자인 값을 정의한다.
- `frontend/src/styles/global.css`: 기본 배경, 타이포그래피, 카드 배치와 반응형 규칙을 정의한다.
- `frontend/src/app/router.test.tsx`: 홈과 잘못된 주소가 사용자에게 올바른 화면을 제공하는지 검증한다.

### 실행 흐름

```text
브라우저에서 앱 실행
→ main.tsx가 App을 렌더링
→ App이 RouterProvider를 연결
→ router.tsx가 현재 주소를 확인
→ 주소에 맞는 Page 컴포넌트를 렌더링
```

### 주요 선택 이유

- 실제 화면과 테스트가 같은 route 목록을 사용하므로 테스트용 주소 설정이 실제 앱과 달라질 위험을 줄인다.
- 색상과 간격을 CSS 변수로 모아두면 이후 카드와 학습 화면이 같은 시각 기준을 사용할 수 있다.
- Redux나 UI 프레임워크를 넣지 않아 React의 기본 흐름을 코드에서 직접 읽을 수 있다.

### 테스트가 막아주는 문제

- 홈 주소가 다른 화면에 연결되는 문제
- Part 0 또는 Part 1 소개가 실수로 사라지는 문제
- 잘못된 주소에서 빈 화면이 나타나 사용자가 빠져나오지 못하는 문제

### 나중에 변경할 위치

- 새 화면 주소 추가: `frontend/src/app/router.tsx`
- 홈 문구 또는 Part 소개 수정: `frontend/src/pages/HomePage.tsx`
- 전체 색상과 간격 수정: `frontend/src/styles/tokens.css`
- 공통 레이아웃과 반응형 기준 수정: `frontend/src/styles/global.css`

## 2. 학습 콘텐츠를 표현하는 타입

### 이번 단계가 제공하는 기능

- 카드, Part, Lesson, 학습 단계, 진도를 TypeScript 객체로 표현한다.
- 잘못된 Lesson 연결, 중복 ID, 없는 정답 같은 콘텐츠 작성 실수를 앱 실행 전에 찾는다.

### 핵심 파일

- `frontend/src/types/cards.ts`: 카드 숫자와 문양, 카드 한 장의 모양을 정의한다.
- `frontend/src/types/course.ts`: 설명, 테이블 공개, 단일 선택, 복수 선택, 요약 Step과 Part·Lesson 구조를 정의한다.
- `frontend/src/types/progress.ts`: 마지막 학습 위치와 점수 기록 형태를 정의한다.
- `frontend/src/content/validateCourse.ts`: 실제 콘텐츠가 타입만 맞는 것을 넘어 서로 올바르게 연결됐는지 검사한다.

### 데이터 예시

```ts
{
  id: 'sample-question',
  type: 'single-choice',
  prompt: '상대의 베팅과 같은 금액을 내는 행동은?',
  options: [
    { id: 'call', label: '콜' },
    { id: 'fold', label: '폴드' },
  ],
  correctOptionId: 'call',
  explanation: '콜은 상대의 베팅과 같은 금액을 내는 행동입니다.',
}
```

`type: 'single-choice'`를 보면 이후 학습 화면은 단일 선택 UI를 골라 표시할 수 있다. 콘텐츠는 정답과 해설만 알고 화면 이동이나 브라우저 저장 방법은 알지 못한다.

### 이 구조를 선택한 이유

- 콘텐츠와 화면 로직을 분리하면 문제를 추가할 때 React 화면 코드를 복사하지 않아도 된다.
- TypeScript의 구분 가능한 union 타입은 Step 종류마다 필요한 값을 빠뜨리지 않게 한다.
- Spring Boot를 추가할 때 이 타입들은 서버 응답 JSON과 프론트의 계약을 정하는 출발점이 된다.

### 테스트가 막아주는 문제

- 같은 Lesson ID를 두 번 사용해 진도 기록이 섞이는 문제
- 선택지에 없는 값을 정답으로 적어 어떤 답도 맞지 않는 문제
- Part가 존재하지 않는 Lesson을 가리키거나 Lesson이 비어 있는 문제

### 나중에 변경할 위치

- 새로운 카드 데이터 추가: `frontend/src/types/cards.ts`
- 새로운 학습 Step 종류 추가: `frontend/src/types/course.ts`
- 콘텐츠 연결 규칙 추가: `frontend/src/content/validateCourse.ts`

## 3. 카드와 테이블 공통 UI

- `PlayingCard.tsx`는 `{ rank, suit }` 데이터를 문양, 색, `스페이드 에이스` 같은 접근성 이름으로 바꾼다. `hidden`이면 실제 카드 값을 DOM에 노출하지 않고 카드 뒷면만 표시한다.
- `PokerTable.tsx`는 현재 단계에 따라 공개할 공용 카드 수를 `0 → 3 → 4 → 5`로 계산한다. 카드 자체를 그리는 일은 `PlayingCard`에 맡긴다.
- `ProgressBar.tsx`는 화면 표시뿐 아니라 현재값·최댓값을 보조 기술에 전달한다.
- `FeedbackPanel.tsx`는 색뿐 아니라 아이콘, 제목, 설명으로 정답 여부를 전달한다.
- CSS를 컴포넌트 동작과 분리해 카드 데이터와 공개 규칙을 읽을 때 시각 세부사항이 섞이지 않게 했다.

새 카드 표현은 `PlayingCard.tsx`, 테이블 공개 규칙은 `PokerTable.tsx`, 전체 색상은 `styles/tokens.css`에서 변경한다.

## 4. 정답 판정과 학습 세션

사용자가 선택하면 `sessionReducer`가 선택 ID를 상태에 저장하고, 선택도 브라우저 저장소에 반영한다. `정답 확인`을 누르면 `evaluateAnswer`가 선택 집합과 정답 집합을 비교하고, reducer가 정답 수와 제출한 Step ID를 기록한다. 이미 제출한 ID는 다시 집계하지 않는다. 화면은 판정 결과를 `FeedbackPanel`에 보여준 뒤에만 다음 단계 버튼을 제공한다.

정답 판정은 React 컴포넌트 밖의 순수 함수라서 화면 없이도 테스트할 수 있다. `calculateResult.ts`는 5문제 중 4문제처럼 정확히 80%인 경계값을 통과시킨다. 새로운 문제 UI는 `LearningStepRenderer.tsx`, 세션 이동 규칙은 `LearningSession.tsx`와 `sessionReducer.ts`에서 변경한다.

## 5. 진도 저장과 이어하기

`progressReducer.ts`는 메모리 안의 진도를 변경하고, `LocalProgressRepository.ts`는 그 결과를 `localStorage`에 저장한다. React 화면은 `ProgressProvider`만 사용하므로 저장 위치를 알 필요가 없다. 나중에 Spring Boot를 붙일 때는 `ProgressRepository`를 구현한 API 저장소로 교체한다.

저장된 JSON은 외부 입력이므로 TypeScript 타입 단언만 믿지 않고 버전과 필수 배열·객체를 다시 검사한다. 손상됐으면 새 진도로 복구하고 `recovered`를 통해 안내한다. `recent`는 홈의 가장 최근 학습, `resumeByPart`는 Part별 이어하기 위치를 담당한다. 문제에서 체크한 선택지는 `selectionsByStep`에 저장하므로 이전 단계로 돌아가거나 새로고침해도 복원된다.

## 6. Part 0 콘텐츠가 화면과 진도로 이어지는 과정

`content/part0.ts`에는 여섯 Lesson의 제목, 설명, 문제, 정답과 해설만 들어 있다. 예를 들어 `goal-and-cards`의 첫 Step은 `type: 'explanation'`이므로 공통 `LearningStepRenderer`가 설명 화면을 고른다. 문제 Step으로 이동하면 같은 렌더러가 선택지를 만들고, `LearningSession`이 정답 확인과 다음 Step 이동을 담당한다. 따라서 Lesson마다 별도의 React 화면을 복사하지 않는다.

주소 `/learn/part-0/goal-and-cards`를 열면 `router.tsx`가 `LearningPage`를 선택한다. 이 페이지는 주소의 ID로 Lesson 데이터를 찾고, `ProgressProvider`에서 해당 Part의 저장된 `stepIndex`를 읽어 `LearningSession`에 전달한다. 사용자가 선택·정답 확인·이전·다음으로 이동할 때 현재 선택과 이어할 위치가 브라우저 저장소에 반영된다.

콘텐츠 문구와 선택지를 바꾸려면 `frontend/src/content/part0.ts`만 수정한다. 새 문제는 해당 Lesson의 `steps` 배열에 고유한 `id`를 가진 `single-choice` 또는 `multi-choice` 객체로 추가한다. 정답 ID는 반드시 `options` 안의 ID와 같아야 하며, `part0.test.ts`와 콘텐츠 검증기가 잘못된 연결을 찾아준다.

## 7. Part 1 카드 특징과 포지션 판단

복수 특징 문제는 `multi-choice` Step의 `correctOptionIds`에 정답을 모두 적는다. 학습 엔진은 사용자가 고른 ID와 정답 ID를 정렬해 같은 집합인지 비교하므로 `A♠ K♠`에서 높은 카드·수딧·커넥티드를 모두 골라야 정답이다. 배열의 작성 순서는 판정에 영향을 주지 않는다.

포지션은 일반 포커 테이블 공개와 의미가 달라 `position` Step을 별도로 두었다. `LearningStepRenderer`가 이 타입을 만나면 `PositionDiagram`을 표시하며, 현재 그룹은 색뿐 아니라 `aria-current` 속성으로도 전달한다.

`J♠ 9♥`는 카드가 바뀌지 않은 채 초반과 후반에서 반복된다. 초반에는 뒤에 결정할 사람이 많아 폴드하지만, 모두 폴드한 후반에서는 입문 범위상 오픈 레이즈할 수 있다는 차이를 한 변수씩 비교하기 위해서다. 여기서 “플레이 가능”은 항상 이긴다는 뜻이 아니라 주어진 조건에서 오픈 레이즈할 가치가 있다는 뜻이다. 강도 분류 역시 절대 차트가 아니며 포지션·상대·스택·앞선 액션이 바뀌면 결정도 달라진다.

## 7-1. Part 2 플랍 카드 읽기

`content/part2.ts`는 여섯 Lesson의 카드 상황, 질문, 선택지, 정답과 해설을 한곳에 모은다. `card(rank, suit)`는 카드 한 장을 만들고, `flop(holeCards, communityCards, highlightedCards)`은 내 카드 두 장·플랍 세 장·정답 확인 뒤 강조할 카드를 묶는다. 이 함수는 족보를 자동 판정하지 않는다. 고정된 학습 사례의 정답은 각 문제의 `correctOptionId`에 명시되어 있어 코드를 읽으며 확인할 수 있다.

기존 선택형 문제에 선택적인 `table` 데이터를 추가했다. `LearningStepRenderer`는 `table`이 있으면 기존 `PokerTable`을 선택지 위에 보여주고, 답을 제출한 뒤에만 `highlightedCards`를 전달한다. `PokerTable`은 플랍 세 장만 받은 문제에서는 그 세 장만 표시해 작은 화면에서도 문제를 읽기 쉽게 한다. Part 0처럼 카드 다섯 장을 받은 공개 체험에서는 아직 나오지 않은 카드를 뒤집어 보여준다. 카드 설명, 정답 판정, 이전·다음 이동, 선택 복원과 브라우저 저장은 Part 0·1과 같은 코드를 사용한다.

종합 도전의 여섯 카드 상황은 앞 다섯 Lesson의 예시와 다르다. 그래서 사용자가 본 카드의 정답을 기억했는지보다 처음 보는 플랍에서 같은 판단 순서를 적용하는지 확인한다. 현재 족보는 공개된 카드로 판단할 수 있지만, 상대의 실제 카드와 승패는 알 수 없다는 점을 해설에서 분리한다. 특히 하트 세 장이 플랍에 있다면 상대가 하트 두 장을 들고 있을 때 *이미* 플러시일 수도 있다.

## 8. 홈, 목차, 결과와 이어하기의 연결

`catalog.ts`가 Part 0·1·2를 하나의 코스로 합치고 ID 조회 함수를 제공한다. 화면들은 개별 콘텐츠 파일을 직접 알지 않고 이 카탈로그에서 Part와 Lesson을 찾는다. 백엔드를 붙여도 화면과 학습 엔진은 유지하고, 카탈로그와 `ProgressRepository`의 데이터 공급 방식만 API로 바꿀 수 있다.

홈의 계속 학습하기 버튼은 `progress.recent`의 `partId`와 `lessonId`를 읽어 `/learn/{partId}/{lessonId}` 주소를 만든다. `stepIndex`는 주소에 넣지 않고 학습 화면이 `resumeByPart`에서 읽으므로 주소는 단순하게 유지된다. Part별 초기화는 카탈로그의 Lesson ID 목록을 reducer에 넘겨 해당 Part의 위치·완료·점수만 제거하고, 나머지 Part 진도는 그대로 저장한다.

## 9. 앱 전체 실행 흐름 한 번에 보기

```text
브라우저 주소
→ router.tsx가 Page 선택
→ catalog.ts에서 Part와 Lesson 조회
→ LearningPage가 저장된 stepIndex 확인
→ LearningSession이 Step 종류에 맞는 UI 표시
→ 사용자가 답 제출 또는 다음 이동
→ ProgressProvider가 reducer로 새 진도 계산
→ ProgressRepository가 localStorage에 저장
→ 홈 재방문 시 recent로 이어하기 주소 생성
```

실제 앱에서 `ProgressProvider`의 기본 `LocalProgressRepository`는 `useState`로 한 번만 생성한다. 렌더링할 때마다 새 저장소를 만들면 진도 변경 뒤 다시 `load`가 실행되는 문제가 생기기 때문이다. 테스트에서는 같은 인터페이스의 메모리 저장소를 넣어 브라우저 저장소와 분리한다.

## 10. 새 Lesson을 추가하는 순서

먼저 [커리큘럼 구현 공통 규칙](curriculum-conventions.md)을 읽고 추가·검증 체크리스트를 적용한다. 다음 순서는 데이터 등록의 요약이며, 저장·복원·화면 동작은 공통 엔진을 재사용한다.

1. `types/course.ts`에 이미 있는 Step 종류로 콘텐츠를 표현할 수 있는지 확인한다.
2. 해당 Part의 `content/part0.ts`, `part1.ts`, `part2.ts`에 고유한 Lesson·Step ID로 데이터를 추가한다.
3. 해당 Part의 `lessonIds`에 순서대로 Lesson ID를 넣는다.
4. 선택 문제의 정답 ID가 실제 선택지 ID와 같은지 확인한다.
5. 콘텐츠 테스트와 전체 카탈로그 검증을 실행한다.

새 Step 종류가 필요하면 타입 정의, `LearningStepRenderer`, 콘텐츠 검증과 렌더링 테스트를 함께 수정한다. 기존 Step으로 의미가 다른 UI를 억지로 표현하지 않는 것이 중요하다.

## 11. 카드와 테이블 UI를 수정하는 위치

Part 목록의 상단 안내 버튼은 `pages/PartPage.tsx`에서 계산한다. 진행 중인 `resumeByPart`가 있으면 그 위치로 이어한다. 없으면 최신 결과가 통과 점수 미만인 종합 도전의 재시작을 우선하고, 그다음에는 해당 Part 순서상 첫 미완료 레슨을 안내한다. 해당 Part에서 완료한 레슨이 하나도 없으면 ‘시작하기’, 일부를 완료했으면 ‘다음 레슨 시작하기’, 모두 완료했으면 ‘처음부터 복습하기’다. 다른 Part의 진도와 추가 연습 기록은 이 판단에 사용하지 않는다. 이 버튼은 기존 기록에서 이동 대상을 계산할 뿐 저장된 진도를 바꾸지 않는다.

- 카드 한 장의 숫자·문양·접근성 이름: `components/cards/PlayingCard.tsx`
- 프리플랍·플랍·턴·리버의 공개 장수: `components/table/PokerTable.tsx`
- 포지션 그룹과 현재 위치 표현: `components/table/PositionDiagram.tsx`
- 카드와 테이블 모양: 같은 폴더의 CSS와 `styles/global.css`

카드 뒷면은 실제 카드 값을 DOM 접근성 이름에 노출하지 않는다. 정답과 오답도 색만 사용하지 않고 아이콘, 제목과 설명을 함께 제공한다.

## 12. Spring Boot API로 교체할 때

유지되는 핵심 경계는 `features/progress/ProgressRepository.ts`다. 현재 `LocalProgressRepository` 대신 로그인 사용자의 진도를 HTTP로 불러오고 저장하는 `ApiProgressRepository`를 구현해 `ProgressProvider`에 전달한다. 다음 부분은 그대로 유지할 수 있다.

- `LearningSession`과 정답 판정 함수
- Part·Lesson·Step TypeScript 타입
- 화면 라우팅과 이어하기 주소
- 진도 reducer의 변경 규칙
- 학습 및 화면 컴포넌트 테스트

서버를 붙일 때는 동시 수정 충돌, 인증 만료, 네트워크 재시도와 서버 데이터 버전 마이그레이션을 새로 설계해야 한다.

## 13. 면접에서 설명할 주요 설계 선택 다섯 가지

1. 콘텐츠를 React 컴포넌트와 분리해 하나의 학습 엔진으로 20개 Lesson을 표시한 이유
2. reducer가 상태 계산을, Repository가 영속화를 맡도록 나눈 이유와 Spring Boot 교체 지점
3. 선택한 답과 확정된 점수를 분리해 저장해 새로고침 뒤 선택을 복원하면서 중복 채점을 막는 이유
4. Part 0 완료 여부와 무관하게 Part 1을 열어 둔 제품 결정과 장단점
5. Vitest의 순수 로직·컴포넌트 테스트와 Playwright의 실제 브라우저 테스트를 함께 사용한 이유

특히 Playwright는 테스트용 저장소에서는 드러나지 않았던 “기본 localStorage 저장소가 렌더마다 다시 생성되는 문제”를 발견했다. 어떤 테스트 계층이 어떤 종류의 오류를 찾았는지 설명하기 좋은 사례다.

## 14. Part 2 추가 연습의 구조

추가 연습은 기존 레슨의 문제를 바꾸는 기능이 아니다. 48개의 별도 문제 중 레슨별 4개, 종합 연습에서는 6개를 뽑아 같은 학습 화면으로 표시한다. 연습은 합격 조건이 없으며 레슨·Part 완료 기록을 변경하지 않는다.

### 문제 데이터: `content/part2Practice.ts`

각 문제는 기존 `SingleChoiceStep`에 연결 레슨인 `lessonId`, 출제 분류인 `concept`를 추가한 형태다. `questions` 함수는 직접 작성한 카드 상황을 기존 화면이 읽는 객체로 옮긴다. 예를 들어 `As`는 스페이드 A, `10h`는 하트 10이다. 같은 카드가 중복되거나 정답이 틀리지 않았는지는 콘텐츠 테스트와 카드·해설 검토로 확인한다. 족보 자동 판정이나 문제 자동 생성 기능은 아니다.

`highlighted`의 숫자는 내 카드 두 장, 공용 카드 세 장을 순서대로 합친 배열의 위치다. `[0, 2]`는 내 첫 카드와 공용 첫 카드를 강조한다. 위험 문제에서는 내 페어가 아니라 주의할 공용 카드 세 장을 강조한다.

### 출제와 저장: `features/practice/practice.ts`

1. `groups`가 확인할 개념과 개수를 정한다. 페어 위치 연습은 탑·미들·바텀·오버페어 각각 하나다. 족보 읽기는 하이 카드와 페어 각각 하나, 나머지 네 족보 중 두 종류를 고른다.
2. `createPracticeSession`은 각 개념의 후보에서 직전 회차에 없는 문제를 먼저 뽑는다. 후보가 부족하면 이전 문제를 재사용한다. 종합 연습은 하이 카드·탑페어·투 페어·셋·공용 페어·위험을 하나씩 고른다.
3. 문제와 보기 배열을 Fisher–Yates 방식으로 섞는다. 원본 콘텐츠 배열은 수정하지 않는다.
4. 출제 문제 ID와 보기 ID 순서를 저장한다. `getPracticeQuestions`는 이 저장 순서를 그대로 읽는다. 렌더링할 때 다시 뽑지 않으므로 새로고침에도 같은 문제를 보게 된다.

레슨 저장 키 `holdem-learning-progress`와 별도로 `holdem-practice-progress`를 사용한다. 레슨마다 진행 중/완료 회차 하나와 최근 완료 결과 하나만 보관한다. 선택한 답, 제출 여부와 점수를 함께 저장하며, 저장 데이터가 손상되면 안내하고 새 연습을 시작할 수 있게 한다. 저장소가 차단되면 현재 화면에서는 계속 풀 수 있지만 새로고침 복원은 보장하지 않는다는 안내를 표시한다. 레슨 진도 초기화는 이 별도 연습 기록을 지우지 않는다.

### 화면: `pages/PracticePage.tsx`

기존 `LearningSession`, `LearningStepRenderer`, 카드 테이블과 해설을 재사용한다. 문제 표시와 정답 판정은 같지만 저장소와 완료 처리는 별도다. 레슨과 추가 연습 모두 정답 확인 시 현재 문제·선택·해설을 저장한다. 다음을 눌렀을 때만 다음 위치를 저장하므로 이탈·새로고침 뒤 해설을 놓치지 않는다. 별도 `persistCurrentOnSubmit` 옵션은 제거했다.

`LearningSession`의 `sessionRef`는 문제 영역을 가리킨다. `useLayoutEffect`가 첫 표시와 `stepIndex` 변경 시 해당 영역의 시작 부분으로 스크롤한다. 카드가 화면 밖에 잘린 채 다음 문제를 시작하지 않도록 공통 처리한 것이다. 선택·제출은 같은 `stepIndex`이므로 강제로 위로 움직이지 않는다. 단위 테스트 환경인 jsdom에는 실제 스크롤이 없어서 테스트 환경에서만 대체하고, 모바일·데스크톱 브라우저 테스트에서 실제 카드 위치를 검증한다.

연습 시작 화면의 별도 안내 박스는 제거하고 상단 소개 영역에 시작·이어하기·새 문제 버튼을 배치했다. 연습 잠시 나가기 없이 상단 돌아가기 링크로 이탈하며 자동 저장한 위치를 유지한다. 완료 직후의 점수·틀린 문제 결과 박스는 유지한다.

새 연습 시작만 새 문제를 뽑는다. 진행 중 회차를 교체할 때는 확인창을 보여준다. 완료 후에는 틀린 문제의 실제 카드·내 선택·정답·해설을 다시 볼 수 있다. 상단 돌아가기는 해당 Part 목록으로 이동하며 기존 레슨 이어하기 위치를 변경하지 않는다.

### Part 1 확장: 같은 화면, 다른 문제 풀

`content/part1Practice.ts`에는 38개 문제(특징·비교·강도 각 9개, 포지션 11개)를 작성했다. 별도 화면을 만들지 않고 기존 단일/복수 선택 Step을 사용한다. `hands`에는 이름과 두 장의 카드를 담아 공통 `PlayingCard`로 표시하며, 비교는 패 A·패 B를 나란히 보여준다. `position`이 있으면 기존 `PositionDiagram`도 보여준다. 패 A가 항상 정답이 되지 않도록 비교 카드 배치를 나눴고, 보기 순서는 회차마다 섞어 저장한다.

강도 문제는 사람마다 경계가 달라질 수 있는 네 등급 대신, 해당 카드에서 명확하게 대비되는 두 설명을 고르게 한다. 특징 문제는 여러 정답을 가진 `MultiChoiceStep`이다. 저장 검사에서 단일 선택은 최대 하나, 복수 선택은 여러 개를 허용하되 중복 ID와 없는 ID는 거부한다. 결과 화면에서도 `correctOptionIds`와 실제 선택 ID 전체를 읽어 모든 답을 표시한다.

`practice.ts`는 Part 1·2의 문제 풀을 합치되, `belongsToPractice`가 일반 연습은 해당 레슨, 종합은 같은 Part의 문제로 한정한다. `getPracticePart`는 등록된 연습만 카탈로그의 소속 Part와 연결한다. 목록 링크·레슨 결과·연습 주소 검사·상단 돌아가기에서 이 함수를 함께 사용하므로 Part 2 전용 조건을 페이지마다 복사하지 않는다.

Part 1 종합은 특징·비교·강도 각 하나와 포지션 세 종류를 하나씩 뽑는다. 강한 패는 초반에서도 참여하고, 약한 패는 후반에서도 폴드할 수 있음을 빠뜨리지 않기 위한 구성이다. 일반 연습은 4문제, 종합은 6문제이며 직전 회차에 없는 문제를 우선한다. 기존 Part 2의 문제 ID·보기 ID·저장 버전 1은 바꾸지 않아 저장된 회차를 유지한다. 기존 레슨 내용과 진도 저장 규칙도 바꾸지 않았다.

완료 직후에는 결과 화면을 보여주지만, 목록에서 다시 들어오거나 완료 후 새로고침하면 시작 화면을 보여준다. `showResult`는 브라우저에 저장하지 않는 화면 상태이고, `completed`는 보관하는 완료 기록이다. 두 값을 분리해 완료 기록을 지우지 않고도 새로운 연습을 시작할 수 있게 했다. 시작 화면에는 ‘최근 완료 결과 보기’를 표시하지 않으며, 진행 중인 회차의 이어하기는 기존대로 유지한다. 레슨 학습·레슨 결과·Part 결과 화면의 상단 ‘레슨 목록’ 링크는 해당 Part 목록으로 이동한다.

현재 저장 버전은 1이다. 앞으로 문제 ID·보기 ID·정답 의미를 바꾸는 경우에는 저장 버전 갱신 또는 마이그레이션이 필요하다. 단순히 문장을 다듬는 경우와 구분해야 한다. 서버 저장이 필요해지면 연습 저장 함수도 API 호출로 교체해야 하며, 기존 레슨 저장소만 교체한다고 연습까지 서버에 저장되지는 않는다.

## 15. 학습 상태와 다음 커리큘럼의 공통 기준

홈은 해당 Part의 완료 기록뿐 아니라 `resumeByPart`도 확인한다. 완료 레슨이 0개여도 이어할 위치가 있으면 ‘학습 중’이며 처음 방문한 Part만 ‘미시작’이다.

목록의 각 행은 진행 중 위치 → 미통과 도전 → 완료 → 미시작 순서로 상태를 고른다. 미통과 여부는 레슨의 `passingPercentage`와 최신 결과를 사용하므로 새 도전에도 적용된다. 도전 실패를 끝까지 풀었다는 이유로 ‘완료 / 복습하기’로 표시하지 않고 ‘재도전 필요 / 다시 풀기’로 표시한다. 복습·재도전을 진행 중이면 해당 행의 이어하기 주소에도 `?restart=1`을 붙이지 않아 현재 해설을 복원한다.

`LearningPage`는 복습·재도전 주소의 `restart=1`을 한 번만 적용한다. 첫 단계의 빈 시도를 저장하고 주소에서 그 표시만 제거한다. 주소에 표시를 계속 남겨 두면 저장이 정상이어도 새로고침마다 저장 위치를 무시하고 처음으로 돌아가기 때문이다. `consumedRestart`에는 처리한 화면 방문의 `location.key`를 기록한다. 실제 브라우저에서 주소 교체가 끝나기 전에 저장으로 다시 렌더링되더라도 같은 방문을 반복 초기화하지 않도록 하는 장치다. 다른 주소 옵션은 보존하고 브라우저 기록은 교체해 불필요한 이력을 늘리지 않는다.

[커리큘럼 구현 공통 규칙](curriculum-conventions.md)에 현재 정책, 등록 위치와 사용자 흐름 체크리스트를 모았다. 루트 `AGENTS.md`는 앞으로 작업할 때 이 문서를 먼저 읽도록 안내한다. 따라서 다음 Part를 만들 때 이번 수정의 기억에 의존하지 않고 문서와 회귀 테스트를 기준으로 구현할 수 있다.
