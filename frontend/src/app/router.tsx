import {
  createBrowserRouter,
  createMemoryRouter,
  type RouteObject,
} from 'react-router-dom'
import { HomePage } from '../pages/HomePage'
import { LearningPage } from '../pages/LearningPage'
import { LessonResultPage } from '../pages/LessonResultPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { PartPage } from '../pages/PartPage'
import { PartResultPage } from '../pages/PartResultPage'

export const routes: RouteObject[] = [
  { path: '/', element: <HomePage /> },
  { path: '/learn/:partId/:lessonId', element: <LearningPage /> },
  { path: '/parts/:partId', element: <PartPage /> },
  { path: '/results/:partId/:lessonId', element: <LessonResultPage /> },
  { path: '/results/:partId', element: <PartResultPage /> },
  { path: '*', element: <NotFoundPage /> },
]

export function createAppRouter(initialEntries?: string[]) {
  return initialEntries
    ? createMemoryRouter(routes, { initialEntries })
    : createBrowserRouter(routes)
}
