// main.tsx
import { createRoot } from "react-dom/client"
import App from "./App.tsx"
import "./index.css"

// 1) Importera Auth0Provider
import { Auth0Provider } from "@auth0/auth0-react"

createRoot(document.getElementById("root")!).render(
  // 2) Wrappa <App /> med <Auth0Provider>
  <Auth0Provider
    domain={import.meta.env.VITE_AUTH0_DOMAIN}
    clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
    authorizationParams={{
      audience:     import.meta.env.VITE_AUTH0_AUDIENCE,
      redirect_uri: window.location.origin
    }}
  >
    <App />
  </Auth0Provider>
)
