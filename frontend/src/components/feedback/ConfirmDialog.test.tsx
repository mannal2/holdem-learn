import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { ConfirmDialog } from './ConfirmDialog'

it('열리면 취소 버튼에 초점을 두고 확인 동작을 전달한다', async () => {
  const user = userEvent.setup(); const onConfirm = vi.fn()
  render(<ConfirmDialog title="진도를 초기화할까요?" description="저장된 진도가 삭제됩니다." confirmLabel="초기화하기" onConfirm={onConfirm} onCancel={() => undefined} />)
  expect(screen.getByRole('button', { name: '취소' })).toHaveFocus()
  await user.click(screen.getByRole('button', { name: '초기화하기' }))
  expect(onConfirm).toHaveBeenCalledOnce()
})
