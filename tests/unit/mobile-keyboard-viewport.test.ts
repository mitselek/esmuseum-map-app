/**
 * The on-screen keyboard must not hide the lower part of the app (#56).
 * Since Chrome 108, Android resizes only the visual viewport unless the
 * page opts in with interactive-widget=resizes-content.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect, vi, beforeAll } from 'vitest'

type Meta = { name?: string, content?: string }
let viewport: string | undefined

beforeAll(async () => {
  vi.stubGlobal('defineNuxtConfig', (config: unknown) => config)
  const mod = await import('../../.config/nuxt.config')
  const config = mod.default as { app: { head: { meta: Meta[] } } }
  viewport = config.app.head.meta.find((m) => m.name === 'viewport')?.content
  vi.unstubAllGlobals()
})

describe('mobile keyboard viewport', () => {
  it('lets the keyboard resize the layout viewport', () => {
    expect(viewport).toContain('interactive-widget=resizes-content')
  })

  it('task workspace shell follows the dynamic viewport height', () => {
    const source = readFileSync(resolve(__dirname, '../../app/components/TaskWorkspace.vue'), 'utf-8')
    const root = source.match(/<template>\s*<div class="([^"]+)"/)?.[1] ?? ''
    expect(root.split(' ')).toContain('h-dvh')
    expect(root.split(' ')).not.toContain('h-screen')
  })
})
