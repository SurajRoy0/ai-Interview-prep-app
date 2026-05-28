import Link from "next/link"
import { getDashboardStatsAction, getTotalCreditsAction } from "@/actions/candidate/user"
import { requireSession } from "@/lib/auth-server"
import { getJobProfilesAction } from "@/actions/candidate/job-profile"
import {
  ArrowRight, FileText,
  Mic, Plus, Briefcase, Sparkles, Coins
} from "lucide-react"
import { CreateProfileDialog } from "@/components/candidate/job-profiles/create-profile-dialog"
import { JobProfileCard } from "@/components/candidate/dashboard/job-profile-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// ─────────────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const session = await requireSession()
  const [profilesResult, stats, credits] = await Promise.all([
    getJobProfilesAction({ limit: 4 }),
    getDashboardStatsAction(),
    getTotalCreditsAction(),
  ])

  const profiles = profilesResult.success ? profilesResult.data.profiles : []
  const totalCount = profilesResult.success ? profilesResult.data.totalCount : 0

  const name = session?.user.name?.split(" ")[0] ?? "there"
  const interviewCount = stats.interviewsCount
  const resumeCount = stats.resumeCount
  const totalCredits = credits

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? "Good morning" :
      hour < 17 ? "Good afternoon" :
        "Good evening"

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500">

      {/* ── Greeting Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {greeting}, {name} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {totalCount === 0
              ? "Create a job profile to get started."
              : `You have ${totalCount} job profile${totalCount !== 1 ? "s" : ""} set up.`}
          </p>
        </div>

        {/* Credits pill */}
        <div className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-medium ${totalCredits > 0
          ? "bg-primary/10 border-primary/20 text-primary shadow-[0_0_15px_rgba(var(--primary),0.1)]"
          : "bg-surface-1 border-border text-muted-foreground"
          }`}>
          <Coins className={`h-4 w-4 ${totalCredits > 0 ? "text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.8)]" : "text-muted-foreground/40"}`} />
          {totalCredits > 0 ? `${totalCredits} Session${totalCredits !== 1 ? 's' : ''} available` : "0 Sessions available"}
        </div>
      </div>

      {/* ── Stats Row ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

        {/* Total Interviews */}
        <div className="bg-card border border-border/50 rounded-2xl p-5 group hover:border-primary/30 hover:shadow-sm transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Interviews</p>
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mic className="h-3.5 w-3.5 text-primary" />
            </div>
          </div>
          <p className="text-3xl font-extrabold tracking-tight">{interviewCount}</p>
          <p className="text-xs text-muted-foreground mt-1">{interviewCount === 0 ? "No interviews yet" : "sessions completed"}</p>
        </div>

        {/* Resumes */}
        <div className="bg-card border border-border/50 rounded-2xl p-5 group hover:border-primary/30 hover:shadow-sm transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Resumes</p>
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-3.5 w-3.5 text-primary" />
            </div>
          </div>
          <p className="text-3xl font-extrabold tracking-tight">{resumeCount}</p>
          <p className="text-xs text-muted-foreground mt-1">across all profiles</p>
        </div>

        {/* Quick Start CTA — spans 2 cols on mobile (full width), 1 col on md */}
        <div className="col-span-2 md:col-span-1 bg-primary rounded-2xl p-5 text-primary-foreground relative overflow-hidden group shadow-primary-glow">
          <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <p className="text-xs font-semibold uppercase tracking-wide opacity-80">Quick Start</p>
            </div>
            <h3 className="font-bold text-lg leading-tight mb-4">Ready to practice?</h3>
            <Button asChild size="sm" className="bg-background text-foreground hover:bg-background/90 rounded-full gap-1.5 font-semibold text-xs h-8">
              <Link href="/candidate/job-profiles">
                Start Interview <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* ── Job Profiles ─────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">Job Profiles</h2>
            {totalCount > 0 && (
              <Badge variant="secondary" className="text-xs">{totalCount}</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {totalCount > 0 && (
              <Button asChild variant="outline" size="sm" className="rounded-full h-8 text-xs border-border/60">
                <Link href="/candidate/job-profiles">View all</Link>
              </Button>
            )}
            <CreateProfileDialog>
              <Button variant="outline" size="sm" className="rounded-full gap-1.5 h-8 text-xs border-border/60">
                <Plus className="h-3.5 w-3.5" /> New Profile
              </Button>
            </CreateProfileDialog>
          </div>
        </div>

        {totalCount === 0 ? (

          /* Empty state */
          <div className="bg-card border border-dashed border-border/60 rounded-2xl p-12 text-center flex flex-col items-center">
            <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-base mb-1">No job profiles yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs mb-6 leading-relaxed">
              Create a profile for each role you&apos;re targeting. Then upload your resume and start a tailored interview.
            </p>
            <CreateProfileDialog>
              <Button size="sm" className="rounded-full gap-2 shadow-primary-glow">
                <Plus className="h-4 w-4" /> Create First Profile
              </Button>
            </CreateProfileDialog>
          </div>
        ) : (
          /* Profile cards */
          <div className="grid sm:grid-cols-2 gap-3">
            {profiles.map(profile => {
              return <JobProfileCard key={profile.id} profile={profile} />
            })}

            {/* Add another card */}
            {/* <CreateProfileDialog>
              <div className="group border border-dashed border-border/50 hover:border-primary/40 hover:bg-primary/3 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 min-h-[180px]">
                <div className="h-9 w-9 rounded-full border border-dashed border-border/60 group-hover:border-primary/40 flex items-center justify-center transition-colors">
                  <Plus className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                </div>
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">Add profile</span>
              </div>
            </CreateProfileDialog> */}
          </div>
        )}
      </div>
    </div>
  )
}
