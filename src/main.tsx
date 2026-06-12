import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useFishingStore } from './store/fishingStore'
import { useGameStore } from './store/gameStore'

if (import.meta.env.DEV) {
  // @ts-expect-error debug helper
  window.__fishingStore = useFishingStore
  // @ts-expect-error debug helper
  window.__gameStore = useGameStore
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
