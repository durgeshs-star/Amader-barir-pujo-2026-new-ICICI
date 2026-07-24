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
    try {
      const { name, email, phone, message } = req.body as VolunteerFormData;
      const ipAddress = req.ip || req.socket.remoteAddress;

      if (!this.volunteerRepository.validateEmail(email)) {
        res.status(400).json({ error: 'Invalid email address' });
        return;
      }

      const submission = await this.volunteerRepository.submitVolunteer(
        { name, email, phone, message },
        ipAddress
      );

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

      await this.emailService.sendEmail({
        to: process.env.EMAIL_TO || 'info@abp.proplusdatafoundation.com',
        subject: `ABP Volunteer Form Submission: ${name}`,
        text: emailText,
        html: emailHtml,
      });

      res.status(200).json({
        success: true,
        message: 'Volunteer form submitted successfully',
        data: { id: submission.id },
      });
    } catch (error) {
      console.error('Error in submitVolunteer:', error);
      next(error);
    }
  }
}
