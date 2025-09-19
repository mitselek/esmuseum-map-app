#!/usr/bin/env node

/**
 * Constitutional Monitoring Dashboard
 * F017 Phase 3: Quality Gates & Monitoring
 *
 * Generates comprehensive constitutional compliance monitoring and analytics
 */

import { exec } from 'child_process'
import fs from 'fs/promises'
import path from 'path'
import { promisify } from 'util'

const execAsync = promisify(exec)

class ConstitutionalMonitoring {
  constructor () {
    this.metrics = {
      compliance: {},
      quality: {},
      performance: {},
      trends: {}
    }

    this.reportDir = '.copilot-workspace/monitoring'
  }

  /**
   * Collect constitutional compliance metrics
   */
  async collectComplianceMetrics () {
    console.log('📊 Collecting constitutional compliance metrics...')

    try {
      // Run constitutional validator
      const { stdout } = await execAsync('npm run validate:constitutional')

      // Parse compliance score
      const scoreMatch = stdout.match(/Score: (\d+)%/)
      const complianceScore = scoreMatch ? parseInt(scoreMatch[1]) : 0

      // Parse article compliance
      const articles = {}
      const articleMatches = stdout.match(/Article ([IVX]+): ([^:]+): (✅|❌|⚠️)/g) || []

      articleMatches.forEach((match) => {
        const [, number, name, status] = match.match(/Article ([IVX]+): ([^:]+): (✅|❌|⚠️)/)
        articles[number] = {
          name: name.trim(),
          status: status === '✅' ? 'pass' : status === '❌' ? 'fail' : 'warning',
          compliance: status === '✅' ? 100 : status === '❌' ? 0 : 50
        }
      })

      this.metrics.compliance = {
        overall: complianceScore,
        articles,
        timestamp: new Date().toISOString(),
        trend: await this.calculateComplianceTrend(complianceScore)
      }

      console.log(`✅ Constitutional compliance: ${complianceScore}%`)
    }
    catch (error) {
      console.error('❌ Failed to collect compliance metrics:', error.message)
      this.metrics.compliance.error = error.message
    }
  }

  /**
   * Collect quality gate metrics
   */
  async collectQualityMetrics () {
    console.log('🔧 Collecting quality gate metrics...')

    const qualityChecks = {
      eslint: { command: 'npm run lint', weight: 25 },
      typescript: { command: 'npm run validate:typescript', weight: 25 },
      tests: { command: 'npm run test', weight: 30 },
      coverage: { command: 'npm run validate:coverage', weight: 20 }
    }

    const results = {}
    let totalScore = 0

    for (const [check, config] of Object.entries(qualityChecks)) {
      try {
        console.log(`  Running ${check}...`)
        const { stdout, stderr } = await execAsync(config.command)

        // Parse results based on check type
        let score = 0
        let details = ''

        switch (check) {
          case 'eslint':
            const errorCount = (stderr.match(/\d+ error/g) || []).length
            const warningCount = (stderr.match(/\d+ warning/g) || []).length
            score = Math.max(0, 100 - (errorCount * 10) - (warningCount * 2))
            details = `${errorCount} errors, ${warningCount} warnings`
            break

          case 'typescript':
            score = stderr.includes('error') ? 0 : 100
            details = stderr.includes('error') ? 'Type errors present' : 'No type errors'
            break

          case 'tests':
            const testMatch = stdout.match(/(\d+) passed/)
            const passedTests = testMatch ? parseInt(testMatch[1]) : 0
            const failMatch = stdout.match(/(\d+) failed/)
            const failedTests = failMatch ? parseInt(failMatch[1]) : 0
            score = failedTests === 0 ? 100 : Math.max(0, (passedTests / (passedTests + failedTests)) * 100)
            details = `${passedTests} passed, ${failedTests} failed`
            break

          case 'coverage':
            const coverageMatch = stdout.match(/All files[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*(\d+\.?\d*)/)
            const coverage = coverageMatch ? parseFloat(coverageMatch[1]) : 0
            score = coverage
            details = `${coverage}% coverage`
            break
        }

        results[check] = {
          score: Math.round(score),
          details,
          weight: config.weight,
          status: score >= 80 ? 'pass' : score >= 60 ? 'warning' : 'fail'
        }

        totalScore += (score * config.weight / 100)
      }
      catch (error) {
        results[check] = {
          score: 0,
          details: error.message,
          weight: config.weight,
          status: 'error'
        }
      }
    }

    this.metrics.quality = {
      overall: Math.round(totalScore),
      checks: results,
      timestamp: new Date().toISOString()
    }

    console.log(`✅ Quality gates score: ${Math.round(totalScore)}%`)
  }

  /**
   * Collect performance metrics
   */
  async collectPerformanceMetrics () {
    console.log('🚀 Collecting performance metrics...')

    try {
      // Basic file analysis
      const { stdout: fileCount } = await execAsync('find app -name "*.vue" -o -name "*.ts" -o -name "*.js" | wc -l')
      const { stdout: lineCount } = await execAsync('find app -name "*.vue" -o -name "*.ts" -o -name "*.js" | xargs wc -l | tail -1')

      // Bundle size (if build exists)
      let bundleSize = 0
      try {
        const { stdout: duOutput } = await execAsync('du -sh .output 2>/dev/null || echo "0B"')
        bundleSize = duOutput.trim().split('\t')[0]
      }
      catch (error) {
        bundleSize = 'Not built'
      }

      // Git metrics
      const { stdout: commitCount } = await execAsync('git log --oneline | wc -l')
      const { stdout: lastCommit } = await execAsync('git log -1 --format="%cr"')

      this.metrics.performance = {
        codebase: {
          files: parseInt(fileCount.trim()),
          lines: parseInt(lineCount.trim().split(' ')[0]),
          bundleSize
        },
        development: {
          commits: parseInt(commitCount.trim()),
          lastCommit: lastCommit.trim(),
          velocity: await this.calculateDevelopmentVelocity()
        },
        timestamp: new Date().toISOString()
      }

      console.log(`✅ Performance metrics collected`)
    }
    catch (error) {
      console.error('❌ Failed to collect performance metrics:', error.message)
      this.metrics.performance.error = error.message
    }
  }

  /**
   * Calculate compliance trend
   */
  async calculateComplianceTrend (currentScore) {
    try {
      const historyFile = path.join(this.reportDir, 'compliance-history.json')

      let history = []
      try {
        const historyData = await fs.readFile(historyFile, 'utf8')
        history = JSON.parse(historyData)
      }
      catch (error) {
        // History file doesn't exist yet
      }

      // Add current score to history
      history.push({
        score: currentScore,
        timestamp: new Date().toISOString()
      })

      // Keep only last 30 entries
      history = history.slice(-30)

      // Save updated history
      await fs.mkdir(this.reportDir, { recursive: true })
      await fs.writeFile(historyFile, JSON.stringify(history, null, 2))

      // Calculate trend
      if (history.length < 2) return 'stable'

      const recent = history.slice(-5).map((h) => h.score)
      const older = history.slice(-10, -5).map((h) => h.score) || recent

      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
      const olderAvg = older.reduce((a, b) => a + b, 0) / older.length

      const change = recentAvg - olderAvg

      if (change > 5) return 'improving'
      if (change < -5) return 'declining'
      return 'stable'
    }
    catch (error) {
      return 'unknown'
    }
  }

  /**
   * Calculate development velocity
   */
  async calculateDevelopmentVelocity () {
    try {
      // Commits in last 7 days
      const { stdout: weeklyCommits } = await execAsync('git log --since="7 days ago" --oneline | wc -l')

      // Features completed (F### pattern in commits)
      const { stdout: featureCommits } = await execAsync('git log --since="30 days ago" --grep="^F[0-9]" --oneline | wc -l')

      return {
        commitsPerWeek: parseInt(weeklyCommits.trim()),
        featuresPerMonth: parseInt(featureCommits.trim())
      }
    }
    catch (error) {
      return { commitsPerWeek: 0, featuresPerMonth: 0 }
    }
  }

  /**
   * Generate HTML dashboard
   */
  async generateHTMLDashboard () {
    console.log('📈 Generating constitutional monitoring dashboard...')

    const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🏛️ Constitutional Monitoring Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f7fa; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #2d3748; margin-bottom: 10px; }
        .header p { color: #718096; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .card { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .card h3 { color: #2d3748; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; }
        .metric { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .metric:last-child { margin-bottom: 0; }
        .metric-label { color: #4a5568; }
        .metric-value { font-weight: 600; }
        .score { font-size: 2em; font-weight: bold; text-align: center; margin: 10px 0; }
        .score.excellent { color: #38a169; }
        .score.good { color: #3182ce; }
        .score.warning { color: #d69e2e; }
        .score.poor { color: #e53e3e; }
        .status { padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight: 500; }
        .status.pass { background: #c6f6d5; color: #22543d; }
        .status.warning { background: #faf089; color: #744210; }
        .status.fail { background: #fed7d7; color: #742a2a; }
        .articles { list-style: none; }
        .articles li { display: flex; justify-content: space-between; align-items: center; margin: 8px 0; }
        .trend { display: inline-flex; align-items: center; gap: 4px; font-size: 0.9em; }
        .trend.improving { color: #38a169; }
        .trend.declining { color: #e53e3e; }
        .trend.stable { color: #3182ce; }
        .footer { text-align: center; color: #718096; font-size: 0.9em; }
        .timestamp { color: #a0aec0; font-size: 0.8em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏛️ Constitutional Monitoring Dashboard</h1>
            <p>F017 Phase 3: Quality Gates & Monitoring</p>
            <div class="timestamp">Last updated: ${new Date().toLocaleString()}</div>
        </div>

        <div class="grid">
            <!-- Constitutional Compliance -->
            <div class="card">
                <h3>🏛️ Constitutional Compliance</h3>
                <div class="score ${this.getScoreClass(this.metrics.compliance.overall || 0)}">
                    ${this.metrics.compliance.overall || 0}%
                </div>
                <div class="trend ${this.metrics.compliance.trend || 'stable'}">
                    ${this.getTrendIcon(this.metrics.compliance.trend || 'stable')} ${this.metrics.compliance.trend || 'stable'}
                </div>
                <ul class="articles">
                    ${Object.entries(this.metrics.compliance.articles || {}).map(([num, article]) => `
                    <li>
                        <span>Article ${num}: ${article.name}</span>
                        <span class="status ${article.status}">${this.getStatusIcon(article.status)}</span>
                    </li>
                    `).join('')}
                </ul>
            </div>

            <!-- Quality Gates -->
            <div class="card">
                <h3>🔧 Quality Gates</h3>
                <div class="score ${this.getScoreClass(this.metrics.quality.overall || 0)}">
                    ${this.metrics.quality.overall || 0}%
                </div>
                ${Object.entries(this.metrics.quality.checks || {}).map(([check, result]) => `
                <div class="metric">
                    <span class="metric-label">${check.charAt(0).toUpperCase() + check.slice(1)}</span>
                    <div>
                        <span class="metric-value">${result.score}%</span>
                        <span class="status ${result.status}">${this.getStatusIcon(result.status)}</span>
                    </div>
                </div>
                `).join('')}
            </div>

            <!-- Performance Metrics -->
            <div class="card">
                <h3>🚀 Performance Metrics</h3>
                <div class="metric">
                    <span class="metric-label">Files</span>
                    <span class="metric-value">${this.metrics.performance.codebase?.files || 0}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Lines of Code</span>
                    <span class="metric-value">${this.metrics.performance.codebase?.lines || 0}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Bundle Size</span>
                    <span class="metric-value">${this.metrics.performance.codebase?.bundleSize || 'N/A'}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Commits/Week</span>
                    <span class="metric-value">${this.metrics.performance.development?.commitsPerWeek || 0}</span>
                </div>
            </div>

            <!-- Development Velocity -->
            <div class="card">
                <h3>📊 Development Velocity</h3>
                <div class="metric">
                    <span class="metric-label">Total Commits</span>
                    <span class="metric-value">${this.metrics.performance.development?.commits || 0}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Features/Month</span>
                    <span class="metric-value">${this.metrics.performance.development?.featuresPerMonth || 0}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Last Commit</span>
                    <span class="metric-value">${this.metrics.performance.development?.lastCommit || 'N/A'}</span>
                </div>
            </div>
        </div>

        <div class="footer">
            <p>Constitutional governance powered by F017 Enhanced Workflow</p>
        </div>
    </div>
</body>
</html>`

    const dashboardPath = path.join(this.reportDir, 'dashboard.html')
    await fs.mkdir(this.reportDir, { recursive: true })
    await fs.writeFile(dashboardPath, template)

    console.log(`✅ Dashboard generated: ${dashboardPath}`)
    return dashboardPath
  }

  /**
   * Helper methods for dashboard rendering
   */
  getScoreClass (score) {
    if (score >= 90) return 'excellent'
    if (score >= 75) return 'good'
    if (score >= 60) return 'warning'
    return 'poor'
  }

  getTrendIcon (trend) {
    switch (trend) {
      case 'improving': return '📈'
      case 'declining': return '📉'
      case 'stable': return '📊'
      default: return '❓'
    }
  }

  getStatusIcon (status) {
    switch (status) {
      case 'pass': return '✅'
      case 'warning': return '⚠️'
      case 'fail': return '❌'
      case 'error': return '🚫'
      default: return '❓'
    }
  }

  /**
   * Generate JSON report
   */
  async generateJSONReport () {
    const reportPath = path.join(this.reportDir, 'metrics.json')
    await fs.writeFile(reportPath, JSON.stringify(this.metrics, null, 2))
    console.log(`✅ JSON report generated: ${reportPath}`)
    return reportPath
  }

  /**
   * Main monitoring function
   */
  async monitor () {
    console.log('🏛️ Starting constitutional monitoring...')
    console.log('')

    try {
      await this.collectComplianceMetrics()
      await this.collectQualityMetrics()
      await this.collectPerformanceMetrics()

      const dashboardPath = await this.generateHTMLDashboard()
      const reportPath = await this.generateJSONReport()

      console.log('')
      console.log('✅ Constitutional monitoring complete!')
      console.log('')
      console.log('📈 Reports generated:')
      console.log(`  - Dashboard: ${dashboardPath}`)
      console.log(`  - JSON Report: ${reportPath}`)
      console.log('')
      console.log('🏛️ Constitutional Status Summary:')
      console.log(`  - Compliance: ${this.metrics.compliance.overall || 0}% (${this.metrics.compliance.trend || 'unknown'})`)
      console.log(`  - Quality Gates: ${this.metrics.quality.overall || 0}%`)
      console.log(`  - Development Velocity: ${this.metrics.performance.development?.commitsPerWeek || 0} commits/week`)
    }
    catch (error) {
      console.error('❌ Constitutional monitoring failed:', error.message)
      process.exit(1)
    }
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new ConstitutionalMonitoring()

  const command = process.argv[2]

  switch (command) {
    case 'monitor':
    case 'run':
      monitor.monitor()
      break

    case 'compliance':
      monitor.collectComplianceMetrics()
        .then(() => console.log('✅ Compliance metrics collected'))
      break

    case 'quality':
      monitor.collectQualityMetrics()
        .then(() => console.log('✅ Quality metrics collected'))
      break

    case 'performance':
      monitor.collectPerformanceMetrics()
        .then(() => console.log('✅ Performance metrics collected'))
      break

    case 'dashboard':
      monitor.monitor()
        .then(() => {
          const dashboardPath = path.resolve('.copilot-workspace/monitoring/dashboard.html')
          console.log(`🌐 Open dashboard: file://${dashboardPath}`)
        })
      break

    default:
      console.log('🏛️ Constitutional Monitoring Dashboard')
      console.log('')
      console.log('Usage:')
      console.log('  npm run monitor           - Full monitoring cycle')
      console.log('  npm run monitor:dashboard - Generate and show dashboard')
      console.log('  npm run monitor:compliance - Compliance metrics only')
      console.log('  npm run monitor:quality   - Quality metrics only')
      console.log('  npm run monitor:performance - Performance metrics only')
  }
}

export default ConstitutionalMonitoring
