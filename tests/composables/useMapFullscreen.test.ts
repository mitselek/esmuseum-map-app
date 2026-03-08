/**
 * Tests for useMapFullscreen composable
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, nextTick } from 'vue'

// Mock @vueuse/core useFullscreen
const mockIsSupported = ref(true)
const mockIsFullscreen = ref(false)
const mockToggle = vi.fn()

vi.mock('@vueuse/core', () => ({
  useFullscreen: vi.fn(() => ({
    isSupported: mockIsSupported,
    isFullscreen: mockIsFullscreen,
    toggle: mockToggle
  }))
}))

const { useMapFullscreen } = await import('~/composables/useMapFullscreen')

// Minimal HTMLElement stub for Node environment
function createMockElement (): any {
  return { tagName: 'DIV', style: {}, classList: { add: vi.fn(), remove: vi.fn() } }
}

describe('useMapFullscreen', () => {
  let mapContainer: ReturnType<typeof ref<any>>
  let leafletMap: ReturnType<typeof ref<any>>

  beforeEach(() => {
    vi.clearAllMocks()
    mockIsSupported.value = true
    mockIsFullscreen.value = false
    mapContainer = ref(createMockElement())
    leafletMap = ref({ invalidateSize: vi.fn() })
  })

  describe('initialization', () => {
    it('should return all expected properties', () => {
      const result = useMapFullscreen(mapContainer, leafletMap)
      expect(result).toHaveProperty('isSupported')
      expect(result).toHaveProperty('isFullscreen')
      expect(result).toHaveProperty('isCSSFullscreen')
      expect(result).toHaveProperty('isInFullscreenMode')
      expect(result).toHaveProperty('toggle')
    })

    it('should start not in fullscreen', () => {
      const { isFullscreen, isCSSFullscreen, isInFullscreenMode } = useMapFullscreen(mapContainer, leafletMap)
      expect(isFullscreen.value).toBe(false)
      expect(isCSSFullscreen.value).toBe(false)
      expect(isInFullscreenMode.value).toBe(false)
    })
  })

  describe('isInFullscreenMode', () => {
    it('should be true when native fullscreen is active', () => {
      mockIsFullscreen.value = true
      const { isInFullscreenMode } = useMapFullscreen(mapContainer, leafletMap)
      expect(isInFullscreenMode.value).toBe(true)
    })

    it('should be true when CSS fullscreen is active', async () => {
      mockIsSupported.value = false
      const { toggle, isInFullscreenMode } = useMapFullscreen(mapContainer, leafletMap)
      await toggle()
      expect(isInFullscreenMode.value).toBe(true)
    })
  })

  describe('toggle', () => {
    it('should call native toggle when supported', async () => {
      mockIsSupported.value = true
      const { toggle } = useMapFullscreen(mapContainer, leafletMap)
      await toggle()
      expect(mockToggle).toHaveBeenCalled()
    })

    it('should use CSS fallback when native not supported', async () => {
      mockIsSupported.value = false
      const { toggle, isCSSFullscreen } = useMapFullscreen(mapContainer, leafletMap)
      expect(isCSSFullscreen.value).toBe(false)
      await toggle()
      expect(isCSSFullscreen.value).toBe(true)
      expect(mockToggle).not.toHaveBeenCalled()
    })

    it('should toggle CSS fullscreen off on second call', async () => {
      mockIsSupported.value = false
      const { toggle, isCSSFullscreen } = useMapFullscreen(mapContainer, leafletMap)
      await toggle() // on
      expect(isCSSFullscreen.value).toBe(true)
      await toggle() // off
      expect(isCSSFullscreen.value).toBe(false)
    })

    it('should attempt haptic feedback when entering fullscreen', async () => {
      const vibrateSpy = vi.fn()
      Object.defineProperty(navigator, 'vibrate', {
        value: vibrateSpy,
        writable: true,
        configurable: true
      })

      // Simulate entering fullscreen by setting isFullscreen before toggle returns
      mockToggle.mockImplementation(() => {
        mockIsFullscreen.value = true
      })

      const { toggle } = useMapFullscreen(mapContainer, leafletMap)
      await toggle()

      expect(vibrateSpy).toHaveBeenCalledWith(200)
    })
  })

  describe('Leaflet resize', () => {
    it('should invalidateSize on fullscreen change', async () => {
      const mockInvalidateSize = vi.fn()
      leafletMap.value = { invalidateSize: mockInvalidateSize }

      useMapFullscreen(mapContainer, leafletMap)

      // Trigger fullscreen change
      mockIsFullscreen.value = true
      await nextTick()
      // The watcher calls nextTick internally, so we need another tick
      await nextTick()

      expect(mockInvalidateSize).toHaveBeenCalled()
    })

    it('should not crash if leafletMap is null', async () => {
      leafletMap.value = null
      useMapFullscreen(mapContainer, leafletMap)

      mockIsFullscreen.value = true
      await nextTick()
      await nextTick()
      // Should not throw
    })
  })
})
