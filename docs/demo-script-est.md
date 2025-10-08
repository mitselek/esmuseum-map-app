# ESMuseum Kaart Demo Stsenaarium (Eesti)

## Demo Ülevaade

**Kestus:** ~10-15 minutit  
**Sihtrühm:** Kliendid/kolleegid  
**Eesmärk:** Näidata ESMuseum kaardirakendusse funktsioonide toimimist

---

## 1. SISSEJUHATUS (2 min)

**Tere tulemast!**

"Tere! Täna näitan teile ESMuseum kaardirakenust, mis võimaldab kasutajatel kaardipõhiseid ülesandeid täita ja vastuseid esitada. See on interaktiivne veebirakendus, mis töötab nii arvutis kui mobiilseadmetes."

**Peamised funktsioonid:**

- **Interaktiivsed kaardid** - Leaflet põhine kaardikiht
- **Asukoha tuvastamine** - GPS/geolookatsiooni tugi
- **Ülesannete süsteem** - struktuuritud vastuste esitamine
- **Mitmekeelne** - eesti, inglise, ukraina keel
- **Mobiilisõbralik** - töötab kõikides seadmetes

---

## 2. KAARDI VAATAMINE (3 min)

**Demo sammud:**

1. **Kaardi laadimine**
   - "Esmalt vaatame, kuidas kaart laadib..."
   - Näita kaardi elementi ja zoom kontrolle
2. **Asukohad kaardil**

   - "Näete punaseid/rohelisi markereid - need on ülesande asukohad"
   - Kliki märkeri peale
   - "Popup aknas näeb asukoha infot..."

3. **Markdown linkide töötamine** (UUS!)
   - "Märkate, et kirjelduses olevad lingid on nüüd klikitavad"
   - Näita markdown linki ja kliki sellel
   - "See oli meie viimane parandus - markdown linkide renderdamine"

---

## 3. GPS FUNKTSIOON (4 min)

**Demo sammud:**

1. **GPS luba küsimine**

   - "Nüüd vaatame GPS funktsiooni..."
   - Kliki "Leia mind" nuppu
   - Näita load dialoog

2. **Asukoha tuvastamine** (PARANDATUD!)

   - "Rakendus kasutab nüüd targemat GPS süsteemi"
   - Seleta error handling parandusi:
     - "Kui GPS ei tööta, proovib erinevaid meetodeid"
     - "Kasutaja saab selgeid eestikeelseid teateid"

3. **Error handling demo**
   - Kui GPS ei tööta: "Vaatame, mis juhtub kui GPS ei ole saadaval..."
   - Näita error sõnumeid
   - "Kõik teatmed on nüüd eesti keeles ja selgitavad, mida teha"

---

## 4. VASTUSTE ESITAMINE (3 min)

**Demo sammud:**

1. **Asukoha valimine**

   - "Kasutaja saab valida asukoha kaardilt..."
   - Kliki märkeri peale

2. **Vastuse vorm**

   - "Avatakse vastuse esitamise vorm"
   - Näita teksti välja
   - Näita foto üleslaadimise võimalust

3. **GPS koordinaatide salvestamine**
   - "Süsteem salvestab automaatselt kasutaja GPS koordinaadid"
   - Seleta erinevust: "Asukoha koordinaadid vs kasutaja asukoht vastamise hetkel"

---

## 5. TEHNILISED DETAILID (2 min)

**Arhitektuur:**

- **Frontend:** Vue.js 3 + Nuxt.js
- **Kaardid:** Leaflet + OpenStreetMap
- **Andmebaas:** Entu API
- **Stiilid:** Tailwind CSS
- **Keeled:** i18n tugi

**Viimased parandused:**

1. **GPS error handling** - targem vigade käsitlemine
2. **Markdown linkid** - HTML renderdamine popup'ides
3. **Mitmekeelne süsteem** - täielik tõlkimine

---

## 6. KÜSIMUSED & VASTUSED (1-2 min)

**Võimalikud küsimused:**

- **"Kas töötab kõikides brauserites?"** - Jah, kõik modernid brauserid
- **"Mis juhtub kui GPS ei tööta?"** - Kasutaja saab selge juhendi
- **"Kas saab offline kasutada?"** - Ei
- **"Kuidas andmeid salvestatakse?"** - Entu API kaudu, turvaline

---

## DEMO NÕUANDED

**Enne demo't:**

Server töötab (<https://192.168.0.19:3000>)  
GPS load on andmata (testimiseks)  
Võrguühendus stabiilne  
Browser on täisekraanil

**Demo ajal:**

- **Räägi aeglaselt ja selgelt**
- **Näita hiire liikumist**
- **Tee pause, et inimesed jõuaksid jälgida**
- **Küsi küsimusi: "Kas on midagi ebaselge?"**

**Kui midagi läheb valesti:**

- **Refresh lehte**
- **Proovi mobiiliga**
- **Kasuta backup screenshots**

---

## BACKUP PLAN

Kui GPS/internet ei tööta:

1. Kasuta valmis screenshotte
2. Seleta funktsioone visuaalselt
3. Näita koodi GitHub'is
4. Räägi tehnilisest arhitektuurist

**Head demo't!**
