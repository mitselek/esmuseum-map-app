#!/usr/bin/env node

/**
 * Translation Analysis Script (Fixed Version)
 *
 * This script analyzes the codebase to:
 * 1. Find all translation keys defined in i18n.config.ts
 * 2. Find all translation keys used in the codebase
 * 3. Identify unused translation keys
 * 4. Generate a report and optionally clean up unused keys
 */

const fs = require('fs')
const path = require('path')

// Configuration
const CONFIG = {
  i18nConfigPath: '.config/i18n.config.ts',
  sourceDirectories: ['app/', 'pages/', 'components/', 'composables/', 'layouts/', 'middleware/', 'plugins/'],
  fileExtensions: ['.vue', '.js', '.ts', '.jsx', '.tsx'],
  excludePatterns: ['node_modules/', '.git/', '.nuxt/', 'dist/', 'build/'],
  translationPatterns: [
    /\$t\(['"`]([^'"`]+)['"`]\)/g,
    /\bt\(['"`]([^'"`]+)['"`]\)/g,
    /i18n\.t\(['"`]([^'"`]+)['"`]\)/g,
    /useI18n\(\)\.t\(['"`]([^'"`]+)['"`]\)/g
  ]
}

/**
 * Extract all defined translation keys from i18n config
 */
function extractDefinedKeys () {
  console.log('📖 Analyzing defined translation keys...')

  const configPath = path.join(process.cwd(), CONFIG.i18nConfigPath)
  if (!fs.existsSync(configPath)) {
    throw new Error(`i18n config file not found at ${configPath}`)
  }

  const configContent = fs.readFileSync(configPath, 'utf8')
  const keys = new Set()

  // Extract locale objects (en, et, uk) and get their structure
  const localePattern = /^\s*(en|et|uk):\s*{/gm
  let match

  while ((match = localePattern.exec(configContent)) !== null) {
    // Find the content of this locale section
    let braceCount = 1
    let startIndex = match.index + match[0].length
    let endIndex = startIndex

    for (let i = startIndex; i < configContent.length && braceCount > 0; i++) {
      if (configContent[i] === '{') braceCount++
      else if (configContent[i] === '}') braceCount--
      endIndex = i
    }

    if (braceCount === 0) {
      const sectionContent = configContent.substring(startIndex, endIndex)

      // Parse nested object structure manually
      function parseNestedKeys (content, prefix = '') {
        const lines = content.split('\n')
        const stack = [prefix]

        for (const line of lines) {
          const trimmed = line.trim()

          // Skip empty lines and comments
          if (!trimmed || trimmed.startsWith('//')) continue

          // Handle object start: key: {
          const objectStartMatch = trimmed.match(/^(\w+):\s*\{/)
          if (objectStartMatch) {
            const key = objectStartMatch[1]
            const newPrefix = stack[stack.length - 1] ? `${stack[stack.length - 1]}.${key}` : key
            stack.push(newPrefix)
            continue
          }

          // Handle object end: }
          if (trimmed === '}' || trimmed === '},') {
            stack.pop()
            continue
          }

          // Handle string properties: key: 'value'
          const stringMatch = trimmed.match(/^(\w+):\s*['"`]/)
          if (stringMatch) {
            const key = stringMatch[1]
            const currentPrefix = stack[stack.length - 1]
            const fullKey = currentPrefix ? `${currentPrefix}.${key}` : key
            keys.add(fullKey)
          }
        }
      }

      parseNestedKeys(sectionContent)

      // Only process one locale to avoid duplicates
      break
    }
  }

  console.log(`✅ Found ${keys.size} defined translation keys`)
  return keys
}

/**
 * Extract all used translation keys from source files
 */
function extractUsedKeys () {
  console.log('🔍 Scanning codebase for used translation keys...')

  const keys = new Set()

  // Pre-compile regex patterns for better performance
  const compiledPatterns = CONFIG.translationPatterns.map((pattern) =>
    new RegExp(pattern.source, pattern.flags)
  )

  // Function to scan a directory recursively
  function scanDirectory (dir) {
    if (!fs.existsSync(dir)) {
      console.log(`⚠️  Directory ${dir} does not exist`)
      return []
    }

    const files = []
    const items = fs.readdirSync(dir)

    for (const item of items) {
      const itemPath = path.join(dir, item)
      const stat = fs.statSync(itemPath)

      if (stat.isDirectory()) {
        // Skip excluded directories
        if (!CONFIG.excludePatterns.some((pattern) => itemPath.includes(pattern))) {
          files.push(...scanDirectory(itemPath))
        }
      }
      else if (CONFIG.fileExtensions.some((ext) => item.endsWith(ext))) {
        files.push(itemPath)
      }
    }

    return files
  }

  // Scan all source directories
  const sourceFiles = []
  CONFIG.sourceDirectories.forEach((dir) => {
    sourceFiles.push(...scanDirectory(dir))
  })

  console.log(`📁 Scanning ${sourceFiles.length} source files...`)

  // Extract keys from each file
  sourceFiles.forEach((filePath) => {
    try {
      const content = fs.readFileSync(filePath, 'utf8')

      compiledPatterns.forEach((regex) => {
        let match
        while ((match = regex.exec(content)) !== null) {
          keys.add(match[1])
        }
      })
    }
    catch (e) {
      console.warn(`Warning: Could not read file ${filePath}: ${e.message}`)
    }
  })

  console.log(`✅ Found ${keys.size} used translation keys`)
  return keys
}

/**
 * Generate analysis report
 */
function generateReport (definedKeys, usedKeys) {
  console.log('\n📊 TRANSLATION ANALYSIS REPORT\n')
  console.log('='.repeat(50))

  // Find unused keys (efficient Set operations)
  const unusedKeys = new Set()
  for (const key of definedKeys) {
    if (!usedKeys.has(key)) {
      unusedKeys.add(key)
    }
  }

  // Find missing keys (used but not defined)
  const missingKeys = new Set()
  for (const key of usedKeys) {
    if (!definedKeys.has(key)) {
      missingKeys.add(key)
    }
  }

  console.log(`📖 Total defined keys: ${definedKeys.size}`)
  console.log(`🔍 Total used keys: ${usedKeys.size}`)
  console.log(`❌ Unused keys: ${unusedKeys.size}`)
  console.log(`⚠️  Missing keys: ${missingKeys.size}`)

  if (unusedKeys.size > 0) {
    console.log('\n🗑️  UNUSED TRANSLATION KEYS:')
    console.log('-'.repeat(30))
    Array.from(unusedKeys).sort().forEach((key) => {
      console.log(`  - ${key}`)
    })
  }

  if (missingKeys.size > 0) {
    console.log('\n⚠️  MISSING TRANSLATION KEYS:')
    console.log('-'.repeat(30))
    Array.from(missingKeys).sort().forEach((key) => {
      console.log(`  - ${key}`)
    })
  }

  return { unusedKeys, missingKeys }
}

/**
 * Remove unused translation keys from config file
 */
function cleanupUnusedKeys (unusedKeys) {
  if (unusedKeys.size === 0) {
    console.log('\n✨ No unused keys to remove!')
    return
  }

  console.log(`\n🧹 Removing ${unusedKeys.size} unused translation keys...`)

  const configPath = path.join(process.cwd(), CONFIG.i18nConfigPath)
  let configContent = fs.readFileSync(configPath, 'utf8')

  // Create backup
  const backupPath = `${configPath}.backup.${Date.now()}`
  fs.writeFileSync(backupPath, configContent)
  console.log(`💾 Created backup: ${backupPath}`)

  // Remove unused keys (enhanced to handle nested keys)
  const simpleKeys = []
  const nestedKeys = []

  // Separate simple and nested keys for different handling
  unusedKeys.forEach((keyToRemove) => {
    if (keyToRemove.includes('.')) {
      nestedKeys.push(keyToRemove)
    }
    else {
      simpleKeys.push(keyToRemove)
    }
  })

  // Remove simple keys with batch regex
  if (simpleKeys.length > 0) {
    const escapedKeys = simpleKeys.map((key) => key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    const batchPattern = new RegExp(`^\\s*(${escapedKeys.join('|')}):\\s*['"\`][^'"\`]*['"\`],?\\s*$`, 'gm')
    configContent = configContent.replace(batchPattern, '')
  }

  // Remove nested keys properly
  if (nestedKeys.length > 0) {
    console.log(`🔧 Removing ${nestedKeys.length} nested keys...`)

    nestedKeys.forEach((keyToRemove) => {
      const keyParts = keyToRemove.split('.')
      const leafKey = keyParts[keyParts.length - 1]

      // Create regex to match the leaf key and its value within the nested structure
      const escapedLeafKey = leafKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const nestedKeyPattern = new RegExp(`^\\s*${escapedLeafKey}:\\s*['"\`][^'"\`]*['"\`],?\\s*$`, 'gm')

      configContent = configContent.replace(nestedKeyPattern, '')
      console.log(`   ✓ Removed: ${keyToRemove}`)
    })
  }

  // Clean up empty lines
  configContent = configContent.replace(/\n\s*\n\s*\n/g, '\n\n')

  fs.writeFileSync(configPath, configContent)
  console.log('✅ Cleanup completed!')
}

/**
 * Main function
 */
function main () {
  const isDryRun = process.argv.includes('--dry-run')
  const shouldCleanup = process.argv.includes('--cleanup')

  console.log('🌍 Translation Analysis Tool\n')

  try {
    const definedKeys = extractDefinedKeys()
    const usedKeys = extractUsedKeys()
    const { unusedKeys, missingKeys } = generateReport(definedKeys, usedKeys)

    if (shouldCleanup && !isDryRun) {
      cleanupUnusedKeys(unusedKeys)
    }
    else if (unusedKeys.size > 0) {
      console.log('\n💡 Run with --cleanup flag to remove unused keys')
      console.log('💡 Run with --dry-run to see changes without applying them')
    }

    if (missingKeys.size > 0) {
      console.log('\n❗ Some translation keys are used but not defined!')
      console.log('   Add these keys to your i18n.config.ts file.')
    }
  }
  catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

// Run the script
if (require.main === module) {
  main()
}

module.exports = { extractDefinedKeys, extractUsedKeys, generateReport, cleanupUnusedKeys }
