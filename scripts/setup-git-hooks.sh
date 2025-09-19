#!/bin/bash

# Git Hooks Setup Script for Constitutional Compliance
# F017 Phase 2: Enhanced Workflow Implementation
#
# This script sets up git hooks for continuous constitutional compliance
# monitoring throughout the development workflow.

set -e

echo "🏛️  ESMuseum Constitutional Git Hooks Setup"
echo "=========================================="

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a git repository"
    echo "   Please run this script from the root of your git repository"
    exit 1
fi

# Get git hooks directory
HOOKS_DIR=$(git rev-parse --git-dir)/hooks
CUSTOM_HOOKS_DIR=".githooks"

echo "📁 Git hooks directory: $HOOKS_DIR"
echo "📁 Custom hooks directory: $CUSTOM_HOOKS_DIR"

# Check if custom hooks directory exists
if [ ! -d "$CUSTOM_HOOKS_DIR" ]; then
    echo "❌ Error: Custom hooks directory not found: $CUSTOM_HOOKS_DIR"
    echo "   Please ensure you're in the correct project directory"
    exit 1
fi

echo ""
echo "🔧 Installing Constitutional Git Hooks..."

# Function to install a hook
install_hook() {
    local hook_name=$1
    local source_hook="$CUSTOM_HOOKS_DIR/$hook_name"
    local target_hook="$HOOKS_DIR/$hook_name"
    
    if [ -f "$source_hook" ]; then
        echo "📝 Installing $hook_name hook..."
        
        # Create backup if existing hook exists
        if [ -f "$target_hook" ]; then
            echo "   📋 Backing up existing $hook_name hook to $target_hook.backup"
            cp "$target_hook" "$target_hook.backup"
        fi
        
        # Copy and make executable
        cp "$source_hook" "$target_hook"
        chmod +x "$target_hook"
        
        echo "   ✅ $hook_name hook installed successfully"
    else
        echo "   ⚠️  Warning: $hook_name hook not found in $CUSTOM_HOOKS_DIR"
    fi
}

# Install all hooks
install_hook "pre-commit"
install_hook "commit-msg"
install_hook "post-commit"

echo ""
echo "🎯 Constitutional Git Hooks Configuration:"

# Verify installations
for hook in "pre-commit" "commit-msg" "post-commit"; do
    if [ -x "$HOOKS_DIR/$hook" ]; then
        echo "   ✅ $hook: Installed and executable"
    else
        echo "   ❌ $hook: Not installed or not executable"
    fi
done

echo ""
echo "📋 Constitutional Compliance Enforcement:"
echo ""
echo "🚀 Pre-commit Hook (pre-commit):"
echo "   • ESLint constitutional rules validation"
echo "   • TypeScript compliance checking"
echo "   • Test suite execution"
echo "   • Constitutional pattern validation"
echo "   • Feature specification quality gates"
echo ""
echo "📝 Commit Message Hook (commit-msg):"
echo "   • Commit message format validation"
echo "   • Constitutional reference checking"
echo "   • Feature specification compliance"
echo "   • Automatic constitutional markers"
echo ""
echo "🎉 Post-commit Hook (post-commit):"
echo "   • Constitutional impact analysis"
echo "   • Compliance recommendations"
echo "   • Lightweight validation feedback"
echo "   • Resource guidance and next steps"

echo ""
echo "⚙️  Additional Configuration Options:"

# Check if husky is available for enhanced hook management
if command -v npx &> /dev/null && [ -f "package.json" ]; then
    echo ""
    echo "🔧 Enhanced Hook Management:"
    echo "   To use Husky for enhanced git hook management:"
    echo "   npm install --save-dev husky"
    echo "   npx husky install"
    echo "   npx husky add .husky/pre-commit 'npm run validate:all'"
    echo ""
fi

# Git configuration recommendations
echo "📝 Recommended Git Configuration:"
echo ""
echo "   # Set constitutional compliance as default workflow"
echo "   git config core.hooksPath .githooks"
echo ""
echo "   # Enable detailed commit message validation"
echo "   git config commit.template .gitmessage"
echo ""
echo "   # Configure constitutional compliance aliases"
echo "   git config alias.constitutional-commit 'commit --verbose'"
echo "   git config alias.validate 'commit --dry-run'"

# Create git message template
echo ""
echo "📝 Creating constitutional commit message template..."

cat > .gitmessage << 'EOF'
# Constitutional Commit Message Template
# F017 Phase 2: Enhanced Workflow Implementation

# Format: <type>(<scope>): <description>
# 
# Types:
#   feat: New feature (Article I-IX compliance)
#   fix: Bug fix with constitutional validation
#   docs: Documentation update
#   style: Code style/formatting (no logic change)
#   refactor: Code refactoring with constitutional compliance
#   test: Adding or updating tests (Article III)
#   chore: Maintenance tasks
#   constitutional: Constitutional framework updates
#   F###: Feature specification changes
#
# Constitutional References (when applicable):
# CONSTITUTIONAL: <Article number and compliance description>
# 
# Example:
# feat(tasks): implement enhanced scoring algorithm
# 
# CONSTITUTIONAL: Article II - TypeScript interfaces defined
# CONSTITUTIONAL: Article III - Contract tests implemented
# CONSTITUTIONAL: Article VII - Component modularity maintained
#
# Closes #issue_number (if applicable)
EOF

echo "✅ Git message template created: .gitmessage"

echo ""
echo "🧪 Testing Git Hooks Installation:"

# Test hook executability
echo "🔍 Testing hook permissions..."
for hook in "pre-commit" "commit-msg" "post-commit"; do
    if [ -x "$HOOKS_DIR/$hook" ]; then
        echo "   ✅ $hook: Executable"
    else
        echo "   ❌ $hook: Not executable - fixing permissions..."
        chmod +x "$HOOKS_DIR/$hook" 2>/dev/null || echo "      ⚠️  Could not fix permissions"
    fi
done

echo ""
echo "🎯 Validation Commands:"
echo "   npm run validate:all              # Full constitutional validation"
echo "   npm run validate:constitutional   # Pattern compliance"
echo "   npm run gate:specify <feature>    # Specification quality gate"
echo "   npm run gate:plan <feature>       # Planning quality gate"
echo "   npm run gate:tasks <feature>      # Task breakdown quality gate"

echo ""
echo "✅ Constitutional Git Hooks Setup Complete!"
echo ""
echo "🚀 Next Steps:"
echo "   1. Test hooks with a small commit:"
echo "      git add -A"
echo "      git commit -m 'test: constitutional hooks validation'"
echo ""
echo "   2. Review constitutional framework:"
echo "      cat memory/esmuseum-constitution.md"
echo ""
echo "   3. Start constitutional development:"
echo "      npm run specify 'Feature Name'"
echo ""
echo "🏛️  Constitutional compliance is now enforced automatically!"
echo "   Every commit will validate adherence to all 9 constitutional articles"
echo "   Quality gates ensure feature specifications meet constitutional standards"
echo ""
echo "📚 Resources:"
echo "   • Constitutional Framework: memory/esmuseum-constitution.md"
echo "   • Workflow Documentation: .copilot-workspace/workflows/"
echo "   • Development Commands: npm run workflow"