import { VolunteerFormData, VolunteerSubmission } from '../types/volunteer.types';

export interface IVolunteerRepository {
  submitVolunteer(data: VolunteerFormData, ipAddress?: string): Promise<VolunteerSubmission>;
  validateEmail(email: string): boolean;
}
