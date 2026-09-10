import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/app': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true
      },
      '/admin': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true
      },
      '/upload': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true
      }
    }
  }
})
