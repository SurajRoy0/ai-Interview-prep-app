import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, CheckCircle2, Mic2, Search, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"

const DUMMY_INTERVIEWS = [
  {
    id: "1",
    title: "Mock Interview — Senior Frontend",
    date: "Today, 10:30 AM",
    duration: "14m 20s",
    score: 82,
    status: "COMPLETED",
    role: "Frontend Engineer",
  },
  {
    id: "2",
    title: "Mock Interview — React Developer",
    date: "May 20, 2026",
    duration: "16m 05s",
    score: 75,
    status: "COMPLETED",
    role: "Frontend Engineer",
  },
  {
    id: "3",
    title: "Mock Interview — Fullstack Node",
    date: "May 18, 2026",
    duration: "11m 40s",
    score: 68,
    status: "COMPLETED",
    role: "Fullstack Engineer",
  }
]

export default function InterviewHistoryPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500 max-w-5xl">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Interview History</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Review past sessions, track your scores, and revisit feedback.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-surface-1 border border-border/50 px-3 py-1.5 rounded-full text-sm">
          <Search className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground/60 italic">Search coming soon</span>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="bg-surface-1 border border-border/50 p-1 rounded-xl h-auto">
          <TabsTrigger value="all" className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground">
            All Sessions
          </TabsTrigger>
          <TabsTrigger value="completed" className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground">
            Completed
          </TabsTrigger>
          <TabsTrigger value="incomplete" className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground" disabled>
            Incomplete
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 focus-visible:outline-none">
          <div className="grid gap-4">
            {DUMMY_INTERVIEWS.map((interview) => (
              <Link
                key={interview.id}
                href="#"
                className="group bg-surface-1 border border-border/50 hover:border-primary/40 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Mic2 className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
                      {interview.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" /> {interview.date}
                      </div>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" /> {interview.duration}
                      </div>
                      <span className="w-1 h-1 rounded-full bg-border hidden sm:block" />
                      <Badge variant="outline" className="hidden sm:flex text-[10px] px-2 py-0 border-border/60">
                        {interview.role}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 border-t border-border/40 pt-4 sm:pt-0 sm:border-0 pl-2">
                  <div className="flex flex-col items-start sm:items-end">
                    <p className="text-2xl font-black text-foreground leading-none">{interview.score}</p>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-1">Score</p>
                  </div>
                  <div className="h-8 w-8 rounded-full border border-border/60 flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/5 transition-colors">
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="focus-visible:outline-none">
          {/* Same content for demo purposes */}
          <div className="grid gap-4">
            {DUMMY_INTERVIEWS.map((interview) => (
              <div key={interview.id} className="group bg-surface-1 border border-border/50 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 opacity-70">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{interview.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{interview.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
