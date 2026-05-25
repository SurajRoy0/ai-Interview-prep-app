import Link from "next/link"
import { getJobProfilesAction } from "@/actions/job-profile"
import {
  Briefcase, Plus, Target, ChevronRight, CheckCircle2, CircleDashed
} from "lucide-react"
import { CreateProfileDialog } from "@/components/job-profiles/create-profile-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

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

const LIMIT = 10

export default async function JobProfilesPage({
  searchParams
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page } = await searchParams
  const currentPage = Math.max(1, Number(page || 1))

  const result = await getJobProfilesAction({ page: currentPage, limit: LIMIT })
  const profiles = result.success ? result.data.profiles : []
  const totalCount = result.success ? result.data.totalCount : 0
  const totalPages = Math.ceil(totalCount / LIMIT)

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Job Profiles 💼
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {totalCount === 0
              ? "Create a job profile to target roles."
              : `Showing page ${currentPage} of ${totalPages || 1} (${totalCount} profile${totalCount !== 1 ? "s" : ""} in total)`}
          </p>
        </div>

        <CreateProfileDialog>
          <Button size="sm" className="rounded-full gap-1.5 h-9 shadow-primary-glow font-semibold">
            <Plus className="h-4 w-4" /> New Profile
          </Button>
        </CreateProfileDialog>
      </div>

      {/* ── Grid ───────────────────────────────────────────────────────────── */}
      {totalCount === 0 ? (
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
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            {profiles.map(profile => {
              const ecosystemClass = ECOSYSTEM_COLOR[profile.ecosystem ?? "OTHER"] ?? ECOSYSTEM_COLOR.OTHER
              const level = LEVEL_LABEL[profile.experienceLevel] ?? profile.experienceLevel

              return (
                <Link
                  key={profile.id}
                  href={`/job-profiles/${profile.id}`}
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

                    <span className={`flex items-center gap-1 text-[10px] font-medium ${profile.activeResume ? "text-green-500" : "text-amber-500"}`}>
                      {profile.activeResume
                        ? <><CheckCircle2 className="h-3 w-3" /> Resume ready</>
                        : <><CircleDashed className="h-3 w-3" /> No resume</>
                      }
                    </span>
                  </div>

                  <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{profile._count.interviews} interview{profile._count.interviews !== 1 ? "s" : ""}</span>
                    <span className="text-[10px] text-muted-foreground/50">{profile._count.resumes} resume{profile._count.resumes !== 1 ? "s" : ""}</span>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* ── Pagination Controls ────────────────────────────────────────── */}
          {totalPages > 1 && (
            <Pagination className="pt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href={`/job-profiles?page=${Math.max(1, currentPage - 1)}`}
                    className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pNum = idx + 1
                  const isCurrent = pNum === currentPage
                  return (
                    <PaginationItem key={pNum}>
                      <PaginationLink
                        href={`/job-profiles?page=${pNum}`}
                        isActive={isCurrent}
                      >
                        {pNum}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}

                <PaginationItem>
                  <PaginationNext
                    href={`/job-profiles?page=${Math.min(totalPages, currentPage + 1)}`}
                    className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}
    </div>
  )
}

