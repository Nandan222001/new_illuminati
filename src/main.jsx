import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App.jsx'
import './i18n/config'
import './App.css'

const rootElement = document.getElementById('root')
const app = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Build output includes server-rendered markup for public routes. Hydrate it
// rather than replacing it so crawlers and users keep the HTML-first content.
if (rootElement.hasChildNodes()) hydrateRoot(rootElement, app)
else createRoot(rootElement).render(app)
