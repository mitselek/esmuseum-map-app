/**
 * Server Endpoint: GET /api/onboard/class-status (spec 033, #61)
 *
 * Tells whether a person is in a class: a grupp under the classes root,
 * which is the grupp entity type's default_parent. Every person also has an
 * all-users grupp parent, so "any grupp parent" is not enough.
 * Server-side because a person cannot always read the groups they are in.
 *
 * @see specs/033-no-class-screen/research.md
 */

import { getEntuApiConfig, getEntuEntity, searchEntuEntities, exchangeApiKeyForToken } from '../../utils/entu'
import { createLogger } from '../../utils/logger'
import { isClassMember } from '../../../utils/class-status'
import type { ClassStatusResponse, EntuParentRef } from '../../../utils/class-status'

const logger = createLogger('onboard-class-status')

interface EntuRefEntity {
  _id: string
  name?: Array<{ string?: string }>
  default_parent?: EntuParentRef[]
  _parent?: EntuParentRef[]
}

const refsOf = (refs: EntuParentRef[] | undefined): string[] =>
  (refs ?? []).map((ref) => ref.reference).filter((id): id is string => !!id)

export default defineEventHandler(async (event): Promise<ClassStatusResponse> => {
  try {
    const config = useRuntimeConfig()
    const query = getQuery(event)

    if (!query.userId || typeof query.userId !== 'string') {
      setResponseStatus(event, 400)
      return { status: 'unknown', error: 'Missing userId' }
    }

    const { userId } = query

    const jwtToken = await exchangeApiKeyForToken(config.entuManagerKey as string)
    const apiConfig = getEntuApiConfig(jwtToken)

    // The classes root: where Entu files a new grupp
    const types = await searchEntuEntities({
      '_type.string': 'entity',
      'name.string': 'grupp',
      props: 'name,default_parent'
    }, apiConfig) as { entities?: EntuRefEntity[] }
    const gruppType = types.entities?.find((type) => type.name?.some((n) => n.string === 'grupp'))
    const classesRoot = refsOf(gruppType?.default_parent)[0]
    if (!classesRoot) {
      throw new Error('grupp type has no default_parent')
    }

    const groups = await searchEntuEntities({
      '_type.string': 'grupp',
      '_parent.reference': classesRoot,
      props: '_parent',
      limit: 1000
    }, apiConfig) as { entities?: EntuRefEntity[] }
    // Filter here as well: the class list must not depend on the search filter alone
    const classIds = new Set((groups.entities ?? [])
      .filter((group) => refsOf(group._parent).includes(classesRoot))
      .map((group) => group._id))

    const person = await getEntuEntity(userId, apiConfig, '_parent') as { entity?: EntuRefEntity }
    if (!person.entity) {
      throw new Error(`person ${userId} not readable`)
    }

    const status = isClassMember(person.entity._parent ?? [], classIds) ? 'in-class' : 'no-class'
    logger.info('Class status', { userId, status, classes: classIds.size })
    return { status }
  }
  catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    logger.error('Error checking class status', { error: errorMessage })

    setResponseStatus(event, 500)
    return { status: 'unknown', error: errorMessage }
  }
})
