<template>
  <div class="size-full overflow-hidden border border-gray-200 bg-gray-100">
    <!-- Loading state - don't show map until locations are ready -->
    <div
      v-if="loading || !locationsReady"
      class="flex h-full items-center justify-center"
    >
      <div class="text-center">
        <div class="text-2xl">
          🗺️
        </div>
        <p class="mt-2 text-sm text-gray-600">
          {{ loadingMessage }}
        </p>
      </div>
    </div>

    <!-- Error state -->
    <div
      v-else-if="error"
      class="flex h-full items-center justify-center"
    >
      <div class="text-center">
        <div class="text-2xl">
          ⚠️
        </div>
        <p class="mt-2 text-sm text-red-600">
          {{ error }}
        </p>
      </div>
    </div>

    <!-- Map container -->
    <div
      v-else
      ref="mapContainer"
      class="relative size-full"
      :class="{
        'fixed inset-0 z-[9999] h-screen w-screen bg-white': isCSSFullscreen,
      }"
    >
      <!-- GPS transition overlay -->
      <div
        v-if="
          isTransitioning
            || (mapInitializationPhase === 'all-locations' && props.userPosition)
        "
        class="absolute inset-0 z-50 flex items-center justify-center bg-blue-50/90 transition-opacity duration-500"
      >
        <div class="text-center">
          <div class="animate-pulse text-2xl">
            🎯
          </div>
          <p class="mt-2 text-sm font-medium text-blue-700">
            Keskendume teie asukohale...
          </p>
        </div>
      </div>

      <LMap
        ref="map"
        :zoom="zoom"
        :center="center"
        :options="mapOptions"
        @ready="onMapReady"
      >
        <!-- Tile layer -->
        <LTileLayer
          :key="currentMapStyle.id"
          :url="currentMapStyle.url"
          :attribution="currentMapStyle.attribution"
          :options="tileOptions"
        />

        <!-- User location marker -->
        <LMarker
          v-if="userPosition"
          :lat-lng="[userPosition.lat, userPosition.lng]"
          :icon="userIcon"
        >
          <LPopup>
            <div class="text-center">
              <div class="text-lg">
                📍
              </div>
              <p class="font-medium">
                {{ $t("map.yourLocation") }}
              </p>
              <p class="text-xs text-gray-600">
                {{ formatCoordinates(userPosition) }}
              </p>
            </div>
          </LPopup>
        </LMarker>

        <!-- Task location markers -->
        <LMarker
          v-for="location in displayedLocations"
          :key="location._id || location.id"
          :ref="(el) => setMarkerRef(el, location)"
          :lat-lng="[location.coordinates.lat, location.coordinates.lng]"
          :icon="getLocationIcon(location)"
          @click="onLocationClick(location)"
        >
          <LPopup>
            <div>
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h3 class="font-medium">
                    {{ getLocationName(location) }}
                  </h3>
                  <!-- eslint-disable-next-line vue/no-v-html -->
                  <div v-html="convertMarkdownLinksToHtml(getLocationDescription(location) || '')" />
                </div>
                <div
                  v-if="isLocationVisited(location)"
                  class="ml-2 text-lg text-green-600"
                >
                  ✓
                </div>
              </div>
              <p class="mt-2 text-xs text-gray-500">
                {{ formatCoordinates(location.coordinates) }}
              </p>
            </div>
          </LPopup>
        </LMarker>
      </LMap>
    </div>

    <!-- Open in Maps button (shown when location is selected) -->
    <div
      v-if="props.selectedLocation && !isCSSFullscreen"
      class="absolute bottom-4 left-1/2 z-[1000] -translate-x-1/2 transform"
    >
      <button
        type="button"
        class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl active:scale-95"
        @click="openInExternalMaps(props.selectedLocation)"
      >
        <span class="text-lg">🗺️</span>
        <span>{{ $t('map.openInMaps') }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet'
import L from 'leaflet'
import type { Map as LeafletMap, LatLngExpression, Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { isSameLocation } from '~/utils/location-sync'
import { useMapFullscreen } from '~/composables/useMapFullscreen'

// Use map styles composable
const { getCurrentStyle, getStyle } = useMapStyles()
const currentMapStyle = computed(
  () => getCurrentStyle.value || getStyle('default')!
)

// Location coordinate interface
interface Coordinates {
  lat: number
  lng: number
}

// User position interface
interface UserPosition {
  lat: number
  lng: number
  accuracy?: number
}

// Task location interface (normalized)
interface TaskLocation {
  _id?: string
  id?: string
  reference?: string
  nimi?: string
  name?: string
  kirjeldus?: string
  description?: string
  coordinates: Coordinates
}

// Map initialization phase
type MapPhase = 'waiting' | 'all-locations' | 'gps-focused'

// Vue Leaflet component refs
interface MapRef {
  leafletObject: LeafletMap
  _container?: HTMLElement
  _size?: {
    x: number
    y: number
  }
}

interface MarkerRef {
  leafletObject: L.Marker
  openPopup: () => void
}

// Props
interface Props {
  locations?: TaskLocation[]
  userPosition?: UserPosition | null
  maxLocations?: number
  visitedLocations?: Set<string>
  loading?: boolean
  selectedLocation?: TaskLocation | null
}

const props = withDefaults(defineProps<Props>(), {
  locations: () => [],
  userPosition: null,
  maxLocations: 5,
  visitedLocations: () => new Set(),
  loading: false,
  selectedLocation: null
})

// Emits
interface Emits {
  (e: 'map-ready'): void
  (e: 'location-click', location: TaskLocation): void
}

const emit = defineEmits<Emits>()

// Import location utility
const { formatCoordinates, getLocationName, getLocationDescription }
  = useLocation()

// Map fullscreen composable refs
const mapContainer = useTemplateRef('mapContainer')
const leafletMapRef = computed(
  () => (map.value?.leafletObject || null) as LeafletMap | null
)
const {
  isCSSFullscreen,
  isInFullscreenMode,
  toggle: toggleFullscreen
} = useMapFullscreen(mapContainer, leafletMapRef as Ref<LeafletMap | null>)

// Fix Leaflet icon issues in bundlers
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)
  ._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
})

// Component state
const map = ref<MapRef | null>(null)
const error = ref<string | null>(null)
const zoom = ref<number>(13)
const center = ref<[number, number]>([59.437, 24.7536]) // Default to Tallinn

// Map initialization phase
const mapInitializationPhase = ref<MapPhase>('waiting')
const isTransitioning = ref<boolean>(false)

// Check if locations are ready for map display
const locationsReady = computed(() => {
  return props.locations && props.locations.length > 0
})

// Loading message based on initialization phase
const loadingMessage = computed(() => {
  if (props.loading) return 'Laadime ülesandeid...'
  if (!locationsReady.value) return 'Otsime asukohti...'
  if (mapInitializationPhase.value === 'waiting')
    return 'Valmistame kaarti ette...'
  if (mapInitializationPhase.value === 'all-locations' && !props.userPosition)
    return 'Küsime GPS lubasi...'
  if (mapInitializationPhase.value === 'all-locations' && props.userPosition)
    return 'Keskendume teie asukohale...'
  return 'Viimistleme vaadet...'
})

// 🔍 EVENT TRACKING: Map component setup
console.log('🗺️ [EVENT] InteractiveMap - Component setup started', {
  timestamp: new Date().toISOString(),
  locationCount: props.locations?.length || 0
})

// Marker refs for popup control
const markerRefs = ref<Map<string, MarkerRef>>(new Map())

// Set marker reference for popup control
const setMarkerRef = (
  el: Element | ComponentPublicInstance | null,
  location: TaskLocation
): void => {
  if (el && typeof el === 'object' && 'leafletObject' in el) {
    const locationKey
      = location._id
        || location.id
        || `${location.coordinates.lat}-${location.coordinates.lng}`
    markerRefs.value.set(locationKey, el as unknown as MarkerRef)
  }
}

// Map configuration
const mapOptions = {
  zoomControl: true,
  attributionControl: true,
  scrollWheelZoom: true,
  doubleClickZoom: true,
  dragging: true
}

const tileOptions = {
  maxZoom: 18,
  minZoom: 3
}

// Convert markdown links to safe HTML
const convertMarkdownLinksToHtml = (text: string): string => {
  if (!text) return ''

  // Simple and safe markdown link regex: [text](url)
  // This regex specifically looks for the markdown link pattern
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g

  return text.replace(markdownLinkRegex, (match, linkText, url) => {
    // Basic URL validation - must start with http:// or https://
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return match // Return original if URL is not safe
    }

    // Escape HTML in link text to prevent XSS
    const escapedText = linkText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')

    // Create safe HTML link
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">${escapedText}</a>`
  })
}

// Custom icons
const userIcon: Icon = L.divIcon({
  html: '<div style="background: #3b82f6; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">📍</div>',
  className: 'custom-user-icon',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
}) as Icon

const locationIcon: Icon = L.divIcon({
  html: '<div style="background: #ef4444; color: white; border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; font-size: 10px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">📍</div>',
  className: 'custom-location-icon',
  iconSize: [16, 16],
  iconAnchor: [8, 8]
}) as Icon

const visitedLocationIcon: Icon = L.divIcon({
  html: '<div style="background: #22c55e; color: white; border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; font-size: 10px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">✓</div>',
  className: 'custom-visited-icon',
  iconSize: [16, 16],
  iconAnchor: [8, 8]
}) as Icon

const selectedLocationIcon: Icon = L.divIcon({
  html: '<div style="background: #3b82f6; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; border: 3px solid #1d4ed8; box-shadow: 0 4px 8px rgba(0,0,0,0.4); animation: pulse 2s infinite;">📍</div>',
  className: 'custom-selected-icon',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
}) as Icon

// Check if a location has been visited
const isLocationVisited = (location: TaskLocation): boolean => {
  const locationRef = location.reference || location._id
  if (!locationRef || !props.visitedLocations) return false

  return props.visitedLocations.has(locationRef)
}

// Check if a location is currently selected
const isLocationSelected = (location: TaskLocation): boolean => {
  if (!props.selectedLocation || !location) return false
  return isSameLocation(location, props.selectedLocation)
}

// Get appropriate icon for location
const getLocationIcon = (location: TaskLocation): Icon => {
  if (isLocationSelected(location)) {
    return selectedLocationIcon
  }
  return isLocationVisited(location) ? visitedLocationIcon : locationIcon
}

// Filter and process locations
const displayedLocations = computed<TaskLocation[]>(() => {
  // Only log on first run or significant changes
  if (process.env.NODE_ENV === 'development') {
    console.log('🗺️ [EVENT] InteractiveMap - Computing displayedLocations', {
      locationCount: props.locations?.length || 0
    })
  }

  if (!props.locations?.length) {
    return []
  }

  // Filter locations that have valid normalized coordinates
  const locationsWithCoords = props.locations.filter(
    (location): location is TaskLocation => {
      return (
        !!location.coordinates
        && typeof location.coordinates.lat === 'number'
        && typeof location.coordinates.lng === 'number'
      )
    }
  )

  if (process.env.NODE_ENV === 'development') {
    console.log('🗺️ [EVENT] InteractiveMap - Filtered locations result:', {
      totalInput: props.locations.length,
      withValidCoords: locationsWithCoords.length
    })
  }

  return locationsWithCoords
})

// Calculate the closest unvisited locations for viewport centering
const closestUnvisitedLocations = computed<TaskLocation[]>(() => {
  const unvisitedLocations = displayedLocations.value.filter((location) => {
    return !isLocationVisited(location)
  })

  // Just take the first few unvisited locations for viewport centering
  // (Distance sorting happens in LocationPicker where it's actually used)
  return unvisitedLocations.slice(0, props.maxLocations)
})

// Two-stage map bounds calculation
const calculateMapBounds = async (): Promise<void> => {
  try {
    if (!map.value?.leafletObject) {
      console.log(
        '🗺️ [EVENT] InteractiveMap - Map not ready, skipping bounds calculation'
      )
      return
    }

    // Wait for map to fully initialize
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Check if map container is properly initialized
    const container = map.value.leafletObject.getContainer()
    if (!container) {
      console.warn(
        '🗺️ [EVENT] InteractiveMap - Map container not ready yet, skipping bounds calculation'
      )
      return
    }

    // PHASE 1: Show all locations for overview
    if (
      mapInitializationPhase.value === 'waiting'
      && props.locations?.length > 0
    ) {
      console.log(
        '🗺️ [EVENT] InteractiveMap - PHASE 1: Showing all locations overview',
        {
          locationCount: props.locations.length
        }
      )

      mapInitializationPhase.value = 'all-locations'
      await fitAllLocationsBounds()

      // After Phase 1, check if we can immediately proceed to Phase 2
      if (props.userPosition) {
        console.log(
          '🗺️ [EVENT] InteractiveMap - User position available after Phase 1, scheduling Phase 2'
        )
        // Small delay to allow Phase 1 to settle, then trigger Phase 2
        setTimeout(async () => {
          await calculateMapBounds()
        }, 2000)
      }
    }
    // PHASE 2: GPS-focused view with user position + 5 closest unvisited
    else if (
      mapInitializationPhase.value === 'all-locations'
      && props.userPosition
    ) {
      console.log(
        '🗺️ [EVENT] InteractiveMap - PHASE 2: GPS-focused view transition',
        {
          hasUserPosition: !!props.userPosition,
          userPosition: props.userPosition,
          closestUnvisited: closestUnvisitedLocations.value?.length || 0,
          mapPhase: mapInitializationPhase.value
        }
      )

      mapInitializationPhase.value = 'gps-focused'
      await fitGpsFocusedBounds()
    }
    else {
      // Debug why Phase 2 didn't execute
      console.log('🗺️ [EVENT] InteractiveMap - Phase 2 conditions not met', {
        mapPhase: mapInitializationPhase.value,
        hasUserPosition: !!props.userPosition,
        userPosition: props.userPosition
      })
    }
  }
  catch (err) {
    console.error(
      '🗺️ [EVENT] InteractiveMap - Error calculating map bounds:',
      err
    )
    error.value = 'Kaardi piirkonna arvutamisel tekkis viga'
  }
}

// Phase 1: Fit all locations for overview
const fitAllLocationsBounds = async (): Promise<void> => {
  const bounds: [number, number][] = []

  // Add all locations to bounds for overview
  props.locations.forEach((location) => {
    if (location.coordinates) {
      bounds.push([location.coordinates.lat, location.coordinates.lng])
    }
  })

  console.log(
    '🗺️ [EVENT] InteractiveMap - Phase 1 bounds points:',
    bounds.length
  )

  if (bounds.length === 0) return
  if (!map.value) return

  if (bounds.length === 1) {
    // Single location - center with medium zoom
    console.log('🗺️ [EVENT] InteractiveMap - Phase 1: Single location view')
    const boundsPoint = bounds[0]
    if (boundsPoint) {
      center.value = boundsPoint
      zoom.value = 14
      map.value.leafletObject.setView(boundsPoint, 14)
    }
  }
  else {
    // Multiple locations - fit all with generous padding for overview
    console.log('🗺️ [EVENT] InteractiveMap - Phase 1: All locations overview')
    const leafletBounds = L.latLngBounds(bounds)
    map.value.leafletObject.fitBounds(leafletBounds, {
      padding: [30, 30],
      maxZoom: 12 // Lower max zoom for better overview
    })
  }
}

// Phase 2: Fit GPS-focused view with user + closest unvisited
const fitGpsFocusedBounds = async (): Promise<void> => {
  const bounds: [number, number][] = []

  // Add user position first
  if (props.userPosition) {
    bounds.push([props.userPosition.lat, props.userPosition.lng])
  }

  // Add closest unvisited locations for focused view
  closestUnvisitedLocations.value.forEach((location) => {
    if (location.coordinates) {
      bounds.push([location.coordinates.lat, location.coordinates.lng])
    }
  })

  console.log(
    '🗺️ [EVENT] InteractiveMap - Phase 2 bounds points:',
    bounds.length
  )

  if (bounds.length === 0) return
  if (!map.value) return

  if (bounds.length === 1) {
    // Just user position - center with close zoom
    console.log('🗺️ [EVENT] InteractiveMap - Phase 2: User position focus')
    const boundsPoint = bounds[0]
    if (boundsPoint) {
      center.value = boundsPoint
      zoom.value = 15
      map.value.leafletObject.setView(boundsPoint, 15, {
        animate: true,
        duration: 1.5
      })
    }
  }
  else {
    // User + nearby locations - fit with tighter padding for focus
    console.log('🗺️ [EVENT] InteractiveMap - Phase 2: GPS-focused view')
    const leafletBounds = L.latLngBounds(bounds as LatLngExpression[])
    map.value.leafletObject.fitBounds(leafletBounds, {
      padding: [20, 20],
      maxZoom: 16, // Higher max zoom for focused view
      animate: true,
      duration: 1.5
    })
  }

  // Hide transition overlay after animation
  setTimeout(() => {
    isTransitioning.value = false
  }, 2000)
}

// Open location in external maps app
const openInExternalMaps = (location: TaskLocation): void => {
  const { lat, lng } = location.coordinates
  const name = getLocationName(location)
  
  // Detect platform
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream
  const isAndroid = /android/i.test(userAgent)
  
  let url: string
  
  if (isIOS) {
    // Apple Maps on iOS
    url = `maps://?ll=${lat},${lng}&q=${encodeURIComponent(name)}`
  } else if (isAndroid) {
    // Google Maps on Android (geo: scheme)
    url = `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(name)})`
  } else {
    // Google Maps web for desktop
    url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
  }
  
  window.open(url, '_blank')
}

// Location click handler
const onLocationClick = (location: TaskLocation): void => {
  console.log(
    '[InteractiveMap] Location clicked:',
    location.nimi || location.name || 'unnamed'
  )
  // The popup will open automatically due to the click event
  // We'll emit this to parent for synchronization
  emit('location-click', location)
}

// Programmatically open popup for a location
const openLocationPopup = (location: TaskLocation | null): void => {
  if (!location) return

  const locationKey
    = location._id
      || location.id
      || `${location.coordinates?.lat}-${location.coordinates?.lng}`
  const markerRef = markerRefs.value.get(locationKey)

  if (markerRef && markerRef.leafletObject) {
    // Open the popup
    markerRef.leafletObject.openPopup()

    // Center the map on this location with a slight zoom
    if (map.value && map.value.leafletObject) {
      map.value.leafletObject.setView(
        [location.coordinates.lat, location.coordinates.lng],
        Math.max(zoom.value, 15)
      )
    }
  }
}

// Watch for selectedLocation changes to open popup
watch(
  () => props.selectedLocation,
  (newLocation, oldLocation) => {
    if (newLocation && !isSameLocation(newLocation, oldLocation || {})) {
      console.log(
        '[InteractiveMap] Selected location changed, opening popup:',
        newLocation.nimi || newLocation.name || 'unnamed'
      )
      nextTick(() => {
        openLocationPopup(newLocation)
      })
    }
  },
  { deep: true }
)

// Map ready handler
// Handle map ready event
const onMapReady = async (): Promise<void> => {
  try {
    // 🔍 EVENT TRACKING: Map ready
    console.log('🗺️ [EVENT] InteractiveMap - Map ready', {
      timestamp: new Date().toISOString(),
      locationCount: props.locations?.length || 0,
      hasUserPosition: !!props.userPosition
    })

    // Add custom fullscreen control to Leaflet controls (always visible)
    if (map.value?.leafletObject) {
      const leafletMap = map.value.leafletObject

      // Create custom control
      const FullscreenControl = L.Control.extend({
        options: {
          position: 'topleft'
        },
        onAdd: function () {
          const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control')
          const button = L.DomUtil.create('a', 'leaflet-control-fullscreen', container)

          button.href = '#'
          button.role = 'button'
          button.innerHTML = '⛶'
          button.style.fontSize = '18px'
          button.style.lineHeight = '26px'
          button.style.textAlign = 'center'
          button.style.width = '26px'
          button.style.height = '26px'
          button.style.display = 'block'
          button.style.textDecoration = 'none'
          button.style.color = '#000'

          // Update button on fullscreen state change
          const updateButton = () => {
            button.innerHTML = isInFullscreenMode.value ? '⊗' : '⛶'
            button.title = isInFullscreenMode.value
              ? 'Exit fullscreen' // Will be replaced by i18n in watch
              : 'Enter fullscreen'
            button.setAttribute('aria-label', button.title)
          }

          updateButton()

          // Watch for fullscreen state changes
          watch(isInFullscreenMode, updateButton)

          // Handle click
          L.DomEvent.on(button, 'click', function (e: Event) {
            L.DomEvent.stopPropagation(e)
            L.DomEvent.preventDefault(e)
            toggleFullscreen()
          })

          // Prevent map interactions on the button
          L.DomEvent.disableClickPropagation(container)
          L.DomEvent.disableScrollPropagation(container)

          return container
        }
      })

      leafletMap.addControl(new FullscreenControl())
    }

    emit('map-ready')

    // If locations are already loaded, start the initialization immediately
    if (
      props.locations?.length > 0
      && mapInitializationPhase.value === 'waiting'
    ) {
      console.log(
        '🗺️ [EVENT] InteractiveMap - Map ready with locations, starting initialization'
      )
      await nextTick()
      await calculateMapBounds()
    }
  }
  catch (err) {
    console.error('🗺️ [EVENT] InteractiveMap - Error in onMapReady:', err)
    error.value = 'Kaardi käivitamisel tekkis viga'
  }
}

// Watch for location changes to trigger Phase 1 (only if map is ready)
watch(
  () => props.locations,
  async (newLocations) => {
    if (
      newLocations?.length > 0
      && mapInitializationPhase.value === 'waiting'
      && map.value?.leafletObject
    ) {
      console.log(
        '🗺️ [EVENT] InteractiveMap - Locations ready with map ready, triggering Phase 1'
      )
      await nextTick()
      await calculateMapBounds()
    }
    else if (
      newLocations?.length > 0
      && mapInitializationPhase.value === 'waiting'
    ) {
      console.log(
        '🗺️ [EVENT] InteractiveMap - Locations ready but map not ready yet, waiting...'
      )
    }
  },
  { deep: true }
)

// Watch for userPosition changes to trigger Phase 2
watch(
  () => props.userPosition,
  async (newUserPosition) => {
    if (newUserPosition && mapInitializationPhase.value === 'all-locations') {
      console.log(
        '🗺️ [EVENT] InteractiveMap - User position available, triggering Phase 2 transition'
      )
      isTransitioning.value = true
      await nextTick()
      // Small delay for smooth UX before transitioning
      setTimeout(async () => {
        await calculateMapBounds()
        isTransitioning.value = false
      }, 1500)
    }
  },
  { deep: true }
)

// Component lifecycle
onMounted(() => {
  // Set initial center based on user position or default
  if (props.userPosition) {
    center.value = [props.userPosition.lat, props.userPosition.lng]
  }
})
</script>

<style scoped>
/* Ensure map container has proper styling */
.leaflet-container {
  height: 100%;
  width: 100%;
}

/* Custom marker styles */
:deep(.custom-user-icon) {
  background: transparent !important;
  border: none !important;
}

:deep(.custom-location-icon) {
  background: transparent !important;
  border: none !important;
}

:deep(.custom-visited-icon) {
  background: transparent !important;
  border: none !important;
}

:deep(.custom-selected-icon) {
  background: transparent !important;
  border: none !important;
}

/* Pulse animation for selected markers */
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Popup styling */
:deep(.leaflet-popup-content-wrapper) {
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

:deep(.leaflet-popup-content) {
  margin: 12px;
  line-height: 1.4;
}

/* Fade transition for exit hint */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
