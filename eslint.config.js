import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'no-restricted-syntax': [
        'warn',
        {
          selector: "TSTypeReference[typeName.name='React.FC'], TSTypeReference[typeName.name='FC'], TSTypeReference[typeName.name='React.FunctionComponent'], TSTypeReference[typeName.name='FunctionComponent']",
          message: "Prefer standard function/arrow components over React.FC for better modern React practices. See PROJECT_RULES.md Section 14.",
        },
      ],
    },
  },
])
