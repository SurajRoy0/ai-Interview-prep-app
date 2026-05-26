'use client'

import React from 'react'
import Editor from 'react-simple-code-editor'
import Prism from 'prismjs'
import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-java'
import 'prismjs/themes/prism-tomorrow.css' // Dark theme
import { useInterviewStore } from '@/store/interview-store'

export function CodeEditor() {
  const { currentActivity, codeEditorContent, setCodeEditorContent } = useInterviewStore()

  if (!currentActivity?.requiresCodeEditor) {
    return null
  }

  // Fallback if not editable
  const readOnlyContent = currentActivity.codeSnippet || ''
  
  // Decide what to show
  const content = currentActivity.codeEditable ? codeEditorContent : readOnlyContent

  const handleChange = (code: string) => {
    if (currentActivity.codeEditable) {
      setCodeEditorContent(code)
    }
  }

  return (
    <div className="w-full h-full flex flex-col bg-[#1d1f21] rounded-xl overflow-hidden border border-border shadow-inner">
      <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-b border-white/10">
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          {currentActivity.title || 'Code Editor'}
        </span>
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <Editor
          value={content}
          onValueChange={handleChange}
          highlight={code => Prism.highlight(code, Prism.languages.javascript, 'javascript')}
          padding={16}
          disabled={!currentActivity.codeEditable}
          className="font-mono text-sm min-h-full"
          style={{
            fontFamily: '"Fira Code", "JetBrains Mono", monospace',
            minHeight: '100%',
            outline: 'none',
          }}
        />
      </div>
    </div>
  )
}
