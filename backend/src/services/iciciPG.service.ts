/**
 * ICICI Payment Gateway Service
 * 
 * Handles all ICICI PG API interactions:
 * - Initiate Sale (Standard/Redirection mode)
 * - Transaction Status check
 * - Refund processing
 * 
 * Reference: ICICI Bank Payment Gateway Interface Specification Document
 */

import axios, { AxiosResponse } from 'axios';
import {
  computeSecureHashV1,
  computeSecureHashV2,
  verifySecureHashV1,
  verifySecureHashV2,
  sanitizeMerchantTxnNo,
  formatAmount,
  formatTxnDate
} from './iciciHash.service';

// Environment configuration
const MERCHANT_ID = process.env.ICICI_PG_MERCHANT_ID as string;
const AGGREGATOR_ID = process.env.ICICI_PG_AGGREGATOR_ID as string;
const CURRENCY_CODE = process.env.ICICI_PG_CURRENCY_CODE?.trim().replace(/[^0-9]/g, '') || '356';
const ENV = process.env.ICICI_PG_ENV || 'UAT';

// Validate currency code is exactly 3 digits
if (CURRENCY_CODE.length !== 3 || !/^\d{3}$/.test(CURRENCY_CODE)) {
  console.error(`Invalid ICICI_PG_CURRENCY_CODE: "${process.env.ICICI_PG_CURRENCY_CODE}". Must be exactly 3 digits. Using default "356" for INR.`);
}

// API URLs based on environment
const BASE_URLS = {
  UAT: {
    INITIATE_SALE: 'https://pgpayuat.icicibank.com/tsp/pg/api/v2/initiateSale',
    COMMAND: 'https://pgpayuat.icicibank.com/tsp/pg/api/command',
    SETTLEMENT_DETAILS: 'https://pgpayuat.icicibank.com/tsp/pg/api/settlementDetails',
    GENERATE_QR: 'https://pgpayuat.icicibank.com/tsp/pg/api/generateQR',
    USER_CANCEL: 'https://pgpayuat.icicibank.com/tsp/pg/api/userCancel',
  },
  PRODUCTION: {
    INITIATE_SALE: 'https://pgpay.icicibank.com/pg/api/v2/initiateSale',
    COMMAND: 'https://pgpay.icicibank.com/pg/api/command',
    SETTLEMENT_DETAILS: 'https://pgpay.icicibank.com/pg/api/settlementDetails',
    GENERATE_QR: 'https://pgpay.icicibank.com/pg/api/generateQR',
    USER_CANCEL: 'https://pgpay.icicibank.com/pg/api/userCancel',
  }
};

const URLS = BASE_URLS[ENV as keyof typeof BASE_URLS] || BASE_URLS.UAT;

/**
 * Initiate Sale payload interface
 */
export interface InitiateSalePayload {
  merchantTxnNo: string;
  amount: number;
  customerEmailID: string;
  customerName?: string;
  customerMobileNo?: string;
  invoiceNo?: string;
  addlParam1?: string; // e.g., "anudan" or "bhog"
  addlParam2?: string; // e.g., puja day or category
}

/**
 * Initiate Sale response interface
 */
export interface InitiateSaleResponse {
  responseCode: string;
  redirectURI?: string;
  tranCtx?: string;
  showOTPCapturePage?: string;
  secureHash: string;
  merchantId?: string;
  aggregatorID?: string;
  merchantTxnNo?: string;
  raw?: any; // Full response for debugging
}

/**
 * Transaction Status response interface
 */
export interface TransactionStatusResponse {
  txnStatus: 'REQ' | 'SUC' | 'REJ' | 'ERR';
  txnResponseCode: string;
  txnID: string;
  paymentDateTime: string;
  txnAuthID?: string;
  amount: string;
  paymentMode?: string;
  secureHash: string;
  raw?: any;
}

/**
 * Refund response interface
 */
export interface RefundResponse {
  responseCode: string;
  respDescription: string;
  txnID: string;
  paymentDateTime?: string;
  txnAuthID?: string;
  secureHash: string;
  raw?: any;
}

/**
 * Payment callback payload interface (from ICICI returnURL POST)
 */
export interface PaymentCallbackPayload {
  responseCode: string;
  respDescription?: string;
  merchantId: string;
  merchantTxnNo: string;
  txnID: string;
  paymentDateTime: string;
  paymentID: string;
  paymentMode: string;
  amount: string;
  // ICICI fee breakdown fields (optional, depends on merchant config)
  convenienceFee?: string;
  serviceTax?: string;
  oth_charge?: string;
  secureHash: string;
  [key: string]: any; // Allow additional fields
}

export class IciciPGService {
  private returnURL: string;

  constructor() {
    // The returnURL must be set via environment variable - no fallback
    this.returnURL = process.env.ICICI_PG_RETURN_URL!;
    if (!this.returnURL) {
      throw new Error('ICICI_PG_RETURN_URL environment variable is not set');
    }
  }

  /**
   * Initiate Sale - Standard/Redirection Mode (payType = 0)
   * 
   * @param payload - Payment details
   * @returns Promise with redirectURI and tranCtx
   */
  async initiateSale(payload: InitiateSalePayload): Promise<InitiateSaleResponse> {
    const merchantTxnNo = sanitizeMerchantTxnNo(payload.merchantTxnNo);
    const amount = formatAmount(payload.amount);
    const txnDate = formatTxnDate();

    console.log('Sanitized merchantTxnNo:', merchantTxnNo, '(length:', merchantTxnNo.length, ')');
    console.log('Formatted amount:', amount);
    console.log('Currency code:', CURRENCY_CODE, '(length:', CURRENCY_CODE.length, ')');
    console.log('Merchant ID:', MERCHANT_ID, '(length:', MERCHANT_ID.length, ')');
    console.log('Aggregator ID:', AGGREGATOR_ID, '(length:', AGGREGATOR_ID.length, ')');

    // Build request payload
    const requestPayload: Record<string, unknown> = {
      merchantId: MERCHANT_ID,
      aggregatorID: AGGREGATOR_ID,
      merchantTxnNo,
      amount,
      currencyCode: CURRENCY_CODE,
      payType: '0', // Standard/Redirection mode
      customerEmailID: payload.customerEmailID,
      transactionType: 'SALE',
      returnURL: this.returnURL,
      txnDate,
    };

    console.log('ICICI Initiate Sale Request payload:', JSON.stringify(requestPayload, null, 2));

    // Add optional fields
    if (payload.customerName) requestPayload.customerName = payload.customerName;
    if (payload.customerMobileNo) requestPayload.customerMobileNo = payload.customerMobileNo;
    if (payload.invoiceNo) requestPayload.invoiceNo = payload.invoiceNo;
    if (payload.addlParam1) requestPayload.addlParam1 = payload.addlParam1;
    if (payload.addlParam2) requestPayload.addlParam2 = payload.addlParam2;

    // Compute secureHash
    requestPayload.secureHash = computeSecureHashV1(requestPayload);

    console.log('ICICI Initiate Sale Request payload:', JSON.stringify(requestPayload, null, 2));

    console.log('ICICI Initiate Sale Request:', {
      merchantId: MERCHANT_ID,
      aggregatorID: AGGREGATOR_ID,
      merchantTxnNo,
      amount,
      returnURL: this.returnURL,
    });

    try {
      const response: AxiosResponse = await axios.post(
        URLS.INITIATE_SALE,
        requestPayload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 second timeout
        }
      );

      const responseData = response.data;

      // Verify response hash
      const isValidHash = verifySecureHashV1(responseData, responseData.secureHash);
      if (!isValidHash) {
        console.error('ICICI Initiate Sale response hash verification failed', responseData);
        throw new Error('ICICI response hash verification failed');
      }

      // Check response code
      if (responseData.responseCode !== 'R1000') {
        console.error('ICICI Initiate Sale failed:', responseData);
        throw new Error(`ICICI Initiate Sale failed: ${responseData.responseCode}`);
      }

      // Ensure we're in Standard mode (not Seamless OTP capture)
      if (responseData.showOTPCapturePage === 'Y') {
        console.error('ICICI requested Seamless mode OTP capture, which is not implemented');
        throw new Error('ICICI requested Seamless mode (payType=1), but only Standard mode (payType=0) is implemented');
      }

      console.log('ICICI Initiate Sale Success:', {
        responseCode: responseData.responseCode,
        redirectURI: responseData.redirectURI,
        tranCtx: responseData.tranCtx,
      });

      return {
        responseCode: responseData.responseCode,
        redirectURI: responseData.redirectURI,
        tranCtx: responseData.tranCtx,
        showOTPCapturePage: responseData.showOTPCapturePage,
        secureHash: responseData.secureHash,
        merchantId: responseData.merchantId,
        aggregatorID: responseData.aggregatorID,
        merchantTxnNo: responseData.merchantTxnNo,
        raw: responseData,
      };
    } catch (error: any) {
      console.error('ICICI Initiate Sale API error:', error.response?.data || error.message);
      throw new Error(`ICICI Initiate Sale API error: ${error.message}`);
    }
  }

  /**
   * Check Transaction Status
   * 
   * @param merchantTxnNo - The merchant transaction number
   * @returns Promise with transaction status
   */
  async checkStatus(merchantTxnNo: string): Promise<TransactionStatusResponse> {
    const sanitizedTxnNo = sanitizeMerchantTxnNo(merchantTxnNo);

    const requestPayload: Record<string, unknown> = {
      merchantId: MERCHANT_ID,
      aggregatorID: AGGREGATOR_ID,
      merchantTxnNo: sanitizedTxnNo,
      originalTxnNo: sanitizedTxnNo,
      transactionType: 'STATUS',
    };

    // Compute secureHash
    requestPayload.secureHash = computeSecureHashV1(requestPayload);

    console.log('ICICI Transaction Status Request:', {
      merchantId: MERCHANT_ID,
      aggregatorID: AGGREGATOR_ID,
      merchantTxnNo: sanitizedTxnNo,
    });

    try {
      const response: AxiosResponse = await axios.post(
        URLS.COMMAND,
        new URLSearchParams(requestPayload as Record<string, string>),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 30000,
        }
      );

      const responseData = response.data;

      // Verify response hash
      const isValidHash = verifySecureHashV1(responseData, responseData.secureHash);
      if (!isValidHash) {
        console.error('ICICI Transaction Status response hash verification failed', responseData);
        throw new Error('ICICI response hash verification failed');
      }

      console.log('ICICI Transaction Status Response:', {
        txnStatus: responseData.txnStatus,
        txnResponseCode: responseData.txnResponseCode,
        txnID: responseData.txnID,
      });

      return {
        txnStatus: responseData.txnStatus,
        txnResponseCode: responseData.txnResponseCode,
        txnID: responseData.txnID,
        paymentDateTime: responseData.paymentDateTime,
        txnAuthID: responseData.txnAuthID,
        amount: responseData.amount,
        paymentMode: responseData.paymentMode,
        secureHash: responseData.secureHash,
        raw: responseData,
      };
    } catch (error: any) {
      console.error('ICICI Transaction Status API error:', error.response?.data || error.message);
      throw new Error(`ICICI Transaction Status API error: ${error.message}`);
    }
  }

  /**
   * Process Refund
   * 
   * @param originalTxnNo - The original transaction's txnID or merchantTxnNo
   * @param refundAmount - Amount to refund (0 for void)
   * @param newMerchantTxnNo - New unique reference for this refund request
   * @param addlParam1 - Optional additional parameter
   * @returns Promise with refund response
   */
  async refund(
    originalTxnNo: string,
    refundAmount: number,
    newMerchantTxnNo: string,
    addlParam1?: string
  ): Promise<RefundResponse> {
    const sanitizedNewTxnNo = sanitizeMerchantTxnNo(newMerchantTxnNo);
    const amount = formatAmount(refundAmount);

    const requestPayload: Record<string, unknown> = {
      merchantId: MERCHANT_ID,
      aggregatorID: AGGREGATOR_ID,
      merchantTxnNo: sanitizedNewTxnNo,
      originalTxnNo,
      amount,
      transactionType: 'REFUND',
    };

    if (addlParam1) {
      requestPayload.addlParam1 = addlParam1;
    }

    // Compute secureHash
    requestPayload.secureHash = computeSecureHashV1(requestPayload);

    console.log('ICICI Refund Request:', {
      merchantId: MERCHANT_ID,
      aggregatorID: AGGREGATOR_ID,
      merchantTxnNo: sanitizedNewTxnNo,
      originalTxnNo,
      amount,
    });

    try {
      const response: AxiosResponse = await axios.post(
        URLS.COMMAND,
        new URLSearchParams(requestPayload as Record<string, string>),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 30000,
        }
      );

      const responseData = response.data;

      // Verify response hash
      const isValidHash = verifySecureHashV1(responseData, responseData.secureHash);
      if (!isValidHash) {
        console.error('ICICI Refund response hash verification failed', responseData);
        throw new Error('ICICI response hash verification failed');
      }

      console.log('ICICI Refund Response:', {
        responseCode: responseData.responseCode,
        respDescription: responseData.respDescription,
        txnID: responseData.txnID,
      });

      return {
        responseCode: responseData.responseCode,
        respDescription: responseData.respDescription,
        txnID: responseData.txnID,
        paymentDateTime: responseData.paymentDateTime,
        txnAuthID: responseData.txnAuthID,
        secureHash: responseData.secureHash,
        raw: responseData,
      };
    } catch (error: any) {
      console.error('ICICI Refund API error:', error.response?.data || error.message);
      throw new Error(`ICICI Refund API error: ${error.message}`);
    }
  }

  /**
   * User Cancel - Mark transaction as user-cancelled on ICICI side
   * 
   * @param merchantTxnNo - The merchant transaction number
   */
  async userCancel(merchantTxnNo: string): Promise<void> {
    const sanitizedTxnNo = sanitizeMerchantTxnNo(merchantTxnNo);

    const requestPayload: Record<string, unknown> = {
      merchantId: MERCHANT_ID,
      aggregatorID: AGGREGATOR_ID,
      merchantTxnNo: sanitizedTxnNo,
      cancellationCode: '020',
      cancellationDesc: 'Cancel By User',
    };

    // Compute secureHash V2 (this API uses V2)
    const secureHash = computeSecureHashV2(requestPayload);

    console.log('ICICI User Cancel Request:', {
      merchantId: MERCHANT_ID,
      aggregatorID: AGGREGATOR_ID,
      merchantTxnNo: sanitizedTxnNo,
    });

    try {
      const response: AxiosResponse = await axios.post(
        URLS.USER_CANCEL,
        requestPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            'securehash': secureHash, // Header, not body
          },
          timeout: 30000,
        }
      );

      console.log('ICICI User Cancel Success:', response.data);
    } catch (error: any) {
      console.error('ICICI User Cancel API error:', error.response?.data || error.message);
      // Don't throw - this is optional and shouldn't block the flow
    }
  }

  /**
   * Verify payment callback from ICICI
   * 
   * @param callbackPayload - The POST body received from ICICI
   * @returns true if hash is valid, false otherwise
   */
  verifyCallback(callbackPayload: PaymentCallbackPayload): boolean {
    return verifySecureHashV1(callbackPayload, callbackPayload.secureHash);
  }

  /**
   * Check if payment was successful based on response code
   * 
   * @param responseCode - The response code from ICICI
   * @returns true if successful, false otherwise
   */
  isPaymentSuccessful(responseCode: string): boolean {
    return responseCode === '000' || responseCode === '0000';
  }
}

// Singleton instance
export const iciciPGService = new IciciPGService();
