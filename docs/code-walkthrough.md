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
