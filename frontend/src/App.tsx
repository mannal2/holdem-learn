import { RouterProvider } from 'react-router-dom'
import { createAppRouter } from './app/router'

function App() {
  return <RouterProvider router={createAppRouter()} />
}

export default App
