# esmuseum-map-app Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-09-20

## Active Technologies

- Nuxt.js 3 + Vue 3 Composition API + TypeScript (Hello World, 002-multi-language-greeting)
- @nuxtjs/i18n + Vue I18n for internationalization (002-multi-language-greeting)
- Tailwind CSS for styling (Hello World, 002-multi-language-greeting)
- Vitest + Playwright for testing (Hello World, 002-multi-language-greeting)

## Project Structure

```text
app/
├── components/           # Vue components
├── pages/               # Nuxt pages
├── composables/         # Vue composables
└── server/api/          # API endpoints

locales/                 # i18n translation files
├── et.json             # Estonian (default)
├── uk.json             # Ukrainian
└── en-GB.json          # British English

tests/
├── components/         # Component tests
├── e2e/               # E2E tests
└── unit/              # Unit tests
```

## Commands

# Add commands for development workflow

## Code Style

- TypeScript strict mode enabled
- ESLint + Prettier for code quality
- Follow Vue 3 Composition API patterns
- TDD workflow: tests before implementation

## Recent Changes

- Hello World: Initial Nuxt.js setup with responsive component and comprehensive testing
- 002-multi-language-greeting: Added i18n support for Estonian (default), Ukrainian, British English with localStorage persistence and browser locale detection

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
