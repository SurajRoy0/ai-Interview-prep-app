'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, FileText, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { uploadResumeAction } from '@/actions/resume'
import { Button } from '@/components/ui/button'

export function ResumeUploader({ jobProfileId, onUploadComplete }: { jobProfileId: string, onUploadComplete: () => void }) {
  const [isUploading, setIsUploading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be less than 5MB')
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    const res = await uploadResumeAction(jobProfileId, formData)
    setIsUploading(false)

    if (!res.success) {
      toast.error(res.error)
      return
    }

    setIsSuccess(true)
    toast.success('Resume uploaded successfully!')
    setTimeout(() => {
      onUploadComplete()
    }, 1500)
  }, [jobProfileId, onUploadComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  })

  return (
    <div 
      {...getRootProps()} 
      className={`
        relative overflow-hidden rounded-2xl border border-white/10 dark:bg-black/40 bg-white/80 
        backdrop-blur-xl p-10 text-center cursor-pointer transition-all duration-300
        ${isDragActive ? 'border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.2)]' : 'hover:border-white/20 hover:bg-black/60 hover:dark:bg-black/60 shadow-lg'}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center space-y-4">
        {isUploading ? (
          <Loader2 className="h-12 w-12 text-cyan-400 animate-spin" />
        ) : isSuccess ? (
          <CheckCircle2 className="h-12 w-12 text-green-400" />
        ) : (
          <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
            <UploadCloud className="h-10 w-10 text-cyan-300" />
          </div>
        )}
        
        <div className="space-y-2">
          <h3 className="text-xl font-medium text-slate-900 dark:text-white">
            {isUploading ? 'Uploading & Parsing...' : isSuccess ? 'Upload Complete!' : 'Upload your Resume'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isDragActive ? 'Drop your PDF here' : 'Drag & drop your PDF, or click to browse'}
          </p>
        </div>
      </div>
    </div>
  )
}
