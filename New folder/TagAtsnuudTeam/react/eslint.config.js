import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // Build output болох dist хавтсыг lint хийхгүй.
  globalIgnores(['dist']),
  {
    // JavaScript болон JSX файлуудад дараах lint дүрмүүд үйлчилнэ.
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      // Browser global хувьсагчид window, document гэх мэтийг зөвшөөрнө.
      globals: globals.browser,
      // JSX syntax уншихын тулд parser-д JSX support асаана.
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
])
