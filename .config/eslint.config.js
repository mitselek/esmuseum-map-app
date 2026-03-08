// @ts-check
import tailwind from 'eslint-plugin-tailwindcss'
import sonarjs from 'eslint-plugin-sonarjs'
import withNuxt from '../.nuxt/eslint.config.mjs'

export default withNuxt(
  // Stylistic rules
  {
    rules: {
      '@stylistic/arrow-parens': ['error', 'always'],
      '@stylistic/comma-dangle': ['error', 'never'],
      '@stylistic/quote-props': ['error', 'as-needed'],
      '@stylistic/space-before-function-paren': ['error', 'always']
    }
  },

  // Code quality rules for app and server code
  {
    files: ['app/**/*.{ts,vue}', 'server/**/*.ts'],
    plugins: { sonarjs },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-async-promise-executor': 'error',
      'no-promise-executor-return': 'error',
      'no-await-in-loop': 'warn',
      'require-await': 'warn',
      'no-self-compare': 'error',
      'no-template-curly-in-string': 'warn',
      'no-unmodified-loop-condition': 'error',
      'vue/require-default-prop': 'error',
      'vue/require-prop-types': 'error',

      // Complexity
      complexity: ['warn', 15],
      'max-depth': ['warn', 4],

      // SonarJS — cognitive complexity + code smells
      'sonarjs/cognitive-complexity': ['warn', 15],
      'sonarjs/no-duplicate-string': ['warn', { threshold: 4 }],
      'sonarjs/no-identical-functions': 'warn'
    }
  },

  // Relax rules for test files
  {
    files: ['tests/**/*.{ts,js}'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off'
    }
  }
).prepend([
  ...tailwind.configs['flat/recommended'],
  {
    settings: {
      tailwindcss: {
        config: '.config/tailwind.config.js',
        whitelist: ['esm\\-[a-zA-Z0-9]+(\\/[0-9]+)?']
      }
    }
  }
])
