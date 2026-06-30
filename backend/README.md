# Amader Barir Pujo Backend

Node.js + Express.js backend API for Amader Barir Pujo contact form with email functionality.

## Features

- **Repository Pattern Architecture**: Clean separation of concerns with repositories, services, and controllers
- **Security First**: 
  - Helmet for HTTP headers security
  - CORS configuration
  - Rate limiting (5 requests per 15 minutes)
  - XSS protection with input sanitization
  - Express-validator for request validation
  - Content Security Policy
- **Email Integration**: Nodemailer for sending contact form submissions
- **TypeScript**: Full type safety
- **Environment Variables**: Secure configuration management

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env` and configure:

```env
PORT=3001
NODE_ENV=development

# Email Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=info@abp.proplusdatafoundation.com
EMAIL_TO=durgesh.s@proplusdata.co
VOLUNTEER_EMAIL_TO=durgesh.s@proplusdata.co

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=5
```

### Gmail Setup

1. Enable 2-factor authentication on your Gmail account
2. Go to Google Account > Security > App Passwords
3. Generate a new app password
4. Use the app password in `SMTP_PASS`

## Development

```bash
npm run dev
```

## Production

```bash
npm run build
npm start
```

## API Endpoints

### POST /api/contact

Submit contact form.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Inquiry",
  "message": "Your message here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Contact form submitted successfully",
  "data": {
    "id": "uuid"
  }
}
```

### GET /health

Health check endpoint.

### POST /api/volunteer

Submit volunteer form. Sends an email to `VOLUNTEER_EMAIL_TO` (defaults to `durgesh.s@proplusdata.co`).

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "message": "Optional message"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Volunteer form submitted successfully",
  "data": {
    "id": "uuid"
  }
}
```

## Architecture

```
src/
├── controllers/      # Request handlers
├── repositories/     # Data access layer
├── services/        # Business logic
├── middleware/      # Custom middleware
├── routes/          # Route definitions
├── types/           # TypeScript types
└── server.ts        # Application entry point
```

## Security Measures

1. **Rate Limiting**: Prevents abuse by limiting requests per IP
2. **Input Validation**: Validates all incoming data
3. **XSS Protection**: Sanitizes user input
4. **CORS**: Restricts cross-origin requests
5. **Helmet**: Sets secure HTTP headers
6. **Body Size Limit**: Prevents large payload attacks
