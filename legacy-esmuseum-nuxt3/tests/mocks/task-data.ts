/**
 * Mock task (ulesanne) data for testing based on real sample data
 */

// Base types for Entu entity structure
interface EntuProperty {
  _id: string
  reference?: string
  property_type?: string
  string?: string
  entity_type?: string
  number?: number
  datetime?: string
}

interface TaskEntity {
  _id: string
  _parent: EntuProperty[]
  _sharing: EntuProperty[]
  _type: EntuProperty[]
  _owner?: EntuProperty[]
  _created?: EntuProperty[]
  name: EntuProperty[]
  kaart: EntuProperty[]
  grupp: EntuProperty[]
  vastuseid: EntuProperty[]
  kirjeldus?: EntuProperty[]
  tahtaeg?: EntuProperty[]
}

// Mock task entities based on real sample structure
export const mockTasks: Record<string, TaskEntity> = {
  // Task from the sample data
  '68bab85d43e4daafab199988': {
    _id: '68bab85d43e4daafab199988',
    _parent: [
      {
        _id: '68bab85d43e4daafab19998b',
        reference: '68691eb91749f351b9c82f68',
        property_type: '_parent',
        string: 'Ülesanded',
        entity_type: 'folder'
      }
    ],
    _sharing: [
      {
        _id: '68baf58243e4daafab199a64',
        string: 'domain'
      }
    ],
    _type: [
      {
        _id: '68bab85d43e4daafab19998a',
        reference: '686917231749f351b9c82f4c',
        property_type: '_type',
        string: 'ulesanne',
        entity_type: 'entity'
      }
    ],
    name: [
      {
        _id: '68bab85d43e4daafab199989',
        string: 'proovikas'
      }
    ],
    kaart: [
      {
        _id: '68bab8d343e4daafab199990',
        reference: '68823f8b5d95233e69c29a07',
        property_type: 'kaart',
        string: 'Peeter Suure Merekindlus',
        entity_type: 'kaart'
      }
    ],
    grupp: [
      {
        _id: '68bab90f43e4daafab199992',
        reference: '686a6c011749f351b9c83124',
        property_type: 'grupp',
        string: 'esimene klass',
        entity_type: 'grupp'
      }
    ],
    vastuseid: [
      {
        _id: '68bae03f43e4daafab199a48',
        number: 25
      }
    ]
  },

  // Additional test task with description and deadline
  '68bab85d43e4daafab199999': {
    _id: '68bab85d43e4daafab199999',
    _parent: [
      {
        _id: '68bab85d43e4daafab19999b',
        reference: '68691eb91749f351b9c82f68',
        property_type: '_parent',
        string: 'Ülesanded',
        entity_type: 'folder'
      }
    ],
    _sharing: [
      {
        _id: '68baf58243e4daafab19999c',
        string: 'domain'
      }
    ],
    _type: [
      {
        _id: '68bab85d43e4daafab19999a',
        reference: '686917231749f351b9c82f4c',
        property_type: '_type',
        string: 'ulesanne',
        entity_type: 'entity'
      }
    ],
    _owner: [
      {
        _id: '68bab85d43e4daafab19999d',
        reference: '66b6245c7efc9ac06a437b97',
        property_type: '_owner',
        string: 'Test Teacher',
        entity_type: 'person'
      }
    ],
    _created: [
      {
        _id: '68bab85d43e4daafab19999e',
        reference: '66b6245c7efc9ac06a437b97',
        datetime: '2025-09-01T10:00:00.000Z',
        property_type: '_created',
        string: 'Test Teacher',
        entity_type: 'person'
      }
    ],
    name: [
      {
        _id: '68bab85d43e4daafab199990',
        string: 'Hiiumaa Ajaloo Uurimine'
      }
    ],
    kirjeldus: [
      {
        _id: '68bab85d43e4daafab199991',
        string: 'Uurige Hiiumaa ajaloolisi kohti ja leidke vastused küsimustele kaardilt.'
      }
    ],
    tahtaeg: [
      {
        _id: '68bab85d43e4daafab199992',
        datetime: '2025-09-15T23:59:59.999Z'
      }
    ],
    kaart: [
      {
        _id: '68bab85d43e4daafab199993',
        reference: '6889db9a5d95233e69c2b48c',
        property_type: 'kaart',
        string: 'Militaarse Hiiumaa Teejuht',
        entity_type: 'kaart'
      }
    ],
    grupp: [
      {
        _id: '68bab85d43e4daafab199994',
        reference: '686a6c011749f351b9c83125',
        property_type: 'grupp',
        string: 'teine klass',
        entity_type: 'grupp'
      }
    ],
    vastuseid: [
      {
        _id: '68bab85d43e4daafab199995',
        number: 10
      }
    ]
  },

  // Test task for expired deadline
  '68bab85d43e4daafab199997': {
    _id: '68bab85d43e4daafab199997',
    _parent: [
      {
        _id: '68bab85d43e4daafab199998',
        reference: '68691eb91749f351b9c82f68',
        property_type: '_parent',
        string: 'Ülesanded',
        entity_type: 'folder'
      }
    ],
    _sharing: [
      {
        _id: '68baf58243e4daafab199996',
        string: 'domain'
      }
    ],
    _type: [
      {
        _id: '68bab85d43e4daafab199995',
        reference: '686917231749f351b9c82f4c',
        property_type: '_type',
        string: 'ulesanne',
        entity_type: 'entity'
      }
    ],
    name: [
      {
        _id: '68bab85d43e4daafab199993',
        string: 'Aegunud Ülesanne'
      }
    ],
    tahtaeg: [
      {
        _id: '68bab85d43e4daafab199994',
        datetime: '2025-08-01T23:59:59.999Z'
      }
    ],
    kaart: [
      {
        _id: '68bab85d43e4daafab199991',
        reference: '68823f8b5d95233e69c29a07',
        property_type: 'kaart',
        string: 'Peeter Suure Merekindlus',
        entity_type: 'kaart'
      }
    ],
    grupp: [
      {
        _id: '68bab85d43e4daafab199992',
        reference: '686a6c011749f351b9c83124',
        property_type: 'grupp',
        string: 'esimene klass',
        entity_type: 'grupp'
      }
    ],
    vastuseid: [
      {
        _id: '68bab85d43e4daafab199990',
        number: 5
      }
    ]
  }
}

// Mock search results
export const mockTaskSearchResults = {
  all: {
    entities: Object.values(mockTasks)
  },

  byType: {
    entities: Object.values(mockTasks).filter((task) =>
      task._type.some((type) => type.string === 'ulesanne')
    )
  },

  byGroup: {
    entities: Object.values(mockTasks).filter((task) =>
      task.grupp.some((group) => group.string === 'esimene klass')
    )
  },

  empty: {
    entities: []
  }
}

// Helper functions for creating mock data
export const createMockTaskId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export const createMockTask = (overrides: Partial<TaskEntity> = {}): TaskEntity => {
  const id = createMockTaskId()

  return {
    _id: id,
    _parent: [
      {
        _id: createMockTaskId(),
        reference: '68691eb91749f351b9c82f68',
        property_type: '_parent',
        string: 'Ülesanded',
        entity_type: 'folder'
      }
    ],
    _sharing: [
      {
        _id: createMockTaskId(),
        string: 'domain'
      }
    ],
    _type: [
      {
        _id: createMockTaskId(),
        reference: '686917231749f351b9c82f4c',
        property_type: '_type',
        string: 'ulesanne',
        entity_type: 'entity'
      }
    ],
    name: [
      {
        _id: createMockTaskId(),
        string: 'Test Task ' + Math.floor(Math.random() * 100)
      }
    ],
    kaart: [
      {
        _id: createMockTaskId(),
        reference: '68823f8b5d95233e69c29a07',
        property_type: 'kaart',
        string: 'Test Map',
        entity_type: 'kaart'
      }
    ],
    grupp: [
      {
        _id: createMockTaskId(),
        reference: '686a6c011749f351b9c83124',
        property_type: 'grupp',
        string: 'test klass',
        entity_type: 'grupp'
      }
    ],
    vastuseid: [
      {
        _id: createMockTaskId(),
        number: Math.floor(Math.random() * 50) + 1
      }
    ],
    ...overrides
  }
}
