import { Request, Response, NextFunction } from 'express';
import { VolunteerFormData } from '../types/volunteer.types';
import { IVolunteerRepository } from '../repositories/IVolunteerRepository';
import { IEmailService } from '../services/IEmailService';

export class VolunteerController {
  constructor(
    private volunteerRepository: IVolunteerRepository,
    private emailService: IEmailService
  ) {}

  async submitVolunteer(req: Request, res: Response, next: NextFunction): Promise<void> {
    console.time('Volunteer Request');
    console.log('[Volunteer] Request received');
    
    try {
      const { name, email, phone, message } = req.body as VolunteerFormData;
      const ipAddress = req.ip || req.socket.remoteAddress;

      console.log('[Volunteer] Processing submission for:', email);

      console.log('[Volunteer] Validating email');
      if (!this.volunteerRepository.validateEmail(email)) {
        console.log('[Volunteer] Email validation failed');
        res.status(400).json({ error: 'Invalid email address' });
        return;
      }
      console.log('[Volunteer] Email validation passed');

      console.log('[Volunteer] Saving to repository');
      const submission = await this.volunteerRepository.submitVolunteer(
        { name, email, phone, message },
        ipAddress
      );
      console.log('[Volunteer] Repository save completed, ID:', submission.id);

      console.log('[Volunteer] Preparing email content');
      const emailText = `
Name: ${name}
Email: ${email}
Phone: ${phone}
Message: ${message || '(No message provided)'}
Submitted At: ${submission.submittedAt.toISOString()}
IP Address: ${ipAddress || 'N/A'}
      `;

      const emailHtml = `
<h2>New Volunteer Form Submission</h2>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Phone:</strong> ${phone}</p>
<p><strong>Message:</strong></p>
<p>${(message || '(No message provided)').replace(/\n/g, '<br>')}</p>
<p><strong>Submitted At:</strong> ${submission.submittedAt.toISOString()}</p>
<p><strong>IP Address:</strong> ${ipAddress || 'N/A'}</p>
      `;

      console.log('[Volunteer] Sending email notification');
      console.time('Volunteer Email Send');
      
      try {
        await this.emailService.sendEmail({
          to: process.env.EMAIL_TO || 'info@abp.proplusdatafoundation.com',
          subject: `ABP Volunteer Form Submission: ${name}`,
          text: emailText,
          html: emailHtml,
        });
        console.timeEnd('Volunteer Email Send');
        console.log('[Volunteer] Email sent successfully');
      } catch (emailError) {
        console.timeEnd('Volunteer Email Send');
        console.error('[Volunteer] Email sending failed:', emailError);
        // Don't fail the request if email fails - log and continue
      }

      console.log('[Volunteer] Sending response');
      res.status(200).json({
        success: true,
        message: 'Volunteer form submitted successfully',
        data: { id: submission.id },
      });
      
      console.timeEnd('Volunteer Request');
      console.log('[Volunteer] Request completed successfully');
      
    } catch (error) {
      console.timeEnd('Volunteer Request');
      console.error('[Volunteer] Error in submitVolunteer:', error);
      
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
