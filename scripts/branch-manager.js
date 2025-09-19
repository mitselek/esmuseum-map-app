#!/usr/bin/env node

/**
 * Constitutional Branch Manager
 * F017 Phase 3: Quality Gates & Monitoring
 *
 * Manages git branches with constitutional compliance enforcement
 * Integrates with Enhanced Workflow for feature development lifecycle
 */

import { execSync } from 'child_process'
import { promises as fs } from 'fs'

// Constitutional branch patterns
const BRANCH_PATTERNS = {
  feature: /^feature\/F(\d+)-(.+)$/,
  hotfix: /^hotfix\/(.+)$/,
  release: /^release\/v(\d+)\.(\d+)\.(\d+)$/,
  main: /^main$/,
  develop: /^develop$/
}

// Constitutional requirements by branch type
const CONSTITUTIONAL_REQUIREMENTS = {
  main: {
    compliance: 100,
    qualityGates: ['all'],
    protection: 'maximum',
    description: 'Production-ready code with full constitutional compliance'
  },
  develop: {
    compliance: 95,
    qualityGates: ['integration', 'basic'],
    protection: 'high',
    description: 'Integration branch with high constitutional standards'
  },
  feature: {
    compliance: 90,
    qualityGates: ['feature', 'progressive'],
    protection: 'standard',
    description: 'Feature development with constitutional workflow'
  },
  hotfix: {
    compliance: 85,
    qualityGates: ['minimal'],
    protection: 'emergency',
    description: 'Emergency fixes with minimal constitutional requirements'
  },
  release: {
    compliance: 100,
    qualityGates: ['all', 'advanced'],
    protection: 'maximum',
    description: 'Release preparation with complete constitutional audit'
  }
}

/**
 * Get current branch information
 */
function getCurrentBranch () {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim()
  }
  catch (error) {
    throw new Error('Not in a git repository or git not available')
  }
}

/**
 * Validate branch name against constitutional patterns
 */
function validateBranchName (branchName) {
  for (const [type, pattern] of Object.entries(BRANCH_PATTERNS)) {
    if (pattern.test(branchName)) {
      return {
        valid: true,
        type,
        match: branchName.match(pattern),
        requirements: CONSTITUTIONAL_REQUIREMENTS[type]
      }
    }
  }

  return {
    valid: false,
    type: 'unknown',
    match: null,
    requirements: null
  }
}

/**
 * Create feature branch with constitutional setup
 */
async function createFeatureBranch (featureName) {
  console.log('🏛️ Constitutional Feature Branch Creation')
  console.log('=======================================')

  // Get next feature number
  const featureNumber = await getNextFeatureNumber()
  const branchName = `feature/F${featureNumber.toString().padStart(3, '0')}-${featureName}`

  console.log(`📋 Creating feature branch: ${branchName}`)

  // Validate we're on develop or main
  const currentBranch = getCurrentBranch()
  if (!['develop', 'main'].includes(currentBranch)) {
    throw new Error('Feature branches must be created from develop or main branch')
  }

  // Create and checkout branch
  execSync(`git checkout -b ${branchName}`)
  console.log(`✅ Branch created: ${branchName}`)

  // Initialize constitutional workflow
  console.log('🔧 Initializing constitutional workflow...')

  try {
    // Create feature specification
    execSync(`npm run specify "${featureName}"`, { stdio: 'inherit' })
    console.log(`✅ Feature specification created: F${featureNumber}`)

    // Initial commit with constitutional setup
    execSync('git add .copilot-workspace/features/')
    execSync(`git commit -m "feat(F${featureNumber}): initialize constitutional feature

Constitutional workflow setup:
- Feature specification created
- Constitutional compliance framework initialized
- Enhanced workflow ready for planning phase

Branch: ${branchName}
Constitutional requirements: ${CONSTITUTIONAL_REQUIREMENTS.feature.compliance}% compliance
Quality gates: ${CONSTITUTIONAL_REQUIREMENTS.feature.qualityGates.join(', ')}"`)

    console.log('✅ Constitutional setup complete')

    // Display next steps
    console.log('')
    console.log('🚀 Next Steps:')
    console.log(`1. Complete specification: .copilot-workspace/features/F${featureNumber.toString().padStart(3, '0')}-${featureName}.md`)
    console.log(`2. Run planning: npm run plan ${featureNumber}`)
    console.log(`3. Run task breakdown: npm run tasks ${featureNumber}`)
    console.log('4. Begin implementation with constitutional compliance')
    console.log('')
    console.log('💡 Constitutional Requirements:')
    console.log(`   - Minimum compliance: ${CONSTITUTIONAL_REQUIREMENTS.feature.compliance}%`)
    console.log(`   - Quality gates: ${CONSTITUTIONAL_REQUIREMENTS.feature.qualityGates.join(', ')}`)
    console.log('   - All commits must include constitutional compliance statements')
  }
  catch (error) {
    console.error('❌ Constitutional setup failed:', error.message)
    console.log('🔄 Rolling back branch creation...')
    execSync(`git checkout ${currentBranch}`)
    execSync(`git branch -D ${branchName}`)
    throw error
  }

  return {
    branchName,
    featureNumber,
    requirements: CONSTITUTIONAL_REQUIREMENTS.feature
  }
}

/**
 * Get next available feature number
 */
async function getNextFeatureNumber () {
  try {
    const featuresDir = '.copilot-workspace/features'
    const files = await fs.readdir(featuresDir)

    const featureNumbers = files
      .filter((file) => file.match(/^F(\d+)-/))
      .map((file) => parseInt(file.match(/^F(\d+)-/)[1]))
      .sort((a, b) => b - a)

    return featureNumbers.length > 0 ? featureNumbers[0] + 1 : 18
  }
  catch (error) {
    console.warn('⚠️ Could not determine next feature number, using 18')
    return 18
  }
}

/**
 * Validate current branch constitutional compliance
 */
async function validateCurrentBranch () {
  console.log('🏛️ Constitutional Branch Validation')
  console.log('==================================')

  const currentBranch = getCurrentBranch()
  const validation = validateBranchName(currentBranch)

  console.log(`📋 Current branch: ${currentBranch}`)
  console.log(`📊 Branch type: ${validation.type}`)

  if (!validation.valid) {
    console.log('❌ Branch name does not follow constitutional patterns')
    console.log('')
    console.log('🏛️ Constitutional Branch Patterns:')
    console.log('   - feature/F###-feature-name (e.g., feature/F018-user-dashboard)')
    console.log('   - hotfix/description (e.g., hotfix/critical-auth-fix)')
    console.log('   - release/v#.#.# (e.g., release/v1.2.0)')
    console.log('   - main (protected production branch)')
    console.log('   - develop (integration branch)')
    return { valid: false, compliance: 0 }
  }

  const requirements = validation.requirements
  console.log(`📈 Required compliance: ${requirements.compliance}%`)
  console.log(`🔒 Protection level: ${requirements.protection}`)
  console.log(`🔍 Quality gates: ${requirements.qualityGates.join(', ')}`)
  console.log(`📖 Description: ${requirements.description}`)

  // Run constitutional validation
  console.log('')
  console.log('🔍 Running constitutional compliance check...')

  try {
    const result = execSync('npm run validate:constitutional --silent', { encoding: 'utf8' })

    // Parse compliance score from output
    const scoreMatch = result.match(/Score: (\d+)%/)
    const actualCompliance = scoreMatch ? parseInt(scoreMatch[1]) : 0

    console.log(`📊 Current compliance: ${actualCompliance}%`)

    if (actualCompliance >= requirements.compliance) {
      console.log('✅ Constitutional compliance requirements met')
      return { valid: true, compliance: actualCompliance, meetsRequirements: true }
    }
    else {
      console.log(`❌ Constitutional compliance below required ${requirements.compliance}%`)
      console.log(`📈 Gap: ${requirements.compliance - actualCompliance}% improvement needed`)
      return { valid: true, compliance: actualCompliance, meetsRequirements: false }
    }
  }
  catch (error) {
    console.log('❌ Constitutional validation failed')
    console.log('🔧 Run "npm run validate:constitutional" for detailed violations')
    return { valid: true, compliance: 0, meetsRequirements: false }
  }
}

/**
 * Switch to constitutional branch with validation
 */
async function switchBranch (targetBranch) {
  console.log(`🔄 Switching to branch: ${targetBranch}`)

  // Validate target branch exists
  try {
    execSync(`git rev-parse --verify ${targetBranch}`, { stdio: 'ignore' })
  }
  catch (error) {
    throw new Error(`Branch ${targetBranch} does not exist`)
  }

  // Validate current branch state before switching
  const currentValidation = await validateCurrentBranch()
  if (!currentValidation.meetsRequirements) {
    console.log('⚠️ Current branch does not meet constitutional requirements')
    console.log('Consider fixing violations before switching branches')
  }

  // Switch branch
  execSync(`git checkout ${targetBranch}`)
  console.log(`✅ Switched to ${targetBranch}`)

  // Validate new branch
  await validateCurrentBranch()
}

/**
 * List all branches with constitutional status
 */
async function listBranches () {
  console.log('🏛️ Constitutional Branch Overview')
  console.log('================================')

  try {
    const branches = execSync('git branch -a', { encoding: 'utf8' })
      .split('\n')
      .map((line) => line.replace(/^\*?\s+/, '').replace(/^remotes\/origin\//, ''))
      .filter((line) => line && !line.includes('->'))

    const currentBranch = getCurrentBranch()

    for (const branch of branches) {
      const validation = validateBranchName(branch)
      const isCurrent = branch === currentBranch
      const marker = isCurrent ? '→' : ' '

      if (validation.valid) {
        const req = validation.requirements
        console.log(`${marker} ${branch}`)
        console.log(`   Type: ${validation.type} | Compliance: ${req.compliance}% | Protection: ${req.protection}`)
      }
      else {
        console.log(`${marker} ${branch} ⚠️ (non-constitutional pattern)`)
      }
    }
  }
  catch (error) {
    console.error('❌ Failed to list branches:', error.message)
  }
}

/**
 * Setup constitutional governance for repository
 */
async function setupGovernance () {
  console.log('🏛️ Constitutional Governance Setup')
  console.log('=================================')

  // Check if we're in correct repository
  try {
    const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim()
    console.log(`📍 Repository: ${remoteUrl}`)
  }
  catch (error) {
    console.log('⚠️ No remote origin found')
  }

  // Setup develop branch if it doesn't exist
  try {
    execSync('git rev-parse --verify develop', { stdio: 'ignore' })
    console.log('✅ Develop branch exists')
  }
  catch (error) {
    console.log('🔧 Creating develop branch...')
    execSync('git checkout -b develop')
    execSync('git push -u origin develop')
    console.log('✅ Develop branch created and pushed')
  }

  // Ensure we're on develop for setup
  const currentBranch = getCurrentBranch()
  if (currentBranch !== 'develop') {
    execSync('git checkout develop')
  }

  // Install git hooks
  console.log('🔧 Installing constitutional git hooks...')
  try {
    execSync('npm run setup:hooks', { stdio: 'inherit' })
    console.log('✅ Git hooks installed')
  }
  catch (error) {
    console.log('⚠️ Git hooks installation failed')
  }

  console.log('')
  console.log('🚀 Constitutional Governance Ready!')
  console.log('')
  console.log('Next steps:')
  console.log('1. Configure GitHub branch protection rules')
  console.log('2. Set up GitHub Actions workflows')
  console.log('3. Train team on constitutional branching strategy')
  console.log('')
  console.log('Create your first constitutional feature:')
  console.log('  npm run branch:feature "amazing-new-feature"')
}

/**
 * Main CLI interface
 */
async function main () {
  const command = process.argv[2]
  const arg = process.argv[3]

  try {
    switch (command) {
      case 'create-feature':
        if (!arg) {
          console.error('❌ Feature name required: npm run branch:feature "feature-name"')
          process.exit(1)
        }
        await createFeatureBranch(arg)
        break

      case 'validate-current':
        await validateCurrentBranch()
        break

      case 'switch':
        if (!arg) {
          console.error('❌ Target branch required: npm run branch:switch "branch-name"')
          process.exit(1)
        }
        await switchBranch(arg)
        break

      case 'list':
        await listBranches()
        break

      case 'setup':
        await setupGovernance()
        break

      default:
        console.log('🏛️ Constitutional Branch Manager')
        console.log('')
        console.log('Available commands:')
        console.log('  create-feature <name>  Create new feature branch with constitutional setup')
        console.log('  validate-current       Validate current branch constitutional compliance')
        console.log('  switch <branch>        Switch to branch with constitutional validation')
        console.log('  list                   List all branches with constitutional status')
        console.log('  setup                  Setup constitutional governance for repository')
        console.log('')
        console.log('Examples:')
        console.log('  npm run branch:feature "user-dashboard"')
        console.log('  npm run branch:validate')
        console.log('  npm run branch:switch develop')
        break
    }
  }
  catch (error) {
    console.error('❌ Constitutional branch operation failed:', error.message)
    process.exit(1)
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().then(() => process.exit(0)).catch(() => process.exit(1))
}

export {
  createFeatureBranch, getCurrentBranch, listBranches,
  setupGovernance, switchBranch, validateBranchName, validateCurrentBranch
}
