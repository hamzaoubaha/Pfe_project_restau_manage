import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    base: '/Pfe_project_restau_manage/',
    plugins: [react()],
})
