"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { configSchema, type ConfigInput, type ConfigFormInput } from "@repo/shared"
import { createAdminConfigAction, updateAdminConfigAction, deleteAdminConfigAction } from "@/actions/admin/config"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
// Removed Switch from imports
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog"
import { Trash2, Save, ArrowLeft, Settings, Clock, Brain, FileText, BarChart3, Bot } from "lucide-react"

interface ConfigFormProps {
  initialData?: Partial<Omit<ConfigInput, "activityConfig">> & { activityConfig?: unknown; id?: string }
  configId?: string
}

export function ConfigForm({ initialData, configId }: ConfigFormProps) {
  const router = useRouter()
  const isEditing = !!configId

  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const defaultValues = initialData
    ? {
      ...initialData,
      activityConfig: typeof initialData.activityConfig === 'object' ? JSON.stringify(initialData.activityConfig, null, 2) : initialData.activityConfig,
    }
    : {
      name: "",
      isDefault: false,
      isActive: true,
      targetTurns: 8,
      maxFollowUpsPerTopic: 2,
      hardCapTurnsPerTopic: 8,
      activityConfig: "{}",
      questionTimeSecs: 120,
      followUpTimeSecs: 90,
      clarificationTimeSecs: 30,
      activityTimeSecs: 300,
      maxPauseCount: 2,
      resumeDeadlineHours: 24,
      allowedDifficultyModes: ["GRADUAL", "ADAPTIVE", "INTENSIVE"],
      parseFullResume: false,
      maxProjectsToExtract: 3,
      maxSkillsPerCategory: 10,
      maxExperienceYears: 10,
      reportDepth: "STANDARD",
      maxTopicsInReport: 5,
      maxSuggestionsCount: 3,
      includeActivityReport: true,
      includeTopicEvidence: false,
      includeAuthAnalysis: false,
      reportUnlockable: false,
      plannerModel: "gemini-2.5-flash",
      interviewModel: "gemini-2.5-flash",
      judgeModel: "gemini-2.5-flash",
      reportModel: "gemini-2.5-flash",
      questionGenMode: "HYBRID",
    }

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ConfigFormInput>({
    resolver: zodResolver(configSchema),
    defaultValues: defaultValues as ConfigFormInput,
  })

  // Watch this to conditionally render resume parser fields
  const parseFullResume = watch("parseFullResume")

  async function onSubmit(formData: ConfigFormInput) {
    const data = formData as unknown as ConfigInput;
    setIsLoading(true)
    try {
      if (isEditing) {
        await updateAdminConfigAction(configId, data)
        toast.success("Config updated successfully")
      } else {
        const res = await createAdminConfigAction(data)
        if (res.success && res.data) {
          toast.success("Config created successfully")
          router.push(`/admin/configs/${res.data.id}`)
          return
        }
      }
    } catch {
      toast.error("Failed to save config")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete() {
    if (!configId) return
    setDeleteLoading(true)
    try {
      await deleteAdminConfigAction(configId)
      toast.success("Config deleted successfully")
      setShowDeleteDialog(false)
      router.push("/admin/configs")
    } catch {
      toast.error("Failed to delete config")
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-8 pb-16">
      {/* ── Sticky Header ────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b pb-4 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push("/admin/configs")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{isEditing ? "Edit Config" : "New Config"}</h1>
            <p className="text-sm text-muted-foreground">{isEditing ? `Manage settings for ${initialData?.name}` : "Create a new interview ruleset"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing && (
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} disabled={isLoading}>
              <Trash2 className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Delete</span>
            </Button>
          )}
          <Button onClick={handleSubmit(onSubmit)} disabled={isLoading} className="shadow-primary-glow">
            <Save className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">{isLoading ? "Saving..." : "Save Config"}</span>
          </Button>
        </div>
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg flex flex-col gap-1">
          <p className="font-semibold text-sm">Please fix the errors below to save:</p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            {Object.entries(errors).map(([key, err]) => (
              <li key={key}>{key}: {err?.message?.toString()}</li>
            ))}
          </ul>
        </div>
      )}

      <form id="config-form" onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        
        {/* ── General ──────────────────────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Settings className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">General Settings</h2>
          </div>
          <Card className="border-border/60 shadow-sm">
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Config Name</Label>
                <Input id="name" {...register("name")} placeholder="e.g. free_tier" className="max-w-md" />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                <div className="flex items-start gap-3 rounded-lg border p-4 bg-card/50">
                  <input 
                    type="checkbox" 
                    id="isActive" 
                    {...register("isActive")} 
                    className="mt-1 h-5 w-5 cursor-pointer accent-primary"
                  />
                  <div className="space-y-1">
                    <Label className="text-base cursor-pointer" htmlFor="isActive">Active Status</Label>
                    <p className="text-sm text-muted-foreground">Check to enable this config. Uncheck to disable.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 rounded-lg border p-4 bg-card/50">
                  <input 
                    type="checkbox" 
                    id="isDefault" 
                    {...register("isDefault")} 
                    className="mt-1 h-5 w-5 cursor-pointer accent-primary"
                  />
                  <div className="space-y-1">
                    <Label className="text-base cursor-pointer" htmlFor="isDefault">Default Config</Label>
                    <p className="text-sm text-muted-foreground">Check to use this as the global fallback.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ── Planner Controls ─────────────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Brain className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Planner & Turn Controls</h2>
          </div>
          <Card className="border-border/60 shadow-sm">
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Target Turns</Label>
                  <Input type="number" {...register("targetTurns")} />
                  {errors.targetTurns && <p className="text-xs text-destructive">{errors.targetTurns.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Max Follow-ups / Topic</Label>
                  <Input type="number" {...register("maxFollowUpsPerTopic")} />
                  {errors.maxFollowUpsPerTopic && <p className="text-xs text-destructive">{errors.maxFollowUpsPerTopic.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Hard Cap Turns / Topic</Label>
                  <Input type="number" {...register("hardCapTurnsPerTopic")} />
                  {errors.hardCapTurnsPerTopic && <p className="text-xs text-destructive">{errors.hardCapTurnsPerTopic.message}</p>}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-border/50">
                <Label>Activity Config (JSON)</Label>
                <p className="text-sm text-muted-foreground mb-2">Configure custom activities dynamically injected by the planner.</p>
                <Textarea {...register("activityConfig")} className="font-mono min-h-[120px]" placeholder='{"DEBUGGING": 1}' />
                {errors.activityConfig && <p className="text-xs text-destructive">{errors.activityConfig.message}</p>}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ── Timing & Pausing ─────────────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Timing & Pausing Limits</h2>
          </div>
          <Card className="border-border/60 shadow-sm">
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label>Q&A Time (seconds)</Label>
                  <Input type="number" {...register("questionTimeSecs")} />
                  {errors.questionTimeSecs && <p className="text-xs text-destructive">{errors.questionTimeSecs.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Follow-up Time (seconds)</Label>
                  <Input type="number" {...register("followUpTimeSecs")} />
                  {errors.followUpTimeSecs && <p className="text-xs text-destructive">{errors.followUpTimeSecs.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Clarify Time (seconds)</Label>
                  <Input type="number" {...register("clarificationTimeSecs")} />
                  {errors.clarificationTimeSecs && <p className="text-xs text-destructive">{errors.clarificationTimeSecs.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Activity Time (seconds)</Label>
                  <Input type="number" {...register("activityTimeSecs")} />
                  {errors.activityTimeSecs && <p className="text-xs text-destructive">{errors.activityTimeSecs.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border/50 max-w-2xl">
                <div className="space-y-2">
                  <Label>Max Pause Count</Label>
                  <Input type="number" {...register("maxPauseCount")} />
                  {errors.maxPauseCount && <p className="text-xs text-destructive">{errors.maxPauseCount.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Resume Deadline (hours)</Label>
                  <Input type="number" {...register("resumeDeadlineHours")} />
                  {errors.resumeDeadlineHours && <p className="text-xs text-destructive">{errors.resumeDeadlineHours.message}</p>}
                </div>
              </div>

              <div className="pt-4 border-t border-border/50 max-w-2xl">
                <div className="space-y-2 mb-3">
                  <Label className="text-base">Allowed Difficulty Modes</Label>
                  <p className="text-sm text-muted-foreground">Select which difficulty options the candidate can choose from.</p>
                  {errors.allowedDifficultyModes && <p className="text-xs text-destructive">{errors.allowedDifficultyModes.message}</p>}
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="diffGradual" value="GRADUAL" {...register("allowedDifficultyModes")} className="h-4 w-4 accent-primary" />
                    <Label htmlFor="diffGradual">Gradual</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="diffAdaptive" value="ADAPTIVE" {...register("allowedDifficultyModes")} className="h-4 w-4 accent-primary" />
                    <Label htmlFor="diffAdaptive">Adaptive</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="diffIntensive" value="INTENSIVE" {...register("allowedDifficultyModes")} className="h-4 w-4 accent-primary" />
                    <Label htmlFor="diffIntensive">Intensive</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ── Resume Parser ────────────────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Resume Parser Config</h2>
          </div>
          <Card className="border-border/60 shadow-sm">
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-start gap-3 rounded-lg border p-4 bg-card/50 max-w-2xl">
                <input 
                  type="checkbox" 
                  id="parseFullResume" 
                  {...register("parseFullResume")} 
                  className="mt-1 h-5 w-5 cursor-pointer accent-primary"
                />
                <div className="space-y-1">
                  <Label className="text-base cursor-pointer" htmlFor="parseFullResume">Parse Full Resume</Label>
                  <p className="text-sm text-muted-foreground">Check to extract all data. Uncheck to limit extracted data.</p>
                </div>
              </div>
              
              {!parseFullResume && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                  <div className="space-y-2">
                    <Label>Max Projects</Label>
                    <Input type="number" {...register("maxProjectsToExtract")} />
                    {errors.maxProjectsToExtract && <p className="text-xs text-destructive">{errors.maxProjectsToExtract.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Max Skills / Category</Label>
                    <Input type="number" {...register("maxSkillsPerCategory")} />
                    {errors.maxSkillsPerCategory && <p className="text-xs text-destructive">{errors.maxSkillsPerCategory.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Max Exp. Years</Label>
                    <Input type="number" {...register("maxExperienceYears")} />
                    {errors.maxExperienceYears && <p className="text-xs text-destructive">{errors.maxExperienceYears.message}</p>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* ── Report Generation ────────────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Report Generation</h2>
          </div>
          <Card className="border-border/60 shadow-sm">
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Report Depth</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    {...register("reportDepth")}
                  >
                    <option value="MINIMAL">Minimal</option>
                    <option value="STANDARD">Standard</option>
                    <option value="DETAILED">Detailed</option>
                    <option value="EXHAUSTIVE">Exhaustive</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Max Topics to Grade</Label>
                  <Input type="number" {...register("maxTopicsInReport")} />
                  {errors.maxTopicsInReport && <p className="text-xs text-destructive">{errors.maxTopicsInReport.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Max Suggestions</Label>
                  <Input type="number" {...register("maxSuggestionsCount")} />
                  {errors.maxSuggestionsCount && <p className="text-xs text-destructive">{errors.maxSuggestionsCount.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border/50">
                <div className="flex items-start gap-3 rounded-lg border p-4 bg-card/50">
                  <input 
                    type="checkbox" 
                    id="includeActivityReport" 
                    {...register("includeActivityReport")} 
                    className="mt-0.5 h-5 w-5 cursor-pointer accent-primary"
                  />
                  <Label className="text-base cursor-pointer" htmlFor="includeActivityReport">Include Activity Report</Label>
                </div>
                
                <div className="flex items-start gap-3 rounded-lg border p-4 bg-card/50">
                  <input 
                    type="checkbox" 
                    id="includeTopicEvidence" 
                    {...register("includeTopicEvidence")} 
                    className="mt-0.5 h-5 w-5 cursor-pointer accent-primary"
                  />
                  <Label className="text-base cursor-pointer" htmlFor="includeTopicEvidence">Include Topic Evidence</Label>
                </div>

                <div className="flex items-start gap-3 rounded-lg border p-4 bg-card/50">
                  <input 
                    type="checkbox" 
                    id="includeAuthAnalysis" 
                    {...register("includeAuthAnalysis")} 
                    className="mt-0.5 h-5 w-5 cursor-pointer accent-primary"
                  />
                  <Label className="text-base cursor-pointer" htmlFor="includeAuthAnalysis">Include Auth Analysis</Label>
                </div>

                <div className="flex items-start gap-3 rounded-lg border p-4 bg-card/50">
                  <input 
                    type="checkbox" 
                    id="reportUnlockable" 
                    {...register("reportUnlockable")} 
                    className="mt-0.5 h-5 w-5 cursor-pointer accent-primary"
                  />
                  <div className="space-y-1">
                    <Label className="text-base cursor-pointer" htmlFor="reportUnlockable">Report Unlockable (Upsell)</Label>
                    <p className="text-sm text-muted-foreground">Check to require payment for full report.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ── AI Models ────────────────────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Bot className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">AI Models</h2>
          </div>
          <Card className="border-border/60 shadow-sm">
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Planner Model</Label>
                  <Input {...register("plannerModel")} />
                  {errors.plannerModel && <p className="text-xs text-destructive">{errors.plannerModel.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Interview Model</Label>
                  <Input {...register("interviewModel")} />
                  {errors.interviewModel && <p className="text-xs text-destructive">{errors.interviewModel.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Judge Model</Label>
                  <Input {...register("judgeModel")} />
                  {errors.judgeModel && <p className="text-xs text-destructive">{errors.judgeModel.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Report Model</Label>
                  <Input {...register("reportModel")} />
                  {errors.reportModel && <p className="text-xs text-destructive">{errors.reportModel.message}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </form>

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Config?"
        description="This action cannot be undone. It will permanently remove this config."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        loading={deleteLoading}
        destructive
      />
    </div>
  )
}
