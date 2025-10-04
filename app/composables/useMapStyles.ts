/**
 * Map style configurations for easy switching
 * Use in console: window.$map.setStyle('vintage') or window.$map.listStyles()
 */

export interface MapStyle {
  id: string
  name: string
  description: string
  url: string
  attribution: string
}

export const MAP_STYLES: Record<string, MapStyle> = {
  default: {
    id: 'default',
    name: 'OpenStreetMap',
    description: 'Standard street map',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  },
  
  vintage: {
    id: 'vintage',
    name: 'Stamen Watercolor',
    description: 'Artistic vintage watercolor style',
    url: 'https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg',
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://stamen.com">Stamen Design</a>'
  },
  
  toner: {
    id: 'toner',
    name: 'Stamen Toner',
    description: 'Black & white vintage print style',
    url: 'https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://stamen.com">Stamen Design</a>'
  },
  
  tonerLite: {
    id: 'tonerLite',
    name: 'Stamen Toner Lite',
    description: 'Light black & white style',
    url: 'https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://stamen.com">Stamen Design</a>'
  },
  
  terrain: {
    id: 'terrain',
    name: 'Stamen Terrain',
    description: 'Terrain with natural colors',
    url: 'https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://stamen.com">Stamen Design</a>'
  },
  
  topo: {
    id: 'topo',
    name: 'OpenTopoMap',
    description: 'Topographic map (like military maps)',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
  },
  
  positron: {
    id: 'positron',
    name: 'CartoDB Positron',
    description: 'Minimal light style',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
  },
  
  darkMatter: {
    id: 'darkMatter',
    name: 'CartoDB Dark Matter',
    description: 'Dark theme',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
  },
  
  voyager: {
    id: 'voyager',
    name: 'CartoDB Voyager',
    description: 'Colorful modern style',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
  }
}

// Singleton state - shared across all instances
const currentStyle = ref<string>('default')

export function useMapStyles() {
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
      console.log(`🗺️ Map style changed to: ${MAP_STYLES[styleId].name}`)
      return true
    }
    console.error(`❌ Unknown style: ${styleId}. Available: ${Object.keys(MAP_STYLES).join(', ')}`)
    return false
  }
  
  /**
   * List all available styles (for console use)
   */
  const listStyles = (): void => {
    console.log('🗺️ Available Map Styles:')
    console.log('========================')
    Object.values(MAP_STYLES).forEach(style => {
      const current = style.id === currentStyle.value ? '✓ ' : '  '
      console.log(`${current}${style.id.padEnd(15)} - ${style.name}`)
      console.log(`  ${' '.repeat(15)}   ${style.description}`)
    })
    console.log('\n💡 Usage: window.$map.setStyle("styleId")')
    console.log('💡 Example: window.$map.setStyle("vintage")')
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
