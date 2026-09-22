import { RouterProvider } from 'react-router-dom'
import { createAppRouter } from './app/router'
import { ProgressProvider } from './features/progress/ProgressProvider'

function App() {
  return <ProgressProvider><RouterProvider router={createAppRouter()} /></ProgressProvider>
}

export default App
