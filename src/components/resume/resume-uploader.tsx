'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { uploadResumeAction, getResumeStatusAction } from '@/actions/resume'
import { toast } from 'sonner'
import { UploadCloud, FileText, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

const LOADING_MESSAGES = [
  "Reading your resume like a recruiter on 2 coffees ☕",
  "Finding impressive things to ask about 👀",
  "Teaching AI about your career journey 🤖",
  "Scanning projects for interview traps 🧠",
  "Converting resume chaos into structured intelligence ✨"
]

export function ResumeUploader({ jobProfileId }: { jobProfileId: string }) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done' | 'failed'>('idle')
  const [resumeId, setResumeId] = useState<string | null>(null)
  const [messageIndex, setMessageIndex] = useState(0)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
      setStatus('idle')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024 // 5MB
  })

  const handleUpload = async () => {
    if (!file) return

    setStatus('uploading')
    const formData = new FormData()
    formData.append('file', file)
    formData.append('jobProfileId', jobProfileId)

    try {
      const result = await uploadResumeAction(formData)
      
      if (result.success) {
        setResumeId(result.data.resumeId)
        setStatus('processing')
        toast.success('Resume uploaded! AI is analyzing it now.')
      } else {
        setStatus('failed')
        toast.error(result.error?.message || 'Upload failed')
        setFile(null)
      }
    } catch (e) {
      console.error(e)
      setStatus('failed')
      toast.error('A network or server error occurred')
      setFile(null)
    }
  }

  // Rotating loading messages
  useEffect(() => {
    if (status !== 'processing') return
    const messageInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length)
    }, 2500)
    return () => clearInterval(messageInterval)
  }, [status])

  // Polling logic
  useEffect(() => {
    if (status !== 'processing' || !resumeId) return

    const pollInterval = setInterval(async () => {
      const result = await getResumeStatusAction(resumeId)
      if (result.success) {
        if (result.data.status === 'DONE') {
          setStatus('done')
          toast.success('Resume parsing complete!')
          router.refresh()
          clearInterval(pollInterval)
          
          // Reset after a short delay so user can upload another if they want
          setTimeout(() => {
            setStatus('idle')
            setFile(null)
            setResumeId(null)
          }, 3000)

        } else if (result.data.status === 'FAILED') {
          setStatus('failed')
          toast.error(result.data.parseError || 'AI failed to parse the resume.')
          router.refresh()
          clearInterval(pollInterval)
        }
      }
    }, 2000)

    return () => clearInterval(pollInterval)
  }, [status, resumeId, router])

  if (status === 'done') {
    return (
      <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-3 animate-in zoom-in duration-500">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-foreground">Parsing Complete</h3>
        <p className="text-muted-foreground text-sm max-w-sm">Your resume has been added and set as active.</p>
      </div>
    )
  }

  if (status === 'uploading' || status === 'processing') {
    return (
      <div className="bg-card border border-border rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <h3 className="text-xl font-bold text-foreground">
          {status === 'uploading' ? 'Uploading Document...' : 'AI is Parsing Resume...'}
        </h3>
        <p className="text-muted-foreground text-sm font-medium animate-pulse min-h-[40px]">
          {status === 'uploading' 
            ? 'Sending your file securely to our servers.'
            : LOADING_MESSAGES[messageIndex]}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {status === 'failed' && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Failed to process resume. Please try uploading again.</span>
        </div>
      )}

      {!file ? (
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <UploadCloud className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">Upload new version</h3>
          <p className="text-muted-foreground text-sm">Drag & drop your PDF or DOCX here, or click to browse</p>
          <p className="text-muted-foreground/60 text-xs mt-4">Max file size: 5MB</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-foreground truncate max-w-[200px] md:max-w-md">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { setFile(null); setStatus('idle'); }}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleUpload}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-full text-sm font-bold shadow-sm hover:opacity-90 transition-opacity"
            >
              Process File
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
