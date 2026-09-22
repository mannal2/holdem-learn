# 홀덤 학습 MVP React 구현 계획

> **에이전트 작업자용:** 이 계획을 작업별로 실행할 때 `superpowers:subagent-driven-development`(권장) 또는 `superpowers:executing-plans`를 반드시 사용한다. 모든 단계는 진행 상태를 표시할 수 있도록 체크박스로 작성되어 있다.

**목표:** 모바일 우선 반응형 React 앱에서 Part 0과 Part 1을 학습하고, 중단한 위치에서 이어서 시작할 수 있는 홀덤 입문 MVP를 만든다.

**구조:** 저장소 루트에는 공통 문서를 두고 React 앱은 `frontend/`에 둔다. 학습 콘텐츠, 학습 로직, 진도 저장, 화면을 서로 분리하며 화면은 `ProgressRepository` 인터페이스를 통해서만 진도를 저장한다. 첫 구현은 브라우저 저장소를 사용하지만 같은 화면 코드에 Spring Boot API 저장소를 나중에 연결할 수 있게 한다.

**기술:** React, TypeScript, Vite, React Router, React Context와 `useReducer`, 일반 CSS, Vitest, React Testing Library, Playwright

**Spec:** `docs/superpowers/specs/2026-09-22-holdem-learning-mvp-design.md`

## 전체 제약 조건

- 이번 계획은 React 프론트엔드만 구현한다. Spring Boot, 데이터베이스, 로그인은 포함하지 않는다.
- React 앱은 `frontend/`에 생성해 이후 저장소 루트에 `backend/`를 추가할 수 있게 한다.
- 모바일을 우선 설계하고 데스크톱에서도 같은 기능을 자연스럽게 제공한다.
- Part 0을 먼저 권장하지만 Part 1은 잠그지 않는다.
- Part 1의 포지션 판단은 6인 테이블, 약 100BB 유효 스택, 앞선 플레이어가 모두 폴드한 미개봉 팟을 기준으로 하며 `플레이`는 오픈 레이즈를 뜻한다.
- 일반 Lesson은 결과 화면에 도달하면 완료한다.
- 각 Part의 마지막 도전은 정답률 80% 이상일 때 Part 완료로 처리한다.
- 진도는 확정된 행동 뒤에만 저장하며 답을 선택만 한 상태는 저장하지 않는다.
- React 컴포넌트는 `localStorage`를 직접 호출하지 않는다.
- Redux, 서버 상태 라이브러리, UI 프레임워크를 추가하지 않는다.
- 카드와 정답 상태는 색상만으로 의미를 전달하지 않는다.
- 각 작업이 끝날 때 관련 내용을 `docs/code-walkthrough.md`에 한국어로 기록하고 사용자 설명 시점으로 삼는다.
- 현재 확인된 개발 환경은 Node.js `v24.18.0`, npm `11.16.0`이다.

## 중점 검토 항목

1. **손상되거나 이전 버전인 브라우저 진도:** 앱이 멈추지 않고 초기 상태로 복구한 뒤 사용자에게 안내해야 한다. Task 5 저장소 테스트에서 검증한다.
2. **이어하기 위치의 한 칸 차이 오류:** 제출을 마친 문제는 다시 집계하지 않고 다음 미완료 단계에서 재개해야 한다. Task 5 진도 계산 테스트와 Task 8 통합 테스트에서 검증한다.
3. **Part 0을 하지 않은 사용자의 Part 1 직접 접근:** Part 1을 막지 않고 정상적으로 시작해야 한다. Task 8 라우팅 테스트에서 검증한다.
4. **80% 경계값:** 5문제 중 4문제는 통과하고 3문제는 실패해야 한다. Task 4 결과 계산 테스트에서 검증한다.
5. **같은 답의 중복 제출:** 빠른 연속 클릭이나 새로고침으로 정답 수와 응답 수가 두 번 증가하지 않아야 한다. Task 4 학습 세션 테스트와 Task 8 전체 흐름 테스트에서 검증한다.

---

### Task 1: React 프로젝트와 화면 이동 기반

**파일:**

- 생성: `frontend/` Vite React TypeScript 프로젝트
- 수정: `frontend/package.json`
- 수정: `frontend/src/main.tsx`
- 수정: `frontend/src/App.tsx`
- 생성: `frontend/src/app/router.tsx`
- 생성: `frontend/src/pages/HomePage.tsx`
- 생성: `frontend/src/pages/NotFoundPage.tsx`
- 생성: `frontend/src/styles/tokens.css`
- 생성: `frontend/src/styles/global.css`
- 생성: `frontend/src/test/setup.ts`
- 생성: `frontend/src/app/router.test.tsx`
- 생성: `docs/code-walkthrough.md`

**인터페이스:**

- 제공: `createAppRouter(initialEntries?: string[]): Router`
- 제공: 모바일 우선 전역 색상·간격·글꼴·최대 너비 CSS 변수
- 이후 작업이 의존: `RouterProvider`, 전역 스타일, Vitest 설정

- [ ] **Step 1: React 프로젝트를 `frontend/`에 생성한다**

실행:

```powershell
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install react-router-dom
npm install --save-dev vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

예상 결과: `frontend/src/main.tsx`가 존재하고 `npm run dev`로 기본 Vite 화면을 실행할 수 있다.

- [ ] **Step 2: 테스트 스크립트와 브라우저 테스트 환경을 설정한다**

`frontend/package.json`의 `scripts`를 다음 의미로 맞춘다.

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "test": "vitest run",
  "test:watch": "vitest",
  "preview": "vite preview"
}
```

`frontend/vite.config.ts`에 다음 테스트 설정을 추가한다.

설정 파일의 `defineConfig`는 테스트 타입을 함께 읽을 수 있도록 `vitest/config`에서 가져오고, Vite 기본 React 플러그인은 그대로 유지한다.

```ts
test: {
  environment: 'jsdom',
  setupFiles: './src/test/setup.ts',
  css: true,
}
```

`frontend/src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 3: 홈과 잘못된 주소에 대한 실패 테스트를 작성한다**

`frontend/src/app/router.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { RouterProvider } from 'react-router-dom';
import { createAppRouter } from './router';

it('홈에서 두 학습 Part를 안내한다', async () => {
  render(<RouterProvider router={createAppRouter(['/'])} />);

  expect(await screen.findByRole('heading', { name: '홀덤을 판단하는 법부터 배워요' })).toBeInTheDocument();
  expect(screen.getByText('Part 0')).toBeInTheDocument();
  expect(screen.getByText('Part 1')).toBeInTheDocument();
});

it('잘못된 주소에서 홈으로 돌아갈 수 있다', async () => {
  render(<RouterProvider router={createAppRouter(['/없는-주소'])} />);

  expect(await screen.findByRole('heading', { name: '페이지를 찾을 수 없어요' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: '홈으로 돌아가기' })).toHaveAttribute('href', '/');
});
```

- [ ] **Step 4: 테스트가 실패하는지 확인한다**

실행:

```powershell
cd frontend
npm test -- src/app/router.test.tsx
```

예상 결과: `createAppRouter`와 화면이 아직 없어 실패한다.

- [ ] **Step 5: 최소 라우터와 화면을 구현한다**

`createBrowserRouter`는 실제 앱에서, `createMemoryRouter`는 테스트에서 사용한다. 두 생성 경로는 같은 route 배열을 공유한다.

```tsx
export const routes: RouteObject[] = [
  { path: '/', element: <HomePage /> },
  { path: '*', element: <NotFoundPage /> },
];

export function createAppRouter(initialEntries?: string[]) {
  return initialEntries
    ? createMemoryRouter(routes, { initialEntries })
    : createBrowserRouter(routes);
}
```

홈에는 제목과 Part 0·1 소개 카드를 표시하고, 잘못된 주소 화면에는 홈 링크를 제공한다.

- [ ] **Step 6: 디자인 토큰과 모바일 기본 레이아웃을 적용한다**

`tokens.css`에 아래 범주의 변수를 실제 값으로 정의한다.

```css
:root {
  --color-felt-950: #082c23;
  --color-felt-800: #0f513f;
  --color-felt-600: #18745a;
  --color-surface: #fffdf7;
  --color-surface-muted: #f3f0e8;
  --color-text: #17211d;
  --color-text-muted: #5d6a64;
  --color-danger: #a33232;
  --color-success: #176b4d;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --radius-card: 1rem;
  --content-max: 70rem;
}
```

`global.css`에서 `box-sizing`, 기본 글꼴, 배경, 링크, 버튼, 포커스 표시, 최대 콘텐츠 폭을 정의한다.

- [ ] **Step 7: 테스트와 빌드를 확인한다**

실행:

```powershell
cd frontend
npm test -- src/app/router.test.tsx
npm run build
```

예상 결과: 라우터 테스트와 TypeScript/Vite 빌드가 성공한다.

- [ ] **Step 8: 코드 해설 문서에 프로젝트 입구를 설명한다**

`docs/code-walkthrough.md`에 다음 제목과 내용을 작성한다.

```markdown
# 코드 해설

## 1. 프로젝트 시작점과 화면 이동

- `frontend/src/main.tsx`: React 앱을 브라우저에 연결한다.
- `frontend/src/app/router.tsx`: 주소와 화면의 대응 관계를 정의한다.
- `frontend/src/styles/tokens.css`: 앱 전체에서 재사용하는 색상과 간격 값을 정의한다.
- 실행 흐름: 브라우저 주소 → 라우터 → Page 컴포넌트 → 화면 출력.
```

- [ ] **Step 9: 작업 단위를 커밋한다**

```powershell
git add frontend docs/code-walkthrough.md
git commit -m "feat: scaffold holdem learning frontend"
```

**설명 중단점:** 프로젝트가 어디에서 시작되고 주소가 어떻게 화면으로 바뀌는지 사용자에게 설명한 뒤 다음 Task로 이동한다.

---

### Task 2: 학습 콘텐츠 타입과 검증기

**파일:**

- 생성: `frontend/src/types/cards.ts`
- 생성: `frontend/src/types/course.ts`
- 생성: `frontend/src/types/progress.ts`
- 생성: `frontend/src/content/validateCourse.ts`
- 생성: `frontend/src/content/validateCourse.test.ts`
- 생성: `frontend/src/test/courseFixtures.ts`
- 수정: `docs/code-walkthrough.md`

**인터페이스:**

- 제공: `CardRank`, `CardSuit`, `PlayingCard`
- 제공: `LearningStep`, `LessonDefinition`, `PartDefinition`, `CourseCatalog`
- 제공: `LearningProgress`, `LessonResult`, `ResumePoint`
- 제공: `validateCourse(catalog: CourseCatalog): string[]`
- 제공: 테스트용 `validCatalog`, `catalogFixture`, `makeCatalog`, `makeCatalogWithDuplicateLessonId`, `makeCatalogWithMissingCorrectOption`
- 이후 작업이 의존: 모든 콘텐츠, 학습 엔진, 진도 저장소

- [ ] **Step 1: 카드와 학습 단계 타입을 정의하는 실패 테스트를 작성한다**

`validateCourse.test.ts`에서 실제 객체를 생성하고 다음 세 경우를 검증한다.

```ts
it('정상적인 코스는 오류가 없다', () => {
  expect(validateCourse(validCatalog)).toEqual([]);
});

it('중복된 Lesson 식별자를 찾는다', () => {
  const catalog = makeCatalogWithDuplicateLessonId('shared-lesson');
  expect(validateCourse(catalog)).toContain('중복된 Lesson ID: shared-lesson');
});

it('선택형 문제의 정답이 선택지에 없으면 오류를 반환한다', () => {
  const catalog = makeCatalogWithMissingCorrectOption();
  expect(validateCourse(catalog)).toContain('Step sample-question의 정답 missing은 선택지에 없습니다.');
});
```

위 테스트 도우미는 `frontend/src/test/courseFixtures.ts`에 작성한다. `validCatalog`와 `catalogFixture`는 Part 하나, Lesson 하나, 단일 선택 Step 하나를 가진 완전한 객체다. `makeCatalog`는 전달받은 Part와 Lesson 목록을 `CourseCatalog`로 묶는다. 나머지 두 함수는 `structuredClone(validCatalog)`로 복사한 뒤 각각 중복 ID와 존재하지 않는 정답 ID만 변경한다.

- [ ] **Step 2: 검증 테스트가 실패하는지 확인한다**

```powershell
cd frontend
npm test -- src/content/validateCourse.test.ts
```

예상 결과: 타입과 `validateCourse`가 없어 실패한다.

- [ ] **Step 3: 최소 도메인 타입을 구현한다**

`cards.ts`:

```ts
export type CardRank = 'A' | 'K' | 'Q' | 'J' | '10' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2';
export type CardSuit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export interface PlayingCard { rank: CardRank; suit: CardSuit }
```

`course.ts`의 공개 타입:

```ts
export type LearningStep =
  | ExplanationStep
  | TableRevealStep
  | SingleChoiceStep
  | MultiChoiceStep
  | SummaryStep;

export interface LessonDefinition {
  id: string;
  title: string;
  objective: string;
  steps: LearningStep[];
  passingPercentage?: number;
}

export interface PartDefinition {
  id: string;
  order: number;
  title: string;
  description: string;
  lessonIds: string[];
}

export interface CourseCatalog {
  parts: PartDefinition[];
  lessons: Record<string, LessonDefinition>;
}
```

각 Step은 공통 `id`와 구분용 `type`을 가진다. 단일 선택에는 `options`, `correctOptionId`, `explanation`이 있고 복수 선택에는 `correctOptionIds`가 있다. 하나의 `TableRevealStep`은 개인 카드, 전체 공용 카드, 현재 `stage` 하나를 가진다. 프리플랍부터 쇼다운까지의 공개 체험은 같은 카드 데이터를 사용하는 다섯 Step을 Lesson에 순서대로 배치해 표현한다.

`progress.ts`:

```ts
export interface ResumePoint {
  partId: string;
  lessonId: string;
  stepIndex: number;
}

export interface LessonResult {
  answered: number;
  correct: number;
  bestPercentage: number;
  attempts: number;
}

export interface LearningProgress {
  version: 1;
  recent: ResumePoint | null;
  resumeByPart: Record<string, ResumePoint>;
  completedLessonIds: string[];
  completedPartIds: string[];
  lessonResults: Record<string, LessonResult>;
}
```

- [ ] **Step 4: 콘텐츠 검증기를 구현한다**

`validateCourse`는 다음 오류를 모두 문자열 배열로 반환한다.

- Part ID 중복
- Lesson ID 중복 또는 `lessons` 키와 내부 ID 불일치
- Part가 존재하지 않는 Lesson ID를 참조
- Lesson에 Step이 없음
- 코스 전체에서 Step ID 중복
- 단일·복수 선택 문제의 정답이 선택지에 없음
- 최종 도전의 통과 기준이 0보다 크고 100 이하가 아님

- [ ] **Step 5: 검증 테스트와 전체 테스트를 실행한다**

```powershell
cd frontend
npm test -- src/content/validateCourse.test.ts
npm test
```

예상 결과: 모든 검증 테스트가 성공한다.

- [ ] **Step 6: 코드 해설 문서에 타입의 역할을 기록한다**

다음 내용을 한국어로 추가한다.

- 타입은 콘텐츠 작성 실수를 실행 전에 막는다.
- `LearningStep`의 `type` 값이 어떤 화면을 고르는지 설명한다.
- 콘텐츠와 화면 로직을 분리한 이유를 설명한다.
- Spring Boot가 추가되면 이 타입이 API 응답 계약의 출발점이 된다는 점을 설명한다.

- [ ] **Step 7: 커밋한다**

```powershell
git add frontend/src/types frontend/src/content docs/code-walkthrough.md
git commit -m "feat: define typed learning content model"
```

**설명 중단점:** 실제 카드 한 장과 선택 문제 하나가 TypeScript 타입으로 어떻게 표현되는지 사용자에게 설명한다.

---

### Task 3: 카드·테이블·진행률 공통 UI

**파일:**

- 생성: `frontend/src/components/cards/PlayingCard.tsx`
- 생성: `frontend/src/components/cards/PlayingCard.test.tsx`
- 생성: `frontend/src/components/cards/playing-card.css`
- 생성: `frontend/src/test/cardFixtures.ts`
- 생성: `frontend/src/components/table/PokerTable.tsx`
- 생성: `frontend/src/components/table/PokerTable.test.tsx`
- 생성: `frontend/src/components/table/poker-table.css`
- 생성: `frontend/src/components/learning/ProgressBar.tsx`
- 생성: `frontend/src/components/learning/FeedbackPanel.tsx`
- 생성: `frontend/src/components/learning/learning-ui.css`
- 수정: `docs/code-walkthrough.md`

**인터페이스:**

- 소비: `PlayingCard`, 테이블 공개 장면 데이터
- 제공: `<PlayingCard card hidden? />`
- 제공: `<PokerTable holeCards communityCards stage activePosition? />`
- 제공: `<ProgressBar current total label />`
- 제공: `<FeedbackPanel status title explanation />`
- 제공: 테스트용 `aceSpades`, `kingHearts`, `sevenClubs`, `jackDiamonds`, `twoSpades`, `queenClubs`, `tenHearts`

- [ ] **Step 1: 카드 접근성 실패 테스트를 작성한다**

```tsx
it('스페이드 에이스의 숫자와 접근성 이름을 표시한다', () => {
  render(<PlayingCard card={{ rank: 'A', suit: 'spades' }} />);
  expect(screen.getByLabelText('스페이드 에이스')).toBeInTheDocument();
  expect(screen.getByText('A')).toBeInTheDocument();
  expect(screen.getByText('♠')).toBeInTheDocument();
});

it('뒤집힌 카드는 실제 값을 노출하지 않는다', () => {
  render(<PlayingCard card={{ rank: 'A', suit: 'spades' }} hidden />);
  expect(screen.getByLabelText('뒤집힌 카드')).toBeInTheDocument();
  expect(screen.queryByLabelText('스페이드 에이스')).not.toBeInTheDocument();
});
```

테스트에 사용하는 카드는 `frontend/src/test/cardFixtures.ts`에서 `PlayingCard` 타입의 상수로 정의한다.

- [ ] **Step 2: 테이블 공개 실패 테스트를 작성한다**

```tsx
it('플랍에서는 공용 카드 세 장만 공개한다', () => {
  render(
    <PokerTable
      stage="flop"
      holeCards={[aceSpades, kingHearts]}
      communityCards={[sevenClubs, jackDiamonds, twoSpades, queenClubs, tenHearts]}
    />,
  );
  expect(screen.getAllByTestId('community-card')).toHaveLength(5);
  expect(screen.getAllByLabelText('뒤집힌 카드')).toHaveLength(2);
});
```

- [ ] **Step 3: 테스트 실패를 확인한다**

```powershell
cd frontend
npm test -- src/components/cards/PlayingCard.test.tsx src/components/table/PokerTable.test.tsx
```

- [ ] **Step 4: 카드와 테이블의 최소 구현을 작성한다**

문양 이름과 기호는 하나의 상수에서 관리한다.

```ts
const SUITS = {
  spades: { symbol: '♠', label: '스페이드', tone: 'black' },
  hearts: { symbol: '♥', label: '하트', tone: 'red' },
  diamonds: { symbol: '♦', label: '다이아몬드', tone: 'red' },
  clubs: { symbol: '♣', label: '클로버', tone: 'black' },
} as const;
```

카드 값의 한국어 읽기 이름도 `A → 에이스`, `K → 킹`, `Q → 퀸`, `J → 잭`으로 한 곳에서 변환한다. 숫자는 그대로 읽는다. 테이블은 현재 단계에 따라 공개할 공용 카드 수를 `0, 3, 4, 5, 5`로 계산한다.

- [ ] **Step 5: 진행률과 피드백 UI를 구현한다**

`ProgressBar`는 `aria-valuemin`, `aria-valuemax`, `aria-valuenow`를 제공한다. `FeedbackPanel`은 정답·오답 아이콘, 제목, 설명을 함께 보여주고 `role="status"`를 사용한다.

- [ ] **Step 6: 공통 UI 테스트와 빌드를 실행한다**

```powershell
cd frontend
npm test -- src/components
npm run build
```

예상 결과: 카드와 테이블 테스트가 성공하고 빌드가 완료된다.

- [ ] **Step 7: 코드 해설과 커밋을 남긴다**

`docs/code-walkthrough.md`에 카드 데이터가 화면 문자와 접근성 이름으로 바뀌는 과정, 테이블이 단계별 공개 수를 계산하는 위치, CSS가 로직과 분리된 이유를 추가한다.

```powershell
git add frontend/src/components docs/code-walkthrough.md
git commit -m "feat: add accessible poker learning primitives"
```

**설명 중단점:** `PlayingCard`의 입력값이 실제 카드 UI로 변환되는 과정을 사용자에게 설명한다.

---

### Task 4: 정답 판정과 학습 세션 엔진

**파일:**

- 생성: `frontend/src/features/learning/evaluateAnswer.ts`
- 생성: `frontend/src/features/learning/evaluateAnswer.test.ts`
- 생성: `frontend/src/features/learning/calculateResult.ts`
- 생성: `frontend/src/features/learning/calculateResult.test.ts`
- 생성: `frontend/src/features/learning/sessionReducer.ts`
- 생성: `frontend/src/features/learning/sessionReducer.test.ts`
- 생성: `frontend/src/features/learning/LearningStepRenderer.tsx`
- 생성: `frontend/src/features/learning/LearningSession.tsx`
- 생성: `frontend/src/features/learning/LearningSession.test.tsx`
- 생성: `frontend/src/test/learningFixtures.tsx`
- 수정: `docs/code-walkthrough.md`

**인터페이스:**

- 소비: `LearningStep`, `LessonDefinition`
- 제공: `evaluateAnswer(step, selectedOptionIds): AnswerResult`
- 제공: `calculatePercentage(correct, answered): number`
- 제공: `hasPassed(correct, answered, passingPercentage): boolean`
- 제공: `sessionReducer(state, action): LearningSessionState`
- 제공: `<LearningSession lesson initialStepIndex onConfirmedProgress onComplete />`
- 제공: 테스트용 `singleChoiceStep`, `multiChoiceStep`, `singleQuestionLesson`, `renderLearningSession`

- [ ] **Step 1: 단일·복수 선택 정답 판정 실패 테스트를 작성한다**

```ts
it('단일 선택의 정답과 해설을 반환한다', () => {
  expect(evaluateAnswer(singleChoiceStep, ['call'])).toEqual({
    isCorrect: true,
    explanation: singleChoiceStep.explanation,
  });
});

it('복수 선택은 순서와 무관하게 정확히 같은 집합만 정답이다', () => {
  expect(evaluateAnswer(multiChoiceStep, ['suited', 'connected'])).toMatchObject({ isCorrect: true });
  expect(evaluateAnswer(multiChoiceStep, ['connected', 'suited'])).toMatchObject({ isCorrect: true });
  expect(evaluateAnswer(multiChoiceStep, ['suited'])).toMatchObject({ isCorrect: false });
});
```

- [ ] **Step 2: 통과 경계와 0문제 결과 실패 테스트를 작성한다**

```ts
it('5문제 중 4문제는 80% 기준을 통과한다', () => {
  expect(hasPassed(4, 5, 80)).toBe(true);
});

it('5문제 중 3문제는 80% 기준을 통과하지 못한다', () => {
  expect(hasPassed(3, 5, 80)).toBe(false);
});

it('답한 문제가 없으면 점수는 0이다', () => {
  expect(calculatePercentage(0, 0)).toBe(0);
});
```

- [ ] **Step 3: 중복 제출 방지와 피드백 순서 실패 테스트를 작성한다**

```tsx
it('답 제출 후 피드백을 보기 전에는 다음 단계 버튼만 제공한다', async () => {
  const user = userEvent.setup();
  renderLearningSession(singleQuestionLesson);

  await user.click(screen.getByRole('radio', { name: '콜' }));
  await user.click(screen.getByRole('button', { name: '정답 확인' }));

  expect(screen.getByRole('status')).toHaveTextContent('정답이에요');
  expect(screen.getByRole('button', { name: '다음' })).toBeEnabled();
  expect(screen.queryByRole('button', { name: '정답 확인' })).not.toBeInTheDocument();
});

it('제출 버튼을 빠르게 두 번 눌러도 응답은 한 번만 기록한다', async () => {
  const onConfirmedProgress = vi.fn();
  const user = userEvent.setup();
  renderLearningSession(singleQuestionLesson, { onConfirmedProgress });

  await user.click(screen.getByRole('radio', { name: '콜' }));
  const submit = screen.getByRole('button', { name: '정답 확인' });
  await user.dblClick(submit);

  expect(onConfirmedProgress).toHaveBeenCalledTimes(1);
});
```

`learningFixtures.tsx`는 `콜`이 정답인 단일 선택 Lesson과 `수딧·커넥티드`가 정답인 복수 선택 Lesson을 실제 타입으로 만든다. `renderLearningSession`은 기본 콜백과 테스트가 전달한 콜백을 합쳐 `LearningSession`을 렌더링한다.

- [ ] **Step 4: 실패를 확인한다**

```powershell
cd frontend
npm test -- src/features/learning
```

- [ ] **Step 5: 순수 정답·결과 함수를 구현한다**

`evaluateAnswer`는 정답 집합을 정렬해 비교하고 입력 배열을 변경하지 않는다. `calculatePercentage`는 정수 퍼센트를 반환하며 `answered === 0`이면 0을 반환한다. `hasPassed`는 계산된 값이 기준 이상인지 확인한다.

- [ ] **Step 6: 세션 reducer를 구현한다**

상태와 액션을 다음 범위로 제한한다.

```ts
interface LearningSessionState {
  stepIndex: number;
  selectedOptionIds: string[];
  feedback: AnswerResult | null;
  answered: number;
  correct: number;
  submittedStepIds: string[];
}

type LearningSessionAction =
  | { type: 'select-option'; optionId: string; multiple: boolean }
  | { type: 'submit-answer'; step: SingleChoiceStep | MultiChoiceStep }
  | { type: 'advance'; totalSteps: number }
  | { type: 'reset'; stepIndex: number };
```

이미 `submittedStepIds`에 있는 문제는 다시 점수에 반영하지 않는다. 선택 문제는 제출 전까지 `다음`으로 넘어갈 수 없고, 제출 후에는 피드백이 표시된다.

- [ ] **Step 7: 단계별 화면 렌더러와 세션을 구현한다**

`LearningStepRenderer`는 `step.type`의 `switch`를 사용하고 모든 타입을 처리했는지 TypeScript가 검사하도록 `assertNever`를 사용한다. 지원하지 않는 런타임 데이터에는 “학습 콘텐츠를 표시할 수 없어요”를 보여준다.

- [ ] **Step 8: 학습 엔진 전체 테스트를 실행한다**

```powershell
cd frontend
npm test -- src/features/learning
npm run build
```

- [ ] **Step 9: 코드 해설과 커밋을 남긴다**

정답 판정이 화면과 분리된 이유, reducer에서 가능한 상태 변화, 중복 제출 방지 방식을 `docs/code-walkthrough.md`에 추가한다.

```powershell
git add frontend/src/features/learning docs/code-walkthrough.md
git commit -m "feat: add interactive learning session engine"
```

**설명 중단점:** 사용자가 답을 고른 순간부터 피드백과 점수가 만들어질 때까지 함수 호출 순서를 설명한다.

---

### Task 5: 진도 저장·복구·초기화

**파일:**

- 생성: `frontend/src/features/progress/createEmptyProgress.ts`
- 생성: `frontend/src/features/progress/progressReducer.ts`
- 생성: `frontend/src/features/progress/progressReducer.test.ts`
- 생성: `frontend/src/features/progress/ProgressRepository.ts`
- 생성: `frontend/src/features/progress/LocalProgressRepository.ts`
- 생성: `frontend/src/features/progress/LocalProgressRepository.test.ts`
- 생성: `frontend/src/features/progress/ProgressProvider.tsx`
- 생성: `frontend/src/features/progress/ProgressProvider.test.tsx`
- 생성: `frontend/src/features/progress/resume.ts`
- 생성: `frontend/src/features/progress/resume.test.ts`
- 생성: `frontend/src/test/progressFixtures.ts`
- 수정: `docs/code-walkthrough.md`

**인터페이스:**

- 제공: 설계 문서의 `ProgressRepository`
- 제공: `createEmptyProgress(): LearningProgress`
- 제공: `progressReducer(progress, action): LearningProgress`
- 제공: `getResumePoint(progress, catalog, partId?): ResumePoint | null`
- 제공: `ProgressProvider`, `useProgress()`
- 제공: 테스트용 `progressFixture`, `progressWithBestScore`, `progressAfterSubmittingStepFive`, `confirmedPart0Step`, `confirmedPart1Step`, `expectedPart0ResumePoint`, `expectedPart1ResumePoint`
- 제공: 테스트용 메모리 `storage`
- 소비: Task 2 타입, 이후 Task 8 코스 목록

- [ ] **Step 1: 저장소 성공·빈 값·손상 데이터 실패 테스트를 작성한다**

```ts
it('저장한 진도를 다시 불러온다', async () => {
  const repository = new LocalProgressRepository(storage);
  await repository.save(progressFixture);
  await expect(repository.load()).resolves.toEqual({ progress: progressFixture, recovered: false });
});

it('저장값이 없으면 새 진도를 반환한다', async () => {
  const repository = new LocalProgressRepository(storage);
  await expect(repository.load()).resolves.toEqual({ progress: createEmptyProgress(), recovered: false });
});

it('손상된 JSON은 초기화하고 복구 상태를 알린다', async () => {
  storage.setItem('holdem-learning-progress', '{broken');
  const repository = new LocalProgressRepository(storage);
  await expect(repository.load()).resolves.toMatchObject({ progress: createEmptyProgress(), recovered: true });
});
```

`load`의 실제 반환 타입은 복구 안내가 필요하므로 다음과 같이 고정한다.

```ts
interface ProgressLoadResult {
  progress: LearningProgress;
  recovered: boolean;
}

interface ProgressRepository {
  load(): Promise<ProgressLoadResult>;
  save(progress: LearningProgress): Promise<void>;
  reset(partId?: string): Promise<void>;
}
```

`ProgressLoadResult`의 `recovered` 값이 손상 데이터 복구 안내에 사용된다는 점을 코드 해설에 기록한다.

- [ ] **Step 2: 버전 불일치와 저장 실패 테스트를 작성한다**

```ts
it('지원하지 않는 진도 버전은 새 진도로 복구한다', async () => {
  storage.setItem('holdem-learning-progress', JSON.stringify({ version: 99 }));
  const result = await new LocalProgressRepository(storage).load();
  expect(result.recovered).toBe(true);
  expect(result.progress.version).toBe(1);
});

it('브라우저 저장 실패를 호출자에게 전달한다', async () => {
  storage.setItem = () => { throw new DOMException('Quota exceeded'); };
  await expect(new LocalProgressRepository(storage).save(progressFixture)).rejects.toThrow();
});
```

- [ ] **Step 3: 진도 reducer와 이어하기 실패 테스트를 작성한다**

```ts
it('확정된 문제 다음 단계에서 이어간다', () => {
  const progress = progressAfterSubmittingStepFive();
  expect(getResumePoint(progress, catalogFixture, 'part-1')).toEqual({
    partId: 'part-1', lessonId: 'hand-properties', stepIndex: 5,
  });
});

it('더 낮은 재도전 점수는 최고 점수를 낮추지 않는다', () => {
  const updated = progressReducer(progressWithBestScore(90), {
    type: 'complete-attempt', lessonId: 'part-1-challenge', correct: 4, answered: 5,
  });
  expect(updated.lessonResults['part-1-challenge'].bestPercentage).toBe(90);
});

it('다른 Part를 시작해도 기존 Part의 이어하기 위치를 유지한다', () => {
  const afterPart0 = progressReducer(createEmptyProgress(), confirmedPart0Step);
  const afterPart1 = progressReducer(afterPart0, confirmedPart1Step);

  expect(afterPart1.resumeByPart['part-0']).toEqual(expectedPart0ResumePoint);
  expect(afterPart1.resumeByPart['part-1']).toEqual(expectedPart1ResumePoint);
  expect(afterPart1.recent).toEqual(expectedPart1ResumePoint);
});
```

`progressFixtures.ts`의 각 함수는 `createEmptyProgress()` 결과를 복사한 뒤 테스트 이름에 필요한 필드만 채운다. `progressAfterSubmittingStepFive()`는 `stepIndex: 5`를 사용해 0부터 센 여섯 번째 단계가 다음 미완료 단계임을 표현한다. `confirmedPart0Step`, `confirmedPart1Step`, 두 예상 위치도 이 파일에서 실제 ID를 사용해 정의한다. `storage`는 `Storage` 인터페이스의 `getItem`, `setItem`, `removeItem`, `clear`, `key`, `length`를 메모리 `Map`으로 구현하고 각 테스트 전에 비운다.

- [ ] **Step 4: 테스트 실패를 확인한다**

```powershell
cd frontend
npm test -- src/features/progress
```

- [ ] **Step 5: 로컬 저장소와 런타임 데이터 검사기를 구현한다**

저장 키는 `holdem-learning-progress`로 고정한다. JSON을 읽은 뒤 `version`, 배열 필드, `recent`, `resumeByPart` 구조를 검사한다. 타입 단언만으로 외부 저장 데이터를 신뢰하지 않는다. 한 Part 초기화는 해당 Part의 완료 Lesson, 결과, 이어하기 위치만 제거하고 다른 Part 기록은 유지한다. 삭제한 Part가 `recent`였다면 남은 Part 중 가장 최근에 확정된 위치를 선택하고, 남은 위치가 없으면 `null`로 만든다.

- [ ] **Step 6: ProgressProvider를 구현한다**

Provider는 다음 상태를 노출한다.

```ts
interface ProgressContextValue {
  progress: LearningProgress;
  status: 'loading' | 'ready';
  warning: string | null;
  confirmStep(input: ConfirmStepInput): Promise<void>;
  completeLesson(input: CompleteLessonInput): Promise<void>;
  resetProgress(partId?: string): Promise<void>;
}
```

저장 실패 시 메모리 상태는 유지하고 `warning`에 “현재 학습은 계속할 수 있지만 최신 진도가 저장되지 않았어요.”를 설정한다.

- [ ] **Step 7: 저장·복구 테스트와 전체 테스트를 실행한다**

```powershell
cd frontend
npm test -- src/features/progress
npm test
npm run build
```

- [ ] **Step 8: 코드 해설과 커밋을 남긴다**

`localStorage`를 한 파일에서만 사용하는 이유, JSON을 다시 검사하는 이유, reducer와 저장소의 차이, Spring Boot 전환 시 교체되는 파일을 문서에 추가한다.

```powershell
git add frontend/src/features/progress docs/code-walkthrough.md
git commit -m "feat: persist and resume learning progress"
```

**설명 중단점:** React 상태, 브라우저 저장 데이터, `ProgressRepository`의 관계를 사용자에게 설명한다.

---

### Task 6: Part 0 콘텐츠와 학습 화면

**파일:**

- 생성: `frontend/src/content/part0.ts`
- 생성: `frontend/src/content/part0.test.ts`
- 생성: `frontend/src/pages/LearningPage.tsx`
- 생성: `frontend/src/pages/LearningPage.test.tsx`
- 생성: `frontend/src/test/renderApp.tsx`
- 수정: `frontend/src/app/router.tsx`
- 수정: `frontend/src/styles/global.css`
- 수정: `docs/code-walkthrough.md`

**인터페이스:**

- 제공: `part0: PartDefinition`
- 제공: `part0Lessons: Record<string, LessonDefinition>`
- 소비: Task 2 타입, Task 3 공통 UI, Task 4 학습 세션, Task 5 진도 Provider
- 제공: 테스트용 `renderAppAt(path, progress?)`

- [ ] **Step 1: Part 0 구조와 핵심 문제에 대한 실패 테스트를 작성한다**

```ts
it('Part 0은 정해진 순서의 여섯 Lesson을 가진다', () => {
  expect(part0.lessonIds).toEqual([
    'goal-and-cards',
    'hand-rankings',
    'hand-stages',
    'player-actions',
    'blinds-and-order',
    'guided-hand',
  ]);
});

it('모의 한 판은 80% 통과 기준과 다섯 문제를 가진다', () => {
  const lesson = part0Lessons['guided-hand'];
  expect(lesson.passingPercentage).toBe(80);
  expect(lesson.steps.filter((step) => step.type === 'single-choice' || step.type === 'multi-choice')).toHaveLength(5);
});

it('Part 0 콘텐츠 검증 오류가 없다', () => {
  expect(validateCourse(makeCatalog(part0, part0Lessons))).toEqual([]);
});
```

`renderAppAt`은 메모리 라우터와 테스트 파일 안의 `MemoryProgressRepository`를 조합해 실제 브라우저 저장소를 건드리지 않고 원하는 주소와 진도로 앱을 렌더링한다. 이 저장소는 생성자로 받은 진도를 `load`에서 `{ progress, recovered: false }`로 반환하고 `save`에서 메모리 값만 교체한다.

- [ ] **Step 2: 콘텐츠 테스트 실패를 확인한다**

```powershell
cd frontend
npm test -- src/content/part0.test.ts
```

- [ ] **Step 3: 여섯 Lesson의 콘텐츠를 작성한다**

다음 ID와 학습 내용을 정확히 사용한다.

| Lesson ID | 반드시 포함할 단계와 정답 |
|---|---|
| `goal-and-cards` | 개인 카드 2장 설명, 공용 카드 최대 5장 설명, “최종 승부에 사용하는 카드 수” 정답 `5장`, 요약 |
| `hand-rankings` | 족보 순서 설명, `원 페어 vs 하이 카드` 정답 `원 페어`, `플러시 vs 스트레이트` 정답 `플러시`, `풀 하우스 vs 포카드` 정답 `포카드`, 요약 |
| `hand-stages` | 프리플랍 설명, `A♠ K♥`와 `7♣ J♦ 2♠ / Q♣ / 10♥`를 사용해 `preflop → flop → turn → river → showdown` 다섯 Step으로 이어지는 테이블 공개 체험, “공용 카드 3장이 처음 공개되는 단계” 정답 `플랍`, 단계 순서 문제 정답 `프리플랍 → 플랍 → 턴 → 리버`, 요약 |
| `player-actions` | 다섯 행동 설명, 앞선 베팅이 없을 때 칩을 내지 않고 넘기는 행동 정답 `체크`, 상대 베팅과 같은 금액을 내는 행동 정답 `콜`, 카드를 포기하는 행동 정답 `폴드`, 요약 |
| `blinds-and-order` | 딜러·SB·BB 설명, 프리플랍에서 BB 다음 사람이 먼저 행동한다는 설명, 플랍 이후 딜러 왼쪽의 남은 플레이어가 먼저 행동한다는 문제, 후반 포지션의 정보 이점 설명, 요약 |
| `guided-hand` | 현재 단계 `프리플랍`, 플랍 카드 수 `3장`, 상대 베팅이 없을 때 가능한 행동 `체크 또는 베팅`, 상대 베팅을 따라가는 행동 `콜`, 마지막 공개 카드 단계 `리버`의 다섯 문제 |

모든 오답 해설은 “틀렸습니다”로 끝내지 않고 왜 다른 선택이 맞는지 한두 문장으로 설명한다.

- [ ] **Step 4: Part 0 콘텐츠 테스트를 통과시킨다**

```powershell
cd frontend
npm test -- src/content/part0.test.ts
```

- [ ] **Step 5: 실제 학습 주소의 실패 테스트를 작성한다**

```tsx
it('Part 0 첫 Lesson을 열어 첫 설명을 보여준다', async () => {
  renderAppAt('/learn/part-0/goal-and-cards');
  expect(await screen.findByRole('heading', { name: '게임의 목표와 카드 구성' })).toBeInTheDocument();
  expect(screen.getByText(/개인 카드 두 장/)).toBeInTheDocument();
});

it('존재하지 않는 Lesson은 복구 화면을 보여준다', async () => {
  renderAppAt('/learn/part-0/missing');
  expect(await screen.findByRole('heading', { name: '학습 내용을 찾을 수 없어요' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Part 0으로 돌아가기' })).toBeInTheDocument();
});
```

- [ ] **Step 6: LearningPage를 구현하고 진도 저장을 연결한다**

페이지는 주소의 Part와 Lesson을 조회하고, 저장된 `stepIndex`를 `LearningSession`의 `initialStepIndex`로 전달한다. 확정 단계와 Lesson 완료 콜백은 `useProgress()`로 전달한다. 로딩 중에는 짧은 로딩 상태를, 저장 경고가 있으면 화면 상단에 경고 영역을 보여준다.

- [ ] **Step 7: Part 0 화면 테스트와 전체 검증을 실행한다**

```powershell
cd frontend
npm test -- src/content/part0.test.ts src/pages/LearningPage.test.tsx
npm test
npm run build
```

- [ ] **Step 8: Part 0 코드 해설과 커밋을 남긴다**

여섯 Lesson 데이터가 하나의 공통 학습 엔진으로 표시되는 과정, 콘텐츠 문구를 변경할 파일, 새로운 문제를 추가할 위치를 `docs/code-walkthrough.md`에 기록한다.

```powershell
git add frontend/src/content/part0.ts frontend/src/content/part0.test.ts frontend/src/pages frontend/src/app/router.tsx frontend/src/styles docs/code-walkthrough.md
git commit -m "feat: add interactive Part 0 course"
```

**설명 중단점:** Part 0 콘텐츠 하나를 골라 데이터에서 화면과 진도 저장까지 이어지는 전체 흐름을 사용자에게 설명한다.

---

### Task 7: Part 1 콘텐츠와 포지션 학습

**파일:**

- 생성: `frontend/src/content/part1.ts`
- 생성: `frontend/src/content/part1.test.ts`
- 생성: `frontend/src/components/table/PositionDiagram.tsx`
- 생성: `frontend/src/components/table/PositionDiagram.test.tsx`
- 수정: `frontend/src/features/learning/LearningStepRenderer.tsx`
- 수정: `frontend/src/app/router.tsx`
- 수정: `docs/code-walkthrough.md`

**인터페이스:**

- 제공: `part1: PartDefinition`
- 제공: `part1Lessons: Record<string, LessonDefinition>`
- 제공: `<PositionDiagram activeGroup="early" | "middle" | "late" />`
- 소비: 기존 학습 엔진과 진도 저장 기능

- [ ] **Step 1: Part 1 구조와 종합 도전 실패 테스트를 작성한다**

```ts
it('Part 1은 정해진 순서의 여덟 Lesson을 가진다', () => {
  expect(part1.lessonIds).toEqual([
    'hand-notation',
    'hand-properties',
    'identify-properties',
    'compare-hands',
    'classify-strength',
    'understand-position',
    'same-hand-different-position',
    'starting-hand-challenge',
  ]);
});

it('종합 도전은 카드 특징과 포지션 문제 다섯 개로 구성된다', () => {
  const challenge = part1Lessons['starting-hand-challenge'];
  expect(challenge.passingPercentage).toBe(80);
  expect(challenge.steps.filter((step) => step.type === 'single-choice' || step.type === 'multi-choice')).toHaveLength(5);
});
```

- [ ] **Step 2: 포지션 그림 접근성 실패 테스트를 작성한다**

```tsx
it('활성 포지션을 글과 현재 상태로 함께 표시한다', () => {
  render(<PositionDiagram activeGroup="late" />);
  expect(screen.getByText('후반 포지션')).toHaveAttribute('aria-current', 'true');
  expect(screen.getByText('초반 포지션')).not.toHaveAttribute('aria-current');
});
```

- [ ] **Step 3: 실패를 확인한다**

```powershell
cd frontend
npm test -- src/content/part1.test.ts src/components/table/PositionDiagram.test.tsx
```

- [ ] **Step 4: 여덟 Lesson의 콘텐츠를 작성한다**

다음 ID와 학습 내용을 정확히 사용한다.

| Lesson ID | 반드시 포함할 단계와 정답 |
|---|---|
| `hand-notation` | `s`는 같은 무늬, `o`는 다른 무늬, 숫자 두 개는 포켓 페어라는 설명과 `AKs`, `AQo`, `TT` 판독 문제 |
| `hand-properties` | 높은 카드, 포켓 페어, 수딧, 커넥티드의 뜻과 각각의 대표 카드 `A♠K♥`, `9♠9♥`, `A♠J♠`, `9♠8♥` |
| `identify-properties` | `A♠K♠` 정답 `높은 카드·수딧·커넥티드`, `9♠8♠` 정답 `수딧·커넥티드`, `7♣7♦` 정답 `포켓 페어`, `8♣3♥` 정답 `해당 없음` |
| `compare-hands` | `A♠K♠ > A♥8♣`, `9♠9♥ > K♣4♦`, `J♠10♠ > J♥4♣`의 세 비교와 각각의 이유 |
| `classify-strength` | `A♠A♥` 강함, `A♠J♠` 괜찮음, `7♠6♠` 상황에 따라, `7♣2♦` 약함으로 분류하며 절대 차트가 아님을 설명 |
| `understand-position` | 초반·중간·후반 포지션 그림, 뒤에서 행동할수록 먼저 본 정보가 많다는 문제, 초반에서는 더 신중한 범위를 선택한다는 설명 |
| `same-hand-different-position` | `J♠9♥`를 초반과 후반에 각각 제시하고 후반에서 플레이 가능 범위가 넓어진다는 비교, `A♣9♦`의 같은 방식 비교 |
| `starting-hand-challenge` | 공통 조건을 화면에 표시하고 `A♠K♠/초반` 오픈 레이즈, `7♣2♦/후반` 폴드, `J♠9♥/초반` 폴드, `J♠9♥/후반` 입문 범위에서는 오픈 레이즈 가능, `9♣9♦/중간` 오픈 레이즈의 다섯 문제 |

모든 포지션 문제에 `6인 테이블 · 약 100BB · 앞선 플레이어 모두 폴드` 조건을 표시한다. `플레이`는 항상 이긴다는 의미가 아니라 입문 기준에서 오픈 레이즈할 가치가 있다는 뜻임을 해설에 표시한다.

- [ ] **Step 5: 포지션 그림과 필요한 렌더러 확장을 구현한다**

원형 또는 타원형 테이블 주위에 초반·중간·후반 그룹을 배치한다. 모바일에서도 그룹 이름을 읽을 수 있어야 하고 활성 그룹은 색, 테두리, `aria-current`로 표시한다. 콘텐츠 타입에 포지션 설명이 필요한 경우 기존 `table-reveal`을 억지로 재사용하지 않고 `position` 타입을 추가하며 검증기와 `assertNever` 테스트를 함께 갱신한다.

- [ ] **Step 6: Part 1 콘텐츠와 화면 테스트를 통과시킨다**

```powershell
cd frontend
npm test -- src/content/part1.test.ts src/components/table/PositionDiagram.test.tsx
npm test
npm run build
```

- [ ] **Step 7: Part 1 코드 해설과 커밋을 남긴다**

카드 특징을 복수 정답으로 판정하는 방식, 같은 핸드를 다른 포지션에서 반복한 교육적 이유, 강도 분류가 절대적인 차트가 아닌 이유를 문서에 추가한다.

```powershell
git add frontend/src/content/part1.ts frontend/src/content/part1.test.ts frontend/src/components/table frontend/src/features/learning frontend/src/app/router.tsx docs/code-walkthrough.md
git commit -m "feat: add starting-hand and position course"
```

**설명 중단점:** `J9o`가 포지션에 따라 다른 피드백을 주는 콘텐츠와 화면 흐름을 사용자에게 설명한다.

---

### Task 8: 홈·Part 소개·결과·이어하기 통합

**파일:**

- 생성: `frontend/src/content/catalog.ts`
- 생성: `frontend/src/content/catalog.test.ts`
- 수정: `frontend/src/pages/HomePage.tsx`
- 생성: `frontend/src/pages/HomePage.test.tsx`
- 생성: `frontend/src/pages/PartPage.tsx`
- 생성: `frontend/src/pages/PartPage.test.tsx`
- 생성: `frontend/src/pages/LessonResultPage.tsx`
- 생성: `frontend/src/pages/PartResultPage.tsx`
- 생성: `frontend/src/pages/results.test.tsx`
- 생성: `frontend/src/components/feedback/ConfirmDialog.tsx`
- 생성: `frontend/src/components/feedback/ConfirmDialog.test.tsx`
- 수정: `frontend/src/app/router.tsx`
- 생성: `frontend/src/app/learning-flow.test.tsx`
- 수정: `frontend/src/test/renderApp.tsx`
- 수정: `frontend/src/test/progressFixtures.ts`
- 수정: `docs/code-walkthrough.md`

**인터페이스:**

- 제공: `courseCatalog`
- 제공: `getPart(partId)`, `getLesson(lessonId)`, `getPartForLesson(lessonId)`
- 제공: `<ConfirmDialog title description confirmLabel onConfirm onCancel />`
- 소비: 모든 콘텐츠, 진도 Context, 학습 화면
- 제공: 테스트용 `renderAppWithProgress`, `progressAtPartOneStepSix`, `progressWithCompletedPart0`, `progressWithFailedPart1Challenge`, `progressInBothParts`

- [ ] **Step 1: 전체 카탈로그 검증 실패 테스트를 작성한다**

```ts
it('Part 0과 Part 1을 합친 전체 코스에 검증 오류가 없다', () => {
  expect(validateCourse(courseCatalog)).toEqual([]);
});

it('Part 0 다음 추천 Part는 Part 1이다', () => {
  expect(getNextPartId(courseCatalog, 'part-0')).toBe('part-1');
});
```

- [ ] **Step 2: 홈 이어하기와 Part 1 직접 접근 실패 테스트를 작성한다**

```tsx
it('저장된 마지막 위치로 계속 학습하기 링크를 제공한다', async () => {
  renderAppWithProgress(progressAtPartOneStepSix, '/');
  expect(await screen.findByRole('link', { name: /Part 1 이어하기/ })).toHaveAttribute(
    'href', '/learn/part-1/hand-properties',
  );
});

it('Part 0을 완료하지 않아도 Part 1을 시작할 수 있다', async () => {
  renderAppWithProgress(createEmptyProgress(), '/parts/part-1');
  expect(await screen.findByRole('link', { name: 'Part 1 시작하기' })).toBeInTheDocument();
});

it('로그인 전 진도의 저장 범위를 안내한다', async () => {
  renderAppWithProgress(createEmptyProgress(), '/');
  expect(await screen.findByText('진도는 현재 이 기기와 브라우저에만 저장돼요.')).toBeInTheDocument();
});
```

`renderAppWithProgress`는 Task 6의 `renderAppAt`을 진도 인수와 함께 호출하는 얇은 도우미다. 네 진도 fixture는 `progressFixtures.ts`에서 실제 Part·Lesson ID를 사용해 작성한다. 이 함수는 화면 검증 결과와 함께 현재 메모리 진도를 읽을 수 있는 repository도 반환한다.

- [ ] **Step 3: 결과와 재도전 실패 테스트를 작성한다**

```tsx
it('Part 0을 통과하면 Part 1 추천 버튼을 보여준다', async () => {
  renderAppWithProgress(progressWithCompletedPart0, '/results/part-0');
  expect(await screen.findByRole('link', { name: 'Part 1 시작하기' })).toHaveAttribute('href', '/parts/part-1');
});

it('최종 도전이 80% 미만이면 놓친 개념과 다시 도전을 보여준다', async () => {
  renderAppWithProgress(progressWithFailedPart1Challenge, '/results/part-1/starting-hand-challenge');
  expect(await screen.findByText('아직 Part 1을 완료하지 못했어요')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: '종합 도전 다시 풀기' })).toBeInTheDocument();
});
```

- [ ] **Step 4: 실패를 확인한다**

```powershell
cd frontend
npm test -- src/content/catalog.test.ts src/pages src/app/learning-flow.test.tsx
```

- [ ] **Step 5: 전체 카탈로그와 조회 함수를 구현한다**

Part는 `order` 순서로 정렬한다. 조회 실패는 `undefined`를 반환하고 Page에서 복구 화면을 선택한다. 전체 카탈로그는 앱 시작 테스트에서 한 번 검증해 개발 중 콘텐츠 오류를 빨리 드러낸다.

- [ ] **Step 6: 홈과 Part 소개 화면을 진도에 연결한다**

홈은 `recent`가 있을 때만 계속 학습하기 영역을 보여준다. 각 Part 카드는 진행률, 상태, 추천 문구를 표시한다. 홈 하단에는 “진도는 현재 이 기기와 브라우저에만 저장돼요.”와 브라우저 데이터 삭제·시크릿 모드·기기 간 동기화 제한을 짧게 안내한다. Part 소개는 `resumeByPart[partId]`와 Lesson 완료 목록을 이용해 각 Lesson을 `미시작 / 진행 중 / 완료`로 표시하고 적절한 시작·이어하기·복습 링크를 만든다.

- [ ] **Step 7: Lesson·Part 결과 화면을 구현한다**

Lesson 결과는 `correct`, `answered`, 퍼센트, 핵심 개념, 다시 풀기, 다음 Lesson을 표시한다. 최종 도전 결과는 80% 통과 여부에 따라 Part 완료 또는 재도전을 표시한다. Part 0 완료 결과에는 Part 1 시작 링크를 제공한다.

- [ ] **Step 8: Part별·전체 진도 초기화 확인 화면을 테스트하고 구현한다**

```tsx
it('Part 진도 초기화는 확인한 뒤 해당 Part만 삭제한다', async () => {
  const user = userEvent.setup();
  const repository = renderAppWithProgress(progressInBothParts, '/parts/part-0');

  await user.click(screen.getByRole('button', { name: 'Part 0 진도 초기화' }));
  expect(screen.getByRole('dialog', { name: 'Part 0 진도를 초기화할까요?' })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: '초기화하기' }));

  expect(repository.progress.resumeByPart['part-0']).toBeUndefined();
  expect(repository.progress.resumeByPart['part-1']).toBeDefined();
});
```

홈에는 `전체 진도 초기화`, Part 소개 화면에는 해당 Part의 진도 초기화 버튼을 둔다. `ConfirmDialog`는 제목, 삭제되는 범위, 취소, 확인 버튼을 제공하고 열릴 때 취소 버튼으로 포커스를 이동한다. 취소하면 진도를 변경하지 않는다.

- [ ] **Step 9: 전체 사용자 흐름 통합 테스트를 작성하고 통과시킨다**

`learning-flow.test.tsx`에서 다음을 한 테스트로 검증한다.

1. 빈 진도로 Part 0 첫 Lesson을 시작한다.
2. 첫 확정 단계를 진행한다.
3. 홈으로 이동한다.
4. 이어하기 링크가 다음 미완료 단계 주소를 가리킨다.
5. 저장된 문제를 다시 제출해도 집계가 증가하지 않는다.
6. Part 1 주소에 직접 접근할 수 있다.
7. Part 0 초기화 뒤에도 Part 1 진도가 유지된다.

실행:

```powershell
cd frontend
npm test -- src/app/learning-flow.test.tsx
npm test
npm run build
```

- [ ] **Step 10: 통합 코드 해설과 커밋을 남긴다**

주소, 코스 데이터, 진도, 화면이 연결되는 전체 흐름과 백엔드 연결 시 그대로 유지되는 부분을 `docs/code-walkthrough.md`에 기록한다.

```powershell
git add frontend/src/content frontend/src/pages frontend/src/app docs/code-walkthrough.md
git commit -m "feat: connect course navigation and results"
```

**설명 중단점:** 홈의 `계속 학습하기` 버튼이 어떤 데이터를 읽어 정확한 주소를 만드는지 사용자에게 설명한다.

---

### Task 9: 반응형·접근성·실제 브라우저 검증

**파일:**

- 수정: `frontend/src/styles/tokens.css`
- 수정: `frontend/src/styles/global.css`
- 수정: 관련 컴포넌트 CSS
- 생성: `frontend/playwright.config.ts`
- 생성: `frontend/e2e/learning-flow.spec.ts`
- 수정: `frontend/package.json`
- 생성: `README.md`
- 수정: `docs/code-walkthrough.md`

**인터페이스:**

- 제공: `npm run test:e2e`
- 제공: 모바일·데스크톱에서 검증된 핵심 학습 흐름
- 제공: 포트폴리오 설명과 실행 방법

- [ ] **Step 1: Playwright를 설치하고 실행 스크립트를 추가한다**

```powershell
cd frontend
npm install --save-dev @playwright/test
npx playwright install chromium
```

`package.json`:

```json
{
  "test:e2e": "playwright test"
}
```

`playwright.config.ts`는 `npm run dev -- --host 127.0.0.1`을 웹 서버로 실행하고 `http://127.0.0.1:5173`을 기본 주소로 사용한다. 프로젝트는 모바일 `390x844`와 데스크톱 `1440x900` 두 개를 정의한다.

- [ ] **Step 2: 실제 브라우저 실패 테스트를 작성한다**

`e2e/learning-flow.spec.ts`는 각 테스트 시작 전에 브라우저 저장소를 비우고 다음 흐름을 검증한다.

```ts
test('Part 0을 시작하고 이탈한 뒤 이어서 학습한다', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Part 0 시작하기' }).click();
  await page.getByRole('link', { name: '첫 Lesson 시작하기' }).click();
  await page.getByRole('button', { name: '다음' }).click();
  await page.goto('/');

  const continueLink = page.getByRole('link', { name: /Part 0 이어하기/ });
  await expect(continueLink).toBeVisible();
  await continueLink.click();
  await expect(page.getByText('개인 카드 두 장')).toBeVisible();
});
```

두 번째 테스트는 Part 1 주소에 직접 접근해 카드 특징 문제를 제출하고 정답 설명이 나타나는지 확인한다.

- [ ] **Step 3: E2E 테스트가 실패하는지 확인한다**

```powershell
cd frontend
npm run test:e2e
```

예상 결과: 아직 정확한 링크 이름이나 반응형 조건이 맞지 않는 부분이 드러난다.

- [ ] **Step 4: 모바일·데스크톱 스타일을 완성한다**

다음 기준을 CSS로 명시한다.

- 기본 화면은 한 열이고 주요 버튼 최소 높이는 `44px`이다.
- 카드 비교는 작은 화면에서 세로, `48rem` 이상에서 두 열이다.
- 전체 콘텐츠 최대 너비는 `70rem`, 학습 본문 최대 너비는 `48rem`이다.
- `:focus-visible`에 최소 `3px` 외곽선을 표시한다.
- `@media (prefers-reduced-motion: reduce)`에서 전환과 애니메이션을 제거한다.
- 오류·정답·오답은 아이콘, 제목, 설명을 함께 제공한다.
- 긴 한국어 문구가 카드나 버튼 밖으로 넘치지 않게 줄바꿈을 허용한다.

- [ ] **Step 5: 실제 브라우저 테스트와 전체 검증을 실행한다**

```powershell
cd frontend
npm run lint
npm test
npm run build
npm run test:e2e
```

예상 결과: lint, 모든 Vitest 테스트, 배포 빌드, 모바일·데스크톱 Playwright 테스트가 성공한다.

- [ ] **Step 6: README를 작성한다**

루트 `README.md`에 다음 섹션을 실제 프로젝트 내용으로 작성한다.

```markdown
# 홀덤 판단 학습 앱

## 해결하려는 문제
## Part 0과 Part 1에서 배우는 내용
## 직접 판단하고 피드백받는 학습 방식
## 기술 구조
## 진도 저장과 Spring Boot 확장 계획
## 실행 방법
## 테스트 방법
## 주요 설계 결정과 장단점
## AI를 활용한 개발 방식과 코드 이해 과정
```

AI 활용 부분에는 요구사항과 설계 결정을 사용자가 검토·승인했고, AI가 구현과 테스트를 보조했으며, 각 단계의 코드를 `docs/code-walkthrough.md`로 검토했다는 사실을 과장 없이 기록한다.

- [ ] **Step 7: 코드 해설 문서를 완성한다**

`docs/code-walkthrough.md` 마지막에 다음 내용을 추가한다.

- 앱 전체 실행 흐름 한 번에 보기
- 새 Lesson을 추가하는 순서
- 카드 UI를 수정하는 위치
- 진도 저장을 Spring Boot API로 교체할 때 유지되는 인터페이스
- 면접에서 설명할 수 있어야 하는 주요 설계 선택 다섯 가지

- [ ] **Step 8: 최종 검증 결과를 문서에 기록한다**

README의 테스트 섹션에 실행한 명령을 적고, 실제 실행 결과가 성공한 경우에만 통과했다고 표시한다. 실행하지 못한 검증이 있으면 이유와 남은 작업을 명확히 남긴다.

- [ ] **Step 9: 최종 React MVP 커밋을 남긴다**

```powershell
git add frontend README.md docs/code-walkthrough.md
git commit -m "feat: complete responsive holdem learning MVP"
```

**최종 설명 중단점:** 전체 앱을 시연하면서 홈 → 학습 엔진 → 진도 저장 → 이어하기의 흐름과 향후 Spring Boot 교체 지점을 사용자에게 설명한다.

---

## 구현 완료 조건

다음 조건을 모두 만족해야 React MVP 구현이 완료된 것으로 판단한다.

1. Part 0의 여섯 Lesson과 Part 1의 여덟 Lesson을 실제로 진행할 수 있다.
2. Part 0을 완료하지 않아도 Part 1에 직접 접근할 수 있다.
3. 답 제출 뒤 즉시 이유가 포함된 피드백이 나타난다.
4. 최종 도전은 80% 기준을 정확히 적용하고 무제한 재도전을 제공한다.
5. 브라우저를 닫거나 다른 화면으로 이동해도 마지막 확정 단계에서 이어갈 수 있다.
6. 손상된 저장 데이터가 앱을 중단시키지 않는다.
7. 대표 모바일·데스크톱 크기에서 핵심 흐름이 작동한다.
8. 키보드 사용, 포커스 표시, 카드 접근성 이름이 동작한다.
9. lint, 단위·컴포넌트 테스트, 빌드, Playwright 테스트가 모두 성공한다.
10. `README.md`와 `docs/code-walkthrough.md`만 읽어도 프로젝트 목적, 구조, 실행 방법, 주요 코드 흐름을 설명할 수 있다.
