// Fetch Entu data model: all entity types and their properties (including references)
// Outputs YAML (machine) and Markdown (human) to docs/model/

import fs from 'fs'
import path from 'path'
import https from 'https'
import yaml from 'js-yaml'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const HOST = process.env.ENTU_HOST || 'entu.app'
const ACCOUNT = process.env.ENTU_ACCOUNT || 'esmuuseum'
const ESM_KEY = process.env.ESM_KEY

if (!ESM_KEY) {
  console.error('ESM_KEY environment variable is required.')
  process.exit(1)
}

const apiBase = `https://${HOST}/api/${ACCOUNT}`

function apiGet (endpoint, token) {
  return new Promise((resolve, reject) => {
    const url = `${apiBase}${endpoint}`
    console.log(`API: ${endpoint}`)
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept-Encoding': 'deflate'
      }
    }
    https.get(url, options, (res) => {
      let data = ''
      res.on('data', (chunk) => data += chunk)
      res.on('end', () => {
        console.log(`${res.statusCode} (${data.length} bytes)`)
        if (res.statusCode >= 400) {
          console.error(`❌ HTTP Error ${res.statusCode}:`, data.substring(0, 500))
          reject(new Error(`HTTP ${res.statusCode}: ${data}`))
        }
        else {
          try {
            const parsed = JSON.parse(data)
            if (parsed.entities) {
              console.log(`Found ${parsed.entities.length} entities`)
            }
            resolve(parsed)
          }
          catch (e) {
            reject(e)
          }
        }
      })
    }).on('error', reject)
  })
}

// Function to get all entities with pagination
async function getAllEntities (endpoint, token) {
  const allEntities = []
  let skip = 0
  const limit = 100 // Entu's default limit

  console.log(`Paginating ${endpoint}...`)

  while (true) {
    const paginatedEndpoint = `${endpoint}&skip=${skip}&limit=${limit}`
    const response = await apiGet(paginatedEndpoint, token)

    if (!response.entities || response.entities.length === 0) {
      break // No more entities
    }

    allEntities.push(...response.entities)

    // If we got fewer entities than the limit, we've reached the end
    if (response.entities.length < limit) {
      break
    }

    skip += limit
  }

  console.log(`Total entities collected: ${allEntities.length}`)
  return { entities: allEntities }
}

async function getToken () {
  // Authenticate to get a token
  const url = `https://${HOST}/api/auth?account=${ACCOUNT}`
  console.log(`Auth: ${ACCOUNT}`)
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        Authorization: `Bearer ${ESM_KEY}`,
        'Accept-Encoding': 'deflate'
      }
    }
    https.get(url, options, (res) => {
      let data = ''
      res.on('data', (chunk) => data += chunk)
      res.on('end', () => {
        if (res.statusCode >= 400) {
          console.error(`❌ Auth failed:`, data.substring(0, 200))
          reject(new Error(`Auth HTTP ${res.statusCode}: ${data}`))
        }
        else {
          try {
            const parsed = JSON.parse(data)
            if (parsed.token) {
              resolve(parsed.token)
            }
            else {
              reject(new Error('No token in auth response'))
            }
          }
          catch (e) {
            reject(e)
          }
        }
      })
    }).on('error', reject)
  })
}

async function fetchModel () {
  const token = await getToken()

  // Fetch entity type definitions
  const typesResp = await apiGet('/entity?_type.string=entity', token)

  // Fetch property definitions with pagination
  const propertiesResp = await getAllEntities('/entity?_type.string=property', token)

  // Save intermediate API responses for inspection
  fs.writeFileSync(
    path.join(__dirname, '../docs/model/raw-entity-definitions.json'),
    JSON.stringify(typesResp, null, 2),
    'utf8'
  )
  fs.writeFileSync(
    path.join(__dirname, '../docs/model/raw-property-definitions.json'),
    JSON.stringify(propertiesResp, null, 2),
    'utf8'
  )

  const types = typesResp.entities || []
  const properties = propertiesResp.entities || []
  const model = {}

  // First, build a map of properties by their parent entity type
  const propertiesByType = {}
  for (const propEntity of properties) {
    // Find the parent entity type reference
    const parentRef = propEntity._parent?.find((p) => p.entity_type === 'entity')
    if (parentRef && parentRef.reference) {
      const parentId = parentRef.reference
      if (!propertiesByType[parentId]) {
        propertiesByType[parentId] = []
      }
      propertiesByType[parentId].push(propEntity)
    }
  }

  for (const typeEntity of types) {
    let typeName = typeEntity.properties?.name?.[0]?.value
    if (!typeName && typeEntity.name?.[0]?.string) {
      typeName = typeEntity.name[0].string
    }
    if (!typeName) continue

    // Start with entity type metadata properties
    const metadataProperties = Object.entries(typeEntity)
      .filter(([key, values]) => Array.isArray(values) && !key.startsWith('_'))
      .map(([propName, arr]) => {
        // Initialize property descriptor with simplified structure
        const descriptor = {
          name: propName,
          source: 'metadata'
        }

        // Determine property type first
        let type = 'unknown'
        for (const meta of arr) {
          if (!meta._id) continue

          if ('string' in meta) type = 'string'
          else if ('boolean' in meta) type = 'boolean'
          else if ('number' in meta) type = 'number'
          else if ('datetime' in meta) type = 'datetime'
          else if ('reference' in meta) type = 'reference'
          else if ('formula' in meta) type = 'formula'
          else if ('file' in meta) type = 'file'
          break
        }
        descriptor.type = type

        // For multilingual properties, prioritize Estonian
        if (propName === 'label' || propName === 'label_plural') {
          // Try to find Estonian value first
          const etValue = arr.find((item) => item.language === 'et' && item.string !== undefined)
          if (etValue) {
            descriptor.value = etValue.string
          }
          else {
            // Fallback to any available value
            const anyValue = arr.find((item) => item.string !== undefined)
            if (anyValue) {
              descriptor.value = anyValue.string
            }
          }
        }
        // For references
        else if (type === 'reference' || arr.some((item) => item.reference)) {
          const refItem = arr.find((item) => item.reference)
          if (refItem) {
            descriptor.reference = refItem.reference
            descriptor.value = refItem.string || ''
            descriptor.type = 'reference'
            if (refItem.entity_type) {
              descriptor.entity_type = refItem.entity_type
            }
          }
        }
        // For regular values
        else {
          const valueItem = arr.find((item) =>
            item.string !== undefined
            || item.boolean !== undefined
            || item.number !== undefined
            || item.datetime !== undefined
            || item.formula !== undefined
            || item.file !== undefined
          )

          if (valueItem) {
            if (valueItem.string !== undefined) descriptor.value = valueItem.string
            else if (valueItem.boolean !== undefined) descriptor.value = valueItem.boolean
            else if (valueItem.number !== undefined) descriptor.value = valueItem.number
            else if (valueItem.datetime !== undefined) descriptor.value = valueItem.datetime
            else if (valueItem.formula !== undefined) descriptor.value = valueItem.formula
            else if (valueItem.file !== undefined) descriptor.value = valueItem.file
          }
        }

        return descriptor
      })

    // Add data properties for this entity type
    const entityId = typeEntity._id
    const dataProperties = propertiesByType[entityId] || []
    const processedDataProperties = dataProperties.map((propEntity) => {
      const propName = propEntity.name?.[0]?.string || 'unnamed'
      return {
        name: propName,
        source: 'property',
        type: propEntity.datatype?.[0]?.string || 'string',
        multilingual: propEntity.multilingual?.[0]?.boolean || false,
        mandatory: propEntity.mandatory?.[0]?.boolean || false,
        readonly: propEntity.readonly?.[0]?.boolean || false,
        ordinal: propEntity.ordinal?.[0]?.number || 0,
        label: propEntity.label?.find((l) => l.language === 'et')?.string
          || propEntity.label?.[0]?.string
          || propName
      }
    })

    // Combine metadata and data properties
    model[typeName] = [...metadataProperties, ...processedDataProperties]

    console.log(`Extracted ${metadataProperties.length} metadata + ${processedDataProperties.length} data properties for type ${typeName}`)
  }
  return model
}

function toMarkdown (model) {
  let md = '# Entu Data Model\n\n'
  md += 'This document contains the Entu data model for the ESMuseum application.\n\n'

  // Create a table of contents
  md += '## Table of Contents\n\n'
  for (const type of Object.keys(model).sort()) {
    md += `- [${type}](#${type})\n`
  }
  md += '\n'

  // Process each entity type
  for (const [type, props] of Object.entries(model).sort()) {
    md += `## ${type}\n\n`

    if (!props.length) {
      md += '_No properties found_\n\n'
      continue
    }

    // Get entity labels if available
    const labelProp = props.find((p) => p.name === 'label')
    const labelPluralProp = props.find((p) => p.name === 'label_plural')

    if (labelProp || labelPluralProp) {
      md += '**Labels:**\n\n'

      if (labelProp && labelProp.value) {
        md += `- Singular: "${labelProp.value}"\n`
      }

      if (labelPluralProp && labelPluralProp.value) {
        md += `- Plural: "${labelPluralProp.value}"\n`
      }
      md += '\n'
    }

    // Properties table
    md += '### Properties\n\n'
    md += '| Property | Type | Value | References |\n|---|---|---|---|\n'

    for (const p of props.filter((p) => p.name !== 'label' && p.name !== 'label_plural')) {
      // Format references
      let references = ''
      if (p.type === 'reference' && p.entity_type) {
        references = `${p.entity_type} (ID: ${p.reference})`
      }

      // Format value
      let value = p.value !== undefined ? String(p.value) : ''
      if (value.length > 50) {
        value = value.substring(0, 47) + '...'
      }

      md += `| ${p.name} | ${p.type || 'unknown'} | ${value} | ${references} |\n`
    }

    // Add detailed reference information if available
    const referencingProps = props.filter((p) => p.type === 'reference')
    if (referencingProps.length > 0) {
      md += '\n### References\n\n'
      for (const p of referencingProps) {
        md += `- **${p.name}** references the **${p.entity_type || 'unknown'}** entity type`
        if (p.value) {
          md += ` with value "${p.value}"`
        }
        md += ` (ID: ${p.reference})\n`
      }
    }

    md += '\n'
  }

  return md
}

console.log('Starting to fetch Entu data model...')

// Main
try {
  fetchModel()
    .then((model) => {
      console.log('Model fetched successfully, saving outputs...')
      const outDir = path.join(__dirname, '../docs/model')
      fs.writeFileSync(path.join(outDir, 'model.yaml'), yaml.dump(model), 'utf8')
      fs.writeFileSync(path.join(outDir, 'model.md'), toMarkdown(model), 'utf8')
      console.log('Entu data model updated')
    })
    .catch((err) => {
      console.error('Failed in promise chain:', err)
      process.exit(1)
    })
}
catch (err) {
  console.error('Failed outside promise chain:', err)
  process.exit(1)
}
