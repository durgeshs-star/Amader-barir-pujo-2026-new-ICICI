# ICICI Payment Gateway Integration Documentation

## Overview

This document provides comprehensive information about the ICICI Payment Gateway integration implemented for the Amader Barir Pujo application. The implementation follows clean architecture principles and is designed to be production-ready, secure, and easily maintainable.

## Architecture

### Backend Structure

```
backend/src/
├── config/
│   ├── payment.config.ts      # Payment configuration and provider switching
│   └── database.ts            # MongoDB connection setup
├── constants/
│   └── paymentStatus.ts        # Payment status enums and constants
├── controllers/
│   └── PaymentController.ts    # HTTP request/response handling
├── middleware/
│   ├── auth.ts                 # Authentication middleware (JWT)
│   ├── errorHandler.ts         # Centralized error handling
│   └── paymentValidator.ts     # Request validation schemas
├── models/
│   └── Payment.ts              # Mongoose payment schema
├── repositories/
│   └── PaymentRepository.ts    # Database operations (Repository Pattern)
├── routes/
│   └── paymentRoutes.ts        # API route definitions
├── services/
│   ├── PaymentService.ts       # Business logic and provider abstraction
│   ├── MockPaymentService.ts   # Mock payment implementation
│   └── ICICIService.ts         # ICICI payment implementation (placeholder)
├── types/
│   └── errors.ts               # Custom error classes
└── utils/
    ├── encryption.ts           # Encryption utilities (placeholder)
    ├── hash.ts                 # Hash generation utilities (placeholder)
    └── transaction.ts          # Transaction ID generation
```

### Frontend Structure

```
frontend/src/components/Payment/
├── PaymentButton.tsx           # Initiates payment flow
├── PaymentSuccess.tsx          # Success page
├── PaymentFailure.tsx          # Failure page
├── PaymentPending.tsx          # Pending/processing page
├── MockPayment.tsx             # Mock payment gateway page
├── PaymentHistory.tsx          # Payment history table
└── index.ts                    # Component exports
```

## Configuration

### Environment Variables

Add the following variables to your `.env` file:

```bash
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/amader-barir-pujo

# ICICI Payment Gateway Configuration
ICICI_MERCHANT_ID=your_merchant_id
ICICI_TERMINAL_ID=your_terminal_id
ICICI_ACCESS_KEY=your_access_key
ICICI_SECRET_KEY=your_secret_key
ICICI_WORKING_KEY=your_working_key

ICICI_SANDBOX_URL=https://api.icicibank.com/sandbox
ICICI_PRODUCTION_URL=https://api.icicibank.com/production

# Payment Configuration
PAYMENT_CALLBACK_URL=http://localhost:3001/api/payment/callback
PAYMENT_REDIRECT_URL=http://localhost:5173/payment/result
PAYMENT_PROVIDER=mock

# Payment Rate Limiting
PAYMENT_RATE_LIMIT_WINDOW_MS=300000
PAYMENT_RATE_LIMIT_MAX_REQUESTS=3
```

### Payment Provider Switching

The `PAYMENT_PROVIDER` environment variable controls which payment provider is active:

- **mock**: Uses the mock payment service for testing (default)
- **sandbox**: Uses ICICI sandbox environment
- **production**: Uses ICICI production environment

To switch providers, simply change the `PAYMENT_PROVIDER` value in your `.env` file and restart the server. No code changes are required.

## API Endpoints

### 1. Create Payment Order

**Endpoint:** `POST /api/payment/create-order`

**Request Body:**
```json
{
  "customerId": "CUST123",
  "amount": 500.00,
  "currency": "INR",
  "metadata": {
    "description": "Puja donation"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "orderId": "ORD-ABC123...",
    "transactionId": "TXN-XYZ789...",
    "amount": 500.00,
    "currency": "INR",
    "redirectUrl": "/mock-payment/TXN-XYZ789...",
    "message": "Payment initiated successfully"
  }
}
```

### 2. Process Payment Callback

**Endpoint:** `POST /api/payment/callback`

**Request Body:**
```json
{
  "transactionId": "TXN-XYZ789...",
  "status": "SUCCESS",
  "paymentMode": "CREDIT_CARD",
  "bankReference": "BANK-REF123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "transactionId": "TXN-XYZ789...",
    "status": "SUCCESS",
    "message": "Payment completed successfully"
  }
}
```

### 3. Get Transaction Status

**Endpoint:** `GET /api/payment/status/:transactionId`

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": "TXN-XYZ789...",
    "orderId": "ORD-ABC123...",
    "customerId": "CUST123",
    "amount": 500.00,
    "currency": "INR",
    "status": "SUCCESS",
    "paymentMode": "CREDIT_CARD",
    "gatewayTransactionId": "MOCK-REF123",
    "responseCode": "000",
    "responseMessage": "Payment completed successfully",
    "createdAt": "2026-07-01T10:00:00.000Z",
    "updatedAt": "2026-07-01T10:00:05.000Z"
  }
}
```

### 4. Process Refund

**Endpoint:** `POST /api/payment/refund`

**Request Body:**
```json
{
  "transactionId": "TXN-XYZ789...",
  "amount": 500.00,
  "reason": "Customer request"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "transactionId": "TXN-XYZ789...",
    "refundTransactionId": "REF-ABC456...",
    "amount": 500.00,
    "message": "Refund processed successfully"
  }
}
```

### 5. Get Payment History

**Endpoint:** `GET /api/payment/history?customerId=CUST123&page=1&limit=10`

**Response:**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "transactionId": "TXN-XYZ789...",
        "orderId": "ORD-ABC123...",
        "customerId": "CUST123",
        "amount": 500.00,
        "currency": "INR",
        "status": "SUCCESS",
        "paymentMode": "CREDIT_CARD",
        "gatewayTransactionId": "MOCK-REF123",
        "responseCode": "000",
        "responseMessage": "Payment completed successfully",
        "createdAt": "2026-07-01T10:00:00.000Z",
        "updatedAt": "2026-07-01T10:00:05.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

## Frontend Usage

### Payment Button

```tsx
import { PaymentButton } from '@/components/Payment';

<PaymentButton
  customerId="CUST123"
  amount={500}
  currency="INR"
  onSuccess={(orderId, transactionId) => {
    console.log('Payment successful:', orderId, transactionId);
  }}
  onError={(error) => {
    console.error('Payment failed:', error);
  }}
>
  Pay Now
</PaymentButton>
```

### Payment History

```tsx
import { PaymentHistory } from '@/components/Payment';

<PaymentHistory customerId="CUST123" limit={10} />
```

## Payment Flow

### Mock Payment Flow

1. User clicks "Pay Now" button
2. Frontend calls `POST /api/payment/create-order`
3. Backend creates payment record with status `PENDING`
4. Backend returns redirect URL to `/mock-payment/:transactionId`
5. Frontend redirects to MockPayment page
6. User selects payment result (Success/Fail/Cancel)
7. Frontend calls `POST /api/payment/callback`
8. Backend updates payment status
9. Frontend redirects to appropriate result page

### ICICI Payment Flow (Future)

When ICICI credentials are available:

1. User clicks "Pay Now" button
2. Frontend calls `POST /api/payment/create-order`
3. Backend creates payment record with status `PENDING`
4. Backend calls ICICI API to create payment
5. ICICI returns redirect URL to their payment page
6. Frontend redirects to ICICI payment page
7. User completes payment on ICICI page
8. ICICI sends callback to backend
9. Backend verifies callback signature
10. Backend updates payment status
11. ICICI redirects user to frontend result page

## Security Features

### Implemented

- **Input Validation**: All requests are validated using express-validator
- **Rate Limiting**: Payment endpoints have stricter rate limits
- **Error Handling**: Centralized error handling with custom error classes
- **Repository Pattern**: All database operations go through repositories
- **Status Validation**: Invalid status transitions are prevented
- **Idempotency**: Duplicate callbacks are handled gracefully
- **Secure Headers**: Helmet middleware for security headers
- **CORS Configuration**: Proper CORS setup for allowed origins

### TODO (When ICICI Integration is Implemented)

- **Signature Verification**: Verify ICICI callback signatures
- **Hash Generation**: Implement ICICI-specific hash generation
- **Encryption**: Implement ICICI-specific encryption/decryption
- **Webhook Authentication**: Add webhook signature verification
- **Transaction Verification**: Verify payment status with gateway before marking success

## Database Schema

### Payment Collection

```javascript
{
  orderId: String (unique, indexed),
  transactionId: String (unique, indexed),
  customerId: String (indexed),
  amount: Number,
  currency: String,
  status: String (PENDING | PROCESSING | SUCCESS | FAILED | CANCELLED),
  paymentMode: String (CREDIT_CARD | DEBIT_CARD | NET_BANKING | UPI | WALLET | EMI),
  bankReference: String,
  gatewayTransactionId: String (indexed),
  responseCode: String,
  responseMessage: String,
  rawResponse: Object,
  createdAt: Date,
  updatedAt: Date
}
```

## ICICI Integration Guide

When ICICI credentials become available, follow these steps:

### 1. Update Environment Variables

```bash
PAYMENT_PROVIDER=sandbox

ICICI_MERCHANT_ID=your_actual_merchant_id
ICICI_TERMINAL_ID=your_actual_terminal_id
ICICI_ACCESS_KEY=your_actual_access_key
ICICI_SECRET_KEY=your_actual_secret_key
ICICI_WORKING_KEY=your_actual_working_key
```

### 2. Implement ICICI Service Methods

Update `backend/src/services/ICICIService.ts` with actual ICICI API implementations:

- `createPayment()`: Implement ICICI payment creation API call
- `processCallback()`: Implement callback signature verification
- `checkTransactionStatus()`: Implement status check API call
- `processRefund()`: Implement refund API call

### 3. Update Encryption and Hash Utilities

Update `backend/src/utils/encryption.ts` and `backend/src/utils/hash.ts` with ICICI-specific implementations based on their documentation.

### 4. Test in Sandbox

- Set `PAYMENT_PROVIDER=sandbox`
- Test all payment flows
- Verify callback handling
- Test edge cases

### 5. Deploy to Production

- Set `PAYMENT_PROVIDER=production`
- Update production URLs
- Ensure HTTPS is enabled
- Monitor payment transactions

## Testing

### Manual Testing

1. Start MongoDB
2. Start backend server: `npm run dev`
3. Start frontend: `npm run dev`
4. Navigate to payment page
5. Click "Pay Now"
6. Test mock payment flow

### API Testing

Use Postman or curl to test endpoints:

```bash
# Create order
curl -X POST http://localhost:3001/api/payment/create-order \
  -H "Content-Type: application/json" \
  -d '{"customerId":"CUST123","amount":500,"currency":"INR"}'

# Check status
curl http://localhost:3001/api/payment/status/TXN-XYZ789...

# Get history
curl "http://localhost:3001/api/payment/history?customerId=CUST123"
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Ensure MongoDB is running
   - Check `MONGODB_URI` in `.env`

2. **Payment Configuration Error**
   - Check `PAYMENT_PROVIDER` value
   - Verify all required environment variables are set

3. **Validation Errors**
   - Check request body format
   - Ensure all required fields are present

4. **Rate Limit Exceeded**
   - Wait for rate limit window to expire
   - Adjust `PAYMENT_RATE_LIMIT_MAX_REQUESTS` if needed

## Maintenance

### Regular Tasks

- Monitor payment transaction logs
- Review failed payments
- Check callback success rates
- Update ICICI credentials if rotated
- Review and update rate limits as needed

### Scaling Considerations

- Add database indexes for frequently queried fields
- Implement caching for payment status checks
- Consider message queue for callback processing
- Add monitoring and alerting
- Implement database backup strategy

## Support

For issues related to:
- **ICICI API**: Contact ICICI support
- **Implementation**: Check this documentation and code comments
- **Bugs**: Create an issue in the project repository

## License

This payment integration is part of the Amader Barir Pujo project.
