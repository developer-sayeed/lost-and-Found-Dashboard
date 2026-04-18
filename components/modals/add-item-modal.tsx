'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { CATEGORIES, LOCATIONS } from '@/lib/constants'
import { useAuth } from '@/components/auth/auth-provider'
import type { ItemCategory, ItemLocation } from '@/lib/types'
import { format, addDays } from 'date-fns'

interface AddItemModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddItemModal({ open, onClose, onSuccess }: AddItemModalProps) {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    dateFound: format(new Date(), 'yyyy-MM-dd'),
    itemDescription: '',
    category: '' as ItemCategory | '',
    locationFound: '' as ItemLocation | '',
    roomNumber: '',
    guestName: '',
    finderName: '',
    storeLocation: '',
    dispatchDuration: '90',
  })

  const resetForm = () => {
    setFormData({
      dateFound: format(new Date(), 'yyyy-MM-dd'),
      itemDescription: '',
      category: '',
      locationFound: '',
      roomNumber: '',
      guestName: '',
      finderName: '',
      storeLocation: '',
      dispatchDuration: '90',
    })
    setError('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const dispatchDays = parseInt(formData.dispatchDuration)
      const dispatchDeadline = addDays(new Date(formData.dateFound), dispatchDays)

      const newItem = {
        dateFound: formData.dateFound,
        itemDescription: formData.itemDescription,
        category: formData.category,
        location: formData.locationFound,
        locationFound: formData.locationFound === 'Room' 
          ? `Room ${formData.roomNumber}` 
          : formData.locationFound,
        roomNumber: formData.locationFound === 'Room' ? formData.roomNumber : undefined,
        guestName: formData.guestName || undefined,
        finderName: formData.finderName,
        recordedBy: user?.name || 'Unknown',
        storeLocation: formData.storeLocation,
        dispatchDuration: dispatchDays,
        dispatchDeadline: dispatchDeadline.toISOString(),
      }

      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to add item')
      }

      resetForm()
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Lost Item</DialogTitle>
          <DialogDescription>Fill in the details below to register a new lost item.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <FieldGroup className="py-4">
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="dateFound">Date Found *</FieldLabel>
                <Input
                  id="dateFound"
                  type="date"
                  value={formData.dateFound}
                  onChange={(e) => setFormData({ ...formData, dateFound: e.target.value })}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="category">Category *</FieldLabel>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value as ItemCategory })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="itemDescription">Item Description *</FieldLabel>
              <Textarea
                id="itemDescription"
                placeholder="Describe the item in detail..."
                value={formData.itemDescription}
                onChange={(e) => setFormData({ ...formData, itemDescription: e.target.value })}
                required
                rows={3}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="locationFound">Location Found *</FieldLabel>
                <Select 
                  value={formData.locationFound} 
                  onValueChange={(value) => setFormData({ ...formData, locationFound: value as ItemLocation })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map((loc) => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {formData.locationFound === 'Room' && (
                <Field>
                  <FieldLabel htmlFor="roomNumber">Room Number *</FieldLabel>
                  <Input
                    id="roomNumber"
                    placeholder="e.g., 101"
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    required={formData.locationFound === 'Room'}
                  />
                </Field>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="guestName">Guest Name</FieldLabel>
                <Input
                  id="guestName"
                  placeholder="Name of the guest (if known)"
                  value={formData.guestName}
                  onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="finderName">Finder Name *</FieldLabel>
                <Input
                  id="finderName"
                  placeholder="Name of the person who found it"
                  value={formData.finderName}
                  onChange={(e) => setFormData({ ...formData, finderName: e.target.value })}
                  required
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="storeLocation">Store Location *</FieldLabel>
                <Input
                  id="storeLocation"
                  placeholder="Where is the item stored?"
                  value={formData.storeLocation}
                  onChange={(e) => setFormData({ ...formData, storeLocation: e.target.value })}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="dispatchDuration">Dispatch Duration (days) *</FieldLabel>
                <Input
                  id="dispatchDuration"
                  type="number"
                  min="1"
                  max="365"
                  value={formData.dispatchDuration}
                  onChange={(e) => setFormData({ ...formData, dispatchDuration: e.target.value })}
                  required
                />
              </Field>
            </div>
          </FieldGroup>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Spinner className="h-4 w-4 mr-2" />}
              Add Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
