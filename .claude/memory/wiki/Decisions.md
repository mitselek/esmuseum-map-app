# Decisions

Rulings with dates and reasons. Newest first.

## 2026-09-29 -- No Stadia or CARTO; special days use OpenTopoMap

Mihkel: "we are not getting Stadia map styles". Keyed providers were removed from the style
list, not left in as dead options. OpenTopoMap is the only other keyless style, so all
special days share it. (#54, bdfdb2b)

## 2026-09-29 -- Title Case only in English

Mihkel: Title Case applies only to English. et/uk/lv strings use sentence case; a test
pins the known cases. (#51, #52, #55)

## 2026-09-29 -- Ukrainian app name spelled out

The Ukrainian acronym ЕВМ reads as "computer", so uk `appName` is
"Карта Естонського військового музею" instead of acronym + "map app". Not yet checked by a
native speaker. (afa8560)

## 2026-09-28 -- Live deploys, verified on production

Mihkel: no staging and no time for ceremony; deploy live at night when no students use the
app, rely on App Platform rollback. Each change: issue, failing test, fix, push, wait for
ACTIVE, verify the shipped bundle. Applies to night sessions with no live users, not as a
standing daytime rule.

## 2026-09-28 -- Submit confirmation stays 3 s

Mihkel: users missed the 1.5 s confirmation; extend to 3 s, no other change. Text stays
"Vastus saadetud!"; the silent failure path was left out of scope. (#53)

Related: [[Deployment]], [[Gotchas]].
