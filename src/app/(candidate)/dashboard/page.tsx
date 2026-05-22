import { getJobProfilesAction } from '@/actions/job-profile'
import { requireSession } from '@/lib/auth-server'
import Link from 'next/link'
import { Plus, Briefcase, Activity, Target } from 'lucide-react'

export default async function DashboardPage() {
  const session = await requireSession()
  const result = await getJobProfilesAction()
  if (!result.success) throw new Error(result.error)
  
  const profiles = result.data

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Mesh Gradients Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-semibold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Your Job Profiles
            </h1>
            <p className="text-slate-400 mt-2">Manage your AI interview preparation across different roles.</p>
          </div>
          <Link 
            href="/profile/new" 
            className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-slate-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            <Plus className="w-5 h-5" />
            Create Profile
          </Link>
        </header>

        {/* Bento Grid layout */}
        {profiles.length === 0 ? (
          <div className="border border-white/10 bg-white/5 backdrop-blur-xl rounded-3xl p-16 text-center max-w-2xl mx-auto mt-20">
            <Briefcase className="w-16 h-16 text-slate-500 mx-auto mb-6" />
            <h3 className="text-2xl font-medium mb-3">No profiles yet</h3>
            <p className="text-slate-400 mb-8 text-lg">Create your first job profile to start your interview prep.</p>
            <Link 
              href="/profile/new" 
              className="inline-flex items-center gap-2 bg-cyan-500 text-black px-8 py-4 rounded-full font-semibold hover:bg-cyan-400 transition-colors shadow-[0_0_30px_rgba(6,182,212,0.3)]"
            >
              <Plus className="w-5 h-5" />
              Create Profile
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map(profile => (
              <Link key={profile.id} href={`/profile/${profile.id}`}>
                <div className="group relative border border-white/10 bg-white/5 backdrop-blur-md rounded-3xl p-8 hover:bg-white/10 hover:border-cyan-500/50 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity" />
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-white/5">
                        <Target className="w-6 h-6 text-cyan-400" />
                      </div>
                      {profile.atsReport?.overallScore ? (
                        <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
                          <Activity className="w-4 h-4 text-emerald-400" />
                          <span className="text-sm font-medium text-emerald-400">
                            {profile.atsReport.overallScore}% ATS
                          </span>
                        </div>
                      ) : (
                        <div className="px-3 py-1.5 rounded-full border border-white/5 bg-white/5 text-sm text-slate-400">
                          {profile.resume?.parseStatus === 'DONE' ? 'Ready for ATS' : profile.resume?.parseStatus === 'PENDING' ? 'Parsing...' : 'No ATS Score'}
                        </div>
                      )}
                    </div>

                    <h3 className="text-2xl font-semibold mb-1 truncate">{profile.targetRole}</h3>
                    <p className="text-slate-400 text-sm mb-6 truncate">{profile.title}</p>

                    <div className="flex items-center gap-4 text-sm text-slate-500 border-t border-white/5 pt-6">
                      <div>
                        <span className="text-white font-medium">{profile._count.interviews}</span> Interviews
                      </div>
                      <div>
                        <span className="text-white font-medium capitalize">{profile.experienceLevel.toLowerCase()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
