import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { dark } from '@clerk/themes'
import './index.css' 
import App from './App.jsx'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key")
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} appearance={{
      baseTheme: dark,
        variables: {    
         colorPrimary: '#aaaaaa',    
          colorBackground: '#1a1a1a',
          colorText: '#ffffff',       
          colorTextSecondary: '#b8b7b7', 
          borderRadius: '8px',       
        },
        elements:{
          socialButtonsBlockButton: {
            background: 'linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%)',
            padding: '10px', 
            border: '1px solid #2a2a2a',
            color: '#ffffff',
            transition: 'all 0.15s',
            '&:hover': {
              background: 'linear-gradient(180deg,#4a4a4a 0%, #2a2a2a 100%)',
              filter: 'brightness(1.15)',
            }
          },
          
          socialButtonsBlockButtonText: {
            color: '#ffffff',
            fontWeight: 500,
          },
          formButtonPrimary: {background: 'linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%)', 
            border: '1px solid #222222',
            padding: '10px',
            color: '#ffffff',
            boxShadow: 'none !important',
            outline:'none !important',
            transition: 'all 0.15s',
            '&:hover': {
              background: 'linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%)',
              filter: 'brightness(1.15)',
            }},
          footerActionLink: {
            color: '#10b981', 
            fontWeight: '600',
            textUnderlineOffset: '4px',
            transition: 'all 0.15s',
            '&:hover': {
              color: '#34d399',
              textDecoration: "none", 
            }
          },
        }
      }}>
      <App />
    </ClerkProvider>
  </StrictMode>,
)
