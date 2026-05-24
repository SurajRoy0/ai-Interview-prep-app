'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createJobProfileSchema } from '@repo/validators'
import { z } from 'zod'
import { createJobProfileAction } from '@/actions/job-profile'
import { toast } from 'sonner'
import { ArrowLeft, Briefcase, Code, Loader2, Target } from 'lucide-react'
import Link from 'next/link'

type FormData = z.infer<typeof createJobProfileSchema>

export default function CreateJobProfilePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(createJobProfileSchema),
    defaultValues: {
      experienceLevel: 'MID',
      ecosystem: 'JAVASCRIPT',
    }
  })

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      const result = await createJobProfileAction(data)
      if (result.success) {
        toast.success('Job profile created!')
        router.push(`/profile/${result.data.id}`)
      } else {
        toast.error(result.error.message)
      }
    } catch (e) {
      toast.error('Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="p-2 rounded-full hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Job Profile</h1>
          <p className="text-muted-foreground mt-1">Define the role you are targeting to generate tailored interviews.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" />
              Profile Title
            </label>
            <input 
              {...register('title')} 
              placeholder="e.g. Senior Frontend at Startups" 
              className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            {errors.title && <p className="text-destructive text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Target Role
            </label>
            <input 
              {...register('targetRole')} 
              placeholder="e.g. Frontend Engineer" 
              className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            {errors.targetRole && <p className="text-destructive text-xs mt-1">{errors.targetRole.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Experience Level</label>
              <select 
                {...register('experienceLevel')} 
                className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
              >
                <option value="FRESHER">Fresher (0 years)</option>
                <option value="JUNIOR">Junior (0-2 years)</option>
                <option value="MID">Mid-Level (2-5 years)</option>
                <option value="SENIOR">Senior (5+ years)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Code className="w-4 h-4 text-primary" />
                Primary Ecosystem
              </label>
              <select 
                {...register('ecosystem')} 
                className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
              >
                <option value="JAVASCRIPT">JavaScript / TypeScript</option>
                <option value="PYTHON">Python</option>
                <option value="JAVA">Java</option>
                <option value="GO">Go</option>
                <option value="OTHER">Other / Language Agnostic</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Notes (Optional)</label>
            <textarea 
              {...register('description')} 
              placeholder="Any specific focus areas? e.g. 'Focus heavily on React Server Components and performance.'" 
              className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[100px] resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground font-bold px-8 py-3 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Profile
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
