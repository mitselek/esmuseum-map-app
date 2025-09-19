#!/usr/bin/env node

/**
 * Constitutional Compliance Validator
 * F017 Phase 2: Enhanced Workflow Implementation
 *
 * Validates codebase against the ESMuseum Constitutional Framework
 * ensuring all development follows the established 10 constitutional articles
 */

import { execSync } from 'child_process'
import { promises as fs } from 'fs'

// Constitutional Articles for validation
const CONSTITUTIONAL_ARTICLES = {
  I: {
    name: 'Vue 3 Composition API Mandate',
    patterns: [
      { pattern: /<script setup/, description: 'Uses <script setup> syntax' },
      { pattern: /defineProps|defineEmits/, description: 'Proper Composition API patterns' },
      { antiPattern: /export default.*{/, description: 'Avoids Options API' }
    ]
  },
  II: {
    name: 'TypeScript-First Development',
    patterns: [
      { pattern: /interface\s+\w+/, description: 'Defines TypeScript interfaces' },
      { pattern: /type\s+\w+\s*=/, description: 'Uses type definitions' },
      { antiPattern: /:\s*any(?!\w)/, description: 'Avoids any types without justification' }
    ]
  },
  III: {
    name: 'Test-Driven Feature Development',
    patterns: [
      { pattern: /describe\s*\(/, description: 'Has test suites' },
      { pattern: /it\s*\(|test\s*\(/, description: 'Has test cases' },
      { pattern: /expect\s*\(/, description: 'Has assertions' }
    ]
  },
  IV: {
    name: 'i18n-First User Interface',
    patterns: [
      { pattern: /\$t\s*\(/, description: 'Uses translation functions' },
      { pattern: /useI18n|useLazyI18n/, description: 'Uses i18n composables' },
      { antiPattern: /["'`][^"'`]*[A-Za-z]{3,}[^"'`]*["'`]/, description: 'Avoids hardcoded user-facing strings' }
    ]
  },
  V: {
    name: 'Entu API Integration Standards',
    patterns: [
      { pattern: /useEntuApi|useEntuAuth/, description: 'Uses Entu API composables' },
      { pattern: /callApi/, description: 'Proper API call patterns' },
      { pattern: /OAuth|authentication/, description: 'Handles authentication' }
    ]
  },
  VI: {
    name: 'Performance-First SPA Architecture',
    patterns: [
      { pattern: /lazy|defineAsyncComponent/, description: 'Uses lazy loading' },
      { pattern: /import\s*\(/, description: 'Dynamic imports for code splitting' },
      { pattern: /computed\s*\(/, description: 'Uses computed properties for optimization' }
    ]
  },
  VII: {
    name: 'Component Modularity Principle',
    validation: 'component-size',
    maxLines: 200,
    patterns: [
      { pattern: /export\s+(const|function)/, description: 'Exports focused functionality' }
    ]
  },
  VIII: {
    name: 'Documentation-Driven Development',
    patterns: [
      { pattern: /\/\*\*[\s\S]*?\*\//, description: 'Has JSDoc documentation' },
      { pattern: /<!--[\s\S]*?-->/, description: 'Has template documentation' },
      { pattern: /@param|@returns|@description/, description: 'Documented parameters and returns' }
    ]
  },
  IX: {
    name: 'Responsive Design Requirements',
    patterns: [
      { pattern: /class=.*responsive|sm:|md:|lg:|xl:/, description: 'Uses responsive utilities' },
      { pattern: /aria-|role=|alt=/, description: 'Includes accessibility attributes' },
      { pattern: /WCAG|accessibility/, description: 'Considers accessibility standards' }
    ]
  },
  X: {
    name: 'Professional Documentation Standards',
    validation: 'documentation-quality',
    patterns: [
      { antiPattern: /^#+\s+.*[\u{1F680}\u{1F3AF}\u{1F3DB}]/mu, description: 'Avoids excessive emoji in headings' },
      { pattern: /^#+\s+[A-Za-z]/, description: 'Uses professional heading format' },
      { pattern: /!\[.+\]/, description: 'Includes alt text for images' }
    ]
  }
}

/**
 * Validate file content against constitutional patterns
 */
async function validateFileContent (filePath, content, articleId, article) {
  const violations = []
  const compliance = []

  // Special handling for component size (Article VII)
  if (article.validation === 'component-size') {
    const lines = content.split('\n').length
    if (lines > article.maxLines) {
      violations.push({
        article: `Article VII`,
        description: `Component exceeds ${article.maxLines} lines (${lines} lines)`,
        file: filePath,
        severity: 'error'
      })
    }
    else {
      compliance.push({
        article: `Article VII`,
        description: `Component size compliant (${lines} lines)`,
        file: filePath
      })
    }
  }

  // Special handling for documentation quality (Article X)
  if (article.validation === 'documentation-quality') {
    // Check for excessive emoji in headings
    const emojiInHeadings = content.match(/^#+\s+.*[\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}]/gmu)
    if (emojiInHeadings) {
      violations.push({
        article: `Article X`,
        description: `Excessive emoji found in ${emojiInHeadings.length} heading(s)`,
        file: filePath,
        matches: emojiInHeadings.slice(0, 3),
        severity: 'error'
      })
    }

    // Check for proper heading hierarchy
    const headings = content.match(/^(#+)\s+/gm)
    if (headings) {
      let prevLevel = 0
      let hierarchyViolations = 0
      for (const heading of headings) {
        const currentLevel = heading.match(/#/g).length
        if (currentLevel > prevLevel + 1) {
          hierarchyViolations++
        }
        prevLevel = currentLevel
      }
      if (hierarchyViolations > 0) {
        violations.push({
          article: `Article X`,
          description: `${hierarchyViolations} heading hierarchy violation(s)`,
          file: filePath,
          severity: 'warning'
        })
      }
    }

    // Check for images without alt text (markdown files only)
    if (filePath.endsWith('.md')) {
      const images = content.match(/!\[([^\]]*)\]/g)
      if (images) {
        const missingAltText = images.filter((img) => {
          const altText = img.match(/!\[([^\]]*)\]/)[1]
          return !altText || altText.trim().length === 0
        })
        if (missingAltText.length > 0) {
          violations.push({
            article: `Article X`,
            description: `${missingAltText.length} image(s) missing alt text`,
            file: filePath,
            severity: 'warning'
          })
        }
      }
    }

    if (violations.length === 0) {
      compliance.push({
        article: `Article X`,
        description: 'Professional documentation standards met',
        file: filePath
      })
    }
  }

  // Pattern validation
  if (article.patterns) {
    for (const pattern of article.patterns) {
      const regex = new RegExp(pattern.pattern, 'gm')
      const matches = content.match(regex)

      if (pattern.antiPattern) {
        // This is an anti-pattern check (should NOT match)
        if (matches && matches.length > 0) {
          violations.push({
            article: `Article ${articleId}`,
            description: `Anti-pattern violation: ${pattern.description}`,
            file: filePath,
            matches: matches.slice(0, 3), // First 3 matches
            severity: 'warning'
          })
        }
        else {
          compliance.push({
            article: `Article ${articleId}`,
            description: pattern.description,
            file: filePath
          })
        }
      }
      else {
        // Regular pattern check (should match)
        if (matches && matches.length > 0) {
          compliance.push({
            article: `Article ${articleId}`,
            description: pattern.description,
            file: filePath,
            matches: matches.length
          })
        }
      }
    }
  }

  return { violations, compliance }
}

/**
 * Get all relevant files for constitutional validation
 */
async function getValidationFiles () {
  const files = []

  const patterns = [
    'app/**/*.vue',
    'app/**/*.ts',
    'app/**/*.js',
    'server/**/*.ts',
    'tests/**/*.ts',
    'tests/**/*.js'
  ]

  for (const pattern of patterns) {
    try {
      const globFiles = await fs.readdir(pattern.split('/')[0])
      // Simple glob implementation - would use proper glob library in production
      const matchingFiles = await findMatchingFiles(pattern)
      files.push(...matchingFiles)
    }
    catch (error) {
      // Directory might not exist
    }
  }

  return [...new Set(files)] // Remove duplicates
}

/**
 * Simple file finder (would use proper glob library in production)
 */
async function findMatchingFiles (pattern) {
  const files = []
  const parts = pattern.split('/')

  try {
    const result = execSync(`find ${parts[0]} -name "*.vue" -o -name "*.ts" -o -name "*.js" 2>/dev/null || true`,
      { encoding: 'utf8' })
    return result.trim().split('\n').filter((f) => f.length > 0)
  }
  catch {
    return []
  }
}

/**
 * Validate all files against constitutional compliance
 */
async function validateConstitutionalCompliance () {
  console.log('🏛️  Constitutional Compliance Validation')
  console.log('=====================================')
  console.log('')

  const files = await getValidationFiles()
  console.log(`📁 Validating ${files.length} files...`)
  console.log('')

  const allViolations = []
  const allCompliance = []
  const summary = {}

  for (const [articleId, article] of Object.entries(CONSTITUTIONAL_ARTICLES)) {
    summary[articleId] = { violations: 0, compliance: 0, files: 0 }
  }

  for (const filePath of files) {
    try {
      const content = await fs.readFile(filePath, 'utf8')

      for (const [articleId, article] of Object.entries(CONSTITUTIONAL_ARTICLES)) {
        const { violations, compliance } = await validateFileContent(filePath, content, articleId, article)

        allViolations.push(...violations)
        allCompliance.push(...compliance)

        if (violations.length > 0 || compliance.length > 0) {
          summary[articleId].files++
          summary[articleId].violations += violations.length
          summary[articleId].compliance += compliance.length
        }
      }
    }
    catch (error) {
      console.warn(`⚠️  Could not read file: ${filePath}`)
    }
  }

  // Display results
  console.log('📊 Constitutional Compliance Summary:')
  console.log('')

  let totalViolations = 0
  let totalCompliance = 0

  for (const [articleId, article] of Object.entries(CONSTITUTIONAL_ARTICLES)) {
    const stats = summary[articleId]
    const status = stats.violations === 0 ? '✅' : stats.violations > 10 ? '❌' : '⚠️'

    console.log(`${status} Article ${articleId}: ${article.name}`)
    console.log(`   Files checked: ${stats.files}`)
    console.log(`   Compliance points: ${stats.compliance}`)
    console.log(`   Violations: ${stats.violations}`)
    console.log('')

    totalViolations += stats.violations
    totalCompliance += stats.compliance
  }

  // Display specific violations
  if (allViolations.length > 0) {
    console.log('🚨 Constitutional Violations:')
    console.log('')

    const groupedViolations = {}
    allViolations.forEach((v) => {
      if (!groupedViolations[v.article]) {
        groupedViolations[v.article] = []
      }
      groupedViolations[v.article].push(v)
    })

    for (const [article, violations] of Object.entries(groupedViolations)) {
      console.log(`${article}:`)
      violations.slice(0, 5).forEach((v) => { // Show first 5 per article
        console.log(`  ❌ ${v.file}: ${v.description}`)
        if (v.matches) {
          console.log(`     Matches: ${v.matches.join(', ')}`)
        }
      })
      if (violations.length > 5) {
        console.log(`     ... and ${violations.length - 5} more violations`)
      }
      console.log('')
    }
  }

  // Overall compliance score
  const totalChecks = totalCompliance + totalViolations
  const complianceScore = totalChecks > 0 ? Math.round((totalCompliance / totalChecks) * 100) : 100

  console.log('🎯 Overall Constitutional Compliance:')
  console.log(`   Score: ${complianceScore}%`)
  console.log(`   Compliance Points: ${totalCompliance}`)
  console.log(`   Violations: ${totalViolations}`)
  console.log('')

  // Quality gates
  if (complianceScore >= 90) {
    console.log('🏆 Excellent constitutional compliance!')
    return 0
  }
  else if (complianceScore >= 75) {
    console.log('👍 Good constitutional compliance, some improvements possible')
    return 0
  }
  else if (complianceScore >= 50) {
    console.log('⚠️  Constitutional compliance needs attention')
    return 1
  }
  else {
    console.log('🚨 Poor constitutional compliance - significant issues found')
    return 1
  }
}

/**
 * Run TypeScript type checking (Article II validation)
 */
async function validateTypeScript () {
  console.log('🔍 TypeScript Compliance Check (Article II)')
  console.log('')

  try {
    execSync('npx tsc --noEmit', { stdio: 'inherit' })
    console.log('✅ TypeScript compilation successful')
    return 0
  }
  catch (error) {
    console.log('❌ TypeScript compilation errors found')
    return 1
  }
}

/**
 * Run test coverage check (Article III validation)
 */
async function validateTestCoverage () {
  console.log('🧪 Test Coverage Check (Article III)')
  console.log('')

  try {
    const result = execSync('npm run test:coverage', { encoding: 'utf8' })

    // Parse coverage from output (simplified)
    const coverageMatch = result.match(/All files\s+\|\s+(\d+(?:\.\d+)?)/)
    const coverage = coverageMatch ? parseFloat(coverageMatch[1]) : 0

    console.log(`Test Coverage: ${coverage}%`)

    if (coverage >= 80) {
      console.log('✅ Excellent test coverage')
      return 0
    }
    else if (coverage >= 60) {
      console.log('⚠️  Good test coverage, room for improvement')
      return 0
    }
    else {
      console.log('❌ Insufficient test coverage')
      return 1
    }
  }
  catch (error) {
    console.log('❌ Test coverage check failed')
    return 1
  }
}

/**
 * Run ESLint constitutional compliance check
 */
async function validateESLint () {
  console.log('🔧 ESLint Constitutional Rules Check')
  console.log('')

  try {
    execSync('npm run lint', { stdio: 'inherit' })
    console.log('✅ ESLint validation passed')
    return 0
  }
  catch (error) {
    console.log('❌ ESLint violations found')
    return 1
  }
}

/**
 * Main validation function
 */
async function main () {
  const args = process.argv.slice(2)
  const flags = {
    constitutional: args.includes('--constitutional') || args.includes('--all'),
    typescript: args.includes('--typescript') || args.includes('--all'),
    coverage: args.includes('--coverage') || args.includes('--all'),
    eslint: args.includes('--eslint') || args.includes('--all'),
    all: args.includes('--all') || args.length === 0
  }

  let exitCode = 0

  console.log('🏛️  ESMuseum Constitutional Validation Suite')
  console.log('F017 Phase 2: Enhanced Workflow Implementation')
  console.log('============================================')
  console.log('')

  if (flags.all || flags.constitutional) {
    exitCode = Math.max(exitCode, await validateConstitutionalCompliance())
    console.log('')
  }

  if (flags.all || flags.typescript) {
    exitCode = Math.max(exitCode, await validateTypeScript())
    console.log('')
  }

  if (flags.all || flags.coverage) {
    exitCode = Math.max(exitCode, await validateTestCoverage())
    console.log('')
  }

  if (flags.all || flags.eslint) {
    exitCode = Math.max(exitCode, await validateESLint())
    console.log('')
  }

  if (exitCode === 0) {
    console.log('🎉 All constitutional validation checks passed!')
    console.log('Ready for implementation with full constitutional compliance.')
  }
  else {
    console.log('⚠️  Some constitutional validation checks failed.')
    console.log('Please address violations before proceeding with implementation.')
  }

  return exitCode
}

// Show help
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Constitutional Compliance Validation')
  console.log('')
  console.log('Usage:')
  console.log('  node scripts/constitutional-validator.js [options]')
  console.log('')
  console.log('Options:')
  console.log('  --constitutional  Check constitutional pattern compliance')
  console.log('  --typescript      Run TypeScript type checking')
  console.log('  --coverage        Check test coverage requirements')
  console.log('  --eslint          Run ESLint constitutional rules')
  console.log('  --all             Run all validation checks (default)')
  console.log('  --help, -h        Show this help message')
  console.log('')
  console.log('Examples:')
  console.log('  npm run validate:constitutional')
  console.log('  node scripts/constitutional-validator.js --typescript --coverage')
  process.exit(0)
}

// Execute if run directly (ES module version)
if (import.meta.url === `file://${process.argv[1]}`) {
  main().then(() => process.exit(0)).catch(() => process.exit(1))
}

// ES module exports
export {
  validateConstitutionalCompliance, validateESLint, validateTestCoverage, validateTypeScript
}
