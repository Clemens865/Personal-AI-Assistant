import * as vscode from 'vscode';
import { VaultManager } from './vault/VaultManager';
import { LinkProvider } from './providers/LinkProvider';
import { GraphEngine } from './graph/GraphEngine';
import { AIManager } from './ai/AIManager';
import { TemplateEngine } from './templates/TemplateEngine';
import { CommandManager } from './commands/CommandManager';
import { ViewProviders } from './views/ViewProviders';
import { Logger } from './utils/Logger';

let vaultManager: VaultManager;
let linkProvider: LinkProvider;
let graphEngine: GraphEngine;
let aiManager: AIManager;
let templateEngine: TemplateEngine;
let commandManager: CommandManager;
let viewProviders: ViewProviders;
let logger: Logger;

/**
 * This method is called when the extension is activated
 * The extension is activated the very first time the command is executed
 */
export async function activate(context: vscode.ExtensionContext) {
    // Initialize logger
    logger = new Logger('PersonalAssistant');
    logger.info('Activating Personal Assistant extension...');
    
    // Show activation message
    vscode.window.showInformationMessage('Personal Assistant is initializing...');
    
    try {
        // Initialize core components
        vaultManager = VaultManager.getInstance(context);
        await vaultManager.initialize();
        logger.info('Vault manager initialized');
        
        // Initialize AI manager
        aiManager = new AIManager(vaultManager);
        await aiManager.initialize();
        logger.info('AI manager initialized');
        
        // Initialize template engine
        templateEngine = new TemplateEngine(vaultManager, aiManager);
        await templateEngine.initialize();
        logger.info('Template engine initialized');
        
        // Initialize link provider
        linkProvider = new LinkProvider(vaultManager);
        
        // Register language providers
        context.subscriptions.push(
            vscode.languages.registerHoverProvider(
                { scheme: 'file', language: 'markdown' },
                linkProvider
            ),
            vscode.languages.registerCompletionItemProvider(
                { scheme: 'file', language: 'markdown' },
                linkProvider,
                '[', '['
            ),
            vscode.languages.registerDefinitionProvider(
                { scheme: 'file', language: 'markdown' },
                linkProvider
            )
        );
        logger.info('Language providers registered');
        
        // Initialize graph engine
        graphEngine = new GraphEngine(vaultManager);
        logger.info('Graph engine initialized');
        
        // Initialize view providers
        viewProviders = new ViewProviders(context, vaultManager);
        await viewProviders.initialize();
        logger.info('View providers initialized');
        
        // Initialize command manager and register commands
        commandManager = new CommandManager(
            context,
            vaultManager,
            graphEngine,
            aiManager,
            templateEngine
        );
        commandManager.registerCommands();
        logger.info('Commands registered');
        
        // Set up file watchers
        setupFileWatchers(context);
        
        // Create status bar item
        const statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        statusBarItem.text = '$(notebook) Assistant';
        statusBarItem.tooltip = 'Personal Assistant is active';
        statusBarItem.command = 'assistant.showSettings';
        statusBarItem.show();
        context.subscriptions.push(statusBarItem);
        
        // Show welcome message
        const config = vscode.workspace.getConfiguration('assistant');
        const showWelcome = config.get('showWelcomeOnStartup', true);
        
        if (showWelcome) {
            vscode.window.showInformationMessage(
                'Personal Assistant is ready! Use Ctrl+Alt+N to create a new note.',
                'Get Started',
                'Don\'t show again'
            ).then(selection => {
                if (selection === 'Get Started') {
                    vscode.commands.executeCommand('assistant.openChat');
                } else if (selection === 'Don\'t show again') {
                    config.update('showWelcomeOnStartup', false, true);
                }
            });
        }
        
        logger.info('Personal Assistant extension activated successfully');
        
    } catch (error) {
        logger.error('Failed to activate extension:', error);
        vscode.window.showErrorMessage(
            `Failed to activate Personal Assistant: ${error}`
        );
    }
}

/**
 * Set up file system watchers for the vault
 */
function setupFileWatchers(context: vscode.ExtensionContext) {
    const vaultPath = vaultManager.getVaultPath();
    const pattern = new vscode.RelativePattern(vaultPath, '**/*.md');
    
    const watcher = vscode.workspace.createFileSystemWatcher(pattern);
    
    // Handle file creation
    watcher.onDidCreate(async (uri) => {
        logger.info(`File created: ${uri.fsPath}`);
        await vaultManager.indexFile(uri.fsPath);
        vscode.commands.executeCommand('assistant.refreshViews');
    });
    
    // Handle file changes
    watcher.onDidChange(async (uri) => {
        logger.info(`File changed: ${uri.fsPath}`);
        await vaultManager.updateIndex(uri.fsPath);
        linkProvider.updateBacklinks(uri.fsPath);
    });
    
    // Handle file deletion
    watcher.onDidDelete(async (uri) => {
        logger.info(`File deleted: ${uri.fsPath}`);
        await vaultManager.removeFromIndex(uri.fsPath);
        vscode.commands.executeCommand('assistant.refreshViews');
    });
    
    context.subscriptions.push(watcher);
}

/**
 * This method is called when the extension is deactivated
 */
export async function deactivate() {
    logger.info('Deactivating Personal Assistant extension...');
    
    try {
        // Clean up resources
        if (vaultManager) {
            await vaultManager.dispose();
        }
        
        if (aiManager) {
            await aiManager.dispose();
        }
        
        if (graphEngine) {
            graphEngine.dispose();
        }
        
        if (viewProviders) {
            viewProviders.dispose();
        }
        
        logger.info('Personal Assistant extension deactivated successfully');
    } catch (error) {
        logger.error('Error during deactivation:', error);
    }
}