# Holdem Learning MVP Design

## 1. Purpose

Build a beginner-focused Texas Hold'em learning web app that changes the learner's mental model from “poker is decided by luck” to “poker is a sequence of decisions made with incomplete information.”

The first MVP contains Part 0 and Part 1 in one React application:

- Part 0 teaches the learner to follow the flow of a hand.
- Part 1 teaches the learner to evaluate starting hands and then adjust that evaluation for position.

The MVP validates the learning experience before a Spring Boot backend is introduced. Learning content and progress storage must nevertheless use clear interfaces so the later backend integration does not require rewriting the React screens.

## 2. Audience and Success Criteria

The primary audience is a complete or near-complete beginner who finds the rules, action order, and vocabulary difficult.

The MVP succeeds when a learner can:

1. Distinguish hole cards from community cards.
2. Follow Preflop, Flop, Turn, River, and Showdown in order.
3. Explain Check, Bet, Call, Raise, and Fold in context.
4. Identify a made five-card hand at a beginner level.
5. Recognize the four useful starting-hand properties: high cards, pocket pair, suited, and connected.
6. Compare two starting hands and give a simple reason for the comparison.
7. Explain why the same hand can have a different play value in early and late position.
8. Leave a lesson and resume from the last confirmed learning step.

## 3. Product Principles

- The app is an interactive course, not a documentation site.
- The core loop is prompt, learner decision, immediate feedback, and repetition.
- Explanations stay short and appear close to the decision they explain.
- The MVP teaches reasoning before charts, memorized percentages, GTO ranges, or advanced strategy.
- The interface resembles a calm training tool rather than a casino product.
- Part 0 is recommended before Part 1, but Part 1 is not hard-locked.
- Mobile is the primary layout; tablet and desktop layouts must remain natural and fully functional.

## 4. MVP Scope

### 4.1 Part 0 — Understand the Flow of a Hand

Part 0 teaches the learner to follow what is happening at the table. It contains six lessons.

1. **Goal and cards**
   - Two private hole cards.
   - Shared community cards.
   - The best five-card poker hand wins at Showdown.
2. **Hand-ranking basics**
   - Beginner-level ordering from High Card through Royal Flush.
   - Comparison exercises instead of a long memorization page.
3. **Stages of a hand**
   - Preflop, Flop, Turn, River, and Showdown.
   - An interactive table reveals cards in the correct order.
4. **Available actions**
   - Check, Bet, Call, Raise, and Fold.
   - The learner chooses an action in simple situations and receives an explanation.
5. **Blinds and action order**
   - Dealer, Small Blind, and Big Blind.
   - The difference between Preflop action order and later streets.
6. **Guided simulated hand**
   - Guidance is gradually reduced.
   - The learner identifies the current street and an available action.

Part 0 is complete when the learner passes its final guided hand. Completion leads to a clear Part 1 call to action.

### 4.2 Part 1 — Evaluate a Starting Hand

Part 1 teaches the learner to read the two starting cards, identify useful properties, compare hands, and account for position. It contains eight lessons.

1. **Read hand notation**
   - Examples include `AKs`, `AQo`, and `TT`.
2. **Four useful properties**
   - High cards, Pocket Pair, Suited, and Connected.
3. **Identify properties**
   - The learner selects every applicable property for a displayed hand.
4. **Compare two hands**
   - Examples such as `AKs` versus `A8o`.
   - Feedback explains the meaningful difference.
5. **Classify approximate strength**
   - Strong, Good, Situational, or Weak.
   - The app does not present these labels as universal GTO truth.
6. **Understand position**
   - Early, Middle, and Late position.
   - Later action provides more information.
7. **Same hand, different position**
   - Repeated hands demonstrate that context changes play value.
8. **Combined challenge**
   - The learner combines card properties and position to make a beginner-level play-or-fold judgment.

The MVP does not teach exact opening charts, fixed equity percentages, pot odds, ranges, or postflop strategy.

### 4.3 Completion and Retry Rules

A regular Lesson is complete after the learner reaches its result screen. Its score is recorded for feedback but does not block the next Lesson. Part 0's guided hand and Part 1's combined challenge each require at least 80% correct answers to complete the Part. Failed final challenges show the missed concepts and can be retried without an attempt limit. Retrying a challenge replaces its displayed best result only when the new score is higher.

## 5. Navigation and Screen Flow

### 5.1 Routes

The application exposes the following conceptual routes:

- `/` — Home and learning-path overview.
- `/parts/:partId` — Part introduction, lesson list, and completion state.
- `/learn/:partId/:lessonId` — Interactive lesson session.
- `/results/:partId/:lessonId` — Lesson result and next action.
- `/results/:partId` — Part result and next-part recommendation.

Unknown Part or Lesson identifiers display a useful not-found state with a route back to Home.

### 5.2 Home

Home displays:

- A prominent “Continue learning” action when resumable progress exists.
- Progress for Part 0 and Part 1.
- Both Part cards at all times.
- A recommended sequence without hard-locking Part 1.

### 5.3 Part Introduction

A Part page displays its learning objective, Lesson list, completion states, and the appropriate primary action:

- Start when untouched.
- Continue when in progress.
- Review or retake when complete.

### 5.4 Learning Session

A learning session displays the current Part, Lesson, progress, interactive content, feedback, and navigation controls. A submitted answer must show its feedback before the learner advances.

The supported MVP step types are deliberately limited to:

1. Short explanation.
2. Interactive card or table progression.
3. Choice-based question.
4. Result and feedback.

### 5.5 Results

A Lesson result summarizes the score, concepts learned, important mistakes, retry option, and next Lesson. A Part result summarizes the acquired abilities and offers review or next-Part actions.

## 6. Progress and Resume Behavior

The first React version stores progress in the browser without login.

Progress is saved only after a confirmed action:

- The learner advances from an explanation.
- The learner submits a quiz answer.
- A Lesson is completed.
- A Part is completed.

Selecting an answer without submitting it is not persisted.

Saved progress includes:

- Current Part identifier.
- Current Lesson identifier.
- Last confirmed step index.
- Completed Lesson identifiers.
- Completed Part identifiers.
- Per-Lesson answered and correct counts.

On return, Home offers a direct continuation action. Entering an in-progress Part resumes its last incomplete Lesson and confirmed step. Entering a completed Part offers review, quiz retry, or movement to the next Part.

The user can reset one Part or all progress. Reset operations require confirmation.

Browser storage limitations must be made clear: progress belongs to that browser and device, can be removed with browser data, and may not survive private browsing.

## 7. Frontend Architecture

### 7.1 Stack

- React with TypeScript.
- Vite for development and production builds.
- React Router for route handling.
- React Context plus `useReducer` for the small global learning state.
- Plain CSS and CSS custom properties for styling and responsive tokens.
- Vitest and React Testing Library for unit and component tests.
- Playwright for a minimal end-to-end learning flow.

Redux, a server-state library, a UI framework, and a content-management system are outside the MVP.

### 7.2 Module Boundaries

```text
src/
├── app/                 Application entry point, routes, and providers
├── pages/               Home, Part, learning, and result pages
├── features/learning/   Step progression, answer evaluation, result calculation
├── features/progress/   Progress state and persistence
├── components/          Cards, table, progress, feedback, and common UI
├── content/             Typed Part 0 and Part 1 course data
├── types/               Course, Lesson, Step, answer, and progress contracts
└── styles/              Design tokens, global rules, and responsive layout
```

Learning content contains prompts, cards, choices, correct answers, and explanations. It does not contain navigation or persistence behavior. The learning feature interprets typed content and produces UI state. Pages compose the feature and reusable components.

### 7.3 Content Model

The content model uses a discriminated union for supported step types so TypeScript can require the correct data for each renderer. Course, Part, and Lesson identifiers are stable strings because they are persisted and will later be exchanged with the backend.

The model must be narrow enough to remain understandable. A new abstraction is added only when at least two real Part 0 or Part 1 cases need it.

### 7.4 Progress Repository

React components do not call `localStorage` directly. They depend on this repository boundary:

```ts
interface ProgressRepository {
  load(): Promise<LearningProgress>;
  save(progress: LearningProgress): Promise<void>;
  reset(partId?: string): Promise<void>;
}
```

The MVP provides `LocalProgressRepository`. A later Spring Boot phase can provide `ApiProgressRepository` without changing the learning pages.

## 8. Data Flow

1. The router resolves a Part and Lesson identifier.
2. The content catalog returns the typed Lesson.
3. Saved progress identifies the last confirmed step.
4. The learning session renders the current step through the matching renderer.
5. The learner advances or submits an answer.
6. A pure learning function evaluates the action and produces feedback and updated progress.
7. The reducer updates the visible state.
8. The progress repository persists the confirmed state.
9. Completion routes the learner to the relevant result page.

## 9. Error Handling

- Missing stored progress starts a new learning state.
- Invalid or incompatible stored JSON is discarded safely and replaced with a clean state; the learner receives a short explanation.
- A storage write failure does not stop the active Lesson; the learner is warned that the latest progress may not persist.
- Unknown Part or Lesson identifiers display a recoverable not-found state.
- An unsupported step type produces a visible content error instead of a blank screen.
- Content validation runs in tests so missing answers, duplicate identifiers, and invalid routes fail before deployment.

## 10. Responsive and Visual Design

The visual direction is “calm poker table plus modern learning app.”

- Deep green is the identifying color.
- Cards and instructional content use bright, high-contrast surfaces.
- Casino-style gold, neon, chip explosions, and excessive decoration are excluded.
- Correct and incorrect states use icons and text in addition to color.
- Card ranks and suits remain legible on small screens.
- Motion is limited to card reveals, feedback transitions, and clear progress changes.
- Reduced-motion preferences are respected.

Mobile layouts use a single primary column and large reachable actions. Comparison content can become a two-column layout when space permits. Desktop content has a readable maximum width rather than stretching across the viewport.

## 11. Accessibility

- Every action is operable by keyboard.
- Focus states are visible.
- Playing cards have meaningful accessible labels such as “Ace of spades.”
- Suit and feedback meaning never depends on color alone.
- Feedback is announced appropriately after answer submission.
- Buttons and interactive targets meet reasonable mobile touch sizes.
- Heading levels and landmarks describe the learning hierarchy.

## 12. Testing Strategy

### Unit tests

- Answer evaluation for every supported question form.
- Step advancement and completion.
- Progress percentage calculation.
- Resume target calculation.
- Part and all-progress reset.

### Component tests

- Card rendering and accessible labels.
- Answer selection, submission, and feedback.
- Feedback-before-advance behavior.
- Home continuation action.
- Part start, continue, and review actions.

### Repository tests

- Save and load valid progress.
- Start cleanly when storage is empty.
- Recover from malformed or incompatible stored data.
- Surface write failure without stopping the Lesson.

### End-to-end test

One core Playwright flow covers starting Part 0, completing confirmed steps, leaving, resuming, completing the Part, and following the Part 1 recommendation. Representative mobile and desktop viewports are included.

## 13. Code Understanding Deliverable

`docs/code-walkthrough.md` is part of the MVP, not an optional afterthought. It is updated after each implementation milestone and explains:

- The user-facing purpose of the milestone.
- The responsibility of each relevant file.
- Inputs, outputs, and data flow.
- Important state and functions.
- The reason for material technical choices.
- What the tests protect.
- Where a future change would be made.

After each milestone, implementation pauses for a user-facing walkthrough before the next milestone begins. The goal is that the project owner can read, explain, and safely navigate the code even when the agent performed the mechanical implementation.

## 14. Delivery Sequence

1. Establish the React project, design tokens, routes, and test foundations.
2. Define typed course content and build reusable card and learning primitives.
3. Implement and verify Part 0.
4. Explain Part 0 code and update the walkthrough.
5. Implement and verify Part 1.
6. Explain Part 1 code and update the walkthrough.
7. Connect the full Home, resume, results, and Part transition flow.
8. Verify responsive behavior, accessibility, tests, and production build.
9. Finalize portfolio-facing README and code walkthrough.

Spring Boot planning and implementation begin only after separate approval of the completed React MVP.

## 15. Out of Scope

- Login, accounts, and cross-device progress.
- Spring Boot, database, and deployment infrastructure.
- Multiplayer poker gameplay.
- Real-money or gambling features.
- Exact GTO opening charts.
- Equity calculation, ranges, pot odds, EV, bluffing, or postflop strategy.
- Administrative course editor.
- Localization.

## 16. Material Tradeoffs

- Local browser persistence is simple and supports resume behavior, but it is device-specific and temporary compared with an authenticated backend.
- A small content-driven engine creates more initial modeling work than separate hard-coded pages, but avoids repeated lesson code and provides a clean backend migration boundary.
- Plain CSS keeps the implementation transparent and dependency-light, but requires the project to own its responsive and accessibility details.
- Pausing for code walkthroughs slows delivery but directly supports the portfolio goal of genuine code comprehension.
