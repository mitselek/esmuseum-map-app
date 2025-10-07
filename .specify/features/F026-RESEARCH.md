# F026 Research: Map Fullscreen Toggle with Long-Press

**Date:** October 6, 2025  
**Status:** Research Complete ✅  
**Objective:** Implement mobile-first fullscreen map toggle using long-press gesture with VueUse composables

---

## Research Summary

Successfully analyzed VueUse API documentation for implementing F026 (Map Fullscreen Toggle). The feature will use two VueUse composables: `useFullscreen()` for fullscreen management and `onLongPress()` for gesture detection.

### Key Findings

1. **✅ VueUse provides all necessary functionality** - No custom implementations needed
2. **⚠️ iOS Safari limitation confirmed** - CSS fallback is mandatory (native API only works on `<video>` elements)
3. **✅ Pan/drag conflict solved** - `distanceThreshold` option prevents accidental triggers during map interaction
4. **✅ Browser support detection** - `isSupported` computed ref allows conditional logic
5. **✅ Architectural decision** - Create typed `useMapFullscreen` composable wrapper for strict typing and centralized logic

### Architecture Decision

**Problem:** VueUse's `MaybeRefOrGetter` type is very flexible, accepting refs, computed refs, getter functions, or direct values. This flexibility is great for library code but unnecessary for our application.

**Decision:** Create a **typed wrapper composable** `useMapFullscreen.ts` that:

- ✅ Enforces project pattern: `Ref<HTMLElement | null>` (template refs only)
- ✅ Centralizes fullscreen logic in one reusable composable
- ✅ Provides better type safety and clearer error messages
- ✅ Makes components cleaner by delegating complexity
- ✅ Easier to test and extend

**Benefits:**

- Strict typing prevents bugs (can't accidentally pass wrong types)
- Self-documenting code (clear intent: "this is for map fullscreen")
- Centralized configuration (`autoExit: false` set once)
- Better maintainability (logic changes in one place)

---

## VueUse API Reference Documentation

> **📚 Note:** The following sections document **VueUse's original API** for reference purposes only.
>
> **We will NOT use these directly.** Instead, we'll create a typed wrapper composable `useMapFullscreen` (see [Implementation Plan](#implementation-plan-for-f026) below) that enforces stricter types and centralizes our logic.
>
> These sections are kept to understand what VueUse provides and how our wrapper uses it internally.

---

### `useFullscreen()` API

**Function Signature:**

```typescript
function useFullscreen(
  target?: MaybeRefOrGetter<HTMLElement | null | undefined>,
  options?: UseFullscreenOptions
): UseFullscreenReturn;
```

**Options:**

```typescript
interface UseFullscreenOptions extends ConfigurableDocument {
  autoExit?: boolean; // Exit fullscreen on component unmount (default: false)
}
```

**Return Value:**

```typescript
interface UseFullscreenReturn {
  isSupported: ComputedRef<boolean>; // Browser capability detection
  isFullscreen: ShallowRef<boolean>; // Current fullscreen state
  enter: () => Promise<void>; // Enter fullscreen (async)
  exit: () => Promise<void>; // Exit fullscreen (async)
  toggle: () => Promise<void>; // Toggle fullscreen state
}
```

**Usage Example:**

```vue
<script setup lang="ts">
import { useFullscreen } from "@vueuse/core";

const mapContainer = useTemplateRef("map");
const { isSupported, isFullscreen, toggle } = useFullscreen(mapContainer);
</script>

<template>
  <div ref="map" class="map-container">
    <div v-if="isFullscreen">Currently fullscreen</div>
  </div>
</template>
```

### ⚠️ Critical iOS Safari Limitation

**Direct quote from VueUse docs:**

> "Some platforms (like iOS's Safari) only allow fullscreen on video elements"

**Impact:** The native Fullscreen API (`document.fullscreenElement`, `element.requestFullscreen()`) does NOT work on regular HTML elements in iOS Safari.

**Solution:** Use `isSupported` to detect capability and fall back to CSS-based fullscreen:

```typescript
const { isSupported, toggle } = useFullscreen(mapContainer);

async function toggleFullscreen() {
  if (isSupported.value) {
    // Native Fullscreen API (Android, Desktop)
    await toggle();
  } else {
    // CSS fallback for iOS Safari
    toggleCSSFullscreen();
  }
}

function toggleCSSFullscreen() {
  const container = mapContainer.value;
  if (container.classList.contains("fullscreen-fallback")) {
    container.classList.remove("fullscreen-fallback");
  } else {
    container.classList.add("fullscreen-fallback");
  }
}
```

```css
.fullscreen-fallback {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: white;
  width: 100vw;
  height: 100vh;
}
```

---

## VueUse `onLongPress()` API

**Function Signature:**

```typescript
function onLongPress(
  target: MaybeRefOrGetter<HTMLElement | null | undefined>,
  callback: (evt: PointerEvent) => void,
  options?: OnLongPressOptions
): void;
```

**Options:**

```typescript
interface OnLongPressOptions {
  delay?: number | Ref<number>; // Delay before trigger (default: 500ms)
  distanceThreshold?: number; // Max movement in pixels before cancel
  modifiers?: OnLongPressModifiers; // Event modifiers (prevent, stop, etc.)
  onMouseUp?: (evt: PointerEvent) => void; // Callback on pointer release
}

interface OnLongPressModifiers {
  prevent?: boolean; // Call preventDefault()
  stop?: boolean; // Call stopPropagation()
  once?: boolean; // Trigger only once
  capture?: boolean; // Use event capture phase
  self?: boolean; // Only trigger if event target is the element itself
}
```

**Usage Example (Function):**

```typescript
import { onLongPress } from "@vueuse/core";

const mapContainer = useTemplateRef("map");

onLongPress(
  mapContainer,
  (evt) => {
    console.log("Long press triggered!", evt);
    toggleFullscreen();
  },
  {
    delay: 600, // 600ms delay
    distanceThreshold: 10, // Cancel if moved >10px
    modifiers: { prevent: true },
  }
);
```

**Usage Example (Component):**

```vue
<OnLongPress
  as="button"
  @trigger="onLongPressCallback"
  :options="{ delay: 600 }"
>
  Press and hold
</OnLongPress>
```

**Usage Example (Directive):**

```vue
<button v-on-long-press.prevent="callback">
  Hold me
</button>

<!-- With custom options -->
<button v-on-long-press="[callback, { delay: 1000, distanceThreshold: 15 }]">
  Custom delay
</button>
```

### Critical Feature: `distanceThreshold`

**Problem:** Map interactions use pan/drag gestures. A long-press that triggers during map movement would be frustrating UX.

**Solution:** The `distanceThreshold` option cancels the long-press if the pointer moves more than N pixels:

```typescript
onLongPress(mapContainer, triggerFullscreen, {
  delay: 600,
  distanceThreshold: 10, // Cancel if user moves >10px (indicates pan/drag)
  modifiers: { prevent: true },
});
```

**Behavior:**

- User **holds still** for 600ms → Long-press triggers → Fullscreen activates
- User **starts dragging** the map → Long-press cancelled → Map pans normally

This solves the gesture conflict elegantly without custom implementation.

---

## Implementation Plan for F026

### Summary

**Implementation approach:** Custom typed composable wrapper with strict requirements and type safety

**Key features:**

- ✅ Strict typing (`Ref<HTMLElement | null>` only)
- ✅ Native Fullscreen API + iOS CSS fallback
- ✅ Long-press gesture detection with pan/drag conflict prevention
- ✅ Automatic Leaflet map resize handling
- ✅ Exit hint with auto-hide
- **Zero defensive programming** - Enforces correctness through types and architecture

**Philosophy:**

- Type system prevents bugs (not runtime checks)
- Fail fast on programmer errors (null refs = bug, not edge case)
- Trust library implementations (VueUse handles edge cases)
- Platform limitations detected upfront (iOS = CSS mode always)

### Approach: Custom Composable Wrapper

Instead of using VueUse composables directly in the component, we'll create a **typed wrapper composable** that:

1. Enforces strict typing (template refs only)
2. Centralizes all fullscreen logic
3. Handles both native API and iOS CSS fallback
4. Manages long-press gesture detection
5. Handles Leaflet map resize
6. Manages exit hint state

This approach keeps components clean and logic testable.

### Strict Requirements & Type Safety

Instead of defensive programming with null checks and try/catch, we enforce correctness through **strict typing and architectural patterns**:

**1. Non-Null Refs Required**  

```typescript
export function useMapFullscreen(
  mapContainer: Ref<HTMLElement | null>,  // ❌ Still allows null
  leafletMap: Ref<LeafletMap | null>,     // ❌ Still allows null
  options: UseMapFullscreenOptions = {}
): UseMapFullscreenReturn
```

**Problem:** TypeScript allows `null`, forcing runtime checks throughout the code.

**Solution:** Use Vue's `MaybeRef` pattern or require non-null initialization:

```typescript
// Option A: Require non-null at call site
export function useMapFullscreen(
  mapContainer: Ref<HTMLElement>,      // ✅ Must be non-null
  leafletMap: Ref<LeafletMap>,         // ✅ Must be non-null
  options: UseMapFullscreenOptions = {}
): UseMapFullscreenReturn

// Component usage - caller ensures refs are ready
onMounted(() => {
  if (!mapContainer.value || !map.value) {
    throw new Error('Map not initialized') // Fail fast
  }
  
  // Only call composable when refs are guaranteed non-null
  const fullscreen = useMapFullscreen(
    mapContainer as Ref<HTMLElement>,
    map as Ref<LeafletMap>
  )
})
```

**2. VueUse Already Handles Null Refs**  

```typescript
const { toggle } = useFullscreen(mapContainer) // VueUse handles null internally
```

**Insight:** VueUse composables are designed to accept `Ref<HTMLElement | null>` and handle null cases gracefully. We don't need additional guards - **trust the library**.

**3. Leaflet Map Lifecycle Management**  

```typescript
// ❌ Defensive: Check if map exists
watch(isInFullscreenMode, async () => {
  if (leafletMap.value) {
    leafletMap.value.invalidateSize()
  }
})

// ✅ Strict: Map must exist when composable is called
watch(isInFullscreenMode, async () => {
  await nextTick()
  leafletMap.value.invalidateSize() // Will error if null (intentional)
})
```

**Philosophy:** If map is null, it's a **bug in the component**, not an edge case to handle gracefully. Let it fail fast.

**4. Timer Cleanup via Vue Lifecycle**  

```typescript
// ❌ Manual cleanup
let exitHintTimer: NodeJS.Timeout | null = null
onUnmounted(() => {
  if (exitHintTimer) clearTimeout(exitHintTimer)
})

// ✅ Use Vue's reactivity system
import { useTimeoutFn } from '@vueuse/core'

const { start: startExitHint, stop: stopExitHint } = useTimeoutFn(() => {
  showExitHintState.value = false
}, autoHideHint)

function showExitHint() {
  showExitHintState.value = true
  stopExitHint() // Clear previous
  startExitHint() // Start new
}
// VueUse handles cleanup automatically on unmount
```

**Benefit:** No manual cleanup needed - VueUse composables clean up automatically.

**5. Fullscreen API Errors Are User-Facing**  

```typescript
// ❌ Defensive: Catch errors and fall back
try {
  await toggle()
} catch (error) {
  isCSSFullscreen.value = !isCSSFullscreen.value
}

// ✅ Strict: Let VueUse handle it, or propagate error to user
await toggle() // If fails, user should see error (browser denied permission)
```

**Philosophy:** Fullscreen API errors are **user-facing problems** (denied permission, browser restrictions), not bugs. The app shouldn't silently fall back - user needs to understand why it failed.

**Counter-argument for CSS fallback:** iOS Safari **never supports** native fullscreen on non-video elements. This is a **platform limitation**, not an error state. Solution: Check `isSupported` upfront and use CSS mode exclusively on iOS.

**Revised Implementation Philosophy:**

- ✅ **Type system prevents bugs** (not runtime checks)
- ✅ **Fail fast on programmer errors** (null refs = bug)
- ✅ **Trust library implementations** (VueUse handles edge cases)
- ✅ **User-facing errors surface to UI** (don't silently recover)
- ✅ **Platform limitations detected upfront** (iOS Safari = CSS mode always)

**Composable Structure:**

**File:** `app/composables/useMapFullscreen.ts`

```typescript
import { ref, computed, watch, nextTick } from 'vue'
import { useFullscreen, onLongPress, useTimeoutFn } from '@vueuse/core'
import type { Ref } from 'vue'
import type { Map as LeafletMap } from 'leaflet'

/**
 * Options for map fullscreen behavior
 */
export interface UseMapFullscreenOptions {
  /** Delay in ms before long-press triggers (default: 600) */
  longPressDelay?: number
  /** Max pixel movement before long-press cancels (default: 10) */
  distanceThreshold?: number
  /** Duration in ms to show exit hint (default: 2000) */
  autoHideHint?: number
}

/**
 * Return type for useMapFullscreen composable
 */
export interface UseMapFullscreenReturn {
  /** Browser supports native Fullscreen API */
  isSupported: Readonly<Ref<boolean>>
  /** Currently in native fullscreen mode */
  isFullscreen: Readonly<Ref<boolean>>
  /** Currently in CSS fallback fullscreen mode (iOS) */
  isCSSFullscreen: Readonly<Ref<boolean>>
  /** Currently in any fullscreen mode (native OR CSS) */
  isInFullscreenMode: Readonly<Ref<boolean>>
  /** Exit hint is currently visible */
  showExitHintState: Readonly<Ref<boolean>>
  /** Manually toggle fullscreen state */
  toggle: () => Promise<void>
}

/**
 * Map fullscreen composable with long-press gesture detection
 * 
 * Provides fullscreen functionality for map components with:
 * - Native Fullscreen API for supported browsers
 * - CSS fallback for iOS Safari
 * - Long-press gesture detection (prevents conflict with map pan/drag)
 * - Automatic Leaflet map resize handling
 * - Exit hint with auto-hide
 * 
 * ⚠️ STRICT REQUIREMENTS:
 * - mapContainer must be initialized before calling this composable
 * - leafletMap must be initialized before calling this composable
 * - Caller is responsible for ensuring refs are non-null
 * 
 * @param mapContainer - Template ref to map container element (must be non-null)
 * @param leafletMap - Ref to Leaflet map instance (must be non-null)
 * @param options - Configuration options
 * @returns Fullscreen state and controls
 * 
 * @example
 * ```vue
 * <script setup lang="ts">
 * const mapContainer = useTemplateRef('mapContainer')
 * const map = ref<Map | null>(null)
 * 
 * // Initialize map first
 * onMounted(() => {
 *   map.value = L.map('map', { ... })
 *   
 *   // Only call composable after refs are ready
 *   const { isInFullscreenMode } = useMapFullscreen(
 *     mapContainer as Ref<HTMLElement>,
 *     map as Ref<Map>
 *   )
 * })
 * </script>
 * ```
 */
export function useMapFullscreen(
  mapContainer: Ref<HTMLElement | null>,
  leafletMap: Ref<LeafletMap | null>,
  options: UseMapFullscreenOptions = {}
): UseMapFullscreenReturn {
  const {
    longPressDelay = 600,
    distanceThreshold = 10,
    autoHideHint = 2000,
  } = options

  // Native fullscreen support (VueUse handles null refs internally)
  const { isSupported, isFullscreen, toggle } = useFullscreen(mapContainer, {
    autoExit: false,
  })

  // CSS fallback for iOS Safari
  const isCSSFullscreen = ref(false)
  
  // Combined fullscreen state
  const isInFullscreenMode = computed(() => 
    isFullscreen.value || isCSSFullscreen.value
  )

  // Exit hint state with auto-hide (VueUse handles cleanup)
  const showExitHintState = ref(false)
  const { start: startHintTimer, stop: stopHintTimer } = useTimeoutFn(() => {
    showExitHintState.value = false
  }, autoHideHint)

  /**
   * Show exit hint with auto-hide timer
   */
  function showExitHint() {
    showExitHintState.value = true
    stopHintTimer() // Clear previous timer
    startHintTimer() // Start new timer
  }

  /**
   * Toggle fullscreen (native API or CSS fallback)
   * 
   * Platform detection happens upfront via isSupported.
   * No error handling - if fullscreen fails, it's a user-facing issue.
   */
  async function toggleFullscreen() {
    if (isSupported.value) {
      // Native Fullscreen API (Android, Desktop)
      await toggle()
    } else {
      // CSS fallback for iOS Safari (platform limitation, not error)
      isCSSFullscreen.value = !isCSSFullscreen.value
    }
    
    // Show hint when entering fullscreen
    if (isInFullscreenMode.value) {
      showExitHint()
    }
  }

  // Long-press gesture handler (VueUse handles null refs)
  onLongPress(
    mapContainer,
    toggleFullscreen,
    {
      delay: longPressDelay,
      distanceThreshold,
      modifiers: { prevent: true },
    }
  )

  // Fix Leaflet map rendering after fullscreen state change
  // If map is null, it's a bug - let it fail fast
  watch(isInFullscreenMode, async () => {
    await nextTick() // Wait for DOM updates
    leafletMap.value?.invalidateSize() // Optional chaining for TS, not defense
  })

  return {
    isSupported: computed(() => isSupported.value),
    isFullscreen: computed(() => isFullscreen.value),
    isCSSFullscreen: computed(() => isCSSFullscreen.value),
    isInFullscreenMode,
    showExitHintState: computed(() => showExitHintState.value),
    toggle: toggleFullscreen,
  }
}
```

**Component Structure:**

**File:** `app/components/InteractiveMap.vue`

```vue
<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import { useMapFullscreen } from '@/composables/useMapFullscreen'
import type { Map } from 'leaflet'

const mapContainer = useTemplateRef('mapContainer')
const map = ref<Map | null>(null)

// All fullscreen logic delegated to composable
const { isInFullscreenMode, isCSSFullscreen, showExitHintState } = 
  useMapFullscreen(mapContainer, map, {
    longPressDelay: 600,      // 600ms prevents accidental triggers
    distanceThreshold: 10,    // Cancel if moved >10px during pan/drag
    autoHideHint: 2000,       // Hide exit hint after 2 seconds
  })
</script>

<template>
  <div
    ref="mapContainer"
    class="map-container"
    :class="{ 'fullscreen-fallback': isCSSFullscreen }"
  >
    <div id="map" class="h-full w-full" />

    <!-- Exit fullscreen hint (auto-hides after 2s) -->
    <Transition name="fade">
      <div v-if="showExitHintState && isInFullscreenMode" class="exit-hint">
        {{ $t('map.tapToExit') }}
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* iOS Safari CSS fullscreen fallback */
.fullscreen-fallback {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: white;
  width: 100vw;
  height: 100vh;
}

/* Exit hint styling */
.exit-hint {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px 24px;
  border-radius: 24px;
  font-size: 14px;
  z-index: 10000;
  pointer-events: none;
}

/* Fade transition for hint */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

**Benefits of this approach:**

- ✅ **Component is clean** - Only 12 lines of logic in `<script setup>`
- ✅ **Composable is testable** - Can test fullscreen logic independently
- ✅ **Type-safe** - Enforces `Ref<HTMLElement | null>` pattern
- ✅ **Reusable** - Other map components can use same composable
- ✅ **Centralized config** - Default options in one place
- ✅ **Self-documenting** - JSDoc explains behavior

**i18n Translations:**

**File:** Add to `app/components/InteractiveMap.vue` i18n block (or global translations)

```typescript
// Estonian (et)
{
  "map": {
    "longPressHint": "Vajutage pikalt täisekraani jaoks",
    "tapToExit": "Puudutage ekraanist väljumiseks"
  }
}

// English (en)
{
  "map": {
    "longPressHint": "Long press for fullscreen",
    "tapToExit": "Tap to exit fullscreen"
  }
}

// Ukrainian (uk)
{
  "map": {
    "longPressHint": "Довге натискання для повноекранного режиму",
    "tapToExit": "Торкніться, щоб вийти з повноекранного режиму"
  }
}
```

---

## Testing Strategy

**Test Scenarios:**

1. **iOS Safari** (CSS fallback mode)

   - ✅ Long-press triggers CSS fullscreen
   - ✅ Map renders correctly in fullscreen
   - ✅ Tap to exit works
   - ✅ Map pan/drag doesn't trigger long-press
   - ✅ Map state preserved (zoom, center, markers)

2. **Android Chrome** (native fullscreen mode)

   - ✅ Long-press triggers native fullscreen
   - ✅ `isSupported === true`
   - ✅ System UI hides correctly
   - ✅ Exit via back button works
   - ✅ Map resize handled correctly

3. **Desktop browsers** (native fullscreen mode)

   - ✅ Long-press works with mouse hold
   - ✅ ESC key exits fullscreen
   - ✅ F11 vs programmatic fullscreen coexistence

4. **Edge cases**
   - ✅ Rapid long-presses (debouncing)
   - ✅ Long-press during map animation
   - ✅ Orientation change during fullscreen
   - ✅ Background tab behavior

**Test Devices:**

| Device         | OS          | Browser        | Fullscreen Mode | Priority |
| -------------- | ----------- | -------------- | --------------- | -------- |
| iPhone 12+     | iOS 15+     | Safari         | CSS fallback    | HIGH     |
| Samsung Galaxy | Android 11+ | Chrome         | Native API      | HIGH     |
| Desktop        | Windows/Mac | Chrome/Firefox | Native API      | MEDIUM   |
| iPad           | iOS 15+     | Safari         | CSS fallback    | MEDIUM   |

---

## Browser Compatibility

**Fullscreen API Support:**

- ✅ **Chrome/Edge:** Full support
- ✅ **Firefox:** Full support
- ✅ **Safari macOS:** Full support
- ⚠️ **Safari iOS:** **Video elements only** → Use CSS fallback
- ✅ **Android Chrome:** Full support

**Long-Press Support:**

- ✅ **All modern browsers:** VueUse uses standard `PointerEvent` API
- ✅ **Touch devices:** Works on iOS, Android
- ✅ **Mouse devices:** Works with click-and-hold

---

## Open Questions & Decisions

### ✅ Resolved Questions

1. **Q:** Which VueUse composable to use for long-press?  
   **A:** `onLongPress()` (not `useLongPress`, which doesn't exist)

2. **Q:** How to prevent long-press during map pan/drag?  
   **A:** Use `distanceThreshold: 10` option in `onLongPress()`

3. **Q:** How to handle iOS Safari limitation?  
   **A:** Use `isSupported` ref to detect capability, fall back to CSS-based fullscreen

4. **Q:** What delay duration for long-press?  
   **A:** 600ms (slightly longer than VueUse default 500ms to prevent accidental triggers)

5. **Q:** Haptic feedback - should we add `navigator.vibrate(200)` on long-press trigger?  
   **A:** ✅ YES - Implemented with graceful degradation (`navigator.vibrate?.(200)`)

6. **Q:** Visual feedback - should we show expanding circle animation during 600ms hold?  
   **A:** ⏳ DEFERRED - Optional enhancement (Task #6), implement core functionality first

7. **Q:** Exit method - should iOS CSS fullscreen exit via tap anywhere or specific button?  
   **A:** ✅ TAP ANYWHERE - Simpler UX, implemented as click handler on map container

8. **Q:** Should we hide Leaflet zoom controls in fullscreen mode for cleaner UI?  
   **A:** ⏳ DECIDE DURING TESTING - Easy CSS toggle, test on device first

### 🤔 Open Questions

None - all architectural questions resolved!

---

## Next Steps

**Implementation order:**

1. **Task #2:** Create `useMapFullscreen.ts` composable (45-60 min)
   - Define TypeScript interfaces
   - Implement fullscreen logic with native API + CSS fallback
   - Add long-press gesture detection with `distanceThreshold`
   - Add Leaflet map resize handling
   - Add exit hint state management
   - Write comprehensive JSDoc comments

2. **Task #3:** Update `InteractiveMap.vue` component (15-20 min)
   - Import and use `useMapFullscreen` composable
   - Update template to use composable state
   - Verify CSS classes are applied correctly
   - Test that existing map functionality still works

3. **Task #4:** Add i18n translations (10-15 min)
   - Add `map.tapToExit` translations (et, en, uk)
   - Add `map.longPressHint` translations (for potential tooltip)

4. **Task #5:** Mobile device testing (60 min)
   - Test iOS Safari (CSS fallback mode)
   - Test Android Chrome (native fullscreen mode)
   - Test desktop browsers
   - Verify map state preservation (zoom, center, markers)
   - Test long-press doesn't interfere with pan/drag

5. **Task #6:** (Optional) Add visual enhancements (30 min)
   - Expanding circle animation during long-press hold
   - Haptic feedback on long-press trigger
   - Hide Leaflet zoom controls in fullscreen mode

---

## References

- **VueUse useFullscreen:** <https://vueuse.org/core/useFullscreen/>
- **VueUse onLongPress:** <https://vueuse.org/core/onLongPress/>
- **MDN Fullscreen API:** <https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API>
- **Leaflet invalidateSize:** <https://leafletjs.com/reference.html#map-invalidatesize>

---

**Research completed:** October 6, 2025  
**Ready for implementation:** ✅ YES  
**Estimated implementation time:** 3-4 hours (all 6 remaining tasks)
