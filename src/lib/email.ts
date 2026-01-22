import sgMail from '@sendgrid/mail';

import { cards } from '~/src/app/create/constants';
import { getBaseUrl } from '~/src/lib/stripe';

let initialized = false;

function initSendGrid(): void {
  if (!initialized && process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    initialized = true;
  }
}

type OrderItem = {
  cardId: string;
  variant: 'physical' | 'digital';
  quantity: number;
  customization?: {
    recipientName: string;
    relationship: string;
    occasion: string;
    message: string;
  };
};

export async function sendDigitalCardEmail(params: {
  customerEmail: string;
  items: OrderItem[];
}): Promise<boolean> {
  initSendGrid();

  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid not configured, skipping email');
    return false;
  }

  const digitalItems = params.items.filter((i) => i.variant === 'digital');
  if (digitalItems.length === 0) return false;

  const baseUrl = getBaseUrl();

  const cardsHtml = digitalItems
    .map((item) => {
      const card = cards.find((c) => c.id === item.cardId);
      if (!card) return '';

      const imageUrl = `${baseUrl}${card.src}`;
      const message = item.customization?.message || '';
      const recipient = item.customization?.recipientName || '';

      return `
      <div style="margin-bottom: 32px;">
        <img src="${imageUrl}" alt="${card.name}" style="max-width: 100%; border-radius: 8px;" />
        ${recipient ? `<p style="margin-top: 16px; font-size: 18px;"><strong>For ${recipient}</strong></p>` : ''}
        ${message ? `<div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin-top: 8px; font-style: italic;">${message}</div>` : ''}
      </div>
    `;
    })
    .join('');

  try {
    await sgMail.send({
      to: params.customerEmail,
      from: process.env.SENDGRID_FROM_EMAIL || 'cards@anydaycard.com',
      subject: 'Your Digital Card is Ready!',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: sans-serif;">
          <h1 style="color: #333;">Your Digital Card</h1>
          <p>Thank you for your purchase! Here's your digital card:</p>
          ${cardsHtml}
          <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;" />
          <p style="color: #666; font-size: 14px;">From AnyDayCard</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('SendGrid error:', error);
    return false;
  }
}
