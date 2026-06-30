import nodemailer from 'nodemailer';
import { EmailOptions } from '../types/contact.types';
import { IEmailService } from './IEmailService';

export class EmailService implements IEmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'info@abp.proplusdatafoundation.com',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
