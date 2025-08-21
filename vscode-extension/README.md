# VS Code Personal Assistant Extension

An AI-powered personal assistant for VS Code with Obsidian-inspired knowledge management features.

## 🚀 Features

- **Vault-Based Knowledge System**: Organize notes in a structured vault with automatic indexing
- **Bidirectional Linking**: Wiki-style `[[Note Name]]` links with hover previews and auto-completion
- **Knowledge Graph**: Interactive D3.js visualization of note connections
- **AI Integration**: OpenAI and Anthropic Claude support for intelligent features
- **Smart Templates**: Dynamic templates with AI-powered content generation
- **Task Management**: Extract and track tasks from markdown files
- **Beautiful UI**: Apple-inspired design with frozen glass effects and prism animations

## 📦 Installation

### Prerequisites

- Node.js 16.x or higher
- VS Code 1.74.0 or higher
- npm or yarn

### Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd vscode-as-personal-assistant/vscode-extension

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes
npm run watch
```

### Running the Extension

1. Open the project in VS Code
2. Press `F5` to open a new VS Code window with the extension loaded
3. Use `Ctrl+Alt+N` (Windows/Linux) or `Cmd+Alt+N` (Mac) to create your first note

## 🎮 Commands

| Command | Shortcut | Description |
|---------|----------|-------------|
| Create New Note | `Ctrl+Alt+N` | Create a new note in the vault |
| Show Knowledge Graph | `Ctrl+Alt+G` | Display interactive graph visualization |
| Search Vault | `Ctrl+Alt+F` | Search across all notes |
| Open AI Chat | `Ctrl+Alt+C` | Open the AI assistant chat |
| Insert Wiki Link | `Ctrl+Alt+L` | Insert a link to another note |

## ⚙️ Configuration

Configure the extension in VS Code settings:

```json
{
  "assistant.vaultPath": ".assistant-vault",
  "assistant.aiProvider": "auto",
  "assistant.openaiKey": "your-api-key",
  "assistant.anthropicKey": "your-api-key",
  "assistant.theme": "auto",
  "assistant.graphLayout": "force"
}
```

## 🏗️ Architecture

```
src/
├── extension.ts          # Extension entry point
├── vault/               # Vault management
│   └── VaultManager.ts
├── providers/           # VS Code providers
│   └── LinkProvider.ts
├── graph/              # Graph visualization
│   └── GraphEngine.ts
├── ai/                 # AI integrations
│   └── AIManager.ts
├── templates/          # Template system
│   └── TemplateEngine.ts
├── commands/           # Command handlers
│   └── CommandManager.ts
├── views/              # WebView and tree views
│   └── ViewProviders.ts
└── utils/              # Utilities
    └── Logger.ts
```

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Run integration tests
npm run test:integration
```

## 📝 Development

### Adding a New Command

1. Define the command in `package.json`
2. Add handler in `CommandManager.ts`
3. Register in `extension.ts`

### Creating a New View

1. Define view in `package.json`
2. Create provider in `views/`
3. Register in `ViewProviders.ts`

### Adding AI Provider

1. Implement provider interface in `ai/`
2. Register in `AIManager.ts`
3. Add configuration options

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT

## 🙏 Acknowledgments

- Inspired by [Obsidian](https://obsidian.md)
- Built with VS Code Extension API
- UI design inspired by Apple's design language

## 🐛 Known Issues

- Graph visualization performance with 1000+ notes
- AI provider rate limiting
- WebView state persistence

## 🚀 Roadmap

- [ ] Voice input support
- [ ] Multi-vault support
- [ ] Plugin system
- [ ] Mobile companion app
- [ ] Real-time collaboration

## 📞 Support

- [GitHub Issues](https://github.com/yourusername/vscode-personal-assistant/issues)
- [Documentation](./docs)
- [Discord Community](#)