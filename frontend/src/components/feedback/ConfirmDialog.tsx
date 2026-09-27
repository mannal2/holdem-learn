import { useEffect, useRef } from 'react'

interface Props { title: string; description: string; confirmLabel: string; onConfirm: () => void; onCancel: () => void }
export function ConfirmDialog({ title, description, confirmLabel, onConfirm, onCancel }: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)
  useEffect(() => { const previous = document.activeElement as HTMLElement | null; cancelRef.current?.focus(); return () => previous?.focus() }, [])
  return <div className="dialog-backdrop"><dialog open className="confirm-dialog" aria-labelledby="confirm-title" onKeyDown={(event) => { if (event.key === 'Escape') { event.preventDefault(); onCancel() }; if (event.key === 'Tab' && event.shiftKey && document.activeElement === cancelRef.current) { event.preventDefault(); confirmRef.current?.focus() } else if (event.key === 'Tab' && !event.shiftKey && document.activeElement === confirmRef.current) { event.preventDefault(); cancelRef.current?.focus() } }}><h2 id="confirm-title">{title}</h2><p>{description}</p><div className="dialog-actions"><button ref={cancelRef} type="button" onClick={onCancel}>취소</button><button ref={confirmRef} className="danger-button" type="button" onClick={onConfirm}>{confirmLabel}</button></div></dialog></div>
}
