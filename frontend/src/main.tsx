import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import './index.css'
import { App } from './App.tsx'
import { getSavedTheme, applyTheme } from './lib/theme'

applyTheme(getSavedTheme())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-center"
      richColors
      closeButton
      toastOptions={{
        style: {
          borderRadius: '0.75rem',
          fontSize: '0.875rem',
        },
      }}
    />
  </StrictMode>,
)
