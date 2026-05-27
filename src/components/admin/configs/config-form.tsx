"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { configSchema, type ConfigInput, type ConfigFormInput } from "@repo/validators"
import { createAdminConfigAction, updateAdminConfigAction, deleteAdminConfigAction } from "@/actions/admin-config"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog"
import { Trash2, Save, ArrowLeft } from "lucide-react"

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
      allowedDifficultyModes: ["GRADUAL", "ADAPTIVE", "FLAT"],
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
    setValue,
    watch,
    formState: { errors },
  } = useForm<ConfigFormInput>({
    resolver: zodResolver(configSchema),
    defaultValues: defaultValues as ConfigFormInput,
  })

  // Watchers for switches
  const isActive = watch("isActive")
  const isDefault = watch("isDefault")
  const parseFullResume = watch("parseFullResume")
  const includeActivityReport = watch("includeActivityReport")
  const includeTopicEvidence = watch("includeTopicEvidence")
  const includeAuthAnalysis = watch("includeAuthAnalysis")
  const reportUnlockable = watch("reportUnlockable")

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
    } catch (error) {
      toast.error("Failed to save config")
      console.error(error)
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
          )}
          <Button onClick={handleSubmit(onSubmit)} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" /> {isLoading ? "Saving..." : "Save Config"}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="planner">Planner</TabsTrigger>
            <TabsTrigger value="timing">Timing & Pause</TabsTrigger>
            <TabsTrigger value="resume">Resume Parser</TabsTrigger>
            <TabsTrigger value="report">Report</TabsTrigger>
            <TabsTrigger value="models">AI Models</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Basic identifiers and status.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input {...register("name")} placeholder="e.g. free_tier" />
                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                  </div>
                </div>

                <div className="flex flex-col gap-4 mt-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label className="text-base">Active Status</Label>
                      <p className="text-sm text-muted-foreground">Whether this config can be used.</p>
                    </div>
                    <Switch checked={isActive} onCheckedChange={(val) => setValue("isActive", val)} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label className="text-base">Is Default</Label>
                      <p className="text-sm text-muted-foreground">Make this the default fallback config.</p>
                    </div>
                    <Switch checked={isDefault} onCheckedChange={(val) => setValue("isDefault", val)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="planner" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Planner Controls</CardTitle>
                <CardDescription>Configure interview length and activity mix.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Target Turns</Label>
                    <Input type="number" {...register("targetTurns")} />
                    {errors.targetTurns && <p className="text-xs text-destructive">{errors.targetTurns.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Max Follow-ups / Topic</Label>
                    <Input type="number" {...register("maxFollowUpsPerTopic")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Hard Cap Turns / Topic</Label>
                    <Input type="number" {...register("hardCapTurnsPerTopic")} />
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <Label>Activity Config (JSON)</Label>
                  <Textarea {...register("activityConfig")} className="font-mono min-h-[100px]" placeholder='{"DEBUGGING": 1}' />
                  {errors.activityConfig && <p className="text-xs text-destructive">{errors.activityConfig.message}</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timing" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Timing & Pausing</CardTitle>
                <CardDescription>Timers for answers and pause rules.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Q&A Time (s)</Label>
                    <Input type="number" {...register("questionTimeSecs")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Follow-up Time (s)</Label>
                    <Input type="number" {...register("followUpTimeSecs")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Clarify Time (s)</Label>
                    <Input type="number" {...register("clarificationTimeSecs")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Activity Time (s)</Label>
                    <Input type="number" {...register("activityTimeSecs")} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 border-t pt-4">
                  <div className="space-y-2">
                    <Label>Max Pause Count</Label>
                    <Input type="number" {...register("maxPauseCount")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Resume Deadline (hrs)</Label>
                    <Input type="number" {...register("resumeDeadlineHours")} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resume" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resume Parser Config</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4 mb-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Parse Full Resume</Label>
                    <p className="text-sm text-muted-foreground">Extract all data vs limited data.</p>
                  </div>
                  <Switch checked={parseFullResume} onCheckedChange={(val) => setValue("parseFullResume", val)} />
                </div>

                {!parseFullResume && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Max Projects</Label>
                      <Input type="number" {...register("maxProjectsToExtract")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Skills / Category</Label>
                      <Input type="number" {...register("maxSkillsPerCategory")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Exp. Years</Label>
                      <Input type="number" {...register("maxExperienceYears")} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="report" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Report Generation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Report Depth</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
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
                  </div>
                  <div className="space-y-2">
                    <Label>Max Suggestions</Label>
                    <Input type="number" {...register("maxSuggestionsCount")} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <Label>Include Activity Report</Label>
                    <Switch checked={includeActivityReport} onCheckedChange={(val) => setValue("includeActivityReport", val)} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <Label>Include Topic Evidence</Label>
                    <Switch checked={includeTopicEvidence} onCheckedChange={(val) => setValue("includeTopicEvidence", val)} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <Label>Include Auth Analysis</Label>
                    <Switch checked={includeAuthAnalysis} onCheckedChange={(val) => setValue("includeAuthAnalysis", val)} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <Label>Report Unlockable (Upsell)</Label>
                    <Switch checked={reportUnlockable} onCheckedChange={(val) => setValue("reportUnlockable", val)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="models" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI Models</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>
                  <div className="space-y-2">
                    <Label>Report Model</Label>
                    <Input {...register("reportModel")} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
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
