/**
 * Mock task data for testing
 * Based on the ulesanne entity structure from model.json and live sample data
 */

// Property types matching Entu format
interface EntuProperty {
  _id: string
  string?: string
  reference?: string
  property_type?: string
  entity_type?: string
  datetime?: string
  number?: number
  boolean?: boolean
  language?: string
  filename?: string
  filesize?: number
  filetype?: string
  inherited?: boolean
}

// Base entity structure matching Entu format
export interface BaseEntity {
  _id: string
  _type: Array<EntuProperty>
  _created: Array<EntuProperty>
  _owner: Array<EntuProperty>
  _parent?: Array<EntuProperty>
  _sharing?: Array<EntuProperty>
  _inheritrights?: Array<EntuProperty>
}

export interface TaskEntity extends BaseEntity {
  name: Array<EntuProperty>
  kirjeldus?: Array<EntuProperty>
  tahtaeg?: Array<EntuProperty>
  kaart?: Array<EntuProperty>
  grupp?: Array<EntuProperty>
  vastuseid?: Array<EntuProperty>
}

export interface MapEntity extends BaseEntity {
  name: Array<EntuProperty>
  kirjeldus?: Array<EntuProperty>
}

export interface GroupEntity extends BaseEntity {
  name: Array<EntuProperty>
  kirjeldus?: Array<EntuProperty>
  grupijuht?: Array<EntuProperty>
}

export interface PersonEntity extends BaseEntity {
  name?: Array<EntuProperty>
  forename?: Array<EntuProperty>
  surname?: Array<EntuProperty>
  email?: Array<EntuProperty>
  entu_user?: Array<EntuProperty>
  idcode?: Array<EntuProperty>
  photo?: Array<EntuProperty>
}

// Mock map entities
export const mockMaps: MapEntity[] = [
  {
    _id: 'map_001',
    _type: [{ _id: 'type_001', string: 'kaart', entity_type: 'entity' }],
    name: [{ _id: 'name_001', string: 'Estonia Museum Map' }],
    kirjeldus: [{ _id: 'desc_001', string: 'Main museum map with all locations' }],
    _created: [{ _id: 'created_001', datetime: '2024-01-15T10:00:00.000Z' }],
    _owner: [{ _id: 'owner_001', reference: 'user_001', string: 'Test User' }]
  },
  {
    _id: 'map_002',
    _type: [{ _id: 'type_002', string: 'kaart', entity_type: 'entity' }],
    name: [{ _id: 'name_002', string: 'Interactive Historical Map' }],
    kirjeldus: [{ _id: 'desc_002', string: 'Historical locations and events map' }],
    _created: [{ _id: 'created_002', datetime: '2024-01-20T14:30:00.000Z' }],
    _owner: [{ _id: 'owner_002', reference: 'user_001', string: 'Test User' }]
  }
]

// Mock group entities
export const mockGroups: GroupEntity[] = [
  // Real sample group from grupp.sample.json
  {
    _id: '686a6c011749f351b9c83124',
    _type: [{
      _id: '686a6c011749f351b9c83127',
      reference: '686914521749f351b9c82f35',
      property_type: '_type',
      string: 'grupp',
      entity_type: 'entity'
    }],
    name: [{ _id: '686a6c011749f351b9c83125', string: 'esimene klass' }],
    kirjeldus: [{ _id: '686a6c041749f351b9c8312c', string: 'proovigrupp', language: 'en' }],
    grupijuht: [{
      _id: '686a6c151749f351b9c8312d',
      reference: '66b6245c7efc9ac06a437b97',
      property_type: 'grupijuht',
      string: 'Mihkel Putrinš',
      entity_type: 'person'
    }],
    _parent: [{
      _id: '686a6c011749f351b9c83126',
      reference: '66b6245c7efc9ac06a437ba0',
      property_type: '_parent',
      string: 'esmuuseum',
      entity_type: 'database'
    }],
    _sharing: [{ _id: '686a6c011749f351b9c83128', string: 'domain' }],
    _inheritrights: [{ _id: '686a6c011749f351b9c83129', boolean: true }],
    _created: [{
      _id: '686a6c011749f351b9c8312b',
      reference: '66b6245c7efc9ac06a437ba0',
      datetime: '2025-07-06T12:28:49.299Z',
      property_type: '_created',
      string: 'esmuuseum',
      entity_type: 'database'
    }],
    _owner: [{
      _id: '686a6c011749f351b9c8312a',
      reference: '66b6245c7efc9ac06a437ba0',
      property_type: '_owner',
      string: 'esmuuseum',
      entity_type: 'database'
    }]
  },
  {
    _id: 'group_002',
    _type: [{ _id: 'type_004', string: 'grupp', entity_type: 'entity' }],
    name: [{ _id: 'name_004', string: 'School Groups' }],
    kirjeldus: [{ _id: 'desc_004', string: 'Educational tasks for school visits' }],
    _created: [{ _id: 'created_004', datetime: '2024-01-12T11:15:00.000Z' }],
    _owner: [{ _id: 'owner_004', reference: 'user_001', string: 'Test User' }]
  },
  {
    _id: 'group_003',
    _type: [{ _id: 'type_005', string: 'grupp', entity_type: 'entity' }],
    name: [{ _id: 'name_005', string: 'Research Team' }],
    kirjeldus: [{ _id: 'desc_005', string: 'Advanced research tasks for specialists' }],
    _created: [{ _id: 'created_005', datetime: '2024-01-08T16:45:00.000Z' }],
    _owner: [{ _id: 'owner_005', reference: 'user_002', string: 'Admin User' }]
  }
]

// Mock person entities based on real sample data
export const mockPersons: PersonEntity[] = [
  // Real sample person from person.sample.json
  {
    _id: '66b6245c7efc9ac06a437b97',
    _type: [{
      _id: '66b6245c7efc9ac06a437b98',
      reference: '66b6245a7efc9ac06a437920',
      property_type: '_type',
      string: 'person',
      entity_type: 'entity'
    }],
    name: [{ _id: 'name_person_001', string: 'Mihkel Putrinš' }],
    forename: [{ _id: '66b6245c7efc9ac06a437b9c', string: 'Mihkel' }],
    surname: [{ _id: '66b6245c7efc9ac06a437b9d', string: 'Putrinš' }],
    email: [{ _id: '66b6245c7efc9ac06a437b9b', string: 'mihkel.putrinsh@gmail.com' }],
    entu_user: [{ _id: '66b6245c7efc9ac06a437b9a', string: 'mihkel.putrinsh@gmail.com' }],
    idcode: [{ _id: '66d97142f2daf46b3145405c', string: '37204030303' }],
    photo: [{
      _id: '686a692e1749f351b9c830e4',
      filename: 'michelek.webp',
      filesize: 436144,
      filetype: 'image/webp'
    }],
    _sharing: [
      { _id: '66b6245c7efc9ac06a437b99', string: 'private' },
      { _id: '66b6245c7efc9ac06a437bc3', string: 'domain' },
      { _id: '68bab95443e4daafab199994', string: 'domain' }
    ],
    _parent: [
      {
        _id: '66b6245c7efc9ac06a437bbb',
        reference: '66b6245c7efc9ac06a437ba0',
        property_type: '_parent',
        string: 'esmuuseum',
        entity_type: 'database'
      },
      {
        _id: '68bab95443e4daafab199993',
        reference: '686a6c011749f351b9c83124',
        property_type: '_parent',
        string: 'esimene klass',
        entity_type: 'grupp'
      }
    ],
    _inheritrights: [
      { _id: '66b6245c7efc9ac06a437bca', boolean: true },
      { _id: '68bab95443e4daafab199995', boolean: true }
    ],
    _created: [{ _id: '66b6245c7efc9ac06a437b9e', datetime: '2024-08-09T14:14:52.460Z' }],
    _owner: [
      {
        _id: '66b6245c7efc9ac06a437b9f',
        reference: '66b6245c7efc9ac06a437b97',
        property_type: '_owner',
        string: 'Mihkel Putrinš',
        entity_type: 'person'
      },
      {
        _id: '67f6c8b188beda22567ed94d',
        reference: '66b6245c7efc9ac06a437ba0',
        property_type: '_owner',
        string: 'esmuuseum',
        entity_type: 'database'
      }
    ]
  }
]

// Mock task entities based on real sample data
export const mockTasks: TaskEntity[] = [
  // Real sample task from ulesanne.sample.json
  {
    _id: '68bab85d43e4daafab199988',
    _type: [{
      _id: '68bab85d43e4daafab19998a',
      string: 'ulesanne',
      entity_type: 'entity'
    }],
    name: [{ _id: '68bab85d43e4daafab199989', string: 'proovikas' }],
    kaart: [{
      _id: '68bab8d343e4daafab199990',
      reference: '68823f8b5d95233e69c29a07',
      string: 'Peeter Suure Merekindlus',
      entity_type: 'kaart'
    }],
    grupp: [{
      _id: '68bab90f43e4daafab199992',
      reference: '686a6c011749f351b9c83124',
      string: 'esimene klass',
      entity_type: 'grupp'
    }],
    vastuseid: [{ _id: '68bae03f43e4daafab199a48', number: 25 }],
    _created: [{ _id: 'created_001', datetime: '2025-07-30T08:45:14.745Z' }],
    _owner: [{ _id: 'owner_001', reference: '66b6245c7efc9ac06a437b97', string: 'Mihkel Putrinš' }]
  },
  {
    _id: 'task_002',
    _type: [{ _id: 'type_007', string: 'ulesanne', entity_type: 'entity' }],
    name: [{ _id: 'name_007', string: 'Estonian Independence Timeline' }],
    kirjeldus: [{
      _id: 'desc_007',
      string: 'Create a timeline of Estonian independence events using historical locations on the map. Research and document key dates and places.'
    }],
    tahtaeg: [{ _id: 'deadline_002', datetime: '2024-11-18T18:00:00.000Z' }],
    kaart: [{
      _id: 'map_ref_002',
      reference: 'map_002',
      string: 'Interactive Historical Map',
      entity_type: 'kaart'
    }],
    grupp: [{
      _id: 'group_ref_002',
      reference: 'group_002',
      string: 'School Groups',
      entity_type: 'grupp'
    }],
    vastuseid: [{ _id: 'answers_002', number: 25 }],
    _created: [{ _id: 'created_007', datetime: '2024-01-20T15:30:00.000Z' }],
    _owner: [{ _id: 'owner_007', reference: 'user_001', string: 'Test User' }]
  },
  {
    _id: 'task_003',
    _type: [{ _id: 'type_008', string: 'ulesanne', entity_type: 'entity' }],
    name: [{ _id: 'name_008', string: 'Archaeological Survey Analysis' }],
    kirjeldus: [{
      _id: 'desc_008',
      string: 'Analyze archaeological survey data from recent excavations. Use the map to correlate findings with known historical sites and prepare a detailed report.'
    }],
    tahtaeg: [{ _id: 'deadline_003', datetime: '2024-10-15T17:00:00.000Z' }],
    kaart: [{
      _id: 'map_ref_003',
      reference: 'map_002',
      string: 'Interactive Historical Map',
      entity_type: 'kaart'
    }],
    grupp: [{
      _id: 'group_ref_003',
      reference: 'group_003',
      string: 'Research Team',
      entity_type: 'grupp'
    }],
    vastuseid: [{ _id: 'answers_003', number: 10 }],
    _created: [{ _id: 'created_008', datetime: '2024-01-25T09:15:00.000Z' }],
    _owner: [{ _id: 'owner_008', reference: 'user_002', string: 'Admin User' }]
  },
  {
    _id: 'task_004',
    _type: [{ _id: 'type_009', string: 'ulesanne', entity_type: 'entity' }],
    name: [{ _id: 'name_009', string: 'Museum Orientation Quest' }],
    kirjeldus: [{
      _id: 'desc_009',
      string: 'Complete a basic orientation tour of the museum. Visit key locations marked on the map and answer questions about exhibits.'
    }],
    // No deadline for this task
    kaart: [{
      _id: 'map_ref_004',
      reference: 'map_001',
      string: 'Estonia Museum Map',
      entity_type: 'kaart'
    }],
    grupp: [{
      _id: 'group_ref_004',
      reference: 'group_001',
      string: 'Museum Visitors',
      entity_type: 'grupp'
    }],
    vastuseid: [{ _id: 'answers_004', number: 100 }],
    _created: [{ _id: 'created_009', datetime: '2024-02-01T10:45:00.000Z' }],
    _owner: [{ _id: 'owner_009', reference: 'user_001', string: 'Test User' }]
  },
  {
    _id: 'task_005',
    _type: [{ _id: 'type_010', string: 'ulesanne', entity_type: 'entity' }],
    name: [{ _id: 'name_010', string: 'Cultural Heritage Documentation' }],
    kirjeldus: [{
      _id: 'desc_010',
      string: 'Document and photograph cultural heritage items for the digital archive. Focus on textile and handicraft collections.'
    }],
    tahtaeg: [{ _id: 'deadline_005', datetime: '2024-09-30T16:30:00.000Z' }],
    // No map reference for this task
    grupp: [{
      _id: 'group_ref_005',
      reference: 'group_003',
      string: 'Research Team',
      entity_type: 'grupp'
    }],
    vastuseid: [{ _id: 'answers_005', number: 15 }],
    _created: [{ _id: 'created_010', datetime: '2024-02-10T13:20:00.000Z' }],
    _owner: [{ _id: 'owner_010', reference: 'user_002', string: 'Admin User' }]
  }
]

/**
 * Helper functions for mock data manipulation
 */

export function getTaskById (id: string): TaskEntity | undefined {
  return mockTasks.find((task) => task._id === id)
}

export function getMapById (id: string): MapEntity | undefined {
  return mockMaps.find((map) => map._id === id)
}

export function getGroupById (id: string): GroupEntity | undefined {
  return mockGroups.find((group) => group._id === id)
}

export function getPersonById (id: string): PersonEntity | undefined {
  return mockPersons.find((person) => person._id === id)
}

export function getTasksByGroup (groupId: string): TaskEntity[] {
  return mockTasks.filter((task) =>
    task.grupp?.some((g) => g.reference === groupId)
  )
}

export function getTasksByMap (mapId: string): TaskEntity[] {
  return mockTasks.filter((task) =>
    task.kaart?.some((k) => k.reference === mapId)
  )
}

export function searchTasks (query: Record<string, any>): TaskEntity[] {
  let results = [...mockTasks]

  // Filter by _type if specified
  if (query._type || query['_type.string']) {
    const typeValue = query._type || query['_type.string']
    if (typeValue !== 'ulesanne') {
      results = []
    }
  }

  // Filter by general text search (q parameter)
  if (query.q) {
    const searchQuery = query.q.toLowerCase()
    results = results.filter((task) =>
      task.name.some((n) => n.string?.toLowerCase().includes(searchQuery))
      || (task.kirjeldus && task.kirjeldus.some((k) => k.string?.toLowerCase().includes(searchQuery)))
    )
  }

  // Filter by name if specified
  if (query.name || query['name.string']) {
    const nameQuery = (query.name || query['name.string']).toLowerCase()
    results = results.filter((task) =>
      task.name.some((n) => n.string?.toLowerCase().includes(nameQuery))
    )
  }

  // Filter by group if specified
  if (query.grupp || query['grupp.reference']) {
    const groupRef = query.grupp || query['grupp.reference']
    results = results.filter((task) =>
      task.grupp?.some((g) => g.reference === groupRef)
    )
  }

  // Filter by map if specified
  if (query.kaart || query['kaart.reference']) {
    const mapRef = query.kaart || query['kaart.reference']
    results = results.filter((task) =>
      task.kaart?.some((k) => k.reference === mapRef)
    )
  }

  return results
}

export function createMockTaskSearchResponse (tasks: TaskEntity[], query: Record<string, any>) {
  return {
    entities: tasks,
    count: query.count || tasks.length, // Use total count if provided, otherwise current page count
    limit: query.limit || 1000,
    skip: query.skip || 0
  }
}
