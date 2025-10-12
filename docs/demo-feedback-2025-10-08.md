# Demo tagasiside - 8. oktoober 2025

Käsitsi kirjutatud märkmed demo sessiooni tagasisidest.

## 1. Juhendid

### UUS kasutaja kaardirakendusse

> Logib sisse kasutaja, kes pole varem kaardirakendust kasutanud

- Entus luuakse uus kasutaja (uute kasutajate kausta)
- Kasutaja näeb tühja ülesannete loendit
- Kasutajale kuvatakse link ESM kodukale, kus ta saab infot kaardirakenduse kohta

## 2. Login lehele toetajate logod

Annemai saadab logod

## 3. Kaardi statside viga

Demo käigus selgus, et kui ülesandele lisada vastus, ja siis minna tagasi ülesannete valikusse, siis seal pole statsid uuenenud. Refresh uuendas.

## 4. Läti keel lisada toetatud keelte sekka

## 5. Geopunkt

Praegune olukord: vastuse objektil on kaks geopunkti välja:

- geopunkt: String - GPS koordinaadid seadme asukohast vastuse esitamise ajal
- asukoht.long, asukoht.lat - asukoha koordinaadid

Probleem selles, et välja nimed on segased ja kasutajaliideses pole selget eristust, mis on mis. Sama häda ka Entu andmebaasis.

Samuti peaks vastuse "kirjeldus" olema "vastus"

## 6. Ülesande kirjeldus

### "ülesande kirjeldus" olgu → "ülesande kirjeldus"

- UI teksti parandamine
- Kontrolli i18n tõlkefaile

## 7. Vastuse salvestamise ajatempel

- Vastuse objektile entus lisada ajatempel

## 8. Email auth provider

- Implementeeri e-posti põhine autentimine Entu OAuth-ga

## 9. Õpetaja kasutajaks registreerimine

- Õpetaja registreerumine läbi Entu
- Luua kasutusjuhend

### Õpilase kutsumine klassi

- Õpetaja jagab klassiga linki (QR kood vms)
- Õpilane logib sisse Entu kaudu
- Suunatakse kaardirakendusse
