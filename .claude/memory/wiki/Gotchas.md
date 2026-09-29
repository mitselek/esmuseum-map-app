# Gotchas

Traps that cost real time. Newest first.

## Map tiles: keyed providers fail silently (2026-09-29, #54)

CARTO returns HTTP 200 with an "API KEY REQUIRED" watermark tile, so nothing errors: the map
is just blank with a diagonal watermark. Stadia returns 401. Check a tile with curl before
adding any provider. OpenTopoMap stops at zoom 17 and serves a "max zoom layer = 17" image
above it; any style with a lower native max zoom needs `maxNativeZoom`. See `facts/map-tiles.yaml`.

## Android keyboard does not resize the page (2026-09-29, #56)

Since Chrome 108 the on-screen keyboard resizes only the visual viewport. `vh` and `dvh` do not
change unless the viewport meta has `interactive-widget=resizes-content` (now set). Fixed-height
shells (`h-screen`) with an inner scroll box put the bottom of the box under the keyboard.
The #50 fix (`min-h-dvh`) rested on the wrong mechanism and was never device-verified.
In-app browsers (Messenger) follow the host app's keyboard mode, so results vary by app.
Fix 158fb20 (meta + `h-dvh` on the workspace) was confirmed on a phone by Mihkel on 2026-09-29.
Source: urls/chrome-viewport-resize.

## Importing a config file into a test changes typecheck (2026-09-29)

A unit test that imports `.config/i18n.config.ts` pulls it into the typechecked program, where
`defineI18nConfig` is declared. Its `@ts-expect-error` became unused and failed `nuxi typecheck`
(TS2578) on pre-push. Stub the global with `vi.stubGlobal` in the test and drop such directives.

## Workflow worktrees leak into the test run (2026-09-29)

Worktrees created under `.claude/worktrees/` are inside the repo, so vitest picks up their test
files too. Remove the worktree (`git worktree remove`) once its branch is merged.

## `npm run lint` rewrites memory-kit (2026-09-29)

`npm run lint` runs `eslint --fix` over `memory-kit/types/`, a vendored subtree. Revert those
files; the real fix is an ESLint ignore for `memory-kit/`.

Related: [[Deployment]], [[Decisions]].
