/**
 * Client-side Entu API utilities
 * These functions call Entu API directly from the browser using user's JWT token
 */

const ENTU_API_URL = 'https://entu.app/api/esmuuseum'

/**
 * Update user's forename and surname
 * Must be called from client-side with user's JWT token
 */
export async function updateUserName(
  userId: string,
  forename: string,
  surname: string,
  token: string
): Promise<void> {
  const updatePayload = [
    { type: 'forename', string: forename },
    { type: 'surname', string: surname }
  ]

  const response = await fetch(`${ENTU_API_URL}/entity/${userId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updatePayload)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to update name: ${response.status} ${response.statusText} - ${errorText}`)
  }
}

/**
 * Join a group by adding _parent reference to user's entity
 * Must be called from client-side with user's JWT token
 */
export async function joinGroup(
  userId: string,
  groupId: string,
  token: string
): Promise<void> {
  const updatePayload = [
    { type: '_parent', reference: groupId }
  ]

  const response = await fetch(`${ENTU_API_URL}/entity/${userId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updatePayload)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to join group: ${response.status} ${response.statusText} - ${errorText}`)
  }
}
