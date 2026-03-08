<script lang="ts">
/**
 * Resolves the museum logo source path based on locale.
 * Exported as named export for unit testing without DOM environment.
 */
export function resolveLogoSrc (locale: string): string {
  if (locale === 'et') return '/esm-logo-et.svg'
  if (locale === 'en') return '/esm-logo-en.svg'
  return '/esm_logo.png'
}

/** Default CSS classes for logo sizing */
export const DEFAULT_CLASS = 'h-20 w-auto'
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  class?: string
}>(), {
  class: DEFAULT_CLASS
})

const { locale, t } = useI18n()

const logoSrc = computed(() => resolveLogoSrc(locale.value))
</script>

<template>
  <img
    :src="logoSrc"
    :alt="t('museumLogoAlt', t('title'))"
    :class="props.class"
  >
</template>
