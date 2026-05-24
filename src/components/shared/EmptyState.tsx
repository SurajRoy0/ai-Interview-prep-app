import type { ReactNode } from 'react'
import { LucideIcon, Inbox } from 'lucide-react'

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox
}: {
  title: string
  description?: string
  action?: ReactNode
  icon?: LucideIcon
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/10 p-12 sm:p-16 text-center animate-in fade-in duration-500">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6 ring-8 ring-primary/5">
        <Icon className="h-10 w-10 text-primary opacity-80" />
      </div>
      <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
      {description ? <p className="mt-3 text-sm text-muted-foreground max-w-md leading-relaxed">{description}</p> : null}
      {action ? <div className="mt-8">{action}</div> : null}
    </div>
  )
}
