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
    console.time('Contact Request');
    console.log('[Contact] Request received');
    
    try {
      const { name, email, subject, message } = req.body as ContactFormData;
      const ipAddress = req.ip || req.socket.remoteAddress;

      console.log('[Contact] Processing submission for:', email);
      
      // Validate email
      console.log('[Contact] Validating email');
      if (!this.contactRepository.validateEmail(email)) {
        console.log('[Contact] Email validation failed');
        res.status(400).json({ error: 'Invalid email address' });
        return;
      }
      console.log('[Contact] Email validation passed');

      // Save contact submission
      console.log('[Contact] Saving to repository');
      const submission = await this.contactRepository.submitContact(
        { name, email, subject, message },
        ipAddress
      );
      console.log('[Contact] Repository save completed, ID:', submission.id);

      // Send email notification
      console.log('[Contact] Preparing email content');
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

      console.log('[Contact] Sending email notification');
      console.time('Contact Email Send');
      
      try {
        await this.emailService.sendEmail({
          to: process.env.EMAIL_TO || 'info@abp.proplusdatafoundation.com',
          subject: `ABP Contact Form Submission: ${subject}`,
          text: emailText,
          html: emailHtml,
        });
        console.timeEnd('Contact Email Send');
        console.log('[Contact] Email sent successfully');
      } catch (emailError) {
        console.timeEnd('Contact Email Send');
        console.error('[Contact] Email sending failed:', emailError);
        // Don't fail the request if email fails - log and continue
      }

      console.log('[Contact] Sending response');
      res.status(200).json({
        success: true,
        message: 'Contact form submitted successfully',
        data: { id: submission.id },
      });
      
      console.timeEnd('Contact Request');
      console.log('[Contact] Request completed successfully');
      
    } catch (error) {
      console.timeEnd('Contact Request');
      console.error('[Contact] Error in submitContact:', error);
      
      // Ensure we always send a response
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Something went wrong'
        });
      }
    }
  }
}
