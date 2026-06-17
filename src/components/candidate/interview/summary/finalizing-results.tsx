import { Loader2 } from 'lucide-react'

export function FinalizingResults() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        <div className="relative bg-primary/10 p-5 rounded-full">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Finalizing your results...</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
          Our AI is evaluating your final answers. This will only take a moment.
        </p>
      </div>
    </div>
  )
}
