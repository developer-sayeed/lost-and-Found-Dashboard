'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { useAuth } from '@/components/auth/auth-provider'
import type { LostItem } from '@/lib/types'
import { HandHeart, User, Phone } from 'lucide-react'

interface HandoverModalProps {
  item: LostItem | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function HandoverModal({ item, open, onClose, onSuccess }: HandoverModalProps) {
  const { user } = useAuth()
  const [receiverName, setReceiverName] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleClose = () => {
    setReceiverName('')
    setContactNumber('')
    setError('')
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!item) return

    if (!receiverName.trim()) {
      setError('Please enter the receiver name')
      return
    }

    if (!contactNumber.trim()) {
      setError('Please enter the contact number')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch(`/api/items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'handed_over',
          handoverDate: new Date().toISOString(),
          handoverBy: user?.name || 'Unknown',
          handoverReceiverName: receiverName.trim(),
          handoverContactNumber: contactNumber.trim(),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to complete handover')
      }

      setReceiverName('')
      setContactNumber('')
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete handover')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-100">
              <HandHeart className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <DialogTitle>Handover to Guest</DialogTitle>
              <DialogDescription>
                Item: {item?.code}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <FieldGroup className="py-4">
            <div className="bg-muted/50 p-3 rounded-lg mb-4">
              <p className="text-sm font-medium text-foreground">{item?.itemDescription}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Original Guest: {item?.guestName || 'Unknown'}
              </p>
            </div>

            <Field>
              <FieldLabel htmlFor="receiverName">
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Receiver Name *
                </span>
              </FieldLabel>
              <Input
                id="receiverName"
                type="text"
                placeholder="Enter receiver's full name"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Name of the person receiving the item
              </p>
            </Field>

            <Field>
              <FieldLabel htmlFor="contactNumber">
                <span className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Contact Number *
                </span>
              </FieldLabel>
              <Input
                id="contactNumber"
                type="tel"
                placeholder="Enter receiver's phone number"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                This will be recorded for reference purposes.
              </p>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting && <Spinner className="h-4 w-4 mr-2" />}
              Confirm Handover
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
