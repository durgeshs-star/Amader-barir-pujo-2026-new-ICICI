/**
 * Google Sheets Service
 * 
 * Handles all Google Sheets API operations for data storage.
 * Provides methods to read, write, and update data in Google Sheets.
 */

import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Google Sheets Service Class
 */
export class GoogleSheetsService {
  private sheets: any;
  private spreadsheetId: string;
  private auth: JWT;

  constructor() {
    this.spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '';
    
    // Initialize JWT auth with service account credentials
    this.auth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheets = google.sheets({ version: 'v4', auth: this.auth as any });
  }

  /**
   * Initialize the service by authenticating
   */
  async initialize(): Promise<void> {
    try {
      await this.auth.authorize();
      console.log('Google Sheets authentication successful');
    } catch (error) {
      console.error('Google Sheets authentication failed:', error);
      throw error;
    }
  }

  /**
   * Get all data from a sheet
   */
  async getSheetData(sheetName: string): Promise<any[][]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: sheetName,
      });

      return response.data.values || [];
    } catch (error) {
      console.error(`Failed to get data from sheet ${sheetName}:`, error);
      throw error;
    }
  }

  /**
   * Append a row to a sheet
   */
  async appendRow(sheetName: string, rowData: any[]): Promise<void> {
    try {
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: sheetName,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [rowData],
        },
      });
    } catch (error) {
      console.error(`Failed to append row to sheet ${sheetName}:`, error);
      throw error;
    }
  }

  /**
   * Update a specific row in a sheet
   */
  async updateRow(sheetName: string, rowIndex: number, rowData: any[]): Promise<void> {
    try {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A${rowIndex + 1}`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [rowData],
        },
      });
    } catch (error) {
      console.error(`Failed to update row in sheet ${sheetName}:`, error);
      throw error;
    }
  }

  /**
   * Find a row by matching a column value
   */
  async findRowByColumn(sheetName: string, columnIndex: number, value: string): Promise<number | null> {
    try {
      const data = await this.getSheetData(sheetName);
      
      for (let i = 0; i < data.length; i++) {
        if (data[i][columnIndex] === value) {
          return i;
        }
      }
      
      return null;
    } catch (error) {
      console.error(`Failed to find row in sheet ${sheetName}:`, error);
      throw error;
    }
  }

  /**
   * Delete a row from a sheet
   */
  async deleteRow(sheetName: string, rowIndex: number): Promise<void> {
    try {
      const batchSize = 100;
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        resource: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: await this.getSheetId(sheetName),
                  dimension: 'ROWS',
                  startIndex: rowIndex,
                  endIndex: rowIndex + 1,
                },
              },
            },
          ],
        },
      });
    } catch (error) {
      console.error(`Failed to delete row from sheet ${sheetName}:`, error);
      throw error;
    }
  }

  /**
   * Get sheet ID by name
   */
  private async getSheetId(sheetName: string): Promise<number> {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });

      const sheet = response.data.sheets?.find(
        (s: any) => s.properties.title === sheetName
      );

      return sheet?.properties.sheetId || 0;
    } catch (error) {
      console.error(`Failed to get sheet ID for ${sheetName}:`, error);
      throw error;
    }
  }

  /**
   * Create a new sheet if it doesn't exist
   */
  async createSheetIfNotExists(sheetName: string, headers: string[]): Promise<void> {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });

      const sheetExists = response.data.sheets?.some(
        (s: any) => s.properties.title === sheetName
      );

      if (!sheetExists) {
        await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId: this.spreadsheetId,
          resource: {
            requests: [
              {
                addSheet: {
                  properties: {
                    title: sheetName,
                  },
                },
              },
            ],
          },
        });

        // Add headers
        await this.sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: `${sheetName}!A1`,
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: [headers],
          },
        });

        console.log(`Created sheet: ${sheetName}`);
      }
    } catch (error) {
      console.error(`Failed to create sheet ${sheetName}:`, error);
      throw error;
    }
  }

  /**
   * Count rows in a sheet (excluding header)
   */
  async countRows(sheetName: string): Promise<number> {
    try {
      const data = await this.getSheetData(sheetName);
      return data.length > 0 ? data.length - 1 : 0;
    } catch (error) {
      console.error(`Failed to count rows in sheet ${sheetName}:`, error);
      throw error;
    }
  }
}
