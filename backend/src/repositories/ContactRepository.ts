import { v4 as uuidv4 } from 'uuid';
import { ContactFormData, ContactSubmission } from '../types/contact.types';
import { IContactRepository } from './IContactRepository';

export class ContactRepository implements IContactRepository {
  private submissions: ContactSubmission[] = [];

  async submitContact(data: ContactFormData, ipAddress?: string): Promise<ContactSubmission> {
    const submission: ContactSubmission = {
      ...data,
      id: uuidv4(),
      submittedAt: new Date(),
      ipAddress,
    };

    this.submissions.push(submission);

    return submission;
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
