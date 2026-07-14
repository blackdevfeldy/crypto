import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CryptoPricesProvider } from './hooks/useCryptoPrices.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CryptoPricesProvider>
      <App />
    </CryptoPricesProvider>
  </StrictMode>,
)
