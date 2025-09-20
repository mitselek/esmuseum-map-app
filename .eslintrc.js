module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  extends: [
    '@nuxtjs/eslint-config-typescript',
    'plugin:nuxt/recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    // Constitutional requirement: No any types
    '@typescript-eslint/no-explicit-any': 'error',
    // Vue 3 Composition API best practices
    'vue/multi-word-component-names': 'off',
    // TypeScript strict mode compliance
    '@typescript-eslint/strict-boolean-expressions': 'off',
    // Accessibility requirements
    'vuejs-accessibility/alt-text': 'error',
    'vuejs-accessibility/anchor-has-content': 'error',
  },
  ignorePatterns: [
    'dist/',
    '.nuxt/',
    '.output/',
    'coverage/',
    'node_modules/',
  ],
}