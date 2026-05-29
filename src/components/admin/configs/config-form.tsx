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

const activityConfigExample = `{
  "DEBUGGING": 2,
  "CODE_CORRECTION": 1,
  "OUTPUT_PREDICTION": 1,
  "PRIORITISATION": 1
}`

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
      targetTopics: 8,
      maxFollowUpsPerTopic: 2,
      maxClarificationsPerTopic: 2,
      activityConfig: "{}",
      defaultTopicTimeLimitSecs: 600,
      maxPauseCount: 2,
      resumeDeadlineHours: 24,
      allowedDifficultyModes: ["GRADUAL", "ADAPTIVE", "INTENSIVE"],
      parseFullResume: false,
      maxProjectsToExtract: 3,
      maxSkillsPerCategory: 10,
      maxExperienceYears: 10,
      reportDepth: "STANDARD",
      reportUnlockable: false,
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
                  <Label>Target Topics</Label>
                  <Input type="number" {...register("targetTopics")} />
                  {errors.targetTopics && <p className="text-xs text-destructive">{errors.targetTopics.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Max Follow-ups / Topic</Label>
                  <Input type="number" {...register("maxFollowUpsPerTopic")} />
                  {errors.maxFollowUpsPerTopic && <p className="text-xs text-destructive">{errors.maxFollowUpsPerTopic.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Max Clarifications / Topic</Label>
                  <Input type="number" {...register("maxClarificationsPerTopic")} />
                  {errors.maxClarificationsPerTopic && <p className="text-xs text-destructive">{errors.maxClarificationsPerTopic.message}</p>}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-border/50">
                <Label>Activity Config (JSON)</Label>
                <p className="text-sm text-muted-foreground mb-2">Configure custom activities dynamically injected by the planner.</p>
                <Textarea {...register("activityConfig")} className="font-mono min-h-[120px]" placeholder={activityConfigExample} />
                <p className="text-xs text-muted-foreground">Example JSON (include all activity types with counts):</p>
                <pre className="text-xs font-mono rounded-md border border-border/60 bg-muted/40 p-3 overflow-x-auto">
                  {activityConfigExample}
                </pre>
                {errors.activityConfig && <p className="text-xs text-destructive">{errors.activityConfig.message}</p>}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ── Question Generation Mode ──────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Brain className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Question Generation Mode</h2>
          </div>
          <Card className="border-border/60 shadow-sm">
            <CardContent className="pt-6">
              <div className="space-y-2 max-w-sm">
                <Label>Question Generation Strategy</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  {...register("questionGenMode")}
                >
                  <option value="HYBRID">Hybrid (Mix of Generated & Pre-defined)</option>
                </select>
                {errors.questionGenMode && <p className="text-xs text-destructive">{errors.questionGenMode.message}</p>}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Default Topic Time Limit (secs)</Label>
                  <Input type="number" {...register("defaultTopicTimeLimitSecs")} />
                  {errors.defaultTopicTimeLimitSecs && <p className="text-xs text-destructive">{errors.defaultTopicTimeLimitSecs.message}</p>}
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

        {/* ── Rate Limits & Quotas ─────────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Rate Limits & Quotas</h2>
          </div>
          <Card className="border-border/60 shadow-sm">
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Max Job Profiles</Label>
                  <Input type="number" {...register("maxJobProfiles")} />
                  {errors.maxJobProfiles && <p className="text-xs text-destructive">{errors.maxJobProfiles.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Max Resume Uploads / Day</Label>
                  <Input type="number" {...register("maxResumeUploadsPerDay")} />
                  {errors.maxResumeUploadsPerDay && <p className="text-xs text-destructive">{errors.maxResumeUploadsPerDay.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Max Resumes / Profile</Label>
                  <Input type="number" {...register("maxResumeUploadsPerJobProfile")} />
                  {errors.maxResumeUploadsPerJobProfile && <p className="text-xs text-destructive">{errors.maxResumeUploadsPerJobProfile.message}</p>}
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
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border/50">

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
