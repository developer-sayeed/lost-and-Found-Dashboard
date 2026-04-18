'use client'

import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, Printer, Edit, Trash2, HandHeart, Package } from 'lucide-react'
import type { LostItem } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ItemsTableProps {
  items: LostItem[]
  onView: (item: LostItem) => void
  onEdit: (item: LostItem) => void
  onDelete: (item: LostItem) => void
  onHandover: (item: LostItem) => void
  onDispatch: (item: LostItem) => void
  onPrint: (item: LostItem) => void
  permissions: {
    canEdit: boolean
    canDelete: boolean
    canHandover: boolean
    canDispatch: boolean
  }
}

const statusStyles = {
  stored: 'bg-primary/10 text-primary hover:bg-primary/10',
  handed_over: 'bg-green-100 text-green-700 hover:bg-green-100',
  dispatched: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
}

const statusLabels = {
  stored: 'Stored',
  handed_over: 'Handed Over',
  dispatched: 'Dispatched',
}

export function ItemsTable({
  items,
  onView,
  onEdit,
  onDelete,
  onHandover,
  onDispatch,
  onPrint,
  permissions,
}: ItemsTableProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-lg border">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-1">No items found</h3>
        <p className="text-sm text-muted-foreground">
          Try adjusting your filters or add a new item.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Code</TableHead>
            <TableHead className="font-semibold">Date Found</TableHead>
            <TableHead className="font-semibold">Description</TableHead>
            <TableHead className="font-semibold">Category</TableHead>
            <TableHead className="font-semibold">Guest Name</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="text-right font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="hover:bg-muted/30">
              <TableCell className="font-medium text-primary">{item.code}</TableCell>
              <TableCell>{format(new Date(item.dateFound), 'MMM dd, yyyy')}</TableCell>
              <TableCell className="max-w-[200px] truncate">{item.itemDescription}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>{item.guestName || '-'}</TableCell>
              <TableCell>
                <Badge className={cn('font-medium', statusStyles[item.status])}>
                  {statusLabels[item.status]}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView(item)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onPrint(item)}>
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </DropdownMenuItem>
                    
                    {permissions.canEdit && (
                      <DropdownMenuItem onClick={() => onEdit(item)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    
                    {item.status === 'stored' && permissions.canHandover && (
                      <DropdownMenuItem onClick={() => onHandover(item)}>
                        <HandHeart className="h-4 w-4 mr-2" />
                        Handover to Guest
                      </DropdownMenuItem>
                    )}
                    
                    {item.status === 'stored' && permissions.canDispatch && (
                      <DropdownMenuItem onClick={() => onDispatch(item)}>
                        <Package className="h-4 w-4 mr-2" />
                        Dispatch
                      </DropdownMenuItem>
                    )}
                    
                    {permissions.canDelete && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => onDelete(item)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
