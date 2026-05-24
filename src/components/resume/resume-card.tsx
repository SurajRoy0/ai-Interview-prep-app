'use client'

import { useState } from 'react'
import { FileText, CheckCircle2, AlertTriangle, Loader2, Trash2, RefreshCw, Star } from 'lucide-react'
import { deleteResumeAction, retryResumeParseAction, activateResumeAction } from '@/actions/resume'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ResumeCard({ resume, isActive, hasInterviews }: { resume: any, isActive: boolean, hasInterviews: boolean }) {
  const [isExpanded, setIsExpanded] = useState(isActive)
  const [isProcessing, setIsProcessing] = useState(false)

  const parsedData = resume.parsedData || {}

  const handleActivate = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsProcessing(true)
    const res = await activateResumeAction(resume.id)
    setIsProcessing(false)
    if (res.success) toast.success('Resume activated')
    else toast.error(res.error?.message || 'Failed to activate')
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
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

  const handleRetry = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsProcessing(true)
    const res = await retryResumeParseAction(resume.id)
    setIsProcessing(false)
    if (res.success) toast.success('Retry started')
    else toast.error(res.error?.message || 'Failed to retry')
  }

  return (
    <Card className={`overflow-hidden transition-all duration-300 ${isActive ? 'border-primary ring-1 ring-primary/20 shadow-md shadow-primary/10' : 'border-border hover:border-primary/30'}`}>
      <Accordion
        type="single"
        collapsible
        value={isExpanded ? "item-1" : ""}
        onValueChange={(val) => setIsExpanded(val === "item-1")}
        className={`overflow-hidden transition-all duration-300 ${isActive ? 'border-primary ring-1 ring-primary/20 shadow-md shadow-primary/10' : 'border-border hover:border-primary/30'}`}
      >
        <AccordionItem value="item-1" className="border-none">
          <AccordionTrigger className="p-5 sm:p-6 hover:bg-muted/30 hover:no-underline [&[data-state=open]]:bg-muted/30">
            <div className="flex w-full items-center justify-between mr-4 text-left">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-bold text-foreground leading-none">Version {resume.version}</h3>
                    {isActive && (
                      <Badge variant="default" className="text-[10px] uppercase font-bold tracking-wider px-2 py-0 h-5 flex items-center gap-1 shadow-sm">
                        <Star className="w-3 h-3 fill-primary-foreground" /> Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-normal text-muted-foreground truncate max-w-[180px] sm:max-w-md">{resume.fileName}</p>
                  <p className="text-xs font-normal text-muted-foreground mt-0.5">Uploaded on {new Date(resume.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                {/* Status Badge */}
                {resume.parseStatus === 'DONE' && (
                  <Badge variant="outline" className="hidden sm:flex border-green-500/30 text-green-600 bg-green-500/10 gap-1.5 px-2.5 py-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Parsed
                  </Badge>
                )}
                {resume.parseStatus === 'FAILED' && (
                  <Badge variant="destructive" className="hidden sm:flex gap-1.5 px-2.5 py-0.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Failed
                  </Badge>
                )}
                {(resume.parseStatus === 'PENDING' || resume.parseStatus === 'PROCESSING') && (
                  <Badge variant="secondary" className="hidden sm:flex gap-1.5 px-2.5 py-0.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> {resume.parseStatus}
                  </Badge>
                )}
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className="border-t border-border/50 bg-muted/10">
            <div className="p-5 sm:p-6 space-y-6">
              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2.5">
                {!isActive && resume.parseStatus === 'DONE' && (
                  <Button size="sm" variant="default" onClick={handleActivate} disabled={isProcessing} className="shadow-sm">
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
                  className="shadow-sm"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
              </div>

              {/* Error Message */}
              {resume.parseStatus === 'FAILED' && (
                <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-xl border border-destructive/20 shadow-sm">
                  <strong className="flex items-center gap-2 mb-1"><AlertTriangle className="w-4 h-4" /> Error:</strong>
                  {resume.parseError || 'An unknown error occurred during parsing.'}
                </div>
              )}

              {/* Parsed Data View */}
              {resume.parseStatus === 'DONE' && parsedData && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {/* Summary */}
                  {parsedData.basics?.summary && (
                    <div>
                      <h4 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span> Summary
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed bg-background/50 p-4 rounded-xl border border-border/50 shadow-sm">{parsedData.basics.summary}</p>
                    </div>
                  )}

                  {/* Skills */}
                  {parsedData.skills && (
                    <div>
                      <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span> Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {[...(parsedData.skills.languages || []), ...(parsedData.skills.frameworks || []), ...(parsedData.skills.tools || [])].map((s: string, i: number) => (
                          <Badge key={i} variant="secondary" className="px-3 py-1 font-medium bg-background border-border/60 hover:bg-muted shadow-sm">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Experience */}
                    {parsedData.experience && parsedData.experience.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold text-foreground border-b border-border/50 pb-2 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span> Experience
                        </h4>
                        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-1.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent hidden-before-line">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {parsedData.experience.map((exp: any, i: number) => (
                            <div key={i} className="relative pl-6">
                              <span className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-primary/20 border-2 border-primary"></span>
                              <p className="font-bold text-sm text-foreground">
                                {exp.role} <span className="font-normal text-muted-foreground">@ {exp.company}</span>
                              </p>
                              <p className="text-xs font-medium text-muted-foreground mb-1.5 bg-muted/50 inline-block px-2 py-0.5 rounded-md mt-1">
                                {exp.startDate || ''} {exp.startDate && exp.endDate ? '-' : ''} {exp.endDate || ''}
                              </p>
                              {exp.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-3 leading-relaxed">{exp.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Projects */}
                    {parsedData.projects && parsedData.projects.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold text-foreground border-b border-border/50 pb-2 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span> Projects
                        </h4>
                        <div className="grid gap-3">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {parsedData.projects.map((proj: any, i: number) => (
                            <div key={i} className="bg-background/50 border border-border/50 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                              <p className="font-bold text-sm text-foreground mb-1">{proj.name}</p>
                              {proj.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">{proj.description}</p>
                              )}
                              {proj.technologies && proj.technologies.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {proj.technologies.slice(0, 4).map((tech: string, j: number) => (
                                    <Badge key={j} variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20 px-1.5 py-0 rounded font-semibold">
                                      {tech}
                                    </Badge>
                                  ))}
                                  {proj.technologies.length > 4 && (
                                    <span className="text-[10px] text-muted-foreground font-medium px-1 py-0.5">
                                      +{proj.technologies.length - 4} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Education */}
                  {parsedData.education && parsedData.education.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-foreground border-b border-border/50 pb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span> Education
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {parsedData.education.map((edu: any, i: number) => (
                          <div key={i} className="bg-background/50 border border-border/50 p-4 rounded-xl shadow-sm">
                            <p className="font-bold text-sm text-foreground">{edu.degree}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {edu.institution} {edu.year ? `• ${edu.year}` : ''}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  )
}
