# Personal AI Assistant for VS Code

An intelligent personal assistant for Visual Studio Code that combines AI-powered features with Obsidian-inspired knowledge management.

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![VS Code](https://img.shields.io/badge/VS%20Code-1.74.0%2B-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9%2B-blue)

## ✨ Features

### 🧠 Knowledge Management
- **Vault System**: Organize notes in a structured, searchable vault
- **Bidirectional Linking**: Wiki-style `[[Note Name]]` links with auto-completion
- **Knowledge Graph**: Interactive visualization of note connections
- **Smart Search**: Semantic search powered by AI embeddings

### 🤖 AI Integration
- **Multiple Providers**: Support for OpenAI GPT and Anthropic Claude
- **Smart Templates**: AI-powered note generation and templates
- **Auto-Tagging**: Intelligent tag suggestions based on content
- **Context-Aware Completion**: AI assistance that understands your vault

### 🎨 Beautiful Design
- **Apple-Inspired UI**: Cutting-edge design with frozen glass effects
- **Prism Animations**: Beautiful visual effects and smooth transitions
- **Light/Dark Themes**: Carefully crafted themes for any preference
- **Customizable Background**: Upload and customize your workspace

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/Clemens865/Personal-AI-Assistant.git
cd Personal-AI-Assistant

# Run setup script
chmod +x setup.sh
./setup.sh

# Or manually install
cd vscode-extension
npm install
npm run compile
```

### Development

1. Open the project in VS Code
2. Press `F5` to launch a new VS Code window with the extension
3. Use `Ctrl+Alt+N` (Windows/Linux) or `Cmd+Alt+N` (Mac) to create your first note

## 📸 Screenshots

### Knowledge Graph
![Knowledge Graph](docs/images/graph-preview.png)

### AI Chat Interface
![AI Chat](docs/images/chat-preview.png)

### Vault Explorer
![Vault Explorer](docs/images/vault-preview.png)

## 🛠️ Architecture

The extension is built with a modular architecture:

```
vscode-extension/
├── src/
│   ├── extension.ts        # Extension entry point
│   ├── vault/             # Vault management system
│   ├── providers/         # VS Code language providers
│   ├── graph/             # Knowledge graph visualization
│   ├── ai/                # AI integrations
│   ├── templates/         # Template engine
│   ├── commands/          # Command handlers
│   └── views/             # WebView and UI components
```

## 🎯 Roadmap

- [x] Basic vault system
- [x] Wiki-link support
- [ ] Knowledge graph visualization
- [ ] AI chat interface
- [ ] Voice input
- [ ] Plugin system
- [ ] Real-time collaboration
- [ ] Mobile companion app

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a pull request

## 📚 Documentation

- [User Guide](docs/user-guide.md)
- [API Documentation](docs/api.md)
- [Architecture Overview](docs/technical-architecture-obsidian.md)
- [Obsidian Features Integration](docs/obsidian-features-integration-plan.md)

## 🐛 Known Issues

- Graph performance with 1000+ notes
- WebView state persistence on reload
- AI rate limiting with free tier APIs

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [Obsidian](https://obsidian.md) knowledge management
- Built with [VS Code Extension API](https://code.visualstudio.com/api)
- UI design inspired by Apple's design language
- AI powered by [OpenAI](https://openai.com) and [Anthropic](https://anthropic.com)

## 💬 Support

- [GitHub Issues](https://github.com/Clemens865/Personal-AI-Assistant/issues)
- [Discussions](https://github.com/Clemens865/Personal-AI-Assistant/discussions)
- [Discord Community](https://discord.gg/your-invite-link)

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Clemens865/Personal-AI-Assistant&type=Date)](https://star-history.com/#Clemens865/Personal-AI-Assistant&Date)

---

<p align="center">Made with ❤️ by the Personal AI Assistant Team</p>