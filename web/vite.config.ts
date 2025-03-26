import { defineConfig, build as viteBuild } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => ({
  clearScreen: false,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/lib': path.resolve(__dirname, './src/lib'),
    },
  },
  define: {
    // Only apply these in production to avoid conflicts with development mode
    ...(command === 'build' ? {
      'process.env': {},
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.browser': true,
      'process': { env: {}, browser: true },
    } : {}),
  },
  server: {
    strictPort: true,
    host: true,
    port: 5173
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext'
    }
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ...(mode === 'development' ? {
          'embed-dev': resolve(__dirname, 'src/embed-dev.ts')
        } : {})
      },
    }
  },
  plugins: [
    react(),
    {
      name: 'build-embed-scripts',
      apply: 'build',
      closeBundle: async () => {
        // Build the embed scripts separately as IIFE
        const embedBuild = await viteBuild({
          configFile: false,
          root: __dirname,
          plugins: [react()],
          resolve: {
            alias: {
              '@': resolve(__dirname, './src'),
              '@/components': resolve(__dirname, './src/components'),
              '@/types': resolve(__dirname, './src/types'),
              '@/lib': resolve(__dirname, './src/lib'),
            },
          },
          define: {
            'process.env': {},
            'process.env.NODE_ENV': JSON.stringify('production'),
            'process.browser': true,
            'process': { env: {}, browser: true },
          },
          build: {
            target: 'esnext',
            lib: {
              entry: resolve(__dirname, 'src/embed.ts'),
              name: 'finclipChat',
              fileName: 'finclip-chat',
              formats: ['iife'],
            },
            outDir: 'dist',
            emptyOutDir: false,
            cssCodeSplit: false,
            rollupOptions: {
              output: {
                manualChunks: undefined,
              },
            },
          },
        })
        
        // Build the production embed script separately as IIFE
        const embedProductionBuild = await viteBuild({
          configFile: false,
          root: __dirname,
          plugins: [react()],
          resolve: {
            alias: {
              '@': resolve(__dirname, './src'),
              '@/components': resolve(__dirname, './src/components'),
              '@/types': resolve(__dirname, './src/types'),
              '@/lib': resolve(__dirname, './src/lib'),
            },
          },
          define: {
            'process.env': {},
            'process.env.NODE_ENV': JSON.stringify('production'),
            'process.browser': true,
            'process': { env: {}, browser: true },
          },
          build: {
            target: 'esnext',
            lib: {
              entry: resolve(__dirname, 'src/embed-production.ts'),
              name: 'finclipChatProduction',
              fileName: 'finclip-chat-embed',
              formats: ['iife'],
            },
            outDir: 'dist',
            emptyOutDir: false,
            cssCodeSplit: false,
            rollupOptions: {
              output: {
                manualChunks: undefined,
              },
            },
          },
        })
      }
    }
  ]
}))
