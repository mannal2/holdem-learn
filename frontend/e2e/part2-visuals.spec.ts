import { expect, test } from '@playwright/test'
import { part2Lessons } from '../src/content/part2'

for (const lesson of Object.values(part2Lessons)) {
  test(`파트 2 ${lesson.id}의 카드 영역·정답 공개·복원을 유지한다`, async ({ page }, testInfo) => {
    await page.goto(`/learn/part-2/${lesson.id}`)
    for (const [index, step] of lesson.steps.entries()) {
      if (step.type === 'single-choice') {
        await expect(page.locator('.poker-table__highlight')).toHaveCount(0)
        const option = step.options.find(option => option.id === step.correctOptionId)!
        await page.getByRole('radio', { name: option.label, exact: true }).check()
        await page.getByRole('button', { name: '정답 확인', exact: true }).click()
        await expect(page.getByRole('status')).toBeVisible()
        await page.reload()
        await expect(page.getByRole('radio', { name: option.label, exact: true })).toBeChecked()
        await expect(page.getByRole('status')).toBeVisible()
      }
      if ('table' in step || step.type === 'table-reveal' || step.visual?.kind === 'table') {
        const board = page.getByRole('group', { name: '공용 카드', exact: true })
        const hand = page.getByRole('group', { name: '내 개인 카드', exact: true })
        await expect(board.locator('.playing-card')).toHaveCount(3)
        await expect(hand.locator('.playing-card')).toHaveCount(2)
        const boardBox = (await board.boundingBox())!
        expect((await hand.boundingBox())!.y).toBeGreaterThan(boardBox.y + boardBox.height)
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      if (index === 0) await page.screenshot({ path: testInfo.outputPath(`${lesson.id}.png`), fullPage: true })
      await page.getByRole('button', { name: index === lesson.steps.length - 1 ? '완료' : '다음', exact: true }).click()
    }
    await expect(page).toHaveURL(new RegExp(`/results/part-2/${lesson.id}$`))
  })
}
