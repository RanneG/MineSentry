#!/bin/bash
# MineSentry GitHub Upload Script
# This script helps you upload the project to GitHub

set -e

echo "🚀 MineSentry GitHub Upload Script"
echo "===================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing git repository..."
    git init
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Check for sensitive files
echo ""
echo "🔍 Checking for sensitive files..."
SENSITIVE_FILES=(".env" "minesentry.db" "venv/" "frontend/node_modules/")
FOUND_SENSITIVE=false

for file in "${SENSITIVE_FILES[@]}"; do
    if [ -e "$file" ] || [ -d "$file" ]; then
        if git check-ignore -q "$file" 2>/dev/null; then
            echo "  ✅ $file is properly ignored"
        else
            echo "  ⚠️  WARNING: $file exists but may not be ignored!"
            FOUND_SENSITIVE=true
        fi
    fi
done

if [ "$FOUND_SENSITIVE" = true ]; then
    echo ""
    echo "⚠️  WARNING: Some sensitive files may not be properly ignored!"
    echo "   Please review .gitignore before proceeding."
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Add all files
echo ""
echo "📝 Adding files to git..."
git add .

# Show what will be committed
echo ""
echo "📋 Files to be committed:"
git status --short | head -20
echo "..."

# Ask for confirmation
echo ""
read -p "Create initial commit? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Aborted. Files are staged but not committed."
    exit 0
fi

# Create commit
echo ""
echo "💾 Creating initial commit..."
git commit -m "feat: Initial commit - MineSentry project

- Bitcoin mining pool monitoring system
- 10 detection methods for censorship detection
- Multi-signature bounty contract system
- React + TypeScript frontend with wallet integration
- FastAPI backend with Charms-based spells
- Comprehensive documentation and security guidelines"

echo "✅ Commit created successfully!"
echo ""

# Instructions for GitHub
echo "📤 Next steps to upload to GitHub:"
echo ""
echo "1. Create a new repository on GitHub:"
echo "   https://github.com/new"
echo ""
echo "2. Repository name: minesentry"
echo "   Description: Decentralized Bitcoin Mining Pool Monitoring & Censorship Detection System"
echo "   DO NOT initialize with README, .gitignore, or license"
echo ""
echo "3. After creating the repository, run:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/minesentry.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "✅ Ready to upload!"
