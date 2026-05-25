"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createJobProfileSchema } from "@repo/validators"
import type { z } from "zod"
import { createJobProfileAction } from "@/actions/job-profile"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Briefcase } from "lucide-react"

type FormData = z.infer<typeof createJobProfileSchema>

interface Props {
  children: React.ReactNode
}

export function CreateProfileDialog({ children }: Props) {
  const [open, setOpen]         = useState(false)
  const [loading, setLoading]   = useState(false)
  const router                  = useRouter()

  const { register, handleSubmit, setValue, reset, formState: { errors } } =
    useForm<FormData>({
      resolver: zodResolver(createJobProfileSchema),
      defaultValues: {
        experienceLevel: "MID",
        ecosystem: "JAVASCRIPT",
      },
    })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const result = await createJobProfileAction(data)
      if (result.success) {
        toast.success("Job profile created!")
        setOpen(false)
        reset()
        // Navigate to the new profile page (user can upload resume there)
        router.push(`/profile/${result.data.id}`)
      } else {
        toast.error(result.error?.message ?? "Something went wrong")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Trigger — whatever you pass as children */}
      <span onClick={() => setOpen(true)} className="cursor-pointer">
        {children}
      </span>

      <Dialog open={open} onOpenChange={val => { if (!loading) setOpen(val) }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Briefcase className="h-4 w-4 text-primary" />
              </div>
              <DialogTitle>Create Job Profile</DialogTitle>
            </div>
            <DialogDescription>
              Define the role you&apos;re targeting. We&apos;ll use this to generate a tailored interview plan.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">

            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Profile Label
              </Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="e.g. Senior Frontend at a Startup"
                disabled={loading}
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            {/* Target Role */}
            <div className="space-y-1.5">
              <Label htmlFor="targetRole" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Target Role
              </Label>
              <Input
                id="targetRole"
                {...register("targetRole")}
                placeholder="e.g. Frontend Engineer"
                disabled={loading}
              />
              {errors.targetRole && <p className="text-xs text-destructive">{errors.targetRole.message}</p>}
            </div>

            {/* Experience + Ecosystem */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Experience
                </Label>
                <Select
                  defaultValue="MID"
                  onValueChange={v => setValue("experienceLevel", v as FormData["experienceLevel"])}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FRESHER">Fresher (0 yrs)</SelectItem>
                    <SelectItem value="JUNIOR">Junior (0–2 yrs)</SelectItem>
                    <SelectItem value="MID">Mid-Level (2–5 yrs)</SelectItem>
                    <SelectItem value="SENIOR">Senior (5+ yrs)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Ecosystem
                </Label>
                <Select
                  defaultValue="JAVASCRIPT"
                  onValueChange={v => setValue("ecosystem", v as FormData["ecosystem"])}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Stack" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JAVASCRIPT">JavaScript / TypeScript</SelectItem>
                    <SelectItem value="PYTHON">Python</SelectItem>
                    <SelectItem value="JAVA">Java</SelectItem>
                    <SelectItem value="GO">Go</SelectItem>
                    <SelectItem value="OTHER">Other / Agnostic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Notes <span className="font-normal normal-case text-muted-foreground/60">(optional)</span>
              </Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Any specific focus areas? e.g. 'Heavy on React Server Components and system design.'"
                className="resize-none min-h-[80px] text-sm"
                disabled={loading}
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/40">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                disabled={loading}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={loading}
                className="rounded-full gap-2 shadow-primary-glow min-w-[120px]"
              >
                {loading ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Creating…</>
                ) : (
                  "Create Profile →"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
