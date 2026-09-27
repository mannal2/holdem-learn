import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test('Part 0을 시작하고 이탈한 뒤 이어서 학습한다', async ({ page }) => {
  await page.getByRole('link', { name: 'Part 0 시작하기' }).click()
  await page.getByRole('link', { name: '첫 Lesson 시작하기' }).click()
  await page.getByRole('button', { name: '다음' }).click()
  await page.goto('/')
  const continueLink = page.getByRole('link', { name: /Part 0 이어하기/ })
  await expect(continueLink).toBeVisible()
  await continueLink.click()
  await expect(page.getByRole('heading', { name: '함께 쓰는 공용 카드' })).toBeVisible()
})

test('Part 1에 직접 접근해 카드 특징 문제의 해설을 확인한다', async ({ page }) => {
  await page.goto('/learn/part-1/identify-properties')
  await page.getByRole('checkbox', { name: '높은 카드' }).check()
  await page.getByRole('checkbox', { name: '수딧' }).check()
  await page.getByRole('checkbox', { name: '커넥티드' }).check()
  await page.getByRole('button', { name: '정답 확인' }).click()
  await expect(page.getByText(/A와 K는 높은 카드이면서/)).toBeVisible()
})
