import { getJobProfileByIdAction, getJobProfileResumesAction } from "@/actions/job-profile"
import { getUserActivePlanConfig } from "@repo/db"
import { getSession } from "@/lib/auth-server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, CheckCircle2, FileText, Activity, Star } from "lucide-react"
import { ResumeUploader } from "@/components/candidate/resume/resume-uploader"
import { ResumeCard } from "@/components/candidate/resume/resume-card"
import { ClientRefreshPoller } from "@/components/candidate/resume/client-refresh-poller"
import { StartInterviewModal } from "@/components/candidate/interview/start-interview-modal"
import { Badge } from "@/components/ui/badge"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default async function JobProfileDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>,
  searchParams: Promise<{ resumePage?: string }>
}) {
  const { id } = await params
  const { resumePage } = await searchParams
  const currentPage = Math.max(1, Number(resumePage || 1))

  const RESUMES_LIMIT = 5

  const session = await getSession()
  if (!session) return notFound()

  const [profileResult, resumesResult, planConfig] = await Promise.all([
    getJobProfileByIdAction(id),
    getJobProfileResumesAction(id, currentPage, RESUMES_LIMIT),
    getUserActivePlanConfig(session.user.id)
  ])

  if (!profileResult.success) return notFound()
  const profile = profileResult.data

  const resumes = resumesResult.success ? resumesResult.data.resumes : []
  const totalCount = resumesResult.success ? resumesResult.data.totalCount : 0

  const hasActiveResume = !!profile.activeResumeId

  const sortedResumes = resumes

  const isProcessing = sortedResumes.some((r) => r.parseStatus === "PENDING" || r.parseStatus === "PROCESSING")

  // Map to find which resumes have been used in interviews
  const resumeIdToInterviewCount = new Map<string, number>()
  profile.interviews.forEach((interview) => {
    const current = resumeIdToInterviewCount.get(interview.resumeId) || 0
    resumeIdToInterviewCount.set(interview.resumeId, current + 1)
  })

  const totalResumePages = Math.ceil(totalCount / RESUMES_LIMIT)

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <ClientRefreshPoller isProcessing={isProcessing} />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/50 pb-6">
        <div className="flex items-start gap-4">
          <Link
            href="/candidate/dashboard"
            className="mt-1 flex items-center justify-center h-8 w-8 rounded-full hover:bg-surface-2 text-muted-foreground hover:text-foreground transition-colors shrink-0"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                {profile.title}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
              <span className="font-medium text-foreground">{profile.targetRole}</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span>{profile.experienceLevel}</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <Badge variant="outline" className="text-[10px] px-2 py-0 h-5 font-medium border-border/60">
                {profile.ecosystem || "Language Agnostic"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">

        {/* ── Main Content Area (2/3) ────────────────────────────────────────── */}
        <div className="md:col-span-2 space-y-8">

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-muted-foreground" />
                Resumes
              </h2>
              {hasActiveResume && (
                <Badge className="bg-primary/10 text-primary border-primary/20 gap-1 rounded-full font-medium shadow-sm">
                  <Star className="w-3 h-3 fill-current" /> Active Version {profile.activeResume?.version}
                </Badge>
              )}
            </div>

            {/* Uploader */}
            <ResumeUploader jobProfileId={profile.id} isServerProcessing={isProcessing} />

            {/* Version History */}
            <div className="space-y-4 pt-4">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground border-b border-border/40 pb-2">
                Version History
              </h3>

              {sortedResumes.length === 0 ? (
                <div className="text-center py-10 bg-surface-1 rounded-2xl border border-dashed border-border/60">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground">No resumes uploaded</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                    Upload your first resume above. We&apos;ll extract your skills and build your interview plan.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {sortedResumes.map((resume) => (
                      <ResumeCard
                        key={resume.id}
                        resume={resume}
                        isActive={resume.id === profile.activeResumeId}
                        hasInterviews={(resumeIdToInterviewCount.get(resume.id) || 0) > 0}
                      />
                    ))}
                  </div>

                  {/* Resume Pagination controls */}
                  {totalResumePages > 1 && (
                    <Pagination className="pt-4">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href={`/candidate/job-profiles/${profile.id}?resumePage=${Math.max(1, currentPage - 1)}`}
                            className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>

                        {Array.from({ length: totalResumePages }).map((_, idx) => {
                          const pNum = idx + 1
                          const isCurrent = pNum === currentPage
                          return (
                            <PaginationItem key={pNum}>
                              <PaginationLink
                                href={`/candidate/job-profiles/${profile.id}?resumePage=${pNum}`}
                                isActive={isCurrent}
                              >
                                {pNum}
                              </PaginationLink>
                            </PaginationItem>
                          )
                        })}

                        <PaginationItem>
                          <PaginationNext
                            href={`/candidate/job-profiles/${profile.id}?resumePage=${Math.min(totalResumePages, currentPage + 1)}`}
                            className={currentPage >= totalResumePages ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </div>
              )}
            </div>
          </section>


        </div>

        {/* ── Sidebar (1/3) ──────────────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Quick Start Card */}
          <div className="bg-primary border border-primary rounded-3xl p-6 shadow-primary-glow text-primary-foreground relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Ready to practice?</h3>
              <p className="text-primary-foreground/90 text-sm mb-6 leading-relaxed">
                Start a mock interview tailored to <strong className="font-semibold">{profile.targetRole}</strong> using your active resume.
              </p>
              <StartInterviewModal
                jobProfileId={profile.id}
                allowedDifficultyModes={planConfig.allowedDifficultyModes}
                hasActiveResume={hasActiveResume}
              />
              {!hasActiveResume && (
                <p className="text-xs text-primary-foreground/70 mt-3 text-center font-medium">
                  Upload and activate a resume first
                </p>
              )}
            </div>
          </div>

          {/* Interview History */}
          <div className="bg-surface-1 border border-border/50 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Recent Interviews
            </h3>

            {profile.interviews.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm font-medium text-foreground mb-1">No interviews yet</p>
                <p className="text-xs text-muted-foreground">Your recent session results will appear here.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {profile.interviews.map((interview) => (
                  <Link
                    key={interview.id}
                    href={`#`}
                    className="flex items-center justify-between group bg-surface-2 hover:bg-surface-3 border border-border/40 p-3 rounded-xl transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 group-hover:bg-primary group-hover:border-primary transition-colors">
                        <CheckCircle2 className="w-4 h-4 text-primary group-hover:text-primary-foreground transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
                          {interview.title || "Mock Interview"}
                        </p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5 uppercase tracking-wider font-medium">
                          <Calendar className="w-3 h-3" />
                          {new Date(interview.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right pl-2">
                      <p className="text-lg font-black text-foreground">{interview.overallScore || "--"}</p>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">Score</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
