#!/bin/bash

# VS Code Personal Assistant - Development Setup Script

echo "🚀 Setting up VS Code Personal Assistant Development Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 16.x or higher.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"

# Check for npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm found: $(npm --version)${NC}"

# Navigate to extension directory
cd vscode-extension

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

# Build the extension
echo -e "${YELLOW}🔨 Building extension...${NC}"
npm run compile

# Create sample .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 Creating .env file...${NC}"
    cat > .env << EOL
# AI Provider API Keys (optional)
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Development Settings
NODE_ENV=development
LOG_LEVEL=debug
EOL
    echo -e "${GREEN}✅ .env file created (please add your API keys)${NC}"
fi

# Install VS Code Extension Manager (vsce) globally
echo -e "${YELLOW}🔧 Installing VS Code Extension Manager...${NC}"
npm install -g vsce

# Create launch configuration for VS Code
if [ ! -d ../.vscode ]; then
    mkdir -p ../.vscode
fi

if [ ! -f ../.vscode/launch.json ]; then
    echo -e "${YELLOW}🚀 Creating VS Code launch configuration...${NC}"
    cat > ../.vscode/launch.json << EOL
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Run Extension",
            "type": "extensionHost",
            "request": "launch",
            "args": [
                "--extensionDevelopmentPath=\${workspaceFolder}/vscode-extension"
            ],
            "outFiles": [
                "\${workspaceFolder}/vscode-extension/out/**/*.js"
            ],
            "preLaunchTask": "\${defaultBuildTask}"
        },
        {
            "name": "Extension Tests",
            "type": "extensionHost",
            "request": "launch",
            "args": [
                "--extensionDevelopmentPath=\${workspaceFolder}/vscode-extension",
                "--extensionTestsPath=\${workspaceFolder}/vscode-extension/out/test/suite/index"
            ],
            "outFiles": [
                "\${workspaceFolder}/vscode-extension/out/test/**/*.js"
            ],
            "preLaunchTask": "\${defaultBuildTask}"
        }
    ]
}
EOL
    echo -e "${GREEN}✅ Launch configuration created${NC}"
fi

# Create tasks configuration
if [ ! -f ../.vscode/tasks.json ]; then
    echo -e "${YELLOW}⚙️ Creating VS Code tasks configuration...${NC}"
    cat > ../.vscode/tasks.json << EOL
{
    "version": "2.0.0",
    "tasks": [
        {
            "type": "npm",
            "script": "watch",
            "problemMatcher": "\$tsc-watch",
            "isBackground": true,
            "presentation": {
                "reveal": "never"
            },
            "group": {
                "kind": "build",
                "isDefault": true
            },
            "options": {
                "cwd": "\${workspaceFolder}/vscode-extension"
            }
        },
        {
            "type": "npm",
            "script": "compile",
            "group": "build",
            "problemMatcher": "\$tsc",
            "options": {
                "cwd": "\${workspaceFolder}/vscode-extension"
            }
        },
        {
            "type": "npm",
            "script": "test",
            "group": "test",
            "options": {
                "cwd": "\${workspaceFolder}/vscode-extension"
            }
        }
    ]
}
EOL
    echo -e "${GREEN}✅ Tasks configuration created${NC}"
fi

echo -e "${GREEN}✨ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Add your API keys to vscode-extension/.env (optional)"
echo "2. Open VS Code in the project root"
echo "3. Press F5 to launch the extension in a new VS Code window"
echo "4. Use Ctrl+Alt+N (Cmd+Alt+N on Mac) to create your first note"
echo ""
echo -e "${YELLOW}📚 Documentation:${NC} docs/"
echo -e "${YELLOW}🐛 Issues:${NC} https://github.com/yourusername/vscode-personal-assistant/issues"