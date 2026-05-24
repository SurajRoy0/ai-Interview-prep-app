import Link from "next/link"
import { getDashboardProfile } from "@/actions/user"
import { getJobProfilesAction } from "@/actions/job-profile"
import { ArrowRight, FileText, CheckCircle2, CircleDashed, Mic, Activity, Clock, Zap, Plus, Briefcase } from "lucide-react"

export default async function DashboardPage() {
  const user = await getDashboardProfile()
  const profiles = await getJobProfilesAction()

  const name = user.name?.split(" ")[0] ?? "there"
  const interviewCount = user._count.interviews
  const resumeCount = user._count.resumes

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">

      {/* Hero Greeting */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Welcome back, {name}.
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl">
            Here's a high-level overview of your interview preparation journey.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-card border border-border px-4 py-2.5 rounded-2xl shadow-sm">
          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.8)] animate-pulse" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Credits</p>
            <p className="text-foreground font-bold">{user.freeInterviewUsed ? "Used" : "1 Available"}</p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute -right-4 -top-4 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">
            <Mic className="w-32 h-32" />
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Total Interviews</p>
          <p className="text-5xl font-black text-foreground">{interviewCount}</p>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute -right-4 -top-4 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">
            <FileText className="w-32 h-32" />
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Active Resumes</p>
          <p className="text-5xl font-black text-foreground">{resumeCount}</p>
        </div>

        <div className="p-6 rounded-3xl bg-primary border border-primary text-primary-foreground flex flex-col justify-center items-start shadow-lg relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <h3 className="text-xl font-bold mb-2">Ready to practice?</h3>
          <p className="text-primary-foreground/80 text-sm mb-4">Start a new AI-driven mock interview tailored to your resume.</p>
          <Link href="/interview/setup" className="inline-flex items-center gap-2 bg-background text-foreground px-4 py-2 rounded-full text-sm font-bold hover:opacity-90 transition-opacity shadow-sm">
            Start Interview <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Job Profiles Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            Your Job Profiles
          </h2>
          <Link href="/profile/create" className="text-sm bg-secondary text-secondary-foreground px-4 py-2 rounded-full hover:opacity-80 font-bold transition-opacity flex items-center gap-2 border border-border">
            <Plus className="w-4 h-4" /> Create Profile
          </Link>
        </div>

        <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="divide-y divide-border">

            {profiles.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center bg-muted/10">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Briefcase className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">No job profiles yet</h3>
                <p className="text-muted-foreground max-w-sm mb-6">Create a job profile to upload your resume and start generating tailored interviews.</p>
                <Link href="/profile/create" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-all font-bold shadow-md">
                  <Plus className="h-4 w-4" />
                  Create First Profile
                </Link>
              </div>
            ) : (
              profiles.map(profile => (
                <div key={profile.id} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 hover:bg-muted/50 transition-colors cursor-pointer relative">
                  
                  {/* Invisible link overlay for entire row */}
                  <Link href={`/profile/${profile.id}`} className="absolute inset-0 z-0"></Link>

                  <div className="flex items-start gap-4 z-10 pointer-events-none">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 flex-shrink-0">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">{profile.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1.5"><TargetIcon className="w-4 h-4" /> {profile.targetRole}</span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span className="flex items-center gap-1.5">
                          {profile.activeResume ? (
                            <><CheckCircle2 className="w-4 h-4 text-green-500" /> Resume active</>
                          ) : (
                            <><CircleDashed className="w-4 h-4 text-yellow-500" /> Needs resume</>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="z-10 flex gap-4 text-sm text-muted-foreground text-right hidden sm:block pointer-events-none">
                     <p className="font-bold text-foreground">{profile._count.interviews}</p>
                     <p className="text-xs uppercase tracking-wider">Interviews</p>
                  </div>
                </div>
              ))
            )}

          </div>
        </div>
      </div>

    </div>
  )
}

function TargetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}
