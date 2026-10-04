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
  test(`${lessonId}: 모든 화면의 카드 소속·해설·모바일 넘침 확인`, async ({ page }, testInfo) => {
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
      } else await expect(page.getByRole('heading', { name: step.title, exact: true })).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      const visual = isQuestion(step) ? step.feedbackVisual ?? step.visual : step.visual
      if (visual?.kind === 'range-scene') {
        await expect(page.locator('.range-candidate')).toHaveCount(visual.candidates.length)
        await expect(page.locator('.poker-table__board .playing-card')).toHaveCount(visual.board.length)
        await expect(page.locator('.poker-table__hand .playing-card')).toHaveCount(visual.holeCards ? 2 : 0)
      }
      if (['p4-q17', 'p4-q12', 'p4-q03', 'p4-1-range', 'p4-2-early', 'p4-6-bet', 'p4-q18-v2', 'p4-q24-v2'].includes(step.id)) await page.screenshot({ path: testInfo.outputPath(`${step.id}.png`), fullPage: true })
      await page.getByRole('button', { name: step.type === 'summary' ? '완료' : '다음', exact: true }).click()
    }
    await expect(page.getByRole('link', { name: '← 레슨 목록', exact: true })).toHaveAttribute('href', '/parts/part-4')
    await expect(page.getByRole('link', { name: '새 카드로 연습하기', exact: true })).toHaveCount(0)
    expect(errors).toEqual([])
  })
}

test('복수 선택을 목록·홈 이탈 후 복원하고 제출·새로고침·이전 후에도 유지한다', async ({ page }) => {
  await page.goto('/learn/part-0/goal-and-cards')
  await page.getByRole('button', { name: '다음', exact: true }).click()
  const otherPart = await page.evaluate(() => JSON.parse(localStorage.getItem('holdem-learning-progress')!).resumeByPart['part-0'])
  await page.goto('/parts/part-4')
  await expect(page.locator('.lesson-list li')).toHaveCount(7)
  await expect(page.locator('.lesson-practice-link')).toHaveCount(0)
  await toQuestion(page, 'board-and-candidates', 'p4-q08')
  const pair = page.getByRole('checkbox', { name: '탑 페어예요.', exact: true })
  const draw = page.getByRole('checkbox', { name: '플러시 드로우예요.', exact: true })
  await pair.check()
  await draw.check()
  await page.getByRole('link', { name: '← 레슨 목록', exact: true }).click()
  await page.getByRole('link', { name: '← 홈', exact: true }).click()
  await page.getByRole('link', { name: /Part 4 이어하기/ }).click()
  await expect(pair).toBeChecked()
  await expect(draw).toBeChecked()
  await page.getByRole('button', { name: '정답 확인', exact: true }).click()
  await page.reload()
  await expect(pair).toBeChecked()
  await expect(draw).toBeChecked()
  await expect(page.getByRole('status')).toContainText('정답이에요')
  await expect(page.getByText('현재: 탑 페어 / 가능성: 플러시 드로우', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '다음', exact: true }).click()
  await page.getByRole('button', { name: '이전', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('정답이에요')
  await expect(pair).toBeChecked()
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('holdem-learning-progress')!).resumeByPart['part-0'])).toEqual(otherPart)
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('holdem-learning-progress')!).resumeByPart['part-4'])
  expect(saved.answered).toBe(3)
  expect(saved.correct).toBe(3)
})

test('턴 플러시 해설·카드·행동 이력은 재진입해도 같은 화면으로 복원된다', async ({ page }) => {
  await toQuestion(page, 'updating-a-range', 'p4-q17')
  await expect(page.locator('.poker-table__board .playing-card')).toHaveCount(4)
  await answer(page, part4Lessons['updating-a-range'].steps.find(step => step.id === 'p4-q17')!)
  await expect(page.locator('.poker-table__highlight')).toHaveCount(5)
  await page.reload()
  await expect(page.locator('.poker-table__highlight')).toHaveCount(5)
  await expect(page.locator('.poker-table__hand .poker-table__highlight')).toHaveCount(0)
  await expect(page.getByRole('group', { name: '지금까지의 행동' })).toContainText('나 콜')
  await expect(page.getByText('턴 · 추가')).toBeVisible()
  await page.getByRole('link', { name: '← 레슨 목록', exact: true }).click()
  await page.getByRole('link', { name: 'Part 4 이어하기', exact: true }).click()
  await expect(page.locator('.poker-table__highlight')).toHaveCount(5)
})

test('충돌 후보 D의 기존 선택을 복원하고 다음 화면은 같은 A·B·C로 이어진다', async ({ page }) => {
  await toQuestion(page, 'updating-a-range', 'p4-q15')
  await expect(page.locator('.range-candidate')).toHaveCount(4)
  await expect(page.getByRole('group', { name: '후보 B', exact: true })).toContainText('J♠10♠')
  // 구판의 확인용 후보 선택 ID는 D와 같은 카드이므로 그대로 복원해야 합니다.
  await page.evaluate(() => {
    const progress = JSON.parse(localStorage.getItem('holdem-learning-progress')!)
    const point = { ...progress.resumeByPart['part-4'], stepIndex: 1, answered: 1, correct: 1, submittedStepIds: ['p4-q15'], missedStepIds: [], selectedOptionIds: ['p4-q15-option-0'], selectionsByStep: { 1: ['p4-q15-option-0'] } }
    progress.recent = point
    progress.resumeByPart['part-4'] = point
    localStorage.setItem('holdem-learning-progress', JSON.stringify(progress))
  })
  await page.reload()
  await expect(page.getByRole('radio', { name: '후보 D · A♥ Q♣', exact: true })).toBeChecked()
  await expect(page.getByRole('status')).toContainText('후보 D는 제외하고 A·B·C를 살펴봐요.')
  await expect(page.getByRole('group', { name: '후보 D', exact: true })).toContainText('내 A♥와 충돌 · 제외')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.getByRole('button', { name: '다음', exact: true }).click()
  await expect(page.locator('.range-candidate')).toHaveCount(3)
  await expect(page.getByRole('group', { name: '후보 B', exact: true })).toContainText('J♠10♠')
  await expect(page.getByRole('group', { name: '후보 D', exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: '이전', exact: true }).click()
  await expect(page.getByRole('radio', { name: '후보 D · A♥ Q♣', exact: true })).toBeChecked()
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('holdem-learning-progress')!).resumeByPart['part-4'])
  expect(saved.answered).toBe(1)
})

test('종합 도전 4/6·5/6 경계와 실패 결과의 그림·조건을 확인한다', async ({ page }) => {
  const lesson = part4Lessons['range-challenge']
  for (const correctCount of [4, 5]) {
    await page.goto('/learn/part-4/range-challenge?restart=1')
    let answered = 0
    for (const step of lesson.steps) {
      if (isQuestion(step)) {
        await answer(page, step, answered < correctCount)
        answered++
      }
      await page.getByRole('button', { name: step.type === 'summary' ? '완료' : '다음', exact: true }).click()
    }
    await expect(page.getByText(`${correctCount}/6 정답 · ${Math.round(correctCount / 6 * 100)}%`, { exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: '새 카드로 연습하기' })).toHaveCount(0)
    if (correctCount === 4) {
      await expect(page.getByText('앞선 판에서 패를 확인했을 때, 이 상대의 큰 베팅은 대부분 강한 패였어요.', { exact: true })).toBeVisible()
      await expect(page.locator('.poker-table__board .playing-card')).toHaveCount(4)
      await expect(page.locator('.poker-table__highlight')).toHaveCount(5)
    } else await expect(page.getByRole('link', { name: 'Part 결과 보기' })).toBeVisible()
    await page.getByRole('link', { name: '← 레슨 목록', exact: true }).click()
    const row = page.locator('.lesson-list li').filter({ has: page.getByText(lesson.title, { exact: true }) })
    await expect(row.getByText(correctCount === 4 ? '재도전 필요' : '완료', { exact: true })).toBeVisible()
  }
})

test('구판 종합의 마지막 화면은 유지하고 변경된 세 문제를 풀어야 완료한다', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    const point = { partId: 'part-4', lessonId: 'range-challenge', stepIndex: 7, answered: 6, correct: 5, submittedStepIds: ['p4-q19', 'p4-q20', 'p4-q21', 'p4-q22', 'p4-q23', 'p4-q24'], missedStepIds: ['p4-q23'], selectedOptionIds: [], selectionsByStep: { 1: ['p4-q19-option-1'], 2: ['p4-q20-option-0'], 3: ['p4-q21-option-2'], 4: ['p4-q22-option-0', 'p4-q22-option-1'], 5: ['p4-q23-option-0'], 6: ['p4-q24-option-0'] } }
    localStorage.setItem('holdem-learning-progress', JSON.stringify({ version: 1, recent: point, resumeByPart: { 'part-4': point, 'part-0': { partId: 'part-0', lessonId: 'goal-and-cards', stepIndex: 1 } }, completedLessonIds: ['range-challenge'], completedPartIds: ['part-4'], lessonResults: { 'range-challenge': { answered: 6, correct: 5, bestPercentage: 100, attempts: 2, missedStepIds: ['p4-q23'] } } }))
  })
  await page.goto('/learn/part-4/range-challenge')
  await expect(page.getByRole('heading', { name: '핵심 정리', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: '완료', exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: '남은 문제 풀기', exact: true }).click()
  const lesson = part4Lessons['range-challenge']
  for (const step of lesson.steps.slice(4, 7)) {
    await expect(page.getByRole('group', { name: step.type === 'single-choice' || step.type === 'multi-choice' ? step.prompt : '', exact: true })).toBeVisible()
    await expect(page.getByRole('status')).toHaveCount(0)
    await answer(page, step)
    await page.reload()
    await expect(page.getByRole('status')).toContainText('정답이에요')
    if (isQuestion(step)) for (const option of step.options) {
      const selected = step.type === 'single-choice' ? option.id === step.correctOptionId : step.correctOptionIds.includes(option.id)
      await expect(page.getByRole(step.type === 'single-choice' ? 'radio' : 'checkbox', { name: option.label, exact: true })).toBeChecked({ checked: selected })
    }
    await page.getByRole('button', { name: '다음', exact: true }).click()
  }
  await page.getByRole('button', { name: '완료', exact: true }).click()
  await expect(page.getByText('6/6 정답 · 100%', { exact: true })).toBeVisible()
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('holdem-learning-progress')!))
  expect(saved.resumeByPart['part-0'].stepIndex).toBe(1)
  expect(saved.lessonResults['range-challenge'].attempts).toBe(3)
  expect(saved.lessonResults['range-challenge'].bestPercentage).toBe(100)
})
