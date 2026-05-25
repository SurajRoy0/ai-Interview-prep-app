import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Play, Code2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface ActivityPanelProps {
  code: string;
  onChange: (code: string | undefined) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  onRunCode: () => void;
  isCompiling: boolean;
  output?: string;
}

export function ActivityPanel({
  code,
  onChange,
  language,
  onLanguageChange,
  onRunCode,
  isCompiling,
  output,
}: ActivityPanelProps) {
  return (
    <div className="flex flex-col h-full bg-surface-1 border-l border-border/50">
      <div className="flex items-center justify-between p-3 border-b border-border/50 bg-card">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Code2 className="w-4 h-4 text-primary" />
            Workspace
          </div>
          <Select value={language} onValueChange={onLanguageChange}>
            <SelectTrigger className="w-32 h-8 text-xs font-medium">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="typescript">TypeScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="java">Java</SelectItem>
              <SelectItem value="cpp">C++</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button 
          size="sm" 
          onClick={onRunCode} 
          disabled={isCompiling}
          className="h-8 gap-2 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary transition-colors border-none shadow-none font-semibold rounded-full"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          {isCompiling ? 'Running...' : 'Run Code'}
        </Button>
      </div>
      
      <div className="flex-1 relative">
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={onChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            wordWrap: 'on',
            lineNumbersMinChars: 3,
            padding: { top: 16 },
            scrollBeyondLastLine: false,
          }}
          loading={
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground animate-pulse">
              Loading editor...
            </div>
          }
        />
      </div>

      {/* Console Output Area */}
      <div className="h-48 border-t border-border/50 bg-black/40 flex flex-col">
        <div className="px-3 py-1.5 border-b border-border/30 bg-black/40 text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
          <span>Terminal Output</span>
        </div>
        <div className="flex-1 p-3 overflow-y-auto font-mono text-sm">
          {isCompiling ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              Compiling...
            </div>
          ) : output ? (
            <pre className="text-foreground whitespace-pre-wrap">{output}</pre>
          ) : (
            <span className="text-muted-foreground/50 italic">Click &quot;Run Code&quot; to execute your solution.</span>
          )}
        </div>
      </div>
    </div>
  );
}
