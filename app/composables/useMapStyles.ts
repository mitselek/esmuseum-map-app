/**
 * Map style configurations for easy switching
 * Use in console: window.$map.setStyle('topo') or window.$map.listStyles()
 */

export interface MapStyle {
  id: string
  name: string
  description: string
  url: string
  attribution: string
  /** Highest zoom the provider serves; Leaflet upscales tiles above it */
  maxNativeZoom?: number
}

// Only keyless tile providers: CARTO and Stadia now require API keys (#54)
const ATTR_OSM = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

export const MAP_STYLES: Record<string, MapStyle> = {
  default: {
    id: 'default',
    name: 'OpenStreetMap',
    description: 'Standard street map',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: ATTR_OSM
  },

  topo: {
    id: 'topo',
    name: 'OpenTopoMap',
    description: 'Topographic map (like military maps)',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    maxNativeZoom: 17
  }
}

// Singleton state - shared across all instances
const currentStyle = ref<string>('default')

const logger = useClientLogger('MapStyles')

export function useMapStyles () {
  /**
   * Get all available map styles
   */
  const getStyles = (): MapStyle[] => {
    return Object.values(MAP_STYLES)
  }

  /**
   * Get a specific style by ID
   */
  const getStyle = (styleId: string): MapStyle | undefined => {
    return MAP_STYLES[styleId]
  }

  /**
   * Get current style configuration
   */
  const getCurrentStyle = computed(() => {
    return MAP_STYLES[currentStyle.value] || MAP_STYLES.default
  })

  /**
   * Set the current map style
   */
  const setStyle = (styleId: string): boolean => {
    if (MAP_STYLES[styleId]) {
      currentStyle.value = styleId
      logger.debug(`Map style changed to: ${MAP_STYLES[styleId].name}`)
      return true
    }

    logger.error(`Unknown style: ${styleId}. Available: ${Object.keys(MAP_STYLES).join(', ')}`)
    return false
  }

  /**
   * List all available styles (for console use)
   */

  const listStyles = (): void => {
    logger.debug('Available Map Styles:')
    logger.debug('========================')
    Object.values(MAP_STYLES).forEach((style) => {
      const current = style.id === currentStyle.value ? '✓ ' : '  '
      logger.debug(`${current}${style.id.padEnd(15)} - ${style.name}`)
      logger.debug(`  ${' '.repeat(15)}   ${style.description}`)
    })
    logger.debug('\nUsage: window.$map.setStyle("styleId")')
    logger.debug('Example: window.$map.setStyle("topo")')
  }

  return {
    currentStyle,
    getCurrentStyle,
    getStyles,
    getStyle,
    setStyle,
    listStyles
  }
}
