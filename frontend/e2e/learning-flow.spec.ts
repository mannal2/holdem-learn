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
  await expect(page.getByRole('status')).toContainText('정답이에요')
  await expect(page.getByLabel('스페이드 에이스')).toBeVisible()
  await expect(page.getByLabel('스페이드 킹')).toBeVisible()
})

test('레슨의 해설 화면을 홈 복귀와 새로고침 뒤에도 그대로 이어한다', async ({ page }) => {
  await page.getByRole('link', { name: 'Part 2 시작하기', exact: true }).click()
  await page.getByRole('link', { name: '첫 Lesson 시작하기', exact: true }).click()
  await page.getByRole('button', { name: '다음', exact: true }).click()
  await page.getByRole('radio', { name: 'A 원 페어', exact: true }).check()
  await page.getByRole('link', { name: '← 레슨 목록', exact: true }).click()
  await page.getByRole('link', { name: '← 홈', exact: true }).click()
  const card = page.locator('article').filter({ has: page.getByRole('heading', { name: '플랍 이후 내 패의 현재 가치 판단' }) })
  await expect(card.getByText('학습 중 · 0/6', { exact: true })).toBeVisible()
  await page.getByRole('link', { name: /Part 2 이어하기/ }).click()
  await expect(page.getByRole('radio', { name: 'A 원 페어', exact: true })).toBeChecked()
  await page.getByRole('button', { name: '정답 확인' }).click()
  const feedback = await page.getByRole('status').textContent()
  await page.getByRole('link', { name: '← 레슨 목록', exact: true }).click()
  await page.getByRole('link', { name: '← 홈', exact: true }).click()
  await page.getByRole('link', { name: /Part 2 이어하기/ }).click()
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2')
  await expect(page.getByRole('status')).toHaveText(feedback!)
  await page.reload()
  await expect(page.getByRole('radio', { name: 'A 원 페어', exact: true })).toBeChecked()
  await expect(page.getByRole('status')).toHaveText(feedback!)
  await page.getByRole('button', { name: '다음', exact: true }).click()
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '3')
  await expect.poll(async () => (await page.locator('.learning-session').boundingBox())!.y).toBeGreaterThanOrEqual(0)
})

test('종합 도전 실패는 재도전 필요로 표시하고 재도전 중에는 이어하기를 제공한다', async ({ page }) => {
  const errors: string[] = []
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/learn/part-2/flop-reading-challenge')
  await page.getByRole('button', { name: '다음', exact: true }).click()
  const wrongAnswers = [
    'Q 하이 카드: 짝이 없음',
    'A 원 페어: 높은 A를 가지고 있음',
    '셋: K 세 장',
    '6 두 장과 Q 두 장으로 만든 투 페어',
    '내 A와 공용 카드가 짝이 되어 나만 10 페어를 쓴다.',
    '내가 이미 플러시를 만들었다.',
  ]
  for (let i = 0; i < 6; i++) {
    await page.getByRole('radio', { name: wrongAnswers[i], exact: true }).check()
    await page.getByRole('button', { name: '정답 확인' }).click()
    await page.getByRole('button', { name: i === 5 ? '완료' : '다음', exact: true }).click()
  }
  await expect(page.getByText('0/6 정답 · 0%', { exact: true })).toBeVisible()
  await page.getByRole('link', { name: '← 레슨 목록', exact: true }).click()
  const row = page.getByRole('listitem').filter({ has: page.getByText('플랍 이후 패 읽기 도전', { exact: true }) })
  await expect(row.getByText('재도전 필요', { exact: true })).toBeVisible()
  await row.getByRole('link', { name: '다시 풀기', exact: true }).click()
  await page.getByRole('button', { name: '다음', exact: true }).click()
  await page.getByRole('radio').first().check()
  await page.getByRole('button', { name: '정답 확인' }).click()
  const feedback = await page.getByRole('status').textContent()
  await page.reload()
  await expect(page.getByRole('status')).toHaveText(feedback!)
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2')
  await page.getByRole('link', { name: '← 레슨 목록', exact: true }).click()
  await row.getByRole('link', { name: '이어하기', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText(feedback!)
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2')
  expect(errors).toEqual([])
})

test('도전 중 새로고침 뒤 전체 점수를 유지하고 재도전한다', async ({ page }) => {
  await page.goto('/learn/part-0/guided-hand')
  const wrongAnswers = ['플랍', '1장', '콜', '레이즈']
  for (const answer of wrongAnswers) {
    await page.getByRole(answer === '콜' ? 'checkbox' : 'radio', { name: answer, exact: true }).check()
    await page.getByRole('button', { name: '정답 확인' }).click()
    await page.getByRole('button', { name: '다음' }).click()
  }
  await page.reload()
  await page.getByRole('radio', { name: '리버' }).check()
  await page.getByRole('button', { name: '정답 확인' }).click()
  await page.reload()
  await expect(page.getByRole('status')).toContainText('정답이에요')
  await page.getByRole('button', { name: '완료' }).click()
  await expect(page.getByText('1/5 정답 · 20%')).toBeVisible()
  await page.getByRole('link', { name: '종합 도전 다시 풀기' }).click()
  await expect(page.getByText('개인 카드만 받고 공용 카드가 없다면 현재 단계는?')).toBeVisible()
})
