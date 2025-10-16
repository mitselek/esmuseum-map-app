import { defineEventHandler, readBody } from 'h3'
import { createLogger } from '../../utils/logger'
import { callEntuApi, getEntuApiConfig, exchangeApiKeyForToken } from '../../utils/entu'

const logger = createLogger('onboard-set-name')

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { userId, forename, surname } = body || {}

  if (!userId || !forename || !surname) {
    return {
      success: false,
      message: 'Missing required fields: userId, forename, surname'
    }
  }

  try {
    // Get Entu API config
    const config = useRuntimeConfig()
    
    // Exchange API key for JWT token
    const jwtToken = await exchangeApiKeyForToken(config.entuManagerKey as string)
    const apiConfig = getEntuApiConfig(jwtToken)

    // Build Entu API payload to update name fields
    // Entu expects array of property objects for updates
    const updatePayload = [
      { type: 'forename', string: forename },
      { type: 'surname', string: surname }
    ]

    logger.info('Setting name for user', { userId, forename, surname })

    // Call Entu API to update the person entity
    await callEntuApi(`/entity/${userId}`, {
      method: 'POST',
      body: JSON.stringify(updatePayload),
    }, apiConfig)

    logger.info('Successfully set name for user', { userId })

    return {
      success: true
    }
  } catch (error: unknown) {
    logger.error('Failed to set name for user', { error })
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error)
    }
  }
})
