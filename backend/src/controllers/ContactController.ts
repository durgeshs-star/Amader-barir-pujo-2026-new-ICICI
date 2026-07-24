import { Request, Response, NextFunction } from 'express';
import { ContactFormData } from '../types/contact.types';
import { IContactRepository } from '../repositories/IContactRepository';
import { IEmailService } from '../services/IEmailService';

export class ContactController {
  constructor(
    private contactRepository: IContactRepository,
    private emailService: IEmailService
  ) {}

  async submitContact(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, subject, message } = req.body as ContactFormData;
      const ipAddress = req.ip || req.socket.remoteAddress;

      // Validate email
      if (!this.contactRepository.validateEmail(email)) {
        res.status(400).json({ error: 'Invalid email address' });
        return;
      }

      // Save contact submission
      const submission = await this.contactRepository.submitContact(
        { name, email, subject, message },
        ipAddress
      );

      // Send email notification
      const emailText = `
Name: ${name}
Email: ${email}
Subject: ${subject}
Message: ${message}
Submitted At: ${submission.submittedAt.toISOString()}
IP Address: ${ipAddress || 'N/A'}
      `;

      const emailHtml = `
<h2>New Contact Form Submission</h2>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Subject:</strong> ${subject}</p>
<p><strong>Message:</strong></p>
<p>${message.replace(/\n/g, '<br>')}</p>
<p><strong>Submitted At:</strong> ${submission.submittedAt.toISOString()}</p>
<p><strong>IP Address:</strong> ${ipAddress || 'N/A'}</p>
      `;

      await this.emailService.sendEmail({
        to: process.env.EMAIL_TO || 'info@abp.proplusdatafoundation.com',
        subject: `ABP Contact Form Submission: ${subject}`,
        text: emailText,
        html: emailHtml,
      });

      res.status(200).json({
        success: true,
        message: 'Contact form submitted successfully',
        data: { id: submission.id },
      });
    } catch (error) {
      console.error('Error in submitContact:', error);
      next(error);
    }
  }
}
