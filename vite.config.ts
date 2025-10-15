import { defineConfig, loadEnv } from "vite"
import path from "node:path"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")

  return {
    server: {
      host: "::",
      port: 8080,
      allowedHosts: true,
      cors: true,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      "process.env": env,
    },
  }
})
