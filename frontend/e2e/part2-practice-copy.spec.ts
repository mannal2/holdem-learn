import { expect, test } from '@playwright/test'
import { part2PracticeQuestions } from '../src/content/part2Practice'

for (const lessonId of ['board-and-risk', 'flop-reading-challenge']) {
  test(`${lessonId}는 기존 보기 ID의 선택·해설과 오답 리뷰를 유지한다`, async ({ page }, testInfo) => {
    const ids = lessonId === 'board-and-risk'
      ? ['practice-board-and-risk-shared-1', 'practice-board-and-risk-shared-2', 'practice-board-and-risk-flush-risk-1', 'practice-board-and-risk-straight-risk-1']
      : ['practice-read-current-hand-high-1', 'practice-pair-types-top-1', 'practice-two-pair-and-set-two-1', 'practice-two-pair-and-set-set-2', 'practice-board-and-risk-shared-1', 'practice-board-and-risk-flush-risk-1']
    const optionOrders = Object.fromEntries(ids.map(id => [id, part2PracticeQuestions.find(q => q.id === id)!.options.map(option => option.id).reverse()]))
    await page.addInitScript(({ lessonId, ids, optionOrders }) => {
      if (localStorage.getItem('holdem-practice-progress')) return
      localStorage.setItem('holdem-practice-progress', JSON.stringify({ version: 1, sessions: { [lessonId]: { questionIds: ids, optionOrders, completed: false, progress: { stepIndex: 0, answered: 0, correct: 0, submittedStepIds: [], missedStepIds: [], selectedOptionIds: [], selectionsByStep: {} } } }, results: {} }))
    }, { lessonId, ids, optionOrders })
    await page.goto(`/practice/part-2/${lessonId}`)
    await page.getByRole('button', { name: '이어서 연습하기', exact: true }).click()
    for (const [index, id] of ids.entries()) {
      const q = part2PracticeQuestions.find(q => q.id === id)!
      const wrong = q.options.find(option => option.id !== q.correctOptionId)!
      await expect(page.locator('.playing-card')).toHaveCount(5)
      await expect(page.locator('.poker-table__highlight')).toHaveCount(0)
      await page.getByRole('radio', { name: wrong.label, exact: true }).check()
      await page.reload()
      await page.getByRole('button', { name: '이어서 연습하기', exact: true }).click()
      await expect(page.getByRole('radio', { name: wrong.label, exact: true })).toBeChecked()
      await page.getByRole('button', { name: '정답 확인', exact: true }).click()
      await expect(page.getByRole('status')).toContainText(q.explanation)
      await expect(page.locator('.poker-table__highlight')).toHaveCount(q.table!.highlightedCards!.length)
      await page.reload()
      await page.getByRole('button', { name: '이어서 연습하기', exact: true }).click()
      await expect(page.getByRole('radio', { name: wrong.label, exact: true })).toBeChecked()
      await expect(page.getByRole('status')).toContainText(q.explanation)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      if (q.concept === 'flush-risk' || q.concept === 'set') await page.screenshot({ path: testInfo.outputPath(`${q.concept}.png`), fullPage: true })
      await page.getByRole('button', { name: index === ids.length - 1 ? '완료' : '다음', exact: true }).click()
    }
    await page.locator('.practice-result summary').first().click()
    await expect(page.locator('.practice-result details').first().getByText(/^내 선택:/)).toBeVisible()
    await expect(page.locator('.practice-result details').first().locator('.playing-card')).toHaveCount(5)
  })
}
