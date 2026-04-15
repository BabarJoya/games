import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // PUBG API proxy (avoids CORS in dev — on Vercel use edge functions if needed)
      '/pubg-api': {
        target: 'https://api.pubg.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/pubg-api/, ''),
        headers: {
          'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI3MzU2Y2FjMC0xYWU4LTAxM2YtMGEyOC00MjgyNzQzZTBmOTMiLCJpc3MiOiJnYW1lbG9ja2VyIiwiaWF0IjoxNzc2MjUwOTIwLCJwdWIiOiJibHVlaG9sZSIsInRpdGxlIjoicHViZyIsImFwcCI6ImdhbWUtdWMifQ.sO3DiHSh5-jD2RsSDac7wiKxja5CBl9sZyQF4xF7AY8',
          'Accept': 'application/vnd.api+json',
        }
      }
    }
  }
})
