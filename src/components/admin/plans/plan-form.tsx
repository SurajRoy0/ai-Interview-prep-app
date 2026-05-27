"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { planSchema, type PlanInput, type PlanFormInput } from "@repo/shared"
import { createAdminPlanAction, updateAdminPlanAction, deleteAdminPlanAction } from "@/actions/admin-plan"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog"
import { Trash2, Save, ArrowLeft, Settings, IndianRupee, Database } from "lucide-react"
import type { PlanConfig } from "@repo/db"

interface PlanFormProps {
  initialData?: Partial<PlanInput> & { id?: string }
  planId?: string
  configs: PlanConfig[]
}

export function PlanForm({ initialData, planId, configs }: PlanFormProps) {
  const router = useRouter()
  const isEditing = !!planId

  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const defaultValues = initialData
    ? initialData
    : {
      name: "",
      displayName: "",
      description: "",
      amountPaise: null,
      billingInterval: "ONE_TIME",
      interviewCredits: 1,
      planConfigId: "",
      isActive: true,
      isVisible: true,
    }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PlanFormInput>({
    resolver: zodResolver(planSchema),
    defaultValues: defaultValues as PlanFormInput,
  })

  async function onSubmit(formData: PlanFormInput) {
    const data = formData as unknown as PlanInput
    setIsLoading(true)
    try {
      if (isEditing) {
        await updateAdminPlanAction(planId, data)
        toast.success("Plan updated successfully")
      } else {
        const res = await createAdminPlanAction(data)
        if (res.success && res.data) {
          toast.success("Plan created successfully")
          router.push(`/admin/plans/${res.data.id}`)
          return
        }
      }
    } catch {
      toast.error("Failed to save plan")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete() {
    if (!planId) return
    setDeleteLoading(true)
    try {
      await deleteAdminPlanAction(planId)
      toast.success("Plan deleted successfully")
      setShowDeleteDialog(false)
      router.push("/admin/plans")
    } catch {
      toast.error("Failed to delete plan")
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-8 pb-16">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b pb-4 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push("/admin/plans")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{isEditing ? "Edit Plan" : "New Plan"}</h1>
            <p className="text-sm text-muted-foreground">{isEditing ? `Manage settings for ${initialData?.displayName}` : "Create a new commercial package"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing && (
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} disabled={isLoading}>
              <Trash2 className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Delete</span>
            </Button>
          )}
          <Button onClick={handleSubmit(onSubmit)} disabled={isLoading} className="shadow-primary-glow">
            <Save className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">{isLoading ? "Saving..." : "Save Plan"}</span>
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

      <form id="plan-form" onSubmit={handleSubmit(onSubmit)} className="space-y-10">

        {/* ── General ──────────────────────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Settings className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">General Information</h2>
          </div>
          <Card className="border-border/60 shadow-sm">
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Internal Name</Label>
                  <Input id="name" {...register("name")} placeholder="e.g. pro_monthly" />
                  <p className="text-xs text-muted-foreground">Unique identifier used in code. No spaces.</p>
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input id="displayName" {...register("displayName")} placeholder="e.g. Pro Plan" />
                  <p className="text-xs text-muted-foreground">Shown to candidates on the pricing page.</p>
                  {errors.displayName && <p className="text-xs text-destructive">{errors.displayName.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...register("description")} placeholder="Optional tagline for the pricing page" />
                {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
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
                    <p className="text-sm text-muted-foreground">Is this plan currently enabled in the system?</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border p-4 bg-card/50">
                  <input
                    type="checkbox"
                    id="isVisible"
                    {...register("isVisible")}
                    className="mt-1 h-5 w-5 cursor-pointer accent-primary"
                  />
                  <div className="space-y-1">
                    <Label className="text-base cursor-pointer" htmlFor="isVisible">Visible on Pricing Page</Label>
                    <p className="text-sm text-muted-foreground">Uncheck for legacy plans that users shouldn&apos;t buy anymore.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ── Pricing & Credits ────────────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <IndianRupee className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Pricing & Value</h2>
          </div>
          <Card className="border-border/60 shadow-sm">
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Price (Paise)</Label>
                  <Input type="number" {...register("amountPaise")} placeholder="e.g. 4900 for ₹49" />
                  <p className="text-xs text-muted-foreground">Leave empty for Free Tier.</p>
                  {errors.amountPaise && <p className="text-xs text-destructive">{errors.amountPaise.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Billing Interval</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    {...register("billingInterval")}
                  >
                    <option value="ONE_TIME">One Time</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                  {errors.billingInterval && <p className="text-xs text-destructive">{errors.billingInterval.message}</p>}
                </div>
              </div>

              <div className="pt-4 border-t border-border/50 max-w-sm">
                <div className="space-y-2">
                  <Label>Interview Credits</Label>
                  <Input type="number" {...register("interviewCredits")} />
                  <p className="text-xs text-muted-foreground">Granted on subscription or purchase.</p>
                  {errors.interviewCredits && <p className="text-xs text-destructive">{errors.interviewCredits.message}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ── Technical Behaviour (PlanConfig) ─────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Database className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Technical Behaviour</h2>
          </div>
          <Card className="border-border/60 shadow-sm">
            <CardContent className="pt-6">
              <div className="space-y-2 max-w-md">
                <Label>Plan Config</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  {...register("planConfigId")}
                >
                  <option value="" disabled>Select a config...</option>
                  {configs.map(config => (
                    <option key={config.id} value={config.id}>
                      {config.name} {config.isDefault ? "(Default)" : ""}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">Select the PlanConfig that defines how the interview runs for this plan.</p>
                {errors.planConfigId && <p className="text-xs text-destructive">{errors.planConfigId.message}</p>}
              </div>
            </CardContent>
          </Card>
        </section>

      </form>

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Plan?"
        description="This action cannot be undone. It will permanently remove this commercial package."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        loading={deleteLoading}
        destructive
      />
    </div>
  )
}
