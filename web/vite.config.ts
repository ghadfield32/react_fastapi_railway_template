import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // API URL configuration
  // Development: local backend
  // Production: Railway backend URL
  const API_URL = env.VITE_API_URL || 
    (mode === 'production' 
      ? 'https://fastapi-production-1d13.up.railway.app' 
      : 'http://127.0.0.1:8000')

  console.log('🔍 Vite Config Debug:')
  console.log('Mode:', mode)
  console.log('API_URL:', API_URL)
  console.log('VITE_API_URL from env:', env.VITE_API_URL)
  console.log('All VITE_ env vars:', Object.keys(env).filter(key => key.startsWith('VITE_')))
  console.log('NODE_ENV:', process.env.NODE_ENV)
  console.log('PWD:', process.env.PWD)
  console.log('Railway vars:', {
    RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
    RAILWAY_PROJECT_ID: process.env.RAILWAY_PROJECT_ID,
    RAILWAY_SERVICE_NAME: process.env.RAILWAY_SERVICE_NAME
  })

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '/api': {
          target: API_URL,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path, // Keep the /api prefix
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('🔍 Proxy Error:', err)
            })
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('🔍 Proxy Request:', req.method, req.url, '-> ', proxyReq.path)
            })
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('🔍 Proxy Response:', proxyRes.statusCode, req.url)
            })
          }
        }
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      // Increase chunk size warning limit to avoid warnings
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom']
          }
        }
      }
    },
    define: {
      __API_URL__: JSON.stringify(API_URL)
    },
    // Ensure TypeScript errors don't fail the build
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' }
    }
  }
})

