import { ReactNode } from 'react'

export default async function InterviewLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
      {/* 
        What this layout does:
        1. Validates that the interview exists and belongs to the current user.
        2. Can fetch high-level interview context (like job profile or resume summary) to share via context if needed.
        3. Wraps all interview routes (/setup, /session, and the main /id router page).
      */}
      <div className="bg-primary/5 text-primary text-xs font-mono p-2 border-b border-primary/20 flex justify-between">
        <span>Interview Layout Active</span>
        <span>Interview ID: {id}</span>
      </div>
      
      <div className="flex-1 flex flex-col relative">
        {children}
      </div>
    </div>
  )
}
