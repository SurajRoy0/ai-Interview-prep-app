"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type ConfirmationVariant = "alert" | "confirm"

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  variant?: ConfirmationVariant
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm?: () => void | Promise<void>
  loading?: boolean
  destructive?: boolean
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  variant = "confirm",
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  onConfirm,
  loading = false,
  destructive = false,
}: ConfirmationDialogProps) {
  const isAlert = variant === "alert"
  const resolvedConfirmLabel = confirmLabel ?? (isAlert ? "OK" : "Confirm")

  async function handleConfirm(e: React.MouseEvent) {
    e.preventDefault()
    if (loading) return
    await onConfirm?.()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description ? <AlertDialogDescription>{description}</AlertDialogDescription> : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          {!isAlert ? (
            <AlertDialogCancel disabled={loading}>
              {cancelLabel}
            </AlertDialogCancel>
          ) : null}
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className={destructive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
          >
            {loading ? "Please wait…" : resolvedConfirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
