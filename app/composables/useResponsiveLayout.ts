/**
 * Responsive layout utilities using VueUse
 */

export const useResponsiveLayout = () => {
  // Use VueUse for responsive breakpoints
  const isMobile = useMediaQuery('(max-width: 1023px)') // lg breakpoint
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  return {
    isMobile: readonly(isMobile),
    isTablet: readonly(isTablet),
    isDesktop: readonly(isDesktop)
  }
}
