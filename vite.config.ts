import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/nettopilot-de/',
  build: {
    modulePreload: {
      polyfill: false,
    },
    rollupOptions: {
      input: {
        app: new URL('index.html', import.meta.url).pathname,
        notFound: new URL('404.html', import.meta.url).pathname,
      },
    },
  },
  plugins: [react()],
})
