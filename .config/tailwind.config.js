/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/app.vue',
    './app/components/**/*.{js,vue,ts}',
    './app/layouts/**/*.vue',
    './app/nuxt.config.{js,ts}',
    './app/pages/**/*.vue',
    './app/plugins/**/*.{js,ts}'
  ],
  theme: {
    extend: {
      colors: {
        // ESM CVI 2023 brand palette
        esm: {
          gold: '#CE8A2C',
          beige: '#EFE8DD',
          dark: '#2F393B',
          blue: '#008298',
          light: '#C9D6DD',
        },
      },
      fontFamily: {
        // ESM CVI 2023 typography
        display: ['"Canela"', 'Georgia', 'serif'],
        body: ['"ABC Ginto Normal"', 'system-ui', 'sans-serif'],
      },
    },
  },
}
