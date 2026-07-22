# Payment Gateway Integration Documentation

## Overview

This document provides a comprehensive overview of the payment gateway integration for the Amader Barir Pujo website. It covers both Anudan (অনুদান) contributions and Bhog booking payment flows, including all technologies used, detailed payment flows, and backend architecture.

---

## Table of Contents

1. [Technologies Used](#technologies-used)
2. [Architecture Overview](#architecture-overview)
3. [Anudan Payment Flow](#anudan-payment-flow)
4. [Bhog Payment Flow](#bhog-payment-flow)
5. [Backend Payment Architecture](#backend-payment-architecture)
6. [Frontend Payment Components](#frontend-payment-components)
7. [Data Models](#data-models)
8. [API Endpoints](#api-endpoints)
9. [Security Considerations](#security-considerations)
10. [Error Handling](#error-handling)

---

## Technologies Used

### Backend Technologies

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time Updates**: Server-Sent Events (SSE)
- **Concurrency Control**: async-mutex (for mutex locks)
- **External Integration**: Google Sheets API (for transaction logging)
- **Authentication**: JWT (for Google Sheets service account)
- **Security**: Helmet (HTTP headers), CORS, rate limiting
- **Environment**: dotenv for configuration management

### Frontend Technologies

- **Framework**: React with TypeScript
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Real-time Updates**: EventSource API (SSE client)
- **UI Notifications**: react-toastify
- **PDF Generation**: html2pdf.js (for receipts)
- **Animations**: Framer Motion
- **State Management**: React hooks (useState, useEffect, useRef)

### Deployment

- **Backend**: Render.com
- **Frontend**: Vercel
- **Database**: MongoDB Atlas

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────┐
│   Frontend      │
│   (React)       │
└────────┬────────┘
         │ HTTP/HTTPS
         │ SSE (for Anudan)
         ▼
┌─────────────────┐
│   Backend API   │
│   (Express)     │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐ ┌──────────────┐
│ MongoDB │ │ Google Sheets│
│ (Atlas) │ │   (Logging)  │
└─────────┘ └──────────────┘
```

### Key Design Patterns

1. **In-Memory State with Persistence**: Anudan uses in-memory state for real-time remaining amounts, persisted to MongoDB
2. **Mutex-Protected Transactions**: Prevents race conditions in concurrent payments
3. **SSE for Real-Time Updates**: Server-Sent Events push remaining amount updates to clients
4. **Dual Storage Strategy**: MongoDB for persistence, Google Sheets for human-readable logs
5. **Idempotency**: Duplicate transaction detection prevents double payments

---

## Anudan Payment Flow

### Flow Diagram

```
User selects Anudan categories
         ↓
User fills UserInfoForm
         ↓
User clicks "Proceed to Payment"
         ↓
Frontend validates basket and user info
         ↓
Frontend generates orderId and transactionId
         ↓
Frontend calls POST /api/anudan/paid-booking
         ↓
Backend: Check duplicate transaction
         ↓
Backend: Reserve amounts from in-memory state (mutex-protected)
         ↓
Backend: Save to MongoDB
         ↓
Backend: Broadcast updates via SSE
         ↓
Backend: Log to Google Sheets (non-critical)
         ↓
Backend returns success with new remaining amounts
         ↓
Frontend clears basket and shows receipt
         ↓
User can download PDF receipt
```

### Detailed Step-by-Step Flow

#### 1. User Selection Phase

**File**: `frontend/src/pages/Anudan.tsx`

- User browses Anudan categories (Panchami, Soshti, Saptami, etc.)
- Each category displays:
  - Target amount (from `anudanData.ts`)
  - Remaining amount (fetched via SSE)
  - Collected amount (calculated: target - remaining)
  - Progress bar (percentage)
- User selects items and enters contribution amount
- Items are added to basket state

#### 2. User Information Phase

**File**: `frontend/src/components/ui/UserInfoForm.tsx`

- User fills in:
  - Name (required)
  - Phone number (required)
  - Email (required)
- Form validation ensures all fields are filled
- `isUserInfoFilled` state enables the payment button

#### 3. Payment Initiation

**File**: `frontend/src/pages/Anudan.tsx` (handlePayment function)

```typescript
const handlePayment = async () => {
  // 1. Validate user form
  if (!userInfoFormRef.current.validateForm()) return;
  
  // 2. Check basket is not empty
  if (basket.length === 0) {
    toast.error('Your basket is empty');
    return;
  }
  
  // 3. Generate IDs
  const orderId = `ANUDAN-${Date.now()}`;
  const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  const timestamp = new Date().toISOString();
  
  // 4. Calculate total
  const totalAmount = basket.reduce((sum, item) => sum + item.amount, 0);
  
  // 5. Prepare categories array
  const categories = basket.map(item => ({
    day: item.card.day,
    amount: item.amount,
    items: item.card.items,
    remark: ''
  }));
  
  // 6. Call backend API
  const response = await fetch(`${API_URL}/api/anudan/paid-booking`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ categories, userInfo, orderId, transactionId, timestamp })
  });
};
```

#### 4. Backend Processing - Step 1: Duplicate Check

**File**: `backend/src/controllers/AnudanController.ts` (handlePaidAnudan)

```typescript
// Validate required fields
if (!categories || !Array.isArray(categories) || categories.length === 0) {
  res.status(400).json({ success: false, error: 'Invalid booking data' });
  return;
}

if (!userInfo || !orderId || !transactionId) {
  res.status(400).json({ success: false, error: 'Missing required fields' });
  return;
}
```

**File**: `backend/src/services/anudanPayment.service.ts` (confirmPayment)

```typescript
// Step 2: Check for duplicate transaction (idempotency)
const existingPayment = await this.anudanRepository.getPaymentByTransactionId(transactionId);
if (existingPayment) {
  console.log(`Duplicate transaction detected: ${transactionId}`);
  return duplicateTransactionError(transactionId);
}
```

#### 5. Backend Processing - Step 2: Reserve Amounts

**File**: `backend/src/services/anudanPayment.service.ts`

```typescript
// Step 3: Reserve amounts for all categories
const reservations = [];
for (const category of categories) {
  const campaignId = category.day;
  const amount = category.amount;

  // Try to reserve (mutex-protected)
  const reserveResult = await anudanStateService.tryReserve(campaignId, amount);

  if (!reserveResult.ok) {
    // Reservation failed - rollback all previous reservations
    console.log(`Insufficient remaining amount for ${campaignId}: requested ₹${amount}, remaining ₹${reserveResult.remaining}`);
    
    // Rollback all previous successful reservations
    for (const prevReservation of reservations) {
      await anudanStateService.rollback(prevReservation.campaignId, prevReservation.amount);
    }
    
    return insufficientAmountError(reserveResult.remaining, amount);
  }

  reservations.push({
    campaignId,
    amount,
    remaining: reserveResult.remaining
  });
}
```

**File**: `backend/src/services/anudanState.service.ts` (tryReserve)

```typescript
async tryReserve(campaignId: string, amount: number): Promise<{ ok: true; remaining: number } | { ok: false; remaining: number }> {
  const campaignState = this.state.get(campaignId);
  
  // Acquire mutex with timeout to prevent deadlocks (5 second timeout)
  const timedMutex = withTimeout(campaignState.mutex, 5000);
  let release: (() => void) | null = null;
  
  try {
    release = await timedMutex.acquire();
  } catch (error) {
    return { ok: false, remaining: campaignState.remainingAmount };
  }

  try {
    // CRITICAL SECTION: Check and decrement atomically
    if (amount > campaignState.remainingAmount) {
      // Insufficient remaining amount - do not decrement
      return { ok: false, remaining: campaignState.remainingAmount };
    }

    // Sufficient amount - decrement and return new value
    campaignState.remainingAmount -= amount;
    return { ok: true, remaining: campaignState.remainingAmount };
  } finally {
    // ALWAYS release mutex, even on error
    if (release) {
      release();
    }
  }
}
```

#### 6. Backend Processing - Step 3: Save to MongoDB

**File**: `backend/src/services/anudanPayment.service.ts`

```typescript
try {
  // Step 5: Save to MongoDB as single payment record with all categories
  await this.anudanRepository.createPayment({
    orderId,
    transactionId,
    timestamp: timestamp || new Date().toISOString(),
    userInfo,
    categories,
    totalAmount,
  });

  // Step 7: Broadcast updates via SSE for each category
  for (const reservation of reservations) {
    anudanStateService.broadcast(reservation.campaignId, reservation.remaining);
    console.log(`Payment confirmed for ${reservation.campaignId}: ₹${reservation.amount}, remaining: ₹${reservation.remaining}`);
  }

  return successResponse({
    categories: reservations.map(r => ({
      campaignId: r.campaignId,
      amount: r.amount,
      remaining: r.remaining,
      status: 'success',
    })),
    totalAmount,
    timestamp,
    userInfo,
    orderId,
    transactionId,
  });
} catch (dbError) {
  // Step 6: DB save failed - rollback all reservations
  console.error('DB save failed, rolling back all reservations:', dbError);
  for (const reservation of reservations) {
    await anudanStateService.rollback(reservation.campaignId, reservation.amount);
  }
  throw dbError;
}
```

#### 7. Backend Processing - Step 4: Google Sheets Logging

**File**: `backend/src/controllers/AnudanController.ts`

```typescript
// Add to Google Sheets (non-critical, don't fail if this errors)
try {
  await this.sheetsService.initialize();

  const headers = [
    'Timestamp',
    'Order ID',
    'Transaction ID',
    'Customer Name',
    'Mobile Number',
    'Email',
    'Category',
    'Amount (₹)',
    'Remark',
  ];
  await this.sheetsService.createSheetIfNotExists(this.SHEET_NAME, headers);

  // Add each category as a separate row, but only show payer info once
  const rowPromises = categories.map((category, index) => {
    const rowData = [
      timestamp || new Date().toISOString(),
      orderId,
      transactionId,
      index === 0 ? userInfo.name || '' : '', // Only show name on first row
      index === 0 ? userInfo.phone || '' : '', // Only show phone on first row
      index === 0 ? userInfo.email || '' : '', // Only show email on first row
      category.day,
      category.amount,
      category.remark || ''
    ];
    return this.sheetsService.appendRow(this.SHEET_NAME, rowData);
  });
  await Promise.all(rowPromises);
} catch (sheetsError) {
  console.error('Failed to add to Google Sheets (non-critical):', sheetsError);
  // Don't fail the payment if sheets update fails
}
```

#### 8. Frontend Response Handling

**File**: `frontend/src/pages/Anudan.tsx`

```typescript
if (response.ok) {
  // Refresh remaining amounts after successful payment
  try {
    const remainingResponse = await fetch(`${API_URL}/api/anudan/remaining`);
    const remainingData = await remainingResponse.json();
    if (remainingData.success && remainingData.data && remainingData.data.remainingAmounts) {
      setAllRemainingAmounts(remainingData.data.remainingAmounts);
    }
  } catch (error) {
    console.error('Failed to refresh remaining amounts after payment:', error);
  }

  // Clear basket and hide user info form
  setBasket([]);
  setShowUserInfoForm(false);

  // Show receipt directly
  setReceiptData(anudanReceiptData);
  setShowReceipt(true);
}
```

#### 9. Receipt Display and Download

**File**: `frontend/src/components/Payment/AnudanReceipt.tsx`

- Displays receipt with:
  - Order ID
  - Transaction ID
  - Date & Time
  - User information (name, phone, email)
  - Categories contributed to
  - Total amount
- Download button generates PDF using html2pdf.js

---

## Bhog Payment Flow

### Flow Diagram

```
User selects Bhog category and quantity
         ↓
User fills UserInfoForm
         ↓
User clicks "Proceed to Payment"
         ↓
Frontend validates booking and user info
         ↓
Frontend generates orderId and transactionId
         ↓
Frontend calls POST /api/bhog/paid-booking
         ↓
Backend: Validate booking data
         ↓
Backend: Log to Google Sheets
         ↓
Backend: Save to MongoDB
         ↓
Backend: Update sheet summary calculations
         ↓
Backend returns success with transactionId
         ↓
Frontend redirects to mock payment page
         ↓
User selects payment result (SUCCESS/FAILED/CANCELLED)
         ↓
Frontend calls POST /api/payment/callback
         ↓
Backend processes callback
         ↓
Frontend redirects to success/failure page
         ↓
User can download PDF receipt
```

### Detailed Step-by-Step Flow

#### 1. User Selection Phase

**File**: `frontend/src/components/ui/BhogBookingSection.tsx`

- User selects Bhog category (e.g., "Book Ashtami Bhog")
- User enters quantities for:
  - Adult plates
  - Children 0-5 plates (free)
  - Children 5+ plates
  - Senior citizen plates
- Total amount calculated automatically
- Free bookings (children 0-5 only) bypass payment flow

#### 2. Free Booking Flow

**File**: `frontend/src/components/ui/BhogBookingSection.tsx` (handleFreeBooking)

```typescript
const handleFreeBooking = async () => {
  if (!userInfoFormRef.current.validateForm()) return;

  const userInfo = userInfoFormRef.current.getUserInfo();
  setIsLoading(true);

  const orderId = `BHG-${Date.now()}`;
  const transactionId = `BHG-FREE-${Date.now()}`;
  const timestamp = new Date().toISOString();

  const bookingDetails = {
    orderId,
    transactionId,
    title,
    categories: categories.map(cat => ({
      ...cat,
      quantity: bookings[cat.id] || 0
    })).filter(cat => cat.quantity > 0),
    totalAmount,
    totalCount,
    timestamp,
    isFree: true,
    userInfo
  };

  try {
    const response = await axios.post(`${API_URL}/api/bhog/free-booking`, bookingDetails);
    
    if (response.data.success) {
      // Reset form
      const resetState: BhogBookingState = {};
      categories.forEach((cat) => {
        resetState[cat.id] = 0;
      });
      setBookings(resetState);
      setIsUserInfoFilled(false);
      toast.success('Free bhog booking recorded successfully!');
    } else {
      throw new Error('Failed to record free booking');
    }
  } catch (err: any) {
    toast.error(`Failed to record free booking: ${err.response?.data?.error || err.message || 'Unknown error'}`);
  } finally {
    setIsLoading(false);
  }
};
```

**File**: `backend/src/controllers/BhogController.ts` (handleFreeBooking)

```typescript
async handleFreeBooking(req: Request, res: Response): Promise<void> {
  try {
    const { title, categories, totalAmount, totalCount, timestamp, isFree, userInfo } = req.body;

    // Validate required fields
    if (!title || !categories || !Array.isArray(categories) || categories.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Invalid booking data. Title and categories are required.'
      });
      return;
    }

    // Ensure this is indeed a free booking
    if (!isFree || totalAmount !== 0) {
      res.status(400).json({
        success: false,
        error: 'Invalid free booking request.'
      });
      return;
    }

    // Initialize sheets service
    await this.sheetsService.initialize();

    // Determine sheet name based on booking title
    const sheetName = this.getSheetNameFromTitle(title);

    // Create sheet if it doesn't exist with headers
    const headers = [
      'Timestamp',
      'Order ID',
      'Transaction ID',
      'Customer Name',
      'Mobile Number',
      'Email',
      'Adult Plates',
      'Children 0-5 Plates',
      'Children 5+ Plates',
      'Senior Citizen Plates',
      'Total Plates',
      'Total Amount Paid (₹)',
      'Payment Status'
    ];
    await this.sheetsService.createSheetIfNotExists(sheetName, headers);

    // Extract bhog quantities with defaults
    const quantities = this.extractBhogQuantities(categories);

    // Append booking data to sheet (empty Order ID and Transaction ID for free bookings)
    const rowData = [
      timestamp || new Date().toISOString(),
      '', // Order ID (empty for free bookings)
      '', // Transaction ID (empty for free bookings)
      userInfo?.name || '',
      userInfo?.phone || '',
      userInfo?.email || '',
      quantities.adult,
      quantities.children05,
      quantities.children5Plus,
      quantities.seniorCitizen,
      totalCount,
      totalAmount,
      isFree ? 'Free' : 'Paid'
    ];
    await this.sheetsService.appendRow(sheetName, rowData);

    // Store booking in MongoDB
    await this.bhogRepository.createPayment({
      orderId: '',
      transactionId: '',
      timestamp: timestamp || new Date().toISOString(),
      userInfo: userInfo || { name: '', phone: '', email: '' },
      bookings: [{
        day: title,
        amount: totalAmount,
        quantity: totalCount,
        remark: 'Free booking'
      }],
      totalAmount
    });

    // Update summary calculations at the end of the sheet
    await this.updateSheetSummary(sheetName);

    res.status(200).json({
      success: true,
      message: 'Free bhog booking recorded successfully',
      data: {
        title,
        categories,
        totalAmount,
        totalCount,
        timestamp,
        userInfo
      }
    });
  } catch (error: any) {
    console.error('Error handling free bhog booking:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to record free bhog booking'
    });
  }
}
```

#### 3. Paid Booking Flow

**File**: `frontend/src/components/ui/BhogBookingSection.tsx` (handlePayment)

```typescript
const handlePayment = async () => {
  if (!userInfoFormRef.current) return;
  if (!userInfoFormRef.current.validateForm()) return;

  const userInfo = userInfoFormRef.current.getUserInfo();
  setIsLoading(true);

  // Generate order and transaction IDs
  const orderId = `BHG-${Date.now()}`;
  const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  const timestamp = new Date().toISOString();

  const bookingDetails = {
    orderId,
    transactionId,
    title,
    categories: categories.map(cat => ({
      ...cat,
      quantity: bookings[cat.id] || 0
    })).filter(cat => cat.quantity > 0),
    totalAmount,
    totalCount,
    timestamp,
    isFree: false,
    userInfo
  };

  try {
    // Call backend to initiate payment
    const response = await axios.post(`${API_URL}/api/bhog/paid-booking`, bookingDetails);

    if (response.data.success) {
      // Redirect to payment gateway or payment page
      if (response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      } else if (response.data.data?.transactionId) {
        // Redirect to mock payment page if using mock payment
        window.location.href = `/mock-payment/${response.data.data.transactionId}`;
      } else {
        throw new Error('No payment URL or transaction ID returned from backend');
      }
    } else {
      throw new Error(response.data.message || 'Failed to initiate payment');
    }
  } catch (err: any) {
    console.error('Payment initiation failed:', err);
    toast.error(`Failed to initiate payment: ${err.response?.data?.error || err.message || 'Unknown error'}`);
  } finally {
    setIsLoading(false);
  }
};
```

**File**: `backend/src/controllers/BhogController.ts` (handlePaidBooking)

```typescript
async handlePaidBooking(req: Request, res: Response): Promise<void> {
  try {
    const { title, categories, totalAmount, totalCount, timestamp, isFree, userInfo, orderId, transactionId } = req.body;

    // Validate required fields
    if (!title || !categories || !Array.isArray(categories) || categories.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Invalid booking data. Title and categories are required.'
      });
      return;
    }

    // Validate payment info for paid bookings
    if (isFree === false && (!orderId || !transactionId)) {
      res.status(400).json({
        success: false,
        error: 'Order ID and Transaction ID are required for paid bookings.'
      });
      return;
    }

    // Initialize sheets service
    await this.sheetsService.initialize();

    // Determine sheet name based on booking title
    const sheetName = this.getSheetNameFromTitle(title);

    // Create sheet if it doesn't exist with headers
    const headers = [
      'Timestamp',
      'Order ID',
      'Transaction ID',
      'Customer Name',
      'Mobile Number',
      'Email',
      'Adult Plates',
      'Children 0-5 Plates',
      'Children 5+ Plates',
      'Senior Citizen Plates',
      'Total Plates',
      'Total Amount Paid (₹)',
      'Payment Status'
    ];
    await this.sheetsService.createSheetIfNotExists(sheetName, headers);

    // Extract bhog quantities with defaults
    const quantities = this.extractBhogQuantities(categories);

    // Append booking data to sheet
    const rowData = [
      timestamp || new Date().toISOString(),
      orderId || '',
      transactionId || '',
      userInfo?.name || '',
      userInfo?.phone || '',
      userInfo?.email || '',
      quantities.adult,
      quantities.children05,
      quantities.children5Plus,
      quantities.seniorCitizen,
      totalCount,
      totalAmount,
      isFree ? 'Free' : 'Paid'
    ];
    await this.sheetsService.appendRow(sheetName, rowData);

    // Store booking in MongoDB
    await this.bhogRepository.createPayment({
      orderId: orderId || '',
      transactionId: transactionId || '',
      timestamp: timestamp || new Date().toISOString(),
      userInfo: userInfo || { name: '', phone: '', email: '' },
      bookings: [{
        day: title,
        amount: totalAmount,
        quantity: totalCount,
        remark: 'Paid booking'
      }],
      totalAmount
    });

    // Update summary calculations at the end of the sheet
    await this.updateSheetSummary(sheetName);

    res.status(200).json({
      success: true,
      message: 'Paid bhog booking recorded successfully',
      data: {
        title,
        categories,
        totalAmount,
        totalCount,
        timestamp,
        userInfo,
        orderId,
        transactionId
      }
    });
  } catch (error: any) {
    console.error('Error handling paid bhog booking:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to record paid bhog booking'
    });
  }
}
```

#### 4. Mock Payment Page

**File**: `frontend/src/components/Payment/MockPayment.tsx`

```typescript
const handlePaymentResult = async (status: 'SUCCESS' | 'FAILED' | 'CANCELLED') => {
  setLoading(true);

  try {
    // Call backend callback API
    await axios.post(
      `${API_URL}/api/payment/callback`,
      {
        transactionId,
        status,
        paymentMode: 'CREDIT_CARD',
        bankReference: `MOCK-BANK-${Date.now()}`,
      }
    );

    // Redirect to result page
    if (status === 'SUCCESS') {
      navigate(`/payment/success?transactionId=${transactionId}`);
    } else if (status === 'FAILED') {
      navigate(`/payment/failure?transactionId=${transactionId}`);
    } else {
      navigate(`/payment/failure?transactionId=${transactionId}&errorMessage=Payment was cancelled`);
    }
  } catch (error) {
    console.error('Error processing mock payment:', error);
    navigate(`/payment/failure?transactionId=${transactionId}&errorMessage=Failed to process payment`);
  } finally {
    setLoading(false);
  }
};
```

#### 5. Receipt Display

**File**: `frontend/src/components/Payment/BhogReceipt.tsx`

- Displays receipt with:
  - Order ID
  - Transaction ID
  - Date & Time
  - User information
  - Item details (category, quantity, price)
  - Total amount
- Download button generates PDF using html2pdf.js

---

## Backend Payment Architecture

### Service Layer Architecture

```
Controller Layer
    ↓
Service Layer
    ↓
Repository Layer
    ↓
Database Layer
```

### Key Services

#### 1. AnudanStateService

**Purpose**: Manages in-memory state for Anudan remaining amounts with concurrency control.

**Key Features**:
- In-memory storage of remaining amounts per campaign
- Mutex-protected operations to prevent race conditions
- SSE broadcasting for real-time updates
- Automatic initialization from MongoDB on server boot
- Heartbeat mechanism to keep SSE connections alive

**Key Methods**:
- `initialize()`: Loads collected amounts from MongoDB and calculates remaining
- `getRemaining(campaignId)`: Synchronous read of remaining amount
- `tryReserve(campaignId, amount)`: Mutex-protected amount reservation
- `rollback(campaignId, amount)`: Adds amount back to remaining (on failure)
- `broadcast(campaignId, remainingAmount)`: Sends SSE update to all subscribers
- `addSubscriber(campaignId, subscriberId, response)`: Registers SSE client
- `removeSubscriber(campaignId, subscriberId)`: Unregisters SSE client

**Concurrency Control**:
```typescript
// Uses async-mutex with 5-second timeout
const timedMutex = withTimeout(campaignState.mutex, 5000);
let release = await timedMutex.acquire();

try {
  // Critical section - check and decrement atomically
  if (amount > campaignState.remainingAmount) {
    return { ok: false, remaining: campaignState.remainingAmount };
  }
  campaignState.remainingAmount -= amount;
  return { ok: true, remaining: campaignState.remainingAmount };
} finally {
  // Always release mutex
  release();
}
```

#### 2. AnudanPaymentService

**Purpose**: Business logic for Anudan payments with idempotency and rollback.

**Key Features**:
- Duplicate transaction detection (idempotency)
- Multi-category atomic reservation
- Automatic rollback on failure
- MongoDB persistence
- SSE broadcast triggering

**Payment Flow**:
1. Check for duplicate transaction by transactionId
2. Try to reserve amounts for all categories (mutex-protected)
3. If any reservation fails, rollback all previous reservations
4. If all reservations succeed, save to MongoDB
5. If DB save fails, rollback all reservations
6. If DB save succeeds, broadcast SSE updates
7. Return success with new remaining amounts

#### 3. GoogleSheetsService

**Purpose**: Handles all Google Sheets API operations for transaction logging.

**Key Features**:
- JWT authentication with service account
- Automatic sheet creation with headers
- Row append operations
- Row update operations
- Sheet data retrieval
- Summary calculation updates

**Authentication**:
```typescript
this.auth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
```

### Repository Layer

#### AnudanRepository

**Methods**:
- `createPayment(paymentData)`: Creates new Anudan payment record
- `getPaymentByOrderId(orderId)`: Retrieves payment by order ID
- `getPaymentByTransactionId(transactionId)`: Retrieves payment by transaction ID (for idempotency)
- `getCollectedAmountsByCategory()`: Aggregates collected amounts per category
- `getPaymentsByCategory(category)`: Gets all payments for a category
- `getTotalCollectedAmount()`: Gets total collected across all categories

#### BhogRepository

**Methods**:
- `createPayment(paymentData)`: Creates new Bhog payment record
- `getPaymentByOrderId(orderId)`: Retrieves payment by order ID
- `getPaymentByTransactionId(transactionId)`: Retrieves payment by transaction ID
- `getCollectedAmountsByDay()`: Aggregates collected amounts per day
- `getBookingsByDay(day)`: Gets all bookings for a day
- `getTotalCollectedAmount()`: Gets total collected across all days

### Server Initialization

**File**: `backend/src/server.ts`

```typescript
const startServer = async () => {
  try {
    // 1. Connect to database
    await connectDatabase();

    // 2. Initialize payment configuration
    initializePaymentConfig();

    // 3. Initialize Anudan state service (loads from MongoDB)
    await anudanStateService.initialize();

    // 4. Start Express server
    app.listen(PORT, () => {
      console.log(`Server running on the port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};
```

---

## Frontend Payment Components

### Anudan Components

#### Anudan.tsx

**Purpose**: Main Anudan page with basket management and payment flow.

**State Management**:
- `basket`: Array of selected Anudan items
- `allRemainingAmounts`: Remaining amounts for all categories
- `showUserInfoForm`: Toggle for user info form visibility
- `isProcessing`: Payment processing state
- `showReceipt`: Receipt display state

**Real-Time Updates**:
- Uses `useAnudanRemaining` hook for SSE connection
- Falls back to polling if SSE fails
- Refreshes remaining amounts every 15 seconds via polling

#### AnudanCard.tsx

**Purpose**: Displays individual Anudan category card.

**Calculations**:
```typescript
const totalCost = card.items.reduce((acc, item) => {
  const num = parseInt(item.cost.replace(/\D/g, ''), 10) || 0;
  return acc + num;
}, 0);

const isFullySponsored = remainingAmount <= 0;
const paidAmount = totalCost - remainingAmount;
const progressPercent = totalCost > 0 ? Math.min(100, (paidAmount / totalCost) * 100) : 0;
```

#### AnudanReceipt.tsx

**Purpose**: Generates and displays Anudan contribution receipt.

**Features**:
- Displays all contribution details
- PDF download using html2pdf.js
- Responsive design

### Bhog Components

#### BhogBookingSection.tsx

**Purpose**: Reusable component for Bhog booking with payment integration.

**State Management**:
- `bookings`: Quantity per category
- `isUserInfoFilled`: User form completion state
- `isLoading`: Loading state for API calls

**Payment Flow**:
- Free bookings: Direct API call to `/api/bhog/free-booking`
- Paid bookings: API call to `/api/bhog/paid-booking` then redirect to payment

#### BhogReceipt.tsx

**Purpose**: Generates and displays Bhog booking receipt.

**Features**:
- Displays booking details with quantities
- PDF download using html2pdf.js
- Category-wise breakdown

### Payment Result Components

#### MockPayment.tsx

**Purpose**: Simulates payment gateway for testing.

**Features**:
- Displays payment details
- Three options: Success, Failure, Cancel
- Calls backend callback API
- Redirects to appropriate result page

#### PaymentSuccess.tsx

**Purpose**: Displays success message and receipt.

**Features**:
- Differentiates between Bhog and Anudan payments
- Shows appropriate receipt component
- Download receipt option
- Continue to home option

#### PaymentFailure.tsx

**Purpose**: Displays failure message and retry options.

**Features**:
- Displays error message
- Retry button
- Contact support option

### Real-Time Updates Hook

#### useAnudanRemaining.ts

**Purpose**: Manages SSE connection for real-time remaining amount updates.

**Features**:
- SSE connection with exponential backoff reconnection
- Polling fallback after 5 consecutive SSE failures
- Visibility-aware polling (pauses when tab hidden)
- Manual refresh function
- Automatic cleanup on unmount

**Reconnection Strategy**:
```typescript
// Exponential backoff: 1s → 2s → 4s → 8s → 16s → 30s (capped)
const delay = Math.min(backoffRef.current * 2, 30000);

// Switch to polling after 5 failures
if (consecutiveFailuresRef.current >= 5) {
  startPolling();
  return;
}
```

---

## Data Models

### AnudanPayment Model

**File**: `backend/src/models/AnudanPayment.ts`

```typescript
interface IAnudanPayment extends Document {
  orderId: string;              // Unique order identifier
  transactionId: string;        // Unique transaction identifier
  timestamp: string;            // ISO timestamp
  userInfo: {
    name: string;
    phone: string;
    email: string;
  };
  categories: Array<{
    day: string;                // e.g., "Panchami", "Soshti"
    amount: number;             // Contribution amount
    items: Array<{
      name: string;             // Item name
      cost: string;             // Item cost as string
    }>;
    remark: string;             // Optional remark
  }>;
  totalAmount: number;          // Total contribution amount
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
- `transactionId: 1` (for idempotency check)
- `categories.day: 1` (for category queries)
- `createdAt: -1` (for chronological queries)

### BhogPayment Model

**File**: `backend/src/models/BhogPayment.ts`

```typescript
interface IBhogPayment extends Document {
  orderId: string;              // Unique order identifier
  transactionId: string;        // Unique transaction identifier
  timestamp: string;            // ISO timestamp
  userInfo: {
    name: string;
    phone: string;
    email: string;
  };
  bookings: Array<{
    day: string;                // e.g., "Book Ashtami Bhog"
    amount: number;             // Total amount
    quantity: number;           // Total plates
    remark: string;             // e.g., "Free booking", "Paid booking"
  }>;
  totalAmount: number;          // Total amount
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
- `transactionId: 1` (for idempotency check)
- `bookings.day: 1` (for day queries)
- `createdAt: -1` (for chronological queries)

---

## Data Storage

### MongoDB Storage

MongoDB serves as the primary persistence layer for all payment transactions. It stores structured data that can be queried programmatically for analytics, reporting, and application logic.

#### Anudan Payments Collection

**Collection Name**: `anudanpayments`

**Document Structure**:
```json
{
  "_id": ObjectId("..."),
  "orderId": "ANUDAN-1721643828212",
  "transactionId": "TXN-1721643828212-LN1N73J5L",
  "timestamp": "2026-07-22T07:03:48.212Z",
  "userInfo": {
    "name": "Durgesh Suryawanshi",
    "phone": "9405807469",
    "email": "durgesh.s@proplusdata.co"
  },
  "categories": [
    {
      "day": "Panchami",
      "amount": 5000,
      "items": [
        { "name": "Flowers", "cost": "2000" },
        { "name": "Fruits", "cost": "3000" }
      ],
      "remark": "General contribution"
    },
    {
      "day": "Soshti",
      "amount": 10000,
      "items": [
        { "name": "Puja Items", "cost": "10000" }
      ],
      "remark": ""
    }
  ],
  "totalAmount": 15000,
  "createdAt": ISODate("2026-07-22T07:03:48.212Z"),
  "updatedAt": ISODate("2026-07-22T07:03:48.212Z")
}
```

**Indexes**:
- `transactionId: 1` - Unique index for idempotency checks
- `orderId: 1` - Unique index for order lookups
- `categories.day: 1` - For category-based queries
- `createdAt: -1` - For chronological queries

**Key Features**:
- **Single Payment, Multiple Categories**: One document can contain contributions to multiple Anudan categories
- **Atomic Operations**: All categories in a single payment are saved atomically
- **Timestamp Tracking**: Automatic `createdAt` and `updatedAt` timestamps
- **Flexible Items Array**: Each category can have multiple items with individual costs

#### Bhog Payments Collection

**Collection Name**: `bhogpayments`

**Document Structure**:
```json
{
  "_id": ObjectId("..."),
  "orderId": "BHG-1721643828212",
  "transactionId": "TXN-1721643828212-LN1N73J5L",
  "timestamp": "2026-07-22T07:03:48.212Z",
  "userInfo": {
    "name": "Durgesh Suryawanshi",
    "phone": "9405807469",
    "email": "durgesh.s@proplusdata.co"
  },
  "bookings": [
    {
      "day": "Book Ashtami Bhog",
      "amount": 630,
      "quantity": 2,
      "remark": "Paid booking"
    }
  ],
  "totalAmount": 630,
  "createdAt": ISODate("2026-07-22T07:03:48.212Z"),
  "updatedAt": ISODate("2026-07-22T07:03:48.212Z")
}
```

**Free Booking Example**:
```json
{
  "_id": ObjectId("..."),
  "orderId": "",
  "transactionId": "",
  "timestamp": "2026-07-22T07:03:48.212Z",
  "userInfo": {
    "name": "John Doe",
    "phone": "9876543210",
    "email": "john@example.com"
  },
  "bookings": [
    {
      "day": "Book Saptami Bhog",
      "amount": 0,
      "quantity": 3,
      "remark": "Free booking"
    }
  ],
  "totalAmount": 0,
  "createdAt": ISODate("2026-07-22T07:03:48.212Z"),
  "updatedAt": ISODate("2026-07-22T07:03:48.212Z")
}
```

**Indexes**:
- `transactionId: 1` - Unique index for idempotency checks
- `orderId: 1` - Unique index for order lookups
- `bookings.day: 1` - For day-based queries
- `createdAt: -1` - For chronological queries

**Key Features**:
- **Free and Paid Bookings**: Same collection handles both free (children 0-5) and paid bookings
- **Quantity Tracking**: Stores plate quantities for different categories
- **Day-Based Organization**: Bookings organized by puja day

#### MongoDB Aggregation Queries

**Collected Amounts by Category (Anudan)**:
```javascript
db.anudanpayments.aggregate([
  { $unwind: '$categories' },
  {
    $group: {
      _id: '$categories.day',
      totalAmount: { $sum: '$categories.amount' }
    }
  }
]);
```

**Collected Amounts by Day (Bhog)**:
```javascript
db.bhogpayments.aggregate([
  { $unwind: '$bookings' },
  {
    $group: {
      _id: '$bookings.day',
      totalAmount: { $sum: '$bookings.amount' }
    }
  }
]);
```

**Total Collected Amount**:
```javascript
db.anudanpayments.aggregate([
  {
    $group: {
      _id: null,
      totalAmount: { $sum: '$totalAmount' }
    }
  }
]);
```

### Google Sheets Storage

Google Sheets serves as a human-readable logging system for transaction records. It provides an easy-to-view interface for administrators to review bookings and contributions without needing database access.

#### Authentication

Google Sheets API uses JWT authentication with a service account:

**Environment Variables**:
- `GOOGLE_SHEETS_SPREADSHEET_ID`: The ID of the Google Sheets spreadsheet
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: Service account email
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`: Service account private key (with `\n` replaced)

**Authentication Flow**:
```typescript
this.auth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

await this.auth.authorize();
```

#### Anudan Contributions Sheet

**Sheet Name**: `Anudan Contributions`

**Sheet Structure**:

| Column | Header | Description | Example |
|--------|--------|-------------|---------|
| A | Timestamp | ISO timestamp of payment | 2026-07-22T07:03:48.212Z |
| B | Order ID | Unique order identifier | ANUDAN-1721643828212 |
| C | Transaction ID | Unique transaction identifier | TXN-1721643828212-LN1N73J5L |
| D | Customer Name | Payer's name | Durgesh Suryawanshi |
| E | Mobile Number | Payer's phone | 9405807469 |
| F | Email | Payer's email | durgesh.s@proplusdata.co |
| G | Category | Anudan category | Panchami |
| H | Amount (₹) | Contribution amount | 5000 |
| I | Remark | Optional remark | General contribution |

**Row Example**:
```
| Timestamp                    | Order ID              | Transaction ID              | Customer Name       | Mobile Number | Email                      | Category  | Amount (₹) | Remark              |
|------------------------------|-----------------------|----------------------------|---------------------|---------------|----------------------------|-----------|------------|---------------------|
| 2026-07-22T07:03:48.212Z     | ANUDAN-1721643828212  | TXN-1721643828212-LN1N73J5L | Durgesh Suryawanshi | 9405807469    | durgesh.s@proplusdata.co   | Panchami  | 5000       | General contribution |
| 2026-07-22T07:03:48.212Z     | ANUDAN-1721643828212  | TXN-1721643828212-LN1N73J5L |                     |               |                            | Soshti    | 10000      |                     |
```

**Key Features**:
- **Multiple Rows per Payment**: If a user contributes to multiple categories, each category gets its own row
- **User Info on First Row Only**: Name, phone, and email only shown on the first row to avoid repetition
- **Same Order/Transaction ID**: All rows from the same payment share the same order and transaction IDs

**Sheet Creation**:
```typescript
const headers = [
  'Timestamp',
  'Order ID',
  'Transaction ID',
  'Customer Name',
  'Mobile Number',
  'Email',
  'Category',
  'Amount (₹)',
  'Remark',
];
await this.sheetsService.createSheetIfNotExists('Anudan Contributions', headers);
```

#### Bhog Booking Sheets

**Sheet Names**: Dynamic based on booking title
- `Panchami Bhog`
- `Saptami Bhog`
- `Ashtami Bhog`
- `Navami Bhog`
- `Durga Puja Bhog`
- `Lakshmi Puja Bhog`
- `Saraswati Puja Bhog`

**Sheet Structure**:

| Column | Header | Description | Example |
|--------|--------|-------------|---------|
| A | Timestamp | ISO timestamp of booking | 2026-07-22T07:03:48.212Z |
| B | Order ID | Unique order identifier | BHG-1721643828212 |
| C | Transaction ID | Unique transaction identifier | TXN-1721643828212-LN1N73J5L |
| D | Customer Name | Booker's name | Durgesh Suryawanshi |
| E | Mobile Number | Booker's phone | 9405807469 |
| F | Email | Booker's email | durgesh.s@proplusdata.co |
| G | Adult Plates | Number of adult plates | 2 |
| H | Children 0-5 Plates | Number of children 0-5 plates (free) | 0 |
| I | Children 5+ Plates | Number of children 5+ plates | 0 |
| J | Senior Citizen Plates | Number of senior citizen plates | 0 |
| K | Total Plates | Total number of plates | 2 |
| L | Total Amount Paid (₹) | Total amount paid | 630 |
| M | Payment Status | Payment status (Free/Paid) | Paid |

**Paid Booking Row Example**:
```
| Timestamp                    | Order ID            | Transaction ID              | Customer Name       | Mobile Number | Email                      | Adult Plates | Children 0-5 Plates | Children 5+ Plates | Senior Citizen Plates | Total Plates | Total Amount Paid (₹) | Payment Status |
|------------------------------|---------------------|----------------------------|---------------------|---------------|----------------------------|--------------|-------------------|-------------------|----------------------|--------------|----------------------|----------------|
| 2026-07-22T07:03:48.212Z     | BHG-1721643828212    | TXN-1721643828212-LN1N73J5L | Durgesh Suryawanshi | 9405807469    | durgesh.s@proplusdata.co   | 2            | 0                 | 0                 | 0                    | 2            | 630                  | Paid           |
```

**Free Booking Row Example**:
```
| Timestamp                    | Order ID | Transaction ID | Customer Name | Mobile Number | Email              | Adult Plates | Children 0-5 Plates | Children 5+ Plates | Senior Citizen Plates | Total Plates | Total Amount Paid (₹) | Payment Status |
|------------------------------|----------|----------------|---------------|---------------|--------------------|--------------|-------------------|-------------------|----------------------|--------------|----------------------|----------------|
| 2026-07-22T07:03:48.212Z     |          |                | John Doe      | 9876543210    | john@example.com   | 0            | 3                 | 0                 | 0                    | 3            | 0                    | Free           |
```

**Summary Row**:
After each booking, a summary row is added at the end of the sheet:

| Column | Value |
|--------|-------|
| A | TOTAL |
| B | (empty) |
| C | (empty) |
| D | (empty) |
| E | (empty) |
| F | (empty) |
| G | Total Adult Plates |
| H | Total Children 0-5 Plates |
| I | Total Children 5+ Plates |
| J | Total Senior Citizen Plates |
| K | Total Plates |
| L | Total Amount |
| M | (empty) |

**Summary Row Example**:
```
| TOTAL | | | | | | | 150 | 45 | 30 | 25 | 250 | 78750 | |
```

**Key Features**:
- **Separate Sheets per Day**: Each puja day has its own sheet for better organization
- **Category-wise Breakdown**: Tracks plates for each category (adult, children, senior)
- **Automatic Summary**: Summary row updated after each booking with totals
- **Free Booking Support**: Free bookings have empty Order ID and Transaction ID

**Sheet Creation**:
```typescript
const headers = [
  'Timestamp',
  'Order ID',
  'Transaction ID',
  'Customer Name',
  'Mobile Number',
  'Email',
  'Adult Plates',
  'Children 0-5 Plates',
  'Children 5+ Plates',
  'Senior Citizen Plates',
  'Total Plates',
  'Total Amount Paid (₹)',
  'Payment Status'
];
await this.sheetsService.createSheetIfNotExists(sheetName, headers);
```

**Summary Update Logic**:
```typescript
private async updateSheetSummary(sheetName: string): Promise<void> {
  const data = await this.sheetsService.getSheetData(sheetName);
  
  if (data.length <= 1) return; // Only header row

  let totalAdult = 0;
  let totalChildren05 = 0;
  let totalChildren5Plus = 0;
  let totalSenior = 0;
  let totalPlates = 0;
  let totalAmount = 0;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] === 'TOTAL') continue; // Skip existing summary
    
    totalAdult += parseInt(row[6]) || 0;
    totalChildren05 += parseInt(row[7]) || 0;
    totalChildren5Plus += parseInt(row[8]) || 0;
    totalSenior += parseInt(row[9]) || 0;
    totalPlates += parseInt(row[10]) || 0;
    totalAmount += parseFloat(row[11]) || 0;
  }

  // Update or add summary row
  const summaryRow = [
    'TOTAL', '', '', '', '', '', '',
    totalAdult, totalChildren05, totalChildren5Plus, totalSenior,
    totalPlates, totalAmount, ''
  ];
  
  // Check if summary exists and update, otherwise append
  const lastRow = data[data.length - 1];
  if (lastRow && lastRow[0] === 'TOTAL') {
    await this.sheetsService.updateRow(sheetName, data.length, summaryRow);
  } else {
    await this.sheetsService.appendRow(sheetName, summaryRow);
  }
}
```

### Storage Strategy Comparison

| Aspect | MongoDB | Google Sheets |
|--------|---------|---------------|
| **Purpose** | Programmatic data storage | Human-readable logging |
| **Access** | API queries only | Web interface + API |
| **Structure** | Nested documents | Flat tabular format |
| **Querying** | Aggregation pipelines | Manual filtering |
| **Real-time** | Yes (in-memory state) | No (append-only) |
| **Backup** | Atlas backups | Google Drive backups |
| **Criticality** | Critical (payment flow depends on it) | Non-critical (logging only) |
| **Failure Handling** | Payment fails if MongoDB fails | Payment succeeds even if Sheets fails |

### Data Synchronization

**Initialization Flow**:
1. Server starts
2. MongoDB connection established
3. AnudanStateService initializes
4. Collected amounts fetched from MongoDB via aggregation
5. Remaining amounts calculated: `remaining = totalCost - collected`
6. In-memory state populated with remaining amounts
7. SSE endpoints become available

**Payment Flow Synchronization**:
1. Payment received
2. Amounts reserved from in-memory state (mutex-protected)
3. MongoDB save attempted
   - Success: Continue
   - Failure: Rollback in-memory state, return error
4. Google Sheets log attempted
   - Success: Continue
   - Failure: Log error, continue (non-critical)
5. SSE broadcast sent to all connected clients
6. Frontend updates remaining amounts in real-time

**No Reverse Sync**: Google Sheets is write-only from the application. Data flows from MongoDB → Google Sheets, never the reverse. MongoDB is the single source of truth.

---

## API Endpoints

### Anudan Endpoints

#### POST /api/anudan/paid-booking

**Purpose**: Process paid Anudan contribution.

**Request Body**:
```typescript
{
  categories: Array<{
    day: string;
    amount: number;
    items: Array<{ name: string; cost: string }>;
    remark: string;
  }>;
  userInfo: {
    name: string;
    phone: string;
    email: string;
  };
  orderId: string;
  transactionId: string;
  timestamp: string;
}
```

**Response** (Success):
```typescript
{
  success: true;
  data: {
    categories: Array<{
      campaignId: string;
      amount: number;
      remaining: number;
      status: 'success';
    }>;
    totalAmount: number;
    timestamp: string;
    userInfo: UserInfo;
    orderId: string;
    transactionId: string;
  }
}
```

**Response** (Insufficient Amount):
```typescript
{
  success: false;
  errorCode: 'INSUFFICIENT_REMAINING_AMOUNT';
  remainingAmount: number;
  requestedAmount: number;
  message: string;
}
```

**Response** (Duplicate Transaction):
```typescript
{
  success: false;
  errorCode: 'DUPLICATE_TRANSACTION';
  transactionId: string;
  message: string;
}
```

#### GET /api/anudan/remaining

**Purpose**: Get real-time remaining amounts for all Anudan categories.

**Response**:
```typescript
{
  success: true;
  data: {
    remainingAmounts: {
      'Panchami': number;
      'Soshti': number;
      'Saptami': number;
      'Ashtami': number;
      'Sondhi Pujo': number;
      'Navami': number;
      'Dasami': number;
      'Panchadin Anudan': number;
    }
  }
}
```

**Rate Limiting**: 60 requests per minute per IP

#### GET /api/anudan/remaining-single?campaignId={campaignId}

**Purpose**: Get remaining amount for a specific campaign.

**Response**:
```typescript
{
  success: true;
  data: {
    remainingAmount: number;
  }
}
```

**Rate Limiting**: 60 requests per minute per IP

#### GET /api/anudan/events?campaignId={campaignId}

**Purpose**: SSE endpoint for real-time remaining amount updates.

**Response**: Server-Sent Events stream

**Event Format**:
```
event: remaining-update
data: {"remainingAmount": 12345}

: heartbeat
```

**Rate Limiting**: 10 requests per minute per IP

### Bhog Endpoints

#### POST /api/bhog/free-booking

**Purpose**: Record free Bhog booking (children 0-5 only).

**Request Body**:
```typescript
{
  title: string;
  categories: Array<{
    id: string;
    title: string;
    price: number;
    description: string;
    max: number;
    quantity: number;
  }>;
  totalAmount: number;          // Must be 0
  totalCount: number;
  timestamp: string;
  isFree: true;                // Must be true
  userInfo: {
    name: string;
    phone: string;
    email: string;
  };
  orderId: string;
  transactionId: string;
}
```

**Response**:
```typescript
{
  success: true;
  message: 'Free bhog booking recorded successfully';
  data: {
    title: string;
    categories: Array;
    totalAmount: number;
    totalCount: number;
    timestamp: string;
    userInfo: UserInfo;
  }
}
```

#### POST /api/bhog/paid-booking

**Purpose**: Record paid Bhog booking.

**Request Body**:
```typescript
{
  title: string;
  categories: Array<{
    id: string;
    title: string;
    price: number;
    description: string;
    max: number;
    quantity: number;
  }>;
  totalAmount: number;
  totalCount: number;
  timestamp: string;
  isFree: false;
  userInfo: {
    name: string;
    phone: string;
    email: string;
  };
  orderId: string;
  transactionId: string;
}
```

**Response**:
```typescript
{
  success: true;
  message: 'Paid bhog booking recorded successfully';
  data: {
    title: string;
    categories: Array;
    totalAmount: number;
    totalCount: number;
    timestamp: string;
    userInfo: UserInfo;
    orderId: string;
    transactionId: string;
  }
}
```

### Payment Callback Endpoint

#### POST /api/payment/callback

**Purpose**: Handle payment gateway callback (for mock payment).

**Request Body**:
```typescript
{
  transactionId: string;
  status: 'SUCCESS' | 'FAILED' | 'CANCELLED';
  paymentMode: string;
  bankReference: string;
}
```

**Response**:
```typescript
{
  success: true;
  message: string;
}
```

---

## Security Considerations

### 1. CORS Configuration

**File**: `backend/src/server.ts`

```typescript
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [
        'https://amader-barir-pujo-2026-new-test.vercel.app',
        'https://amader-barir-pujo-2026-new-9257.vercel.app',
        'https://amader-barir-pujo-2026-new.onrender.com',
        'https://amader-barir-pujo-2026-new-icici.onrender.com'
      ]
    : [
        'http://localhost:5173',
        'http://localhost:3000'
      ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
}));
```

### 2. Rate Limiting

**File**: `backend/src/middleware/rateLimit.ts`

- Remaining amount endpoint: 60 requests/minute
- SSE endpoint: 10 requests/minute
- Payment endpoint: Additional rate limiting

### 3. Input Validation

- All required fields validated before processing
- Type checking on all inputs
- Amount validation (must be positive numbers)
- Email format validation
- Phone number validation

### 4. Idempotency

- Duplicate transaction detection via `transactionId`
- Prevents double payments on network retries
- Returns existing payment data if duplicate detected

### 5. Concurrency Control

- Mutex-protected operations prevent race conditions
- 5-second timeout on mutex acquisition prevents deadlocks
- Automatic rollback on failure prevents data inconsistency

### 6. Data Encryption

- MongoDB Atlas uses TLS encryption
- Google Sheets API uses HTTPS
- Environment variables for sensitive data

### 7. Security Headers

**File**: `backend/src/server.ts`

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

---

## Error Handling

### Frontend Error Handling

#### 1. Network Errors

```typescript
try {
  const response = await fetch(`${API_URL}/api/anudan/paid-booking`, {...});
} catch (error) {
  console.error('Payment failed:', error);
  toast.error('Failed to process payment. Please try again.');
}
```

#### 2. Validation Errors

```typescript
if (!userInfoFormRef.current.validateForm()) {
  toast.error('Please fill in all required fields');
  return;
}
```

#### 3. Backend Errors

```typescript
if (!response.ok) {
  const errorData = await response.json();
  toast.error(errorData.error || 'Payment failed');
  return;
}
```

### Backend Error Handling

#### 1. Validation Errors

```typescript
if (!categories || !Array.isArray(categories) || categories.length === 0) {
  res.status(400).json({
    success: false,
    error: 'Invalid booking data. Missing categories array.'
  });
  return;
}
```

#### 2. Insufficient Amount Errors

```typescript
if (!reserveResult.ok) {
  // Rollback all previous reservations
  for (const prevReservation of reservations) {
    await anudanStateService.rollback(prevReservation.campaignId, prevReservation.amount);
  }
  
  return insufficientAmountError(reserveResult.remaining, amount);
}
```

#### 3. Database Errors

```typescript
try {
  await this.anudanRepository.createPayment({...});
} catch (dbError) {
  // Rollback all reservations
  for (const reservation of reservations) {
    await anudanStateService.rollback(reservation.campaignId, reservation.amount);
  }
  throw dbError;
}
```

#### 4. Google Sheets Errors

```typescript
try {
  await this.sheetsService.appendRow(sheetName, rowData);
} catch (sheetsError) {
  console.error('Failed to add to Google Sheets (non-critical):', sheetsError);
  // Don't fail the payment if sheets update fails
}
```

### Error Response Format

```typescript
{
  success: false,
  error: string;              // Human-readable error message
  errorCode?: string;        // Machine-readable error code
  remainingAmount?: number;   // For insufficient amount errors
  requestedAmount?: number;   // For insufficient amount errors
}
```

---

## Configuration

### Environment Variables

#### Backend (.env)

```env
# Database
MONGODB_URI=mongodb+srv://...

# Google Sheets
GOOGLE_SHEETS_SPREADSHEET_ID=...
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=...

# Payment Configuration
PAYMENT_PROVIDER=mock
PAYMENT_REDIRECT_URL=https://...

# Server
PORT=3001
NODE_ENV=production
```

#### Frontend (.env)

```env
VITE_API_URL=https://amader-barir-pujo-2026-new-icici.onrender.com
VITE_SITE_LIVE=true
```

### Anudan Configuration

**File**: `backend/src/config/anudan.config.ts`

```typescript
export const ANUDAN_CONFIG = {
  DEFAULT_CAMPAIGN_ID: 'default',
  
  TOTAL_COSTS: {
    'Panchami': 6000,
    'Soshti': 35000,
    'Saptami': 43000,
    'Ashtami': 47000,
    'Sondhi Pujo': 24500,
    'Navami': 50500,
    'Dasami': 18500,
    'Panchadin Anudan': 134000
  },
  
  SSE_HEARTBEAT_INTERVAL_MS: 25000,
  
  REMAINING_RATE_LIMIT_WINDOW_MS: 60000,
  REMAINING_RATE_LIMIT_MAX_REQUESTS: 60,
  
  EVENTS_RATE_LIMIT_WINDOW_MS: 60000,
  EVENTS_RATE_LIMIT_MAX_REQUESTS: 10,
};
```

---

## Summary

### Key Differences Between Anudan and Bhog Payment Flows

| Aspect | Anudan | Bhog |
|--------|--------|------|
| **Real-time Updates** | SSE for remaining amounts | No real-time updates |
| **Concurrency Control** | Mutex-protected reservations | No concurrency control needed |
| **Idempotency** | Duplicate transaction check | Duplicate transaction check |
| **Payment Gateway** | Direct payment (mock) | Mock payment page |
| **Receipt** | AnudanReceipt component | BhogReceipt component |
| **Google Sheets** | Single sheet "Anudan Contributions" | Multiple sheets per day |
| **Data Model** | Categories array | Bookings array with quantities |
| **Free Option** | No free option | Free booking for children 0-5 |

### Current Payment Gateway Status

**Status**: Mock Payment Gateway (for testing)

**Production Plan**: ICICI Payment Gateway integration

**Mock Flow**:
1. Frontend generates transactionId
2. Backend records booking
3. Frontend redirects to mock payment page
4. User selects payment result
5. Backend processes callback
6. Frontend shows success/failure page

**ICICI Integration** (Future):
- Replace mock payment page with ICICI payment gateway redirect
- Implement webhook for payment status updates
- Add signature verification for webhook callbacks
- Handle payment status reconciliation

---

## Appendix

### File Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── anudan.config.ts
│   │   ├── payment.config.ts
│   │   └── database.ts
│   ├── controllers/
│   │   ├── AnudanController.ts
│   │   ├── BhogController.ts
│   │   └── PaymentController.ts
│   ├── services/
│   │   ├── anudanPayment.service.ts
│   │   ├── anudanState.service.ts
│   │   └── GoogleSheetsService.ts
│   ├── repositories/
│   │   ├── AnudanRepository.ts
│   │   └── BhogRepository.ts
│   ├── models/
│   │   ├── AnudanPayment.ts
│   │   └── BhogPayment.ts
│   ├── routes/
│   │   ├── anudanRoutes.ts
│   │   └── bhogRoutes.ts
│   └── server.ts

frontend/
├── src/
│   ├── components/
│   │   ├── Payment/
│   │   │   ├── MockPayment.tsx
│   │   │   ├── PaymentSuccess.tsx
│   │   │   ├── PaymentFailure.tsx
│   │   │   ├── AnudanReceipt.tsx
│   │   │   └── BhogReceipt.tsx
│   │   └── ui/
│   │       ├── AnudanCard.tsx
│   │       ├── BhogBookingSection.tsx
│   │       └── UserInfoForm.tsx
│   ├── pages/
│   │   ├── Anudan.tsx
│   │   └── BhogBooking.tsx
│   ├── hooks/
│   │   └── useAnudanRemaining.ts
│   └── config/
│       └── api.ts
```

---

**Document Version**: 1.0  
**Last Updated**: July 22, 2026  
**Author**: Cascade AI Assistant
