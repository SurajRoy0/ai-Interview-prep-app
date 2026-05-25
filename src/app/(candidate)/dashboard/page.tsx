import Link from "next/link"
import { getDashboardProfile } from "@/actions/user"
import { getJobProfilesAction } from "@/actions/job-profile"
import {
  ArrowRight, FileText, CheckCircle2, CircleDashed,
  Mic, Plus, Briefcase, Target, ChevronRight, Sparkles
} from "lucide-react"
import { CreateProfileDialog } from "@/components/profile/create-profile-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// ─── Ecosystem → colour mapping ───────────────────────────────────────────────
const ECOSYSTEM_COLOR: Record<string, string> = {
  JAVASCRIPT: "text-yellow-500 bg-yellow-500/10 border-yellow-500/25",
  PYTHON: "text-blue-400 bg-blue-400/10 border-blue-400/25",
  JAVA: "text-orange-500 bg-orange-500/10 border-orange-500/25",
  GO: "text-cyan-400 bg-cyan-400/10 border-cyan-400/25",
  OTHER: "text-muted-foreground bg-muted border-border",
}

const LEVEL_LABEL: Record<string, string> = {
  FRESHER: "Fresher",
  JUNIOR: "Junior",
  MID: "Mid-Level",
  SENIOR: "Senior",
}

// ─────────────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const [user, profiles] = await Promise.all([
    getDashboardProfile(),
    getJobProfilesAction(),
  ])

  const name = user.name?.split(" ")[0] ?? "there"
  const interviewCount = user._count.interviews
  const resumeCount = user._count.resumes
  const hasCredits = !user.freeInterviewUsed

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
            {profiles.length === 0
              ? "Create a job profile to get started."
              : `You have ${profiles.length} job profile${profiles.length !== 1 ? "s" : ""} set up.`}
          </p>
        </div>

        {/* Credits pill */}
        <div className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-medium ${hasCredits
            ? "bg-green-500/8 border-green-500/25 text-green-600 dark:text-green-400"
            : "bg-surface-1 border-border text-muted-foreground"
          }`}>
          <span className={`h-2 w-2 rounded-full ${hasCredits ? "bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" : "bg-muted-foreground/40"}`} />
          {hasCredits ? "1 free session available" : "Free session used"}
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
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <p className="text-xs font-semibold uppercase tracking-wide opacity-80">Quick Start</p>
            </div>
            <h3 className="font-bold text-lg leading-tight mb-4">Ready to practice?</h3>
            <Button asChild size="sm" className="bg-background text-foreground hover:bg-background/90 rounded-full gap-1.5 font-semibold text-xs h-8">
              <Link href="/interview/setup">
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
            {profiles.length > 0 && (
              <Badge variant="secondary" className="text-xs">{profiles.length}</Badge>
            )}
          </div>
          {/* Dialog trigger — create profile inline */}
          <CreateProfileDialog>
            <Button variant="outline" size="sm" className="rounded-full gap-1.5 h-8 text-xs border-border/60">
              <Plus className="h-3.5 w-3.5" /> New Profile
            </Button>
          </CreateProfileDialog>
        </div>

        {profiles.length === 0 ? (
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
              const ecosystemClass = ECOSYSTEM_COLOR[profile.ecosystem ?? "OTHER"] ?? ECOSYSTEM_COLOR.OTHER
              const level = LEVEL_LABEL[profile.experienceLevel] ?? profile.experienceLevel

              return (
                <Link
                  key={profile.id}
                  href={`/profile/${profile.id}`}
                  className="group bg-card border border-border/50 hover:border-primary/35 rounded-2xl p-5 flex flex-col gap-4 hover:shadow-md hover:shadow-primary/5 transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all mt-0.5" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">
                      {profile.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Target className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{profile.targetRole}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-2 py-0.5 font-medium ${ecosystemClass}`}
                      >
                        {profile.ecosystem ?? "General"}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] px-2 py-0.5 font-medium text-muted-foreground border-border/50">
                        {level}
                      </Badge>
                    </div>

                    {/* Resume status */}
                    <span className={`flex items-center gap-1 text-[10px] font-medium ${profile.activeResume ? "text-green-500" : "text-amber-500"
                      }`}>
                      {profile.activeResume
                        ? <><CheckCircle2 className="h-3 w-3" /> Resume ready</>
                        : <><CircleDashed className="h-3 w-3" /> No resume</>
                      }
                    </span>
                  </div>

                  {/* Interview count */}
                  <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{profile._count.interviews} interview{profile._count.interviews !== 1 ? "s" : ""}</span>
                    <span className="text-[10px] text-muted-foreground/50">{profile._count.resumes} resume{profile._count.resumes !== 1 ? "s" : ""}</span>
                  </div>
                </Link>
              )
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
