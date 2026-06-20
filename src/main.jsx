import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import { YearProvider } from './context/YearContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <YearProvider>
        <DataProvider>
          <App />
        </DataProvider>
      </YearProvider>
    </AuthProvider>
  </StrictMode>
)
