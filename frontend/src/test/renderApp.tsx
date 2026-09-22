import { render } from '@testing-library/react'
import { RouterProvider } from 'react-router-dom'
import { createAppRouter } from '../app/router'
import { ProgressProvider } from '../features/progress/ProgressProvider'
import { createEmptyProgress } from '../features/progress/createEmptyProgress'
import type { ProgressLoadResult, ProgressRepository } from '../features/progress/ProgressRepository'
import type { LearningProgress } from '../types/progress'

export class MemoryProgressRepository implements ProgressRepository {
  progress: LearningProgress
  constructor(progress = createEmptyProgress()) { this.progress = structuredClone(progress) }
  async load(): Promise<ProgressLoadResult> { return { progress: this.progress, recovered: false } }
  async save(progress: LearningProgress) { this.progress = structuredClone(progress) }
  async reset() { this.progress = createEmptyProgress() }
}
export function renderAppAt(path: string, progress = createEmptyProgress()) { const repository = new MemoryProgressRepository(progress); const router = createAppRouter([path]); const view = render(<ProgressProvider repository={repository}><RouterProvider router={router} /></ProgressProvider>); return { ...view, repository, router } }
export function renderAppWithProgress(progress: LearningProgress, path: string) { return renderAppAt(path, progress).repository }
