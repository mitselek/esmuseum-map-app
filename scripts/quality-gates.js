#!/usr/bin/env node

/**
 * Quality Gate Enforcement Script
 *
 * Enforces quality gates for Spec-Driven Development workflow phases
 *
 * Usage:
 *   node scripts/quality-gates.js <phase> [feature-number]
 *   npm run gate:specify <feature-number>
 *   npm run gate:plan <feature-number>
 *   npm run gate:tasks <feature-number>
 *
 * Constitutional Authority: F017 Phase 2 Implementation
 */

import { promises as fs } from 'fs'
import path from 'path'

// Quality Gate Definitions
const QUALITY_GATES = {

  specify: {
    name: 'Specification Quality Gate',
    description: 'Validates feature specification completeness and constitutional compliance',
    checks: [
      {
        name: 'Specification Completeness',
        validator: 'checkSpecificationCompleteness',
        required: true,
        description: 'No [NEEDS CLARIFICATION] markers remain'
      },
      {
        name: 'Template Placeholders',
        validator: 'checkTemplatePlaceholders',
        required: true,
        description: 'All template placeholders replaced with specific content'
      },
      {
        name: 'Constitutional Compliance',
        validator: 'checkConstitutionalCompliance',
        required: true,
        description: 'All 9 constitutional articles addressed'
      },
      {
        name: 'Business Value Documentation',
        validator: 'checkBusinessValue',
        required: true,
        description: 'Clear business value and success metrics documented'
      },
      {
        name: 'User Stories Validation',
        validator: 'checkUserStories',
        required: true,
        description: 'Comprehensive user stories with acceptance criteria'
      }
    ]
  },
  plan: {
    name: 'Planning Quality Gate',
    description: 'Validates technical implementation plan and architecture compliance',
    checks: [
      {
        name: 'Technical Architecture',
        validator: 'checkTechnicalArchitecture',
        required: true,
        description: 'Component structure and API design documented'
      },
      {
        name: 'Constitutional Architecture Review',
        validator: 'checkArchitecturalCompliance',
        required: true,
        description: 'Architecture decisions align with all 9 articles'
      },
      {
        name: 'Implementation Roadmap',
        validator: 'checkImplementationRoadmap',
        required: true,
        description: 'Clear phases with specific deliverables'
      },
      {
        name: 'Risk Assessment',
        validator: 'checkRiskAssessment',
        required: true,
        description: 'Risks identified with mitigation strategies'
      },
      {
        name: 'Test Strategy',
        validator: 'checkTestStrategy',
        required: true,
        description: 'Contract-first test approach documented'
      }
    ]
  },
  tasks: {
    name: 'Task Breakdown Quality Gate',
    description: 'Validates implementation task breakdown and constitutional coverage',
    checks: [
      {
        name: 'Task Completeness',
        validator: 'checkTaskCompleteness',
        required: true,
        description: 'All implementation aspects covered by specific tasks'
      },
      {
        name: 'Test-First Sequence',
        validator: 'checkTestFirstSequence',
        required: true,
        description: 'Contract → Integration → E2E → Unit → Implementation sequence'
      },
      {
        name: 'Constitutional Coverage',
        validator: 'checkConstitutionalTaskCoverage',
        required: true,
        description: 'All 9 articles addressed in task breakdown'
      },
      {
        name: 'Parallelization Plan',
        validator: 'checkParallelizationPlan',
        required: true,
        description: 'Independent tasks identified with dependency mapping'
      },
      {
        name: 'Quality Assurance Tasks',
        validator: 'checkQualityAssuranceTasks',
        required: true,
        description: 'Validation tasks included for ongoing compliance'
      }
    ]
  }
}

// Constitutional Articles for reference
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
 * Check if specification has unresolved clarification markers
 */
function checkSpecificationCompleteness (content) {
  const clarificationMarkers = (content.match(/\[NEEDS CLARIFICATION\]/g) || []).length
  const clarificationSections = (content.match(/NEEDS CLARIFICATION/g) || []).length

  const total = clarificationMarkers + clarificationSections

  return {
    passed: total === 0,
    score: total === 0 ? 100 : Math.max(0, 100 - (total * 20)),
    details: total === 0
      ? 'All clarification markers resolved'
      : `${total} unresolved clarification markers found`,
    violations: total > 0 ? [`${total} [NEEDS CLARIFICATION] markers remain`] : []
  }
}

/**
 * Check if template placeholders have been replaced
 */
function checkTemplatePlaceholders (content) {
  const placeholders = (content.match(/\[(?!NEEDS CLARIFICATION)[A-Z_]+\]/g) || [])
  const templatePlaceholders = placeholders.filter((p) =>
    !p.includes('NEEDS CLARIFICATION')
    && !p.includes('TODO')
    && !p.includes('FIXME')
  )

  return {
    passed: templatePlaceholders.length === 0,
    score: templatePlaceholders.length === 0 ? 100 : Math.max(0, 100 - (templatePlaceholders.length * 15)),
    details: templatePlaceholders.length === 0
      ? 'All template placeholders replaced'
      : `${templatePlaceholders.length} template placeholders remain`,
    violations: templatePlaceholders.length > 0 ? templatePlaceholders : []
  }
}

/**
 * Check constitutional compliance documentation
 */
function checkConstitutionalCompliance (content) {
  const articlesFound = CONSTITUTIONAL_ARTICLES.filter((article) => {
    const variants = [
      article,
      article.replace(/\s+/g, ''),
      article.replace(/\s+/g, '-'),
      article.toLowerCase()
    ]
    return variants.some((variant) => content.includes(variant))
  })

  const score = Math.round((articlesFound.length / CONSTITUTIONAL_ARTICLES.length) * 100)
  const missing = CONSTITUTIONAL_ARTICLES.filter((article) => !articlesFound.includes(article))

  return {
    passed: articlesFound.length === CONSTITUTIONAL_ARTICLES.length,
    score,
    details: `${articlesFound.length}/9 constitutional articles addressed`,
    violations: missing.map((article) => `Missing: ${article}`)
  }
}

/**
 * Check business value documentation
 */
function checkBusinessValue (content) {
  const hasBusinessValue = /business.?value|value.?proposition|user.?value/i.test(content)
  const hasSuccessMetrics = /success.?metric|measurable|kpi|indicator/i.test(content)
  const hasBenefits = /benefit|impact|improvement|enhancement/i.test(content)

  const checks = [hasBusinessValue, hasSuccessMetrics, hasBenefits]
  const score = Math.round((checks.filter(Boolean).length / checks.length) * 100)

  const violations = []
  if (!hasBusinessValue) violations.push('Business value not clearly documented')
  if (!hasSuccessMetrics) violations.push('Success metrics not defined')
  if (!hasBenefits) violations.push('User benefits not articulated')

  return {
    passed: checks.every(Boolean),
    score,
    details: `${checks.filter(Boolean).length}/3 business value elements documented`,
    violations
  }
}

/**
 * Check user stories validation
 */
function checkUserStories (content) {
  const userStoryPattern = /as\s+a\s+.+\s+i\s+want.+so\s+that/gi
  const userStories = content.match(userStoryPattern) || []
  const acceptanceCriteria = (content.match(/acceptance\s+criteria/gi) || []).length
  const testable = /testable|measurable|verifiable/i.test(content)

  const hasStories = userStories.length > 0
  const hasCriteria = acceptanceCriteria > 0
  const isTestable = testable

  const checks = [hasStories, hasCriteria, isTestable]
  const score = Math.round((checks.filter(Boolean).length / checks.length) * 100)

  const violations = []
  if (!hasStories) violations.push('No user stories found')
  if (!hasCriteria) violations.push('Acceptance criteria not defined')
  if (!isTestable) violations.push('Criteria not measurable/testable')

  return {
    passed: checks.every(Boolean),
    score,
    details: `${userStories.length} user stories, ${acceptanceCriteria} acceptance criteria`,
    violations
  }
}

/**
 * Check technical architecture documentation
 */
function checkTechnicalArchitecture (content) {
  const hasComponents = /component.?(structure|architecture|design)/i.test(content)
  const hasAPI = /api.?(integration|design|endpoint)/i.test(content)
  const hasState = /state.?(management|flow|reactive)/i.test(content)
  const hasInterfaces = /interface|type.?definition|typescript/i.test(content)

  const checks = [hasComponents, hasAPI, hasState, hasInterfaces]
  const score = Math.round((checks.filter(Boolean).length / checks.length) * 100)

  const violations = []
  if (!hasComponents) violations.push('Component architecture not documented')
  if (!hasAPI) violations.push('API integration not planned')
  if (!hasState) violations.push('State management strategy missing')
  if (!hasInterfaces) violations.push('TypeScript interfaces not defined')

  return {
    passed: checks.every(Boolean),
    score,
    details: `${checks.filter(Boolean).length}/4 architecture elements documented`,
    violations
  }
}

/**
 * Check architectural compliance with constitutional articles
 */
function checkArchitecturalCompliance (content) {
  const compliance = {
    compositionAPI: /composition.?api|script.?setup|\<script setup/i.test(content),
    typescript: /typescript|interface|type/i.test(content),
    testDriven: /test.?(first|driven)|contract.?test/i.test(content),
    i18n: /i18n|translation|internationalization/i.test(content),
    api: /entu.?api|oauth|authentication/i.test(content),
    performance: /performance|optimization|bundle.?size/i.test(content),
    modularity: /modularity|component.?size|single.?responsibility/i.test(content),
    documentation: /documentation|jsdoc|comment/i.test(content),
    responsive: /responsive|accessibility|mobile.?first|wcag/i.test(content)
  }

  const complianceCount = Object.values(compliance).filter(Boolean).length
  const score = Math.round((complianceCount / 9) * 100)

  const missing = Object.entries(compliance)
    .filter(([, compliant]) => !compliant)
    .map(([article]) => `Architecture review missing for: ${article}`)

  return {
    passed: complianceCount >= 7, // Allow some flexibility in planning phase
    score,
    details: `${complianceCount}/9 constitutional articles in architecture review`,
    violations: missing
  }
}

/**
 * Get feature specification content
 */
async function getFeatureSpecification (featureNumber) {
  const featureId = `F${String(featureNumber).padStart(3, '0')}`
  const featuresDir = '.copilot-workspace/features'

  try {
    const files = await fs.readdir(featuresDir)
    const specFile = files.find((file) => file.startsWith(`${featureId}-`))

    if (!specFile) {
      throw new Error(`Feature specification not found for ${featureId}`)
    }

    const specPath = path.join(featuresDir, specFile)
    const content = await fs.readFile(specPath, 'utf8')

    return { path: specPath, content, featureId }
  }
  catch (error) {
    throw new Error(`Could not read feature specification: ${error.message}`)
  }
}

/**
 * Run quality gate validation for a specific phase
 */
async function runQualityGate (phase, featureNumber) {
  const gate = QUALITY_GATES[phase]
  if (!gate) {
    throw new Error(`Unknown quality gate phase: ${phase}`)
  }

  console.log(`🔐 ${gate.name}`)
  console.log(`📋 ${gate.description}`)
  console.log('================================')
  console.log('')

  const { path: specPath, content, featureId } = await getFeatureSpecification(featureNumber)
  console.log(`📄 Validating: ${specPath}`)
  console.log(`🆔 Feature: ${featureId}`)
  console.log('')

  const results = []
  let overallScore = 0
  let totalViolations = 0

  for (const check of gate.checks) {
    console.log(`🔍 Checking: ${check.name}`)

    try {
      const validator = eval(check.validator)
      const result = validator(content)

      results.push({
        check: check.name,
        ...result,
        required: check.required
      })

      const status = result.passed ? '✅' : check.required ? '❌' : '⚠️'
      console.log(`   ${status} ${result.details} (${result.score}%)`)

      if (result.violations && result.violations.length > 0) {
        result.violations.forEach((violation) => {
          console.log(`      - ${violation}`)
        })
        totalViolations += result.violations.length
      }

      overallScore += result.score
    }
    catch (error) {
      console.log(`   ❌ Validation error: ${error.message}`)
      results.push({
        check: check.name,
        passed: false,
        score: 0,
        details: `Validation failed: ${error.message}`,
        violations: [error.message],
        required: check.required
      })
    }

    console.log('')
  }

  // Calculate overall results
  const averageScore = Math.round(overallScore / gate.checks.length)
  const requiredChecksPassed = results.filter((r) => r.required && r.passed).length
  const requiredChecksTotal = results.filter((r) => r.required).length
  const allRequiredPassed = requiredChecksPassed === requiredChecksTotal

  console.log('📊 Quality Gate Results:')
  console.log(`   Overall Score: ${averageScore}%`)
  console.log(`   Required Checks: ${requiredChecksPassed}/${requiredChecksTotal} passed`)
  console.log(`   Total Violations: ${totalViolations}`)
  console.log('')

  if (allRequiredPassed && averageScore >= 80) {
    console.log('🎉 Quality Gate PASSED!')
    console.log(`Ready to proceed to next phase.`)
    return 0
  }
  else if (allRequiredPassed && averageScore >= 60) {
    console.log('⚠️  Quality Gate PASSED with warnings')
    console.log('Consider addressing violations before proceeding.')
    return 0
  }
  else {
    console.log('🚫 Quality Gate FAILED')
    console.log('Must address required violations before proceeding.')

    const failedRequired = results.filter((r) => r.required && !r.passed)
    if (failedRequired.length > 0) {
      console.log('')
      console.log('Required checks that failed:')
      failedRequired.forEach((result) => {
        console.log(`   ❌ ${result.check}: ${result.details}`)
      })
    }

    return 1
  }
}

/**
 * Main function
 */
async function main () {
  const [phase, featureNumber] = process.argv.slice(2)

  if (!phase || !featureNumber) {
    console.log('Quality Gate Enforcement')
    console.log('')
    console.log('Usage:')
    console.log('  node scripts/quality-gates.js <phase> <feature-number>')
    console.log('')
    console.log('Phases:')
    console.log('  specify   - Specification quality gate')
    console.log('  plan      - Planning quality gate')
    console.log('  tasks     - Task breakdown quality gate')
    console.log('')
    console.log('Examples:')
    console.log('  npm run gate:specify 18')
    console.log('  npm run gate:plan 18')
    console.log('  npm run gate:tasks 18')
    return 1
  }

  try {
    const exitCode = await runQualityGate(phase, parseInt(featureNumber))
    return exitCode
  }
  catch (error) {
    console.error(`❌ Quality gate error: ${error.message}`)
    return 1
  }
}

// Add stub validators for missing functions
function checkImplementationRoadmap (content) {
  const hasPhases = /phase\s+\d+|implementation.?phase/i.test(content)
  const hasDeliverables = /deliverable|milestone|output/i.test(content)
  const hasTimeline = /timeline|schedule|duration/i.test(content)

  const checks = [hasPhases, hasDeliverables, hasTimeline]
  const score = Math.round((checks.filter(Boolean).length / checks.length) * 100)

  return {
    passed: checks.every(Boolean),
    score,
    details: `${checks.filter(Boolean).length}/3 roadmap elements found`,
    violations: checks.every(Boolean) ? [] : ['Implementation roadmap incomplete']
  }
}

function checkRiskAssessment (content) {
  const hasRisks = /risk|threat|challenge/i.test(content)
  const hasMitigation = /mitigation|strategy|contingency/i.test(content)

  return {
    passed: hasRisks && hasMitigation,
    score: (hasRisks && hasMitigation) ? 100 : 50,
    details: hasRisks && hasMitigation ? 'Risk assessment documented' : 'Risk assessment incomplete',
    violations: (hasRisks && hasMitigation) ? [] : ['Risk assessment and mitigation missing']
  }
}

function checkTestStrategy (content) {
  const hasTestStrategy = /test.?strategy|testing.?approach/i.test(content)
  const hasContractFirst = /contract.?first|contract.?test/i.test(content)

  return {
    passed: hasTestStrategy && hasContractFirst,
    score: (hasTestStrategy && hasContractFirst) ? 100 : 50,
    details: hasTestStrategy && hasContractFirst ? 'Test strategy documented' : 'Test strategy incomplete',
    violations: (hasTestStrategy && hasContractFirst) ? [] : ['Contract-first test strategy missing']
  }
}

function checkTaskCompleteness (content) {
  const hasTasks = /task|implementation|deliverable/i.test(content)
  const hasBreakdown = /breakdown|phase|step/i.test(content)

  return {
    passed: hasTasks && hasBreakdown,
    score: (hasTasks && hasBreakdown) ? 100 : 50,
    details: hasTasks && hasBreakdown ? 'Task breakdown documented' : 'Task breakdown incomplete',
    violations: (hasTasks && hasBreakdown) ? [] : ['Complete task breakdown missing']
  }
}

function checkTestFirstSequence (content) {
  const hasSequence = /contract.*integration.*e2e.*unit.*implementation/i.test(content)
    || /test.*first|contract.*test/i.test(content)

  return {
    passed: hasSequence,
    score: hasSequence ? 100 : 0,
    details: hasSequence ? 'Test-first sequence documented' : 'Test-first sequence missing',
    violations: hasSequence ? [] : ['Contract → Integration → E2E → Unit → Implementation sequence not documented']
  }
}

function checkConstitutionalTaskCoverage (content) {
  const result = checkConstitutionalCompliance(content)
  return {
    ...result,
    details: `${result.details} in task breakdown`
  }
}

function checkParallelizationPlan (content) {
  const hasParallel = /parallel|concurrent|independent/i.test(content)
  const hasDependencies = /dependency|depend|blocking|prerequisite/i.test(content)

  return {
    passed: hasParallel && hasDependencies,
    score: (hasParallel && hasDependencies) ? 100 : 50,
    details: hasParallel && hasDependencies ? 'Parallelization plan documented' : 'Parallelization plan incomplete',
    violations: (hasParallel && hasDependencies) ? [] : ['Task parallelization and dependency mapping missing']
  }
}

function checkQualityAssuranceTasks (content) {
  const hasQATasks = /quality.?assurance|validation|compliance.?check/i.test(content)
  const hasValidation = /validate|verify|audit/i.test(content)

  return {
    passed: hasQATasks && hasValidation,
    score: (hasQATasks && hasValidation) ? 100 : 50,
    details: hasQATasks && hasValidation ? 'QA tasks documented' : 'QA tasks incomplete',
    violations: (hasQATasks && hasValidation) ? [] : ['Quality assurance and validation tasks missing']
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().then(process.exit)
}

export { QUALITY_GATES, runQualityGate }
