import { screen, within } from '@testing-library/react'
import { part0Lessons } from '../../content/part0'
import { renderLearningSession } from '../../test/learningFixtures'

it('족보를 강한 순서대로 보여주고 각 족보에 카드 다섯 장을 놓는다', () => {
  renderLearningSession(part0Lessons['hand-rankings'])
  const rows = within(screen.getByRole('list', { name: '족보 강한 순서' })).getAllByRole('listitem')
  expect(rows.map((row) => within(row).getByRole('heading').textContent)).toEqual([
    '로열 플러시', '스트레이트 플러시', '포카드', '풀 하우스', '플러시',
    '스트레이트', '트리플', '투 페어', '원 페어', '하이 카드',
  ])
  for (const row of rows) {
    expect(within(row).getAllByLabelText(/^(스페이드|하트|다이아몬드|클로버) /)).toHaveLength(5)
  }
  expect(within(rows[0]).getAllByLabelText(/^스페이드 /).map((card) => card.getAttribute('aria-label'))).toEqual([
    '스페이드 에이스', '스페이드 킹', '스페이드 퀸', '스페이드 잭', '스페이드 10',
  ])
})
