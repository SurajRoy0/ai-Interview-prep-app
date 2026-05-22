"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

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

  async function handleConfirm() {
    await onConfirm?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={!isAlert}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <DialogFooter showCloseButton={false}>
          {!isAlert ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {cancelLabel}
            </Button>
          ) : null}
          <Button
            type="button"
            variant={destructive ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Please wait…" : resolvedConfirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
