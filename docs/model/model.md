# Entu Data Model

This document contains the Entu data model for the ESMuseum application.

## Table of Contents

- [asukoht](#asukoht)
- [database](#database)
- [department](#department)
- [entity](#entity)
- [folder](#folder)
- [grupp](#grupp)
- [kaart](#kaart)
- [menu](#menu)
- [person](#person)
- [plugin](#plugin)
- [property](#property)
- [ulesanne](#ulesanne)
- [vastus](#vastus)
- [vr_aum2rk](#vr_aum2rk)
- [vr_kavaler](#vr_kavaler)

## asukoht

**Labels:**

- Singular: "Asukoht"
- Plural: "Asukohad"

### Properties

| Property | Type | Value | References |
|---|---|---|---|
| name | string | asukoht |  |
| add_from | reference | kaart | entity (ID: 687d27c8259fc48ba59cf71a) |
| plugin | reference | KML import | plugin (ID: 687a1404259fc48ba59cdffa) |
| name | string |  |  |
| kirjeldus | string |  |  |
| long | string |  |  |
| lat | string |  |  |
| photo | string |  |  |
| link | string |  |  |
| pildilingid | string |  |  |

### References

- **add_from** references the **entity** entity type with value "kaart" (ID: 687d27c8259fc48ba59cf71a)
- **plugin** references the **plugin** entity type with value "KML import" (ID: 687a1404259fc48ba59cdffa)

## database

**Labels:**

- Singular: "Andmebaas"
- Plural: "Andmebaasid"

### Properties

| Property | Type | Value | References |
|---|---|---|---|
| name | string | database |  |
| address | string |  |  |
| add_user | string |  |  |
| email | string |  |  |
| name | string |  |  |
| organization | string |  |  |
| photo | string |  |  |
| price | string |  |  |
| billing_data_limit | string |  |  |
| billing_entities_limit | string |  |  |
| billing_requests_limit | string |  |  |

## department

**Labels:**

- Singular: "Osakond"
- Plural: "Osakonnad"

### Properties

| Property | Type | Value | References |
|---|---|---|---|
| name | string | department |  |
| description | string |  |  |
| name | string |  |  |

## entity

**Labels:**

- Singular: "Objekt"
- Plural: "Objektid"

### Properties

| Property | Type | Value | References |
|---|---|---|---|
| add_from | reference | Entities | menu (ID: 66b6245a7efc9ac06a437b4c) |
| name | string | entity |  |
| plugin | reference | Objekti mall | plugin (ID: 6864fe56d21b6a4025802de9) |
| add_from | string |  |  |
| default_parent | string |  |  |
| description | string |  |  |
| name | string |  |  |
| plugin | string |  |  |

### References

- **add_from** references the **menu** entity type with value "Entities" (ID: 66b6245a7efc9ac06a437b4c)
- **plugin** references the **plugin** entity type with value "Objekti mall" (ID: 6864fe56d21b6a4025802de9)

## folder

**Labels:**

- Singular: "Kaust"
- Plural: "Kaustad"

### Properties

| Property | Type | Value | References |
|---|---|---|---|
| add_from | reference | folder | entity (ID: 66b624597efc9ac06a4378a6) |
| name | string | folder |  |
| name | string |  |  |
| notes | string |  |  |

### References

- **add_from** references the **entity** entity type with value "folder" (ID: 66b624597efc9ac06a4378a6)

## grupp

**Labels:**

- Singular: "Grupp"
- Plural: "Grupid"

### Properties

| Property | Type | Value | References |
|---|---|---|---|
| name | string | grupp |  |
| add_from | reference | esmuuseum | database (ID: 66b6245c7efc9ac06a437ba0) |
| name | string |  |  |
| kirjeldus | text |  |  |
| grupijuht | string |  |  |

### References

- **add_from** references the **database** entity type with value "esmuuseum" (ID: 66b6245c7efc9ac06a437ba0)

## kaart

**Labels:**

- Singular: "Kaart"
- Plural: "Kaardid"

### Properties

| Property | Type | Value | References |
|---|---|---|---|
| name | string | kaart |  |
| add_from | reference | Kaardid | menu (ID: 687c9fd8259fc48ba59cf2e4) |
| default_parent | reference | Kaardid | folder (ID: 688227005d95233e69c28cf4) |
| name | string |  |  |
| kirjeldus | string |  |  |
| url | string |  |  |

### References

- **add_from** references the **menu** entity type with value "Kaardid" (ID: 687c9fd8259fc48ba59cf2e4)
- **default_parent** references the **folder** entity type with value "Kaardid" (ID: 688227005d95233e69c28cf4)

## menu

**Labels:**

- Singular: "Menüü"
- Plural: "Menüüd"

### Properties

| Property | Type | Value | References |
|---|---|---|---|
| add_from | reference | Menu | menu (ID: 66b6245a7efc9ac06a437b56) |
| name | string | menu |  |
| text | string |  |  |
| group | string |  |  |
| name | string |  |  |
| ordinal | string |  |  |
| query | string |  |  |

### References

- **add_from** references the **menu** entity type with value "Menu" (ID: 66b6245a7efc9ac06a437b56)

## person

**Labels:**

- Singular: "Persoon"
- Plural: "Persoonid"

### Properties

| Property | Type | Value | References |
|---|---|---|---|
| name | string | person |  |
| plugin | reference | CSV file | plugin (ID: 66b6245a7efc9ac06a437b87) |
| add_from | reference | Persons | menu (ID: 66b6245a7efc9ac06a437b73) |
| default_parent | reference | Persons | menu (ID: 66b6245a7efc9ac06a437b73) |
| address | string |  |  |
| birthdate | string |  |  |
| city | string |  |  |
| county | string |  |  |
| email | string |  |  |
| entu_api_key | string |  |  |
| entu_user | string |  |  |
| forename | string |  |  |
| gender | string |  |  |
| idcode | string |  |  |
| name | string |  |  |
| notes | string |  |  |
| phone | string |  |  |
| photo | string |  |  |
| postalcode | string |  |  |
| surname | string |  |  |

### References

- **plugin** references the **plugin** entity type with value "CSV file" (ID: 66b6245a7efc9ac06a437b87)
- **add_from** references the **menu** entity type with value "Persons" (ID: 66b6245a7efc9ac06a437b73)
- **default_parent** references the **menu** entity type with value "Persons" (ID: 66b6245a7efc9ac06a437b73)

## plugin

**Labels:**

- Singular: "Pistikprogramm"
- Plural: "Pistikprogrammid"

### Properties

| Property | Type | Value | References |
|---|---|---|---|
| add_from | reference | Plugins | menu (ID: 66b6245a7efc9ac06a437b60) |
| name | string | plugin |  |
| name | string |  |  |
| new_window | string |  |  |
| type | string |  |  |
| url | string |  |  |

### References

- **add_from** references the **menu** entity type with value "Plugins" (ID: 66b6245a7efc9ac06a437b60)

## property

**Labels:**

- Singular: "Parameeter"
- Plural: "Parameetrid"

### Properties

| Property | Type | Value | References |
|---|---|---|---|
| add_from | reference | entity | entity (ID: 66b624597efc9ac06a437840) |
| name | string | property |  |
| decimals | string |  |  |
| description | string |  |  |
| formula | string |  |  |
| group | string |  |  |
| list | string |  |  |
| mandatory | string |  |  |
| markdown | string |  |  |
| multilingual | string |  |  |
| name | string |  |  |
| ordinal | string |  |  |
| plugin | string |  |  |
| readonly | string |  |  |
| reference_query | string |  |  |
| search | string |  |  |
| set | string |  |  |
| table | string |  |  |
| type | string |  |  |

### References

- **add_from** references the **entity** entity type with value "entity" (ID: 66b624597efc9ac06a437840)

## ulesanne

**Labels:**

- Singular: "Ülesanne"
- Plural: "Ülesanded"

### Properties

| Property | Type | Value | References |
|---|---|---|---|
| name | string | ulesanne |  |
| add_from | reference | Ülesanded | folder (ID: 68691eb91749f351b9c82f68) |
| default_parent | reference | Ülesanded | folder (ID: 68691eb91749f351b9c82f68) |
| name | string |  |  |
| kirjeldus | text |  |  |
| tahtaeg | string |  |  |
| kaart | string |  |  |
| grupp | string |  |  |
| vastuseid | string |  |  |

### References

- **add_from** references the **folder** entity type with value "Ülesanded" (ID: 68691eb91749f351b9c82f68)
- **default_parent** references the **folder** entity type with value "Ülesanded" (ID: 68691eb91749f351b9c82f68)

## vastus

**Labels:**

- Singular: "Vastus"
- Plural: "Vastused"

### Properties

| Property | Type | Value | References |
|---|---|---|---|
| name | string | vastus |  |
| add_from | reference | ulesanne | entity (ID: 686917231749f351b9c82f4c) |
| default_parent | reference | ulesanne | entity (ID: 686917231749f351b9c82f4c) |
| asukoht | string |  |  |
| kirjeldus | text |  |  |
| photo | image |  |  |
| geopunkt | string |  |  |
| vastaja | string |  |  |

### References

- **add_from** references the **entity** entity type with value "ulesanne" (ID: 686917231749f351b9c82f4c)
- **default_parent** references the **entity** entity type with value "ulesanne" (ID: 686917231749f351b9c82f4c)

## vr_aum2rk

**Labels:**

- Singular: "Vabaduse rist"
- Plural: "Vabaduse ristid"

### Properties

| Property | Type | Value | References |
|---|---|---|---|
| name | string | vr_aum2rk |  |
| kavaler | string |  |  |
| liik_ja_j2rk | string |  |  |
| vr_nr | string |  |  |
| otsuse_kp | string |  |  |
| name | string |  |  |
| otsuse_tekst | string |  |  |
| vr_id | string |  |  |
| kavaler_vr_id | string |  |  |
| t2psustus | string |  |  |

## vr_kavaler

**Labels:**

- Singular: "Vabaduse Risti Kavaler"
- Plural: "Vabaduse Risti Kavalerid"

### Properties

| Property | Type | Value | References |
|---|---|---|---|
| name | string | vr_kavaler |  |
| name | string |  |  |
| eesnimi | string |  |  |
| perenimi | string |  |  |
| biograafia | string |  |  |
| emaisa | string |  |  |
| amet | string |  |  |
| vr_id | string |  |  |
| synd | string |  |  |
| photo | string |  |  |

