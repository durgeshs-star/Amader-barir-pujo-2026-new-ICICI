import { EmailOptions } from '../types/contact.types';

export interface IEmailService {
  sendEmail(options: EmailOptions): Promise<void>;
}
