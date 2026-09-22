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
