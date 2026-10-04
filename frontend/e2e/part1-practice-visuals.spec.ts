import { expect, test } from '@playwright/test'
import { part1PracticeQuestions } from '../src/content/part1Practice'

for (const lesson of ['same-hand-different-position', 'starting-hand-challenge']) {
  test(`${lesson}의 기존 회차에서 자리·카드·선택·해설을 복원한다`, async ({ page }, testInfo) => {
    const ids = ['practice-same-hand-different-position-1', 'practice-same-hand-different-position-2', 'practice-same-hand-different-position-5', 'practice-same-hand-different-position-8']
    if (lesson === 'starting-hand-challenge') ids.splice(0, 1, 'practice-identify-properties-1', 'practice-compare-hands-1', 'practice-classify-strength-1')
    const optionOrders = Object.fromEntries(ids.map(id => [id, part1PracticeQuestions.find(q => q.id === id)!.options.map(option => option.id).reverse()]))
    await page.addInitScript(({ lesson, ids, optionOrders }) => {
      if (localStorage.getItem('holdem-practice-progress')) return
      localStorage.setItem('holdem-practice-progress', JSON.stringify({ version: 1, sessions: { [lesson]: { questionIds: ids, optionOrders, completed: false, progress: { stepIndex: 0, answered: 0, correct: 0, submittedStepIds: [], missedStepIds: [], selectedOptionIds: [], selectionsByStep: {} } } }, results: {} }))
    }, { lesson, ids, optionOrders })
    await page.goto(`/practice/part-1/${lesson}`)
    await page.getByRole('button', { name: '이어서 연습하기', exact: true }).click()
    for (const [index, id] of ids.entries()) {
      const question = part1PracticeQuestions.find(q => q.id === id)!
      if (id.startsWith('practice-same-hand')) {
        await expect(page.locator('.learning-session .playing-card')).toHaveCount(2)
        const early = id.endsWith('-1') || id.endsWith('-5')
        await expect(page.getByRole('group', { name: early ? 'UTG · 내 자리' : '딜러 버튼 · 내 자리', exact: true })).toBeVisible()
        await expect(page.getByRole('group', { name: / · 이미 폴드$/ })).toHaveCount(early ? 0 : 3)
        await expect(page.getByRole('group', { name: / · 아직 행동 전$/ })).toHaveCount(early ? 5 : 2)
        await page.screenshot({ path: testInfo.outputPath(`${id}.png`), fullPage: true })
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      const first = question.options.find(option => option.id === optionOrders[id][0])!
      const input = page.getByRole(question.type === 'multi-choice' ? 'checkbox' : 'radio', { name: first.label, exact: true })
      await input.check()
      await page.getByRole('button', { name: '정답 확인', exact: true }).click()
      const feedback = await page.getByRole('status').textContent()
      const stored = await page.evaluate(() => localStorage.getItem('holdem-practice-progress'))
      await page.reload()
      await page.getByRole('button', { name: '이어서 연습하기', exact: true }).click()
      await expect(input).toBeChecked()
      await expect(page.getByRole('status')).toHaveText(feedback!)
      expect(await page.evaluate(() => localStorage.getItem('holdem-practice-progress'))).toBe(stored)
      await page.getByRole('button', { name: index === ids.length - 1 ? '완료' : '다음', exact: true }).click()
    }
    await page.locator('.practice-result summary').first().click()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    if (lesson === 'same-hand-different-position') await expect(page.locator('.practice-result details').first().locator('.playing-card')).toHaveCount(2)
  })
}
