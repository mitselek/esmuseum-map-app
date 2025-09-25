// @ts-check
import tailwind from 'eslint-plugin-tailwindcss'
import withNuxt from '../.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    '@stylistic/arrow-parens': ['error', 'always'],
    '@stylistic/comma-dangle': ['error', 'never'],
    '@stylistic/quote-props': ['error', 'as-needed'],
    '@stylistic/space-before-function-paren': ['error', 'always']
  }
}).prepend([
  ...tailwind.configs['flat/recommended'],
  {
    settings: {
      tailwindcss: { config: '.config/tailwind.config.ts' }
    }
  }
])
