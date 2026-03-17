import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

const vueEssentialConfig =
  pluginVue.configs['flat/essential'] as unknown as Parameters<typeof defineConfigWithVueTs>[number]

const vueTsRecommendedConfig =
  vueTsConfigs.recommended as unknown as Parameters<typeof defineConfigWithVueTs>[number]

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },
  {
    name: 'app/ignores',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },

  vueEssentialConfig,
  vueTsRecommendedConfig,
)
