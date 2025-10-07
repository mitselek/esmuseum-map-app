/**
 * Map Style Scheduler
 * Automatically switches map styles based on contextual rules:
 * - Astronomical events (moon phases, sun position)
 * - Historical dates (Estonian Independence Day, Victory Day)
 * - Time-based conditions
 */

import SunCalc from 'suncalc'
import type { MapStyle } from './useMapStyles'
import { useMapStyles } from './useMapStyles'
import { useLocation } from './useLocation'
import { useBackgroundPulse } from './useBackgroundPulse'

export interface StyleRule {
  id: string
  name: string
  description: string
  styleId: string
  priority: number // Higher priority wins if multiple rules match
  check: () => boolean | Promise<boolean>
}

/**
 * F028 - DST Detection Functions (exported for testing)
 * Calculate the last Sunday of October for DST "fall back" transition
 * 
 * @param year - The year to calculate for (e.g., 2025)
 * @returns Date object representing the last Sunday of October at midnight
 */
export const getLastSundayOfOctober = (year: number): Date => {
  // Start at October 31 and work backwards to find Sunday
  let date = new Date(year, 9, 31) // October = month 9 (0-indexed)
  
  // Walk backwards until we find a Sunday (day 0)
  while (date.getDay() !== 0) {
    date.setDate(date.getDate() - 1)
  }
  
  return date
}

/**
 * F028 - Check if currently during DST "fall back" transition
 * The repeated hour (3:00 AM - 4:00 AM occurs twice) on last Sunday of October
 * 
 * @returns true if currently in the repeated hour period, false otherwise
 */
export const isDSTTransition = (): boolean => {
  const now = new Date()
  const year = now.getFullYear()
  const lastSunday = getLastSundayOfOctober(year)

  // Check if today is the DST transition day
  if (now.toDateString() !== lastSunday.toDateString()) {
    return false
  }

  // Check if time is between 3:00 AM and 3:59:59 AM (both occurrences of repeated hour)
  const hour = now.getHours()
  return hour === 3
}

export function useMapStyleScheduler () {
  const { setStyle, getCurrentStyle } = useMapStyles()
  const { userPosition } = useLocation() // Get user's GPS location
  const { isDSTActive, activatePulse, deactivatePulse } = useBackgroundPulse() // DST background pulse
  const currentRule = ref<string | null>(null)

  /**
   * Calculate moon phase using SunCalc
   * Returns illumination fraction (0-1) where 1 is full moon
   */
  const getMoonIllumination = (date: Date = new Date()): number => {
    const moonIllum = SunCalc.getMoonIllumination(date)
    return moonIllum.fraction
  }

  /**
   * Check if it's a full moon (illumination > 95%)
   */
  const isFullMoon = (date: Date = new Date()): boolean => {
    const illumination = getMoonIllumination(date)
    return illumination > 0.95
  }

  /**
   * Get moonrise and moonset times for user's location
   * Returns null if no GPS available
   */
  const getMoonTimes = (date: Date = new Date()): { rise: Date | null, set: Date | null } => {
    if (!userPosition.value) {
      return { rise: null, set: null }
    }
    const moonTimes = SunCalc.getMoonTimes(date, userPosition.value.lat, userPosition.value.lng)
    return {
      rise: moonTimes.rise || null,
      set: moonTimes.set || null
    }
  }

  /**
   * Get sunrise and sunset times for user's location
   * Returns null if no GPS available
   */
  const getSunTimes = (date: Date = new Date()): { sunrise: Date | null, sunset: Date | null } => {
    if (!userPosition.value) {
      return { sunrise: null, sunset: null }
    }
    const sunTimes = SunCalc.getTimes(date, userPosition.value.lat, userPosition.value.lng)
    return {
      sunrise: sunTimes.sunrise,
      sunset: sunTimes.sunset
    }
  }

  /**
   * Check if current time is during daylight hours
   * Returns false if no GPS available
   */
  const isDaylight = (): boolean => {
    if (!userPosition.value) return false

    const now = new Date()
    const { sunrise, sunset } = getSunTimes(now)

    if (!sunrise || !sunset) return false
    return now >= sunrise && now <= sunset
  }

  /**
   * Check if current time is between moonrise and moonset on a full moon Thursday
   * Returns false if no GPS available
   */
  const isFullMoonThursday = (): boolean => {
    if (!userPosition.value) return false

    const now = new Date()
    const isThursday = now.getDay() === 4 // Thursday = 4

    if (!isThursday) return false
    if (!isFullMoon(now)) return false

    const { rise, set } = getMoonTimes(now)

    // If no moonrise/moonset data, return false
    if (!rise || !set) return false

    // Check if current time is between moonrise and moonset
    return now >= rise && now <= set
  }

  /**
   * Check if today is Estonian Independence Day (February 24) during daylight
   */
  const isIndependenceDay = (): boolean => {
    const now = new Date()
    const isFeb24 = now.getMonth() === 1 && now.getDate() === 24 // February = 1
    return isFeb24 && isDaylight()
  }

  /**
   * Check if today is Victory Day (June 23)
   */
  const isVictoryDay = (): boolean => {
    const now = new Date()
    return now.getMonth() === 5 && now.getDate() === 23 // June = 5
  }

  /**
   * Define style rules with priorities
   */
  const styleRules: StyleRule[] = [
    {
      id: 'dst-transition',
      name: 'Evil DST Transition',
      description: 'Black & white toner + red pulse during fall DST transition (3-4 AM repeated hour)',
      styleId: 'toner',
      priority: 100, // HIGH priority - overrides all other rules
      check: isDSTTransition
    },
    {
      id: 'independence-day',
      name: 'Estonian Independence Day',
      description: 'Vintage watercolor style on Feb 24 during daylight (sunrise to sunset)',
      styleId: 'vintage',
      priority: 100,
      check: isIndependenceDay
    },
    {
      id: 'victory-day',
      name: 'Victory Day',
      description: 'Terrain style on Jun 23',
      styleId: 'terrain',
      priority: 90,
      check: isVictoryDay
    },
    {
      id: 'full-moon-thursday',
      name: 'Full Moon Thursday',
      description: 'Black & white toner style during full moon on Thursdays (moonrise to moonset)',
      styleId: 'toner',
      priority: 80,
      check: isFullMoonThursday
    },
    {
      id: 'default',
      name: 'Default Style',
      description: 'Voyager style as default',
      styleId: 'voyager',
      priority: 0,
      check: () => true // Always matches
    }
  ]

  /**
   * Evaluate all rules and return the highest priority matching rule
   */
  const evaluateRules = async (): Promise<StyleRule | null> => {
    const matchingRules: StyleRule[] = []

    for (const rule of styleRules) {
      try {
        const matches = await Promise.resolve(rule.check())
        if (matches) {
          matchingRules.push(rule)
        }
      }
      catch (error) {
        console.error(`Error evaluating rule ${rule.id}:`, error)
      }
    }

    // Sort by priority (highest first)
    matchingRules.sort((a, b) => b.priority - a.priority)

    return matchingRules[0] || null
  }

  /**
   * Apply the appropriate style based on current rules
   */
  const applyScheduledStyle = async (): Promise<void> => {
    const previousRule = currentRule.value
    const matchingRule = await evaluateRules()

    if (matchingRule && matchingRule.id !== currentRule.value) {
      console.log(`🗺️ [Scheduler] Applying rule: ${matchingRule.name}`)
      console.log(`   ${matchingRule.description}`)
      setStyle(matchingRule.styleId)
      currentRule.value = matchingRule.id

      // Handle DST transition background pulsation
      if (matchingRule.id === 'dst-transition') {
        activatePulse()
        const timestamp = new Date().toISOString()
        console.log(`[${timestamp}] DST activated`)
      }
    }

    // Deactivate DST pulse if we were in DST but no longer
    if (previousRule === 'dst-transition' && matchingRule?.id !== 'dst-transition') {
      deactivatePulse()
      const timestamp = new Date().toISOString()
      console.log(`[${timestamp}] DST deactivated`)
    }
  }

  /**
   * Start the scheduler with periodic checks
   */
  const startScheduler = (intervalMinutes: number = 5): void => {
    // Apply immediately
    applyScheduledStyle()

    // Check periodically
    const intervalMs = intervalMinutes * 60 * 1000
    const interval = setInterval(applyScheduledStyle, intervalMs)

    console.log(`🗺️ [Scheduler] Started (checking every ${intervalMinutes} minutes)`)

    // Cleanup on unmount
    if (import.meta.client) {
      window.addEventListener('beforeunload', () => {
        clearInterval(interval)
      })
    }
  }

  /**
   * Calculate time until next occurrence of a date-based rule
   */
  const getNextOccurrence = (month: number, day: number): Date => {
    const now = new Date()
    const currentYear = now.getFullYear()
    let nextDate = new Date(currentYear, month - 1, day) // month is 0-indexed

    // If the date has passed this year, use next year
    if (nextDate < now) {
      nextDate = new Date(currentYear + 1, month - 1, day)
    }

    return nextDate
  }

  /**
   * Format time difference as human-readable string
   */
  const formatTimeUntil = (targetDate: Date): string => {
    const now = new Date()
    const diff = targetDate.getTime() - now.getTime()

    if (diff < 0) return 'now'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) {
      return `in ${days} day${days > 1 ? 's' : ''}, ${hours}h`
    }
    else if (hours > 0) {
      return `in ${hours}h ${minutes}m`
    }
    else {
      return `in ${minutes}m`
    }
  }

  /**
   * Calculate ETA for next full moon Thursday
   */
  const getNextFullMoonThursday = (): Date | null => {
    if (!userPosition.value) return null

    const now = new Date()
    const checkDate = new Date(now)

    // Check up to 60 days in the future
    for (let i = 0; i < 60; i++) {
      checkDate.setDate(checkDate.getDate() + 1)

      // Check if it's Thursday and full moon
      if (checkDate.getDay() === 4 && isFullMoon(checkDate)) {
        const moonTimes = getMoonTimes(checkDate)
        if (moonTimes.rise) {
          return moonTimes.rise
        }
      }
    }

    return null
  }

  /**
   * Get information about current and upcoming rules
   */
  const getRuleStatus = async (): Promise<void> => {
    console.log('🗺️ Map Style Schedule Status')
    console.log('============================')

    const now = new Date()
    console.log(`Current time: ${now.toLocaleString('et-EE')}`)

    if (userPosition.value) {
      console.log(`📍 Location: ${userPosition.value.lat.toFixed(4)}°, ${userPosition.value.lng.toFixed(4)}° (GPS)`)
    }
    else {
      console.log(`📍 Location: GPS not available - astronomical rules disabled`)
    }

    const moonIllumination = getMoonIllumination(now)
    const fullMoon = isFullMoon(now)
    console.log(`\n🌙 Moon: ${(moonIllumination * 100).toFixed(0)}% illuminated ${fullMoon ? '(FULL MOON)' : ''}`)

    if (userPosition.value) {
      const { sunrise, sunset } = getSunTimes(now)
      if (sunrise && sunset) {
        console.log(`☀️  Sun: ${sunrise.toLocaleTimeString('et-EE')} → ${sunset.toLocaleTimeString('et-EE')}`)
      }

      const { rise: moonrise, set: moonset } = getMoonTimes(now)
      if (moonrise && moonset) {
        console.log(`🌙 Moon: ${moonrise.toLocaleTimeString('et-EE')} → ${moonset.toLocaleTimeString('et-EE')}`)
      }
    }

    console.log('\n📋 Rules:')

    // Calculate ETAs
    const independenceDayNext = getNextOccurrence(2, 24)
    const victoryDayNext = getNextOccurrence(6, 23)
    const fullMoonThursdayNext = getNextFullMoonThursday()

    for (const rule of styleRules) {
      const matches = await Promise.resolve(rule.check())
      const status = matches ? '✓ ACTIVE' : '  inactive'

      let eta = ''
      if (!matches) {
        if (rule.id === 'independence-day') {
          eta = ` - ${formatTimeUntil(independenceDayNext)}`
        }
        else if (rule.id === 'victory-day') {
          eta = ` - ${formatTimeUntil(victoryDayNext)}`
        }
        else if (rule.id === 'full-moon-thursday') {
          if (fullMoonThursdayNext) {
            eta = ` - ${formatTimeUntil(fullMoonThursdayNext)}`
          }
          else {
            eta = ' - no occurrence in next 60 days'
          }
        }
      }

      console.log(`${status} [${rule.priority}] ${rule.name}${eta}`)
      console.log(`        ${rule.description}`)
    }

    const activeRule = await evaluateRules()
    if (activeRule) {
      console.log(`\n🎨 Current active rule: ${activeRule.name}`)
    }
  }

  return {
    startScheduler,
    applyScheduledStyle,
    getRuleStatus,
    styleRules
  }
}
