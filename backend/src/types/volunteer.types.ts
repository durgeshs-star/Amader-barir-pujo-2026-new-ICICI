export interface VolunteerFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export interface VolunteerSubmission extends VolunteerFormData {
  id: string;
  submittedAt: Date;
  ipAddress?: string;
}
