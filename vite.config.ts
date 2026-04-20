import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const getValidPort = (port: string | undefined, fallback = 5173) => {
    const num = Number(port);
    if (!Number.isNaN(num) && num >= 1 && num <= 65535) {
      return num;
    }
    return fallback;
  }
  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: getValidPort(env.VITE_PORT),
      strictPort: true,
      host: env.VITE_HOST === 'true' ? true : env.VITE_HOST === 'false' ? false : env.VITE_HOST ?? false,
      proxy: env.VITE_API_URL
        ? {
          '/api': {
            target: env.VITE_API_URL,
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path.replace(/^\/api/, ''),
          }
        }
        : undefined,
    },
    preview: {
      port: getValidPort(env.VITE_PREVIEW_PORT, 4173),
      strictPort: true,
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'recharts': ['recharts'],
            'lottie': ['lottie-web'],
            'lucide': ['lucide-react']
          }
        }
      }
    }
  }
})

