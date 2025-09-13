
console.log('=== ENTU AUTH RESPONSE ===')
try {
  const authResponse = entu.getAuthResponse()
  console.log('Complete auth response:', authResponse)
  console.log('Auth response keys:', Object.keys(authResponse || {}))
  if (authResponse) {
    console.log('User info:', authResponse.user)
    console.log('Token info:', authResponse.token ? 'Token present' : 'No token')
  }
} catch (error) {
  console.error('Error getting auth response:', error)
}
console.log('=== END AUTH RESPONSE ===')

