import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import './i18n.ts'
import App from './App.tsx'
import AOS from 'aos'
import 'aos/dist/aos.css'

AOS.init({ once: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
