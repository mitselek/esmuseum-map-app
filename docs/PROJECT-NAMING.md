# Project Naming Issue Documentation

**Date**: October 14, 2025  
**Status**: Documented for future consideration  
**Priority**: Low (cosmetic, but causes confusion)

## Current Naming

**Project Name**: `esmuseum-map-app`  
**Repository**: `esmuseum-map-app`  
**Display Name**: "ESMuseum Map App"

## The Problem

The project name **"ESMuseum"** is **highly ambiguous** and leads to consistent misinterpretation.

### What It Actually Means

- **ES** = **Eesti Sõja** (Estonian War)
- **Museum** = Museum (English)
- **Full Name**: Estonian War Museum (Eesti Sõjamuuseum)

### What People Think It Means

- **ES** = **Estonian Sports** (most common misinterpretation)
- **Museum** = Museum
- **Misread As**: Estonian Sports Museum

### Why This Happens

1. **Mixed Language**: "ES" (Estonian abbreviation) + "Museum" (English word)
2. **Pattern Matching**: "ES" + "Museum" → Brain fills in "Estonian Sports Museum"
3. **No Context Clues**: Nothing in the name suggests "War" (Sõja)
4. **English Bias**: "Museum" is English, so readers assume "ES" is also English abbreviation

## Evidence of Confusion

### Case Study: AI Assistant Error (October 14, 2025)

During FEAT-002 email authentication research and implementation:

1. **Initial Error**: AI assistant wrote "Estonian Sports Museum Map Application" in FEAT-002 research document
2. **Propagation**: Error copied to spec.md and quickstart.md
3. **Duration**: Persisted through multiple documents before detection
4. **Root Cause**: AI interpreted "ESMuseum" as "Estonian Sports Museum"

**Documents Affected**:

- `docs/FEAT-002-EMAIL-AUTH-RESEARCH.md` (line 265)
- `specs/029-add-email-authentication/spec.md` (line 43)
- `specs/029-add-email-authentication/quickstart.md` (line 60)

All corrected on October 14, 2025.

## Better Naming Alternatives

### Option 1: Use Estonian Language Consistently

**Recommended**: `ESTSmuuseum-map-app` or `eesti-sojamuuseum-map-app`

- **Pros**: Authentic, unambiguous
- **Cons**: Non-Estonian speakers need translation

### Option 2: Use English Language Consistently

**Recommended**: `EWMuseum-map-app` or `estonian-war-museum-map-app`

- **Pros**: Immediately clear to international audience
- **Cons**: Loses Estonian identity

### Option 3: Hybrid with Clear War Context

**Recommended**: `ESWarMuseum-map-app` or `ES-war-museum-map-app`

- **Pros**: Keeps "ES" prefix, adds clarity
- **Cons**: Still somewhat mixed

### Option 4: Full Descriptive Name

**Recommended**: `estonian-military-history-map` or `war-museum-estonia-map`

- **Pros**: Completely unambiguous
- **Cons**: Longer, loses "ESMuseum" brand if established

## Recommended Action

### Short Term (No Action Required)

- Document this issue (this file)
- Add note to README.md clarifying name
- Update AI context files to explicitly state "War Museum, not Sports Museum"

### Long Term (If Renaming Considered)

**Best Choice**: `estonian-war-museum-map` or `ewmuseum-map-app`

**Rationale**:

- Clear and unambiguous
- Searchable and SEO-friendly
- International audience understands immediately
- Maintains museum identity

**Impact Assessment**:

- **Repository Rename**: Low impact (GitHub auto-redirects)
- **Code Changes**: Minimal (mostly comments and docs)
- **Branding**: Only relevant if "ESMuseum" is established brand
- **URLs**: Would need redirects if domain is `esmuseum.*`

## Workaround for Current Name

### In Documentation

Always use full name on first mention:

✅ **Good**: "Estonian War Museum (ESMuseum) Map Application"  
❌ **Bad**: "ESMuseum Map Application"

### In Code Comments

```typescript
// Estonian War Museum (ESMuseum) map application
// Note: "ES" = "Eesti Sõja" (Estonian War), NOT "Estonian Sports"
```

### In AI Context Files

Add explicit disambiguation:

```markdown
## Project Context

**Name**: ESMuseum Map App  
**Full Name**: Estonian War Museum Map Application  
**Important**: "ES" = "Eesti Sõja" (War), NOT "Sports"
```

## Related Files to Update

- [ ] `README.md` - Add disambiguation note
- [ ] `.github/copilot-instructions.md` - Add explicit context
- [ ] `.specify/memory/constitution.md` - Add naming note if needed
- [ ] All AI agent context files - Add disambiguation

## Lessons Learned

1. **Mixed-language names are problematic**: Especially when abbreviations are in one language and words in another
2. **Ambiguous abbreviations fail**: "ES" could mean many things in English context
3. **Context-free names don't scale**: Name should be understandable without project knowledge
4. **Pattern matching is powerful**: Brains auto-complete "ES" + "Museum" → "Sports Museum"

## Decision Log

| Date       | Decision                                 | Rationale                                       |
| ---------- | ---------------------------------------- | ----------------------------------------------- |
| 2025-10-14 | Document issue, no rename yet            | Low priority cosmetic issue, renaming has costs |
| TBD        | Consider rename if brand not established | Evaluate branding vs. clarity tradeoff          |

---

**Maintainer Note**: This is not a critical issue but causes consistent confusion. Document in onboarding materials and consider rename if rebranding opportunity arises.

**For New Contributors**: ESMuseum = **Estonian War Museum** (Eesti Sõjamuuseum), NOT Sports Museum!
