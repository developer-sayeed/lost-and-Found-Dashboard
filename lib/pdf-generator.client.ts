// This file creates printable HTML documents that open in a new window
// No external PDF libraries required - uses browser's native print functionality

import { format } from "date-fns";
import type { LostItem, HotelSettings } from "./types";
import { STATUS_LABELS } from "./constants";

// QR Code generation function using Google Chart API
function generateQRCode(data: string, size: number = 150): string {
  const encodedData = encodeURIComponent(data);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedData}&format=png`;
}

// Generate QR Code data based on item status
function getQRCodeData(item: LostItem): string {
  let lines: string[] = [];

  // Basic info
  lines.push(`Item Code: ${item.code}`);
  lines.push(
    `Item Name: ${item.itemDescription.substring(0, 30)}${item.itemDescription.length > 30 ? "..." : ""}`,
  );
  lines.push(`Status: ${STATUS_LABELS[item.status]}`);
  lines.push(`Date Found: ${format(new Date(item.dateFound), "MMM dd, yyyy")}`);
  lines.push(`Guest Name: ${item.guestName || "N/A"}`);
  lines.push(`Recorded By: ${item.recordedBy}`);
  lines.push(``); // empty line for spacing

  if (item.status === "stored") {
    lines.push(`--- Storage Details ---`);
    lines.push(`Store Location: ${item.storeLocation}`);
    lines.push(
      `Storage Date: ${format(new Date(item.dateFound), "MMM dd, yyyy")}`,
    );
  }

  if (item.status === "handed_over") {
    lines.push(`--- Handover Details ---`);
    lines.push(
      `Handover Date: ${item.handoverDate ? format(new Date(item.handoverDate), "MMM dd, yyyy HH:mm") : "N/A"}`,
    );
    lines.push(`Handed Over By: ${item.handoverBy || "N/A"}`);
    lines.push(`Receiver Name: ${item.handoverReceiverName || "N/A"}`);
    lines.push(`Contact Number: ${item.handoverContactNumber || "N/A"}`);
  }

  if (item.status === "dispatched") {
    lines.push(`--- Dispatch Details ---`);
    const dispatchDate = item.dispatchDate || item.dispatchedDate;
    lines.push(
      `Dispatch Date: ${dispatchDate ? format(new Date(dispatchDate), "MMM dd, yyyy HH:mm") : "N/A"}`,
    );
    const dispatchBy = item.dispatchBy || item.dispatchedBy || "N/A";
    lines.push(`Dispatch By: ${dispatchBy}`);
    lines.push(`Taken By (Employee): ${item.finderName || "N/A"}`);
  }

  return lines.join("\n");
}

// Helper function to safely format dates
function safeFormatDate(
  date: any,
  formatStr: string = "MMM dd, yyyy HH:mm",
): string {
  if (!date) return "N/A";
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "N/A";
    return format(dateObj, formatStr);
  } catch (error) {
    return "N/A";
  }
}

// Map social media labels to Font Awesome icon classes
function getSocialIconClass(label: string): string {
  const labelLower = label.toLowerCase().trim();
  const iconMap: Record<string, string> = {
    facebook: "fa-facebook",
    instagram: "fa-instagram",
    twitter: "fa-twitter",
    youtube: "fa-youtube",
    linkedin: "fa-linkedin",
    whatsapp: "fa-whatsapp",
    telegram: "fa-telegram",
    tiktok: "fa-tiktok",
    snapchat: "fa-snapchat",
    pinterest: "fa-pinterest",
    reddit: "fa-reddit",
    github: "fa-github",
    discord: "fa-discord",
    twitch: "fa-twitch",
    spotify: "fa-spotify",
    apple: "fa-apple",
    android: "fa-android",
    microsoft: "fa-microsoft",
    amazon: "fa-amazon",
    google: "fa-google",
    vimeo: "fa-vimeo",
    dribbble: "fa-dribbble",
    behance: "fa-behance",
    flickr: "fa-flickr",
    tumblr: "fa-tumblr",
    skype: "fa-skype",
    slack: "fa-slack",
    dropbox: "fa-dropbox",
    wordpress: "fa-wordpress",
    shopify: "fa-shopify",
    etsy: "fa-etsy",
    ebay: "fa-ebay",
    paypal: "fa-paypal",
    stripe: "fa-stripe",
    wechat: "fa-wechat",
    line: "fa-line",
    vk: "fa-vk",
    odnoklassniki: "fa-odnoklassniki",
    tripadvisor: "fa-tripadvisor",
    yelp: "fa-yelp",
    foursquare: "fa-foursquare",
    booking: "fa-booking",
    airbnb: "fa-airbnb",
  };

  for (const [key, icon] of Object.entries(iconMap)) {
    if (labelLower.includes(key)) {
      return icon;
    }
  }
  return "fa-link";
}

function createPrintWindow(
  title: string,
  content: string,
  settings: HotelSettings,
  item?: LostItem,
): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups for this site to print");
    return;
  }

  let qrCodeUrl = "";
  let qrDataText = "";
  if (item) {
    const qrData = getQRCodeData(item);
    qrDataText = qrData;
    qrCodeUrl = generateQRCode(qrData);
  }

  let socialLinksHtml = "";
  if (settings.otherLinks && settings.otherLinks.length > 0) {
    socialLinksHtml = `<div class="social-links">`;
    settings.otherLinks.forEach((link: any) => {
      if (link.url && link.label) {
        const iconClass = getSocialIconClass(link.label);
        socialLinksHtml += `<a href="${link.url}" target="_blank"><i class="fab ${iconClass}"></i> ${link.label}</a>`;
      }
    });
    socialLinksHtml += `</div>`;
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
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
      line-height: 1.5;
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
      background: #2e304c;
      border-radius: 4px;
    }
    .code {
      font-size: 13px;
      font-weight: bold;
      color: #ffffff;
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
      width: 140px;
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
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      font-size: 9px;
      color: #666;
      flex-wrap: wrap;
    }
    .footer-left {
      flex: 1;
      text-align: left;
      min-width: 200px;
    }
    .footer-right {
      flex: 0 0 auto;
      text-align: center;
      margin-left: 20px;
      max-width: 200px;
    }
    .footer-right img {
      max-width: 150px;
      max-height: 150px;
      display: block;
      margin: 0 auto;
    }
    .qr-label {
      font-size: 8px;
      color: #999;
      margin-top: 4px;
      text-align: center;
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
    .dispatch-info {
      background: #eff6ff;
      padding: 8px 12px;
      border-radius: 4px;
      border-left: 4px solid #2563eb;
      margin-top: 5px;
    }
    .dispatch-label {
      font-weight: bold;
      color: #1e40af;
    }
    .handover-info {
      background: #f0fdf4;
      padding: 8px 12px;
      border-radius: 4px;
      border-left: 4px solid #16a34a;
      margin-top: 5px;
    }
    .handover-label {
      font-weight: bold;
      color: #15803d;
    }
    .storage-info {
      background: #f5f3ff;
      padding: 8px 12px;
      border-radius: 4px;
      border-left: 4px solid #8b5cf6;
      margin-top: 5px;
    }
    .storage-label {
      font-weight: bold;
      color: #7c3aed;
    }
    .qr-data-preview {
      font-size: 7px;
      color: #999;
      margin-top: 4px;
      text-align: left;
      white-space: pre-wrap;
      word-break: break-word;
      max-width: 150px;
      max-height: 100px;
      overflow: hidden;
      line-height: 1.4;
    }
    .social-links {
      margin-top: 6px;
      display: flex;
      flex-wrap: wrap;
      gap: 10px 18px;
    }
    .social-links a {
      color: #403a60;
      text-decoration: none;
      font-size: 9px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .social-links a i {
      font-size: 12px;
      width: 16px;
      text-align: center;
      color: #403a60;
    }
    .social-links a:hover {
      text-decoration: underline;
    }
    @media print {
      body { 
        padding: 0; 
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .no-print { display: none; }
      .footer-right img {
        max-width: 120px;
        max-height: 120px;
      }
      .qr-data-preview {
        display: none;
      }
      .social-links a {
        color: #403a60 !important;
      }
      .social-links a i {
        color: #403a60 !important;
      }
    }
    @media screen and (max-width: 600px) {
      .footer {
        flex-direction: column;
        text-align: center;
      }
      .footer-right {
        margin-left: 0;
        margin-top: 10px;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    ${settings.logo ? `<img src="${settings.logo}" alt="${settings.hotelName}" class="logo" />` : ""}
    <div class="hotel-name">${settings.hotelName}</div>
    <div class="document-title">${title}</div>
  </div>
  
  ${content}
  
  <div class="footer">
    <div class="footer-left">
      <div>${settings.hotelAddress || ""}</div>
      <div>${[settings.hotelPhone ? `Phone: ${settings.hotelPhone}` : "", settings.hotelEmail ? `Email: ${settings.hotelEmail}` : ""].filter(Boolean).join(" | ")}</div>
      ${settings.hotelWebsite ? `<div>${settings.hotelWebsite}</div>` : ""}
      ${socialLinksHtml}
      <div class="print-date">Printed: ${format(new Date(), "MMMM dd, yyyy HH:mm")}</div>
    </div>
    ${
      item
        ? `
    <div class="footer-right">
      <img src="${qrCodeUrl}" alt="QR Code for ${item.code}" />
      <div class="qr-label">Scan QR Code for Item Details</div>
      <div class="qr-data-preview">${qrDataText.replace(/\n/g, " | ")}</div>
    </div>
    `
        : ""
    }
  </div>
  
  <script>
    window.onload = function() {
      window.print();
    }
  </script>
</body>
</html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

export async function generateItemPDF(
  item: LostItem,
  settings: HotelSettings,
  currentUser?: string,
): Promise<void> {
  console.log("📦 generateItemPDF called with item:", item);
  console.log("👤 Current User:", currentUser);
  console.log("📊 Item Status:", item.status);

  const dispatchDeadline = new Date(item.dateFound);
  dispatchDeadline.setDate(dispatchDeadline.getDate() + item.dispatchDuration);

  let statusSpecificContent = "";

  if (item.status === "stored") {
    statusSpecificContent = `
      <div class="section">
        <div class="section-title">Storage Information</div>
        <div class="fields-grid">
          <div class="field">
            <span class="field-label">Store Location:</span>
            <span class="field-value">${item.storeLocation || "N/A"}</span>
          </div>
          <div class="field">
            <span class="field-label">Storage Date:</span>
            <span class="field-value">${safeFormatDate(item.dateFound, "MMM dd, yyyy")}</span>
          </div>
          <div class="field field-full">
            <div class="storage-info">
              <span class="storage-label">📦 Item in Storage</span>
              <div style="margin-top: 4px;">
                <strong>Location:</strong> ${item.storeLocation || "N/A"} | 
                <strong>Status:</strong> ${STATUS_LABELS[item.status]}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (item.status === "handed_over") {
    const handoverDate = safeFormatDate(item.handoverDate);
    const handoverBy = item.handoverBy || "N/A";
    const receiverName = item.handoverReceiverName || "N/A";
    const contactNumber = item.handoverContactNumber || "N/A";

    statusSpecificContent = `
      <div class="section">
        <div class="section-title">Handover Information</div>
        <div class="fields-grid">
          <div class="field">
            <span class="field-label">Handover Date:</span>
            <span class="field-value">${handoverDate}</span>
          </div>
          <div class="field">
            <span class="field-label">Handed Over By:</span>
            <span class="field-value">${handoverBy}</span>
          </div>
          <div class="field">
            <span class="field-label">Receiver Name:</span>
            <span class="field-value">${receiverName}</span>
          </div>
          <div class="field">
            <span class="field-label">Contact Number:</span>
            <span class="field-value">${contactNumber}</span>
          </div>
          <div class="field field-full">
            <div class="handover-info">
              <span class="handover-label">✅ Item Handed Over</span>
              <div style="margin-top: 4px;">
                <strong>Handed By:</strong> ${handoverBy} | 
                <strong>Received By:</strong> ${receiverName} | 
                <strong>Contact:</strong> ${contactNumber}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (item.status === "dispatched") {
    console.log("✅ DISPATCH section triggered!");

    const dispatchDateRaw = item.dispatchDate || item.dispatchedDate;
    const dispatchByRaw = item.dispatchBy || item.dispatchedBy;
    const dispatchToRaw = item.finderName;

    console.log("🔍 Dispatch Date raw:", dispatchDateRaw);
    console.log("🔍 Dispatch By raw:", dispatchByRaw);
    console.log("🔍 Dispatch To raw (finderName):", dispatchToRaw);

    const dispatchDate = safeFormatDate(dispatchDateRaw);
    const dispatchBy = currentUser || dispatchByRaw || "N/A";
    const dispatchTo = dispatchToRaw || "N/A";

    console.log("📝 Formatted Dispatch Date:", dispatchDate);
    console.log("📝 Dispatch By:", dispatchBy);
    console.log("📝 Taken By:", dispatchTo);

    statusSpecificContent = `
      <div class="section">
        <div class="section-title">Dispatch Information</div>
        <div class="fields-grid">
          <div class="field">
            <span class="field-label">Dispatch Date:</span>
            <span class="field-value"><strong>${dispatchDate}</strong></span>
          </div>
          <div class="field">
            <span class="field-label">Dispatch By:</span>
            <span class="field-value"><strong>${dispatchBy}</strong></span>
          </div>
          <div class="field">
            <span class="field-label">Taken By (Employee):</span>
            <span class="field-value"><strong>${dispatchTo}</strong></span>
          </div>
          <div class="field field-full">
            <div class="dispatch-info">
              <span class="dispatch-label">📦 Item Dispatched</span>
              <div style="margin-top: 4px;">
                <strong>Dispatched By:</strong> ${dispatchBy} | 
                <strong>Taken By:</strong> ${dispatchTo}
                ${dispatchDateRaw ? ` | <strong>Date:</strong> ${dispatchDate}` : ""}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
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
          <span class="field-label">Item Name:</span>
          <span class="field-value">${item.itemDescription}</span>
        </div>
        <div class="field">
          <span class="field-label">Date Found:</span>
          <span class="field-value">${safeFormatDate(item.dateFound, "MMM dd, yyyy")}</span>
        </div>
        <div class="field">
          <span class="field-label">Category:</span>
          <span class="field-value">${item.category}</span>
        </div>
        <div class="field">
          <span class="field-label">Location Found:</span>
          <span class="field-value">${item.location === "Room" ? `Room ${item.roomNumber}` : item.location}</span>
        </div>
        <div class="field">
          <span class="field-label">Guest Name:</span>
          <span class="field-value">${item.guestName || "N/A"}</span>
        </div>
        <div class="field">
          <span class="field-label">Recorded By:</span>
          <span class="field-value">${item.recordedBy}</span>
        </div>
        <div class="field">
          <span class="field-label">Employee Name:</span>
          <span class="field-value">${item.finderName}</span>
        </div>
        <div class="field">
          <span class="field-label">Dispatch Deadline:</span>
          <span class="field-value">${safeFormatDate(dispatchDeadline, "MMM dd, yyyy")}</span>
        </div>
      </div>
    </div>
    
    ${statusSpecificContent}
  `;

  createPrintWindow("Lost & Found Item Report", content, settings, item);
}

export async function generateHandoverPDF(
  item: LostItem,
  settings: HotelSettings,
  currentUser?: string,
): Promise<void> {
  let statusSpecificContent = "";

  if (item.status === "handed_over") {
    const handoverDate = safeFormatDate(item.handoverDate);
    const handoverBy = item.handoverBy || "N/A";
    const receiverName = item.handoverReceiverName || "N/A";
    const contactNumber = item.handoverContactNumber || "N/A";

    statusSpecificContent = `
      <div class="section">
        <div class="section-title">Handover Information</div>
        <div class="fields-grid">
          <div class="field">
            <span class="field-label">Handover Date:</span>
            <span class="field-value">${handoverDate}</span>
          </div>
          <div class="field">
            <span class="field-label">Handed Over By:</span>
            <span class="field-value">${handoverBy}</span>
          </div>
          <div class="field">
            <span class="field-label">Receiver Name:</span>
            <span class="field-value">${receiverName}</span>
          </div>
          <div class="field">
            <span class="field-label">Contact Number:</span>
            <span class="field-value">${contactNumber}</span>
          </div>
          <div class="field field-full">
            <div class="handover-info">
              <span class="handover-label">✅ Item Handed Over</span>
              <div style="margin-top: 4px;">
                <strong>Handed By:</strong> ${handoverBy} | 
                <strong>Received By:</strong> ${receiverName}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (item.status === "dispatched") {
    const dispatchDateRaw = item.dispatchDate || item.dispatchedDate;
    const dispatchByRaw = item.dispatchBy || item.dispatchedBy;
    const dispatchToRaw = item.finderName;

    const dispatchDate = safeFormatDate(dispatchDateRaw);
    const dispatchBy = currentUser || dispatchByRaw || "N/A";
    const dispatchTo = dispatchToRaw || "N/A";

    statusSpecificContent = `
      <div class="section">
        <div class="section-title">Dispatch Information</div>
        <div class="fields-grid">
          <div class="field">
            <span class="field-label">Dispatch Date:</span>
            <span class="field-value"><strong>${dispatchDate}</strong></span>
          </div>
          <div class="field">
            <span class="field-label">Dispatch By:</span>
            <span class="field-value"><strong>${dispatchBy}</strong></span>
          </div>
          <div class="field">
            <span class="field-label">Taken By (Employee):</span>
            <span class="field-value"><strong>${dispatchTo}</strong></span>
          </div>
          <div class="field field-full">
            <div class="dispatch-info">
              <span class="dispatch-label">📦 Item Dispatched</span>
              <div style="margin-top: 4px;">
                <strong>Dispatched By:</strong> ${dispatchBy} | 
                <strong>Taken By:</strong> ${dispatchTo}
                ${dispatchDateRaw ? ` | <strong>Date:</strong> ${dispatchDate}` : ""}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Get handover date for signature section
  const handoverDateStr = item.handoverDate
    ? safeFormatDate(item.handoverDate, "MMMM dd, yyyy")
    : format(new Date(), "MMMM dd, yyyy");

  const content = `
    <div class="item-code">
      <span class="code">Item Code: ${item.code}</span>
      <span class="status status-${item.status}">${STATUS_LABELS[item.status]}</span>
    </div>
    
    <div class="section">
      <div class="section-title">Item Details</div>
      <div class="fields-grid">
        <div class="field">
          <span class="field-label">Item Name:</span>
          <span class="field-value">${item.itemDescription}</span>
        </div>
        <div class="field">
          <span class="field-label">Date Found:</span>
          <span class="field-value">${safeFormatDate(item.dateFound, "MMM dd, yyyy")}</span>
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
          <span class="field-value">${item.location === "Room" ? `Room ${item.roomNumber}` : item.location}</span>
        </div>
        <div class="field">
          <span class="field-label">Guest Name:</span>
          <span class="field-value">${item.guestName || "N/A"}</span>
        </div>
        <div class="field">
          <span class="field-label">Recorded By:</span>
          <span class="field-value">${item.recordedBy}</span>
        </div>
      </div>
    </div>
    
    ${statusSpecificContent}
    
    <div class="signature-section">
      <div class="section-title">Guest Acknowledgment</div>
      <div class="acknowledgment">
        I hereby acknowledge receipt of the above-mentioned item and confirm that it is my personal property. I accept full responsibility upon handover.
      </div>
      <div class="signature-boxes">
        <div class="signature-box">
          <div class="signature-line"></div>
          <div>Guest Signature</div>
          <div style="margin-top: 5px; font-size: 9px;">Name: ${item.handoverReceiverName || "________________________"}</div>
          <div style="margin-top: 3px; font-size: 9px;">Date: ${handoverDateStr}</div>
        </div>
        <div class="signature-box">
          <div class="signature-line"></div>
          <div>Employee Signature</div>
          <div style="margin-top: 5px; font-size: 9px;">Name: ${item.handoverBy || "________________"}</div>
          <div style="margin-top: 3px; font-size: 9px;">Date: ${handoverDateStr}</div>
        </div>
      </div>
    </div>
  `;

  createPrintWindow("Lost & Found Handover Receipt", content, settings, item);
}
