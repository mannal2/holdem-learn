# AGENTS.md

## 작업 위치 — 사용자 확정, 2026-10-02

- 이 프로젝트의 실제 작업 폴더는 `C:\Users\dlwjd\Desktop\holdem`이다. 프론트엔드는 그 아래 `frontend`다.
- 파일 수정, 테스트, 빌드, 개발 서버 실행은 모두 바탕화면 폴더에서 수행한다. 명령의 작업 디렉터리를 확인한다.
- `.codex/worktrees/holdem-react-mvp/holdem`은 이전 작업 보존용이다. 최신 코드가 있다는 이유로 그곳에서 다시 작업하거나 서버를 실행하지 않는다.
- 사용자가 별도로 요청하지 않는 한 새 워크트리를 만들거나 작업 위치를 워크트리로 바꾸지 않는다.
- 2026-10-02 기존 워크트리의 변경 파일 48개를 바탕화면 폴더로 이전하고 파일 해시가 일치함을 확인했다. 이후 최신 작업의 기준은 바탕화면 폴더다.

## Mandatory Instructions

Read this file before making any code changes.

These instructions apply to all files in this repository. Merge them with any more specific instructions found in nested `AGENTS.md` files.

When modifying code:

1. State assumptions.
2. Prefer the simplest solution.
3. Make the smallest possible change.
4. Avoid unnecessary abstractions.
5. Explain material tradeoffs.
6. Verify correctness before claiming success.

**Tradeoff:** These guidelines prioritize caution and correctness over speed. For trivial tasks, apply reasonable judgment.

## 1. Think Before Coding

Do not silently assume missing details or hide uncertainty.

Before implementing:

* State relevant assumptions explicitly.
* When multiple reasonable interpretations exist, present them instead of choosing silently.
* Identify a simpler approach when one exists.
* Push back when the requested solution is unnecessarily complex.
* If a required detail is unclear and affects correctness, stop and ask for clarification.

## 2. Simplicity First

Write the minimum code necessary to solve the requested problem.

* Do not add features beyond the request.
* Do not introduce abstractions for single-use code.
* Do not add flexibility or configurability that was not requested.
* Do not add defensive handling for impossible scenarios.
* If the implementation is materially more complex than necessary, simplify it.

Before finalizing, ask: “Would a senior engineer consider this overengineered?” If yes, reduce complexity.

## 3. Surgical Changes

Modify only what is necessary for the request.

* Do not improve unrelated code, comments, formatting, or naming.
* Do not refactor code that is not related to the requested change.
* Follow the repository's existing style and conventions.
* If unrelated dead code is discovered, mention it but do not remove it unless asked.
* Remove imports, variables, or functions only when this change makes them unused.
* Do not remove pre-existing unused code unless explicitly requested.

Every changed line should be directly traceable to the user's request.

## 4. Goal-Driven Execution

Define concrete success criteria before implementing.

For multi-step tasks, state a brief plan in this format:

1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]

Before claiming success:

* Run the most relevant available tests, build, lint, type check, or reproduction steps.
* State what was verified and what could not be verified.
* Do not claim success when verification was not performed.

## 5. 커리큘럼 작업의 필수 기준

새 Part·레슨·추가 연습을 추가하거나 기존 학습 흐름을 바꾸기 전에 [커리큘럼 구현 공통 규칙](docs/curriculum-conventions.md)을 끝까지 읽는다. 코드 구조는 [코드 해설](docs/code-walkthrough.md)을 참고한다.

- 공통 저장·복원·스크롤은 `LearningSession`을 재사용한다. 레슨별 예외 처리나 화면 복사로 다시 구현하지 않는다.
- 레슨과 연습 모두 제출한 현재 문제·선택·해설을 복원한다. 다음 버튼을 눌러야 다음 단계로 저장한다.
- 미통과 도전은 재도전 필요 / 다시 풀기, 진행 중 위치는 이어하기가 우선이다.
- 연습 잠시 나가기·중복 목록 복귀·별도 시작 안내 박스를 다시 추가하지 않는다. 시작·이어하기는 상단 소개 영역에 둔다.
- 이번 작업만이 아니라 앞으로 추가되는 커리큘럼에도 문서의 체크리스트로 검증한다.
- 사용자 설명과 설계 문서는 한글로 작성한다. 승인된 정책을 변경하려면 먼저 사용자와 합의하고 위 문서를 갱신한다.
