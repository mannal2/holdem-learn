import { expect, test, type Page } from '@playwright/test'
import { part4, part4Lessons } from '../src/content/part4'
import type { LearningStep } from '../src/types/course'

const isQuestion = (step: LearningStep) => step.type === 'single-choice' || step.type === 'multi-choice'
async function answer(page: Page, step: LearningStep, correct = true) {
  if (!isQuestion(step)) return
  const ids = step.type === 'single-choice' ? [step.correctOptionId] : step.correctOptionIds
  const options = correct ? step.options.filter(option => ids.includes(option.id)) : [step.options.find(option => !ids.includes(option.id)) ?? step.options[0]]
  for (const option of options) await page.getByRole(step.type === 'single-choice' ? 'radio' : 'checkbox', { name: option.label, exact: true }).check()
  await page.getByRole('button', { name: '정답 확인', exact: true }).click()
}
async function toQuestion(page: Page, lessonId: string, questionId: string) {
  await page.goto(`/learn/part-4/${lessonId}`)
  for (const step of part4Lessons[lessonId].steps) {
    if (step.id === questionId) return
    await answer(page, step)
    await page.getByRole('button', { name: '다음', exact: true }).click()
  }
  throw new Error('대상 문제를 찾지 못했습니다.')
}

for (const lessonId of part4.lessonIds) {
  const lesson = part4Lessons[lessonId]
  test(`${lessonId}: 모든 화면과 제출 전후 후보·복원·넘침`, async ({ page }, testInfo) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(`/learn/part-4/${lessonId}`)
    for (const step of lesson.steps) {
      if (isQuestion(step)) {
        await expect(page.getByRole('group', { name: step.prompt, exact: true })).toBeVisible()
        await expect(page.locator('.poker-table__highlight')).toHaveCount(0)
        await expect(page.locator('.range-candidate__status')).toHaveCount(0)
        await answer(page, step)
        await expect(page.getByRole('status')).toContainText('정답이에요')
        await expect(page.getByRole('status')).toContainText(step.explanation)
        await page.reload()
        await expect(page.getByRole('status')).toContainText(step.explanation)
      } else await expect(page.getByRole('heading', { name: step.title, exact: true })).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      const visual = isQuestion(step) ? step.feedbackVisual ?? step.visual : step.visual
      if (visual?.kind === 'range-scene') {
        await expect(page.locator('.range-candidate')).toHaveCount(visual.candidates.length)
        await expect(page.locator('.poker-table__board .playing-card')).toHaveCount(visual.board.length)
        await expect(page.locator('.poker-table__hand .playing-card')).toHaveCount(0)
      }
      if (['p4-seq-q01', 'p4-seq-q04', 'p4-seq-q06', 'p4-seq-q11', 'p4-seq-q13', 'p4-seq-q14', 'p4-seq-q17', 'p4-seq-q23', 'p4-seq-q30', 'p4-seq-1-position', 'p4-seq-1-candidates', 'p4-seq-3-uncertainty'].includes(step.id.replace(/-v\d+$/, ''))) await page.screenshot({ path: testInfo.outputPath(`${step.id}.png`), fullPage: true })
      await page.getByRole('button', { name: step.type === 'summary' ? '완료' : '다음', exact: true }).click()
    }
    await expect(page.getByRole('link', { name: '← 레슨 목록', exact: true })).toHaveAttribute('href', '/parts/part-4')
    await expect(page.getByRole('link', { name: '새 카드로 연습하기', exact: true })).toHaveCount(0)
    expect(errors).toEqual([])
  })
}

test('복수 선택을 홈·목록·새로고침·이전 이동 후 같은 문제로 복원한다', async ({ page }) => {
  await page.goto('/learn/part-0/goal-and-cards')
  await page.getByRole('button', { name: '다음', exact: true }).click()
  const other = await page.evaluate(() => JSON.parse(localStorage.getItem('holdem-learning-progress')!).resumeByPart['part-0'])
  await toQuestion(page, 'range-flop-actions', 'p4-seq-q08-v2')
  const question = part4Lessons['range-flop-actions'].steps.find(step => step.id === 'p4-seq-q08-v2')!
  if (question.type !== 'multi-choice') throw new Error('복수 선택이어야 합니다.')
  const choices = question.options.filter(option => question.correctOptionIds.includes(option.id))
  for (const choice of choices) await page.getByRole('checkbox', { name: choice.label, exact: true }).check()
  await page.getByRole('link', { name: '← 레슨 목록', exact: true }).click()
  await page.getByRole('link', { name: '← 홈', exact: true }).click()
  await page.getByRole('link', { name: /Part 4 이어하기/ }).click()
  for (const choice of choices) await expect(page.getByRole('checkbox', { name: choice.label, exact: true })).toBeChecked()
  await page.getByRole('button', { name: '정답 확인', exact: true }).click()
  await page.reload()
  await expect(page.getByRole('status')).toContainText(question.explanation)
  await page.getByRole('button', { name: '다음', exact: true }).click()
  await page.getByRole('button', { name: '이전', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('정답이에요')
  for (const choice of choices) await expect(page.getByRole('checkbox', { name: choice.label, exact: true })).toBeChecked()
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('holdem-learning-progress')!))
  expect(saved.resumeByPart['part-0']).toEqual(other)
  expect(saved.resumeByPart['part-4'].answered).toBe(2)
})

test('구판 기록만 한 번 삭제하고 구판 주소는 목록으로 안내한다', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    const point = { partId: 'part-4', lessonId: 'range-challenge', stepIndex: 7, answered: 6, correct: 5, submittedStepIds: ['p4-q24-v2'], selectionsByStep: { 6: ['p4-q24-v2-option-0'] } }
    localStorage.setItem('holdem-learning-progress', JSON.stringify({ version: 1, recent: point, resumeByPart: { 'part-4': point, 'part-0': { partId: 'part-0', lessonId: 'goal-and-cards', stepIndex: 1 } }, completedLessonIds: ['range-challenge', 'guided-hand'], completedPartIds: ['part-4', 'part-0'], lessonResults: { 'range-challenge': { answered: 6, correct: 5, bestPercentage: 100, attempts: 2 }, 'guided-hand': { answered: 5, correct: 5, bestPercentage: 100, attempts: 1 } } }))
    localStorage.setItem('holdem-practice-progress', 'unchanged-practice')
  })
  await page.goto('/learn/part-4/board-and-candidates')
  await expect(page).toHaveURL(/\/parts\/part-4$/)
  await expect(page.locator('.lesson-list li')).toHaveCount(7)
  const cleaned = await page.evaluate(() => JSON.parse(localStorage.getItem('holdem-learning-progress')!))
  expect(cleaned.resumeByPart['part-4']).toBeUndefined()
  expect(cleaned.resumeByPart['part-0'].stepIndex).toBe(1)
  expect(cleaned.completedLessonIds).toEqual(['guided-hand'])
  expect(cleaned.completedPartIds).toEqual(['part-0'])
  expect(Object.keys(cleaned.lessonResults)).toEqual(['guided-hand'])
  expect(await page.evaluate(() => localStorage.getItem('holdem-practice-progress'))).toBe('unchanged-practice')
  await toQuestion(page, 'range-turn', 'p4-seq-q11-v2')
  const step = part4Lessons['range-turn'].steps.find(s => s.id === 'p4-seq-q11-v2')!
  await answer(page, step)
  await page.reload()
  await expect(page.getByRole('group', { name: '후보 D', exact: true })).toContainText('가능성 ↓')
  await expect(page.getByRole('status')).toContainText('정답이에요')
  await page.goto('/results/part-4/range-challenge')
  await expect(page).toHaveURL(/\/parts\/part-4$/)
  await page.getByRole('link', { name: 'Part 4 이어하기', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('정답이에요')
})

test('종합 도전 9/12·10/12 경계와 오답의 카드·행동·조건을 보존한다', async ({ page }) => {
  const lesson = part4Lessons['range-hand-challenge']
  for (const correctCount of [9, 10]) {
    await page.goto('/learn/part-4/range-hand-challenge?restart=1')
    let answered = 0
    for (const step of lesson.steps) {
      if (isQuestion(step)) await answer(page, step, answered++ < correctCount)
      await page.getByRole('button', { name: step.type === 'summary' ? '완료' : '다음', exact: true }).click()
    }
    await expect(page.getByText(`${correctCount}/12 정답 · ${Math.round(correctCount / 12 * 100)}%`, { exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Part 결과 보기' })).toHaveCount(correctCount === 10 ? 1 : 0)
    await expect(page.getByRole('group', { name: '지금까지의 행동' }).last()).toContainText('상대 BB 60칩 베팅')
    await expect(page.getByText('상대 성향: 리버 블러프 빈도는 아직 모름.', { exact: true })).toBeVisible()
    await page.getByRole('link', { name: '← 레슨 목록', exact: true }).click()
    const row = page.locator('.lesson-list li').filter({ has: page.getByText(lesson.title, { exact: true }) })
    await expect(row.getByText(correctCount === 9 ? '재도전 필요' : '완료', { exact: true })).toBeVisible()
  }
})

test('통합 전 변형 문제의 위치를 복원하고 구판 답 정리 후 신판 답은 유지한다', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    const point = { partId: 'part-4', lessonId: 'range-variations', stepIndex: 2, answered: 1, correct: 1,
      submittedStepIds: ['p4-seq-q16'], selectedOptionIds: ['p4-seq-q16-option-1'], selectionsByStep: { 2: ['p4-seq-q16-option-1'] } }
    localStorage.setItem('holdem-learning-progress', JSON.stringify({ version: 1, recent: point, resumeByPart: { 'part-4': point }, completedLessonIds: [], completedPartIds: [], lessonResults: {} }))
  })
  await page.goto('/learn/part-4/range-variations')
  await expect(page.getByRole('status')).toHaveCount(0)
  await expect(page.getByRole('radio', { checked: true })).toHaveCount(0)
  await expect(page.getByText('2/6', { exact: true })).toBeVisible()
  const question = part4Lessons['range-variations'].steps[1]
  await answer(page, question)
  await page.reload()
  if (question.type !== 'single-choice') throw new Error('단일 선택이어야 합니다.')
  await expect(page.getByRole('status')).toContainText(question.explanation)
  await expect(page.getByRole('radio', { name: question.options[1].label, exact: true })).toBeChecked()
  await page.getByRole('button', { name: '다음', exact: true }).click()
  await page.reload()
  const next = part4Lessons['range-variations'].steps[2]
  if (next.type !== 'multi-choice') throw new Error('복수 선택이어야 합니다.')
  await expect(page.getByRole('group', { name: next.prompt, exact: true })).toBeVisible()
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('holdem-learning-progress')!).resumeByPart['part-4'])
  expect(saved.stepIndex).toBe(2)
  expect(saved.lessonRevision).toBe(1)
  expect(saved.submittedStepIds).toEqual(['p4-seq-q16-v2'])
})

test('직전 문항의 구판 제출을 같은 위치에서 정리하고 새 답·해설을 복원한다', async ({ page }, testInfo) => {
  await page.goto('/')
  await page.evaluate(() => {
    const point = { partId: 'part-4', lessonId: 'range-preflop', stepIndex: 4, answered: 2, correct: 1,
      submittedStepIds: ['p4-seq-q01', 'p4-seq-q02-v2'], missedStepIds: ['p4-seq-q02-v2'],
      selectedOptionIds: ['p4-seq-q02-v2-option-0'], selectionsByStep: { 2: ['p4-seq-q01-option-1'], 4: ['p4-seq-q02-v2-option-0'] } }
    localStorage.setItem('holdem-learning-progress', JSON.stringify({ version: 1, recent: point, resumeByPart: { 'part-4': point },
      completedLessonIds: ['range-preflop'], completedPartIds: [], lessonResults: { 'range-preflop': { answered: 3, correct: 2, bestPercentage: 100, attempts: 2 } } }))
  })
  await page.goto('/learn/part-4/range-preflop')
  await expect(page.getByText('5/8', { exact: true })).toBeVisible()
  await expect(page.getByRole('status')).toHaveCount(0)
  await expect(page.getByRole('radio', { checked: true })).toHaveCount(0)
  const cleaned = await page.evaluate(() => JSON.parse(localStorage.getItem('holdem-learning-progress')!))
  expect(cleaned.resumeByPart['part-4']).toMatchObject({ stepIndex: 4, answered: 0, correct: 0, submittedStepIds: [], selectionsByStep: {} })
  expect(cleaned.completedLessonIds).toEqual(['range-preflop'])
  expect(cleaned.lessonResults['range-preflop']).toEqual({ answered: 3, correct: 2, bestPercentage: 100, attempts: 2 })
  await page.screenshot({ path: testInfo.outputPath('revised-q02-before-answer.png'), fullPage: true })
  const question = part4Lessons['range-preflop'].steps[4]
  await answer(page, question)
  await page.reload()
  if (question.type !== 'single-choice') throw new Error('단일 선택이어야 합니다.')
  await expect(page.getByRole('status')).toContainText(question.explanation)
  await expect(page.getByRole('radio', { name: question.options[2].label, exact: true })).toBeChecked()
  await page.getByRole('button', { name: '다음', exact: true }).click()
  await page.getByRole('button', { name: '이전', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('정답이에요')
  const resumed = await page.evaluate(() => JSON.parse(localStorage.getItem('holdem-learning-progress')!).resumeByPart['part-4'])
  expect(resumed.submittedStepIds).toEqual(['p4-seq-q02-v3'])
  expect(resumed.answered).toBe(1)
})
