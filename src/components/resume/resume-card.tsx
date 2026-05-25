"use client"

import { useState } from "react"
import { FileText, CheckCircle2, AlertTriangle, Loader2, Trash2, RefreshCw, Star } from "lucide-react"
import { deleteResumeAction, retryResumeParseAction, activateResumeAction } from "@/actions/resume"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ResumeCard({ resume, isActive, hasInterviews }: { resume: any, isActive: boolean, hasInterviews: boolean }) {
  const [isExpanded, setIsExpanded] = useState(isActive)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const parsedData = resume.parsedData || {}

  const handleActivate = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsProcessing(true)
    const res = await activateResumeAction(resume.id)
    setIsProcessing(false)
    if (res.success) toast.success("Resume activated")
    else toast.error(res.error?.message || "Failed to activate")
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (hasInterviews) {
      toast.error("Cannot delete a resume that has been used in interviews.")
      return
    }
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    setIsProcessing(true)
    const res = await deleteResumeAction(resume.id)
    setIsProcessing(false)
    setShowDeleteDialog(false)
    if (res.success) toast.success("Resume deleted")
    else toast.error(res.error?.message || "Failed to delete")
  }

  const handleRetry = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsProcessing(true)
    const res = await retryResumeParseAction(resume.id)
    setIsProcessing(false)
    if (res.success) toast.success("Retry started")
    else toast.error(res.error?.message || "Failed to retry")
  }

  return (
    <>
    <div className={`overflow-hidden rounded-2xl transition-all duration-300 ${
      isActive
        ? "bg-primary/5 border-2 border-primary/50 shadow-primary-glow"
        : "bg-surface-1 border border-border/50 hover:border-primary/30 shadow-sm"
    }`}>
      <Accordion
        type="single"
        collapsible
        value={isExpanded ? "item-1" : ""}
        onValueChange={(val) => setIsExpanded(val === "item-1")}
        className="w-full"
      >
        <AccordionItem value="item-1" className="border-none">
          {/* Header */}
          <AccordionTrigger className="p-4 sm:p-5 hover:bg-surface-2 hover:no-underline [&[data-state=open]]:bg-surface-2 transition-colors">
            <div className="flex w-full items-center justify-between mr-4 text-left">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  isActive ? "bg-primary/20 text-primary" : "bg-surface-2 text-muted-foreground border border-border/50"
                }`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className={`font-semibold leading-none ${isActive ? "text-primary" : "text-foreground"}`}>
                      Version {resume.version}
                    </h3>
                    {isActive && (
                      <Badge className="text-[10px] uppercase font-bold tracking-wider px-2 py-0 h-5 flex items-center gap-1 shadow-sm">
                        <Star className="w-3 h-3 fill-current" /> Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate max-w-[180px] sm:max-w-md">{resume.fileName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 opacity-60">
                    Uploaded on {new Date(resume.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                {/* Status Badge */}
                {resume.parseStatus === "DONE" && (
                  <Badge variant="outline" className="hidden sm:flex border-green-500/30 text-green-500 bg-green-500/10 gap-1.5 px-2.5 py-0.5 rounded-full font-medium shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Parsed
                  </Badge>
                )}
                {resume.parseStatus === "FAILED" && (
                  <Badge variant="destructive" className="hidden sm:flex gap-1.5 px-2.5 py-0.5 rounded-full font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" /> Failed
                  </Badge>
                )}
                {(resume.parseStatus === "PENDING" || resume.parseStatus === "PROCESSING") && (
                  <Badge variant="secondary" className="hidden sm:flex gap-1.5 px-2.5 py-0.5 rounded-full font-medium border border-border/50 bg-surface-2 text-muted-foreground">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> {resume.parseStatus}
                  </Badge>
                )}
              </div>
            </div>
          </AccordionTrigger>

          {/* Content */}
          <AccordionContent className="border-t border-border/50 bg-background/50">
            <div className="p-5 sm:p-6 space-y-8">
              
              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3">
                {!isActive && resume.parseStatus === "DONE" && (
                  <Button size="sm" onClick={handleActivate} disabled={isProcessing} className="rounded-full shadow-primary-glow font-semibold gap-1.5 px-5">
                    <Star className="w-3.5 h-3.5" /> Set as Active
                  </Button>
                )}
                {resume.parseStatus === "FAILED" && (
                  <Button size="sm" variant="outline" onClick={handleRetry} disabled={isProcessing} className="rounded-full border-border/60 gap-1.5 px-4">
                    <RefreshCw className="w-3.5 h-3.5" /> Retry Parsing
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDeleteClick}
                  disabled={isProcessing || hasInterviews}
                  title={hasInterviews ? "Cannot delete because it was used in an interview" : "Delete resume"}
                  className="rounded-full gap-1.5 px-4"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </Button>
              </div>

              {/* Error Message */}
              {resume.parseStatus === "FAILED" && (
                <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-xl border border-destructive/20 shadow-sm">
                  <strong className="flex items-center gap-2 mb-1"><AlertTriangle className="w-4 h-4" /> Error:</strong>
                  <span className="opacity-90">{resume.parseError || "An unknown error occurred during parsing."}</span>
                </div>
              )}

              {/* Parsed Data View */}
              {resume.parseStatus === "DONE" && parsedData && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  
                  {/* Summary */}
                  {parsedData.basics?.summary && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                        Summary
                      </h4>
                      <p className="text-sm text-foreground/90 leading-relaxed bg-surface-2 p-4 rounded-xl border border-border/40">
                        {parsedData.basics.summary}
                      </p>
                    </div>
                  )}

                  {/* Skills */}
                  {parsedData.skills && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                        Skills Found
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {[...(parsedData.skills.languages || []), ...(parsedData.skills.frameworks || []), ...(parsedData.skills.tools || [])].map((s: string, i: number) => (
                          <Badge key={i} variant="secondary" className="px-3 py-1 font-medium bg-surface-2 border-border/60 hover:bg-surface-3 transition-colors text-xs text-foreground/80">
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
                        <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground border-b border-border/40 pb-2">
                          Experience Timeline
                        </h4>
                        <div className="space-y-5 relative before:absolute before:inset-0 before:ml-1.5 before:-translate-x-px before:h-full before:w-[2px] before:bg-border/60 hidden-before-line pt-2">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {parsedData.experience.map((exp: any, i: number) => (
                            <div key={i} className="relative pl-6">
                              <span className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-background border-[3px] border-primary z-10" />
                              <p className="font-semibold text-sm text-foreground leading-tight">
                                {exp.role} <span className="font-normal text-muted-foreground ml-1">@ {exp.company}</span>
                              </p>
                              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mt-1 mb-2">
                                {exp.startDate || ""} {exp.startDate && exp.endDate ? "—" : ""} {exp.endDate || ""}
                              </p>
                              {exp.description && (
                                <p className="text-xs text-foreground/70 line-clamp-3 leading-relaxed mt-1">
                                  {exp.description}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Projects */}
                    {parsedData.projects && parsedData.projects.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground border-b border-border/40 pb-2">
                          Projects
                        </h4>
                        <div className="grid gap-3 pt-1">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {parsedData.projects.map((proj: any, i: number) => (
                            <div key={i} className="bg-surface-2 border border-border/40 p-4 rounded-xl">
                              <p className="font-semibold text-sm text-foreground mb-1">{proj.name}</p>
                              {proj.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                                  {proj.description}
                                </p>
                              )}
                              {proj.technologies && proj.technologies.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {proj.technologies.slice(0, 4).map((tech: string, j: number) => (
                                    <Badge key={j} variant="outline" className="text-[10px] px-1.5 py-0 rounded font-medium border-primary/20 bg-primary/5 text-primary">
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
                    <div className="space-y-4 pt-2">
                      <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground border-b border-border/40 pb-2">
                        Education
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-3 pt-1">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {parsedData.education.map((edu: any, i: number) => (
                          <div key={i} className="bg-surface-2 border border-border/40 p-4 rounded-xl">
                            <p className="font-semibold text-sm text-foreground">{edu.degree}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {edu.institution} {edu.year ? `• ${edu.year}` : ""}
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
    </div>
    <ConfirmationDialog
      open={showDeleteDialog}
      onOpenChange={setShowDeleteDialog}
      variant="confirm"
      title="Delete Resume Version?"
      description={`Are you sure you want to delete Version ${resume.version} of "${resume.fileName}"? This action cannot be undone.`}
      confirmLabel="Delete"
      onConfirm={handleDeleteConfirm}
      loading={isProcessing}
      destructive
    />
  </>
  )
}
