/**
 * Profile-page strings must use sentence case in et/uk/lv (#51, #52).
 * Title Case is an English convention and reads wrong in these languages.
 */
import { describe, it, expect, vi, beforeAll } from 'vitest'

type ProfileMessages = { title: string, submit: string }
type Messages = Record<string, { profile: ProfileMessages }>

let messages: Messages

beforeAll(async () => {
  vi.stubGlobal('defineI18nConfig', (fn: () => unknown) => fn)
  const mod = await import('../../.config/i18n.config')
  const config = (mod.default as () => { messages: Messages })()
  messages = config.messages
  vi.unstubAllGlobals()
})

describe('profile page strings use sentence case', () => {
  it('et', () => {
    expect(messages.et!.profile.title).toBe('Täida oma profiil')
    expect(messages.et!.profile.submit).toBe('Salvesta profiil')
  })

  it('uk', () => {
    expect(messages.uk!.profile.title).toBe('Заповніть свій профіль')
    expect(messages.uk!.profile.submit).toBe('Зберегти профіль')
  })

  it('lv', () => {
    expect(messages.lv!.profile.title).toBe('Aizpildiet savu profilu')
    expect(messages.lv!.profile.submit).toBe('Saglabāt profilu')
  })
})
