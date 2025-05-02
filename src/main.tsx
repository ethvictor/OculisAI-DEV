// main.tsx
import { createRoot } from "react-dom/client"
import App from "./App.tsx"
import "./index.css"

// 1) Importera Auth0Provider
import { Auth0Provider } from "@auth0/auth0-react"

createRoot(document.getElementById("root")!).render(
  // 2) Wrappa <App /> med <Auth0Provider>
  <Auth0Provider
    domain="dev-6cqrktzcp5ii1xps.eu.auth0.com"     // ← Byt till din Auth0 Domain
    clientId="yQDnXqBDxpsr8RlfdTGFZkJbeyAk4iXs"                  // ← Byt till din Auth0 Client ID
    authorizationParams={{
      redirect_uri: window.location.origin,
    }}
  >
    <App />
  </Auth0Provider>
)
