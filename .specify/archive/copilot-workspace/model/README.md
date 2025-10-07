# Entu Data Model

This folder contains the latest fetched data model from the Entu database for the ESMuseum application.

## Files

- `model.yaml`: Machine-readable YAML representation of all entity types and their properties
- `model.json`: Complete raw JSON data from the Entu API responses
- `model.md`: Human-readable Markdown summary of the data model with usage descriptions and relationships

## How to Update

### Method 1: Interactive Data Explorer (Recommended)

Use the built-in data explorer tool to view and copy the latest data model:

1. Start the development server: `npm run dev`
2. Navigate to: `http://localhost:3000/dev/data-explorer`
3. Use the "Copy YAML" or "Copy JSON" buttons to get the latest model data
4. Update the respective files in this folder with the copied content
5. Update `model.md` with any new insights or structure changes

### Method 2: Automated Script

Run the fetch script (if available):

```bash
node scripts/fetch-entu-model.js
```

The script will use your environment variables for authentication and output the results here.

## Data Model Overview

The current data model includes these main entity types:

- **asukoht**: Location entities for geographical points
- **grupp**: Group management for organizing users and activities  
- **kaart**: Map entities for geographical content
- **person**: Comprehensive person management with authentication
- **ulesanne**: Task/assignment system for educational activities
- **vastus**: Response/answer system for task submissions
- **folder**: Content organization and hierarchy
- **department**: Organizational structure management
- **vr_aum2rk**: Freedom Cross awards (Estonian historical data)
- **vr_kavaler**: Freedom Cross recipients (Estonian historical data)

## Key Relationships

- Tasks (ulesanne) are assigned to groups (grupp) with associated maps (kaart)
- Responses (vastus) are submitted for tasks and can reference locations (asukoht)
- Locations can be imported via KML plugins and associated with maps
- Comprehensive person profiles support the user management system

## Usage in Development

This data model informs:

1. **Form generation**: Property definitions drive dynamic form creation
2. **Type validation**: Property types ensure data integrity
3. **Reference handling**: Entity relationships enable proper data linking
4. **Feature planning**: Understanding the model guides new feature development

## Last Updated

Check git history for the most recent updates to these files. The data explorer provides real-time access to the current state of the Entu database.
