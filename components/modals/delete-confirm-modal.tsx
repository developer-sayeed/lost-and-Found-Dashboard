'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import type { LostItem } from '@/lib/types'
import { Trash2 } from 'lucide-react'

interface DeleteConfirmModalProps {
  item: LostItem | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function DeleteConfirmModal({ item, open, onClose, onSuccess }: DeleteConfirmModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    if (!item) return

    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch(`/api/items/${item.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete item')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-red-100">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle>Delete Item</DialogTitle>
              <DialogDescription>
                Item: {item?.code}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="py-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm font-medium text-foreground">{item?.itemDescription}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Category: {item?.category}
            </p>
          </div>

          <p className="text-sm text-destructive mt-4 font-medium">
            Are you sure you want to delete this item? This action cannot be undone.
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="destructive"
            onClick={handleDelete}
            disabled={isSubmitting}
          >
            {isSubmitting && <Spinner className="h-4 w-4 mr-2" />}
            Delete Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
