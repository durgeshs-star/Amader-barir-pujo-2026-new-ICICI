# WhatsApp Automation Backend Setup Guide

## Overview
This backend has been successfully integrated with WhatsApp automation using `whatsapp-web.js`. The setup allows you to send WhatsApp messages from your personal account (+91 9405807468) without requiring Meta registration or a Business Account.

## Files Created/Modified

### New Files Created:
1. **src/types/whatsapp.types.ts** - TypeScript interfaces for WhatsApp operations
2. **src/utils/whatsappService.ts** - Core WhatsApp service with QR code scanning
3. **src/routes/notificationRoutes.ts** - Express API routes for WhatsApp operations
4. **.env.example** - Environment variables template

### Files Modified:
1. **package.json** - Added `whatsapp-web.js` and `qrcode-terminal` dependencies
2. **src/server.ts** - Integrated notification routes and WhatsApp info endpoint
3. **.gitignore** - Added `.wwebjs_auth/` and other WhatsApp-related files

## Setup Instructions

### Step 1: Verify Installation
All dependencies have been installed successfully. The WhatsApp integration is ready to use.

### Step 2: Start the Server
Navigate to the backend directory and start the development server:

```bash
cd "C:\PPD sites\Amader-barir-pujo-2026-new-ICICI\backend"
npm run dev
```

### Step 3: QR Code Scanning (First Time Only)
When you start the server for the first time, you will see a QR code in the terminal:

```
==================================================
🔐 SCAN THIS QR CODE WITH YOUR WHATSAPP APP:
==================================================

[QR Code will appear here]

📱 Steps to scan:
1. Open WhatsApp on your phone (+91 9405807468)
2. Go to Settings → Linked Devices (or Web & Desktop)
3. Tap "Link a Device"
4. Scan the QR code above with your phone camera

⏳ Waiting for you to scan...
```

**Follow these steps:**
1. Open WhatsApp on your phone (+91 9405807468)
2. Go to Settings → Linked Devices (or Web & Desktop on older versions)
3. Tap "Link a Device"
4. Scan the QR code with your phone camera

### Step 4: Verify Connection
After scanning, wait for this message:

```
==================================================
✅ WhatsApp Client is Ready!
🟢 Connected and ready to send messages
==================================================
```

## Available API Endpoints

### 1. Health Check
```bash
GET http://localhost:3001/health
```

### 2. WhatsApp Status
```bash
GET http://localhost:3001/api/notifications/status
```

### 3. Send Message
```bash
POST http://localhost:3001/api/notifications/send-message
Content-Type: application/json

{
  "phoneNumber": "919405807468",
  "message": "Hello from WhatsApp automation!"
}
```

### 4. Send Order Confirmation
```bash
POST http://localhost:3001/api/notifications/send-order-confirmation
Content-Type: application/json

{
  "customerPhone": "919405807468",
  "orderId": "ORD-001",
  "orderAmount": "5999",
  "customerName": "Durgesh"
}
```

### 5. Send Reminder
```bash
POST http://localhost:3001/api/notifications/send-reminder
Content-Type: application/json

{
  "phoneNumber": "919405807468",
  "reminderText": "Your meeting is in 30 minutes",
  "title": "Meeting Reminder"
}
```

### 6. WhatsApp API Info
```bash
GET http://localhost:3001/api/whatsapp-info
```

## Testing Instructions

### Test 1: Check Status
```bash
curl http://localhost:3001/api/notifications/status
```

**Expected Response:**
```json
{
  "status": "connected",
  "message": "✅ WhatsApp is connected and ready to send messages"
}
```

### Test 2: Send Test Message
```bash
curl -X POST http://localhost:3001/api/notifications/send-message \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\":\"919405807468\",\"message\":\"Hello from WhatsApp automation!\"}"
```

**Expected:** Message appears on your WhatsApp phone

### Test 3: Send Order Confirmation
```bash
curl -X POST http://localhost:3001/api/notifications/send-order-confirmation \
  -H "Content-Type: application/json" \
  -d "{\"customerPhone\":\"919405807468\",\"orderId\":\"ORD-001\",\"orderAmount\":\"5999\",\"customerName\":\"Durgesh\"}"
```

**Expected:** Formatted order confirmation message on WhatsApp

### Test 4: Send Reminder
```bash
curl -X POST http://localhost:3001/api/notifications/send-reminder \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\":\"919405807468\",\"reminderText\":\"Your meeting is in 30 minutes\",\"title\":\"Meeting Reminder\"}"
```

**Expected:** Reminder message on WhatsApp

## Important Notes

### Phone Number Format
- **Must include country code:** `919405807468` (India: +91)
- **No spaces or special characters:** Just digits
- **Format:** 10-15 digits including country code

### Session Persistence
- After the first successful QR scan, the session is saved in the `.wwebjs_auth/` folder
- Next time you run `npm run dev`, it connects automatically without QR code
- **Do not delete the `.wwebjs_auth/` folder** (it stores your session)

### Production Considerations
- Server must keep running 24/7 for production use
- This uses your personal WhatsApp, not a Business Account
- Do not scan QR code on multiple servers simultaneously
- Consider using process managers like PM2 for production

### Error Handling
The system includes comprehensive error handling:
- QR code scanning failures
- Connection drops with auto-reconnect
- Invalid phone number validation
- Message sending failures with detailed error messages

## Integration with Existing Backend

The WhatsApp integration has been seamlessly added to your existing backend:
- Uses the same Express server structure
- Follows existing TypeScript patterns
- Integrates with existing middleware (CORS, helmet, compression)
- Uses the same port (3001) and environment configuration

## Next Steps

1. **Start the server:** `npm run dev`
2. **Scan the QR code** (first time only)
3. **Test the endpoints** using the provided curl commands
4. **Integrate with your frontend** to trigger WhatsApp notifications from your MERN app

## Troubleshooting

### QR Code Not Appearing
- Ensure the server is running
- Check console for initialization messages
- Verify internet connection

### Connection Issues
- Restart the server and scan QR code again
- Check if WhatsApp is working on your phone
- Ensure no other device is using the same WhatsApp account

### Message Sending Failures
- Verify phone number format (10-15 digits with country code)
- Check WhatsApp connection status
- Ensure recipient phone number is valid

## Support

For issues or questions, refer to:
- `whatsapp-web.js` documentation: https://docs.wwebjs.dev/
- Existing backend structure follows your established patterns
