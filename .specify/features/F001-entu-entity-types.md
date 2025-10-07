# Feature: New Entu Entity Types

## Overview

This feature specification outlines the new entity types needed in the Entu system for the ESMuseum Map Application, based on the `esm-kaardirakendus.pdf` design document.

## Entity Types

### 1. Kaart (Map)

A map representation that contains locations.

**Properties:**

- `nimi`: Name of the map
- `kirjeldus`: Description of the map
- `url`: URL for the map

**Relationships:**

- Parent entity for Asukoht entities

### 2. Asukoht (Location)

A location on a map.

**Properties:**

- `nimi`: Name of the location
- `kirjeldus`: Description of the location
- `long`: Longitude coordinate
- `lat`: Latitude coordinate
- `picture`: Image of the location
- `link`: Link to additional information

**Relationships:**

- Child of Kaart entity

### 3. Grupp (Group)

A group containing persons.

**Properties:**

- `nimi`: Name of the group
- `kirjeldus`: Description of the group
- `grupijuht`: Reference to a Persoon entity (group leader)

**Relationships:**

- Parent entity for Persoon entities

### 4. Persoon (Person)

A person who belongs to a group. This entity type already exists in the Entu system.

**Properties:**

- Properties already defined in existing model

**Relationships:**

- Child of Grupp entity

### 5. Ülesanne (Task)

A task that can have responses.

**Properties:**

- `nimi`: Name of the task
- `kirjeldus`: Description of the task
- `tähtaeg`: Deadline for the task
- `kaart`: Reference to a Kaart entity
- `grupp`: Reference to a Grupp entity

**Relationships:**

- Parent entity for Vastus entities

### 6. Vastus (Response)

A response to a task.

**Properties:**

- `kirjeldus`: Description of the response
- `pilt`: Image for the response
- `asukoht`: Reference to an Asukoht entity

**Relationships:**

- Child of Ülesanne entity

## Implementation Requirements

1. Each entity type will initially have a minimal set of properties, with `nimi` being required for all entities
2. Parent-child relationships need to be properly defined in the Entu system
3. The structure must be extensible for adding more properties in the future as needed

## Questions

- Are there any specific validation requirements for any of these entity types?
- Should we implement any specific business logic related to these entities?
