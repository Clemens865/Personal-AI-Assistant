# Technical Architecture - VS Code Personal Assistant

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     VS Code Application                      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Classic    │  │   Assistant  │  │    Hybrid    │      │
│  │   IDE Mode   │  │     Mode     │  │     Mode     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
├─────────────────────────────────────────────────────────────┤
│                    Extension Host Process                    │
│  ┌────────────────────────────────────────────────────┐     │
│  │          Personal Assistant Extension              │     │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │     │
│  │  │  Voice   │ │   LLM    │ │    Knowledge     │  │     │
│  │  │  Module  │ │  Engine  │ │    Manager       │  │     │
│  │  └──────────┘ └──────────┘ └──────────────────┘  │     │
│  └────────────────────────────────────────────────────┘     │
├─────────────────────────────────────────────────────────────┤
│                      File System                             │
│  ┌────────────────────────────────────────────────────┐     │
│  │              Markdown Knowledge Base               │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## Core Modifications to VS Code

### 1. Extension Architecture

```typescript
// src/extension/personalAssistant/index.ts
export class PersonalAssistantExtension {
    private voiceModule: VoiceModule;
    private llmEngine: LLMEngine;
    private knowledgeManager: KnowledgeManager;
    private uiController: UIController;
    
    async activate(context: vscode.ExtensionContext) {
        // Initialize modules
        this.voiceModule = new VoiceModule(context);
        this.llmEngine = new LLMEngine(context);
        this.knowledgeManager = new KnowledgeManager(context);
        this.uiController = new UIController(context);
        
        // Register commands
        this.registerCommands(context);
        
        // Initialize workspace
        await this.initializeKnowledgeBase();
    }
}
```

### 2. Voice Module Architecture

```typescript
// src/extension/personalAssistant/voice/VoiceModule.ts
interface VoiceModule {
    // Speech-to-Text
    startListening(): Promise<void>;
    stopListening(): void;
    onTranscript: Event<string>;
    
    // Text-to-Speech
    speak(text: string, voice?: VoiceProfile): Promise<void>;
    setVoice(voiceId: string): void;
    
    // Voice activation
    enableWakeWord(word: string): void;
    onWakeWordDetected: Event<void>;
}

class VoiceModuleImpl implements VoiceModule {
    private sttProvider: STTProvider;
    private ttsProvider: TTSProvider;
    private audioProcessor: AudioProcessor;
    
    constructor(context: vscode.ExtensionContext) {
        this.initializeProviders(context);
    }
    
    private initializeProviders(context: vscode.ExtensionContext) {
        const config = vscode.workspace.getConfiguration('personalAssistant');
        
        // Initialize STT
        switch(config.get('stt.provider')) {
            case 'whisper':
                this.sttProvider = new WhisperSTT(config.get('stt.apiKey'));
                break;
            case 'webSpeech':
                this.sttProvider = new WebSpeechSTT();
                break;
        }
        
        // Initialize TTS
        if (config.get('tts.provider') === 'elevenlabs') {
            this.ttsProvider = new ElevenLabsTTS(
                config.get('tts.apiKey'),
                config.get('tts.voiceId')
            );
        }
    }
}
```

### 3. LLM Engine Integration

```typescript
// src/extension/personalAssistant/llm/LLMEngine.ts
interface LLMEngine {
    processConversation(input: string, context: Context): Promise<Response>;
    extractKnowledge(conversation: string): KnowledgeItems[];
    generateResponse(prompt: string, context: Context): Promise<string>;
}

class LLMEngineImpl implements LLMEngine {
    private provider: LLMProvider;
    private contextManager: ContextManager;
    
    async processConversation(input: string, context: Context): Promise<Response> {
        // 1. Load relevant context from knowledge base
        const relevantKnowledge = await this.contextManager.getRelevantContext(input);
        
        // 2. Construct prompt with context
        const prompt = this.buildPrompt(input, relevantKnowledge, context);
        
        // 3. Get LLM response
        const llmResponse = await this.provider.complete(prompt);
        
        // 4. Extract knowledge to save
        const knowledge = this.extractKnowledge(llmResponse);
        
        // 5. Save to knowledge base
        await this.knowledgeManager.saveKnowledge(knowledge);
        
        return {
            text: llmResponse,
            knowledge: knowledge,
            actions: this.extractActions(llmResponse)
        };
    }
}
```

### 4. Knowledge Manager System

```typescript
// src/extension/personalAssistant/knowledge/KnowledgeManager.ts
interface KnowledgeManager {
    saveConversation(conversation: Conversation): Promise<void>;
    searchKnowledge(query: string): Promise<KnowledgeItem[]>;
    updateKnowledge(category: string, content: string): Promise<void>;
    getContext(categories: string[]): Promise<Context>;
}

class KnowledgeManagerImpl implements KnowledgeManager {
    private indexer: KnowledgeIndexer;
    private fileManager: MarkdownFileManager;
    
    async saveConversation(conversation: Conversation) {
        // 1. Determine categories
        const categories = await this.categorizeContent(conversation);
        
        // 2. Extract key information
        const extracted = await this.extractKeyInfo(conversation);
        
        // 3. Update or create markdown files
        for (const category of categories) {
            const filePath = this.getFilePath(category);
            await this.fileManager.updateFile(filePath, extracted);
        }
        
        // 4. Update search index
        await this.indexer.updateIndex(extracted);
    }
    
    private getFilePath(category: string): string {
        const basePath = vscode.workspace.rootPath;
        const structure = {
            'personal': '/personal/preferences.md',
            'project': '/projects/active.md',
            'memory': '/memories/events.md',
            'knowledge': '/knowledge/learned.md'
        };
        return path.join(basePath, structure[category] || `/general/${category}.md`);
    }
}
```

### 5. UI Controller - WebView Implementation

```typescript
// src/extension/personalAssistant/ui/UIController.ts
class AssistantWebView {
    private panel: vscode.WebviewPanel;
    private voiceVisualizer: VoiceVisualizer;
    
    constructor(context: vscode.ExtensionContext) {
        this.panel = vscode.window.createWebviewPanel(
            'personalAssistant',
            'Personal Assistant',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );
        
        this.panel.webview.html = this.getWebviewContent();
        this.setupMessageHandling();
    }
    
    private getWebviewContent(): string {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    .assistant-container {
                        display: flex;
                        flex-direction: column;
                        height: 100vh;
                        background: var(--vscode-editor-background);
                    }
                    .voice-visualizer {
                        height: 100px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .conversation-area {
                        flex: 1;
                        overflow-y: auto;
                        padding: 20px;
                    }
                    .input-area {
                        display: flex;
                        padding: 20px;
                        gap: 10px;
                    }
                    .voice-button {
                        width: 60px;
                        height: 60px;
                        border-radius: 50%;
                        background: var(--vscode-button-background);
                        border: none;
                        cursor: pointer;
                    }
                </style>
            </head>
            <body>
                <div class="assistant-container">
                    <div class="voice-visualizer">
                        <canvas id="visualizer"></canvas>
                    </div>
                    <div class="conversation-area" id="conversation">
                        <!-- Conversation history -->
                    </div>
                    <div class="input-area">
                        <input type="text" id="textInput" placeholder="Type or speak...">
                        <button class="voice-button" id="voiceButton">🎤</button>
                    </div>
                </div>
                <script>
                    const vscode = acquireVsCodeApi();
                    
                    // Voice button handling
                    document.getElementById('voiceButton').addEventListener('click', () => {
                        vscode.postMessage({ command: 'toggleVoice' });
                    });
                    
                    // Text input handling
                    document.getElementById('textInput').addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') {
                            vscode.postMessage({ 
                                command: 'sendMessage',
                                text: e.target.value 
                            });
                            e.target.value = '';
                        }
                    });
                    
                    // Receive messages from extension
                    window.addEventListener('message', event => {
                        const message = event.data;
                        switch (message.command) {
                            case 'addMessage':
                                addToConversation(message.text, message.sender);
                                break;
                            case 'updateVisualizer':
                                updateVoiceVisualizer(message.data);
                                break;
                        }
                    });
                </script>
            </body>
            </html>
        `;
    }
}
```

### 6. Configuration Schema

```json
// package.json extension contribution
{
    "contributes": {
        "configuration": {
            "title": "Personal Assistant",
            "properties": {
                "personalAssistant.llm.provider": {
                    "type": "string",
                    "enum": ["openai", "anthropic", "local"],
                    "default": "openai",
                    "description": "LLM provider for conversation processing"
                },
                "personalAssistant.llm.apiKey": {
                    "type": "string",
                    "description": "API key for LLM provider"
                },
                "personalAssistant.llm.model": {
                    "type": "string",
                    "default": "gpt-4",
                    "description": "Model to use for conversation"
                },
                "personalAssistant.tts.provider": {
                    "type": "string",
                    "enum": ["elevenlabs", "azure", "browser"],
                    "default": "elevenlabs"
                },
                "personalAssistant.tts.apiKey": {
                    "type": "string",
                    "description": "ElevenLabs API key"
                },
                "personalAssistant.tts.voiceId": {
                    "type": "string",
                    "description": "Selected voice ID"
                },
                "personalAssistant.stt.provider": {
                    "type": "string",
                    "enum": ["whisper", "webSpeech", "azure"],
                    "default": "webSpeech"
                },
                "personalAssistant.knowledge.basePath": {
                    "type": "string",
                    "default": "./knowledge-base",
                    "description": "Path to knowledge base folder"
                },
                "personalAssistant.ui.mode": {
                    "type": "string",
                    "enum": ["assistant", "classic", "hybrid"],
                    "default": "assistant"
                }
            }
        },
        "commands": [
            {
                "command": "personalAssistant.switchMode",
                "title": "Switch UI Mode"
            },
            {
                "command": "personalAssistant.startListening",
                "title": "Start Voice Input"
            },
            {
                "command": "personalAssistant.openChat",
                "title": "Open Assistant Chat"
            }
        ],
        "keybindings": [
            {
                "command": "personalAssistant.startListening",
                "key": "ctrl+shift+v",
                "mac": "cmd+shift+v"
            }
        ]
    }
}
```

### 7. Mode Switching Implementation

```typescript
// src/extension/personalAssistant/modes/ModeSwitcher.ts
class ModeSwitcher {
    private currentMode: 'assistant' | 'classic' | 'hybrid';
    private workbenchConfig: vscode.WorkspaceConfiguration;
    
    async switchMode(mode: 'assistant' | 'classic' | 'hybrid') {
        this.currentMode = mode;
        
        switch(mode) {
            case 'assistant':
                await this.activateAssistantMode();
                break;
            case 'classic':
                await this.activateClassicMode();
                break;
            case 'hybrid':
                await this.activateHybridMode();
                break;
        }
    }
    
    private async activateAssistantMode() {
        // Hide traditional panels
        await vscode.commands.executeCommand('workbench.action.closeSidebar');
        await vscode.commands.executeCommand('workbench.action.closePanel');
        
        // Open assistant WebView
        await vscode.commands.executeCommand('personalAssistant.openChat');
        
        // Change activity bar
        this.updateActivityBar(['assistant', 'files', 'search']);
    }
    
    private async activateHybridMode() {
        // Split view - assistant on right, code on left
        const assistantPanel = vscode.window.createWebviewPanel(
            'assistant',
            'Assistant',
            vscode.ViewColumn.Two,
            { enableScripts: true }
        );
        
        // Keep traditional panels visible
        await vscode.commands.executeCommand('workbench.view.explorer');
    }
}
```

## Implementation Priority

### Phase 1: Core Foundation
1. Basic extension structure
2. WebView interface
3. Simple markdown operations
4. OpenAI integration

### Phase 2: Voice Features
1. Web Speech API integration
2. ElevenLabs TTS
3. Voice visualization
4. Audio feedback

### Phase 3: Intelligence
1. Knowledge extraction
2. Context management
3. Smart categorization
4. Search indexing

### Phase 4: Polish
1. Mode switching
2. Animations
3. Preferences
4. Onboarding

This architecture provides a solid foundation for transforming VS Code into a personal AI assistant while maintaining its powerful file management capabilities.