import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
import { Database } from 'sqlite3';
import { promisify } from 'util';
import matter from 'gray-matter';
import { Logger } from '../utils/Logger';

export interface NoteFrontmatter {
    title?: string;
    tags?: string[];
    created?: Date;
    modified?: Date;
    aliases?: string[];
    type?: 'note' | 'task' | 'project' | 'daily' | 'template';
    status?: 'draft' | 'active' | 'archived';
    ai_context?: {
        provider?: string;
        model?: string;
        temperature?: number;
    };
}

export interface Note {
    id: string;
    path: string;
    title: string;
    content: string;
    frontmatter: NoteFrontmatter;
    links: string[];
    backlinks: string[];
    created: Date;
    modified: Date;
}

export interface SearchResult {
    note: Note;
    score: number;
    highlights?: string[];
}

export class VaultManager {
    private static instance: VaultManager;
    private vaultPath: string;
    private db: Database;
    private notes: Map<string, Note> = new Map();
    private logger: Logger;
    private indexPromise: Promise<void> | null = null;
    
    private constructor(private context: vscode.ExtensionContext) {
        this.logger = new Logger('VaultManager');
        const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspacePath) {
            throw new Error('No workspace folder found');
        }
        
        const config = vscode.workspace.getConfiguration('assistant');
        const vaultFolder = config.get<string>('vaultPath', '.assistant-vault');
        this.vaultPath = path.join(workspacePath, vaultFolder);
    }
    
    static getInstance(context: vscode.ExtensionContext): VaultManager {
        if (!VaultManager.instance) {
            VaultManager.instance = new VaultManager(context);
        }
        return VaultManager.instance;
    }
    
    async initialize(): Promise<void> {
        this.logger.info('Initializing vault...');
        
        // Create vault structure
        await this.createVaultStructure();
        
        // Initialize database
        await this.initializeDatabase();
        
        // Index existing files
        await this.indexVault();
        
        this.logger.info('Vault initialized successfully');
    }
    
    private async createVaultStructure(): Promise<void> {
        const folders = [
            '',
            'knowledge',
            'knowledge/concepts',
            'knowledge/projects',
            'knowledge/references',
            'conversations',
            'templates',
            'daily',
            'tasks',
            'attachments',
            '.meta'
        ];
        
        for (const folder of folders) {
            const folderPath = path.join(this.vaultPath, folder);
            try {
                await fs.mkdir(folderPath, { recursive: true });
            } catch (error) {
                // Folder might already exist
                this.logger.debug(`Folder exists or error creating: ${folderPath}`);
            }
        }
        
        // Create default templates
        await this.createDefaultTemplates();
    }
    
    private async createDefaultTemplates(): Promise<void> {
        const templatesPath = path.join(this.vaultPath, 'templates');
        
        const dailyTemplate = `---
title: Daily Note {{date}}
date: {{date}}
tags: [daily]
---

# {{date}} - Daily Note

## Tasks
- [ ] 

## Notes

## Reflections
`;
        
        const meetingTemplate = `---
title: Meeting - {{title}}
date: {{date}}
attendees: {{attendees}}
tags: [meeting]
---

# Meeting: {{title}}

## Attendees
{{attendees}}

## Agenda

## Discussion

## Action Items
- [ ] 

## Next Steps
`;
        
        const projectTemplate = `---
title: {{title}}
type: project
status: planning
tags: [project]
created: {{date}}
---

# Project: {{title}}

## Overview

## Goals

## Timeline

## Resources

## Notes
`;
        
        // Save templates
        await fs.writeFile(
            path.join(templatesPath, 'daily.md'),
            dailyTemplate,
            'utf-8'
        );
        await fs.writeFile(
            path.join(templatesPath, 'meeting.md'),
            meetingTemplate,
            'utf-8'
        );
        await fs.writeFile(
            path.join(templatesPath, 'project.md'),
            projectTemplate,
            'utf-8'
        );
    }
    
    private async initializeDatabase(): Promise<void> {
        const dbPath = path.join(this.vaultPath, '.meta', 'vault.db');
        
        this.db = new Database(dbPath);
        
        const run = promisify(this.db.run.bind(this.db));
        
        // Create tables
        await run(`
            CREATE TABLE IF NOT EXISTS notes (
                id TEXT PRIMARY KEY,
                path TEXT UNIQUE NOT NULL,
                title TEXT NOT NULL,
                content TEXT,
                frontmatter TEXT,
                created DATETIME DEFAULT CURRENT_TIMESTAMP,
                modified DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        await run(`
            CREATE TABLE IF NOT EXISTS links (
                source_id TEXT,
                target_id TEXT,
                link_text TEXT,
                FOREIGN KEY (source_id) REFERENCES notes(id),
                FOREIGN KEY (target_id) REFERENCES notes(id),
                PRIMARY KEY (source_id, target_id)
            )
        `);
        
        await run(`
            CREATE TABLE IF NOT EXISTS tags (
                note_id TEXT,
                tag TEXT,
                FOREIGN KEY (note_id) REFERENCES notes(id),
                PRIMARY KEY (note_id, tag)
            )
        `);
        
        // Create indexes
        await run('CREATE INDEX IF NOT EXISTS idx_notes_title ON notes(title)');
        await run('CREATE INDEX IF NOT EXISTS idx_notes_modified ON notes(modified)');
        await run('CREATE INDEX IF NOT EXISTS idx_tags_tag ON tags(tag)');
    }
    
    private async indexVault(): Promise<void> {
        if (this.indexPromise) {
            return this.indexPromise;
        }
        
        this.indexPromise = this.performIndexing();
        await this.indexPromise;
        this.indexPromise = null;
    }
    
    private async performIndexing(): Promise<void> {
        this.logger.info('Indexing vault...');
        
        const files = await this.findMarkdownFiles(this.vaultPath);
        
        for (const file of files) {
            await this.indexFile(file);
        }
        
        this.logger.info(`Indexed ${files.length} files`);
    }
    
    private async findMarkdownFiles(dir: string): Promise<string[]> {
        const files: string[] = [];
        
        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                // Skip hidden folders
                if (entry.name.startsWith('.') && entry.name !== '.meta') {
                    continue;
                }
                
                if (entry.isDirectory()) {
                    const subFiles = await this.findMarkdownFiles(fullPath);
                    files.push(...subFiles);
                } else if (entry.name.endsWith('.md')) {
                    files.push(fullPath);
                }
            }
        } catch (error) {
            this.logger.error(`Error reading directory ${dir}:`, error);
        }
        
        return files;
    }
    
    async indexFile(filePath: string): Promise<void> {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const parsed = matter(content);
            
            const relativePath = path.relative(this.vaultPath, filePath);
            const noteId = this.generateNoteId(relativePath);
            
            const note: Note = {
                id: noteId,
                path: filePath,
                title: parsed.data.title || path.basename(filePath, '.md'),
                content: parsed.content,
                frontmatter: parsed.data as NoteFrontmatter,
                links: this.extractLinks(parsed.content),
                backlinks: [],
                created: parsed.data.created || new Date(),
                modified: parsed.data.modified || new Date()
            };
            
            this.notes.set(noteId, note);
            
            // Store in database
            await this.saveNoteToDatabase(note);
            
        } catch (error) {
            this.logger.error(`Error indexing file ${filePath}:`, error);
        }
    }
    
    private generateNoteId(relativePath: string): string {
        return relativePath.replace(/\\/g, '/').replace(/\.md$/, '');
    }
    
    private extractLinks(content: string): string[] {
        const linkPattern = /\[\[([^\]]+)\]\]/g;
        const links: string[] = [];
        let match;
        
        while ((match = linkPattern.exec(content)) !== null) {
            links.push(match[1]);
        }
        
        return links;
    }
    
    private async saveNoteToDatabase(note: Note): Promise<void> {
        const run = promisify(this.db.run.bind(this.db));
        
        await run(
            `INSERT OR REPLACE INTO notes (id, path, title, content, frontmatter, created, modified)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            note.id,
            note.path,
            note.title,
            note.content,
            JSON.stringify(note.frontmatter),
            note.created,
            note.modified
        );
        
        // Save tags
        if (note.frontmatter.tags) {
            for (const tag of note.frontmatter.tags) {
                await run(
                    'INSERT OR REPLACE INTO tags (note_id, tag) VALUES (?, ?)',
                    note.id,
                    tag
                );
            }
        }
    }
    
    async createNote(
        title: string,
        content: string = '',
        metadata?: Partial<NoteFrontmatter>
    ): Promise<string> {
        const fileName = this.sanitizeFileName(title);
        const folder = metadata?.type === 'daily' ? 'daily' : 'knowledge';
        const filePath = path.join(this.vaultPath, folder, `${fileName}.md`);
        
        const frontmatter: NoteFrontmatter = {
            title,
            created: new Date(),
            modified: new Date(),
            tags: [],
            ...metadata
        };
        
        const fullContent = matter.stringify(content, frontmatter);
        
        await fs.writeFile(filePath, fullContent, 'utf-8');
        await this.indexFile(filePath);
        
        return filePath;
    }
    
    private sanitizeFileName(title: string): string {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    
    async searchNotes(query: string): Promise<SearchResult[]> {
        const results: SearchResult[] = [];
        const queryLower = query.toLowerCase();
        
        for (const note of this.notes.values()) {
            let score = 0;
            const highlights: string[] = [];
            
            // Title match (highest weight)
            if (note.title.toLowerCase().includes(queryLower)) {
                score += 10;
                highlights.push(`Title: ${note.title}`);
            }
            
            // Tag match (high weight)
            if (note.frontmatter.tags?.some(tag => 
                tag.toLowerCase().includes(queryLower)
            )) {
                score += 5;
                highlights.push(`Tags: ${note.frontmatter.tags.join(', ')}`);
            }
            
            // Content match
            if (note.content.toLowerCase().includes(queryLower)) {
                score += 1;
                // Extract context around match
                const index = note.content.toLowerCase().indexOf(queryLower);
                const start = Math.max(0, index - 50);
                const end = Math.min(note.content.length, index + queryLower.length + 50);
                highlights.push(`...${note.content.substring(start, end)}...`);
            }
            
            if (score > 0) {
                results.push({ note, score, highlights });
            }
        }
        
        // Sort by score
        results.sort((a, b) => b.score - a.score);
        
        return results;
    }
    
    findNote(nameOrPath: string): Note | undefined {
        // Try exact match first
        for (const note of this.notes.values()) {
            if (note.title === nameOrPath || note.path === nameOrPath) {
                return note;
            }
        }
        
        // Try fuzzy match
        const nameLower = nameOrPath.toLowerCase();
        for (const note of this.notes.values()) {
            if (note.title.toLowerCase().includes(nameLower)) {
                return note;
            }
        }
        
        return undefined;
    }
    
    getAllNotes(): Note[] {
        return Array.from(this.notes.values());
    }
    
    getAllTags(): string[] {
        const tags = new Set<string>();
        
        for (const note of this.notes.values()) {
            if (note.frontmatter.tags) {
                for (const tag of note.frontmatter.tags) {
                    tags.add(tag);
                }
            }
        }
        
        return Array.from(tags).sort();
    }
    
    async getRecentNotes(limit: number = 10): Promise<Note[]> {
        const notes = Array.from(this.notes.values());
        notes.sort((a, b) => b.modified.getTime() - a.modified.getTime());
        return notes.slice(0, limit);
    }
    
    getVaultPath(): string {
        return this.vaultPath;
    }
    
    async updateIndex(filePath: string): Promise<void> {
        await this.indexFile(filePath);
    }
    
    async removeFromIndex(filePath: string): Promise<void> {
        const relativePath = path.relative(this.vaultPath, filePath);
        const noteId = this.generateNoteId(relativePath);
        
        this.notes.delete(noteId);
        
        const run = promisify(this.db.run.bind(this.db));
        await run('DELETE FROM notes WHERE id = ?', noteId);
        await run('DELETE FROM tags WHERE note_id = ?', noteId);
        await run('DELETE FROM links WHERE source_id = ? OR target_id = ?', noteId, noteId);
    }
    
    async dispose(): Promise<void> {
        if (this.db) {
            await promisify(this.db.close.bind(this.db))();
        }
    }
}