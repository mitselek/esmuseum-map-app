#!/usr/bin/env node

/**
 * Translation Analysis Script
 *
 * This script analyzes the codebase to:
 * 1. Find all translation keys defined in i18n.config.ts
 * 2. Find all translation keys used in the codebase
 * 3. Identify unused translation keys
 * 4. Generate a report and optionally clean up unused keys
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Configuration
const CONFIG = {
  i18nConfigPath: '.config/i18n.config.ts',
  sourceDirectories: ['app/', 'pages/', 'components/', 'composables/', 'layouts/', 'middleware/', 'plugins/'],
  fileExtensions: ['.vue', '.js', '.ts', '.jsx', '.tsx'],
  excludePatterns: ['node_modules/', '.git/', '.nuxt/', 'dist/', 'build/']
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

  // Function to recursively extract keys from a section
  function extractKeysFromSection (content, prefix = '') {
    // Match property definitions: propertyName: 'value' or propertyName: "value"
    const simplePropertyPattern = /^\s*(\w+):\s*['"`][^'"`]*['"`]/gm
    let match

    while ((match = simplePropertyPattern.exec(content)) !== null) {
      const key = match[1]
      const fullKey = prefix ? `${prefix}.${key}` : key
      keys.add(fullKey)
    }

    // Match nested objects: propertyName: {
    const nestedPattern = /^\s*(\w+):\s*\{/gm
    while ((match = nestedPattern.exec(content)) !== null) {
      const sectionName = match[1]

      // Skip language codes
      if (['et', 'en', 'uk', 'default'].includes(sectionName) && !prefix) {
        continue
      }

      const fullSectionName = prefix ? `${prefix}.${sectionName}` : sectionName

      // Find the matching closing brace for this section
      let braceCount = 1
      let startIndex = match.index + match[0].length
      let endIndex = startIndex

      for (let i = startIndex; i < content.length && braceCount > 0; i++) {
        if (content[i] === '{') braceCount++
        else if (content[i] === '}') braceCount--
        endIndex = i
      }

      if (braceCount === 0) {
        const sectionContent = content.substring(startIndex, endIndex)
        extractKeysFromSection(sectionContent, fullSectionName)
      }
    }
  }

  // Extract keys from each language section
  const languagePattern = /^\s*(et|en|uk):\s*\{/gm
  let langMatch

  while ((langMatch = languagePattern.exec(configContent)) !== null) {
    // Find the content of this language section
    let braceCount = 1
    let startIndex = langMatch.index + langMatch[0].length
    let endIndex = startIndex

    for (let i = startIndex; i < configContent.length && braceCount > 0; i++) {
      if (configContent[i] === '{') braceCount++
      else if (configContent[i] === '}') braceCount--
      endIndex = i
    }

    if (braceCount === 0) {
      const languageContent = configContent.substring(startIndex, endIndex)
      extractKeysFromSection(languageContent)
    }
  }

  console.log(`✅ Found ${keys.size} defined translation keys`)
  return keys
}

/**
 * Find all translation keys used in the codebase
 */
function extractUsedKeys () {
  console.log('🔍 Scanning codebase for used translation keys...')

  const usedKeys = new Set()

  // Find all source files
  const sourceFiles = []

  function scanDirectory (dir) {
    if (!fs.existsSync(dir)) return

    const entries = fs.readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      // Skip excluded patterns
      if (CONFIG.excludePatterns.some((pattern) => fullPath.includes(pattern))) {
        continue
      }

      if (entry.isDirectory()) {
        scanDirectory(fullPath)
      }
      else if (CONFIG.fileExtensions.some((ext) => entry.name.endsWith(ext))) {
        sourceFiles.push(fullPath)
      }
    }
  }

  // Scan all configured directories
  CONFIG.sourceDirectories.forEach((dir) => {
    scanDirectory(dir)
  })

  console.log(`📁 Scanning ${sourceFiles.length} source files...`)

  // Analyze each file for translation usage
  sourceFiles.forEach((filePath) => {
    try {
      const content = fs.readFileSync(filePath, 'utf8')

      // Find translation calls: $t('key'), t('key'), i18n.t('key')
      const patterns = [
        /\$t\(['"]([\w.]+)['"]\)/g,
        /\bt\(['"]([\w.]+)['"]\)/g,
        /i18n\.t\(['"]([\w.]+)['"]\)/g,
        /useI18n\(\)\.t\(['"]([\w.]+)['"]\)/g
      ]

      patterns.forEach((pattern) => {
        let match
        while ((match = pattern.exec(content)) !== null) {
          usedKeys.add(match[1])
        }
      })
    }
    catch (error) {
      console.warn(`⚠️  Warning: Could not read file ${filePath}:`, error.message)
    }
  })

  console.log(`✅ Found ${usedKeys.size} used translation keys`)
  return usedKeys
}

/**
 * Generate analysis report
 */
function generateReport (definedKeys, usedKeys) {
  console.log('\n📊 TRANSLATION ANALYSIS REPORT\n')
  console.log('='.repeat(50))

  // Find unused keys
  const unusedKeys = new Set([...definedKeys].filter((key) => !usedKeys.has(key)))

  // Find missing keys (used but not defined)
  const missingKeys = new Set([...usedKeys].filter((key) => !definedKeys.has(key)))

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

  // Remove unused keys
  unusedKeys.forEach((key) => {
    if (key.includes('.')) {
      // Nested key like 'tasks.title'
      const [_, property] = key.split('.')
      // Remove the specific property line
      const propertyPattern = new RegExp(`^\\s*${property}:\\s*['"'].*?['"'],?\\s*$`, 'gm')
      configContent = configContent.replace(propertyPattern, '')
    }
    else {
      // Top-level key
      const keyPattern = new RegExp(`^\\s*${key}:\\s*['"'].*?['"'],?\\s*$`, 'gm')
      configContent = configContent.replace(keyPattern, '')
    }
  })

  // Clean up empty lines and trailing commas
  configContent = configContent
    .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Reduce multiple empty lines

  fs.writeFileSync(configPath, configContent)
  console.log('✅ Cleanup completed!')
}

/**
 * Main execution
 */
async function main () {
  try {
    console.log('🌍 Translation Analysis Tool\n')

    const definedKeys = extractDefinedKeys()
    const usedKeys = extractUsedKeys()
    const { unusedKeys, missingKeys } = generateReport(definedKeys, usedKeys)

    // Check command line arguments
    const args = process.argv.slice(2)
    const shouldCleanup = args.includes('--cleanup') || args.includes('--clean')
    const shouldWriteReport = args.includes('--report')

    if (shouldWriteReport) {
      const reportData = {
        timestamp: new Date().toISOString(),
        summary: {
          definedKeys: definedKeys.size,
          usedKeys: usedKeys.size,
          unusedKeys: unusedKeys.size,
          missingKeys: missingKeys.size
        },
        unusedKeys: Array.from(unusedKeys).sort(),
        missingKeys: Array.from(missingKeys).sort()
      }

      fs.writeFileSync('translation-analysis-report.json', JSON.stringify(reportData, null, 2))
      console.log('\n📄 Report written to: translation-analysis-report.json')
    }

    if (shouldCleanup) {
      cleanupUnusedKeys(unusedKeys)
    }
    else if (unusedKeys.size > 0) {
      console.log('\n💡 To remove unused keys, run: npm run analyze-translations -- --cleanup')
    }

    // Exit with error code if there are issues
    if (missingKeys.size > 0) {
      console.log(`\n⚠️  Warning: ${missingKeys.size} missing translation keys found`)
      console.log('Consider adding these keys to your i18n configuration')
    }

    console.log('\n✅ Analysis completed successfully!')
  }
  catch (error) {
    console.error('\n❌ Error during analysis:', error.message)
    process.exit(1)
  }
}

// Run the script
if (require.main === module) {
  main()
}

module.exports = { extractDefinedKeys, extractUsedKeys, generateReport, cleanupUnusedKeys }
