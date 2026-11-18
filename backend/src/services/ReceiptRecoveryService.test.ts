/**
 * Receipt Recovery Service Tests
 * 
 * Focused test suite with isolated mocks to avoid PDFKit loading
 */

// Mock ALL dependencies at the module level BEFORE any imports
jest.mock('../models/AnudanPayment');
jest.mock('../models/BhogPayment');
jest.mock('fs');
jest.mock('path');

// Mock ReceiptService and EmailService to prevent PDFKit loading
const mockReceiptService = {
  generateAnudanReceipt: jest.fn().mockResolvedValue('/receipts/anudan-test.pdf'),
  generateBhogReceipt: jest.fn().mockResolvedValue('/receipts/bhog-test.pdf'),
};

const mockEmailService = {
  sendEmail: jest.fn().mockResolvedValue(undefined),
};

jest.mock('./ReceiptService', () => ({
  ReceiptService: jest.fn(() => mockReceiptService),
}));

jest.mock('./EmailService', () => ({
  EmailService: jest.fn(() => mockEmailService),
}));

import mongoose from 'mongoose';

describe('ReceiptRecoveryService - Focused Tests', () => {
  let ReceiptRecoveryService: any;
  let AnudanPayment: any;
  let BhogPayment: any;
  let fs: any;
  let path: any;

  beforeAll(() => {
    // Dynamic import to ensure mocks are in place
    ReceiptRecoveryService = require('./ReceiptRecoveryService').ReceiptRecoveryService;
    AnudanPayment = require('../models/AnudanPayment').AnudanPayment;
    BhogPayment = require('../models/BhogPayment').BhogPayment;
    fs = require('fs');
    path = require('path');
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock filesystem operations
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readdirSync as jest.Mock).mockReturnValue([]);
    (path.join as jest.Mock).mockImplementation((...args) => args.join('/'));

    // Suppress console output
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Audit operation - no writes, PDF generation, or email sending', () => {
    it('should perform read-only audit without any side effects', async () => {
      const service = new ReceiptRecoveryService(mockReceiptService, mockEmailService);
      
      const mockPayment = {
        _id: new mongoose.Types.ObjectId(),
        transactionId: 'TXN-AUDIT',
        paymentStatus: 'success',
        receiptPath: undefined,
        orderId: 'ORD-AUDIT',
        userInfo: { name: 'Test', email: 'test@test.com', phone: '919876543210' },
        categories: [{ day: 'Sasthi', amount: 1000 }],
        totalAmount: 1000,
        timestamp: '2026-10-12',
      };

      (AnudanPayment.countDocuments as jest.Mock).mockResolvedValue(1);
      (AnudanPayment.find as jest.Mock).mockReturnValue({
        limit: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([mockPayment]),
        }),
      });
      (BhogPayment.countDocuments as jest.Mock).mockResolvedValue(0);

      const stats = await service.auditMissingReceipts();

      expect(stats.anudanExamined).toBe(1);
      expect(stats.bhogExamined).toBe(0);
      expect(stats.anudanReceiptsGenerated).toBe(0);
      expect(mockReceiptService.generateAnudanReceipt).not.toHaveBeenCalled();
      expect(AnudanPayment.updateOne).not.toHaveBeenCalled();
      expect(mockEmailService.sendEmail).not.toHaveBeenCalled();
    });
  });

  describe('Backfill dry-run - no writes, PDF generation, or email sending', () => {
    it('should backfill dry-run without MongoDB updates', async () => {
      const service = new ReceiptRecoveryService(mockReceiptService, mockEmailService);
      
      const mockPayment = {
        _id: new mongoose.Types.ObjectId(),
        transactionId: 'TXN-BACKFILL-DRY',
        paymentStatus: 'success',
        receiptPath: undefined,
        orderId: 'ORD-BACKFILL-DRY',
        userInfo: { name: 'Test', email: 'test@test.com', phone: '919876543210' },
        categories: [{ day: 'Sasthi', amount: 1000 }],
        totalAmount: 1000,
        timestamp: '2026-10-12',
      };

      (AnudanPayment.countDocuments as jest.Mock).mockResolvedValue(1);
      (AnudanPayment.find as jest.Mock).mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([mockPayment]),
          }),
        }),
      });
      (AnudanPayment.findById as jest.Mock).mockResolvedValue(mockPayment);

      (fs.readdirSync as jest.Mock).mockReturnValue(['anudan-receipt-ORD-BACKFILL-DRY-1234567890.pdf']);

      const stats = await service.backfillHistoricalReceipts(true);

      expect(stats.anudanReceiptsGenerated).toBe(1);
      expect(AnudanPayment.updateOne).not.toHaveBeenCalled();
      expect(mockReceiptService.generateAnudanReceipt).not.toHaveBeenCalled();
      expect(mockEmailService.sendEmail).not.toHaveBeenCalled();
    });
  });

  describe('Recovery dry-run - no writes, PDF generation, or email sending', () => {
    it('should recovery dry-run without PDF generation or email sending', async () => {
      const service = new ReceiptRecoveryService(mockReceiptService, mockEmailService);
      
      const mockPayment = {
        _id: new mongoose.Types.ObjectId(),
        transactionId: 'TXN-RECOVERY-DRY',
        paymentStatus: 'success',
        receiptPath: undefined,
        orderId: 'ORD-RECOVERY-DRY',
        userInfo: { name: 'Test', email: 'test@test.com', phone: '919876543210' },
        categories: [{ day: 'Sasthi', amount: 1000 }],
        totalAmount: 1000,
        timestamp: '2026-10-12',
      };

      (AnudanPayment.countDocuments as jest.Mock).mockResolvedValue(1);
      (AnudanPayment.find as jest.Mock).mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([mockPayment]),
          }),
        }),
      });
      (AnudanPayment.findById as jest.Mock).mockResolvedValue(mockPayment);

      (fs.readdirSync as jest.Mock).mockReturnValue([]);

      const stats = await service.recoverMissingReceipts(true);

      expect(stats.anudanReceiptsGenerated).toBe(1);
      expect(mockReceiptService.generateAnudanReceipt).not.toHaveBeenCalled();
      expect(AnudanPayment.updateOne).not.toHaveBeenCalled();
      expect(mockEmailService.sendEmail).not.toHaveBeenCalled();
    });
  });

  describe('Existing receipts are not regenerated', () => {
    it('should skip receipt generation if receiptPath already exists', async () => {
      const service = new ReceiptRecoveryService(mockReceiptService, mockEmailService);
      
      const mockPayment = {
        _id: new mongoose.Types.ObjectId(),
        transactionId: 'TXN-SKIP',
        paymentStatus: 'success',
        receiptPath: '/receipts/existing.pdf',
        orderId: 'ORD-SKIP',
        userInfo: { name: 'Test', email: 'test@test.com', phone: '919876543210' },
        categories: [{ day: 'Sasthi', amount: 1000 }],
        totalAmount: 1000,
        timestamp: '2026-10-12',
      };

      (AnudanPayment.countDocuments as jest.Mock).mockResolvedValue(1);
      (AnudanPayment.find as jest.Mock).mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([mockPayment]),
          }),
        }),
      });
      (AnudanPayment.findById as jest.Mock).mockResolvedValue(mockPayment);

      const stats = await service.recoverMissingReceipts(false);

      expect(stats.anudanReceiptsGenerated).toBe(0);
      expect(mockReceiptService.generateAnudanReceipt).not.toHaveBeenCalled();
      expect(AnudanPayment.updateOne).not.toHaveBeenCalled();
    });

    it('should reuse existing receipt file found in filesystem', async () => {
      const service = new ReceiptRecoveryService(mockReceiptService, mockEmailService);
      
      const mockPayment = {
        _id: new mongoose.Types.ObjectId(),
        transactionId: 'TXN-REUSE',
        paymentStatus: 'success',
        receiptPath: undefined,
        orderId: 'ORD-REUSE',
        userInfo: { name: 'Test', email: 'test@test.com', phone: '919876543210' },
        categories: [{ day: 'Sasthi', amount: 1000 }],
        totalAmount: 1000,
        timestamp: '2026-10-12',
      };

      (AnudanPayment.countDocuments as jest.Mock).mockResolvedValue(1);
      (AnudanPayment.find as jest.Mock).mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([mockPayment]),
          }),
        }),
      });
      (AnudanPayment.findById as jest.Mock).mockResolvedValue(mockPayment);
      (AnudanPayment.updateOne as jest.Mock).mockResolvedValue({ matchedCount: 1 });

      (fs.readdirSync as jest.Mock).mockReturnValue(['anudan-receipt-ORD-REUSE-1234567890.pdf']);

      const stats = await service.recoverMissingReceipts(false);

      expect(stats.anudanReceiptsGenerated).toBe(1);
      expect(mockReceiptService.generateAnudanReceipt).not.toHaveBeenCalled();
      expect(AnudanPayment.updateOne).toHaveBeenCalledWith(
        { _id: mockPayment._id },
        { $set: { receiptPath: expect.stringContaining('anudan-receipt-ORD-REUSE') } }
      );
    });
  });

  describe('Ambiguous receipt matches are skipped', () => {
    it('should skip backfill for ambiguous multiple matches', async () => {
      const service = new ReceiptRecoveryService(mockReceiptService, mockEmailService);
      
      const mockPayment = {
        _id: new mongoose.Types.ObjectId(),
        transactionId: 'TXN-AMBIGUOUS',
        paymentStatus: 'success',
        receiptPath: undefined,
        orderId: 'ORD-AMBIGUOUS',
        userInfo: { name: 'Test', email: 'test@test.com', phone: '919876543210' },
        categories: [{ day: 'Sasthi', amount: 1000 }],
        totalAmount: 1000,
        timestamp: '2026-10-12',
      };

      (AnudanPayment.countDocuments as jest.Mock).mockResolvedValue(1);
      (AnudanPayment.find as jest.Mock).mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([mockPayment]),
          }),
        }),
      });
      (AnudanPayment.findById as jest.Mock).mockResolvedValue(mockPayment);

      (fs.readdirSync as jest.Mock).mockReturnValue([
        'anudan-receipt-ORD-AMBIGUOUS-1234567890.pdf',
        'anudan-receipt-ORD-AMBIGUOUS-1234567891.pdf',
      ]);

      const stats = await service.backfillHistoricalReceipts(false);

      expect(stats.anudanReceiptsGenerated).toBe(0);
      expect(mockReceiptService.generateAnudanReceipt).not.toHaveBeenCalled();
      expect(AnudanPayment.updateOne).not.toHaveBeenCalled();
      expect(stats.errors.length).toBeGreaterThan(0);
      expect(stats.errors[0]).toContain('Multiple existing receipts');
    });
  });

  describe('Only confirmed successful payments are eligible for recovery', () => {
    it('should only process payments with paymentStatus: success', async () => {
      const service = new ReceiptRecoveryService(mockReceiptService, mockEmailService);
      
      // Query checks for paymentStatus: 'success'
      const query = {
        paymentStatus: 'success',
        receiptPath: { $exists: false },
      };

      (AnudanPayment.countDocuments as jest.Mock).mockResolvedValue(0);
      (BhogPayment.countDocuments as jest.Mock).mockResolvedValue(0);

      const stats = await service.recoverMissingReceipts(false);

      expect(AnudanPayment.countDocuments).toHaveBeenCalledWith(query);
      expect(BhogPayment.countDocuments).toHaveBeenCalledWith(query);
      expect(stats.anudanExamined).toBe(0);
      expect(stats.bhogExamined).toBe(0);
    });
  });

  describe('Email failures are recorded correctly', () => {
    it('should record email error when sendEmail fails', async () => {
      const service = new ReceiptRecoveryService(mockReceiptService, mockEmailService);
      
      const mockPayment = {
        _id: new mongoose.Types.ObjectId(),
        transactionId: 'TXN-EMAIL-FAIL',
        paymentStatus: 'success',
        receiptPath: undefined,
        orderId: 'ORD-EMAIL-FAIL',
        userInfo: { name: 'Test', email: 'test@test.com', phone: '919876543210' },
        categories: [{ day: 'Sasthi', amount: 1000 }],
        totalAmount: 1000,
        timestamp: '2026-10-12',
      };

      (AnudanPayment.countDocuments as jest.Mock).mockResolvedValue(1);
      (AnudanPayment.find as jest.Mock).mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([mockPayment]),
          }),
        }),
      });
      (AnudanPayment.findById as jest.Mock).mockResolvedValue(mockPayment);
      (AnudanPayment.updateOne as jest.Mock).mockResolvedValue({ matchedCount: 1 });

      (fs.readdirSync as jest.Mock).mockReturnValue([]);
      (mockEmailService.sendEmail as jest.Mock).mockRejectedValue(new Error('SMTP error'));

      const stats = await service.recoverMissingReceipts(false);

      expect(stats.anudanReceiptsGenerated).toBe(1);
      expect(stats.anudanReceiptsEmailed).toBe(0);
      expect(stats.errors.length).toBeGreaterThan(0);
      expect(stats.errors[0]).toContain('Email batch');
      expect(AnudanPayment.updateOne).toHaveBeenCalledWith(
        { _id: mockPayment._id },
        { $set: { receiptPath: '/receipts/anudan-test.pdf' } }
      );
      expect(AnudanPayment.updateOne).toHaveBeenCalledWith(
        { transactionId: 'TXN-EMAIL-FAIL' },
        { $set: { adminReceiptEmailError: expect.stringContaining('SMTP error') } }
      );
    });
  });

  describe('SMTP success followed by tracking failure', () => {
    it('should record success when SMTP succeeds but MongoDB tracking fails', async () => {
      const service = new ReceiptRecoveryService(mockReceiptService, mockEmailService);
      
      const mockPayment = {
        _id: new mongoose.Types.ObjectId(),
        transactionId: 'TXN-SMTP-SUCCESS',
        paymentStatus: 'success',
        receiptPath: undefined,
        orderId: 'ORD-SMTP-SUCCESS',
        userInfo: { name: 'Test', email: 'test@test.com', phone: '919876543210' },
        categories: [{ day: 'Sasthi', amount: 1000 }],
        totalAmount: 1000,
        timestamp: '2026-10-12',
      };

      (AnudanPayment.countDocuments as jest.Mock).mockResolvedValue(1);
      (AnudanPayment.find as jest.Mock).mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([mockPayment]),
          }),
        }),
      });
      (AnudanPayment.findById as jest.Mock).mockResolvedValue(mockPayment);
      
      // First update for receipt path succeeds
      (AnudanPayment.updateOne as jest.Mock)
        .mockResolvedValueOnce({ matchedCount: 1 })
        // Second update for email tracking fails
        .mockRejectedValueOnce(new Error('MongoDB connection lost'));

      (fs.readdirSync as jest.Mock).mockReturnValue([]);
      (mockEmailService.sendEmail as jest.Mock).mockResolvedValue(undefined);

      const stats = await service.recoverMissingReceipts(false);

      expect(stats.anudanReceiptsGenerated).toBe(1);
      expect(mockEmailService.sendEmail).toHaveBeenCalled();
      expect(stats.errors.length).toBeGreaterThan(0);
      expect(stats.errors[0]).toContain('Email batch');
      
      // Receipt path was saved
      expect(AnudanPayment.updateOne).toHaveBeenCalledWith(
        { _id: mockPayment._id },
        { $set: { receiptPath: '/receipts/anudan-test.pdf' } }
      );
      
      // Email tracking failed after SMTP success
      expect(AnudanPayment.updateOne).toHaveBeenCalledWith(
        { transactionId: 'TXN-SMTP-SUCCESS' },
        expect.objectContaining({ $set: expect.any(Object) })
      );
    });
  });
});
