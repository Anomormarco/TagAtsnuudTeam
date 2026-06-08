import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite-ийн үндсэн тохиргоо: React plugin нь JSX болон fast refresh-ийг ажиллуулна.
export default defineConfig({
  plugins: [react()],
})
