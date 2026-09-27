import { render, screen } from '@testing-library/react'
import { ProgressProvider } from './ProgressProvider'
import type { ProgressRepository } from './ProgressRepository'

it('저장소 로드가 실패해도 준비 상태와 경고를 보여준다', async () => {
  const repository: ProgressRepository = { load: async () => { throw new Error('blocked') }, save: async () => undefined, reset: async () => undefined }
  render(<ProgressProvider repository={repository}><p>앱 준비 완료</p></ProgressProvider>)
  expect(await screen.findByText('앱 준비 완료')).toBeInTheDocument()
  expect(await screen.findByRole('status')).toHaveTextContent('진도가 저장되지 않을 수 있어요')
})
