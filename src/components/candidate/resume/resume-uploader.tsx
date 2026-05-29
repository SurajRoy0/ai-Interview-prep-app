"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { uploadResumeAction } from "@/actions/candidate/resume"
import { toast } from "sonner"
import { UploadCloud, FileText, Loader2, AlertCircle, Sparkles, Lock } from "lucide-react"
import { useAppStore } from "@/components/providers/app-store-provider"
import { useRouter } from "next/navigation"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const LOADING_MESSAGES = [
  "Reading your resume like a recruiter on 2 coffees ☕",
  "Finding impressive things to ask about 👀",
  "Teaching AI about your career journey 🤖",
  "Scanning projects for interview traps 🧠",
  "Converting resume chaos into structured intelligence ✨"
]

interface Props {
  jobProfileId: string
  isServerProcessing?: boolean
  currentCount?: number
}

export function ResumeUploader({ jobProfileId, isServerProcessing, currentCount }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [messageIndex, setMessageIndex] = useState(0)
  const router = useRouter()

  const planConfig = useAppStore(state => state.planConfig)
  const isLimitReached = planConfig && currentCount !== undefined ? currentCount >= planConfig.maxResumeUploadsPerJobProfile : false

  // Clear internal states if server finished processing
  useEffect(() => {
    if (!isServerProcessing) {
      setIsUploading(false)
      setFile(null)
    }
  }, [isServerProcessing])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (isLimitReached) return
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
      setUploadError(null)
    }
  }, [isLimitReached])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"]
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024 // 5MB
  })

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setUploadError(null)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("jobProfileId", jobProfileId)

    try {
      const result = await uploadResumeAction(formData)
      if (result.success) {
        toast.success("Resume uploaded! AI is analyzing it now.")
        router.refresh()
      } else {
        setUploadError(result.error?.message || "Upload failed")
        setIsUploading(false)
        setFile(null)
      }
    } catch (e) {
      console.error(e)
      setUploadError("A network or server error occurred")
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
      <div className="bg-surface-1 border border-border/50 rounded-3xl p-10 flex flex-col items-center justify-center text-center space-y-5 shadow-sm relative overflow-hidden">
        {/* Subtle background pulse */}
        <div className="absolute inset-0 bg-primary/5 animate-pulse" />

        <div className="relative z-10">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 shadow-primary-glow">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          <h3 className="text-xl font-bold text-foreground">
            {isUploading && !isServerProcessing ? "Uploading Document..." : "AI is Parsing Resume..."}
          </h3>
          <p className="text-muted-foreground text-sm font-medium animate-pulse min-h-[40px] mt-2 max-w-[280px] mx-auto leading-relaxed">
            {isUploading && !isServerProcessing
              ? "Sending your file securely to our servers."
              : LOADING_MESSAGES[messageIndex]}
          </p>

          {/* Progress bar visual only */}
          {isServerProcessing && (
            <div className="w-full max-w-xs mx-auto h-1.5 bg-border rounded-full mt-6 overflow-hidden">
              <div className="h-full bg-primary w-full animate-pulse rounded-full" style={{ animationDuration: '2s' }} />
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {uploadError && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium leading-relaxed">{uploadError}</span>
        </div>
      )}

      {!file ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                {...(isLimitReached ? {} : getRootProps())}
                className={`relative border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-300 group ${
                  isLimitReached 
                    ? "border-border/40 bg-surface-1/50 opacity-60 cursor-not-allowed" 
                    : isDragActive
                      ? "border-primary bg-primary/5 shadow-primary-glow cursor-pointer"
                      : "border-border/60 hover:border-primary/40 hover:bg-surface-1 cursor-pointer"
                }`}
              >
                {!isLimitReached && <input {...getInputProps()} />}

                {/* Icon */}
                <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-5 transition-colors ${
                  isLimitReached ? "bg-surface-2 text-muted-foreground/50" :
                  isDragActive ? "bg-primary text-primary-foreground shadow-md" : "bg-surface-2 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                }`}>
                  {isLimitReached ? (
                    <Lock className="w-6 h-6" />
                  ) : (
                    <UploadCloud className={`w-8 h-8 ${isDragActive ? "animate-bounce" : ""}`} />
                  )}
                </div>

                <h3 className={`text-lg font-bold mb-1 transition-colors ${
                  isLimitReached ? "text-muted-foreground" :
                  isDragActive ? "text-primary" : "text-foreground"
                }`}>
                  {isLimitReached ? "Upload Limit Reached" : isDragActive ? "Drop to upload" : "Upload new resume"}
                </h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  {isLimitReached ? "You cannot upload any more resumes to this profile." : "Drag & drop your PDF or DOCX here, or click to browse"}
                </p>
                {!isLimitReached && (
                  <div className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                    <span>PDF / DOCX</span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span>Max 5MB</span>
                  </div>
                )}
              </div>
            </TooltipTrigger>
            {isLimitReached && (
              <TooltipContent side="top" className="bg-destructive text-destructive-foreground">
                <p>You have reached your plan limit of {planConfig?.maxResumeUploadsPerJobProfile} resume(s) per job profile.</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      ) : (
        <div className="bg-surface-1 border border-border/50 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-foreground truncate max-w-[200px] md:max-w-md">{file.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => { setFile(null); setUploadError(null); }}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-surface-2"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="bg-primary text-primary-foreground px-5 py-2 rounded-full text-sm font-bold shadow-primary-glow hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Process File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
