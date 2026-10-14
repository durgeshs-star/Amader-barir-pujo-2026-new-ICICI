/**
 * Google Sheets Logging Service
 * 
 * Shared service for logging successful Anudan and Bhog payments to Google Sheets.
 * Used by both ICICI callback controller and reconciliation service.
 * 
 * Provides idempotent, retry-safe logging with duplicate prevention.
 */

import { GoogleSheetsService } from './GoogleSheetsService';

interface AnudanCategoryConfig {
  title: string;
}

const ANUDAN_CATEGORIES: AnudanCategoryConfig[] = [
  { title: 'Panchami' },
  { title: 'Soshti' },
  { title: 'Saptami' },
  { title: 'Ashtami' },
  { title: 'Sondhi Pujo' },
  { title: 'Navami' },
  { title: 'Dasami' },
  { title: 'Panchadin Anudan' },
];

const ANUDAN_HEADERS = [
  'Customer Name',
  'Mobile Number',
  'Email',
  'Base Amount (₹)',
  'Gateway Charges (₹)',
  'Actual Amount Paid (₹)',
  'Payment Status',
  'Transaction ID',
  'Order ID',
  'Timestamp',
];

const ANUDAN_COL = {
  BASE_AMOUNT: 3,
  GATEWAY_CHARGES: 4,
  ACTUAL_AMOUNT: 5,
  PAYMENT_STATUS: 6,
  TRANSACTION_ID: 7,
  ORDER_ID: 8,
};

const BHOG_HEADERS = [
  'Customer Name',
  'Mobile Number',
  'Email',
  'Pandal Bhog Plates',
  'Senior Citizen Plates',
  'Packed Bhog Plates',
  'Children 0-5 Plates',
  'Total Plates',
  'Base Amount (₹)',
  'Gateway Charges (₹)',
  'Actual Amount Paid (₹)',
  'Payment Status',
  'Transaction ID',
  'Order ID',
  'Timestamp',
];

const BHOG_COL = {
  PANDAL_BHOG: 3,
  SENIOR_CITIZEN: 4,
  PACKED_BHOG: 5,
  CHILDREN_0_5: 6,
  TOTAL_PLATES: 7,
  BASE_AMOUNT: 8,
  GATEWAY_CHARGES: 9,
  ACTUAL_AMOUNT: 10,
  PAYMENT_STATUS: 11,
  TRANSACTION_ID: 12,
  ORDER_ID: 13,
};

const RECEIPTS_RECORDS_HEADERS = [
  'Transaction ID',
  'Record ID',
  'Name',
  'Mobile Number',
];

const RECEIPTS_RECORDS_COL = {
  TRANSACTION_ID: 0,
  RECORD_ID: 1,
  NAME: 2,
  MOBILE_NUMBER: 3,
};

interface AnudanTableBlock {
  titleRowIndex: number;
  headerRowIndex: number;
  totalRowIndex: number;
  numColumns: number;
}

interface AnudanAllocation {
  day: string;
  base: number;
  gateway: number;
  actual: number;
}

export class GoogleSheetsLoggingService {
  private sheetsService: GoogleSheetsService;
  private readonly ANUDAN_SHEET_NAME = 'Anudan Contributions';
  private readonly BHOG_SHEET_NAME = 'Bhog Contributions';
  private readonly RECEIPTS_RECORDS_SHEET_NAME = 'Receipts Records';

  constructor(sheetsService: GoogleSheetsService) {
    this.sheetsService = sheetsService;
  }

  /**
   * Log Anudan payment to Google Sheets
   * Idempotent: checks for existing transactionId/orderId before inserting
   */
  async logAnudanPayment(payment: any): Promise<{ success: boolean; alreadyExists: boolean; error?: string }> {
    const txId = payment?.transactionId || 'N/A';
    const orderId = payment?.orderId || 'N/A';
    const prefix = `[ANUDAN SHEETS] [tx:${txId}|ord:${orderId}]`;
    let written = false;
    let alreadyExists = false;

    try {
      console.log(`${prefix} Starting Anudan Google Sheets logging...`);

      await this.sheetsService.initialize();
      console.log(`${prefix} Google Sheets initialization success`);

      await this.ensureAnudanSheetStructure();
      console.log(`${prefix} Sheet structure verification complete for "${this.ANUDAN_SHEET_NAME}"`);

      const allocations = this.allocateAnudanAmounts(payment);
      console.log(`${prefix} Allocations calculated:`, JSON.stringify(allocations));

      for (const alloc of allocations) {
        const config = this.getAnudanCategoryConfig(alloc.day);
        if (!config) {
          const error = `No Anudan category config found for day/category "${alloc.day}" (tx: ${txId}, ord: ${orderId})`;
          console.error(`${prefix} ${error}`);
          return { success: false, alreadyExists: false, error };
        }

        console.log(`${prefix} Category being processed: "${alloc.day}" (title: "${config.title}")`);

        const block = await this.findAnudanCategoryBlock(config.title);
        if (!block) {
          const error = `Could not locate table block for Anudan category "${config.title}" in sheet "${this.ANUDAN_SHEET_NAME}" (tx: ${txId}, ord: ${orderId})`;
          console.error(`${prefix} ${error}`);
          return { success: false, alreadyExists: false, error };
        }

        // Duplicate check: check if transactionId / orderId is already present in this category block
        const existingData = await this.sheetsService.getSheetData(this.ANUDAN_SHEET_NAME);
        let isDuplicate = false;
        for (let i = block.headerRowIndex + 1; i < block.totalRowIndex; i++) {
          const rowTxId = existingData[i]?.[ANUDAN_COL.TRANSACTION_ID];
          const rowOrderId = existingData[i]?.[ANUDAN_COL.ORDER_ID];
          if (
            (payment.transactionId && rowTxId === payment.transactionId) ||
            (payment.orderId && rowOrderId === payment.orderId)
          ) {
            isDuplicate = true;
            break;
          }
        }

        if (isDuplicate) {
          console.log(
            `${prefix} Transaction ${txId} / Order ${orderId} already present in table for "${config.title}". Skipping duplicate insertion.`
          );
          alreadyExists = true;
          continue;
        }

        console.log(`${prefix} Target row index for insertion: ${block.totalRowIndex}`);

        const rowData = [
          payment.userInfo?.name || '',
          payment.userInfo?.phone || '',
          payment.userInfo?.email || '',
          alloc.base,
          alloc.gateway,
          alloc.actual,
          'Paid',
          payment.transactionId,
          payment.orderId,
          payment.timestamp,
        ];

        console.log(`${prefix} Row data prepared:`, JSON.stringify(rowData));

        await this.sheetsService.insertRowAt(this.ANUDAN_SHEET_NAME, block.totalRowIndex, rowData);
        console.log(`${prefix} Successful insertion at row index ${block.totalRowIndex} for category "${config.title}"`);

        await this.sheetsService.formatCellsBold(this.ANUDAN_SHEET_NAME, block.totalRowIndex, [ANUDAN_COL.ACTUAL_AMOUNT]);
        console.log(`${prefix} Formatting completion for amount cell at row index ${block.totalRowIndex}`);

        await this.recalculateAnudanCategoryTotal(config);
        console.log(`${prefix} Total recalculation complete for category "${config.title}"`);

        written = true;
      }

      console.log(`${prefix} Final completion of Anudan Google Sheets logging`);
      return { success: written, alreadyExists };
    } catch (sheetsError: any) {
      const error = sheetsError?.message || String(sheetsError);
      console.error(`${prefix} Google Sheets logging failed:`, error);
      if (sheetsError?.stack) {
        console.error(`${prefix} Stack trace:`, sheetsError.stack);
      }
      return { success: false, alreadyExists, error };
    }
  }

  /**
   * Log Bhog payment to Google Sheets
   * Idempotent: checks for existing transactionId/orderId before inserting
   */
  async logBhogPayment(payment: any): Promise<{ success: boolean; alreadyExists: boolean; error?: string }> {
    const txId = payment?.transactionId || 'N/A';
    const orderId = payment?.orderId || 'N/A';
    const prefix = `[BHOG SHEETS] [tx:${txId}|ord:${orderId}]`;
    let written = false;
    let alreadyExists = false;

    try {
      console.log(`${prefix} Starting Bhog Google Sheets logging...`);

      await this.sheetsService.initialize();
      console.log(`${prefix} Google Sheets initialization success`);

      await this.ensureBhogSheetStructure();
      console.log(`${prefix} Sheet structure verification complete for "${this.BHOG_SHEET_NAME}"`);

      const allocations = this.allocateBhogAmounts(payment);
      console.log(`${prefix} Allocations calculated:`, JSON.stringify(allocations));

      // Check for existing entry (duplicate prevention)
      const existingData = await this.sheetsService.getSheetData(this.BHOG_SHEET_NAME);
      const totalRowIndex = existingData.length;
      let isDuplicate = false;
      for (let i = 1; i < totalRowIndex; i++) {
        const rowTxId = existingData[i]?.[BHOG_COL.TRANSACTION_ID];
        const rowOrderId = existingData[i]?.[BHOG_COL.ORDER_ID];
        if (
          (payment.transactionId && rowTxId === payment.transactionId) ||
          (payment.orderId && rowOrderId === payment.orderId)
        ) {
          isDuplicate = true;
          break;
        }
      }

      if (isDuplicate) {
        console.log(`${prefix} Transaction ${txId} / Order ${orderId} already present in Bhog sheet. Skipping duplicate insertion.`);
        return { success: false, alreadyExists: true };
      }

      for (const alloc of allocations) {
        const quantities = this.extractBhogQuantities(alloc.categories || []);
        const rowData = [
          payment.userInfo?.name || '',
          payment.userInfo?.phone || '',
          payment.userInfo?.email || '',
          quantities.pandalBhog,
          quantities.seniorCitizen,
          quantities.packedBhog,
          quantities.children05,
          alloc.quantity,
          alloc.base,
          alloc.gateway,
          alloc.actual,
          'Paid',
          payment.transactionId,
          payment.orderId,
          payment.timestamp,
        ];

        console.log(`${prefix} Row data prepared for ${alloc.day}:`, JSON.stringify(rowData));

        await this.sheetsService.appendRow(this.BHOG_SHEET_NAME, rowData);
        console.log(`${prefix} Successful append for ${alloc.day}`);
        written = true;
      }

      // Recalculate Bhog TOTAL row
      await this.recalculateBhogTotal();
      console.log(`${prefix} Bhog TOTAL recalculation complete`);

      console.log(`${prefix} Final completion of Bhog Google Sheets logging`);
      return { success: written, alreadyExists };
    } catch (sheetsError: any) {
      const error = sheetsError?.message || String(sheetsError);
      console.error(`${prefix} Google Sheets logging failed:`, error);
      if (sheetsError?.stack) {
        console.error(`${prefix} Stack trace:`, sheetsError.stack);
      }
      return { success: false, alreadyExists: false, error };
    }
  }

  /**
   * Log reconciled payment to Receipts Records tab
   * Called when ICICI reconciliation verifies a pending/abandoned payment as successful
   * Idempotent: checks for existing transaction ID + record ID before inserting
   */
  async logReconciledPayment(
    paymentType: 'Anudan' | 'Bhog',
    payment: any,
    originalStatus: string,
    notes?: string
  ): Promise<{ success: boolean; alreadyExists: boolean; error?: string }> {
    const txId = payment?.transactionId || 'N/A';
    const recordId = payment?._id?.toString() || 'N/A';
    const prefix = `[RECEIPTS RECORDS] [${paymentType}] [tx:${txId}|rec:${recordId}]`;

    try {
      console.log(`${prefix} Starting Receipts Records logging...`);

      await this.sheetsService.initialize();
      console.log(`${prefix} Google Sheets initialization success`);

      await this.ensureReceiptsRecordsSheetStructure();
      console.log(`${prefix} Sheet structure verification complete for "${this.RECEIPTS_RECORDS_SHEET_NAME}"`);

      // Check for existing entry (duplicate prevention)
      const existingData = await this.sheetsService.getSheetData(this.RECEIPTS_RECORDS_SHEET_NAME);
      let isDuplicate = false;
      for (let i = 1; i < existingData.length; i++) {
        const rowTxId = existingData[i]?.[RECEIPTS_RECORDS_COL.TRANSACTION_ID];
        const rowRecordId = existingData[i]?.[RECEIPTS_RECORDS_COL.RECORD_ID];
        
        // Match on transaction ID + record ID for duplicate prevention
        if (rowTxId === txId && rowRecordId === recordId) {
          isDuplicate = true;
          break;
        }
      }

      if (isDuplicate) {
        console.log(`${prefix} Payment ${paymentType} ${txId} / Record ${recordId} already present in Receipts Records. Skipping duplicate insertion.`);
        return { success: false, alreadyExists: true };
      }

      const rowData = [
        txId,
        recordId,
        payment.userInfo?.name || '',
        payment.userInfo?.phone || '',
      ];

      console.log(`${prefix} Row data prepared:`, JSON.stringify(rowData));

      await this.sheetsService.appendRow(this.RECEIPTS_RECORDS_SHEET_NAME, rowData);
      console.log(`${prefix} Successful append to Receipts Records`);

      console.log(`${prefix} Final completion of Receipts Records logging`);
      return { success: true, alreadyExists: false };
    } catch (sheetsError: any) {
      const error = sheetsError?.message || String(sheetsError);
      console.error(`${prefix} Receipts Records logging failed:`, error);
      if (sheetsError?.stack) {
        console.error(`${prefix} Stack trace:`, sheetsError.stack);
      }
      return { success: false, alreadyExists: false, error };
    }
  }

  // -------------------------------------------------------------------------
  // Private helper methods
  // -------------------------------------------------------------------------

  private getAnudanCategoryConfig(day: string): AnudanCategoryConfig | undefined {
    return ANUDAN_CATEGORIES.find((c) => 
      c.title.toLowerCase() === day.toLowerCase() || 
      day.toLowerCase().includes(c.title.toLowerCase())
    );
  }

  private allocateAnudanAmounts(payment: any): AnudanAllocation[] {
    const categories = payment.categories || [];
    const totalBase = categories.reduce((sum: number, cat: any) => sum + (Number(cat.amount) || 0), 0);
    const totalGateway = payment.gatewayCharges || 0;
    const totalActual = payment.actualAmountCharged || payment.totalAmount || (totalBase + totalGateway);

    return categories.map((cat: any) => {
      const base = Number(cat.amount) || 0;
      const gateway = totalBase > 0 ? (base / totalBase) * totalGateway : 0;
      const actual = base + gateway;
      return {
        day: cat.day,
        base: Math.round(base * 100) / 100,
        gateway: Math.round(gateway * 100) / 100,
        actual: Math.round(actual * 100) / 100,
      };
    });
  }

  private async ensureAnudanSheetStructure(): Promise<void> {
    await this.sheetsService.createSheetIfNotExists(this.ANUDAN_SHEET_NAME, ANUDAN_HEADERS);
    await this.sheetsService.formatHeaderRowAt(this.ANUDAN_SHEET_NAME, ANUDAN_HEADERS.length);
  }

  private async ensureBhogSheetStructure(): Promise<void> {
    await this.sheetsService.createSheetIfNotExists(this.BHOG_SHEET_NAME, BHOG_HEADERS);
    await this.sheetsService.formatHeaderRowAt(this.BHOG_SHEET_NAME, BHOG_HEADERS.length);
  }

  private async ensureReceiptsRecordsSheetStructure(): Promise<void> {
    await this.sheetsService.createSheetIfNotExists(this.RECEIPTS_RECORDS_SHEET_NAME, RECEIPTS_RECORDS_HEADERS);
    await this.sheetsService.formatHeaderRowAt(this.RECEIPTS_RECORDS_SHEET_NAME, RECEIPTS_RECORDS_HEADERS.length);
    
    // Only update header if sheet is empty (no data rows) to preserve existing data
    const existingData = await this.sheetsService.getSheetData(this.RECEIPTS_RECORDS_SHEET_NAME);
    if (existingData.length === 1 && existingData[0].length !== RECEIPTS_RECORDS_HEADERS.length) {
      console.log(`[RECEIPTS RECORDS] Updating header row from ${existingData[0].length} to ${RECEIPTS_RECORDS_HEADERS.length} columns (sheet is empty)`);
      // Update only cells A1:D1 to preserve any existing data beyond column D
      await this.sheetsService.updateRow(this.RECEIPTS_RECORDS_SHEET_NAME, 0, RECEIPTS_RECORDS_HEADERS);
      await this.sheetsService.formatHeaderRowAt(this.RECEIPTS_RECORDS_SHEET_NAME, RECEIPTS_RECORDS_HEADERS.length);
    } else if (existingData.length > 1) {
      console.log(`[RECEIPTS RECORDS] Sheet has ${existingData.length - 1} data rows with existing headers. Preserving existing data and headers.`);
    }
  }

  private async findAnudanCategoryBlock(title: string): Promise<AnudanTableBlock | null> {
    const data = await this.sheetsService.getSheetData(this.ANUDAN_SHEET_NAME);
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === title) {
        const headerRowIndex = i + 1;
        const numColumns = (data[headerRowIndex] || []).length;
        for (let j = headerRowIndex + 1; j < data.length; j++) {
          if (data[j][0] === 'TOTAL') {
            return { titleRowIndex: i, headerRowIndex, totalRowIndex: j, numColumns };
          }
          if (ANUDAN_CATEGORIES.some((c) => c.title === data[j][0])) break;
        }
      }
    }
    return null;
  }

  private async recalculateAnudanCategoryTotal(config: AnudanCategoryConfig): Promise<void> {
    const block = await this.findAnudanCategoryBlock(config.title);
    if (!block) return;

    const data = await this.sheetsService.getSheetData(this.ANUDAN_SHEET_NAME);

    let totalActual = 0;
    for (let i = block.headerRowIndex + 1; i < block.totalRowIndex; i++) {
      totalActual += parseFloat(data[i]?.[ANUDAN_COL.ACTUAL_AMOUNT]) || 0;
    }

    const summaryRow = new Array(block.numColumns).fill('');
    summaryRow[0] = 'TOTAL';
    summaryRow[ANUDAN_COL.ACTUAL_AMOUNT] = totalActual;

    await this.sheetsService.updateRow(this.ANUDAN_SHEET_NAME, block.totalRowIndex, summaryRow);
    await this.sheetsService.formatRowBold(this.ANUDAN_SHEET_NAME, block.totalRowIndex, block.numColumns);
    await this.sheetsService.formatCellsBold(this.ANUDAN_SHEET_NAME, block.totalRowIndex, [ANUDAN_COL.ACTUAL_AMOUNT]);
  }

  private extractBhogQuantities(categories: any[]): {
    pandalBhog: number;
    seniorCitizen: number;
    packedBhog: number;
    children05: number;
  } {
    const quantities = {
      pandalBhog: 0,
      seniorCitizen: 0,
      packedBhog: 0,
      children05: 0
    };

    if (!Array.isArray(categories)) return quantities;

    for (const category of categories) {
      const id = String(category.id || '').toLowerCase();
      const quantity = Number(category.quantity) || 0;

      if (id === 'bhog-booking') {
        quantities.pandalBhog = quantity;
      } else if (id === 'bhog-booking-senior' || id.includes('senior')) {
        quantities.seniorCitizen = quantity;
      } else if (id === 'packed-bhog') {
        quantities.packedBhog = quantity;
      } else if (id === 'children-0-5' || id.includes('children05')) {
        quantities.children05 = quantity;
      }
    }

    return quantities;
  }

  private allocateBhogAmounts(payment: any): Array<{
    day: string;
    dayKey?: string;
    categories: any[];
    quantity: number;
    base: number;
    gateway: number;
    actual: number;
  }> {
    const bookings = (payment.bookings && payment.bookings.length > 0)
      ? payment.bookings
      : [{
          day: payment.categories?.[0]?.day || payment.categories?.[0]?.title || 'General Bhog',
          categories: payment.categories || [],
          quantity: (payment.categories || []).reduce((sum: number, c: any) => sum + (Number(c.quantity) || 0), 0),
          amount: payment.baseAmount || payment.totalAmount || 0,
        }];

    const totalBase = payment.baseAmount || bookings.reduce((sum: number, b: any) => {
      const bCats = b.categories || [];
      const bBase = bCats.length > 0
        ? bCats.reduce((catSum: number, c: any) => catSum + ((Number(c.price) || 0) * (Number(c.quantity) || 0)), 0)
        : (Number(b.amount) || 0);
      return sum + bBase;
    }, 0);

    const totalGateway = payment.gatewayCharges || 0;
    const totalActual = payment.actualAmountCharged || payment.totalAmount || (totalBase + totalGateway);

    const result: Array<{
      day: string;
      dayKey?: string;
      categories: any[];
      quantity: number;
      base: number;
      gateway: number;
      actual: number;
    }> = [];

    let allocatedGateway = 0;
    let allocatedActual = 0;

    bookings.forEach((booking: any, index: number) => {
      const bCats = booking.categories && booking.categories.length > 0
        ? booking.categories
        : (payment.categories || []).filter((c: any) => !c.day || c.day === booking.day);

      const base = bCats.length > 0
        ? bCats.reduce((sum: number, c: any) => sum + ((Number(c.price) || 0) * (Number(c.quantity) || 0)), 0)
        : (Number(booking.amount) || 0);

      const gateway = totalBase > 0 ? (base / totalBase) * totalGateway : 0;
      const actual = base + gateway;

      // Round to last booking to account for rounding errors
      const isLast = index === bookings.length - 1;
      const finalGateway = isLast ? totalGateway - allocatedGateway : gateway;
      const finalActual = isLast ? totalActual - allocatedActual : actual;

      result.push({
        day: booking.day,
        dayKey: booking.dayKey,
        categories: bCats,
        quantity: booking.quantity,
        base: Math.round(base * 100) / 100,
        gateway: Math.round(finalGateway * 100) / 100,
        actual: Math.round(finalActual * 100) / 100,
      });

      allocatedGateway += finalGateway;
      allocatedActual += finalActual;
    });

    return result;
  }

  private async recalculateBhogTotal(): Promise<void> {
    const data = await this.sheetsService.getSheetData(this.BHOG_SHEET_NAME);
    const totalRowIndex = data.length;

    let totalActual = 0;
    for (let i = 1; i < totalRowIndex; i++) {
      totalActual += parseFloat(data[i]?.[BHOG_COL.ACTUAL_AMOUNT]) || 0;
    }

    const totalRow = new Array(BHOG_HEADERS.length).fill('');
    totalRow[0] = 'TOTAL';
    totalRow[BHOG_COL.ACTUAL_AMOUNT] = totalActual;

    await this.sheetsService.updateRow(this.BHOG_SHEET_NAME, totalRowIndex, totalRow);
    await this.sheetsService.formatRowBold(this.BHOG_SHEET_NAME, totalRowIndex, BHOG_HEADERS.length);
    await this.sheetsService.formatCellsBold(this.BHOG_SHEET_NAME, totalRowIndex, [BHOG_COL.TOTAL_PLATES, BHOG_COL.ACTUAL_AMOUNT]);
  }
}
