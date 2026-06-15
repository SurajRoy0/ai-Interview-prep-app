'use client'

import * as React from 'react'
import Editor from 'react-simple-code-editor'
import { highlight, languages } from 'prismjs'
import 'prismjs/components/prism-javascript'
import { Terminal } from 'lucide-react'

const DUMMY_CODE = `function twoSum(nums, target) {
  const map = new Map();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];

    if (map.has(complement)) {
      return [map.get(complement), i];
    }

    map.set(nums[i], i);
  }
}
`

export function SessionCodeEditor() {
  const [code, setCode] = React.useState(DUMMY_CODE)

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="flex shrink-0 items-center gap-2 border-b border-border/40 px-4 py-2.5">
        <Terminal className="size-4 text-primary" />
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Code Editor
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        <Editor
          value={code}
          onValueChange={setCode}
          highlight={(value) => highlight(value, languages.javascript, 'javascript')}
          padding={16}
          className="min-h-full font-mono text-[13px] leading-relaxed text-foreground outline-none"
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          }}
          textareaClassName="focus:outline-none"
        />
      </div>
    </div>
  )
}
