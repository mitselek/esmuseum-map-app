#!/usr/bin/env bash
#
# sync-from-upstream.sh - Sync spec-kit updates while preserving customizations
#
# Usage: .specify/scripts/sync-from-upstream.sh [--dry-run] [--force]
#
# This script fetches the latest spec-kit from upstream and helps merge updates
# while preserving esmuseum-map-app specific customizations.
#

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SPEC_KIT_REPO="https://github.com/codeium/spec-kit.git"
TEMP_DIR="/tmp/spec-kit-sync-$$"
CUSTOMIZATIONS_FILE=".specify/CUSTOMIZATIONS.md"
SYNC_LOG=".specify/memory/sync-history.log"

# Flags
DRY_RUN=false
FORCE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --force)
      FORCE=true
      shift
      ;;
    --help|-h)
      echo "Usage: $0 [--dry-run] [--force]"
      echo ""
      echo "Options:"
      echo "  --dry-run  Show what would be updated without applying changes"
      echo "  --force    Skip confirmation prompts"
      echo "  --help     Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Utility functions
log_info() {
  echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
  echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
  echo -e "${RED}✗${NC} $1"
}

confirm() {
  if [[ "$FORCE" == "true" ]]; then
    return 0
  fi
  
  read -p "$1 (y/N): " -n 1 -r
  echo
  [[ $REPLY =~ ^[Yy]$ ]]
}

# Check if we're in the correct directory
check_repository() {
  if [[ ! -d ".specify" ]]; then
    log_error "Must run from repository root (directory with .specify/)"
    exit 1
  fi
  
  if [[ ! -f ".specify/memory/constitution.md" ]]; then
    log_error ".specify/memory/constitution.md not found - is spec-kit integrated?"
    exit 1
  fi
  
  log_success "Repository structure validated"
}

# Clone spec-kit to temp directory
clone_upstream() {
  log_info "Cloning spec-kit from $SPEC_KIT_REPO..."
  
  if [[ -d "$TEMP_DIR" ]]; then
    rm -rf "$TEMP_DIR"
  fi
  
  git clone --depth 1 "$SPEC_KIT_REPO" "$TEMP_DIR" &>/dev/null
  
  if [[ $? -eq 0 ]]; then
    log_success "Spec-kit cloned to $TEMP_DIR"
  else
    log_error "Failed to clone spec-kit"
    exit 1
  fi
}

# Compare versions
compare_versions() {
  log_info "Comparing versions..."
  
  local upstream_version=""
  local local_version=""
  
  # Try to extract version from upstream
  if [[ -f "$TEMP_DIR/.specify/VERSION" ]]; then
    upstream_version=$(cat "$TEMP_DIR/.specify/VERSION")
  else
    upstream_version="unknown"
  fi
  
  # Try to extract version from local
  if [[ -f ".specify/VERSION" ]]; then
    local_version=$(cat ".specify/VERSION")
  else
    local_version="unknown"
  fi
  
  echo ""
  echo "Version Comparison:"
  echo "  Local:    $local_version"
  echo "  Upstream: $upstream_version"
  echo ""
  
  if [[ "$local_version" == "$upstream_version" ]]; then
    log_success "Already on latest version"
    return 1
  fi
  
  return 0
}

# Show file differences
show_differences() {
  log_info "Analyzing differences..."
  echo ""
  
  local changed_files=()
  local new_files=()
  local unchanged_files=()
  
  # Files to check (scripts and command templates only - not our customizations)
  local files_to_check=(
    ".specify/scripts/bash/check-prerequisites.sh"
    ".specify/scripts/bash/create-new-feature.sh"
    ".specify/scripts/powershell/check-prerequisites.ps1"
    ".specify/scripts/powershell/create-new-feature.ps1"
    ".specify/templates/commands/specify.md"
    ".specify/templates/commands/clarify.md"
    ".specify/templates/commands/analyze.md"
    ".specify/templates/commands/constitution.md"
  )
  
  for file in "${files_to_check[@]}"; do
    if [[ ! -f "$TEMP_DIR/$file" ]]; then
      continue
    fi
    
    if [[ ! -f "$file" ]]; then
      new_files+=("$file")
    elif ! diff -q "$file" "$TEMP_DIR/$file" &>/dev/null; then
      changed_files+=("$file")
    else
      unchanged_files+=("$file")
    fi
  done
  
  if [[ ${#changed_files[@]} -eq 0 && ${#new_files[@]} -eq 0 ]]; then
    log_success "No upstream changes detected"
    echo ""
    echo "The following files are unchanged:"
    for file in "${unchanged_files[@]}"; do
      echo "  ✓ $file"
    done
    return 1
  fi
  
  if [[ ${#changed_files[@]} -gt 0 ]]; then
    log_warning "Changed files:"
    for file in "${changed_files[@]}"; do
      echo "  • $file"
    done
    echo ""
  fi
  
  if [[ ${#new_files[@]} -gt 0 ]]; then
    log_info "New files:"
    for file in "${new_files[@]}"; do
      echo "  + $file"
    done
    echo ""
  fi
  
  return 0
}

# Show detailed diffs
show_detailed_diffs() {
  log_info "Detailed differences (scripts and commands only):"
  echo ""
  
  local files_to_check=(
    ".specify/scripts/bash/check-prerequisites.sh"
    ".specify/scripts/bash/create-new-feature.sh"
    ".specify/templates/commands/specify.md"
    ".specify/templates/commands/clarify.md"
    ".specify/templates/commands/analyze.md"
    ".specify/templates/commands/constitution.md"
  )
  
  for file in "${files_to_check[@]}"; do
    if [[ -f "$file" && -f "$TEMP_DIR/$file" ]]; then
      if ! diff -q "$file" "$TEMP_DIR/$file" &>/dev/null; then
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "File: $file"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        diff -u "$file" "$TEMP_DIR/$file" || true
        echo ""
      fi
    fi
  done
}

# Apply updates
apply_updates() {
  log_info "Applying updates..."
  
  # Files to sync (scripts and generic command templates only)
  local files_to_sync=(
    ".specify/scripts/bash/check-prerequisites.sh"
    ".specify/scripts/bash/create-new-feature.sh"
    ".specify/scripts/powershell/check-prerequisites.ps1"
    ".specify/scripts/powershell/create-new-feature.ps1"
    ".specify/templates/commands/specify.md"
    ".specify/templates/commands/clarify.md"
    ".specify/templates/commands/analyze.md"
    ".specify/templates/commands/constitution.md"
  )
  
  local updated_count=0
  
  for file in "${files_to_sync[@]}"; do
    if [[ -f "$TEMP_DIR/$file" ]]; then
      if [[ ! -f "$file" ]] || ! diff -q "$file" "$TEMP_DIR/$file" &>/dev/null; then
        cp "$TEMP_DIR/$file" "$file"
        chmod +x "$file" 2>/dev/null || true
        log_success "Updated: $file"
        ((updated_count++))
      fi
    fi
  done
  
  if [[ $updated_count -eq 0 ]]; then
    log_info "No files needed updating"
  else
    log_success "Updated $updated_count file(s)"
  fi
  
  # Log sync event
  mkdir -p "$(dirname "$SYNC_LOG")"
  echo "[$(date +%Y-%m-%d\ %H:%M:%S)] Synced $updated_count file(s) from spec-kit" >> "$SYNC_LOG"
}

# Cleanup
cleanup() {
  if [[ -d "$TEMP_DIR" ]]; then
    rm -rf "$TEMP_DIR"
    log_info "Cleaned up temporary files"
  fi
}

# Main execution
main() {
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  Spec-Kit Upstream Sync"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  
  # Trap cleanup on exit
  trap cleanup EXIT
  
  # Step 1: Validate repository
  check_repository
  
  # Step 2: Clone upstream
  clone_upstream
  
  # Step 3: Compare versions
  if ! compare_versions; then
    if [[ "$FORCE" == "false" ]]; then
      log_info "Run with --force to sync anyway"
      exit 0
    fi
  fi
  
  # Step 4: Show differences
  if ! show_differences; then
    exit 0
  fi
  
  # Step 5: Show detailed diffs if requested
  if [[ "$DRY_RUN" == "true" ]]; then
    show_detailed_diffs
    log_info "Dry run complete - no changes applied"
    exit 0
  fi
  
  # Step 6: Confirm
  echo ""
  log_warning "The following files will be synced (customized templates are preserved):"
  echo "  • Scripts: check-prerequisites.sh, create-new-feature.sh (bash + powershell)"
  echo "  • Commands: specify.md, clarify.md, analyze.md, constitution.md"
  echo ""
  log_warning "The following files will NOT be synced (your customizations):"
  echo "  • Templates: plan-template.md, tasks-template.md, implement.md"
  echo "  • Memory: constitution.md, opportunities.md"
  echo "  • Documentation: All .md files in .specify/"
  echo ""
  
  if ! confirm "Apply these updates?"; then
    log_info "Sync cancelled"
    exit 0
  fi
  
  # Step 7: Apply updates
  apply_updates
  
  # Step 8: Summary
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  log_success "Sync complete!"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "Next steps:"
  echo "  1. Review changes: git diff"
  echo "  2. Test commands: /specify, /clarify, /analyze"
  echo "  3. Update CUSTOMIZATIONS.md if needed"
  echo "  4. Commit: git commit -am 'chore: sync spec-kit updates'"
  echo ""
}

main
