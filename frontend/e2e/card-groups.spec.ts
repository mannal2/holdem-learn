import { expect, test, type Page } from '@playwright/test'
import { part2PracticeQuestions } from '../src/content/part2Practice'

async function checkGroups(page: Page, count: number) {
  const board = page.getByRole('group', { name: '공용 카드', exact: true })
  const hand = page.getByRole('group', { name: '내 개인 카드', exact: true })
  await expect(board.getByRole('heading', { name: '공용 카드', exact: true })).toBeVisible()
  await expect(hand.getByRole('heading', { name: '내 카드', exact: true })).toBeVisible()
  await expect(board.getByTestId('community-card')).toHaveCount(count)
  await expect(hand.locator('.playing-card')).toHaveCount(2)
  const boardBox = (await board.boundingBox())!
  const handBox = (await hand.boundingBox())!
  expect(handBox.y).toBeGreaterThan(boardBox.y + boardBox.height)
  expect(await board.evaluate(el => getComputedStyle(el).backgroundColor)).not.toBe(await hand.evaluate(el => getComputedStyle(el).backgroundColor))
  // 가로 넘침은 카드뿐 아니라 제목·영역 테두리까지 검사합니다.
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  const cards = await board.locator('.playing-card').all()
  const firstY = (await cards[0].boundingBox())!.y
  for (const card of cards) expect((await card.boundingBox())!.y).toBe(firstY)
}

test('레슨의 플랍·턴·리버에서 두 카드 영역을 분리한다', async ({ page }, testInfo) => {
  for (const [path, title, count] of [
    ['/learn/part-0/hand-stages', '턴', 5],
    ['/learn/part-2/read-current-hand', '지금 보이는 다섯 장의 족보는?', 3],
    ['/learn/part-3/made-hand-and-draw', '턴에 하트가 나왔다면', 4],
    ['/learn/part-3/remaining-chances', '리버까지 빗나갔다면', 5],
  ] as const) {
    await page.goto(path)
    for (let step = 0; step < 12; step++) {
      if (await page.getByText(title, { exact: true }).isVisible()) break
      await page.getByRole('button', { name: '다음', exact: true }).click()
    }
    await expect(page.getByText(title, { exact: true })).toBeVisible()
    await checkGroups(page, count)
  }
  await page.screenshot({ path: testInfo.outputPath('separate-river-cards.png'), fullPage: true })
})

test('추가연습 문제와 완료 후 오답 리뷰에도 두 영역을 유지한다', async ({ page }) => {
  await page.goto('/practice/part-2/read-current-hand')
  await page.getByRole('button', { name: '연습 시작', exact: true }).click()
  for (let index = 0; index < 4; index++) {
    await checkGroups(page, 3)
    const radios = page.getByRole('radio')
    const id = await radios.first().getAttribute('name')
    const question = part2PracticeQuestions.find(q => q.id === id)!
    // 보기 순서도 무작위이므로 배열 위치가 아니라 실제 오답 문구로 선택합니다.
    const wrongOption = question.options.find(option => option.id !== question.correctOptionId)!
    await page.getByRole('radio', { name: wrongOption.label, exact: true }).check()
    await page.getByRole('button', { name: '정답 확인', exact: true }).click()
    await expect(page.getByRole('status')).toBeVisible()
    await expect(page.getByRole('status')).toContainText('다시 확인해 봐요')
    await page.getByRole('button', { name: index === 3 ? '완료' : '다음', exact: true }).click()
  }
  await page.locator('details summary').first().click()
  await checkGroups(page, 3)
})
