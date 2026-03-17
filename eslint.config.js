"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const eslint_config_typescript_1 = require("@vue/eslint-config-typescript");
const eslint_plugin_vue_1 = __importDefault(require("eslint-plugin-vue"));
// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup
const vueEssentialConfig = eslint_plugin_vue_1.default.configs['flat/essential'];
const vueTsRecommendedConfig = eslint_config_typescript_1.vueTsConfigs.recommended;
exports.default = (0, eslint_config_typescript_1.defineConfigWithVueTs)({
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
}, {
    name: 'app/ignores',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
}, vueEssentialConfig, vueTsRecommendedConfig);
