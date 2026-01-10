import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'flatpickr/dist/themes/airbnb.css'
import 'flatpickr/dist/plugins/monthSelect/style.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
