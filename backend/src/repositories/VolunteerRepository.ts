import { v4 as uuidv4 } from 'uuid';
import { VolunteerFormData, VolunteerSubmission } from '../types/volunteer.types';
import { IVolunteerRepository } from './IVolunteerRepository';

export class VolunteerRepository implements IVolunteerRepository {
  private submissions: VolunteerSubmission[] = [];

  async submitVolunteer(data: VolunteerFormData, ipAddress?: string): Promise<VolunteerSubmission> {
    console.log('[VolunteerRepository] Saving volunteer submission');
    console.time('VolunteerRepository Save');
    
    const submission: VolunteerSubmission = {
      ...data,
      id: uuidv4(),
      submittedAt: new Date(),
      ipAddress,
    };

    this.submissions.push(submission);
    console.timeEnd('VolunteerRepository Save');
    console.log('[VolunteerRepository] Volunteer saved with ID:', submission.id);

    return submission;
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
