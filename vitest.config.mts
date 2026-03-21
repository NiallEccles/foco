import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import type { Plugin } from 'vite'

// @vitejs/plugin-react-swc checks for `rolldownVersion` in the project's vite
// package to decide between rolldownOptions and esbuildOptions. With vite@5 in
// this project the check fails and it falls back to the deprecated esbuildOptions.
// Vitest 4.x bundles vite@8 internally so we replace the deprecated path here.
function reactForTests(): Plugin[] {
  const plugins = (react() as Plugin | Plugin[])
  const pluginArray = Array.isArray(plugins) ? plugins : [plugins]
  return pluginArray.map((plugin) => {
    if (plugin.name === 'vite:react-swc' && plugin.apply === 'serve') {
      return {
        ...plugin,
        config: () => ({
          esbuild: false,
          oxc: false,
          optimizeDeps: {
            include: ['react/jsx-dev-runtime'],
            rolldownOptions: { transform: { jsx: { runtime: 'automatic' } } },
          },
        }),
      }
    }
    return plugin
  })
}

export default defineConfig({
  test: {
    globalSetup: ['test/setup/globalSetup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: [
        'src/main/services/**',
        'src/renderer/stores/**',
        'src/renderer/hooks/**',
      ],
      thresholds: {
        statements: 70,
        branches: 60,
        functions: 70,
      },
    },
    projects: [
      {
        test: {
          name: 'main',
          include: ['src/main/**/*.test.ts'],
          environment: 'node',
          globals: true,
        },
      },
      {
        plugins: reactForTests(),
        test: {
          name: 'renderer',
          include: ['src/renderer/**/*.test.{ts,tsx}'],
          environment: 'jsdom',
          setupFiles: ['test/setup/renderer.ts'],
          globals: true,
        },
      },
    ],
  },
})
