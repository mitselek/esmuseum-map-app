# Development Guidelines

## Project Overview

ESMuseum Map App - A Nuxt.js 3 application for the Estonian Museum interactive map, displaying museum information with KML import capabilities.

## Tech Stack

- **Framework**: Nuxt.js 3 (Vue.js 3)
- **Language**: TypeScript (strict usage)
- **Styling**: Tailwind CSS
- **UI Components**: Naive UI
- **Internationalization**: @nuxtjs/i18n (English & Estonian)
- **Icons**: nuxt-icons
- **Utilities**: @vueuse/nuxt
- **Linting**: ESLint with custom configuration
- **Node Version**: 22.x

## Project Structure

```text
app/pages/           # Nuxt file-based routing
public/             # Static assets
.config/            # All configuration files (Nuxt, ESLint, Tailwind, i18n)
.copilot-docs/      # Shared team documentation
.copilot-workspace/ # Private AI working documents
```

## Code Style & Standards

- Use TypeScript for all files - avoid `any` types
- Follow ESLint configuration in `.config/eslint.config.js`
- Use Tailwind CSS with `eslint-plugin-tailwindcss`
- Prefer Vue 3 Composition API with `<script setup>`
- Use kebab-case for files, PascalCase for component names
- Strict adherence to conventions
- Always look for refactoring opportunities

## Component Development

- Use Naive UI components when available
- Create reusable components
- Use `nuxt-icons` for iconography
- Implement proper TypeScript types for props/emits
- Ensure responsive design and accessibility

## Internationalization

- Use @nuxtjs/i18n for all user-facing text
- Support English (en) and Estonian (et)
- Store translations in component `<i18n>` blocks or locale files

## API Integration

- Discogs API (music-related data)
- Entu API (museum data)
- Use environment variables (see `.env.example`)
- Implement proper error handling

## Performance & Best Practices

- Leverage Nuxt.js auto-imports
- Use lazy loading when appropriate
- Optimize bundle size
- Write semantic HTML
- SPA configuration (ssr: false)

## Build Commands

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run lint` - Fix linting issues
