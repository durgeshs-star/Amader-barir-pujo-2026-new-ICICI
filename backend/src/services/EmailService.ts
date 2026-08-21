import nodemailer from 'nodemailer';
import { EmailOptions } from '../types/contact.types';
import { IEmailService } from './IEmailService';

export class EmailService implements IEmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    console.log('[EmailService] Initializing SMTP transporter');
    
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || '587'),
      secure: Number(process.env.SMTP_PORT || '587') === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Timeout settings to prevent hanging
      connectionTimeout: 30000, // 30 seconds
      greetingTimeout: 30000,   // 30 seconds  
      socketTimeout: 30000,     // 30 seconds
      // TLS settings
      tls: {
        rejectUnauthorized: false,
      },
      // Pool settings
      pool: true,
      maxConnections: 1,
      maxMessages: 3,
      // Debug logging in development
      debug: process.env.NODE_ENV === 'development',
      logger: process.env.NODE_ENV === 'development',
    });

    // Verify SMTP connection on startup
    console.log('[EmailService] Verifying SMTP connection');
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('[EmailService] SMTP verification failed:', error);
      } else {
        console.log('[EmailService] SMTP server is ready to send emails');
      }
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    console.log('[EmailService] sendEmail() called for:', options.to);
    console.time('SMTP Send');

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
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
}