/**
 * ICICI Reconciliation Service Tests
 *
 * Tests for the three defect fixes:
 * Fix 1: Notification retry for successful payments (no age limit)
 * Fix 2: Exact integer comparison in paise (no tolerance)
 * Fix 3: Backlog processing for older payments
 */

// Mock bhogWhatsAppFormatter - must be before imports
jest.mock('../utils/bhogWhatsAppFormatter', () => ({
  formatBhogBookingDetails: jest.fn().mockReturnValue('Mock booking details'),
}));

// Mock dependencies
jest.mock('../models/AnudanPayment');
jest.mock('../models/BhogPayment');
jest.mock('./iciciPG.service');
jest.mock('./EmailService');
jest.mock('./WhatsAppService');
jest.mock('./anudanState.service', () => ({
  anudanStateService: {
    tryReserve: jest.fn().mockResolvedValue({ ok: true, remaining: 5000 }),
    broadcast: jest.fn(),
    initialize: jest.fn().mockResolvedValue(undefined),
  },
}));
jest.mock('./GoogleSheetsService');
jest.mock('./GoogleSheetsLoggingService', () => ({
  GoogleSheetsLoggingService: jest.fn().mockImplementation(() => ({
    logAnudanPayment: jest.fn().mockResolvedValue({ success: true, alreadyExists: false }),
    logBhogPayment: jest.fn().mockResolvedValue({ success: true, alreadyExists: false }),
  })),
}));

// Set environment variables before importing
process.env.NODE_ENV = 'test';
process.env.ICICI_PG_RETURN_URL = 'http://localhost:3000/callback';
process.env.ICICI_PG_MERCHANT_ID = 'TEST_MERCHANT';
process.env.ICICI_PG_AGGREGATOR_ID = 'TEST_AGGREGATOR';
process.env.ICICI_PG_SECRET_KEY = 'test_secret_key';
process.env.ICICI_PG_CURRENCY_CODE = '356';
process.env.ICICI_PG_ENV = 'UAT';

import { ICICIReconciliationService } from './ICICIReconciliationService';
import { AnudanPayment } from '../models/AnudanPayment';
import { BhogPayment } from '../models/BhogPayment';
import { iciciPGService } from './iciciPG.service';
import { EmailService } from './EmailService';
import { whatsAppService } from './WhatsAppService';
import { anudanStateService } from './anudanState.service';
import mongoose from 'mongoose';

describe('ICICIReconciliationService', () => {
  let service: ICICIReconciliationService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ICICIReconciliationService();
  });

  afterEach(() => {
    service.stop();
  });

  describe('Fix 1: Notification retry for successful payments', () => {
    it('should retry notifications for successful Anudan payments regardless of age', async () => {
      // Create a successful payment older than cutoff time with missing notifications
      const oldDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      const mockPayment = {
        _id: new mongoose.Types.ObjectId(),
        transactionId: 'TXN-123',
        paymentStatus: 'success',
        createdAt: oldDate,
        whatsappNotificationSent: false,
        emailNotificationSent: false,
        userInfo: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '919876543210',
        },
        categories: [{ day: 'Sasthi', amount: 1000 }],
        totalAmount: 1000,
        orderId: 'ORD-123',
        timestamp: '2026-10-12',
        save: jest.fn().mockResolvedValue(true),
      };

      (AnudanPayment.find as jest.Mock).mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([mockPayment]),
        }),
      });
      (AnudanPayment.countDocuments as jest.Mock).mockResolvedValue(1);
      (AnudanPayment.updateOne as jest.Mock).mockResolvedValue({ matchedCount: 1 });

      // Mock successful email and WhatsApp sends
      (EmailService.prototype.sendAnudanConfirmationEmail as jest.Mock).mockResolvedValue(undefined);
      (whatsAppService.sendAnudanConfirmation as jest.Mock).mockResolvedValue(undefined);

      const cutoffTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

      // Call the retry notification method
      await (service as any).retryAnudanNotifications(cutoffTime, {
        emailSent: 0,
        whatsappSent: 0,
        emailFailed: 0,
        whatsappFailed: 0,
        errors: [],
      } as any);

      // Verify that the old payment was queried without cutoff time filter
      expect(AnudanPayment.countDocuments).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentStatus: 'success',
          $or: expect.any(Array),
        })
      );

      // Verify NOT expecting createdAt filter (this is the key fix)
      const queryArg = (AnudanPayment.countDocuments as jest.Mock).mock.calls[0][0];
      expect(queryArg.createdAt).toBeUndefined();

      // Verify notifications were sent
      expect(EmailService.prototype.sendAnudanConfirmationEmail).toHaveBeenCalled();
      expect(whatsAppService.sendAnudanConfirmation).toHaveBeenCalled();
    });

    it('should retry notifications for successful Bhog payments regardless of age', async () => {
      const oldDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const mockPayment = {
        _id: new mongoose.Types.ObjectId(),
        transactionId: 'TXN-456',
        paymentStatus: 'success',
        createdAt: oldDate,
        whatsappNotificationSent: false,
        emailNotificationSent: false,
        userInfo: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '919876543210',
        },
        bookings: [{ day: 'Sasthi', quantity: 2 }],
        totalAmount: 500,
        orderId: 'ORD-456',
        save: jest.fn().mockResolvedValue(true),
      };

      (BhogPayment.find as jest.Mock).mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([mockPayment]),
        }),
      });
      (BhogPayment.countDocuments as jest.Mock).mockResolvedValue(1);
      (BhogPayment.updateOne as jest.Mock).mockResolvedValue({ matchedCount: 1 });

      (EmailService.prototype.sendBhogConfirmationEmail as jest.Mock).mockResolvedValue(undefined);
      (whatsAppService.sendBhogBookingConfirmation as jest.Mock).mockResolvedValue(undefined);

      const cutoffTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      await (service as any).retryBhogNotifications(cutoffTime, {
        emailSent: 0,
        whatsappSent: 0,
        emailFailed: 0,
        whatsappFailed: 0,
        errors: [],
      } as any);

      const queryArg = (BhogPayment.countDocuments as jest.Mock).mock.calls[0][0];
      expect(queryArg.createdAt).toBeUndefined();
      expect(EmailService.prototype.sendBhogConfirmationEmail).toHaveBeenCalled();
      expect(whatsAppService.sendBhogBookingConfirmation).toHaveBeenCalled();
    });

    it('should prevent duplicate notifications using atomic updates', async () => {
      const mockPayment = {
        _id: new mongoose.Types.ObjectId(),
        transactionId: 'TXN-789',
        paymentStatus: 'success',
        whatsappNotificationSent: false,
        emailNotificationSent: false,
        userInfo: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '919876543210',
        },
        categories: [{ day: 'Sasthi', amount: 1000 }],
        totalAmount: 1000,
        orderId: 'ORD-789',
        timestamp: '2026-10-12',
      };

      // First worker wins the race
      (AnudanPayment.updateOne as jest.Mock)
        .mockResolvedValueOnce({ matchedCount: 1 }) // Email update succeeds
        .mockResolvedValueOnce({ matchedCount: 1 }); // WhatsApp update succeeds

      (EmailService.prototype.sendAnudanConfirmationEmail as jest.Mock).mockResolvedValue(undefined);
      (whatsAppService.sendAnudanConfirmation as jest.Mock).mockResolvedValue(undefined);

      await (service as any).retryAnudanPaymentNotifications(mockPayment, {
        emailSent: 0,
        whatsappSent: 0,
        emailFailed: 0,
        whatsappFailed: 0,
        errors: [],
      } as any);

      // Verify atomic claim update was used with expiry handling
      expect(AnudanPayment.updateOne).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: mockPayment._id,
          emailNotificationSent: false,
          $or: expect.arrayContaining([
            expect.objectContaining({ emailNotificationClaimedAt: expect.any(Object) })
          ])
        }),
        expect.objectContaining({
          $set: expect.objectContaining({ emailNotificationClaimedAt: expect.any(Date) })
        })
      );
    });

    it('should rollback notification flag on failure', async () => {
      const mockPayment = {
        _id: new mongoose.Types.ObjectId(),
        transactionId: 'TXN-ERROR',
        paymentStatus: 'success',
        whatsappNotificationSent: false,
        emailNotificationSent: false,
        userInfo: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '919876543210',
        },
        categories: [{ day: 'Sasthi', amount: 1000 }],
        totalAmount: 1000,
        orderId: 'ORD-ERROR',
        timestamp: '2026-10-12',
      };

      (AnudanPayment.updateOne as jest.Mock)
        .mockResolvedValueOnce({ matchedCount: 1 }) // Claim email
        .mockResolvedValueOnce({ matchedCount: 1 }) // Mark as sent
        .mockResolvedValue({ matchedCount: 1 }); // Rollback claim

      (EmailService.prototype.sendAnudanConfirmationEmail as jest.Mock).mockRejectedValue(
        new Error('SMTP error')
      );

      await (service as any).retryAnudanPaymentNotifications(mockPayment, {
        emailSent: 0,
        whatsappSent: 0,
        emailFailed: 0,
        whatsappFailed: 0,
        errors: [],
      } as any);

      // Verify rollback was called (rollbacks the claim, not the sent flag)
      expect(AnudanPayment.updateOne).toHaveBeenCalledWith(
        { _id: mockPayment._id },
        expect.objectContaining({
          $set: expect.objectContaining({
            emailNotificationClaimedAt: undefined,
            emailNotificationError: expect.any(String),
          }),
        })
      );
    });

    it('should send only the channel that has not succeeded', async () => {
      const mockPayment = {
        _id: new mongoose.Types.ObjectId(),
        transactionId: 'TXN-PARTIAL',
        paymentStatus: 'success',
        whatsappNotificationSent: true, // Already sent
        emailNotificationSent: false, // Missing
        userInfo: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '919876543210',
        },
        categories: [{ day: 'Sasthi', amount: 1000 }],
        totalAmount: 1000,
        orderId: 'ORD-PARTIAL',
        timestamp: '2026-10-12',
      };

      (AnudanPayment.updateOne as jest.Mock)
        .mockImplementation((query: any, update: any) => {
          // Email claim: emailNotificationSent is false, so should succeed
          if (query.emailNotificationSent === false && query.$or) {
            return Promise.resolve({ matchedCount: 1 });
          }
          // Email mark sent
          if (update?.$set?.emailNotificationSent === true) {
            return Promise.resolve({ matchedCount: 1 });
          }
          // WhatsApp claim: whatsappNotificationSent is true, so should fail (query requires false)
          if (query.whatsappNotificationSent === false) {
            return Promise.resolve({ matchedCount: 0 });
          }
          return Promise.resolve({ matchedCount: 0 });
        });

      (EmailService.prototype.sendAnudanConfirmationEmail as jest.Mock).mockResolvedValue(undefined);
      (whatsAppService.sendAnudanConfirmation as jest.Mock).mockResolvedValue(undefined);

      (EmailService.prototype.sendAnudanConfirmationEmail as jest.Mock).mockResolvedValue(undefined);

      await (service as any).retryAnudanPaymentNotifications(mockPayment, {
        emailSent: 0,
        whatsappSent: 0,
        emailFailed: 0,
        whatsappFailed: 0,
        errors: [],
      } as any);

      // Email should be sent
      expect(EmailService.prototype.sendAnudanConfirmationEmail).toHaveBeenCalled();

      // WhatsApp should NOT be sent (already sent)
      expect(whatsAppService.sendAnudanConfirmation).not.toHaveBeenCalled();
    });
  });

  describe('Fix 2: Exact integer comparison in paise', () => {
    it('should accept exact amount match using integer comparison', async () => {
      const mockPayment = {
        _id: new mongoose.Types.ObjectId(),
        transactionId: 'TXN-EXACT',
        paymentStatus: 'pending',
        totalAmount: 1000,
        userInfo: { name: 'Test', email: 'test@test.com', phone: '919876543210' },
        categories: [{ day: 'Sasthi', amount: 1000 }],
      };

      (iciciPGService.checkStatus as jest.Mock).mockResolvedValue({
        txnStatus: 'SUC',
        txnResponseCode: '000',
        txnID: 'ICICI-123',
        amount: '1000.00',
        paymentDateTime: '2026-10-12',
      });

      (AnudanPayment.updateOne as jest.Mock).mockResolvedValue({ matchedCount: 1 });
      (AnudanPayment.findById as jest.Mock).mockResolvedValue({
        ...mockPayment,
        save: jest.fn().mockResolvedValue(true),
      });
      (EmailService.prototype.sendAnudanConfirmationEmail as jest.Mock).mockResolvedValue(undefined);
      (whatsAppService.sendAnudanConfirmation as jest.Mock).mockResolvedValue(undefined);

      await (service as any).processAnudanPayment(mockPayment, {
        anudanRecovered: 0,
        anudanAlreadySuccess: 0,
        iciciFailed: 0,
        iciciPending: 0,
        iciciUnverified: 0,
        anudanExamined: 0,
        bhogExamined: 0,
        bhogRecovered: 0,
        bhogAlreadySuccess: 0,
        anudanBacklogExamined: 0,
        bhogBacklogExamined: 0,
        anudanBacklogRecovered: 0,
        bhogBacklogRecovered: 0,
        whatsappSent: 0,
        whatsappFailed: 0,
        emailSent: 0,
        emailFailed: 0,
        errors: [],
      } as any);

      // Should succeed with exact match
      expect(AnudanPayment.updateOne).toHaveBeenCalled();
    });

    it('should reject amount mismatch even with 1 paise difference', async () => {
      const mockPayment = {
        _id: new mongoose.Types.ObjectId(),
        transactionId: 'TXN-MISMATCH',
        paymentStatus: 'pending',
        totalAmount: 1000,
        userInfo: { name: 'Test', email: 'test@test.com', phone: '919876543210' },
        categories: [{ day: 'Sasthi', amount: 1000 }],
      };

      (iciciPGService.checkStatus as jest.Mock).mockResolvedValue({
        txnStatus: 'SUC',
        txnResponseCode: '000',
        txnID: 'ICICI-456',
        amount: '1000.01', // 1 paise more
        paymentDateTime: '2026-10-12',
      });

      const stats = {
        anudanRecovered: 0,
        anudanAlreadySuccess: 0,
        iciciFailed: 0,
        iciciPending: 0,
        iciciUnverified: 0,
        anudanExamined: 0,
        bhogExamined: 0,
        bhogRecovered: 0,
        bhogAlreadySuccess: 0,
        anudanBacklogExamined: 0,
        bhogBacklogExamined: 0,
        anudanBacklogRecovered: 0,
        bhogBacklogRecovered: 0,
        whatsappSent: 0,
        whatsappFailed: 0,
        emailSent: 0,
        emailFailed: 0,
        errors: [],
      } as any;

      await (service as any).processAnudanPayment(mockPayment, stats);

      // Should reject and mark as unverified
      expect(stats.iciciUnverified).toBe(1);
      expect(AnudanPayment.updateOne).not.toHaveBeenCalled();
    });

    it('should handle floating-point precision correctly', async () => {
      const mockPayment = {
        _id: new mongoose.Types.ObjectId(),
        transactionId: 'TXN-FLOAT',
        paymentStatus: 'pending',
        totalAmount: 100.99,
        userInfo: { name: 'Test', email: 'test@test.com', phone: '919876543210' },
        categories: [{ day: 'Sasthi', amount: 100.99 }],
      };

      (iciciPGService.checkStatus as jest.Mock).mockResolvedValue({
        txnStatus: 'SUC',
        txnResponseCode: '000',
        txnID: 'ICICI-789',
        amount: '100.99',
        paymentDateTime: '2026-10-12',
      });

      (AnudanPayment.updateOne as jest.Mock).mockResolvedValue({ matchedCount: 1 });
      (AnudanPayment.findById as jest.Mock).mockResolvedValue({
        ...mockPayment,
        save: jest.fn().mockResolvedValue(true),
      });

      const stats = {
        anudanRecovered: 0,
        anudanAlreadySuccess: 0,
        iciciFailed: 0,
        iciciPending: 0,
        iciciUnverified: 0,
        anudanExamined: 0,
        bhogExamined: 0,
        bhogRecovered: 0,
        bhogAlreadySuccess: 0,
        anudanBacklogExamined: 0,
        bhogBacklogExamined: 0,
        anudanBacklogRecovered: 0,
        bhogBacklogRecovered: 0,
        whatsappSent: 0,
        whatsappFailed: 0,
        emailSent: 0,
        emailFailed: 0,
        errors: [],
      } as any;

      await (service as any).processAnudanPayment(mockPayment, stats);

      // Should succeed with exact match despite floating-point representation
      expect(stats.iciciUnverified).toBe(0);
      expect(AnudanPayment.updateOne).toHaveBeenCalled();
    });
  });

  describe('Fix 3: Backlog processing for older payments', () => {
    it('should process backlog payments older than cutoff time', async () => {
      const oldDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const mockPayment = {
        _id: new mongoose.Types.ObjectId(),
        transactionId: 'TXN-BACKLOG',
        paymentStatus: 'pending',
        createdAt: oldDate,
        totalAmount: 1000,
        userInfo: { name: 'Test', email: 'test@test.com', phone: '919876543210' },
        categories: [{ day: 'Sasthi', amount: 1000 }],
      };

      (AnudanPayment.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue([mockPayment]),
            }),
          }),
        }),
      });
      (AnudanPayment.countDocuments as jest.Mock).mockResolvedValue(1);

      (iciciPGService.checkStatus as jest.Mock).mockResolvedValue({
        txnStatus: 'SUC',
        txnResponseCode: '000',
        txnID: 'ICICI-BACKLOG',
        amount: '1000.00',
        paymentDateTime: '2026-10-12',
      });

      (AnudanPayment.updateOne as jest.Mock).mockResolvedValue({ matchedCount: 1 });
      (AnudanPayment.findById as jest.Mock).mockResolvedValue({
        ...mockPayment,
        save: jest.fn().mockResolvedValue(true),
      });

      const cutoffTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const stats = {
        anudanBacklogExamined: 0,
        anudanBacklogRecovered: 0,
        anudanExamined: 0,
        bhogExamined: 0,
        anudanRecovered: 0,
        bhogRecovered: 0,
        anudanAlreadySuccess: 0,
        bhogAlreadySuccess: 0,
        bhogBacklogExamined: 0,
        bhogBacklogRecovered: 0,
        iciciFailed: 0,
        iciciPending: 0,
        iciciUnverified: 0,
        whatsappSent: 0,
        whatsappFailed: 0,
        emailSent: 0,
        emailFailed: 0,
        errors: [],
      } as any;

      await (service as any).reconcileAnudanBacklog(cutoffTime, stats);

      // Verify backlog query uses $lt (less than) for cutoff time
      expect(AnudanPayment.countDocuments).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentStatus: { $in: ['abandoned', 'pending'] },
          createdAt: { $lt: cutoffTime },
        })
      );

      // Verify backlog was processed
      expect(stats.anudanBacklogExamined).toBe(1);
      expect(stats.anudanBacklogRecovered).toBe(1);
    });

    it('should use smaller batch size for backlog processing', async () => {
      const oldDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const mockPayments = Array(25).fill(null).map((_, i) => ({
        _id: new mongoose.Types.ObjectId(),
        transactionId: `TXN-BACKLOG-${i}`,
        paymentStatus: 'pending',
        createdAt: oldDate,
        totalAmount: 1000,
        userInfo: { name: 'Test', email: 'test@test.com', phone: '919876543210' },
        categories: [{ day: 'Sasthi', amount: 1000 }],
      }));

      let skipCount = 0;
      (AnudanPayment.find as jest.Mock).mockImplementation(() => ({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockImplementation((skip) => ({
          limit: jest.fn().mockImplementation((limit) => ({
            lean: jest.fn().mockImplementation(() => {
              skipCount = skip;
              const batchSize = limit;
              return Promise.resolve(mockPayments.slice(skip, skip + batchSize));
            }),
          })),
        })),
      }));

      (AnudanPayment.countDocuments as jest.Mock).mockResolvedValue(25);
      (iciciPGService.checkStatus as jest.Mock).mockResolvedValue({
        txnStatus: 'SUC',
        txnResponseCode: '000',
        txnID: 'ICICI-BACKLOG',
        amount: '1000.00',
        paymentDateTime: '2026-10-12',
      });
      (AnudanPayment.updateOne as jest.Mock).mockResolvedValue({ matchedCount: 1 });
      (AnudanPayment.findById as jest.Mock).mockImplementation((id) =>
        Promise.resolve({
          ...mockPayments.find((p) => p._id.equals(id)),
          save: jest.fn().mockResolvedValue(true),
        })
      );

      const cutoffTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const stats = {
        anudanBacklogExamined: 0,
        anudanBacklogRecovered: 0,
        anudanExamined: 0,
        bhogExamined: 0,
        anudanRecovered: 0,
        bhogRecovered: 0,
        anudanAlreadySuccess: 0,
        bhogAlreadySuccess: 0,
        bhogBacklogExamined: 0,
        bhogBacklogRecovered: 0,
        iciciFailed: 0,
        iciciPending: 0,
        iciciUnverified: 0,
        whatsappSent: 0,
        whatsappFailed: 0,
        emailSent: 0,
        emailFailed: 0,
        errors: [],
      } as any;

      await (service as any).reconcileAnudanBacklog(cutoffTime, stats);

      // Verify backlog batch size is smaller (10 vs 20 for recent)
      const limitCalls = (AnudanPayment.find as jest.Mock).mock.results.map(
        (result) => result.value.skip.mock.results[0].value.limit.mock.calls[0][0]
      );
      expect(limitCalls).toContain(10);
    });
  });

  describe('Concurrent callback and reconciliation', () => {
    it('should handle concurrent callback and reconciliation race conditions', async () => {
      const mockPayment = {
        _id: new mongoose.Types.ObjectId(),
        transactionId: 'TXN-RACE',
        paymentStatus: 'pending',
        totalAmount: 1000,
        userInfo: { name: 'Test', email: 'test@test.com', phone: '919876543210' },
        categories: [{ day: 'Sasthi', amount: 1000 }],
      };

      // Simulate race: callback already marked as success
      (AnudanPayment.updateOne as jest.Mock).mockResolvedValue({ matchedCount: 0 });

      (iciciPGService.checkStatus as jest.Mock).mockResolvedValue({
        txnStatus: 'SUC',
        txnResponseCode: '000',
        txnID: 'ICICI-RACE',
        amount: '1000.00',
        paymentDateTime: '2026-10-12',
      });

      const stats = {
        anudanRecovered: 0,
        anudanAlreadySuccess: 0,
        iciciFailed: 0,
        iciciPending: 0,
        iciciUnverified: 0,
        anudanExamined: 0,
        bhogExamined: 0,
        bhogRecovered: 0,
        bhogAlreadySuccess: 0,
        anudanBacklogExamined: 0,
        bhogBacklogExamined: 0,
        anudanBacklogRecovered: 0,
        bhogBacklogRecovered: 0,
        whatsappSent: 0,
        whatsappFailed: 0,
        emailSent: 0,
        emailFailed: 0,
        errors: [],
      } as any;

      await (service as any).processAnudanPayment(mockPayment, stats);

      // Should not double-count as recovered
      expect(stats.anudanRecovered).toBe(0);
      expect(stats.anudanAlreadySuccess).toBe(1);
    });
  });

  describe('Anudan state consistency during recovery', () => {
    it('should deduct from in-memory Anudan state when recovering payment', async () => {
      const mockPayment = {
        _id: new mongoose.Types.ObjectId(),
        transactionId: 'TXN-STATE',
        paymentStatus: 'pending',
        totalAmount: 1000,
        userInfo: { name: 'Test', email: 'test@test.com', phone: '919876543210' },
        categories: [{ day: 'Sasthi', amount: 1000 }],
      };

      (AnudanPayment.updateOne as jest.Mock).mockResolvedValue({ matchedCount: 1 });
      (AnudanPayment.findById as jest.Mock).mockResolvedValue({
        ...mockPayment,
        save: jest.fn().mockResolvedValue(true),
      });

      (iciciPGService.checkStatus as jest.Mock).mockResolvedValue({
        txnStatus: 'SUC',
        txnResponseCode: '000',
        txnID: 'ICICI-STATE',
        amount: '1000.00',
        paymentDateTime: '2026-10-12',
      });

      (EmailService.prototype.sendAnudanConfirmationEmail as jest.Mock).mockResolvedValue(undefined);
      (whatsAppService.sendAnudanConfirmation as jest.Mock).mockResolvedValue(undefined);

      const stats = {
        anudanRecovered: 0,
        anudanAlreadySuccess: 0,
        iciciFailed: 0,
        iciciPending: 0,
        iciciUnverified: 0,
        anudanExamined: 0,
        bhogExamined: 0,
        bhogRecovered: 0,
        bhogAlreadySuccess: 0,
        anudanBacklogExamined: 0,
        bhogBacklogExamined: 0,
        anudanBacklogRecovered: 0,
        bhogBacklogRecovered: 0,
        whatsappSent: 0,
        whatsappFailed: 0,
        emailSent: 0,
        emailFailed: 0,
        errors: [],
      } as any;

      await (service as any).processAnudanPayment(mockPayment, stats);

      // Verify state deduction was called
      expect(anudanStateService.tryReserve).toHaveBeenCalledWith('Sasthi', 1000);
      expect(anudanStateService.broadcast).toHaveBeenCalledWith('Sasthi', 5000);
    });

    it('should handle state deduction failure and log error', async () => {
      const mockPayment = {
        _id: new mongoose.Types.ObjectId(),
        transactionId: 'TXN-STATE-FAIL',
        paymentStatus: 'pending',
        totalAmount: 1000,
        userInfo: { name: 'Test', email: 'test@test.com', phone: '919876543210' },
        categories: [{ day: 'Sasthi', amount: 1000 }],
      };

      (AnudanPayment.updateOne as jest.Mock).mockResolvedValue({ matchedCount: 1 });
      (AnudanPayment.findById as jest.Mock).mockResolvedValue({
        ...mockPayment,
        save: jest.fn().mockResolvedValue(true),
      });

      (iciciPGService.checkStatus as jest.Mock).mockResolvedValue({
        txnStatus: 'SUC',
        txnResponseCode: '000',
        txnID: 'ICICI-STATE-FAIL',
        amount: '1000.00',
        paymentDateTime: '2026-10-12',
      });

      // Mock tryReserve to return failure (insufficient remaining)
      (anudanStateService.tryReserve as jest.Mock).mockResolvedValue({ ok: false, remaining: 0 });

      (EmailService.prototype.sendAnudanConfirmationEmail as jest.Mock).mockResolvedValue(undefined);
      (whatsAppService.sendAnudanConfirmation as jest.Mock).mockResolvedValue(undefined);

      const stats = {
        anudanRecovered: 0,
        anudanAlreadySuccess: 0,
        iciciFailed: 0,
        iciciPending: 0,
        iciciUnverified: 0,
        anudanExamined: 0,
        bhogExamined: 0,
        bhogRecovered: 0,
        bhogAlreadySuccess: 0,
        anudanBacklogExamined: 0,
        bhogBacklogExamined: 0,
        anudanBacklogRecovered: 0,
        bhogBacklogRecovered: 0,
        whatsappSent: 0,
        whatsappFailed: 0,
        emailSent: 0,
        emailFailed: 0,
        errors: [],
      } as any;

      await (service as any).processAnudanPayment(mockPayment, stats);

      // Verify recovery still completed despite state failure
      expect(stats.anudanRecovered).toBe(1);
      // Verify tryReserve was called
      expect(anudanStateService.tryReserve).toHaveBeenCalledWith('Sasthi', 1000);
      // Broadcast should NOT be called on failure
      expect(anudanStateService.broadcast).not.toHaveBeenCalled();
    });
  });

  describe('Backlog pagination stability', () => {
    it('should use stable sort to prevent result set shifts', async () => {
      const oldDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const mockPayment = {
        _id: new mongoose.Types.ObjectId(),
        transactionId: 'TXN-SORT',
        paymentStatus: 'pending',
        createdAt: oldDate,
        totalAmount: 1000,
        userInfo: { name: 'Test', email: 'test@test.com', phone: '919876543210' },
        categories: [{ day: 'Sasthi', amount: 1000 }],
      };

      const mockFind = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([mockPayment]),
      };

      (AnudanPayment.find as jest.Mock).mockReturnValue(mockFind);
      (AnudanPayment.countDocuments as jest.Mock).mockResolvedValue(1);

      const cutoffTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const stats = {
        anudanBacklogExamined: 0,
        anudanBacklogRecovered: 0,
        anudanExamined: 0,
        bhogExamined: 0,
        anudanRecovered: 0,
        bhogRecovered: 0,
        anudanAlreadySuccess: 0,
        bhogAlreadySuccess: 0,
        bhogBacklogExamined: 0,
        bhogBacklogRecovered: 0,
        iciciFailed: 0,
        iciciPending: 0,
        iciciUnverified: 0,
        whatsappSent: 0,
        whatsappFailed: 0,
        emailSent: 0,
        emailFailed: 0,
        errors: [],
      } as any;

      await (service as any).reconcileAnudanBacklog(cutoffTime, stats);

      // Verify sort was called with stable sort criteria
      expect(mockFind.sort).toHaveBeenCalledWith({ createdAt: 1, _id: 1 });
    });
  });

  describe('Anudan state reinitialization', () => {
    it('should reinitialize Anudan state from MongoDB on demand', async () => {
      (anudanStateService.initialize as jest.Mock).mockResolvedValue(undefined);

      await service.reinitializeAnudanState();

      expect(anudanStateService.initialize).toHaveBeenCalled();
    });

    it('should propagate initialization errors', async () => {
      const error = new Error('Database connection failed');
      (anudanStateService.initialize as jest.Mock).mockRejectedValue(error);

      await expect(service.reinitializeAnudanState()).rejects.toThrow('Database connection failed');
    });
  });

  describe('Notification reliability', () => {
    it('should handle WhatsApp failure without blocking email retry', async () => {
      const mockPayment = {
        _id: new mongoose.Types.ObjectId(),
        transactionId: 'TXN-RETRY-1',
        paymentStatus: 'success',
        whatsappNotificationSent: false,
        emailNotificationSent: false,
        userInfo: { name: 'Test', email: 'test@test.com', phone: '919876543210' },
        categories: [{ day: 'Sasthi', amount: 1000 }],
        totalAmount: 1000,
        orderId: 'ORD-1',
        timestamp: '2026-10-12',
        save: jest.fn().mockResolvedValue(true),
      };

      (AnudanPayment.find as jest.Mock).mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([mockPayment]),
        }),
      });
      (AnudanPayment.countDocuments as jest.Mock).mockResolvedValue(1);
      
      (AnudanPayment.updateOne as jest.Mock)
        .mockResolvedValueOnce({ matchedCount: 1 }) // Claim email
        .mockResolvedValueOnce({ matchedCount: 1 }) // Mark email sent
        .mockResolvedValueOnce({ matchedCount: 1 }) // Claim WhatsApp
        .mockResolvedValueOnce({ matchedCount: 1 }); // Rollback WhatsApp claim
      (AnudanPayment.updateOne as jest.Mock).mockResolvedValue({ matchedCount: 1 });

      (EmailService.prototype.sendAnudanConfirmationEmail as jest.Mock).mockResolvedValue(undefined);
      (whatsAppService.sendAnudanConfirmation as jest.Mock).mockRejectedValue(new Error('WhatsApp API error'));

      const stats = {
        emailSent: 0,
        whatsappSent: 0,
        emailFailed: 0,
        whatsappFailed: 0,
        errors: [],
      } as any;

      await (service as any).retryAnudanPaymentNotifications(mockPayment, stats);

      // Email succeeded
      expect(stats.emailSent).toBe(1);
      // WhatsApp failed and was rolled back
      expect(stats.whatsappFailed).toBe(1);
      // WhatsApp claim should be reset for retry (not the sent flag)
      expect(AnudanPayment.updateOne).toHaveBeenCalledWith(
        { _id: mockPayment._id },
        expect.objectContaining({
          $set: expect.objectContaining({
            whatsappNotificationClaimedAt: undefined,
            whatsappNotificationError: expect.any(String)
          })
        })
      );
    });

    it('should not resend already successful notification channels', async () => {
      const mockPayment = {
        _id: new mongoose.Types.ObjectId(),
        transactionId: 'TXN-ALREADY-SENT',
        paymentStatus: 'success',
        whatsappNotificationSent: true,
        emailNotificationSent: false,
        userInfo: { name: 'Test', email: 'test@test.com', phone: '919876543210' },
        categories: [{ day: 'Sasthi', amount: 1000 }],
        totalAmount: 1000,
        orderId: 'ORD-2',
        timestamp: '2026-10-12',
        save: jest.fn().mockResolvedValue(true),
      };

      (AnudanPayment.find as jest.Mock).mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([mockPayment]),
        }),
      });
      (AnudanPayment.countDocuments as jest.Mock).mockResolvedValue(1);
      
      // WhatsApp update returns 0 (already true), email update returns 1 (still false)
      let updateCallCount = 0;
      (AnudanPayment.updateOne as jest.Mock).mockImplementation(() => {
        updateCallCount++;
        if (updateCallCount === 1) {
          // First call is email (matchedCount 1)
          return Promise.resolve({ matchedCount: 1 });
        } else {
          // Second call is WhatsApp (matchedCount 0 - already true)
          return Promise.resolve({ matchedCount: 0 });
        }
      });

      (EmailService.prototype.sendAnudanConfirmationEmail as jest.Mock).mockResolvedValue(undefined);
      (whatsAppService.sendAnudanConfirmation as jest.Mock).mockResolvedValue(undefined);

      const stats = {
        emailSent: 0,
        whatsappSent: 0,
        emailFailed: 0,
        whatsappFailed: 0,
        errors: [],
      } as any;

      await (service as any).retryAnudanPaymentNotifications(mockPayment, stats);

      // WhatsApp not sent (already marked true)
      expect(whatsAppService.sendAnudanConfirmation).not.toHaveBeenCalled();
      // Email sent (still false)
      expect(EmailService.prototype.sendAnudanConfirmationEmail).toHaveBeenCalled();
    });
  });

  describe('State deduction idempotency', () => {
    let mockSheetsLoggingService: any;

    beforeEach(() => {
      mockSheetsLoggingService = {
        logAnudanPayment: jest.fn().mockResolvedValue({ success: true, alreadyExists: false }),
        logBhogPayment: jest.fn().mockResolvedValue({ success: true, alreadyExists: false }),
        logReconciledPayment: jest.fn().mockResolvedValue({ success: true, alreadyExists: false }),
      };
      const { GoogleSheetsLoggingService } = require('./GoogleSheetsLoggingService');
      (GoogleSheetsLoggingService as jest.Mock).mockImplementation(() => mockSheetsLoggingService);
      (anudanStateService.tryReserve as jest.Mock).mockResolvedValue({ ok: true, remaining: 9000 });
      service = new ICICIReconciliationService();
    });

    it('should not deduct state twice for the same payment', async () => {
      const mockPayment = {
        _id: new mongoose.Types.ObjectId(),
        transactionId: 'TXN-IDEMPOTENT',
        paymentStatus: 'pending',
        totalAmount: 1000,
        userInfo: { name: 'Test', email: 'test@test.com', phone: '919876543210' },
        categories: [{ day: 'Sasthi', amount: 1000 }],
      };

      (AnudanPayment.updateOne as jest.Mock)
        .mockResolvedValueOnce({ matchedCount: 1 }) // First call: status update succeeds
        .mockResolvedValueOnce({ matchedCount: 0 }); // Second call: already updated by another process

      (AnudanPayment.findById as jest.Mock).mockResolvedValue({
        ...mockPayment,
        paymentStatus: 'success',
        save: jest.fn().mockResolvedValue(true),
      });

      (iciciPGService.checkStatus as jest.Mock).mockResolvedValue({
        txnStatus: 'SUC',
        txnResponseCode: '000',
        amount: '1000.00',
        txnID: 'ICICI-123',
        paymentDateTime: '2026-10-12',
      });

      const stats = {
        anudanExamined: 0,
        bhogExamined: 0,
        anudanRecovered: 0,
        bhogRecovered: 0,
        anudanAlreadySuccess: 0,
        bhogAlreadySuccess: 0,
        anudanBacklogExamined: 0,
        bhogBacklogExamined: 0,
        anudanBacklogRecovered: 0,
        bhogBacklogRecovered: 0,
        iciciFailed: 0,
        iciciPending: 0,
        iciciUnverified: 0,
        whatsappSent: 0,
        whatsappFailed: 0,
        emailSent: 0,
        emailFailed: 0,
        errors: [],
      } as any;

      // First recovery - should succeed
      await (service as any).recoverAnudanPayment(mockPayment, {
        txnStatus: 'SUC',
        txnResponseCode: '000',
        amount: '1000.00',
        txnID: 'ICICI-123',
        paymentDateTime: '2026-10-12',
      }, stats, false);
      
      // Second recovery - should skip because payment already updated (matchedCount === 0)
      await (service as any).recoverAnudanPayment(mockPayment, {
        txnStatus: 'SUC',
        txnResponseCode: '000',
        amount: '1000.00',
        txnID: 'ICICI-123',
        paymentDateTime: '2026-10-12',
      }, stats, false);

      // Payment should only be recovered once
      expect(stats.anudanRecovered).toBe(1);
      // Second recovery should be skipped
      expect(stats.anudanAlreadySuccess).toBe(1);
    });

    it('should rollback state deduction flag on failure', async () => {
      const mockPayment = {
        _id: new mongoose.Types.ObjectId(),
        transactionId: 'TXN-ROLLBACK',
        paymentStatus: 'pending',
        totalAmount: 1000,
        userInfo: { name: 'Test', email: 'test@test.com', phone: '919876543210' },
        categories: [{ day: 'Sasthi', amount: 1000 }],
      };

      (AnudanPayment.updateOne as jest.Mock)
        .mockResolvedValueOnce({ matchedCount: 1 }) // Payment status update
        .mockResolvedValueOnce({ matchedCount: 1 }) // State deduction flag set
        .mockResolvedValueOnce({ matchedCount: 1 }); // Rollback flag

      (anudanStateService.tryReserve as jest.Mock).mockResolvedValue({ ok: false, remaining: 0 });

      (iciciPGService.checkStatus as jest.Mock).mockResolvedValue({
        txnStatus: 'SUC',
        txnResponseCode: '000',
        amount: '1000.00',
        txnID: 'ICICI-123',
        paymentDateTime: '2026-10-12',
      });

      const stats = {
        anudanExamined: 0,
        bhogExamined: 0,
        anudanRecovered: 0,
        bhogRecovered: 0,
        anudanAlreadySuccess: 0,
        bhogAlreadySuccess: 0,
        anudanBacklogExamined: 0,
        bhogBacklogExamined: 0,
        anudanBacklogRecovered: 0,
        bhogBacklogRecovered: 0,
        iciciFailed: 0,
        iciciPending: 0,
        iciciUnverified: 0,
        whatsappSent: 0,
        whatsappFailed: 0,
        emailSent: 0,
        emailFailed: 0,
        errors: [],
      } as any;

      await (service as any).recoverAnudanPayment(mockPayment, {
        txnStatus: 'SUC',
        txnResponseCode: '000',
        amount: '1000.00',
        txnID: 'ICICI-123',
        paymentDateTime: '2026-10-12',
      }, stats, false);

      // Verify rollback was called
      expect(AnudanPayment.updateOne).toHaveBeenCalledWith(
        { _id: mockPayment._id },
        { $set: { anudanStateDeducted: false, anudanStateDeductedAt: undefined } }
      );
      
      // Verify error was logged
      expect(stats.errors.length).toBeGreaterThan(0);
      expect(stats.errors[0]).toContain('insufficient remaining');
    });
  });

  describe('Notification claim expiry', () => {
    it('should reclaim expired notification claims', async () => {
      const mockPayment = {
        _id: new mongoose.Types.ObjectId(),
        transactionId: 'TXN-EXPIRED',
        paymentStatus: 'success',
        whatsappNotificationSent: false,
        emailNotificationSent: false,
        whatsappNotificationClaimedAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
        emailNotificationClaimedAt: new Date(Date.now() - 10 * 60 * 1000),
        userInfo: { name: 'Test', email: 'test@test.com', phone: '919876543210' },
        categories: [{ day: 'Sasthi', amount: 1000 }],
        totalAmount: 1000,
        orderId: 'ORD-1',
        timestamp: '2026-10-12',
        save: jest.fn().mockResolvedValue(true),
      };

      (AnudanPayment.find as jest.Mock).mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([mockPayment]),
        }),
      });
      (AnudanPayment.countDocuments as jest.Mock).mockResolvedValue(1);
      
      // Claim should succeed due to expiry
      (AnudanPayment.updateOne as jest.Mock).mockResolvedValue({ matchedCount: 1 });

      (EmailService.prototype.sendAnudanConfirmationEmail as jest.Mock).mockResolvedValue(undefined);
      (whatsAppService.sendAnudanConfirmation as jest.Mock).mockResolvedValue(undefined);

      const stats = {
        emailSent: 0,
        whatsappSent: 0,
        emailFailed: 0,
        whatsappFailed: 0,
        errors: [],
      } as any;

      await (service as any).retryAnudanPaymentNotifications(mockPayment, stats);

      // Should have claimed and sent both notifications
      expect(EmailService.prototype.sendAnudanConfirmationEmail).toHaveBeenCalled();
      expect(whatsAppService.sendAnudanConfirmation).toHaveBeenCalled();
    });

    it('should not reclaim fresh notification claims', async () => {
      const mockPayment = {
        _id: new mongoose.Types.ObjectId(),
        transactionId: 'TXN-FRESH',
        paymentStatus: 'success',
        whatsappNotificationSent: false,
        emailNotificationSent: false,
        whatsappNotificationClaimedAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
        emailNotificationClaimedAt: new Date(Date.now() - 2 * 60 * 1000),
        userInfo: { name: 'Test', email: 'test@test.com', phone: '919876543210' },
        categories: [{ day: 'Sasthi', amount: 1000 }],
        totalAmount: 1000,
        orderId: 'ORD-2',
        timestamp: '2026-10-12',
        save: jest.fn().mockResolvedValue(true),
      };

      (AnudanPayment.find as jest.Mock).mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([mockPayment]),
        }),
      });
      (AnudanPayment.countDocuments as jest.Mock).mockResolvedValue(1);
      
      // Claim should fail due to fresh claim
      (AnudanPayment.updateOne as jest.Mock).mockResolvedValue({ matchedCount: 0 });

      (EmailService.prototype.sendAnudanConfirmationEmail as jest.Mock).mockResolvedValue(undefined);
      (whatsAppService.sendAnudanConfirmation as jest.Mock).mockResolvedValue(undefined);

      const stats = {
        emailSent: 0,
        whatsappSent: 0,
        emailFailed: 0,
        whatsappFailed: 0,
        errors: [],
      } as any;

      await (service as any).retryAnudanPaymentNotifications(mockPayment, stats);

      // Should not have sent notifications
      expect(EmailService.prototype.sendAnudanConfirmationEmail).not.toHaveBeenCalled();
      expect(whatsAppService.sendAnudanConfirmation).not.toHaveBeenCalled();
    });
  });

  describe('Google Sheets integration after recovery', () => {
    let mockSheetsLoggingService: any;

    beforeEach(() => {
      mockSheetsLoggingService = {
        logAnudanPayment: jest.fn().mockResolvedValue({ success: true, alreadyExists: false }),
        logBhogPayment: jest.fn().mockResolvedValue({ success: true, alreadyExists: false }),
        logReconciledPayment: jest.fn().mockResolvedValue({ success: true, alreadyExists: false }),
      };
      const { GoogleSheetsLoggingService } = require('./GoogleSheetsLoggingService');
      (GoogleSheetsLoggingService as jest.Mock).mockImplementation(() => mockSheetsLoggingService);
      service = new ICICIReconciliationService();
    });

    it('should attempt Google Sheets logging after recovery', async () => {
      const mockPayment = {
        _id: new mongoose.Types.ObjectId(),
        transactionId: 'TXN-SHEETS-1',
        paymentStatus: 'abandoned',
        totalAmount: 1000,
        userInfo: { name: 'Test', email: 'test@test.com', phone: '919876543210' },
        categories: [{ day: 'Sasthi', amount: 1000 }],
        googleSheetsLogged: false,
      };

      (AnudanPayment.updateOne as jest.Mock).mockResolvedValue({ matchedCount: 1 });
      (AnudanPayment.findById as jest.Mock).mockResolvedValue({
        ...mockPayment,
        save: jest.fn().mockResolvedValue(true),
      });

      (iciciPGService.checkStatus as jest.Mock).mockResolvedValue({
        txnStatus: 'SUC',
        txnResponseCode: '000',
        txnID: 'ICICI-SHEETS-1',
        amount: '1000.00',
        paymentDateTime: '2026-10-12',
      });

      (EmailService.prototype.sendAnudanConfirmationEmail as jest.Mock).mockResolvedValue(undefined);
      (whatsAppService.sendAnudanConfirmation as jest.Mock).mockResolvedValue(undefined);

      const stats = {
        anudanRecovered: 0,
        anudanAlreadySuccess: 0,
        errors: [],
      } as any;

      await (service as any).processAnudanPayment(mockPayment, stats);

      // Verify payment recovery succeeded
      expect(stats.anudanRecovered).toBe(1);
      // Verify Google Sheets fields were attempted to be updated
      expect(AnudanPayment.updateOne).toHaveBeenCalled();
    });

    it('should handle Google Sheets failure without failing payment recovery', async () => {
      const mockPayment = {
        _id: new mongoose.Types.ObjectId(),
        transactionId: 'TXN-SHEETS-FAIL',
        paymentStatus: 'abandoned',
        totalAmount: 1000,
        userInfo: { name: 'Test', email: 'test@test.com', phone: '919876543210' },
        categories: [{ day: 'Sasthi', amount: 1000 }],
        googleSheetsLogged: false,
      };

      (AnudanPayment.updateOne as jest.Mock).mockResolvedValue({ matchedCount: 1 });
      (AnudanPayment.findById as jest.Mock).mockResolvedValue({
        ...mockPayment,
        save: jest.fn().mockResolvedValue(true),
      });

      (iciciPGService.checkStatus as jest.Mock).mockResolvedValue({
        txnStatus: 'SUC',
        txnResponseCode: '000',
        txnID: 'ICICI-SHEETS-FAIL',
        amount: '1000.00',
        paymentDateTime: '2026-10-12',
      });

      (EmailService.prototype.sendAnudanConfirmationEmail as jest.Mock).mockResolvedValue(undefined);
      (whatsAppService.sendAnudanConfirmation as jest.Mock).mockResolvedValue(undefined);

      const stats = {
        anudanRecovered: 0,
        anudanAlreadySuccess: 0,
        errors: [],
      } as any;

      // Mock the GoogleSheetsLoggingService to throw an error
      const { GoogleSheetsLoggingService } = require('./GoogleSheetsLoggingService');
      (GoogleSheetsLoggingService as jest.Mock).mockImplementation(() => {
        return {
          logAnudanPayment: jest.fn().mockRejectedValue(new Error('API rate limit exceeded')),
        };
      });

      await (service as any).processAnudanPayment(mockPayment, stats);

      // Payment recovery should still succeed despite Google Sheets failure
      expect(stats.anudanRecovered).toBe(1);
      // Error should be logged
      expect(stats.errors.length).toBeGreaterThan(0);
    });

    it('should log recovered Bhog payment to Google Sheets', async () => {
      const mockPayment = {
        _id: new mongoose.Types.ObjectId(),
        transactionId: 'TXN-BHOG-SHEETS',
        paymentStatus: 'abandoned',
        totalAmount: 1000,
        userInfo: { name: 'Test', email: 'test@test.com', phone: '919876543210' },
        bookings: [{ day: 'Sasthi', quantity: 1, amount: 1000, categories: [] }],
        googleSheetsLogged: false,
      };

      (BhogPayment.updateOne as jest.Mock).mockResolvedValue({ matchedCount: 1 });
      (BhogPayment.findById as jest.Mock).mockResolvedValue({
        ...mockPayment,
        save: jest.fn().mockResolvedValue(true),
      });

      (iciciPGService.checkStatus as jest.Mock).mockResolvedValue({
        txnStatus: 'SUC',
        txnResponseCode: '000',
        txnID: 'ICICI-BHOG-SHEETS',
        amount: '1000.00',
        paymentDateTime: '2026-10-12',
      });

      (EmailService.prototype.sendBhogConfirmationEmail as jest.Mock).mockResolvedValue(undefined);
      (whatsAppService.sendBhogBookingConfirmation as jest.Mock).mockResolvedValue(undefined);

      const stats = {
        bhogRecovered: 0,
        bhogAlreadySuccess: 0,
        errors: [],
      } as any;

      await (service as any).processBhogPayment(mockPayment, stats);

      // Verify payment recovery succeeded
      expect(stats.bhogRecovered).toBe(1);
      // Verify Google Sheets fields were attempted to be updated
      expect(BhogPayment.updateOne).toHaveBeenCalled();
    });

    it('should not insert duplicate row when Sheets write succeeded but confirmation was lost', async () => {
      const mockPayment = {
        _id: new mongoose.Types.ObjectId(),
        transactionId: 'TXN-LOST-CONFIRMATION',
        paymentStatus: 'success',
        googleSheetsLogged: false,
        userInfo: { name: 'Test', email: 'test@test.com', phone: '919876543210' },
        categories: [{ day: 'Sasthi', amount: 1000 }],
        totalAmount: 1000,
        orderId: 'ORD-LOST',
        timestamp: '2026-10-12',
      };

      (AnudanPayment.find as jest.Mock).mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([mockPayment]),
        }),
      });
      (AnudanPayment.countDocuments as jest.Mock).mockResolvedValue(1);
      (AnudanPayment.findById as jest.Mock).mockResolvedValue({
        ...mockPayment,
        save: jest.fn().mockResolvedValue(true),
      });

      // This test verifies the logic path: when GoogleSheetsLoggingService returns alreadyExists=true,
      // the reconciliation service should mark the payment as logged anyway.
      // The duplicate detection happens inside GoogleSheetsLoggingService.logAnudanPayment by scanning
      // the sheet for existing transactionId/orderId before attempting insertion.
      const stats = {
        anudanRecovered: 0,
        errors: [],
      } as any;

      // Call the retry logic which will call the mocked logger
      await (service as any).retryGoogleSheetsLogging('anudan', mockPayment, stats);

      // Verify updateOne was called (the behavior when success=true or alreadyExists=true)
      expect(AnudanPayment.updateOne).toHaveBeenCalled();
    });

    it('should retry WhatsApp independently of Google Sheets', async () => {
      const mockPayment = {
        _id: new mongoose.Types.ObjectId(),
        transactionId: 'TXN-INDEPENDENT',
        paymentStatus: 'success',
        whatsappNotificationSent: false,
        googleSheetsLogged: true,
        userInfo: { name: 'Test', email: 'test@test.com', phone: '919876543210' },
        categories: [{ day: 'Sasthi', amount: 1000 }],
        totalAmount: 1000,
        orderId: 'ORD-1',
        timestamp: '2026-10-12',
        save: jest.fn().mockResolvedValue(true),
      };

      (AnudanPayment.find as jest.Mock).mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([mockPayment]),
        }),
      });
      (AnudanPayment.countDocuments as jest.Mock).mockResolvedValue(1);
      (AnudanPayment.updateOne as jest.Mock).mockResolvedValue({ matchedCount: 1 });

      (EmailService.prototype.sendAnudanConfirmationEmail as jest.Mock).mockResolvedValue(undefined);
      (whatsAppService.sendAnudanConfirmation as jest.Mock).mockResolvedValue(undefined);

      const stats = {
        emailSent: 0,
        whatsappSent: 0,
        emailFailed: 0,
        whatsappFailed: 0,
        errors: [],
      } as any;

      await (service as any).retryAnudanPaymentNotifications(mockPayment, stats);

      // WhatsApp should be sent
      expect(whatsAppService.sendAnudanConfirmation).toHaveBeenCalled();
      expect(stats.whatsappSent).toBe(1);
    });

    it('should log pending payment verified as successful to Receipts Records', async () => {
      const mockPayment = {
        _id: new mongoose.Types.ObjectId(),
        transactionId: 'TXN-RECEIPTS-PENDING',
        paymentStatus: 'pending',
        orderId: 'ORD-RECEIPTS',
        userInfo: { name: 'Test', email: 'test@test.com', phone: '919876543210' },
        categories: [{ day: 'Sasthi', amount: 1000 }],
        totalAmount: 1000,
        timestamp: '2026-10-12',
      };

      (AnudanPayment.updateOne as jest.Mock).mockResolvedValue({ matchedCount: 1 });
      (AnudanPayment.findById as jest.Mock).mockResolvedValue({
        ...mockPayment,
        paymentStatus: 'success',
        save: jest.fn().mockResolvedValue(true),
      });

      const iciciStatus = {
        txnStatus: 'SUC',
        txnResponseCode: '000',
        amount: '1000.00',
        txnID: 'ICICI-TXN',
        paymentDateTime: '2026-10-12T10:00:00',
      };

      const stats = {
        anudanRecovered: 0,
        errors: [],
      } as any;

      // Mock Receipts Records logging to return success
      (mockSheetsLoggingService.logReconciledPayment as jest.Mock).mockResolvedValue({
        success: true,
        alreadyExists: false,
      });

      await (service as any).recoverAnudanPayment(mockPayment, iciciStatus, stats, false);

      expect(stats.anudanRecovered).toBe(1);
      expect(mockSheetsLoggingService.logReconciledPayment).toHaveBeenCalledWith(
        'Anudan',
        expect.objectContaining({ transactionId: 'TXN-RECEIPTS-PENDING' }),
        'pending',
        'ICICI reconciliation'
      );
      expect(AnudanPayment.updateOne).toHaveBeenCalledWith(
        { _id: mockPayment._id },
        { $set: { receiptsRecordsLogged: true, receiptsRecordsLoggedAt: expect.any(Date), receiptsRecordsError: undefined } }
      );
    });

    it('should log abandoned payment verified as successful to Receipts Records', async () => {
      const mockPayment = {
        _id: new mongoose.Types.ObjectId(),
        transactionId: 'TXN-RECEIPTS-ABANDONED',
        paymentStatus: 'abandoned',
        orderId: 'ORD-RECEIPTS-AB',
        userInfo: { name: 'Test', email: 'test@test.com', phone: '919876543210' },
        categories: [{ day: 'Sasthi', amount: 1000 }],
        totalAmount: 1000,
        timestamp: '2026-10-12',
      };

      (AnudanPayment.updateOne as jest.Mock).mockResolvedValue({ matchedCount: 1 });
      (AnudanPayment.findById as jest.Mock).mockResolvedValue({
        ...mockPayment,
        paymentStatus: 'success',
        save: jest.fn().mockResolvedValue(true),
      });

      const iciciStatus = {
        txnStatus: 'SUC',
        txnResponseCode: '000',
        amount: '1000.00',
        txnID: 'ICICI-TXN',
        paymentDateTime: '2026-10-12T10:00:00',
      };

      const stats = {
        anudanRecovered: 0,
        errors: [],
      } as any;

      // Mock Receipts Records logging to return success
      (mockSheetsLoggingService.logReconciledPayment as jest.Mock).mockResolvedValue({
        success: true,
        alreadyExists: false,
      });

      await (service as any).recoverAnudanPayment(mockPayment, iciciStatus, stats, false);

      expect(stats.anudanRecovered).toBe(1);
      expect(mockSheetsLoggingService.logReconciledPayment).toHaveBeenCalledWith(
        'Anudan',
        expect.objectContaining({ transactionId: 'TXN-RECEIPTS-ABANDONED' }),
        'abandoned',
        'ICICI reconciliation'
      );
    });

    it('should prevent duplicate Receipts Records entries on repeated runs', async () => {
      const mockPayment = {
        _id: new mongoose.Types.ObjectId(),
        transactionId: 'TXN-RECEIPTS-DUPLICATE',
        paymentStatus: 'pending',
        orderId: 'ORD-RECEIPTS-DUP',
        userInfo: { name: 'Test', email: 'test@test.com', phone: '919876543210' },
        categories: [{ day: 'Sasthi', amount: 1000 }],
        totalAmount: 1000,
        timestamp: '2026-10-12',
      };

      (AnudanPayment.updateOne as jest.Mock).mockResolvedValue({ matchedCount: 1 });
      (AnudanPayment.findById as jest.Mock).mockResolvedValue({
        ...mockPayment,
        paymentStatus: 'success',
        save: jest.fn().mockResolvedValue(true),
      });

      const iciciStatus = {
        txnStatus: 'SUC',
        txnResponseCode: '000',
        amount: '1000.00',
        txnID: 'ICICI-TXN',
        paymentDateTime: '2026-10-12T10:00:00',
      };

      const stats = {
        anudanRecovered: 0,
        errors: [],
      } as any;

      // Mock Receipts Records logging to return alreadyExists
      (mockSheetsLoggingService.logReconciledPayment as jest.Mock).mockResolvedValue({
        success: false,
        alreadyExists: true,
      });

      await (service as any).recoverAnudanPayment(mockPayment, iciciStatus, stats, false);

      expect(stats.anudanRecovered).toBe(1);
      expect(AnudanPayment.updateOne).toHaveBeenCalledWith(
        { _id: mockPayment._id },
        { $set: { receiptsRecordsLogged: true, receiptsRecordsLoggedAt: expect.any(Date) } }
      );
    });

    it('should handle Receipts Records logging failure with retry capability', async () => {
      const mockPayment = {
        _id: new mongoose.Types.ObjectId(),
        transactionId: 'TXN-RECEIPTS-FAIL',
        paymentStatus: 'pending',
        orderId: 'ORD-RECEIPTS-FAIL',
        userInfo: { name: 'Test', email: 'test@test.com', phone: '919876543210' },
        categories: [{ day: 'Sasthi', amount: 1000 }],
        totalAmount: 1000,
        timestamp: '2026-10-12',
      };

      (AnudanPayment.updateOne as jest.Mock).mockResolvedValue({ matchedCount: 1 });
      (AnudanPayment.findById as jest.Mock).mockResolvedValue({
        ...mockPayment,
        paymentStatus: 'success',
        save: jest.fn().mockResolvedValue(true),
      });

      const iciciStatus = {
        txnStatus: 'SUC',
        txnResponseCode: '000',
        amount: '1000.00',
        txnID: 'ICICI-TXN',
        paymentDateTime: '2026-10-12T10:00:00',
      };

      const stats = {
        anudanRecovered: 0,
        errors: [],
      } as any;

      // Mock state deduction to succeed
      (anudanStateService.tryReserve as jest.Mock).mockResolvedValue({ ok: true, remaining: 9000 });

      // Mock Receipts Records logging to return error
      (mockSheetsLoggingService.logReconciledPayment as jest.Mock).mockResolvedValue({
        success: false,
        alreadyExists: false,
        error: 'Google Sheets API error',
      });

      await (service as any).recoverAnudanPayment(mockPayment, iciciStatus, stats, false);

      expect(stats.anudanRecovered).toBe(1);
      expect(stats.errors.length).toBeGreaterThan(0);
      expect(stats.errors[stats.errors.length - 1]).toContain('Receipts Records logging failed');
      expect(AnudanPayment.updateOne).toHaveBeenCalledWith(
        { _id: mockPayment._id },
        { $set: { receiptsRecordsError: 'Google Sheets API error' } }
      );
    });

    it('should recover missing Receipts Records entry for existing successful payment', async () => {
      const mockPayment = {
        _id: new mongoose.Types.ObjectId(),
        transactionId: 'TXN-RECEIPTS-RETRY',
        paymentStatus: 'success',
        receiptsRecordsLogged: false,
        orderId: 'ORD-RECEIPTS-RETRY',
        userInfo: { name: 'Test', email: 'test@test.com', phone: '919876543210' },
        categories: [{ day: 'Sasthi', amount: 1000 }],
        totalAmount: 1000,
        timestamp: '2026-10-12',
      };

      (AnudanPayment.findById as jest.Mock).mockResolvedValue(mockPayment);
      (AnudanPayment.updateOne as jest.Mock).mockResolvedValue({ matchedCount: 1 });

      const stats = {
        errors: [],
      } as any;

      // Mock Receipts Records logging to return success
      (mockSheetsLoggingService.logReconciledPayment as jest.Mock).mockResolvedValue({
        success: true,
        alreadyExists: false,
      });

      await (service as any).retryReceiptsRecordsLogging('anudan', mockPayment, stats);

      expect(mockSheetsLoggingService.logReconciledPayment).toHaveBeenCalledWith(
        'Anudan',
        mockPayment,
        'success',
        'Retried after successful status'
      );
      expect(AnudanPayment.updateOne).toHaveBeenCalledWith(
        { _id: mockPayment._id },
        { $set: { receiptsRecordsLogged: true, receiptsRecordsLoggedAt: expect.any(Date), receiptsRecordsError: undefined } }
      );
    });

    it('should log Bhog payment verified as successful to Receipts Records', async () => {
      const mockPayment = {
        _id: new mongoose.Types.ObjectId(),
        transactionId: 'TXN-RECEIPTS-BHOG',
        paymentStatus: 'pending',
        orderId: 'ORD-RECEIPTS-BHOG',
        userInfo: { name: 'Test', email: 'test@test.com', phone: '919876543210' },
        bookings: [{ day: 'Sasthi', amount: 1000, quantity: 1 }],
        totalAmount: 1000,
        timestamp: '2026-10-12',
      };

      (BhogPayment.updateOne as jest.Mock).mockResolvedValue({ matchedCount: 1 });
      (BhogPayment.findById as jest.Mock).mockResolvedValue({
        ...mockPayment,
        paymentStatus: 'success',
        save: jest.fn().mockResolvedValue(true),
      });

      const iciciStatus = {
        txnStatus: 'SUC',
        txnResponseCode: '000',
        amount: '1000.00',
        txnID: 'ICICI-TXN',
        paymentDateTime: '2026-10-12T10:00:00',
      };

      const stats = {
        bhogRecovered: 0,
        errors: [],
      } as any;

      // Mock Receipts Records logging to return success
      (mockSheetsLoggingService.logReconciledPayment as jest.Mock).mockResolvedValue({
        success: true,
        alreadyExists: false,
      });

      await (service as any).recoverBhogPayment(mockPayment, iciciStatus, stats, false);

      expect(stats.bhogRecovered).toBe(1);
      expect(mockSheetsLoggingService.logReconciledPayment).toHaveBeenCalledWith(
        'Bhog',
        expect.objectContaining({ transactionId: 'TXN-RECEIPTS-BHOG' }),
        'pending',
        'ICICI reconciliation'
      );
      expect(BhogPayment.updateOne).toHaveBeenCalledWith(
        { _id: mockPayment._id },
        { $set: { receiptsRecordsLogged: true, receiptsRecordsLoggedAt: expect.any(Date), receiptsRecordsError: undefined } }
      );
    });
  });
});
