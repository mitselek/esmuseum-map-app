<script setup>
// Define middleware for this route to require authentication
definePageMeta({
  middleware: ['auth']
})

// Get Entu API access
const { isLoading, error, getEntitiesByType } = useEntuApi()

// Fetch maps data
const maps = ref([])
const fetchMaps = async () => {
  try {
    const response = await getEntitiesByType('kaart', 'name,kirjeldus,url')
    if (response && response.entities) {
      maps.value = response.entities
    }
  }
  catch (err) {
    console.error('Error fetching maps:', err)
  }
}

// Load data when component mounts
onMounted(() => {
  fetchMaps()
})
</script>

<template>
  <div>
    <AppHeader />
    <div class="container mx-auto px-4 py-8">
      <h1 class="mb-6 text-3xl font-bold">
        {{ $t('title') }}
      </h1>

      <div
        v-if="isLoading"
        class="my-8 text-center"
      >
        <p>{{ $t('loading') }}</p>
      </div>

      <div
        v-else-if="error"
        class="my-8 rounded bg-red-100 p-4 text-red-700"
      >
        <p>{{ $t('error') }}: {{ error }}</p>
      </div>

      <div
        v-else-if="maps.length === 0"
        class="my-8 text-center"
      >
        <p>{{ $t('noMaps') }}</p>
      </div>

      <div
        v-else
        class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <div
          v-for="map in maps"
          :key="map._id"
          class="rounded-lg border p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <h2 class="mb-2 text-xl font-semibold">
            {{ map.name?.[0]?.string || map.properties?.name?.[0]?.value || $t('untitled') }}
          </h2>

          <p
            v-if="map.properties?.kirjeldus?.[0]?.value"
            class="mb-4 text-gray-600"
          >
            {{ map.properties.kirjeldus[0].value }}
          </p>

          <div
            v-if="map.properties?.url?.[0]?.value"
            class="mt-4"
          >
            <a
              :href="map.properties.url[0].value"
              target="_blank"
              class="text-blue-600 hover:underline"
            >
              {{ $t('viewMap') }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<i18n lang="yaml">
en:
  title: Maps
  loading: Loading maps...
  error: Error loading maps
  noMaps: No maps found
  untitled: Untitled Map
  viewMap: View Map
et:
  title: Kaardid
  loading: Kaartide laadimine...
  error: Viga kaartide laadimisel
  noMaps: Kaarte ei leitud
  untitled: Nimetu kaart
  viewMap: Vaata kaarti
</i18n>
