'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, ArrowRight, Target, Briefcase, Code2 } from 'lucide-react'
import { createJobProfileAction } from '@/actions/job-profile'
import { createProfileSchema } from '@repo/validators'
import type { CreateProfileInput } from '@repo/validators'
import { toast } from 'sonner'
import Link from 'next/link'

type FormData = CreateProfileInput

export default function NewProfilePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(createProfileSchema),
    defaultValues: {
      experienceLevel: 'MID',
      ecosystem: 'JAVASCRIPT',
    }
  })

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      const result = await createJobProfileAction(data)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('Job profile created!')
      router.push(`/profile/${result.data?.jobProfileId}`)
    } catch (e) {
      toast.error('Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden flex items-center justify-center p-6">
      {/* Mesh Gradients Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-600/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-xl relative z-10">
        <div className="border border-white/10 bg-white/5 backdrop-blur-2xl rounded-[2rem] p-10 md:p-12 shadow-2xl">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-semibold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-3">
              Create Job Profile
            </h1>
            <p className="text-slate-400">Tell us about the role you are preparing for.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Profile Name
              </label>
              <input 
                {...register('title')}
                placeholder="e.g. Google Frontend Interview"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all"
              />
              {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>}
            </div>

            {/* Target Role */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Target className="w-4 h-4" /> Target Role
              </label>
              <input 
                {...register('targetRole')}
                placeholder="e.g. Senior React Developer"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all"
              />
              {errors.targetRole && <p className="text-red-400 text-sm mt-1">{errors.targetRole.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Experience Level */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Experience Level</label>
                <select 
                  {...register('experienceLevel')}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 appearance-none"
                >
                  <option value="FRESHER">Fresher (0 years)</option>
                  <option value="JUNIOR">Junior (1-2 years)</option>
                  <option value="MID">Mid-Level (3-5 years)</option>
                  <option value="SENIOR">Senior (5+ years)</option>
                </select>
              </div>

              {/* Ecosystem */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Code2 className="w-4 h-4" /> Primary Ecosystem
                </label>
                <select 
                  {...register('ecosystem')}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 appearance-none"
                >
                  <option value="JAVASCRIPT">JavaScript / TS</option>
                  <option value="PYTHON">Python</option>
                  <option value="JAVA">Java</option>
                  <option value="GO">Go</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div className="pt-6 flex gap-4">
              <Link 
                href="/dashboard"
                className="flex-1 py-4 text-center rounded-xl border border-white/10 hover:bg-white/5 transition-colors font-medium text-slate-300"
              >
                Cancel
              </Link>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold transition-all shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
