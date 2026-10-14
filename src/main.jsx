import { createRoot } from 'react-dom/client'
import { StyledEngineProvider } from '@mui/material/styles'
import './global-style.css'
import App from './app/main'

createRoot(document.getElementById('root')).render(
  <StyledEngineProvider injectFirst>
    <App />
  </StyledEngineProvider>
)
