import {
  createBrowserRouter,
  createMemoryRouter,
  type RouteObject,
} from 'react-router-dom'
import { HomePage } from '../pages/HomePage'
import { LearningPage } from '../pages/LearningPage'
import { NotFoundPage } from '../pages/NotFoundPage'

export const routes: RouteObject[] = [
  { path: '/', element: <HomePage /> },
  { path: '/learn/:partId/:lessonId', element: <LearningPage /> },
  { path: '*', element: <NotFoundPage /> },
]

export function createAppRouter(initialEntries?: string[]) {
  return initialEntries
    ? createMemoryRouter(routes, { initialEntries })
    : createBrowserRouter(routes)
}
