#!/usr/bin/env node

/**
 * ESMuseum Spec-Driven Development Workflow Automation
 *
 * Implements /specify, /plan, /tasks commands with constitutional compliance
 *
 * Usage:
 *   npm run specify <feature-name>
 *   npm run plan <feature-number>
 *   npm run tasks <feature-number>
 *
 * Constitutional Authority: F017 Phase 2 Implementation
 */

import { promises as fs } from 'fs'
import path from 'path'

// Configuration
const FEATURES_DIR = '.copilot-workspace/features'
const TEMPLATES_DIR = '.copilot-workspace/templates'
const WORKFLOWS_DIR = '.copilot-workspace/workflows'

// Constitutional Articles for validation
const CONSTITUTIONAL_ARTICLES = [
  'Vue 3 Composition API Mandate',
  'TypeScript-First Development',
  'Test-Driven Feature Development',
  'i18n-First User Interface',
  'Entu API Integration Standards',
  'Performance-First SPA Architecture',
  'Component Modularity Principle',
  'Documentation-Driven Development',
  'Responsive Design Requirements'
]

/**
 * Get the next feature number by scanning existing features
 */
async function getNextFeatureNumber () {
  try {
    await fs.access(FEATURES_DIR)
    const files = await fs.readdir(FEATURES_DIR)
    const featureFiles = files
      .filter((file) => file.match(/^F\d+-.*\.md$/))
      .map((file) => parseInt(file.match(/^F(\d+)/)[1]))
      .sort((a, b) => b - a)

    return featureFiles.length > 0 ? featureFiles[0] + 1 : 18 // Start from F018
  }
  catch {
    // Features directory doesn't exist yet
    return 18
  }
}

/**
 * Create kebab-case from feature name
 */
function createKebabCase (name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * /specify command implementation
 */
async function specify (featureName) {
  if (!featureName) {
    console.error('❌ Error: Feature name is required')
    console.log('Usage: npm run specify <feature-name>')
    console.log('Example: npm run specify "Enhanced Task Scoring"')
    return 1
  }

  try {
    const featureNumber = await getNextFeatureNumber()
    const kebabName = createKebabCase(featureName)
    const featureId = `F${String(featureNumber).padStart(3, '0')}`
    const fileName = `${featureId}-${kebabName}.md`
    const filePath = path.join(FEATURES_DIR, fileName)

    // Ensure features directory exists
    await fs.mkdir(FEATURES_DIR, { recursive: true })

    // Load template
    const templatePath = path.join(TEMPLATES_DIR, 'feature-spec-template.md')
    let template
    try {
      template = await fs.readFile(templatePath, 'utf8')
    }
    catch {
      console.error('❌ Error: Feature specification template not found')
      console.log(`Expected template at: ${templatePath}`)
      return 1
    }

    // Replace template placeholders
    const currentDate = new Date().toISOString().split('T')[0]
    const specification = template
      .replace(/\[FEATURE_NUMBER\]/g, featureId)
      .replace(/\[FEATURE_TITLE\]/g, featureName)
      .replace(/\[DATE\]/g, currentDate)
      .replace(/\[BRIEF_DESCRIPTION\]/g, `Implementation of ${featureName}`)
      .replace(/\[CONSTITUTIONAL_ALIGNMENT\]/g, 'All nine constitutional articles apply')
      .replace(/\[PRIMARY_BUSINESS_VALUE\]/g, `Enhanced user experience through ${featureName.toLowerCase()}`)
      .replace(/\[SUCCESS_METRIC\]/g, `Measurable improvement in user engagement with ${featureName.toLowerCase()} feature`)

    // Write specification file
    await fs.writeFile(filePath, specification)

    console.log('✅ Feature specification created successfully!')
    console.log(`📄 File: ${filePath}`)
    console.log(`🆔 Feature ID: ${featureId}`)
    console.log(`📝 Title: ${featureName}`)
    console.log('')
    console.log('📋 Next steps:')
    console.log('1. Complete the feature specification following constitutional compliance checklist')
    console.log('2. Resolve all [NEEDS CLARIFICATION] markers')
    console.log('3. Validate against all 9 constitutional articles')
    console.log(`4. Run: npm run plan ${featureNumber}`)
    console.log('')
    console.log('📖 Reference guides:')
    console.log('- Specification Guide: .copilot-workspace/workflows/specify-command-guide.md')
    console.log('- Constitutional Compliance: .copilot-workspace/templates/constitutional-compliance-checklist.md')

    return 0
  }
  catch (error) {
    console.error('❌ Error creating feature specification:', error.message)
    return 1
  }
}

/**
 * /plan command implementation
 */
async function plan (featureNumber) {
  if (!featureNumber) {
    console.error('❌ Error: Feature number is required')
    console.log('Usage: npm run plan <feature-number>')
    console.log('Example: npm run plan 18')
    return 1
  }

  try {
    const featureId = `F${String(featureNumber).padStart(3, '0')}`

    // Find the feature specification file
    const files = await fs.readdir(FEATURES_DIR)
    const specFile = files.find((file) => file.startsWith(`${featureId}-`))

    if (!specFile) {
      console.error(`❌ Error: Feature specification not found for ${featureId}`)
      console.log(`Expected file pattern: ${featureId}-*.md in ${FEATURES_DIR}/`)
      console.log('Create specification first with: npm run specify "<feature-name>"')
      return 1
    }

    const specPath = path.join(FEATURES_DIR, specFile)

    // Validate specification completeness
    const specContent = await fs.readFile(specPath, 'utf8')

    const validationResults = {
      needsClarification: (specContent.match(/\[NEEDS CLARIFICATION\]/g) || []).length,
      placeholders: (specContent.match(/\[.*?\]/g) || []).filter((p) => p !== '[NEEDS CLARIFICATION]').length,
      constitutionalSections: CONSTITUTIONAL_ARTICLES.filter((article) =>
        specContent.includes(article) || specContent.includes(article.replace(/\s/g, ''))
      ).length
    }

    console.log(`🔍 Validating specification: ${featureId}`)
    console.log(`📄 File: ${specPath}`)
    console.log('')

    // Validation Gate Checks
    console.log('📋 Quality Gate Validation:')

    if (validationResults.needsClarification > 0) {
      console.log(`❌ Specification Completeness: ${validationResults.needsClarification} [NEEDS CLARIFICATION] markers found`)
    }
    else {
      console.log('✅ Specification Completeness: All clarification markers resolved')
    }

    if (validationResults.placeholders > 0) {
      console.log(`⚠️  Template Placeholders: ${validationResults.placeholders} placeholder markers remain`)
    }
    else {
      console.log('✅ Template Completeness: All placeholders replaced with specific content')
    }

    if (validationResults.constitutionalSections < 9) {
      console.log(`❌ Constitutional Compliance: Only ${validationResults.constitutionalSections}/9 articles addressed`)
    }
    else {
      console.log('✅ Constitutional Compliance: All 9 articles documented')
    }

    const canProceed = validationResults.needsClarification === 0
      && validationResults.placeholders === 0
      && validationResults.constitutionalSections >= 9

    console.log('')

    if (!canProceed) {
      console.log('🚫 Quality gates not satisfied. Please address the following:')
      if (validationResults.needsClarification > 0) {
        console.log('   - Resolve all [NEEDS CLARIFICATION] markers with specific decisions')
      }
      if (validationResults.placeholders > 0) {
        console.log('   - Replace all template placeholders with actual content')
      }
      if (validationResults.constitutionalSections < 9) {
        console.log('   - Document compliance for all 9 constitutional articles')
      }
      console.log('')
      console.log('📖 Reference: .copilot-workspace/workflows/specify-command-guide.md')
      return 1
    }

    console.log('✅ All quality gates satisfied! Ready for technical planning.')
    console.log('')
    console.log('🏗 Technical Planning Process:')
    console.log('1. Architecture Design (Component structure, state management, API integration)')
    console.log('2. Constitutional Architecture Review (All 9 articles compliance)')
    console.log('3. Technology Selection and Dependencies Assessment')
    console.log('4. Implementation Roadmap Creation (Phased approach)')
    console.log('5. Risk Assessment and Mitigation Planning')
    console.log('')
    console.log('📝 Planning Guidelines:')
    console.log('- Follow component modularity principles (≤200 lines per component)')
    console.log('- Plan TypeScript interfaces for all entities')
    console.log('- Design test-first implementation sequence')
    console.log('- Document performance impact assessment')
    console.log('- Include i18n strategy for all user-facing content')
    console.log('')
    console.log(`📄 Add technical planning to: ${specPath}`)
    console.log(`📖 Reference: .copilot-workspace/workflows/plan-command-guide.md`)
    console.log(`⏭️  Next: npm run tasks ${featureNumber}`)

    return 0
  }
  catch (error) {
    console.error('❌ Error during planning phase:', error.message)
    return 1
  }
}

/**
 * /tasks command implementation
 */
async function tasks (featureNumber) {
  if (!featureNumber) {
    console.error('❌ Error: Feature number is required')
    console.log('Usage: npm run tasks <feature-number>')
    console.log('Example: npm run tasks 18')
    return 1
  }

  try {
    const featureId = `F${String(featureNumber).padStart(3, '0')}`

    // Find the feature specification file
    const files = await fs.readdir(FEATURES_DIR)
    const specFile = files.find((file) => file.startsWith(`${featureId}-`))

    if (!specFile) {
      console.error(`❌ Error: Feature specification not found for ${featureId}`)
      return 1
    }

    const specPath = path.join(FEATURES_DIR, specFile)
    const specContent = await fs.readFile(specPath, 'utf8')

    // Validate that planning phase is complete
    const planningValidation = {
      hasArchitecture: specContent.includes('Technical Implementation') || specContent.includes('Architecture'),
      hasCompliance: CONSTITUTIONAL_ARTICLES.every((article) =>
        specContent.includes(article) || specContent.includes(article.replace(/\s/g, ''))
      ),
      hasRoadmap: specContent.includes('Implementation') && specContent.includes('Phase'),
      hasRisks: specContent.includes('Risk') || specContent.includes('Mitigation')
    }

    console.log(`📋 Validating technical plan: ${featureId}`)
    console.log(`📄 File: ${specPath}`)
    console.log('')

    console.log('🔍 Planning Quality Gates:')
    console.log(`${planningValidation.hasArchitecture ? '✅' : '❌'} Technical Architecture: Component and API design documented`)
    console.log(`${planningValidation.hasCompliance ? '✅' : '❌'} Constitutional Compliance: All 9 articles reviewed`)
    console.log(`${planningValidation.hasRoadmap ? '✅' : '❌'} Implementation Roadmap: Phased approach documented`)
    console.log(`${planningValidation.hasRisks ? '✅' : '❌'} Risk Assessment: Mitigation strategies documented`)

    const canProceedToTasks = Object.values(planningValidation).every(Boolean)

    console.log('')

    if (!canProceedToTasks) {
      console.log('🚫 Planning quality gates not satisfied. Please complete:')
      if (!planningValidation.hasArchitecture) {
        console.log('   - Technical architecture documentation (components, APIs, state management)')
      }
      if (!planningValidation.hasCompliance) {
        console.log('   - Constitutional compliance review for all 9 articles')
      }
      if (!planningValidation.hasRoadmap) {
        console.log('   - Implementation roadmap with clear phases')
      }
      if (!planningValidation.hasRisks) {
        console.log('   - Risk assessment and mitigation strategies')
      }
      console.log('')
      console.log('📖 Reference: .copilot-workspace/workflows/plan-command-guide.md')
      return 1
    }

    console.log('✅ Planning quality gates satisfied! Ready for task breakdown.')
    console.log('')
    console.log('🎯 Task Generation Framework:')
    console.log('')
    console.log('📋 Implementation Sequence:')
    console.log('1. Contract Definition (API and component interfaces)')
    console.log('2. Contract Tests (Test-first development)')
    console.log('3. Integration Tests (Cross-component validation)')
    console.log('4. End-to-End Tests (User workflow validation)')
    console.log('5. TypeScript Interfaces (Type safety implementation)')
    console.log('6. Composable Implementation (Business logic)')
    console.log('7. Component Implementation (UI components)')
    console.log('8. i18n Implementation (Internationalization)')
    console.log('9. Performance Optimization (Bundle size and speed)')
    console.log('10. Accessibility Implementation (WCAG compliance)')
    console.log('11. Documentation Creation (Usage and APIs)')
    console.log('12. Constitutional Compliance Validation (Final review)')
    console.log('')
    console.log('⚡ Parallelization Strategy:')
    console.log('- Group A: API contracts and tests')
    console.log('- Group B: Component contracts and tests')
    console.log('- Group C: TypeScript interfaces')
    console.log('- Independent: i18n, documentation, accessibility')
    console.log('')
    console.log('🏷 Task Priority Levels:')
    console.log('- P0 (Critical): Blocking tasks that prevent other work')
    console.log('- P1 (High): Core implementation tasks')
    console.log('- P2 (Medium): Quality and enhancement tasks')
    console.log('- P3 (Low): Documentation and nice-to-have tasks')
    console.log('')
    console.log(`📝 Add task breakdown to: ${specPath}`)
    console.log('📖 Reference: .copilot-workspace/workflows/tasks-command-guide.md')
    console.log('⏭️  Ready for implementation phase')

    return 0
  }
  catch (error) {
    console.error('❌ Error during task breakdown phase:', error.message)
    return 1
  }
}

/**
 * Main command dispatcher
 */
async function main () {
  const [, , command, ...args] = process.argv

  switch (command) {
    case 'specify':
      return await specify(args.join(' '))
    case 'plan':
      return await plan(parseInt(args[0]))
    case 'tasks':
      return await tasks(parseInt(args[0]))
    default:
      console.log('📋 ESMuseum Spec-Driven Development Workflow')
      console.log('')
      console.log('Available commands:')
      console.log('  npm run specify "<feature-name>"   Create new feature specification')
      console.log('  npm run plan <feature-number>      Generate technical implementation plan')
      console.log('  npm run tasks <feature-number>     Break down into actionable tasks')
      console.log('')
      console.log('Examples:')
      console.log('  npm run specify "Enhanced Task Scoring"')
      console.log('  npm run plan 18')
      console.log('  npm run tasks 18')
      console.log('')
      console.log('Constitutional Authority: F017 Phase 2 Implementation')
      console.log('Documentation: .copilot-workspace/workflows/')
      return 1
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().then(process.exit)
}

export { getNextFeatureNumber, plan, specify, tasks }
