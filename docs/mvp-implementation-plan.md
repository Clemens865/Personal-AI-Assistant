# MVP Implementation Plan - Personal Assistant Extension

## Overview
Build a VS Code extension that transforms the IDE into a personal assistant by:
1. Creating a conversational UI
2. Leveraging existing AI extensions (Copilot, Claude, ChatGPT)
3. Adding voice capabilities
4. Implementing automatic knowledge management

## Phase 1: Basic Extension Setup (Day 1-2)

### 1. Create Extension Scaffolding

```bash
# Use VS Code Extension Generator
npm install -g yo generator-code
yo code

# Choose:
# - New Extension (TypeScript)
# - Name: vscode-personal-assistant
# - Identifier: personal-assistant
```

### 2. Extension Structure

```
vscode-personal-assistant/
├── src/
│   ├── extension.ts           # Main entry point
│   ├── views/
│   │   └── assistantView.ts   # WebView provider
│   ├── services/
│   │   ├── aiRouter.ts        # Routes to AI extensions
│   │   ├── voiceService.ts    # STT/TTS handling
│   │   └── knowledgeService.ts # Markdown management
│   ├── utils/
│   │   └── workspaceRules.ts  # Rules management
│   └── webview/
│       ├── assistant.html     # UI template
│       └── assistant.css      # Styles
├── package.json
└── tsconfig.json
```

### 3. Package.json Configuration

```json
{
  "name": "vscode-personal-assistant",
  "displayName": "Personal Assistant",
  "description": "Transform VS Code into your personal AI assistant",
  "version": "0.1.0",
  "engines": {
    "vscode": "^1.85.0"
  },
  "categories": ["Other"],
  "activationEvents": [
    "onStartupFinished"
  ],
  "main": "./out/extension.js",
  "contributes": {
    "views": {
      "explorer": [
        {
          "type": "webview",
          "id": "personalAssistant.chatView",
          "name": "Assistant",
          "icon": "$(comment-discussion)",
          "contextualTitle": "Personal Assistant"
        }
      ]
    },
    "commands": [
      {
        "command": "personalAssistant.openChat",
        "title": "Open Personal Assistant",
        "icon": "$(comment-discussion)"
      },
      {
        "command": "personalAssistant.startVoice",
        "title": "Start Voice Input",
        "icon": "$(mic)"
      }
    ],
    "configuration": {
      "title": "Personal Assistant",
      "properties": {
        "personalAssistant.defaultAI": {
          "type": "string",
          "enum": ["copilot", "claude", "chatgpt"],
          "default": "copilot",
          "description": "Default AI assistant to use"
        },
        "personalAssistant.elevenLabsApiKey": {
          "type": "string",
          "description": "ElevenLabs API key for text-to-speech"
        },
        "personalAssistant.voiceId": {
          "type": "string",
          "default": "21m00Tcm4TlvDq8ikWAM",
          "description": "ElevenLabs voice ID"
        },
        "personalAssistant.knowledgeBasePath": {
          "type": "string",
          "default": "./knowledge-base",
          "description": "Path to store knowledge markdown files"
        }
      }
    },
    "keybindings": [
      {
        "command": "personalAssistant.startVoice",
        "key": "ctrl+shift+v",
        "mac": "cmd+shift+v"
      }
    ]
  }
}
```

## Phase 2: Core Implementation (Day 3-5)

### 1. Main Extension Entry Point

```typescript
// src/extension.ts
import * as vscode from 'vscode';
import { AssistantViewProvider } from './views/assistantView';
import { AIRouter } from './services/aiRouter';
import { VoiceService } from './services/voiceService';
import { KnowledgeService } from './services/knowledgeService';

export function activate(context: vscode.ExtensionContext) {
    // Initialize services
    const aiRouter = new AIRouter();
    const voiceService = new VoiceService(context);
    const knowledgeService = new KnowledgeService();
    
    // Register WebView
    const provider = new AssistantViewProvider(
        context.extensionUri,
        aiRouter,
        voiceService,
        knowledgeService
    );
    
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            AssistantViewProvider.viewType,
            provider
        )
    );
    
    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('personalAssistant.openChat', () => {
            provider.show();
        })
    );
    
    // Create workspace rules if they don't exist
    createWorkspaceRules();
}

async function createWorkspaceRules() {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) return;
    
    const rulesPath = vscode.Uri.joinPath(
        workspaceFolder.uri, 
        '.github', 
        'assistant-instructions.md'
    );
    
    try {
        await vscode.workspace.fs.stat(rulesPath);
    } catch {
        // File doesn't exist, create it
        const rulesContent = getDefaultRules();
        await vscode.workspace.fs.writeFile(
            rulesPath, 
            Buffer.from(rulesContent, 'utf8')
        );
    }
}
```

### 2. AI Router Service

```typescript
// src/services/aiRouter.ts
export class AIRouter {
    private currentAssistant: string;
    
    constructor() {
        this.currentAssistant = vscode.workspace
            .getConfiguration('personalAssistant')
            .get('defaultAI', 'copilot');
    }
    
    async sendMessage(message: string): Promise<string> {
        // Check which AI extensions are available
        const extensions = vscode.extensions.all;
        
        switch(this.currentAssistant) {
            case 'copilot':
                if (this.hasExtension('GitHub.copilot-chat')) {
                    return await this.sendToCopilot(message);
                }
                break;
            case 'claude':
                if (this.hasExtension('Anthropic.claude-vscode')) {
                    return await this.sendToClaude(message);
                }
                break;
            case 'chatgpt':
                if (this.hasExtension('timkmecl.chatgpt')) {
                    return await this.sendToChatGPT(message);
                }
                break;
        }
        
        return "No AI assistant available. Please install Copilot, Claude, or ChatGPT extension.";
    }
    
    private async sendToCopilot(message: string): Promise<string> {
        // Execute Copilot command
        const result = await vscode.commands.executeCommand(
            'github.copilot.chat.sendMessage',
            { message }
        );
        return result as string;
    }
    
    private hasExtension(id: string): boolean {
        return vscode.extensions.getExtension(id) !== undefined;
    }
}
```

### 3. Voice Service

```typescript
// src/services/voiceService.ts
export class VoiceService {
    private recognition: any;
    private isListening = false;
    
    async startListening(): Promise<string> {
        return new Promise((resolve, reject) => {
            // Use browser's Web Speech API through WebView
            // This will be called from the WebView
            this.recognition = new (window as any).webkitSpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            
            this.recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                resolve(transcript);
            };
            
            this.recognition.onerror = (event: any) => {
                reject(event.error);
            };
            
            this.recognition.start();
        });
    }
    
    async speak(text: string): Promise<void> {
        const apiKey = vscode.workspace
            .getConfiguration('personalAssistant')
            .get('elevenLabsApiKey');
        
        if (!apiKey) {
            // Fallback to browser TTS
            return this.browserSpeak(text);
        }
        
        // Use ElevenLabs
        const voiceId = vscode.workspace
            .getConfiguration('personalAssistant')
            .get('voiceId', '21m00Tcm4TlvDq8ikWAM');
        
        const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
            {
                method: 'POST',
                headers: {
                    'xi-api-key': apiKey as string,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text,
                    model_id: 'eleven_monolingual_v1',
                }),
            }
        );
        
        if (response.ok) {
            const audioData = await response.arrayBuffer();
            // Play audio through WebView
            return this.playAudio(audioData);
        }
    }
    
    private browserSpeak(text: string): Promise<void> {
        return new Promise(resolve => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onend = () => resolve();
            window.speechSynthesis.speak(utterance);
        });
    }
}
```

### 4. Knowledge Service

```typescript
// src/services/knowledgeService.ts
export class KnowledgeService {
    private knowledgeBasePath: string;
    
    constructor() {
        const config = vscode.workspace.getConfiguration('personalAssistant');
        this.knowledgeBasePath = config.get('knowledgeBasePath', './knowledge-base');
    }
    
    async saveConversation(userMessage: string, assistantResponse: string) {
        const timestamp = new Date().toISOString();
        const date = timestamp.split('T')[0];
        
        // Determine category based on content
        const category = this.categorizeContent(userMessage, assistantResponse);
        
        // Create folder structure if needed
        const folderPath = await this.ensureFolderStructure(category);
        
        // Save to markdown
        const fileName = `${date}-${category}.md`;
        const filePath = vscode.Uri.joinPath(folderPath, fileName);
        
        const content = this.formatConversation(timestamp, userMessage, assistantResponse);
        
        // Append to existing file or create new
        await this.appendToFile(filePath, content);
    }
    
    private categorizeContent(user: string, assistant: string): string {
        // Simple keyword-based categorization
        const text = (user + ' ' + assistant).toLowerCase();
        
        if (text.includes('personal') || text.includes('prefer')) return 'personal';
        if (text.includes('project') || text.includes('task')) return 'projects';
        if (text.includes('learn') || text.includes('know')) return 'knowledge';
        if (text.includes('remember') || text.includes('event')) return 'memories';
        
        return 'conversations';
    }
    
    private formatConversation(timestamp: string, user: string, assistant: string): string {
        return `## ${timestamp}\n\n**User**: ${user}\n\n**Assistant**: ${assistant}\n\n---\n\n`;
    }
}
```

## Phase 3: WebView UI (Day 6-7)

### Create Assistant UI

```typescript
// src/views/assistantView.ts
export class AssistantViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'personalAssistant.chatView';
    private _view?: vscode.WebviewView;
    
    constructor(
        private readonly _extensionUri: vscode.Uri,
        private aiRouter: AIRouter,
        private voiceService: VoiceService,
        private knowledgeService: KnowledgeService
    ) {}
    
    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;
        
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        
        // Handle messages from WebView
        webviewView.webview.onDidReceiveMessage(async data => {
            switch (data.command) {
                case 'sendMessage':
                    await this.handleMessage(data.text);
                    break;
                case 'startVoice':
                    await this.handleVoiceInput();
                    break;
            }
        });
    }
    
    private async handleMessage(text: string) {
        // Send to AI
        const response = await this.aiRouter.sendMessage(text);
        
        // Save conversation
        await this.knowledgeService.saveConversation(text, response);
        
        // Send response back to WebView
        this._view?.webview.postMessage({
            command: 'addMessage',
            text: response,
            sender: 'assistant'
        });
        
        // Speak response if enabled
        if (vscode.workspace.getConfiguration('personalAssistant').get('ttsEnabled')) {
            await this.voiceService.speak(response);
        }
    }
}
```

## Phase 4: Testing & Deployment (Day 8-10)

### 1. Local Testing

```bash
# Compile and watch
npm run watch

# Press F5 in VS Code to launch Extension Development Host
```

### 2. Test Checklist

- [ ] Install AI extension (Copilot/Claude/ChatGPT)
- [ ] Open Personal Assistant view
- [ ] Send text message
- [ ] Verify AI response
- [ ] Check markdown file creation
- [ ] Test voice input (if browser supports)
- [ ] Test TTS with ElevenLabs API key
- [ ] Verify conversation categorization

### 3. Package Extension

```bash
# Install vsce
npm install -g @vscode/vsce

# Package extension
vsce package

# Publish to marketplace (optional)
vsce publish
```

## Quick Start Guide for Users

### 1. Installation
```bash
# From VS Code
1. Open Extensions (Ctrl+Shift+X)
2. Search "Personal Assistant"
3. Install extension

# Install AI extension of choice
4. Install "GitHub Copilot Chat" or "Claude" or "ChatGPT"
```

### 2. Configuration
```json
// settings.json
{
  "personalAssistant.defaultAI": "copilot",
  "personalAssistant.elevenLabsApiKey": "your-api-key",
  "personalAssistant.knowledgeBasePath": "./my-knowledge"
}
```

### 3. Usage
- Open Assistant view in sidebar
- Type or speak your message
- Assistant responds and saves to markdown
- Knowledge builds over time

## Next Steps

1. **Enhance categorization** with AI-based classification
2. **Add semantic search** across knowledge base
3. **Implement wake word** detection
4. **Create onboarding** experience
5. **Add memory context** loading

This MVP can be built in 1-2 weeks and provides a solid foundation for the personal assistant transformation!