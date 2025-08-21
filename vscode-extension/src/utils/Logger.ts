import * as vscode from 'vscode';

export class Logger {
    private static outputChannel: vscode.OutputChannel;
    private prefix: string;
    
    constructor(prefix: string) {
        this.prefix = prefix;
        
        if (!Logger.outputChannel) {
            Logger.outputChannel = vscode.window.createOutputChannel('Personal Assistant');
        }
    }
    
    private formatMessage(level: string, message: string, ...args: any[]): string {
        const timestamp = new Date().toISOString();
        const formattedArgs = args.length > 0 ? ' ' + JSON.stringify(args) : '';
        return `[${timestamp}] [${level}] [${this.prefix}] ${message}${formattedArgs}`;
    }
    
    info(message: string, ...args: any[]): void {
        const formatted = this.formatMessage('INFO', message, ...args);
        Logger.outputChannel.appendLine(formatted);
        console.log(formatted);
    }
    
    debug(message: string, ...args: any[]): void {
        const formatted = this.formatMessage('DEBUG', message, ...args);
        Logger.outputChannel.appendLine(formatted);
        console.debug(formatted);
    }
    
    warn(message: string, ...args: any[]): void {
        const formatted = this.formatMessage('WARN', message, ...args);
        Logger.outputChannel.appendLine(formatted);
        console.warn(formatted);
    }
    
    error(message: string, error?: any): void {
        const errorDetails = error ? 
            (error.stack || error.message || JSON.stringify(error)) : '';
        const formatted = this.formatMessage('ERROR', message, errorDetails);
        Logger.outputChannel.appendLine(formatted);
        console.error(formatted);
    }
    
    show(): void {
        Logger.outputChannel.show();
    }
}