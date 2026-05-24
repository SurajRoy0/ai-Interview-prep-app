'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { uploadResumeAction } from '@/actions/resume'
import { toast } from 'sonner'
import { UploadCloud, FileText, Loader2, AlertCircle } from 'lucide-react'

const LOADING_MESSAGES = [
  "Reading your resume like a recruiter on 2 coffees ☕",
  "Finding impressive things to ask about 👀",
  "Teaching AI about your career journey 🤖",
  "Scanning projects for interview traps 🧠",
  "Converting resume chaos into structured intelligence ✨"
]

export function ResumeUploader({ jobProfileId, isServerProcessing }: { jobProfileId: string, isServerProcessing?: boolean }) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [messageIndex, setMessageIndex] = useState(0)

  // Clear internal states if server finished processing
  useEffect(() => {
    if (!isServerProcessing) {
      setIsUploading(false)
      setFile(null)
    }
  }, [isServerProcessing])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
      setUploadError(null)
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

    setIsUploading(true)
    setUploadError(null)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('jobProfileId', jobProfileId)

    try {
      const result = await uploadResumeAction(formData)
      
      if (result.success) {
        toast.success('Resume uploaded! AI is analyzing it now.')
      } else {
        setUploadError(result.error?.message || 'Upload failed')
        setIsUploading(false)
        setFile(null)
      }
    } catch (e) {
      console.error(e)
      setUploadError('A network or server error occurred')
      setIsUploading(false)
      setFile(null)
    }
  }

  // Rotating loading messages
  useEffect(() => {
    if (!isServerProcessing) return
    const messageInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length)
    }, 2500)
    return () => clearInterval(messageInterval)
  }, [isServerProcessing])

  if (isUploading || isServerProcessing) {
    return (
      <div className="bg-card border border-border rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <h3 className="text-xl font-bold text-foreground">
          {isUploading && !isServerProcessing ? 'Uploading Document...' : 'AI is Parsing Resume...'}
        </h3>
        <p className="text-muted-foreground text-sm font-medium animate-pulse min-h-[40px]">
          {isUploading && !isServerProcessing 
            ? 'Sending your file securely to our servers.'
            : LOADING_MESSAGES[messageIndex]}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {uploadError && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{uploadError}</span>
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
              onClick={() => { setFile(null); setUploadError(null); }}
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
