# F012 - Scoring Mechanism (Zero of Twenty-Five)

## Overview

Implement a scoring mechanism that displays user progress as "X of Y" where:

- X = count of unique locations where user has submitted responses
- Y = total number of expected responses (from task properties)

## API Response Structure

### Complete Request and Response Documentation

The complete API structure is documented in:

- **Sample request file**: `docs/api-requests/entu task responses.http`
- **Sample JSON structure**: `.copilot-workspace/model/vastus.sample.json`
- **Task structure**: `.copilot-workspace/model/ulesanne.sample.json`

### API Query for User Responses

```http
GET {{api_hostname}}/{{account}}/entity/?_type.string=vastus&_parent.reference={{sample_task_id}}&_owner.reference={{student_id}}
```

**Parameters:**

- `_type.string=vastus` - Filter for response entities
- `_parent.reference={{sample_task_id}}` - Responses for specific task
- `_owner.reference={{student_id}}` - Responses by specific user

### Response Structure Analysis

The API returns an array of response entities with the following key fields for scoring:

```json
{
  "entities": [
    {
      "_id": "68c7331a85a9d472cca35ce9",
      "_type": [{ "string": "vastus" }],
      "_parent": [
        {
          "reference": "68bab85d43e4daafab199988",
          "string": "proovikas",
          "entity_type": "ulesanne"
        }
      ],
      "_owner": [
        {
          "reference": "66b6245c7efc9ac06a437b97",
          "string": "Mihkel Putrinš",
          "entity_type": "person"
        }
      ],
      "asukoht": [
        {
          "reference": "688260755d95233e69c2a5e3",
          "string": "AEGNA RAUDTEE",
          "entity_type": "asukoht"
        }
      ],
      "geopunkt": [
        {
          "string": "24.45,64.56"
        }
      ],
      "kirjeldus": [
        {
          "string": "näidis kirjeldus"
        }
      ]
    }
  ],
  "count": 9,
  "pipelineCount": 9
}
```

## Task Entity Structure

From `ulesanne.sample.json`, the task entity provides the total expected responses:

```json
{
  "entity": {
    "_id": "68bab85d43e4daafab199988",
    "name": [{"string": "proovikas"}],
    "kaart": [
      {
        "reference": "68823f8b5d95233e69c29a07",
        "string": "Peeter Suure Merekindlus",
        "entity_type": "kaart"
      }
    ],
    "vastuseid": [
      {
        "_id": "68bae03f43e4daafab199a48",
        "number": 25
      }
    ]
  }
}
```

### Key Fields for Scoring

1. **Location Reference**: `asukoht[].reference` - Unique location identifier
2. **Task Reference**: `_parent[].reference` - Parent task ID  
3. **User Reference**: `_owner[].reference` - Response owner
4. **Geographic Point**: `geopunkt[].string` - Coordinate data
5. **Total Expected**: `ulesanne.vastuseid[].number` - Total responses needed (e.g., 25)
6. **Response Count**: `count` field in response body

## Implementation Requirements

### Data Sources

1. **User Responses**: Query responses (`vastus` entities) where user is the owner
2. **Location Extraction**: Extract unique `asukoht` references from user responses
3. **Task Total**: From `ulesanne.vastuseid[].number` property (e.g., 25)
4. **User ID**: Available from authentication system (Vue composables/localStorage)
5. **Map Locations**: Already loaded and linked to task map

### API Queries Needed

1. **Count Unique Response Locations**:
   - Query: Get all `vastus` entities for current user and task
   - Extract: Unique `asukoht.reference` values
   - Count: Total unique location references

2. **Get Task Total**:
   - Source: Task entity `vastuseid[].number` property
   - Value: Expected response count (e.g., 25)
   - Already available in current task data

### UI Display

- Format: "X of Y" progress indicator (e.g., "3 of 25")
- Location: Task interface (likely in TaskDetailPanel or TaskMapCard)
- Update: **Immediate** after response submission (optimistic updates)
- Data: No refetch needed - update from successful submission response

### Map Integration

The response data provides critical information for map marker visualization:

1. **Visited Locations (Green Markers)**:
   - Locations where user has submitted responses
   - Identified by matching `asukoht.reference` values in user responses
   - Visual indicator: Green markers on InteractiveMap component

2. **Unvisited Locations (Red Markers)**:
   - Task locations where user has not yet submitted responses
   - Default marker color for locations without user responses
   - Visual indicator: Red markers on InteractiveMap component

3. **Dynamic Marker Updates**:
   - Markers change from red to green after successful response submission
   - Real-time visual feedback of progress
   - Integrates with existing InteractiveMap marker system

## Technical Notes

- Response entities link to locations via `asukoht` property
- Geographic coordinates available in `geopunkt` field
- Parent task reference available in `_parent` property
- User ownership tracked via `_owner` property
- **Location Visit Status**: `asukoht.reference` values in user responses identify visited locations for green marker display
- **Progress Tracking**: Unique location count from responses provides real-time progress metrics

## Status

- [x] ✅ Define API query for counting unique user response locations
- [x] ✅ Identify task property for total expected responses (`vastuseid[].number`)
- [ ] Implement scoring calculation logic
- [ ] Add UI progress indicator
- [ ] Implement visited location detection for green markers
- [ ] Test with sample data

## Ready to Implement

All key questions answered:

1. ✅ **Y value**: `ulesanne.vastuseid[].number` (e.g., 25)
2. ✅ **Task structure**: Available in `ulesanne.sample.json`
3. ✅ **Locations**: Already loaded via task's map
4. ✅ **User ID**: Available from Vue authentication system
5. ✅ **Updates**: Immediate/optimistic updates after submission
