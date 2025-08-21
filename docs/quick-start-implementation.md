# Quick Start Implementation Guide

## Where to Start - File Locations in VS Code Fork

### 1. Extension Entry Point
Create the personal assistant extension:

```
VS-code-Assistant-project/
└── src/
    └── vs/
        └── workbench/
            └── contrib/
                └── personalAssistant/    <-- CREATE THIS
                    ├── browser/
                    │   ├── personalAssistant.contribution.ts
                    │   ├── personalAssistantView.ts
                    │   └── media/
                    │       └── assistant.css
                    ├── common/
                    │   ├── personalAssistant.ts
                    │   └── configuration.ts
                    └── electron-sandbox/
                        └── voiceServices.ts
```

### 2. Register the Extension

**File**: `VS-code-Assistant-project/src/vs/workbench/workbench.common.main.ts`

Add import:
```typescript
import 'vs/workbench/contrib/personalAssistant/browser/personalAssistant.contribution';
```

### 3. Add to Product Configuration

**File**: `VS-code-Assistant-project/product.json`

Add feature flag:
```json
{
    "personalAssistantEnabled": true
}
```

### 4. Create Activity Bar Icon

**File**: `VS-code-Assistant-project/src/vs/workbench/contrib/personalAssistant/browser/personalAssistant.contribution.ts`

```typescript
import { Registry } from 'vs/platform/registry/common/platform';
import { ViewContainer, IViewContainersRegistry } from 'vs/workbench/common/views';

const VIEW_CONTAINER: ViewContainer = Registry.as<IViewContainersRegistry>(
    Extensions.ViewContainersRegistry
).registerViewContainer({
    id: 'workbench.view.personalAssistant',
    title: 'Personal Assistant',
    icon: 'codicon-comment-discussion',  // or custom icon
    order: 2,
    ctorDescriptor: new SyncDescriptor(PersonalAssistantViewPaneContainer),
    hideIfEmpty: false,
}, ViewContainerLocation.Sidebar);
```

### 5. Modify Settings Schema

**File**: `VS-code-Assistant-project/src/vs/workbench/contrib/personalAssistant/common/configuration.ts`

```typescript
export const personalAssistantConfigurationSchema = {
    'type': 'object',
    'properties': {
        'personalAssistant.enabled': {
            'type': 'boolean',
            'default': true,
            'description': 'Enable Personal Assistant mode'
        },
        'personalAssistant.llm.provider': {
            'type': 'string',
            'enum': ['openai', 'anthropic', 'local'],
            'default': 'openai'
        },
        'personalAssistant.llm.apiKey': {
            'type': 'string',
            'description': 'API key for LLM provider'
        },
        'personalAssistant.voice.tts.provider': {
            'type': 'string',
            'enum': ['elevenlabs', 'browser'],
            'default': 'browser'
        }
    }
};
```

## First Implementation Steps

### Step 1: Create Basic WebView (Day 1)

```typescript
// personalAssistantView.ts
export class PersonalAssistantView extends ViewPane {
    private _webview?: WebviewView;
    
    protected renderBody(container: HTMLElement): void {
        const webviewContainer = append(container, $('.webview-container'));
        
        this._webview = this._register(
            this.instantiationService.createInstance(WebviewView, {
                id: 'personalAssistant.chatView',
                title: 'Chat',
                webviewOptions: {
                    enableScripts: true,
                    enableForms: true
                }
            })
        );
        
        this._webview.html = this.getChatHTML();
    }
    
    private getChatHTML(): string {
        return `
            <!DOCTYPE html>
            <html>
            <body>
                <div id="chat-container">
                    <div id="messages"></div>
                    <input type="text" id="input" placeholder="Ask me anything..."/>
                </div>
            </body>
            </html>
        `;
    }
}
```

### Step 2: Add LLM Service (Day 2-3)

```typescript
// services/llmService.ts
export class LLMService {
    constructor(
        @IConfigurationService private configService: IConfigurationService,
        @IFileService private fileService: IFileService
    ) {}
    
    async processMessage(message: string): Promise<string> {
        const apiKey = this.configService.getValue('personalAssistant.llm.apiKey');
        const provider = this.configService.getValue('personalAssistant.llm.provider');
        
        // OpenAI example
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: this.getSystemPrompt() },
                    { role: 'user', content: message }
                ]
            })
        });
        
        const data = await response.json();
        return data.choices[0].message.content;
    }
}
```

### Step 3: Implement Knowledge Storage (Day 4-5)

```typescript
// services/knowledgeService.ts
export class KnowledgeService {
    private knowledgeBasePath: URI;
    
    async saveConversation(message: string, response: string): Promise<void> {
        const timestamp = new Date().toISOString();
        const date = timestamp.split('T')[0];
        
        const conversationPath = URI.joinPath(
            this.knowledgeBasePath,
            'conversations',
            `${date}.md`
        );
        
        const content = `## ${timestamp}\n\n**User**: ${message}\n\n**Assistant**: ${response}\n\n---\n\n`;
        
        // Append to file
        await this.fileService.writeFile(
            conversationPath,
            VSBuffer.fromString(content),
            { create: true, append: true }
        );
    }
}
```

### Step 4: Add Voice Support (Day 6-7)

```typescript
// services/voiceService.ts
export class VoiceService {
    private recognition: any;
    private synthesis: any;
    
    startListening(): void {
        // Use Web Speech API
        this.recognition = new (window as any).webkitSpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        
        this.recognition.onresult = (event: any) => {
            const transcript = event.results[event.results.length - 1][0].transcript;
            this._onTranscript.fire(transcript);
        };
        
        this.recognition.start();
    }
    
    speak(text: string): void {
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    }
}
```

## Testing Your Implementation

### 1. Build VS Code
```bash
cd VS-code-Assistant-project
npm install
npm run compile
npm run watch  # For development
```

### 2. Run Development Instance
```bash
./scripts/code.sh  # On macOS/Linux
# or
./scripts/code.bat  # On Windows
```

### 3. Test Features
1. Look for Personal Assistant icon in Activity Bar
2. Click to open chat view
3. Type a message and press Enter
4. Check if conversation is saved in workspace

## Common Issues & Solutions

### Issue: WebView not loading
**Solution**: Ensure CSP headers allow your scripts:
```typescript
webview.options = {
    enableScripts: true,
    localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath))]
};
```

### Issue: API calls failing
**Solution**: Add proxy configuration for API calls:
```typescript
const proxyAgent = this.requestService.getProxyAgent();
fetch(url, { agent: proxyAgent });
```

### Issue: Voice not working
**Solution**: Request microphone permissions:
```typescript
navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
        // Microphone access granted
    });
```

## Next Steps

1. **MVP (Week 1-2)**
   - Basic chat interface ✓
   - OpenAI integration
   - Simple markdown storage

2. **Enhanced Features (Week 3-4)**
   - Voice input/output
   - Knowledge categorization
   - Search functionality

3. **Polish (Week 5-6)**
   - Mode switching
   - Better UI/UX
   - Configuration options

Start with the MVP and iterate!