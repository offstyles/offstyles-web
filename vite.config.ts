import { fileURLToPath, URL } from 'node:url'
import { execSync } from 'node:child_process'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import wasm from 'vite-plugin-wasm'

function git(args: string): string {
  try {
    return execSync(`git ${args}`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
  } catch {
    return ''
  }
}

const gitCommit = git('rev-parse --short HEAD')
const gitCommitDate = git('log -1 --format=%cI')

function buildInfoPlugin() {
  const virtualId = 'virtual:build-info'
  const resolvedId = '\0' + virtualId
  return {
    name: 'build-info',
    resolveId(id: string) {
      if (id === virtualId) return resolvedId
    },
    load(id: string) {
      if (id === resolvedId) {
        return `export const gitCommit = ${JSON.stringify(gitCommit)};\n`
          + `export const gitCommitDate = ${JSON.stringify(gitCommitDate)};\n`
      }
    },
  }
}

// Node 22+ exposes an experimental `localStorage` global as an empty `{}`
// (unless `--localstorage-file` is set). `@vue/devtools-kit` checks
// `typeof localStorage === 'undefined'` before calling `localStorage.getItem`
// at module load — the empty object passes the guard, then `getItem` throws
// and Vite's config load fails. Removing the global makes `typeof` undefined
// so the guard short-circuits. The dynamic `import()` below ensures this
// runs before `@vue/devtools-kit` evaluates (a static import gets hoisted by
// the config bundler and would run too late).
delete (globalThis as { localStorage?: unknown }).localStorage
const { default: vueDevTools } = await import('vite-plugin-vue-devtools')

// https://vite.dev/config/
export default defineConfig({
  base: '/',  // <-- add this line to ensure assets load correctly from root
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    wasm(),
    buildInfoPlugin(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://offstyles.net',
        changeOrigin: true,
        secure: true,
        cookieDomainRewrite: 'localhost',
        configure: (proxy) => {
          // Rewrite response cookies so they work on http://localhost
          proxy.on('proxyRes', (proxyRes) => {
            const setCookie = proxyRes.headers['set-cookie'];
            if (setCookie) {
              proxyRes.headers['set-cookie'] = setCookie.map((cookie: string) =>
                cookie
                  .replace(/;\s*Secure/gi, '')
                  .replace(/;\s*SameSite=\w+/gi, '; SameSite=Lax')
              );
            }
          });
        }
      }
    }
  }
})
