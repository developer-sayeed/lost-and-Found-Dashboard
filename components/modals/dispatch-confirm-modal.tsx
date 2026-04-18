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
import { useAuth } from '@/components/auth/auth-provider'
import type { LostItem } from '@/lib/types'
import { Package, AlertTriangle } from 'lucide-react'
import { format, addDays } from 'date-fns'

interface DispatchConfirmModalProps {
  item: LostItem | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function DispatchConfirmModal({ item, open, onClose, onSuccess }: DispatchConfirmModalProps) {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!item) return

    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch(`/api/items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'dispatched',
          dispatchedDate: new Date().toISOString(),
          dispatchedBy: user?.name || 'Unknown',
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to dispatch item')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to dispatch item')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!item) return null

  const dispatchDeadline = item.dispatchDeadline 
    ? new Date(item.dispatchDeadline)
    : addDays(new Date(item.dateFound), item.dispatchDuration || 90)
  const isOverdue = new Date() > dispatchDeadline

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isOverdue ? 'bg-amber-100' : 'bg-blue-100'}`}>
              {isOverdue ? (
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              ) : (
                <Package className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <div>
              <DialogTitle>Dispatch Item</DialogTitle>
              <DialogDescription>
                Item: {item.code}
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
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium text-foreground">{item.itemDescription}</p>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Category: {item.category}</p>
              <p>Found on: {format(new Date(item.dateFound), 'MMM dd, yyyy')}</p>
              <p>Store Location: {item.storeLocation}</p>
              <p className={isOverdue ? 'text-amber-600 font-medium' : ''}>
                Dispatch Deadline: {format(dispatchDeadline, 'MMM dd, yyyy')}
                {isOverdue && ' (Overdue)'}
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mt-4">
            This action will mark the item as dispatched and remove it from active inventory. 
            This cannot be undone.
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting && <Spinner className="h-4 w-4 mr-2" />}
            Confirm Dispatch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
