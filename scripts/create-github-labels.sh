#!/bin/bash

# Script to create GitHub labels for esmuseum-map-app
# Run with: bash scripts/create-github-labels.sh

set -e

echo "Creating GitHub labels for esmuseum-map-app..."
echo ""

# Priority Labels
echo "Creating priority labels..."
gh label create "priority-p0" --description "Critical: blocks users or causes data loss" --color "d73a4a" --force
gh label create "priority-p1" --description "High priority: significant impact" --color "e99695" --force
gh label create "priority-p2" --description "Medium priority: should fix soon" --color "fbca04" --force
gh label create "priority-p3" --description "Low priority: nice to have" --color "0e8a16" --force

# Type Labels
echo "Creating type labels..."
gh label create "bug" --description "Something isn't working" --color "d73a4a" --force
gh label create "feature" --description "New feature request" --color "a2eeef" --force
gh label create "enhancement" --description "Improvement to existing feature" --color "84b6eb" --force
gh label create "refactor" --description "Code improvement without behavior change" --color "d4c5f9" --force
gh label create "documentation" --description "Documentation updates" --color "0075ca" --force

# Constitutional Compliance Labels
echo "Creating constitutional compliance labels..."
gh label create "type-safety" --description "TypeScript type safety issues" --color "5319e7" --force
gh label create "test-coverage" --description "Needs tests or test improvements" --color "c2e0c6" --force
gh label create "composable-first" --description "Should use composable pattern" --color "bfdadc" --force
gh label create "observable-development" --description "Needs logging/error boundaries" --color "f9d0c4" --force
gh label create "integration-testing" --description "Requires integration tests" --color "c5def5" --force

# Area Labels
echo "Creating area labels..."
gh label create "area-ui" --description "User interface components" --color "fef2c0" --force
gh label create "area-api" --description "Server API endpoints" --color "fef2c0" --force
gh label create "area-auth" --description "Authentication/authorization" --color "fef2c0" --force
gh label create "area-map" --description "Map/Leaflet functionality" --color "fef2c0" --force
gh label create "area-entu" --description "Entu integration" --color "fef2c0" --force
gh label create "area-i18n" --description "Internationalization" --color "fef2c0" --force

# Status Labels
echo "Creating status labels..."
gh label create "status-investigating" --description "Root cause analysis in progress" --color "ededed" --force
gh label create "status-ready" --description "Ready for implementation" --color "0e8a16" --force
gh label create "status-in-progress" --description "Currently being worked on" --color "fbca04" --force
gh label create "status-blocked" --description "Blocked by dependencies" --color "b60205" --force

# Quality Labels
echo "Creating quality labels..."
gh label create "ux-improvement" --description "User experience enhancement" --color "d876e3" --force
gh label create "performance" --description "Performance optimization" --color "ff6b6b" --force
gh label create "security" --description "Security-related issue" --color "b60205" --force
gh label create "technical-debt" --description "Code quality improvement" --color "d4c5f9" --force

echo ""
echo "✓ All labels created successfully!"
echo ""
echo "Label Summary:"
echo "  - Priority: 4 labels (p0-p3)"
echo "  - Type: 5 labels (bug, feature, enhancement, refactor, documentation)"
echo "  - Constitutional: 5 labels (type-safety, test-coverage, composable-first, observable-development, integration-testing)"
echo "  - Area: 6 labels (ui, api, auth, map, entu, i18n)"
echo "  - Status: 4 labels (investigating, ready, in-progress, blocked)"
echo "  - Quality: 4 labels (ux-improvement, performance, security, technical-debt)"
echo ""
echo "Total: 28 labels"
