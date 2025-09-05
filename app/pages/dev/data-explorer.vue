<script setup>
import { ref, onMounted, computed } from 'vue'
import { useEntuApi } from '~/composables/useEntuApi'

const { getEntityTypes, searchEntities, isLoading, error } = useEntuApi()

const entityTypes = ref([])
const allProperties = ref([])
const dataModel = ref({})
const selectedType = ref(null)
const viewMode = ref('yaml')

const fetchCompleteDataModel = async () => {
  try {
    // Fetch all entity types and all properties in parallel
    const [entityTypesResponse, propertiesResponse] = await Promise.all([
      getEntityTypes(),
      searchEntities({ '_type.string': 'property' })
    ])

    if (entityTypesResponse?.entities) {
      entityTypes.value = entityTypesResponse.entities
    }

    if (propertiesResponse?.entities) {
      allProperties.value = propertiesResponse.entities
    }

    console.log('Fetched entity types:', entityTypes.value)
    console.log('Fetched properties:', allProperties.value)
    // Build the complete data model
    buildDataModel()
  }
  catch (err) {
    console.error('Error fetching complete data model:', err)
  }
}

const getEntityTypeName = (type) => {
  if (type.properties?.name?.[0]?.value) {
    return type.properties.name[0].value
  }
  if (type.name?.[0]?.string) {
    return type.name[0].string
  }
  return null
}

const getPropertyValue = (property, fieldName) => {
  return property.properties?.[fieldName]?.[0]?.value
    || property[fieldName]?.[0]?.string
    || property[fieldName]?.[0]?.value
    || property[fieldName]?.[0]?.boolean
    || property[fieldName]?.[0]?.reference
}

const buildDataModel = () => {
  const model = {}

  // Group properties by their parent entity type
  const propertiesByParent = {}
  allProperties.value.forEach((prop) => {
    const parentId = prop._parent?.[0]?.reference
    if (parentId) {
      if (!propertiesByParent[parentId]) {
        propertiesByParent[parentId] = []
      }
      propertiesByParent[parentId].push(prop)
    }
  })

  // Build the model for each entity type
  entityTypes.value.forEach((entityType) => {
    const typeName = getEntityTypeName(entityType)
    if (!typeName) return

    // Skip system entities
    const isSystemEntity = getPropertyValue(entityType, 'system')
    if (isSystemEntity === true) return

    // Create entity definition with attributes and properties
    const entityDef = {
      attributes: {},
      properties: []
    }

    // Add the entity type's built-in attributes
    const builtInAttributes = ['label', 'label_plural', 'name', 'system', 'add_from', 'plugin']
    builtInAttributes.forEach((attrName) => {
      const value = getPropertyValue(entityType, attrName)
      if (value !== undefined) {
        const attrData = entityType.properties?.[attrName]?.[0] || entityType[attrName]?.[0]

        // Detect attribute type more accurately
        let attrType = 'unknown'
        if (attrData?.string !== undefined) {
          attrType = 'string'
        }
        else if (attrData?.boolean !== undefined) {
          attrType = 'boolean'
        }
        else if (attrData?.reference !== undefined) {
          attrType = 'reference'
        }

        entityDef.attributes[attrName] = {
          value,
          type: attrType
        }

        if (attrData?.reference) {
          entityDef.attributes[attrName].reference = attrData.reference
          if (attrData.entity_type) {
            entityDef.attributes[attrName].entity_type = attrData.entity_type
          }
        }
      }
    })

    // Add custom property definitions for this entity type
    const customProperties = propertiesByParent[entityType._id] || []
    customProperties.forEach((prop) => {
      const propName = getPropertyValue(prop, 'name')

      // Detect property type more accurately
      let datatype = 'unknown'

      // First try to get type from the 'type' field with array structure
      if (prop.properties?.type?.[0]?.string) {
        datatype = prop.properties.type[0].string
      }
      else if (prop.type?.[0]?.string) {
        datatype = prop.type[0].string
      }
      else {
        // Fallback to simple getPropertyValue approach
        datatype = getPropertyValue(prop, 'type') || getPropertyValue(prop, 'datatype')
      }

      const description = getPropertyValue(prop, 'description')

      if (propName) {
        const propDef = {
          name: propName,
          type: datatype || 'unknown'
        }
        if (description) propDef.description = description

        // If type is unknown or missing, include raw data for debugging
        if (!datatype || datatype === 'unknown') {
          propDef.rawData = prop
        }

        entityDef.properties.push(propDef)
      }
    })

    model[typeName] = entityDef
  })

  dataModel.value = model
}

const dataModelYaml = computed(() => {
  return formatAsYaml(dataModel.value)
})

const rawDataModel = computed(() => {
  const rawModel = {}

  // Build raw model with original entity types and properties
  entityTypes.value.forEach((entityType) => {
    const typeName = getEntityTypeName(entityType)
    if (!typeName) return

    // Skip system entities
    const isSystemEntity = getPropertyValue(entityType, 'system')
    if (isSystemEntity === true) return

    rawModel[typeName] = {
      entityType: entityType,
      customProperties: []
    }

    // Group properties by their parent entity type
    allProperties.value.forEach((prop) => {
      const parentId = prop._parent?.[0]?.reference
      if (parentId === entityType._id) {
        rawModel[typeName].customProperties.push(prop)
      }
    })
  })

  return rawModel
})

const formatAsYaml = (obj, indent = 0) => {
  let yaml = ''
  const spaces = '  '.repeat(indent)

  for (const [entityName, entityDef] of Object.entries(obj)) {
    yaml += `${spaces}${entityName}:\n`

    // Add attributes section
    if (entityDef.attributes && Object.keys(entityDef.attributes).length > 0) {
      yaml += `${spaces}  attributes:\n`
      for (const [attrName, attrDef] of Object.entries(entityDef.attributes)) {
        yaml += `${spaces}    ${attrName}:\n`
        yaml += `${spaces}      type: ${attrDef.type}\n`
        if (attrDef.reference) yaml += `${spaces}      reference: ${attrDef.reference}\n`
        if (attrDef.entity_type) yaml += `${spaces}      entity_type: ${attrDef.entity_type}\n`
        yaml += `${spaces}      value: ${attrDef.value}\n`
      }
    }

    // Add properties section
    if (entityDef.properties && entityDef.properties.length > 0) {
      yaml += `${spaces}  properties:\n`
      entityDef.properties.forEach((prop) => {
        yaml += `${spaces}    - name: ${prop.name}\n`
        yaml += `${spaces}      type: ${prop.type}\n`
        if (prop.description) yaml += `${spaces}      description: ${prop.description}\n`
      })
    }
  }

  return yaml
}

const selectEntityType = (typeName) => {
  selectedType.value = typeName
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    // You could add a toast notification here
    console.log('YAML copied to clipboard!')
  }
  catch (err) {
    console.error('Failed to copy to clipboard:', err)
  }
}

onMounted(() => {
  fetchCompleteDataModel()
})
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="mb-4 text-2xl font-bold">
      Entu Data Model Explorer
    </h1>

    <div
      v-if="isLoading"
      class="text-center"
    >
      <p>Loading complete data model...</p>
    </div>

    <div
      v-if="error"
      class="relative rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
      role="alert"
    >
      <strong class="font-bold">Error:</strong>
      <span class="block sm:inline">{{ error }}</span>
    </div>

    <div
      v-if="!isLoading && !error"
      class="grid grid-cols-1 gap-4 lg:grid-cols-3"
    >
      <!-- Entity Types List -->
      <div>
        <h2 class="mb-2 text-xl font-semibold">
          Entity Types ({{ Object.keys(dataModel).length }})
        </h2>
        <ul class="space-y-1">
          <li
            v-for="(entityDef, typeName) in dataModel"
            :key="typeName"
            :class="{
              'border-blue-300 bg-blue-100': selectedType === typeName,
              'hover:bg-gray-100': selectedType !== typeName,
            }"
            class="cursor-pointer rounded border p-2"
            @click="selectEntityType(typeName)"
          >
            <div class="font-medium">
              {{ typeName }}
            </div>
            <div class="text-sm text-gray-600">
              {{ entityDef.properties?.length || 0 }} properties
            </div>
          </li>
        </ul>
      </div>

      <!-- Selected Entity Details -->
      <div v-if="selectedType">
        <h2 class="mb-2 text-xl font-semibold">
          {{ selectedType }}
        </h2>

        <!-- Entity Attributes -->
        <div class="mb-6">
          <h3 class="mb-2 text-lg font-medium">
            Entity Attributes
          </h3>
          <div class="space-y-2">
            <div
              v-for="(attr, attrName) in dataModel[selectedType]?.attributes"
              :key="attrName"
              class="rounded border bg-blue-50 p-3"
            >
              <div class="font-semibold">
                {{ attrName }}
              </div>
              <div class="text-sm text-gray-600">
                Type: {{ attr.type }}
              </div>
              <div
                v-if="attr.reference"
                class="text-sm text-gray-600"
              >
                Reference: {{ attr.reference }}
              </div>
              <div
                v-if="attr.entity_type"
                class="text-sm text-gray-600"
              >
                Entity Type: {{ attr.entity_type }}
              </div>
              <div class="font-mono text-sm text-blue-600">
                {{ attr.value }}
              </div>
            </div>
          </div>
        </div>

        <!-- Property Definitions -->
        <div>
          <h3 class="mb-2 text-lg font-medium">
            Property Definitions ({{ dataModel[selectedType]?.properties?.length || 0 }})
          </h3>
          <div v-if="dataModel[selectedType]?.properties?.length > 0">
            <div
              v-for="property in dataModel[selectedType].properties"
              :key="property.name"
              class="mb-2 rounded border bg-gray-50 p-3"
            >
              <div class="font-semibold">
                {{ property.name }}
              </div>
              <div class="text-sm text-gray-600">
                Type: {{ property.type }}
              </div>
              <div
                v-if="property.description"
                class="text-sm text-gray-500"
              >
                {{ property.description }}
              </div>
              <div
                v-if="property.rawData"
                class="mt-2"
              >
                <div class="text-xs font-semibold text-red-600">
                  Raw Data (type not detected):
                </div>
                <pre class="mt-1 overflow-auto rounded bg-red-50 p-2 text-xs">{{ JSON.stringify(property.rawData, null, 2) }}</pre>
              </div>
            </div>
          </div>
          <div
            v-else
            class="text-gray-500"
          >
            No custom properties defined for this entity type.
          </div>
        </div>
      </div>

      <!-- Complete YAML Model -->
      <div class="lg:col-span-2">
        <div class="mb-4 flex gap-2">
          <button
            :class="{
              'bg-blue-600': viewMode === 'yaml',
              'bg-gray-400': viewMode !== 'yaml',
            }"
            class="rounded px-3 py-1 text-sm text-white"
            @click="viewMode = 'yaml'"
          >
            YAML View
          </button>
          <button
            :class="{
              'bg-blue-600': viewMode === 'raw',
              'bg-gray-400': viewMode !== 'raw',
            }"
            class="rounded px-3 py-1 text-sm text-white"
            @click="viewMode = 'raw'"
          >
            Raw Data
          </button>
        </div>

        <!-- YAML View -->
        <div v-if="viewMode === 'yaml'">
          <h2 class="mb-2 text-xl font-semibold">
            Data Model (YAML)
          </h2>
          <div class="relative">
            <button
              class="absolute right-2 top-2 rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
              @click="copyToClipboard(dataModelYaml)"
            >
              Copy YAML
            </button>
            <pre class="h-96 overflow-auto rounded-lg bg-gray-900 p-4 text-sm text-green-400">{{ dataModelYaml }}</pre>
          </div>
        </div>

        <!-- Raw Data View -->
        <div v-if="viewMode === 'raw'">
          <h2 class="mb-2 text-xl font-semibold">
            Raw Data Model (JSON)
          </h2>
          <div class="relative">
            <button
              class="absolute right-2 top-2 rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
              @click="copyToClipboard(JSON.stringify(rawDataModel, null, 2))"
            >
              Copy JSON
            </button>
            <pre class="h-96 overflow-auto rounded-lg bg-gray-900 p-4 text-sm text-yellow-400">{{ JSON.stringify(rawDataModel, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
