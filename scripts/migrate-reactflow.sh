#!/bin/bash

# React Flow v11 to v12 Migration Script
# This script automates the migration from reactflow to @xyflow/react

set -e

echo "🚀 Starting React Flow v11 to v12 Migration"
echo "============================================"

# Check if we're in the right directory
if [ ! -f "frontend/package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Backup current state
echo "📦 Creating backup..."
git stash push -m "Pre-ReactFlow-migration-backup" || true

# Navigate to frontend directory
cd frontend

echo "🔍 Checking current React Flow installation..."
if npm list reactflow > /dev/null 2>&1; then
    echo "✅ Found reactflow package"
else
    echo "⚠️  reactflow package not found, continuing anyway..."
fi

# Update package.json (already done, but ensuring it's correct)
echo "📝 Updating package.json..."
if grep -q '"reactflow"' package.json; then
    echo "⚠️  Found old reactflow package in package.json"
    echo "   Please ensure package.json has been updated to use @xyflow/react"
fi

# Install new dependencies
echo "📦 Installing @xyflow/react..."
npm install @xyflow/react@^12.6.0

# Remove old package if it exists
echo "🗑️  Removing old reactflow package..."
npm uninstall reactflow 2>/dev/null || echo "   reactflow was not installed"

# Find and update import statements
echo "🔄 Updating import statements..."

# Create a temporary script to update imports
cat > ../scripts/update-imports.js << 'EOF'
const fs = require('fs');
const path = require('path');

function updateImports(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
            updateImports(filePath);
        } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
            let content = fs.readFileSync(filePath, 'utf8');
            let updated = false;
            
            // Update import statements
            if (content.includes("from 'reactflow'") || content.includes('from "reactflow"')) {
                content = content.replace(/from ['"]reactflow['"]/g, "from '@xyflow/react'");
                updated = true;
            }
            
            // Update CSS imports
            if (content.includes("'reactflow/dist/style.css'") || content.includes('"reactflow/dist/style.css"')) {
                content = content.replace(/['"]reactflow\/dist\/style\.css['"]/g, "'@xyflow/react/dist/style.css'");
                updated = true;
            }
            
            // Update default import to named import
            const defaultImportRegex = /import\s+ReactFlow\s*,\s*\{([^}]+)\}\s*from\s*['"]@xyflow\/react['"]/g;
            if (defaultImportRegex.test(content)) {
                content = content.replace(defaultImportRegex, "import { ReactFlow, $1 } from '@xyflow/react'");
                updated = true;
            }
            
            // Update standalone default import
            const standaloneDefaultRegex = /import\s+ReactFlow\s*from\s*['"]@xyflow\/react['"]/g;
            if (standaloneDefaultRegex.test(content)) {
                content = content.replace(standaloneDefaultRegex, "import { ReactFlow } from '@xyflow/react'");
                updated = true;
            }
            
            if (updated) {
                fs.writeFileSync(filePath, content);
                console.log(`✅ Updated: ${filePath}`);
            }
        }
    });
}

// Start from src directory
updateImports('./src');
console.log('🎉 Import updates completed!');
EOF

# Run the import update script
echo "🔧 Running import update script..."
node ../scripts/update-imports.js

# Clean up the temporary script
rm ../scripts/update-imports.js

# Install dependencies
echo "📦 Installing all dependencies..."
npm install

# Run a quick build test
echo "🧪 Testing build..."
if npm run build > /dev/null 2>&1; then
    echo "✅ Build test passed!"
else
    echo "⚠️  Build test failed. Manual fixes may be required."
    echo "   Common issues:"
    echo "   - Check for any remaining 'reactflow' imports"
    echo "   - Verify ReactFlow is imported as named import: { ReactFlow }"
    echo "   - Update any custom node/edge components"
fi

# Return to project root
cd ..

echo ""
echo "🎉 React Flow migration completed!"
echo "============================================"
echo ""
echo "📋 Next Steps:"
echo "1. Review the changes: git diff"
echo "2. Test your flow components manually"
echo "3. Update any custom node/edge components if needed"
echo "4. Run your test suite: npm test"
echo "5. Commit the changes: git add . && git commit -m 'Migrate to React Flow v12'"
echo ""
echo "📚 Migration Guide: https://reactflow.dev/learn/troubleshooting/migrate-to-v12"
echo ""
echo "⚠️  Important Notes:"
echo "- ReactFlow is now a named export, not default export"
echo "- CSS import path has changed to @xyflow/react/dist/style.css"
echo "- Some advanced features may have API changes"
echo ""
