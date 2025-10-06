# Entu Data Model

This document contains the comprehensive Entu data model for the ESMuseum application, compiled from live data using the data explorer tool.

## Table of Contents

- [asukoht](#asukoht) - Location entities
- [department](#department) - Department management
- [folder](#folder) - Folder organization
- [grupp](#grupp) - Group management
- [kaart](#kaart) - Map entities
- [person](#person) - Person management
- [ulesanne](#ulesanne) - Task/assignment system
- [vastus](#vastus) - Response/answer system
- [vr_aum2rk](#vr_aum2rk) - Freedom Cross awards
- [vr_kavaler](#vr_kavaler) - Freedom Cross recipients

## asukoht

**Description**  
Location entities for geographical points and places

**Labels**  

- Singular: "Asukoht"
- Plural: "Asukohad"

**Entity Attributes**  

- **name**: string = "asukoht"
- **add_from**: reference → kaart entity (ID: 687d27c8259fc48ba59cf71a)
- **plugin**: reference → KML import plugin (ID: 687a1404259fc48ba59cdffa)

**Properties**  

This entity type has no custom properties defined.

**Usage**  
Represents geographical locations that can be imported via KML and are associated with maps.

## department

**Description**  
Department management for organizational structure

**Labels**  

- Singular: "Department"
- Plural: "Departments"

**Entity Attributes**  

- **name**: string = "department"

**Properties**  

- **description**: string - Department description
- **name**: string - Department name

**Usage**  
Organizational units within the museum structure.

## folder

**Description**  
Folder organization for content management

**Labels**  

- Singular: "Folder"
- Plural: "Folders"

**Entity Attributes**  

- **name**: string = "folder"
- **add_from**: reference → entity (ID: 66b624597efc9ac06a4378a6)

**Properties**  

- **name**: string - Folder name
- **notes**: string - Additional notes

**Usage**  
Hierarchical organization of content and entities.

## grupp

**Description**  
Group management for organizing users and activities

**Labels**  

- Singular: "Grupp"
- Plural: "Grupid"

**Entity Attributes**  

- **name**: string = "grupp"
- **add_from**: reference → esmuuseum database (ID: 66b6245c7efc9ac06a437ba0)

**Properties**  

- **name**: string - Group name
- **kirjeldus**: string - Group description
- **grupijuht**: reference - Group leader reference

**Usage**  
Organizing participants into groups for activities and assignments.

## kaart

**Description**  
Map entities for geographical and location-based content

**Labels**  

- Singular: "Kaart"
- Plural: "Kaardid"

**Entity Attributes**  

- **name**: string = "kaart"
- **add_from**: reference → Kaardid menu (ID: 687c9fd8259fc48ba59cf2e4)

**Properties**  

This entity type has no custom properties defined.

**Usage**  
Maps that can contain multiple locations (asukoht) and are used in assignments.

## person

**Description**  
Person management for users and participants

**Labels**  

- Singular: "Person"
- Plural: "Persons"

**Entity Attributes**  

- **name**: string = "person"
- **add_from**: reference → Persons menu (ID: 66b6245a7efc9ac06a437b73)
- **plugin**: reference → CSV file plugin (ID: 66b6245a7efc9ac06a437b87)

**Properties**  

- **address**: string - Physical address
- **birthdate**: date - Date of birth
- **city**: string - City of residence
- **county**: string - County/region
- **email**: string - Email address
- **entu_api_key**: string - API access key
- **entu_user**: string - Entu username
- **forename**: string - First name
- **gender**: string - Gender
- **idcode**: string - Personal identification code
- **name**: string - Full name
- **notes**: string - Additional notes
- **phone**: string - Phone number
- **photo**: file - Profile photo
- **postalcode**: string - Postal/ZIP code
- **surname**: string - Last name

**Usage**  
Comprehensive person management with contact information and authentication.

## ulesanne

**Description**  
Task/assignment system for educational activities

**Labels**  

- Singular: "Ülesanne"
- Plural: "Ülesanded"

**Entity Attributes**  

- **name**: string = "ulesanne"
- **add_from**: reference → Ülesanded folder (ID: 68691eb91749f351b9c82f68)

**Properties**  

- **name**: string - Task name
- **kirjeldus**: string - Task description
- **tahtaeg**: datetime - Deadline
- **kaart**: reference - Associated map
- **grupp**: reference - Assigned group

**Usage**  
Educational assignments that can be assigned to groups with deadlines and map associations.

## vastus

**Description**  
Response/answer system for task submissions

**Labels**  

- Singular: "Vastus"
- Plural: "Vastused"

**Entity Attributes**  

- **name**: string = "vastus"
- **add_from**: reference → ulesanne entity (ID: 686917231749f351b9c82f4c)

**Properties**  

- **asukoht**: reference - Location reference
- **kirjeldus**: string - Response description
- **photo**: file - Response photo

**Usage**  
Submissions and responses to assignments, can include location data and photos.

## vr_aum2rk

**Description**  
Freedom Cross awards management

**Labels**  

- Singular: "Vabaduse rist"
- Plural: "Vabaduse ristid"

**Entity Attributes**  

- **name**: string = "vr_aum2rk"

**Properties**  

- **kavaler**: reference - Award recipient
- **liik_ja_j2rk**: string - Type and rank
- **vr_nr**: string - Award number
- **otsuse_kp**: string - Decision date
- **name**: string - Award name
- **otsuse_tekst**: text - Decision text
- **vr_id**: string - Award ID
- **kavaler_vr_id**: string - Recipient award ID
- **t2psustus**: string - Specification

**Usage**  
Management of Estonian Freedom Cross awards and their details.

## vr_kavaler

**Description**  
Freedom Cross recipients management

**Labels**  

- Singular: "Vabaduse Risti Kavaler"
- Plural: "Vabaduse Risti Kavalerid"

**Entity Attributes**  

- **name**: string = "vr_kavaler"

**Properties**  

- **name**: string - Full name
- **eesnimi**: string - First name
- **perenimi**: string - Last name
- **biograafia**: text - Biography
- **emaisa**: string - Mother's name
- **amet**: string - Profession/position
- **vr_id**: string - Recipient ID
- **synd**: string - Birth information
- **photo**: file - Portrait photo

**Usage**  
Biographical information about Freedom Cross recipients.

## Data Relationships

### Key Entity Relationships

- **kaart** → **asukoht**: Maps contain multiple locations
- **ulesanne** → **kaart**: Tasks are associated with specific maps
- **ulesanne** → **grupp**: Tasks are assigned to groups
- **vastus** → **ulesanne**: Responses are submitted for tasks
- **vastus** → **asukoht**: Responses can reference specific locations
- **vr_aum2rk** → **vr_kavaler**: Awards are given to recipients

### Property Types Used

- **string**: Text data
- **text**: Longer text content
- **date**: Date values
- **datetime**: Date and time values
- **reference**: Links to other entities
- **file**: File uploads (photos, documents)
- **boolean**: True/false values

## System Architecture

The data model supports:

1. **Educational activities**: Tasks assigned to groups with map-based content
2. **Geographical data**: Locations that can be imported and referenced
3. **User management**: Comprehensive person profiles with authentication
4. **Content organization**: Folders and hierarchical structure
5. **Historical records**: Freedom Cross awards and recipients
6. **File management**: Photo and document uploads
