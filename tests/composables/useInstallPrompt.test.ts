/**
 * "Install as app" prompt state (#58)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { captureInstallPrompt, useInstallPrompt, resetInstallPrompt } from '../../app/composables/useInstallPrompt'

type PromptEvent = Event & {
  prompt: ReturnType<typeof vi.fn>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const makePromptEvent = (outcome: 'accepted' | 'dismissed' = 'accepted'): PromptEvent => {
  const event = new Event('beforeinstallprompt') as PromptEvent
  event.preventDefault = vi.fn()
  event.prompt = vi.fn().mockResolvedValue(undefined)
  event.userChoice = Promise.resolve({ outcome })
  return event
}

// Tests run in Node: a real EventTarget stands in for window
const makeWindow = (standalone = false): Window => Object.assign(new EventTarget(), {
  matchMedia: vi.fn().mockReturnValue({ matches: standalone })
}) as unknown as Window

let win: Window

describe('useInstallPrompt', () => {
  beforeEach(() => {
    resetInstallPrompt()
    win = makeWindow()
  })

  it('cannot install before the browser offers it', () => {
    captureInstallPrompt(win)
    expect(useInstallPrompt().canInstall.value).toBe(false)
  })

  it('can install once beforeinstallprompt fires, and suppresses the mini-infobar', () => {
    captureInstallPrompt(win)
    const event = makePromptEvent()
    win.dispatchEvent(event)
    expect(event.preventDefault).toHaveBeenCalled()
    expect(useInstallPrompt().canInstall.value).toBe(true)
  })

  it('install() shows the native dialog and hides the button afterwards', async () => {
    captureInstallPrompt(win)
    const event = makePromptEvent('accepted')
    win.dispatchEvent(event)
    const { install, canInstall } = useInstallPrompt()
    const outcome = await install()
    expect(event.prompt).toHaveBeenCalled()
    expect(outcome).toBe('accepted')
    expect(canInstall.value).toBe(false)
  })

  it('a dismissed prompt cannot be reused, so the button hides too', async () => {
    captureInstallPrompt(win)
    win.dispatchEvent(makePromptEvent('dismissed'))
    const { install, canInstall } = useInstallPrompt()
    expect(await install()).toBe('dismissed')
    expect(canInstall.value).toBe(false)
  })

  it('install() without an offer does nothing', async () => {
    captureInstallPrompt(win)
    expect(await useInstallPrompt().install()).toBe('unavailable')
  })

  it('hides after appinstalled', () => {
    captureInstallPrompt(win)
    win.dispatchEvent(makePromptEvent())
    win.dispatchEvent(new Event('appinstalled'))
    expect(useInstallPrompt().canInstall.value).toBe(false)
  })

  it('never offers install inside the installed app', () => {
    win = makeWindow(true)
    captureInstallPrompt(win)
    win.dispatchEvent(makePromptEvent())
    expect(useInstallPrompt().canInstall.value).toBe(false)
  })
})
