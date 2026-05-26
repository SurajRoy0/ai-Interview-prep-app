import { redirect } from 'next/navigation'
import { getInterviewHistoryAction } from '@/actions/interview'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Mic2, Clock, ArrowRight, FileText } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

const STATUS_BADGE: Record<string, string> = {
  COMPLETED: 'bg-green-500/10 text-green-600 border-green-500/20',
  ACTIVE: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  PENDING: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  FAILED: 'bg-red-500/10 text-red-600 border-red-500/20',
  CANCELLED: 'bg-muted text-muted-foreground border-border',
}

function formatDuration(secs: number | null) {
  if (!secs) return null
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}m ${s.toString().padStart(2, '0')}s`
}

type Interview = NonNullable<Awaited<ReturnType<typeof getInterviewHistoryAction>>['data']>[number]

function InterviewRow({ interview }: { interview: Interview }) {
  const href =
    interview.status === 'COMPLETED'
      ? `/interview/${interview.id}`
      : `/interview/session/${interview.id}`

  const duration = formatDuration(interview.durationSeconds)

  return (
    <Link
      href={href}
      className="group bg-surface-1 border border-border/50 hover:border-primary/40 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200"
    >
      <div className="flex items-start sm:items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          <Mic2 className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
        </div>

        <div>
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
            {interview.jobProfile.title}
          </h3>
          <div className="flex flex-wrap items-center gap-3 mt-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {formatDistanceToNow(interview.createdAt, { addSuffix: true })}
            </div>

            {duration && (
              <>
                <span className="w-1 h-1 rounded-full bg-border" />
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {duration}
                </div>
              </>
            )}

            <span className="w-1 h-1 rounded-full bg-border hidden sm:block" />
            <Badge
              variant="outline"
              className={cn('hidden sm:flex text-[10px] px-2 py-0', STATUS_BADGE[interview.status] ?? '')}
            >
              {interview.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 border-t border-border/40 pt-4 sm:pt-0 sm:border-0 pl-2">
        {interview.overallScore != null ? (
          <div className="flex flex-col items-start sm:items-end">
            <p className="text-2xl font-black text-foreground leading-none">{interview.overallScore}</p>
            <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-1">Score</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            {interview.status === 'ACTIVE'
              ? 'In progress'
              : interview.status === 'PENDING'
                ? 'Not started'
                : '—'}
          </p>
        )}

        <div className="h-8 w-8 rounded-full border border-border/60 flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/5 transition-colors">
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
    </Link>
  )
}

export default async function InterviewHistoryPage() {
  const result = await getInterviewHistoryAction()
  if (!result.success) redirect('/login')

  const interviews = result.data
  const completed = interviews.filter((i) => i.status === 'COMPLETED')

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500 max-w-5xl">

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Interview History</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Review past sessions, track your scores, and revisit feedback.
          </p>
        </div>
        <p className="text-sm text-muted-foreground tabular-nums">
          {interviews.length} session{interviews.length !== 1 ? 's' : ''}
        </p>
      </div>

      {interviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <FileText className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No interviews yet</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Start your first interview from a job profile page.
          </p>
        </div>
      ) : (
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-surface-1 border border-border/50 p-1 rounded-xl h-auto">
            <TabsTrigger
              value="all"
              className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground"
            >
              All ({interviews.length})
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground"
            >
              Completed ({completed.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 focus-visible:outline-none">
            <div className="grid gap-4">
              {interviews.map((interview) => (
                <InterviewRow key={interview.id} interview={interview} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="focus-visible:outline-none space-y-4">
            {completed.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No completed interviews yet.</p>
            ) : (
              <div className="grid gap-4">
                {completed.map((interview) => (
                  <InterviewRow key={interview.id} interview={interview} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
