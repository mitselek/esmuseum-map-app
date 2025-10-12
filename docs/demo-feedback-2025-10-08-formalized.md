# Demo Tagasiside: Oktoobri 2025 Sesssioon

**Kuupäev**: 8. oktoober 2025

**Osalejad**:

- Annemai Mägi (Eesti Sõjamuuseum)
- Eli Pilve (Eesti Sõjamuuseum)
- Argo Roots (Entu tooteomanik)
- Mihkel Putrinš (kaardirakenduse arendaja)

**Versioon/Keskkond**: Arendusversioon

**Sessioon Kestus**: ~2 tundi

## Kokkuvõte

Demo käigus tuvastati mitmeid olulisi UX probleeme ja funktsionaalsuse puudujääke. Peamised teemad hõlmavad uute kasutajate onboarding'ut, andmemudeli segasust (geopunkt vs asukoht), reaalajas statistika värskendamist ning läti keele tuge. Vaja on toetajate logo lisada login lehele.

## Tagasiside Kategooriate Kaupa

### Vead

#### Kriitiline

- **[BUG-001] Kaardi statistika ei värskenda automaatselt**
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

- **[BUG-002] Geopunkti ja asukoha väljad on segased**
  - **Kirjeldus**: Vastuse objektil on kaks erinevat koordinaatide välja ebaselge nimetusega
  - **Detailid**:
    - `geopunkt: String` - GPS koordinaadid seadme asukohast vastuse esitamise ajal
    - `asukoht.long, asukoht.lat` - asukoha koordinaadid
  - **Oodatud käitumine**: Selged ja eristavad väljanimed, mis näitavad erinevust seadme asukoha ja valitud asukoha vahel
  - **Tegelik Käitumine**: Kasutajaliideses ja Entu andmebaasis pole selget eristust, mis väli on mis
  - **Mõju**: Segadus arendajate ja kasutajate seas, andmete vale tõlgendamine
  - **Märkused**: Vajab andmemudeli refaktoorimist ja UI tekstide täpsustamist

### Funktsionaalsuse Soovid

#### Kõrge Prioriteet

- **[FEAT-001] Uue kasutaja onboarding ja juhendid**
  - **Kirjeldus**: Kui uus kasutaja logib esimest korda sisse, näeb ta tühja ülesannete loendit ilma juhendmaterjalideta
  - **Kasutaja Vajadus**: Uus kasutaja vajab selgitust, kuidas rakendust kasutada ja kust alustada
  - **Soovitatud Lahendus**:
    - Entus luuakse uus kasutaja uute kasutajate kausta
    - Kasutaja näeb tühja ülesannete loendit
    - Kasutajale kuvatakse link ESM kodulehele, kus ta saab infot kaardirakenduse kohta
  - **Kasu**: Vähendab kasutajate segadust, parandab esimest kasutuskogemust
  - **Märkused**: Vajab welcome screen'i või onboarding flow'i disaini

- **[FEAT-002] E-posti põhine autentimine**
  - **Kirjeldus**: Implementeerida e-posti põhine autentimine Entu OAuth kaudu
  - **Kasutaja Vajadus**: Lihtsustab kasutajate autentimist, võimaldab mitmeid sisselogimise viise
  - **Soovitatud Lahendus**: Email auth provider lisamine Entu OAuth süsteemi
  - **Kasu**: Parem kasutajakogemus, rohkem sisselogimise võimalusi

- **[FEAT-003] Õpetaja registreerumine ja õpilaste kutsumine**
  - **Kirjeldus**: Vajadus struktureeritud õpetaja registreerumise ja õpilaste klassi kutsumise workflow'i järele
  - **Kasutaja Vajadus**: Õpetajad peavad saama lihtsalt registreeruda ja kutsuda õpilasi oma klassi
  - **Soovitatud Lahendus**:
    - Õpetajaks registreerumine läbi Entu
    - Õpetaja jagab klassiga linki (QR kood vms)
    - Õpilane logib sisse Entu kaudu
    - Suunatakse kaardirakendusse
  - **Kasu**: Lihtsustab klasside haldamist, parandab onboarding'ut
  - **Märkused**: Vajab kasutusjuhendit ja dokumentatsiooni

- **[FEAT-004] Läti keele tugi**
  - **Kirjeldus**: Lisada läti keel toetatud keelte hulka
  - **Kasutaja Vajadus**: Projekt on Interreg Estonia-Latvia raames, vajab läti keele tuge
  - **Soovitatud Lahendus**: Lisada läti keele tõlked i18n süsteemi
  - **Kasu**: Laiendab kasutajaskonda, vastab projekti nõuetele

#### Keskmine Prioriteet

- **[FEAT-005] Toetajate logod login lehele**
  - **Kirjeldus**: Login lehele lisada Interreg ja teiste toetajate logod
  - **Kasutaja Vajadus**: Näidata projekti toetajaid ja täita rahastamise nõudeid
  - **Soovitatud Lahendus**: Lisada logod login lehele
  - **Kasu**: Vastab projekti visuaalsetele nõuetele, tunnustab toetajaid
  - **Märkused**: Logo failid on juba projekti kopeeritud: `public/interreg-estonia-latvia.png`

- **[FEAT-006] Vastuse salvestamise ajatempel**
  - **Kirjeldus**: Vastuse objektile Entus lisada ajatempel
  - **Kasutaja Vajadus**: Vajadus teada, millal vastus salvestati
  - **Soovitatud Lahendus**: Lisada timestamp väli vastuse objektile Entu andmemudelis
  - **Kasu**: Parem andmete jälgimine, võimaldab ajapõhist analüüsi

### UX/UI Parandused

- **[UX-001] "Kirjeldus" välja nimetuse segadus**
  - **Praegune Olukord**: Vastuse teksti väli on nimetatud "kirjeldus"
  - **Probleem**: Nimi on ebakohane, peaks olema "vastus"
  - **Soovitus**: Muuta välja nimi "kirjeldus" → "vastus"
  - **Kasutaja Mõju**: Selgem UI tekst, parem arusaadavus

- **[UX-002] Ülesande kirjelduse välja nimetuse segadus**
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

- **[Q-001] Andmemudeli ümberstruktureerimine**
  - **Kontekst**: Geopunkt ja asukoht väljad vajavad selget eristust
  - **Vajab Otsust**: Arendusmeeskond, andmebaasi arhitekt
  - **Variandid**:
    - Ümber nimetada väljad selgemateks (nt. `device_location` ja `selected_location`)
    - Lisada selgitavad tooltipid UI-sse
    - Dokumenteerida andmemudel täpselt

## Tegevuskava

1. **[Kriitiline]** Parandada kaardi statistika automaatse värskendamise viga (BUG-001) - _Omanik: Arendusmeeskond_ - _Hinnanguline: 4-6 tundi_

2. **[Kõrge]** Implementeerida uue kasutaja onboarding flow (FEAT-001) - _Omanik: UX/Arendusmeeskond_ - _Hinnanguline: 2-3 päeva_

3. **[Kõrge]** Lisada e-posti põhine autentimine (FEAT-002) - _Omanik: Arendusmeeskond_ - _Hinnanguline: 3-5 tundi_

4. **[Kõrge]** Disainida õpetaja registreerumise ja õpilaste kutsumise workflow (FEAT-003) - _Omanik: UX/Arendusmeeskond_ - _Hinnanguline: 3-5 tundi_

5. **[Kõrge]** Lisada läti keele tugi (FEAT-004) - _Omanik: Arendusmeeskond_ - _Hinnanguline: 2-3 tundi_

6. **[Keskmine]** Lisada Interreg logo login lehele (FEAT-005) - _Omanik: Arendusmeeskond_ - _Hinnanguline: 1 tund_

7. **[Keskmine]** Refaktoorida geopunkt/asukoht andmemudel (BUG-002) - _Omanik: Arendusmeeskond_ - _Hinnanguline: 3-5 tundi_

8. **[Keskmine]** Lisada ajatempel vastuse objektile (FEAT-006) - _Omanik: Arendusmeeskond/Entu_ - _Hinnanguline: 1-2 tundi_

9. **[Madal]** Parandada UI tekstid (UX-001, UX-002) - _Omanik: Arendusmeeskond_ - _Hinnanguline: 1-2 tundi_

10. **[Madal]** Luua õpetajate kasutusjuhend (DOC-001) - _Omanik: Tehnilise kirjutaja/Arendaja_ - _Hinnanguline: 4-6 tundi_

## Lisandmärkused

- Demo viidi läbi arenduskeskkonnas
- Interreg Estonia-Latvia logo on juba kopeeritud projekti: `public/interreg-estonia-latvia.png`
- Vajab järelkoosolekut _Arendusmeeskond/Entu_ andmemudeli küsimuste arutamiseks (Q-001)
- Kõik UI tekstide muudatused vajavad i18n tõlkefailide kontrollimist
- Õpetaja ja õpilase workflow vajab täiendavat UX disaini ja testimist

## Manused

- [Link originaal tagasiside märkmetele](./demo-feedback-2025-10-08.md)
- Logo fail: `public/interreg-estonia-latvia.png`
