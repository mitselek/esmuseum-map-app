# Demo Tagasiside: Oktoobri 2025 Sesssioon

**Kuupäev**: 8. oktoober 2025

**Osalejad**:

- Annemai Mägi (Eesti sõjamuuseum)
- Eli Pilve (Eesti sõjamuuseum)
- Patrick Rang (Eesti sõjamuuseum)
- Argo Roots (Entu tooteomanik)
- Mihkel Putrinš (kaardirakenduse arendaja)

**Versioon/Keskkond**: Arendusversioon

**Sessioon Kestus**: ~2 tundi

## Kokkuvõte

Demo käigus tuvastati mitmeid olulisi UX probleeme ja funktsionaalsuse puudujääke. Peamised teemad hõlmavad uute kasutajate onboarding'ut, andmemudeli segasust (geopunkt vs asukoht), reaalajas statistika värskendamist ning läti keele tuge. Vaja on toetajate logo lisada login lehele.

**Olek**: 11 ülesannet 12-st lahendatud (92% valminud)

## Tagasiside Kategooriate Kaupa

### Vead

#### Kriitiline

- **[BUG-001] ✅ Kaardi statistika ei värskenda automaatselt**
  - **Kirjeldus**: Kui kasutaja lisab ülesandele vastuse ja naaseb seejärel ülesannete valikusse, ei ole statistika seal uuenenud
  - **Reprodutseerimise Sammud**:
    1. Ava ülesanne kaardirakendusse
    2. Lisa vastus ülesandele
    3. Naase ülesannete valikusse
    4. Vaata statistikat
  - **Oodatav Käitumine**: Statistika peaks automaatselt värskenduma peale vastuse lisamist
  - **Tegelik Käitumine**: Statistika jääb vanaks, värskendub alles peale lehekülge refresh'i
  - **Mõju**: Kasutajad ei näe reaalajas statistikat, võivad arvata et vastus ei salvestunud
  - **Märkused**: Vajab reaalajas andmete sünkroniseerimist või optimistlikku UI uuendust

#### Keskmine

- **[BUG-002] ✅ Geopunkti ja asukoha väljad on segased** - LAHENDATUD (14. oktoober 2025, PR #11)
  - **Kirjeldus**: Vastuse objektil on kaks erinevat koordinaatide välja ebaselge nimetusega
  - **Detailid**:
    - `geopunkt: String` - GPS koordinaadid seadme asukohast vastuse esitamise ajal
    - `asukoht.long, asukoht.lat` - asukoha koordinaadid
  - **Oodatud käitumine**: Selged ja eristavad väljanimed, mis näitavad erinevust seadme asukoha ja valitud asukoha vahel
  - **Tegelik Käitumine**: Kasutajaliideses ja Entu andmebaasis pole selget eristust, mis väli on mis
  - **Mõju**: Segadus arendajate ja kasutajate seas, andmete vale tõlgendamine
  - **Lahendus**:
    - `geopunkt` → `seadme_gps` (Seadme GPS koordinaadid)
    - `asukoht` → `valitud_asukoht` (Valitud asukoht ülesande nimekirjast)
  - **Muudatused**:
    - TypeScript tüübid (EntuResponse interface)
    - Konstantid (ENTU_PROPERTIES)
    - Vastuse loomise loogika (useTaskResponseCreation)
    - Abilised funktsioonid (entu-helpers)
    - UI komponendid (TaskResponseForm)
    - Serveri pool (server/utils/entu)
    - Dokumentatsioon (specs, näidised)
  - **Boonusparandused**: Eemaldatud kasutamata `getResponseText()` funktsioon ja parandatud näidisfail `test-f022-types.ts` (UX-001 järeleküsimus)
  - **Verifikatsioon**: 0 TypeScript vigu, 78 testi läbis, lint pass

### Funktsionaalsuse Soovid

#### Kõrge Prioriteet

- **[FEAT-001] ✅ Uue kasutaja onboarding ja juhendid** - LAHENDATUD (16. oktoober 2025, PR #TBD)
  - **Kirjeldus**: Kui uus kasutaja logib esimest korda sisse, näeb ta tühja ülesannete loendit ilma juhendmaterjalideta
  - **Kasutaja Vajadus**: Uus kasutaja vajab selgitust, kuidas rakendust kasutada ja kust alustada
  - **Lahendus**:
    - Loodud õpilaste signup flow: `/signup/[groupId]` lehekülg
    - Õpetaja jagab õpilastele linki grupiga liitumiseks
    - OAuth autentimine (email või Google või muu provider)
    - Nime küsimine kui Entus puudub
    - Automaatne grupi liikmelisuse kontroll
    - Grupi liikmelisuse määramine (server-side manager key)
    - Liikmelisuse kinnituse polling
    - Suunamine põhi task workspace'i (`/`)
  - **Muudatused**:
    - `app/pages/signup/[groupId].vue`: Uus signup lehekülg grupiga liitumiseks
    - `app/utils/entu-client.ts`: Client-side Entu API utilities (name update)
    - `app/composables/useEntuAuth.ts`: Fresh user data fetch after OAuth
    - `app/composables/useOnboarding.ts`: Onboarding state management
    - `server/api/onboard/get-group-info.get.ts`: Fetch group name
    - `server/api/onboard/check-membership.get.ts`: Check if user is member
    - `server/api/onboard/join-group.post.ts`: Assign user to group (with manager key)
    - TypeScript types: `types/onboarding.ts`
  - **Arhitektuur**:
    - **Name Update**: Client-side (user's JWT token, browser IP audience)
    - **Group Assignment**: Server-side (manager's JWT token, sets `_parent` reference)
    - **Data Sync**: Fresh user entity fetch from Entu after OAuth
  - **Kasu**:
    - Sujuv õpilaste onboarding
    - Automaatne nime küsimine
    - Automaatne grupi liikmelisuse haldus
  - **Testimine**: Käsitsi testitud OAuth flow, nime küsimine, grupi liikmelisuse määramine, polling
  - **Automaattestid**: 28/28 testi läbis, TypeScript vigu pole

- **[FEAT-002] ✅ E-posti põhine autentimine** - LAHENDATUD (14. oktoober 2025)
  - **Kirjeldus**: Implementeerida e-posti põhine autentimine Entu OAuth kaudu
  - **Kasutaja Vajadus**: Lihtsustab kasutajate autentimist, võimaldab mitmeid sisselogimise viise
  - **Lahendus**: Email auth provider lisatud Entu OAuth süsteemi
  - **Kasu**: Parem kasutajakogemus, rohkem sisselogimise võimalusi
  - **Muudatused**:
    - Lisatud `EMAIL: 'e-mail'` konstant `OAUTH_PROVIDERS`-sse
    - Lisatud Email nupp login lehele (kuues provider)
    - OAuth voog identne teiste provideritega: `https://entu.app/api/auth/e-mail?account=esmuuseum&next=...`
    - Loodud 11 testi (6 composable + 5 component testi, 1 skipped env limitation)
  - **Väline sõltuvus**: Entu administraator lubasid e-mail provideri OAuth.ee-s
  - **Verifikatsioon**: 88/88 testi läbis (100% pass rate), feature testitud töötavas OAuth voos
  - **Testimine**: Kinnitatud end-to-end: email sisestamine → kood emailile → koodi sisestamine → edukas sisselogimine

- **[FEAT-003] ✅ Õpetaja registreerumine ja õpilaste kutsumine** - LAHENDATUD (tehniliselt, vajab ainult dokumentatsiooni)
  - **Kirjeldus**: Vajadus struktureeritud õpetaja registreerumise ja õpilaste klassi kutsumise workflow'i järele
  - **Kasutaja Vajadus**: Õpetajad peavad saama lihtsalt registreeruda ja kutsuda õpilasi oma klassi
  - **Tehniline Lahendus**:
    - Õpetajaks registreerumine on juba võimalik Entu süsteemis
    - FEAT-001 implementeeris õpilaste signup flow (`/signup/[groupId]`)
    - Õpetaja saab luua grupi Entus ja jagada signup linki õpilastega
    - Signup URL formaat: `https://esmuseum.app/signup/{groupId}`
  - **Workflow**:
    1. Õpetaja registreerub Entus (olemasolev funktsioon)
    2. Õpetaja loob grupi/klassi Entus
    3. Õpetaja kopeerib grupi ID
    4. Õpetaja jagab signup linki õpilastega (email, QR kood, vms)
    5. Õpilased klikivad linki → OAuth → nimi → automaatne grupi liitumine
  - **Kasu**: Sujuv klasside haldamine, automaatne õpilaste liitumine
  - **Järgmised sammud**: Luua kasutusjuhend õpetajatele (DOC-001)

- **[FEAT-004] ✅ Läti keele tugi**
  - **Kirjeldus**: Lisada läti keel toetatud keelte hulka
  - **Kasutaja Vajadus**: Projekt on Interreg Estonia-Latvia raames, vajab läti keele tuge
  - **Soovitatud Lahendus**: Lisada läti keele tõlked i18n süsteemi
  - **Kasu**: Laiendab kasutajaskonda, vastab projekti nõuetele

#### Keskmine Prioriteet

- **[FEAT-005] ✅ Toetajate logod login lehele**
  - **Kirjeldus**: Login lehele lisada Interreg ja teiste toetajate logod
  - **Kasutaja Vajadus**: Näidata projekti toetajaid ja täita rahastamise nõudeid
  - **Soovitatud Lahendus**: Lisada logod login lehele
  - **Kasu**: Vastab projekti visuaalsetele nõuetele, tunnustab toetajaid
  - **Märkused**: Logo failid on juba projekti kopeeritud: `public/interreg-estonia-latvia.png`

- **[FEAT-006] ✅ Vastuse salvestamise ajatemplit tabelivaates**
  - **Kirjeldus**: Õpetajad vajavad võimalust näha ja sorteerida vastuseid loomise aja järgi Entu tabelivaates
  - **Kasutaja Vajadus**: Õpetaja peab nägema, millal on vastused esitatud, ja soovib neid ajatempli järgi ka sorteerida
  - **Tehniline Analüüs**:
    - Entu salvestab `_created` automaatselt kõigile entiteetidele (süsteemi omadus)
    - `_created` süsteemiomadus eksisteerib ja töötab korrektselt
    - **Probleem**: Süsteemiomadused (väljad alakriipsuga `_`) ei ole vaikimisi nähtavad Entu tabelivaates
    - **Lahendus**: Luua formula property, mis eksponeerib `_created` süsteemiomaduse
  - **Formula Property Konfiguratsioon**:
    - **Tüüp**: `string`
    - **Valem**: `_created`
    - **On tabelvaates**: Jah
  - **Vastutav**: Entu administraatorid (konfiguratsioon)
  - **Kasu**:
    - Õpetajad näevad vastuste esitamise aegu
    - Võimalik sorteerida õpilaste vastuseid kronoloogiliselt
    - Parem ülevaade õpilaste aktiivsusest ja vastuste ajastusest
  - **Märkus**: See EI vaja koodi muudatusi käesolevas projektis - TypeScript tüübid toetavad juba `_created` omadust läbi `EntuEntity` baasliidese

### UX/UI Parandused

- **[UX-001] ✅ "Kirjeldus" välja nimetuse segadus**
  - **Praegune Olukord**: Vastuse teksti väli on nimetatud "kirjeldus"
  - **Probleem**: Nimi on ebakohane, peaks olema "vastus"
  - **Soovitus**: Muuta välja nimi "kirjeldus" → "vastus"
  - **Kasutaja Mõju**: Selgem UI tekst, parem arusaadavus

- **[UX-002] ✅ Ülesande kirjelduse välja nimetuse segadus**
  - **Praegune Olukord**: Ülesande kirjeldus väli on nimetatud lihtsalt "kirjeldus"
  - **Probleem**: Nimi on ebakohane, peaks olema "ülesande kirjeldus"
  - **Soovitus**: Muuta välja nimi "kirjeldus" → "ülesande kirjeldus"
  - **Kasutaja Mõju**: Selgem UI tekst, parem arusaadavus
  - **Märkused**: Kontrollida i18n tõlkefaile

### Dokumentatsiooni Puudused

- **[DOC-001] Õpetaja kasutusjuhend puudu**
  - **Puudus**: Õpetajatele pole selget juhendit registreerumiseks ja õpilaste kutsumiseks
  - **Sihtgrupp**: Õpetajad, kes hakkavad rakendust kasutama
  - **Soovitus**: Luua samm-sammult kasutusjuhend pildimaterjali ja selgete instruktsioonidega

### Küsimused & Selgitused

- **[Q-001] ✅ Andmemudeli ümberstruktureerimine**
  - **Kontekst**: Geopunkt ja asukoht väljad vajavad selget eristust
  - **Vajab Otsust**: Arendusmeeskond, andmebaasi arhitekt
  - **Variandid**:
    - Ümber nimetada väljad selgemateks (nt. `device_location` ja `selected_location`)
    - Lisada selgitavad tooltipid UI-sse
    - Dokumenteerida andmemudel täpselt

## Tegevuskava

### Valminud

1. ✅ **[Kriitiline]** Parandada kaardi statistika automaatse värskendamise viga (BUG-001) - _Omanik: Arendusmeeskond_ - _Hinnanguline: 4-6 tundi_
   - **Lahendatud**: PR #7 (13. oktoober 2025)
   - **Lahendus**: Lisatud `watch(userResponses)` TaskSidebar komponenti, mis värskendab statistikat automaatselt peale vastuse lisamist
   - **Testimine**: Kinnitatud töökorras nii arvutis kui mobiilis (iOS Safari, Chrome)

2. ✅ **[Keskmine]** Lisada Interreg logo login lehele (FEAT-005) - _Omanik: Arendusmeeskond_ - _Hinnanguline: 1 tund_
   - **Lahendatud**: 12. oktoober 2025
   - **Lahendus**: Logo lisatud `/app/pages/login/index.vue` faili login vormi allossa
   - **Fail**: `public/interreg-estonia-latvia.png` (42KB)

3. ✅ **[Keskmine]** Luua formula property `_created` ajatempli näitamiseks vastuse tabelivaates (FEAT-006) - _Omanik: Entu Administraatorid_ - _Hinnanguline: 15-30 minutit_
   - **Lahendatud**: 13. oktoober 2025
   - **Lahendus**: Loodud formula property Entu admin paneeli kaudu
     - **Property Name**: `vastus_esitatud`
     - **Property Type**: `string`
     - **Formula**: `_created` (ekspoonib süsteemiomaduse)
     - **Display Labels**:
       - ET: "Vastus esitatud"
       - EN: "Time of Response"
     - **Visible in Tables**: Aktiveeritud
   - **Tulemus**:
     - Uutel vastustel kuvatakse ajatempel ISO formaadis (nt. `2025-10-13T16:05:12.474Z`)
     - Õpetajad saavad sorteerida vastuseid ajatempli järgi
     - Vanad vastused (enne formula loomist) ei oma ajatemplit nähtaval
   - **Märkus**: Kood projektis ei vajanud muudatusi - TypeScript tüübid toetasid juba `_created` omadust

4. ✅ **[Madal]** Parandada UI tekstid - vastuse ja ülesande väljad (UX-001, UX-002) - _Omanik: Arendusmeeskond_ - _Hinnanguline: 1-2 tundi_
   - **Lahendatud**: PR #8 (13. oktoober 2025)
   - **Lahendus**:
     - **UX-001**: Vastuse väli ümber nimetatud `kirjeldus` → `vastus`
     - **UX-002**: Ülesande välja sildid täpsustatud Entus
   - **Muudatused**:
     - Entu konfiguratsioon: Response property `kirjeldus` → `vastus`
     - Entu konfiguratsioon: Task labels EN="Assignment", ET="Ülesande kirjeldus"
     - TypeScript: `EntuResponse` interface updated
     - Constants: `ENTU_PROPERTIES.VASTUS` added for responses
     - Composable: `useTaskResponseCreation` uses new property
   - **Testimine**: Manuaalne testimine läbitud, vastuste loomine töötab korrektselt
   - **Märkus**: Koodi muudatused ei mõjuta olemasolevaid vastuseid (andmeid polnud)

5. ✅ **[Kõrge]** Lisada läti keele tugi (FEAT-004) - _Omanik: Arendusmeeskond_ - _Hinnanguline: 2-3 tundi_
   - **Lahendatud**: PR #9 (13. oktoober 2025)
   - **Lahendus**:
     - Eeltöö: Tõlgete audit ja puhastus (3 puuduvat lisatud, 20 kasutamata eemaldatud)
     - Lisatud 105 läti keele tõlget (`lv`) kõigile UI elementidele
     - Tõlkimise strateegia: Eesti keelest lähtudes (Balti kultuuriline kontekst)
     - Nuxt i18n konfiguratsioon: `'lv'` lisatud keelte loendisse
     - Läti lipp 🇱🇻 lisatud mõlemasse keelevahetajasse
   - **Muudatused**:
     - `.config/i18n.config.ts`: 105 läti keele tõlget
     - `.config/nuxt.config.ts`: Locale `'lv'` ja kuupäeva vormingud
     - `app/components/AppHeader.vue`: LanguageCode type ja läti lipp
     - `app/components/TaskWorkspaceHeader.vue`: LanguageCode type ja läti lipp
   - **Katvus**: 105 defineeritud = 105 kasutatud (100% katvus)
   - **Verifikatsioon**: `node scripts/analyze-translations.cjs`
   - **Tulemus**: Rakendus toetab nüüd 4 keelt (et, en, uk, lv)
   - **Projekti nõue**: Täidab Interreg Estonia-Latvia projekti keeletugi nõuded

6. ✅ **[Kõrge]** Lisada e-posti põhine autentimine (FEAT-002) - _Omanik: Arendusmeeskond_ - _Hinnanguline: 3-5 tundi_
   - **Lahendatud**: PR #12 (14. oktoober 2025)
   - **Lahendus**: Lisatud email authentication provider Entu OAuth süsteemi
   - **Muudatused**:
     - `app/composables/useEntuOAuth.ts`: Lisatud `EMAIL: 'e-mail'` konstant
     - `app/pages/login/index.vue`: Lisatud Email nupp providerite loendisse
     - `tests/composables/useEntuOAuth.test.ts`: 6 testi (5 passing, 1 skipped)
     - `tests/component/LoginPage.spec.ts`: 5 testi (kõik passing)
   - **OAuth URL**: `https://entu.app/api/auth/e-mail?account=esmuuseum&next=...`
   - **Testimine**: End-to-end OAuth voog töötab - email → verification code → login
   - **Väline sõltuvus**: Entu administrator lubasid e-mail provider OAuth.ee-s (Argo Roots)
   - **Test Results**: 88/88 passing (100%), 2 skipped
   - **Ajakulu**: ~30 minutit (84% kiirem kui hinnang 3-5h)

7. ✅ **[Kõrge]** Implementeerida uue kasutaja onboarding flow (FEAT-001) - _Omanik: Arendusmeeskond_ - _Hinnanguline: 2-3 päeva_
   - **Lahendatud**: PR #TBD (16. oktoober 2025)
   - **Lahendus**: Kompleksne õpilaste signup flow koos OAuth, nime küsimise ja grupi liikmelisuse haldusega
   - **Arhitektuur**:
     - **Client-side**: Nime uuendamine (user's JWT, browser IP audience)
     - **Server-side**: Grupi määramine (manager's JWT, sets `_parent` reference)
     - **Data sync**: Värske kasutaja andmete toomine Entust pärast OAuth
   - **Põhifunktsioonid**:
     - Signup URL: `/signup/[groupId]`
     - OAuth autentimine (Google, email, jt)
     - Automaatne kasutaja andmete uuendamine Entust
     - Nime küsimine kui puudub
     - Grupi liikmelisuse kontroll ja määramine
     - Liikmelisuse kinnituse polling (30s timeout)
     - Suunamine ülesannete tööruumi (`/`)
   - **Muudatused**:
     - 9 uut/muudetud faili (pages, composables, utils, server endpoints, types)
     - Client-side Entu API utilities
     - Fresh user data fetch after OAuth
     - JWT token exchange for manager key
   - **Testimine**: Manuaalne testimine läbitud (new user + returning user flows)
   - **Automaattestid**: 28/28 testi rohelised
   - **Kasu**: Sujuv õpilaste onboarding ilma manuaalse sekkumiseta

8. ✅ **[Kõrge]** Õpetaja registreerumine ja õpilaste kutsumine (FEAT-003) - _Omanik: Entu/Dokumentatsioon_ - _Hinnanguline: dokumentatsioon_
   - **Lahendatud**: Tehniliselt (16. oktoober 2025)
   - **Lahendus**:
     - Õpetaja registreerimine on Entus olemas
     - FEAT-001 võimaldab õpilaste signup flow
     - Õpetaja jagab signup linki: `https://esmuseum.app/signup/{groupId}`
   - **Workflow**:
     1. Õpetaja registreerub Entus
     2. Loob grupi/klassi
     3. Jagab signup linki õpilastega
     4. Õpilased liituvad automaatselt
   - **Järgmised sammud**: Kasutusjuhend (DOC-001)

### Ootel

1. **[Madal]** Luua õpetajate kasutusjuhend (DOC-001) - _Omanik: Tehnilise kirjutaja/Arendaja_ - _Hinnanguline: 4-6 tundi_

## Lisandmärkused

- Demo viidi läbi arenduskeskkonnas
- Interreg Estonia-Latvia logo on juba kopeeritud projekti: `public/interreg-estonia-latvia.png`
- Vajab järelkoosolekut _Arendusmeeskond/Entu_ andmemudeli küsimuste arutamiseks (Q-001)
- Kõik UI tekstide muudatused vajavad i18n tõlkefailide kontrollimist
- Õpetaja ja õpilase workflow vajab täiendavat UX disaini ja testimist

## Manused

- [Link originaal tagasiside märkmetele](./demo-feedback-2025-10-08.md)
- Logo fail: `public/interreg-estonia-latvia.png`
