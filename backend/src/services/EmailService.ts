import nodemailer from 'nodemailer';
import { EmailOptions } from '../types/contact.types';
import { IEmailService } from './IEmailService';

export class EmailService implements IEmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || '587'),
      secure: Number(process.env.SMTP_PORT || '587') === 465,

      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },

      // Prevent hanging connections
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,

      tls: {
        rejectUnauthorized: false,
      },
    });

    // Verify SMTP connection on startup
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('[SMTP] Verification failed');
        console.error(error);
      } else {
        console.log('[SMTP] Server is ready to send emails');
      }
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
  console.log("[SMTP] sendEmail() called");

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html || options.text,
  };

  console.log("[SMTP] Before sendMail");

  const info = await this.transporter.sendMail(mailOptions);

  console.log("[SMTP] After sendMail");
  console.log(info);
}
}