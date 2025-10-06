import { ref, computed, watch, nextTick } from 'vue'
import { useFullscreen } from '@vueuse/core'
import type { Ref } from 'vue'
import type { Map as LeafletMap } from 'leaflet'

/**
 * Return type for useMapFullscreen composable
 */
export interface UseMapFullscreenReturn {
  /** Browser supports native Fullscreen API */
  isSupported: Readonly<Ref<boolean>>
  /** Currently in native fullscreen mode */
  isFullscreen: Readonly<Ref<boolean>>
  /** Currently in CSS fallback fullscreen mode (iOS) */
  isCSSFullscreen: Readonly<Ref<boolean>>
  /** Currently in any fullscreen mode (native OR CSS) */
  isInFullscreenMode: Readonly<Ref<boolean>>
  /** Manually toggle fullscreen state */
  toggle: () => Promise<void>
}

/**
 * Map fullscreen composable with button control
 *
 * Provides fullscreen functionality for map components with:
 * - Native Fullscreen API for supported browsers
 * - CSS fallback for iOS Safari
 * - Automatic Leaflet map resize handling
 * - Haptic feedback on toggle (if supported)
 *
 * @param mapContainer - Template ref to map container element
 * @param leafletMap - Ref to Leaflet map instance
 * @returns Fullscreen state and controls
 */
export function useMapFullscreen (
  mapContainer: Ref<HTMLElement | null>,
  leafletMap: Ref<LeafletMap | null>
): UseMapFullscreenReturn {
  // Native fullscreen support
  const { isSupported, isFullscreen, toggle } = useFullscreen(mapContainer, {
    autoExit: false
  })

  // CSS fallback for iOS Safari
  const isCSSFullscreen = ref(false)

  // Combined fullscreen state
  const isInFullscreenMode = computed(() =>
    isFullscreen.value || isCSSFullscreen.value
  )

  /**
   * Toggle fullscreen (native API or CSS fallback)
   */
  async function toggleFullscreen () {
    if (isSupported.value) {
      // Native Fullscreen API (Android, Desktop)
      await toggle()
    }
    else {
      // CSS fallback for iOS Safari
      isCSSFullscreen.value = !isCSSFullscreen.value
    }

    // Haptic feedback (if supported)
    if (isInFullscreenMode.value) {
      navigator.vibrate?.(200)
    }
  }

  // Fix Leaflet map rendering after fullscreen state change
  watch(isInFullscreenMode, async () => {
    await nextTick()
    leafletMap.value?.invalidateSize()
  })

  return {
    isSupported: computed(() => isSupported.value),
    isFullscreen: computed(() => isFullscreen.value),
    isCSSFullscreen: computed(() => isCSSFullscreen.value),
    isInFullscreenMode,
    toggle: toggleFullscreen
  }
}
