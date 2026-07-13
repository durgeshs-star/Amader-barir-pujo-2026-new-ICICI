import { Request, Response, NextFunction } from 'express';
import { GoogleSheetsService } from '../services/GoogleSheetsService';

export interface QuestionairSubmission {
  name: string;
  workingAt: string;
  email: string;
  contactNo: string;
  pujaMember: string;
  committee: string;
  committeeOtherDetail: string;
  willingVolunteer: string;
}

export class QuestionairController {
  constructor(private sheetsService: GoogleSheetsService) {}

  async submit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = req.body as QuestionairSubmission;
      const sheetName = 'WhatsApp Requests';
      const headers = [
        'Timestamp',
        'Name',
        'Working At',
        'Email',
        'Contact No',
        'Puja Member',
        'Committee',
        'Committee Other Detail',
        'Willing to Volunteer',
      ];

      await this.sheetsService.initialize();
      await this.sheetsService.createSheetIfNotExists(sheetName, headers);

      const row = [
        new Date().toISOString(),
        payload.name,
        payload.workingAt,
        payload.email,
        payload.contactNo,
        payload.pujaMember,
        payload.committee,
        payload.committeeOtherDetail,
        payload.willingVolunteer,
      ];

      await this.sheetsService.appendRow(sheetName, row);

      res.status(200).json({ success: true, message: 'Questionair submitted successfully', sheetSaved: true });
    } catch (error) {
      console.error('Questionair submission failed:', error);
      res.status(200).json({ success: true, message: 'Questionair submitted successfully', sheetSaved: false });
    }
  }
}
