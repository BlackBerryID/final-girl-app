import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { entriesApiPlugin } from './server/api.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [entriesApiPlugin(), react()],
})
