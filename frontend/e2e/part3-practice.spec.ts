import { expect, test } from '@playwright/test'
import { part3PracticeQuestions } from '../src/content/part3Practice'
import { createPracticeSession } from '../src/features/practice/practice'

const lessonIds = ['made-hand-and-draw', 'flush-draw', 'straight-draw', 'counting-outs', 'remaining-chances', 'draw-cautions']

for (const lessonId of lessonIds) {
  test(`${lessonId}: 모든 문제의 카드·제출 후 그림·오답 복습 확인`, async ({ page }) => {
    const pool = part3PracticeQuestions.filter(q => q.lessonId === lessonId)
    await page.goto('/')
    for (let offset = 0; offset < pool.length; offset += 4) {
      const batch = pool.slice(offset, offset + 4)
      const session = createPracticeSession(lessonId)
      session.questionIds = batch.map(q => q.id)
      session.optionOrders = Object.fromEntries(batch.map(q => [q.id, q.options.map(o => o.id)]))
      await page.evaluate(({ lessonId, session }) => localStorage.setItem('holdem-practice-progress', JSON.stringify({ version: 1, sessions: { [lessonId]: session }, results: {} })), { lessonId, session })
      await page.goto(`/practice/part-3/${lessonId}`)
      await page.getByRole('button', { name: '이어서 연습하기' }).click()
      for (const [index, q] of batch.entries()) {
        await expect(page.getByRole('group', { name: '정답 근거', exact: true })).toHaveCount(0)
        await expect(page.locator('.poker-table__highlight')).toHaveCount(0)
        await expect(page.locator('.lesson-card-group')).toHaveCount(0)
        if (q.table) {
          await expect(page.getByRole('group', { name: '공용 카드', exact: true }).locator('.playing-card')).toHaveCount(q.table.communityCards.length)
          await expect(page.getByRole('group', { name: '내 개인 카드', exact: true }).locator('.playing-card')).toHaveCount(2)
        }
        const correct = q.type === 'multi-choice' ? q.correctOptionIds : [q.correctOptionId]
        const wrong = q.options.find(o => !correct.includes(o.id))!
        await page.getByRole(q.type === 'multi-choice' ? 'checkbox' : 'radio', { name: wrong.label, exact: true }).check()
        await page.getByRole('button', { name: '정답 확인', exact: true }).click()
        if (q.id === 'p3-practice-59') {
          await expect(page.getByRole('group', { name: '정답 근거', exact: true })).toHaveCount(0)
          await expect(page.locator('.lesson-card-group')).toHaveCount(0)
        } else await expect(page.getByRole('group', { name: '정답 근거', exact: true })).toBeVisible()
        await expect(page.getByRole('status')).toContainText(q.explanation)
        if (q.table?.feedbackOpponentCards || q.table?.opponentCards) await expect(page.getByRole('group', { name: '가정한 상대 카드', exact: true })).toBeVisible()
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
        if (q.id === 'p3-practice-57') await page.screenshot({ path: test.info().outputPath('overlapping-outs.png'), fullPage: true })
        await page.getByRole('button', { name: index === 3 ? '완료' : '다음', exact: true }).click()
      }
      await expect(page.getByRole('heading', { name: '추가 연습을 마쳤어요' })).toBeVisible()
      await page.locator('.practice-result summary').first().click()
      await expect(page.locator('.practice-result details').first().getByRole('group', { name: '정답 근거', exact: true })).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    }
  })
}

test('Part 3 실제 출제·홈 이탈·새로고침·이전 복원·종합 완료 후 새 시작', async ({ page }) => {
  await page.goto('/parts/part-3')
  await expect(page.locator('.lesson-practice-link')).toHaveCount(7)
  await page.getByRole('link', { name: '스트레이트 드로우: 양끝과 가운데 빈칸 · 추가 연습', exact: true }).click()
  await page.getByRole('button', { name: '연습 시작', exact: true }).click()
  const input = page.locator('fieldset input').first()
  const selectedLabel = await input.locator('..').textContent()
  await input.check()
  await page.getByRole('button', { name: '정답 확인', exact: true }).click()
  const feedback = await page.getByRole('status').textContent()
  const saved = await page.evaluate(() => localStorage.getItem('holdem-practice-progress'))
  await page.reload()
  await page.getByRole('button', { name: '이어서 연습하기' }).click()
  await expect(page.locator('fieldset input:checked').locator('..')).toHaveText(selectedLabel!)
  await expect(page.getByRole('status')).toHaveText(feedback!)
  expect(await page.evaluate(() => localStorage.getItem('holdem-practice-progress'))).toBe(saved)
  await page.getByRole('link', { name: '← Part 3로 돌아가기', exact: true }).click()
  await page.getByRole('link', { name: '← 홈', exact: true }).click()
  await page.goto('/practice/part-3/straight-draw')
  await page.getByRole('button', { name: '이어서 연습하기' }).click()
  await expect(page.getByRole('status')).toHaveText(feedback!)
  await page.getByRole('button', { name: '다음', exact: true }).click()
  await page.getByRole('button', { name: '이전', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText(feedback!)
  await expect(page.locator('fieldset input:checked').locator('..')).toHaveText(selectedLabel!)
  const lessonProgress = await page.evaluate(() => localStorage.getItem('holdem-learning-progress'))
  await page.goto('/practice/part-3/draw-challenge')
  await page.getByRole('button', { name: '연습 시작', exact: true }).click()
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '6')
  for (let i = 0; i < 6; i++) {
    await page.locator('fieldset input').first().check()
    await page.getByRole('button', { name: '정답 확인', exact: true }).click()
    await page.getByRole('button', { name: i === 5 ? '완료' : '다음', exact: true }).click()
  }
  await expect(page.getByRole('heading', { name: '종합 연습을 마쳤어요' })).toBeVisible()
  expect(await page.evaluate(() => localStorage.getItem('holdem-learning-progress'))).toBe(lessonProgress)
  await page.getByRole('link', { name: '← Part 3로 돌아가기', exact: true }).click()
  await page.getByRole('link', { name: '미래 가능성 종합 도전 · 종합 연습', exact: true }).click()
  await expect(page.getByRole('button', { name: '연습 시작', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: '종합 연습을 마쳤어요' })).toHaveCount(0)
  await page.reload()
  await expect(page.getByRole('button', { name: '연습 시작', exact: true })).toBeVisible()
})
