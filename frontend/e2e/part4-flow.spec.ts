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
      if (step.id === 'p4-q17' || step.id === 'p4-q12' || step.id === 'p4-q03') await page.screenshot({ path: testInfo.outputPath(`${step.id}.png`), fullPage: true })
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
      await expect(page.getByText('확인한 여러 판에서 강한 패일 때 큰 베팅을 자주 한 상대', { exact: true })).toBeVisible()
      await expect(page.locator('.poker-table__board .playing-card')).toHaveCount(4)
      await expect(page.locator('.poker-table__highlight')).toHaveCount(5)
    } else await expect(page.getByRole('link', { name: 'Part 결과 보기' })).toBeVisible()
    await page.getByRole('link', { name: '← 레슨 목록', exact: true }).click()
    const row = page.locator('.lesson-list li').filter({ has: page.getByText(lesson.title, { exact: true }) })
    await expect(row.getByText(correctCount === 4 ? '재도전 필요' : '완료', { exact: true })).toBeVisible()
  }
})
