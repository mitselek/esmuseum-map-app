# Project Context

This file is a template for internal AI context and notes. Add relevant information as needed.

## Project Overview

ESMuseum Map App - A Nuxt.js 3 application for the Estonian Museum interactive map, displaying museum information with KML import capabilities. The app features secure OAuth-based authentication, interactive maps, and integration with the Entu API for museum data.

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
app/
  components/     # Reusable Vue components
  composables/    # Vue composables (including authentication)
  middleware/     # Nuxt routing middleware
  pages/          # Nuxt file-based routing
  plugins/        # Nuxt plugins
  assets/         # CSS and other assets
public/           # Static assets
.config/          # All configuration files (Nuxt, ESLint, Tailwind, i18n)
.copilot-docs/    # Public documentation
.copilot-workspace/ # Working documents and planning
scripts/          # Utility scripts
```

## Development Guidelines

### Code Style & Standards

- Use TypeScript for all files - avoid `any` types
- Follow ESLint configuration in `.config/eslint.config.js`
- Use Tailwind CSS with `eslint-plugin-tailwindcss`
- Prefer Vue 3 Composition API with `<script setup>`
- Use kebab-case for files, PascalCase for component names
- Strict adherence to conventions
- Always look for refactoring opportunities

### Component Development

- Use Naive UI components when available
- Create reusable components
- Use `nuxt-icons` for iconography
- Implement proper TypeScript types for props/emits
- Ensure responsive design and accessibility

### Internationalization

- Use @nuxtjs/i18n for all user-facing text
- Support English (en) and Estonian (et)
- Store translations in component `<i18n>` blocks or locale files

### Authentication

- OAuth-based authentication via Entu API
- Multiple authentication providers (Google, Apple, Smart-ID, Mobile-ID, ID-Card)
- Secure token management with automatic refresh
- Backend-only API key authentication for maintenance tasks
- Route protection middleware for authenticated routes

### API Integration

- Entu API for museum data and authentication
- Use environment variables (see `.env.example`)
- Implement proper error handling
- OAuth flow for secure authentication

### Performance & Best Practices

- Leverage Nuxt.js auto-imports
- Use lazy loading when appropriate
- Optimize bundle size
- Write semantic HTML
- SPA configuration (ssr: false)

### Build Commands

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run lint` - Fix linting issues
