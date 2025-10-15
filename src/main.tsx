import { createRoot } from "react-dom/client"
import App from "./App.tsx"
import "./index.css"

if (import.meta.hot && window && window.parent) {
  // https://vite.dev/guide/api-hmr.html#hot-on-event-cb
  import.meta.hot.on("vite:error", (error) => {
    console.log("[Lite] Error", error)
    window.parent.postMessage({ type: "vite:error", error }, "*")
  })
}
createRoot(document.getElementById("root")!).render(<App />)
