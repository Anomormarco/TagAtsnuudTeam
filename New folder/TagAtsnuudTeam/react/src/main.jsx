import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// index.html доторх #root element дээр React аппликейшнийг ачаална.
createRoot(document.getElementById('root')).render(
  // StrictMode нь хөгжүүлэлтийн үед React-ийн боломжит алдааг эрт илрүүлэхэд тусална.
  <StrictMode>
    <App />
  </StrictMode>,
)
