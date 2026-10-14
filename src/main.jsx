import { createRoot } from 'react-dom/client'
import { lazy, Suspense, useSyncExternalStore } from 'react'
import './global-style.css'

const ClickChord = lazy(() => import('./app/main'))
const Drawsound = lazy(() => import('./drawsound/drawsound'))

// Hash routes keep every page working on any static host
export const DRAWSOUND_ROUTE = '#/drawsound'

const subscribe = (callback) => {
  window.addEventListener('hashchange', callback)
  return () => window.removeEventListener('hashchange', callback)
}

const Root = () => {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  return (
    <Suspense fallback={null}>
      {hash === DRAWSOUND_ROUTE ? <Drawsound /> : <ClickChord />}
    </Suspense>
  )
}

createRoot(document.getElementById('root')).render(<Root />)
