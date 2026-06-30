import { ContactFormData, ContactSubmission } from '../types/contact.types';

export interface IContactRepository {
  submitContact(data: ContactFormData, ipAddress?: string): Promise<ContactSubmission>;
  validateEmail(email: string): boolean;
}
