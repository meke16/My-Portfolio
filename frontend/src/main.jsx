import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import * as AppModule from './App.jsx'

const App = AppModule.default || AppModule.App || (() => null)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
