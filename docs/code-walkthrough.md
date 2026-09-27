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
- `frontend/src/pages/HomePage.tsx`: 첫 화면의 제목과 Part 0·1 소개를 표시한다.
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

사용자가 선택하면 `sessionReducer`가 선택 ID를 상태에 저장한다. `정답 확인`을 누르면 `evaluateAnswer`가 선택 집합과 정답 집합을 비교하고, reducer가 정답 수와 제출한 Step ID를 기록한다. 이미 제출한 ID는 다시 집계하지 않는다. 화면은 판정 결과를 `FeedbackPanel`에 보여준 뒤에만 다음 단계 버튼을 제공한다.

정답 판정은 React 컴포넌트 밖의 순수 함수라서 화면 없이도 테스트할 수 있다. `calculateResult.ts`는 5문제 중 4문제처럼 정확히 80%인 경계값을 통과시킨다. 새로운 문제 UI는 `LearningStepRenderer.tsx`, 세션 이동 규칙은 `LearningSession.tsx`와 `sessionReducer.ts`에서 변경한다.

## 5. 진도 저장과 이어하기

`progressReducer.ts`는 메모리 안의 진도를 변경하고, `LocalProgressRepository.ts`는 그 결과를 `localStorage`에 저장한다. React 화면은 `ProgressProvider`만 사용하므로 저장 위치를 알 필요가 없다. 나중에 Spring Boot를 붙일 때는 `ProgressRepository`를 구현한 API 저장소로 교체한다.

저장된 JSON은 외부 입력이므로 TypeScript 타입 단언만 믿지 않고 버전과 필수 배열·객체를 다시 검사한다. 손상됐으면 새 진도로 복구하고 `recovered`를 통해 안내한다. `recent`는 홈의 가장 최근 학습, `resumeByPart`는 Part별 이어하기 위치를 담당하므로 Part 1을 둘러봐도 Part 0 위치가 사라지지 않는다.

## 6. Part 0 콘텐츠가 화면과 진도로 이어지는 과정

`content/part0.ts`에는 여섯 Lesson의 제목, 설명, 문제, 정답과 해설만 들어 있다. 예를 들어 `goal-and-cards`의 첫 Step은 `type: 'explanation'`이므로 공통 `LearningStepRenderer`가 설명 화면을 고른다. 문제 Step으로 이동하면 같은 렌더러가 선택지를 만들고, `LearningSession`이 정답 확인과 다음 Step 이동을 담당한다. 따라서 Lesson마다 별도의 React 화면을 복사하지 않는다.

주소 `/learn/part-0/goal-and-cards`를 열면 `router.tsx`가 `LearningPage`를 선택한다. 이 페이지는 주소의 ID로 Lesson 데이터를 찾고, `ProgressProvider`에서 해당 Part의 저장된 `stepIndex`를 읽어 `LearningSession`에 전달한다. 사용자가 정답을 확인하거나 다음으로 이동한 확정 시점에는 `confirmStep`이 호출되어 브라우저 저장소에 이어할 위치가 기록된다.

콘텐츠 문구와 선택지를 바꾸려면 `frontend/src/content/part0.ts`만 수정한다. 새 문제는 해당 Lesson의 `steps` 배열에 고유한 `id`를 가진 `single-choice` 또는 `multi-choice` 객체로 추가한다. 정답 ID는 반드시 `options` 안의 ID와 같아야 하며, `part0.test.ts`와 콘텐츠 검증기가 잘못된 연결을 찾아준다.

## 7. Part 1 카드 특징과 포지션 판단

복수 특징 문제는 `multi-choice` Step의 `correctOptionIds`에 정답을 모두 적는다. 학습 엔진은 사용자가 고른 ID와 정답 ID를 정렬해 같은 집합인지 비교하므로 `A♠ K♠`에서 높은 카드·수딧·커넥티드를 모두 골라야 정답이다. 배열의 작성 순서는 판정에 영향을 주지 않는다.

포지션은 일반 포커 테이블 공개와 의미가 달라 `position` Step을 별도로 두었다. `LearningStepRenderer`가 이 타입을 만나면 `PositionDiagram`을 표시하며, 현재 그룹은 색뿐 아니라 `aria-current` 속성으로도 전달한다.

`J♠ 9♥`는 카드가 바뀌지 않은 채 초반과 후반에서 반복된다. 초반에는 뒤에 결정할 사람이 많아 폴드하지만, 모두 폴드한 후반에서는 입문 범위상 오픈 레이즈할 수 있다는 차이를 한 변수씩 비교하기 위해서다. 여기서 “플레이 가능”은 항상 이긴다는 뜻이 아니라 주어진 조건에서 오픈 레이즈할 가치가 있다는 뜻이다. 강도 분류 역시 절대 차트가 아니며 포지션·상대·스택·앞선 액션이 바뀌면 결정도 달라진다.

## 8. 홈, 목차, 결과와 이어하기의 연결

`catalog.ts`가 Part 0과 Part 1을 하나의 코스로 합치고 ID 조회 함수를 제공한다. 화면들은 개별 콘텐츠 파일을 직접 알지 않고 이 카탈로그에서 Part와 Lesson을 찾는다. 백엔드를 붙여도 화면과 학습 엔진은 유지하고, 카탈로그와 `ProgressRepository`의 데이터 공급 방식만 API로 바꿀 수 있다.

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

1. `types/course.ts`에 이미 있는 Step 종류로 콘텐츠를 표현할 수 있는지 확인한다.
2. `content/part0.ts` 또는 `content/part1.ts`에 고유한 Lesson·Step ID로 데이터를 추가한다.
3. 해당 Part의 `lessonIds`에 순서대로 Lesson ID를 넣는다.
4. 선택 문제의 정답 ID가 실제 선택지 ID와 같은지 확인한다.
5. 콘텐츠 테스트와 전체 카탈로그 검증을 실행한다.

새 Step 종류가 필요하면 타입 정의, `LearningStepRenderer`, 콘텐츠 검증과 렌더링 테스트를 함께 수정한다. 기존 Step으로 의미가 다른 UI를 억지로 표현하지 않는 것이 중요하다.

## 11. 카드와 테이블 UI를 수정하는 위치

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

1. 콘텐츠를 React 컴포넌트와 분리해 하나의 학습 엔진으로 14개 Lesson을 표시한 이유
2. reducer가 상태 계산을, Repository가 영속화를 맡도록 나눈 이유와 Spring Boot 교체 지점
3. 사용자가 답을 선택한 순간이 아니라 확정한 순간의 다음 Step을 저장하는 이유
4. Part 0 완료 여부와 무관하게 Part 1을 열어 둔 제품 결정과 장단점
5. Vitest의 순수 로직·컴포넌트 테스트와 Playwright의 실제 브라우저 테스트를 함께 사용한 이유

특히 Playwright는 테스트용 저장소에서는 드러나지 않았던 “기본 localStorage 저장소가 렌더마다 다시 생성되는 문제”를 발견했다. 어떤 테스트 계층이 어떤 종류의 오류를 찾았는지 설명하기 좋은 사례다.
