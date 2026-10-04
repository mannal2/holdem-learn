import { expect, test } from '@playwright/test'

test('완성 족보 네 화면은 보드·카드 소속과 강조를 이동·새로고침 후에도 유지한다', async ({ page }, testInfo) => {
  for (const [lesson, title, highlighted, unused] of [
    ['made-hand-and-draw', '완성된 다섯 장을 확인해요', 5, '클로버 2'],
    ['straight-draw', '9가 나오면 이렇게 완성돼요', 5, '스페이드 킹'],
    ['straight-draw', '6이 가운데를 채워요', 5, '스페이드 킹'],
    ['draw-cautions', '상대에게 더 높은 플러시가 있다면', 7, '클로버 2'],
  ] as const) {
    await page.goto(`/learn/part-3/${lesson}?restart=1`)
    const heading = page.getByRole('heading', { name: title, exact: true })
    for (let step = 0; step < 10; step++) {
      if (await heading.isVisible()) break
      await page.getByRole('button', { name: '다음', exact: true }).click()
    }
    await expect(heading).toBeVisible()
    await expect(page.getByTestId('community-card')).toHaveCount(4)
    await expect(page.getByRole('group', { name: '내 개인 카드', exact: true }).locator('.playing-card')).toHaveCount(2)
    await expect(page.locator('.poker-table__highlight')).toHaveCount(highlighted)
    expect(await page.getByLabel(unused, { exact: true }).evaluate(el => Boolean(el.closest('.poker-table__highlight')))).toBe(false)
    if (lesson === 'draw-cautions') {
      const opponent = page.getByRole('group', { name: '가정한 상대 카드', exact: true })
      await expect(opponent.getByLabel('하트 에이스', { exact: true })).toBeVisible()
      await expect(opponent.getByText('실제 공개된 상대 카드가 아닌 비교 예시', { exact: true })).toBeVisible()
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({ path: testInfo.outputPath(`${lesson}-${highlighted}-${unused}.png`), fullPage: true })
    const before = await page.locator('.poker-table').innerText()
    await page.reload()
    await expect(heading).toBeVisible()
    await expect(page.locator('.poker-table')).toHaveText(before, { useInnerText: true })
    await expect(page.locator('.poker-table__highlight')).toHaveCount(highlighted)
    await page.getByRole('button', { name: '이전', exact: true }).click()
    await page.getByRole('button', { name: '다음', exact: true }).click()
    await expect(heading).toBeVisible()
    await expect(page.locator('.poker-table__highlight')).toHaveCount(highlighted)
  }
})
