import nodemailer from 'nodemailer';
import { EmailOptions } from '../types/contact.types';
import { IEmailService } from './IEmailService';

export class EmailService implements IEmailService {
  private transporter: nodemailer.Transporter;
  private emailFrom: string;

  constructor() {
    console.log('[EmailService] SMTP configuration loaded');

    // Validate EMAIL_FROM is set
    this.emailFrom = process.env.EMAIL_FROM || '';
    if (!this.emailFrom) {
      console.error('[EmailService] CRITICAL: EMAIL_FROM environment variable is not set. Emails will fail.');
      console.error('[EmailService] Set EMAIL_FROM=info@proplusdatafoundation.com in production environment.');
    } else {
      console.log('[EmailService] Email from:', this.emailFrom);
    }

    // Validate SMTP_HOST is set
    const smtpHost = process.env.SMTP_HOST;
    if (!smtpHost) {
      console.error('[EmailService] CRITICAL: SMTP_HOST environment variable is not set. Emails will fail.');
      console.error('[EmailService] Set SMTP_HOST=proplusdatafoundation.com for production SMTP.');
    } else {
      console.log('[EmailService] SMTP host:', smtpHost);
    }

    // Log SMTP user (without password)
    const smtpUser = process.env.SMTP_USER;
    if (smtpUser) {
      console.log('[EmailService] SMTP user:', smtpUser);
    }

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(process.env.SMTP_PORT || '465'),
      secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT || '465') === 465,
      auth: {
        user: smtpUser,
        pass: process.env.SMTP_PASS,
      },
      // Timeout settings to prevent hanging
      connectionTimeout: 30000, // 30 seconds
      greetingTimeout: 30000,   // 30 seconds
      socketTimeout: 30000,     // 30 seconds
      // Pool settings
      pool: true,
      maxConnections: 1,
      maxMessages: 3,
      // Debug logging in development
      debug: process.env.NODE_ENV === 'development',
      logger: process.env.NODE_ENV === 'development',
    });

    // Verify SMTP configuration at startup
    this.verifySmtpConnection();
  }

  private async verifySmtpConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      console.log('[EmailService] SMTP connection verified successfully');
    } catch (error) {
      console.error('[EmailService] SMTP connection verification failed:', error);
      // Don't throw - allow application to start even if SMTP is temporarily unavailable
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    if (!this.emailFrom) {
      throw new Error('EMAIL_FROM environment variable is not configured. Cannot send email.');
    }

    console.log('[EmailService] sendEmail() called for:', options.to);
    console.time('SMTP Send');

    const mailOptions = {
      from: this.emailFrom,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text,
    };

    console.log('[EmailService] Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
    });

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.timeEnd('SMTP Send');
      console.log('[EmailService] Email sent successfully:', info.messageId);
      console.log('[EmailService] Email response:', info.response);
    } catch (error) {
      console.timeEnd('SMTP Send');
      console.error('[EmailService] Failed to send email:', error);
      throw error;
    }
  }

  /** Send a Bhog booking confirmation email to the booking customer. */
  async sendBhogConfirmationEmail(params: {
    to: string;
    customerName: string;
    day: string;
    date: string;
    bhogTiming: string;
    isFree: boolean;
    totalAmount: number;
    categories: Array<{ title: string; quantity: number }>;
    receiptPath?: string;
  }): Promise<void> {
    const { to, customerName, day, date, bhogTiming, isFree, totalAmount, categories, receiptPath } = params;
    const totalPlates = categories.reduce((sum, category) => sum + Number(category.quantity || 0), 0);
    const categoryText = categories
      .map((category) => `- ${category.title}: ${category.quantity} ${category.quantity === 1 ? 'plate' : 'plates'}`)
      .join('\n');
    const categoryHtml = categories
      .map((category) => `<li><strong>${category.title}:</strong> ${category.quantity} ${category.quantity === 1 ? 'plate' : 'plates'}</li>`)
      .join('');
    const paymentSummary = isFree
      ? 'Booking Type: FREE\nAmount Paid: INR 0.00'
      : `Booking Type: PAID\nAmount Paid: INR ${totalAmount.toFixed(2)}`;
    const paymentSummaryHtml = isFree
      ? '<li><strong>Booking Type:</strong> FREE</li><li><strong>Amount Paid:</strong> INR 0.00</li>'
      : `<li><strong>Booking Type:</strong> PAID</li><li><strong>Amount Paid:</strong> INR ${totalAmount.toFixed(2)}</li>`;

    const emailText = `
Dear ${customerName},

Your Bhog booking has been confirmed!

Booking Details:
- Day: ${day}
- Date: ${date}
- Bhog Timing: ${bhogTiming}
- Total Plates: ${totalPlates}
- Categories:
${categoryText}
- ${paymentSummary}

Thank you for your booking with Amader Barir Pujo 2026.

Warm regards,
Amader Barir Puja 2026 Team
    `.trim();

    const emailHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #8B4513;">Your Bhog Booking Confirmation – Amader Barir Pujo 2026</h2>
  <p>Dear <strong>${customerName}</strong>,</p>
  <p>Your Bhog booking has been confirmed!</p>
  
  <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #8B4513;">Booking Details</h3>
    <ul style="list-style: none; padding: 0;">
      <li><strong>Day:</strong> ${day}</li>
      <li><strong>Date:</strong> ${date}</li>
      <li><strong>Bhog Timing:</strong> ${bhogTiming}</li>
      <li><strong>Total Plates:</strong> ${totalPlates}</li>
      <li><strong>Categories:</strong>
        <ul>${categoryHtml}</ul>
      </li>
      ${paymentSummaryHtml}
    </ul>
  </div>
  
  <p>Thank you for your booking with Amader Barir Pujo 2026.</p>
  ${receiptPath ? '<p>Please find your receipt attached to this email.</p>' : ''}
  
  <p style="margin-top: 30px;">Warm regards,<br>Amader Barir Puja 2026 Team</p>
</div>
    `.trim();

    const mailOptions: any = {
      from: this.emailFrom,
      to,
      subject: 'Your Bhog Booking Confirmation – Amader Barir Pujo 2026',
      text: emailText,
      html: emailHtml,
    };

    // Attach receipt if provided
    if (receiptPath) {
      mailOptions.attachments = [
        {
          filename: `Bhog_Receipt_${Date.now()}.pdf`,
          path: receiptPath,
        },
      ];
    }

    console.log('[EmailService] Sending Bhog confirmation email to:', to);
    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('[EmailService] Bhog confirmation email sent successfully:', info.messageId);
    } catch (error) {
      console.error('[EmailService] Failed to send Bhog confirmation email to:', to);
      console.error('[EmailService] Error details:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Send Anudan payment confirmation email with receipt attachment
   */
  async sendAnudanConfirmationEmail(params: {
    to: string;
    customerName: string;
    categories: Array<{ day: string; amount: number }>;
    totalAmount: number;
    receiptPath: string;
  }): Promise<void> {
    const { to, customerName, categories, totalAmount, receiptPath } = params;

    const categoriesList = categories.map(cat => `- ${cat.day}: ₹${cat.amount.toFixed(2)}`).join('\n');

    const emailText = `
Dear ${customerName},

Your Anudan contribution has been received successfully!

Contribution Details:
${categoriesList}

Total Amount: ₹${totalAmount.toFixed(2)}

Thank you for your generous contribution to Amader Barir Pujo 2026.

Please find your receipt attached to this email.

Warm regards,
Amader Barir Puja 2026 Team
    `.trim();

    const categoriesListHtml = categories.map(cat => 
      `<li><strong>${cat.day}:</strong> ₹${cat.amount.toFixed(2)}</li>`
    ).join('');

    const emailHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #8B4513;">Your Anudan Confirmation – Amader Barir Pujo 2026</h2>
  <p>Dear <strong>${customerName}</strong>,</p>
  <p>Your Anudan contribution has been received successfully!</p>
  
  <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #8B4513;">Contribution Details</h3>
    <ul style="list-style: none; padding: 0;">
      ${categoriesListHtml}
    </ul>
    <p style="margin-top: 15px;"><strong>Total Amount: ₹${totalAmount.toFixed(2)}</strong></p>
  </div>
  
  <p>Thank you for your generous contribution to Amader Barir Pujo 2026.</p>
  <p>Please find your receipt attached to this email.</p>
  
  <p style="margin-top: 30px;">Warm regards,<br>Amader Barir Puja 2026 Team</p>
</div>
    `.trim();

    const mailOptions = {
      from: this.emailFrom,
      to,
      subject: 'Your Anudan Confirmation – Amader Barir Pujo 2026',
      text: emailText,
      html: emailHtml,
      attachments: [
        {
          filename: `Anudan_Receipt_${Date.now()}.pdf`,
          path: receiptPath,
        },
      ],
    };

    console.log('[EmailService] Sending Anudan confirmation email to:', to);
    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('[EmailService] Anudan confirmation email sent successfully:', info.messageId);
    } catch (error) {
      console.error('[EmailService] Failed to send Anudan confirmation email:', error);
      throw error;
    }
  }
}
