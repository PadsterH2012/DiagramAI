#!/bin/bash

# DiagramAI MCP Server Installation Script
# This script sets up the standalone MCP server for use with Augment

set -e

echo "🚀 Installing DiagramAI MCP Server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ is required. Current version: $(node -v)"
    exit 1
fi

# Create installation directory
INSTALL_DIR="$HOME/.local/share/diagramai-mcp"
mkdir -p "$INSTALL_DIR"

echo "📁 Installing to: $INSTALL_DIR"

# Copy files
cp standalone-server.js "$INSTALL_DIR/"
cp package-standalone.json "$INSTALL_DIR/package.json"

# Install dependencies
cd "$INSTALL_DIR"
npm install --production

# Make executable
chmod +x "$INSTALL_DIR/standalone-server.js"

# Create symlink for global access
mkdir -p "$HOME/.local/bin"
ln -sf "$INSTALL_DIR/standalone-server.js" "$HOME/.local/bin/diagramai-mcp"

echo "✅ DiagramAI MCP Server installed successfully!"
echo ""
echo "📋 Add this to your Augment configuration:"
echo ""
echo '"augment.advanced": {'
echo '    "mcpServers": ['
echo '        {'
echo '            "name": "diagramai",'
echo '            "command": "node",'
echo "            \"args\": [\"$INSTALL_DIR/standalone-server.js\"]"
echo '        }'
echo '    ]'
echo '}'
echo ""
echo "🔧 Alternative configuration (if ~/.local/bin is in PATH):"
echo ""
echo '"augment.advanced": {'
echo '    "mcpServers": ['
echo '        {'
echo '            "name": "diagramai",'
echo '            "command": "diagramai-mcp"'
echo '        }'
echo '    ]'
echo '}'
echo ""
echo "🧪 Test the server with:"
echo "node $INSTALL_DIR/standalone-server.js"
