/**
 * Mock JWT tokens for testing authentication flows
 */

export const createMockJWT = (payload: any): string => {
  // Create a properly formatted JWT structure for testing
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  const signature = 'mock-signature-for-testing'

  return `${header}.${body}.${signature}`
}

export const mockTokens = {
  valid: createMockJWT({
    user: {
      email: 'test@student.ee',
      name: 'Test Student',
      displayname: 'Test Student'
    },
    accounts: {
      esmuuseum: '507f1f77bcf86cd799439011'
    },
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
  }),

  expired: createMockJWT({
    user: {
      email: 'expired@student.ee',
      name: 'Expired Student'
    },
    accounts: {
      esmuuseum: '507f1f77bcf86cd799439012'
    },
    iat: Math.floor(Date.now() / 1000) - 7200, // 2 hours ago
    exp: Math.floor(Date.now() / 1000) - 3600 // Expired 1 hour ago
  }),

  malformed: 'not.a.valid.jwt.token.at.all',

  invalidSignature: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImVtYWlsIjoidGVzdEBzdHVkZW50LmVlIn19.invalid-signature',

  noUser: createMockJWT({
    // Missing user data
    accounts: {
      esmuuseum: '507f1f77bcf86cd799439013'
    },
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600
  }),

  noAccounts: createMockJWT({
    user: {
      email: 'noaccounts@student.ee',
      name: 'No Accounts Student'
    },
    // Missing accounts
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600
  })
}

/**
 * Mock user data for testing
 */
export const mockUsers = {
  student: {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@student.ee',
    name: 'Test Student',
    displayname: 'Test Student'
  },

  expiredStudent: {
    _id: '507f1f77bcf86cd799439012',
    email: 'expired@student.ee',
    name: 'Expired Student'
  },

  teacher: {
    _id: '507f1f77bcf86cd799439020',
    email: 'teacher@school.ee',
    name: 'Test Teacher',
    role: 'teacher'
  }
}

/**
 * Mock auth responses from Entu API
 */
export const mockAuthResponses = {
  validAuth: {
    token: mockTokens.valid,
    user: mockUsers.student,
    accounts: [{
      user: { _id: mockUsers.student._id }
    }]
  },

  invalidAuth: {
    error: 'Invalid credentials'
  }
}
