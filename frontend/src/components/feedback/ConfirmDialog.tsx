import { useEffect, useRef } from 'react'

interface Props { title: string; description: string; confirmLabel: string; onConfirm: () => void; onCancel: () => void }
export function ConfirmDialog({ title, description, confirmLabel, onConfirm, onCancel }: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  useEffect(() => { cancelRef.current?.focus() }, [])
  return <div className="dialog-backdrop"><section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title"><h2 id="confirm-title">{title}</h2><p>{description}</p><div className="dialog-actions"><button ref={cancelRef} type="button" onClick={onCancel}>취소</button><button className="danger-button" type="button" onClick={onConfirm}>{confirmLabel}</button></div></section></div>
}
