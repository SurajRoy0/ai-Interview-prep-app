import { getSession } from '@/lib/auth-server'
import { prisma } from '@repo/db'
import { notFound, redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, XCircle, ArrowLeft, BrainCircuit, Code2, MessagesSquare } from 'lucide-react'
import Link from 'next/link'
import { ReportPolling } from './report-polling'

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.user?.id) redirect('/login')

  const { id } = await params

  const interview = await prisma.interview.findUnique({
    where: { id, userId: session.user.id },
    include: { jobProfile: true },
  })

  if (!interview) notFound()

  if (interview.status !== 'COMPLETED') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <ReportPolling interviewId={id} pollIntervalMs={4000} />

        {interview.status === 'FAILED' ? (
          <>
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
              <XCircle className="w-6 h-6 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Report Generation Failed</h1>
            <p className="text-muted-foreground max-w-sm">
              Something went wrong while analyzing your interview. Please contact support.
            </p>
            <Link href="/dashboard" className="mt-6 text-sm text-primary underline underline-offset-4">
              Back to Dashboard
            </Link>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-6" />
            <h1 className="text-2xl font-bold mb-2">Generating Your Report</h1>
            <p className="text-muted-foreground mb-2 max-w-sm">
              Our AI is analyzing your interview transcript. This usually takes 20–40 seconds.
            </p>
            <p className="text-xs text-muted-foreground/60">This page will update automatically.</p>
          </>
        )}
      </div>
    )
  }

  const overallScore = interview.overallScore ?? 0
  const technicalScore = interview.technicalScore ?? 0
  const communicationScore = interview.communicationScore ?? 0

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-3 duration-500">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard"
            className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm font-medium mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Interview Report</h1>
          <p className="text-muted-foreground mt-1">
            Role: <span className="font-semibold text-foreground">{interview.jobProfile.title}</span>
          </p>
        </div>
        <div className="hidden md:flex flex-col items-end">
          <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-1">Overall Score</div>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-black tracking-tighter text-primary">{overallScore}</span>
            <span className="text-xl font-bold text-muted-foreground">/100</span>
          </div>
        </div>
      </div>

      {/* Mobile Score */}
      <Card className="md:hidden bg-primary/5 border-primary/20">
        <CardContent className="p-6 flex flex-col items-center justify-center">
          <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-2">Overall Score</div>
          <div className="flex items-baseline gap-1">
            <span className="text-6xl font-black tracking-tighter text-primary">{overallScore}</span>
            <span className="text-2xl font-bold text-muted-foreground">/100</span>
          </div>
        </CardContent>
      </Card>

      {/* Sub-Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Code2 className="w-4 h-4 text-primary" /> Technical Skills
            </CardTitle>
            <span className="text-2xl font-bold">{technicalScore}%</span>
          </CardHeader>
          <CardContent>
            <Progress value={technicalScore} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <MessagesSquare className="w-4 h-4 text-primary" /> Communication
            </CardTitle>
            <span className="text-2xl font-bold">{communicationScore}%</span>
          </CardHeader>
          <CardContent>
            <Progress value={communicationScore} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* High-Level Feedback */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-primary" />
            AI Analysis Report
          </CardTitle>
          <CardDescription>A comprehensive breakdown of your interview performance.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {interview.feedback || 'No feedback generated.'}
          </div>
        </CardContent>
      </Card>

      {/* Topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-green-500/20 bg-green-500/5">
          <CardHeader>
            <CardTitle className="text-green-600 dark:text-green-400 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              What You Did Well
            </CardTitle>
          </CardHeader>
          <CardContent>
            {interview.strongTopics && interview.strongTopics.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {interview.strongTopics.map((topic, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 px-3 py-1"
                  >
                    {topic}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Not enough data to determine strong topics.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Topics to Improve
            </CardTitle>
          </CardHeader>
          <CardContent>
            {interview.weakTopics && interview.weakTopics.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {interview.weakTopics.map((topic, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="bg-destructive/10 text-destructive border-destructive/20 px-3 py-1"
                  >
                    {topic}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Great job! No major weak topics detected.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
