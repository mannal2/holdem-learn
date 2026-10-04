import { expect, test } from '@playwright/test'

test('표기 문제는 제출 후 카드 공개, 홈 복귀·새로고침·이전에도 선택과 해설을 유지한다', async ({ page }, info) => {
  await page.goto('/learn/part-1/hand-notation?restart=1')
  await expect(page.locator('.playing-card')).toHaveCount(6)
  await page.screenshot({ path: info.outputPath('notation.png'), fullPage: true })
  await page.getByRole('button', { name: '다음', exact: true }).click()
  await expect(page.locator('.playing-card')).toHaveCount(0)
  await page.getByRole('radio', { name: '같은 무늬의 A와 K', exact: true }).check()
  await page.getByRole('button', { name: '정답 확인' }).click()
  await expect(page.locator('.playing-card')).toHaveCount(2)
  const feedback = await page.getByRole('status').textContent()
  await page.getByRole('link', { name: '← 레슨 목록', exact: true }).click()
  await page.getByRole('link', { name: '← 홈', exact: true }).click()
  await page.getByRole('link', { name: /Part 1 이어하기/ }).click()
  await expect(page.getByRole('radio', { name: '같은 무늬의 A와 K', exact: true })).toBeChecked()
  await expect(page.getByRole('status')).toHaveText(feedback!)
  await page.reload()
  await expect(page.locator('.playing-card')).toHaveCount(2)
  await expect(page.getByRole('status')).toHaveText(feedback!)
  await page.getByRole('button', { name: '다음', exact: true }).click()
  await expect(page.locator('.playing-card')).toHaveCount(0)
  await page.getByRole('button', { name: '이전', exact: true }).click()
  await expect(page.getByRole('radio', { name: '같은 무늬의 A와 K', exact: true })).toBeChecked()
  await expect(page.locator('.playing-card')).toHaveCount(2)
})

test('파트 1의 모든 레슨 화면은 카드·자리 도식을 읽을 수 있고 화면이 넘치지 않는다', async ({ page }, info) => {
  const lessons: [string, number][] = [['hand-notation', 5], ['hand-properties', 5], ['identify-properties', 4], ['compare-hands', 3], ['classify-strength', 5], ['understand-position', 5], ['same-hand-different-position', 5], ['starting-hand-challenge', 5]]
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  for (const [lesson, count] of lessons) {
    await page.goto(`/learn/part-1/${lesson}?restart=1`)
    for (let index = 0; index < count; index++) {
      await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', `${index + 1}`)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      for (const group of await page.locator('.rule-hand-group').all()) {
        await expect(group.locator('.playing-card')).toHaveCount(2)
      }
      if (lesson === 'compare-hands') {
        await expect(page.getByRole('group', { name: '시작 패 A', exact: true })).toBeVisible()
        await expect(page.getByRole('group', { name: '시작 패 B', exact: true })).toBeVisible()
      }
      if (lesson === 'same-hand-different-position' && index < 4) {
        await expect(page.locator('.playing-card')).toHaveCount(2)
        await expect(page.locator('.rule-seat')).toHaveCount(6)
        await expect(page.getByText('이미 폴드', { exact: true })).toHaveCount(index % 2 ? 3 : 0)
        await expect(page.getByText('아직 행동 전', { exact: true })).toHaveCount(index % 2 ? 2 : 5)
      }
      if (lesson === 'starting-hand-challenge') {
        await expect(page.getByRole('list', { name: '이번 상황의 조건' })).toBeVisible()
        await expect(page.locator('.playing-card')).toHaveCount(2)
      }
      if (index === 0 || (lesson === 'same-hand-different-position' && index === 1)) {
        await page.screenshot({ path: info.outputPath(`${lesson}-${index}.png`), fullPage: true })
      }
      const choices = page.getByRole('radio').or(page.getByRole('checkbox'))
      if (await choices.count()) {
        await choices.first().check()
        await page.getByRole('button', { name: '정답 확인' }).click()
        await expect(page.getByRole('status')).toBeVisible()
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      }
      if (index < count - 1) await page.getByRole('button', { name: '다음', exact: true }).click()
    }
  }
  expect(errors).toEqual([])
})
