# Development Guide

## Local Development with ICICI Payment Gateway

### Setting Up ngrok for ICICI PG Testing

The ICICI Payment Gateway requires a public HTTPS URL for payment callbacks. Since localhost is not publicly accessible, we use ngrok to tunnel the local backend during development.

#### One-Time ngrok Setup

1. Sign up at https://dashboard.ngrok.com
2. Get your authtoken from https://dashboard.ngrok.com/get-started/your-authtoken
3. Install ngrok CLI and configure authtoken:
   ```bash
   ngrok config add-authtoken <your-token>
   ```

#### Starting Development with ngrok

Instead of manually updating `.env` every time ngrok restarts, use the automated tunnel script:

```bash
cd backend
npm run dev:tunnel
```

This script:
- Starts ngrok tunnel on port 3001
- Automatically updates `ICICI_PG_RETURN_URL` in `.env` with the new ngrok URL
- Starts the backend dev server
- Only modifies `ICICI_PG_RETURN_URL` - never touches other env vars
- Refuses to run if `NODE_ENV=production`

#### Manual Alternative (if needed)

If you prefer to start ngrok manually:

1. Start ngrok:
   ```bash
   ngrok http 3001
   ```

2. Copy the HTTPS forwarding URL (e.g., `https://abc1.ngrok-free.app`)

3. Update `.env`:
   ```env
   ICICI_PG_RETURN_URL=https://abc1.ngrok-free.app/api/payment/icici-callback
   FRONTEND_URL=http://localhost:5173
   ```

4. Start backend:
   ```bash
   npm run dev
   ```

### Starting the Frontend

The frontend runs separately. In a new terminal:

```bash
cd frontend
npm run dev
```

Then open http://localhost:5173 in your browser.

### Testing ICICI Payments

Once both backend (with ngrok) and frontend are running:

1. Navigate to Anudan or Bhog page
2. Fill in user info and select categories
3. Click "Proceed to Payment"
4. You'll be redirected to ICICI's UAT payment page
5. Use test credentials:
   - Card: `4761 3400 0000 0035`
   - Expiry: `07/26`
   - CVV: `123`
   - OTP: `123456`

6. After payment, ICICI will POST to your ngrok URL
7. Backend processes callback and redirects to success/failure page

### Environment Variables

Required for local development (in `backend/.env`):

```env
ICICI_PG_MERCHANT_ID=100000000007164
ICICI_PG_AGGREGATOR_ID=A100000000007164
ICICI_PG_SECRET_KEY=db06cca0-838b-4e01-8b20-6ac446ffb6bd
ICICI_PG_ENV=UAT
ICICI_PG_CURRENCY_CODE=356
ICICI_PG_RETURN_URL=https://<ngrok-url>/api/payment/icici-callback  # Updated by dev:tunnel
FRONTEND_URL=http://localhost:5173
PAYMENT_PROVIDER=icici
```

### Production Deployment

For production (Render.com), set these environment variables:

```env
ICICI_PG_RETURN_URL=https://amader-barir-pujo-2026-new-icici.onrender.com/api/payment/icici-callback
FRONTEND_URL=https://amader-barir-pujo-2026-new-test.vercel.app
NODE_ENV=production
```

The backend startup validation will prevent `localhost` or `ngrok` URLs in production.
