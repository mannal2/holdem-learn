# Part 3 레슨 구현계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** 승인한 Part 3 레슨 7개와 고정 퀴즈 24문제를 기존 학습 화면으로 제공한다. 추가연습은 제외한다.

**Architecture:** Part 3은 정적 콘텐츠와 카탈로그 등록으로 추가한다. 기존 카드 표시를 턴·리버와 설명용 카드 묶음까지 최소 확장하고, 저장·채점·이동은 기존 LearningSession을 그대로 사용한다.

**Tech Stack:** React 19, TypeScript 6, Vite 8, Vitest, Testing Library, Playwright. 새 의존성 없음.

**Spec:** `docs/part-3-lesson-design.md` — 2026-10-02 사용자 승인.

## Global Constraints

- 실제 작업 위치는 `C:\Users\dlwjd\Desktop\holdem`이며 새 워크트리를 만들지 않는다.
- 사용자 명칭은 **드로우**로 통일한다.
- 레슨 상세 구성 확정 → 레슨 구현·검증 → 추가연습 설계·구현 순서를 유지한다.
- 기본 레슨 6개는 각 3문제, 종합 도전 1개는 6문제로 총 24문제다.
- 종합 도전만 통과 기준 80%이며 6문제 중 5문제 이상이면 통과다.
- 기존 Part·레슨·Step·보기 ID와 기존 저장 데이터는 변경하거나 초기화하지 않는다.
- 추가연습 등록·링크·문제 풀·새 시작 화면·DB·인증·Spring Boot를 만들지 않는다.
- 실패 테스트를 지우거나 정답 기준을 완화해 통과시키지 않는다.
- 한글 설명 문서에 데이터와 공통 화면의 역할을 기록한다.
- 이번 요청은 파일 구현·검증이다. 새 커밋·푸시는 별도 요청 때 진행한다.

## Review Focus

1. 기존 플랍 문제에 stage가 없어도 이전과 같은 세 장과 제출 후 강조를 유지한다.
2. 턴·리버 문제의 카드 수와 공개 단계가 맞으며 아직 숨긴 카드 이름을 노출하지 않는다.
3. 새로고침 시 복수 선택·턴 문제의 선택과 해설이 같은 단계에 복원된다.
4. Part 3에 추가연습이 없어도 목록·결과에 잘못된 연습 링크가 생기지 않는다.
5. 9장 아웃츠 목록·확률 조건이 모바일에서 잘리거나 같은 카드 중복으로 표시되지 않는다.

## 파일별 책임

- `frontend/src/types/course.ts`: 공용 카드 3/4/5장 타입, 선택 문제 공개 단계, 설명용 카드 묶음.
- `frontend/src/components/table/PokerTable.tsx`: 확장한 카드 타입 수용. 기존 공개 규칙 유지.
- `frontend/src/features/learning/LearningStepRenderer.tsx`: 선택 문제의 stage 기본값 flop, 설명용 카드 묶음 표시.
- `frontend/src/features/learning/lesson-card-groups.css`: 설명용 카드가 작은 화면에서 줄바꿈하도록 최소 스타일.
- `frontend/src/content/validateCourse.ts`: 실제 테이블 카드 중복·공개 장수, 설명 카드 묶음 중복 확인.
- `frontend/src/content/part3.ts`: 승인한 화면 순서·카드 예시·24문제·해설·요약.
- `frontend/src/content/catalog.ts`: Part 3과 레슨 등록.
- 관련 콘텐츠·렌더러·테이블 테스트 및 `frontend/e2e/part3-flow.spec.ts`: 새 요구와 기존 동작 보호.
- `docs/code-walkthrough.md`, `docs/curriculum-conventions.md`: 등록 위치·카드 확장·드로우 명칭·레슨 먼저 구현 정책 설명.

## Task 1: 턴·리버 문제와 설명용 카드 표시

**Files:**
- Modify: `frontend/src/types/course.ts`
- Modify: `frontend/src/components/table/PokerTable.tsx`
- Modify: `frontend/src/features/learning/LearningStepRenderer.tsx`
- Create: `frontend/src/features/learning/lesson-card-groups.css`
- Test: `frontend/src/components/table/PokerTable.test.tsx`
- Test: `frontend/src/features/learning/LearningStepRenderer.test.tsx`

**Interfaces:**
- Consumes: 기존 `PlayingCard`, `PokerTable`, `LearningStepRenderer`, `TableStage`.
- Produces: `CommunityCards`는 공용 카드 3/4/5장 tuple union. `TableRevealStep.communityCards`, `ChoiceStepBase.table.communityCards`, `PokerTableProps.communityCards`에서 사용.
- Produces: `ChoiceStepBase.table.stage?: TableStage`. 렌더러 기본값은 `'flop'`.
- Produces: `ExplanationStep.cardGroups?: { label: string; cards: PlayingCard[] }[]`. 카드 예시·아웃츠 목록은 기존 PlayingCard로 표시하며 별도 게임 기능은 없다.

- [x] Step 1: 렌더러 테스트에 턴 네 장과 리버 다섯 장을 보여주는 선택 문제를 추가한다. stage 없는 기존 플랍 문제는 그대로 세 장인지 검증한다.
- [x] Step 2: 설명용 9장 카드 묶음의 접근성 이름과 장수를 검증하는 테스트를 추가한다. 기존 타입에 없으므로 최초 테스트 자료의 확장 필드는 테스트 내부에서만 타입 단언하여 실제 렌더링 실패를 확인한다.
- [x] Step 3: `npm test -- src/features/learning/LearningStepRenderer.test.tsx src/components/table/PokerTable.test.tsx` 실행. Expected: 새 테스트는 턴 카드 미공개/설명 카드 목록 미표시로 실패하고 기존 테스트는 통과.
- [x] Step 4: 위 Interfaces의 필드만 추가한다. 카드 묶음은 이름이 있는 group과 줄바꿈 가능한 card row로 직접 렌더링한다. 기존 다섯 장 족보 전용 HandRankingList를 아웃츠에 재사용하지 않는다.
- [x] Step 5: 같은 테스트 실행. Expected: 모두 통과. `npm run build`로 타입 확장도 확인한다.

## Task 2: 카드 콘텐츠 검증 확장

**Files:**
- Modify: `frontend/src/content/validateCourse.ts`
- Test: `frontend/src/content/validateCourse.test.ts`

**Interfaces:**
- Consumes: Task 1의 `CommunityCards`, optional stage, cardGroups.
- Produces: 기존 `validateCourse(catalog: CourseCatalog): string[]` 계약 유지. 잘못된 카드 상황에 한글 오류 추가.

- [x] Step 1: 내 카드·공용 카드 사이 중복, 턴 단계에 세 장뿐인 보드, 리버 단계에 네 장뿐인 보드가 오류가 되는 테스트를 작성한다.
- [x] Step 2: 한 설명용 묶음 안에 같은 카드 두 번이면 오류이며, 서로 다른 비교 묶음 사이 같은 카드는 허용하는 테스트를 작성한다.
- [x] Step 3: `npm test -- src/content/validateCourse.test.ts src/content/catalog.test.ts` 실행. Expected: 신규 오류 검증은 실패, 기존 코스는 통과.
- [x] Step 4: 실제 카드 상황 내부의 중복과 공개에 필요한 최소 장수만 검증한다. flop이면서 다섯 장을 정의하고 나머지를 숨기는 기존 공개 체험을 허용한다. 선택 문제 stage 미지정은 flop으로 검증한다.
- [x] Step 5: 같은 테스트 실행. Expected: 모두 통과하고 Part 0·1·2에 새로운 오류 없음.

## Task 3: 승인한 Part 3 콘텐츠와 카탈로그 등록

**Files:**
- Create: `frontend/src/content/part3.ts`
- Create: `frontend/src/content/part3.test.tsx`
- Modify: `frontend/src/content/catalog.ts`
- Test: `frontend/src/content/catalog.test.ts`

**Interfaces:**
- Consumes: Task 1의 기존 Step 확장과 Task 2의 validateCourse.
- Produces: `part3: PartDefinition`, `part3Lessons: Record<string, LessonDefinition>`.
- Part ID는 `part-3`, order는 3, 제목은 `앞으로 좋아질 가능성 판단`.
- Lesson ID 순서: `made-hand-and-draw`, `flush-draw`, `straight-draw`, `counting-outs`, `remaining-chances`, `draw-cautions`, `draw-challenge`.
- Step ID는 `p3-` 접두사로 기존 코스와 겹치지 않게 한다. 콘텐츠 작성 이후 ID를 이유 없이 바꾸지 않는다.

- [x] Step 1: 기존 catalog로 Part 3 조회·다음 Part·레슨 수를 검증하는 테스트를 먼저 작성한다. Expected: Part 3 미등록으로 실패.
- [x] Step 2: `npm test -- src/content/catalog.test.ts` 실행해 실패 확인 후 `part3.ts`의 최소 Part/레슨 골격과 카탈로그 연결을 추가한다.
- [x] Step 3: 콘텐츠 테스트에서 각 기본 레슨 3문제·종합 6문제·총 24문제·종합 passingPercentage 80·카드 검증 오류 없음·종합 상황 신규성을 검증한다. Expected: 내용 없는 골격에서 실패.
- [x] Step 4: 상세 설계 3~9절의 화면 순서와 카드·선택지·정답·해설을 그대로 데이터로 작성한다. 로컬 작성 보조 함수가 필요하면 Part 2 수준의 card/table 도우미만 두고 자동 문제 생성은 하지 않는다.
- [x] Step 5: 확률은 계산 표의 약 19/35/20, 17/31/17, 9/16/9와 근삿값 18/36을 구분한다. 확률 조건 설명은 기존 explanation/summary의 짧은 단계로 나누어 제시하고 단일 용도의 새 확률 컴포넌트는 만들지 않는다.
- [x] Step 6: 실제 완성 다섯 장과 9/8/4 아웃츠 카드 목록은 Task 1의 cardGroups로 제공한다. 레슨 6 상대 예시는 실제 상대가 확정됐다고 말하지 않는다.
- [x] Step 7: `npm test -- src/content/part3.test.tsx src/content/catalog.test.ts` 실행. Expected: 전체 콘텐츠 검증·24문제·새 종합 상황·다섯 장 예시·아웃츠 목록 통과.
- [x] Step 8: `getPracticePart`가 Part 3 레슨에는 undefined인 테스트를 넣는다. Part 1·2 연습 지원은 그대로인지 검증한다. Part 3 연습은 등록하지 않는다.

## Task 4: Part 3의 저장·결과·반응형 흐름 검증

**Files:**
- Create: `frontend/e2e/part3-flow.spec.ts`
- Test: `frontend/src/pages/PartPage.test.tsx`
- Test: `frontend/src/pages/results.test.tsx`
- Test: `frontend/src/content/part3.test.tsx`

**Interfaces:**
- Consumes: Task 3 카탈로그, 기존 LearningSession/ProgressProvider/PartPage/결과 화면.
- Produces: 새 Part에도 기존 저장·이동 정책이 적용됨을 보여주는 회귀 테스트. 저장소·채점 코드는 새로 만들지 않는다.

- [x] Step 1: Part 3 목록에 7레슨이 표시되고 추가연습·종합연습 링크가 없는 테스트를 작성한다. 결과에서도 새 카드로 연습하기 링크가 없음을 검증한다.
- [x] Step 2: 종합 4/6과 5/6 결과로 재도전 필요/통과 경계를 검증한다. 기존 재시작 주소 정리와 진행 중 이어하기 우선순위 테스트를 재사용한다.
- [x] Step 3: 브라우저 테스트에 복수 선택 문제의 선택·제출·해설 → 목록·홈 → 이어하기 → 새로고침을 작성한다. 실제 체크와 같은 질문·해설을 확인한다.
- [x] Step 4: 턴 문제에서 네 장을 확인하고 제출 뒤 새로고침해 선택·해설 유지와 같은 턴 카드를 검증한다. 이전·다음 후 문제 영역 시작이 화면 안에 있는지 확인한다.
- [x] Step 5: 아웃츠 목록 9장이 표시되고 viewport 390×844와 1440×900에서 가로 넘침이 없는지 확인한다. 필요하면 Task 1의 카드 묶음 스타일만 조정한다.
- [x] Step 6: `npm test`와 `npm run test:e2e -- e2e/part3-flow.spec.ts` 실행. Expected: 단위·컴포넌트·모바일·데스크톱 테스트 통과. 실제 사용자 브라우저 진도는 건드리지 않는다.

## Task 5: 한글 설명·공통 규칙 갱신과 최종 검증

**Files:**
- Modify: `docs/code-walkthrough.md`
- Modify: `docs/curriculum-conventions.md`
- Modify: `docs/part-3-lesson-design.md` (상태·실제 검증 결과만 갱신)
- Modify: 이 구현계획 (체크박스·검증 기록)

**Interfaces:**
- Consumes: Tasks 1~4의 실제 변경과 검증 결과.
- Produces: 소유자가 코드에서 콘텐츠·단계별 공개·설명 카드 묶음·저장 재사용을 읽고 설명할 수 있는 한글 문서.

- [x] Step 1: 드로우 명칭, Part 3의 레슨 먼저 구현, 새 카드 필드의 기본값과 기존 저장에 영향이 없는 이유를 문서에 기록한다.
- [x] Step 2: 전체 `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e` 실행. Expected: 모두 exit 0. 실패가 있으면 원인을 조사하고 회귀 테스트를 먼저 작성해 수정한다.
- [x] Step 3: 작성한 코드와 승인 상세안을 별도 검토한다. 카드·보기·정답·강조·아웃츠·확률 조건·추가연습 제외·기존 Part 변경 범위를 확인한다.
- [x] Step 4: 저장·검증 결과와 미검증 범위를 기록하고 사용자에게 Part 3 목록 주소와 코드 해설을 안내한다. 요청 없는 커밋·푸시는 하지 않는다.

## 계획 자체 검토 및 현재 상태

- Task 1이 정의한 CommunityCards와 stage/cardGroups를 Tasks 2·3이 소비하며 이름·기본값은 일치한다.
- 기존 학습 엔진·페이지가 카탈로그를 사용하므로 Part 3 전용 페이지·저장 로직을 만드는 작업은 없다.
- 상세안의 카드 사례·아웃츠·확률·24문제는 Task 3, 저장·재도전·반응형은 Task 4, 설명 문서는 Task 5가 담당한다.
- 새 worktree·새 의존성·추가연습·DB·인증·푸시 작업이 포함되지 않았음을 확인했다.
- 사용자 승인 후 바탕화면 폴더에서 Tasks 1~5를 완료했다. 추가연습·커밋·푸시는 하지 않았다.
- 최종 검증: 단위·컴포넌트 150개, 모바일·데스크톱 브라우저 30개 통과. lint·빌드·git diff --check 통과.
- 별도 읽기 전용 검토에서 Critical/Important 문제 없음. 구현 전으로 남은 문서 상태를 실제 결과로 갱신했다.
- 검사 중 서버 종료에 따른 접속 실패는 독립 개발 서버 실행 후 전체 30개 재검증으로 해소했다. 테스트 자료의 오답 선택과 지원하지 않는 쿼리 옵션만 수정했으며 제품 채점 기준은 완화하지 않았다.
- 턴에서 숨긴 리버 카드의 이름이 노출되지 않는 회귀 테스트를 추가했다. 실제 사용자 브라우저 진도는 변경하지 않았다.
- 검증 범위: Chromium 모바일·데스크톱. 실제 휴대전화와 Safari·Firefox는 이번에 검사하지 않았다.
- 자세한 실행 기록: `docs/part-3-implementation-progress.md`.
