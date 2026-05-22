'use client'

import { useState, useEffect } from 'react'
import { ResumeUploader } from '@/components/resume/ResumeUploader'
import { requestAtsScoreAction } from '@/actions/ats'
import { getJobProfileStatusAction as fetchStatus } from '@/actions/job-profile'
import { useRouter } from 'next/navigation'
import { Loader2, Activity, Play, FileText, CheckCircle2, ChevronRight, Target } from 'lucide-react'
import { toast } from 'sonner'

export default function ProfileClient({ profile }: { profile: any }) {
  const router = useRouter()
  const [status, setStatus] = useState({
    parseStatus: profile.resume?.parseStatus ?? 'PENDING',
    atsStatus: profile.atsReport?.status ?? 'PENDING',
    atsScore: profile.atsReport?.overallScore ?? null,
  })
  const [isRequestingAts, setIsRequestingAts] = useState(false)

  // Poll status if parsing or generating ATS
  useEffect(() => {
    if (!profile.resumeId) return
    
    const needsPolling = 
      status.parseStatus === 'PENDING' || 
      status.parseStatus === 'PROCESSING' || 
      status.atsStatus === 'GENERATING' || 
      status.atsStatus === 'PENDING'

    if (!needsPolling) return

    const interval = setInterval(async () => {
      const res = await fetchStatus(profile.id)
      if (res.success) {
        setStatus(res.data)
        if (res.data.parseStatus === 'DONE' && status.parseStatus !== 'DONE') {
          router.refresh() // Refresh to get parsedData if needed
        }
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [profile.id, profile.resumeId, status, router])

  const handleRequestAts = async () => {
    setIsRequestingAts(true)
    const res = await requestAtsScoreAction(profile.id)
    if (!res.success) {
      toast.error(res.error)
    } else {
      toast.success('ATS Scan started!')
      setStatus(s => ({ ...s, atsStatus: 'PENDING' }))
    }
    setIsRequestingAts(false)
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <header>
        <div className="flex items-center gap-3 text-slate-400 mb-4">
          <span className="cursor-pointer hover:text-white" onClick={() => router.push('/dashboard')}>Dashboard</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white">{profile.title}</span>
        </div>
        <h1 className="text-4xl font-semibold">{profile.targetRole}</h1>
        <div className="flex gap-4 mt-4 text-sm text-slate-400">
          <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5">{profile.experienceLevel}</span>
          {profile.ecosystem && <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5">{profile.ecosystem}</span>}
        </div>
      </header>

      {!profile.resumeId ? (
        <section className="max-w-2xl">
          <h2 className="text-2xl font-medium mb-6">Step 1: Upload Resume</h2>
          <ResumeUploader jobProfileId={profile.id} onUploadComplete={() => router.refresh()} />
        </section>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ATS Card */}
          <div className="border border-white/10 bg-white/5 backdrop-blur-xl rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
              <Activity className="w-32 h-32 text-cyan-500" />
            </div>
            
            <h2 className="text-2xl font-medium mb-6 relative z-10 flex items-center gap-3">
              <FileText className="w-6 h-6 text-cyan-400" /> 
              Resume & ATS Score
            </h2>

            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-slate-300">Resume uploaded & parsed</span>
              </div>

              {!profile.atsReport && status.parseStatus === 'DONE' && (
                <button 
                  onClick={handleRequestAts}
                  disabled={isRequestingAts}
                  className="bg-cyan-500 hover:bg-cyan-400 text-black px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2"
                >
                  {isRequestingAts ? <Loader2 className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5" />}
                  Generate ATS Report
                </button>
              )}

              {(status.atsStatus === 'PENDING' || status.atsStatus === 'GENERATING') && (
                <div className="flex items-center gap-3 text-cyan-400 bg-cyan-500/10 px-4 py-3 rounded-xl border border-cyan-500/20">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating your ATS insights...
                </div>
              )}

              {status.atsStatus === 'DONE' && status.atsScore && (
                <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-end gap-4 mb-2">
                    <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                      {status.atsScore}%
                    </span>
                    <span className="text-slate-400 mb-1">Match Score</span>
                  </div>
                  <p className="text-sm text-slate-500">Your resume has been analyzed against the {profile.targetRole} requirements.</p>
                </div>
              )}
            </div>
          </div>

          {/* Mock Interview Card */}
          <div className="border border-white/10 bg-white/5 backdrop-blur-xl rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
              <Play className="w-32 h-32 text-purple-500" />
            </div>

            <h2 className="text-2xl font-medium mb-6 relative z-10 flex items-center gap-3">
              <Target className="w-6 h-6 text-purple-400" /> 
              Mock Interviews
            </h2>

            <div className="relative z-10 space-y-6">
              <p className="text-slate-400">
                Ready to test your skills? Start a hyper-realistic AI voice interview tailored specifically to this role and your resume.
              </p>

              <button 
                disabled={status.parseStatus !== 'DONE'}
                className="bg-purple-500 hover:bg-purple-400 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-5 h-5 fill-current" />
                Start New Interview
              </button>

              {profile.interviews.length > 0 && (
                <div className="pt-6 border-t border-white/10">
                  <h3 className="text-sm font-medium text-slate-500 mb-4">RECENT INTERVIEWS</h3>
                  <div className="space-y-3">
                    {profile.interviews.map((int: any) => (
                      <div key={int.id} className="flex justify-between items-center p-3 rounded-lg bg-black/20 hover:bg-black/40 cursor-pointer transition-colors border border-white/5">
                        <span className="text-slate-300">Session • {new Date(int.createdAt).toLocaleDateString()}</span>
                        <span className="text-xs px-2 py-1 rounded-md bg-white/10 text-slate-300">{int.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
