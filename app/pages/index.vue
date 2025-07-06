<script setup>
// Home page component
</script>

<template>
  <div>
    <AppHeader />
    <div class="container mx-auto px-4 py-8">
      <h1 class="mb-6 text-3xl font-bold">
        {{ $t('title') }}
      </h1>
      <p class="mb-4">
        {{ $t('description') }}
      </p>

      <div class="mt-8">
        <h2 class="mb-4 text-2xl font-semibold">
          {{ $t('navigation.title') }}
        </h2>
        <ul class="list-inside list-disc space-y-2">
          <li>
            <NuxtLink
              to="/kaardid"
              class="text-blue-600 hover:underline"
            >
              {{ $t('navigation.maps') }}
            </NuxtLink>
            <span class="ml-2 text-sm text-gray-600">({{ $t('navigation.requiresLogin') }})</span>
          </li>
          <li>
            <NuxtLink
              to="/entu/kml-plugin"
              class="text-blue-600 hover:underline"
            >
              {{ $t('navigation.kmlPlugin') }}
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/dev/entu-console"
              class="text-blue-600 hover:underline"
            >
              {{ $t('navigation.entuConsole') }}
            </NuxtLink>
            <span class="ml-2 text-sm text-gray-600">({{ $t('navigation.requiresLogin') }})</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<i18n lang="yaml">
en:
  title: ESMuseum Map Application
  description: A Nuxt.js 3 application for the Estonian Museum interactive map, displaying museum information with KML import capabilities.
  navigation:
    title: Available Pages
    kmlPlugin: KML Plugin
    maps: Maps
    entuConsole: Entu API Console
    requiresLogin: requires login
et:
  title: ESMuseumi kaardirakendus
  description: Nuxt.js 3 rakendus Eesti Muuseumi interaktiivse kaardi jaoks, mis kuvab muuseumi teavet KML-importimise võimalustega.
  navigation:
    title: Saadaval lehed
    kmlPlugin: KML Plugin
    maps: Kaardid
    entuConsole: Entu API Konsool
    requiresLogin: nõuab sisselogimist
</i18n>
