import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const browserGlobals = globals.browser

const reactAndBrowserRestrictions = {
  'no-restricted-globals': [
    'error',
    'document',
    'fetch',
    'indexedDB',
    'localStorage',
    'navigator',
    'window',
  ],
  'no-restricted-imports': [
    'error',
    {
      paths: [
        {
          name: 'react',
          message:
            'Inner architecture modules must remain independent of React.',
        },
        {
          name: 'react-dom',
          message:
            'Inner architecture modules must remain independent of React DOM.',
        },
      ],
      patterns: [
        {
          group: ['react-dom/*'],
          message:
            'Inner architecture modules must remain independent of React DOM.',
        },
      ],
    },
  ],
}

function architectureRestrictions(forbiddenAreas) {
  const baseRestriction = reactAndBrowserRestrictions['no-restricted-imports']
  const baseOptions = baseRestriction[1]

  return {
    ...reactAndBrowserRestrictions,
    'no-restricted-imports': [
      'error',
      {
        ...baseOptions,
        patterns: [
          ...baseOptions.patterns,
          {
            group: forbiddenAreas.map((area) => `**/${area}/**`),
            message:
              'This import crosses the dependency direction defined by ADR-001.',
          },
        ],
      },
    ],
  }
}

export default defineConfig([
  globalIgnores(['coverage/**', 'dist/**', 'node_modules/**']),
  {
    files: ['**/*.{js,mjs}'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.node,
      sourceType: 'module',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: browserGlobals,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      sourceType: 'module',
    },
    rules: {
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',
    },
  },
  {
    files: ['src/domain/**/*.{ts,tsx}'],
    rules: architectureRestrictions([
      'application',
      'assumptions',
      'comparison',
      'config',
      'i18n',
      'persistence',
      'platform',
      'presentation',
      'validation',
    ]),
  },
  {
    files: ['src/assumptions/**/*.{ts,tsx}'],
    rules: architectureRestrictions([
      'application',
      'comparison',
      'config',
      'i18n',
      'persistence',
      'platform',
      'presentation',
      'validation',
    ]),
  },
  {
    files: ['src/validation/**/*.{ts,tsx}'],
    rules: architectureRestrictions([
      'application',
      'comparison',
      'config',
      'i18n',
      'persistence',
      'platform',
      'presentation',
    ]),
  },
  {
    files: ['src/comparison/**/*.{ts,tsx}'],
    rules: architectureRestrictions([
      'application',
      'assumptions',
      'config',
      'i18n',
      'persistence',
      'platform',
      'presentation',
      'validation',
    ]),
  },
  {
    files: ['src/application/**/*.{ts,tsx}'],
    rules: architectureRestrictions([
      'config',
      'i18n',
      'platform',
      'presentation',
    ]),
  },
  {
    files: ['src/platform/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '**/assumptions/**',
                '**/comparison/**',
                '**/domain/**',
                '**/validation/**',
              ],
              message:
                'Platform adapters must not receive calculation internals or financial state.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/presentation/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/domain/**'],
              message:
                'Presentation must consume application-facing contracts, not domain implementations.',
            },
          ],
        },
      ],
    },
  },
])
