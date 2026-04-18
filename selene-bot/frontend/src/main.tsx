import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import App from './App.tsx'
import { ErrorIcon, WarningIcon } from './components/Icons.tsx'
import SupportChat from './components/SupportChat.tsx'
import './i18utils/i18provider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster position='top-right' richColors theme='system' closeButton icons={{ warning: <WarningIcon />, error: <ErrorIcon /> }}/>
    <SupportChat />
  </StrictMode>
)