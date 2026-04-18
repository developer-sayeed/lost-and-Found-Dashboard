'use client'

import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import type { LostItem } from '@/lib/types'
import { STATUS_LABELS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface ViewDetailsModalProps {
  item: LostItem | null
  open: boolean
  onClose: () => void
}

const statusStyles = {
  stored: 'bg-primary/10 text-primary',
  handed_over: 'bg-green-100 text-green-700',
  dispatched: 'bg-blue-100 text-blue-700',
}

export function ViewDetailsModal({ item, open, onClose }: ViewDetailsModalProps) {
  if (!item) return null

  const dispatchDeadline = new Date(item.dateFound)
  dispatchDeadline.setDate(dispatchDeadline.getDate() + item.dispatchDuration)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>Item Details</span>
            <Badge className={cn(statusStyles[item.status])}>
              {STATUS_LABELS[item.status]}
            </Badge>
          </DialogTitle>
          <DialogDescription className="sr-only">
            View details for lost item {item.code}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <DetailField label="Code" value={item.code} />
            <DetailField 
              label="Date Found" 
              value={format(new Date(item.dateFound), 'MMMM dd, yyyy')} 
            />
          </div>

          {/* Item Details */}
          <div className="space-y-2">
            <DetailField label="Item Description" value={item.itemDescription} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <DetailField label="Category" value={item.category} />
            <DetailField 
              label="Location Found" 
              value={item.location === 'Room' ? `Room ${item.roomNumber}` : item.location} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <DetailField label="Guest Name" value={item.guestName || 'N/A'} />
            <DetailField label="Finder Name" value={item.finderName} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <DetailField label="Store Location" value={item.storeLocation} />
            <DetailField label="Recorded By" value={item.recordedBy} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <DetailField 
              label="Dispatch Duration" 
              value={`${item.dispatchDuration} days`} 
            />
            <DetailField 
              label="Dispatch Deadline" 
              value={format(dispatchDeadline, 'MMMM dd, yyyy')} 
            />
          </div>

          {/* Handover Info */}
          {item.status === 'handed_over' && item.handoverDate && (
            <div className="border-t pt-4">
              <h4 className="font-semibold text-foreground mb-3">Handover Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <DetailField 
                  label="Handover Date" 
                  value={format(new Date(item.handoverDate), 'MMMM dd, yyyy HH:mm')} 
                />
                <DetailField label="Handed Over By" value={item.handoverBy || 'N/A'} />
                <DetailField label="Receiver Name" value={item.handoverReceiverName || 'N/A'} />
                <DetailField label="Contact Number" value={item.handoverContactNumber || 'N/A'} />
              </div>
            </div>
          )}

          {/* Dispatch Info */}
          {item.status === 'dispatched' && item.dispatchDate && (
            <div className="border-t pt-4">
              <h4 className="font-semibold text-foreground mb-3">Dispatch Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <DetailField 
                  label="Dispatch Date" 
                  value={format(new Date(item.dispatchDate), 'MMMM dd, yyyy HH:mm')} 
                />
                <DetailField label="Dispatched By" value={item.dispatchBy || 'N/A'} />
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="border-t pt-4 text-sm text-muted-foreground">
            <div className="grid grid-cols-2 gap-4">
              <p>Created: {format(new Date(item.createdAt), 'MMM dd, yyyy HH:mm')}</p>
              <p>Updated: {format(new Date(item.updatedAt), 'MMM dd, yyyy HH:mm')}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-foreground">{value}</p>
    </div>
  )
}
