import { v4 as uuidv4 } from 'uuid';
import { ContactFormData, ContactSubmission } from '../types/contact.types';
import { IContactRepository } from './IContactRepository';

export class ContactRepository implements IContactRepository {
  private submissions: ContactSubmission[] = [];

  async submitContact(data: ContactFormData, ipAddress?: string): Promise<ContactSubmission> {
    console.log('[ContactRepository] Saving contact submission');
    console.time('ContactRepository Save');
    
    const submission: ContactSubmission = {
      ...data,
      id: uuidv4(),
      submittedAt: new Date(),
      ipAddress,
    };

    this.submissions.push(submission);
    console.timeEnd('ContactRepository Save');
    console.log('[ContactRepository] Contact saved with ID:', submission.id);

    return submission;
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
