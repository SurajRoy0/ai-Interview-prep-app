import type { ElementType, ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type StatCardProps = {
  label: string
  value: ReactNode
  subtitle: string
  icon: ElementType
  iconClassName?: string
  iconContainerClassName?: string
  valueClassName?: string
}

export function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  iconClassName,
  iconContainerClassName,
  valueClassName,
}: StatCardProps) {
  return (
    <Card className="border-border/50 hover:border-primary/20 transition-colors duration-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
          <div className={cn('h-7 w-7 rounded-lg flex items-center justify-center shrink-0', iconContainerClassName)}>
            <Icon className={cn('h-3.5 w-3.5', iconClassName)} />
          </div>
        </div>
        <p className={cn('text-2xl font-extrabold tracking-tight', valueClassName)}>{value}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
      </CardContent>
    </Card>
  )
}
