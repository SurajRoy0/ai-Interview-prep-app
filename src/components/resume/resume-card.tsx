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
            <div className="space-y-8">
              {/* Summary */}
              {parsedData.basics && (
                <div>
                  <h4 className="text-sm font-bold text-foreground mb-1">Summary</h4>
                  <p className="text-sm text-muted-foreground">{parsedData.basics.summary}</p>
                </div>
              )}

              {/* Skills */}
              {parsedData.skills && (
                <div>
                  <h4 className="text-sm font-bold text-foreground mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {[...(parsedData.skills.languages || []), ...(parsedData.skills.frameworks || []), ...(parsedData.skills.tools || [])].map((s: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 bg-secondary text-secondary-foreground text-xs font-semibold rounded-md border border-border">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-8">
                {/* Experience */}
                {parsedData.experience && parsedData.experience.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-foreground border-b border-border pb-2">Experience</h4>
                    {parsedData.experience.map((exp: any, i: number) => (
                      <div key={i} className="space-y-1">
                        <p className="font-semibold text-sm text-foreground">
                          {exp.role} <span className="font-normal text-muted-foreground">@ {exp.company}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {exp.startDate || ''} {exp.startDate && exp.endDate ? '-' : ''} {exp.endDate || ''}
                        </p>
                        {exp.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Projects */}
                {parsedData.projects && parsedData.projects.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-foreground border-b border-border pb-2">Projects</h4>
                    {parsedData.projects.map((proj: any, i: number) => (
                      <div key={i} className="space-y-1">
                        <p className="font-semibold text-sm text-foreground">{proj.name}</p>
                        {proj.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">{proj.description}</p>
                        )}
                        {proj.technologies && proj.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {proj.technologies.slice(0, 5).map((tech: string, j: number) => (
                              <span key={j} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                                {tech}
                              </span>
                            ))}
                            {proj.technologies.length > 5 && (
                              <span className="text-[10px] text-muted-foreground font-medium px-1 py-0.5">
                                +{proj.technologies.length - 5} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Education */}
              {parsedData.education && parsedData.education.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-foreground border-b border-border pb-2">Education</h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {parsedData.education.map((edu: any, i: number) => (
                      <div key={i}>
                        <p className="font-semibold text-sm text-foreground">{edu.degree}</p>
                        <p className="text-xs text-muted-foreground">
                          {edu.institution} {edu.year ? `(${edu.year})` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
