/**
 * HTML templates for Lob postcard backs
 * Uses Lob's merge variables for dynamic content
 */

type CardBackParams = {
  recipientName: string;
  message: string;
  occasion: string;
};

/**
 * Generates HTML for the postcard back
 * Lob specs for 6x9 postcards:
 * - Full bleed: 6.25" x 9.25" (1875 x 2775 pixels at 300 DPI)
 * - Safe area: 5.75" x 8.75" (1725 x 2625 pixels at 300 DPI)
 * - Address block: Right half (reserved by USPS)
 */
export function getCardBackHtml(params: CardBackParams): string {
  const { recipientName, message, occasion } = params;

  // Escape HTML to prevent injection
  const escapeHtml = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const safeRecipient = escapeHtml(recipientName);
  const safeMessage = escapeHtml(message);
  const safeOccasion = escapeHtml(occasion);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=Inter:wght@400;500&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      width: 6.25in;
      height: 9.25in;
      padding: 0.25in;
      font-family: 'Inter', sans-serif;
      background: #FFFEF8;
    }

    .content {
      width: 2.75in;
      height: 100%;
      padding: 0.25in 0.375in 0.25in 0.125in;
      display: flex;
      flex-direction: column;
    }

    .occasion-tag {
      font-size: 9pt;
      font-weight: 500;
      color: #6B7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.125in;
    }

    .greeting {
      font-family: 'Playfair Display', serif;
      font-size: 14pt;
      font-weight: 600;
      color: #1F2937;
      margin-bottom: 0.2in;
    }

    .message {
      font-size: 10pt;
      line-height: 1.6;
      color: #374151;
      flex: 1;
      overflow: hidden;
    }

    .footer {
      margin-top: auto;
      padding-top: 0.2in;
      border-top: 1px solid #E5E7EB;
    }

    .brand {
      font-size: 8pt;
      color: #9CA3AF;
    }

    .brand-name {
      font-weight: 500;
      color: #6B7280;
    }
  </style>
</head>
<body>
  <div class="content">
    <div class="occasion-tag">${safeOccasion}</div>
    <div class="greeting">Dear ${safeRecipient},</div>
    <div class="message">${safeMessage}</div>
    <div class="footer">
      <div class="brand">Created with <span class="brand-name">AnyDay Card</span></div>
    </div>
  </div>
</body>
</html>`;
}
