import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HashRouter } from 'react-router-dom'

const client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false
    }
  }
})

if (!window.location.hash && window.location.pathname !== '/') {
  const next = `/#${window.location.pathname}${window.location.search}`
  window.location.replace(next)
}

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={client} >
    <HashRouter>
      <App />
    </HashRouter>
  </QueryClientProvider>,
)
