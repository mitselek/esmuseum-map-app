/**
 * Strings must use sentence case in et/uk/lv (#51, #52, #55).
 * Title Case is an English convention and reads wrong in these languages.
 */
import { describe, it, expect, vi, beforeAll } from 'vitest'

type ProfileMessages = { title: string, submit: string, pageTitle: string }
type Messages = Record<string, { appName: string, profile: ProfileMessages }>

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
    expect(messages.et!.profile.pageTitle).toBe('Profiili seadistamine')
  })

  it('uk', () => {
    expect(messages.uk!.profile.title).toBe('Заповніть свій профіль')
    expect(messages.uk!.profile.submit).toBe('Зберегти профіль')
    expect(messages.uk!.profile.pageTitle).toBe('Налаштування профілю')
  })

  it('lv', () => {
    expect(messages.lv!.profile.title).toBe('Aizpildiet savu profilu')
    expect(messages.lv!.profile.submit).toBe('Saglabāt profilu')
    expect(messages.lv!.profile.pageTitle).toBe('Profila iestatīšana')
  })

  it('lv appName', () => {
    expect(messages.lv!.appName).toBe('IKM kartes lietotne')
  })
})
