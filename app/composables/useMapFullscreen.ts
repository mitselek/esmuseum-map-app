import { ref, computed, watch, nextTick } from 'vue'
import { useFullscreen, onLongPress, useTimeoutFn } from '@vueuse/core'
import type { Ref } from 'vue'
import type { Map as LeafletMap } from 'leaflet'

/**
 * Options for map fullscreen behavior
 */
export interface UseMapFullscreenOptions {
  /** Delay in ms before long-press triggers (default: 600) */
  longPressDelay?: number
  /** Max pixel movement before long-press cancels (default: 10) */
  distanceThreshold?: number
  /** Duration in ms to show exit hint (default: 2000) */
  autoHideHint?: number
}

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
  /** Exit hint is currently visible */
  showExitHintState: Readonly<Ref<boolean>>
  /** Manually toggle fullscreen state */
  toggle: () => Promise<void>
}

/**
 * Map fullscreen composable with long-press gesture detection
 *
 * Provides fullscreen functionality for map components with:
 * - Native Fullscreen API for supported browsers
 * - CSS fallback for iOS Safari
 * - Long-press gesture detection (prevents conflict with map pan/drag)
 * - Automatic Leaflet map resize handling
 * - Exit hint with auto-hide
 * - Haptic feedback on trigger (if supported)
 *
 * ⚠️ STRICT REQUIREMENTS:
 * - mapContainer must be initialized before calling this composable
 * - leafletMap must be initialized before calling this composable
 * - Caller is responsible for ensuring refs are non-null
 *
 * @param mapContainer - Template ref to map container element (must be non-null)
 * @param leafletMap - Ref to Leaflet map instance (must be non-null)
 * @param options - Configuration options
 * @returns Fullscreen state and controls
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * const mapContainer = useTemplateRef('mapContainer')
 * const map = ref<Map | null>(null)
 *
 * // Initialize map first
 * onMounted(() => {
 *   map.value = L.map('map', { ... })
 *
 *   // Only call composable after refs are ready
 *   const { isInFullscreenMode } = useMapFullscreen(
 *     mapContainer as Ref<HTMLElement>,
 *     map as Ref<Map>
 *   )
 * })
 * </script>
 * ```
 */
export function useMapFullscreen (
  mapContainer: Ref<HTMLElement | null>,
  leafletMap: Ref<LeafletMap | null>,
  options: UseMapFullscreenOptions = {}
): UseMapFullscreenReturn {
  const {
    longPressDelay = 600,
    distanceThreshold = 10,
    autoHideHint = 2000
  } = options

  // Native fullscreen support (VueUse handles null refs internally)
  const { isSupported, isFullscreen, toggle } = useFullscreen(mapContainer, {
    autoExit: false
  })

  // CSS fallback for iOS Safari
  const isCSSFullscreen = ref(false)

  // Combined fullscreen state
  const isInFullscreenMode = computed(() =>
    isFullscreen.value || isCSSFullscreen.value
  )

  // Exit hint state with auto-hide (VueUse handles cleanup)
  const showExitHintState = ref(false)
  const { start: startHintTimer, stop: stopHintTimer } = useTimeoutFn(() => {
    showExitHintState.value = false
  }, autoHideHint)

  /**
   * Show exit hint with auto-hide timer
   */
  function showExitHint () {
    showExitHintState.value = true
    stopHintTimer() // Clear previous timer
    startHintTimer() // Start new timer
  }

  /**
   * Toggle fullscreen (native API or CSS fallback)
   *
   * Platform detection happens upfront via isSupported.
   * No error handling - if fullscreen fails, it's a user-facing issue.
   */
  async function toggleFullscreen (event?: PointerEvent | MouseEvent) {
    // Ignore right-click (button: 2) and middle-click (button: 1)
    // Only accept left-click (button: 0) or programmatic calls (no event)
    if (event && 'button' in event && event.button !== 0) {
      return
    }

    if (isSupported.value) {
      // Native Fullscreen API (Android, Desktop)
      await toggle()
    }
    else {
      // CSS fallback for iOS Safari (platform limitation, not error)
      isCSSFullscreen.value = !isCSSFullscreen.value
    }

    // Show hint when entering fullscreen
    if (isInFullscreenMode.value) {
      showExitHint()

      // Haptic feedback (gracefully degrades if not supported)
      navigator.vibrate?.(200)
    }
  }

  // Long-press gesture handler (VueUse handles null refs)
  // Note: We don't use preventDefault modifier here as it would block map dragging
  // Text selection is prevented via CSS (user-select: none)
  onLongPress(
    mapContainer,
    toggleFullscreen,
    {
      delay: longPressDelay,
      distanceThreshold
    }
  )

  // Fix Leaflet map rendering after fullscreen state change
  // If map is null, it's a bug - let it fail fast
  watch(isInFullscreenMode, async () => {
    await nextTick() // Wait for DOM updates
    leafletMap.value?.invalidateSize() // Optional chaining for TS, not defense
  })

  return {
    isSupported: computed(() => isSupported.value),
    isFullscreen: computed(() => isFullscreen.value),
    isCSSFullscreen: computed(() => isCSSFullscreen.value),
    isInFullscreenMode,
    showExitHintState: computed(() => showExitHintState.value),
    toggle: toggleFullscreen
  }
}
