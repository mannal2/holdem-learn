import { expect, test } from '@playwright/test'
import { part3Lessons } from '../src/content/part3'

for (const lesson of Object.values(part3Lessons)) {
  test(`파트 3 ${lesson.id} 전체 단계의 시각 설명·퀴즈·복원을 유지한다`, async ({ page }, info) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(`/learn/part-3/${lesson.id}?restart=1`)
    for (const [index, step] of lesson.steps.entries()) {
      await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', `${index + 1}`)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      if (step.type === 'single-choice' || step.type === 'multi-choice') {
        await expect(page.locator('.draw-facts, .draw-sequences, .draw-chances')).toHaveCount(0)
        await expect(page.locator('.poker-table__highlight')).toHaveCount(0)
        const ids = step.type === 'single-choice' ? [step.correctOptionId] : step.correctOptionIds
        for (const id of ids) {
          const option = step.options.find(option => option.id === id)!
          await page.getByRole(step.type === 'single-choice' ? 'radio' : 'checkbox', { name: option.label, exact: true }).check()
        }
        await page.getByRole('button', { name: '정답 확인' }).click()
        await expect(page.getByRole('status')).toContainText('정답이에요')
        const feedback = await page.getByRole('status').innerText()
        await page.reload()
        await expect(page.getByRole('status')).toHaveText(feedback, { useInnerText: true })
        for (const id of ids) {
          const option = step.options.find(option => option.id === id)!
          await expect(page.getByRole(step.type === 'single-choice' ? 'radio' : 'checkbox', { name: option.label, exact: true })).toBeChecked()
        }
      }
      if (step.id === 'p3-3-open') {
        await expect(page.locator('[data-needed="true"]')).toHaveCount(2)
        await expect(page.getByLabel('4 · 필요한 숫자', { exact: true })).toBeVisible()
        await expect(page.getByLabel('9 · 필요한 숫자', { exact: true })).toBeVisible()
      }
      if (step.id === 'p3-5-flush-odds') {
        const both = page.getByRole('group', { name: '플랍에서 턴·리버 모두 보기', exact: true })
        await expect(both).toContainText('약 35%')
        await expect(both).toContainText('턴 또는 리버 중 적어도 한 장')
        await expect(both.locator('.draw-chance__card')).toHaveCount(2)
      }
      if (['p3-1-flop', 'p3-2-backdoor', 'p3-3-open', 'p3-3-ace', 'p3-4-open-outs', 'p3-5-conditions', 'p3-5-flush-odds', 'p3-5-rule', 'p3-6-higher-flush', 'p3-6-overlap'].includes(step.id)) {
        await page.screenshot({ path: info.outputPath(`${step.id}.png`), fullPage: true })
      }
      // 320px에서도 새 숫자 띠·확률 표시가 페이지 너비를 밀어내지 않습니다.
      if (step.visual) {
        const original = page.viewportSize()!
        await page.setViewportSize({ width: 320, height: 844 })
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
        await page.setViewportSize(original)
      }
      if (index < lesson.steps.length - 1) await page.getByRole('button', { name: '다음', exact: true }).click()
    }
    expect(errors).toEqual([])
  })
}
