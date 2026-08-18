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
   * Append multiple rows to a sheet in a single API call
   */
  async appendRows(sheetName: string, rows: any[][]): Promise<void> {
    try {
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: sheetName,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: rows,
        },
      });
    } catch (error) {
      console.error(`Failed to append rows to sheet ${sheetName}:`, error);
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
   * Insert a single blank row at the given 0-based row index, shifting
   * everything at/after that index down by one. Does not touch values.
   */
  async insertBlankRowAt(sheetName: string, rowIndex: number): Promise<void> {
    try {
      const sheetId = await this.getSheetId(sheetName);
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        resource: {
          requests: [
            {
              insertDimension: {
                range: {
                  sheetId,
                  dimension: 'ROWS',
                  startIndex: rowIndex,
                  endIndex: rowIndex + 1,
                },
                inheritFromBefore: false,
              },
            },
          ],
        },
      });
    } catch (error) {
      console.error(`Failed to insert blank row in sheet ${sheetName}:`, error);
      throw error;
    }
  }

  /**
   * Insert a row of data at a specific 0-based row index, shifting existing
   * rows at/after that index down by one first. Use this instead of
   * appendRow whenever a row must land ABOVE existing content (e.g. above a
   * running TOTAL row) rather than at the very bottom of the sheet.
   */
  async insertRowAt(sheetName: string, rowIndex: number, rowData: any[]): Promise<void> {
    await this.insertBlankRowAt(sheetName, rowIndex);
    await this.updateRow(sheetName, rowIndex, rowData);
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

  // ---------------------------------------------------------------------
  // Formatting helpers (new)
  // ---------------------------------------------------------------------

  /**
   * Bold + background-colour a header row at the given 0-based row index
   * (defaults to row 0). Safe to call repeatedly — it just re-applies
   * the same formatting.
   */
  async formatHeaderRowAt(sheetName: string, numColumns: number, rowIndex: number = 0): Promise<void> {
    try {
      const sheetId = await this.getSheetId(sheetName);
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        resource: {
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId,
                  startRowIndex: rowIndex,
                  endRowIndex: rowIndex + 1,
                  startColumnIndex: 0,
                  endColumnIndex: numColumns,
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: { red: 0.80, green: 0.88, blue: 0.97 },
                    textFormat: { bold: true },
                    horizontalAlignment: 'CENTER',
                    wrapStrategy: 'WRAP',
                  },
                },
                fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,wrapStrategy)',
              },
            },
          ],
        },
      });
    } catch (error) {
      console.error(`Failed to format header row in sheet ${sheetName}:`, error);
      // Non-critical — never throw for cosmetic formatting
    }
  }

  /** Bold every cell in a row across the given number of columns (e.g. a TOTAL row). */
  async formatRowBold(sheetName: string, rowIndex: number, numColumns: number): Promise<void> {
    try {
      const sheetId = await this.getSheetId(sheetName);
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        resource: {
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId,
                  startRowIndex: rowIndex,
                  endRowIndex: rowIndex + 1,
                  startColumnIndex: 0,
                  endColumnIndex: numColumns,
                },
                cell: { userEnteredFormat: { textFormat: { bold: true } } },
                fields: 'userEnteredFormat.textFormat.bold',
              },
            },
          ],
        },
      });
    } catch (error) {
      console.error(`Failed to bold row in sheet ${sheetName}:`, error);
    }
  }

  /** Bold specific cells (by 0-based column index) within a single row. */
  async formatCellsBold(sheetName: string, rowIndex: number, columnIndexes: number[]): Promise<void> {
    if (columnIndexes.length === 0) return;
    try {
      const sheetId = await this.getSheetId(sheetName);
      const requests = columnIndexes.map((colIndex) => ({
        repeatCell: {
          range: {
            sheetId,
            startRowIndex: rowIndex,
            endRowIndex: rowIndex + 1,
            startColumnIndex: colIndex,
            endColumnIndex: colIndex + 1,
          },
          cell: { userEnteredFormat: { textFormat: { bold: true } } },
          fields: 'userEnteredFormat.textFormat.bold',
        },
      }));
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        resource: { requests },
      });
    } catch (error) {
      console.error(`Failed to bold cells in sheet ${sheetName}:`, error);
    }
  }

  /**
   * Merge a row across numColumns and style it as a section/category title
   * (bold, larger, warm background) — used for the Anudan per-category
   * table headers.
   */
  async formatCategoryTitleRow(sheetName: string, rowIndex: number, numColumns: number): Promise<void> {
    try {
      const sheetId = await this.getSheetId(sheetName);
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        resource: {
          requests: [
            {
              mergeCells: {
                range: {
                  sheetId,
                  startRowIndex: rowIndex,
                  endRowIndex: rowIndex + 1,
                  startColumnIndex: 0,
                  endColumnIndex: numColumns,
                },
                mergeType: 'MERGE_ALL',
              },
            },
            {
              repeatCell: {
                range: {
                  sheetId,
                  startRowIndex: rowIndex,
                  endRowIndex: rowIndex + 1,
                  startColumnIndex: 0,
                  endColumnIndex: numColumns,
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: { red: 0.98, green: 0.90, blue: 0.71 },
                    textFormat: { bold: true, fontSize: 12 },
                    horizontalAlignment: 'CENTER',
                  },
                },
                fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
              },
            },
          ],
        },
      });
    } catch (error) {
      console.error(`Failed to format category title row in sheet ${sheetName}:`, error);
    }
  }

  /** Thin border around a rectangular block of rows/columns — used to make each Anudan table read as a distinct card. */
  async formatTableBorder(
    sheetName: string,
    startRowIndex: number,
    endRowIndex: number,
    numColumns: number
  ): Promise<void> {
    try {
      const sheetId = await this.getSheetId(sheetName);
      const border = { style: 'SOLID', width: 1, color: { red: 0.6, green: 0.6, blue: 0.6 } };
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        resource: {
          requests: [
            {
              updateBorders: {
                range: {
                  sheetId,
                  startRowIndex,
                  endRowIndex,
                  startColumnIndex: 0,
                  endColumnIndex: numColumns,
                },
                top: border,
                bottom: border,
                left: border,
                right: border,
                innerHorizontal: border,
                innerVertical: border,
              },
            },
          ],
        },
      });
    } catch (error) {
      console.error(`Failed to draw table border in sheet ${sheetName}:`, error);
    }
  }
}