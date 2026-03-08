/**
 * Tests for useMapStyles composable
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock useClientLogger (auto-imported in Nuxt)
const mockLogger = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
}
;(globalThis as any).useClientLogger = vi.fn(() => mockLogger)

// Import after mocking globals
const { MAP_STYLES, useMapStyles } = await import('~/composables/useMapStyles')

describe('useMapStyles', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset currentStyle to default
    const { currentStyle } = useMapStyles()
    currentStyle.value = 'default'
  })

  describe('MAP_STYLES constant', () => {
    it('should contain all expected style entries', () => {
      const expectedIds = ['default', 'vintage', 'toner', 'tonerLite', 'terrain', 'topo', 'positron', 'darkMatter', 'voyager']
      expect(Object.keys(MAP_STYLES)).toEqual(expectedIds)
    })

    it('should have required properties on each style', () => {
      for (const style of Object.values(MAP_STYLES)) {
        expect(style).toHaveProperty('id')
        expect(style).toHaveProperty('name')
        expect(style).toHaveProperty('description')
        expect(style).toHaveProperty('url')
        expect(style).toHaveProperty('attribution')
        expect(typeof style.url).toBe('string')
        expect(style.url).toContain('{z}')
      }
    })
  })

  describe('getStyles', () => {
    it('should return all styles as array', () => {
      const { getStyles } = useMapStyles()
      const styles = getStyles()
      expect(styles).toHaveLength(Object.keys(MAP_STYLES).length)
      expect(styles[0]!.id).toBe('default')
    })
  })

  describe('getStyle', () => {
    it('should return specific style by ID', () => {
      const { getStyle } = useMapStyles()
      const vintage = getStyle('vintage')
      expect(vintage).toBeDefined()
      expect(vintage!.name).toBe('Stamen Watercolor')
    })

    it('should return undefined for unknown style', () => {
      const { getStyle } = useMapStyles()
      expect(getStyle('nonexistent')).toBeUndefined()
    })
  })

  describe('getCurrentStyle', () => {
    it('should return default style initially', () => {
      const { getCurrentStyle } = useMapStyles()
      expect(getCurrentStyle.value!.id).toBe('default')
      expect(getCurrentStyle.value!.name).toBe('OpenStreetMap')
    })

    it('should update when currentStyle changes', () => {
      const { currentStyle, getCurrentStyle } = useMapStyles()
      currentStyle.value = 'vintage'
      expect(getCurrentStyle.value!.id).toBe('vintage')
    })

    it('should fall back to default for invalid currentStyle', () => {
      const { currentStyle, getCurrentStyle } = useMapStyles()
      currentStyle.value = 'nonexistent'
      expect(getCurrentStyle.value!.id).toBe('default')
    })
  })

  describe('setStyle', () => {
    it('should set a valid style and return true', () => {
      const { setStyle, currentStyle } = useMapStyles()
      const result = setStyle('vintage')
      expect(result).toBe(true)
      expect(currentStyle.value).toBe('vintage')
    })

    it('should log on successful style change', () => {
      const { setStyle } = useMapStyles()
      setStyle('toner')
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Stamen Toner')
      )
    })

    it('should return false for unknown style', () => {
      const { setStyle, currentStyle } = useMapStyles()
      const result = setStyle('nonexistent')
      expect(result).toBe(false)
      expect(currentStyle.value).toBe('default')
    })

    it('should log error for unknown style', () => {
      const { setStyle } = useMapStyles()
      setStyle('nonexistent')
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Unknown style: nonexistent')
      )
    })
  })

  describe('listStyles', () => {
    it('should log all styles', () => {
      const { listStyles } = useMapStyles()
      listStyles()
      // Header + 2 lines per style + 2 usage lines = many debug calls
      expect(mockLogger.debug).toHaveBeenCalled()
      const calls = mockLogger.debug.mock.calls.map((c: any[]) => c[0])
      expect(calls).toContain('Available Map Styles:')
      expect(calls.some((c: string) => c.includes('window.$map.setStyle'))).toBe(true)
    })
  })

  describe('singleton state', () => {
    it('should share currentStyle across instances', () => {
      const instance1 = useMapStyles()
      const instance2 = useMapStyles()
      instance1.setStyle('terrain')
      expect(instance2.currentStyle.value).toBe('terrain')
    })
  })
})
