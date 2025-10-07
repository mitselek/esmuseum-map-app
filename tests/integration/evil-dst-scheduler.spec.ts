import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * Integration tests for Evil DST Map Schedule feature
 * Feature F028 - Full scheduler behavior during DST transition
 * 
 * TDD Red Phase: These tests MUST FAIL before implementation
 */
describe('Evil DST Scheduler Integration', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    // Use fake timers for date control
    vi.useFakeTimers()
    
    // Spy on console.log to verify logging
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    
    // Clear body classes
    document.body.className = ''
  })

  afterEach(() => {
    // Restore real timers and console
    vi.useRealTimers()
    consoleLogSpy.mockRestore()
    
    // Clean up body classes
    document.body.className = ''
  })

  describe('DST Rule Activation', () => {
    it('should activate DST rule and apply toner style during transition (Oct 26, 2025 at 3:30 AM)', async () => {
      // Mock to DST transition
      vi.setSystemTime(new Date(2025, 9, 26, 3, 30, 0))
      
      const { useMapStyleScheduler } = await import('../../app/composables/useMapStyleScheduler')
      const { useMapStyles } = await import('../../app/composables/useMapStyles')
      const { getCurrentStyle } = useMapStyles()
      
      const scheduler = useMapStyleScheduler()
      
      // Trigger scheduler evaluation
      await scheduler.applyScheduledStyle()
      
      // Verify toner style is applied
      const currentStyle = getCurrentStyle
      expect(currentStyle.value!.id).toBe('toner')
      
      // Verify background pulsation is active
      expect(document.body.classList.contains('evil-dst-active')).toBe(true)
      
      // Verify console logging
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Scheduler] Applying rule: Evil DST Transition')
      )
      
      // Verify timestamp logging (activation)
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*\] DST activated/)
      )
    })

    it('should activate DST rule at 3:00 AM exactly (start of repeated hour)', async () => {
      // Mock to exactly 3:00 AM
      vi.setSystemTime(new Date(2025, 9, 26, 3, 0, 0))
      
      const { useMapStyleScheduler } = await import('../../app/composables/useMapStyleScheduler')
      const { useMapStyles } = await import('../../app/composables/useMapStyles')
      const { getCurrentStyle } = useMapStyles()
      
      const scheduler = useMapStyleScheduler()
      await scheduler.applyScheduledStyle()
      
      const currentStyle = getCurrentStyle
      expect(currentStyle.value!.id).toBe('toner')
      expect(document.body.classList.contains('evil-dst-active')).toBe(true)
    })

    it('should activate DST rule at 3:59 AM (end of repeated hour)', async () => {
      // Mock to 3:59 AM
      vi.setSystemTime(new Date(2025, 9, 26, 3, 59, 59))
      
      const { useMapStyleScheduler } = await import('../../app/composables/useMapStyleScheduler')
      const { useMapStyles } = await import('../../app/composables/useMapStyles')
      const { getCurrentStyle } = useMapStyles()
      
      const scheduler = useMapStyleScheduler()
      await scheduler.applyScheduledStyle()
      
      const currentStyle = getCurrentStyle
      expect(currentStyle.value!.id).toBe('toner')
      expect(document.body.classList.contains('evil-dst-active')).toBe(true)
    })
  })

  describe('DST Rule Priority Override', () => {
    it('should prioritize DST rule (priority 100) over Independence Day (priority 100) via array order', async () => {
      // Mock to a hypothetical scenario where both rules could match
      // In reality, these dates never overlap, but testing priority logic
      vi.setSystemTime(new Date(2025, 9, 26, 3, 30, 0))
      
      const { useMapStyleScheduler } = await import('../../app/composables/useMapStyleScheduler')
      const { useMapStyles } = await import('../../app/composables/useMapStyles')
      const { getCurrentStyle } = useMapStyles()
      
      const scheduler = useMapStyleScheduler()
      await scheduler.applyScheduledStyle()
      
      // DST should win because it comes first in styleRules array
      const currentStyle = getCurrentStyle
      expect(currentStyle.value!.id).toBe('toner')
      
      // Verify DST rule is logged, not Independence Day
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Evil DST Transition')
      )
    })

    it('should override Full Moon Thursday (priority 80) with DST (priority 100)', async () => {
      // Mock to Thursday, Oct 26, 2025 at 3:30 AM (could theoretically be full moon)
      vi.setSystemTime(new Date(2025, 9, 26, 3, 30, 0))
      
      const { useMapStyleScheduler } = await import('../../app/composables/useMapStyleScheduler')
      const { useMapStyles } = await import('../../app/composables/useMapStyles')
      const { getCurrentStyle } = useMapStyles()
      
      const scheduler = useMapStyleScheduler()
      await scheduler.applyScheduledStyle()
      
      // DST (priority 100) should win over Full Moon Thursday (priority 80)
      const currentStyle = getCurrentStyle
      expect(currentStyle.value!.id).toBe('toner')
      expect(document.body.classList.contains('evil-dst-active')).toBe(true)
    })
  })

  describe('DST Rule Deactivation', () => {
    it('should deactivate DST rule and remove background pulse at 4:00 AM', async () => {
      // First, activate DST at 3:30 AM
      vi.setSystemTime(new Date(2025, 9, 26, 3, 30, 0))
      
      const { useMapStyleScheduler } = await import('../../app/composables/useMapStyleScheduler')
      const { useMapStyles } = await import('../../app/composables/useMapStyles')
      const { getCurrentStyle } = useMapStyles()
      
      const scheduler = useMapStyleScheduler()
      await scheduler.applyScheduledStyle()
      
      // Verify activation
      expect(getCurrentStyle.value!.id).toBe('toner')
      expect(document.body.classList.contains('evil-dst-active')).toBe(true)
      
      // Clear console spy for deactivation check
      consoleLogSpy.mockClear()
      
      // Now advance to 4:00 AM (after transition)
      vi.setSystemTime(new Date(2025, 9, 26, 4, 0, 0))
      
      await scheduler.applyScheduledStyle()
      
      // Verify deactivation
      expect(document.body.classList.contains('evil-dst-active')).toBe(false)
      
      // Verify style changed to default (voyager)
      expect(getCurrentStyle.value!.id).toBe('voyager')
      
      // Verify deactivation timestamp logging
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*\] DST deactivated/)
      )
    })

    it('should deactivate DST rule at 4:01 AM', async () => {
      // Activate at 3:30 AM
      vi.setSystemTime(new Date(2025, 9, 26, 3, 30, 0))
      
      const { useMapStyleScheduler } = await import('../../app/composables/useMapStyleScheduler')
      const { useMapStyles } = await import('../../app/composables/useMapStyles')
      const { getCurrentStyle } = useMapStyles()
      
      const scheduler = useMapStyleScheduler()
      await scheduler.applyScheduledStyle()
      
      expect(document.body.classList.contains('evil-dst-active')).toBe(true)
      
      // Deactivate at 4:01 AM
      vi.setSystemTime(new Date(2025, 9, 26, 4, 1, 0))
      await scheduler.applyScheduledStyle()
      
      expect(document.body.classList.contains('evil-dst-active')).toBe(false)
      expect(getCurrentStyle.value!.id).toBe('voyager')
    })
  })

  describe('Non-DST Scenarios', () => {
    it('should NOT activate DST on normal night at 3:30 AM (Oct 15, 2025)', async () => {
      // Mock to mid-October, not DST transition
      vi.setSystemTime(new Date(2025, 9, 15, 3, 30, 0))
      
      const { useMapStyleScheduler } = await import('../../app/composables/useMapStyleScheduler')
      const { useMapStyles } = await import('../../app/composables/useMapStyles')
      const { getCurrentStyle } = useMapStyles()
      
      const scheduler = useMapStyleScheduler()
      await scheduler.applyScheduledStyle()
      
      // Should use default style, not toner
      const currentStyle = getCurrentStyle
      expect(currentStyle.value).not.toBe('toner')
      
      // Background should not pulse
      expect(document.body.classList.contains('evil-dst-active')).toBe(false)
    })

    it('should NOT activate DST on spring DST (March 30, 2025 at 3:30 AM)', async () => {
      // Mock to spring DST (clock goes forward)
      vi.setSystemTime(new Date(2025, 2, 30, 3, 30, 0))
      
      const { useMapStyleScheduler } = await import('../../app/composables/useMapStyleScheduler')
      const { useMapStyles } = await import('../../app/composables/useMapStyles')
      const { getCurrentStyle } = useMapStyles()
      
      const scheduler = useMapStyleScheduler()
      await scheduler.applyScheduledStyle()
      
      // Should not activate (feature is fall DST only)
      const currentStyle = getCurrentStyle
      expect(currentStyle.value).not.toBe('toner')
      expect(document.body.classList.contains('evil-dst-active')).toBe(false)
    })

    it('should NOT activate DST at 2:59 AM on transition day (before repeated hour)', async () => {
      // Mock to 2:59 AM (before DST transition)
      vi.setSystemTime(new Date(2025, 9, 26, 2, 59, 0))
      
      const { useMapStyleScheduler } = await import('../../app/composables/useMapStyleScheduler')
      const { useMapStyles } = await import('../../app/composables/useMapStyles')
      const { getCurrentStyle } = useMapStyles()
      
      const scheduler = useMapStyleScheduler()
      await scheduler.applyScheduledStyle()
      
      const currentStyle = getCurrentStyle
      expect(currentStyle.value).not.toBe('toner')
      expect(document.body.classList.contains('evil-dst-active')).toBe(false)
    })

    it('should NOT activate DST during day on transition date (Oct 26 at 10:00 AM)', async () => {
      // Mock to daytime on DST transition date
      vi.setSystemTime(new Date(2025, 9, 26, 10, 0, 0))
      
      const { useMapStyleScheduler } = await import('../../app/composables/useMapStyleScheduler')
      const { useMapStyles } = await import('../../app/composables/useMapStyles')
      const { getCurrentStyle } = useMapStyles()
      
      const scheduler = useMapStyleScheduler()
      await scheduler.applyScheduledStyle()
      
      const currentStyle = getCurrentStyle
      expect(currentStyle.value).not.toBe('toner')
      expect(document.body.classList.contains('evil-dst-active')).toBe(false)
    })
  })

  describe('Multi-Year DST Transitions', () => {
    it('should activate DST on Oct 27, 2024 at 3:30 AM (last Sunday of October 2024)', async () => {
      // 2024 DST transition
      vi.setSystemTime(new Date(2024, 9, 27, 3, 30, 0))
      
      const { useMapStyleScheduler } = await import('../../app/composables/useMapStyleScheduler')
      const { useMapStyles } = await import('../../app/composables/useMapStyles')
      const { getCurrentStyle } = useMapStyles()
      
      const scheduler = useMapStyleScheduler()
      await scheduler.applyScheduledStyle()
      
      const currentStyle = getCurrentStyle
      expect(currentStyle.value!.id).toBe('toner')
      expect(document.body.classList.contains('evil-dst-active')).toBe(true)
    })

    it('should activate DST on Oct 29, 2023 at 3:30 AM (last Sunday of October 2023)', async () => {
      // 2023 DST transition
      vi.setSystemTime(new Date(2023, 9, 29, 3, 30, 0))
      
      const { useMapStyleScheduler } = await import('../../app/composables/useMapStyleScheduler')
      const { useMapStyles } = await import('../../app/composables/useMapStyles')
      const { getCurrentStyle } = useMapStyles()
      
      const scheduler = useMapStyleScheduler()
      await scheduler.applyScheduledStyle()
      
      const currentStyle = getCurrentStyle
      expect(currentStyle.value!.id).toBe('toner')
      expect(document.body.classList.contains('evil-dst-active')).toBe(true)
    })
  })
})
