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

  private formatIndianTimestamp(date: Date = new Date()): string {
    const fmt = new Intl.DateTimeFormat('en', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const parts = fmt.formatToParts(date);
    const map: { [k: string]: string } = {};
    for (const p of parts) {
      if (p.type !== 'literal') map[p.type] = p.value;
    }

    const datePart = `${map.year}-${map.month}-${map.day}`;
    const timePart = `${map.hour}:${map.minute}`;
    const period = map.dayPeriod ? ` ${map.dayPeriod}` : '';

    return `${datePart} ${timePart}${period}`;
  }

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
        this.formatIndianTimestamp(),
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
