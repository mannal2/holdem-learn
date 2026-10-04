import { expect, test, type Page } from '@playwright/test'

// Playwright의 독립 브라우저 컨텍스트만 초기화합니다. 사용자 브라우저 진도는 건드리지 않습니다.
test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

async function nextUntil(page: Page, target: ReturnType<Page['getByRole']>) {
  for (let index = 0; index < 20; index++) {
    if (await target.isVisible()) return
    await page.getByRole('button', { name: '다음', exact: true }).click()
  }
  await expect(target).toBeVisible()
}

test('Part 3의 복수 선택·해설을 홈 이동과 새로고침 뒤 복원한다', async ({ page }) => {
  await page.goto('/parts/part-3')
  await expect(page.locator('.lesson-list li')).toHaveCount(7)
  await expect(page.locator('.lesson-practice-link')).toHaveCount(7)
  await page.goto('/learn/part-3/straight-draw')
  const eight = page.getByRole('checkbox', { name: '8', exact: true })
  await nextUntil(page, eight)
  await eight.check()
  await page.getByRole('checkbox', { name: 'K', exact: true }).check()
  await page.getByRole('link', { name: '← 레슨 목록', exact: true }).click()
  await page.getByRole('link', { name: '← 홈', exact: true }).click()
  await page.getByRole('link', { name: /Part 3 이어하기/ }).click()
  await expect(eight).toBeChecked()
  await expect(page.getByRole('checkbox', { name: 'K', exact: true })).toBeChecked()
  await page.getByRole('button', { name: '정답 확인' }).click()
  await expect(page.getByRole('status')).toContainText('정답이에요')
  const feedback = await page.getByRole('status').textContent()
  await page.reload()
  await expect(eight).toBeChecked()
  await expect(page.getByRole('checkbox', { name: 'K', exact: true })).toBeChecked()
  await expect(page.getByRole('status')).toHaveText(feedback!)
  await page.getByRole('button', { name: '다음', exact: true }).click()
  await page.getByRole('button', { name: '이전', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText(feedback!)
  await expect.poll(async () => (await page.locator('.learning-session').boundingBox())!.y).toBeGreaterThanOrEqual(0)
})

test('턴 문제는 네 장을 표시하고 제출 후 같은 카드·답·해설을 복원한다', async ({ page }) => {
  await page.goto('/learn/part-3/remaining-chances')
  await nextUntil(page, page.getByRole('radio', { name: '플랍에서 턴·리버 두 장을 모두 보는 경우', exact: true }))
  await page.getByRole('radio', { name: '플랍에서 턴·리버 두 장을 모두 보는 경우', exact: true }).check()
  await page.getByRole('button', { name: '정답 확인' }).click()
  await page.getByRole('button', { name: '다음', exact: true }).click()
  await expect(page.getByTestId('community-card')).toHaveCount(4)
  await expect(page.getByLabel('클로버 7', { exact: true })).toBeVisible()
  await expect(page.getByLabel('뒤집힌 카드', { exact: true })).toHaveCount(0)
  await page.getByRole('radio', { name: '약 18% — 9×2', exact: true }).check()
  await page.getByRole('button', { name: '정답 확인' }).click()
  const feedback = await page.getByRole('status').textContent()
  await page.reload()
  await expect(page.getByTestId('community-card')).toHaveCount(4)
  await expect(page.getByRole('radio', { name: '약 18% — 9×2', exact: true })).toBeChecked()
  await expect(page.getByRole('status')).toHaveText(feedback!)
})

test('아웃츠 아홉 장과 확률 조건을 모바일·데스크톱에서 읽을 수 있다', async ({ page }, testInfo) => {
  await page.goto('/learn/part-3/counting-outs')
  const outs = page.getByRole('group', { name: '플러시를 완성하는 9아웃츠', exact: true })
  await nextUntil(page, outs)
  await expect(outs.locator('.playing-card')).toHaveCount(9)
  for (const card of await outs.locator('.playing-card').all()) await expect(card).toBeInViewport()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('part3-outs.png'), fullPage: true })
  await page.goto('/learn/part-3/remaining-chances')
  await nextUntil(page, page.getByRole('heading', { name: '플러시 드로우 · 9아웃츠', exact: true }))
  const odds = page.locator('.learning-session')
  await expect(odds).toContainText('두 장이 모두 스페이드일 필요는 없어요')
  await expect(odds).toContainText('턴 또는 리버 중 적어도 한 장')
  await expect(odds).toContainText('턴에 완성되지 않았을 때')
  await expect(odds).toContainText('약 19%')
  await expect(odds).toContainText('약 35%')
  await expect(odds).toContainText('약 20%')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('expanded-probability-copy.png'), fullPage: true })
})

test('종합 도전 4/6은 재도전, 5/6은 통과하며 이전 문제 재조회로 중복 채점하지 않는다', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  const answers = [
    ['A 원 페어이며 플러시 드로우도 있다'], ['다이아몬드'], ['7', 'Q'],
    ['9 네 문양으로 4장'], ['9×2로 약 18%'], ['더 높은 플러시가 가능해 승리는 확정할 수 없다'],
  ]
  for (const correctCount of [4, 5]) {
    await page.goto('/learn/part-3/draw-challenge?restart=1')
    await page.getByRole('button', { name: '다음', exact: true }).click()
    for (let index = 0; index < 6; index++) {
      if (index === 2) {
        for (const answer of answers[index]) await page.getByRole('checkbox', { name: answer, exact: true }).check()
      } else if (index < correctCount) {
        await page.getByRole('radio', { name: answers[index][0], exact: true }).check()
      } else {
        const wrongAnswer = index === 4 ? '9×4로 약 36%' : '완성됐으니 상대 카드를 몰라도 승리가 확정된다'
        await page.getByRole('radio', { name: wrongAnswer, exact: true }).check()
      }
      await page.getByRole('button', { name: '정답 확인' }).click()
      await page.getByRole('button', { name: '다음', exact: true }).click()
      if (index === 0) {
        await page.getByRole('button', { name: '이전', exact: true }).click()
        await expect(page.getByRole('status')).toContainText('정답이에요')
        await page.getByRole('button', { name: '다음', exact: true }).click()
      }
    }
    await page.getByRole('button', { name: '완료', exact: true }).click()
    await expect(page.getByText(`${correctCount}/6 정답 · ${Math.round(correctCount / 6 * 100)}%`, { exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: '새 카드로 연습하기' })).toHaveAttribute('href', '/practice/part-3/draw-challenge')
    if (correctCount === 5) await expect(page.getByRole('link', { name: 'Part 결과 보기' })).toBeVisible()
    await page.getByRole('link', { name: '← 레슨 목록', exact: true }).click()
    const row = page.locator('.lesson-list li').filter({ has: page.getByText('미래 가능성 종합 도전', { exact: true }) })
    await expect(row.getByText(correctCount === 4 ? '재도전 필요' : '완료', { exact: true })).toBeVisible()
  }
  expect(errors).toEqual([])
})
