import { getJobProfileByIdAction } from '@/actions/job-profile'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Briefcase, Calendar, CheckCircle2, FileText, Activity } from 'lucide-react'
import { ResumeUploader } from '@/components/resume/resume-uploader'
import { ResumeCard } from '@/components/resume/resume-card'

export default async function JobProfileDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let profile;
  try {
    profile = await getJobProfileByIdAction(id)
  } catch (e) {
    notFound()
  }

  const hasActiveResume = !!profile.activeResumeId

  // Sort resumes by version descending just in case createdAt was somehow out of order
  const sortedResumes = [...profile.resumes].sort((a, b) => b.version - a.version)

  // Map to find which resumes have been used in interviews
  const resumeIdToInterviewCount = new Map<string, number>()
  profile.interviews.forEach(interview => {
    const current = resumeIdToInterviewCount.get(interview.resumeId) || 0
    resumeIdToInterviewCount.set(interview.resumeId, current + 1)
  })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border pb-6">
        <Link href="/dashboard" className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div>
          <div className="flex items-center gap-2 text-primary font-medium text-sm mb-1 uppercase tracking-wider">
            <Briefcase className="w-4 h-4" />
            Job Profile
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{profile.title}</h1>
          <p className="text-muted-foreground mt-1">
            Targeting <span className="font-semibold text-foreground">{profile.targetRole}</span> • {profile.experienceLevel} • {profile.ecosystem || 'Language Agnostic'}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Main Content Area */}
        <div className="md:col-span-2 space-y-8">
          
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              Resumes
            </h2>

            {/* Uploader is always visible so user can add new versions */}
            <div className="mb-8">
              <ResumeUploader jobProfileId={profile.id} />
            </div>

            {/* Resume History */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground">Version History</h3>
              {sortedResumes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-xl border border-dashed">
                  No resumes uploaded yet. Upload your first resume above.
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedResumes.map(resume => (
                    <ResumeCard 
                      key={resume.id}
                      resume={resume}
                      isActive={resume.id === profile.activeResumeId}
                      hasInterviews={(resumeIdToInterviewCount.get(resume.id) || 0) > 0}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-primary border border-primary rounded-3xl p-6 shadow-lg text-primary-foreground relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <h3 className="text-xl font-bold mb-2">Ready to practice?</h3>
            <p className="text-primary-foreground/80 text-sm mb-6">
              Start a new mock interview specifically tailored to {profile.targetRole} using your active resume.
            </p>
            <button 
              disabled={!hasActiveResume}
              className="w-full bg-background text-foreground font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Start Interview
            </button>
            {!hasActiveResume && <p className="text-xs text-primary-foreground/60 mt-3 text-center">Upload and activate a resume first</p>}
          </div>

          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              Interview History
            </h3>
            {profile.interviews.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No interviews taken yet for this profile.</p>
            ) : (
              <div className="space-y-4">
                {profile.interviews.map(interview => (
                  <div key={interview.id} className="flex items-center justify-between group cursor-pointer hover:bg-muted/50 p-2 -mx-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                          {interview.title || 'Mock Interview'}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(interview.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-foreground">{interview.overallScore || '--'}</p>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Score</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
