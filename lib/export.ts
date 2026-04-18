import * as XLSX from 'xlsx'
import { format } from 'date-fns'
import type { LostItem } from './types'
import { STATUS_LABELS } from './constants'

interface ExportRow {
  Code: string
  'Date Found': string
  Description: string
  Category: string
  Location: string
  'Room Number': string
  'Guest Name': string
  'Finder Name': string
  'Recorded By': string
  'Store Location': string
  'Dispatch Duration': string
  Status: string
  'Handover Date': string
  'Handed Over By': string
  'Contact Number': string
  'Dispatch Date': string
  'Dispatched By': string
}

function formatItemsForExport(items: LostItem[]): ExportRow[] {
  return items.map((item) => ({
    Code: item.code,
    'Date Found': format(new Date(item.dateFound), 'MMM dd, yyyy'),
    Description: item.itemDescription,
    Category: item.category,
    Location: item.location,
    'Room Number': item.roomNumber || '',
    'Guest Name': item.guestName || '',
    'Finder Name': item.finderName,
    'Recorded By': item.recordedBy,
    'Store Location': item.storeLocation,
    'Dispatch Duration': `${item.dispatchDuration} days`,
    Status: STATUS_LABELS[item.status],
    'Handover Date': item.handoverDate ? format(new Date(item.handoverDate), 'MMM dd, yyyy HH:mm') : '',
    'Handed Over By': item.handoverBy || '',
    'Contact Number': item.handoverContactNumber || '',
    'Dispatch Date': item.dispatchDate ? format(new Date(item.dispatchDate), 'MMM dd, yyyy HH:mm') : '',
    'Dispatched By': item.dispatchBy || '',
  }))
}

export function exportToExcel(items: LostItem[], filename: string = 'lost-and-found'): void {
  const data = formatItemsForExport(items)
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Lost & Found Items')

  // Auto-size columns
  const columnWidths = Object.keys(data[0] || {}).map((key) => ({
    wch: Math.max(key.length, ...data.map((row) => String(row[key as keyof ExportRow]).length))
  }))
  worksheet['!cols'] = columnWidths

  XLSX.writeFile(workbook, `${filename}-${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
}

export function exportToCSV(items: LostItem[], filename: string = 'lost-and-found'): void {
  const data = formatItemsForExport(items)
  const worksheet = XLSX.utils.json_to_sheet(data)
  const csv = XLSX.utils.sheet_to_csv(worksheet)
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}-${format(new Date(), 'yyyy-MM-dd')}.csv`
  link.click()
}
