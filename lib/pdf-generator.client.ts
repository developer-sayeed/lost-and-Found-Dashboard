// This file creates printable HTML documents that open in a new window
// No external PDF libraries required - uses browser's native print functionality

import { format } from 'date-fns'
import type { LostItem, HotelSettings } from './types'
import { STATUS_LABELS } from './constants'

function createPrintWindow(title: string, content: string, settings: HotelSettings): void {
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Please allow popups for this site to print')
    return
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <style>
    @page {
      size: A4;
      margin: 10mm;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 11px;
      line-height: 1.4;
      padding: 10px;
      max-width: 100%;
      margin: 0 auto;
      color: #333;
    }
    .header {
      text-align: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #403a60;
    }
    .logo {
      max-width: 150px;
      max-height: 50px;
      margin-bottom: 5px;
    }
    .hotel-name {
      font-size: 16px;
      font-weight: bold;
      color: #403a60;
      margin-bottom: 3px;
    }
    .document-title {
      font-size: 13px;
      color: #666;
    }
    .item-code {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding: 8px;
      background: #f5f5f5;
      border-radius: 4px;
    }
    .code {
      font-size: 13px;
      font-weight: bold;
      color: #403a60;
    }
    .status {
      padding: 3px 10px;
      border-radius: 12px;
      font-weight: bold;
      font-size: 10px;
    }
    .status-stored { background: #f3e8ff; color: #6b21a8; }
    .status-handed_over { background: #d1fae5; color: #065f46; }
    .status-dispatched { background: #dbeafe; color: #1e40af; }
    .section {
      margin-bottom: 12px;
    }
    .section-title {
      font-size: 12px;
      font-weight: bold;
      color: #403a60;
      margin-bottom: 6px;
      padding-bottom: 3px;
      border-bottom: 1px solid #ddd;
    }
    .fields-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px 20px;
    }
    .field {
      display: flex;
      padding: 2px 0;
    }
    .field-label {
      font-weight: bold;
      width: 120px;
      color: #555;
      flex-shrink: 0;
    }
    .field-value {
      flex: 1;
    }
    .field-full {
      grid-column: 1 / -1;
    }
    .signature-section {
      margin-top: 15px;
      padding-top: 10px;
      border-top: 1px solid #ddd;
    }
    .signature-boxes {
      display: flex;
      justify-content: space-between;
      margin-top: 12px;
      gap: 20px;
    }
    .signature-box {
      flex: 1;
      text-align: center;
    }
    .signature-line {
      height: 40px;
      border: 1px solid #ddd;
      margin-bottom: 5px;
    }
    .footer {
      margin-top: 15px;
      padding-top: 10px;
      border-top: 1px solid #ddd;
      text-align: center;
      font-size: 9px;
      color: #666;
    }
    .print-date {
      margin-top: 5px;
      font-size: 8px;
      color: #999;
    }
    .acknowledgment {
      background: #f9fafb;
      padding: 10px;
      border-radius: 4px;
      margin-top: 10px;
      font-size: 10px;
    }
    @media print {
      body { 
        padding: 0; 
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    ${settings.logo ? `<img src="${settings.logo}" alt="${settings.hotelName}" class="logo" />` : ''}
    <div class="hotel-name">${settings.hotelName}</div>
    <div class="document-title">${title}</div>
  </div>
  
  ${content}
  
  <div class="footer">
    <div>${settings.hotelAddress || ''}</div>
    <div>${[settings.hotelPhone ? `Phone: ${settings.hotelPhone}` : '', settings.hotelEmail ? `Email: ${settings.hotelEmail}` : ''].filter(Boolean).join(' | ')}</div>
    ${settings.hotelWebsite ? `<div>${settings.hotelWebsite}</div>` : ''}
    <div class="print-date">Printed: ${format(new Date(), 'MMMM dd, yyyy HH:mm')}</div>
  </div>
  
  <script>
    window.onload = function() {
      window.print();
    }
  </script>
</body>
</html>
  `

  printWindow.document.write(html)
  printWindow.document.close()
}

export async function generateItemPDF(item: LostItem, settings: HotelSettings): Promise<void> {
  const dispatchDeadline = new Date(item.dateFound)
  dispatchDeadline.setDate(dispatchDeadline.getDate() + item.dispatchDuration)

  let statusSpecificContent = ''

  if (item.status === 'handed_over' && item.handoverDate) {
    statusSpecificContent = `
      <div class="section">
        <div class="section-title">Handover Information</div>
        <div class="fields-grid">
          <div class="field">
            <span class="field-label">Handover Date:</span>
            <span class="field-value">${format(new Date(item.handoverDate), 'MMM dd, yyyy HH:mm')}</span>
          </div>
          <div class="field">
            <span class="field-label">Handed Over By:</span>
            <span class="field-value">${item.handoverBy || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="field-label">Receiver Name:</span>
            <span class="field-value">${item.handoverReceiverName || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="field-label">Contact Number:</span>
            <span class="field-value">${item.handoverContactNumber || 'N/A'}</span>
          </div>
        </div>
      </div>
    `
  }

  if (item.status === 'dispatched' && item.dispatchDate) {
    statusSpecificContent = `
      <div class="section">
        <div class="section-title">Dispatch Information</div>
        <div class="fields-grid">
          <div class="field">
            <span class="field-label">Dispatch Date:</span>
            <span class="field-value">${format(new Date(item.dispatchDate), 'MMM dd, yyyy HH:mm')}</span>
          </div>
          <div class="field">
            <span class="field-label">Dispatched By:</span>
            <span class="field-value">${item.dispatchBy || 'N/A'}</span>
          </div>
        </div>
      </div>
    `
  }

  const content = `
    <div class="item-code">
      <span class="code">Item Code: ${item.code}</span>
      <span class="status status-${item.status}">${STATUS_LABELS[item.status]}</span>
    </div>
    
    <div class="section">
      <div class="section-title">Item Details</div>
      <div class="fields-grid">
        <div class="field">
          <span class="field-label">Date Found:</span>
          <span class="field-value">${format(new Date(item.dateFound), 'MMM dd, yyyy')}</span>
        </div>
        <div class="field">
          <span class="field-label">Category:</span>
          <span class="field-value">${item.category}</span>
        </div>
        <div class="field">
          <span class="field-label">Location Found:</span>
          <span class="field-value">${item.location === 'Room' ? `Room ${item.roomNumber}` : item.location}</span>
        </div>
        <div class="field">
          <span class="field-label">Store Location:</span>
          <span class="field-value">${item.storeLocation}</span>
        </div>
        <div class="field field-full">
          <span class="field-label">Description:</span>
          <span class="field-value">${item.itemDescription}</span>
        </div>
        <div class="field">
          <span class="field-label">Guest Name:</span>
          <span class="field-value">${item.guestName || 'N/A'}</span>
        </div>
        <div class="field">
          <span class="field-label">Finder Name:</span>
          <span class="field-value">${item.finderName}</span>
        </div>
        <div class="field">
          <span class="field-label">Recorded By:</span>
          <span class="field-value">${item.recordedBy}</span>
        </div>
        <div class="field">
          <span class="field-label">Dispatch Deadline:</span>
          <span class="field-value">${format(dispatchDeadline, 'MMM dd, yyyy')}</span>
        </div>
      </div>
    </div>
    
    ${statusSpecificContent}
  `

  createPrintWindow('Lost & Found Item Report', content, settings)
}

export async function generateHandoverPDF(item: LostItem, settings: HotelSettings): Promise<void> {
  const content = `
    <div class="item-code">
      <span class="code">Item Code: ${item.code}</span>
      <span class="status status-handed_over">Handed Over</span>
    </div>
    
    <div class="section">
      <div class="section-title">Item Details</div>
      <div class="fields-grid">
        <div class="field">
          <span class="field-label">Date Found:</span>
          <span class="field-value">${format(new Date(item.dateFound), 'MMM dd, yyyy')}</span>
        </div>
        <div class="field">
          <span class="field-label">Category:</span>
          <span class="field-value">${item.category}</span>
        </div>
        <div class="field field-full">
          <span class="field-label">Description:</span>
          <span class="field-value">${item.itemDescription}</span>
        </div>
        <div class="field">
          <span class="field-label">Location Found:</span>
          <span class="field-value">${item.location === 'Room' ? `Room ${item.roomNumber}` : item.location}</span>
        </div>
        <div class="field">
          <span class="field-label">Guest Name:</span>
          <span class="field-value">${item.guestName || 'N/A'}</span>
        </div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">Handover Details</div>
      <div class="fields-grid">
        <div class="field">
          <span class="field-label">Handover Date:</span>
          <span class="field-value">${item.handoverDate ? format(new Date(item.handoverDate), 'MMM dd, yyyy HH:mm') : 'N/A'}</span>
        </div>
        <div class="field">
          <span class="field-label">Handed Over By:</span>
          <span class="field-value">${item.handoverBy || 'N/A'}</span>
        </div>
        <div class="field">
          <span class="field-label">Receiver Name:</span>
          <span class="field-value">${item.handoverReceiverName || 'N/A'}</span>
        </div>
        <div class="field">
          <span class="field-label">Contact Number:</span>
          <span class="field-value">${item.handoverContactNumber || 'N/A'}</span>
        </div>
      </div>
    </div>
    
    <div class="signature-section">
      <div class="section-title">Guest Acknowledgment</div>
      <div class="acknowledgment">
        I acknowledge that I have received the above-mentioned item and confirm that it belongs to me.
      </div>
      <div class="signature-boxes">
        <div class="signature-box">
          <div class="signature-line"></div>
          <div>Guest Signature</div>
          <div style="margin-top: 5px; font-size: 9px;">Name: ${item.handoverReceiverName || '________________'}</div>
          <div style="margin-top: 3px; font-size: 9px;">Date: ________________</div>
        </div>
        <div class="signature-box">
          <div class="signature-line"></div>
          <div>Staff Signature</div>
          <div style="margin-top: 5px; font-size: 9px;">Name: ${item.handoverBy || '________________'}</div>
          <div style="margin-top: 3px; font-size: 9px;">Date: ________________</div>
        </div>
      </div>
    </div>
  `

  createPrintWindow('Lost & Found Handover Form', content, settings)
}
