import {
  createBrowserRouter,
  createMemoryRouter,
  type RouteObject,
} from 'react-router-dom'
import { HomePage } from '../pages/HomePage'
import { NotFoundPage } from '../pages/NotFoundPage'

export const routes: RouteObject[] = [
  { path: '/', element: <HomePage /> },
  { path: '*', element: <NotFoundPage /> },
]

export function createAppRouter(initialEntries?: string[]) {
  return initialEntries
    ? createMemoryRouter(routes, { initialEntries })
    : createBrowserRouter(routes)
}
