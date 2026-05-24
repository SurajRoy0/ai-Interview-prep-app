'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, FileText, CheckCircle2, AlertTriangle, Loader2, Trash2, RefreshCw, Star } from 'lucide-react'
import { deleteResumeAction, retryResumeParseAction, activateResumeAction } from '@/actions/resume'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export function ResumeCard({ resume, isActive, hasInterviews }: { resume: any, isActive: boolean, hasInterviews: boolean }) {
  const [isExpanded, setIsExpanded] = useState(isActive)
  const [isProcessing, setIsProcessing] = useState(false)

  const parsedData = resume.parsedData || {}

  const handleActivate = async () => {
    setIsProcessing(true)
    const res = await activateResumeAction(resume.id)
    setIsProcessing(false)
    if (res.success) toast.success('Resume activated')
    else toast.error(res.error?.message || 'Failed to activate')
  }

  const handleDelete = async () => {
    if (hasInterviews) {
      toast.error('Cannot delete a resume that has been used in interviews.')
      return
    }
    setIsProcessing(true)
    const res = await deleteResumeAction(resume.id)
    setIsProcessing(false)
    if (res.success) toast.success('Resume deleted')
    else toast.error(res.error?.message || 'Failed to delete')
  }

  const handleRetry = async () => {
    setIsProcessing(true)
    const res = await retryResumeParseAction(resume.id)
    setIsProcessing(false)
    if (res.success) toast.success('Retry started')
    else toast.error(res.error?.message || 'Failed to retry')
  }

  return (
    <div className={`bg-card border rounded-2xl shadow-sm overflow-hidden transition-colors ${isActive ? 'border-primary' : 'border-border'}`}>
      {/* Header */}
      <div 
        className="p-6 flex items-center justify-between cursor-pointer hover:bg-muted/30"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-foreground">Version {resume.version}</h3>
              {isActive && (
                <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  <Star className="w-3 h-3 fill-primary" /> Active
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate max-w-[200px] md:max-w-md">{resume.fileName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Uploaded on {new Date(resume.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Status Badge */}
          {resume.parseStatus === 'DONE' && (
            <span className="hidden sm:flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-500/10 px-2.5 py-1 rounded-md">
              <CheckCircle2 className="w-4 h-4" /> Parsed
            </span>
          )}
          {resume.parseStatus === 'FAILED' && (
            <span className="hidden sm:flex items-center gap-1 text-xs font-semibold text-destructive bg-destructive/10 px-2.5 py-1 rounded-md">
              <AlertTriangle className="w-4 h-4" /> Failed
            </span>
          )}
          {(resume.parseStatus === 'PENDING' || resume.parseStatus === 'PROCESSING') && (
            <span className="hidden sm:flex items-center gap-1 text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
              <Loader2 className="w-4 h-4 animate-spin" /> {resume.parseStatus}
            </span>
          )}

          {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
        </div>
      </div>

      {/* Expanded Body */}
      {isExpanded && (
        <div className="border-t border-border p-6 bg-muted/10 space-y-6">
          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {!isActive && resume.parseStatus === 'DONE' && (
              <Button size="sm" variant="outline" onClick={handleActivate} disabled={isProcessing}>
                Set as Active
              </Button>
            )}
            {resume.parseStatus === 'FAILED' && (
              <Button size="sm" variant="outline" onClick={handleRetry} disabled={isProcessing}>
                <RefreshCw className="w-4 h-4 mr-2" /> Retry Parsing
              </Button>
            )}
            <Button 
              size="sm" 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={isProcessing || hasInterviews}
              title={hasInterviews ? "Cannot delete because it was used in an interview" : "Delete resume"}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
          </div>

          {/* Error Message */}
          {resume.parseStatus === 'FAILED' && (
            <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-xl">
              <strong>Error:</strong> {resume.parseError || 'An unknown error occurred during parsing.'}
            </div>
          )}

          {/* Parsed Data View */}
          {resume.parseStatus === 'DONE' && parsedData && (
            <div className="space-y-6">
              {parsedData.basics && (
                <div>
                  <h4 className="text-sm font-bold text-foreground mb-1">Summary</h4>
                  <p className="text-sm text-muted-foreground">{parsedData.basics.summary}</p>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-bold text-foreground mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {[...(parsedData.skills?.languages || []), ...(parsedData.skills?.frameworks || []), ...(parsedData.skills?.tools || [])].slice(0, 10).map((s: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs font-medium rounded border border-border">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-foreground mb-2">Recent Experience</h4>
                  {parsedData.experience?.[0] ? (
                    <div>
                      <p className="font-semibold text-sm text-foreground">{parsedData.experience[0].role}</p>
                      <p className="text-xs text-muted-foreground">{parsedData.experience[0].company}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No experience found</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
